
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CRMProvider } from './context/CRMContext';
import { CRMPerformanceProvider } from './context/CRMPerformanceContext';
import { AuthProvider } from './context/AuthContext';
import { SystemProvider } from './context/SystemContext';
import { MainContent } from './components/app/MainContent';
import { GlobalErrorBoundary } from './components/ui/GlobalErrorBoundary';
import { APIProvider } from '@vis.gl/react-google-maps';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5, // 5 minutes
        },
    },
});

const API_KEY =
  (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
  '';

const App: React.FC = () => {
    const content = (
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
    );

    return (
        <GlobalErrorBoundary>
            {API_KEY ? (
                <APIProvider apiKey={API_KEY} solutionChannel="GMP_QB_addressselection_v4_cAC" version="weekly">
                    {content}
                </APIProvider>
            ) : content}
        </GlobalErrorBoundary>
    );
};

export default App;

