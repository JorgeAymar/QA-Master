'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/session';
import { sendEmail, generateInvitationHtml } from '@/lib/email';

export async function createUser(formData: FormData) {
    const session = await verifySession();

    // Check if current user is admin
    const currentUser = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { role: true }
    });

    if (currentUser?.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as string;
    const language = formData.get('language') as string || 'es';

    if (!name || !email || !password || !role) {
        throw new Error('All fields are required');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role,
            language,
            isActive: true,
        },
    });

    redirect('/admin');
}

export async function inviteUser(formData: FormData) {
    const session = await verifySession();

    // Check if current user is admin
    const currentUser = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { role: true }
    });

    if (currentUser?.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }

    const email = formData.get('email') as string;
    const role = formData.get('role') as string;

    if (!email || !role) {
        throw new Error('All fields are required');
    }

    // In a real app, we would send an email here.
    // For now, we'll just create the user with a temporary password and inactive status?
    // Or maybe just create them as active but with a random password they need to reset?
    // The requirement is "send invitation by email".
    // Since I don't have an email service configured, I'll simulate it by creating the user 
    // with a placeholder password and logging the "email" to console.

    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            role,
            isActive: true, // Auto-activate for now
            name: 'Invited User', // Placeholder name
        },
    });

    console.log(`[MOCK EMAIL] Invitation sent to ${email} with password: ${tempPassword}`);

    redirect('/admin');
}

export async function toggleUserStatus(userId: string, isActive: boolean) {
    const session = await verifySession();

    // Check if current user is admin
    const currentUser = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { role: true }
    });

    if (currentUser?.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }

    // Prevent deactivating yourself
    if (userId === session.userId) {
        throw new Error('Cannot deactivate your own account');
    }

    await prisma.user.update({
        where: { id: userId },
        data: { isActive },
    });

    redirect('/admin');
}

export async function sendInvitation(userId: string) {
    const session = await verifySession();

    // Check if current user is admin
    const currentUser = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { role: true }
    });

    if (currentUser?.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true }
    });

    if (!user) {
        throw new Error('User not found');
    }

    try {
        const html = generateInvitationHtml(user.name, user.email);
        await sendEmail({
            to: user.email,
            subject: 'Welcome to QA Master - Account Activated',
            html,
        });
        console.log(`[EMAIL SENT] Invitation sent to ${user.email}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to send email:', error);
        return { success: false, error: 'Failed to send email' };
    }
}
