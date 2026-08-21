import { TrendingUp, MessageSquare, Phone, UserPlus, Target } from 'lucide-react';

const CHANNEL_META = {
  messages: { label: 'Messages', icon: MessageSquare, color: 'text-brand-600 bg-brand-50' },
  calls: { label: 'Calls', icon: Phone, color: 'text-amber-600 bg-amber-50' },
  leads: { label: 'Leads', icon: UserPlus, color: 'text-emerald-600 bg-emerald-50' },
};

function strengthLabel(r) {
  const abs = Math.abs(r);
  if (abs >= 0.7) return { text: 'Strong', color: 'text-emerald-600' };
  if (abs >= 0.4) return { text: 'Moderate', color: 'text-amber-600' };
  if (abs >= 0.2) return { text: 'Weak', color: 'text-slate-500' };
  return { text: 'Little to none', color: 'text-slate-400' };
}

export default function ActivityImpactCard({ impact }) {
  if (!impact) return null;
  const { correlation, strongestDriver, avgActivityPerAppointment } = impact;
  const overall = strengthLabel(correlation.activity);
  const driverMeta = strongestDriver ? CHANNEL_META[strongestDriver] : null;
  const DriverIcon = driverMeta?.icon;

  const ranked = ['messages', 'calls', 'leads']
    .map((key) => ({ key, r: correlation[key], ...CHANNEL_META[key] }))
    .sort((a, b) => Math.abs(b.r) - Math.abs(a.r));

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5">
      <div className="flex items-center gap-2 mb-1">
        <Target size={16} className="text-brand-600" />
        <p className="text-sm font-semibold text-slate-700">How Activity Drives Appointments</p>
      </div>
      <p className="text-xs text-slate-400 mb-4">Based on correlation between daily activity and appointments booked that day</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500 mb-1">Overall relationship</p>
          <p className={`text-lg font-bold ${overall.color}`}>
            {overall.text} <span className="text-slate-400 font-normal text-sm">(r = {correlation.activity.toFixed(2)})</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {correlation.activity > 0
              ? 'More total activity tends to bring in more appointments.'
              : 'Total activity has little measurable effect on appointments booked.'}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500 mb-1">Effort per appointment</p>
          <p className="text-lg font-bold text-slate-800">
            {avgActivityPerAppointment ? avgActivityPerAppointment.toFixed(1) : '—'}
            <span className="text-slate-400 font-normal text-sm"> activity events / appointment</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">Messages + calls + leads combined, on average, per appointment entered.</p>
        </div>
      </div>

      <p className="text-xs font-semibold text-slate-500 mb-2">Which channel moves appointments most</p>
      <div className="space-y-2 mb-4">
        {ranked.map(({ key, r, label, icon: Icon, color }) => {
          const abs = Math.min(Math.abs(r), 1);
          return (
            <div key={key} className="flex items-center gap-3">
              <span className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${color}`}>
                <Icon size={15} />
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">{label}</span>
                  <span className="text-slate-400">r = {r.toFixed(2)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${r >= 0 ? 'bg-brand-500' : 'bg-rose-400'}`}
                    style={{ width: `${abs * 100}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {driverMeta && (
        <div className="flex items-start gap-3 rounded-xl border border-brand-100 bg-brand-50/60 p-4">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white text-brand-600 shrink-0">
            <TrendingUp size={16} />
          </span>
          <div className="text-xs text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-700">To increase appointments: </span>
            {Math.abs(correlation[strongestDriver]) >= 0.2 ? (
              <>
                focus on <span className="font-semibold" style={{ textTransform: 'lowercase' }}>{driverMeta.label.toLowerCase()}</span> — it has the
                strongest link to appointments booked out of your three activity types. Try increasing daily {driverMeta.label.toLowerCase()} volume
                and keep an eye on this chart to confirm appointments follow.
                {avgActivityPerAppointment && (
                  <> As a rough target, every ~{Math.round(avgActivityPerAppointment)} extra activity touches has historically produced about 1 more appointment.</>
                )}
              </>
            ) : (
              <>
                none of the three channels shows a strong individual link to appointments yet. It's worth logging more daily records so the trend
                becomes clearer, and in the meantime focus on the overall volume of activity rather than one channel.
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
