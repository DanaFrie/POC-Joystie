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
  weeklyUploadStatus?: 'none' | 'pending' | 'approved' | 'rejected'; // Weekly upload status
  isRedemptionDay?: boolean; // Whether today is the redemption day
};

/** Result for unified /child URL: one address for setup and redemption */
export type ChildUrlMode = 'setup' | 'redemption' | 'wait_redemption' | 'completed' | 'challenge_inactive' | 'error';

export type ValidateChildUrlResult = {
  mode: ChildUrlMode;
  isValid: boolean;
  error?: string;
  parentId?: string;
  childId?: string | null;
  challengeId?: string;
  challengeNotStarted?: boolean;
  challengeStartDate?: string;
  challengeIsActive?: boolean;
  weeklyUploadStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  isRedemptionDay?: boolean;
  /** For wait_redemption: days until redemption day */
  daysRemaining?: number;
  /** For wait_redemption / redemption: redemption date (day 7) */
  redemptionDate?: string;
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

    // Check if challenge has startDate (set by admin after consultation approval)
    if (!challenge.startDate) {
      // Challenge not started yet - consultation not approved
      return {
        isValid: true, // Allow access to show message
        parentId,
        childId: challenge.childId,
        challengeId: challenge.id,
        challengeNotStarted: true,
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
 * Validate redemption URL - available only on redemption day (day 7)
 * Includes single weekly upload flow
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
    if (!challenge.startDate) {
      return {
        isValid: false,
        error: 'האתגר עדיין לא התחיל. אנא המתן לאישור הייעוץ.',
        parentId,
        childId: challenge.childId,
        challengeId: challenge.id
      };
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(challenge.startDate);
    startDate.setHours(0, 0, 0, 0);
    const redemptionDate = new Date(startDate);
    redemptionDate.setDate(startDate.getDate() + challenge.challengeDays); // Day 7 (6 challenge days + redemption day)
    
    // Check if today is before redemption day
    if (today < redemptionDate) {
      // Calculate days remaining
      const daysRemaining = Math.ceil((redemptionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return {
        isValid: false,
        error: `עדיין לא הגיע יום הפדיון. נותרו ${daysRemaining} ימים.`,
        parentId,
        childId: challenge.childId,
        challengeId: challenge.id,
        isRedemptionDay: false
      };
    }
    
    // Check if today is exactly redemption day
    const isRedemptionDay = today.getTime() === redemptionDate.getTime();

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

    // Check weekly upload status
    const weeklyUploadStatus = challenge.weeklyUpload?.status || 'none';
    
    // If upload already exists and approved, allow viewing results
    // If upload exists and pending, show waiting for approval
    // If upload exists and rejected, allow re-upload
    // If no upload, allow uploading (only on redemption day)

    return {
      isValid: true,
      parentId,
      childId: challenge.childId,
      challengeId: challenge.id,
      isRedemptionDay,
      weeklyUploadStatus
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

/**
 * Validate unified /child URL and decide which flow to show:
 * - setup: child has not completed setup (nickname + moneyGoals)
 * - redemption: setup done and today is redemption day (or after) → show redemption funnel
 * - wait_redemption: setup done but not yet redemption day → same link, explain that on day 7 they'll upload + redeem
 * - completed: challenge not active (redemption already done)
 * - challenge_inactive: challenge exists but not active (e.g. not started or already finished)
 * - error: invalid token, no challenge, etc.
 */
export async function validateChildUrl(token: string): Promise<ValidateChildUrlResult> {
  const decoded = decodeParentToken(token);

  if (!decoded) {
    return { mode: 'error', isValid: false, error: 'כתובת לא תקינה' };
  }
  if (decoded.isExpired) {
    return { mode: 'error', isValid: false, error: 'הקישור פג תוקף. בקש קישור חדש מההורה שלך.' };
  }

  const { parentId, childId: tokenChildId, challengeId: tokenChallengeId } = decoded;

  try {
    const challenge = await getActiveChallenge(parentId);

    if (!challenge) {
      return {
        mode: 'error',
        isValid: false,
        error: 'אין אתגר פעיל. בדוק עם ההורה שלך.',
        parentId,
        childId: tokenChildId
      };
    }

    const challengeId = challenge.id;
    const childIdToUse = tokenChildId || challenge.childId;

    if (!challenge.isActive) {
      return {
        mode: 'completed',
        isValid: true,
        parentId,
        childId: challenge.childId,
        challengeId,
        challengeIsActive: false
      };
    }

    // Challenge is active – check if setup is complete
    let setupComplete = false;
    if (childIdToUse) {
      try {
        const child = await getChild(childIdToUse);
        if (child && child.nickname && child.moneyGoals && child.moneyGoals.length > 0) {
          setupComplete = true;
        }
      } catch (e) {
        logger.error('Error checking child for setup:', e);
      }
    }

    if (!setupComplete) {
      // Show setup flow (same token valid for setup)
      if (tokenChallengeId && tokenChallengeId !== challengeId) {
        return {
          mode: 'error',
          isValid: false,
          error: 'כתובת לא תקינה עבור אתגר זה',
          parentId,
          childId: childIdToUse,
          challengeId
        };
      }
      return {
        mode: 'setup',
        isValid: true,
        parentId,
        childId: childIdToUse || undefined,
        challengeId,
        challengeNotStarted: !challenge.startDate,
        challengeStartDate: challenge.startDate,
        challengeIsActive: true
      };
    }

    // Setup complete – decide redemption vs wait_redemption
    if (!challenge.startDate) {
      return {
        mode: 'wait_redemption',
        isValid: true,
        parentId,
        childId: challenge.childId,
        challengeId,
        challengeNotStarted: true,
        challengeIsActive: true
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(challenge.startDate);
    startDate.setHours(0, 0, 0, 0);
    const redemptionDateObj = new Date(startDate);
    redemptionDateObj.setDate(startDate.getDate() + challenge.challengeDays);
    const redemptionDateStr = redemptionDateObj.toLocaleDateString('he-IL');

    if (today.getTime() < redemptionDateObj.getTime()) {
      const daysRemaining = Math.ceil((redemptionDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return {
        mode: 'wait_redemption',
        isValid: true,
        parentId,
        childId: challenge.childId,
        challengeId,
        challengeIsActive: true,
        daysRemaining,
        redemptionDate: redemptionDateStr
      };
    }

    // Today is redemption day or after – show redemption funnel
    const weeklyUploadStatus = challenge.weeklyUpload?.status || 'none';
    const isRedemptionDay = today.getTime() === redemptionDateObj.getTime();

    if (childIdToUse && challenge.childId !== childIdToUse) {
      return {
        mode: 'error',
        isValid: false,
        error: 'כתובת לא תקינה עבור ילד זה',
        parentId,
        childId: childIdToUse,
        challengeId
      };
    }
    if (tokenChallengeId && tokenChallengeId !== challengeId) {
      return {
        mode: 'error',
        isValid: false,
        error: 'כתובת לא תקינה עבור אתגר זה',
        parentId,
        childId: challenge.childId,
        challengeId
      };
    }

    return {
      mode: 'redemption',
      isValid: true,
      parentId,
      childId: challenge.childId,
      challengeId,
      challengeIsActive: true,
      weeklyUploadStatus,
      isRedemptionDay,
      redemptionDate: redemptionDateStr
    };
  } catch (error) {
    logger.error('Error in validateChildUrl:', error);
    return {
      mode: 'error',
      isValid: false,
      error: 'שגיאה בבדיקת הכתובת. נסה שוב.',
      parentId,
      childId: tokenChildId
    };
  }
}

