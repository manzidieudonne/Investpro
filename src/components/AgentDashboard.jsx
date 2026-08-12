import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useLanguage } from '../translations.jsx';
import { 
  UserCheck, 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  Search, 
  ShieldAlert, 
  CreditCard,
  AlertCircle,
  Sparkles,
  Users,
  Send,
  ArrowUpRight,
  ArrowDownLeft,
  Smartphone
} from 'lucide-react';

export const AgentDashboard = ({
  user,
  deposits = [],
  withdrawals = [],
  onProcessDeposit,
  onProcessWithdrawal,
  onDirectDeposit
}) => {
  const { t } = useLanguage();
  const [directEmail, setDirectEmail] = useState('');
  const [directAmount, setDirectAmount] = useState('100');
  const [directMethod, setDirectMethod] = useState('MTN Mobile Money');
  const [directRef, setDirectRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [myClients, setMyClients] = useState([]);
  const [clientSearch, setClientSearch] = useState('');

  // Agent Payment Number Configuration State
  const [paymentPhone, setPaymentPhone] = useState(user.agentPaymentNumber || user.phone || '');
  const [momoName, setMomoName] = useState(user.agentMomoName || user.fullName || '');
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneMsg, setPhoneMsg] = useState(null);

  const handleSavePaymentPhone = async (e) => {
    e.preventDefault();
    setSavingPhone(true);
    setPhoneMsg(null);
    try {
      const res = await api.agent.updatePaymentDetails({
        agentPaymentNumber: paymentPhone,
        agentMomoName: momoName
      });
      setPhoneMsg({ type: 'success', text: res.message || 'Nimero yawe yo kubikaho yahinduwe neza!' });
    } catch (err) {
      setPhoneMsg({ type: 'error', text: err.message || 'Guhindura nimero byananiwe' });
    } finally {
      setSavingPhone(false);
    }
  };

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clients = await api.agent.getClients();
        setMyClients(clients);
      } catch (err) {
        console.error('Failed to load agent clients:', err);
      }
    };
    fetchClients();
  }, [deposits]);

  const pendingDeposits = deposits.filter(d => d.status === 'pending');
  const processedDeposits = deposits.filter(d => d.status === 'approved' || d.status === 'rejected');
  const totalProcessedVolume = deposits
    .filter(d => d.status === 'approved')
    .reduce((acc, d) => acc + d.amount, 0);

  const handleProcess = async (id, action) => {
    setProcessingId(id);
    try {
      await onProcessDeposit(id, action);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDirectDepositSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      await onDirectDeposit({
        clientEmail: directEmail,
        amount: Number(directAmount),
        paymentMethod: directMethod,
        reference: directRef || `DIR-${Date.now()}`
      });
      setMessage({ type: 'success', text: `Umutungo wa ${Number(directAmount).toLocaleString('en-US')} FRW woherejwe neza kuri ${directEmail}` });
      setDirectEmail('');
      setDirectRef('');
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Kwohereza amafaranga byananiwe' });
    } finally {
      setLoading(false);
    }
  };

  const [copiedLink, setCopiedLink] = useState(false);
  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}/?ref=${user.referralCode || user.agentCode || user.id}`
    : `https://investpro.rw/?ref=${user.referralCode || user.agentCode || user.id}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-8">
      
      {/* Agent Referral Link Card */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/30 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" /> Agent Referral Link & 30% Bonus
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Saranganya Link yawe, urajya ubona <span className="text-blue-400">30%</span> ku bwiko bwose!
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Buri muntu mushya wiyandikishije ukoresheje link yawe ya Agent, kuri buri bwiko akora uhita uzamura <strong>30% y'amafaranga yabikije</strong> azajya mu mutungo wawe wo gushora imari (Investment Bonus)!
            </p>
          </div>

          <div className="w-full md:w-auto min-w-[280px] bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 space-y-2 shrink-0">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Link Yawe yo Gutumira</span>
              <span className="text-amber-400 font-mono text-[10px]">{user.referralCode || user.agentCode || user.id}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="bg-transparent text-xs text-blue-300 font-mono w-full focus:outline-none overflow-hidden text-ellipsis whitespace-nowrap"
              />
              <button
                onClick={copyReferralLink}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0 ${
                  copiedLink
                    ? 'bg-blue-500 text-slate-950'
                    : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30'
                }`}
              >
                {copiedLink ? 'Yakopiwe!' : 'Kopia Link'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Agent Payment Phone Number Configuration Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white">Nimero Yawe yo Kubikaho Amafaranga (MoMo / Airtel)</h3>
              <p className="text-xs text-slate-400">Abakiriya bawe ni iyi nimero babikaho amafaranga mu gihe basaba Deposit.</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
            Kode: {user.agentCode || user.referralCode}
          </span>
        </div>

        {phoneMsg && (
          <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${phoneMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'}`}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{phoneMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSavePaymentPhone} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nimero yo Kubikaho (Payment Phone Number)</label>
            <input
              type="text"
              required
              value={paymentPhone}
              onChange={(e) => setPaymentPhone(e.target.value)}
              placeholder="Urugero: 0788123456"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-amber-300 font-bold font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Izina Riri Kuri MoMo (Account Name)</label>
            <input
              type="text"
              required
              value={momoName}
              onChange={(e) => setMomoName(e.target.value)}
              placeholder="Urugero: Alpha Agent MoMo"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={savingPhone}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
            >
              {savingPhone ? (
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                'Bika Nimero yo Kubikaho'
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Agent Role Status Header */}
      <div className="bg-gradient-to-r from-blue-900/60 to-slate-900 border border-blue-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-2">
            <UserCheck className="w-4 h-4" /> Console ya Agent
          </div>
          <h2 className="text-2xl font-black text-white">Kwemeza Kubika Amafaranga & Ibikorwa</h2>
          <p className="text-xs text-slate-300 max-w-xl mt-1">
            Nka Agent, ufite ububasha bwo kwemeza no kugenzura ubusabe bwo kubika amafaranga bw'abakiriya n'ibikorwa bya wallet.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-700/80 shrink-0">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Kode ya Agent</div>
            <div className="text-sm font-mono font-bold text-amber-400">{user.agentCode || 'AGENT-ALPHA'}</div>
          </div>
          <div className="h-8 w-px bg-slate-700"></div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Amafaranga Yayobowe</div>
            <div className="text-sm font-black text-emerald-400">{totalProcessedVolume.toLocaleString('en-US')} FRW</div>
          </div>
        </div>
      </div>

      {/* Restrictions Disclaimer Notice */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-400">Inshingano & Amategeko ya Agent:</span> Ubasha kwemeza <strong>Kubikiriza (Deposits)</strong> no <strong>Kubikuriza (Withdrawals)</strong> amafaranga ku bakiriya wiyandikishije ukoresheje kode yawe ya Agent ({user.agentCode || user.referralCode}) cyangwa abo wahawe na Admin.
        </div>
      </div>

      {/* Direct Client Top-up Tool */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
          <PlusCircle className="w-5 h-5 text-blue-400" />
          Igikoresho cyo Kohereza Amafaranga Kuri Client Wowe (Kode: {user.agentCode || user.referralCode})
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          Shyira amafaranga kuri konti y'umukiriya wiyandikishije ukoresheje kode yawe ya Agent ({user.agentCode || user.referralCode}).
        </p>

        {message && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 border ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleDirectDepositSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Imeyili y'Umukiriya</label>
            <input
              type="email"
              required
              value={directEmail}
              onChange={(e) => setDirectEmail(e.target.value)}
              placeholder="client@investpro.com"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Ayo Ubika (FRW)</label>
            <input
              type="number"
              required
              min={10}
              value={directAmount}
              onChange={(e) => setDirectAmount(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-bold focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Uburyo bwo Kwishyura</label>
            <select
              value={directMethod}
              onChange={(e) => setDirectMethod(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="MTN Mobile Money">MTN Mobile Money (MoMo)</option>
              <option value="Airtel Money">Airtel Money</option>
              <option value="Cash mu Ntoki">Cash mu Ntoki</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" /> Bika Kuri Konti y'Umukiriya
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Pending Client Deposit Requests Queue */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              Ubusabe Bwo Kubika Amafaranga bw'Abakiriya Bawe ({pendingDeposits.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Aba ni abakiriya bakoresheje kode yawe ({user.agentCode || user.referralCode}). Igenzure inyitiro mbere yo kwemeza.</p>
          </div>
        </div>

        {pendingDeposits.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-semibold text-slate-300">Nta busabe budasubijwe buhari!</p>
            <p className="text-xs text-slate-500 mt-1">Nta busabe bw'abakiriya bakoresheje kode yawe ({user.agentCode || user.referralCode}) butaremerepwa buhari.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 px-3">Umukiriya</th>
                  <th className="pb-3 px-3">Amafaranga</th>
                  <th className="pb-3 px-3">Uburyo</th>
                  <th className="pb-3 px-3">Inyitiro</th>
                  <th className="pb-3 px-3">Tariki</th>
                  <th className="pb-3 px-3 text-right">Igikorwa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {pendingDeposits.map((dep) => (
                  <tr key={dep.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-white">{dep.userName}</div>
                      <div className="text-[10px] text-slate-400">{dep.userEmail}</div>
                    </td>
                    <td className="py-3.5 px-3 font-black text-sm text-emerald-400">
                      {dep.amount.toLocaleString('en-US')} FRW
                    </td>
                    <td className="py-3.5 px-3 text-slate-300 font-medium">{dep.paymentMethod}</td>
                    <td className="py-3.5 px-3 font-mono text-amber-400 font-semibold">{dep.transactionRef}</td>
                    <td className="py-3.5 px-3 text-slate-400">
                      {new Date(dep.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleProcess(dep.id, 'approve')}
                          disabled={processingId === dep.id}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Emeza
                        </button>
                        <button
                          onClick={() => handleProcess(dep.id, 'reject')}
                          disabled={processingId === dep.id}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-semibold text-xs flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Yangira
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Withdrawal Requests Queue for Agent (Kubikuriza) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-rose-400" />
              Ubusabe Bwo Kubikuriza (Withdrawals) bw'Abakiriya Bawe ({withdrawals.filter(w => w.status === 'pending').length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Aba ni abakiriya bakuriye ku kode yawe ({user.agentCode || user.referralCode}) cyangwa wahawe na Admin basaba kubikuriza amafaranga.
            </p>
          </div>
        </div>

        {withdrawals.filter(w => w.status === 'pending').length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-semibold text-slate-300">Nta busabe bwo kubikuriza budasubijwe buhari!</p>
            <p className="text-xs text-slate-500 mt-1">Abakiriya bawe bose ntabwo bafite ibipimo byo kubikuriza biri mu nkoni.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 px-3">Umukiriya</th>
                  <th className="pb-3 px-3">Ayo Kubikuriza</th>
                  <th className="pb-3 px-3">Uburyo & Konti</th>
                  <th className="pb-3 px-3">Tariki</th>
                  <th className="pb-3 px-3 text-right">Igikorwa (Kubikuriza)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {withdrawals
                  .filter(w => w.status === 'pending')
                  .map((wth) => (
                    <tr key={wth.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-white">{wth.userName}</div>
                        <div className="text-[10px] text-slate-400">{wth.userEmail}</div>
                      </td>
                      <td className="py-3.5 px-3 font-black text-sm text-rose-400">
                        {wth.amount.toLocaleString('en-US')} FRW
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-200">{wth.paymentMethod}</div>
                        <div className="font-mono text-[11px] text-amber-300">{wth.bankOrWalletDetails}</div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-400">
                        {new Date(wth.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={async () => {
                              if (onProcessWithdrawal) {
                                setProcessingId(wth.id);
                                try {
                                  await onProcessWithdrawal(wth.id, 'approve');
                                } finally {
                                  setProcessingId(null);
                                }
                              }
                            }}
                            disabled={processingId === wth.id}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Emeza Kubikuriza
                          </button>
                          <button
                            onClick={async () => {
                              if (onProcessWithdrawal) {
                                setProcessingId(wth.id);
                                try {
                                  await onProcessWithdrawal(wth.id, 'reject');
                                } finally {
                                  setProcessingId(null);
                                }
                              }
                            }}
                            disabled={processingId === wth.id}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-semibold text-xs flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Yangira
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assigned Clients List for this Agent */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Abakiriya Bange (My Clients: {myClients.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Urutonde rw'abakiriya bose bakoresheje kode yawe ya Agent ({user.agentCode || user.referralCode}). Kanda kuri client kugira ngo umubikire amafaranga direct.
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Shakisha umukiriya..."
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              className="bg-slate-800 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full sm:w-64"
            />
          </div>
        </div>

        {myClients.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Users className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-semibold text-slate-300">Nta mukiriya uriyandikisha ukoresheje kode yawe!</p>
            <p className="text-xs text-slate-500 mt-1">Saranganya link yawe ({referralLink}) kugira ngo abakiriya baze kuri konti yawe.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 px-3">Umukiriya</th>
                  <th className="pb-3 px-3">Telefoni</th>
                  <th className="pb-3 px-3">Balance (Yo Kubikuza)</th>
                  <th className="pb-3 px-3">Referral Bonus (Gushora)</th>
                  <th className="pb-3 px-3 text-right">Igikorwa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {myClients
                  .filter(c =>
                    c.fullName.toLowerCase().includes(clientSearch.toLowerCase()) ||
                    c.email.toLowerCase().includes(clientSearch.toLowerCase()) ||
                    (c.phone && c.phone.includes(clientSearch))
                  )
                  .map((client) => (
                    <tr key={client.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-white flex items-center gap-2">
                          <img
                            src={client.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(client.fullName)}`}
                            alt={client.fullName}
                            className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 shrink-0"
                          />
                          <span>{client.fullName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 ml-8">{client.email}</div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-300 font-mono">
                        {client.phone || '-'}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-emerald-400">
                        {client.balance.toLocaleString('en-US')} FRW
                      </td>
                      <td className="py-3.5 px-3 font-bold text-amber-400">
                        +{(client.bonusBalance || 0).toLocaleString('en-US')} FRW
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => {
                            setDirectEmail(client.email);
                            window.scrollTo({ top: 300, behavior: 'smooth' });
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 font-semibold text-xs inline-flex items-center gap-1 transition-all"
                        >
                          <Send className="w-3 h-3" /> Mubikire Direct
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
