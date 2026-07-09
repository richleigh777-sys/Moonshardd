const fs = require('fs');

const code = `import * as React from 'react';
import { useState } from 'react';
import { ShieldAlert, LogIn, ChevronRight, Sparkles } from 'lucide-react';
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

  return (
    <div className="min-h-screen w-full flex relative overflow-hidden font-sans bg-[#F8FAFC]">
        {/* Soft immersive background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F8FAFC] via-[#EFF6FF] to-[#E0E7FF] z-0"></div>
        
        {/* Floating Organic Accents */}
        <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[100px] animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-400/10 rounded-full blur-[120px] animate-pulse-slow delay-700"></div>
            <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-violet-400/10 rounded-full blur-[80px] animate-pulse-slow delay-1000"></div>
        </div>

        {/* Left Side: Branding / Messaging Area */}
        <div className="hidden lg:flex w-1/2 relative z-20 flex-col justify-center p-16 xl:p-24">
            <div className="flex flex-col w-full max-w-lg animate-in fade-in slide-in-from-left-8 duration-1000">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 border border-slate-100">
                        <Sparkles size={24} className="animate-pulse" />
                    </div>
                    <span className="text-xl font-bold text-slate-800 tracking-tight">Apex CRM</span>
                </div>
                
                <h1 className="text-5xl xl:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
                    A cleaner, smarter way to work.
                </h1>
                
                <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-md">
                    Enterprise-grade power, wrapped in a beautiful, empathetic interface designed to reduce cognitive load and accelerate your day.
                </p>
                
                <div className="mt-12 flex items-center gap-4 text-sm font-semibold text-slate-400">
                    <div className="flex -space-x-3">
                        <div className="w-10 h-10 rounded-full border-2 border-[#F8FAFC] bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">JD</div>
                        <div className="w-10 h-10 rounded-full border-2 border-[#F8FAFC] bg-blue-100 flex items-center justify-center text-blue-600 font-bold">AM</div>
                        <div className="w-10 h-10 rounded-full border-2 border-[#F8FAFC] bg-violet-100 flex items-center justify-center text-violet-600 font-bold">SR</div>
                    </div>
                    <span className="ml-2">Join your team inside.</span>
                </div>
            </div>
        </div>

        {/* Right Side: Form Area */}
        <div className="w-full lg:w-1/2 relative z-20 flex flex-col items-center justify-center p-6 lg:p-12">
            
            <div className="w-full max-w-[400px] flex flex-col items-center justify-center">
                {/* Mobile-only branding */}
                <div className="lg:hidden flex flex-col items-center mb-8 w-full animate-in slide-in-from-bottom-4 duration-700 fade-in text-center">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 border border-slate-100 mb-4">
                        <Sparkles size={28} className="animate-pulse" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Apex CRM</h1>
                </div>

                {/* Login Card */}
                <div className="w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/80 p-8 xl:p-10 flex flex-col relative overflow-hidden animate-in fade-in slide-in-from-right-8 duration-700 delay-150">
                    
                    {/* Header */}
                    <div className="flex flex-col mb-8 text-center sm:text-left">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                            {step === 'credentials' ? 'Welcome back' : 'Select Workspace'}
                        </h2>
                        <p className="text-sm text-slate-500 font-medium">
                            {step === 'credentials' 
                                 ? 'Sign in to access your dashboard.' 
                                 : 'Verify your tenant sector.'}
                        </p>
                    </div>

                    {/* Form Body */}
                    <div className="flex-1 relative min-h-[220px]">
                        {error && (
                            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 animate-in slide-in-from-top-2">
                                <ShieldAlert size={20} className="text-red-500 shrink-0" />
                                <span className="text-sm font-semibold text-red-700">{error}</span>
                            </div>
                        )}

                        <div className="w-full">
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
                <div className="mt-8 text-xs font-semibold text-slate-400 text-center animate-in fade-in duration-1000 delay-300">
                    Protected by Apex Security • v3.0
                </div>
            </div>
        </div>
    </div>
  );
};
`
fs.writeFileSync('views/LoginScreen.tsx', code);
