// Local Storage based state management for the "NextGen" simulation
// Since we are moving away from Firebase, we use localStorage to persist data on the device.

export interface User {
  uid: string;
  fingerprint: string;
  displayName: string;
  balance: number;
  referralCount: number;
  referralCode: string;
  createdAt: string;
}

export interface Referral {
  id: string;
  referrerUid: string;
  referredEmail: string;
  status: 'pending' | 'claimed' | 'failed';
  createdAt: string;
}

const USERS_KEY = 'nextgen_users';
const REFERRALS_KEY = 'nextgen_referrals';
const CURRENT_USER_ID_KEY = 'nextgen_current_user_id';

export const getFingerprint = () => {
  const ua = navigator.userAgent;
  const screen = `${window.screen.width}x${window.screen.height}`;
  return btoa(`${ua}-${screen}`).substring(0, 16);
};

export const storage = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  saveUsers: (users: User[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },
  
  getReferrals: (): Referral[] => {
    const data = localStorage.getItem(REFERRALS_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  saveReferrals: (referrals: Referral[]) => {
    localStorage.setItem(REFERRALS_KEY, JSON.stringify(referrals));
  },
  
  getCurrentUser: (): User | null => {
    const uid = localStorage.getItem(CURRENT_USER_ID_KEY);
    if (!uid) return null;
    return storage.getUsers().find(u => u.uid === uid) || null;
  },
  
  setCurrentUser: (uid: string | null) => {
    if (uid) {
      localStorage.setItem(CURRENT_USER_ID_KEY, uid);
    } else {
      localStorage.removeItem(CURRENT_USER_ID_KEY);
    }
  },

  updateUser: (uid: string, updates: Partial<User>) => {
    const users = storage.getUsers();
    const index = users.findIndex(u => u.uid === uid);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      storage.saveUsers(users);
      return users[index];
    }
    return null;
  },

  addReferral: (referral: Omit<Referral, 'id'>) => {
    const referrals = storage.getReferrals();
    const newRef = { ...referral, id: Math.random().toString(36).substring(2, 9) };
    referrals.push(newRef);
    storage.saveReferrals(referrals);
    return newRef;
  },

  updateReferral: (id: string, status: Referral['status']) => {
    const referrals = storage.getReferrals();
    const index = referrals.findIndex(r => r.id === id);
    if (index !== -1) {
      referrals[index].status = status;
      storage.saveReferrals(referrals);
    }
  }
};
