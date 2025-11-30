import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';
import fs from 'fs/promises';
import path from 'path';
import mammoth from 'mammoth';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    console.error('[Import] POST request received');
    try {
        const session = await verifySession();
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { id: projectId } = await params;
        const formData = await request.formData();
        const files = formData.getAll('files') as File[];
        const paths = formData.getAll('paths') as string[];

        if (!files || files.length === 0) {
            return new NextResponse('No files uploaded', { status: 400 });
        }

        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project) {
            return new NextResponse('Project not found', { status: 404 });
        }

        console.log(`[Import] Received ${files.length} files for project ${projectId}`);
        console.log(`[Import] Paths:`, paths);

        let createdCount = 0;

        // Process each file
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const relativePath = paths[i] || file.name;

            console.log(`[Import] Processing file: ${file.name}, Path: ${relativePath}`);

            // Skip hidden files
            if (file.name.startsWith('.')) {
                console.log(`[Import] Skipping hidden file: ${file.name}`);
                continue;
            }

            // Basic extension check
            const isTextFile = /\.(txt|md|feature|json|csv|xml|html|js|ts|css)$/i.test(file.name) || !file.name.includes('.');
            const isDocx = /\.docx$/i.test(file.name);

            if (!isTextFile && !isDocx && file.type && !file.type.startsWith('text/') && file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                console.log(`[Import] Skipping likely binary file: ${file.name} (${file.type})`);
                continue;
            }

            let content = '';

            if (isDocx) {
                try {
                    const buffer = Buffer.from(await file.arrayBuffer());
                    const result = await mammoth.extractRawText({ buffer });
                    content = result.value;
                    console.log(`[Import] Extracted text from docx: ${file.name} (${content.length} chars)`);
                    if (result.messages.length > 0) {
                        console.log(`[Import] Mammoth messages:`, result.messages);
                    }
                } catch (err) {
                    console.error(`[Import] Failed to parse docx ${file.name}:`, err);
                    continue; // Skip if parsing fails
                }
            } else {
                content = await file.text();
                // Remove null bytes which Postgres hates in text fields
                content = content.replace(/\0/g, '');
            }

            // Determine Feature Name
            // Logic: If path contains '/', use the directory name as Feature.
            // Example: "Auth/Login.md" -> Feature: "Auth", Story: "Login"
            // Example: "Login.md" -> Feature: "Uncategorized" (or create a default one)

            let featureName = 'Imported';
            const pathParts = relativePath.split('/');
            if (pathParts.length > 1) {
                // Use the immediate parent folder as feature name
                featureName = pathParts[pathParts.length - 2];
            }
            console.log(`[Import] Determined Feature: ${featureName}`);

            // Determine Story Title
            // Use filename without extension
            const filename = pathParts[pathParts.length - 1];
            const storyTitle = filename.replace(/\.[^/.]+$/, "");
            console.log(`[Import] Determined Story: ${storyTitle}`);

            // Find or Create Feature
            let feature = await prisma.feature.findFirst({
                where: {
                    projectId: projectId,
                    name: featureName
                }
            });

            if (!feature) {
                console.log(`[Import] Creating new feature: ${featureName}`);
                feature = await prisma.feature.create({
                    data: {
                        projectId: projectId,
                        name: featureName,
                        // description is not in schema for Feature
                    }
                });
            } else {
                console.log(`[Import] Found existing feature: ${feature.id}`);
            }

            // Create User Story
            console.log(`[Import] Creating story: ${storyTitle}`);
            const story = await prisma.userStory.create({
                data: {
                    projectId: projectId,
                    featureId: feature.id,
                    title: storyTitle,
                    acceptanceCriteria: content,
                    status: 'PENDING'
                }
            });
            console.log(`[Import] Story created: ${story.id}`);

            // Save Attachment
            try {
                const uploadDir = path.join(process.cwd(), 'public', 'uploads', story.id);
                await fs.mkdir(uploadDir, { recursive: true });

                const buffer = Buffer.from(await file.arrayBuffer());
                const filePath = path.join(uploadDir, filename);
                await fs.writeFile(filePath, buffer);

                // Create Attachment Record
                // Store path relative to public folder for serving
                const dbPath = `/uploads/${story.id}/${filename}`;

                await prisma.storyAttachment.create({
                    data: {
                        storyId: story.id,
                        filename: filename,
                        path: dbPath,
                        mimeType: file.type || 'text/plain',
                        size: file.size
                    }
                });
                console.log(`[Import] Attachment saved: ${dbPath}`);
            } catch (err) {
                console.error(`[Import] Failed to save attachment for story ${story.id}:`, err);
                // Continue even if attachment fails, story is created
            }

            createdCount++;
        }

        console.log(`[Import] Completed. Created ${createdCount} stories.`);
        return NextResponse.json({ success: true, count: createdCount });

    } catch (error) {
        console.error('Import error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
