import { useState } from 'react';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle, Stethoscope } from 'lucide-react';
import { loginUser, registerUser } from '@/api/config';

interface Props {
  initialTab: 'login' | 'register';
  onBack: () => void;
  onAuth: (user: any, token: string) => void;
}

export default function AuthScreen({ initialTab, onBack, onAuth }: Props) {
  const [tab, setTab] = useState(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [name, setName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.includes('@') || !email.includes('.')) e.email = 'Invalid email';
    if (password.length < 8) e.password = 'Min 8 characters';
    if (tab === 'register') {
      if (!name.trim()) e.name = 'Name required';
      if (password !== confirmPass) e.confirmPass = 'Passwords don\'t match';
      if (!agreed) e.agreed = 'You must agree to terms';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true); setApiError('');
    const res = await loginUser(email, password);
    setLoading(false);
    if (res.error) { setApiError(res.error); return; }
    onAuth(res.user, res.token);
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true); setApiError('');
    const res = await registerUser(name, email, password);
    if (res.error) { setLoading(false); setApiError(res.error); return; }
    const loginRes = await loginUser(email, password);
    setLoading(false);
    if (loginRes.error) { setApiError(loginRes.error); return; }
    onAuth(loginRes.user, loginRes.token);
  };

  const inputClass = (field: string) =>
    `input-medicare ${errors[field] ? 'input-error' : ''}`;

  return (
    <div className="screen-fade min-h-screen flex items-start justify-center pt-16 px-5">
      <div className="w-full max-w-[440px]">
        <button onClick={onBack} className="flex items-center gap-1 text-muted-foreground text-sm mb-6 hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="card-medicare p-8">
          <div className="flex items-center gap-2 mb-6 justify-center">
            <Stethoscope className="w-6 h-6 text-primary" />
            <span className="font-heading font-bold text-lg text-primary">MediCare AI</span>
          </div>

          {/* Tabs */}
          <div className="flex bg-muted rounded-full p-1 mb-6">
            {(['login', 'register'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setApiError(''); setErrors({}); }}
                className={`flex-1 py-2 rounded-full text-sm font-heading font-semibold transition-all ${tab === t ? 'bg-card shadow-soft text-foreground' : 'text-muted-foreground'}`}>
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {tab === 'login' ? (
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass('email')} />
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                <input type={showPass ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass('password')} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-3.5 text-muted-foreground">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}
              </div>
              <button onClick={handleLogin} disabled={loading} className="btn-primary w-full py-3 text-[15px]">
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                <input placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className={inputClass('name')} />
                {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
              </div>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass('email')} />
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                <input type={showPass ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass('password')} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-3.5 text-muted-foreground">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                <input type="password" placeholder="Confirm Password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className={inputClass('confirmPass')} />
                {errors.confirmPass && <p className="text-destructive text-xs mt-1">{errors.confirmPass}</p>}
              </div>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-1 accent-primary" />
                <span className="text-muted-foreground">I agree to the Terms of Service and Privacy Policy</span>
              </label>
              {errors.agreed && <p className="text-destructive text-xs">{errors.agreed}</p>}
              <button onClick={handleRegister} disabled={loading} className="btn-primary w-full py-3 text-[15px]">
                {loading ? 'Creating account...' : 'Create Account →'}
              </button>
            </div>
          )}

          {apiError && (
            <div className="mt-4 bg-destructive/15 border border-destructive rounded-xl p-3 flex items-start gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <span className="text-destructive">{apiError}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
