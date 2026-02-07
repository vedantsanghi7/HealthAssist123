'use client';

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Search, Filter } from 'lucide-react';
import { RecordCard } from '@/components/patient/RecordCard';
import { UploadRecordModal } from '@/components/records/UploadRecordModal';
import { supabase } from '@/lib/supabase/supabaseClient';
import { useAuth } from '@/context/AuthContext';

interface Record {
    id: string;
    title: string;
    date: string;
    type: string;
    category?: string;
}

export default function MedicalRecordsPage() {
    const { user } = useAuth();
    const [records, setRecords] = useState<Record[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const fetchRecords = async () => {
            if (!user) return;

            const { data, error } = await supabase
                .from('medical_records')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false });

            if (!error && data) {
                // Map DB records to UI model
                const mappedRecords = data.map((r: any) => ({
                    id: r.id,
                    title: r.record_type === 'lab_test' ? `${r.test_name} (${r.test_category})` : `Prescription by ${r.doctor_name}`,
                    date: r.date,
                    type: r.record_type === 'lab_test' ? 'Lab Result' : 'Prescription',
                    category: r.test_category || 'General'
                }));
                setRecords(mappedRecords);
            }
            setLoading(false);
        };

        fetchRecords();
    }, [user, refreshTrigger]);

    const filteredRecords = records.filter(r =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.type.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Medical Records</h1>
                    <p className="text-muted-foreground text-sm">Manage and organize your health documents</p>
                </div>
                <UploadRecordModal onRecordAdded={() => setRefreshTrigger(prev => prev + 1)} />
            </div>

            {/* Filters Bar */}
            <GlassCard className="p-4 flex flex-col sm:flex-row gap-4 items-center bg-white/70">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search records..."
                        className="pl-10 bg-white/50 border-gray-200 focus:bg-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto bg-white/50 text-muted-foreground hover:text-foreground">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </Button>
                    <Button variant="outline" className="w-full sm:w-auto bg-white/50 text-muted-foreground hover:text-foreground">
                        Date Range
                    </Button>
                </div>
            </GlassCard>

            {/* Records Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full flex justify-center py-10">
                        <div className="animate-spin h-8 w-8 border-4 border-medical-primary border-t-transparent rounded-full" />
                    </div>
                ) : filteredRecords.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-muted-foreground">
                        No records found.
                    </div>
                ) : (
                    filteredRecords.map((record) => (
                        <RecordCard
                            key={record.id}
                            title={record.title}
                            date={record.date}
                            type={record.type}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
