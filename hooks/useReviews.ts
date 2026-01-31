import { supabase } from '@/api/supabase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function usePropertyReviews(propertyId: string) {
    return useQuery({
        queryKey: ['reviews', propertyId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('reviews')
                .select('*, reviewer:profiles(*)')
                .eq('property_id', propertyId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        }
    });
}

export function useAddReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ propertyId, reviewerId, rating, comment }: { propertyId: string, reviewerId: string, rating: number, comment: string }) => {
            const { error } = await supabase
                .from('reviews')
                .insert({
                    property_id: propertyId,
                    reviewer_id: reviewerId,
                    rating,
                    comment
                });

            if (error) throw error;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['reviews', variables.propertyId] });
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        }
    });
}
