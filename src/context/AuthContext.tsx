'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/supabaseClient';

export type UserRole = 'patient' | 'doctor' | 'admin' | null;

interface AuthContextType {
    user: User | null;
    session: Session | null;
    role: UserRole;
    roles: UserRole[];
    loading: boolean;
    signOut: () => Promise<void>;
    switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    role: null,
    roles: [],
    loading: true,
    signOut: async () => { },
    switchRole: () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [roles, setRoles] = useState<UserRole[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUserRoles = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('roles, role') // selecting legacy 'role' just in case, but prefer 'roles'
                .eq('id', userId)
                .single();

            if (error) {
                console.warn('Error fetching roles, defaulting to patient:', error.message);
                setRoles(['patient']);
                setRole('patient');
                return;
            }

            // Parse roles
            let userRoles: UserRole[] = [];
            if (data?.roles && Array.isArray(data.roles)) {
                userRoles = data.roles as UserRole[];
            } else if (data?.role) {
                // Fallback for transition
                userRoles = [data.role as UserRole];
            } else {
                userRoles = ['patient']; // Default
            }

            setRoles(userRoles);

            // Determine active role
            // 1. Check local storage for preference
            const savedRole = localStorage.getItem('last_active_role') as UserRole;
            if (savedRole && userRoles.includes(savedRole)) {
                setRole(savedRole);
            } else {
                // 2. Default to first available role
                setRole(userRoles[0]);
            }

        } catch (err) {
            console.error('Unexpected error fetching roles:', err);
            setRoles(['patient']);
            setRole('patient');
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    await fetchUserRoles(session.user.id);
                }
            } catch (error) {
                console.error("Auth init error:", error);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            setSession(session);
            const newUser = session?.user ?? null;
            setUser(newUser);

            if (newUser) {
                await fetchUserRoles(newUser.id);
            } else {
                setRole(null);
                setRoles([]);
            }

            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        setRole(null);
        setRoles([]);
        setUser(null);
        setSession(null);
        localStorage.removeItem('last_active_role');
    };

    const switchRole = (newRole: UserRole) => {
        if (roles.includes(newRole)) {
            setRole(newRole);
            localStorage.setItem('last_active_role', newRole || '');
            // Redirect to appropriate dashboard
            window.location.href = newRole === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient';
        }
    };

    return (
        <AuthContext.Provider value={{ user, session, role, roles, loading, signOut, switchRole }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
