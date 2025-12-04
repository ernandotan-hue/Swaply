
import { User, Skill, Swap, SwapStatus, SkillCategory, Message, SkillLevel, SkillStatus } from '../types';

// Initial Mock Data
const MOCK_SKILLS: Skill[] = [
  {
    id: 's1',
    userId: 'u1',
    title: 'UI/UX Design Masterclass',
    description: 'I will teach you the fundamentals of Figma and design thinking.',
    category: SkillCategory.DESIGN,
    image: 'https://picsum.photos/id/1/400/300',
    level: SkillLevel.EXPERT,
    experience: 5,
    status: SkillStatus.VERIFIED
  },
  {
    id: 's2',
    userId: 'u2',
    title: 'React & Node.js Mentorship',
    description: 'Code review, architecture planning, and debugging help.',
    category: SkillCategory.DEVELOPMENT,
    image: 'https://picsum.photos/id/60/400/300',
    level: SkillLevel.EXPERT,
    experience: 4,
    status: SkillStatus.VERIFIED
  },
  {
    id: 's3',
    userId: 'u3',
    title: 'Acoustic Guitar Basics',
    description: 'Learn chords, strumming patterns, and your first song.',
    category: SkillCategory.MUSIC,
    image: 'https://picsum.photos/id/145/400/300',
    level: SkillLevel.INTERMEDIATE,
    experience: 3,
    status: SkillStatus.VERIFIED
  },
  {
    id: 's4',
    userId: 'u1',
    title: 'Logo Design',
    description: 'I will design a professional vector logo for your brand.',
    category: SkillCategory.DESIGN,
    image: 'https://picsum.photos/id/50/400/300',
    level: SkillLevel.EXPERT,
    experience: 5,
    status: SkillStatus.VERIFIED
  }
];

const getFutureDate = (months: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d;
};

const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Alex Rivera',
    email: 'alex@example.com',
    avatar: 'https://picsum.photos/id/64/200/200',
    bio: 'UX/UI Designer with 5 years of experience. I love creating intuitive interfaces.',
    location: 'San Francisco, CA',
    skillsOffered: [],
    skillsWanted: ['Guitar', 'Spanish'],
    rating: 4.8,
    reviewCount: 42,
    isOnline: true,
    lastSeen: new Date(),
    points: 1250,
    badges: ['Top Swapper', 'Verified Pro'],
    coins: 2,
    nextFreeCoinDate: getFutureDate(1)
  },
  {
    id: 'u2',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    avatar: 'https://picsum.photos/id/65/200/200',
    bio: 'Full Stack Developer & AI Enthusiast. Can help you build your MVP.',
    location: 'New York, NY',
    skillsOffered: [],
    skillsWanted: ['Cooking', 'Photography'],
    rating: 4.9,
    reviewCount: 120,
    isOnline: false,
    lastSeen: new Date(Date.now() - 3600000),
    points: 3400,
    badges: ['5-Star Provider', 'Community Pillar'],
    coins: 5,
    nextFreeCoinDate: getFutureDate(1)
  },
  {
    id: 'u3',
    name: 'Miguel Rodriguez',
    email: 'miguel@example.com',
    avatar: 'https://picsum.photos/id/91/200/200',
    bio: 'Professional Guitarist and Music Theory teacher.',
    location: 'Austin, TX',
    skillsOffered: [],
    skillsWanted: ['Web Design', 'SEO'],
    rating: 4.7,
    reviewCount: 15,
    isOnline: true,
    lastSeen: new Date(),
    points: 450,
    badges: ['Rising Star'],
    coins: 0,
    nextFreeCoinDate: new Date(Date.now() + 10000) // For testing: due very soon
  }
];

// Hydrate users with skills
MOCK_USERS.forEach(user => {
  user.skillsOffered = MOCK_SKILLS.filter(s => s.userId === user.id);
});

class MockStore {
  private users: User[] = MOCK_USERS;
  private swaps: Swap[] = [];
  private skills: Skill[] = MOCK_SKILLS;
  private currentUser: User | null = null;

