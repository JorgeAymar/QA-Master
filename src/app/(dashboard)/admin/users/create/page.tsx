import { getDictionary } from '@/lib/dictionaries';
import { getUserLanguage } from '@/lib/session';
import { createUser } from '@/app/actions/admin';
import { User, Mail, Lock, Shield, Globe } from 'lucide-react';

export default async function CreateUserPage() {
    const lang = await getUserLanguage();
    const dict = getDictionary(lang);

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                    {dict.admin.createTitle}
                </h1>
                <p className="mt-2 text-lg text-slate-600">
                    {dict.admin.createDesc}
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-50/50 px-8 py-6 border-b border-slate-100">
                    <h2 className="text-base font-semibold leading-7 text-slate-900">
                        {dict.profile.personalInfo}
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                        {dict.admin.createDesc}
                    </p>
                </div>

                <form action={createUser} className="p-8 space-y-8">
                    <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label htmlFor="name" className="block text-sm font-semibold leading-6 text-slate-900">
                                {dict.admin.name}
                            </label>
                            <div className="relative mt-2">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <User className="h-5 w-5 text-slate-400" aria-hidden="true" />
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    required
                                    className="block w-full rounded-lg border-0 py-3 pl-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-slate-50 focus:bg-white transition-colors"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="email" className="block text-sm font-semibold leading-6 text-slate-900">
                                {dict.admin.email}
                            </label>
                            <div className="relative mt-2">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Mail className="h-5 w-5 text-slate-400" aria-hidden="true" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    required
                                    className="block w-full rounded-lg border-0 py-3 pl-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-slate-50 focus:bg-white transition-colors"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-1">
                            <label htmlFor="password" className="block text-sm font-semibold leading-6 text-slate-900">
                                {dict.auth.passwordLabel}
                            </label>
                            <div className="relative mt-2">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Lock className="h-5 w-5 text-slate-400" aria-hidden="true" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    id="password"
                                    required
                                    minLength={6}
                                    className="block w-full rounded-lg border-0 py-3 pl-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-slate-50 focus:bg-white transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-1">
                            <label htmlFor="role" className="block text-sm font-semibold leading-6 text-slate-900">
                                {dict.admin.roleLabel}
                            </label>
                            <div className="relative mt-2">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Shield className="h-5 w-5 text-slate-400" aria-hidden="true" />
                                </div>
                                <select
                                    name="role"
                                    id="role"
                                    required
                                    className="block w-full rounded-lg border-0 py-3 pl-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-slate-50 focus:bg-white transition-colors"
                                >
                                    <option value="USER">User</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                        </div>

                        <div className="sm:col-span-1">
                            <label htmlFor="language" className="block text-sm font-semibold leading-6 text-slate-900">
                                {dict.profile.language}
                            </label>
                            <div className="relative mt-2">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Globe className="h-5 w-5 text-slate-400" aria-hidden="true" />
                                </div>
                                <select
                                    name="language"
                                    id="language"
                                    required
                                    className="block w-full rounded-lg border-0 py-3 pl-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-slate-50 focus:bg-white transition-colors"
                                >
                                    <option value="es">{dict.profile.spanish}</option>
                                    <option value="en">{dict.profile.english}</option>
                                    <option value="pt">{dict.profile.portuguese}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md hover:from-blue-500 hover:to-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
                        >
                            {dict.admin.createUser}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
