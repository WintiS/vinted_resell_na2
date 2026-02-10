import { createContext, useContext, useEffect, useState } from 'react';
import {
    signInWithPopup,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                }
            } else {
                setUserData(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const generateReferralCode = () => {
        return Math.random().toString(36).substring(2, 10).toUpperCase();
    };

    const signUpWithEmail = async (email, password, displayName) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;

        await setDoc(doc(db, 'users', userId), {
            userId,
            email,
            displayName,
            referralCode: generateReferralCode(),
            subscriptionStatus: 'inactive',
            totalEarnings: 0,
            availableBalance: 0,
            lifetimeEarnings: 0,
            createdAt: new Date(),
        });

        return userCredential;
    };

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const userId = result.user.uid;

        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', userId), {
                userId,
                email: result.user.email,
                displayName: result.user.displayName,
                referralCode: generateReferralCode(),
                subscriptionStatus: 'inactive',
                totalEarnings: 0,
                availableBalance: 0,
                lifetimeEarnings: 0,
                createdAt: new Date(),
            });
        }

        return result;
    };

    const loginWithEmail = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = () => signOut(auth);

    return (
        <AuthContext.Provider value={{
            user,
            userData,
            loading,
            signUpWithEmail,
            signInWithGoogle,
            loginWithEmail,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}
