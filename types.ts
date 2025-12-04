
export enum SkillCategory {
  DESIGN = 'Design',
  DEVELOPMENT = 'Development',
  MUSIC = 'Music',
  LANGUAGE = 'Language',
  BUSINESS = 'Business',
  LIFESTYLE = 'Lifestyle',
  OTHER = 'Other'
}

export enum SkillLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  EXPERT = 'Expert',
  MASTER = 'Master'
}

export enum SkillStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

export interface Skill {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: SkillCategory;
  image: string;
  level: SkillLevel;
  experience: number; // Years
  status: SkillStatus;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  location: string;
  skillsOffered: Skill[];
  skillsWanted: string[];
  rating: number;
  reviewCount: number;
  isOnline: boolean;
  lastSeen: Date;
  points: number;
  badges: string[]; // Badge IDs
  coins: number;
  nextFreeCoinDate: Date;
}

export enum SwapStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Swap {
  id: string;
  requesterId: string;
  receiverId: string;
  offeredSkillId: string;
  requestedSkillId: string;
  status: SwapStatus;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  type: 'text' | 'image' | 'system' | 'swap_request';
  status: 'sent' | 'delivered' | 'read';
  imageUrl?: string;
  swapRequestId?: string; // Links specific message to the swap negotiation details
}

export interface Notification {
  id: string;
  userId: string;
  type: 'swap_request' | 'message' | 'system';
  content: string;
  read: boolean;
  timestamp: Date;
  link?: string;
}
