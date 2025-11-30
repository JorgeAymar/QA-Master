import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const storyId = formData.get('storyId') as string;

        if (!file || !storyId) {
            return NextResponse.json(
                { error: 'File and storyId are required' },
                { status: 400 }
            );
        }

        // Create directory if it doesn't exist
        const uploadDir = join(process.cwd(), 'public', 'uploads', storyId);
        await mkdir(uploadDir, { recursive: true });

        // Generate unique filename to prevent overwrites
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${timestamp}-${safeName}`;
        const filepath = join(uploadDir, filename);

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // Save to database
        const attachment = await prisma.storyAttachment.create({
            data: {
                storyId,
                filename: file.name,
                path: `/uploads/${storyId}/${filename}`,
                mimeType: file.type,
                size: file.size,
            },
        });

        return NextResponse.json(attachment);
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { error: 'Error uploading file' },
            { status: 500 }
        );
    }
}
