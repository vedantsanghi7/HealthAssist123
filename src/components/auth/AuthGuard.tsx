'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole } from '@/context/AuthContext';

interface AuthGuardProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
    const { user, role, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Not authenticated, redirect to login
                router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
            } else if (allowedRoles && role && !allowedRoles.includes(role)) {
                // Authenticated but wrong role
                // Redirect to appropriate dashboard based on actual role
                if (role === 'doctor') {
                    router.push('/dashboard/doctor');
                } else {
                    router.push('/dashboard/patient');
                }
            }
        }
    }, [user, role, loading, router, pathname, allowedRoles]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-medical-bg">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-medical-primary border-t-transparent" />
            </div>
        );
    }

    if (!user) return null; // Will redirect via useEffect

    if (allowedRoles && role && !allowedRoles.includes(role)) return null; // Will redirect

    return <>{children}</>;
}
