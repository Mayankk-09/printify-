import express from 'express';
import cors from 'cors';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { db } from './database.js';

const app = express();
const PORT = process.env.PORT || 8085;
const JWT_SECRET = 'VIPS_PRINTIFY_SECRET_987654321';
const ADMIN_ACCESS_PASSWORD = 'mayanklodu';

const SUBSCRIPTION_PLANS = {
  starter_bw: {
    id: 'starter_bw',
    rank: 1,
    name: 'Starter B&W',
    price: 249,
    pagesAllowed: 50,
    supportsColor: false
  },
  standard_bw: {
    id: 'standard_bw',
    rank: 2,
    name: 'Standard B&W',
    price: 499,
    pagesAllowed: 100,
    supportsColor: false
  },
  hybrid_pro: {
    id: 'hybrid_pro',
    rank: 3,
    name: 'Hybrid Pro',
    price: 749,
    pagesAllowed: 100,
    supportsColor: true
  }
};

const LEGACY_PLAN_MAP = {
  basic: 'starter_bw',
  standard: 'standard_bw',
  premium: 'hybrid_pro'
};

const getPlanDefinition = (planId) => {
  const normalizedPlanId = LEGACY_PLAN_MAP[planId] || planId;
  return SUBSCRIPTION_PLANS[normalizedPlanId] || null;
};

// Ensure uploads folder exists
const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Config Multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.pdf', '.docx', '.pptx'];
    const extension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return cb(new Error('Only PDF, DOCX, and PPTX documents are supported'));
    }
    cb(null, true);
  }
});

// JWT Verification Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Access Token Required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or Expired Token' });
    req.user = user;
    next();
  });
};

// --- AUTH API ---

// Sign Up
app.post('/api/auth/signup', (req, res) => {
  const { name, email, phone, course, year, password } = req.body;

  if (!name || !email || !phone || !course || !year || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const existingUser = db.users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = db.users.insert({
    name,
    email,
    phone,
    course,
    year,
    passwordHash: hashedPassword,
    role: 'student' // default is student
  });

  // Create JWT Token
  const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '30d' });

  // Exclude password hash from response
  const { passwordHash, ...userResponse } = newUser;
  res.status(201).json({ user: userResponse, token });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password, role, adminAccessPassword } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = db.users.find(u => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  if (role && role !== user.role && !(role === 'admin' && user.role === 'operator')) {
    return res.status(403).json({ message: `This account is not registered as ${role}` });
  }

  // Admin access password check - strongly enforced for admin role
  if (role === 'admin' || user.role === 'admin') {
    if (!adminAccessPassword) {
      return res.status(403).json({ message: 'Admin access password is required to continue.' });
    }
    if (adminAccessPassword !== ADMIN_ACCESS_PASSWORD) {
      return res.status(403).json({ message: 'Incorrect admin access password. Access denied.' });
    }
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });

  const { passwordHash, ...userResponse } = user;
  res.json({ user: userResponse, token });
});

// Get Current User Profile and Subscription details
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const subscription = db.subscriptions.find(s => s.userId === user.id);
  const { passwordHash, ...userResponse } = user;

  res.json({ user: userResponse, subscription: subscription || null });
});

app.get('/api/subscription/plans', authenticateToken, (req, res) => {
  res.json(Object.values(SUBSCRIPTION_PLANS));
});

// --- SUBSCRIPTION API ---

// Buy/Upgrade Subscription (Simulated Payment)
app.post('/api/subscription/buy', authenticateToken, (req, res) => {
  const { plan } = req.body;
  const selectedPlan = getPlanDefinition(plan);
  if (!selectedPlan) {
    return res.status(400).json({ message: 'Invalid plan selected' });
  }

  const startDate = new Date();
  const expiryDate = new Date();
  expiryDate.setDate(startDate.getDate() + 30); // 30 days validity
  const existingSub = db.subscriptions.find(s => s.userId === req.user.id);
  const history = existingSub
    ? [
        ...(existingSub.history || []),
        {
          plan: existingSub.plan,
          planName: existingSub.planName,
          pagesAllowed: existingSub.pagesAllowed,
          pagesUsed: existingSub.pagesUsed,
          startedAt: existingSub.startDate,
          endedAt: startDate.toISOString()
        }
      ]
    : [];

  const newSub = db.subscriptions.insertOrUpdate({
    userId: req.user.id,
    plan: selectedPlan.id,
    planName: selectedPlan.name,
    planRank: selectedPlan.rank,
    price: selectedPlan.price,
    pagesAllowed: selectedPlan.pagesAllowed,
    pagesUsed: 0,
    supportsColor: selectedPlan.supportsColor,
    startDate: startDate.toISOString(),
    expiryDate: expiryDate.toISOString(),
    status: 'active',
    history
  });

  res.json({ message: 'Subscription activated successfully', subscription: newSub });
});

