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
    const { user, role, profile, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Not authenticated, redirect to login
                router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
                return;
            }

            // Check if profile is complete
            if (!profile) {
                console.log('AuthGuard: No profile found. Path:', pathname);
                // No profile found - critical state for a logged-in user
                // Redirect to onboarding to create one
                if (!pathname.includes('/onboarding')) {
                    console.log('AuthGuard: Redirecting to /onboarding due to missing profile');
                    window.location.href = '/onboarding';
                }
                // Don't render dashboard while redirecting or if on onboarding (to avoid double render issues)
                return;
            } else {
                // Check if profile is marked as onboarded
                if (!profile.is_onboarded && !pathname.includes('/onboarding')) {
                    console.log('AuthGuard: User not onboarded, redirecting to /onboarding');
                    window.location.href = '/onboarding';
                    return;
                }
            }

            if (allowedRoles && role && !allowedRoles.includes(role)) {
                // Authenticated but wrong role
                // Redirect to appropriate dashboard based on actual role
                const target = role === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient';
                if (pathname !== target) {
                    router.push(target);
                }
            }
        }
    }, [user, role, profile, loading, router, pathname, allowedRoles]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-medical-bg">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-medical-primary border-t-transparent" />
                    <p className="text-muted-foreground animate-pulse">Loading HealthAssist...</p>
                </div>
            </div>
        );
    }

    if (!user) return null; // Will redirect

    // Critical: If we are not on onboarding, but profile is missing or incomplete, 
    // we must NOT render the dashboard children.
    if (!pathname.includes('/onboarding')) {
        if (!profile) {
            return (
                <div className="flex h-screen w-full items-center justify-center bg-medical-bg">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-medical-primary border-t-transparent" />
                        <p className="text-sm text-muted-foreground">Setting up your profile...</p>
                    </div>
                </div>
            );
        }

        if (!profile.is_onboarded) {
            return (
                <div className="flex h-screen w-full items-center justify-center bg-medical-bg">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-medical-primary border-t-transparent" />
                        <p className="text-sm text-muted-foreground">Redirecting to onboarding...</p>
                    </div>
                </div>
            );
        }
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) return null; // Will redirect

    return <>{children}</>;
}
