export interface Doctor {
    id: string;
    full_name: string;
    specialization: string;
    hospital_name: string;
    experience_years: number;
}

export interface Patient {
    id: string;
    full_name: string;
    email: string;
    // UI specific properties
    name: string;
    age: number;
    status: 'waiting' | 'in-progress' | 'completed' | 'urgent';
    condition: string;
    lastVisit: string;
}
