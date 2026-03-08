import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
  phone: string
  role: 'customer' | 'admin'
  joinDate: string
  avatar?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  signup: (userData: SignupData) => Promise<boolean>
  logout: () => void
  updateProfile: (userData: Partial<User>) => Promise<boolean>
}

interface SignupData {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'SIGNUP_START' }
  | { type: 'SIGNUP_SUCCESS'; payload: User }
  | { type: 'SIGNUP_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PROFILE'; payload: Partial<User> }
  | { type: 'LOAD_USER'; payload: User | null }

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false
}

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
    case 'SIGNUP_START':
      return {
        ...state,
        isLoading: true
      }
    case 'LOGIN_SUCCESS':
    case 'SIGNUP_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false
      }
    case 'LOGIN_FAILURE':
    case 'SIGNUP_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false
      }
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null
      }
    case 'LOAD_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false
      }
    default:
      return state
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Mock authentication functions (replace with real API calls)
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    role: 'customer',
    joinDate: '2024-01-15'
  },
  {
    id: '2',
    name: 'Admin User',
    email: 'admin@example.com',
    phone: '+1 (555) 999-9999',
    role: 'admin',
    joinDate: '2024-01-01'
  }
]

const mockLogin = async (email: string, password: string): Promise<User | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Check for exact matches
  if (email === 'admin@example.com' && password === 'password123') {
    return {
      id: '2',
      name: 'Admin User',
      email: 'admin@example.com',
      phone: '+1 (555) 999-9999',
      role: 'admin',
      joinDate: '2024-01-01'
    }
  }
  
  if (email === 'john@example.com' && password === 'password123') {
    return {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1 (555) 123-4567',
      role: 'customer',
      joinDate: '2024-01-15'
    }
  }
  
  return null
}

const mockSignup = async (userData: SignupData): Promise<User | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Check if user already exists
  const existingUser = mockUsers.find(u => u.email === userData.email)
  if (existingUser) {
    throw new Error('User with this email already exists')
  }
  
  // Create new user
  const newUser: User = {
    id: (mockUsers.length + 1).toString(),
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    role: 'customer',
    joinDate: new Date().toISOString().split('T')[0]
  }
  
  mockUsers.push(newUser)
  return newUser
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      dispatch({ type: 'LOGIN_START' })
      const user = await mockLogin(email, password)
      
      if (user) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: user })
        localStorage.setItem('user', JSON.stringify(user))
        return true
      } else {
        dispatch({ type: 'LOGIN_FAILURE' })
        return false
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' })
      return false
    }
  }

  const signup = async (userData: SignupData): Promise<boolean> => {
    try {
      dispatch({ type: 'SIGNUP_START' })
      const user = await mockSignup(userData)
      
      if (user) {
        dispatch({ type: 'SIGNUP_SUCCESS', payload: user })
        localStorage.setItem('user', JSON.stringify(user))
        return true
      } else {
        dispatch({ type: 'SIGNUP_FAILURE' })
        return false
      }
    } catch (error) {
      dispatch({ type: 'SIGNUP_FAILURE' })
      return false
    }
  }

  const logout = () => {
    dispatch({ type: 'LOGOUT' })
    localStorage.removeItem('user')
  }

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    try {
      if (state.user) {
        const updatedUser = { ...state.user, ...userData }
        dispatch({ type: 'UPDATE_PROFILE', payload: userData })
        localStorage.setItem('user', JSON.stringify(updatedUser))
        return true
      }
      return false
    } catch (error) {
      return false
    }
  }

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        dispatch({ type: 'LOAD_USER', payload: user })
      } catch (error) {
        localStorage.removeItem('user')
      }
    }
  }, [])

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

export default AuthProvider
