import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary';

// POST /api/upload — { image: base64string, folder?: string }
export async function POST(req: NextRequest) {
  try {
    const { image, folder } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'Image data required' }, { status: 400 });
    }

    const url = await uploadImage(image, folder || 'sonicstream/avatars');
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
