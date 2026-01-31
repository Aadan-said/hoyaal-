import { supabase } from '@/api/supabase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useAdminProperties() {
    return useQuery({
        queryKey: ['admin_properties'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('properties')
                .select('*, owner:profiles(*)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        }
    });
}

export function useUpdatePropertyStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ propertyId, status }: { propertyId: string, status: string }) => {
            const { error } = await supabase
                .from('properties')
                .update({ verification_status: status })
                .eq('id', propertyId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin_properties'] });
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        }
    });
}
