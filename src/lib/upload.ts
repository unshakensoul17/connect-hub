import { supabase } from "./supabase";

export async function uploadFile(
    file: File,
    bucket: 'notes-files' | 'avatars',
    path?: string
) {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = path ? `${path}/${fileName}` : fileName;

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return { filePath, publicUrl, data };
    } catch (error: any) {
        console.error('Error uploading file:', error);
        throw error;
    }
}
