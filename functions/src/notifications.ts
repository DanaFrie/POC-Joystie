/**
 * Automated Email Notifications System
 * 
 * This module handles all automated email notifications for parents based on challenge events.
 * 
 * Notification Types:
 * 1. First day of challenge (7:08 AM)
 * 2. First upload - success (triggered on upload, one-time per challenge)
 * 3. First upload - failure (triggered on upload, one-time per challenge)
 * 4. Two pending approvals (8:48 PM daily, one-time)
 * 5. Missing uploads (7:07 AM daily, continues until first upload - success or failure)
 */

import * as admin from 'firebase-admin';
import { sendNotificationEmail } from './email';
import type { FirestoreChallenge, FirestoreDailyUpload, FirestoreUser, FirestoreChild } from './types';

// Lazy initialization of Firestore to avoid issues during code analysis
function getDb() {
  return admin.firestore();
}

// Helper: Get Hebrew day name
function getHebrewDayName(date: Date): string {
  const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  return dayNames[date.getDay()];
}

// Helper: Format date as DD/MM
function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

// Helper: Get parent pronouns based on gender
function getParentPronouns(gender: 'male' | 'female' | undefined): {
  you: string;
  continue: string;
  ready: string;
  do: string;
  return: string;
  talk: string;
  remind: string;
  his: string;
  together: string;
  know: string;
  suggest: string;
} {
  if (gender === 'male') {
    return {
      you: 'אתה',
      continue: 'ממשיך',
      ready: 'מוכן',
      do: 'תעשה',
      return: 'תחזור',
      talk: 'שוחח',
      remind: 'תזכיר',
      his: 'שלך',
      together: 'אתם יחד ואתם הולכים',
      know: 'מכיר',
      suggest: 'הציע'
    };
  }
  return {
    you: 'את',
    continue: 'ממשיכה',
    ready: 'מוכנה',
    do: 'תעשי',
    return: 'תחזרי',
    talk: 'שוחחי',
    remind: 'תזכירי',
    his: 'שלך',
    together: 'את יחד ואתן הולכות',
    know: 'מכירה',
    suggest: 'הציעי'
  };
}

// Helper: Get child pronouns based on gender
function getChildPronouns(gender: 'boy' | 'girl' | undefined): {
  him: string;
  her: string;
  his: string;
  he: string;
  she: string;
  with: string;
  himHer: string;
} {
  if (gender === 'girl') {
    return {
      him: 'לה',
      her: 'לה',
      his: 'שלה',
      he: 'היא',
      she: 'היא',
      with: 'איתה',
      himHer: 'אותה'
    };
  }
  return {
    him: 'לו',
    her: 'לו',
    his: 'שלו',
    he: 'הוא',
    she: 'הוא',
    with: 'איתו',
    himHer: 'אותו'
  };
}

// Helper: Get combined pronouns for parent and child
function getCombinedPronouns(
  parentGender: 'male' | 'female' | undefined,
  childGender: 'boy' | 'girl' | undefined
): {
  together: string;
  going: string;
} {
  // If both are same gender or at least one is male, use masculine plural
  if (parentGender === 'male' || (parentGender === 'female' && childGender === 'boy')) {
    return {
      together: 'אתם',
      going: 'הולכים'
    };
  }
  // If both are female
  return {
    together: 'אתן',
    going: 'הולכות'
  };
}

/**
 * Notification 1: First day of challenge (7:08 AM)
 */
export async function sendFirstDayNotification(
  challenge: FirestoreChallenge,
  parent: FirestoreUser,
  child: FirestoreChild,
  baseUrl: string
): Promise<void> {
  const childP = getChildPronouns(child.gender);
  const parentP = getParentPronouns(parent.gender);
  const combinedP = getCombinedPronouns(parent.gender, child.gender);
  const title = parent.firstName ? `${parent.firstName} - ${parent.username}` : parent.username;
  const content = `
    <p><strong>היום הראשון לאתגר מ-ת-ח-י-ל-י-ם-!</strong></p>
    <p>${parentP.talk} עם ${child.name} כבר הבוקר ו${parentP.remind} ${childP.him} ש${parentP.you} יחד ${childP.with} ו${combinedP.together} ${combinedP.going} להצליח.</p>
    <p>החל ממחר בבוקר, ${child.name} יוכל להעלות את הסטטוס ${childP.his} בקישור שקיבל ולהתחיל לצבור הצלחות!</p>
  `;
  
  await sendNotificationEmail(
    parent.email,
    title,
    content,
    undefined, // No button
    undefined,
    baseUrl
  );
}

