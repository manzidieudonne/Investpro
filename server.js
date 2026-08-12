import express from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './src/server/db.js';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'investpro_secret_jwt_key_2026_super_secure';

app.use(express.json());

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access denied. No authentication token provided.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.findUserById(decoded.id);

    if (!user || user.status === 'suspended') {
      res.status(403).json({ error: 'User account is inactive or not found.' });
      return;
    }

    const { passwordHash, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired authentication token.' });
  }
};

// Role Middlewares
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden: Access restricted to System Administrators only.' });
    return;
  }
  next();
};

const requireAgentOrAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'agent' && req.user.role !== 'admin')) {
    res.status(403).json({ error: 'Forbidden: Access restricted to Agents or Admins.' });
    return;
  }
  next();
};

// ==================== API ROUTES ====================

// Serve public directory and PWA assets
app.use(express.static(path.join(process.cwd(), 'public')));

app.get(['/pwa-192.png', '/pwa-512.png', '/apple-touch-icon.png'], (req, res) => {
  const iconPath = path.join(process.cwd(), 'src/assets/images/pwa_icon_1785334604484.jpg');
  res.sendFile(iconPath);
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AUTH ROUTES
app.post('/api/auth/register', (req, res) => {
  try {
    const body = req.body || {};
    const { email, password, fullName, phone, role, agentCode, referredBy, referralCode } = body;

    if (!phone || !password || !fullName) {
      res.status(400).json({ error: 'Numero ya telefoni, umubare w\'ibanga, n\'izina ryose birakenewe.' });
      return;
    }

    const phoneStr = String(phone).trim();
    const passwordStr = String(password);
    const fullNameStr = String(fullName).trim();

    if (!phoneStr || !passwordStr || !fullNameStr) {
      res.status(400).json({ error: 'Numero ya telefoni, umubare w\'ibanga, n\'izina ryose birakenewe.' });
      return;
    }

    const phoneClean = db.cleanPhone(phoneStr);
    if (!phoneClean || phoneClean.length < 8) {
      res.status(400).json({ error: 'Nyamuneka andika numero ya telefoni y\'ukuri.' });
      return;
    }

    // STRICT CHECK: Phone number MUST be unique!
    const existingUserByPhone = db.findUserByPhone(phoneStr);
    if (existingUserByPhone) {
      res.status(400).json({ error: 'Numero ya telefoni yamaze gukoreshwa kuri indi konti. Hitamo iyindi cyangwa winjire.' });
      return;
    }

    // Synthesize an email if not provided (for DB / JWT schema compatibility)
    const userEmail = email ? String(email).trim() : `${phoneClean}@phone.investpro.rw`;

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(passwordStr, salt);

    // Default to 'client' unless explicitly set to agent or admin during dev
    const assignedRole = (role === 'admin' || role === 'agent') ? role : 'client';

    const newUser = db.createUser({
      email: userEmail,
      passwordHash,
      fullName: fullNameStr,
      phone: phoneStr,
      role: assignedRole,
      agentCode: agentCode ? String(agentCode) : undefined,
      referredBy: (referredBy || referralCode) ? String(referredBy || referralCode) : undefined
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, phone: newUser.phone, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, user: newUser });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Kwiyandikisha ntibyakunze.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const body = req.body || {};
    const { identifier, email, phone, password } = body;
    const rawKey = identifier || phone || email;

    if (!rawKey || !password) {
      res.status(400).json({ error: 'Numero ya telefoni (cyangwa Email) n\'umubare w\'ibanga birakenewe.' });
      return;
    }

    const loginKey = String(rawKey).trim();
    const passwordStr = String(password);

    if (!loginKey || !passwordStr) {
      res.status(400).json({ error: 'Numero ya telefoni (cyangwa Email) n\'umubare w\'ibanga birakenewe.' });
      return;
    }

    const userWithHash = db.findUserByIdentifier(loginKey);
    if (!userWithHash || !userWithHash.passwordHash) {
      res.status(401).json({ error: 'Numero ya telefoni (cyangwa email) cyangwa umubare w\'ibanga sibyo.' });
      return;
    }

    const passwordMatches = bcrypt.compareSync(passwordStr, userWithHash.passwordHash);
    if (!passwordMatches) {
      res.status(401).json({ error: 'Numero ya telefoni (cyangwa email) cyangwa umubare w\'ibanga sibyo.' });
      return;
    }

    const safeUser = db.toSafeUser(userWithHash);

    const token = jwt.sign(
      { id: safeUser.id, email: safeUser.email, phone: safeUser.phone, role: safeUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: safeUser });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Kwinjira ntibyakunze.' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  // Return fresh user object with current balance and referral count
  const freshUser = db.findUserById(req.user.id);
  if (!freshUser) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  const safeUser = db.toSafeUser(freshUser);
  res.json({ user: safeUser });
});

app.post('/api/auth/recover-password', (req, res) => {
  try {
    const body = req.body || {};
    const { identifier, phone, email, newPassword } = body;
    const rawKey = identifier || phone || email;

    if (!rawKey || !newPassword) {
      res.status(400).json({ error: 'Numero ya telefoni n\'umubare w\'ibanga mushya birakenewe.' });
      return;
    }

    const key = String(rawKey).trim();
    const newPwdStr = String(newPassword);

    if (newPwdStr.length < 6) {
      res.status(400).json({ error: 'Umubare w\'ibanga mushya ugomba kuba ufite nibura inyuguti 6.' });
      return;
    }

    const userWithHash = db.findUserByIdentifier(key);
    if (!userWithHash) {
      res.status(404).json({ error: 'Nta konti yabonywe ikoresha iyi numero ya telefoni. Nyamuneka banza wiyandikishe.' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(newPwdStr, salt);

    db.updateUser(userWithHash.id, { passwordHash });

    res.json({ message: 'Umubare w\'ibanga wahinduwe neza! Urasabwa kwinjira ukoresheje umubare w\'ibanga mushya.' });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Kugarura umubare w\'ibanga ntibyakunze.' });
  }
});

app.put('/api/auth/profile', authenticateToken, (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const body = req.body || {};
    const { fullName, phone, avatarUrl, currentPassword, newPassword, agentPaymentNumber, agentMomoName } = body;
    const updates = {};

    if (fullName) updates.fullName = String(fullName).trim();
    if (phone !== undefined) updates.phone = String(phone).trim();
    if (avatarUrl) updates.avatarUrl = String(avatarUrl);
    if (agentPaymentNumber !== undefined) updates.agentPaymentNumber = String(agentPaymentNumber).trim();
    if (agentMomoName !== undefined) updates.agentMomoName = String(agentMomoName).trim();

    if (newPassword) {
      const newPwdStr = String(newPassword);
      if (newPwdStr.length < 6) {
        res.status(400).json({ error: 'Umubare w\'ibanga mushya ugomba kuba ufite nibura inyuguti 6.' });
        return;
      }

      const userWithHash = db.findUserById(req.user.id);
      if (!userWithHash) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      if (currentPassword) {
        const matches = bcrypt.compareSync(String(currentPassword), userWithHash.passwordHash);
        if (!matches) {
          res.status(400).json({ error: 'Current password provided is incorrect.' });
          return;
        }
      }

      const salt = bcrypt.genSaltSync(10);
      updates.passwordHash = bcrypt.hashSync(newPwdStr, salt);
    }

    const updatedUser = db.updateUser(req.user.id, updates);
    res.json({ message: 'Profile settings updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Profile update failed' });
  }
});

// PRODUCTS ROUTES
app.get('/api/products', (req, res) => {
  try {
    const products = db.getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch products' });
  }
});

// Admin adds a new product (price, duration, daily profit, payout mode)
app.post('/api/products', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { title, description, price, dailyProfit, durationDays, category, riskLevel, profitPayoutMode, payoutIntervalHours } = req.body;

    if (!title || price === undefined || dailyProfit === undefined || !durationDays) {
      res.status(400).json({ error: 'Title, price, daily profit, and duration days are required.' });
      return;
    }

    const numPrice = Number(price);
    const numDailyProfit = Number(dailyProfit);
    const numDuration = Number(durationDays);
    const dailyProfitPercent = numPrice > 0 ? Number(((numDailyProfit / numPrice) * 100).toFixed(2)) : 0;
    const intervalHours = payoutIntervalHours ? Number(payoutIntervalHours) : 24;

    const newProduct = db.createProduct({
      title,
      description: description || '',
      price: numPrice,
      dailyProfit: numDailyProfit,
      dailyProfitPercent,
      durationDays: numDuration,
      category: category || 'General',
      riskLevel: riskLevel || 'Medium',
      active: true,
      profitPayoutMode: profitPayoutMode === 'manual_claim' ? 'manual_claim' : 'automatic',
      payoutIntervalHours: intervalHours > 0 ? intervalHours : 24
    });

    res.status(201).json({ message: 'Product created successfully', product: newProduct });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to create product' });
  }
});

app.put('/api/products/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, dailyProfit, durationDays, category, riskLevel, active, profitPayoutMode, payoutIntervalHours } = req.body;

    const updates = {};
    if (title) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = Number(price);
    if (dailyProfit !== undefined) updates.dailyProfit = Number(dailyProfit);
    if (durationDays !== undefined) updates.durationDays = Number(durationDays);
    if (category) updates.category = category;
    if (riskLevel) updates.riskLevel = riskLevel;
    if (active !== undefined) updates.active = Boolean(active);
    if (profitPayoutMode) updates.profitPayoutMode = profitPayoutMode;
    if (payoutIntervalHours !== undefined) updates.payoutIntervalHours = Number(payoutIntervalHours);

    if (updates.price && updates.dailyProfit) {
      updates.dailyProfitPercent = Number(((updates.dailyProfit / updates.price) * 100).toFixed(2));
    }

    const updated = db.updateProduct(id, updates);
    if (!updated) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json({ message: 'Product updated successfully', product: updated });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to update product' });
  }
});

