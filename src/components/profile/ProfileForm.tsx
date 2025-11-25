'use client';

import { useState, useRef } from 'react';
import { updateProfile } from '@/app/actions/profile';
import { Camera, Save, Loader2, User, Mail, Globe, Lock, Key } from 'lucide-react';

interface User {
    name: string | null;
    email: string;
    image: string | null;
    language: string;
}

import { Dictionary } from '@/lib/dictionaries';

export function ProfileForm({ user, dict }: { user: User, dict: Dictionary }) {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [preview, setPreview] = useState<string | null>(user.image);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setMessage({ type: 'error', text: dict.profile.imageSizeError });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        setMessage(null);

        if (preview && preview !== user.image) {
            formData.set('image', preview);
        }

        const result = await updateProfile(formData);

        if (result?.error) {
            setMessage({ type: 'error', text: result.error });
        } else if (result?.success) {
            setMessage({ type: 'success', text: result.success });
            // Clear password fields
            const form = document.querySelector('form') as HTMLFormElement;
            form.reset();
        }

        setIsLoading(false);
    };

    return (
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/5">
            {/* Header Banner */}
            <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

            <form action={handleSubmit} className="relative px-6 pb-8 pt-10 sm:px-10">
                {/* Profile Picture */}
                <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                    <div className="relative">
                        <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-white shadow-lg">
                            {preview ? (
                                <img src={preview} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-slate-100 text-4xl font-bold text-slate-300">
                                    {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition-transform hover:scale-110 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            title={dict.profile.changePhoto}
                        >
                            <Camera className="h-5 w-5" />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </div>
                </div>

                <div className="mt-16 space-y-8">
                    {/* Personal Info Section */}
                    <div>
                        <h3 className="text-lg font-semibold leading-6 text-slate-900 border-b border-slate-200 pb-2 mb-4">
                            {dict.profile.personalInfo}
                        </h3>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="col-span-2 sm:col-span-1">
                                <label htmlFor="name" className="block text-sm font-medium leading-6 text-slate-900">
                                    {dict.profile.fullName}
                                </label>
                                <div className="relative mt-2 rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <User className="h-5 w-5 text-slate-400" aria-hidden="true" />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        defaultValue={user.name || ''}
                                        className="block w-full rounded-md border-0 py-2.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>

                            <div className="col-span-2 sm:col-span-1">
                                <label htmlFor="language" className="block text-sm font-medium leading-6 text-slate-900">
                                    {dict.profile.language}
                                </label>
                                <div className="relative mt-2 rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Globe className="h-5 w-5 text-slate-400" aria-hidden="true" />
                                    </div>
                                    <select
                                        name="language"
                                        id="language"
                                        defaultValue={user.language || 'es'}
                                        className="block w-full rounded-md border-0 py-2.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                    >
                                        <option value="es">{dict.profile.spanish}</option>
                                        <option value="en">{dict.profile.english}</option>
                                        <option value="pt">{dict.profile.portuguese}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="col-span-2">
                                <label htmlFor="email" className="block text-sm font-medium leading-6 text-slate-900">
                                    {dict.profile.email}
                                </label>
                                <div className="relative mt-2 rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Mail className="h-5 w-5 text-slate-400" aria-hidden="true" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        defaultValue={user.email}
                                        disabled
                                        className="block w-full rounded-md border-0 bg-slate-50 py-2.5 pl-10 text-slate-500 ring-1 ring-inset ring-slate-200 sm:text-sm sm:leading-6 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Section */}
                    <div>
                        <h3 className="text-lg font-semibold leading-6 text-slate-900 border-b border-slate-200 pb-2 mb-4">
                            {dict.profile.changePassword}
                        </h3>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="col-span-2 sm:col-span-1">
                                <label htmlFor="currentPassword" className="block text-sm font-medium leading-6 text-slate-900">
                                    {dict.profile.currentPassword}
                                </label>
                                <div className="relative mt-2 rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Lock className="h-5 w-5 text-slate-400" aria-hidden="true" />
                                    </div>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        id="currentPassword"
                                        className="block w-full rounded-md border-0 py-2.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                        placeholder={dict.profile.passwordRequired}
                                    />
                                </div>
                            </div>

                            <div className="col-span-2 sm:col-span-1">
                                <label htmlFor="newPassword" className="block text-sm font-medium leading-6 text-slate-900">
                                    {dict.profile.newPassword}
                                </label>
                                <div className="relative mt-2 rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Key className="h-5 w-5 text-slate-400" aria-hidden="true" />
                                    </div>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        id="newPassword"
                                        className="block w-full rounded-md border-0 py-2.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                        placeholder={dict.profile.passwordOptional}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feedback Message */}
                {message && (
                    <div className={`mt-6 rounded-md p-4 text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10'}`}>
                        {message.text}
                    </div>
                )}

                {/* Submit Button */}
                <div className="mt-8 flex justify-end border-t border-slate-200 pt-6">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {dict.profile.saveChanges}
                    </button>
                </div>
            </form>
        </div>
    );
}