/**
 * Notification 2: First upload - success
 */
export async function sendFirstUploadSuccessNotification(
  challenge: FirestoreChallenge,
  parent: FirestoreUser,
  child: FirestoreChild,
  baseUrl: string
): Promise<void> {
  const title = parent.firstName ? `${parent.firstName} - ${parent.username}` : parent.username;
  const content = `
    <p>וואו! ${child.name} העלה את הסטטוס היומי והתוצאה מפתיעה! רוצה לאשר את זה?</p>
  `;
  
  const dashboardUrl = `${baseUrl}/dashboard`;
  
  await sendNotificationEmail(
    parent.email,
    title,
    content,
    'לאישור בלוח הבקרה',
    dashboardUrl,
    baseUrl
  );
}

/**
 * Notification 3: First upload - failure
 */
export async function sendFirstUploadFailureNotification(
  challenge: FirestoreChallenge,
  parent: FirestoreUser,
  child: FirestoreChild,
  upload: FirestoreDailyUpload,
  baseUrl: string
): Promise<void> {
  const childP = getChildPronouns(child.gender);
  
  // Get the date of the upload (the day the child uploaded for)
  const uploadDate = new Date(upload.uploadedAt);
  const uploadDateStr = formatDate(uploadDate);
  const uploadDayName = getHebrewDayName(uploadDate);
  
  const parentP = getParentPronouns(parent.gender);
  const title = parent.firstName ? `${parent.firstName} - ${parent.username}` : parent.username;
  const content = `
    <p>התקבל סטטוס מ${child.name} עבור ${uploadDayName} (${uploadDateStr}). זה טבעי שלילד יהיה קשה להניח את הטלפון. רוב הניסיונות הראשונים יהיו לא פשוטים, אולי שווה לדבר איתו ולחשוב יחד איך מצליחים מחר?</p>
    <p><strong>טיפ:</strong> על פי איך ש${parentP.you} ${parentP.know} ${childP.himHer} - ${parentP.suggest} ל${child.name} רעיון למטרת החיסכון של הכסף.</p>
  `;
  
  await sendNotificationEmail(
    parent.email,
    title,
    content,
    undefined, // No button
    undefined,
    baseUrl
  );
}

/**
 * Notification 4: Two pending approvals (8:48 PM, one-time)
 */
export async function sendTwoPendingApprovalsNotification(
  challenge: FirestoreChallenge,
  parent: FirestoreUser,
  child: FirestoreChild,
  baseUrl: string
): Promise<void> {
  const childP = getChildPronouns(child.gender);
  
  const title = parent.firstName ? `${parent.firstName} - ${parent.username}` : parent.username;
  const content = `
    <p>שמנו לב של${child.name} נצברו כבר שני סטטוסים שממתינים לאישור שלך.</p>
    <p>עידוד קטן והתייחסות מצידך יכולים לגרום ${childP.him} לאמץ את ההרגל הזה.</p>
  `;
  
  const dashboardUrl = `${baseUrl}/dashboard`;
  
  await sendNotificationEmail(
    parent.email,
    title,
    content,
    'ללוח הבקרה',
    dashboardUrl,
    baseUrl
  );
}

/**
 * Notification 5: Missing uploads (7:07 AM, continues until first upload)
 * Different messages based on challenge day
 */
