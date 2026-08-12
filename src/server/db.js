import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// ==========================================
// MONGOOSE SCHEMAS & MODELS
// ==========================================

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  phoneClean: { type: String, index: true },
  role: { type: String, enum: ['client', 'agent', 'admin'], default: 'client', index: true },
  balance: { type: Number, default: 0 },
  bonusBalance: { type: Number, default: 0 },
  referralCode: { type: String, index: true },
  agentCode: { type: String, index: true },
  agentPaymentNumber: { type: String },
  agentMomoName: { type: String },
  referredBy: { type: String, index: true },
  avatarUrl: { type: String },
  status: { type: String, default: 'active', index: true },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  dailyProfit: { type: Number, required: true },
  dailyProfitPercent: { type: Number, required: true },
  durationDays: { type: Number, required: true },
  category: { type: String, default: 'General' },
  riskLevel: { type: String, default: 'Medium' },
  active: { type: Boolean, default: true, index: true },
  profitPayoutMode: { type: String, default: 'automatic' },
  payoutIntervalHours: { type: Number, default: 24 }
}, { timestamps: true });

const investmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  productId: { type: String, required: true },
  productTitle: { type: String, required: true },
  amount: { type: Number, required: true },
  dailyProfit: { type: Number, required: true },
  totalClaimedProfit: { type: Number, default: 0 },
  unclaimedYield: { type: Number, default: 0 },
  payoutIntervalHours: { type: Number, default: 24 },
  profitPayoutMode: { type: String, default: 'automatic' },
  status: { type: String, default: 'active', index: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  lastClaimedAt: { type: String, required: true }
}, { timestamps: true });

const depositSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  userName: { type: String },
  userEmail: { type: String },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  transactionRef: { type: String, required: true },
  agentCode: { type: String, index: true },
  agentId: { type: String, index: true },
  agentEmail: { type: String },
  status: { type: String, default: 'pending', index: true },
  processedAt: { type: String },
  processedBy: { type: String },
  rejectionReason: { type: String },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

const withdrawalSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  userName: { type: String },
  userEmail: { type: String },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  bankOrWalletDetails: { type: String, required: true },
  status: { type: String, default: 'pending', index: true },
  processedAt: { type: String },
  processedByAdmin: { type: String },
  rejectionReason: { type: String },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

const transactionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  type: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  status: { type: String, default: 'completed', index: true },
  description: { type: String },
  referenceId: { type: String, index: true },
  agentId: { type: String, index: true },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

const notificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'general' },
  read: { type: Boolean, default: false, index: true },
  referenceId: { type: String },
  amount: { type: Number },
  clientName: { type: String },
  clientEmail: { type: String },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

export const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
export const ProductModel = mongoose.models.Product || mongoose.model('Product', productSchema);
export const InvestmentModel = mongoose.models.Investment || mongoose.model('Investment', investmentSchema);
export const DepositModel = mongoose.models.Deposit || mongoose.model('Deposit', depositSchema);
export const WithdrawalModel = mongoose.models.Withdrawal || mongoose.model('Withdrawal', withdrawalSchema);
export const TransactionModel = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
export const NotificationModel = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

// ==========================================
// FILE BACKUP FALLBACK HELPER
// ==========================================

const getWritableDataDir = () => {
  const localDir = path.join(process.cwd(), 'data');
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    const testFile = path.join(localDir, '.write_test');
    fs.writeFileSync(testFile, '1');
    fs.unlinkSync(testFile);
    return localDir;
  } catch {
    const tmpDir = path.join('/tmp', 'investpro_data');
    try {
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      return tmpDir;
    } catch {
      return localDir;
    }
  }
};

const DATA_DIR = getWritableDataDir();
const DB_FILE = path.join(DATA_DIR, 'db.json');

const getInitialSeedData = () => {
  const salt = bcrypt.genSaltSync(10);
  const habimanaAdminHash = bcrypt.hashSync('habimana', salt);
  const agentHash = bcrypt.hashSync('agent123', salt);
  const clientHash = bcrypt.hashSync('client123', salt);

  const defaultUsers = [
    {
      id: 'usr-admin-1',
      email: 'habimana@gmail.com',
      passwordHash: habimanaAdminHash,
      fullName: 'habimana kevin',
      phone: '0798870431',
      role: 'admin',
      balance: 10000,
      bonusBalance: 0,
      referralCode: 'REF-ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr-agent-1',
      email: 'agent@investpro.com',
      passwordHash: agentHash,
      fullName: 'Regional Agent Alpha',
      phone: '+1 (555) 014-9922',
      role: 'agent',
      balance: 2500,
      bonusBalance: 0,
      agentCode: 'AGENT-ALPHA',
      agentPaymentNumber: '0736206060',
      agentMomoName: 'Niyonsenga Bernard',
      referralCode: 'AGENT-ALPHA',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr-client-1',
      email: 'client@investpro.com',
      passwordHash: clientHash,
      fullName: 'Alex Vance (Client)',
      phone: '+1 (555) 018-3341',
      role: 'client',
      balance: 1500,
      bonusBalance: 0,
      referredBy: 'usr-agent-1',
      agentCode: 'AGENT-ALPHA',
      referralCode: 'REF-CLIENT1',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      status: 'active',
      createdAt: new Date().toISOString()
    }
  ];

  const defaultProducts = [
    {
      id: 'prod-vip-1',
      title: 'RWANDA-PRO PACKAGE 1',
      description: 'Shora 12,000 FRW ubone inyungu ya 3,600 FRW Buri munsi mu minsi 20 (Total FRW 72,000)',
      price: 12000,
      dailyProfit: 3600,
      dailyProfitPercent: 30,
      durationDays: 20,
      category: 'Rwanda Local VIP',
      riskLevel: 'Low',
      active: true,
      profitPayoutMode: 'automatic',
      payoutIntervalHours: 24
    },
    {
      id: 'prod-vip-2',
      title: 'RWANDA-PRO PACKAGE 2',
      description: 'Shora 30,000 FRW ubone inyungu ya 9,000 FRW Buri munsi mu minsi 20 (Total FRW 180,000)',
      price: 30000,
      dailyProfit: 9000,
      dailyProfitPercent: 30,
      durationDays: 20,
      category: 'Rwanda Local VIP',
      riskLevel: 'Low',
      active: true,
      profitPayoutMode: 'automatic',
      payoutIntervalHours: 24
    },
    {
      id: 'prod-vip-3',
      title: 'RWANDA-PRO PACKAGE 3',
      description: 'Shora 80,000 FRW ubone inyungu ya 24,000 FRW Buri munsi mu minsi 20 (Total FRW 480,000)',
      price: 80000,
      dailyProfit: 24000,
      dailyProfitPercent: 30,
      durationDays: 20,
      category: 'Rwanda Local VIP',
      riskLevel: 'Medium',
      active: true,
      profitPayoutMode: 'automatic',
      payoutIntervalHours: 24
    },
    {
      id: 'prod-vip-4',
      title: 'RWANDA-PRO PACKAGE 4',
      description: 'Shora 150,000 FRW ubone inyungu ya 45,000 FRW Buri munsi mu minsi 20 (Total FRW 900,000)',
      price: 150000,
      dailyProfit: 45000,
      dailyProfitPercent: 30,
      durationDays: 20,
      category: 'Rwanda Local VIP',
      riskLevel: 'High Yield',
      active: true,
      profitPayoutMode: 'automatic',
      payoutIntervalHours: 24
    }
  ];

  return {
    users: defaultUsers,
    products: defaultProducts,
    investments: [],
    deposits: [],
    withdrawals: [],
    transactions: [],
    notifications: []
  };
};

