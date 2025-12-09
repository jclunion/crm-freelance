import { v2 as cloudinary } from 'cloudinary';

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

/**
 * Upload un fichier vers Cloudinary
 * @param buffer - Le buffer du fichier
 * @param options - Options d'upload (folder, public_id, etc.)
 * @returns L'URL publique du fichier uploadé
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    folder?: string;
    public_id?: string;
    resource_type?: 'image' | 'raw' | 'video' | 'auto';
  } = {}
): Promise<{ url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder || 'crm-freelance',
      public_id: options.public_id,
      resource_type: options.resource_type || 'auto' as const,
    };

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
          });
        } else {
          reject(new Error('Résultat Cloudinary vide'));
        }
      }
    ).end(buffer);
  });
}

/**
 * Supprimer un fichier de Cloudinary
 * @param publicId - L'ID public du fichier
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
