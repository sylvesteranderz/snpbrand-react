import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: 'hub_partner' | 'admin' | null;
  loading: boolean;
  error: string | null;
  setError: (err: string | null) => void;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
  selectedLocation: 'Kumasi' | 'Accra';
  setSelectedLocation: (loc: 'Kumasi' | 'Accra') => void;
  activeLocationId: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<'hub_partner' | 'admin' | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Switcher states
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<'Kumasi' | 'Accra'>('Kumasi');

  // Load locations mapping once on mount or login
  const loadLocations = async () => {
    try {
      const { data, error: err } = await supabase
        .from('locations')
        .select('id, name');
      if (err) throw err;
      setLocations(data || []);
    } catch (err) {
      console.error('Failed to load locations metadata in AuthProvider:', err);
    }
  };

  const checkRoleAndSetUser = async (currentSession: Session | null) => {
    if (!currentSession || !currentSession.user) {
      setUser(null);
      setSession(null);
      setRole(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error: profileErr } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', currentSession.user.id)
        .single();

      if (profileErr) {
        throw new Error(profileErr.message);
      }

      if (!data || (data.role !== 'hub_partner' && data.role !== 'admin')) {
        // Sign out if unauthorized role
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setRole(null);
        setError('Access denied: You do not have the authorization to access this portal.');
      } else {
        await loadLocations();
        setUser(currentSession.user);
        setSession(currentSession);
        setRole(data.role as 'hub_partner' | 'admin');
        setError(null);
        
        // Default location based on role
        if (data.role === 'admin') {
          setSelectedLocation('Kumasi'); // Default admin to Kumasi
        } else {
          setSelectedLocation('Accra');  // Hardcode hub_partner to Accra
        }
      }
    } catch (err: any) {
      console.error('Error fetching user profile role:', err);
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setRole(null);
      setError(err.message || 'Failed to retrieve user profile details.');
    } finally {
      setLoading(false);
    }
  };

  const checkSession = async () => {
    setLoading(true);
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      await checkRoleAndSetUser(currentSession);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch session.');
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (event === 'SIGNED_IN') {
        await checkRoleAndSetUser(currentSession);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        setRole(null);
        setLocations([]);
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED') {
        if (currentSession) {
          setUser(currentSession.user);
          setSession(currentSession);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signOut();
      if (err) throw err;
      setUser(null);
      setSession(null);
      setRole(null);
      setLocations([]);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Derive active location ID
  const activeLocationId = React.useMemo(() => {
    const loc = locations.find((l) => l.name.toLowerCase() === selectedLocation.toLowerCase());
    return loc ? loc.id : null;
  }, [locations, selectedLocation]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        loading,
        error,
        setError,
        signOut,
        checkSession,
        selectedLocation,
        setSelectedLocation,
        activeLocationId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
