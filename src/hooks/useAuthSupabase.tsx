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

// Mock users for demo purposes
const mockUsers = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    phone: '+1234567890',
    role: 'admin' as const,
    password: 'password123'
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567891',
    role: 'customer' as const,
    password: 'password123'
  }
]

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
        async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.id)
          
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
      // Mock mode - check localStorage for saved user
      console.log('Supabase not configured, using mock authentication')
      const savedUser = localStorage.getItem('mock-user')
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser)
          dispatch({ type: 'SET_USER', payload: user })
        } catch (error) {
          console.error('Error parsing saved user:', error)
          localStorage.removeItem('mock-user')
        }
      }
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])


  // Load user profile from database
  const loadUserProfile = async (userId: string) => {
    try {
      console.log('Loading user profile for:', userId)
      const profile = await UserProfileService.getUserProfile(userId)
      console.log('User profile result:', profile)
      
      if (profile) {
        console.log('Profile found, setting user:', profile)
        dispatch({ type: 'SET_USER', payload: profile })
      } else {
        console.log('No profile found, creating one...')
        // If no profile exists, create one
        const { data: { user } } = await supabase!.auth.getUser()
        if (user) {
          console.log('Creating user profile for:', user)
          await createUserProfile(user)
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
      // If profile loading fails, create a basic profile from auth user
      try {
        console.log('Profile loading failed, creating basic profile...')
        const { data: { user } } = await supabase!.auth.getUser()
        if (user) {
          console.log('Creating basic user profile for:', user)
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
      console.log('Creating user profile with data:', user)
      const profile = await UserProfileService.createUserProfile({
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
        role: 'customer'
      })
      console.log('User profile created:', profile)
      dispatch({ type: 'SET_USER', payload: profile })
    } catch (error) {
      console.error('Error creating user profile:', error)
      // If database creation fails, create a basic profile in memory
      console.log('Database creation failed, creating basic profile in memory...')
      const basicProfile = {
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
        role: 'customer' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      console.log('Basic profile created:', basicProfile)
      dispatch({ type: 'SET_USER', payload: basicProfile })
    }
  }

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      console.log('Login attempt:', { email, isSupabaseEnabled, supabase: !!supabase })

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
      } else {
        // Mock login - Fallback when Supabase is not available
        console.log('Using mock authentication (Supabase not available)')
        console.log('Available mock users:', mockUsers.map(u => ({ email: u.email, password: u.password })))
        
        // Trim whitespace from inputs
        const trimmedEmail = email.trim()
        const trimmedPassword = password.trim()
        console.log('Trimmed inputs:', { email: trimmedEmail, password: trimmedPassword })
        
        const user = mockUsers.find(u => u.email === trimmedEmail && u.password === trimmedPassword)
        console.log('Found user:', user)
        
        if (user) {
          const userProfile: UserProfile = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          localStorage.setItem('mock-user', JSON.stringify(userProfile))
          dispatch({ type: 'SET_USER', payload: userProfile })
          console.log('Login successful, user profile set:', userProfile)
          return true
        } else {
          console.log('No matching user found for:', { email: trimmedEmail, password: trimmedPassword })
          dispatch({ type: 'SET_ERROR', payload: 'Invalid email or password' })
          return false
        }
      }
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
          return false
        }

        if (data.user) {
          console.log('User created successfully. Please check your email for verification.')
          return true
        }
        return false
      } else {
        // Mock signup
        const newUser: UserProfile = {
          id: Date.now().toString(),
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: 'customer',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        localStorage.setItem('mock-user', JSON.stringify(newUser))
        dispatch({ type: 'SET_USER', payload: newUser })
        return true
      }
    } catch (error) {
      console.error('Signup error:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Signup failed. Please try again.' })
      return false
    }
  }

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      if (isSupabaseEnabled && supabase) {
        // Supabase logout
        const { error } = await supabase.auth.signOut()
        
        if (error) {
          console.error('Logout error:', error)
          dispatch({ type: 'SET_ERROR', payload: error.message })
          return
        }
      } else {
        // Mock logout
        localStorage.removeItem('mock-user')
      }

      dispatch({ type: 'LOGOUT' })
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
      } else {
        // Mock update
        const updatedProfile = { ...state.user, ...updates }
        localStorage.setItem('mock-user', JSON.stringify(updatedProfile))
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