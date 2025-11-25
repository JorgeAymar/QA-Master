'use client';

import { useState } from 'react';
import { DndContext, DragOverlay, useDraggable, useDroppable, DragEndEvent, DragStartEvent, DragOverEvent, closestCorners, PointerSensor, useSensor, useSensors, defaultDropAnimationSideEffects, DropAnimation } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FeatureGroup } from '@/components/features/FeatureGroup';
import { StoryCard } from '@/components/stories/StoryCard';
import { moveStory, reorderStories } from '@/app/actions/stories';
import { reorderFeatures } from '@/app/actions/features';
import { Dictionary } from '@/lib/dictionaries';
import { LayoutDashboard } from 'lucide-react';

interface TestResult {
    status: string;
    logs: string | null;
}

interface Feature {
    id: string;
    name: string;
    order: number;
}

interface StoryWithResults {
    id: string;
    title: string;
    acceptanceCriteria: string;
    status: string;
    testResults: TestResult[];
    featureId: string | null;
    order: number;
}

interface ProjectBoardProps {
    initialStories: StoryWithResults[];
    features: Feature[];
    projectId: string;
    dict: Dictionary;
}

const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: '0.5',
            },
        },
    }),
};

export function ProjectBoard({ initialStories, features: initialFeatures, projectId, dict }: ProjectBoardProps) {
    const [stories, setStories] = useState(initialStories.sort((a, b) => a.order - b.order));
    const [features, setFeatures] = useState(initialFeatures.sort((a, b) => a.order - b.order));
    const [activeStory, setActiveStory] = useState<StoryWithResults | null>(null);
    const [activeFeature, setActiveFeature] = useState<Feature | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // Group stories by feature
    const storiesByFeature: Record<string, StoryWithResults[]> = {};
    const uncategorizedStories: StoryWithResults[] = [];

    stories.forEach(story => {
        if (story.featureId) {
            if (!storiesByFeature[story.featureId]) {
                storiesByFeature[story.featureId] = [];
            }
            storiesByFeature[story.featureId].push(story);
        } else {
            uncategorizedStories.push(story);
        }
    });

    // Sort grouped stories
    Object.keys(storiesByFeature).forEach(featureId => {
        storiesByFeature[featureId].sort((a, b) => a.order - b.order);
    });
    uncategorizedStories.sort((a, b) => a.order - b.order);

    function findContainer(id: string) {
        if (id === 'uncategorized') return 'uncategorized';
        if (features.find(f => f.id === id)) return id;

        const story = stories.find(s => s.id === id);
        if (story) {
            return story.featureId || 'uncategorized';
        }
        return null;
    }

    function handleDragStart(event: DragStartEvent) {
        const { active } = event;
        const story = stories.find(s => s.id === active.id);
        if (story) {
            setActiveStory(story);
            return;
        }

        const feature = features.find(f => f.id === active.id);
        if (feature) {
            setActiveFeature(feature);
        }
    }

    function handleDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;

        // If dragging a feature, do nothing in drag over
        if (activeFeature) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeContainer = findContainer(activeId);
        const overContainer = findContainer(overId);

        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            return;
        }

        setStories((prev) => {
            const activeItems = prev.filter(s => (s.featureId || 'uncategorized') === activeContainer);
            const overItems = prev.filter(s => (s.featureId || 'uncategorized') === overContainer);

            const activeIndex = activeItems.findIndex(s => s.id === activeId);
            const overIndex = overItems.findIndex(s => s.id === overId);

            let newIndex;
            if (overId === overContainer) {
                newIndex = overItems.length + 1;
            } else {
                const isBelowOverItem =
                    over &&
                    active.rect.current.translated &&
                    active.rect.current.translated.top > over.rect.top + over.rect.height;

                const modifier = isBelowOverItem ? 1 : 0;
                newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
            }

            return prev.map(story => {
                if (story.id === activeId) {
                    return {
                        ...story,
                        featureId: overContainer === 'uncategorized' ? null : overContainer,
                        order: newIndex // Temporary order
                    };
                }
                return story;
            });
        });
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (activeFeature && over) {
            const activeIndex = features.findIndex(f => f.id === active.id);
            const overIndex = features.findIndex(f => f.id === over.id);

            if (activeIndex !== overIndex) {
                const newFeatures = arrayMove(features, activeIndex, overIndex);

                const updates = newFeatures.map((f, index) => ({
                    id: f.id,
                    order: index
                }));

                const updatedFeatures = newFeatures.map(f => {
                    const update = updates.find(u => u.id === f.id);
                    return update ? { ...f, order: update.order } : f;
                });

                setFeatures(updatedFeatures);
                await reorderFeatures(updates, projectId);
            }
            setActiveFeature(null);
            return;
        }

        const activeId = active.id as string;
        const overId = over ? (over.id as string) : null;

        const activeContainer = findContainer(activeId);
        const overContainer = overId ? findContainer(overId) : null;

        if (activeContainer && overContainer && activeContainer === overContainer) {
            const activeIndex = stories.findIndex(s => s.id === activeId);
            const overIndex = stories.findIndex(s => s.id === overId);

            if (activeIndex !== overIndex) {
                const newStories = arrayMove(stories, activeIndex, overIndex);

                // Re-calculate orders for the affected container
                const containerStories = newStories.filter(s => (s.featureId || 'uncategorized') === activeContainer);
                const updates = containerStories.map((s, index) => ({
                    id: s.id,
                    order: index
                }));

                // Update local state with correct orders
                const updatedStories = newStories.map(s => {
                    const update = updates.find(u => u.id === s.id);
                    return update ? { ...s, order: update.order } : s;
                });

                setStories(updatedStories);
                await reorderStories(updates, projectId);
            }
        } else if (activeContainer && overContainer && activeContainer !== overContainer) {
            // Moved to another container (handled in DragOver mostly, just finalize here)
            const containerStories = stories.filter(s => (s.featureId || 'uncategorized') === overContainer);
            const updates = containerStories.map((s, index) => ({
                id: s.id,
                order: index
            }));

            await reorderStories(updates, projectId);

            // Also ensure the move is persisted if it wasn't by reorder
            const story = stories.find(s => s.id === activeId);
            if (story) {
                await moveStory(story.id, story.featureId, projectId);
            }
        }

        setActiveStory(null);
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
        >
            <div className="space-y-8">
                <SortableContext
                    items={features.map(f => f.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {features.map((feature) => (
                        <SortableFeatureGroup
                            key={feature.id}
                            id={feature.id}
                            feature={feature}
                            projectId={projectId}
                            storyCount={storiesByFeature[feature.id]?.length || 0}
                            dict={dict}
                        >
                            <SortableContext
                                items={storiesByFeature[feature.id]?.map(s => s.id) || []}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="grid grid-cols-1 gap-4 min-h-[60px]">
                                    {storiesByFeature[feature.id]?.map(story => (
                                        <SortableStoryCard key={story.id} story={story} projectId={projectId} dict={dict} />
                                    ))}
                                </div>
                            </SortableContext>
                            {(!storiesByFeature[feature.id] || storiesByFeature[feature.id].length === 0) && (
                                <p className="text-sm text-slate-400 italic">No stories in this feature yet.</p>
                            )}
                        </SortableFeatureGroup>
                    ))}
                </SortableContext>

                <DroppableArea id="uncategorized" className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="mb-4 flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-slate-900">{dict.project.uncategorized}</h3>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                            {uncategorizedStories.length} stories
                        </span>
                    </div>
                    <SortableContext
                        items={uncategorizedStories.map(s => s.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="grid grid-cols-1 gap-4 min-h-[60px]">
                            {uncategorizedStories.map(story => (
                                <SortableStoryCard key={story.id} story={story} projectId={projectId} dict={dict} />
                            ))}
                        </div>
                    </SortableContext>
                </DroppableArea>

                {stories.length === 0 && features.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white p-16 text-center">
                        <div className="rounded-full bg-slate-50 p-4 mb-4">
                            <LayoutDashboard className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">Start by creating a feature</h3>
                        <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
                            Features help you organize your user stories. Create one using the form on the left.
                        </p>
                    </div>
                )}
            </div>

            <DragOverlay dropAnimation={dropAnimation}>
                {activeStory ? (
                    <div className="opacity-80 rotate-2 scale-105 cursor-grabbing">
                        <StoryCard story={activeStory} projectId={projectId} dict={dict} />
                    </div>
                ) : activeFeature ? (
                    <div className="opacity-80 rotate-2 scale-105 cursor-grabbing">
                        <FeatureGroup feature={activeFeature} projectId={projectId} storyCount={storiesByFeature[activeFeature.id]?.length || 0} dict={dict}>
                            <div className="h-20 bg-slate-50 rounded border border-dashed border-slate-200"></div>
                        </FeatureGroup>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

function SortableStoryCard({ story, projectId, dict }: { story: StoryWithResults, projectId: string, dict: Dictionary }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: story.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={isDragging ? 'opacity-30' : ''}>
            <StoryCard story={story} projectId={projectId} dict={dict} />
        </div>
    );
}

function SortableFeatureGroup({ id, children, ...props }: any) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    // We also need to be droppable for stories
    const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({ id });

    return (
        <div ref={setNodeRef} style={style} className={isDragging ? 'opacity-50' : ''}>
            <div ref={setDroppableNodeRef} className={`transition-colors ${isOver ? 'bg-blue-50/50 ring-2 ring-blue-200 rounded-lg' : ''}`}>
                <FeatureGroup {...props} dragHandleProps={{ ...attributes, ...listeners }}>
                    {children}
                </FeatureGroup>
            </div>
        </div>
    );
}

function DroppableArea({ id, children, className }: { id: string, children: React.ReactNode, className?: string }) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div ref={setNodeRef} className={`${className} transition-colors ${isOver ? 'bg-blue-50/50 ring-2 ring-blue-200' : ''}`}>
            {children}
        </div>
    );
}
