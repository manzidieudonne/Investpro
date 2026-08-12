import React, { useState } from 'react';
import { Product, UserRole } from '../types';
import { useLanguage } from '../translations';
import { TrendingUp, Clock, DollarSign, Shield, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  userRole?: UserRole;
  userBalance?: number;
  onInvest?: (productId: string) => Promise<void>;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  userRole = 'client',
  userBalance = 0,
  onInvest,
  onEditProduct,
  onDeleteProduct
}) => {
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const price = product?.price || 0;
  const dailyProfit = product?.dailyProfit || 0;
  const durationDays = product?.durationDays || 1;

  const totalReturn = Number((price + (dailyProfit * durationDays)).toFixed(2));
  const totalNetProfit = Number((dailyProfit * durationDays).toFixed(2));
  const hasSufficientBalance = userBalance >= price;

  const handleConfirmInvest = async () => {
    if (!onInvest) return;
    setLoading(true);
    try {
      await onInvest(product.id);
      setShowModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = () => {
    switch (product.riskLevel) {
      case 'Low':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Risk Pasi</span>;
      case 'Medium':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Risk Hagati</span>;
      case 'High':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">Inyungu Nini</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
      
      {/* Glow highlight on hover */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />

      {/* Top Tag & Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            {product.category || 'Yield Pool'}
          </span>
          {getRiskBadge()}
        </div>

        <h3 className="text-lg font-black text-white group-hover:text-emerald-300 transition-colors tracking-tight">
          {product.title}
        </h3>
        <p className="text-xs text-slate-400 mt-1 line-clamp-2 min-h-[32px] leading-relaxed">
          {product.description}
        </p>

        {/* Investment Price & Daily Yield */}
        <div className="my-5 p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3 shadow-inner">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-400 font-medium">{t('price')}</span>
            <span className="text-2xl font-black text-white tracking-tight">{product.price.toLocaleString('en-US')} <span className="text-xs font-bold text-slate-400">FRW</span></span>
          </div>

          <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400/20" />
              <span>{t('dailyProfit')}</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-emerald-400">+{product.dailyProfit.toLocaleString('en-US')} FRW</span>
              <span className="text-[10px] text-emerald-500/80 block font-bold">({product.dailyProfitPercent}% / umunsi)</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>{t('durationDays')}</span>
            </div>
            <span className="font-bold text-slate-200">{product.durationDays} Iminsi</span>
          </div>

          {/* Profit Payout Mode Indicator */}
          <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">Uburyo bw'Inyungu:</span>
            {product.profitPayoutMode === 'automatic' ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold flex items-center gap-1 text-[10px]">
                <span>⚡ Automatic</span>
                <span className="text-[9px] text-emerald-400/80 font-normal">({product.payoutIntervalHours || 24}h)</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold flex items-center gap-1 text-[10px]">
                <span>🖐️ Manual Claim</span>
                <span className="text-[9px] text-amber-400/80 font-normal">({product.payoutIntervalHours || 24}h)</span>
              </span>
            )}
          </div>
        </div>

        {/* Total Return Breakdown */}
        <div className="flex items-center justify-between text-xs px-1 mb-4">
          <span className="text-slate-400 font-medium">Inyungu Yose Utangamo:</span>
          <span className="font-extrabold text-emerald-400">+{totalNetProfit.toLocaleString('en-US')} FRW</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-800/80">
        {userRole === 'admin' ? (
          <div className="flex items-center gap-2">
            {onEditProduct && (
              <button
                onClick={() => onEditProduct(product)}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 cursor-pointer transition-colors"
              >
                Hindura
              </button>
            )}
            {onDeleteProduct && (
              <button
                onClick={() => onDeleteProduct(product.id)}
                className="py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-xs font-bold text-rose-400 border border-rose-500/20 cursor-pointer transition-colors"
              >
                Siba
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowModal(true)}
            className="w-full py-3 px-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 active:scale-[0.99] text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
          >
            <TrendingUp className="w-4 h-4 stroke-[2.5]" />
            {t('investNow')} ({product.price.toLocaleString('en-US')} FRW)
          </button>
        )}
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl text-slate-100 my-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-white mb-1">Emeza Gushora Imari</h3>
            <p className="text-xs text-slate-400 mb-4">
              Igenzura amasezerano yo gushora imari mbere yo kubika amafaranga muri iri pool ry'inyungu z'umunsi.
            </p>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs mb-5">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Igicuruzwa:</span>
                <span className="font-bold text-white">{product.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Igiciro cyo Gushora:</span>
                <span className="font-bold text-white">{product.price.toLocaleString('en-US')} FRW</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Inyungu y'Umunsi:</span>
                <span className="font-bold text-emerald-400">+{product.dailyProfit.toLocaleString('en-US')} FRW / umunsi</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Igihe cyo Gushora:</span>
                <span className="font-bold text-white">{product.durationDays} Iminsi</span>
              </div>
              <div className="flex justify-between items-center pt-2.5 border-t border-slate-800">
                <span className="text-slate-300 font-bold">Ayose Uzabonaho Inyungu:</span>
                <span className="font-black text-emerald-400 text-sm">{totalReturn.toLocaleString('en-US')} FRW</span>
              </div>
            </div>

            <div className="mb-5 flex items-center justify-between text-xs p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 font-medium">Amafaranga ari mu ikonte:</span>
              <span className={`font-black ${hasSufficientBalance ? 'text-emerald-400' : 'text-rose-400'}`}>
                {userBalance.toLocaleString('en-US')} FRW
              </span>
            </div>

            {!hasSufficientBalance && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs leading-relaxed">
                Amafaranga ari mu ikonte yawe ntabwo ahagije. Banza ubikize kuri Agent mbere yo gushora imari.
              </div>
            )}

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer transition-colors"
              >
                Hagarika
              </button>
              <button
                type="button"
                disabled={!hasSufficientBalance || loading}
                onClick={handleConfirmInvest}
                className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 active:scale-[0.99] text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer transition-all"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    Emeza & Tangira Kubona Inyungu <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
