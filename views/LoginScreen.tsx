
import * as React from 'react';
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

  const handleSimulateLogin = async (uid: string, pass: string, companyId: string) => {
      setError('');
      setIsProcessing(true);
      sfx.playSubmit();

      try {
          await new Promise(r => setTimeout(r, 600)); 
          const result = await authenticate(uid, pass, companyId, "");
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
          setError(err.message || "Simulated Login Failed");
      } finally {
          setIsProcessing(false);
      }
  };

  const handleServerConnect = async (companyId: string) => {
      setError('');
      setIsProcessing(true);
      sfx.playSubmit();

      try {
          await new Promise(r => setTimeout(r, 800)); 
          // Removed manual verifyServerCredentials checking here. 
          // The authenticate check underneath handles user verification.
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

  const handleQuickLogin = async () => {
    setError('');
    setIsProcessing(true);
    sfx.playSubmit();
    
    // Use the known root credentials for quick developer access
    const rootId = SYSTEM_ADMIN_ID;
    const rootPass = 'root123';
    
    try {
        await new Promise(r => setTimeout(r, 400));
        const rootResult = await authenticateRoot(rootId, rootPass);
        
        if (rootResult && 'user' in rootResult) {
            sfx.playSuccess();
            await login(rootResult.user, rootResult.sig);
            onLogin(rootResult.user);
        } else {
            setError(rootResult && 'error' in rootResult ? rootResult.error : "Quick access unavailable.");
            setIsProcessing(false);
        }
    } catch (err: any) {
        setError(err.message || "Bypass failed. System integrity check required.");
        setIsProcessing(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-surface-alt relative overflow-hidden text-text-primary font-sans">
        
        {/* Soft Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-surface-highlight to-surface-alt z-0"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-accent-primary/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px]"></div>

        <div className="w-full max-w-[400px] relative z-20 px-4">
            
            <Card variant="panel" className="p-0 overflow-hidden flex flex-col shadow-2xl border-border-subtle bg-surface-main/80 backdrop-blur-xl">
                
                {/* Header */}
                <div className="p-5 pb-6 flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent-primary to-indigo-600 text-white flex items-center justify-center mb-5 shadow-lg shadow-accent-primary/20">
                        <Heart size={28} fill="currentColor" />
                    </div>

                    <h2 className="text-lg font-bold text-text-primary tracking-tight mb-2">
                        {step === 'credentials' ? 'Welcome Back' : 'Connect to Workspace'}
                    </h2>
                    <p className="text-sm text-text-secondary max-w-[260px] mx-auto leading-relaxed">
                        {step === 'credentials' 
                            ? 'Sign in to access your Braveheart dashboard.' 
                            : 'Please provide your organization details.'}
                    </p>
                </div>

                {/* Form Body */}
                <div className="flex-1 p-5 pt-0 relative min-h-[280px]">
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
                    <div className="flex flex-col gap-2">
                        <button 
                            onClick={handleQuickLogin}
                            disabled={isProcessing}
                            className="text-xs font-semibold text-text-primary hover:text-accent-primary transition-colors disabled:opacity-50 border border-border-subtle hover:border-accent-primary/50 py-2 px-4 rounded-lg bg-surface-main"
                        >
                            Log in as Owner (Root)
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                            <button 
                                onClick={() => handleSimulateLogin('admin-srv-001-1', 'admin123', 'srv-001')}
                                disabled={isProcessing}
                                className="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50 border border-border-subtle hover:bg-surface-highlight py-2 px-3 rounded-lg"
                            >
                                Log in as Manager
                            </button>
                            <button 
                                onClick={() => handleSimulateLogin('agent-srv-001-1', 'agent123', 'srv-001')}
                                disabled={isProcessing}
                                className="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50 border border-border-subtle hover:bg-surface-highlight py-2 px-3 rounded-lg"
                            >
                                Log in as Team Member
                            </button>
                        </div>
                    </div>
                    <div className="text-xs text-text-muted mt-2 text-center opacity-70">
                        Braveheart Workspace • v2.4.0 <br/>
                        Development Environment Logins
                    </div>
                </div>
            </Card>
        </div>
    </div>
  );
};
