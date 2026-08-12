import React from 'react';
import { UserRole } from '../types';
import { LayoutDashboard, ShoppingBag, PieChart, ShieldAlert, History, PlusCircle, Users } from 'lucide-react';

interface MobileBottomNavProps {
  role: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenDeposit: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  role,
  activeTab,
  setActiveTab,
  onOpenDeposit
}) => {
  return (
    <div className="sticky bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 text-slate-400 py-2 px-3 shadow-[0_-10px_20px_rgba(0,0,0,0.5)] select-none">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Dashboard */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${
            activeTab === 'dashboard' ? 'text-emerald-400 font-extrabold' : 'hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl ${activeTab === 'dashboard' ? 'bg-emerald-500/10' : ''}`}>
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight">Konti</span>
        </button>

        {/* Products */}
        <button
          onClick={() => setActiveTab('products')}
          className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${
            activeTab === 'products' ? 'text-emerald-400 font-extrabold' : 'hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl ${activeTab === 'products' ? 'bg-emerald-500/10' : ''}`}>
            <ShoppingBag className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight">Ibyicuruzwa</span>
        </button>

        {/* Quick Deposit Floating Action Button for Client */}
        {role === 'client' && (
          <button
            onClick={onOpenDeposit}
            className="flex flex-col items-center justify-center -mt-6 bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-300 text-slate-950 p-3.5 rounded-full shadow-lg shadow-emerald-500/40 border-2 border-slate-950 transition-transform active:scale-90 hover:scale-105"
            title="Kubika Amafaranga"
          >
            <PlusCircle className="w-6 h-6 stroke-[2.5]" />
          </button>
        )}

        {/* Investments for Client */}
        {role === 'client' && (
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${
              activeTab === 'portfolio' ? 'text-emerald-400 font-extrabold' : 'hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl ${activeTab === 'portfolio' ? 'bg-emerald-500/10' : ''}`}>
              <PieChart className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">Ishoramari</span>
          </button>
        )}

        {/* Agent Approvals */}
        {role === 'agent' && (
          <button
            onClick={() => setActiveTab('agent-deposits')}
            className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${
              activeTab === 'agent-deposits' ? 'text-blue-400 font-extrabold' : 'hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl ${activeTab === 'agent-deposits' ? 'bg-blue-500/10' : ''}`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">Emeza Deposit</span>
          </button>
        )}

        {/* Admin Withdrawals */}
        {role === 'admin' && (
          <button
            onClick={() => setActiveTab('admin-withdrawals')}
            className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${
              activeTab === 'admin-withdrawals' ? 'text-purple-400 font-extrabold' : 'hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl ${activeTab === 'admin-withdrawals' ? 'bg-purple-500/10' : ''}`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">Kubikuza</span>
          </button>
        )}

        {/* History / Transactions */}
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${
            activeTab === 'transactions' ? 'text-emerald-400 font-extrabold' : 'hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl ${activeTab === 'transactions' ? 'bg-emerald-500/10' : ''}`}>
            <History className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight">Raporo</span>
        </button>
      </div>
    </div>
  );
};