app.delete('/api/products/:id', authenticateToken, requireAdmin, (req, res) => {
  const success = db.deleteProduct(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json({ message: 'Product removed successfully' });
});

// INVESTMENTS ROUTES
app.get('/api/investments', authenticateToken, (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (req.user.role === 'admin') {
      res.json(db.getAllInvestments());
    } else {
      res.json(db.getInvestmentsByUser(req.user.id));
    }
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch investments' });
  }
});

app.post('/api/investments', authenticateToken, (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { productId } = req.body;
    if (!productId) {
      res.status(400).json({ error: 'Product ID is required.' });
      return;
    }

    const result = db.createInvestment(req.user.id, productId);
    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }

    // Return fresh user balance alongside investment
    const updatedUser = db.findUserById(req.user.id);
    const { passwordHash, ...safeUser } = updatedUser;

    res.status(201).json({
      message: 'Investment started successfully! Daily yield will accrue every 24 hours.',
      investment: result.investment,
      user: safeUser
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to process investment' });
  }
});

app.post('/api/investments/:id/claim', authenticateToken, (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const result = db.claimDailyProfit(req.user.id, req.params.id);
    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }

    const updatedUser = db.findUserById(req.user.id);
    const { passwordHash, ...safeUser } = updatedUser;

    res.json({
      message: `Successfully claimed $${result.claimedAmount?.toFixed(2)} daily yield into wallet balance!`,
      claimedAmount: result.claimedAmount,
      user: safeUser
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to claim daily yield' });
  }
});

