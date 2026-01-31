import { supabase } from '@/api/supabase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useFavorites() {
    const queryClient = useQueryClient();

    const { data: favorites, isLoading } = useQuery({
        queryKey: ['favorites'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from('favorites')
                .select('property_id')
                .eq('user_id', user.id);

            if (error) throw error;
            return data.map(f => f.property_id);
        }
    });

    const toggleFavorite = useMutation({
        mutationFn: async (propertyId: string) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Authentication required");

            const isFavorite = favorites?.includes(propertyId);

            if (isFavorite) {
                const { error } = await supabase
                    .from('favorites')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('property_id', propertyId);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('favorites')
                    .insert({
                        user_id: user.id,
                        property_id: propertyId
                    });
                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['favorites'] });
        }
    });

    return {
        favorites: favorites || [],
        isLoading,
        toggleFavorite: (id: string) => toggleFavorite.mutate(id),
        isToggling: toggleFavorite.isPending
    };
}
