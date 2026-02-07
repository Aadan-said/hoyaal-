import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import { supabase } from './supabase';

export const uploadAvatar = async (userId: string, uri: string) => {
    try {
        const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: 'base64',
        });

        const filePath = `${userId}/${Date.now()}.png`;
        const contentType = 'image/png';

        const { data, error } = await supabase.storage
            .from('avatars')
            .upload(filePath, decode(base64), {
                contentType,
                upsert: true,
            });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error('Error uploading avatar:', error);
        throw error;
    }
};
