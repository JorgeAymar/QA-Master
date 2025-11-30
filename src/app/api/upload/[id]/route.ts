import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { join } from 'path';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { error: 'Attachment ID is required' },
                { status: 400 }
            );
        }

        // Find attachment
        const attachment = await prisma.storyAttachment.findUnique({
            where: { id },
        });

        if (!attachment) {
            return NextResponse.json(
                { error: 'Attachment not found' },
                { status: 404 }
            );
        }

        // Delete file from filesystem
        try {
            // Construct absolute path. stored path is relative like /uploads/...
            const absolutePath = join(process.cwd(), 'public', attachment.path);
            await unlink(absolutePath);
        } catch (error) {
            console.error('Error deleting file from disk:', error);
            // Continue to delete from DB even if file is missing
        }

        // Delete from database
        await prisma.storyAttachment.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting attachment:', error);
        return NextResponse.json(
            { error: 'Error deleting attachment' },
            { status: 500 }
        );
    }
}
