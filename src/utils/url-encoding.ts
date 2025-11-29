// URL encoding/decoding utility for child pages with parent identifier
// Uses base64 encoding for simplicity (in production, consider more secure encoding)

/**
 * Encode parent ID and optional child ID into URL-safe token
 */
export function encodeParentToken(parentId: string, childId?: string): string {
  const payload = {
    parentId,
    childId: childId || null,
    timestamp: Date.now()
  };
  
  const json = JSON.stringify(payload);
  // Use base64url encoding (URL-safe)
  const encoded = btoa(json)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  return encoded;
}

/**
 * Decode parent token from URL
 */
export function decodeParentToken(token: string): { parentId: string; childId: string | null; timestamp: number } | null {
  try {
    // Restore base64url to base64
    const base64 = token
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // Add padding if needed
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    
    const json = atob(padded);
    const payload = JSON.parse(json);
    
    return {
      parentId: payload.parentId,
      childId: payload.childId || null,
      timestamp: payload.timestamp || 0
    };
  } catch (error) {
    console.error('Error decoding parent token:', error);
    return null;
  }
}

/**
 * Generate setup URL with parent identifier
 */
export function generateSetupUrl(parentId: string, childId?: string, baseUrl?: string): string {
  const token = encodeParentToken(parentId, childId);
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/child/setup?token=${token}`;
}

/**
 * Generate upload URL with parent identifier
 */
export function generateUploadUrl(parentId: string, childId?: string, baseUrl?: string): string {
  const token = encodeParentToken(parentId, childId);
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/child/upload?token=${token}`;
}

/**
 * Generate redemption URL with parent identifier
 */
export function generateRedemptionUrl(parentId: string, childId?: string, baseUrl?: string): string {
  const token = encodeParentToken(parentId, childId);
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/child/redemption?token=${token}`;
}

