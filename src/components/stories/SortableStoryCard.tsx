'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { StoryCard } from '@/components/stories/StoryCard';
import { Dictionary } from '@/lib/dictionaries';

interface StoryWithResults {
    id: string;
    title: string;
    acceptanceCriteria: string;
    status: string;
    testResults: any[];
    featureId: string | null;
    order: number;
    documentUrl: string | null;
    createdBy?: { name: string | null } | null;
    updatedBy?: { name: string | null } | null;
    createdAt: Date;
    updatedAt: Date;
}

interface SortableStoryCardProps {
    story: StoryWithResults;
    projectId: string;
    dict: Dictionary;
    githubRepo?: string | null;
    userRole: string;
}

export function SortableStoryCard({ story, projectId, dict, githubRepo, userRole }: SortableStoryCardProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: story.id,
        disabled: userRole === 'READ' // Disable dragging if read-only
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={isDragging ? 'opacity-30' : ''}>
            <StoryCard story={story} projectId={projectId} dict={dict} githubRepo={githubRepo} userRole={userRole} />
        </div>
    );
}
