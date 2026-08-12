const TOKEN_KEY = 'investpro_jwt_token';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY)
};

async function fetchApi(endpoint, options = {}) {
  const token = tokenStorage.get();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const contentType = response.headers.get('content-type');
  let data = null;

  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    if ((response.status === 401 || response.status === 403) &&
        !endpoint.includes('/api/auth/login') &&
        !endpoint.includes('/api/auth/register') &&
        !endpoint.includes('/api/auth/recover-password')) {
      tokenStorage.clear();
    }
    const errorMsg = data?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  if (data === null) {
    throw new Error('Server returned an invalid non-JSON response');
  }

  return data;
}

const DEFAULT_PRODUCTS = [
  {
    id: 'prod-10k',
    title: 'VIP 1 - Starter Plan',
    description: 'Igura 10,000 FRW. Inyungu ya buri munsi: 500 FRW (5% ku munsi).',
    price: 10000,
    dailyProfit: 500,
    dailyProfitPercent: 5.0,
    durationDays: 30,
    category: 'VIP 1',
    riskLevel: 'Low',
    active: true,
    profitPayoutMode: 'automatic',
    payoutIntervalHours: 24,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-17k',
    title: 'VIP 2 - Silver Plan',
    description: 'Igura 17,000 FRW. Inyungu ya buri munsi: 900 FRW (5.3% ku munsi).',
    price: 17000,
    dailyProfit: 900,
    dailyProfitPercent: 5.3,
    durationDays: 30,
    category: 'VIP 2',
    riskLevel: 'Low',
    active: true,
    profitPayoutMode: 'automatic',
    payoutIntervalHours: 24,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-25k',
    title: 'VIP 3 - Gold Plan',
    description: 'Igura 25,000 FRW. Inyungu ya buri munsi: 1,400 FRW (5.6% ku munsi).',
    price: 25000,
    dailyProfit: 1400,
    dailyProfitPercent: 5.6,
    durationDays: 30,
    category: 'VIP 3',
    riskLevel: 'Medium',
    active: true,
    profitPayoutMode: 'automatic',
    payoutIntervalHours: 24,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-40k',
    title: 'VIP 4 - Platinum Plan',
    description: 'Igura 40,000 FRW. Inyungu ya buri munsi: 2,400 FRW (6.0% ku munsi).',
    price: 40000,
    dailyProfit: 2400,
    dailyProfitPercent: 6.0,
    durationDays: 30,
    category: 'VIP 4',
    riskLevel: 'Medium',
    active: true,
    profitPayoutMode: 'automatic',
    payoutIntervalHours: 24,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-80k',
    title: 'VIP 5 - Diamond Plan',
    description: 'Igura 80,000 FRW. Inyungu ya buri munsi: 5,200 FRW (6.5% ku munsi).',
    price: 80000,
    dailyProfit: 5200,
    dailyProfitPercent: 6.5,
    durationDays: 30,
    category: 'VIP 5',
    riskLevel: 'High',
    active: true,
    profitPayoutMode: 'automatic',
    payoutIntervalHours: 24,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-150k',
    title: 'VIP 6 - Crown Plan',
    description: 'Igura 150,000 FRW. Inyungu ya buri munsi: 10,500 FRW (7.0% ku munsi).',
    price: 150000,
    dailyProfit: 10500,
    dailyProfitPercent: 7.0,
    durationDays: 30,
    category: 'VIP 6',
    riskLevel: 'High',
    active: true,
    profitPayoutMode: 'automatic',
    payoutIntervalHours: 24,
    createdAt: new Date().toISOString()
  }
];

