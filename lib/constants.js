/**
 * Application-wide constants and configuration
 */

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
    MONTHLY: {
        id: 'monthly',
        name: 'Monthly',
        price: 29,
        interval: 'month',
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || 'price_monthly_xxx',
    },
    YEARLY: {
        id: 'yearly',
        name: 'Yearly',
        price: 290,
        interval: 'year',
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY || 'price_yearly_xxx',
        savings: '17%',
    },
};

// Product Configuration
export const PRODUCT_CONFIG = {
    name: 'Premium Vinted Suppliers Database',
    price: 49.99,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRODUCT || 'price_product_xxx',
    description: '500+ Verified Vinted suppliers with lifetime updates',
};

// Withdrawal Configuration
export const WITHDRAWAL_CONFIG = {
    minimumAmount: 50,
    processingTime: '3-5 business days',
    fee: 0,
};

// Subscription Status
export const SUBSCRIPTION_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    CANCELLED: 'cancelled',
    PAST_DUE: 'past_due',
    TRIALING: 'trialing',
    UNPAID: 'unpaid',
};

// Sale Status
export const SALE_STATUS = {
    COMPLETED: 'completed',
    PENDING: 'pending',
    REFUNDED: 'refunded',
    CANCELLED: 'cancelled',
};

// Withdrawal Status
export const WITHDRAWAL_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
};

// Routes
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    SIGNUP: '/signup',
    DASHBOARD: '/dashboard',
    ADMIN: '/admin',
    PRICING: '/pricing',
    STORE: '/store',
    SUCCESS: '/success',
};

// Error Messages
export const ERROR_MESSAGES = {
    AUTH: {
        INVALID_EMAIL: 'Please enter a valid email address',
        WEAK_PASSWORD: 'Password must be at least 6 characters',
        EMAIL_IN_USE: 'This email is already in use',
        WRONG_PASSWORD: 'Incorrect password',
        USER_NOT_FOUND: 'No account found with this email',
        TOO_MANY_REQUESTS: 'Too many attempts. Please try again later',
    },
    SUBSCRIPTION: {
        CREATION_FAILED: 'Failed to create subscription. Please try again',
        NOT_FOUND: 'Subscription not found',
        ALREADY_ACTIVE: 'You already have an active subscription',
    },
    PAYMENT: {
        FAILED: 'Payment failed. Please try again',
        CARD_DECLINED: 'Your card was declined',
        INSUFFICIENT_FUNDS: 'Insufficient funds',
    },
    GENERIC: {
        UNKNOWN: 'An unknown error occurred. Please try again',
        NETWORK: 'Network error. Please check your connection',
    },
};

// Success Messages
export const SUCCESS_MESSAGES = {
    AUTH: {
        SIGNUP: 'Account created successfully!',
        LOGIN: 'Welcome back!',
        LOGOUT: 'Logged out successfully',
    },
    SUBSCRIPTION: {
        CREATED: 'Subscription created successfully!',
        CANCELLED: 'Subscription cancelled',
        UPDATED: 'Subscription updated successfully',
    },
    PAYMENT: {
        SUCCESS: 'Payment successful!',
    },
    WITHDRAWAL: {
        REQUESTED: 'Withdrawal requested successfully',
        COMPLETED: 'Withdrawal completed',
    },
};

// Firebase Collection Names
export const COLLECTIONS = {
    USERS: 'users',
    SALES: 'sales',
    WITHDRAWALS: 'withdrawals',
    PRODUCTS: 'products',
};

// Pagination
export const PAGINATION = {
    SALES_PER_PAGE: 50,
    USERS_PER_PAGE: 20,
    ADMIN_SALES_PER_PAGE: 100,
};

// Date Formats
export const DATE_FORMATS = {
    FULL: 'MMMM D, YYYY',
    SHORT: 'MMM D, YYYY',
    TIME: 'h:mm A',
    DATETIME: 'MMMM D, YYYY h:mm A',
};

// App Metadata
export const APP_META = {
    title: 'SupplierSaaS - Earn 100% Commission',
    description: 'Start earning 100% commission on every sale. Join our affiliate program today.',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    ogImage: '/og-image.png',
};

// Admin Configuration
export const ADMIN_CONFIG = {
    emails: process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [],
};

// Stripe Test Cards (for development)
export const STRIPE_TEST_CARDS = {
    SUCCESS: '4242424242424242',
    DECLINE: '4000000000000002',
    REQUIRES_AUTH: '4000002500003155',
};
