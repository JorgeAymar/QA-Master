import { Dictionary } from '@/lib/dictionaries';

export function Header({ dict }: { dict: Dictionary }) {
    return (
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-6 shadow-sm">
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{dict.sidebar.dashboard}</h1>
            <div className="flex items-center gap-4">
                {/* Add user menu or notifications here later */}
            </div>
        </header>
    );
}
