import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, isSupabaseEnabled } from '../lib/supabase'
import { UserProfileService } from '../services/supabaseService'

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

  // Initialize auth state
  useEffect(() => {
    if (isSupabaseEnabled && supabase) {
      // Supabase initialization
      const getInitialSession = async () => {
        try {
          const { data: { session }, error } = await supabase?.auth.getSession() || { data: { session: null }, error: null }

          if (error) {
            console.error('Error getting session:', error)
            dispatch({ type: 'SET_ERROR', payload: error.message })
            return
          }

          if (session?.user) {
            await loadUserProfile(session.user.id)
          } else {
            dispatch({ type: 'SET_LOADING', payload: false })
          }
        } catch (error) {
          console.error('Error initializing auth:', error)
          dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize authentication' })
        }
      }

      getInitialSession()

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (session?.user) {
            await loadUserProfile(session.user.id)
          } else {
            dispatch({ type: 'LOGOUT' })
          }
        }
      )

      return () => {
        subscription.unsubscribe()
      }
    } else {
      console.error('Supabase not configured')
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])


  // Load user profile from database
  const loadUserProfile = async (userId: string) => {
    try {
      const profile = await UserProfileService.getUserProfile(userId)

      if (profile) {
        dispatch({ type: 'SET_USER', payload: profile })
      } else {
        // If no profile exists, create one
        const { data: { user } } = await supabase!.auth.getUser()
        if (user) {
          await createUserProfile(user)
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
      // If profile loading fails, create a basic profile from auth user
      try {
        const { data: { user } } = await supabase!.auth.getUser()
        if (user) {
          await createUserProfile(user)
        }
      } catch (fallbackError) {
        console.error('Fallback profile creation failed:', fallbackError)
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load user profile' })
      }
    }
  }

  // Create user profile
  const createUserProfile = async (user: User) => {
    try {
      const profile = await UserProfileService.createUserProfile({
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
        role: 'customer'
      })
      dispatch({ type: 'SET_USER', payload: profile })
    } catch (error) {
      console.error('Error creating user profile:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create user profile' })
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
          return false
        }

        if (data.user) {
          await loadUserProfile(data.user.id)
          return true
        }
        return false
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Login failed. Please try again.' })
      return false
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
        // Supabase logout
        const { error } = await supabase.auth.signOut()

        if (error) {
          console.error('Supabase logout error:', error)
          dispatch({ type: 'SET_ERROR', payload: error.message })
          return
        }
      }

      // Clear any cart/wishlist data
      localStorage.removeItem('snpbrand-cart')
      localStorage.removeItem('snpbrand-wishlist')

      dispatch({ type: 'LOGOUT' })

      // Redirect to home page
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }

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

  const value: AuthContextType = {
    ...state,
    login,
    signup,
    logout,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}