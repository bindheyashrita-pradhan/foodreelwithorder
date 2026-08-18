const { createClient } = require('@supabase/supabase-js');

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL || 
                    process.env.NEXT_PUBLIC_SUPABASE_URL || 
                    "https://srilfsqouyxzgdsfpndv.supabase.co";

const supabaseKey = process.env.SUPABASE_KEY || 
                    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
                    "sb_publishable_IKzZPrn8eiJLgNHNvRo2Zw_P6Sd_B3C";

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Uploads video buffer to Supabase 'videos' bucket
 * @param {Buffer} file - File buffer from multer (req.file.buffer)
 * @param {string} fileName - Unique file name (e.g. uuid.mp4)
 * @returns {Promise<{ url: string }>}
 */
async function uploadFile(file, fileName) {
    try {
        // 1. Upload video file buffer into the 'videos' bucket
        const { data, error } = await supabase.storage
            .from('videos')
            .upload(fileName, file, {
                contentType: 'video/mp4',
                upsert: true
            });

        if (error) {
            console.error("Supabase Storage Error:", error);
            throw error;
        }

        // 2. Retrieve public streaming URL for the video
        const { data: publicData } = supabase.storage
            .from('videos')
            .getPublicUrl(fileName);

        console.log("🟢 Video successfully uploaded to Supabase:", publicData.publicUrl);

        // Returns object matching fileUploadResult.url in your controller
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