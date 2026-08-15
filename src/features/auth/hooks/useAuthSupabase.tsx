import React, { createContext, useContext, useReducer, useRef, ReactNode, useEffect } from 'react'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import { UserProfileService } from '@/services/supabaseService'

interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  role: 'customer' | 'admin'
  avatar_url?: string
  created_at: string
  updated_at: string
}

interface AuthState {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  signup: (formData: { name: string; email: string; phone: string; password: string; confirmPassword: string }) => Promise<boolean>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  signInWithGoogle: () => Promise<void>
  resendVerificationEmail: (email: string) => Promise<void>
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: UserProfile | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGOUT' }

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null
      }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      }
    default:
      return state
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  })

  const isFetchingProfile = useRef(false)
  const hasInitialized = useRef(false)

  // Initialize auth state — single listener, no getInitialSession
  useEffect(() => {
    if (!isSupabaseEnabled || !supabase) {
      dispatch({ type: 'SET_LOADING', payload: false })
      return
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Guard: only process INITIAL_SESSION once on first load.
        // If the user has already logged in/out during this session,
        // a page reload firing INITIAL_SESSION should NOT re-authenticate.
        if (event === 'INITIAL_SESSION') {
          if (hasInitialized.current) return
          hasInitialized.current = true
        }

        if (
          session?.user &&
          (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')
        ) {
          // Only load profile on actual sign-in or initial page load.
          // TOKEN_REFRESHED and USER_UPDATED do NOT change the profile —
          // re-fetching on those events causes auth lock contention
          // (AbortError: Lock broken by another request with the 'steal' option)
          await loadUserProfile(session.user)
        } else if (event === 'SIGNED_OUT' || !session) {
          hasInitialized.current = false // reset so next login works cleanly
          dispatch({ type: 'LOGOUT' })
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])


  // Load user profile from database — no getUser() calls to avoid auth lock contention
  const loadUserProfile = async (authUser: any) => {
    if (isFetchingProfile.current) return
    isFetchingProfile.current = true
    try {
      let profile = await UserProfileService.getUserProfile(authUser.id)
      
      // Auto-create profile if missing (common after email confirmation without DB triggers)
      if (!profile && authUser) {
        console.log('Profile missing. Auto-creating from session data...');
        profile = await UserProfileService.createUserProfile({
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          phone: authUser.user_metadata?.phone || null,
          role: 'customer'
        });

        // Fire welcome email — non-blocking, won't affect login if it fails
        if (profile && supabase) {
          supabase.functions.invoke('send-welcome', {
            body: { email: profile.email, name: profile.name }
          }).catch((err: unknown) => console.error('Welcome email failed (non-critical):', err))
        }
      }

      if (profile) {
        dispatch({ type: 'SET_USER', payload: profile })
      } else {
        // No profile found and creation failed
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load user profile' })
    } finally {
      isFetchingProfile.current = false
    }
  }

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      if (isSupabaseEnabled && supabase && supabase.auth) {
        // Supabase login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) {
          dispatch({ type: 'SET_ERROR', payload: error.message })
          throw error
        }

        if (data.user) {
          return true
        }
        return false
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      const message = error instanceof Error ? error.message : 'Login failed. Please try again.'
      dispatch({ type: 'SET_ERROR', payload: message })
      throw error
    }
  }

  // Signup function
  const signup = async (formData: { name: string; email: string; phone: string; password: string; confirmPassword: string }): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      if (isSupabaseEnabled && supabase) {
        // Supabase signup
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              name: formData.name,
              phone: formData.phone
            }
          }
        })

        if (error) {
          dispatch({ type: 'SET_ERROR', payload: error.message })
          throw error
        }

        if (data.user) {
          return true
        }
        throw new Error('Signup successful but no user returned')
      }
      throw new Error('Supabase is not enabled')
    } catch (error) {
      console.error('Signup error:', error)
      const message = error instanceof Error ? error.message : 'Signup failed. Please try again.'
      dispatch({ type: 'SET_ERROR', payload: message })
      throw error
    }
  }

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      if (isSupabaseEnabled && supabase) {
        const { error } = await supabase.auth.signOut()
        if (error) {
          console.error('Supabase logout error (forcing local logout anyway):', error)
        }
      }

      // Force clear Supabase session tokens from local storage just in case
      if (typeof window !== 'undefined') {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
            localStorage.removeItem(key)
          }
        })
      }

      // Clear any cart/wishlist data
      localStorage.removeItem('snpbrand-cart')
      localStorage.removeItem('snpbrand-wishlist')

      // Dispatch logout — onAuthStateChange SIGNED_OUT event also handles this
      dispatch({ type: 'LOGOUT' })

      // NOTE: Navigation is handled by the calling component (Header)
      // to avoid a hard page reload which re-triggers INITIAL_SESSION

    } catch (error) {
      console.error('Logout error:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Logout failed. Please try again.' })
    }
  }

  // Update profile function
  const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!state.user) return

    try {
      dispatch({ type: 'SET_LOADING', payload: true })

      if (isSupabaseEnabled && supabase) {
        const updatedProfile = await UserProfileService.updateUserProfile(state.user.id, updates)
        dispatch({ type: 'SET_USER', payload: updatedProfile })
      }
    } catch (error) {
      console.error('Update profile error:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update profile' })
    }
  }



  // Google Sign In
  const signInWithGoogle = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })

      if (isSupabaseEnabled && supabase) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/`,
            // queryParams removed to avoid FedCM/popup conflicts
          },
        })

        if (error) {
          dispatch({ type: 'SET_ERROR', payload: error.message })
          throw error
        }
      }
    } catch (error: any) {
      console.error('Google login error:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to sign in with Google' })
    }
  }

  // Resend verification email
  const resendVerificationEmail = async (email: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })

      if (isSupabaseEnabled && supabase) {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: email,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        })

        if (error) {
          throw error
        }

        dispatch({ type: 'SET_LOADING', payload: false })
      }
    } catch (error: any) {
      console.error('Resend verification error:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to resend verification email' })
      throw error
    }
  }

  const value: AuthContextType = {
    ...state,
    login,
    signup,
    logout,
    updateProfile,
    signInWithGoogle,
    resendVerificationEmail
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}