import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
}

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [referralCode, setReferralCode] = useState('');

    // Load cart and referral code from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('vinted_cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (error) {
                console.error('Failed to load cart:', error);
            }
        }

        const savedReferralCode = localStorage.getItem('vinted_referral_code');
        if (savedReferralCode) {
            setReferralCode(savedReferralCode);
        }

        setIsLoaded(true);
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('vinted_cart', JSON.stringify(cart));
        }
    }, [cart, isLoaded]);

    const addToCart = (product) => {
        setCart((prevCart) => {
            // Check if product already exists in cart
            const existingIndex = prevCart.findIndex(item => item.id === product.id);

            if (existingIndex !== -1) {
                // Product already in cart, don't add again (digital products)
                return prevCart;
            }

            // Add new product
            return [...prevCart, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCart((prevCart) => prevCart.filter(item => item.id !== productId));
    };

    const clearCart = () => {
        setCart([]);
    };

    const isInCart = (productId) => {
        return cart.some(item => item.id === productId);
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => {
            // Parse Czech price format (e.g., "1.281,00 Kč")
            const priceStr = item.price.replace(/[^\d,]/g, '').replace(',', '.');
            const price = parseFloat(priceStr);
            return total + (price * item.quantity);
        }, 0);
    };

    const getCartCount = () => {
        return cart.length;
    };

    // Function to set and persist referral code
    const setAndSaveReferralCode = (code) => {
        setReferralCode(code);
        if (code) {
            localStorage.setItem('vinted_referral_code', code);
        }
    };

    const value = {
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        getCartTotal,
        getCartCount,
        isLoaded,
        referralCode,
        setReferralCode: setAndSaveReferralCode,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}
