'use client';

import { useState, useEffect } from 'react';
import { updateProjectContext } from '@/app/actions/projects';
import { Save, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProjectTestContextProps {
    projectId: string;
    initialContext: string | null;
    canEdit: boolean;
    dict: any;
}

export function ProjectTestContext({ projectId, initialContext, canEdit, dict }: ProjectTestContextProps) {
    const [context, setContext] = useState(initialContext || '');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateProjectContext(projectId, context);
            setIsEditing(false);
            router.refresh();
        } catch (error) {
            console.error('Failed to save context:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-900 text-sm">Contexto Global</h3>
                {canEdit && (
                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setContext(initialContext || '');
                                    }}
                                    disabled={isSaving}
                                    className="text-xs text-slate-500 hover:text-slate-700 font-medium px-2 py-1 rounded hover:bg-slate-100"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="text-xs text-white bg-blue-600 hover:bg-blue-700 font-medium px-3 py-1 rounded flex items-center gap-1"
                                >
                                    {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                    Guardar
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded hover:bg-blue-50"
                            >
                                Editar
                            </button>
                        )}
                    </div>
                )}
            </div>
            {isEditing ? (
                <textarea
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Ej: Usuario: admin / Pass: 123456..."
                    className="flex-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none transition-all resize-none min-h-[80px]"
                    autoFocus
                />
            ) : (
                <div className="flex-1 w-full rounded-lg border border-transparent bg-slate-50 px-3 py-2 text-sm text-slate-600 min-h-[80px] whitespace-pre-wrap">
                    {context || <span className="text-slate-400 italic">Sin contexto definido.</span>}
                </div>
            )}
        </div>
    );
}
