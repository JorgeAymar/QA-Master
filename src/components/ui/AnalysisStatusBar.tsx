'use client';

import { useTestExecution } from '@/context/TestExecutionContext';
import { Loader2 } from 'lucide-react';

export function AnalysisStatusBar() {
    const { isExecuting } = useTestExecution();

    if (!isExecuting) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-3 bg-red-600 py-3 text-white shadow-lg animate-in slide-in-from-bottom duration-300">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="font-medium">
                Analizando Historia de Usuario... Por favor espere.
            </span>
        </div>
    );
}
