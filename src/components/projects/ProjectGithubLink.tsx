'use client';

import { Github } from 'lucide-react';

interface ProjectGithubLinkProps {
    githubRepo: string;
}

export function ProjectGithubLink({ githubRepo }: ProjectGithubLinkProps) {
    return (
        <object className="relative z-10">
            <a
                href={`https://github.com/${githubRepo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-800 hover:text-white transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                <Github className="h-3.5 w-3.5" />
                <span>GitHub</span>
            </a>
        </object>
    );
}