export async function sendMissingUploadNotification(
  challenge: FirestoreChallenge,
  parent: FirestoreUser,
  child: FirestoreChild,
  challengeDay: number, // Day 3, 4, 6, or 7
  baseUrl: string,
  uploadUrl: string
): Promise<void> {
  const childP = getChildPronouns(child.gender);
  
  const title = parent.firstName ? `${parent.firstName} - ${parent.username}` : parent.username;
  let content = '';
  
  if (challengeDay === 3) {
    content = `
      <p>היי ${parent.firstName || parent.username},</p>
      <p>שמנו לב שהיום לא התקבל דיווח מ${child.name}, טבעי שהמעבר יהיה צעד-צעד.</p>
      <p>מה אפשר לעשות? היום? - כלום, תני ${childP.him} את הזמן ומצאי זמן לדבר איתו כשיתאפשר.</p>
    `;
  } else if (challengeDay === 4) {
    content = `
      <p>בוקר טוב ${parent.firstName || parent.username}!</p>
      <p>גם אתמול לא התקבל דיווח מ${child.name}. זה טבעי שלילד יהיה קשה להניח את הטלפון. סביר מאוד שהניסיונות הראשונים יהיו לא פשוטים, אולי שווה לדבר איתו ולחשוב יחד איך מצליחים מחר? מה קשה ${childP.him}?</p>
    `;
  } else if (challengeDay === 6) {
    const tell = parent.gender === 'male' ? 'ספר' : 'ספרי';
    const youTry = parent.gender === 'male' ? 'אתה מנסה' : 'את מנסה';
    content = `
      <p>אם זה מנחם… גם לנו ההורים לפעמים קשה להניח את הטלפון, זה באמת לא פשוט 🥴😉 ${child.name} טרם עדכן את הסטטוסildP.his}… אולי כדאי להציע ${childP.him} לשלוח את הדיווח יחד בפעם הראשונה.</p>
      <p><strong>טיפ:</strong> ${tell} ${childP.him} מה עובד לך כש${youTry} לרכוש הרגל חדש.</p>
    `;
  } else if (challengeDay === 7) {
    // Helper verbs for "think" and "try to understand"
    const think = parent.gender === 'male' ? 'תחשוב' : 'תחשבי';
    const tryToUnderstand = parent.gender === 'male' ? 'נסה להבין' : 'נסי להבין';
    const understand = parent.gender === 'male' ? 'בוא נבין' : 'בואי נבין';
    const explain = parent.gender === 'male' ? 'הסבר' : 'הסבירי';
    content = `
      <p>מרימים משקולות? גם אצלנו ההורים לפעמים קשה להתמיד ביעדי הכושר שהגדרנו לעצמנו (מחר אנחנו בטוח קמים מוקדם לרוץ!) , אבל ${think} על זה: כל עוד אנחנו ממשיכים להתאמן - הגוף מתחזק לאט לאט, גם ל${child.name} יש את הקצב ${childP.his} - ${tryToUnderstand} איזו תוכנית אימון מתאימה ${childP.him}?</p>
      <p>אנחנו בונים כלכלה של קשב בה ילדים גדלים בסביבה מאוזנת - ${child.name} כבר חצי צעד בפנים, ${understand} מה יכול לעזור?</p>
      <p>ניתן להשתמש ביועץ הקשב שלנו לצורך זה - יכולים <a href="https://calendar.app.google/uZAZZk61eKmZtvmu8" style="color: #273143; text-decoration: underline; font-weight: 600;">ללחוץ כאן</a> ולקבוע <strong>התייעצות חינם</strong>.</p>
      <p>זה אומר שאם אין עדיין סטטוס צריך להוריד משקל בדרך לניצחון ${childP.his}.</p>
      <p><strong>טיפ:</strong> ${explain} ל${child.name} מה הWin-Win ${childP.his}! לדוגמא "גם פינית לעצמך זמן ביום לתחביבים אחרים, וגם יש לך כסף בכיס שהוא 'שלך' לגמרי".</p>
    `;
  }
  
  // Only show button for day 6
  const buttonText = challengeDay === 6 ? 'להעלאת דיווח' : undefined;
  const buttonUrl = challengeDay === 6 ? uploadUrl : undefined;
  
  await sendNotificationEmail(
    parent.email,
    title,
    content,
    buttonText,
    buttonUrl,
    baseUrl
  );
}

/**
 * Check if today is the first day of challenge
 */
function isFirstDayOfChallenge(challenge: FirestoreChallenge): boolean {
  const startDate = new Date(challenge.startDate);
  startDate.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return startDate.getTime() === today.getTime();
}

/**
 * Get current challenge day (1-7)
 */
function getCurrentChallengeDay(challenge: FirestoreChallenge): number {
  const startDate = new Date(challenge.startDate);
  startDate.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays + 1; // Day 1 is the first day
}

/**
 * Check if user has already received notification type
 * Store notification flags in challenge document or separate collection
 */
