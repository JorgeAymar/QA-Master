'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Upload, FileText, CheckCircle, AlertCircle, Trash2, Folder } from 'lucide-react';

interface ImportStoriesModalProps {
    projectId: string;
    isOpen: boolean;
    onClose: () => void;
    dict: any;
}

export function ImportStoriesModal({ projectId, isOpen, onClose, dict }: ImportStoriesModalProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<'idle' | 'review' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [folderName, setFolderName] = useState('');
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Helper to extract feature name for display
    const getFeatureName = (path: string) => {
        const parts = path.split('/');
        return parts.length > 1 ? parts[parts.length - 2] : 'Imported';
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const newFiles = Array.from(e.target.files);

        // Extract folder name from the first file if available and not set
        if (newFiles.length > 0 && newFiles[0].webkitRelativePath) {
            const parts = newFiles[0].webkitRelativePath.split('/');
            if (parts.length > 1) {
                setFolderName(parts[0]);
            }
        }

        setSelectedFiles(prev => {
            const combined = [...prev, ...newFiles];
            // Sort alphabetically by name
            return combined.sort((a, b) => a.name.localeCompare(b.name));
        });
        setStatus('review');

        // Reset input so same files can be selected again if needed
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        if (selectedFiles.length <= 1) {
            setStatus('idle');
            setFolderName('');
        }
    };

    const startUpload = () => {
        if (selectedFiles.length === 0) return;
        uploadFiles(selectedFiles);
    };

    const uploadFiles = (files: File[]) => {
        setIsUploading(true);
        setStatus('uploading');
        setProgress(0);
        setErrorMessage('');

        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
            // Always append a path to keep arrays aligned in backend
            // Use webkitRelativePath if available (folder upload), otherwise fallback to name
            formData.append('paths', file.webkitRelativePath || file.name);
        });

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded / event.total) * 100);
                setProgress(percentComplete);
                if (percentComplete === 100) {
                    setStatus('processing');
                }
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                const response = JSON.parse(xhr.responseText);
                if (response.count === 0) {
                    setStatus('error');
                    setErrorMessage('No stories were created. Please check if files are valid text or Word documents.');
                } else {
                    setStatus('success');
                    setProgress(100);
                    router.refresh();
                    setTimeout(() => {
                        onClose();
                        resetState();
                    }, 2000);
                }
            } else {
                setStatus('error');
                setErrorMessage(dict.project.importError || 'Upload failed');
            }
            setIsUploading(false);
        });

        xhr.addEventListener('error', () => {
            setStatus('error');
            setErrorMessage(dict.project.importError || 'Network error');
            setIsUploading(false);
        });

        xhr.open('POST', `/api/projects/${projectId}/import`);
        xhr.send(formData);
    };

    const resetState = () => {
        setStatus('idle');
        setProgress(0);
        setErrorMessage('');
        setSelectedFiles([]);
        setFolderName('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleClose = () => {
        if (isUploading) return;
        onClose();
        resetState();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={folderName ? `${dict.project.import || 'Import Stories'} - ${folderName}` : (dict.project.import || 'Import Stories')}
        >
            <div className="p-6 space-y-6">
                {status === 'idle' && (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-10 hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="h-10 w-10 text-slate-400 mb-4" />
                        <p className="text-sm font-medium text-slate-900">
                            Click to select folder
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            Select a folder containing your story files (txt, md, docx)
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            // @ts-ignore
                            webkitdirectory=""
                            multiple
                            onChange={handleFileSelect}
                        />
                    </div>
                )}

                {status === 'review' && (
                    <div className="flex flex-col h-[60vh]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-slate-700">
                                Selected Files ({selectedFiles.length})
                            </h3>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                                + Add more
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto border border-slate-200 rounded-md bg-slate-50 p-2 space-y-2">
                            {selectedFiles.map((file, index) => {
                                const path = file.webkitRelativePath || file.name;
                                const featureName = getFeatureName(path);

                                return (
                                    <div key={`${file.name}-${index}`} className="flex items-center justify-between bg-white p-3 rounded shadow-sm border border-slate-100 group">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <FileText className="h-8 w-8 text-slate-400 flex-shrink-0" />
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-medium text-slate-700 truncate" title={file.name}>
                                                    {file.name}
                                                </span>
                                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                                    <Folder className="h-3 w-3" />
                                                    <span className="truncate" title={`Feature: ${featureName}`}>
                                                        Feature: {featureName}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeFile(index)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all opacity-100"
                                            title="Remove file"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 flex items-center gap-3">
                            <button
                                onClick={resetState}
                                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={startUpload}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm"
                            >
                                Import {selectedFiles.length} Files
                            </button>
                        </div>
                    </div>
                )}

                {(status === 'uploading' || status === 'processing') && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                            <span>{status === 'uploading' ? (dict.project.importing || 'Uploading...') : 'Processing...'}</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        {status === 'processing' && (
                            <p className="text-xs text-slate-500 text-center animate-pulse">
                                Analyzing files and creating stories...
                            </p>
                        )}
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center justify-center py-6 text-green-600">
                        <CheckCircle className="h-12 w-12 mb-3" />
                        <p className="font-medium">{dict.project.importSuccess || 'Import successful!'}</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center justify-center py-6 text-red-600">
                        <AlertCircle className="h-12 w-12 mb-3" />
                        <p className="font-medium">{errorMessage}</p>
                        <button
                            onClick={resetState}
                            className="mt-4 px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors text-sm font-medium"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
}
