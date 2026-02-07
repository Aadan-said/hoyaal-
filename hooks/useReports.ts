import { supabase } from '@/api/supabase';
import { useMutation } from '@tanstack/react-query';
import { CreateReportInput } from '../types/report';

export function useCreateReport() {
    return useMutation({
        mutationFn: async (input: CreateReportInput) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Authentication required to report");

            const { data, error } = await supabase
                .from('reports')
                .insert({
                    reporter_id: user.id,
                    property_id: input.property_id,
                    profile_id: input.profile_id,
                    reason: input.reason,
                    details: input.details,
                    status: 'pending'
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        }
    });
}
