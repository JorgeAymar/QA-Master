import { getDictionary } from '@/lib/dictionaries';
import { getUserLanguage } from '@/lib/session';

export default async function AdminPage() {
    const lang = await getUserLanguage();
    const dict = getDictionary(lang);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            <div className="rounded-lg bg-white p-6 shadow">
                <p className="text-slate-600">
                    Welcome to the admin area. Here you can manage users and system settings.
                </p>
            </div>
        </div>
    );
}
