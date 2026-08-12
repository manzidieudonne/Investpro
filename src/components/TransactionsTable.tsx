import React, { useState } from 'react';
import { Transaction } from '../types';
import { useLanguage } from '../translations';
import { History, ArrowDownLeft, ArrowUpRight, TrendingUp, Zap, Shield, Search, Gift } from 'lucide-react';

interface TransactionsTableProps {
  transactions: Transaction[];
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions }) => {
  const { t } = useLanguage();
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.description.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getTypeBadge = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ArrowDownLeft className="w-3.5 h-3.5" /> Kubika
          </span>
        );
      case 'withdrawal':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ArrowUpRight className="w-3.5 h-3.5" /> Kubikuza
          </span>
        );
      case 'investment':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <TrendingUp className="w-3.5 h-3.5" /> Ishoramari
          </span>
        );
      case 'daily_yield':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20">
            <Zap className="w-3.5 h-3.5" /> Inyungu y'Umunsi
          </span>
        );
      case 'referral_bonus':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-pink-500/10 text-pink-400 border border-pink-500/20">
            <Gift className="w-3.5 h-3.5" /> Referral Bonus 30%
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Shield className="w-3.5 h-3.5" /> Guhindura
          </span>
        );
    }
  };

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Byamaze Kwekurwa</span>;
      case 'pending':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">Bitegereje</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">Byangiriwe</span>;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100">
      
      {/* Table Title & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            {t('transactions')}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Urutonde rw\'ihererekanya ry\'amafaranga ryose n\'inyungu</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Shakisha..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700/60 overflow-x-auto max-w-full">
            {['all', 'deposit', 'withdrawal', 'investment', 'daily_yield', 'referral_bonus'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  filterType === type
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {type === 'all'
                  ? 'Byose'
                  : type === 'deposit'
                  ? 'Kubika'
                  : type === 'withdrawal'
                  ? 'Kubikuza'
                  : type === 'investment'
                  ? 'Ishoramari'
                  : type === 'daily_yield'
                  ? 'Inyungu'
                  : 'Referral Bonus'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Log Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p className="text-sm font-semibold">Nta ihererekanya na rirwe rihuye n'ibyo ushakisha</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3 px-3">Ubwoko</th>
                <th className="pb-3 px-3">Ibisobanuro</th>
                <th className="pb-3 px-3 text-right">Amafaranga</th>
                <th className="pb-3 px-3 text-center">Sitati</th>
                <th className="pb-3 px-3 text-right">Tariki & Isaha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((txn) => (
                <tr key={txn.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-3">{getTypeBadge(txn.type)}</td>
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-slate-200">{txn.description}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{txn.id}</div>
                  </td>
                  <td className={`py-3.5 px-3 text-right font-bold text-sm ${
                    txn.type === 'withdrawal' || txn.type === 'investment'
                      ? 'text-slate-300'
                      : 'text-emerald-400'
                  }`}>
                    {txn.type === 'withdrawal' || txn.type === 'investment' ? '-' : '+'}
                    {txn.amount.toLocaleString('en-US')} FRW
                  </td>
                  <td className="py-3.5 px-3 text-center">{getStatusBadge(txn.status)}</td>
                  <td className="py-3.5 px-3 text-right text-slate-400">
                    {new Date(txn.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
