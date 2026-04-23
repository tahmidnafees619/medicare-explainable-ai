import { useState, useEffect } from 'react';
import { Activity, Clock, Bell, TrendingUp, ChevronDown, ChevronUp, Trash2, Check, Pencil, Plus, X, Pill, Calendar as CalIcon, AlertCircle } from 'lucide-react';
import { getUserHistory, getReminders, deleteReminder, markReminderDone, addReminder } from '@/api/config';

interface Props {
  user: any;
  onStartCheck: () => void;
  onToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const freqOptions = ['Once daily', 'Twice daily', 'Every 8 hours', 'Three times daily', 'As needed'];

export default function DashboardScreen({ user, onStartCheck, onToast }: Props) {
  const [history, setHistory] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ medicineName: '', dosage: '', frequency: 'Once daily', startDate: '', reminderTime: '', notes: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formLoading, setFormLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [hRes, rRes] = await Promise.all([getUserHistory(), getReminders()]);
    setHistory(hRes.history || []);
    setReminders(rRes.reminders || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleDeleteReminder = async (id: number) => {
    if (!confirm('Delete this reminder?')) return;
    const res = await deleteReminder(id);
    if (res.error) { onToast(res.error, 'error'); return; }
    setReminders(prev => prev.filter(r => r.id !== id));
    onToast('Reminder deleted', 'success');
  };

  const handleMarkDone = async (id: number) => {
    const res = await markReminderDone(id);
    if (res.error) { onToast(res.error, 'error'); return; }
    onToast('Marked as done!', 'success');
    loadData();
  };

  const handleAddReminder = async () => {
    const e: Record<string, string> = {};
    if (!form.medicineName) e.medicineName = 'Required';
    if (!form.dosage) e.dosage = 'Required';
    if (!form.startDate) e.startDate = 'Required';
    if (!form.reminderTime) e.reminderTime = 'Required';
    setFormErrors(e);
    if (Object.keys(e).length) return;
    setFormLoading(true);
    const res = await addReminder(form);
    setFormLoading(false);
    if (res.error) { onToast(res.error, 'error'); return; }
    setShowModal(false);
    setForm({ medicineName: '', dosage: '', frequency: 'Once daily', startDate: '', reminderTime: '', notes: '' });
    onToast('Reminder added!', 'success');
    loadData();
  };

  const mostCommon = history.length ? Object.entries(history.reduce((acc: any, h: any) => { acc[h.disease] = (acc[h.disease] || 0) + 1; return acc; }, {})).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || '—' : '—';

  const relativeTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const diff = Date.now() - d.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const Skeleton = () => <div className="skeleton-shimmer rounded-2xl h-20" />;

  return (
    <div className="screen-fade max-w-[1000px] mx-auto px-5 py-10">
      <div className="flex items-start justify-between mb-8 flex-wrap gap-2">
        <div>
          <h1 className="font-heading font-extrabold text-2xl">Good morning, {user?.name} 👋</h1>
          <p className="text-muted-foreground text-[15px]">Here's your health overview</p>
        </div>
        <span className="text-muted-foreground text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} />) : (
          <>
            <StatCard icon={Activity} bg="bg-primary-light" color="text-primary" value={history.length} label="Total Symptom Checks" />
            <StatCard icon={Clock} bg="bg-secondary/30" color="text-secondary-foreground" value={history[0] ? relativeTime(history[0].created_at) : 'No checks'} label="Last Check" />
            <StatCard icon={Bell} bg="bg-accent/30" color="text-accent-foreground" value={reminders.length} label="Active Reminders" />
            <StatCard icon={TrendingUp} bg="bg-purple/30" color="text-foreground" value={mostCommon} label="Most Common" />
          </>
        )}
      </div>

      {/* History */}
      <div className="mb-8">
        <h2 className="font-heading font-bold text-lg mb-4">Recent Symptom Checks</h2>
        {loading ? <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} />)}</div> :
          history.length === 0 ? (
            <div className="card-medicare p-8 text-center">
              <Activity className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="font-heading font-bold text-sm mb-1">No checks yet</p>
              <p className="text-muted-foreground text-sm mb-3">Start your first symptom check</p>
              <button onClick={onStartCheck} className="btn-primary text-sm py-2 px-5">Start Check →</button>
            </div>
          ) : (
            <div className="space-y-3">
              {history.slice(0, 3).map((h: any) => (
                <div key={h.id} className="card-medicare p-5">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedId(expandedId === h.id ? null : h.id)}>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${h.confidence >= 80 ? 'bg-secondary' : h.confidence >= 60 ? 'bg-accent2' : 'bg-destructive'}`} />
                      <div>
                        <p className="font-heading font-bold text-[15px]">{h.disease}</p>
                        <p className="text-muted-foreground text-xs">{(h.symptoms || []).join(', ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="bg-primary-light text-primary text-xs px-2.5 py-1 rounded-full font-semibold">{h.confidence}%</span>
                      <span className="text-muted-foreground text-xs">{new Date(h.created_at).toLocaleDateString()}</span>
                      {expandedId === h.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>
                  {expandedId === h.id && (
                    <div className="mt-3 pt-3 border-t border-border text-sm text-muted-foreground leading-relaxed">
                      {h.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Reminders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-lg">💊 Medication Reminders</h2>
          <button onClick={() => setShowModal(true)} className="btn-outline-primary flex items-center gap-1"><Plus className="w-4 h-4" /> Add Reminder</button>
        </div>
        {loading ? <div className="space-y-3">{[1, 2].map(i => <Skeleton key={i} />)}</div> :
          reminders.length === 0 ? (
            <div className="card-medicare p-8 text-center">
              <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="font-heading font-bold text-sm mb-1">No reminders set</p>
              <button onClick={() => setShowModal(true)} className="text-primary text-sm hover:underline mt-1">+ Add your first reminder</button>
            </div>
          ) : (
            <div className="space-y-3">
              {reminders.map((r: any) => (
                <div key={r.id} className="card-medicare border-l-4 border-l-accent2 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-accent2/30 flex items-center justify-center"><Pill className="w-4 h-4 text-accent-foreground" /></div>
                    <div>
                      <p className="font-heading font-bold text-sm">{r.medicine_name}</p>
                      <p className="text-muted-foreground text-xs">{r.dosage} — {r.frequency}</p>
                      {r.next_reminder && <p className="text-xs mt-0.5">Next: {new Date(r.next_reminder).toLocaleString()}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => onToast('Edit coming soon', 'info')} className="p-2 rounded-full hover:bg-muted transition-colors"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                    <button onClick={() => handleMarkDone(r.id)} className="p-2 rounded-full hover:bg-muted transition-colors"><Check className="w-4 h-4 text-secondary" /></button>
                    <button onClick={() => handleDeleteReminder(r.id)} className="p-2 rounded-full hover:bg-muted transition-colors"><Trash2 className="w-4 h-4 text-destructive" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Add Reminder Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5" onClick={() => setShowModal(false)}>
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
          <div className="card-medicare modal-enter relative z-10 w-full max-w-[420px] rounded-3xl p-8" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            <h3 className="font-heading font-bold text-xl mb-5">Add Medication Reminder 💊</h3>
            <div className="space-y-3">
              <div className="relative">
                <Pill className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                <input placeholder="e.g. Paracetamol 500mg" value={form.medicineName} onChange={e => setForm({ ...form, medicineName: e.target.value })} className={`input-medicare ${formErrors.medicineName ? 'input-error' : ''}`} />
              </div>
              <input placeholder="e.g. 1 tablet" value={form.dosage} onChange={e => setForm({ ...form, dosage: e.target.value })} className={`input-medicare pl-4 ${formErrors.dosage ? 'input-error' : ''}`} />
              <select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })} className="input-medicare pl-4 appearance-none">
                {freqOptions.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <div className="relative">
                <CalIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className={`input-medicare ${formErrors.startDate ? 'input-error' : ''}`} />
              </div>
              <div className="relative">
                <Clock className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                <input type="time" value={form.reminderTime} onChange={e => setForm({ ...form, reminderTime: e.target.value })} className={`input-medicare ${formErrors.reminderTime ? 'input-error' : ''}`} />
              </div>
              <textarea rows={2} placeholder="Any additional notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="input-medicare pl-4 resize-none" />
              <button onClick={handleAddReminder} disabled={formLoading} className="btn-primary w-full py-3 text-[15px]">
                {formLoading ? 'Saving...' : 'Save Reminder'}
              </button>
              <button onClick={() => setShowModal(false)} className="btn-ghost w-full py-2.5 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, bg, color, value, label }: { icon: any; bg: string; color: string; value: any; label: string }) {
  return (
    <div className="card-medicare p-5">
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="font-heading font-bold text-xl">{value}</p>
      <p className="text-muted-foreground text-xs">{label}</p>
    </div>
  );
}
