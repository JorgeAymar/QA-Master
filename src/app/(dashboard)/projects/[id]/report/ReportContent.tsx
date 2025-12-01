'use client';

import { useState, useRef } from 'react';
import { Download, ZoomIn, ZoomOut, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { Dictionary } from '@/lib/dictionaries';
import { generateReportPDF } from './pdfGenerator';
import styles from './report.module.css';

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
    project: { name: string; baseUrl: string };
    stories: StoryWithResults[];
    stats: { total: number; passed: number; coverage: number };
    dict: Dictionary;
    generatedAt: string;
}

export function ReportContent({ project, stories, dict, generatedAt }: ReportContentProps) {
    const [fontSize, setFontSize] = useState(12);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    const generatePDF = async () => {
        setIsGeneratingPdf(true);
        try {
            await generateReportPDF({ project, stories, dict, generatedAt });
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    return (
        <div className={styles['report-container']}>
            {/* Toolbar */}
            <div className={styles['report-toolbar']}>
                <div className={styles['toolbar-controls']}>
                    <button
                        onClick={() => setFontSize(Math.max(10, fontSize - 1))}
                        title="Disminuir fuente"
                        className={styles['toolbar-btn']}
                    >
                        <ZoomOut size={20} />
                    </button>
                    <span className={styles['toolbar-size']}>{fontSize}</span>
                    <button
                        onClick={() => setFontSize(Math.min(16, fontSize + 1))}
                        title="Aumentar fuente"
                        className={styles['toolbar-btn']}
                    >
                        <ZoomIn size={20} />
                    </button>
                </div>
                <div className={styles['toolbar-divider']} />
                <button
                    onClick={generatePDF}
                    disabled={isGeneratingPdf}
                    className={styles['toolbar-download']}
                >
                    {isGeneratingPdf ? (
                        <Loader2 size={16} className={styles['animate-spin']} />
                    ) : (
                        <Download size={16} />
                    )}
                    Descargar PDF
                </button>
            </div>

            {/* Printable content */}
            <div ref={reportRef} className={styles['report-content']}>
                <section className={styles['report-section']} data-pdf-section>
                    <header className={styles['report-header']}>
                        <h1>Analisis QA</h1>
                        <h2>{project.name}</h2>
                        <p className={styles['report-meta']}>
                            {dict.dashboard.lastUpdate} {generatedAt}
                        </p>
                        <p className={styles['report-url']}>{project.baseUrl}</p>
                    </header>
                </section>

                <div className={styles['stories-list']}>
                    {stories.map(story => {
                        const lastResult = story.testResults[0];
                        return (
                            <article className={styles['story']} key={story.id} data-pdf-section>
                                <div className={styles['story-header']}>
                                    <div className={styles['story-info']}>
                                        {story.feature && (
                                            <p className={styles['story-feature']}>
                                                <strong>{story.feature.name}</strong>
                                            </p>
                                        )}
                                        <h3 className={styles['story-title']}>{story.title}</h3>
                                        <p className={styles['story-criteria']}>{story.acceptanceCriteria}</p>
                                    </div>
                                    <div className={styles['story-status']}>
                                        {lastResult ? (
                                            <div>
                                                <div
                                                    className={`${styles['status']} ${lastResult.status === 'PASS' ? styles['status-pass'] : styles['status-fail']
                                                        }`}
                                                >
                                                    {lastResult.status === 'PASS' ? (
                                                        <CheckCircle size={16} />
                                                    ) : (
                                                        <XCircle size={16} />
                                                    )}
                                                    {lastResult.status}
                                                </div>
                                                <div className={styles['status-dates']}>
                                                    <span className={styles['date-start']}>
                                                        Inicio: {lastResult.testRun.createdAt}
                                                    </span>
                                                    <span className={styles['date-end']}>
                                                        Término: {lastResult.testRun.completedAt || lastResult.createdAt}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={styles['status-pending']}>
                                                <Clock size={16} />
                                                {dict.project.pending}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {lastResult && lastResult.logs && (
                                    <div className={styles['log-block']}>
                                        <strong>{dict.report.logs}:</strong>
                                        <pre>{lastResult.logs}</pre>
                                    </div>
                                )}
                                {lastResult && lastResult.screenshot && (
                                    <div className={styles['screenshot-block']}>
                                        <strong>Captura de pantalla:</strong>
                                        <img
                                            src={lastResult.screenshot}
                                            alt="Test Screenshot"
                                            className={styles['report-screenshot']}
                                        />
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>

                <div className={styles['report-footer']} data-pdf-section>
                    <p>
                        Generado por <strong>QA Master</strong>
                    </p>
                </div>
            </div>
        </div>
    );
}
