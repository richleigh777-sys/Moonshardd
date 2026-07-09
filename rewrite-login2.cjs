const fs = require('fs');

const code = `import * as React from 'react';
import { useState } from 'react';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/ui/Base';
import { User } from '../types';
import { sfx } from '../lib/soundService';
import { useAuth } from '../hooks/useAuth';
import { SYSTEM_ADMIN_ID } from '../constants';
import { CredentialsStage } from '../components/auth/login/CredentialsStage';
import { UplinkStage } from '../components/auth/login/UplinkStage';

interface LoginScreenProps {
    onLogin: (user: User) => void;
    isDbConnected: boolean;
    users: User[]; 
}

type LoginStep = 'credentials' | 'server';

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const { authenticate, authenticateRoot, login } = useAuth();
  
  const [step, setStep] = useState<LoginStep>('credentials');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  
  // Stored state between transitions
  const [tempUserId, setTempUserId] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  const handleCredentialsSubmit = async (u: string, p: string) => {
      const userId = u.trim();
      const password = p.trim();
      
      setError('');
      setIsProcessing(true);
      sfx.playSubmit();
      
      setTempUserId(userId);
      setTempPassword(password);

      try {
          await new Promise(r => setTimeout(r, 600));
          
          const rootResult = await authenticateRoot(userId, password);
          if (rootResult && 'user' in rootResult) {
              sfx.playSuccess();
              await login(rootResult.user, rootResult.sig);
              onLogin(rootResult.user);
          } else if (rootResult && 'error' in rootResult && userId === SYSTEM_ADMIN_ID) {
              setError(rootResult.error);
              sfx.playError();
              setIsProcessing(false);
          } else {
              setStep('server');
              setIsProcessing(false);
          }
      } catch {
          setStep('server');
          setIsProcessing(false);
      }
  };

  const handleServerConnect = async (companyId: string) => {
      setError('');
      setIsProcessing(true);
      sfx.playSubmit();

      try {
          await new Promise(r => setTimeout(r, 800)); 
          const result = await authenticate(tempUserId, tempPassword, companyId, "");
          if (result && 'user' in result) {
              const { user, sig } = result;
              sfx.playSuccess();
              await login(user, sig);
              onLogin(user);
          } else {
              throw new Error(result && 'error' in result ? result.error : 'Invalid Credentials');
          }
      } catch (err: any) {
          sfx.playError();
          setError(err.message || "Login Failed");
      } finally {
          setIsProcessing(false);
      }
  };

  // Neon Rhino Theme Overrides
  const neonTheme = {
      '--color-surface-main': '145 40% 6%', // Deep dark green/black
      '--color-surface-alt': '145 50% 8%', // Slightly lighter for inputs
      '--color-surface-canvas': '145 45% 4%', // Pure abyss
      '--color-border-subtle': '145 80% 20%', // Neon green borders
      '--color-text-primary': '145 20% 95%', // Almost white
      '--color-text-secondary': '145 40% 65%', // Muted green
      '--color-text-muted': '145 40% 40%', 
      '--color-accent-primary': '145 100% 45%', // Bright neon green!
  } as React.CSSProperties;

  return (
    <div 
        className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden font-sans"
        style={neonTheme}
    >
        {/* Deep immersive background */}
        <div className="absolute inset-0 bg-[#060c08] z-0"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0a1a12] via-[#060c08] to-black z-0 opacity-80"></div>
        
        {/* Floating Neon Accents */}
        <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none">
            <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px]"></div>
            <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px]"></div>
        </div>

        {/* Main Content Area */}
        <div className="relative z-20 flex flex-col items-center justify-center w-full max-w-md px-6">
            
            {/* Branding / Logo Area */}
            <div className="flex flex-col items-center justify-center mb-10 w-full animate-in slide-in-from-bottom-8 duration-700 fade-in">
                <div className="relative w-40 h-40 mb-6">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse"></div>
                    <img 
                        src="/logo.jpg" 
                        alt="My Pipe Logo" 
                        className="w-full h-full object-cover rounded-full shadow-[0_0_50px_rgba(16,185,129,0.3)] border-2 border-emerald-500/50 relative z-10"
                    />
                </div>
                <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-2xl text-center">
                    MY <span className="text-emerald-400">PIPE</span>
                </h1>
                <p className="text-emerald-500/80 mt-2 text-xs font-bold tracking-[0.2em] uppercase text-center">
                    Enterprise CRM Vanguard
                </p>
            </div>

            {/* Login Card */}
            <Card 
                variant="panel" 
                className="w-full p-0 overflow-hidden flex flex-col shadow-[0_0_40px_rgba(16,185,129,0.15)] border border-emerald-500/30 bg-[#09140c]/90 backdrop-blur-2xl animate-in zoom-in-95 duration-500 delay-150"
            >
                {/* Header */}
                <div className="p-6 flex flex-col items-center text-center border-b border-emerald-500/20">
                    <h2 className="text-lg font-bold text-white tracking-tight mb-1">
                        {step === 'credentials' ? 'System Authorization' : 'Secure Uplink'}
                    </h2>
                    <p className="text-sm text-emerald-100/50 max-w-[260px] mx-auto">
                        {step === 'credentials' 
                             ? 'Authenticate your agent profile.' 
                             : 'Verify workspace sector.'}
                    </p>
                </div>

                {/* Form Body */}
                <div className="flex-1 p-6 relative min-h-[260px]">
                    {error && (
                        <div className="mb-6 p-3 rounded-xl bg-status-error/10 border border-status-error/20 flex items-center gap-3 animate-in slide-in-from-top-2">
                            <ShieldAlert size={16} className="text-status-error" />
                            <span className="text-xs font-medium text-status-error">{error}</span>
                        </div>
                    )}

                    {step === 'credentials' ? (
                        <CredentialsStage 
                            onSubmit={handleCredentialsSubmit} 
                            isProcessing={isProcessing} 
                        />
                    ) : (
                        <UplinkStage 
                            userId={tempUserId}
                            onBack={() => { setStep('credentials'); setTempPassword(''); }}
                            onSubmit={handleServerConnect}
                            isProcessing={isProcessing}
                        />
                    )}
                </div>
            </Card>
            
            {/* Footer */}
            <div className="mt-8 text-xs font-medium text-emerald-500/40 text-center uppercase tracking-widest">
                My Pipe OS • v2.4.0
            </div>
        </div>
    </div>
  );
};
`
fs.writeFileSync('views/LoginScreen.tsx', code);
