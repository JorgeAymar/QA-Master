import { createFirstUser } from '@/app/actions/setup';
import { getDictionary } from '@/lib/dictionaries';
import { getUserLanguage } from '@/lib/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { User, Mail, Lock } from 'lucide-react';

export default async function SetupPage() {
    // Check if database already has users
    const userCount = await prisma.user.count();

    if (userCount > 0) {
        // If there are already users, redirect to login
        redirect('/login');
    }

    const lang = await getUserLanguage();
    const dict = getDictionary(lang);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/5">
                    {/* Header Banner */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-center">
                        <h1 className="text-3xl font-bold text-white">{dict.setup.title}</h1>
                        <p className="mt-2 text-blue-100">{dict.setup.subtitle}</p>
                    </div>

                    {/* Form */}
                    <div className="px-6 py-8">
                        <p className="mb-6 text-center text-sm text-slate-600">
                            {dict.setup.description}
                        </p>

                        <form action={createFirstUser} className="space-y-5">
                            {/* Name Field */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium leading-6 text-slate-900">
                                    {dict.auth.nameLabel}
                                </label>
                                <div className="relative mt-2 rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <User className="h-5 w-5 text-slate-400" aria-hidden="true" />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        required
                                        className="block w-full rounded-md border-0 py-2.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium leading-6 text-slate-900">
                                    {dict.auth.emailLabel}
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
                                        placeholder="admin@example.com"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium leading-6 text-slate-900">
                                    {dict.auth.passwordLabel}
                                </label>
                                <div className="relative mt-2 rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Lock className="h-5 w-5 text-slate-400" aria-hidden="true" />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        id="password"
                                        required
                                        minLength={6}
                                        className="block w-full rounded-md border-0 py-2.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-slate-500">Mínimo 6 caracteres</p>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full flex justify-center items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all"
                            >
                                {dict.setup.createAccount}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-xs text-slate-600">
                    QA Master - Quality Assurance Testing Platform
                </p>
            </div>
        </div>
    );
}
