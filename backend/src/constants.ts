/**
 * Application-wide constants.
 * Centralizes magic numbers, strings, and configuration defaults
 * for better maintainability and discoverability.
 */

// ─── Currency ────────────────────────────────────────────────────────────────
export const DEFAULT_CURRENCY = 'COP';
export const CURRENCY_DECIMALS = 2;

// ─── Fees (in COP) ──────────────────────────────────────────────────────────
export const DEFAULT_BASE_FEE = 5000;
export const DEFAULT_DELIVERY_FEE = 10000;

// ─── Payment Gateway ─────────────────────────────────────────────────────────
export const GATEWAY_TIMEOUT_MS = 30000;
export const GATEWAY_RETRY_ATTEMPTS = 2;
export const GATEWAY_RETRY_DELAY_MS = 1000;
export const GATEWAY_POLL_MAX_ATTEMPTS = 12;
export const GATEWAY_POLL_INTERVAL_MS = 5000;

// ─── Transaction ─────────────────────────────────────────────────────────────
export const TRANSACTION_REFERENCE_PREFIX = 'txn_';
export const TRANSACTION_REFERENCE_LENGTH = 16;

// ─── Validation ──────────────────────────────────────────────────────────────
export const MAX_FIELD_LENGTH = 1000;
export const POSTAL_CODE_REGEX = /^\d{6}$/;
export const POSTAL_CODE_LENGTH = 6;

// ─── Server ──────────────────────────────────────────────────────────────────
export const DEFAULT_PORT = 3000;
export const DEFAULT_FRONTEND_URL = 'http://localhost:5173';
export const API_PREFIX = 'api';

// ─── Security ────────────────────────────────────────────────────────────────
export const CORS_METHODS = ['GET', 'POST', 'PATCH', 'DELETE'];
export const CORS_HEADERS = ['Content-Type', 'Authorization'];

// ─── Gateway Status Mappings ─────────────────────────────────────────────────
export const GATEWAY_STATUS_APPROVED = 'APPROVED';
export const GATEWAY_STATUS_DECLINED = 'DECLINED';
export const GATEWAY_STATUS_VOIDED = 'VOIDED';
export const GATEWAY_STATUS_ERROR = 'ERROR';
export const GATEWAY_STATUS_PENDING = 'PENDING';
