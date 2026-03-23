// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type Role = 'admin' | 'faculty' | 'student';

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  role: Role;
  isBlocked: boolean;
  photoURL?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        
        // Check database for existing user
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        let role: Role = 'student'; // Default security level
        let isBlocked = false;

        // List of emails that should automatically be granted admin rights
        const adminEmails = ['ramiljr.deocariza@neu.edu.ph'];

        if (userSnap.exists()) {
          // Returning User: Grab their real data from Firestore
          const data = userSnap.data();
          role = data.role as Role || 'student';
          isBlocked = data.isBlocked || false;

          // Upgrade existing user to admin if their email is in the admin list
          if (firebaseUser.email && adminEmails.includes(firebaseUser.email) && role !== 'admin') {
            role = 'admin';
            await setDoc(userRef, { role: 'admin', isMaintainer: true }, { merge: true });
          }
        } else {
          const isAdmin = firebaseUser.email ? adminEmails.includes(firebaseUser.email) : false;
          role = isAdmin ? 'admin' : 'student';

          // First Time Login: Create their profile in the database!
          await setDoc(userRef, {
            name: firebaseUser.displayName || 'NEU User',
            email: firebaseUser.email,
            role: role,
            isBlocked: false,
            isMaintainer: isAdmin,
            createdAt: new Date().toISOString()
          });
        }

        setUser({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'NEU User',
          email: firebaseUser.email || '',
          role,
          isBlocked,
          photoURL: firebaseUser.photoURL || undefined,
        });

      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};