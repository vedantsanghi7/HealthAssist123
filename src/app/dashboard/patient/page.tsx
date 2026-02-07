'use client';

import React, { useEffect, useState } from 'react';
import { Timeline } from '@/components/patient/Timeline';
import { HealthInsightPanel } from '@/components/patient/HealthInsightPanel';
import { VitalsChart } from '@/components/patient/VitalsChart';
import { RecordCard } from '@/components/patient/RecordCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { Activity, Thermometer, User, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase/supabaseClient';
import { useAuth } from '@/context/AuthContext';

export default function PatientDashboard() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [recentRecords, setRecentRecords] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            // Fetch Profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            setProfile(profileData);

            // Fetch Recent Records
            const { data: records } = await supabase
                .from('medical_records')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false })
                .limit(3);
            setRecentRecords(records || []);
        };
        fetchData();
    }, [user]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-20">
            {/* Top Stats Row */}
            <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <GlassCard className="p-4 flex items-center gap-4 bg-white/70">
                    <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Activity className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Health Score</p>
                        <h3 className="text-2xl font-bold text-foreground">
                            {recentRecords.length > 0 ? '85' : '-'}
                            <span className="text-sm text-muted-foreground font-normal">/100</span>
                        </h3>
                    </div>
                </GlassCard>

                <GlassCard className="p-4 flex items-center gap-4 bg-white/70">
                    <div className="h-10 w-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                        <Thermometer className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Reports</p>
                        <h3 className="text-lg font-bold text-foreground">{recentRecords.length}</h3>
                    </div>
                </GlassCard>

                <GlassCard className="p-4 flex items-center gap-4 bg-white/70">
                    <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                        <User className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Primary Care</p>
                        <h3 className="text-lg font-bold text-foreground truncate" title={profile?.doctor_name}>
                            {profile?.doctor_name || 'Not assigned'}
                        </h3>
                    </div>
                </GlassCard>

                <GlassCard className="p-4 flex items-center gap-4 bg-white/70">
                    <div className="h-10 w-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                        <Clock className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Recent</p>
                        <h3 className="text-lg font-bold text-foreground truncate" title={recentRecords[0]?.test_name || recentRecords[0]?.record_type}>
                            {recentRecords.length > 0
                                ? (recentRecords[0].record_type === 'lab_test' ? recentRecords[0].test_name : 'Prescription')
                                : 'No records'}
                        </h3>
                    </div>
                </GlassCard>
            </div>

            {/* Main Content Area */}
            <div className="md:col-span-8 space-y-6">

                {/* Vitals Section */}
                <section>
                    <VitalsChart />
                </section>

                {/* Timeline Section */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-foreground">Medical Timeline</h2>
                    </div>
                    <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/40">
                        {/* Assuming Timeline is static for now, plan update if needed */}
                        <Timeline />
                    </div>
                </section>

            </div>

            {/* Sidebar / Right Panel */}
            <div className="md:col-span-4 space-y-6">
                {/* AI Insight Panel */}
                <HealthInsightPanel />

                {/* Recent Documents */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-md font-semibold text-foreground">Recent Documents</h2>
                        <span className="text-xs text-medical-primary cursor-pointer hover:underline">View All</span>
                    </div>
                    <div className="space-y-3">
                        {recentRecords.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No recent records found.</p>
                        ) : (
                            recentRecords.map((r) => (
                                <RecordCard
                                    key={r.id}
                                    title={r.record_type === 'lab_test' ? `${r.test_name}` : `Prescription`}
                                    date={r.date}
                                    type={r.record_type === 'lab_test' ? 'Lab Result' : 'Prescriptions'}
                                />
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
