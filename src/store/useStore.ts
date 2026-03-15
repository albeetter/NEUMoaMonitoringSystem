// src/store/useStore.ts
import { create } from 'zustand';
import type { Role } from '../context/AuthContext';
import { db, auth } from '../firebase';
import { collection, getDocs, doc, updateDoc, setDoc, addDoc } from 'firebase/firestore'; 

export const MoaStatus = {
  DRAFT: 'Draft',
  LEGAL_REVIEW: 'Legal Review',
  VPAA_APPROVED: 'VPAA Approved',
  HTE_CONFIRMATION: 'HTE Confirmation',
  ACTIVE: 'Active',
  EXPIRING: 'Expiring',
  EXPIRED: 'Expired',
  TERMINATED: 'Terminated'
} as const;

export type MoaStatusType = typeof MoaStatus[keyof typeof MoaStatus];

export interface MOA {
  HTEID: string;
  companyName: string;
  address: string;
  contactPerson: string;
  email: string;
  industryType: string;
  effectiveDate: string;
  endDate: string;
  status: MoaStatusType;
  endorsedByCollege: string;
  isDeleted: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  isBlocked: boolean;
  isMaintainer: boolean;
  initials: string;
  avatarColors: string;
}

export interface AuditLog {
  id: string;
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'RECOVER'; 
  entityId: string;
  entityName: string;
  userName: string;
  timestamp: string;
}

interface AppState {
  users: UserProfile[];
  moas: MOA[];
  auditLogs: AuditLog[];
  globalSearchTerm: string;
  
  isLoadingMoas: boolean;
  isLoadingUsers: boolean;
  isLoadingAudit: boolean;
  
  setGlobalSearchTerm: (term: string) => void;
  fetchMoas: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchAuditLogs: () => Promise<void>;
  
  updateUserRole: (id: string, newRole: Role) => Promise<void>;
  toggleMaintainer: (id: string) => Promise<void>;
  toggleUserBlock: (id: string) => Promise<void>;
  
  deleteMoa: (HTEID: string) => Promise<void>;
  recoverMoa: (HTEID: string) => Promise<void>;
  addMoa: (moaData: Omit<MOA, 'HTEID' | 'isDeleted'>) => Promise<void>;
  updateMoa: (HTEID: string, updatedData: Partial<MOA>) => Promise<void>;
}

// Helper to auto-calculate Expiry Status based on the End Date
const calculateAutoStatus = (status: MoaStatusType, endDate: string): MoaStatusType => {
  if (!endDate || status === MoaStatus.TERMINATED || status === MoaStatus.DRAFT) {
    return status;
  }
  
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return MoaStatus.EXPIRED;
  if (diffDays <= 60) return MoaStatus.EXPIRING; // 2 months or less
  
  return status;
};

