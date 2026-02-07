import { supabase } from '@/api/supabase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function usePropertyOffers(propertyId: string) {
    return useQuery({
        queryKey: ['offers', 'property', propertyId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('offers')
                .select('*, seeker:profiles(*)')
                .eq('property_id', propertyId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: !!propertyId
    });
}

export function useSeekerOffers() {
    return useQuery({
        queryKey: ['offers', 'seeker'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from('offers')
                .select('*, property:properties(*)')
                .eq('seeker_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        }
    });
}

export function useCreateOffer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ propertyId, amount, message }: { propertyId: string, amount?: number, message?: string }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Authentication required");

            // 1. Create the offer
            const { data, error } = await supabase
                .from('offers')
                .insert({
                    property_id: propertyId,
                    seeker_id: user.id,
                    amount,
                    message,
                    status: 'pending'
                })
                .select()
                .single();

            if (error) throw error;

            // 2. Notify the property owner
            const { data: property } = await supabase
                .from('properties')
                .select('owner_id, title')
                .eq('id', propertyId)
                .single();

            if (property) {
                await supabase.from('notifications').insert({
                    user_id: property.owner_id,
                    title: 'Dalab Cusub',
                    message: `${user.id} ayaa dalab u soo gudbiyay ${property.title}`,
                    type: 'offer'
                });
            }

            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['offers'] });
            queryClient.invalidateQueries({ queryKey: ['offers', 'property', variables.propertyId] });
        }
    });
}

export function useUpdateOfferStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ offerId, status, propertyId }: { offerId: string, status: 'accepted' | 'rejected' | 'cancelled', propertyId?: string }) => {
            // 1. Update the offer status
            const { data, error } = await supabase
                .from('offers')
                .update({ status })
                .eq('id', offerId)
                .select('*, property:properties(title)')
                .single();

            if (error) throw error;

            // 2. Notify the seeker
            const statusText = status === 'accepted' ? 'la aqbalay' : status === 'rejected' ? 'la diiday' : 'la baajiyay';
            await supabase.from('notifications').insert({
                user_id: data.seeker_id,
                title: 'Cilmo Cusub',
                message: `Dalabkaagii aad u dirtay guriga "${data.property?.title}" waa ${statusText}.`,
                type: 'offer_update'
            });

            // If accepted, we might want to update property status too
            if (status === 'accepted' && propertyId) {
                await supabase
                    .from('properties')
                    .update({ status: 'pending' }) // Or 'sold'/'rented' depending on flow
                    .eq('id', propertyId);
            }

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['offers'] });
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        }
    });
}
