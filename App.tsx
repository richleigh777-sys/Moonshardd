
import React from 'react';
import { CRMProvider } from './context/CRMContext';
import { CRMPerformanceProvider } from './context/CRMPerformanceContext';
import { AuthProvider } from './context/AuthContext';
import { SystemProvider } from './context/SystemContext';
import { MainContent } from './components/app/MainContent';
import { GlobalErrorBoundary } from './components/ui/GlobalErrorBoundary';

const App: React.FC = () => {
    return (
        <GlobalErrorBoundary>
            <AuthProvider>
                <SystemProvider>
                    <CRMProvider>
                        <CRMPerformanceProvider>
                            <MainContent />
                        </CRMPerformanceProvider>
                    </CRMProvider>
                </SystemProvider>
            </AuthProvider>
        </GlobalErrorBoundary>
    );
};

export default App;
