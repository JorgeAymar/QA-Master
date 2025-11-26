import { getDictionary } from '@/lib/dictionaries';
import { getUserLanguage } from '@/lib/session';
import { inviteUser } from '@/app/actions/admin';
import { Mail, Shield } from 'lucide-react';

export default async function InviteUserPage() {
    const lang = await getUserLanguage();
    const dict = getDictionary(lang);

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">{dict.admin.inviteTitle}</h1>
                <p className="mt-1 text-sm text-slate-500">{dict.admin.inviteDesc}</p>
            </div>

            <form action={inviteUser} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium leading-6 text-slate-900">
                        {dict.admin.email}
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Mail className="h-5 w-5 text-slate-400" aria-hidden="true" />
                        </div>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            required
                            className="block w-full rounded-md border-0 py-2.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="role" className="block text-sm font-medium leading-6 text-slate-900">
                        {dict.admin.roleLabel}
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Shield className="h-5 w-5 text-slate-400" aria-hidden="true" />
                        </div>
                        <select
                            name="role"
                            id="role"
                            required
                            className="block w-full rounded-md border-0 py-2.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        >
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                        {dict.admin.sendInvite}
                    </button>
                </div>
            </form>
        </div>
    );
}
