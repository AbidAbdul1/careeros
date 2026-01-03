import React, { useEffect, useState } from 'react';

interface AuthPageProps {
  onLoginSuccess: (userData: any) => void;
}

/**
 * UTILITY: parseJwt
 * Securely extracts user information from the Google ID Token (JWT).
 */
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Auth: Failed to parse Google identity token", e);
    return null;
  }
}

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [gsiLoaded, setGsiLoaded] = useState(false);

  /**
   * 🔑 GOOGLE CLIENT ID
   * PASTE YOUR NEW CLIENT ID HERE
   */
  const GOOGLE_CLIENT_ID = "448756267222-t0q9315afokvnv5nb05ocmi1sv8hdpsc.apps.googleusercontent.com"; 

  useEffect(() => {
    const checkGSI = setInterval(() => {
      // @ts-ignore
      if (window.google && window.google.accounts) {
        setGsiLoaded(true);
        try {
          // @ts-ignore
          google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            auto_select: false, // Set to true if you want auto-login
            ux_mode: "popup",
            use_fedcm_for_prompt: true,
            callback: (response: any) => {
              const payload = parseJwt(response.credential);
              if (payload) {
                onLoginSuccess({
                  isAuthenticated: true,
                  name: payload.name,
                  email: payload.email,
                  profileId: payload.sub,
                  picture: payload.picture
                });
              }
            },
          });

          // @ts-ignore
          google.accounts.id.renderButton(
            document.getElementById("googleSignInBtn"),
            { 
              theme: "filled_blue", 
              size: "large", 
              width: "350",
              text: "continue_with",
              shape: "pill",
              logo_alignment: "left"
            }
          );
        } catch (err) {
          console.error("Auth: Initialization error", err);
        }
        clearInterval(checkGSI);
      }
    }, 500);

    return () => clearInterval(checkGSI);
  }, [onLoginSuccess, GOOGLE_CLIENT_ID]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden text-slate-900 font-sans">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-50 rounded-full blur-[160px] opacity-40 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-50 rounded-full blur-[160px] opacity-40"></div>

      <div className="w-full max-w-[480px] bg-white rounded-[3rem] shadow-[0_64px_128px_-24px_rgba(0,0,0,0.1)] border border-slate-100 p-12 relative z-10 animate-in fade-in zoom-in-95 duration-700">
        
        <div className="flex flex-col items-center mb-12">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-200 mb-8 transform hover:scale-105 transition-transform duration-500">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-3 text-slate-900">CareerOS</h1>
          <p className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.3em]">Identity Gateway</p>
        </div>

        <div className="space-y-8 flex flex-col items-center">
          {/* GOOGLE BUTTON CONTAINER */}
          <div className="w-full flex justify-center">
             <div id="googleSignInBtn" className="min-h-[50px] transition-all hover:scale-[1.02] active:scale-[0.98]"></div>
          </div>
          
          {!gsiLoaded && (
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-ping"></div>
              Connecting to Google...
            </div>
          )}

          <div className="pt-6 w-full border-t border-slate-50 text-center">
             <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
               Authorized Personnel Only
             </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;