async function hasReceivedNotification(
  challengeId: string,
  notificationType: 'first_day' | 'first_upload_success' | 'first_upload_failure' | 'two_pending' | 'missing_upload'
): Promise<boolean> {
  const challengeRef = getDb().collection('challenges').doc(challengeId);
  const challengeDoc = await challengeRef.get();
  
  if (!challengeDoc.exists) {
    return false;
  }
  
  const data = challengeDoc.data();
  const notificationsSent = data?.notificationsSent || {};
  
  return notificationsSent[notificationType] === true;
}

/**
 * Mark notification as sent
 */
async function markNotificationSent(
  challengeId: string,
  notificationType: 'first_day' | 'first_upload_success' | 'first_upload_failure' | 'two_pending' | 'missing_upload'
): Promise<void> {
  const challengeRef = getDb().collection('challenges').doc(challengeId);
  await challengeRef.update({
    [`notificationsSent.${notificationType}`]: true,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

/**
 * Get all active challenges
 */
async function getActiveChallenges(): Promise<FirestoreChallenge[]> {
  const challengesRef = getDb().collection('challenges');
  const querySnapshot = await challengesRef
    .where('isActive', '==', true)
    .get();
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as FirestoreChallenge));
}

/**
 * Get user by ID
 */
async function getUserById(userId: string): Promise<FirestoreUser | null> {
  const userRef = getDb().collection('users').doc(userId);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    return null;
  }
  
  return {
    id: userDoc.id,
    ...userDoc.data()
  } as FirestoreUser;
}

/**
 * Get child by ID
 */
async function getChildById(childId: string): Promise<FirestoreChild | null> {
  const childRef = getDb().collection('children').doc(childId);
  const childDoc = await childRef.get();
  
  if (!childDoc.exists) {
    return null;
  }
  
  return {
    id: childDoc.id,
    ...childDoc.data()
  } as FirestoreChild;
}

/**
 * Get uploads for challenge
 */
async function getUploadsForChallenge(challengeId: string): Promise<FirestoreDailyUpload[]> {
  const uploadsRef = getDb().collection('daily_uploads');
  const querySnapshot = await uploadsRef
    .where('challengeId', '==', challengeId)
    .get();
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as FirestoreDailyUpload));
}

/**
 * Generate upload URL using the same encoding as the client
 */
export function generateUploadUrl(parentId: string, childId: string, challengeId: string, baseUrl: string): string {
  // Use the same encoding format as the client: base64url(parentId|childId|challengeId|expiresAt)
  const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days expiration
  const parts = [parentId, childId || '', challengeId || '', expiresAt.toString()];
  const compact = parts.join('|');
  const encoded = Buffer.from(compact)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  return `${baseUrl}/child/upload?token=${encoded}`;
}

/**
 * Main scheduled function - runs daily at 7:07, 7:08, and 20:48
 * Handles notifications 1, 4, and 5
 */