// Agent details for client deposit lookup
app.get('/api/agent/my-agent', authenticateToken, (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    const agent = db.getAgentForClient(req.user.id);
    res.json({ agent: agent || null });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch agent details' });
  }
});

// Update Agent Payment Details (Agent Phone & MoMo Name)
app.put('/api/agent/payment-details', authenticateToken, requireAgentOrAdmin, (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { agentPaymentNumber, agentMomoName } = req.body;
    if (!agentPaymentNumber) {
      res.status(400).json({ error: 'Agent payment phone number is required.' });
      return;
    }

    const updatedUser = db.updateUser(req.user.id, {
      agentPaymentNumber: agentPaymentNumber.trim(),
      agentMomoName: agentMomoName ? agentMomoName.trim() : req.user.fullName
    });

    res.json({
      message: 'Agent payment phone number updated successfully!',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to update payment details' });
  }
});

// DEPOSITS ROUTES (Agent allow deposit only, Admin oversight)
app.get('/api/deposits', authenticateToken, (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (req.user.role === 'admin') {
      res.json(db.getDeposits());
    } else if (req.user.role === 'agent') {
      res.json(db.getDepositsForAgent(req.user));
    } else {
      res.json(db.getDeposits({ userId: req.user.id }));
    }
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch deposits' });
  }
});

