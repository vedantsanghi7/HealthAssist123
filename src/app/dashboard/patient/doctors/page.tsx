'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/supabaseClient';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Award, Stethoscope } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { BookAppointmentModal } from '@/components/patient/BookAppointmentModal';
import { Doctor } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function FindDoctorsPage() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchDoctors = async () => {
            setLoading(true);
            try {
                // Fetch profiles where roles (jsonb array) contains 'doctor'
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .contains('roles', ['doctor']);

                if (error) throw error;
                setDoctors(data as Doctor[]);
            } catch (error) {
                console.error('Error fetching doctors:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, []);

    const filteredDoctors = doctors.filter(doc =>
        doc.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.hospital_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleBookClick = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Find a Doctor</h1>
                    <p className="text-muted-foreground">Book appointments with top specialists.</p>
                </div>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, specialization, or hospital..."
                        className="pl-9 bg-white/50 backdrop-blur-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading doctors...</div>
            ) : filteredDoctors.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Stethoscope className="h-6 w-6 text-gray-400" />
                    </div>
                    No doctors found matching your search.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDoctors.map((doc) => (
                        <GlassCard key={doc.id} className="p-6 flex flex-col gap-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12 border border-border">
                                        <AvatarImage src={`/placeholder-doctor.jpg`} alt={doc.full_name} />
                                        <AvatarFallback>{doc.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-bold text-lg">{doc.full_name}</h3>
                                        <p className="text-sm text-medical-primary font-medium">{doc.specialization || 'General Practitioner'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    <span>{doc.hospital_name || 'Private Practice'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Award className="h-4 w-4" />
                                    <span>{doc.experience_years || 0} Years Experience</span>
                                </div>
                            </div>

                            <Button
                                className="w-full mt-2 bg-gradient-to-r from-medical-primary to-blue-600 hover:from-medical-primary/90 hover:to-blue-600/90 text-white shadow-md"
                                onClick={() => handleBookClick(doc)}
                            >
                                Book Appointment
                            </Button>
                        </GlassCard>
                    ))}
                </div>
            )}

            <BookAppointmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                doctor={selectedDoctor}
            />
        </div>
    );
}
