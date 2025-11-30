'use server';

import { prisma } from '@/lib/prisma';
import { createSession, deleteSession } from '@/lib/session';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export async function signup(prevState: unknown, formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password || !name) {
        return { error: 'All fields are required' };
    }

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        return { error: 'User already exists' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });

    await createSession(user.id, user.role);
    redirect('/');
}

export async function login(prevState: unknown, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'All fields are required' };
    }

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        return { error: 'Invalid credentials' };
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
        return { error: 'Invalid credentials' };
    }

    await createSession(user.id, user.role);
    redirect('/');
}

export async function logout() {
    await deleteSession();
}

export async function updateTheme(theme: 'light' | 'dark') {
    const { verifySession } = await import('@/lib/session');
    const session = await verifySession();

    await prisma.user.update({
        where: { id: session.userId },
        data: { theme },
    });

    const { revalidatePath } = await import('next/cache');
    revalidatePath('/');
}
