import React, { createContext, useContext, useState } from 'react';

export const translations = {
  rw: {
    // General & Navigation
    appName: 'InvestPro',
    appTagline: 'Jya imbere mu gushora imari n\'inyungu z\'iminsi icyenda',
    dashboard: 'Ibibaho',
    products: 'Ibicuruzwa',
    transactions: 'Ibyakozwe',
    myInvestments: 'Imari Nashoye',
    myWallet: 'Ikonte Yanjye',
    deposit: 'Kubitsa',
    withdraw: 'Kubikuza',
    profile: 'Umwirondoro',
    logout: 'Sohoka',
    login: 'Kwinjira',
    register: 'Kwiyandikisha',
    roleClient: 'Umushoramari',
    roleAgent: 'Arjante (Agent)',
    roleAdmin: 'Ubuyobozi (Admin)',
    switchRole: 'Guhindura Uruhare',
    language: 'Ururimi',

    // Hero & Public
    heroTitle: 'Inyungu z\'Umunsi ku Imari Yashowe',
    heroSubtitle: 'InvestPro iguhuza n\'amapool y\'imari atanga inyungu ya buri munsi. Yakira inyungu neza n\'umutekano wizewe.',
    startInvesting: 'Tanga Imari Ubu',
    clientSignIn: 'Injira Nkumushoramari',
    featuredProducts: 'Ibicuruzwa by\'Imari Byatoranijwe',
    featuredSubtitle: 'Shaka gahunda z\'inyungu ukoresheje kubara inyungu zawe z\'umunsi',

    // Wallet & Balances
    walletBalance: 'Amafaranga Ariho',
    totalInvested: 'Imari Yashowe Yose',
    totalProfitClaimed: 'Inyungu Yafashwe Yose',
    pendingDeposits: 'Ibyabijijwe Bigategereza',
    pendingWithdrawals: 'Ibyabikujwe Bigategereza',
    claimYield: 'Fata Inyungu',
    investNow: 'Shora Imari Ubu',
    dailyProfit: 'Inyungu y\'Umunsi',
    durationDays: 'Igihe (Iminsi)',
    riskLevel: 'Urwego rw\'Ibyago',
    price: 'Igiciro',
    category: 'Icyiciro',

    // Actions & Forms
    amount: 'Amafaranga ($)',
    paymentMethod: 'Uburyo bwo Kwishyura',
    transactionRef: 'Raporoti / Nimero y\'Inyemezabwishyu',
    bankOrWalletDetails: 'Inkomoko y\'Ikonte / Wallet Address',
    agentCodeOptional: 'Kode ya Agent (Niba uyifite)',
    submitDeposit: 'Ohereza Ubwishingizi bwo Kubitsa',
    submitWithdrawal: 'Saba Kubikuza',
    cancel: 'Hagarika',
    confirm: 'Emeza',
    success: 'Ibyakozwe neza',
    error: 'Ikosa ryabaye',

    // Agent Console
    agentConsoleTitle: 'Icyiciro cy\'Arjante - Kwemeza Kubitsa & Cash Operations',
    agentConsoleSubtitle: 'Nka Agent, ufite uburenganzira bwo gusuzuma no kwemeza ubusabe bwo kubitsa kw\'abakiriya.',
    processedVolume: 'Raporoti y\'Ayemejwe Yose',
    directDepositTitle: 'Gukorera Umukiriya Deposit y\'Akarashishi',
    directDepositSubtitle: 'Shyira amafaranga vuba mu ikonte y\'umukiriya ukoresheje email ye.',
    clientEmail: 'Email y\'Umukiriya',
    creditWallet: 'Ogeza Ikonte y\'Umukiriya',
    pendingDepositQueue: 'Ubusabe bwo Kubitsa Buategerejwe',
    approve: 'Emeza',
    reject: 'Anga',

    // Admin Console
    adminConsoleTitle: 'Icyiciro cy\'Ubuyobozi (Admin Panel)',
    withdrawalApprovalQueue: 'Ubusabe bwo Kubikuza Buategerejwe (Admin gusa)',
    adminWithdrawalNote: 'Ubuyobozi ni bwo bwonyine bufite uburenganzira bwo kwemeza no kohereza amafaranga yabikujwe.',
    addProduct: 'Ongeraho Igicuruzwa Gishya',
    manageUsers: 'Gucunga Abakoresha & Inshingano',
    adjustBalance: 'Hindura Amafaranga y\'Ikonte',
    role: 'Inshingano',
    actions: 'Ibyakorwa',

    // Statuses
    statusPending: 'Gategerejwe',
    statusApproved: 'Byamerewe',
    statusRejected: 'Byangwe',
    statusActive: 'Bifite Agaciro',
    statusCompleted: 'Byarangiye',

    // Profile
    fullName: 'Izina Ryose',
    emailAddress: 'Ibaruwa e-mail',
    phone: 'Nimero ya Telefone',
    saveChanges: 'Bika Impinduka',
    securityNotice: 'Umutekano w\'Ikonte',

    // Demo Role Switcher
    quickDemoSwitch: 'Guhindura Uruhare rwo Gerageza (Demo)',
    clientDemo: 'Umushoramari (Client)',
    agentDemo: 'Arjante (Agent)',
    adminDemo: 'Ubuyobozi (Admin)',
  },
  en: {
    // General & Navigation
    appName: 'InvestPro',
    appTagline: 'Next-Generation High-Yield Daily Investment Platform',
    dashboard: 'Dashboard',
    products: 'Products',
    transactions: 'Transactions',
    myInvestments: 'My Investments',
    myWallet: 'My Wallet',
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    profile: 'Profile',
    logout: 'Logout',
    login: 'Sign In',
    register: 'Register',
    roleClient: 'Investor Client',
    roleAgent: 'Regional Agent',
    roleAdmin: 'System Admin',
    switchRole: 'Switch Role',
    language: 'Language',

    // Hero & Public
    heroTitle: 'Automated Daily Dividends & Investment Growth',
    heroSubtitle: 'InvestPro connects investors with curated daily profit pools. Enjoy secure multi-role workflows with Agent deposit processing and Admin-only withdrawal safeguards.',
    startInvesting: 'Start Investing Now',
    clientSignIn: 'Client Sign In',
    featuredProducts: 'Featured Investment Products',
    featuredSubtitle: 'Explore available yield plans and calculate your daily profit returns',

    // Wallet & Balances
    walletBalance: 'Wallet Balance',
    totalInvested: 'Total Invested',
    totalProfitClaimed: 'Total Profit Claimed',
    pendingDeposits: 'Pending Deposits',
    pendingWithdrawals: 'Pending Withdrawals',
    claimYield: 'Claim Yield',
    investNow: 'Invest Now',
    dailyProfit: 'Daily Profit',
    durationDays: 'Duration (Days)',
    riskLevel: 'Risk Level',
    price: 'Price',
    category: 'Category',

    // Actions & Forms
    amount: 'Amount ($)',
    paymentMethod: 'Payment Method',
    transactionRef: 'Transaction Reference / Proof',
    bankOrWalletDetails: 'Bank Account or Crypto Wallet Details',
    agentCodeOptional: 'Agent Referral Code (Optional)',
    submitDeposit: 'Submit Deposit Request',
    submitWithdrawal: 'Request Withdrawal',
    cancel: 'Cancel',
    confirm: 'Confirm',
    success: 'Success',
    error: 'Error',

    // Agent Console
    agentConsoleTitle: 'Regional Agent Console - Deposit Approvals',
    agentConsoleSubtitle: 'As an Agent, you are authorized to verify and approve client deposit requests and issue direct wallet top-ups.',
    processedVolume: 'Processed Volume',
    directDepositTitle: 'Direct Client Cash Deposit Tool',
    directDepositSubtitle: 'Process an instant direct cash/mobile money deposit for any registered client email.',
    clientEmail: 'Client Email',
    creditWallet: 'Credit Client Wallet',
    pendingDepositQueue: 'Pending Deposit Verification Queue',
    approve: 'Approve',
    reject: 'Reject',

    // Admin Console
    adminConsoleTitle: 'Executive Admin Panel',
    withdrawalApprovalQueue: 'Client Withdrawal Approval Queue (Exclusive Admin)',
    adminWithdrawalNote: 'Admin is the ONLY role authorized to review and allow withdrawal disbursements.',
    addProduct: 'Add New Investment Product',
    manageUsers: 'User Role & Account Management',
    adjustBalance: 'Adjust User Balance',
    role: 'Role',
    actions: 'Actions',

    // Statuses
    statusPending: 'Pending',
    statusApproved: 'Approved',
    statusRejected: 'Rejected',
    statusActive: 'Active',
    statusCompleted: 'Completed',

    // Profile
    fullName: 'Full Name',
    emailAddress: 'Email Address',
    phone: 'Phone Number',
    saveChanges: 'Save Changes',
    securityNotice: 'Account Security',

    // Demo Role Switcher
    quickDemoSwitch: 'Quick Role Switcher (Demo)',
    clientDemo: 'Investor (Client)',
    agentDemo: 'Agent (Deposits)',
    adminDemo: 'Admin (Full)',
  }
};

const LanguageContext = createContext({
  language: 'rw',
  setLanguage: () => {},
  t: (key) => translations.rw[key] || key,
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('investpro_lang');
    return (saved === 'en' || saved === 'rw') ? saved : 'rw'; // Default to Kinyarwanda 'rw'!
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('investpro_lang', lang);
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['rw']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
