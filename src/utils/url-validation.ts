// URL validation utilities for child pages
import { decodeParentToken } from './url-encoding';
import { getActiveChallenge } from '@/lib/api/challenges';
import { getChild } from '@/lib/api/children';
import { getUploadsByChallenge } from '@/lib/api/uploads';
import { createContextLogger } from './logger';

const logger = createContextLogger('URL Validation');

export type UrlValidationResult = {
  isValid: boolean;
  error?: string;
  parentId?: string;
  childId?: string | null;
  challengeId?: string;
  challengeNotStarted?: boolean;
  challengeStartDate?: string;
  challengeIsActive?: boolean; // Add flag to indicate if challenge is active
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

  // Check token expiration
  if (decoded.isExpired) {
    return {
      isValid: false,
      error: 'הקישור פג תוקף. בקש קישור חדש מההורה שלך.'
    };
  }

  const { parentId, childId, challengeId } = decoded;

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
            childId,
            challengeId: challengeId || undefined
          };
        }
      }
    } catch (error) {
      logger.error('Error checking child setup status:', error);
      // Continue validation even if check fails
    }
  }

  return {
    isValid: true,
    parentId,
    childId: childId || undefined,
    challengeId: challengeId || undefined
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

  // Check token expiration
  if (decoded.isExpired) {
    return {
      isValid: false,
      error: 'הקישור פג תוקף. בקש קישור חדש מההורה שלך.'
    };
  }

  const { parentId, childId, challengeId } = decoded;

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

    // Check if challenge is active - but allow access if there are days that need upload/approval
    // We'll check this after checking the date range

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
          challengeStartDate: challenge.startDate,
          challengeIsActive: challenge.isActive
        };
    }
    
    // Helper function to check if there are days that need upload/approval
    const checkDaysNeedingAction = async (): Promise<boolean> => {
      try {
        const { getDashboardData } = await import('@/lib/api/dashboard');
        const dashboardData = await getDashboardData(parentId);
        if (dashboardData && dashboardData.week) {
          // Get all non-redemption days (should be 6 days)
          const nonRedemptionDays = dashboardData.week.filter(day => !day.isRedemptionDay);
          
          // Check if all days are approved (success/warning with approved action)
          const allApproved = nonRedemptionDays.every(day => 
            (day.status === 'success' || day.status === 'warning') &&
            (day.parentAction === 'approved' || !day.requiresApproval)
          );
          
          // If all days are approved, no action needed
          if (allApproved && nonRedemptionDays.length === challenge.challengeDays) {
            return false;
          }
          
          // Check if there are days that need upload or approval
          const daysNeedingAction = nonRedemptionDays.filter(day => {
            // Days that need upload
            if (day.status === 'missing') return true;
            // Days that need approval
            if (day.status === 'awaiting_approval') return true;
            if (day.requiresApproval && !day.parentAction) return true;
            return false;
          });
          return daysNeedingAction.length > 0;
        }
      } catch (error) {
        logger.error('Error checking days status:', error);
      }
      return false;
    };

    // If challenge ended or is not active, check if there are days that still need upload/approval
    if (today > endDate || !challenge.isActive) {
      // First check if challenge is simply not active (faster check)
      if (!challenge.isActive) {
        // Challenge is not active - check quickly if there are pending uploads/approvals
        // Use a lightweight check instead of full dashboard load
        try {
          const uploads = await getUploadsByChallenge(challenge.id, parentId, undefined, true); // Use cache
          const hasPendingUploads = uploads.some(upload => 
            upload.requiresApproval && !upload.parentAction
          );
          
          if (!hasPendingUploads) {
            // No pending uploads, challenge is truly finished
            return {
              isValid: false,
              error: 'האתגר הושלם כבר. הפדיון בוצע והאתגר לא פעיל יותר.',
              parentId,
              childId,
              challengeId: challenge.id,
              challengeIsActive: false
            };
          }
          
          // Has pending uploads, allow access
          return {
            isValid: true,
            parentId,
            childId: challenge.childId,
            challengeId: challenge.id,
            challengeIsActive: false
          };
        } catch (error) {
          // Fallback to full check if lightweight check fails
          const hasDaysNeedingAction = await checkDaysNeedingAction();
          
          if (hasDaysNeedingAction) {
            return {
              isValid: true,
              parentId,
              childId: challenge.childId,
              challengeId: challenge.id,
              challengeIsActive: false
            };
          }
          
          return {
            isValid: false,
            error: 'האתגר לא פעיל. בדוק עם ההורה שלך.',
            parentId,
            childId,
            challengeId: challenge.id,
            challengeIsActive: false
          };
        }
      }
      
      // Challenge ended (past end date) - check if there are days that need action
      const hasDaysNeedingAction = await checkDaysNeedingAction();
      
      if (hasDaysNeedingAction) {
        // Allow access if there are days that need action
        return {
          isValid: true,
          parentId,
          childId: challenge.childId,
          challengeId: challenge.id,
          challengeIsActive: challenge.isActive
        };
      }
      
      // No days need action, challenge is truly finished
      return {
        isValid: false,
        error: today > endDate 
          ? 'האתגר הסתיים. בדוק עם ההורה שלך.'
          : 'האתגר לא פעיל. בדוק עם ההורה שלך.',
        parentId,
        childId,
        challengeId: challenge.id,
        challengeIsActive: false
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

    // Verify challengeId in token matches active challenge (if provided)
    if (challengeId && challenge.id !== challengeId) {
      return {
        isValid: false,
        error: 'כתובת לא תקינה עבור אתגר זה',
        parentId,
        childId: challenge.childId,
        challengeId: challenge.id
      };
    }

    // Check if all 6 challenge days are approved - if so, upload URL is no longer valid
    const hasDaysNeedingAction = await checkDaysNeedingAction();
    if (!hasDaysNeedingAction) {
      // All days are approved, no more uploads needed
      return {
        isValid: false,
        error: 'כל הימים של האתגר אושרו. אין עוד העלאות נדרשות.',
        parentId,
        childId: challenge.childId,
        challengeId: challenge.id,
        challengeIsActive: challenge.isActive
      };
    }

    return {
      isValid: true,
      parentId,
      childId: challenge.childId,
      challengeId: challenge.id,
      challengeIsActive: challenge.isActive
    };
  } catch (error) {
    logger.error('Error validating upload URL:', error);
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

  // Check token expiration
  if (decoded.isExpired) {
    return {
      isValid: false,
      error: 'הקישור פג תוקף. בקש קישור חדש מההורה שלך.'
    };
  }

  const { parentId, childId, challengeId } = decoded;

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

    // Check if we're at redemption day (day 7) or after
    const today = new Date();
    const startDate = new Date(challenge.startDate);
    const redemptionDate = new Date(startDate);
    redemptionDate.setDate(startDate.getDate() + challenge.challengeDays); // Day 7 (6 challenge days + 1 redemption day)
    
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

    // Verify challengeId in token matches active challenge (if provided)
    if (challengeId && challenge.id !== challengeId) {
      return {
        isValid: false,
        error: 'כתובת לא תקינה עבור אתגר זה',
        parentId,
        childId: challenge.childId,
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
    logger.error('Error validating redemption URL:', error);
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
    logger.error('Error checking redemption status:', error);
    return false;
  }
}

