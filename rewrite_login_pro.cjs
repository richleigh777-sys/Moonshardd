const fs = require('fs');

const code = `import * as React from 'react';
import { useState } from 'react';
import { ShieldAlert, Sparkles } from 'lucide-react';
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

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row relative overflow-hidden bg-black text-white font-sans">
        
        {/* Universal Dark Tech Background */}
        <div className="absolute inset-0 bg-[#020604] z-0"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-950/20 via-[#020604] to-black z-0"></div>
        
        {/* Subtle grid to bind the whole screen together */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, rgba(16, 185, 129, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(16, 185, 129, 0.4) 1px, transparent 1px)', backgroundSize: '6rem 6rem' }}></div>

        {/* Left Side: Seamless Artistic Integration */}
        <div className="w-full lg:w-1/2 relative z-10 flex flex-col items-center justify-center min-h-[50vh] lg:min-h-screen p-8 lg:p-12">
            
            {/* The Logo Container - using mask-image for a seamless fade */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center opacity-80 mix-blend-screen pointer-events-none">
                <img 
                    src="/logo.jpg" 
                    alt="My Pipe Graphic" 
                    className="w-full h-full object-cover object-center scale-110"
                    style={{ 
                        WebkitMaskImage: 'radial-gradient(circle at center, black 20%, transparent 70%)',
                        maskImage: 'radial-gradient(circle at center, black 20%, transparent 70%)',
                        filter: 'contrast(1.2) brightness(1.1) saturate(1.2)' 
                    }}
                />
            </div>

            {/* Glowing Accent Orbs behind text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30vw] h-[30vw] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative z-20 flex flex-col items-center justify-center w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 mt-[30vh] lg:mt-[40vh]">
                <h1 
                    className="text-[4rem] md:text-[6rem] lg:text-[7rem] xl:text-[9rem] font-black text-white tracking-[0.15em] text-center drop-shadow-[0_0_40px_rgba(16,185,129,0.3)] leading-none" 
                    style={{ fontFamily: '"Playfair Display", "Times New Roman", serif', fontStyle: 'italic' }}
                >
                    MY PIPE
                </h1>
                <div className="h-[1px] w-48 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent mt-6 mb-4"></div>
                <p className="text-emerald-400/80 tracking-[0.4em] uppercase text-sm font-semibold">
                    Enterprise Operating System
                </p>
            </div>
        </div>

        {/* Right Side: Glassmorphism Login Panel */}
        <div className="w-full lg:w-1/2 relative z-20 flex flex-col items-center justify-center p-6 lg:p-12 bg-black/30 backdrop-blur-md">
            
            <div className="w-full max-w-[420px] flex flex-col items-center justify-center">
                
                {/* Form Card */}
                <div className="w-full bg-[#030905]/60 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.5)] border border-emerald-500/10 p-8 xl:p-10 flex flex-col relative overflow-hidden animate-in fade-in slide-in-from-right-8 duration-1000 delay-300 backdrop-blur-2xl">
                    
                    {/* Subtle Top Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"></div>

                    {/* Header */}
                    <div className="flex flex-col mb-10 text-center items-center">
                        <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                            <Sparkles size={28} className="animate-pulse" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-2xl font-semibold text-white tracking-wide mb-2" style={{ fontFamily: '"Playfair Display", "Times New Roman", serif', fontStyle: 'italic' }}>
                            {step === 'credentials' ? 'System Authorization' : 'Secure Uplink'}
                        </h2>
                        <p className="text-xs text-emerald-200/50 font-medium tracking-[0.15em] uppercase">
                            {step === 'credentials' 
                                 ? 'Authenticate your agent profile' 
                                 : 'Verify workspace sector'}
                        </p>
                    </div>

                    {/* Form Body */}
                    <div className="flex-1 relative min-h-[220px]">
                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/20 flex items-center gap-3 animate-in slide-in-from-top-2">
                                <ShieldAlert size={18} className="text-red-400 shrink-0" />
                                <span className="text-sm font-medium text-red-200/90">{error}</span>
                            </div>
                        )}

                        <div className="w-full text-white">
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
                    </div>
                </div>
                
                {/* Footer */}
                <div className="mt-12 text-[10px] text-emerald-500/30 text-center tracking-[0.4em] uppercase font-bold">
                    My Pipe OS • v3.0.0
                </div>
            </div>
        </div>
    </div>
  );
};
`
fs.writeFileSync('views/LoginScreen.tsx', code);
