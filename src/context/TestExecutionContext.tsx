'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TestExecutionContextType {
    isExecuting: boolean;
    setIsExecuting: (value: boolean) => void;
}

const TestExecutionContext = createContext<TestExecutionContextType | undefined>(undefined);

export function TestExecutionProvider({ children }: { children: ReactNode }) {
    const [isExecuting, setIsExecuting] = useState(false);

    return (
        <TestExecutionContext.Provider value={{ isExecuting, setIsExecuting }}>
            {children}
        </TestExecutionContext.Provider>
    );
}

export function useTestExecution() {
    const context = useContext(TestExecutionContext);
    if (context === undefined) {
        throw new Error('useTestExecution must be used within a TestExecutionProvider');
    }
    return context;
}
