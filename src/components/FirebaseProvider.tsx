import React, { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { useStore } from '../store/useStore';

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setUser, setAuthReady } = useStore();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is logged in, listen to their document in Firestore
        const unsubscribeDoc = onSnapshot(doc(db, 'users', firebaseUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUser({
              uid: firebaseUser.uid,
              fullName: userData.fullName || 'User',
              email: firebaseUser.email || '',
              phoneNumber: userData.phoneNumber,
              country: userData.country,
              balance: userData.balance || 0,
              activeInvestments: userData.activeInvestments || 0,
              totalProfit: userData.totalProfit || 0,
              totalDeposits: userData.totalDeposits || 0,
              referralCode: userData.referralCode,
              referredBy: userData.referredBy,
              role: userData.role || 'user',
              createdAt: userData.createdAt || new Date().toISOString(),
            });
          } else {
            // User exists in Auth but not in Firestore yet (should be handled in Register)
            setUser(null);
          }
          setAuthReady(true);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
          setAuthReady(true);
        });

        return () => unsubscribeDoc();
      } else {
        // User is logged out
        setUser(null);
        setAuthReady(true);
      }
    });

    return () => unsubscribeAuth();
  }, [setUser, setAuthReady]);

  return <>{children}</>;
};
