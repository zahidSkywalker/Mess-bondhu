import Dexie, { Table } from 'dexie';

/**
 * Mess Bondhu Database Schema
 * Tables are designed to be multi-tenant (scoping by messId).
 */
export const db = new Dexie('MessBondhuDB');

// Define database schema
// Version 1: Initial structure
db.version(1).stores({
  // Profile of the mess (e.g., "Dhaka Mess 1")
  messProfiles: '++id, name, createdAt', 
  
  // Members belonging to a specific mess
  members: '++id, messId, name, status, joinedDate', 
  
  // Daily meal entries: Linked to member and mess. Indexed by date for filtering.
  meals: '++id, messId, memberId, date, count', 
  
  // Expenses: Linked to mess, categorized, and dated.
  expenses: '++id, messId, category, date, amount', 
  
  // Payments made by members
  payments: '++id, messId, memberId, date, month', 
  
  // Notice board entries
  notices: '++id, messId, date', 
  
  // Monthly calculated summaries (performance optimization for history)
  monthlySummaries: '++id, messId, month, year', 
  
  // Global/Per-mess settings (Theme, Service Charge %, etc.)
  // Using a key-value structure: key can be 'theme', 'service_charge', 'lang'
  settings: '++id, messId, key' 
});

// Types for better IDE autocomplete (Optional but recommended)
export class MessProfile {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.createdAt = new Date();
  }
}
