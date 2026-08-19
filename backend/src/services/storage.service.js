const { createClient } = require('@supabase/supabase-js');

// 🟢 CRASH-PROOF URL & KEY EXTRACTION (Always guarantees a valid HTTPS URL on startup)
const rawUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseUrl = (rawUrl && rawUrl.startsWith('http'))
    ? rawUrl.trim()
    : "https://srilfsqouyxzgdsfpndv.supabase.co";

const supabaseKey = (process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "").trim() ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyaWxmc3FvdXl4emdkc2ZwbmR2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzAzNzcyNCwiZXhwIjoyMTAyNjEzNzI0fQ.2CrS_lHNB0JJLnPiWX_PQS6-8py72zupz4B5jSPJSJQ";

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Uploads video buffer to Supabase 'videos' bucket
 * @param {Buffer} file - File buffer from multer (req.file.buffer)
 * @param {string} fileName - Unique file name (e.g. uuid.mp4)
 * @returns {Promise<{ url: string }>}
 */
async function uploadFile(file, fileName) {
    try {
        const { data, error } = await supabase.storage
            .from('videos')
            .upload(fileName, file, {
                contentType: 'video/mp4',
                upsert: true
            });

        if (error) {
            console.error("Supabase Storage upload error:", error);
            throw error;
        }

        const { data: publicData } = supabase.storage
            .from('videos')
            .getPublicUrl(fileName);

        console.log("🟢 Video uploaded to Supabase successfully:", publicData.publicUrl);

        return {
            url: publicData.publicUrl,
            ...data
        };
    } catch (error) {
        console.error("Upload error in storage.service.js:", error);
        throw error;
    }
}

module.exports = {
    uploadFile
};