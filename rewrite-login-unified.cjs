const fs = require('fs');

const code = `import * as React from 'react';
import { useState } from 'react';
import { ShieldAlert, Sparkles, Hexagon } from 'lucide-react';
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
      '--color-surface-main': '150 40% 6%', // Deep dark green/black
      '--color-surface-alt': '150 50% 8%', // Slightly lighter for inputs
      '--color-surface-canvas': '150 45% 4%', // Pure abyss
      '--color-border-subtle': '150 80% 20%', // Neon green borders
      '--color-text-primary': '0 0% 100%', // Pure White
      '--color-text-secondary': '150 40% 80%', // Very light green
      '--color-text-muted': '150 40% 60%', 
      '--color-accent-primary': '150 100% 45%', // Bright neon green!
  } as React.CSSProperties;

  return (
    <div 
        className="min-h-screen w-full flex flex-col lg:flex-row relative overflow-hidden font-sans text-white"
        style={neonTheme}
    >
        {/* Full Screen Dark Tech Background */}
        <div className="absolute inset-0 bg-[#040B07] z-0"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0A1A12] via-[#040B07] to-black z-0 opacity-80"></div>
        
        {/* Neon Grid Overlay */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, rgba(16, 185, 129, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(16, 185, 129, 0.2) 1px, transparent 1px)', backgroundSize: '4rem 4rem' }}></div>
        
        {/* Floating Neon Accents */}
        <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none overflow-hidden">
            <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse-slow"></div>
            <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] animate-pulse-slow delay-700"></div>
        </div>

        {/* Left Side: Logo Area */}
        <div className="w-full lg:w-1/2 relative z-20 flex flex-col items-center justify-center p-8 lg:p-12 lg:border-r border-emerald-900/30 bg-[#040B07]/20 backdrop-blur-sm">
            <div className="flex flex-col items-center justify-center w-full animate-in fade-in slide-in-from-left-8 duration-1000">
                <div className="relative w-64 h-64 md:w-80 md:h-80 xl:w-[460px] xl:h-[460px] mb-8 group">
                    <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-all duration-700 animate-pulse"></div>
                    <img 
                        src="/logo.jpg" 
                        alt="My Pipe Logo" 
                        className="w-full h-full object-cover rounded-full shadow-[0_0_80px_rgba(16,185,129,0.3)] border border-emerald-500/20 relative z-10 group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                </div>
                
                <h1 className="text-5xl xl:text-7xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] text-center font-display mt-4 hover:scale-105 transition-transform duration-500 cursor-default">
                    MY<span className="text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.8)]">PIPE</span>
                </h1>
                
                <div className="mt-6 flex items-center gap-3">
                    <Hexagon size={16} className="text-emerald-500/80 animate-spin-slow" />
                    <p className="text-emerald-400/90 text-sm xl:text-base font-bold tracking-[0.4em] uppercase text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                        Enterprise CRM Vanguard
                    </p>
                    <Hexagon size={16} className="text-emerald-500/80 animate-spin-slow" />
                </div>
            </div>
        </div>

        {/* Right Side: Form Area */}
        <div className="w-full lg:w-1/2 relative z-20 flex flex-col items-center justify-center p-6 lg:p-12 bg-[#020503]/40 backdrop-blur-md">
            
            <div className="w-full max-w-[420px] flex flex-col items-center justify-center">
                {/* Login Card */}
                <div className="w-full bg-[#061109]/90 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.1)] border border-emerald-500/20 p-8 xl:p-10 flex flex-col relative overflow-hidden animate-in fade-in slide-in-from-right-8 duration-700 delay-150 backdrop-blur-2xl">
                    
                    {/* Inner glowing top border */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>

                    {/* Header */}
                    <div className="flex flex-col mb-8 text-center items-center">
                        <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)] group hover:bg-emerald-500/20 transition-colors">
                            <Sparkles size={28} className="animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight mb-2 drop-shadow-md">
                            {step === 'credentials' ? 'System Authorization' : 'Secure Uplink'}
                        </h2>
                        <p className="text-sm text-emerald-200/60 font-medium">
                            {step === 'credentials' 
                                 ? 'Authenticate your agent profile.' 
                                 : 'Verify workspace sector.'}
                        </p>
                    </div>

                    {/* Form Body */}
                    <div className="flex-1 relative min-h-[220px]">
                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 animate-in slide-in-from-top-2">
                                <ShieldAlert size={20} className="text-red-400 shrink-0" />
                                <span className="text-sm font-semibold text-red-200">{error}</span>
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
                <div className="mt-8 text-xs font-bold text-emerald-500/30 text-center uppercase tracking-widest animate-in fade-in duration-1000 delay-300">
                    My Pipe OS • v2.4.0
                </div>
            </div>
        </div>
    </div>
  );
};
`
fs.writeFileSync('views/LoginScreen.tsx', code);
