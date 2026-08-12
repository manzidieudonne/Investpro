import React, { useState, useEffect } from 'react';
import { useLanguage } from '../translations.jsx';
import { api } from '../services/api.js';
import { ProductCard } from './ProductCard.jsx';
import { 
  ShieldCheck, 
  Users, 
  PlusCircle, 
  CreditCard, 
  TrendingUp, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  Sliders, 
  Edit, 
  AlertCircle,
  Trash2,
  Search,
  Lock,
  ArrowDownLeft
} from 'lucide-react';

export const AdminDashboard = ({
  adminUser,
  products = [],
  withdrawals = [],
  deposits = [],
  analytics,
  usersList = [],
  activeTab,
  setActiveTab,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
  onProcessWithdrawal,
  onProcessDeposit,
  onUpdateUserRole,
  onAdjustUserBalance,
  onAssignAgentToClient,
  onDeleteUser,
  onUpdateDeposit,
  onDeleteDeposit,
  onUpdateWithdrawal,
  onDeleteWithdrawal
}) => {
  const { t } = useLanguage();

  const [localUsers, setLocalUsers] = useState(usersList);

  useEffect(() => {
    setLocalUsers(usersList);
  }, [usersList]);

  // Admin User Search & Filter State
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // Admin Full User Profile Edit State
  const [editingUserProfile, setEditingUserProfile] = useState(null);
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState('client');
  const [editBalance, setEditBalance] = useState(0);
  const [editBonusBalance, setEditBonusBalance] = useState(0);
  const [editAgentPaymentNumber, setEditAgentPaymentNumber] = useState('');
  const [editAgentMomoName, setEditAgentMomoName] = useState('');
  const [editNewPassword, setEditNewPassword] = useState('');
  const [editUserLoading, setEditUserLoading] = useState(false);
  const [editUserMsg, setEditUserMsg] = useState(null);

  const handleOpenEditUserProfile = (u) => {
    setEditingUserProfile(u);
    setEditFullName(u.fullName || '');
    setEditEmail(u.email || '');
    setEditPhone(u.phone || '');
    setEditRole(u.role || 'client');
    setEditBalance(u.balance || 0);
    setEditBonusBalance(u.bonusBalance || 0);
    setEditAgentPaymentNumber(u.agentPaymentNumber || '');
    setEditAgentMomoName(u.agentMomoName || '');
    setEditNewPassword('');
    setEditUserMsg(null);
  };

  const handleSaveUserProfile = async (e) => {
    e.preventDefault();
    if (!editingUserProfile) return;
    setEditUserLoading(true);
    setEditUserMsg(null);
    try {
      const payload = {
        fullName: editFullName,
        email: editEmail,
        phone: editPhone,
        role: editRole,
        balance: Number(editBalance),
        bonusBalance: Number(editBonusBalance),
        agentPaymentNumber: editAgentPaymentNumber,
        agentMomoName: editAgentMomoName
      };
      if (editNewPassword.trim()) {
        payload.newPassword = editNewPassword.trim();
      }

      const res = await api.admin.updateUser(editingUserProfile.id, payload);
      setLocalUsers(prev => prev.map(u => u.id === editingUserProfile.id ? { ...u, ...res.user } : u));
      setEditUserMsg({ type: 'success', text: `Ibiranga umukoresha ${res.user.fullName} byahinduwe neza!` });
      setTimeout(() => {
        setEditingUserProfile(null);
      }, 1200);
    } catch (err) {
      setEditUserMsg({ type: 'error', text: err.message || 'Guhindura umukoresha byananiwe' });
    } finally {
      setEditUserLoading(false);
    }
  };

  // Admin Edit Agent Payment Details State
  const [editingAgentDetailsUser, setEditingAgentDetailsUser] = useState(null);
  const [agentPaymentPhoneInput, setAgentPaymentPhoneInput] = useState('');
  const [agentMomoNameInput, setAgentMomoNameInput] = useState('');
  const [agentPaymentLoading, setAgentPaymentLoading] = useState(false);
  const [agentPaymentMsg, setAgentPaymentMsg] = useState(null);

  // Admin Delete User State
  const [deletingUserConfirm, setDeletingUserConfirm] = useState(null);
  const [deletingUserLoading, setDeletingUserLoading] = useState(false);

  // Admin Add User State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addUserFullName, setAddUserFullName] = useState('');
  const [addUserPhone, setAddUserPhone] = useState('');
  const [addUserEmail, setAddUserEmail] = useState('');
  const [addUserPassword, setAddUserPassword] = useState('');
  const [addUserRole, setAddUserRole] = useState('client');
  const [addUserInitialBalance, setAddUserInitialBalance] = useState(0);
  const [addUserAgentCode, setAddUserAgentCode] = useState('');
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addUserError, setAddUserError] = useState(null);

  const handleOpenAddUserModal = () => {
    setAddUserFullName('');
    setAddUserPhone('');
    setAddUserEmail('');
    setAddUserPassword('');
    setAddUserRole('client');
    setAddUserInitialBalance(0);
    setAddUserAgentCode('');
    setAddUserError(null);
    setShowAddUserModal(true);
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    setAddUserLoading(true);
    setAddUserError(null);
    try {
      const res = await api.admin.createUser({
        fullName: addUserFullName,
        phone: addUserPhone,
        email: addUserEmail,
        password: addUserPassword,
        role: addUserRole,
        initialBalance: Number(addUserInitialBalance),
        agentCode: addUserAgentCode
      });
      setLocalUsers(prev => [res.user, ...prev]);
      setShowAddUserModal(false);
    } catch (err) {
      setAddUserError(err.message || 'Kurema umukoresha mushya byananiwe');
    } finally {
      setAddUserLoading(false);
    }
  };

  const handleDeleteUserSubmit = async () => {
    if (!deletingUserConfirm) return;
    setDeletingUserLoading(true);
    try {
      if (onDeleteUser) {
        await onDeleteUser(deletingUserConfirm.id);
      } else {
        await api.admin.deleteUser(deletingUserConfirm.id);
      }
      setLocalUsers(prev => prev.filter(u => u.id !== deletingUserConfirm.id));
      setDeletingUserConfirm(null);
    } catch (err) {
      alert(err.message || 'Gusiba umukoresha byananiwe');
    } finally {
      setDeletingUserLoading(false);
    }
  };

  // Admin Assign Agent Modal State
  const [assigningClientUser, setAssigningClientUser] = useState(null);
  const [assigningAgentId, setAssigningAgentId] = useState('');
  const [assigningLoading, setAssigningLoading] = useState(false);
  const [assigningMsg, setAssigningMsg] = useState(null);

  const handleOpenAssignAgentModal = (client) => {
    setAssigningClientUser(client);
    const currentAgent = localUsers.find(ag => (ag.role === 'agent' || ag.role === 'admin') && (ag.id === client.referredBy || ag.agentCode === client.agentCode || ag.referralCode === client.agentCode));
    setAssigningAgentId(currentAgent?.id || '');
    setAssigningMsg(null);
  };

  const handleConfirmAssignAgent = async (agentIdToAssign) => {
    if (!assigningClientUser) return;
    setAssigningLoading(true);
    setAssigningMsg(null);
    try {
      if (onAssignAgentToClient) {
        await onAssignAgentToClient(assigningClientUser.id, agentIdToAssign);
      } else {
        await api.admin.assignAgent(assigningClientUser.id, agentIdToAssign);
      }
      const selectedAgentObj = localUsers.find(a => a.id === agentIdToAssign);
      const updatedCode = selectedAgentObj?.agentCode || selectedAgentObj?.referralCode || `AGENT-${agentIdToAssign.slice(0, 6).toUpperCase()}`;
      
      setLocalUsers(prev => prev.map(u => u.id === assigningClientUser.id ? { ...u, agentCode: updatedCode, referredBy: agentIdToAssign } : u));
      setAssigningMsg({ type: 'success', text: `Umukiriya ${assigningClientUser.fullName} yahawe Agent ${selectedAgentObj?.fullName || ''} neza!` });
      setTimeout(() => {
        setAssigningClientUser(null);
      }, 1200);
    } catch (err) {
      setAssigningMsg({ type: 'error', text: err.message || 'Guha agent umukiriya byananiwe' });
    } finally {
      setAssigningLoading(false);
    }
  };

  const handleOpenAgentPaymentModal = (user) => {
    setEditingAgentDetailsUser(user);
    setAgentPaymentPhoneInput(user.agentPaymentNumber || user.phone || '');
    setAgentMomoNameInput(user.agentMomoName || user.fullName || '');
    setAgentPaymentMsg(null);
  };

  const handleSaveAgentPaymentDetails = async (e) => {
    e.preventDefault();
    if (!editingAgentDetailsUser) return;
    setAgentPaymentLoading(true);
    setAgentPaymentMsg(null);
    try {
      const res = await api.admin.updateAgentPaymentDetails(editingAgentDetailsUser.id, {
        agentPaymentNumber: agentPaymentPhoneInput,
        agentMomoName: agentMomoNameInput
      });
      setAgentPaymentMsg({ type: 'success', text: 'Nimero ya Agent yahinduwe neza!' });
      setLocalUsers(prev => prev.map(u => u.id === editingAgentDetailsUser.id ? { ...u, agentPaymentNumber: agentPaymentPhoneInput, agentMomoName: agentMomoNameInput } : u));
      setTimeout(() => {
        setEditingAgentDetailsUser(null);
      }, 1200);
    } catch (err) {
      setAgentPaymentMsg({ type: 'error', text: err.message || 'Guhindura nimero ya Agent byananiwe' });
    } finally {
      setAgentPaymentLoading(false);
    }
  };

  // Add Product Form Modal State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [prodTitle, setProdTitle] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('100');
  const [prodDailyProfit, setProdDailyProfit] = useState('3.00');
  const [prodDuration, setProdDuration] = useState('30');
  const [prodCategory, setProdCategory] = useState('Yield Pool');
  const [prodRisk, setProdRisk] = useState('Low');
  const [prodPayoutMode, setProdPayoutMode] = useState('automatic');
  const [prodPayoutInterval, setProdPayoutInterval] = useState('24');
  const [prodLoading, setProdLoading] = useState(false);
  const [prodError, setProdError] = useState(null);

  // User Balance Adjustment State
  const [adjustingUser, setAdjustingUser] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('100');
  const [adjustReason, setAdjustReason] = useState('Admin Bonus Adjustment');

  const [processingWithdrawalId, setProcessingWithdrawalId] = useState(null);
  const [processingDepositId, setProcessingDepositId] = useState(null);

  // Transactions Management Search & Filters State
  const [txnSearchQuery, setTxnSearchQuery] = useState('');
  const [txnTypeFilter, setTxnTypeFilter] = useState('all');
  const [txnStatusFilter, setTxnStatusFilter] = useState('all');

  // Edit Deposit & Withdrawal Modal State
  const [editingDeposit, setEditingDeposit] = useState(null);
  const [editingWithdrawal, setEditingWithdrawal] = useState(null);

  // Edit Deposit Fields
  const [editDepAmount, setEditDepAmount] = useState(0);
  const [editDepStatus, setEditDepStatus] = useState('pending');
  const [editDepMethod, setEditDepMethod] = useState('');
  const [editDepRef, setEditDepRef] = useState('');
  const [editDepAgentCode, setEditDepAgentCode] = useState('');
  const [editDepReason, setEditDepReason] = useState('');

  // Edit Withdrawal Fields
  const [editWthAmount, setEditWthAmount] = useState(0);
  const [editWthStatus, setEditWthStatus] = useState('pending');
  const [editWthMethod, setEditWthMethod] = useState('');
  const [editWthDetails, setEditWthDetails] = useState('');
  const [editWthReason, setEditWthReason] = useState('');

  const [txnActionLoading, setTxnActionLoading] = useState(false);
  const [txnActionMsg, setTxnActionMsg] = useState(null);

  // Transaction delete confirm states
  const [deletingDepositConfirm, setDeletingDepositConfirm] = useState(null);
  const [deletingWithdrawalConfirm, setDeletingWithdrawalConfirm] = useState(null);

  const handleOpenEditDeposit = (dep) => {
    setEditingDeposit(dep);
    setEditDepAmount(dep.amount);
    setEditDepStatus(dep.status);
    setEditDepMethod(dep.paymentMethod || 'MTN Mobile Money');
    setEditDepRef(dep.transactionRef || '');
    setEditDepAgentCode(dep.agentCode || '');
    setEditDepReason(dep.rejectionReason || '');
    setTxnActionMsg(null);
  };

  const handleSaveEditDeposit = async (e) => {
    e.preventDefault();
    if (!editingDeposit || !onUpdateDeposit) return;
    setTxnActionLoading(true);
    setTxnActionMsg(null);
    try {
      await onUpdateDeposit(editingDeposit.id, {
        amount: Number(editDepAmount),
        status: editDepStatus,
        paymentMethod: editDepMethod,
        transactionRef: editDepRef,
        agentCode: editDepAgentCode,
        rejectionReason: editDepReason
      });
      setTxnActionMsg({ type: 'success', text: 'Deposit request updated successfully!' });
      setTimeout(() => {
        setEditingDeposit(null);
      }, 800);
    } catch (err) {
      setTxnActionMsg({ type: 'error', text: err.message || 'Failed to update deposit' });
    } finally {
      setTxnActionLoading(false);
    }
  };

  const handleDeleteDepositSubmit = async () => {
    if (!deletingDepositConfirm || !onDeleteDeposit) return;
    setTxnActionLoading(true);
    try {
      await onDeleteDeposit(deletingDepositConfirm.id);
      setDeletingDepositConfirm(null);
    } catch (err) {
      alert(err.message || 'Failed to delete deposit');
    } finally {
      setTxnActionLoading(false);
    }
  };

  const handleOpenEditWithdrawal = (wth) => {
    setEditingWithdrawal(wth);
    setEditWthAmount(wth.amount);
    setEditWthStatus(wth.status);
    setEditWthMethod(wth.paymentMethod || 'MTN Mobile Money');
    setEditWthDetails(wth.bankOrWalletDetails || '');
    setEditWthReason(wth.rejectionReason || '');
    setTxnActionMsg(null);
  };

  const handleSaveEditWithdrawal = async (e) => {
    e.preventDefault();
    if (!editingWithdrawal || !onUpdateWithdrawal) return;
    setTxnActionLoading(true);
    setTxnActionMsg(null);
    try {
      await onUpdateWithdrawal(editingWithdrawal.id, {
        amount: Number(editWthAmount),
        status: editWthStatus,
        paymentMethod: editWthMethod,
        bankOrWalletDetails: editWthDetails,
        rejectionReason: editWthReason
      });
      setTxnActionMsg({ type: 'success', text: 'Withdrawal request updated successfully!' });
      setTimeout(() => {
        setEditingWithdrawal(null);
      }, 800);
    } catch (err) {
      setTxnActionMsg({ type: 'error', text: err.message || 'Failed to update withdrawal' });
    } finally {
      setTxnActionLoading(false);
    }
  };

  const handleDeleteWithdrawalSubmit = async () => {
    if (!deletingWithdrawalConfirm || !onDeleteWithdrawal) return;
    setTxnActionLoading(true);
    try {
      await onDeleteWithdrawal(deletingWithdrawalConfirm.id);
      setDeletingWithdrawalConfirm(null);
    } catch (err) {
      alert(err.message || 'Failed to delete withdrawal');
    } finally {
      setTxnActionLoading(false);
    }
  };

  const pendingWithdrawals = (withdrawals || []).filter(w => w && w.status === 'pending');
  const pendingDeposits = (deposits || []).filter(d => d && d.status === 'pending');

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setProdTitle('');
    setProdDesc('');
    setProdPrice('100');
    setProdDailyProfit('3.00');
    setProdDuration('30');
    setProdCategory('Growth');
    setProdRisk('Low');
    setProdPayoutMode('automatic');
    setProdPayoutInterval('24');
    setProdError(null);
    setShowAddProductModal(true);
  };

  const handleOpenEditModal = (p) => {
    setEditingProduct(p);
    setProdTitle(p.title || '');
    setProdDesc(p.description || '');
    setProdPrice((p.price ?? 100).toString());
    setProdDailyProfit((p.dailyProfit ?? 3).toString());
    setProdDuration((p.durationDays ?? 30).toString());
    setProdCategory(p.category || 'Growth');
    setProdRisk(p.riskLevel || 'Low');
    setProdPayoutMode(p.profitPayoutMode || 'automatic');
    setProdPayoutInterval((p.payoutIntervalHours || 24).toString());
    setProdError(null);
    setShowAddProductModal(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setProdError(null);
    setProdLoading(true);

    try {
      if (editingProduct) {
        await onUpdateProduct(editingProduct.id, {
          title: prodTitle,
          description: prodDesc,
          price: Number(prodPrice),
          dailyProfit: Number(prodDailyProfit),
          durationDays: Number(prodDuration),
          category: prodCategory,
          riskLevel: prodRisk,
          profitPayoutMode: prodPayoutMode,
          payoutIntervalHours: Number(prodPayoutInterval) || 24
        });
      } else {
        await onCreateProduct({
          title: prodTitle,
          description: prodDesc,
          price: Number(prodPrice),
          dailyProfit: Number(prodDailyProfit),
          durationDays: Number(prodDuration),
          category: prodCategory,
          riskLevel: prodRisk,
          profitPayoutMode: prodPayoutMode,
          payoutIntervalHours: Number(prodPayoutInterval) || 24
        });
      }
      setShowAddProductModal(false);
    } catch (err) {
      setProdError(err.message || 'Failed to save product');
    } finally {
      setProdLoading(false);
    }
  };

  const handleProcessWithdrawalAction = async (id, action) => {
    setProcessingWithdrawalId(id);
    try {
      await onProcessWithdrawal(id, action);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingWithdrawalId(null);
    }
  };

  const handleProcessDepositAction = async (id, action) => {
    setProcessingDepositId(id);
    try {
      await onProcessDeposit(id, action);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingDepositId(null);
    }
  };

  const handleAdjustBalanceSubmit = async (e) => {
    e.preventDefault();
    if (!adjustingUser) return;
    try {
      await onAdjustUserBalance(adjustingUser.id, Number(adjustAmount), adjustReason);
      setAdjustingUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">

      {/* Admin Sub-Header Control Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-black text-white tracking-wide">Ibiro By'Ubuyobozi (Admin Control Panel)</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Official MoMo Pay Receiver: <span className="font-mono text-amber-300 font-bold">0736206060</span> (Niyonsenga Bernard)
          </p>
        </div>

        {/* Quick Nav Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Byose (Overview)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('admin-deposits')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'admin-deposits'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Kubitsa ({pendingDeposits.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('admin-withdrawals')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'admin-withdrawals'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Kubikuza ({pendingWithdrawals.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'products'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Ibyicuruzwa ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('admin-users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'admin-users'
                ? 'bg-teal-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Abakoresha ({localUsers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'transactions' || activeTab === 'admin-transactions'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Transactions
          </button>
        </div>
      </div>
      
      {/* Executive Overview Analytics */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span>{t('totalUsers')}</span>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-black text-white">{analytics.totalUsers || 0}</div>
            <p className="text-[11px] text-slate-400 mt-2">
              <span className="text-emerald-400 font-bold">{analytics.totalClients || 0} Abashora Imari</span> • <span className="text-blue-400 font-bold">{analytics.totalAgents || 0} Agents</span>
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span>Amafaranga Yashowe Yose</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400">{(analytics.totalInvestedAmount || 0).toLocaleString('en-US')} FRW</div>
            <p className="text-[11px] text-slate-400 mt-2">
              Muri <span className="text-white font-bold">{analytics.totalActiveInvestments || 0}</span> gahunda zikora
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span>{t('pendingWithdrawals')}</span>
              <CreditCard className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-400">{analytics.pendingWithdrawalsCount || 0}</div>
            <p className="text-[11px] text-slate-400 mt-2">
              Bitegereje ubwemezi bwa Admin gusa
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span>Inyungu Zose Zamaze Kwishyurwa</span>
              <Zap className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-3xl font-black text-teal-300">{(analytics.totalDailyProfitPaid || 0).toLocaleString('en-US')} FRW</div>
            <p className="text-[11px] text-slate-400 mt-2">
              Inyungu zabikujwe kugeza ubu
            </p>
          </div>
        </div>
      )}

      {/* ADMIN PENDING DEPOSITS APPROVAL QUEUE */}
      {(activeTab === 'dashboard' || activeTab === 'admin-deposits') && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-1">
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" /> Ubusabe bw'Ibyabikijwe (Pending Deposits)
              </div>
              <h2 className="text-xl font-bold text-white">Ibyabikijwe bitegereje kwemezwa ({pendingDeposits.length})</h2>
              <p className="text-xs text-slate-400 mt-0.5">Shishoza transactions z'abakiriya babikije kuri MoMo Pay (*182*1*2*0736206060#) wemeze balance yabo</p>
            </div>
          </div>

          {pendingDeposits.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
              <p className="text-sm font-semibold text-slate-300">Nta busabe bwo kubitsa butegereje!</p>
              <p className="text-xs text-slate-500 mt-1">Ubusabe bwose bw'ibyabikijwe bwamaze kwemezwa.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 px-3">Umukiriya</th>
                    <th className="pb-3 px-3">Amafaranga</th>
                    <th className="pb-3 px-3">Uburyo & Reference</th>
                    <th className="pb-3 px-3">Agent Code</th>
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
                        {(dep.amount || 0).toLocaleString('en-US')} FRW
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="text-slate-300 font-medium">{dep.paymentMethod || 'MoMo Pay'}</div>
                        <div className="text-[11px] font-mono text-amber-300">{dep.transactionRef || 'Nta Ref'}</div>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-400">
                        {dep.agentCode || '-'}
                      </td>
                      <td className="py-3.5 px-3 text-slate-400">
                        {new Date(dep.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleProcessDepositAction(dep.id, 'approve')}
                            disabled={processingDepositId === dep.id}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Emeza Ongeza Balance
                          </button>
                          <button
                            onClick={() => handleProcessDepositAction(dep.id, 'reject')}
                            disabled={processingDepositId === dep.id}
                            className="px-3.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-semibold text-xs flex items-center gap-1"
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
      )}

      {/* Main Admin Section: WITHDRAWAL APPROVALS QUEUE */}
      {(activeTab === 'dashboard' || activeTab === 'admin-withdrawals') && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Inshingano za Admin Gusa
              </div>
              <h2 className="text-xl font-bold text-white">Ubusabe bwo Kubikuza utararepwa ({pendingWithdrawals.length})</h2>
              <p className="text-xs text-slate-400 mt-0.5">Admin ni wenyine ufite ububasha bwo kwemeza no kohereza amafaranga yabikujwe</p>
            </div>
          </div>

          {pendingWithdrawals.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
              <p className="text-sm font-semibold text-slate-300">Ubusabe bwose bwamaze gusubizwa!</p>
              <p className="text-xs text-slate-500 mt-1">Nta busabe bwo kubikuza butegereje ubwemezi.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 px-3">Umukiriya</th>
                    <th className="pb-3 px-3">Amafaranga</th>
                    <th className="pb-3 px-3">Uburyo</th>
                    <th className="pb-3 px-3">Konti Yo Woherezaho</th>
                    <th className="pb-3 px-3">Tariki</th>
                    <th className="pb-3 px-3 text-right">Igikorwa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {pendingWithdrawals.map((wth) => (
                    <tr key={wth.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-white">{wth.userName}</div>
                        <div className="text-[10px] text-slate-400">{wth.userEmail}</div>
                      </td>
                      <td className="py-3.5 px-3 font-black text-sm text-amber-400">
                        {(wth.amount || 0).toLocaleString('en-US')} FRW
                      </td>
                      <td className="py-3.5 px-3 text-slate-300 font-medium">{wth.paymentMethod}</td>
                      <td className="py-3.5 px-3 text-slate-200 max-w-xs font-mono text-[11px] break-all bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                        {wth.bankOrWalletDetails}
                      </td>
                      <td className="py-3.5 px-3 text-slate-400">
                        {new Date(wth.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleProcessWithdrawalAction(wth.id, 'approve')}
                            disabled={processingWithdrawalId === wth.id}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Emeza Yoherereze
                          </button>
                          <button
                            onClick={() => handleProcessWithdrawalAction(wth.id, 'reject')}
                            disabled={processingWithdrawalId === wth.id}
                            className="px-3.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-semibold text-xs flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Yangira Subiza Kuri Wallet
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
      )}

      {/* ADMIN PRODUCT MANAGER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              Gucunga Ibyicuruzwa byo Gushora Imari
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Admin arashobora kongeramo igicuruzwa gishya, gusettinga igiciro, inyungu y'umunsi, n'iminsi igicuruzwa kizamara</p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
          >
            <PlusCircle className="w-4 h-4" /> {t('addProduct')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              userRole="admin"
              onEditProduct={handleOpenEditModal}
              onDeleteProduct={onDeleteProduct}
            />
          ))}
        </div>
      </div>

      {/* USER ACCOUNT & ROLE MANAGEMENT */}
      {(activeTab === 'dashboard' || activeTab === 'admin-users') && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="pb-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Gucunga Abakoresha Bose ({localUsers.length})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Buri muntu wese wiyandikisha ahita ajya muri Database. Urashobora n'okumureba, guhindura amakuru ye, cyangwa kumusiba burundu.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleOpenAddUserModal}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                Umukoresha Mushya
              </button>

              {/* Role Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setUserRoleFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    userRoleFilter === 'all'
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Bose ({localUsers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setUserRoleFilter('client')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    userRoleFilter === 'client'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Abakiriya ({localUsers.filter(u => u.role === 'client').length})
                </button>
                <button
                  type="button"
                  onClick={() => setUserRoleFilter('agent')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    userRoleFilter === 'agent'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Aba Agent ({localUsers.filter(u => u.role === 'agent').length})
                </button>
                <button
                  type="button"
                  onClick={() => setUserRoleFilter('admin')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    userRoleFilter === 'admin'
                      ? 'bg-purple-800 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Aba Admin ({localUsers.filter(u => u.role === 'admin').length})
                </button>
              </div>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              placeholder="Shakisha umukoresha ukoresheje Izina, Email, Telefone, cyangwa Kode ya Agent..."
              className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
            />
            {userSearchQuery && (
              <button
                type="button"
                onClick={() => setUserSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕ Clear
              </button>
            )}
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 px-3">Umukoresha</th>
                  <th className="pb-3 px-3">Uruhare / Inshingano</th>
                  <th className="pb-3 px-3">Amafaranga mu Konti</th>
                  <th className="pb-3 px-3">Agent / Kode</th>
                  <th className="pb-3 px-3">Tariki y'Iyandikisha</th>
                  <th className="pb-3 px-3 text-right">Ibikorwa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(() => {
                  const filteredUsersList = localUsers.filter(u => {
                    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
                    const q = userSearchQuery.toLowerCase().trim();
                    const matchesSearch = !q || 
                      u.fullName.toLowerCase().includes(q) ||
                      u.email.toLowerCase().includes(q) ||
                      (u.phone && u.phone.toLowerCase().includes(q)) ||
                      (u.agentCode && u.agentCode.toLowerCase().includes(q)) ||
                      (u.referralCode && u.referralCode.toLowerCase().includes(q));
                    return matchesRole && matchesSearch;
                  });

                  if (filteredUsersList.length === 0) {
                    return (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                          Nta mukoresha ubonyatse kuri ibi bintu washakishije.
                        </td>
                      </tr>
                    );
                  }

                  return filteredUsersList.map((usr) => (
                    <tr key={usr.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-3 flex items-center gap-2.5">
                        <img
                          src={usr.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${usr.fullName}`}
                          alt={usr.fullName}
                          className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                        />
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {usr.fullName}
                          </div>
                          <div className="text-[10px] text-slate-400">{usr.email}</div>
                          {usr.phone && <div className="text-[10px] text-slate-400 font-mono">{usr.phone}</div>}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <select
                          value={usr.role}
                          onChange={(e) => onUpdateUserRole(usr.id, e.target.value)}
                          className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
                        >
                          <option value="client">Client (Umushoramari)</option>
                          <option value="agent">Agent (Uwakira Deposit)</option>
                          <option value="admin">Admin (Umuyobozi)</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-emerald-400">
                        {(usr.balance || 0).toLocaleString('en-US')} FRW
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-300">
                        {usr.role === 'agent' ? (
                          <span className="text-blue-400 font-bold">{usr.agentCode || usr.referralCode}</span>
                        ) : (
                          usr.agentCode || '-'
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-slate-400">
                        {new Date(usr.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditUserProfile(usr)}
                            className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20"
                            title="Guhindura amakuru yose"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setAdjustingUser(usr)}
                            className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20"
                            title="Adjust Balance"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                          </button>
                          {onDeleteUser && usr.id !== adminUser.id && (
                            <button
                              type="button"
                              onClick={() => setDeletingUserConfirm(usr)}
                              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20"
                              title="Siba umukoresha"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PRODUCT MODAL */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-8 max-w-md w-full shadow-2xl text-slate-100 my-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-400" />
                {editingProduct ? 'Guhindura Igicuruzwa' : 'Gushyiraho Igicuruzwa Gishya'}
              </h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {prodError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {prodError}
              </div>
            )}

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Izina ry'Igicuruzwa</label>
                <input
                  type="text"
                  required
                  value={prodTitle}
                  onChange={(e) => setProdTitle(e.target.value)}
                  placeholder="Ugereranyije: Gold Yield Accelerator"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ibisobanuro</label>
                <textarea
                  rows={2}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Incamake ku buryo bwo gutanga inyungu..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Igiciro (FRW)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Inyungu y'Umunsi (FRW)</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min={0.1}
                    value={prodDailyProfit}
                    onChange={(e) => setProdDailyProfit(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Iminsi)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={prodDuration}
                    onChange={(e) => setProdDuration(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Icyiciro</label>
                  <input
                    type="text"
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    placeholder="Starter / Growth"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Urwego rw'Ibyago (Risk)</label>
                <select
                  value={prodRisk}
                  onChange={(e) => setProdRisk(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Low">Low Risk (Muke)</option>
                  <option value="Medium">Medium Risk (Hagati)</option>
                  <option value="High">High Yield (Ashoza)</option>
                </select>
              </div>

              {/* Profit Payout Mode Setting */}
              <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl space-y-3">
                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1">
                    Uburyo Inyungu Itangwa (Profit Payout Mode)
                  </label>
                  <p className="text-[11px] text-slate-400 mb-2">
                    Hitamo niba inyungu yishyiraho yenyine ku balance cyangwa niba umukiriya azajya ayisaba (claim) na bouton.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setProdPayoutMode('automatic')}
                      className={`py-2 px-2.5 rounded-lg text-xs font-semibold border flex flex-col items-center gap-1 transition-all ${
                        prodPayoutMode === 'automatic'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <span>⚡ Automatic</span>
                      <span className="text-[9px] text-slate-400 font-normal">Yishyiraho yenyine</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setProdPayoutMode('manual_claim')}
                      className={`py-2 px-2.5 rounded-lg text-xs font-semibold border flex flex-col items-center gap-1 transition-all ${
                        prodPayoutMode === 'manual_claim'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <span>🖐️ Manual Claim</span>
                      <span className="text-[9px] text-slate-400 font-normal">Umukiriya ayisaba na bouton</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Amasaha yo Gutanga Inyungu (Payout Interval)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      required
                      min={1}
                      value={prodPayoutInterval}
                      onChange={(e) => setProdPayoutInterval(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                    />
                    <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Amasaha</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">Urugero: 24 (Inyungu iboneka buri nyuma y'amasaha 24)</span>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={prodLoading}
                  className="px-5 py-2 rounded-xl bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-500/20"
                >
                  {prodLoading ? (
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    editingProduct ? 'Bika Impinduka' : 'Emeza Igicuruzwa Gishya'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL EDIT USER PROFILE MODAL */}
      {editingUserProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl text-slate-100 my-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-400" />
                Guhindura Ibiranga Umukoresha (Edit User Profile)
              </h3>
              <button
                type="button"
                onClick={() => setEditingUserProfile(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {editUserMsg && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${editUserMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'}`}>
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editUserMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveUserProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Izina Ryose (Full Name)</label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nimero ya Telefone</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="0788XXXXXX"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Uruhare / Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="client">Client (Umushoramari)</option>
                    <option value="agent">Agent (Uwakira Deposit)</option>
                    <option value="admin">Admin (Umuyobozi)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Balance ya Konti (FRW)</label>
                  <input
                    type="number"
                    min={0}
                    value={editBalance}
                    onChange={(e) => setEditBalance(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Bonus Balance (FRW)</label>
                  <input
                    type="number"
                    min={0}
                    value={editBonusBalance}
                    onChange={(e) => setEditBonusBalance(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-purple-400 font-bold focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                {(editRole === 'agent' || editRole === 'admin') && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Nimero MoMo ya Agent</label>
                      <input
                        type="text"
                        value={editAgentPaymentNumber}
                        onChange={(e) => setEditAgentPaymentNumber(e.target.value)}
                        placeholder="0788XXXXXX"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Izina Rya MoMo ya Agent</label>
                      <input
                        type="text"
                        value={editAgentMomoName}
                        onChange={(e) => setEditAgentMomoName(e.target.value)}
                        placeholder="Izina ryanditse kuri simcard"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800">
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Hindura Umubare w'Ibanganga / Password (Bikoreshe niba yibagiwe password):
                </label>
                <input
                  type="password"
                  value={editNewPassword}
                  onChange={(e) => setEditNewPassword(e.target.value)}
                  placeholder="Siga hano haranga niba utawuhindura..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUserProfile(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Hagarika
                </button>
                <button
                  type="submit"
                  disabled={editUserLoading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors disabled:opacity-50"
                >
                  {editUserLoading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Bika Impinduka'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADJUST USER BALANCE MODAL */}
      {adjustingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-8 max-w-md w-full shadow-2xl text-slate-100 my-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-400" />
                Guhindura Amafaranga y'Umukoresha
              </h3>
              <button
                onClick={() => setAdjustingUser(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs mb-4">
              <div className="font-bold text-white">{adjustingUser.fullName}</div>
              <div className="text-slate-400">{adjustingUser.email}</div>
              <div className="text-emerald-400 font-bold mt-1">
                Ayo afite kuri ubu: {(adjustingUser.balance || 0).toLocaleString('en-US')} FRW
              </div>
            </div>

            <form onSubmit={handleAdjustBalanceSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Amafaranga yo Kongeraho (FRW) <span className="text-slate-400 font-normal">(koresha minus '-' mu kugabanya)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Impamvu / Inyandiko</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Ugereranyije: Agashimbasmwete / Guhindura mu ntoki"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md shadow-amber-400/20"
                >
                  Emeza Impinduka za Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DEPOSIT MODAL FOR ADMIN */}
      {editingDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl text-slate-100 my-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-emerald-400" />
                Guhindura Amakuru ya Deposit (Admin)
              </h3>
              <button
                onClick={() => setEditingDeposit(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 space-y-1 text-xs">
              <div>Umukiriya: <strong className="text-white">{editingDeposit.userName}</strong> ({editingDeposit.userEmail})</div>
              <div>ID: <span className="font-mono text-slate-300">{editingDeposit.id}</span></div>
            </div>

            {txnActionMsg && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${txnActionMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'}`}>
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{txnActionMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditDeposit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Amafaranga (FRW)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editDepAmount}
                    onChange={(e) => setEditDepAmount(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={editDepStatus}
                    onChange={(e) => setEditDepStatus(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-400"
                  >
                    <option value="pending">Bitegereje (Pending)</option>
                    <option value="approved">Byemejwe (Approved)</option>
                    <option value="rejected">Byanzwe (Rejected)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Uburyo bwo Kwishyura (Payment Method)</label>
                <input
                  type="text"
                  required
                  value={editDepMethod}
                  onChange={(e) => setEditDepMethod(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Transaction Ref / MoMo Code</label>
                <input
                  type="text"
                  required
                  value={editDepRef}
                  onChange={(e) => setEditDepRef(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Agent Code (Niba Uhari)</label>
                <input
                  type="text"
                  value={editDepAgentCode}
                  onChange={(e) => setEditDepAgentCode(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                />
              </div>

              {editDepStatus === 'rejected' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Impamvu yo Kwanga (Rejection Reason)</label>
                  <input
                    type="text"
                    value={editDepReason}
                    onChange={(e) => setEditDepReason(e.target.value)}
                    placeholder="E.g. Amafaranga ntiyageze kuri MoMo ya Agent"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDeposit(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={txnActionLoading}
                  className="px-5 py-2 rounded-xl bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-400/20"
                >
                  {txnActionLoading ? 'Bira hinduka...' : 'Bika Impinduka'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE DEPOSIT CONFIRM MODAL */}
      {deletingDepositConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <Trash2 className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Siba Ibi bika bya Deposit?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Wemeje gusiba iyi deposit ya <strong className="text-emerald-400">{deletingDepositConfirm.amount.toLocaleString('en-US')} FRW</strong> ya mukiriya <strong className="text-white">{deletingDepositConfirm.userName}</strong>.
              {deletingDepositConfirm.status === 'approved' && (
                <span className="block mt-2 text-rose-300 font-semibold bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                  ⚠️ Note: Cyabaye cyaremejwe, gusiba bizahita nigabanya ayo mafaranga kuri balance ya client!
                </span>
              )}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingDepositConfirm(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Hagarika
              </button>
              <button
                type="button"
                onClick={handleDeleteDepositSubmit}
                disabled={txnActionLoading}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30"
              >
                {txnActionLoading ? 'Biragihagarara...' : 'Siba Burundu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT WITHDRAWAL MODAL FOR ADMIN */}
      {editingWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl text-slate-100 my-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-amber-400" />
                Guhindura Amakuru ya Withdrawal (Admin)
              </h3>
              <button
                onClick={() => setEditingWithdrawal(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 space-y-1 text-xs">
              <div>Umukiriya: <strong className="text-white">{editingWithdrawal.userName}</strong> ({editingWithdrawal.userEmail})</div>
              <div>ID: <span className="font-mono text-slate-300">{editingWithdrawal.id}</span></div>
            </div>

            {txnActionMsg && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${txnActionMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'}`}>
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{txnActionMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditWithdrawal} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Amafaranga (FRW)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editWthAmount}
                    onChange={(e) => setEditWthAmount(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={editWthStatus}
                    onChange={(e) => setEditWthStatus(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                  >
                    <option value="pending">Bitegereje (Pending)</option>
                    <option value="approved">Byemejwe (Approved)</option>
                    <option value="rejected">Byanzwe (Rejected)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Uburyo bwo Kwakira (Payment Method)</label>
                <input
                  type="text"
                  required
                  value={editWthMethod}
                  onChange={(e) => setEditWthMethod(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nimero/Details zo Kwakireramo</label>
                <input
                  type="text"
                  required
                  value={editWthDetails}
                  onChange={(e) => setEditWthDetails(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              {editWthStatus === 'rejected' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Impamvu yo Kwanga (Rejection Reason)</label>
                  <input
                    type="text"
                    value={editWthReason}
                    onChange={(e) => setEditWthReason(e.target.value)}
                    placeholder="E.g. Nimero ntiyabonetse"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingWithdrawal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={txnActionLoading}
                  className="px-5 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md shadow-amber-400/20"
                >
                  {txnActionLoading ? 'Bira hinduka...' : 'Bika Impinduka'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE WITHDRAWAL CONFIRM MODAL */}
      {deletingWithdrawalConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <Trash2 className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Siba Ibi bika bya Withdrawal?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Wemeje gusiba iyi withdrawal ya <strong className="text-amber-400">{deletingWithdrawalConfirm.amount.toLocaleString('en-US')} FRW</strong> ya mukiriya <strong className="text-white">{deletingWithdrawalConfirm.userName}</strong>.
              {deletingWithdrawalConfirm.status === 'pending' && (
                <span className="block mt-2 text-emerald-300 font-semibold bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                  ℹ️ Note: Cyari kigitegereje, gusiba bizahita bisubiza ayo mafaranga kuri balance ya client!
                </span>
              )}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingWithdrawalConfirm(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Hagarika
              </button>
              <button
                type="button"
                onClick={handleDeleteWithdrawalSubmit}
                disabled={txnActionLoading}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30"
              >
                {txnActionLoading ? 'Biragihagarara...' : 'Siba Burundu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW USER MODAL (ADMIN) */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl text-slate-100 my-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-purple-400" />
                Gushyiraho Umukoresha Mushya muri Database
              </h3>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {addUserError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{addUserError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUserSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Izina Ryose (Full Name) *</label>
                  <input
                    type="text"
                    required
                    value={addUserFullName}
                    onChange={(e) => setAddUserFullName(e.target.value)}
                    placeholder="E.g. Keza Alice"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nimero ya Telefone *</label>
                  <input
                    type="text"
                    required
                    value={addUserPhone}
                    onChange={(e) => setAddUserPhone(e.target.value)}
                    placeholder="0788XXXXXX"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email (Niba ayifite)</label>
                  <input
                    type="email"
                    value={addUserEmail}
                    onChange={(e) => setAddUserEmail(e.target.value)}
                    placeholder="Optional email"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Umubare w'Ibanga (Password) *</label>
                  <input
                    type="password"
                    required
                    minLength={4}
                    value={addUserPassword}
                    onChange={(e) => setAddUserPassword(e.target.value)}
                    placeholder="Umubare w'ibanga"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Inshingano / Role *</label>
                  <select
                    value={addUserRole}
                    onChange={(e) => setAddUserRole(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="client">Client (Umushoramari)</option>
                    <option value="agent">Agent (Uwakira Deposit)</option>
                    <option value="admin">Admin (Umuyobozi)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Amafaranga yo Banza kumuha (FRW)</label>
                  <input
                    type="number"
                    min={0}
                    value={addUserInitialBalance}
                    onChange={(e) => setAddUserInitialBalance(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              {addUserRole === 'agent' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kode ya Agent (Agent Code)</label>
                  <input
                    type="text"
                    value={addUserAgentCode}
                    onChange={(e) => setAddUserAgentCode(e.target.value)}
                    placeholder="Ugereranyije: AGENT-KIGALI-1"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Hagarika
                </button>
                <button
                  type="submit"
                  disabled={addUserLoading}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-colors disabled:opacity-50"
                >
                  {addUserLoading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Emeza Umukoresha'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE USER CONFIRMATION MODAL */}
      {deletingUserConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <Trash2 className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Siba Konti y'Umukoresha?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Wemeje gusiba burundu konti ya <strong className="text-white">{deletingUserConfirm.fullName}</strong> ({deletingUserConfirm.phone || deletingUserConfirm.email}).
              <span className="block mt-2 text-rose-300 font-semibold bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                ⚠️ Ikitonderwa: Iki gikorwa ntigishobora gusubizwa nyuma. Amakuru yose ahita asibwa muri Database.
              </span>
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUserConfirm(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Hagarika
              </button>
              <button
                type="button"
                onClick={handleDeleteUserSubmit}
                disabled={deletingUserLoading}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 flex items-center gap-1.5"
              >
                {deletingUserLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Siba Burundu'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
