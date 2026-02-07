import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/supabaseClient';

export function Header() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        if (!user) return;

        const fetchProfile = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', user.id)
                .single();
            setProfile(data);
        };
        fetchProfile();
    }, [user]);

    const getInitials = (name: string) => {
        return name
            ? name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)
            : 'U';
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/70 backdrop-blur-md px-6">
            <div className="flex items-center gap-4">
                <h1 className="text-lg font-semibold text-foreground">Overview</h1>
            </div>

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                    <span className="sr-only">Notifications</span>
                </Button>

                <div className="h-8 w-px bg-border/50" />

                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium leading-none">
                            {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            ID: #{user?.id?.slice(0, 8) || '...'}
                        </p>
                    </div>
                    <Avatar className="h-9 w-9 border border-border">
                        <AvatarImage src="/placeholder-user.jpg" alt="User" />
                        <AvatarFallback>{getInitials(profile?.full_name || '')}</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </header>
    );
}