export const useStore = create<AppState>((set, get) => ({
  moas: [], 
  users: [],
  auditLogs: [],
  globalSearchTerm: '',
  
  isLoadingMoas: false,
  isLoadingUsers: false,
  isLoadingAudit: false,

  // --- UI STATE ACTIONS ---
  setGlobalSearchTerm: (term) => set({ globalSearchTerm: term }),

  // --- MOA FIREBASE ACTIONS ---
  fetchMoas: async () => {
    set({ isLoadingMoas: true });
    try {
      const querySnapshot = await getDocs(collection(db, 'moas'));
      const fetchedMoas: MOA[] = [];
      querySnapshot.forEach((docSnap) => {
        fetchedMoas.push(docSnap.data() as MOA);
      });
      set({ moas: fetchedMoas, isLoadingMoas: false });
    } catch (error) {
      console.error("Error fetching MOAs: ", error);
      set({ isLoadingMoas: false });
    }
  },

  deleteMoa: async (HTEID: string) => {
    try {
      // Find the MOA first so we can log its name in the audit trail
      const targetMoa = get().moas.find(m => m.HTEID === HTEID);
      const companyName = targetMoa?.companyName || 'Unknown Company';

      // Soft delete in Firestore
      const moaRef = doc(db, 'moas', HTEID);
      await updateDoc(moaRef, { isDeleted: true });
      
      // Create Audit Log
      const userName = auth.currentUser?.displayName || 'System User';
      const logData = { 
        actionType: 'DELETE' as const, 
        entityId: HTEID, 
        entityName: companyName, 
        userName, 
        timestamp: new Date().toISOString() 
      };
      const docRef = await addDoc(collection(db, 'audit_logs'), logData);

      // Update Local State
      set((state) => ({
        moas: state.moas.map(moa => moa.HTEID === HTEID ? { ...moa, isDeleted: true } : moa),
        auditLogs: [{ id: docRef.id, ...logData }, ...state.auditLogs]
      }));
      
    } catch (error) {
      console.error("Error deleting MOA: ", error);
      alert("Failed to delete MOA. Please check your connection and permissions.");
    }
  },

  recoverMoa: async (HTEID: string) => {
    try {
      const targetMoa = get().moas.find(m => m.HTEID === HTEID);
      const companyName = targetMoa?.companyName || 'Unknown Company';

      // 1. Set isDeleted back to false in Firestore
      const moaRef = doc(db, 'moas', HTEID);
      await updateDoc(moaRef, { isDeleted: false });
      
      // 2. Create the Audit Log for the recovery
      const userName = auth.currentUser?.displayName || 'System User';
      const logData = { 
        actionType: 'RECOVER' as const, 
        entityId: HTEID, 
        entityName: companyName, 
        userName, 
        timestamp: new Date().toISOString() 
      };
      const docRef = await addDoc(collection(db, 'audit_logs'), logData);

      // 3. Update Local State
      set((state) => ({
        moas: state.moas.map(moa => moa.HTEID === HTEID ? { ...moa, isDeleted: false } : moa),
        auditLogs: [{ id: docRef.id, ...logData }, ...state.auditLogs]
      }));
      
    } catch (error) {
      console.error("Error recovering MOA: ", error);
      alert("Failed to recover MOA. Please check your connection.");
    }
  },

  addMoa: async (moaData) => {
    try {
      // Generate a unique HTEID
      const year = new Date().getFullYear();
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const newHTEID = `HTE-${year}-${randomNum}`;
      
      // Auto-calculate status before saving
      const finalStatus = calculateAutoStatus(moaData.status, moaData.endDate);

      const newMoa: MOA = { 
        ...moaData, 
        status: finalStatus, 
        HTEID: newHTEID, 
        isDeleted: false 
      };
      
      // Save to Firestore
      await setDoc(doc(db, 'moas', newHTEID), newMoa);

      // Create Audit Log
      const userName = auth.currentUser?.displayName || 'System User';
      const logData = { 
        actionType: 'CREATE' as const, 
        entityId: newHTEID, 
        entityName: moaData.companyName, 
        userName, 
        timestamp: new Date().toISOString() 
      };
      const docRef = await addDoc(collection(db, 'audit_logs'), logData);

      // Update Local State
      set((state) => ({ 
        moas: [newMoa, ...state.moas],
        auditLogs: [{ id: docRef.id, ...logData }, ...state.auditLogs]
      }));
      
    } catch (error) {
      console.error("Error adding MOA: ", error);
      alert("Failed to add MOA to database.");
    }
  },

  updateMoa: async (HTEID, updatedData) => {
    try {
      // Find current MOA to compare fields
      const currentMoa = get().moas.find(m => m.HTEID === HTEID);
      const rawStatus = updatedData.status || currentMoa?.status || MoaStatus.DRAFT;
      const rawEndDate = updatedData.endDate !== undefined ? updatedData.endDate : currentMoa?.endDate || '';
      
      // Auto-calculate status before updating
      const finalStatus = calculateAutoStatus(rawStatus, rawEndDate);
      const finalUpdate = { ...updatedData, status: finalStatus };

      // Update in Firestore
      const moaRef = doc(db, 'moas', HTEID);
      await updateDoc(moaRef, finalUpdate);
      
      // Create Audit Log
      const companyName = updatedData.companyName || currentMoa?.companyName || 'Unknown Company';
      const userName = auth.currentUser?.displayName || 'System User';
      const logData = { 
        actionType: 'UPDATE' as const, 
        entityId: HTEID, 
        entityName: companyName, 
        userName, 
        timestamp: new Date().toISOString() 
      };
      const docRef = await addDoc(collection(db, 'audit_logs'), logData);

      // Update Local State
      set((state) => ({
        moas: state.moas.map(moa => moa.HTEID === HTEID ? { ...moa, ...finalUpdate } : moa),
        auditLogs: [{ id: docRef.id, ...logData }, ...state.auditLogs]
      }));
      
    } catch (error) {
      console.error("Error updating MOA: ", error);
      alert("Failed to update MOA in database.");
    }
  },

  // --- AUDIT LOG FIREBASE ACTIONS ---
  fetchAuditLogs: async () => {
    set({ isLoadingAudit: true });
    try {
      const querySnapshot = await getDocs(collection(db, 'audit_logs'));
      const fetchedLogs: AuditLog[] = [];
      
      querySnapshot.forEach((docSnap) => {
        fetchedLogs.push({ id: docSnap.id, ...docSnap.data() } as AuditLog);
      });
      
      // Sort logs from newest to oldest
      fetchedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      set({ auditLogs: fetchedLogs, isLoadingAudit: false });
    } catch (error) {
      console.error("Error fetching audit logs: ", error);
      set({ isLoadingAudit: false });
    }
  },

  // --- USER FIREBASE ACTIONS ---
  fetchUsers: async () => {
    set({ isLoadingUsers: true });
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const fetchedUsers: UserProfile[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const role = data.role as Role || 'student';
        const name = data.name || 'Unknown User';
        
        // Dynamically assign colors based on role
        let avatarColors = 'bg-slate-100 text-slate-600';
        if (role === 'admin') avatarColors = 'bg-[#11a4d4]/10 text-[#11a4d4]';
        if (role === 'faculty') avatarColors = 'bg-blue-100 text-blue-600';

        fetchedUsers.push({
          id: docSnap.id,
          name: name,
          email: data.email || '',
          role: role,
          isBlocked: !!data.isBlocked,
          isMaintainer: !!data.isMaintainer,
          initials: name.substring(0, 2).toUpperCase(),
          avatarColors
        });
      });
      
      set({ users: fetchedUsers, isLoadingUsers: false });
    } catch (error) {
      console.error("Error fetching users: ", error);
      set({ isLoadingUsers: false });
    }
  },

  updateUserRole: async (id, newRole) => {
    try {
      const user = get().users.find(u => u.id === id);
      if (!user) return;
      
      const newMaintainer = newRole === 'faculty' ? user.isMaintainer : false;
      await updateDoc(doc(db, 'users', id), { role: newRole, isMaintainer: newMaintainer });
      
      set((state) => ({ 
        users: state.users.map(u => u.id === id ? { ...u, role: newRole, isMaintainer: newMaintainer } : u) 
      }));
    } catch (error) {
      console.error("Error updating user role: ", error);
      alert("Failed to update user role.");
    }
  },

  toggleMaintainer: async (id) => {
    try {
      const user = get().users.find(u => u.id === id);
      if (!user || user.role !== 'faculty') return;
      
      const newStatus = !user.isMaintainer;
      await updateDoc(doc(db, 'users', id), { isMaintainer: newStatus });
      
      set((state) => ({ 
        users: state.users.map(u => u.id === id ? { ...u, isMaintainer: newStatus } : u) 
      }));
    } catch (error) {
      console.error("Error toggling maintainer status: ", error);
      alert("Failed to update maintainer status.");
    }
  },

  toggleUserBlock: async (id) => {
    try {
      const user = get().users.find(u => u.id === id);
      if (!user) return;
      
      const newStatus = !user.isBlocked;
      await updateDoc(doc(db, 'users', id), { isBlocked: newStatus });
      
      set((state) => ({ 
        users: state.users.map(u => u.id === id ? { ...u, isBlocked: newStatus } : u) 
      }));
    } catch (error) {
      console.error("Error toggling user block status: ", error);
      alert("Failed to block/unblock user.");
    }
  },
}));