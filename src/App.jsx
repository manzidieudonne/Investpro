import React, { useState, useEffect, useCallback } from 'react';
import { api, tokenStorage } from './services/api.js';
import { useLanguage } from './translations.jsx';
import { Navbar } from './components/Navbar.jsx';
import { MobileBottomNav } from './components/MobileBottomNav.jsx';
import { MobileStatusBar } from './components/MobileStatusBar.jsx';
import { MobileFrameWrapper } from './components/MobileFrameWrapper.jsx';
import { PwaInstallModal } from './components/PwaInstallModal.jsx';
import { AuthModal } from './components/AuthModal.jsx';
import { ProfileSettings } from './components/ProfileSettings.jsx';
import { ClientDashboard } from './components/ClientDashboard.jsx';
import { AgentDashboard } from './components/AgentDashboard.jsx';
import { AdminDashboard } from './components/AdminDashboard.jsx';
import { ProductCard } from './components/ProductCard.jsx';
import { TransactionsTable } from './components/TransactionsTable.jsx';
import { Sparkles, ArrowRight, CheckCircle2, AlertCircle, Lock } from 'lucide-react';

export default function App() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Application Data States
  const [products, setProducts] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // Modals & UI Controls
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [profileOpen, setProfileOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [pwaModalOpen, setPwaModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Toast Notification
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleOpenPwaModal = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          showToast('success', 'App yashyizwe kuri Home Screen ya telefoni yawe neza!');
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error('Error triggering PWA install prompt:', err);
        setPwaModalOpen(true);
      }
    } else {
      setPwaModalOpen(true);
    }
  };

  // Load Initial Public Data
  const loadProducts = useCallback(async () => {
    try {
      const data = await api.products.getAll();
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  }, []);

  // Load Authenticated Role-based Data
  const loadUserData = useCallback(async () => {
    if (!tokenStorage.get()) return;

    let me = null;
    try {
      me = await api.auth.getMe();
      if (!me) {
        tokenStorage.clear();
        setUser(null);
        return;
      }
      setUser(me);
    } catch (authErr) {
      console.warn('Authentication token invalid, expired, or user deleted. Resetting session.', authErr?.message || authErr);
      tokenStorage.clear();
      localStorage.removeItem('investpro_demo_user');
      setUser(null);
      return;
    }

    try {
      const [invs, deps, wths, txns, notifs] = await Promise.all([
        api.investments.getAll().catch(() => []),
        api.deposits.getAll().catch(() => []),
        api.withdrawals.getAll().catch(() => []),
        api.transactions.getAll().catch(() => []),
        api.notifications.getAll().catch(() => [])
      ]);

      setInvestments(invs || []);
      setDeposits(deps || []);
      setWithdrawals(wths || []);
      setTransactions(txns || []);
      setNotifications(notifs || []);

      if (me && me.role === 'admin') {
        const [uList, stats] = await Promise.all([
          api.admin.getUsers().catch(() => []),
          api.admin.getAnalytics().catch(() => null)
        ]);
        setUsersList(uList || []);
        if (stats) setAnalytics(stats);
      }
    } catch (dataErr) {
      console.warn('Error fetching secondary user data:', dataErr?.message || dataErr);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadProducts();
      await loadUserData();
      setLoading(false);
    };
    init();
  }, [loadProducts, loadUserData]);

  // Periodic Polling for Data & Notification Refresh (Every 8 Seconds + Tab Focus)
  const currentUserId = user?.id;
  useEffect(() => {
    if (!currentUserId) return;

    const refreshAll = () => {
      loadUserData();
      loadProducts();
    };

    const interval = setInterval(refreshAll, 8000);

    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        refreshAll();
      }
    };

    window.addEventListener('visibilitychange', handleFocus);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener('focus', handleFocus);
    };
  }, [currentUserId, loadUserData, loadProducts]);

  // Notification Handlers
  const handleMarkNotificationRead = async (id) => {
    try {
      await api.notifications.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Error marking notification read', err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all notifications read', err);
    }
  };

  const handleSelectNotification = (notif) => {
    if (user && (user.role === 'agent' || user.role === 'admin')) {
      setActiveTab('dashboard');
    }
  };

  // Auth Actions
  const handleLogin = async (email, pass) => {
    try {
      const loggedUser = await api.auth.login(email, pass);
      setUser(loggedUser);
      showToast('success', `Welcome back, ${loggedUser.fullName}!`);
      await loadUserData();
    } catch (err) {
      showToast('error', err.message || 'Login failed');
      throw err;
    }
  };

  const handleRegister = async (data) => {
    try {
      const newUser = await api.auth.register(data);
      setUser(newUser);
      showToast('success', `Account created successfully! Welcome to InvestPro.`);
      await loadUserData();
    } catch (err) {
      showToast('error', err.message || 'Registration failed');
      throw err;
    }
  };

  const handleLogout = () => {
    api.auth.logout();
    setUser(null);
    setActiveTab('dashboard');
    setProfileOpen(false);
    showToast('success', 'Logged out successfully');
  };

  // Investment Actions
  const handleInvestInProduct = async (productId) => {
    try {
      const res = await api.investments.create(productId);
      setUser(res.user);
      showToast('success', res.message);
      await loadUserData();
    } catch (err) {
      showToast('error', err.message || 'Investment failed');
      throw err;
    }
  };

  const handleClaimYield = async (investmentId) => {
    try {
      const res = await api.investments.claimYield(investmentId);
      setUser(res.user);
      showToast('success', res.message);
      await loadUserData();
    } catch (err) {
      showToast('error', err.message || 'Claiming yield failed');
      throw err;
    }
  };

  // Deposit Actions
  const handleRequestDeposit = async (data) => {
    try {
      const res = await api.deposits.create(data);
      showToast('success', res.message);
      await loadUserData();
    } catch (err) {
      showToast('error', err.message || 'Deposit submission failed');
      throw err;
    }
  };

  const handleProcessDeposit = async (id, action, reason) => {
    try {
      const res = await api.deposits.process(id, action, reason);
      showToast('success', res.message);
      await loadUserData();
    } catch (err) {
      showToast('error', err.message || 'Deposit processing failed');
      throw err;
    }
  };

  // Withdrawal Actions (ADMIN ONLY ALLOWS WITHDRAWAL)
  const handleRequestWithdrawal = async (data) => {
    try {
      const res = await api.withdrawals.create(data);
      setUser(res.user);
      showToast('success', res.message);
      await loadUserData();
    } catch (err) {
      showToast('error', err.message || 'Withdrawal submission failed');
      throw err;
    }
  };

  const handleProcessWithdrawal = async (id, action, reason) => {
    try {
      const res = await api.withdrawals.process(id, action, reason);
      showToast('success', res.message);
      await loadUserData();
    } catch (err) {
      showToast('error', err.message || 'Withdrawal processing failed');
      throw err;
    }
  };

  // Admin Management Actions
  const handleCreateProduct = async (data) => {
    try {
      const res = await api.products.create(data);
      showToast('success', res.message);
      await loadProducts();
      await loadUserData();
    } catch (err) {
      showToast('error', err.message || 'Failed to create product');
      throw err;
    }
  };

  const handleUpdateProduct = async (id, data) => {
    try {
      const res = await api.products.update(id, data);
      showToast('success', res.message);
      await loadProducts();
      await loadUserData();
    } catch (err) {
      showToast('error', err.message || 'Failed to update product');
      throw err;
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      const res = await api.products.delete(id);
      showToast('success', res.message);
      await loadProducts();
      await loadUserData();
    } catch (err) {
      showToast('error', err.message || 'Failed to delete product');
    }
  };

  const handleUpdateUserRole = async (id, role) => {
    try {
      const res = await api.admin.updateUserRole(id, role);
      showToast('success', res.message);
      await loadUserData();
    } catch (err) {
      showToast('error', err.message || 'Failed to update user role');
    }
  };

  const handleAdjustUserBalance = async (id, amount, reason) => {
    try {
      const res = await api.admin.adjustUserBalance(id, amount, reason);
      showToast('success', res.message);
      await loadUserData();
    } catch (err) {
      showToast('error', err.message || 'Failed to adjust user balance');
    }
  };

  const handleAssignAgentToClient = async (clientId, agentId) => {
    try {
      const res = await api.admin.assignAgent(clientId, agentId);
      showToast('success', res.message);
      await loadUserData();
    } catch (err) {
      showToast('error', err.message || 'Failed to assign agent');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      const res = await api.admin.deleteUser(id);
      showToast('success', res.message);
      await loadUserData();
    } catch (err) {
      showToast('error', err.message || 'Failed to delete user');
      throw err;
    }
  };

  const handleAdminUpdateDeposit = async (id, data) => {
    try {
      const res = await api.admin.updateDeposit(id, data);
      showToast('success', res.message);
      await loadUserData();
    } catch (err) {
      showToast('error', err.message || 'Deposit update failed');
      throw err;
    }
  };

  const handleAdminDeleteDeposit = async (id) => {
    try {
      const res = await api.admin.deleteDeposit(id);
      showToast('success', res.message);
      await loadUserData();
    } catch (err) {
      showToast('error', err.message || 'Deposit deletion failed');
      throw err;
    }
  };

  const handleAdminUpdateWithdrawal = async (id, data) => {
    try {
      const res = await api.admin.updateWithdrawal(id, data);
      showToast('success', res.message);
      await loadUserData();
    } catch (err) {
      showToast('error', err.message || 'Withdrawal update failed');
      throw err;
    }
  };

  const handleAdminDeleteWithdrawal = async (id) => {
    try {
      const res = await api.admin.deleteWithdrawal(id);
      showToast('success', res.message);
      await loadUserData();
    } catch (err) {
      showToast('error', err.message || 'Withdrawal deletion failed');
      throw err;
    }
  };

  const handleAgentDirectDeposit = async (data) => {
    try {
      const res = await api.agent.directDeposit(data);
      showToast('success', res.message);
      await loadUserData();
    } catch (err) {
      showToast('error', err.message || 'Direct deposit failed');
      throw err;
    }
  };

  const handleUpdateProfile = async (data) => {
    try {
      const res = await api.auth.updateProfile(data);
      setUser(res.user);
      showToast('success', 'Profile settings updated successfully!');
      await loadUserData();
    } catch (err) {
      showToast('error', err.message || 'Failed to update profile');
      throw err;
    }
  };

  return (
    <MobileFrameWrapper>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 pb-20 md:pb-8 flex flex-col">
        
        {/* Mobile Native App Status Bar */}
        <MobileStatusBar onOpenInstallModal={() => setPwaModalOpen(true)} />

        {/* Toast Alert */}
        {toast && (
          <div className="fixed top-12 right-4 z-50 max-w-sm w-full animate-in fade-in slide-in-from-top-3 duration-300">
            <div
              className={`p-4 rounded-xl shadow-2xl border text-xs font-semibold flex items-center justify-between gap-3 ${
                toast.type === 'success'
                  ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {toast.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{toast.message}</span>
              </div>
              <button onClick={() => setToast(null)} className="opacity-70 hover:opacity-100">✕</button>
            </div>
          </div>
        )}

        {/* Primary Header Navbar */}
        <Navbar
          user={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAuth={(mode) => { setAuthMode(mode); setAuthModalOpen(true); }}
          onOpenProfile={() => setProfileOpen(true)}
          onOpenDeposit={() => setDepositModalOpen(true)}
          onOpenWithdraw={() => setWithdrawModalOpen(true)}
          onOpenPwaModal={handleOpenPwaModal}
          onLogout={handleLogout}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          onSelectNotification={handleSelectNotification}
        />

        {/* Main App Container */}
        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 flex-1 w-full">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-xs font-semibold text-slate-400">Loading InvestPro Engine...</p>
            </div>
          ) : profileOpen && user ? (
            <ProfileSettings
              user={user}
              onUpdateProfile={handleUpdateProfile}
              onClose={() => setProfileOpen(false)}
            />
          ) : !user ? (
            /* Public Hero Section when user is logged out */
            <div className="space-y-8 sm:space-y-12">
              
              {/* Hero Banner */}
              <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-12 overflow-hidden shadow-2xl">
                <div className="max-w-3xl space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Sparkles className="w-3.5 h-3.5" /> High-Yield Daily Return Platform
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                    {t('heroTitle')}
                  </h1>

                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    {t('heroSubtitle')}
                  </p>

                  <div className="flex items-center gap-3 pt-2 flex-wrap">
                    <button
                      onClick={() => { setAuthMode('register'); setAuthModalOpen(true); }}
                      className="px-6 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                    >
                      {t('startInvesting')} <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setAuthMode('login'); setAuthModalOpen(true); }}
                      className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm transition-all active:scale-95"
                    >
                      {t('clientSignIn')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Login Required Notice for Products */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 text-center max-w-2xl mx-auto space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-white">Gukoresha Ibyicuruzwa n'Ishoramari</h2>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Mbere yo kureba ibicuruzwa n'amapulane yo gushora imari, ugomba kwinjira mu ikonte yawe cyangwa ukabayandikisha gishya.
                </p>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    onClick={() => { setAuthMode('login'); setAuthModalOpen(true); }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95"
                  >
                    {t('login')}
                  </button>
                  <button
                    onClick={() => { setAuthMode('register'); setAuthModalOpen(true); }}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all active:scale-95"
                  >
                    {t('register')}
                  </button>
                </div>
              </div>

            </div>
          ) : (
            /* Authenticated Dashboard Views */
            <div>
              {user.role === 'admin' ? (
                <AdminDashboard
                  adminUser={user}
                  products={products}
                  withdrawals={withdrawals}
                  deposits={deposits}
                  analytics={analytics}
                  usersList={usersList}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  onCreateProduct={handleCreateProduct}
                  onUpdateProduct={handleUpdateProduct}
                  onDeleteProduct={handleDeleteProduct}
                  onProcessWithdrawal={handleProcessWithdrawal}
                  onProcessDeposit={handleProcessDeposit}
                  onUpdateUserRole={handleUpdateUserRole}
                  onAdjustUserBalance={handleAdjustUserBalance}
                  onAssignAgentToClient={handleAssignAgentToClient}
                  onDeleteUser={handleDeleteUser}
                  onUpdateDeposit={handleAdminUpdateDeposit}
                  onDeleteDeposit={handleAdminDeleteDeposit}
                  onUpdateWithdrawal={handleAdminUpdateWithdrawal}
                  onDeleteWithdrawal={handleAdminDeleteWithdrawal}
                />
              ) : user.role === 'agent' ? (
                activeTab === 'products' ? (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white">Products Catalog</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                      {products.map((prod) => (
                        <ProductCard key={prod.id} product={prod} userRole="agent" />
                      ))}
                    </div>
                  </div>
                ) : activeTab === 'transactions' ? (
                  <TransactionsTable transactions={transactions} />
                ) : (
                  <AgentDashboard
                    user={user}
                    deposits={deposits}
                    withdrawals={withdrawals}
                    onProcessDeposit={handleProcessDeposit}
                    onProcessWithdrawal={handleProcessWithdrawal}
                    onDirectDeposit={handleAgentDirectDeposit}
                  />
                )
              ) : (
                /* Client / Investor Dashboard */
                <ClientDashboard
                  user={user}
                  products={products}
                  investments={investments}
                  deposits={deposits}
                  withdrawals={withdrawals}
                  transactions={transactions}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  onInvest={handleInvestInProduct}
                  onClaimYield={handleClaimYield}
                  onRequestDeposit={handleRequestDeposit}
                  onRequestWithdrawal={handleRequestWithdrawal}
                  depositModalOpen={depositModalOpen}
                  setDepositModalOpen={setDepositModalOpen}
                  withdrawModalOpen={withdrawModalOpen}
                  setWithdrawModalOpen={setWithdrawModalOpen}
                />
              )}
            </div>
          )}

        </main>

        {/* Mobile Bottom Navigation Footer */}
        {user && (
          <MobileBottomNav
            role={user.role}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenDeposit={() => setDepositModalOpen(true)}
          />
        )}

        {/* Auth Modal */}
        <AuthModal
          isOpen={authModalOpen}
          initialMode={authMode}
          onClose={() => setAuthModalOpen(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />

        {/* PWA Install Modal */}
        <PwaInstallModal
          isOpen={pwaModalOpen}
          onClose={() => setPwaModalOpen(false)}
          deferredPrompt={deferredPrompt}
        />

      </div>
    </MobileFrameWrapper>
  );
}
