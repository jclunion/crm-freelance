import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';

// Taille max : 10 Mo
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Types MIME autorisés
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
];

/**
 * POST /api/upload
 * Upload un fichier vers Cloudinary et retourne son URL publique
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Vérifier la taille
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux (max 10 Mo)' },
        { status: 400 }
      );
    }

    // Vérifier le type MIME
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé. Formats acceptés : PDF, Word, Excel, images.' },
        { status: 400 }
      );
    }

    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Déterminer le type de ressource pour Cloudinary
    const isImage = file.type.startsWith('image/');
    const resourceType = isImage ? 'image' : 'raw';

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || '';
    const nomFichierSecurise = file.name
      .replace(`.${extension}`, '')
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .substring(0, 50);
    const publicId = `${session.user.id}/${timestamp}-${nomFichierSecurise}`;

    // Upload vers Cloudinary
    const result = await uploadToCloudinary(buffer, {
      folder: 'crm-freelance',
      public_id: publicId,
      resource_type: resourceType,
    });

    return NextResponse.json({
      url: result.url,
      publicId: result.public_id,
      nom: file.name,
      taille: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    console.error('Erreur upload Cloudinary:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 });
  }
}
