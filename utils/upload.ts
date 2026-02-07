import { supabase } from '@/api/supabase';

export const uploadImageToSupabase = async (uri: string, bucket: string = 'property-images'): Promise<string> => {
    try {
        const fileExt = uri.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        // Read file as ArrayBuffer using fetch (standard approach)
        const response = await fetch(uri);
        const arrayBuffer = await response.arrayBuffer();

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, arrayBuffer, {
                contentType: `image/${fileExt}`,
            });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error('Upload failed:', error);
        throw error;
    }
};
