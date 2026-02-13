/**
 * Utility functions for the Vinted SaaS application
 */

/**
 * Format currency amount
 * @param {number} amount - Amount in dollars
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount || 0);
};

/**
 * Format date
 * @param {Date|Timestamp} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
    if (!date) return 'N/A';

    try {
        const dateObj = date instanceof Date ? date : date.toDate();
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
    }
};

/**
 * Format relative time (e.g., "2 days ago")
 * @param {Date|Timestamp} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
    if (!date) return 'N/A';

    try {
        const dateObj = date instanceof Date ? date : date.toDate();
        const now = new Date();
        const diffMs = now - dateObj;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    } catch (error) {
        console.error('Error formatting relative time:', error);
        return 'N/A';
    }
};

/**
 * Generate a random referral code
 * @returns {string} 8-character alphanumeric code
 */
export const generateReferralCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
};

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} True if successful
 */
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
};

/**
 * Truncate text to a maximum length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Get subscription tier label
 * @param {string} tier - Subscription tier (monthly/yearly)
 * @returns {string} Formatted tier label
 */
export const getSubscriptionTierLabel = (tier) => {
    const labels = {
        monthly: 'Monthly',
        yearly: 'Yearly',
        month: 'Monthly',
        year: 'Yearly',
    };
    return labels[tier] || 'Unknown';
};

/**
 * Get subscription status badge color
 * @param {string} status - Subscription status
 * @returns {object} CSS classes for badge
 */
export const getSubscriptionStatusStyle = (status) => {
    const styles = {
        active: 'bg-green-500/20 text-green-400 border border-green-500/30',
        inactive: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
        cancelled: 'bg-red-500/20 text-red-400 border border-red-500/30',
        past_due: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    };
    return styles[status] || styles.inactive;
};

/**
 * Calculate percentage change
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {number} Percentage change
 */
export const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};