app.post('/api/deposits', authenticateToken, (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { amount, paymentMethod, transactionRef, agentCode } = req.body;

    if (!amount || Number(amount) < 12000 || !paymentMethod || !transactionRef) {
      res.status(400).json({ error: 'Amafaranga make yo kubitsa ni 12,000 FRW.' });
      return;
    }

    const deposit = db.createDepositRequest(
      req.user.id,
      Number(amount),
      paymentMethod,
      transactionRef,
      agentCode
    );

    res.status(201).json({
      message: 'Deposit request submitted successfully. Waiting for Agent or Admin verification.',
      deposit
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to submit deposit' });
  }
});

// Agent / Admin approves or rejects deposit
app.put('/api/deposits/:id/process', authenticateToken, requireAgentOrAdmin, (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { action, reason } = req.body;
    if (action !== 'approve' && action !== 'reject') {
      res.status(400).json({ error: 'Action must be either "approve" or "reject".' });
      return;
    }

    const result = db.processDeposit(req.params.id, req.user, action, reason);
    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.json({
      message: `Deposit request successfully ${action}d!`,
      deposit: result.deposit
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Deposit processing failed' });
  }
});

// WITHDRAWALS ROUTES (Agent processes assigned clients, Admin oversight)
app.get('/api/withdrawals', authenticateToken, (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (req.user.role === 'admin') {
      res.json(db.getWithdrawals());
    } else if (req.user.role === 'agent') {
      res.json(db.getWithdrawalsForAgent(req.user));
    } else {
      res.json(db.getWithdrawals({ userId: req.user.id }));
    }
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch withdrawals' });
  }
});

app.post('/api/withdrawals', authenticateToken, (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { amount, paymentMethod, bankOrWalletDetails } = req.body;

    if (!amount || Number(amount) < 37000 || !paymentMethod || !bankOrWalletDetails) {
      res.status(400).json({ error: 'Amafaranga make yo kubikuza ni 37,000 FRW.' });
      return;
    }

    const result = db.createWithdrawalRequest(
      req.user.id,
      Number(amount),
      paymentMethod,
      bankOrWalletDetails
    );

    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }

    const freshUser = db.findUserById(req.user.id);
    const { passwordHash, ...safeUser } = freshUser;

    res.status(201).json({
      message: 'Withdrawal request submitted. Waiting for Agent or Admin approval.',
      withdrawal: result.withdrawal,
      user: safeUser
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to submit withdrawal' });
  }
});

// Process Withdrawal -> Agent or Admin
app.put('/api/withdrawals/:id/process', authenticateToken, requireAgentOrAdmin, (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { action, reason } = req.body;
    if (action !== 'approve' && action !== 'reject') {
      res.status(400).json({ error: 'Action must be "approve" or "reject".' });
      return;
    }

    const result = db.processWithdrawal(req.params.id, req.user, action, reason);
    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.json({
      message: `Withdrawal request successfully ${action}d by Admin!`,
      withdrawal: result.withdrawal
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Withdrawal processing failed' });
  }
});

// NOTIFICATIONS ROUTES
app.get('/api/notifications', authenticateToken, (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    const notifications = db.getNotifications(req.user.id);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch notifications' });
  }
});

app.put('/api/notifications/:id/read', authenticateToken, (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    const success = db.markNotificationAsRead(req.params.id, req.user.id);
    res.json({ success });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to mark notification read' });
  }
});

