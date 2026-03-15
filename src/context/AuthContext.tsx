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

        if (userSnap.exists()) {
          // Returning User: Grab their real data from Firestore
          const data = userSnap.data();
          role = data.role as Role || 'student';
          isBlocked = data.isBlocked || false;
        } else {
          // First Time Login: Create their profile in the database!
          await setDoc(userRef, {
            name: firebaseUser.displayName || 'NEU User',
            email: firebaseUser.email,
            role: 'student', // Automatically make new users students
            isBlocked: false,
            isMaintainer: false,
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