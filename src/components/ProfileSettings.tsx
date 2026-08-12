import React, { useState } from 'react';
import { User } from '../types';
import { useLanguage } from '../translations';
import { User as UserIcon, Phone, Lock, Save, CheckCircle, AlertCircle, Shield, KeyRound, Copy, Check } from 'lucide-react';

interface ProfileSettingsProps {
  user: User;
  onUpdateProfile: (data: { fullName?: string; phone?: string; avatarUrl?: string; currentPassword?: string; newPassword?: string }) => Promise<void>;
  onClose: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  user,
  onUpdateProfile,
  onClose
}) => {
  const { t } = useLanguage();
  const [fullName, setFullName] = useState(user.fullName || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (newPassword && newPassword !== confirmPassword) {
      setStatusMsg({ type: 'error', text: 'Ijambo ry\'ibanga rishya n\'iryo kwemeza ntibyahuye.' });
      return;
    }

    setLoading(true);
    try {
      await onUpdateProfile({
        fullName,
        phone,
        avatarUrl,
        ...(newPassword ? { currentPassword, newPassword } : {})
      });
      setStatusMsg({ type: 'success', text: 'Umwirondoro wawe wavuguruwe neza!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Kuvugurura umwirondoro byananiwe.' });
    } finally {
      setLoading(false);
    }
  };

  const copyAgentCode = () => {
    if (user.agentCode) {
      navigator.clipboard.writeText(user.agentCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto shadow-xl text-slate-100">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-emerald-400" />
            {t('profileSettings')}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Cunga umwirondoro wawe n\'umutekano wa konti</p>
        </div>
        <button
          onClick={onClose}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          Subira Kuri Dashboard
        </button>
      </div>

      {statusMsg && (
        <div
          className={`mb-6 p-4 rounded-xl text-xs flex items-center gap-2 border ${
            statusMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Account Identity Summary Card */}
      <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center gap-4">
        <img
          src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`}
          alt={user.fullName}
          className="w-16 h-16 rounded-full ring-4 ring-emerald-500/20 object-cover"
        />
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h3 className="text-base font-bold text-white">{user.fullName}</h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {user.role}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
          <p className="text-xs text-emerald-400 font-semibold mt-1">
            {t('balance')}: ${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {user.agentCode && (
          <div className="bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-center">
            <div className="text-[10px] text-slate-400 font-medium">Kode yawe ya Agent</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-mono font-bold text-amber-400">{user.agentCode}</span>
              <button
                type="button"
                onClick={copyAgentCode}
                className="p-1 hover:bg-slate-800 text-slate-300 rounded transition-colors"
                title="Kopiya Kode"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details */}
        <div>
          <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            Amakuru Bwite
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">{t('fullName')}</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">{t('phone')}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+250 788 000 000"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Ifoto / Avatar URL (Niba Uyifite)</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="pt-4 border-t border-slate-800">
          <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-400" />
            Umutekano & Guhindura Ijambo ry'Ibanga
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Ijambo ry\'ibanga ryawe ririnzwe mu buryo bwa bcrypt hashing. Shyiramo iry\'ubushize niba ushaka kuryandikuza gishya.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Ijambo ry'Ibanga rya Mbere</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Ijambo ry'Ibanga Rishya</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Emeza Ijambo ry'Ibanga Rishya</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Save className="w-4 h-4" /> Bika Impinduka
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