app.put('/api/notifications/read-all', authenticateToken, (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    const success = db.markAllNotificationsAsRead(req.user.id);
    res.json({ success });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to mark all notifications read' });
  }
});

// ADMIN MANAGEMENT ROUTES
app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  try {
    const users = db.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch users list' });
  }
});

app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const targetUserId = req.params.id;
    if (req.user && req.user.id === targetUserId) {
      res.status(400).json({ error: 'Etazewe gusiba konti yawe ya Admin ubwawe!' });
      return;
    }

    const success = db.deleteUser(targetUserId);
    if (!success) {
      res.status(404).json({ error: 'Umushoramari cyangwa Agent ntiyabonetse' });
      return;
    }

    res.json({ message: 'Umukiriya / Agent wasibwe neza!' });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Gusiba umukiriya byananiwe' });
  }
});

app.put('/api/admin/users/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const targetUserId = req.params.id;
    const { fullName, email, phone, role, balance, bonusBalance, agentCode, agentPaymentNumber, agentMomoName, newPassword } = req.body;

    const updates = {};
    if (fullName) updates.fullName = fullName.trim();
    if (email) updates.email = email.trim().toLowerCase();
    if (phone !== undefined) updates.phone = phone.trim();
    if (role && (role === 'admin' || role === 'agent' || role === 'client')) updates.role = role;
    if (balance !== undefined && !isNaN(Number(balance))) updates.balance = Math.max(0, Number(balance));
    if (bonusBalance !== undefined && !isNaN(Number(bonusBalance))) updates.bonusBalance = Math.max(0, Number(bonusBalance));
    if (agentCode !== undefined) updates.agentCode = agentCode.trim();
    if (agentPaymentNumber !== undefined) updates.agentPaymentNumber = agentPaymentNumber.trim();
    if (agentMomoName !== undefined) updates.agentMomoName = agentMomoName.trim();

    if (newPassword && newPassword.trim().length >= 4) {
      const salt = bcrypt.genSaltSync(10);
      updates.passwordHash = bcrypt.hashSync(newPassword.trim(), salt);
    }

    const updatedUser = db.updateUser(targetUserId, updates);
    if (!updatedUser) {
      res.status(404).json({ error: 'Umukoresha ntiyabonetse' });
      return;
    }

    res.json({ message: `Ibiranga umukoresha ${updatedUser.fullName} byahinduwe neza!`, user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Guhindura ibiranga umukoresha byananiwe' });
  }
});

app.put('/api/admin/users/:id/role', authenticateToken, requireAdmin, (req, res) => {
  const { role } = req.body;
  if (!role || (role !== 'admin' && role !== 'agent' && role !== 'client')) {
    res.status(400).json({ error: 'Invalid role specified' });
    return;
  }

  const updated = db.updateUser(req.params.id, { role });
  if (!updated) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({ message: `User role updated to ${role}`, user: updated });
});

app.put('/api/admin/users/:id/agent-payment-details', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { agentPaymentNumber, agentMomoName } = req.body;
    if (!agentPaymentNumber) {
      res.status(400).json({ error: 'Agent payment phone number is required' });
      return;
    }

    const updatedUser = db.updateUser(req.params.id, {
      agentPaymentNumber: agentPaymentNumber.trim(),
      agentMomoName: agentMomoName ? agentMomoName.trim() : undefined
    });

    if (!updatedUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      message: 'Agent payment details updated successfully by Admin',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to update agent payment details' });
  }
});

