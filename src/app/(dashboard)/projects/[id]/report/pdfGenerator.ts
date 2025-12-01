import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Dictionary } from '@/lib/dictionaries';

// Register fonts
// Register fonts
try {
    // @ts-ignore
    if (pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
        // @ts-ignore
        pdfMake.vfs = pdfFonts.pdfMake.vfs;
    } else if (pdfFonts && (pdfFonts as any).vfs) {
        // @ts-ignore
        pdfMake.vfs = (pdfFonts as any).vfs;
    } else {
        console.warn('Could not find vfs in pdfFonts', pdfFonts);
        // Fallback for some build environments
        // @ts-ignore
        if (window && (window as any).pdfMake) {
            // @ts-ignore
            pdfMake.vfs = (window as any).pdfMake.vfs;
        }
    }
} catch (error) {
    console.error('Error registering pdfmake fonts:', error);
}

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

interface GenerateReportProps {
    project: { name: string; baseUrl: string };
    stories: StoryWithResults[];
    dict: Dictionary;
    generatedAt: string;
}

export const generateReportPDF = ({ project, stories, dict, generatedAt }: GenerateReportProps) => {
    const content: any[] = [];

    // Header
    content.push({ text: 'Analisis QA', style: 'header' });
    content.push({ text: project.name, style: 'subheader' });
    content.push({ text: `${dict.dashboard.lastUpdate} ${generatedAt}`, style: 'meta' });
    content.push({ text: project.baseUrl, style: 'meta', margin: [0, 0, 0, 20] });

    // Stories
    stories.forEach((story, index) => {
        const lastResult = story.testResults[0];
        const showFeatureTitle = index === 0 || (story.feature && stories[index - 1].feature?.name !== story.feature.name);

        // Feature Title
        if (showFeatureTitle && story.feature) {
            content.push({
                text: story.feature.name.toUpperCase(),
                style: 'featureTitle',
                pageBreak: index !== 0 ? 'before' : undefined // Start new feature on new page
            });
        }

        // Story Container
        const storyStack: any[] = [];

        // Title and Status
        const statusText = lastResult ? lastResult.status : dict.project.pending;
        const statusColor = lastResult?.status === 'PASS' ? '#166534' : lastResult?.status === 'FAIL' ? '#991B1B' : '#92400E';
        const statusBg = lastResult?.status === 'PASS' ? '#DCFCE7' : lastResult?.status === 'FAIL' ? '#FEE2E2' : '#FEF3C7';

        storyStack.push({
            columns: [
                { text: story.title, style: 'storyTitle', width: '*' },
                {
                    text: statusText,
                    style: 'statusBadge',
                    color: statusColor,
                    background: statusBg,
                    width: 'auto'
                }
            ],
            margin: [0, 0, 0, 5]
        });

        // Criteria
        storyStack.push({ text: story.acceptanceCriteria, style: 'criteria' });

        // Date Info
        if (lastResult) {
            storyStack.push({
                text: `Inicio: ${lastResult.testRun.createdAt} | Fin: ${lastResult.testRun.completedAt || lastResult.createdAt}`,
                style: 'dateInfo'
            });
        }

        // Logs
        if (lastResult && lastResult.logs) {
            storyStack.push({
                table: {
                    widths: ['*'],
                    body: [
                        [
                            {
                                stack: [
                                    { text: 'LOGS:', bold: true, fontSize: 8, margin: [0, 0, 0, 2] },
                                    { text: lastResult.logs, style: 'logText' }
                                ],
                                fillColor: '#F9FAFB',
                                borderColor: ['#E5E7EB', '#E5E7EB', '#E5E7EB', '#E5E7EB']
                            }
                        ]
                    ]
                },
                layout: 'noBorders', // We handle borders in the cell
                margin: [0, 5, 0, 0]
            });
        }

        // Screenshot
        if (lastResult && lastResult.screenshot) {
            storyStack.push({
                image: lastResult.screenshot,
                width: 400, // Adjust as needed
                margin: [0, 20, 0, 0] // Increased spacing
            });
        }

        // Add story to content with spacing
        content.push({
            stack: storyStack,
            margin: [0, 0, 0, 20],
            unbreakable: false // Allow breaking across pages
        });

        // Separator line
        content.push({
            canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#E5E7EB' }],
            margin: [0, 0, 0, 20]
        });
    });

    const docDefinition = {
        content: content,
        footer: (currentPage: number, pageCount: number) => {
            return {
                text: `Página ${currentPage} de ${pageCount} - Generado por QA Master`,
                alignment: 'center',
                style: 'footer',
                margin: [0, 10, 0, 0]
            } as any;
        },
        styles: {
            header: {
                fontSize: 22,
                bold: true,
                color: '#111827',
                margin: [0, 0, 0, 5]
            },
            subheader: {
                fontSize: 14,
                color: '#4B5563',
                margin: [0, 0, 0, 5]
            },
            meta: {
                fontSize: 10,
                color: '#6B7280',
                margin: [0, 0, 0, 2]
            },
            featureTitle: {
                fontSize: 14,
                bold: true,
                color: '#111827',
                background: '#F3F4F6',
                margin: [0, 10, 0, 15],
                padding: 5
            },
            storyTitle: {
                fontSize: 12,
                bold: true,
                color: '#1F2937'
            },
            statusBadge: {
                fontSize: 10,
                bold: true,
                margin: [5, 0, 0, 0]
            },
            criteria: {
                fontSize: 10,
                color: '#4B5563',
                margin: [0, 5, 0, 5],
                lineHeight: 1.4
            },
            dateInfo: {
                fontSize: 8,
                color: '#9CA3AF',
                margin: [0, 0, 0, 5]
            },
            logText: {
                fontSize: 8,
                color: '#1F2937'
            },
            footer: {
                fontSize: 8,
                color: '#9CA3AF'
            }
        },
        defaultStyle: {
            font: 'Roboto'
        }
    };

    const baseName = stories.length > 0 ? stories[0].title : project.name;
    const sanitizedName = baseName.replace(/[^a-zA-Z0-9]/g, '-');
    const filename = `QA-Report-${sanitizedName}.pdf`;
    pdfMake.createPdf(docDefinition as any).download(filename);
};
