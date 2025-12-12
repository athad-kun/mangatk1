/**
 * ImgBB Image Upload Service
 * Central service for uploading images to ImgBB
 */

const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';
// API Key - uses environment variable or falls back to configured key
const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY || '9acd5ae77545c9653ac31a3d680fb638';

export interface ImgbbUploadResult {
    url: string;
    thumb: string;
    delete_url: string;
}

/**
 * Upload an image file to ImgBB
 * @param file - The image file to upload
 * @returns The uploaded image URL
 */
export async function uploadToImgbb(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    try {
        const res = await fetch(`${IMGBB_API_URL}?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData,
        });

        const data = await res.json();

        if (data.success) {
            return data.data.url;
        }

        throw new Error(data.error?.message || 'فشل رفع الصورة إلى imgbb');
    } catch (err: any) {
        if (err.message.includes('imgbb') || err.message.includes('فشل')) {
            throw err;
        }
        throw new Error('فشل الاتصال بـ imgbb. تحقق من اتصال الإنترنت.');
    }
}

/**
 * Upload an image file to ImgBB with full result
 * @param file - The image file to upload
 * @returns Full upload result with url, thumb, and delete_url
 */
export async function uploadToImgbbFull(file: File): Promise<ImgbbUploadResult> {
    const formData = new FormData();
    formData.append('image', file);

    try {
        const res = await fetch(`${IMGBB_API_URL}?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData,
        });

        const data = await res.json();

        if (data.success) {
            return {
                url: data.data.url,
                thumb: data.data.thumb?.url || data.data.url,
                delete_url: data.data.delete_url,
            };
        }

        throw new Error(data.error?.message || 'فشل رفع الصورة إلى imgbb');
    } catch (err: any) {
        if (err.message.includes('imgbb') || err.message.includes('فشل')) {
            throw err;
        }
        throw new Error('فشل الاتصال بـ imgbb. تحقق من اتصال الإنترنت.');
    }
}

/**
 * Check if ImgBB API key is configured
 */
export function isImgbbConfigured(): boolean {
    return !!IMGBB_API_KEY;
}
