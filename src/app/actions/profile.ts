'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { hash, compare } from 'bcryptjs';

export async function updateProfile(formData: FormData) {
    const session = await getSession();
    if (!session?.userId) {
        return { error: 'Unauthorized' };
    }

    const userId = session.userId as string;
    const name = formData.get('name') as string;
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const image = formData.get('image') as string; // Base64 string

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return { error: 'User not found' };

        const updateData: { name?: string; image?: string; password?: string; language?: string } = {};

        // Update Name
        if (name && name !== user.name) {
            updateData.name = name;
        }

        // Update Language
        const language = formData.get('language') as string;
        if (language && language !== user.language) {
            updateData.language = language;
        }

        // Update Image
        if (image && image.startsWith('data:image')) {
            updateData.image = image;
        }

        // Update Password
        if (newPassword) {
            if (!currentPassword) {
                return { error: 'Current password is required to set a new password' };
            }
            const isValid = await compare(currentPassword, user.password);
            if (!isValid) {
                return { error: 'Incorrect current password' };
            }
            updateData.password = await hash(newPassword, 10);
        }

        if (Object.keys(updateData).length > 0) {
            await prisma.user.update({
                where: { id: userId },
                data: updateData,
            });
            revalidatePath('/profile');
            return { success: 'Profile updated successfully' };
        }

        return { success: 'No changes made' };

    } catch (error) {
        console.error('Profile update error:', error);
        return { error: 'Failed to update profile' };
    }
}
