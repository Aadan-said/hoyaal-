import { supabase } from '@/api/supabase';
import { useMutation, useQuery } from '@tanstack/react-query';

export function usePropertyAnalytics(propertyId: string) {
    return useQuery({
        queryKey: ['analytics', propertyId],
        queryFn: async () => {
            const { data, count, error } = await supabase
                .from('property_views')
                .select('*', { count: 'exact' })
                .eq('property_id', propertyId);

            if (error) throw error;
            return {
                views: count || 0,
                history: data
            };
        }
    });
}

export function useTrackView() {
    return useMutation({
        mutationFn: async ({ propertyId, userId }: { propertyId: string, userId?: string }) => {
            const { error } = await supabase
                .from('property_views')
                .insert({
                    property_id: propertyId,
                    viewer_id: userId
                });

            if (error) throw error;
        }
    });
}

export function useOwnerStats(ownerId: string) {
    return useQuery({
        queryKey: ['owner_stats', ownerId],
        queryFn: async () => {
            // Get all properties of the owner
            const { data: properties, error: pError } = await supabase
                .from('properties')
                .select('id')
                .eq('owner_id', ownerId);

            if (pError) throw pError;

            const propertyIds = properties.map(p => p.id);

            // Get total views across all properties
            const { count: totalViews, error: vError } = await supabase
                .from('property_views')
                .select('*', { count: 'exact', head: true })
                .in('property_id', propertyIds);

            if (vError) throw vError;

            return {
                totalViews: totalViews || 0,
                listingCount: properties.length
            };
        }
    });
}
