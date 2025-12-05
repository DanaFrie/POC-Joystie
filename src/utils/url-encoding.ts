// URL encoding/decoding utility for child pages with parent identifier
// Uses compact delimiter-based encoding to minimize token size
import { clientConfig } from '@/config/client.config';

/**
 * Encode parent ID, child ID, and optional challenge ID into compact URL-safe token
 * Format: base64url(parentId|childId|challengeId|expiresAt)
 * Uses pipe delimiter for compact encoding (no JSON overhead)
 */
export function encodeParentToken(
  parentId: string, 
  childId?: string, 
  challengeId?: string
): string {
  const expiresAt = Date.now() + (clientConfig.token.expirationDays * 24 * 60 * 60 * 1000);
  
  // Compact format: parentId|childId|challengeId|expiresAt
  // Empty values use empty string (not null) to keep it compact
  const parts = [
    parentId,
    childId || '',
    challengeId || '',
    expiresAt.toString()
  ];
  
  const compact = parts.join('|');
  // Use base64url encoding (URL-safe)
  const encoded = btoa(compact)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  return encoded;
}

/**
 * Decode parent token from URL and validate expiration
 * Uses compact pipe-delimited format: parentId|childId|challengeId|expiresAt
 */
export function decodeParentToken(token: string): { 
  parentId: string; 
  childId: string | null; 
  challengeId: string | null;
  timestamp: number;
  expiresAt: number;
  isExpired: boolean;
} | null {
  try {
    // Restore base64url to base64
    const base64 = token
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // Add padding if needed
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    
    const decoded = atob(padded);
    
    // Parse compact pipe-delimited format: parentId|childId|challengeId|expiresAt
    if (!decoded.includes('|')) {
      return null; // Invalid format
    }
    
    const parts = decoded.split('|');
    if (parts.length !== 4) {
      return null; // Invalid format - must have exactly 4 parts
    }
    
    const parentId = parts[0];
    const childId = parts[1] || null;
    const challengeId = parts[2] || null;
    const expiresAt = parseInt(parts[3], 10);
    
    if (!parentId || !expiresAt || isNaN(expiresAt)) {
      return null; // Invalid data
    }
    
    const now = Date.now();
    const isExpired = now > expiresAt;
    
    return {
      parentId,
      childId,
      challengeId,
      timestamp: Date.now(),
      expiresAt,
      isExpired
    };
  } catch (error) {
    console.error('Error decoding parent token:', error);
    return null;
  }
}

/**
 * Generate setup URL with parent identifier and optional child ID
 * Note: challengeId is NOT included in setup URL to keep it shorter (not needed for setup)
 */
export function generateSetupUrl(
  parentId: string, 
  childId?: string, 
  challengeId?: string, // Ignored for setup URL - kept for API compatibility
  baseUrl?: string
): string {
  // Setup URL doesn't need challengeId - it's only needed for upload/redemption
  const token = encodeParentToken(parentId, childId, undefined);
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/child/setup?token=${token}`;
}

/**
 * Generate upload URL with parent identifier and optional challenge ID
 */
export function generateUploadUrl(
  parentId: string, 
  childId?: string, 
  challengeId?: string,
  baseUrl?: string
): string {
  const token = encodeParentToken(parentId, childId, challengeId);
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/child/upload?token=${token}`;
}

/**
 * Generate redemption URL with parent identifier and optional challenge ID
 */
export function generateRedemptionUrl(
  parentId: string, 
  childId?: string, 
  challengeId?: string,
  baseUrl?: string
): string {
  const token = encodeParentToken(parentId, childId, challengeId);
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/child/redemption?token=${token}`;
}