app.put('/api/admin/users/:id/assign-agent', authenticateToken, requireAdmin, (req, res) => {
  const { agentId } = req.body;
  if (!agentId) {
    res.status(400).json({ error: 'agentId parameter is required' });
    return;
  }

  const result = db.assignAgentToClient(req.params.id, agentId);
  if (!result.success) {
    res.status(400).json({ error: result.error });
    return;
  }

  res.json({ message: 'Agent assigned to client successfully', user: result.user });
});

app.put('/api/admin/users/:id/balance', authenticateToken, requireAdmin, (req, res) => {
  const { amount, reason } = req.body;
  if (amount === undefined || isNaN(Number(amount))) {
    res.status(400).json({ error: 'Valid numerical amount is required' });
    return;
  }

  const numAmount = Number(amount);
  const newBalance = db.adjustUserBalance(req.params.id, numAmount);

  db.createTransaction({
    userId: req.params.id,
    type: 'admin_adjustment',
    amount: Math.abs(numAmount),
    status: 'completed',
    description: `Admin balance adjustment (${numAmount >= 0 ? '+' : ''}$${numAmount.toFixed(2)}): ${reason || 'Manual adjustment'}`
  });

  res.json({ message: 'User balance adjusted successfully', newBalance });
});

// ADMIN TRANSACTION MANAGEMENT ROUTES
app.put('/api/admin/deposits/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    const result = db.adminUpdateDeposit(req.params.id, req.body, req.user);
    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json({ message: 'Deposit updated successfully', deposit: result.deposit });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to update deposit' });
  }
});

app.delete('/api/admin/deposits/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const success = db.adminDeleteDeposit(req.params.id);
    if (!success) {
      res.status(404).json({ error: 'Deposit not found' });
      return;
    }
    res.json({ message: 'Deposit deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to delete deposit' });
  }
});

app.put('/api/admin/withdrawals/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    const result = db.adminUpdateWithdrawal(req.params.id, req.body, req.user);
    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json({ message: 'Withdrawal updated successfully', withdrawal: result.withdrawal });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to update withdrawal' });
  }
});

app.delete('/api/admin/withdrawals/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const success = db.adminDeleteWithdrawal(req.params.id);
    if (!success) {
      res.status(404).json({ error: 'Withdrawal not found' });
      return;
    }
    res.json({ message: 'Withdrawal deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to delete withdrawal' });
  }
});

