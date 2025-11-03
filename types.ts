export enum Role {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export interface Message {
  id: string;
  role: Role;
  content?: string;
  imageUrl?: string;
  imageIsLoading?: boolean;
  timestamp: string;
  isRead?: boolean;
  cost?: number; // Cost of the message in coins
  action?: 'purchase';
}

export enum Personality {
  FRIENDLY = 'Friendly',
  PLAYFUL = 'Playful',
  CALM = 'Calm Supportive',
}

export enum SafetyLevel {
  DEFAULT = 'پیش‌فرض (توصیه می‌شود)',
  RELAXED = 'آسان‌گیر',
  NO_FILTERS = 'بدون فیلتر (با احتیاط استفاده شود)',
}

export interface User {
  id: string;
  email: string;
  password: string; // In a real app, this should be hashed.
  balance: number;
  createdAt: string; // ISO string for registration date
  subscription?: {
    expiresAt: string | null; // ISO string for expiration date
  };
}

export interface Conversation {
  id:string;
  title: string;
  messages: Message[];
  personality: Personality;
  systemPrompt: string;
  safetyLevel: SafetyLevel;
  lastUpdated: string;
  characterId?: string;
  userId?: string; // Link to a user
}

export interface Character {
  id:string;
  name: string;
  age: number;
  bodyType?: string;
  imageUrl: string;
  gifUrl?: string;
  bio: string;
  roleplayDescription?: string;
  systemPrompt: string;
  tags?: string[]; // Added for character tagging/filtering
  // Additional details for the profile view
  about?: Record<string, string>;
  gallery?: string[];
  isPrivate?: boolean;
  creatorId?: string;
}

export type Page = 'landing' | 'chat' | 'admin' | 'privacy' | 'auth' | 'profile' | 'character-creator';

// --- New Types for Audit Log ---
export enum AuditLogAction {
  USER_CREATED = 'USER_CREATED',
  BALANCE_ADD = 'BALANCE_ADD',
  BALANCE_SUBTRACT = 'BALANCE_SUBTRACT',
  SUBSCRIPTION_ADD = 'SUBSCRIPTION_ADD',
  SUBSCRIPTION_REMOVE = 'SUBSCRIPTION_REMOVE',
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: AuditLogAction;
  adminId: 'system' | 'admin'; // 'system' for automatic actions like sign-up
  targetUserId: string;
  details: Record<string, any>;
}