
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CRMProvider } from './context/CRMContext';
import { CRMPerformanceProvider } from './context/CRMPerformanceContext';
import { AuthProvider } from './context/AuthContext';
import { SystemProvider } from './context/SystemContext';
import { MainContent } from './components/app/MainContent';
import { CustomWebDialerIframe } from './components/widgets/telephony/CustomWebDialerIframe';
import { GlobalErrorBoundary } from './components/ui/GlobalErrorBoundary';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5, // 5 minutes
        },
    },
});


import { AutoScaler } from './components/layout/AutoScaler';
import { DLPWatermark } from './components/security/DLPWatermark';

const App: React.FC = () => {
    const content = (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <SystemProvider>
                    <CRMProvider>
                        <CRMPerformanceProvider>
                            <AutoScaler>
                                <DLPWatermark />
                                <MainContent />
                                <CustomWebDialerIframe />
                            </AutoScaler>
                        </CRMPerformanceProvider>
                    </CRMProvider>
                </SystemProvider>
            </AuthProvider>
        </QueryClientProvider>
    );

    return (
        <GlobalErrorBoundary>
            {content}
        </GlobalErrorBoundary>
    );
};

export default App;