app.get('/api/admin/analytics', authenticateToken, requireAdmin, (req, res) => {
  try {
    const users = db.getAllUsers();
    const investments = db.getAllInvestments();
    const deposits = db.getDeposits();
    const withdrawals = db.getWithdrawals();

    const totalClients = users.filter(u => u.role === 'client').length;
    const totalAgents = users.filter(u => u.role === 'agent').length;

    const totalInvestedAmount = investments.reduce((acc, i) => acc + i.amount, 0);
    const totalActiveInvestments = investments.filter(i => i.status === 'active').length;

    const approvedDeposits = deposits.filter(d => d.status === 'approved');
    const totalApprovedDeposits = approvedDeposits.reduce((acc, d) => acc + d.amount, 0);
    const pendingDepositsCount = deposits.filter(d => d.status === 'pending').length;

    const approvedWithdrawals = withdrawals.filter(w => w.status === 'approved');
    const totalApprovedWithdrawals = approvedWithdrawals.reduce((acc, w) => acc + w.amount, 0);
    const pendingWithdrawalsCount = withdrawals.filter(w => w.status === 'pending').length;

    const totalDailyProfitPaid = investments.reduce((acc, i) => acc + i.totalClaimedProfit, 0);

    res.json({
      totalUsers: users.length,
      totalClients,
      totalAgents,
      totalInvestedAmount,
      totalActiveInvestments,
      totalApprovedDeposits,
      pendingDepositsCount,
      totalApprovedWithdrawals,
      pendingWithdrawalsCount,
      totalDailyProfitPaid
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch analytics' });
  }
});

// AGENT ROUTES
app.get('/api/agent/stats', authenticateToken, requireAgentOrAdmin, (req, res) => {
  try {
    const agentDeposits = db.getDepositsForAgent(req.user);
    const pendingRequestsCount = agentDeposits.filter(d => d.status === 'pending').length;
    const approved = agentDeposits.filter(d => d.status === 'approved');
    const totalVolumeProcessed = approved.reduce((acc, d) => acc + d.amount, 0);

    res.json({
      pendingRequestsCount,
      totalVolumeProcessed,
      agentCode: req.user?.agentCode || req.user?.referralCode || 'AGENT-ALPHA'
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch agent stats' });
  }
});

app.get('/api/agent/clients', authenticateToken, requireAgentOrAdmin, (req, res) => {
  try {
    const clients = db.getClientsForAgent(req.user);
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch clients' });
  }
});

// Agent processes direct deposit for a client by email
app.post('/api/agent/direct-deposit', authenticateToken, requireAgentOrAdmin, (req, res) => {
  try {
    const { clientEmail, amount, paymentMethod, reference } = req.body;

    if (!clientEmail || !amount || Number(amount) <= 0) {
      res.status(400).json({ error: 'Client email and valid deposit amount are required.' });
      return;
    }

    const client = db.findUserByEmail(clientEmail);
    if (!client) {
      res.status(404).json({ error: 'Client with this email address was not found.' });
      return;
    }

    // Check if client belongs to this agent
    if (req.user.role === 'agent' && !db.isClientOfAgent(client.id, req.user)) {
      res.status(403).json({
        error: `Ntiwemerewe gushyira amafaranga kuri konti y'uyu mukiriya. Ubasha gushyira amafaranga kuri konti y'abakiriya bakoresheje kode yawe (${req.user.agentCode || req.user.referralCode || 'yawe'}) gusa.`
      });
      return;
    }

    // Direct deposit request and instant approval by agent
    const deposit = db.createDepositRequest(
      client.id,
      Number(amount),
      paymentMethod || 'Direct Cash / Agent Deposit',
      reference || `AGENT-DIR-${Date.now()}`,
      req.user.agentCode || req.user.referralCode
    );

    const result = db.processDeposit(deposit.id, req.user, 'approve', 'Agent direct cash deposit');
    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.json({
      message: `Direct deposit of ${Number(amount).toLocaleString('en-US')} FRW credited directly to client ${client.fullName}!`,
      clientBalance: result.deposit ? db.findUserById(client.id)?.balance : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Direct deposit failed' });
  }
});

// TRANSACTIONS LOG
app.get('/api/transactions', authenticateToken, (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (req.user.role === 'admin') {
      // System Admin sees all transactions across all users & agents
      res.json(db.getTransactions());
    } else if (req.user.role === 'agent') {
      // Agent views ONLY transactions made or processed for their clients
      res.json(db.getAgentTransactions(req.user.id));
    } else {
      // Client views their own transactions
      res.json(db.getTransactions(req.user.id));
    }
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch transactions' });
  }
});

// Global API Error Handler Middleware to guarantee JSON responses
app.use((err, req, res, next) => {
  console.error('API Server Error:', err);
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'An unexpected server error occurred'
  });
});

// ==================== VITE MIDDLEWARE ====================

async function startServer() {
  const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_ENV || process.env.NOW_BUILDER);

  if (!isVercel && process.env.NODE_ENV !== 'production') {
    try {
      const moduleName = 'vite';
      const viteModule = await import(/* @vite-ignore */ moduleName);
      const vite = await viteModule.createServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.warn('Vite middleware initialization skipped or failed:', e);
    }
  } else if (!isVercel) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!isVercel) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`InvestPro Express Server running on http://0.0.0.0:${PORT}`);
    });
  }
}

startServer();

export default app;
