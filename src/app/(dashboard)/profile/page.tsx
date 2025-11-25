import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { ProfileForm } from '@/components/profile/ProfileForm';

import { getDictionary } from '@/lib/dictionaries';
import { getUserLanguage } from '@/lib/session';

export default async function ProfilePage() {
    const session = await getSession();

    if (!session?.userId) {
        redirect('/login');
    }

    const user = await prisma.user.findUnique({
        where: { id: session.userId as string },
    });

    if (!user) {
        redirect('/login');
    }

    const lang = await getUserLanguage();
    const dict = getDictionary(lang);

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">{dict.profile.title}</h1>

            <ProfileForm user={{
                name: user.name,
                email: user.email,
                image: user.image,
                language: user.language
            }} dict={dict} />
        </div>
    );
}
