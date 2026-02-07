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
                .eq('status', 'available') // Only show available properties
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
                images: p.images || [p.image_url],
                verification: p.verification_status,
                owner: {
                    id: p.owner?.id,
                    name: p.owner?.full_name,
                    phone: p.owner?.phone,
                    rating: p.owner?.rating
                },
                latitude: p.latitude,
                longitude: p.longitude,
                views: p.views || 0,
                status: p.status || 'available',
                created_at: p.created_at,
                amenities: p.amenities || []
            })) as Property[];
        }
    });
}

export function useOwnerProperties(ownerId: string | undefined) {
    return useQuery({
        queryKey: ['properties', 'owner', ownerId],
        queryFn: async () => {
            if (!ownerId) return [];

            const { data, error } = await supabase
                .from('properties')
                .select('*, owner:profiles(*)')
                .eq('owner_id', ownerId)
                .order('created_at', { ascending: false });

            if (error) throw error;

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
                images: p.images || [p.image_url],
                verification: p.verification_status,
                owner: {
                    id: p.owner?.id,
                    name: p.owner?.full_name,
                    phone: p.owner?.phone,
                    rating: p.owner?.rating
                },
                latitude: p.latitude,
                longitude: p.longitude,
                views: p.views || 0,
                status: p.status || 'available',
                created_at: p.created_at
            })) as Property[];
        },
        enabled: !!ownerId
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
                images: data.images || [data.image_url],
                verification: data.verification_status,
                owner: {
                    id: data.owner?.id,
                    name: data.owner?.full_name,
                    phone: data.owner?.phone,
                    rating: data.owner?.rating
                },
                description: data.description,
                latitude: data.latitude,
                longitude: data.longitude,
                views: data.views || 0,
                status: data.status || 'available',
                created_at: data.created_at,
                amenities: data.amenities || []
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
                    images: newProperty.images,
                    owner_id: user.id,
                    verification_status: 'unverified',
                    latitude: newProperty.latitude,
                    longitude: newProperty.longitude,
                    amenities: newProperty.amenities
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

export function useUpdateProperty() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string, updates: Partial<Property> }) => {
            const { data, error } = await supabase
                .from('properties')
                .update({
                    title: updates.title,
                    description: updates.description,
                    price: updates.price,
                    type: updates.type,
                    city: updates.location?.city,
                    district: updates.location?.district,
                    bedrooms: updates.bedrooms,
                    bathrooms: updates.bathrooms,
                    area: updates.area?.toString(),
                    image_url: updates.image,
                    images: updates.images,
                    amenities: updates.amenities,
                    latitude: updates.latitude,
                    longitude: updates.longitude,
                })
                .eq('id', id)
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

export function useDeleteProperty() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('properties')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        }
    });
}
