'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export async function checkDatabaseEmpty() {
    const userCount = await prisma.user.count();
    return userCount === 0;
}

export async function createFirstUser(formData: FormData) {
    // Double-check that database is still empty
    const isEmpty = await checkDatabaseEmpty();

    if (!isEmpty) {
        throw new Error('Database already has users. Cannot create first user.');
    }

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!name || !email || !password) {
        throw new Error('All fields are required');
    }

    // Validate password length
    if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create first user
    await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            language: 'es', // Default language
            role: 'ADMIN',
            isActive: true,
        },
    });

    // Redirect to login
    redirect('/login');
}
