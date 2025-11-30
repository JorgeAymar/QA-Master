'use client';

import { useState, useRef } from 'react';
import { Download, ZoomIn, ZoomOut, Loader2, CheckCircle, XCircle, Clock, Wand2 } from 'lucide-react';
import { Dictionary } from '@/lib/dictionaries';
import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

interface TestResult {
    status: string;
    logs: string | null;
    screenshot: string | null;
    createdAt: string;
    testRun: {
        createdAt: string;
        completedAt: string | null;
    };
}

interface StoryWithResults {
    id: string;
    title: string;
    acceptanceCriteria: string;
    status: string;
    testResults: TestResult[];
    feature: { name: string } | null;
}

interface ReportContentProps {
    project: {
        name: string;
        baseUrl: string;
    };
    stories: StoryWithResults[];
    stats: {
        total: number;
        passed: number;
        coverage: number;
    };
    dict: Dictionary;
    generatedAt: string;
}

export function ReportContent({ project, stories, stats, dict, generatedAt }: ReportContentProps) {
    const [fontSize, setFontSize] = useState(12); // Default font size for logs
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [isFormatted, setIsFormatted] = useState(false); // State for text formatting
    const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
    const reportRef = useRef<HTMLDivElement>(null);

    const handleImageError = (url: string) => {
        setBrokenImages(prev => ({ ...prev, [url]: true }));
    };

    const cleanText = (text: string) => {
        if (!isFormatted) return text;

        let cleaned = text;

        // 1. Normalize line endings and trim each line
        cleaned = cleaned.split('\n').map(line => line.trim()).join('\n');

        // 2. Fix broken lines (hard wraps):
        // Join lines where the first does NOT end with sentence punctuation and the next starts with lowercase
        // This covers letters, numbers, commas, parenthesis, etc.
        cleaned = cleaned.replace(/([^\.\:;\!\?])\n([a-z\u00C0-\u00FF])/g, '$1 $2');

        // 3. Also join lines that end with common connectors, even if next line is uppercase (rare but possible)
        // connectors: y, e, o, u, que, de, a, en, con, por, para, sin, sobre
        cleaned = cleaned.replace(/(\b(y|e|o|u|que|de|a|en|con|por|para|sin|sobre))\n/gi, '$1 ');

        // 4. Ensure proper spacing for keywords
        // Add a blank line before major sections if they don't have one
        const keywords = ['Como:', 'Quiero:', 'Para:', 'Escenario:', 'Scenario:', 'Criterios de Aceptación:', 'Dado', 'Cuando', 'Entonces', 'Given', 'When', 'Then'];
        keywords.forEach(keyword => {
            // Regex to find the keyword at the start of a line (preceded by newline)
            // and ensure it has a double newline before it
            const regex = new RegExp(`\n\\s*(${keyword})`, 'g');
            cleaned = cleaned.replace(regex, '\n\n$1');
        });

        // 4. Collapse excessive newlines (max 2 newlines = 1 empty line)
        cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

        return cleaned.trim();
    };

    const handlePrint = () => {
        window.print();
    };

    const embedImages = async (element: HTMLElement) => {
        console.log('Starting embedImages...');
        const images = element.querySelectorAll('img');
        console.log(`Found ${images.length} images to process.`);

        const promises = Array.from(images).map(async (img, index) => {
            const src = img.src;
            if (src.startsWith('data:')) return; // Already base64

            try {
                console.log(`Processing image ${index + 1}: ${src}`);

                // Create a timeout promise
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout')), 5000)
                );

                // Fetch with timeout
                const response = await Promise.race([
                    fetch(src, { mode: 'cors' }),
                    timeoutPromise
                ]) as Response;

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const blob = await response.blob();

                // Convert to base64
                const reader = new FileReader();
                await new Promise((resolve, reject) => {
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                }).then(dataUrl => {
                    img.dataset.originalSrc = src; // Save original src
                    img.src = dataUrl as string;
                    console.log(`Successfully embedded image ${index + 1}`);
                });
            } catch (e) {
                console.warn(`Failed to embed image ${index + 1} (${src}):`, e);
                // Replace with placeholder instead of hiding to preserve layout
                img.dataset.originalSrc = src;
                img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
            }
        });
        await Promise.all(promises);
        console.log('Finished embedImages.');

        return () => {
            // Cleanup function to restore original images
            images.forEach(img => {
                if (img.dataset.originalSrc) {
                    img.src = img.dataset.originalSrc;
                    delete img.dataset.originalSrc;
                }
            });
        };
    };

    const handleDownloadPDF = async () => {
        if (!reportRef.current) return;

        let cleanupImages: (() => void) | null = null;
        const hiddenElements: HTMLElement[] = [];

        try {
            console.log('Starting PDF generation process (Chunked Mode)...');
            setIsGeneratingPdf(true);
            const element = reportRef.current;

            // 1. Manually hide elements to avoid using the 'filter' function
            const ignoredElements = element.querySelectorAll('[data-html2canvas-ignore]');
            ignoredElements.forEach(el => {
                if (el instanceof HTMLElement) {
                    hiddenElements.push(el);
                    el.style.visibility = 'hidden';
                    el.style.position = 'absolute';
                }
            });

            // 2. Pre-process images
            cleanupImages = await embedImages(element);

            console.log('Creating jsPDF instance...');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const margin = 10;
            const contentWidth = pdfWidth - (margin * 2);
            const contentHeight = pdfHeight - (margin * 2);

            let currentY = margin;

            // 3. Find all sections to capture
            const sections = element.querySelectorAll('[data-pdf-section]');
            console.log(`Found ${sections.length} sections to capture.`);

            for (let i = 0; i < sections.length; i++) {
                const section = sections[i] as HTMLElement;
                console.log(`Processing section ${i + 1}/${sections.length}`);

                try {
                    const dataUrl = await toPng(section, {
                        cacheBust: false,
                        fontEmbedCSS: '',
                        backgroundColor: '#ffffff',
                        width: 1200, // Fixed width for consistency
                        style: {
                            width: '1200px',
                            maxWidth: 'none',
                            margin: '0'
                        }
                    });

                    const imgProperties = pdf.getImageProperties(dataUrl);
                    const imgHeight = (imgProperties.height * contentWidth) / imgProperties.width;

                    // Check if we need a new page
                    if (currentY + imgHeight > pdfHeight - margin) {
                        console.log('Adding new page...');
                        pdf.addPage();
                        currentY = margin;
                    }

                    console.log(`Adding image to PDF at Y=${currentY}`);
                    pdf.addImage(dataUrl, 'PNG', margin, currentY, contentWidth, imgHeight);
                    currentY += imgHeight + 5; // Add some spacing between sections

                } catch (sectionError) {
                    console.error(`Error capturing section ${i + 1}:`, sectionError);
                    // Continue to next section instead of failing completely
                }
            }

            // Determine filename
            const filename = stories.length === 1
                ? `${stories[0].title.replace(/[^a-z0-9]/gi, '_')}-Report.pdf`
                : `${project.name}-Report.pdf`;

            console.log('Saving PDF:', filename);
            pdf.save(filename);
            console.log('PDF saved successfully.');
        } catch (error: any) {
            console.error('Error generating PDF:', error);

            // Enhanced error logging
            const errorDetails = {};
            Object.getOwnPropertyNames(error).forEach(key => {
                // @ts-ignore
                errorDetails[key] = error[key];
            });
            console.error('Detailed error object:', JSON.stringify(errorDetails, null, 2));

            let errorMessage = error?.message || error?.toString();
            if (error instanceof Event) errorMessage = 'Error loading resources (images/fonts)';
            if (!errorMessage || errorMessage === '{}' || errorMessage === '[object Object]') {
                errorMessage = 'Unknown error (check console for details)';
            }
            alert(`Error generating PDF: ${errorMessage}`);
        } finally {
            if (cleanupImages) cleanupImages();
            // Restore hidden elements
            hiddenElements.forEach(el => {
                el.style.visibility = '';
                el.style.position = '';
            });
            setIsGeneratingPdf(false);
        }
    };

    return (
        <div ref={reportRef} className="mx-auto max-w-4xl space-y-8 bg-white p-8 print:p-0">
            <div data-pdf-section className="border-b border-slate-200 pb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Analisis QA</h1>
                    <h2 className="text-3xl font-bold text-slate-900 mt-1">{project.name}</h2>
                    <p className="mt-2 text-slate-500">{dict.dashboard.lastUpdate} {generatedAt}</p>
                    <p className="text-sm text-slate-400">{project.baseUrl}</p>
                </div>
                <div className="print:hidden flex items-center gap-2" data-html2canvas-ignore>
                    <button
                        onClick={() => setIsFormatted(!isFormatted)}
                        className={`p-2 rounded-md transition-colors ${isFormatted ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                        title="Formato de texto inteligente"
                    >
                        <Wand2 className="w-5 h-5" />
                        <span className="ml-2 text-sm font-medium">Formato</span>
                    </button>
                    <div className="flex items-center gap-1 bg-slate-100 rounded-md p-1">
                        <button
                            onClick={() => setFontSize(Math.max(10, fontSize - 1))}
                            className="p-1 hover:bg-white rounded text-slate-500"
                            title="Disminuir fuente"
                        >
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-medium w-6 text-center">{fontSize}</span>
                        <button
                            onClick={() => setFontSize(Math.min(16, fontSize + 1))}
                            className="p-1 hover:bg-white rounded text-slate-500"
                            title="Aumentar fuente"
                        >
                            <ZoomIn className="w-4 h-4" />
                        </button>
                    </div>
                    <button
                        onClick={handleDownloadPDF}
                        disabled={isGeneratingPdf}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGeneratingPdf ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                        PDF
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {stories.map((story) => {
                    const lastResult = story.testResults[0];
                    
                    return (
                        <div key={story.id} data-pdf-section className="break-inside-avoid border-b border-slate-100 pb-8 last:border-0">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    {story.feature && (
                                        <p className="text-lg font-bold text-blue-600 uppercase tracking-wider mb-2">
                                            {story.feature.name}
                                        </p>
                                    )}
                                    <h3 className="font-medium text-slate-900">{story.title}</h3>
                    <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">{cleanText(story.acceptanceCriteria)}</p>
                </div>
                <div className="ml-4 flex-shrink-0">
                    {lastResult ? (
                        <div className="flex flex-col items-end gap-1">
                            <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${lastResult.status === 'PASS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {lastResult.status === 'PASS' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                {lastResult.status}
                            </div>
                            <div className="flex flex-col items-end text-xs text-slate-500">
                                <span>
                                    Inicio: {lastResult.testRun.createdAt}
                                </span>
                                <span>
                                    Término: {lastResult.testRun.completedAt || lastResult.createdAt}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                            <Clock className="h-4 w-4" />
                            {dict.project.pending}
                        </div>
                    )}
                </div>
            </div>
            {lastResult && lastResult.logs && (
                <div
                    className="mt-2 rounded bg-slate-50 p-2 font-mono text-slate-600 whitespace-pre-wrap transition-all duration-200"
                    style={{ fontSize: `${fontSize}px`, lineHeight: '1.5' }}
                >
                    <span className="font-bold">{dict.report.logs}:</span>
                    {lastResult.logs}
                </div>
            )}
            {lastResult && lastResult.screenshot && !brokenImages[lastResult.screenshot] && (
                <div className="mt-4">
                    <p className="text-xs font-medium text-slate-500 mb-2">{dict.report.testScreenshot}:</p>
                    <img
                        src={lastResult.screenshot}
                        alt="Test Screenshot"
                        className="rounded border border-slate-200 max-w-full h-auto shadow-sm"
                        onError={() => lastResult.screenshot && handleImageError(lastResult.screenshot)}
                    />
                </div>
            )}
            {lastResult && lastResult.screenshot && brokenImages[lastResult.screenshot] && (
                <div className="mt-4 p-4 bg-slate-50 rounded border border-slate-200 text-center">
                    <p className="text-sm text-slate-400 italic">Imagen no disponible</p>
                </div>
            )}
        </div>
    );
})}
                </div >
            </div >
    <div data-pdf-section className="mt-8 pt-6 border-t border-slate-200 text-center text-sm text-slate-500">
        <p>Generado por <span className="font-bold text-blue-600">QA Master</span></p>
    </div>
        </div >
    );
}
```
