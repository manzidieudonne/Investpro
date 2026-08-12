import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useLanguage } from '../translations.jsx';
import { ProductCard } from './ProductCard.jsx';
import { TransactionsTable } from './TransactionsTable.jsx';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { 
  Wallet, 
  TrendingUp, 
  PlusCircle, 
  CreditCard, 
  Zap, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Building2,
  PhoneCall,
  Smartphone,
  Copy,
  Check,
  Sparkles,
  Share2,
  Users
} from 'lucide-react';

export const ClientDashboard = ({
  user,
  products = [],
  investments = [],
  deposits = [],
  withdrawals = [],
  transactions = [],
  activeTab,
  setActiveTab,
  onInvest,
  onClaimYield,
  onRequestDeposit,
  onRequestWithdrawal,
  depositModalOpen,
  setDepositModalOpen,
  withdrawModalOpen,
  setWithdrawModalOpen
}) => {
  const { t } = useLanguage();
  // Agent Details for Client Deposit
  const [assignedAgent, setAssignedAgent] = useState(null);
  const [copiedAgentPhone, setCopiedAgentPhone] = useState(false);

  // Form States for Deposit & Withdrawal
  const [depAmount, setDepAmount] = useState('12000');
  const [depMethod, setDepMethod] = useState('MTN Mobile Money');
  const [depRef, setDepRef] = useState('');
  const [depAgentCode, setDepAgentCode] = useState(user.agentCode || 'AGENT-ALPHA');
  const [copiedUssd, setCopiedUssd] = useState(false);
  const [depLoading, setDepLoading] = useState(false);
  const [depError, setDepError] = useState(null);

  useEffect(() => {
    api.agent.getMyAgent()
      .then(res => {
        if (res.agent) {
          setAssignedAgent(res.agent);
          if (res.agent.agentCode) {
            setDepAgentCode(res.agent.agentCode);
          }
        }
      })
      .catch(console.error);
  }, []);

  const currentAgentPhone = '0736206060';
  const currentAgentMomoName = 'Niyonsenga Bernard';

  // USSD MoMo Pay format: *182*1*2*0736206060*amount#
  const directUssdTransferCode = `*182*1*2*${currentAgentPhone}*${depAmount || '0'}#`;
  const directUssdTelUrl = `tel:*182*1*2*${currentAgentPhone}*${depAmount || '0'}%23`;

  const copyUssdCode = () => {
    navigator.clipboard.writeText(directUssdTransferCode);
    setCopiedUssd(true);
    setTimeout(() => setCopiedUssd(false), 2500);
  };

  const generateAutoRef = () => {
    const randomRef = `MOMO-${Math.floor(100000 + Math.random() * 900000)}`;
    setDepRef(randomRef);
  };

  const [wthAmount, setWthAmount] = useState('37000');
  const [wthMethod, setWthMethod] = useState('MTN Mobile Money');
  const [wthDetails, setWthDetails] = useState('');
  const [wthLoading, setWthLoading] = useState(false);
  const [wthError, setWthError] = useState(null);

  const [claimingId, setClaimingId] = useState(null);

  // Calculations
  const activeInvestments = investments.filter(i => i.status === 'active');
  const totalInvested = investments.reduce((acc, i) => acc + i.amount, 0);
  const totalUnclaimedYield = activeInvestments.reduce((acc, i) => acc + i.unclaimedProfit, 0);
  const totalClaimedYield = investments.reduce((acc, i) => acc + i.totalClaimedProfit, 0);

  // Recharts Portfolio Growth Calculation based on transactions state
  const portfolioGrowthData = React.useMemo(() => {
    const sortedTxns = [...(transactions || [])]
      .filter(t => !t.userId || t.userId === user.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    let runningVal = user.bonusBalance || 0;
    let runningYield = 0;

    const points = [
      {
        label: 'Inshimiro',
        balance: runningVal,
        profit: 0
      }
    ];

    sortedTxns.forEach((txn) => {
      if (txn.status === 'failed') return;
      const amount = txn.amount || 0;
      if (txn.type === 'deposit' && txn.status === 'completed') {
        runningVal += amount;
      } else if (txn.type === 'withdrawal' && txn.status === 'completed') {
        runningVal = Math.max(0, runningVal - amount);
      } else if (txn.type === 'yield' || txn.type === 'commission') {
        runningYield += amount;
        runningVal += amount;
      }

      const dateObj = new Date(txn.createdAt);
      const formattedDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()} ${dateObj.getHours()}:${dateObj.getMinutes() < 10 ? '0' : ''}${dateObj.getMinutes()}`;

      points.push({
        label: formattedDate,
        balance: runningVal,
        profit: runningYield
      });
    });

    if (points.length === 1) {
      points.push({
        label: 'Aka Kanya',
        balance: user.balance + totalInvested,
        profit: totalClaimedYield
      });
    }

    return points;
  }, [transactions, user.id, user.balance, user.bonusBalance, totalInvested, totalClaimedYield]);

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    setDepError(null);
    const amt = Number(depAmount);
    if (isNaN(amt) || amt < 12000) {
      setDepError('Amafaranga make yo kubitsa ni 12,000 FRW.');
      return;
    }
    setDepLoading(true);
    try {
      await onRequestDeposit({
        amount: amt,
        paymentMethod: depMethod,
        transactionRef: depRef || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
        agentCode: depAgentCode
      });
      setDepositModalOpen(false);
      setDepRef('');
    } catch (err) {
      setDepError(err.message || 'Deposit submission failed');
    } finally {
      setDepLoading(false);
    }
  };

  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault();
    setWthError(null);
    const amt = Number(wthAmount);
    if (isNaN(amt) || amt < 37000) {
      setWthError('Amafaranga make yo kubikuza ni 37,000 FRW.');
      return;
    }
    setWthLoading(true);
    try {
      await onRequestWithdrawal({
        amount: amt,
        paymentMethod: wthMethod,
        bankOrWalletDetails: wthDetails
      });
      setWithdrawModalOpen(false);
      setWthDetails('');
    } catch (err) {
      setWthError(err.message || 'Withdrawal submission failed');
    } finally {
      setWthLoading(false);
    }
  };

  const handleClaimYield = async (invId) => {
    setClaimingId(invId);
    try {
      await onClaimYield(invId);
    } catch (err) {
      console.error(err);
    } finally {
      setClaimingId(null);
    }
  };

  const [copiedLink, setCopiedLink] = useState(false);
  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}/?ref=${user.referralCode || user.id}`
    : `https://investpro.rw/?ref=${user.referralCode || user.id}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-8">
      
      {/* Minimalist Top Banner - Referral Link & Balance Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Client Portal
              </span>
              <span className="text-xs text-slate-400 font-mono">Kode: {user.referralCode || user.id}</span>
              <span className="text-xs text-purple-300 font-bold bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20 flex items-center gap-1">
                <Users className="w-3 h-3 text-purple-400" /> Abantu Binjiriye ku Link Yawe: <span className="text-white font-black">{user.referralCount || 0}</span>
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Kaze, {user.fullName}!
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Uhabwe <span className="text-amber-400 font-bold">3,000 FRW Welcome Bonus</span> yo gushora! Kandi utange link ugaruze <span className="text-emerald-400 font-bold">30% commission</span> kuri buri kubitsa k'uwo watumiye ikazaho kuri balance ibikuza.
            </p>
          </div>

          <div className="w-full md:w-auto flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="bg-transparent text-xs text-emerald-300 font-mono max-w-[180px] sm:max-w-[240px] focus:outline-none overflow-hidden text-ellipsis whitespace-nowrap px-1"
            />
            <button
              onClick={copyReferralLink}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0 ${
                copiedLink
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {copiedLink ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Yakopiwe
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" /> Kopia Link
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Clean Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Wallet Balance Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1.5">
              <span>Ayo Ubikuza (Withdrawable)</span>
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400">
              {user.balance.toLocaleString('en-US')} FRW
            </div>
            {(user.bonusBalance || 0) > 0 && (
              <div className="text-[11px] text-amber-400 mt-1 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Bonus Balance (Yo Gushora): +{(user.bonusBalance || 0).toLocaleString('en-US')} FRW
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
            <button
              onClick={() => setDepositModalOpen(true)}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> {t('deposit')}
            </button>
            <button
              onClick={() => setWithdrawModalOpen(true)}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-amber-400" /> {t('withdraw')}
            </button>
          </div>
        </div>

        {/* Active Capital Invested */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1.5">
              <span>Amafaranga Yashowe</span>
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-black text-white">
              {totalInvested.toLocaleString('en-US')} FRW
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-4 pt-2 border-t border-slate-800/80">
            Gahunda Zikora: <span className="text-blue-400 font-bold">{activeInvestments.length}</span>
          </div>
        </div>

        {/* Total Yield Earned */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1.5">
              <span>Inyungu Izaba Yiteguye</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-400">
              +{totalUnclaimedYield.toLocaleString('en-US')} FRW
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-4 pt-2 border-t border-slate-800/80 flex justify-between">
            <span>Inyungu Yose:</span>
            <span className="text-emerald-300 font-bold">{totalClaimedYield.toLocaleString('en-US')} FRW</span>
          </div>
        </div>

        {/* Referrals Count Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1.5">
              <span>Abantu Watumiye (Referrals)</span>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-black text-purple-400">
              {user.referralCount || 0} <span className="text-xs font-semibold text-slate-400">bantu</span>
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-4 pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span>Commission Bonus:</span>
            <span className="text-emerald-400 font-bold">30% kuri buri kubitsa</span>
          </div>
        </div>

      </div>

      {/* Main Tabbed Views */}
      {activeTab === 'portfolio' || activeTab === 'dashboard' ? (
        <div className="space-y-6">

          {/* Portfolio Growth Line Chart Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Portfolio Growth (Gukura kw'Imari Yawe)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Igipimo cy'uburyo imari n'inyungu zawe byazamutse mu gihe gishize
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-sm shadow-emerald-500/50"></span>
                  Portfolio Balance
                </div>
                <div className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-3 h-3 rounded-full bg-amber-400 inline-block shadow-sm shadow-amber-400/50"></span>
                  Total Yield (Inyungu)
                </div>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={portfolioGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis 
                    dataKey="label" 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickLine={false}
                    axisLine={{ stroke: '#475569' }}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickLine={false}
                    axisLine={{ stroke: '#475569' }}
                    tickFormatter={(val) => `${val.toLocaleString()} FRW`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderColor: '#334155', 
                      borderRadius: '12px',
                      color: '#f8fafc',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                    }}
                    formatter={(value, name) => [
                      `${Number(value || 0).toLocaleString('en-US')} FRW`,
                      name === 'balance' ? 'Portfolio Balance' : 'Total Yield'
                    ]}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '12px' }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                    formatter={(value) => value === 'balance' ? 'Portfolio Balance (FRW)' : 'Inyungu Zose (Yield FRW)'}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="balance" 
                    name="balance"
                    stroke="#10b981" 
                    strokeWidth={3} 
                    dot={{ fill: '#10b981', r: 4 }} 
                    activeDot={{ r: 7, stroke: '#34d399', strokeWidth: 2 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    name="profit"
                    stroke="#f59e0b" 
                    strokeWidth={2} 
                    strokeDasharray="4 4"
                    dot={{ fill: '#f59e0b', r: 3 }} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Active Investments Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-emerald-400" />
                {t('activeInvestments')} ({activeInvestments.length})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Fata inyungu zawe z'umunsi buri masaha 24</p>
            </div>
            <button
              onClick={() => setActiveTab('products')}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              Reba Ibyicuruzwa Byose <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {activeInvestments.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-emerald-400 flex items-center justify-center mx-auto">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Nta gahunda yo gushora imari ufite</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Nturashora imari mu gicuruzwa na kimwe. Hitamo igicuruzwa kugira ngo utangire kubona inyungu buri munsi!
                </p>
              </div>
              <button
                onClick={() => setActiveTab('products')}
                className="px-5 py-2.5 rounded-xl bg-emerald-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                Shora Imari Mu Gicuruzwa
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeInvestments.map((inv) => (
                <div key={inv.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                        Inyungu Ikora
                      </span>
                      <h3 className="text-base font-bold text-white mt-1.5">{inv.productTitle}</h3>
                      <p className="text-xs text-slate-400">Amafaranga Yashowe: {inv.amount.toLocaleString('en-US')} FRW</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Inyungu y'Umunsi</div>
                      <div className="text-base font-black text-emerald-400">+{inv.dailyProfit.toLocaleString('en-US')} FRW/umunsi</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Igihe: Iminsi {inv.daysElapsed} / {inv.durationDays}</span>
                      <span>Hagumye Iminsi {inv.daysRemaining}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (inv.daysElapsed / inv.durationDays) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Claimable Yield Action or Automatic Indicator */}
                  <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                        {inv.profitPayoutMode === 'manual_claim' ? 'Inyungu Yo Gufata' : 'Inyungu Yishyizeho'}
                      </div>
                      <div className="text-lg font-black text-amber-400">
                        {inv.profitPayoutMode === 'manual_claim' 
                          ? `+${inv.unclaimedProfit.toLocaleString('en-US')} FRW`
                          : `+${inv.totalClaimedProfit.toLocaleString('en-US')} FRW`
                        }
                      </div>
                    </div>

                    {inv.profitPayoutMode === 'automatic' ? (
                      <div className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Automatic ({inv.payoutIntervalHours || 24}h)</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleClaimYield(inv.id)}
                        disabled={inv.unclaimedProfit <= 0 || claimingId === inv.id}
                        className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-400/20 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {claimingId === inv.id ? (
                          <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5" /> Fata Inyungu
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Products Catalog section in dashboard */}
          <div className="pt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">{t('featuredProducts')}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{t('featuredSubtitle')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {products.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  userRole="client"
                  userBalance={user.balance}
                  onInvest={onInvest}
                />
              ))}
            </div>
          </div>

        </div>
      ) : activeTab === 'products' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{t('featuredProducts')}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{t('featuredSubtitle')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                userRole="client"
                userBalance={user.balance}
                onInvest={onInvest}
              />
            ))}
          </div>
        </div>
      ) : activeTab === 'transactions' ? (
        <TransactionsTable transactions={transactions} />
      ) : null}

      {/* DEPOSIT REQUEST MODAL */}
      {depositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-8 max-w-lg w-full shadow-2xl text-slate-100 my-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-400" />
                Bika Amafaranga Kuri Ikonte (Mobile Money)
              </h3>
              <button
                onClick={() => setDepositModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {depError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {depError}
              </div>
            )}

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              {/* STEP 1: Enter Amount First */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    1. Shyiramo Umubare w'Amafaranga Ashaka Kubitsa (FRW)
                  </label>
                  <span className="text-[10px] text-amber-300 font-semibold">
                    Make: 12,000 FRW
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min={12000}
                    value={depAmount}
                    onChange={(e) => setDepAmount(e.target.value)}
                    placeholder="Urugero: 12000"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-base font-black text-amber-300 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    FRW
                  </span>
                </div>
                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['12000', '20000', '50000', '100000', '250000', '500000'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDepAmount(preset)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                        depAmount === preset
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {Number(preset).toLocaleString()} FRW
                    </button>
                  ))}
                </div>
              </div>

              {/* STEP 2: Payment Method */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  2. Hitamo Uburyo bwo Kwishyura
                </label>
                <select
                  value={depMethod}
                  onChange={(e) => setDepMethod(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="MTN Mobile Money">MTN Mobile Money (MTN MoMo)</option>
                  <option value="Airtel Money">Airtel Money (Airtel)</option>
                </select>
              </div>

              {/* STEP 3: Official MoMo Pay Card with Dynamic USSD Code */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        3. Kwishyura kuri MoMo Pay (*182*1*2*)
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        MoMo Pay
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white mt-0.5">{currentAgentMomoName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">Nimero yo Yoherezaho</div>
                    <div className="text-base font-black text-amber-300 font-mono">{currentAgentPhone}</div>
                  </div>
                </div>

                {/* USSD Code Display Banner */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center font-mono space-y-1">
                  <div className="text-[10px] text-slate-400">Kode USSD yo guhamagara ku telefone:</div>
                  <div className="text-sm sm:text-base font-black text-emerald-400 tracking-wider break-all">
                    {directUssdTransferCode}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(currentAgentPhone);
                      setCopiedAgentPhone(true);
                      setTimeout(() => setCopiedAgentPhone(false), 2000);
                    }}
                    className="flex-1 min-w-[110px] py-2 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    {copiedAgentPhone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAgentPhone ? 'Nimero Yakopiwe' : 'Kopia Nimero'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={copyUssdCode}
                    className="flex-1 min-w-[110px] py-2 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    {copiedUssd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-emerald-400" />}
                    <span>{copiedUssd ? 'USSD Yakopiwe' : 'Kopia USSD'}</span>
                  </button>

                  <a
                    href={directUssdTelUrl}
                    onClick={() => {
                      if (!depRef) generateAutoRef();
                    }}
                    className="w-full sm:flex-1 min-w-[130px] py-2 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <PhoneCall className="w-3.5 h-3.5" /> Uhamagare ({depAmount || '0'} FRW)
                  </a>
                </div>
              </div>

              {/* STEP 4: SMS Ref & Agent Code */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    4. Kode / Inyitiro y'Ihererekanya (SMS Ref)
                  </label>
                  <button
                    type="button"
                    onClick={generateAutoRef}
                    className="text-[10px] text-emerald-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Generator Ref
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={depRef}
                  onChange={(e) => setDepRef(e.target.value)}
                  placeholder="Urugero: MOMO-984021 cyangwa TXN-8921"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Kode ya Agent Wakoreyeho</label>
                <input
                  type="text"
                  value={depAgentCode}
                  onChange={(e) => setDepAgentCode(e.target.value)}
                  placeholder="AGENT-ALPHA"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setDepositModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Hagarika
                </button>
                <button
                  type="submit"
                  disabled={depLoading}
                  className="px-5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-colors"
                >
                  {depLoading ? (
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    'Saba Kubika Amafaranga'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WITHDRAWAL REQUEST MODAL */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-8 max-w-md w-full shadow-2xl text-slate-100 my-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                Gusaba Kubikuza (Ubwemezi bwa Admin)
              </h3>
              <button
                onClick={() => setWithdrawModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs mb-4 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Amategeko ya Admin:</strong> Admin ni wenyine ufite ububasha bwo kwemeza no kohereza amafaranga yabikujwe.
              </span>
            </div>

            {wthError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {wthError}
              </div>
            )}

            <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ayo Ubikuza (FRW)</label>
                <input
                  type="number"
                  required
                  min={37000}
                  max={user.balance}
                  value={wthAmount}
                  onChange={(e) => setWthAmount(e.target.value)}
                  placeholder="Urugero: 37000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-amber-400 font-mono"
                />
                <div className="flex items-center justify-between mt-1 text-[10px]">
                  <span className="text-amber-300 font-medium">Amafaranga make yo kubikuza ni 37,000 FRW</span>
                  <span className="text-slate-400">Uri nayo: {user.balance.toLocaleString('en-US')} FRW</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Uburyo bwo Yohererezwa</label>
                <select
                  value={wthMethod}
                  onChange={(e) => setWthMethod(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
                >
                  <option value="MTN Mobile Money">MTN Mobile Money (MTN MoMo)</option>
                  <option value="Airtel Money">Airtel Money (Airtel)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nimero yo yohererezaho n'Izina riri kuri SIM</label>
                <textarea
                  required
                  rows={3}
                  value={wthDetails}
                  onChange={(e) => setWthDetails(e.target.value)}
                  placeholder="Urugero: Nimero: 0788XXXXXX (MTN) cyangwa 073XXXXXXX (Airtel) - Izina Ryose"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setWithdrawModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
                >
                  Hagarika
                </button>
                <button
                  type="submit"
                  disabled={wthLoading}
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-400/20"
                >
                  {wthLoading ? (
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    'Saba Kubikuza'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

function PieChartIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9A9.003 9.003 0 0015 3.512V9h5.488z" />
    </svg>
  );
}
