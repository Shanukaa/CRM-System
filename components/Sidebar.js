'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, CalendarCheck, LogOut, UserCog, Menu, X, Stethoscope, ClipboardList, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Sidebar({ user }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [leadsOpen, setLeadsOpen] = useState(pathname.startsWith('/dashboard/leads'));

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/clients', label: 'Client List', icon: Users },
    { href: '/dashboard/appointments', label: 'Appointment List', icon: CalendarCheck },
  ];
  if (user.usertype === 'admin') {
    links.push({ href: '/dashboard/users', label: 'Users', icon: UserCog });
  }

  const leadLinks = [
    { href: '/dashboard/leads/fat-contouring', label: 'FAT Contouring' },
    { href: '/dashboard/leads/body-fillers', label: 'Body Fillers' },
  ];
  const leadsActive = pathname.startsWith('/dashboard/leads');

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-40 bg-slate-900 text-white p-2 rounded-xl shadow-lift"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={`fixed z-30 top-0 left-0 h-full w-64 bg-slate-900 text-slate-300 transform ${
          open ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-200 flex flex-col`}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 shadow-lift">
              <Stethoscope size={18} className="text-white" />
            </span>
            <h1 className="text-base font-semibold text-white tracking-tight">Clinic Manager</h1>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            {user.username} <span className="text-slate-600">·</span> <span className="capitalize">{user.usertype}</span>
          </p>
        </div>

        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lift'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={17} className={active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} />
                {label}
              </Link>
            );
          })}

          <button
            onClick={() => setLeadsOpen(!leadsOpen)}
            className={`w-full group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              leadsActive ? 'text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <ClipboardList size={17} className={leadsActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'} />
            <span className="flex-1 text-left">Lead Form</span>
            <ChevronDown size={15} className={`transition-transform ${leadsOpen ? 'rotate-180' : ''}`} />
          </button>

          {leadsOpen && (
            <div className="pl-6 space-y-1">
              {leadLinks.map(({ href, label }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`block px-3.5 py-2 rounded-lg text-sm transition-all ${
                      active ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lift' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={logout}
            className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-rose-400 w-full px-3.5 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
          >
            <LogOut size={17} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
