import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
    signInWithPopup,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Function to refresh user data manually
    const refreshUserData = useCallback(async () => {
        if (user) {
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                }
            } catch (error) {
                console.error('Error refreshing user data:', error);
            }
        }
    }, [user]);

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        setUserData(userDoc.data());
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            } else {
                setUserData(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    // Real-time listener for user data updates
    useEffect(() => {
        if (!user) return;

        const unsubscribe = onSnapshot(
            doc(db, 'users', user.uid),
            (doc) => {
                if (doc.exists()) {
                    setUserData(doc.data());
                }
            },
            (error) => {
                console.error('Error listening to user data:', error);
            }
        );

        return unsubscribe;
    }, [user]);

    const generateReferralCode = () => {
        return Math.random().toString(36).substring(2, 10).toUpperCase();
    };

    const signUpWithEmail = async (email, password, displayName) => {
        try {
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
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    };

    const signInWithGoogle = async () => {
        try {
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
        } catch (error) {
            console.error('Google signin error:', error);
            throw error;
        }
    };

    const loginWithEmail = async (email, password) => {
        try {
            return await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            userData,
            loading,
            signUpWithEmail,
            signInWithGoogle,
            loginWithEmail,
            logout,
            refreshUserData
        }}>
            {children}
        </AuthContext.Provider>
    );
}
