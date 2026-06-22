import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.resolve(__dirname, 'db.json');

// Get default data state
const getDefaultData = () => {
  return {
    users: [
      {
        id: "admin-id",
        name: "Print Room Admin",
        email: "admin@college.edu",
        passwordHash: bcrypt.hashSync("admin123", 10),
        phone: "9999999999",
        course: "IT/Management",
        year: "Faculty",
        role: "admin"
      },
      {
        id: "operator-id",
        name: "Print Room Operator",
        email: "operator@college.edu",
        passwordHash: bcrypt.hashSync("operator123", 10),
        phone: "8888888888",
        course: "Facility Operations",
        year: "Staff",
        role: "operator"
      }
    ],
    subscriptions: [],
    orders: [],
    inventory: {
      cobraFile: 50,
      transparentFile: 120,
      folder: 80,
      staples: 1000
    }
  };
};

// Ensure database file exists and is populated
const initDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(getDefaultData(), null, 2), 'utf-8');
  } else {
    // Check if the file is empty or corrupted, if so reset it
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      JSON.parse(content);
    } catch (e) {
      fs.writeFileSync(DB_FILE, JSON.stringify(getDefaultData(), null, 2), 'utf-8');
    }
  }
};

// Read database
export const readDB = () => {
  initDB();
  const content = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(content);
};

// Write database
export const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
};

// Helper queries
export const db = {
  users: {
    find: (predicate) => {
      const data = readDB();
      return data.users.find(predicate);
    },
    filter: (predicate) => {
      const data = readDB();
      return data.users.filter(predicate);
    },
    insert: (user) => {
      const data = readDB();
      const newUser = { id: Math.random().toString(36).substr(2, 9), ...user };
      data.users.push(newUser);
      writeDB(data);
      return newUser;
    }
  },
  subscriptions: {
    find: (predicate) => {
      const data = readDB();
      return data.subscriptions.find(predicate);
    },
    filter: (predicate) => {
      const data = readDB();
      return data.subscriptions.filter(predicate);
    },
    insertOrUpdate: (sub) => {
      const data = readDB();
      const existingIdx = data.subscriptions.findIndex(s => s.userId === sub.userId);
      if (existingIdx > -1) {
        data.subscriptions[existingIdx] = { ...data.subscriptions[existingIdx], ...sub };
        writeDB(data);
        return data.subscriptions[existingIdx];
      } else {
        const newSub = { id: Math.random().toString(36).substr(2, 9), ...sub };
        data.subscriptions.push(newSub);
        writeDB(data);
        return newSub;
      }
    }
  },
  orders: {
    filter: (predicate) => {
      const data = readDB();
      return data.orders.filter(predicate);
    },
    find: (predicate) => {
      const data = readDB();
      return data.orders.find(predicate);
    },
    insert: (order) => {
      const data = readDB();
      const newOrder = { 
        id: "ORD-" + Math.floor(100000 + Math.random() * 900000), 
        createdAt: new Date().toISOString(), 
        status: "submitted",
        ...order 
      };
      data.orders.push(newOrder);
      writeDB(data);
      return newOrder;
    },
    update: (orderId, updates) => {
      const data = readDB();
      const idx = data.orders.findIndex(o => o.id === orderId);
      if (idx > -1) {
        data.orders[idx] = { ...data.orders[idx], ...updates };
        writeDB(data);
        return data.orders[idx];
      }
      return null;
    }
  },
  inventory: {
    get: () => {
      const data = readDB();
      return data.inventory;
    },
    update: (updates) => {
      const data = readDB();
      data.inventory = { ...data.inventory, ...updates };
      writeDB(data);
      return data.inventory;
    }
  }
};
