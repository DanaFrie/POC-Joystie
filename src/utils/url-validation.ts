// URL validation utilities for child pages
import { decodeParentToken } from './url-encoding';
import { getActiveChallenge } from '@/lib/api/challenges';
import { getChild } from '@/lib/api/children';
import { getUploadsByChallenge } from '@/lib/api/uploads';

export type UrlValidationResult = {
  isValid: boolean;
  error?: string;
  parentId?: string;
  childId?: string | null;
  challengeId?: string;
  challengeNotStarted?: boolean;
  challengeStartDate?: string;
};

/**
 * Validate setup URL - one-time until setup is complete
 * Setup is complete when child has nickname and moneyGoals
 */
export async function validateSetupUrl(token: string): Promise<UrlValidationResult> {
  const decoded = decodeParentToken(token);
  
  if (!decoded) {
    return {
      isValid: false,
      error: 'כתובת לא תקינה'
    };
  }

  const { parentId, childId } = decoded;

  // Check if child exists and setup is complete
  if (childId) {
    try {
      const child = await getChild(childId);
      if (child) {
        // Setup is complete if child has nickname and moneyGoals
        if (child.nickname && child.moneyGoals && child.moneyGoals.length > 0) {
          return {
            isValid: false,
            error: 'ההגדרה הושלמה כבר. השתמש בכתובת העלאה במקום.',
            parentId,
            childId
          };
        }
      }
    } catch (error) {
      console.error('Error checking child setup status:', error);
      // Continue validation even if check fails
    }
  }

  return {
    isValid: true,
    parentId,
    childId
  };
}

/**
 * Validate upload URL - available all challenge week
 * Must be during an active challenge week
 */
export async function validateUploadUrl(token: string): Promise<UrlValidationResult> {
  const decoded = decodeParentToken(token);
  
  if (!decoded) {
    return {
      isValid: false,
      error: 'כתובת לא תקינה'
    };
  }

  const { parentId, childId } = decoded;

  try {
    // Check if there's an active challenge
    const challenge = await getActiveChallenge(parentId);
    
    if (!challenge) {
      return {
        isValid: false,
        error: 'אין אתגר פעיל. בדוק עם ההורה שלך.',
        parentId,
        childId
      };
    }

    // Check if challenge is active
    if (!challenge.isActive) {
      return {
        isValid: false,
        error: 'האתגר לא פעיל. בדוק עם ההורה שלך.',
        parentId,
        childId,
        challengeId: challenge.id
      };
    }

    // Check if we're within the challenge week
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(challenge.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + challenge.challengeDays); // 6 days
    
    // If challenge hasn't started yet, allow access but indicate it's not started
    if (today < startDate) {
      return {
        isValid: true, // Allow access to show message
        parentId,
        childId: challenge.childId,
        challengeId: challenge.id,
        challengeNotStarted: true,
        challengeStartDate: challenge.startDate
      };
    }
    
    if (today > endDate) {
      return {
        isValid: false,
        error: 'האתגר הסתיים. בדוק עם ההורה שלך.',
        parentId,
        childId,
        challengeId: challenge.id
      };
    }

    // Verify child matches challenge
    if (childId && challenge.childId !== childId) {
      return {
        isValid: false,
        error: 'כתובת לא תקינה עבור ילד זה',
        parentId,
        childId,
        challengeId: challenge.id
      };
    }

    return {
      isValid: true,
      parentId,
      childId: challenge.childId,
      challengeId: challenge.id
    };
  } catch (error) {
    console.error('Error validating upload URL:', error);
    return {
      isValid: false,
      error: 'שגיאה בבדיקת הכתובת. נסה שוב.',
      parentId,
      childId
    };
  }
}

/**
 * Validate redemption URL - one-time, once redeemed, session is over
 * Redemption is complete when challenge is no longer active or redemption has been processed
 */
export async function validateRedemptionUrl(token: string): Promise<UrlValidationResult> {
  const decoded = decodeParentToken(token);
  
  if (!decoded) {
    return {
      isValid: false,
      error: 'כתובת לא תקינה'
    };
  }

  const { parentId, childId } = decoded;

  try {
    // Check if there's an active challenge
    const challenge = await getActiveChallenge(parentId);
    
    if (!challenge) {
      return {
        isValid: false,
        error: 'אין אתגר פעיל. בדוק עם ההורה שלך.',
        parentId,
        childId
      };
    }

    // Check if challenge is still active (if not, redemption might have been completed)
    if (!challenge.isActive) {
      return {
        isValid: false,
        error: 'הפדיון הושלם כבר או שהאתגר לא פעיל.',
        parentId,
        childId: challenge.childId,
        challengeId: challenge.id
      };
    }

    // Check if we're at redemption day (Saturday) or after
    const today = new Date();
    const startDate = new Date(challenge.startDate);
    const redemptionDate = new Date(startDate);
    redemptionDate.setDate(startDate.getDate() + challenge.challengeDays); // Saturday (day 6)
    
    if (today < redemptionDate) {
      return {
        isValid: false,
        error: 'עדיין לא הגיע יום הפדיון. המשך להעלות תמונות.',
        parentId,
        childId: challenge.childId,
        challengeId: challenge.id
      };
    }

    // Check if redemption has been processed (challenge deactivated after redemption)
    // We can also check if there's a redemption record, but for now we'll use challenge.isActive
    // In a full implementation, you might have a separate redemption collection

    // Verify child matches challenge
    if (childId && challenge.childId !== childId) {
      return {
        isValid: false,
        error: 'כתובת לא תקינה עבור ילד זה',
        parentId,
        childId,
        challengeId: challenge.id
      };
    }

    return {
      isValid: true,
      parentId,
      childId: challenge.childId,
      challengeId: challenge.id
    };
  } catch (error) {
    console.error('Error validating redemption URL:', error);
    return {
      isValid: false,
      error: 'שגיאה בבדיקת הכתובת. נסה שוב.',
      parentId,
      childId
    };
  }
}

/**
 * Check if redemption has been completed
 * This can be used to mark redemption URL as used
 */
export async function isRedemptionCompleted(parentId: string): Promise<boolean> {
  try {
    const challenge = await getActiveChallenge(parentId);
    // If challenge is not active, redemption might be completed
    // In a full implementation, you might check a redemption collection
    return challenge ? !challenge.isActive : false;
  } catch (error) {
    console.error('Error checking redemption status:', error);
    return false;
  }
}