// --- FILE UPLOAD API ---

// Upload document & Auto-detect pages if PDF
app.post('/api/orders/upload', authenticateToken, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      const message = err.code === 'LIMIT_FILE_SIZE' ? 'File size must be 15MB or less' : err.message;
      return res.status(400).json({ message });
    }
    next();
  });
}, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const filePath = req.file.path;
  const fileExtension = path.extname(req.file.originalname).toLowerCase();
  
  let pageCount = 5; // Default fallback for docx/pptx

  if (fileExtension === '.pdf') {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      pageCount = pdfData.numpages || 1;
    } catch (error) {
      console.error('Error parsing PDF, using default count:', error);
      pageCount = 5; // Fallback
    }
  }

  res.json({
    fileName: req.file.originalname,
    filePath: `/uploads/${req.file.filename}`,
    pages: pageCount
  });
});

// --- ORDERS API ---

// Create Print Order
app.post('/api/orders/create', authenticateToken, (req, res) => {
  const { fileName, filePath, pages, color, copies, side, pickupDate, pickupSlot, addons } = req.body;

  if (!fileName || !filePath || !pages || !color || !copies || !side || !pickupDate || !pickupSlot || !addons) {
    return res.status(400).json({ message: 'Missing order details' });
  }

  // Get User's Subscription
  const sub = db.subscriptions.find(s => s.userId === req.user.id);
  if (!sub || sub.status !== 'active') {
    return res.status(400).json({ message: 'Active subscription required to order prints' });
  }
  const planDefinition = getPlanDefinition(sub.plan);

  if (color === 'color' && !(sub.supportsColor || planDefinition?.supportsColor)) {
    return res.status(400).json({ message: 'Color printing requires the Hybrid Pro plan' });
  }

  const totalPagesNeeded = pages * copies;
  const remainingPages = sub.pagesAllowed - sub.pagesUsed;

  if (totalPagesNeeded > remainingPages) {
    return res.status(400).json({ 
      message: `Insufficient subscription balance. Need ${totalPagesNeeded} pages, but only have ${remainingPages} pages left.` 
    });
  }

  // Deduct inventory items if finishing options are selected
  const inventory = db.inventory.get();
  const addonCostDetails = {
    staple: 2,
    punchHoles: 1,
    cobraFile: 20,
    transparentFile: 10,
    folder: 15
  };

  let totalAddonCost = 0;
  const invUpdates = {};

  // Check inventory stock and calculate addon price
  for (const [key, enabled] of Object.entries(addons)) {
    if (enabled) {
      totalAddonCost += addonCostDetails[key] * copies;
      
      // Update inventory (exclude staple counts since we have a lot)
      if (key !== 'staple') {
        const currentStock = inventory[key] || 0;
        if (currentStock < copies) {
          return res.status(400).json({ message: `Finishing option '${key}' is out of stock` });
        }
        invUpdates[key] = currentStock - copies;
      }
    }
  }

  // Apply inventory changes
  if (Object.keys(invUpdates).length > 0) {
    db.inventory.update(invUpdates);
  }

  // Update subscription pages
  db.subscriptions.insertOrUpdate({
    userId: req.user.id,
    pagesUsed: sub.pagesUsed + totalPagesNeeded
  });

  // Create Order
  const newOrder = db.orders.insert({
    userId: req.user.id,
    fileName,
    filePath,
    pages,
    color,
    copies,
    side,
    pickupDate,
    pickupSlot,
    addons,
    addonCost: totalAddonCost,
    status: 'submitted'
  });

  res.status(201).json({ message: 'Order submitted successfully', order: newOrder });
});

// Student Orders History
app.get('/api/orders/student', authenticateToken, (req, res) => {
  const orders = db.orders.filter(o => o.userId === req.user.id);
  // Sort by created date descending
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(orders);
});

// Operator Queue (All Orders)
app.get('/api/orders/operator', authenticateToken, (req, res) => {
  if (req.user.role !== 'operator' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized access' });
  }

  const allOrders = db.orders.filter(() => true);
  // Add student name, phone and details for operator ease
  const users = db.users.filter(() => true);
  const userMap = new Map(users.map(u => [u.id, u]));

  const ordersWithUserDetails = allOrders.map(order => {
    const student = userMap.get(order.userId);
    return {
      ...order,
      studentName: student ? student.name : 'Unknown Student',
      studentPhone: student ? student.phone : 'N/A',
      studentEmail: student ? student.email : 'N/A',
      studentCourse: student ? student.course : 'N/A',
      studentYear: student ? student.year : 'N/A'
    };
  });

  ordersWithUserDetails.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(ordersWithUserDetails);
});

