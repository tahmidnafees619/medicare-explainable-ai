import { useState, useEffect, useCallback } from 'react';
import { Stethoscope, Bell, MessageCircle, ClipboardList, User, LogOut, MessageSquarePlus, AlertCircle } from 'lucide-react';
import LandingScreen from '@/components/LandingScreen';
import AuthScreen from '@/components/AuthScreen';
import ChatScreen from '@/components/ChatScreen';
import ResultsScreen from '@/components/ResultsScreen';
import DashboardScreen from '@/components/DashboardScreen';
import ToastContainer, { ToastItem } from '@/components/ToastContainer';
import { logoutUser } from '@/api/config';

type Screen = 'landing' | 'auth' | 'chat' | 'results' | 'dashboard';

export default function Index() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  useEffect(() => {
    const t = localStorage.getItem('medai_token');
    const u = localStorage.getItem('medai_user');
    if (t && u) { setToken(t); setUser(JSON.parse(u)); setScreen('chat'); }
  }, []);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setToasts(prev => [...prev, { id: Date.now(), message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleAuth = (u: any, t: string) => { setUser(u); setToken(t); setScreen('chat'); };
  const handleLogout = () => { logoutUser(); setUser(null); setToken(null); setScreen('landing'); setPredictionResult(null); };
  const resetChat = () => { setPredictionResult(null); setScreen('chat'); };
  const handleDemoMode = () => {
    const demoUser = { id: 0, name: 'Demo User', email: 'demo@medicare.ai' };
    setUser(demoUser);
    setToken('demo-token');
    setScreen('chat');
  };

  const initials = user?.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  // Navbar for authenticated screens
  const Navbar = () => (
    <nav className="sticky top-0 z-[100] bg-card border-b border-border h-16 flex items-center px-6 justify-between">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setScreen('chat')}>
        <Stethoscope className="w-6 h-6 text-primary" />
        <span className="font-heading font-bold text-lg text-primary">MediCare AI</span>
      </div>
      <div className="hidden md:block font-heading font-semibold text-sm text-muted-foreground capitalize">{screen}</div>
      <div className="flex items-center gap-3">
        <button onClick={() => setScreen('dashboard')} className="relative p-2 rounded-full hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="relative">
          <button onClick={() => setShowDropdown(!showDropdown)} className="w-10 h-10 rounded-full gradient-avatar flex items-center justify-center text-white font-heading font-bold text-sm">
            {initials}
          </button>
          {showDropdown && (
            <div className="absolute right-0 top-12 bg-card border border-border rounded-xl shadow-card p-2 min-w-[180px] z-50">
              <div className="px-3 py-2 border-b border-border mb-1">
                <p className="font-heading font-bold text-sm">👤 {user?.name}</p>
              </div>
              <button onClick={() => { setScreen('dashboard'); setShowDropdown(false); }} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors">📊 Dashboard</button>
              <button onClick={() => { handleLogout(); setShowDropdown(false); }} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors text-destructive">🚪 Sign Out</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );

  // Sidebar for desktop chat
  const Sidebar = () => (
    <aside className="hidden md:flex flex-col w-[280px] border-r border-border bg-card p-5 shrink-0">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-full gradient-avatar flex items-center justify-center text-white font-heading font-bold">{initials}</div>
        <div>
          <p className="font-heading font-bold text-sm">{user?.name}</p>
          <button onClick={() => setScreen('dashboard')} className="text-primary text-xs hover:underline">View Dashboard →</button>
        </div>
      </div>
      <nav className="space-y-1 flex-1">
        {[
          { icon: MessageSquarePlus, label: 'New Chat', onClick: resetChat, active: screen === 'chat' },
          { icon: ClipboardList, label: 'My History', onClick: () => setScreen('dashboard'), active: false },
          { icon: Bell, label: 'Reminders', onClick: () => setScreen('dashboard'), active: false },
          { icon: LogOut, label: 'Sign Out', onClick: handleLogout, active: false },
        ].map(item => (
          <button key={item.label} onClick={item.onClick}
            className={`w-full flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm transition-colors ${item.active ? 'bg-primary-light text-primary font-heading font-semibold' : 'text-muted-foreground hover:bg-muted'}`}>
            <item.icon className="w-4 h-4" /> {item.label}
          </button>
        ))}
      </nav>
      <div className="bg-primary-light rounded-xl p-3 mt-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-primary leading-relaxed">This AI tool is for informational purposes only. Always consult a healthcare professional.</p>
        </div>
      </div>
    </aside>
  );

  // Mobile bottom tabs
  const MobileTabs = () => (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border h-[60px] flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
      {[
        { icon: MessageCircle, label: 'Chat', s: 'chat' as Screen },
        { icon: ClipboardList, label: 'History', s: 'dashboard' as Screen },
        { icon: Bell, label: 'Reminders', s: 'dashboard' as Screen },
        { icon: User, label: 'Profile', s: 'dashboard' as Screen },
      ].map(t => (
        <button key={t.label} onClick={() => setScreen(t.s)}
          className={`flex flex-col items-center gap-0.5 text-[11px] ${screen === t.s ? 'text-primary' : 'text-muted-foreground'}`}>
          <t.icon className="w-5 h-5" />
          {t.label}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen">
      {screen === 'landing' && (
        <LandingScreen
          onGetStarted={() => { setAuthTab('register'); setScreen('auth'); }}
          onSignIn={() => { setAuthTab('login'); setScreen('auth'); }}
          onDemo={handleDemoMode}
        />
      )}
      {screen === 'auth' && (
        <AuthScreen initialTab={authTab} onBack={() => setScreen('landing')} onAuth={handleAuth} />
      )}
      {(screen === 'chat' || screen === 'results' || screen === 'dashboard') && (
        <div className="flex flex-col h-screen">
          <Navbar />
          <div className="flex flex-1 overflow-hidden">
            {screen === 'chat' && <Sidebar />}
            <main className="flex-1 flex flex-col overflow-hidden">
              {screen === 'chat' && (
                <ChatScreen
                  onViewResults={() => setScreen('results')}
                  predictionResult={predictionResult}
                  setPredictionResult={setPredictionResult}
                />
              )}
              {screen === 'results' && (
                <div className="flex-1 overflow-y-auto">
                  <ResultsScreen
                    result={predictionResult}
                    user={user}
                    onBack={() => setScreen('chat')}
                    onNewCheck={resetChat}
                    onDashboard={() => setScreen('dashboard')}
                    onToast={addToast}
                  />
                </div>
              )}
              {screen === 'dashboard' && (
                <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
                  <DashboardScreen user={user} onStartCheck={resetChat} onToast={addToast} />
                </div>
              )}
            </main>
          </div>
          <MobileTabs />
        </div>
      )}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