export async function processScheduledNotifications(baseUrl: string): Promise<void> {
  // Get current time in Asia/Jerusalem timezone
  const now = new Date();
  const jerusalemTime = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jerusalem',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(now);
  
  const hour = parseInt(jerusalemTime.find(part => part.type === 'hour')?.value || '0', 10);
  const minute = parseInt(jerusalemTime.find(part => part.type === 'minute')?.value || '0', 10);
  const timeStr = `${hour}:${String(minute).padStart(2, '0')}`;
  
  console.log(`[Notifications] Processing scheduled notifications at ${timeStr} (Asia/Jerusalem)`);
  
  // Get all active challenges
  const challenges = await getActiveChallenges();
  console.log(`[Notifications] Found ${challenges.length} active challenges`);
  
  for (const challenge of challenges) {
    try {
      // Get parent and child data
      const parent = await getUserById(challenge.parentId);
      const child = await getChildById(challenge.childId);
      
      if (!parent || !child) {
        console.warn(`[Notifications] Missing parent or child for challenge ${challenge.id}`);
        continue;
      }
      
      // Notification 1: First day of challenge (7:08 AM)
      if (timeStr === '7:08') {
        if (isFirstDayOfChallenge(challenge)) {
          const hasReceived = await hasReceivedNotification(challenge.id, 'first_day');
          if (!hasReceived) {
            console.log(`[Notifications] Sending first day notification for challenge ${challenge.id}`);
            await sendFirstDayNotification(challenge, parent, child, baseUrl);
            await markNotificationSent(challenge.id, 'first_day');
          }
        }
      }
      
      // Notification 4: Two pending approvals (20:48 PM, one-time)
      if (timeStr === '20:48') {
        const hasReceived = await hasReceivedNotification(challenge.id, 'two_pending');
        if (!hasReceived) {
          const uploads = await getUploadsForChallenge(challenge.id);
          const pendingApprovals = uploads.filter(u => 
            u.requiresApproval && (!u.parentAction || u.parentAction === null)
          );
          
          if (pendingApprovals.length >= 2) {
            console.log(`[Notifications] Sending two pending approvals notification for challenge ${challenge.id}`);
            await sendTwoPendingApprovalsNotification(challenge, parent, child, baseUrl);
            await markNotificationSent(challenge.id, 'two_pending');
          }
        }
      }
      
      // Notification 5: Missing uploads (7:07 AM, continues until first upload - success or failure)
      if (timeStr === '7:07') {
        // Check if first upload (success or failure) has already happened
        const hasFirstUploadSuccess = await hasReceivedNotification(challenge.id, 'first_upload_success');
        const hasFirstUploadFailure = await hasReceivedNotification(challenge.id, 'first_upload_failure');
        const hasFirstUpload = hasFirstUploadSuccess || hasFirstUploadFailure;
        
        // Only send if first upload (success or failure) hasn't happened yet
        if (!hasFirstUpload) {
          const challengeDay = getCurrentChallengeDay(challenge);
          
          // Only send on days 3, 4, 6, or 7
          // Day 3: child didn't upload day 1 (which could be uploaded on day 2)
          // Day 4: child didn't upload day 2 (which could be uploaded on day 3)
          // Day 6: child didn't upload day 4 (which could be uploaded on day 5)
          // Day 7: child didn't upload day 5 (which could be uploaded on day 6)
          if (challengeDay === 3 || challengeDay === 4 || challengeDay === 6 || challengeDay === 7) {
            const uploadUrl = generateUploadUrl(challenge.parentId, challenge.childId, challenge.id, baseUrl);
            console.log(`[Notifications] Sending missing upload notification (day ${challengeDay}) for challenge ${challenge.id}`);
            await sendMissingUploadNotification(challenge, parent, child, challengeDay, baseUrl, uploadUrl);
          }
        }
      }
    } catch (error) {
      console.error(`[Notifications] Error processing challenge ${challenge.id}:`, error);
    }
  }
}

/**
 * Process upload notification (triggered on upload creation)
 * Handles notifications 2 and 3
 */
export async function processUploadNotification(
  upload: FirestoreDailyUpload,
  baseUrl: string
): Promise<void> {
  console.log(`[Notifications] Processing upload notification for upload ${upload.id}`);
  
  try {
    // Get challenge, parent, and child data
    const challengeRef = getDb().collection('challenges').doc(upload.challengeId);
    const challengeDoc = await challengeRef.get();
    
    if (!challengeDoc.exists) {
      console.warn(`[Notifications] Challenge ${upload.challengeId} not found`);
      return;
    }
    
    const challenge = {
      id: challengeDoc.id,
      ...challengeDoc.data()
    } as FirestoreChallenge;
    
    const parent = await getUserById(upload.parentId);
    const child = await getChildById(upload.childId);
    
    if (!parent || !child) {
      console.warn(`[Notifications] Missing parent or child for upload ${upload.id}`);
      return;
    }
    
    // Check if this is the first upload (success or failure)
    // Each type (success/failure) can be sent once per challenge
    if (upload.success) {
      // Notification 2: First upload - success (one-time per challenge)
      const hasReceived = await hasReceivedNotification(challenge.id, 'first_upload_success');
      if (!hasReceived) {
        console.log(`[Notifications] Sending first upload success notification for challenge ${challenge.id}`);
        await sendFirstUploadSuccessNotification(challenge, parent, child, baseUrl);
        await markNotificationSent(challenge.id, 'first_upload_success');
      }
    } else {
      // Notification 3: First upload - failure (one-time per challenge)
      const hasReceived = await hasReceivedNotification(challenge.id, 'first_upload_failure');
      if (!hasReceived) {
        console.log(`[Notifications] Sending first upload failure notification for challenge ${challenge.id}`);
        await sendFirstUploadFailureNotification(challenge, parent, child, upload, baseUrl);
        await markNotificationSent(challenge.id, 'first_upload_failure');
      }
    }
  } catch (error) {
    console.error(`[Notifications] Error processing upload notification:`, error);
  }
}

