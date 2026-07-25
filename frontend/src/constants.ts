/**
 * Frontend application constants.
 * Single source of truth for configuration values.
 */

// Fees (COP)
export const DEFAULT_BASE_FEE = 5000;
export const DEFAULT_DELIVERY_FEE = 10000;

// Checkout
export const MAX_PAYMENT_RETRIES = 3;
export const CHECKOUT_PERSISTENCE_TTL_MS = 30 * 60 * 1000; // 30 minutes
export const CHECKOUT_STORAGE_KEY = 'checkout_state';

// Validation
export const CARD_NUMBER_MIN_LENGTH = 13;
export const CARD_NUMBER_MAX_LENGTH = 19;
export const CVV_LENGTH = 3;
export const POSTAL_CODE_LENGTH = 6;
export const CARDHOLDER_NAME_MIN_LENGTH = 2;
export const CARDHOLDER_NAME_MAX_LENGTH = 50;

// UI
export const REDIRECT_DELAY_MS = 3000;
export const API_TIMEOUT_MS = 30000;
