import React, { useState, useEffect } from 'react';
import { useLanguage } from '../translations.jsx';
import { api } from '../services/api.js';
import { X, Lock, User as UserIcon, Phone, ArrowRight, AlertCircle, Share2, Sparkles, Eye, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react';

export const AuthModal = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onLogin,
  onRegister
}) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState(initialMode);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role] = useState('client');
  const [agentCode, setAgentCode] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref') || params.get('referral') || params.get('agent');
      if (ref) {
        setReferralCode(ref);
        setMode('register');
      }
    }
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!identifier.trim()) {
          throw new Error('Nyamuneka andika numero ya telefoni cyangwa email.');
        }
        await onLogin(identifier.trim(), password);
        onClose();
      } else if (mode === 'register') {
        if (!fullName.trim()) {
          throw new Error('Izina ryose rirakenewe.');
        }
        if (!phone.trim()) {
          throw new Error('Numero ya telefoni irakenewe.');
        }
        if (password !== confirmPassword) {
          throw new Error('Umubare w\'ibanga n\'uwo kuwugenzura (Confirm Password) ntibahuye. Nyamuneka bisubiremo.');
        }
        await onRegister({
          password,
          fullName: fullName.trim(),
          phone: phone.trim(),
          role,
          agentCode,
          referredBy: referralCode || agentCode
        });
        onClose();
      } else if (mode === 'recovery') {
        const phoneOrId = identifier.trim() || phone.trim();
        if (!phoneOrId) {
          throw new Error('Nyamuneka andika numero ya telefoni yawe.');
        }
        if (!password) {
          throw new Error('Nyamuneka andika umubare w\'ibanga mushya.');
        }
        if (password !== confirmPassword) {
          throw new Error('Umubare w\'ibanga mushya n\'uwo kuwugenzura (Confirm Password) ntibahuye.');
        }
        const res = await api.auth.recoverPassword({
          identifier: phoneOrId,
          newPassword: password
        });
        setSuccessMessage(res.message || 'Umubare w\'ibanga wahinduwe neza! Urasabwa kwinjira.');
        setMode('login');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError(err.message || 'Igikorwa cyagize ikibazo. Nyamuneka gerageza tena.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-100 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
            {mode === 'recovery' ? (
              <KeyRound className="w-6 h-6 stroke-[2.5]" />
            ) : (
              <Lock className="w-6 h-6 stroke-[2.5]" />
            )}
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {mode === 'login'
              ? 'Murakaza Neza'
              : mode === 'register'
              ? 'Rema Konti ya InvestPro'
              : 'Kugarura Umubare w\'Ibanga'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login'
              ? 'Injira ukoresheje numero ya telefoni cyangwa email (Admin) n\'umubare w\'ibanga'
              : mode === 'register'
              ? 'Iyandikishe ukoresheje izina, numero ya telefoni n\'umubare w\'ibanga'
              : 'Andika numero ya telefoni yawe n\'umubare w\'ibanga mushya wifuza gukoresha'}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        {mode !== 'recovery' && (
          <div className="grid grid-cols-2 bg-slate-800/80 p-1 rounded-xl mb-6 border border-slate-700/50">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setSuccessMessage(null); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('login')}
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); setSuccessMessage(null); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('register')}
            </button>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>{successMessage}</div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'login' ? (
            /* LOGIN MODE FIELDS */
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Numero ya Telefoni <span className="text-slate-400 font-normal">(cyangwa Email niba uri Admin)</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Ugereranyije: 0788000000 cyangwa habimana@gmail.com"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          ) : mode === 'recovery' ? (
            /* RECOVERY MODE FIELDS */
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Numero ya Telefoni (Registered Phone Number)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier || phone}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setPhone(e.target.value);
                  }}
                  placeholder="Ugereranyije: 0788000000"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          ) : (
            /* REGISTER MODE FIELDS */
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('fullName')}</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ugereranyije: Keza Marie"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Numero ya Telefoni (Phone Number)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ugereranyije: 0788000000"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Referral / Agent Code optional input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">Kode / Link y'Uwagutumiye (Referral Code)</label>
                  {referralCode && (
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Link Detected
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Share2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={referralCode || agentCode}
                    onChange={(e) => {
                      setReferralCode(e.target.value);
                      setAgentCode(e.target.value);
                    }}
                    placeholder="Ugereranyije: REF-XXXX / AGENT-ALPHA"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* Password Field with Show/Hide Toggle */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">
                {mode === 'recovery' ? "Umubare w'Ibanga Mushya (New Password)" : "Umubare w'Ibanga (Password)"}
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => { setMode('recovery'); setError(null); setSuccessMessage(null); }}
                  className="text-[11px] text-amber-400 font-semibold hover:underline cursor-pointer"
                >
                  Wibagiwe umubare w'ibanga?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-0.5 cursor-pointer"
                title={showPassword ? "Hisha Password" : "Erekana Password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field (Register & Recovery Modes) with Show/Hide Toggle */}
          {(mode === 'register' || mode === 'recovery') && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Subiramo Umubare w'Ibanga (Confirm Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-0.5 cursor-pointer"
                  title={showConfirmPassword ? "Hisha Password" : "Erekana Password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 mt-6 cursor-pointer"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                {mode === 'login'
                  ? t('login')
                  : mode === 'register'
                  ? t('register')
                  : 'Hindura Umubare w\'Ibanga'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          {mode === 'recovery' ? (
            <p className="text-xs text-slate-400">
              Wibutse umubare w'ibanga?
              <button
                onClick={() => { setMode('login'); setError(null); setSuccessMessage(null); }}
                className="ml-1 text-emerald-400 font-semibold hover:underline cursor-pointer"
              >
                Kora Login
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              {mode === 'login' ? "Ntabwo ufite konti?" : "Ufite konti usanzwe?"}
              <button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); setSuccessMessage(null); }}
                className="ml-1 text-emerald-400 font-semibold hover:underline cursor-pointer"
              >
                {mode === 'login' ? t('register') : t('login')}
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
