import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { encrypt, decrypt, cookie } from './auth-jose';

export { encrypt, decrypt };

export async function createSession(userId: string) {
    const expires = new Date(Date.now() + cookie.duration);
    const session = await encrypt({ userId, expires });

    (await cookies()).set(cookie.name, session, { ...cookie.options, expires });
}

export async function verifySession() {
    const cookieStore = await cookies();
    const session = cookieStore.get(cookie.name)?.value;
    const payload = await decrypt(session);

    if (!payload?.userId) {
        redirect('/login');
    }

    return { userId: payload.userId as string };
}

export async function deleteSession() {
    (await cookies()).delete(cookie.name);
    redirect('/login');
}

export async function getSession() {
    const cookieStore = await cookies();
    const session = cookieStore.get(cookie.name)?.value;
    const payload = await decrypt(session);
    return payload;
}

import { prisma } from '@/lib/prisma';

export async function getUserLanguage() {
    const session = await getSession();
    if (!session?.userId) return 'es';

    const user = await prisma.user.findUnique({
        where: { id: session.userId as string },
        select: { language: true }
    });

    return user?.language || 'es';
}
