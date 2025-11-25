import { ActivityLog } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import {
    PlusCircle,
    Trash2,
    Play,
    FileText,
    Activity,
    CheckCircle,
    XCircle
} from 'lucide-react';

interface ActivityFeedProps {
    activities: ActivityLog[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
    if (activities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-slate-50 p-3 mb-3">
                    <Activity className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-sm font-medium text-slate-900">No recent activity</h3>
                <p className="mt-1 text-xs text-slate-500">
                    Actions performed in your projects will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="flow-root">
            <ul role="list" className="-mb-8">
                {activities.map((activity, activityIdx) => {
                    const isLast = activityIdx === activities.length - 1;

                    return (
                        <li key={activity.id}>
                            <div className="relative pb-8">
                                {!isLast ? (
                                    <span
                                        className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200"
                                        aria-hidden="true"
                                    />
                                ) : null}
                                <div className="relative flex space-x-3">
                                    <div>
                                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getActivityColor(activity.action)
                                            }`}>
                                            {getActivityIcon(activity.action)}
                                        </span>
                                    </div>
                                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                        <div>
                                            <p className="text-sm text-slate-500">
                                                {getActivityMessage(activity)}
                                            </p>
                                        </div>
                                        <div className="whitespace-nowrap text-right text-xs text-slate-500">
                                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

function getActivityIcon(action: string) {
    switch (action) {
        case 'CREATE':
            return <PlusCircle className="h-5 w-5 text-white" />;
        case 'DELETE':
            return <Trash2 className="h-5 w-5 text-white" />;
        case 'EXECUTE':
            return <Play className="h-5 w-5 text-white" />;
        case 'VIEW_REPORT':
            return <FileText className="h-5 w-5 text-white" />;
        default:
            return <Activity className="h-5 w-5 text-white" />;
    }
}

function getActivityColor(action: string) {
    switch (action) {
        case 'CREATE':
            return 'bg-green-500';
        case 'DELETE':
            return 'bg-red-500';
        case 'EXECUTE':
            return 'bg-blue-500';
        case 'VIEW_REPORT':
            return 'bg-slate-500';
        default:
            return 'bg-slate-400';
    }
}

function getActivityMessage(activity: ActivityLog) {
    const { action, entityType, entityName } = activity;

    const actionText = {
        'CREATE': 'Created',
        'DELETE': 'Deleted',
        'EXECUTE': 'Executed tests for',
        'VIEW_REPORT': 'Viewed report for'
    }[action] || action;

    const typeText = {
        'STORY': 'user story',
        'FEATURE': 'feature',
        'PROJECT': 'project'
    }[entityType] || entityType.toLowerCase();

    return (
        <>
            {actionText} {typeText} <span className="font-medium text-slate-900">{entityName}</span>
        </>
    );
}