// ==========================================
// HIGH PERFORMANCE DB MANAGER & CACHE ENGINE
// ==========================================

class DBManager {
  constructor() {
    this.mongoConnected = false;
    this.data = this.loadLocalBackupData();
    this.ensurePhoneIndexes();
    this.initMongoDB();
  }

  // Connect to MongoDB with High Performance Pool
  async initMongoDB() {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/investpro';
    try {
      console.log('Connecting to MongoDB database...');
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 3000, // Fast timeout for immediate fallback if local daemon unhosted
        maxPoolSize: 50, // High-performance connection pool for concurrent users
        minPoolSize: 5
      });
      this.mongoConnected = true;
      console.log('✅ MongoDB connected successfully! Performance engine active.');

      // Hydrate MongoDB from seed if database collections are empty
      await this.seedMongoDBIfEmpty();
      // Load latest data from MongoDB into ultra-fast in-memory cache
      await this.syncFromMongoDB();
    } catch (err) {
      console.warn('⚠️ MongoDB connection deferred (using persistent file/memory engine):', err.message);
      this.mongoConnected = false;
    }
  }

  async seedMongoDBIfEmpty() {
    if (!this.mongoConnected) return;
    try {
      const userCount = await UserModel.countDocuments();
      if (userCount === 0) {
        console.log('Seeding MongoDB initial collections...');
        const seed = getInitialSeedData();
        await UserModel.insertMany(seed.users);
        await ProductModel.insertMany(seed.products);
      }
    } catch (e) {
      console.warn('MongoDB seed check error:', e.message);
    }
  }

  async syncFromMongoDB() {
    if (!this.mongoConnected) return;
    try {
      const [users, products, investments, deposits, withdrawals, transactions, notifications] = await Promise.all([
        UserModel.find().lean(),
        ProductModel.find().lean(),
        InvestmentModel.find().lean(),
        DepositModel.find().lean(),
        WithdrawalModel.find().lean(),
        TransactionModel.find().lean(),
        NotificationModel.find().lean()
      ]);

      this.data = {
        users: users.map(u => ({ ...u, _id: undefined, __v: undefined })),
        products: products.map(p => ({ ...p, _id: undefined, __v: undefined })),
        investments: investments.map(i => ({ ...i, _id: undefined, __v: undefined })),
        deposits: deposits.map(d => ({ ...d, _id: undefined, __v: undefined })),
        withdrawals: withdrawals.map(w => ({ ...w, _id: undefined, __v: undefined })),
        transactions: transactions.map(t => ({ ...t, _id: undefined, __v: undefined })),
        notifications: notifications.map(n => ({ ...n, _id: undefined, __v: undefined }))
      };
      this.ensurePhoneIndexes();
    } catch (e) {
      console.warn('MongoDB sync to memory failed:', e.message);
    }
  }

  loadLocalBackupData() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);

        const seed = getInitialSeedData();
        return {
          users: parsed.users || seed.users,
          products: parsed.products || seed.products,
          investments: parsed.investments || [],
          deposits: parsed.deposits || [],
          withdrawals: parsed.withdrawals || [],
          transactions: parsed.transactions || [],
          notifications: parsed.notifications || []
        };
      }
    } catch (e) {
      console.warn('Failed reading db.json, using seed data:', e);
    }

    const seed = getInitialSeedData();
    this.saveDataDirect(seed);
    return seed;
  }

  saveDataDirect(data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed saving db.json:', e);
    }
  }

  saveData() {
    // Write-Through to file backup synchronously
    this.saveDataDirect(this.data);
  }

  // Non-blocking MongoDB persistence helper
  async syncMongoDoc(model, idField, data, isDelete = false) {
    if (!this.mongoConnected) return;
    try {
      if (isDelete) {
        await model.deleteOne({ id: idField });
      } else {
        await model.updateOne({ id: idField }, { $set: data }, { upsert: true });
      }
    } catch (e) {
      console.warn(`MongoDB async update failed for ${model.modelName}:`, e.message);
    }
  }

  cleanPhone(phone) {
    if (!phone) return '';
    return String(phone).replace(/[^0-9]/g, '');
  }

  ensurePhoneIndexes() {
    let dirty = false;
    if (this.data.users) {
      this.data.users.forEach(u => {
        if (!u.phoneClean) {
          u.phoneClean = this.cleanPhone(u.phone);
          dirty = true;
        }
      });
    }
    if (dirty) this.saveData();
  }

  toSafeUser(user) {
    if (!user) return user;

    let referralCount = 0;
    if (this.data && this.data.users) {
      referralCount = this.data.users.filter(u => {
        if (u.id === user.id) return false;
        if (u.referredBy === user.id) return true;
        if (user.agentCode && u.agentCode === user.agentCode) return true;
        if (user.referralCode && (u.referredBy === user.referralCode || u.agentCode === user.referralCode)) return true;
        return false;
      }).length;
    }

    const { passwordHash, ...safe } = user;
    return {
      ...safe,
      referralCount
    };
  }

  // ==========================================
  // USER OPERATIONS
  // ==========================================
  getAllUsers() {
    return this.data.users.map(u => this.toSafeUser(u));
  }

  findUserById(id) {
    const user = this.data.users.find(u => u.id === id);
    return user ? this.toSafeUser(user) : undefined;
  }

  findUserByIdWithHash(id) {
    return this.data.users.find(u => u.id === id);
  }

  findUserByEmail(email) {
    if (!email) return undefined;
    const clean = email.trim().toLowerCase();
    const user = this.data.users.find(u => u.email.toLowerCase() === clean);
    return user ? this.toSafeUser(user) : undefined;
  }

  findUserByPhone(phone) {
    if (!phone) return undefined;
    const rawClean = String(phone).trim();
    const phoneClean = this.cleanPhone(rawClean);

    const user = this.data.users.find(u => {
      if (u.phone === rawClean) return true;
      if (phoneClean && (u.phoneClean === phoneClean || this.cleanPhone(u.phone) === phoneClean)) return true;
      return false;
    });

    return user ? this.toSafeUser(user) : undefined;
  }

  findUserByIdentifier(identifier) {
    if (!identifier) return undefined;
    const rawKey = String(identifier).trim();
    const phoneClean = this.cleanPhone(rawKey);

    return this.data.users.find(u => {
      if (u.email && u.email.toLowerCase() === rawKey.toLowerCase()) return true;
      if (u.phone && u.phone === rawKey) return true;
      if (phoneClean && phoneClean.length >= 8 && (u.phoneClean === phoneClean || this.cleanPhone(u.phone) === phoneClean)) return true;
      return false;
    });
  }

  createUser(userData) {
    const phoneClean = this.cleanPhone(userData.phone);
    const userId = 'usr-' + Math.random().toString(36).substring(2, 11);
    const userReferralCode = 'REF-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    if (userData.referredBy) {
      const referrer = this.data.users.find(u => u.id === userData.referredBy || u.referralCode === userData.referredBy || u.agentCode === userData.referredBy);
      if (referrer) {
        referrer.bonusBalance = (referrer.bonusBalance || 0) + 500;
        this.createTransaction({
          userId: referrer.id,
          type: 'referral_bonus',
          amount: 500,
          status: 'completed',
          description: `Agashimwe k'umuntu mushya wahaye link/kode yawe (${userData.fullName})`
        });
      }
    }

    const newUser = {
      id: userId,
      email: userData.email,
      passwordHash: userData.passwordHash,
      fullName: userData.fullName,
      phone: userData.phone,
      phoneClean,
      role: userData.role || 'client',
      balance: 0,
      bonusBalance: 0,
      referralCode: userReferralCode,
      agentCode: userData.agentCode,
      referredBy: userData.referredBy,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    this.data.users.push(newUser);
    this.saveData();
    this.syncMongoDoc(UserModel, userId, newUser);

    return this.toSafeUser(newUser);
  }

  updateUser(id, updates) {
    const userIndex = this.data.users.findIndex(u => u.id === id);
    if (userIndex === -1) return undefined;

    const current = this.data.users[userIndex];
    if (updates.phone) {
      updates.phoneClean = this.cleanPhone(updates.phone);
    }

    const updated = {
      ...current,
      ...updates
    };

    this.data.users[userIndex] = updated;
    this.saveData();
    this.syncMongoDoc(UserModel, id, updated);

    return this.toSafeUser(updated);
  }

  deleteUser(id) {
    const initialCount = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== id);
    if (this.data.users.length !== initialCount) {
      this.data.investments = this.data.investments.filter(i => i.userId !== id);
      this.data.deposits = this.data.deposits.filter(d => d.userId !== id);
      this.data.withdrawals = this.data.withdrawals.filter(w => w.userId !== id);
      this.data.notifications = this.data.notifications.filter(n => n.userId !== id);
      this.saveData();

      if (this.mongoConnected) {
        UserModel.deleteOne({ id }).catch(() => {});
        InvestmentModel.deleteMany({ userId: id }).catch(() => {});
        DepositModel.deleteMany({ userId: id }).catch(() => {});
        WithdrawalModel.deleteMany({ userId: id }).catch(() => {});
        NotificationModel.deleteMany({ userId: id }).catch(() => {});
      }
      return true;
    }
    return false;
  }

  adjustUserBalance(id, amount) {
    const user = this.data.users.find(u => u.id === id);
    if (user) {
      user.balance = Math.max(0, (user.balance || 0) + amount);
      this.saveData();
      this.syncMongoDoc(UserModel, id, { balance: user.balance });
      return user.balance;
    }
    return 0;
  }

  // ==========================================
  // PRODUCT OPERATIONS
  // ==========================================
  getAllProducts() {
    return this.data.products;
  }

  getProductById(id) {
    return this.data.products.find(p => p.id === id);
  }

  createProduct(productData) {
    const newProduct = {
      ...productData,
      id: 'prod-' + Math.random().toString(36).substring(2, 11)
    };
    this.data.products.push(newProduct);
    this.saveData();
    this.syncMongoDoc(ProductModel, newProduct.id, newProduct);
    return newProduct;
  }

  updateProduct(id, updates) {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return undefined;

    this.data.products[idx] = {
      ...this.data.products[idx],
      ...updates
    };

    this.saveData();
    this.syncMongoDoc(ProductModel, id, this.data.products[idx]);
    return this.data.products[idx];
  }

  deleteProduct(id) {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.products.splice(idx, 1);
      this.saveData();
      this.syncMongoDoc(ProductModel, id, null, true);
      return true;
    }
    return false;
  }

  // ==========================================
  // INVESTMENT OPERATIONS
  // ==========================================
  getAllInvestments() {
    this.accrueAllInvestments();
    return this.data.investments;
  }

  getInvestmentsByUser(userId) {
    this.accrueAllInvestments();
    return this.data.investments.filter(i => i.userId === userId);
  }

  createInvestment(userId, productId) {
    const user = this.data.users.find(u => u.id === userId);
    const product = this.data.products.find(p => p.id === productId);

    if (!user) return { error: 'User not found' };
    if (!product) return { error: 'Product not found' };
    if (!product.active) return { error: 'This investment plan is currently unavailable.' };
    if (user.balance < product.price) {
      return {
        error: `Balance riyawe ntiyagukundira gushora muli iyi gahunda. Umutungo wawe ubu ni ${user.balance.toLocaleString('en-US')} FRW. Banza ubite kubitsa!`
      };
    }

    user.balance -= product.price;
    this.syncMongoDoc(UserModel, user.id, { balance: user.balance });

    const now = new Date();
    const endDate = new Date(now.getTime() + product.durationDays * 24 * 60 * 60 * 1000);

    const investment = {
      id: 'inv-' + Math.random().toString(36).substring(2, 11),
      userId,
      productId,
      productTitle: product.title,
      amount: product.price,
      dailyProfit: product.dailyProfit,
      totalClaimedProfit: 0,
      unclaimedYield: 0,
      payoutIntervalHours: product.payoutIntervalHours || 24,
      profitPayoutMode: product.profitPayoutMode || 'automatic',
      status: 'active',
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      lastClaimedAt: now.toISOString()
    };

    this.data.investments.push(investment);

    this.createTransaction({
      userId,
      type: 'investment',
      amount: product.price,
      status: 'completed',
      description: `Gushora muli VIP Plan: ${product.title} (${product.price.toLocaleString('en-US')} FRW)`
    });

    this.saveData();
    this.syncMongoDoc(InvestmentModel, investment.id, investment);

    return { investment };
  }

  accrueAllInvestments() {
    const now = new Date();
    let updated = false;

    this.data.investments.forEach(inv => {
      if (inv.status !== 'active') return;

      const endDate = new Date(inv.endDate);

      if (now >= endDate) {
        inv.status = 'completed';
        updated = true;
      }

      const lastClaim = new Date(inv.lastClaimedAt || inv.startDate);
      const intervalMs = (inv.payoutIntervalHours || 24) * 60 * 60 * 1000;
      const elapsedMs = now.getTime() - lastClaim.getTime();

      if (elapsedMs >= intervalMs) {
        const intervalsToCredit = Math.floor(elapsedMs / intervalMs);
        const earnedAmount = intervalsToCredit * inv.dailyProfit;

        if (earnedAmount > 0) {
          if (inv.profitPayoutMode === 'automatic') {
            const user = this.data.users.find(u => u.id === inv.userId);
            if (user) {
              user.balance = (user.balance || 0) + earnedAmount;
              inv.totalClaimedProfit = (inv.totalClaimedProfit || 0) + earnedAmount;
              inv.lastClaimedAt = new Date(lastClaim.getTime() + intervalsToCredit * intervalMs).toISOString();

              this.syncMongoDoc(UserModel, user.id, { balance: user.balance });

              this.createTransaction({
                userId: inv.userId,
                type: 'yield',
                amount: earnedAmount,
                status: 'completed',
                description: `Inyungu y'umunsi: ${inv.productTitle} (+${earnedAmount.toLocaleString('en-US')} FRW)`
              });

              this.createNotification({
                userId: inv.userId,
                title: 'Inyungu Yatsindiwe! 📈',
                message: `Inyungu yawe y'umunsi ya ${earnedAmount.toLocaleString('en-US')} FRW yaturutse kuri ${inv.productTitle} yashyizwe kuri balance yawe.`,
                type: 'general',
                amount: earnedAmount
              });

              updated = true;
            }
          } else {
            inv.unclaimedYield = (inv.unclaimedYield || 0) + earnedAmount;
            inv.lastClaimedAt = new Date(lastClaim.getTime() + intervalsToCredit * intervalMs).toISOString();
            updated = true;
          }
          this.syncMongoDoc(InvestmentModel, inv.id, inv);
        }
      }
    });

    if (updated) {
      this.saveData();
    }
  }

  claimDailyProfit(userId, investmentId) {
    this.accrueAllInvestments();

    const inv = this.data.investments.find(i => i.id === investmentId && i.userId === userId);
    if (!inv) return { error: 'Investment record not found' };
    if (!inv.unclaimedYield || inv.unclaimedYield <= 0) {
      return { error: 'Nta nyungu ihari ubu. Banza utegereze ko masaha 24 ashira!' };
    }

    const claimAmount = inv.unclaimedYield;
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return { error: 'User not found' };

    user.balance = (user.balance || 0) + claimAmount;
    inv.totalClaimedProfit = (inv.totalClaimedProfit || 0) + claimAmount;
    inv.unclaimedYield = 0;

    this.createTransaction({
      userId,
      type: 'yield',
      amount: claimAmount,
      status: 'completed',
      description: `Manually claimed yield: ${inv.productTitle} (+$${claimAmount.toFixed(2)})`
    });

    this.saveData();
    this.syncMongoDoc(UserModel, user.id, { balance: user.balance });
    this.syncMongoDoc(InvestmentModel, inv.id, inv);

    return { claimedAmount: claimAmount };
  }

  // ==========================================
  // AGENT CLIENT MANAGEMENT
  // ==========================================
  isClientOfAgent(clientId, agent) {
    const client = this.data.users.find(u => u.id === clientId);
    if (!client) return false;

    if (client.referredBy === agent.id) return true;
    if (agent.agentCode && client.agentCode === agent.agentCode) return true;
    if (agent.referralCode && (client.referredBy === agent.referralCode || client.agentCode === agent.referralCode)) return true;

    return false;
  }

  getClientsForAgent(agent) {
    if (agent.role === 'admin') return this.getAllUsers();

    return this.data.users
      .filter(u => this.isClientOfAgent(u.id, agent))
      .map(u => this.toSafeUser(u));
  }

  getAgentForClient(clientId) {
    const client = this.data.users.find(u => u.id === clientId);
    if (!client) return undefined;

    let agentUser = undefined;

    if (client.agentCode) {
      agentUser = this.data.users.find(u =>
        (u.role === 'agent' || u.role === 'admin') &&
        (u.agentCode === client.agentCode || u.referralCode === client.agentCode)
      );
    }

    if (!agentUser && client.referredBy) {
      agentUser = this.data.users.find(u =>
        (u.role === 'agent' || u.role === 'admin') &&
        (u.id === client.referredBy || u.agentCode === client.referredBy || u.referralCode === client.referredBy)
      );
    }

    if (!agentUser) {
      agentUser = this.data.users.find(u => u.role === 'agent');
    }

    return agentUser ? this.toSafeUser(agentUser) : undefined;
  }

  assignAgentToClient(clientId, agentId) {
    const client = this.data.users.find(u => u.id === clientId);
    const agent = this.data.users.find(u => u.id === agentId && (u.role === 'agent' || u.role === 'admin'));

    if (!client) return { success: false, error: 'Client not found' };
    if (!agent) return { success: false, error: 'Agent not found' };

    client.referredBy = agent.id;
    client.agentCode = agent.agentCode || agent.referralCode;

    this.saveData();
    this.syncMongoDoc(UserModel, client.id, { referredBy: client.referredBy, agentCode: client.agentCode });

    return { success: true, user: this.toSafeUser(client) };
  }

  // ==========================================
  // DEPOSIT OPERATIONS
  // ==========================================
  createDepositRequest(userId, amount, paymentMethod, transactionRef, agentCode) {
    const user = this.data.users.find(u => u.id === userId);
    const assignedAgent = this.getAgentForClient(userId);

    const deposit = {
      id: 'dep-' + Math.random().toString(36).substring(2, 11),
      userId,
      userName: user ? user.fullName : 'Unknown Client',
      userEmail: user ? user.email : 'Unknown Email',
      amount,
      paymentMethod,
      transactionRef,
      agentCode: agentCode || (assignedAgent?.agentCode) || (user?.agentCode),
      agentId: assignedAgent?.id,
      agentEmail: assignedAgent?.email,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    if (!this.data.deposits) this.data.deposits = [];
    this.data.deposits.unshift(deposit);

    this.createTransaction({
      userId,
      type: 'deposit',
      amount,
      status: 'pending',
      description: `Saba kubitsa ${amount.toLocaleString('en-US')} FRW (${paymentMethod} - Ref: ${transactionRef})`,
      referenceId: deposit.id
    });

    if (assignedAgent) {
      this.createNotification({
        userId: assignedAgent.id,
        title: 'Kubitsa Gushya Biterejwe! 💰',
        message: `${user?.fullName} (Tel: ${user?.phone}) yasabye kubitsa ${amount.toLocaleString('en-US')} FRW via ${paymentMethod} (Ref: ${transactionRef}).`,
        type: 'deposit_request',
        referenceId: deposit.id,
        amount,
        clientName: user?.fullName,
        clientEmail: user?.email
      });
    }

    this.saveData();
    this.syncMongoDoc(DepositModel, deposit.id, deposit);

    return deposit;
  }

  getDeposits(filter) {
    if (!this.data.deposits) this.data.deposits = [];
    return this.data.deposits.filter(d => {
      if (filter?.userId && d.userId !== filter.userId) return false;
      if (filter?.status && d.status !== filter.status) return false;
      return true;
    });
  }

  getDepositsForAgent(agent) {
    if (!this.data.deposits) this.data.deposits = [];
    if (agent.role === 'admin') return this.data.deposits;

    return this.data.deposits.filter(d => {
      if (d.agentId === agent.id || d.agentEmail === agent.email) return true;
      return this.isClientOfAgent(d.userId, agent);
    });
  }

  processDeposit(depositId, processorUser, action, reason) {
    if (!this.data.deposits) this.data.deposits = [];
    if (!this.data.transactions) this.data.transactions = [];

    if (processorUser.role !== 'agent' && processorUser.role !== 'admin') {
      return { error: 'Unauthorized: Only Agents or Admins can verify deposit requests.' };
    }

    const deposit = this.data.deposits.find(d => d.id === depositId);
    if (!deposit) return { error: 'Deposit request not found' };
    if (deposit.status !== 'pending') return { error: 'Deposit request has already been processed' };

    if (processorUser.role === 'agent') {
      if (!this.isClientOfAgent(deposit.userId, processorUser)) {
        return {
          error: `Agent Security: Ubasha gusa kwemeza no kwemerera amashoramari/kubitsa abakiriya wakuyobokewe (assigned client) cyangwa wiyandikishije kuri kode yawe (${processorUser.agentCode || processorUser.referralCode}).`
        };
      }
    }

    if (action === 'approve') {
      deposit.status = 'approved';
      deposit.processedAt = new Date().toISOString();
      deposit.processedBy = `${processorUser.fullName} (${processorUser.role})`;

      this.adjustUserBalance(deposit.userId, deposit.amount);

      const txn = this.data.transactions.find(t => t.referenceId === deposit.id);
      if (txn) {
        txn.status = 'completed';
        txn.agentId = processorUser.id;
        txn.description = `Kubitsa (${deposit.amount.toLocaleString('en-US')} FRW) byaguzwe no kwemezwa na Agent ${processorUser.fullName}`;
        this.syncMongoDoc(TransactionModel, txn.id, txn);
      }

      this.createNotification({
        userId: deposit.userId,
        title: 'Kwemeza Kubitsa Kwemejwe! ✅',
        message: `Inyandiko yawe yo kubitsa ${deposit.amount.toLocaleString('en-US')} FRW yemejwe na Agent ${processorUser.fullName}. Amafaranga yashyizwe kuri konti yawe!`,
        type: 'deposit_processed',
        referenceId: deposit.id,
        amount: deposit.amount
      });
    } else {
      deposit.status = 'rejected';
      deposit.rejectionReason = reason || `Rejected by ${processorUser.role}`;
      deposit.processedAt = new Date().toISOString();
      deposit.processedBy = `${processorUser.fullName} (${processorUser.role})`;

      const txn = this.data.transactions.find(t => t.referenceId === deposit.id);
      if (txn) {
        txn.status = 'rejected';
        txn.agentId = processorUser.id;
        txn.description = `Kubitsa byanzwe: ${reason || 'Impamvu zitazwi'}`;
        this.syncMongoDoc(TransactionModel, txn.id, txn);
      }

      this.createNotification({
        userId: deposit.userId,
        title: 'Gusaba Kubitsa Byanzwe ❌',
        message: `Kubitsa kwawe kwa ${deposit.amount.toLocaleString('en-US')} FRW byanzwe. Impamvu: ${reason || 'Ibisobanuro bitamaze'}.`,
        type: 'deposit_processed',
        referenceId: deposit.id,
        amount: deposit.amount
      });
    }

    this.saveData();
    this.syncMongoDoc(DepositModel, deposit.id, deposit);

    return { deposit };
  }

  // ==========================================
  // WITHDRAWAL OPERATIONS
  // ==========================================
  createWithdrawalRequest(userId, amount, paymentMethod, bankOrWalletDetails) {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return { error: 'User not found' };

    if (user.balance < amount) {
      return {
        error: `Amafaranga ufite kuri konti ntiyagukundira kubikuza. Balance yawe ni ${user.balance.toLocaleString('en-US')} FRW.`
      };
    }

    this.adjustUserBalance(userId, -amount);

    const assignedAgent = this.getAgentForClient(userId);

    const newWithdrawal = {
      id: 'wth-' + Math.random().toString(36).substring(2, 11),
      userId,
      userName: user.fullName,
      userEmail: user.email,
      amount,
      paymentMethod,
      bankOrWalletDetails,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    if (!this.data.withdrawals) this.data.withdrawals = [];
    this.data.withdrawals.unshift(newWithdrawal);

    this.createTransaction({
      userId,
      type: 'withdrawal',
      amount,
      status: 'pending',
      description: `Gusaba kubikuza ${amount.toLocaleString('en-US')} FRW (${paymentMethod} - ${bankOrWalletDetails})`,
      referenceId: newWithdrawal.id
    });

    if (assignedAgent) {
      this.createNotification({
        userId: assignedAgent.id,
        title: 'Kubikuza Gushya Biterejwe! 💳',
        message: `${user.fullName} (Tel: ${user.phone}) yasabye kubikuza ${amount.toLocaleString('en-US')} FRW via ${paymentMethod} (${bankOrWalletDetails}).`,
        type: 'withdrawal_request',
        referenceId: newWithdrawal.id,
        amount,
        clientName: user.fullName,
        clientEmail: user.email
      });
    }

    this.saveData();
    this.syncMongoDoc(WithdrawalModel, newWithdrawal.id, newWithdrawal);

    return { withdrawal: newWithdrawal };
  }

  getWithdrawals(filter) {
    if (!this.data.withdrawals) this.data.withdrawals = [];
    return this.data.withdrawals.filter(w => {
      if (filter?.userId && w.userId !== filter.userId) return false;
      if (filter?.status && w.status !== filter.status) return false;
      return true;
    });
  }

  getWithdrawalsForAgent(agent) {
    if (!this.data.withdrawals) this.data.withdrawals = [];
    if (agent.role === 'admin') return this.data.withdrawals;

    return this.data.withdrawals.filter(w => {
      return this.isClientOfAgent(w.userId, agent);
    });
  }

  processWithdrawal(withdrawalId, processorUser, action, reason) {
    if (!this.data.withdrawals) this.data.withdrawals = [];
    if (!this.data.transactions) this.data.transactions = [];
    if (!this.data.notifications) this.data.notifications = [];

    if (processorUser.role !== 'agent' && processorUser.role !== 'admin') {
      return { error: 'Unauthorized: Only Agents or Admins can process withdrawal requests.' };
    }

    const withdrawal = this.data.withdrawals.find(w => w.id === withdrawalId);
    if (!withdrawal) return { error: 'Withdrawal request not found' };
    if (withdrawal.status !== 'pending') return { error: 'Withdrawal request has already been processed' };

    const withdrawalAmount = Number(withdrawal.amount || 0);

    if (processorUser.role === 'agent') {
      if (!this.isClientOfAgent(withdrawal.userId, processorUser)) {
        return {
          error: `Agent Security: Ubasha gusa kwemeza no kubikuriza amafaranga umukiriya wakuyobokewe (assigned client) cyangwa wiyandikishije kuri kode yawe (${processorUser.agentCode || processorUser.referralCode}).`
        };
      }
    }

    if (action === 'approve') {
      withdrawal.status = 'approved';
      withdrawal.amount = withdrawalAmount;
      withdrawal.processedAt = new Date().toISOString();
      withdrawal.processedByAdmin = `${processorUser.fullName} (${processorUser.role})`;

      const txn = this.data.transactions.find(t => t.referenceId === withdrawal.id);
      if (txn) {
        txn.status = 'completed';
        txn.agentId = processorUser.id;
        txn.description = `Kubikuriza (${withdrawalAmount.toLocaleString('en-US')} FRW) byemejwe na ${processorUser.fullName} [${withdrawal.paymentMethod}]`;
        this.syncMongoDoc(TransactionModel, txn.id, txn);
      }
    } else {
      withdrawal.status = 'rejected';
      withdrawal.amount = withdrawalAmount;
      withdrawal.rejectionReason = reason || `Rejected by ${processorUser.role}`;
      withdrawal.processedAt = new Date().toISOString();
      withdrawal.processedByAdmin = `${processorUser.fullName} (${processorUser.role})`;

      this.adjustUserBalance(withdrawal.userId, withdrawalAmount);

      const txn = this.data.transactions.find(t => t.referenceId === withdrawal.id);
      if (txn) {
        txn.status = 'rejected';
        txn.agentId = processorUser.id;
        txn.description = `Kubikuriza byanzwe no gusubizwa kuri konti (${withdrawalAmount.toLocaleString('en-US')} FRW)`;
        this.syncMongoDoc(TransactionModel, txn.id, txn);
      }
    }

    this.createNotification({
      userId: withdrawal.userId,
      title: action === 'approve' ? 'Withdrawal Yawe Yemejwe! ✅' : 'Withdrawal Yawe Yanzwe ❌',
      message: action === 'approve'
        ? `Withdrawal yawe ya ${withdrawalAmount.toLocaleString('en-US')} FRW yemejwe na Agent ${processorUser.fullName}. Amafaranga yohererejwe kuri konti yawe.`
        : `Withdrawal yawe ya ${withdrawalAmount.toLocaleString('en-US')} FRW yanzwe no gusubizwa kuri konti yawe. Impamvu: ${reason || 'Ibipimo bitazwi'}.`,
      type: 'withdrawal_processed',
      referenceId: withdrawal.id,
      amount: withdrawalAmount
    });

    this.saveData();
    this.syncMongoDoc(WithdrawalModel, withdrawal.id, withdrawal);

    return { withdrawal };
  }

  processWithdrawalByAdmin(withdrawalId, adminUser, action, reason) {
    return this.processWithdrawal(withdrawalId, adminUser, action, reason);
  }

  adminUpdateDeposit(depositId, updates, adminUser) {
    if (!this.data.deposits) this.data.deposits = [];
    const deposit = this.data.deposits.find(d => d.id === depositId);
    if (!deposit) return { error: 'Deposit request not found' };

    const oldStatus = deposit.status;
    const oldAmount = Number(deposit.amount || 0);
    const newStatus = updates.status || oldStatus;
    const newAmount = updates.amount !== undefined ? Number(updates.amount) : oldAmount;

    if (oldStatus === 'pending' && newStatus === 'approved') {
      deposit.status = 'approved';
      deposit.amount = newAmount;
      deposit.processedAt = new Date().toISOString();
      deposit.processedBy = `Admin ${adminUser.fullName}`;
      this.adjustUserBalance(deposit.userId, newAmount);
    } else if (oldStatus === 'approved' && newStatus === 'rejected') {
      deposit.status = 'rejected';
      deposit.amount = newAmount;
      deposit.rejectionReason = updates.rejectionReason || 'Rejected by Admin edit';
      deposit.processedAt = new Date().toISOString();
      deposit.processedBy = `Admin ${adminUser.fullName}`;
      this.adjustUserBalance(deposit.userId, -oldAmount);
    } else if (oldStatus === 'approved' && newStatus === 'pending') {
      deposit.status = 'pending';
      deposit.amount = newAmount;
      deposit.processedAt = undefined;
      deposit.processedBy = undefined;
      this.adjustUserBalance(deposit.userId, -oldAmount);
    } else if (oldStatus === 'rejected' && newStatus === 'approved') {
      deposit.status = 'approved';
      deposit.amount = newAmount;
      deposit.processedAt = new Date().toISOString();
      deposit.processedBy = `Admin ${adminUser.fullName}`;
      this.adjustUserBalance(deposit.userId, newAmount);
    } else if (oldStatus === 'approved' && newStatus === 'approved' && newAmount !== oldAmount) {
      const diff = newAmount - oldAmount;
      deposit.amount = newAmount;
      this.adjustUserBalance(deposit.userId, diff);
    } else {
      deposit.amount = newAmount;
      deposit.status = newStatus;
    }

    if (updates.paymentMethod) deposit.paymentMethod = updates.paymentMethod;
    if (updates.transactionRef) deposit.transactionRef = updates.transactionRef;
    if (updates.agentCode !== undefined) deposit.agentCode = updates.agentCode;
    if (updates.rejectionReason !== undefined) deposit.rejectionReason = updates.rejectionReason;

    this.saveData();
    this.syncMongoDoc(DepositModel, deposit.id, deposit);

    return { deposit };
  }

  adminDeleteDeposit(depositId) {
    if (!this.data.deposits) this.data.deposits = [];
    const idx = this.data.deposits.findIndex(d => d.id === depositId);
    if (idx === -1) return false;

    const deposit = this.data.deposits[idx];
    if (deposit.status === 'approved') {
      this.adjustUserBalance(deposit.userId, -Number(deposit.amount || 0));
    }

    this.data.deposits.splice(idx, 1);
    if (!this.data.transactions) this.data.transactions = [];
    this.data.transactions = this.data.transactions.filter(t => t.referenceId !== depositId);

    this.saveData();
    this.syncMongoDoc(DepositModel, depositId, null, true);

    return true;
  }

  adminUpdateWithdrawal(withdrawalId, updates, adminUser) {
    if (!this.data.withdrawals) this.data.withdrawals = [];
    const withdrawal = this.data.withdrawals.find(w => w.id === withdrawalId);
    if (!withdrawal) return { error: 'Withdrawal request not found' };

    const oldStatus = withdrawal.status;
    const oldAmount = Number(withdrawal.amount || 0);
    const newStatus = updates.status || oldStatus;
    const newAmount = updates.amount !== undefined ? Number(updates.amount) : oldAmount;

    if (oldStatus === 'pending' && newStatus === 'rejected') {
      withdrawal.status = 'rejected';
      withdrawal.amount = newAmount;
      withdrawal.rejectionReason = updates.rejectionReason || 'Rejected by Admin';
      withdrawal.processedAt = new Date().toISOString();
      withdrawal.processedByAdmin = `Admin ${adminUser.fullName}`;
      this.adjustUserBalance(withdrawal.userId, oldAmount);
    } else if (oldStatus === 'approved' && newStatus === 'rejected') {
      withdrawal.status = 'rejected';
      withdrawal.amount = newAmount;
      withdrawal.rejectionReason = updates.rejectionReason || 'Rejected by Admin';
      withdrawal.processedAt = new Date().toISOString();
      withdrawal.processedByAdmin = `Admin ${adminUser.fullName}`;
      this.adjustUserBalance(withdrawal.userId, oldAmount);
    } else if (oldStatus === 'rejected' && newStatus === 'approved') {
      withdrawal.status = 'approved';
      withdrawal.amount = newAmount;
      withdrawal.processedAt = new Date().toISOString();
      withdrawal.processedByAdmin = `Admin ${adminUser.fullName}`;
      this.adjustUserBalance(withdrawal.userId, -newAmount);
    } else if (oldStatus === 'rejected' && newStatus === 'pending') {
      withdrawal.status = 'pending';
      withdrawal.amount = newAmount;
      withdrawal.processedAt = undefined;
      withdrawal.processedByAdmin = undefined;
      this.adjustUserBalance(withdrawal.userId, -newAmount);
    } else if ((oldStatus === 'pending' || oldStatus === 'approved') && newAmount !== oldAmount) {
      const diff = oldAmount - newAmount;
      withdrawal.amount = newAmount;
      this.adjustUserBalance(withdrawal.userId, diff);
    } else {
      withdrawal.amount = newAmount;
      withdrawal.status = newStatus;
    }

    if (updates.paymentMethod) withdrawal.paymentMethod = updates.paymentMethod;
    if (updates.bankOrWalletDetails) withdrawal.bankOrWalletDetails = updates.bankOrWalletDetails;
    if (updates.rejectionReason !== undefined) withdrawal.rejectionReason = updates.rejectionReason;

    this.saveData();
    this.syncMongoDoc(WithdrawalModel, withdrawal.id, withdrawal);

    return { withdrawal };
  }

  adminDeleteWithdrawal(withdrawalId) {
    if (!this.data.withdrawals) this.data.withdrawals = [];
    const idx = this.data.withdrawals.findIndex(w => w.id === withdrawalId);
    if (idx === -1) return false;

    const withdrawal = this.data.withdrawals[idx];
    if (withdrawal.status === 'pending') {
      this.adjustUserBalance(withdrawal.userId, Number(withdrawal.amount || 0));
    }

    this.data.withdrawals.splice(idx, 1);
    if (!this.data.transactions) this.data.transactions = [];
    this.data.transactions = this.data.transactions.filter(t => t.referenceId !== withdrawalId);

    this.saveData();
    this.syncMongoDoc(WithdrawalModel, withdrawalId, null, true);

    return true;
  }

  // ==========================================
  // NOTIFICATION OPERATIONS
  // ==========================================
  createNotification(notificationData) {
    if (!this.data.notifications) this.data.notifications = [];
    const notif = {
      id: 'notif-' + Math.random().toString(36).substring(2, 11),
      userId: notificationData.userId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type,
      read: false,
      createdAt: new Date().toISOString(),
      referenceId: notificationData.referenceId,
      amount: notificationData.amount,
      clientName: notificationData.clientName,
      clientEmail: notificationData.clientEmail
    };
    this.data.notifications.unshift(notif);
    this.saveData();
    this.syncMongoDoc(NotificationModel, notif.id, notif);

    return notif;
  }

  getNotifications(userId) {
    if (!this.data.notifications) this.data.notifications = [];
    return this.data.notifications.filter(n => n.userId === userId);
  }

  markNotificationAsRead(id, userId) {
    if (!this.data.notifications) return false;
    const notif = this.data.notifications.find(n => n.id === id && n.userId === userId);
    if (notif) {
      notif.read = true;
      this.saveData();
      this.syncMongoDoc(NotificationModel, notif.id, { read: true });
      return true;
    }
    return false;
  }

  markAllNotificationsAsRead(userId) {
    if (!this.data.notifications) return false;
    let updated = false;
    this.data.notifications.forEach(n => {
      if (n.userId === userId && !n.read) {
        n.read = true;
        updated = true;
        this.syncMongoDoc(NotificationModel, n.id, { read: true });
      }
    });
    if (updated) this.saveData();
    return updated;
  }

  // ==========================================
  // TRANSACTIONS LOG
  // ==========================================
  createTransaction(txnData) {
    const txn = {
      ...txnData,
      id: 'txn-' + Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString()
    };
    this.data.transactions.unshift(txn);
    this.saveData();
    this.syncMongoDoc(TransactionModel, txn.id, txn);

    return txn;
  }

  getTransactions(userId) {
    if (userId) {
      return this.data.transactions.filter(t => t.userId === userId);
    }
    return this.data.transactions;
  }

  getAgentTransactions(agentId) {
    const agentUser = this.findUserById(agentId);
    if (!agentUser) return [];

    const agentDepositIds = new Set(
      this.data.deposits
        .filter(d => d.agentId === agentId || d.agentEmail === agentUser.email || (d.processedBy && d.processedBy.includes(agentUser.fullName)))
        .map(d => d.id)
    );

    return this.data.transactions.filter(t => {
      if (t.agentId === agentId) return true;
      if (t.referenceId && agentDepositIds.has(t.referenceId)) return true;
      if (t.description && agentUser.agentCode && t.description.includes(agentUser.agentCode)) return true;
      if (t.description && agentUser.fullName && t.description.toLowerCase().includes(agentUser.fullName.toLowerCase())) return true;
      return false;
    });
  }
}

export const db = new DBManager();