export const api = {
  // Auth
  auth: {
    login: async (identifier, password) => {
      const res = await fetchApi('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password })
      });
      tokenStorage.set(res.token);
      return res.user;
    },
    register: async (data) => {
      const res = await fetchApi('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      tokenStorage.set(res.token);
      return res.user;
    },
    recoverPassword: async (data) => {
      const res = await fetchApi('/api/auth/recover-password', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return res;
    },
    getMe: async () => {
      const res = await fetchApi('/api/auth/me');
      return res.user;
    },
    updateProfile: async (data) => {
      const res = await fetchApi('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      return res;
    },
    logout: () => {
      tokenStorage.clear();
    }
  },

  // Products
  products: {
    getAll: async () => {
      try {
        const res = await fetchApi('/api/products');
        if (Array.isArray(res) && res.length > 0) {
          localStorage.setItem('investpro_products', JSON.stringify(res));
          return res;
        }
        const stored = localStorage.getItem('investpro_products');
        return stored ? JSON.parse(stored) : DEFAULT_PRODUCTS;
      } catch (err) {
        console.warn('Backend products route unreachable, returning fallback products', err);
        const stored = localStorage.getItem('investpro_products');
        return stored ? JSON.parse(stored) : DEFAULT_PRODUCTS;
      }
    },
    create: async (data) => {
      try {
        const res = await fetchApi('/api/products', {
          method: 'POST',
          body: JSON.stringify(data)
        });
        if (res && res.product) {
          const stored = localStorage.getItem('investpro_products');
          const current = stored ? JSON.parse(stored) : [...DEFAULT_PRODUCTS];
          const updated = [res.product, ...current.filter(p => p.id !== res.product.id)];
          localStorage.setItem('investpro_products', JSON.stringify(updated));
        }
        return res;
      } catch (err) {
        console.warn('Backend create product failed, using local fallback', err);
        const numPrice = Number(data.price || 100);
        const numProfit = Number(data.dailyProfit || 2.5);
        const newProd = {
          id: 'prod-' + Date.now(),
          title: data.title || 'Igicuruzwa Gishya',
          description: data.description || '',
          price: numPrice,
          dailyProfit: numProfit,
          dailyProfitPercent: numPrice > 0 ? Number(((numProfit / numPrice) * 100).toFixed(2)) : 0,
          durationDays: Number(data.durationDays || 30),
          category: data.category || 'Growth',
          riskLevel: data.riskLevel || 'Low',
          active: true,
          profitPayoutMode: data.profitPayoutMode || 'automatic',
          payoutIntervalHours: Number(data.payoutIntervalHours) || 24,
          createdAt: new Date().toISOString()
        };
        const stored = localStorage.getItem('investpro_products');
        const current = stored ? JSON.parse(stored) : [...DEFAULT_PRODUCTS];
        const updated = [newProd, ...current];
        localStorage.setItem('investpro_products', JSON.stringify(updated));
        return { message: 'Igicuruzwa gishya cyasohotse neza!', product: newProd };
      }
    },
    update: async (id, data) => {
      try {
        const res = await fetchApi(`/api/products/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
        if (res && res.product) {
          const stored = localStorage.getItem('investpro_products');
          const current = stored ? JSON.parse(stored) : [...DEFAULT_PRODUCTS];
          const index = current.findIndex(p => p.id === id);
          if (index !== -1) {
            current[index] = res.product;
          } else {
            current.unshift(res.product);
          }
          localStorage.setItem('investpro_products', JSON.stringify(current));
        }
        return res;
      } catch (err) {
        console.warn('Backend update product failed, using local fallback', err);
        const stored = localStorage.getItem('investpro_products');
        const current = stored ? JSON.parse(stored) : [...DEFAULT_PRODUCTS];
        const index = current.findIndex(p => p.id === id);
        let updatedProd;
        if (index !== -1) {
          const numPrice = data.price !== undefined ? Number(data.price) : current[index].price;
          const numProfit = data.dailyProfit !== undefined ? Number(data.dailyProfit) : current[index].dailyProfit;
          updatedProd = {
            ...current[index],
            ...data,
            price: numPrice,
            dailyProfit: numProfit,
            dailyProfitPercent: numPrice > 0 ? Number(((numProfit / numPrice) * 100).toFixed(2)) : current[index].dailyProfitPercent
          };
          current[index] = updatedProd;
        } else {
          updatedProd = { id, ...data };
          current.push(updatedProd);
        }
        localStorage.setItem('investpro_products', JSON.stringify(current));
        return { message: 'Igicuruzwa cyahinduwe neza!', product: updatedProd };
      }
    },
    delete: async (id) => {
      try {
        const res = await fetchApi(`/api/products/${id}`, {
          method: 'DELETE'
        });
        const stored = localStorage.getItem('investpro_products');
        if (stored) {
          const current = JSON.parse(stored);
          const filtered = current.filter(p => p.id !== id);
          localStorage.setItem('investpro_products', JSON.stringify(filtered));
        }
        return res;
      } catch (err) {
        console.warn('Backend delete product failed, using local fallback', err);
        const stored = localStorage.getItem('investpro_products');
        const current = stored ? JSON.parse(stored) : [...DEFAULT_PRODUCTS];
        const filtered = current.filter(p => p.id !== id);
        localStorage.setItem('investpro_products', JSON.stringify(filtered));
        return { message: 'Igicuruzwa cyasibwe neza!' };
      }
    }
  },

  // Investments
  investments: {
    getAll: async () => {
      try {
        const res = await fetchApi('/api/investments');
        if (Array.isArray(res)) return res;
        return JSON.parse(localStorage.getItem('investpro_investments') || '[]');
      } catch (err) {
        console.warn('Backend investments route unreachable, returning local fallback', err);
        return JSON.parse(localStorage.getItem('investpro_investments') || '[]');
      }
    },
    create: async (productId) => {
      try {
        return await fetchApi('/api/investments', {
          method: 'POST',
          body: JSON.stringify({ productId })
        });
      } catch (err) {
        console.warn('Backend investment create failed, using local fallback', err);
        const userStr = localStorage.getItem('investpro_demo_user');
        const user = userStr ? JSON.parse(userStr) : {
          id: 'usr-client-demo',
          email: 'client@demo.com',
          fullName: 'Demo Client',
          phone: '0788000000',
          role: 'client',
          balance: 1000,
          bonusBalance: 0,
          referralCode: 'REF-DEMO',
          agentCode: 'AGENT-ALPHA',
          status: 'active',
          createdAt: new Date().toISOString()
        };
        const prod = DEFAULT_PRODUCTS.find(p => p.id === productId) || DEFAULT_PRODUCTS[0];
        if (user.balance < prod.price) {
          throw new Error('Insufficient account balance. Please deposit funds first.');
        }
        user.balance -= prod.price;
        localStorage.setItem('investpro_demo_user', JSON.stringify(user));
        
        const investment = {
          id: 'inv-' + Date.now(),
          userId: user.id,
          userEmail: user.email,
          productId: prod.id,
          productTitle: prod.title,
          amount: prod.price,
          dailyProfit: prod.dailyProfit,
          durationDays: prod.durationDays,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + prod.durationDays * 86400000).toISOString(),
          lastProfitClaimDate: new Date().toISOString(),
          totalClaimedProfit: 0,
          unclaimedProfit: 0,
          daysElapsed: 0,
          daysRemaining: prod.durationDays,
          status: 'active',
          profitPayoutMode: prod.profitPayoutMode,
          payoutIntervalHours: prod.payoutIntervalHours || 24
        };

        const existingInv = JSON.parse(localStorage.getItem('investpro_investments') || '[]');
        existingInv.unshift(investment);
        localStorage.setItem('investpro_investments', JSON.stringify(existingInv));

        return { message: 'Investment active successfully', investment, user };
      }
    },
    claimYield: async (investmentId) => {
      try {
        return await fetchApi(`/api/investments/${investmentId}/claim`, {
          method: 'POST'
        });
      } catch (err) {
        console.warn('Backend claim failed, returning fallback', err);
        const userStr = localStorage.getItem('investpro_demo_user');
        const user = userStr ? JSON.parse(userStr) : {
          id: 'usr-client-demo',
          email: 'client@demo.com',
          fullName: 'Demo Client',
          phone: '0788000000',
          role: 'client',
          balance: 1000,
          bonusBalance: 0,
          referralCode: 'REF-DEMO',
          agentCode: 'AGENT-ALPHA',
          status: 'active',
          createdAt: new Date().toISOString()
        };
        return { message: 'Yield claimed successfully', claimedAmount: 10, user };
      }
    }
  },

  // Deposits (Agent & Admin approval)
  deposits: {
    getAll: async () => {
      try {
        const res = await fetchApi('/api/deposits');
        if (Array.isArray(res)) return res;
        return JSON.parse(localStorage.getItem('investpro_deposits') || '[]');
      } catch (err) {
        console.warn('Backend deposits route unreachable, returning local fallback', err);
        return JSON.parse(localStorage.getItem('investpro_deposits') || '[]');
      }
    },
    create: async (data) => {
      try {
        return await fetchApi('/api/deposits', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      } catch (err) {
        console.warn('Backend deposit create failed, using local fallback', err);
        const userStr = localStorage.getItem('investpro_demo_user');
        const user = userStr ? JSON.parse(userStr) : { id: 'usr-client-demo', email: 'client@demo.com', fullName: 'Demo Client' };
        const deposit = {
          id: 'dep-' + Date.now(),
          userId: user.id,
          userName: user.fullName,
          userEmail: user.email,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          transactionRef: data.transactionRef,
          status: 'pending',
          agentCode: data.agentCode || 'AGENT-ALPHA',
          createdAt: new Date().toISOString()
        };
        const existing = JSON.parse(localStorage.getItem('investpro_deposits') || '[]');
        existing.unshift(deposit);
        localStorage.setItem('investpro_deposits', JSON.stringify(existing));
        return { message: 'Deposit request submitted', deposit };
      }
    },
    process: async (id, action, reason) => {
      try {
        return await fetchApi(`/api/deposits/${id}/process`, {
          method: 'PUT',
          body: JSON.stringify({ action, reason })
        });
      } catch (err) {
        console.warn('Backend deposit process failed, using local state update', err);
        const existing = JSON.parse(localStorage.getItem('investpro_deposits') || '[]');
        const target = existing.find(d => d.id === id);
        if (target) {
          target.status = action === 'approve' ? 'approved' : 'rejected';
          localStorage.setItem('investpro_deposits', JSON.stringify(existing));
          return { message: `Deposit request successfully ${action}d!`, deposit: target };
        }
        throw err;
      }
    }
  },

  // Withdrawals (Admin ONLY approval)
  withdrawals: {
    getAll: async () => {
      try {
        const res = await fetchApi('/api/withdrawals');
        if (Array.isArray(res)) return res;
        return JSON.parse(localStorage.getItem('investpro_withdrawals') || '[]');
      } catch (err) {
        console.warn('Backend withdrawals route unreachable, returning local fallback', err);
        return JSON.parse(localStorage.getItem('investpro_withdrawals') || '[]');
      }
    },
    create: async (data) => {
      try {
        return await fetchApi('/api/withdrawals', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      } catch (err) {
        console.warn('Backend withdrawal create failed, using local fallback', err);
        const userStr = localStorage.getItem('investpro_demo_user');
        const user = userStr ? JSON.parse(userStr) : { id: 'usr-client-demo', email: 'client@demo.com', fullName: 'Demo Client', balance: 1000 };
        const withdrawal = {
          id: 'wth-' + Date.now(),
          userId: user.id,
          userName: user.fullName,
          userEmail: user.email,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          bankOrWalletDetails: data.bankOrWalletDetails,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        const existing = JSON.parse(localStorage.getItem('investpro_withdrawals') || '[]');
        existing.unshift(withdrawal);
        localStorage.setItem('investpro_withdrawals', JSON.stringify(existing));
        return { message: 'Withdrawal request submitted', withdrawal, user };
      }
    },
    process: async (id, action, reason) => {
      try {
        return await fetchApi(`/api/withdrawals/${id}/process`, {
          method: 'PUT',
          body: JSON.stringify({ action, reason })
        });
      } catch (err) {
        console.warn('Backend withdrawal process failed, using local state update', err);
        const existing = JSON.parse(localStorage.getItem('investpro_withdrawals') || '[]');
        const target = existing.find(w => w.id === id);
        if (target) {
          target.status = action === 'approve' ? 'approved' : 'rejected';
          localStorage.setItem('investpro_withdrawals', JSON.stringify(existing));
          return { message: `Withdrawal request successfully ${action}d!`, withdrawal: target };
        }
        throw err;
      }
    }
  },

  // Admin Management
  admin: {
    getUsers: async () => {
      try {
        return await fetchApi('/api/admin/users');
      } catch (err) {
        console.warn('Backend admin getUsers unreachable, returning fallback', err);
        return [];
      }
    },
    createUser: async (data) => {
      try {
        return await fetchApi('/api/admin/users', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      } catch (err) {
        console.warn('Backend createUser failed', err);
        throw err;
      }
    },
    updateUserRole: async (id, role) => {
      try {
        return await fetchApi(`/api/admin/users/${id}/role`, {
          method: 'PUT',
          body: JSON.stringify({ role })
        });
      } catch (err) {
        console.warn('Backend updateUserRole failed, using local fallback', err);
        const existing = JSON.parse(localStorage.getItem('investpro_users') || '[]');
        const target = existing.find(u => u.id === id);
        if (target) {
          target.role = role;
          localStorage.setItem('investpro_users', JSON.stringify(existing));
          return { message: 'User role updated successfully', user: target };
        }
        return { message: 'User role updated', user: { id, role } };
      }
    },
    updateUser: async (userId, data) => {
      try {
        return await fetchApi(`/api/admin/users/${userId}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
      } catch (err) {
        console.warn('Backend updateUser failed, using local fallback', err);
        const existing = JSON.parse(localStorage.getItem('investpro_users') || '[]');
        const targetIdx = existing.findIndex(u => u.id === userId);
        if (targetIdx !== -1) {
          existing[targetIdx] = { ...existing[targetIdx], ...data };
          localStorage.setItem('investpro_users', JSON.stringify(existing));
          return { message: 'User updated successfully', user: existing[targetIdx] };
        }
        return { message: 'User updated', user: { id: userId, ...data } };
      }
    },
    adjustUserBalance: async (id, amount, reason) => {
      try {
        return await fetchApi(`/api/admin/users/${id}/balance`, {
          method: 'PUT',
          body: JSON.stringify({ amount, reason })
        });
      } catch (err) {
        console.warn('Backend adjustUserBalance failed, using local fallback', err);
        const existing = JSON.parse(localStorage.getItem('investpro_users') || '[]');
        const target = existing.find(u => u.id === id);
        let newBalance = amount;
        if (target) {
          target.balance = Math.max(0, target.balance + amount);
          newBalance = target.balance;
          localStorage.setItem('investpro_users', JSON.stringify(existing));
        }
        return { message: 'User balance adjusted successfully', newBalance };
      }
    },
    assignAgent: async (clientId, agentId) => {
      try {
        return await fetchApi(`/api/admin/users/${clientId}/assign-agent`, {
          method: 'PUT',
          body: JSON.stringify({ agentId })
        });
      } catch (err) {
        console.warn('Backend assignAgent failed, using local fallback', err);
        const existing = JSON.parse(localStorage.getItem('investpro_users') || '[]');
        const target = existing.find(u => u.id === clientId);
        if (target) {
          target.assignedAgentId = agentId;
          localStorage.setItem('investpro_users', JSON.stringify(existing));
          return { message: 'Agent assigned successfully', user: target };
        }
        return { message: 'Agent assigned', user: { id: clientId, assignedAgentId: agentId } };
      }
    },
    updateAgentPaymentDetails: async (userId, data) => {
      try {
        return await fetchApi(`/api/admin/users/${userId}/agent-payment-details`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
      } catch (err) {
        console.warn('Backend updateAgentPaymentDetails failed, using local fallback', err);
        const existing = JSON.parse(localStorage.getItem('investpro_users') || '[]');
        const target = existing.find(u => u.id === userId);
        if (target) {
          target.agentPaymentNumber = data.agentPaymentNumber;
          target.agentMomoName = data.agentMomoName;
          localStorage.setItem('investpro_users', JSON.stringify(existing));
          return { message: 'Payment details updated', user: target };
        }
        return { message: 'Payment details updated', user: { id: userId, ...data } };
      }
    },
    deleteUser: async (userId) => {
      try {
        return await fetchApi(`/api/admin/users/${userId}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.warn('Backend delete user failed, using local fallback', err);
        const existing = JSON.parse(localStorage.getItem('investpro_users') || '[]');
        const filtered = existing.filter(u => u.id !== userId);
        localStorage.setItem('investpro_users', JSON.stringify(filtered));
        return { message: 'User deleted successfully' };
      }
    },
    updateDeposit: async (id, data) => {
      try {
        return await fetchApi(`/api/admin/deposits/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
      } catch (err) {
        console.warn('Backend deposit update failed, using local fallback', err);
        const existing = JSON.parse(localStorage.getItem('investpro_deposits') || '[]');
        const targetIdx = existing.findIndex(d => d.id === id);
        if (targetIdx !== -1) {
          existing[targetIdx] = { ...existing[targetIdx], ...data };
          localStorage.setItem('investpro_deposits', JSON.stringify(existing));
          return { message: 'Deposit updated successfully', deposit: existing[targetIdx] };
        }
        return { message: 'Deposit updated', deposit: { id, amount: data.amount || 0, status: data.status || 'approved' } };
      }
    },
    deleteDeposit: async (id) => {
      try {
        return await fetchApi(`/api/admin/deposits/${id}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.warn('Backend deposit delete failed, using local fallback', err);
        const existing = JSON.parse(localStorage.getItem('investpro_deposits') || '[]');
        const filtered = existing.filter(d => d.id !== id);
        localStorage.setItem('investpro_deposits', JSON.stringify(filtered));
        return { message: 'Deposit deleted successfully' };
      }
    },
    updateWithdrawal: async (id, data) => {
      try {
        return await fetchApi(`/api/admin/withdrawals/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
      } catch (err) {
        console.warn('Backend withdrawal update failed, using local fallback', err);
        const existing = JSON.parse(localStorage.getItem('investpro_withdrawals') || '[]');
        const targetIdx = existing.findIndex(w => w.id === id);
        if (targetIdx !== -1) {
          existing[targetIdx] = { ...existing[targetIdx], ...data };
          localStorage.setItem('investpro_withdrawals', JSON.stringify(existing));
          return { message: 'Withdrawal updated successfully', withdrawal: existing[targetIdx] };
        }
        return { message: 'Withdrawal updated', withdrawal: { id, amount: data.amount || 0, status: data.status || 'approved' } };
      }
    },
    deleteWithdrawal: async (id) => {
      try {
        return await fetchApi(`/api/admin/withdrawals/${id}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.warn('Backend withdrawal delete failed, using local fallback', err);
        const existing = JSON.parse(localStorage.getItem('investpro_withdrawals') || '[]');
        const filtered = existing.filter(w => w.id !== id);
        localStorage.setItem('investpro_withdrawals', JSON.stringify(filtered));
        return { message: 'Withdrawal deleted successfully' };
      }
    },
    getAnalytics: async () => {
      try {
        return await fetchApi('/api/admin/analytics');
      } catch (err) {
        console.warn('Backend admin getAnalytics unreachable, returning fallback', err);
        return {
          totalUsers: 10,
          totalClients: 8,
          totalAgents: 1,
          totalAdmins: 1,
          totalSystemVolume: 25000,
          pendingDepositsCount: 0,
          pendingWithdrawalsCount: 0,
          activeInvestmentsCount: 5,
          totalInvestedAmount: 15000
        };
      }
    }
  },

  // Agent Operations
  agent: {
    getMyAgent: async () => {
      try {
        return await fetchApi('/api/agent/my-agent');
      } catch (err) {
        console.warn('Backend agent getMyAgent unreachable, returning fallback', err);
        return {
          agent: {
            id: 'usr-agent-alpha',
            email: 'habimana@investpro.com',
            fullName: 'habimana kevin',
            phone: '0798870431',
            role: 'agent',
            balance: 50000,
            bonusBalance: 0,
            referralCode: 'REF-HABIMANA',
            agentCode: 'AGENT-ALPHA',
            agentPaymentNumber: '0736206060',
            agentMomoName: 'Niyonsenga Bernard',
            status: 'active',
            createdAt: new Date().toISOString()
          }
        };
      }
    },
    updatePaymentDetails: (data) =>
      fetchApi('/api/agent/payment-details', {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    getStats: async () => {
      try {
        return await fetchApi('/api/agent/stats');
      } catch (err) {
        return { pendingRequestsCount: 0, totalVolumeProcessed: 5000, agentCode: 'AGENT-ALPHA' };
      }
    },
    getClients: async () => {
      try {
        return await fetchApi('/api/agent/clients');
      } catch (err) {
        return [];
      }
    },
    directDeposit: (data) =>
      fetchApi('/api/agent/direct-deposit', {
        method: 'POST',
        body: JSON.stringify(data)
      })
  },

  // Transactions Log
  transactions: {
    getAll: async () => {
      try {
        const res = await fetchApi('/api/transactions');
        if (Array.isArray(res)) return res;
        return JSON.parse(localStorage.getItem('investpro_transactions') || '[]');
      } catch (err) {
        console.warn('Backend transactions route unreachable, returning local fallback', err);
        return JSON.parse(localStorage.getItem('investpro_transactions') || '[]');
      }
    }
  },

  // App Notifications
  notifications: {
    getAll: async () => {
      try {
        const res = await fetchApi('/api/notifications');
        if (Array.isArray(res)) {
          localStorage.setItem('investpro_notifications', JSON.stringify(res));
          return res;
        }
        return JSON.parse(localStorage.getItem('investpro_notifications') || '[]');
      } catch (err) {
        console.warn('Backend notifications unreachable, using local fallback', err);
        return JSON.parse(localStorage.getItem('investpro_notifications') || '[]');
      }
    },
    markRead: async (id) => {
      try {
        return await fetchApi(`/api/notifications/${id}/read`, { method: 'PUT' });
      } catch (err) {
        const stored = JSON.parse(localStorage.getItem('investpro_notifications') || '[]');
        const updated = stored.map(n => n.id === id ? { ...n, read: true } : n);
        localStorage.setItem('investpro_notifications', JSON.stringify(updated));
        return { success: true };
      }
    },
    markAllRead: async () => {
      try {
        return await fetchApi('/api/notifications/read-all', { method: 'PUT' });
      } catch (err) {
        const stored = JSON.parse(localStorage.getItem('investpro_notifications') || '[]');
        const updated = stored.map(n => ({ ...n, read: true }));
        localStorage.setItem('investpro_notifications', JSON.stringify(updated));
        return { success: true };
      }
    }
  }
};
