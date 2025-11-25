'use client';

import { useState, useRef } from 'react';
import { updateProfile } from '@/app/actions/profile';
import { Camera, Save, Loader2 } from 'lucide-react';

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
                setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
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
        <form action={handleSubmit} className="space-y-8">
            {/* Profile Picture */}
            <div className="flex flex-col items-center gap-4">
                <div className="relative h-32 w-32">
                    <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-lg bg-slate-100 flex items-center justify-center">
                        {preview ? (
                            <img src={preview} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-4xl font-bold text-slate-300">
                                {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 rounded-full bg-blue-600 p-2 text-white shadow-md hover:bg-blue-700 transition-colors"
                        title={dict.profile.changePhoto}
                    >
                        <Camera className="h-4 w-4" />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </div>
                <p className="text-sm text-slate-500">{dict.profile.uploadPhoto}</p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700">{dict.profile.fullName}</label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        defaultValue={user.name || ''}
                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="language" className="block text-sm font-medium text-slate-700">{dict.profile.language}</label>
                    <select
                        name="language"
                        id="language"
                        defaultValue={user.language || 'es'}
                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                        <option value="pt">Português</option>
                    </select>
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-medium text-slate-900 mb-4">{dict.profile.changePassword}</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700">{dict.profile.currentPassword}</label>
                            <input
                                type="password"
                                name="currentPassword"
                                id="currentPassword"
                                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Required to change password"
                            />
                        </div>
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700">{dict.profile.newPassword}</label>
                            <input
                                type="password"
                                name="newPassword"
                                id="newPassword"
                                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Leave blank to keep current"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Feedback Message */}
            {message && (
                <div className={`rounded-md p-3 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {dict.profile.saveChanges}
                </button>
            </div>
        </form>
    );
}
