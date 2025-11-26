import { getDictionary } from '@/lib/dictionaries';
import { LoginForm } from '@/components/auth/LoginForm';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
    // Check if database is empty - redirect to setup if no users exist
    const userCount = await prisma.user.count();
    if (userCount === 0) {
        redirect('/setup');
    }

    const dict = getDictionary('es'); // Default to Spanish for unauthenticated
    return <LoginForm dict={dict} />;
}
