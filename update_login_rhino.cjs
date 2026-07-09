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
        <div className="absolute inset-0 bg-black z-0"></div>
        
        {/* Use the logo itself as a heavily blurred ambient background */}
        <div 
            className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
            style={{ 
                backgroundImage: 'url(/logo.jpg)', 
                backgroundSize: 'cover', 
                backgroundPosition: 'center',
                filter: 'blur(20px) contrast(1.5)',
                mixBlendMode: 'screen'
            }}
        ></div>
        
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/50 to-black z-0"></div>
        
        {/* Neon Grid Overlay */}
        <div className="absolute inset-0 z-0 opacity-[0.15] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, rgba(16, 185, 129, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(16, 185, 129, 0.4) 1px, transparent 1px)', backgroundSize: '4rem 4rem' }}></div>
        
        {/* Floating Neon Accents */}
        <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none overflow-hidden">
            <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-emerald-500/20 rounded-[200px] blur-[150px] animate-pulse-slow"></div>
            <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-[200px] blur-[150px] animate-pulse-slow delay-700"></div>
        </div>

        {/* Left Side: Logo Area */}
        <div className="w-full lg:w-[55%] relative z-20 flex flex-col items-center justify-center p-8 lg:p-12 bg-transparent">
            <div className="flex flex-col items-center justify-center w-full animate-in fade-in slide-in-from-left-8 duration-1000">
                <div className="relative w-[350px] h-[350px] md:w-[500px] md:h-[500px] xl:w-[700px] xl:h-[700px] mb-0 group flex items-center justify-center -mt-10">
                    {/* Glowing aura behind rhino */}
                    <div className="absolute top-[25%] left-[25%] w-[50%] h-[50%] bg-emerald-500/30 rounded-[200px] blur-[100px] group-hover:bg-emerald-500/50 transition-all duration-700 animate-pulse"></div>
                    
                    {/* The Rhino Logo: mix-blend-screen removes the black background. clipPath crops out "MY PIPE CRM" at the bottom */}
                    <img 
                        src="/logo.jpg" 
                        alt="My Pipe Rhino" 
                        className="w-[180%] h-auto max-w-none object-cover relative z-10 group-hover:scale-[1.03] transition-transform duration-700 ease-out translate-y-[-10%]"
                        style={{ 
                            mixBlendMode: 'screen', 
                            clipPath: 'polygon(0 0, 100% 0, 100% 72%, 0 72%)',
                            filter: 'contrast(1.25) brightness(1.1)' 
                        }}
                    />
                </div>
                
                {/* MY PIPE Title with artistic font and proper spacing */}
                <h1 
                    className="text-[80px] md:text-[100px] xl:text-[140px] font-black text-white tracking-[0.2em] text-center mt-[-60px] xl:mt-[-100px] hover:scale-105 transition-transform duration-500 cursor-default drop-shadow-[0_0_30px_rgba(16,185,129,0.4)]" 
                    style={{ fontFamily: '"Playfair Display", "Times New Roman", serif' }}
                >
                    MY PIPE
                </h1>
            </div>
        </div>

        {/* Right Side: Form Area */}
        <div className="w-full lg:w-[45%] relative z-20 flex flex-col items-center justify-center p-6 lg:p-12 lg:border-l border-emerald-900/40 bg-black/40 backdrop-blur-2xl">
            
            <div className="w-full max-w-[440px] flex flex-col items-center justify-center">
                {/* Login Card - Integrating with the theme */}
                <div className="w-full bg-[#040D07]/80 rounded-[30px] shadow-[0_0_80px_rgba(16,185,129,0.15)] border border-emerald-500/30 p-8 xl:p-12 flex flex-col relative overflow-hidden animate-in fade-in slide-in-from-right-8 duration-700 delay-150 backdrop-blur-3xl">
                    
                    {/* Inner glowing top border */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-80"></div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-emerald-300 blur-[2px] opacity-80"></div>

                    {/* Header */}
                    <div className="flex flex-col mb-10 text-center items-center">
                        <div className="w-16 h-16 bg-emerald-500/20 rounded-[20px] flex items-center justify-center text-emerald-400 border border-emerald-500/40 mb-6 shadow-[0_0_40px_rgba(16,185,129,0.3)] group hover:bg-emerald-500/30 hover:scale-105 transition-all duration-300">
                            <Sparkles size={32} className="animate-pulse" />
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight mb-3 drop-shadow-md" style={{ fontFamily: '"Playfair Display", "Times New Roman", serif' }}>
                            {step === 'credentials' ? 'System Authorization' : 'Secure Uplink'}
                        </h2>
                        <p className="text-sm text-emerald-100/60 font-medium tracking-[0.1em]" style={{ textTransform: 'uppercase' }}>
                            {step === 'credentials' 
                                 ? 'Authenticate your agent profile' 
                                 : 'Verify workspace sector'}
                        </p>
                    </div>

                    {/* Form Body */}
                    <div className="flex-1 relative min-h-[220px]">
                        {error && (
                            <div className="mb-6 p-4 rounded-[16px] bg-red-900/30 border border-red-500/50 flex items-center gap-3 animate-in slide-in-from-top-2 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
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
                <div className="mt-12 text-xs font-bold text-emerald-500/40 text-center tracking-[0.3em] animate-in fade-in duration-1000 delay-300" style={{ textTransform: 'uppercase' }}>
                    My Pipe OS • v3.0.0
                </div>
            </div>
        </div>
    </div>
  );
};
`
fs.writeFileSync('views/LoginScreen.tsx', code);