// Update Order Status
app.patch('/api/orders/:id/status', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (req.user.role !== 'operator' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized access' });
  }

  const validStatuses = ['submitted', 'accepted', 'printing', 'ready', 'collected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const updatedOrder = db.orders.update(id, { status });
  if (!updatedOrder) return res.status(404).json({ message: 'Order not found' });

  res.json({ message: `Order status updated to ${status}`, order: updatedOrder });
});

// --- ADMIN API ---

// Admin Dashboard Metrics
// Admin Dashboard Metrics with Detailed COGS Profit Margin Analysis
app.get('/api/admin/metrics', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized access' });
  }

  const allOrders = db.orders.filter(() => true);
  const subscriptions = db.subscriptions.filter(() => true);
  const users = db.users.filter(() => true);

  // Active Subscribers
  const activeSubs = subscriptions.filter(s => s.status === 'active').length;

  // 1. Revenue Calculation
  const subscriptionRevenue = subscriptions.reduce((sum, s) => {
    const planDefinition = getPlanDefinition(s.plan);
    return sum + (s.price || planDefinition?.price || 0);
  }, 0);
  const addonRevenue = allOrders.reduce((sum, o) => sum + (o.addonCost || 0), 0);
  const totalRevenue = subscriptionRevenue + addonRevenue;

  // 2. Cost of Goods Sold (COGS) Calculation
  // Cost prices: B&W page = ₹0.50, Color page = ₹3.00
  // Addon cost prices: staple = ₹0.10, punch = ₹0.10, cobraFile = ₹12.00, transparentFile = ₹4.00, folder = ₹8.00
  let totalPrintingCost = 0;
  let totalStationeryCost = 0;

  allOrders.forEach(o => {
    // Only count costs for orders that are accepted, printing, ready, or collected (ignore rejected/submitted if not processed yet)
    if (['accepted', 'printing', 'ready', 'collected'].includes(o.status)) {
      // Printing Cost
      const pageCostRate = o.color === 'color' ? 3.00 : 0.50;
      totalPrintingCost += o.pages * o.copies * pageCostRate;

      // Addon Cost
      let addonCost = 0;
      if (o.addons.staple) addonCost += 0.10;
      if (o.addons.punchHoles) addonCost += 0.10;
      if (o.addons.cobraFile) addonCost += 12.00;
      if (o.addons.transparentFile) addonCost += 4.00;
      if (o.addons.folder) addonCost += 8.00;
      
      totalStationeryCost += addonCost * o.copies;
    }
  });

  const totalCost = totalPrintingCost + totalStationeryCost;
  const netProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 1000) / 10 : 0;

  // Orders today
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const ordersToday = allOrders.filter(o => new Date(o.createdAt) >= startOfToday).length;

  // Pages printed today
  const printedOrdersToday = allOrders.filter(o => 
    new Date(o.createdAt) >= startOfToday && 
    ['printing', 'ready', 'collected'].includes(o.status)
  );
  const pagesPrintedToday = printedOrdersToday.reduce((sum, o) => sum + (o.pages * o.copies), 0);

  // Total pages printed all-time
  const allPrintedOrders = allOrders.filter(o => ['printing', 'ready', 'collected'].includes(o.status));
  const totalPagesPrinted = allPrintedOrders.reduce((sum, o) => sum + (o.pages * o.copies), 0);

  res.json({
    activeSubscribers: activeSubs,
    totalRevenue,
    totalCost: Math.round(totalCost * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
    profitMargin,
    revenueBreakdown: {
      subscription: subscriptionRevenue,
      addons: addonRevenue
    },
    costBreakdown: {
      printing: Math.round(totalPrintingCost * 100) / 100,
      stationery: Math.round(totalStationeryCost * 100) / 100
    },
    ordersToday,
    pagesPrintedToday,
    totalPagesPrinted,
    totalStudents: users.filter(u => u.role === 'student').length,
    inventory: db.inventory.get()
  });
});

// Update Inventory stock
app.patch('/api/admin/inventory', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'operator') {
    return res.status(403).json({ message: 'Unauthorized access' });
  }

  const { cobraFile, transparentFile, folder, staples } = req.body;
  const updates = {};
  if (cobraFile !== undefined) updates.cobraFile = Number(cobraFile);
  if (transparentFile !== undefined) updates.transparentFile = Number(transparentFile);
  if (folder !== undefined) updates.folder = Number(folder);
  if (staples !== undefined) updates.staples = Number(staples);

  const updatedInventory = db.inventory.update(updates);
  res.json({ message: 'Inventory updated successfully', inventory: updatedInventory });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
