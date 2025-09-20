"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  role: "student" | "teacher" | "head_teacher";
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: { first_name: string; last_name: string; role: string }) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single<Profile>();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user.id);
        }, 0);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user.id);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    userData: { first_name: string; last_name: string; role: string }
  ) => {
    const { first_name, last_name, role } = userData;
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name,
            last_name,
            role,
          },
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
        return { error };
      }

      if (data.user && !data.session) {
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link.",
        });
      }

      // Create profile after successful signup
      if (data.user) {
        // Using type assertion to any to bypass TypeScript errors
        const { error: profileError } = await (supabase as any)
          .from("profiles")
          .insert({
            user_id: data.user.id,
            first_name,
            last_name,
            role,
          });

        if (profileError) {
          console.error("Error creating profile:", profileError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to create user profile.",
          });
        }
      }

      return { error: null };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
        return { error };
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      } else {
        toast({
          title: "Signed out",
          description: "You have successfully signed out.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile?.id) return { error: new Error('No user logged in or profile not found') };
    
    try {
      // Using type assertion to any to bypass TypeScript errors
      const { data, error } = await (supabase as any)
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);

      if (error) throw error;
      
      if (data) {
        setProfile(prev => (prev ? { ...prev, ...updates } : null));
      }
      
      return { error: null };
    } catch (error: any) {
      console.error('Error updating profile:', error);
      return { error };
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create a default context value
const defaultAuthContext: AuthContextType = {
  user: null,
  profile: null,
  session: null,
  loading: true,
  signIn: async () => ({} as any),
  signUp: async () => ({} as any),
  signOut: async () => {},
  updateProfile: async () => ({} as any),
};

export const useAuth = () => {
  // This check happens at runtime when the hook is called
  if (typeof window === 'undefined') {
    // Return a mock auth context when on the server
    return defaultAuthContext;
  }

  const context = useContext(AuthContext);
  
  // If context is undefined, it means we're outside a provider
  if (context === undefined) {
    console.warn("useAuth is being used outside of AuthProvider. Using default context.");
    return defaultAuthContext;
  }
  
  return context;
};
