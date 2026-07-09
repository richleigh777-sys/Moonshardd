const fs = require('fs');

const code = `import * as React from 'react';
import { useState } from 'react';
import { Heart, CheckCircle2 } from 'lucide-react';
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
          // Standard delay for UX feel
          await new Promise(r => setTimeout(r, 600));
          
          const rootResult = await authenticateRoot(userId, password);
          if (rootResult && 'user' in rootResult) {
              sfx.playSuccess();
              await login(rootResult.user, rootResult.sig);
              onLogin(rootResult.user);
          } else if (rootResult && 'error' in rootResult && userId === SYSTEM_ADMIN_ID) {
              // If it's explicitly the root user and password failed, show error
              setError(rootResult.error);
              sfx.playError();
              setIsProcessing(false);
          } else {
              // Not a root admin or wrong user, proceed to server selection
              setStep('server');
              setIsProcessing(false);
          }
      } catch {
          // Fallback to server check if root check fails oddly
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

  return (
    <div className="h-screen w-full flex bg-surface-alt relative overflow-hidden text-text-primary font-sans">
        
        {/* Left Side: Branding / Photo */}
        <div className="hidden lg:flex w-1/2 relative bg-[#121c16] items-center justify-center overflow-hidden">
            {/* Dark/green gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#121c16] via-[#1a2d21] to-[#0a120c] z-0"></div>
            <div className="absolute inset-0 bg-black/40 z-10"></div>
            
            {/* The Logo Image */}
            <div className="relative z-20 flex flex-col items-center justify-center">
                <img 
                    src="/logo.jpg" 
                    alt="My Pipe Logo" 
                    className="w-[400px] h-[400px] object-cover rounded-full shadow-[0_0_80px_rgba(74,222,128,0.2)] border-2 border-emerald-500/20 mb-8"
                />
                <h1 className="text-5xl font-black text-white tracking-tight drop-shadow-xl">
                    My Pipe
                </h1>
                <p className="text-emerald-400 mt-4 text-lg font-medium tracking-wide uppercase">
                    Enterprise CRM Vanguard
                </p>
            </div>
            
            {/* Glowing accents */}
            <div className="absolute top-0 left-0 w-full h-full z-10">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px]"></div>
            </div>
        </div>

        {/* Right Side: Login UI */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative z-20 px-4 sm:px-8 bg-surface-alt">
            {/* Soft Background on Right Side */}
            <div className="absolute inset-0 bg-gradient-to-br from-surface-highlight to-surface-alt z-0"></div>
            
            <div className="w-full max-w-[420px] relative z-20">
                <div className="lg:hidden flex flex-col items-center mb-8">
                    <img 
                        src="/logo.jpg" 
                        alt="My Pipe Logo" 
                        className="w-24 h-24 object-cover rounded-full shadow-lg border border-emerald-500/20 mb-4"
                    />
                    <h1 className="text-3xl font-black text-text-primary tracking-tight">
                        My Pipe
                    </h1>
                </div>

                <Card variant="panel" className="p-0 overflow-hidden flex flex-col shadow-2xl border-border-subtle bg-surface-main/80 backdrop-blur-xl">
                    
                    {/* Header */}
                    <div className="p-6 pb-6 flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/20">
                            <Heart size={28} fill="currentColor" />
                        </div>
                        <h2 className="text-xl font-bold text-text-primary tracking-tight mb-2">
                            {step === 'credentials' ? 'Welcome Back' : 'Connect to Workspace'}
                        </h2>
                        <p className="text-sm text-text-secondary max-w-[260px] mx-auto leading-relaxed">
                            {step === 'credentials' 
                                 ? 'Sign in to access your My Pipe dashboard.' 
                                 : 'Please provide your organization details.'}
                        </p>
                    </div>

                    {/* Form Body */}
                    <div className="flex-1 p-6 pt-0 relative min-h-[280px]">
                        {error && (
                            <div className="mb-6 p-3 rounded-xl bg-status-error/10 border border-status-error/20 flex items-center gap-3 animate-in slide-in-from-top-2">
                                <CheckCircle2 size={16} className="text-status-error rotate-45" />
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
                    
                    {/* Footer */}
                    <div className="p-5 border-t border-border-subtle bg-surface-alt/30 flex flex-col items-center gap-3">
                        <div className="text-xs text-text-muted text-center opacity-70">
                            My Pipe Enterprise • v2.4.0
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    </div>
  );
};
`
fs.writeFileSync('views/LoginScreen.tsx', code);
