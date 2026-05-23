
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CRMProvider } from './context/CRMContext';
import { CRMPerformanceProvider } from './context/CRMPerformanceContext';
import { AuthProvider } from './context/AuthContext';
import { SystemProvider } from './context/SystemContext';
import { MainContent } from './components/app/MainContent';
import { GlobalErrorBoundary } from './components/ui/GlobalErrorBoundary';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5, // 5 minutes
        },
    },
});

const App: React.FC = () => {
    return (
        <GlobalErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <SystemProvider>
                        <CRMProvider>
                            <CRMPerformanceProvider>
                                <MainContent />
                            </CRMPerformanceProvider>
                        </CRMProvider>
                    </SystemProvider>
                </AuthProvider>
            </QueryClientProvider>
        </GlobalErrorBoundary>
    );
};

export default App;

