'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { getStoryHistory } from '@/app/actions/testing';
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import { Dictionary } from '@/lib/dictionaries';

interface StoryHistoryModalProps {
    storyId: string;
    isOpen: boolean;
    onClose: () => void;
    dict: Dictionary;
}

interface TestResultWithRun {
    id: string;
    status: string;
    logs: string | null;
    screenshot: string | null;
    createdAt: Date;
    testRun: {
        id: string;
        status: string;
    };
}

export function StoryHistoryModal({ storyId, isOpen, onClose, dict }: StoryHistoryModalProps) {
    const [history, setHistory] = useState<TestResultWithRun[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedResult, setExpandedResult] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            getStoryHistory(storyId)
                .then((data) => setHistory(data))
                .catch((err) => console.error('Failed to load history', err))
                .finally(() => setLoading(false));
        }
    }, [isOpen, storyId]);

    const toggleExpand = (id: string) => {
        setExpandedResult(expandedResult === id ? null : id);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Execution History">
            <div className="p-4 space-y-4">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center p-8 text-slate-500">
                        No execution history found.
                    </div>
                ) : (
                    history.map((result) => (
                        <div key={result.id} className="border border-slate-200 rounded-lg overflow-hidden">
                            <div
                                className="flex items-center justify-between p-4 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                                onClick={() => toggleExpand(result.id)}
                            >
                                <div className="flex items-center gap-3">
                                    {result.status === 'PASS' ? (
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-red-600" />
                                    )}
                                    <div>
                                        <p className={`font-medium ${result.status === 'PASS' ? 'text-green-700' : 'text-red-700'}`}>
                                            {result.status === 'PASS' ? dict.project.testPass : dict.project.testFail}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {new Date(result.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <button className="text-slate-400">
                                    {expandedResult === result.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                </button>
                            </div>

                            {expandedResult === result.id && (
                                <div className="p-4 border-t border-slate-200 bg-white space-y-4">
                                    {result.screenshot && (
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-900 mb-2">Screenshot</h4>
                                            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-slate-200">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={`data:image/png;base64,${result.screenshot}`}
                                                    alt="Test Screenshot"
                                                    className="object-contain w-full h-full"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {result.logs && (
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-900 mb-2 flex items-center gap-2">
                                                <Terminal className="h-4 w-4" />
                                                Logs & Reasoning
                                            </h4>
                                            <pre className="bg-slate-900 text-slate-50 p-3 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap font-mono">
                                                {result.logs}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </Modal>
    );
}
