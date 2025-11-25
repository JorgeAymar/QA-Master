import { Dictionary } from '@/lib/dictionaries';

export function Header({ dict }: { dict: Dictionary }) {
    return (
        <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
            <h1 className="text-lg font-semibold text-slate-900">{dict.sidebar.dashboard}</h1>
            <div className="flex items-center gap-4">
                {/* Add user menu or notifications here later */}
            </div>
        </header>
    );
}
