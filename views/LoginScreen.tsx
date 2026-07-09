import * as React from 'react';
import { useState, useEffect } from 'react';
import { ShieldAlert, Wifi, Globe, Clock, Signal } from 'lucide-react';
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
  
  const [time, setTime] = useState(new Date());

  useEffect(() => {
      const timer = setInterval(() => setTime(new Date()), 1000);
      return () => clearInterval(timer);
  }, []);

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
    <div className="h-screen w-screen flex flex-col relative overflow-hidden bg-[#020804] text-white font-sans">
        
        {/* Unified Tech Grid Background */}
        <div 
            className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
            style={{ 
                backgroundImage: 'linear-gradient(to right, rgba(16, 185, 129, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(16, 185, 129, 0.15) 1px, transparent 1px)', 
                backgroundSize: '4rem 4rem',
                backgroundPosition: 'center center'
            }}
        ></div>

        {/* Ambient Radial Glows */}
        <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] bg-[#0A2616] rounded-full blur-[150px] pointer-events-none z-0 opacity-60"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[60vw] h-[60vw] bg-[#0A2616] rounded-full blur-[180px] pointer-events-none z-0 opacity-60"></div>

        <div className="flex-1 flex flex-col lg:flex-row relative z-10 w-full pb-16">
            {/* Left Side: Logo */}
            <div className="w-full lg:w-[55%] relative flex flex-col items-center justify-center p-8 lg:p-12">
                <div className="relative w-full h-full flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-1000 max-w-2xl">
                    
                    {/* Glowing Hexagon Backdrop */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                        <svg viewBox="0 0 100 100" className="w-[90%] h-[90%] text-emerald-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                            <polygon points="50 5 90 27 90 73 50 95 10 73 10 27" fill="none" stroke="currentColor" strokeWidth="0.3" />
                            <polygon points="50 15 80 32 80 68 50 85 20 68 20 32" fill="none" stroke="currentColor" strokeWidth="0.1" />
                        </svg>
                    </div>

                    {/* Rhino Logo */}
                    <div className="relative w-full h-[65vh] flex justify-center items-center z-10">
                       <img 
                           src="/logo.jpg" 
                           alt="My Pipe Rhino" 
                           className="w-full h-full object-contain scale-[1.3] drop-shadow-[0_0_40px_rgba(16,185,129,0.5)]"
                           style={{ 
                               mixBlendMode: 'screen', 
                               filter: 'contrast(1.4) brightness(1.2)',
                               WebkitMaskImage: 'radial-gradient(ellipse at center, black 45%, transparent 70%)',
                               maskImage: 'radial-gradient(ellipse at center, black 45%, transparent 70%)'
                           }}
                       />
                    </div>
                </div>
            </div>

            {/* Right Side: Form Panel */}
            <div className="w-full lg:w-[45%] relative flex flex-col items-center justify-center p-6 lg:p-12">
                
                <div className="w-full max-w-[420px] flex flex-col items-center justify-center">
                    
                    {/* Form Card */}
                    <div className="w-full bg-[#05110A]/80 rounded-[24px] shadow-[0_20px_80px_rgba(0,0,0,0.8)] border border-emerald-500/20 p-8 xl:p-10 flex flex-col relative overflow-hidden animate-in fade-in slide-in-from-right-8 duration-1000 delay-300 backdrop-blur-xl">
                        
                        {/* Top Subtle Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-[2px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent"></div>

                        {/* Form Body */}
                        <div className="flex-1 relative min-h-[180px]">
                            {error && (
                                <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center gap-3 animate-in slide-in-from-top-2">
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
                </div>
            </div>
        </div>

        {/* Global Footer Bar */}
        <div className="absolute bottom-0 left-0 w-full h-16 bg-[#030d07]/90 border-t border-emerald-900/30 backdrop-blur-md flex items-center justify-between px-6 z-30">
            {/* Left: Status Icons & Time */}
            <div className="flex items-center gap-4 text-emerald-500/60 font-mono text-sm">
                <div className="flex items-center gap-2 border border-emerald-900/30 bg-emerald-950/20 px-3 py-1.5 rounded-lg shadow-inner">
                    <Clock size={14} className="text-emerald-400/80" />
                    <span className="tracking-widest">
                        {time.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                </div>
                <div className="flex items-center gap-3 ml-2">
                    <Wifi size={16} />
                    <Signal size={16} />
                    <Globe size={16} />
                </div>
            </div>

            {/* Center: Stylized Cutout for MY PIPE */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 h-16 sm:h-20 flex items-end">
                <div className="relative px-8 sm:px-12 py-2 sm:py-3 bg-[#030d07] border-t border-l border-r border-emerald-900/50 rounded-t-3xl shadow-[0_-10px_30px_rgba(16,185,129,0.1)]">
                    <h1 
                        className="text-[1.5rem] sm:text-[2rem] font-black text-white tracking-[0.25em] text-center leading-none drop-shadow-[0_2px_10px_rgba(16,185,129,0.5)]" 
                        style={{ fontFamily: '"Playfair Display", "Times New Roman", serif' }}
                    >
                        MY PIPE
                    </h1>
                </div>
            </div>

            {/* Right: Version */}
            <div className="text-[10px] sm:text-xs text-emerald-500/40 tracking-[0.3em] uppercase font-bold pr-2">
                My Pipe OS • v3.0.0
            </div>
        </div>
    </div>
  );
};
