import React, { useState, useRef, useEffect } from 'react';
import { User, AppNotification } from '../types';
import { useLanguage, Language } from '../translations';
import { 
  TrendingUp, 
  ShieldCheck, 
  UserCheck, 
  Wallet, 
  User as UserIcon, 
  LogOut, 
  Settings, 
  ChevronDown,
  Globe,
  Smartphone,
  ArrowUpRight,
  ArrowDownLeft,
  Check,
  Bell,
  CheckCheck,
  Clock,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

interface NavbarProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenProfile: () => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenPwaModal?: () => void;
  onLogout: () => void;
  notifications?: AppNotification[];
  onMarkNotificationRead?: (id: string) => void;
  onMarkAllNotificationsRead?: () => void;
  onSelectNotification?: (notif: AppNotification) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenProfile,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenPwaModal,
  onLogout,
  notifications = [],
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onSelectNotification
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage, t } = useLanguage();

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
        setLangDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getRoleBadge = () => {
    if (!user) return null;
    switch (user.role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <ShieldCheck className="w-3 h-3" /> {t('roleAdmin')}
          </span>
        );
      case 'agent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <UserCheck className="w-3 h-3" /> {t('roleAgent')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Wallet className="w-3 h-3" /> {t('roleClient')}
          </span>
        );
    }
  };

  const languagesList: { code: Language; name: string; flag: string }[] = [
    { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform">
              <TrendingUp className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white">{t('appName')}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 uppercase tracking-widest hidden sm:inline-block">
                  Daily Yield
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block leading-tight">{t('appTagline')}</p>
            </div>
          </div>

          {/* Right Section / Menu Dropdown Container */}
          <div className="flex items-center gap-2" ref={dropdownRef}>

            {/* Wallet Balance Badge (Direct Access for Logged in Users) */}
            {user && (
              <div 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 px-2.5 py-1.5 rounded-xl cursor-pointer transition-all active:scale-95"
              >
                <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-slate-400 font-semibold leading-none uppercase tracking-wider">{t('walletBalance')}</div>
                  <div className="font-extrabold text-emerald-400 text-xs sm:text-sm leading-tight">
                    {user.balance.toLocaleString('en-US')} <span className="text-[10px]">FRW</span>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Bell Dropdown Trigger */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => {
                    setNotifDropdownOpen(!notifDropdownOpen);
                    setDropdownOpen(false);
                  }}
                  className="relative p-2 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-all active:scale-95 flex items-center justify-center"
                  title="Notificasiyo"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-2 ring-slate-900 animate-bounce">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Popover */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl shadow-slate-950/90 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-3.5 bg-slate-800/90 border-b border-slate-700/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-white">Notificasiyo</span>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            {unreadCount} nshya
                          </span>
                        )}
                      </div>

                      {unreadCount > 0 && onMarkAllNotificationsRead && (
                        <button
                          onClick={() => onMarkAllNotificationsRead()}
                          className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                        >
                          <CheckCheck className="w-3.5 h-3.5" /> Soma byose
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 p-1">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-slate-500 text-xs">
                          <Bell className="w-7 h-7 mx-auto mb-2 text-slate-600 opacity-50" />
                          <p className="font-semibold text-slate-400">Nta notificasiyo uhari!</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Iyo abakiriya basabye kubitsa cyangwa kubikuza, amakuru azaza hano.</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              if (onMarkNotificationRead && !notif.read) {
                                onMarkNotificationRead(notif.id);
                              }
                              if (onSelectNotification) {
                                onSelectNotification(notif);
                              }
                              setNotifDropdownOpen(false);
                            }}
                            className={`p-3 rounded-xl transition-all cursor-pointer flex items-start gap-3 my-1 ${
                              notif.read ? 'bg-slate-900/40 opacity-70 hover:bg-slate-800/40' : 'bg-slate-800/80 hover:bg-slate-800 border-l-4 border-emerald-500 shadow-sm'
                            }`}
                          >
                            <div className="shrink-0 mt-0.5">
                              {notif.type === 'deposit_request' && (
                                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30">
                                  <ArrowDownLeft className="w-4 h-4" />
                                </div>
                              )}
                              {notif.type === 'withdrawal_request' && (
                                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30">
                                  <ArrowUpRight className="w-4 h-4" />
                                </div>
                              )}
                              {notif.type === 'deposit_processed' && (
                                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30">
                                  <Check className="w-4 h-4" />
                                </div>
                              )}
                              {notif.type === 'withdrawal_processed' && (
                                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/30">
                                  <Check className="w-4 h-4" />
                                </div>
                              )}
                              {notif.type === 'general' && (
                                <div className="p-2 rounded-xl bg-slate-700 text-slate-300">
                                  <Bell className="w-4 h-4" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-bold text-white truncate">{notif.title}</span>
                                <span className="text-[9px] text-slate-500 shrink-0 font-mono">
                                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-300 mt-1 leading-snug line-clamp-2">{notif.message}</p>
                              {user.role === 'agent' && (notif.type === 'deposit_request' || notif.type === 'withdrawal_request') && (
                                <span className="inline-block mt-1 text-[10px] font-bold text-blue-400 hover:underline">
                                  Kanda hano kugirango wemeze →
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Menu Dropdown Trigger */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-all active:scale-95"
                >
                  <img
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`}
                    alt={user.fullName}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-emerald-500/40 object-cover"
                  />
                  <span className="text-xs font-bold hidden sm:inline-block max-w-[100px] truncate">
                    {user.fullName.split(' ')[0]}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu Overlay */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl shadow-slate-950/80 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    
                    {/* User Profile Header */}
                    <div className="p-4 bg-gradient-to-br from-slate-800/90 to-slate-900 border-b border-slate-800">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`}
                          alt={user.fullName}
                          className="w-11 h-11 rounded-full ring-2 ring-emerald-500/50 object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-black text-white truncate">{user.fullName}</div>
                          <div className="text-[11px] text-slate-400 truncate">{user.email || user.phone}</div>
                          <div className="mt-1">{getRoleBadge()}</div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Deposit & Withdraw Buttons */}
                    <div className="p-3 bg-slate-950/50 border-b border-slate-800/80 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => { onOpenDeposit(); setDropdownOpen(false); }}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-bold text-xs transition-all active:scale-95"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" /> Kubitsa (Deposit)
                      </button>
                      <button
                        onClick={() => { onOpenWithdraw(); setDropdownOpen(false); }}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 font-bold text-xs transition-all active:scale-95"
                      >
                        <ArrowDownLeft className="w-3.5 h-3.5" /> Kubikuza (Withdraw)
                      </button>
                    </div>

                    {/* Menu Items List */}
                    <div className="p-2 space-y-1">
                      
                      {/* Profile Settings */}
                      <button
                        onClick={() => { onOpenProfile(); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800/80 transition-colors"
                      >
                        <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
                          <Settings className="w-4 h-4" />
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-bold">{t('profile')} & Konti</div>
                          <div className="text-[10px] text-slate-400 font-normal">Hindura Umwirondoro & Umutekano</div>
                        </div>
                      </button>

                      {/* Language Selection Toggle */}
                      <div className="relative">
                        <button
                          onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800/80 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
                              <Globe className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                              <div className="font-bold">Ururimi (Language)</div>
                              <div className="text-[10px] text-slate-400 font-normal">
                                {languagesList.find(l => l.code === language)?.name}
                              </div>
                            </div>
                          </div>
                          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {langDropdownOpen && (
                          <div className="mt-1 ml-9 mr-2 space-y-0.5 border-l-2 border-slate-700/80 pl-2">
                            {languagesList.map((lang) => (
                              <button
                                key={lang.code}
                                onClick={() => { setLanguage(lang.code); setLangDropdownOpen(false); }}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                  language === lang.code ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-300 hover:bg-slate-800'
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <span>{lang.flag}</span>
                                  <span>{lang.name}</span>
                                </span>
                                {language === lang.code && <Check className="w-3.5 h-3.5" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Logout Footer */}
                    <div className="p-2 border-t border-slate-800/80 bg-slate-950/40">
                      <button
                        onClick={() => { onLogout(); setDropdownOpen(false); }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> {t('logout')}
                      </button>
                    </div>

                  </div>
                )}
              </div>
            ) : (
              /* Signed Out Actions */
              <div className="flex items-center gap-2">
                {/* Language Switcher Button for Guest */}
                <div className="relative">
                  <button
                    onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium flex items-center gap-1.5"
                    title="Guhitamo Ururimi"
                  >
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span className="uppercase text-[11px] font-bold">{language}</span>
                  </button>

                  {langDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-36 rounded-xl bg-slate-900 border border-slate-700 shadow-xl p-1 z-50">
                      {languagesList.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => { setLanguage(lang.code); setLangDropdownOpen(false); }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                            language === lang.code ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition-all"
                >
                  {t('login')}
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
                >
                  {t('register')}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};

