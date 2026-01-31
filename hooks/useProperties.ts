import { supabase } from '@/api/supabase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Property } from '../types/property';

export function useProperties() {
    return useQuery({
        queryKey: ['properties'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('properties')
                .select('*, owner:profiles(*)') // Fetch property with owner details
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Map database names to UI model
            return data.map(p => ({
                id: p.id,
                title: p.title,
                price: p.price,
                currency: p.currency,
                type: p.type,
                location: { city: p.city, district: p.district },
                bedrooms: p.bedrooms,
                bathrooms: p.bathrooms,
                area: p.area,
                image: p.image_url,
                verification: p.verification_status,
                owner: {
                    id: p.owner?.id,
                    name: p.owner?.full_name,
                    phone: p.owner?.phone,
                    rating: p.owner?.rating
                },
                latitude: p.latitude,
                longitude: p.longitude
            })) as Property[];
        }
    });
}

export function usePropertyDetails(id: string) {
    return useQuery({
        queryKey: ['property', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('properties')
                .select('*, owner:profiles(*)')
                .eq('id', id)
                .single();

            if (error) throw error;

            return {
                id: data.id,
                title: data.title,
                price: data.price,
                currency: data.currency,
                type: data.type,
                location: { city: data.city, district: data.district },
                bedrooms: data.bedrooms,
                bathrooms: data.bathrooms,
                area: data.area,
                image: data.image_url,
                verification: data.verification_status,
                owner: {
                    id: data.owner?.id,
                    name: data.owner?.full_name,
                    phone: data.owner?.phone,
                    rating: data.owner?.rating
                },
                description: data.description,
                latitude: data.latitude,
                longitude: data.longitude
            } as Property;
        },
        enabled: !!id
    });
}

export function useCreateProperty() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newProperty: Omit<Property, 'id'>) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Authentication required");

            const { data, error } = await supabase
                .from('properties')
                .insert({
                    title: newProperty.title,
                    description: newProperty.description,
                    price: newProperty.price,
                    currency: newProperty.currency,
                    type: newProperty.type,
                    city: newProperty.location.city,
                    district: newProperty.location.district,
                    bedrooms: newProperty.bedrooms,
                    bathrooms: newProperty.bathrooms,
                    area: newProperty.area.toString(),
                    image_url: newProperty.image,
                    owner_id: user.id,
                    verification_status: 'unverified',
                    latitude: newProperty.latitude,
                    longitude: newProperty.longitude
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        }
    });
}