  constructor() {
    const storedUser = localStorage.getItem('swaply_currentUser');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        // Re-hydrate dates because JSON parses them as strings
        if (parsed.nextFreeCoinDate) parsed.nextFreeCoinDate = new Date(parsed.nextFreeCoinDate);
        
        // Find fresh ref from memory or use parsed
        const found = this.users.find(u => u.id === parsed.id);
        if (found) {
            this.currentUser = found;
            this.checkFreeCoinEligibility(this.currentUser);
        } else {
            this.currentUser = parsed;
        }
      } catch (e) {
        localStorage.removeItem('swaply_currentUser');
      }
    }
  }

  // Check if it's time to award a monthly coin
  private checkFreeCoinEligibility(user: User) {
      const now = new Date();
      if (user.nextFreeCoinDate && now > user.nextFreeCoinDate) {
          user.coins += 1;
          
          // Set next date to 1 month from NOW (or from previous date to keep cycle? Let's do NOW for simplicity)
          const nextDate = new Date();
          nextDate.setMonth(nextDate.getMonth() + 1);
          user.nextFreeCoinDate = nextDate;
          
          this.saveUser(user);
          return true;
      }
      return false;
  }

  private saveUser(user: User) {
      localStorage.setItem('swaply_currentUser', JSON.stringify(user));
  }

  login(email: string): { success: boolean, user?: User, message?: string } {
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      this.currentUser = user;
      this.checkFreeCoinEligibility(user);
      this.saveUser(user);
      return { success: true, user };
    }
    return { success: false, message: 'User not found' };
  }

  register(data: { name: string; email: string; bio: string; location: string }): User {
      const nextDate = new Date();
      nextDate.setMonth(nextDate.getMonth() + 1);

      const newUser: User = {
          id: `u_${Date.now()}`,
          name: data.name,
          email: data.email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
          bio: data.bio,
          location: data.location,
          skillsOffered: [],
          skillsWanted: [],
          rating: 0,
          reviewCount: 0,
          isOnline: true,
          lastSeen: new Date(),
          points: 0,
          badges: ['Newcomer'],
          coins: 1, // Start with 1 free coin
          nextFreeCoinDate: nextDate
      };
      
      this.users.push(newUser);
      this.currentUser = newUser;
      this.saveUser(newUser);
      return newUser;
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('swaply_currentUser');
  }

  getCurrentUser(): User | null {
    if (this.currentUser) {
        // Always do a quick check on access to ensure UI has latest dates
        this.checkFreeCoinEligibility(this.currentUser);
    }
    return this.currentUser;
  }

  addCoins(amount: number) {
      if (this.currentUser) {
          this.currentUser.coins += amount;
          this.saveUser(this.currentUser);
      }
  }

  getUsers(): User[] {
    return this.users;
  }

  getSkills(): Skill[] {
    return this.skills.filter(s => s.status === SkillStatus.VERIFIED);
  }

  getAllSkillsRaw(): Skill[] {
    return this.skills;
  }

  getSwapsForUser(userId: string): Swap[] {
    return this.swaps.filter(s => s.requesterId === userId || s.receiverId === userId);
  }

  // Check if a user is currently locked in an active swap
  isUserBusy(userId: string): boolean {
      return this.swaps.some(s => 
          (s.requesterId === userId || s.receiverId === userId) && 
          s.status === SwapStatus.ACCEPTED
      );
  }

  createSwapRequest(requesterId: string, receiverId: string, requestedSkillId: string, offeredSkillId: string): Swap | null {
    // 1. Check Coins
    const requester = this.getUserById(requesterId);
    if (!requester || requester.coins < 1) {
        return null; // Insufficient coins
    }

    // Check if swap already exists between these users for these skills
    const existing = this.swaps.find(s => 
        s.requesterId === requesterId && s.receiverId === receiverId && 
        s.status === SwapStatus.PENDING
    );

    if (existing) return existing;

    // Deduct Coin
    requester.coins -= 1;
    if (this.currentUser && this.currentUser.id === requesterId) {
        this.saveUser(requester);
    }

    const newSwap: Swap = {
      id: `swap_${Date.now()}`,
      requesterId,
      receiverId,
      requestedSkillId,
      offeredSkillId,
      status: SwapStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: []
    };
    
    // Inject initial Swap Request Message
    const offeredSkill = this.getSkillById(offeredSkillId);
    
    const requestMsg: Message = {
        id: `msg_req_${Date.now()}`,
        senderId: requesterId,
        text: `LOG: Swap Request initiated: ${offeredSkill?.title}`,
        timestamp: new Date(),
        type: 'swap_request',
        status: 'sent',
        swapRequestId: newSwap.id
    };
    newSwap.messages.push(requestMsg);

    this.swaps.push(newSwap);
    return newSwap;
  }

  acceptSwap(swapId: string): { success: boolean, message: string } {
      const swap = this.swaps.find(s => s.id === swapId);
      if (!swap) return { success: false, message: 'Swap not found' };

      // LOCKING LOGIC: Users cannot accept a swap if they are already in an active one
      if (this.isUserBusy(swap.requesterId)) return { success: false, message: 'The other user is currently busy with another swap.' };
      if (this.isUserBusy(swap.receiverId)) return { success: false, message: 'You are currently busy with another swap. Complete it first!' };

      swap.status = SwapStatus.ACCEPTED;
      swap.updatedAt = new Date();
      
      this.sendMessage(swapId, 'system', 'Swap Accepted! You are now locked into this collaboration until completion.');
      return { success: true, message: 'Swap Accepted' };
  }

  declineSwap(swapId: string) {
      const swap = this.swaps.find(s => s.id === swapId);
      if (swap) {
          swap.status = SwapStatus.DECLINED;
          swap.updatedAt = new Date();
          this.sendMessage(swapId, 'system', 'Swap Request Declined.');
      }
  }

  completeSwap(swapId: string) {
      const swap = this.swaps.find(s => s.id === swapId);
      if (swap && swap.status === SwapStatus.ACCEPTED) {
          swap.status = SwapStatus.COMPLETED;
          swap.updatedAt = new Date();
          
          // Gamification: Award Points
          const requester = this.getUserById(swap.requesterId);
          const receiver = this.getUserById(swap.receiverId);
          
          if (requester) {
              requester.points += 100;
              this.checkBadges(requester);
          }
          if (receiver) {
              receiver.points += 100;
              this.checkBadges(receiver);
          }

          this.sendMessage(swapId, 'system', 'Swap Completed! +100 Points awarded to both users.');
      }
  }

  private checkBadges(user: User) {
      const completedSwaps = this.swaps.filter(s => 
          (s.requesterId === user.id || s.receiverId === user.id) && 
          s.status === SwapStatus.COMPLETED
      ).length;

      if (completedSwaps >= 1 && !user.badges.includes('First Swap')) {
          user.badges.push('First Swap');
      }
      if (completedSwaps >= 5 && !user.badges.includes('Top Swapper')) {
          user.badges.push('Top Swapper');
      }
      if (user.points > 1000 && !user.badges.includes('Skill Master')) {
          user.badges.push('Skill Master');
      }
  }

  sendMessage(swapId: string, senderId: string, text: string, imageUrl?: string): Message {
    const swap = this.swaps.find(s => s.id === swapId);
    if (!swap) throw new Error("Swap not found");

    const message: Message = {
      id: `msg_${Date.now()}`,
      senderId,
      text,
      type: senderId === 'system' ? 'system' : (imageUrl ? 'image' : 'text'),
      imageUrl,
      timestamp: new Date(),
      status: 'sent'
    };
    
    swap.messages.push(message);
    return message;
  }
  
  addSkill(userId: string, skillData: Partial<Skill>): Skill {
      const newSkill: Skill = {
          id: `s_${Date.now()}`,
          userId,
          title: skillData.title || 'Untitled Skill',
          description: skillData.description || '',
          category: skillData.category || SkillCategory.OTHER,
          image: skillData.image || 'https://picsum.photos/400/300',
          level: skillData.level || SkillLevel.BEGINNER,
          experience: skillData.experience || 0,
          status: SkillStatus.PENDING
      };
      
      this.skills.push(newSkill);
      const user = this.getUserById(userId);
      if (user) {
          user.skillsOffered.push(newSkill);
      }
      return newSkill;
  }

  // Admin function simulation
  verifySkill(skillId: string) {
      const skill = this.skills.find(s => s.id === skillId);
      if (skill) {
          skill.status = SkillStatus.VERIFIED;
          // Update nested user skill ref
          const user = this.getUserById(skill.userId);
          if (user) {
              const userSkill = user.skillsOffered.find(s => s.id === skillId);
              if (userSkill) userSkill.status = SkillStatus.VERIFIED;
          }
      }
  }

  getUserById(id: string): User | undefined {
      return this.users.find(u => u.id === id);
  }

  getSkillById(id: string): Skill | undefined {
      return this.skills.find(s => s.id === id);
  }
}

export const store = new MockStore();
