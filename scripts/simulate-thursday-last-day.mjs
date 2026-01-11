/**
 * Test script to simulate a challenge on Thursday - last day for upload
 * Creates a challenge from a week before today
 * We're on Thursday - one day left for upload (Friday)
 * Has uploads for Sunday, Monday, Tuesday, Wednesday - missing Thursday and Friday
 * 
 * Usage: node scripts/simulate-thursday-last-day.mjs
 * 
 * Make sure to set environment variables in .env.local:
 * - NEXT_PUBLIC_FIREBASE_API_KEY
 * - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
 * - NEXT_PUBLIC_FIREBASE_PROJECT_ID
 * - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
 * - NEXT_PUBLIC_FIREBASE_APP_ID
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env.local') });

// App configuration (matches src/config/client.config.ts)
const CLIENT_CONFIG = {
  token: {
    expirationDays: 14,
  },
  challenge: {
    totalWeeks: 4,
    challengeDays: 6,
    budgetDivision: 6,
    defaultDailyScreenTimeGoal: 2.0, // Custom goal for this test
    defaultSelectedBudget: 90, // Custom budget for this test
  },
};

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Helper to format date as DD/MM
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

// Helper to get Hebrew day name
function getHebrewDayName(dayIndex) {
  const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  return dayNames[dayIndex];
}

// Helper to encode parent token (matches src/utils/url-encoding.ts)
function encodeParentToken(parentId, childId, challengeId) {
  const expiresAt = Date.now() + (CLIENT_CONFIG.token.expirationDays * 24 * 60 * 60 * 1000);
  
  const parts = [
    parentId,
    childId || '',
    challengeId || '',
    expiresAt.toString()
  ];
  
  const compact = parts.join('|');
  const encoded = Buffer.from(compact, 'utf8').toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  return encoded;
}

// Helper to generate setup URL
function generateSetupUrl(parentId, childId, challengeId, baseUrl = 'http://localhost:3000') {
  const token = encodeParentToken(parentId, childId, undefined);
  return `${baseUrl}/child/setup?token=${token}`;
}

// Helper to generate upload URL
function generateUploadUrl(parentId, childId, challengeId, baseUrl = 'http://localhost:3000') {
  const token = encodeParentToken(parentId, childId, challengeId);
  return `${baseUrl}/child/upload?token=${token}`;
}

// Helper to get last week's Sunday (7 days ago)
function getLastWeekSunday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
  const daysToSubtract = dayOfWeek === 0 ? 7 : dayOfWeek + 7; // Always go back to last week
  const lastWeekSunday = new Date(today);
  lastWeekSunday.setDate(today.getDate() - daysToSubtract);
  return lastWeekSunday;
}

// Helper to calculate coins earned
// Matches the logic in src/app/child/upload/page.tsx
function calculateCoins(screenTimeUsed, screenTimeGoal, dailyBudget) {
  const success = screenTimeUsed <= screenTimeGoal;
  const coinsMaxPossible = dailyBudget;
  
  let coinsEarned;
  if (success) {
    // If goal met: full daily budget
    coinsEarned = coinsMaxPossible;
  } else {
    // If not met: proportional reduction
    coinsEarned = Math.max(0, coinsMaxPossible * (1 - (screenTimeUsed - screenTimeGoal) / screenTimeGoal));
  }
  
  return {
    coinsEarned: Math.round(coinsEarned * 10) / 10,
    success,
  };
}

async function main() {
  console.log('🚀 יצירת אתגר - יום חמישי (יום אחרון להעלאה)\n');
  console.log('='.repeat(50));
  console.log('📋 תרחיש: יום חמישי - נשאר יום אחד להעלאה (שישי)\n');
  console.log('📅 האתגר משבוע שעבר');
  console.log('✅ יש העלאות: ראשון, שני, שלישי, רביעי');
  console.log('❌ חסרות העלאות: חמישי, שישי\n');

  // Validate Firebase config
  const required = ['apiKey', 'authDomain', 'projectId', 'messagingSenderId', 'appId'];
  const missing = required.filter(key => !firebaseConfig[key]);
  if (missing.length > 0) {
    console.error('❌ חסרות משתני סביבה:');
    missing.forEach(key => {
      console.error(`   - NEXT_PUBLIC_FIREBASE_${key.toUpperCase()}`);
    });
    console.error('\nאנא ודא שקובץ .env.local קיים ומכיל את כל המשתנים הנדרשים.');
    process.exit(1);
  }

  // Initialize Firebase
  console.log('\n📦 מאתחל Firebase...');
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  // Use fixed test user data (will be deleted and recreated each run)
  const testEmail = 'test-thursday@joystie-test.com';
  const testPassword = 'TestPassword123!';
  const testUsername = 'testthursday';
  const parentName = 'דנה';
  const childName = 'יובל';

  try {
    // Step 0: Delete existing test user if exists
    console.log('\n🗑️  שלב 0: מוחק משתמש קיים (אם קיים)...');
    try {
      const existingUserCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
      const existingUserId = existingUserCredential.user.uid;
      
      console.log(`   נמצא משתמש קיים (ID: ${existingUserId}), מוחק...`);
      
      // Delete all related documents
      const challengesQuery = query(collection(db, 'challenges'), where('parentId', '==', existingUserId));
      const challengesSnapshot = await getDocs(challengesQuery);
      for (const challengeDoc of challengesSnapshot.docs) {
        await deleteDoc(challengeDoc.ref);
      }
      console.log(`   ✅ נמחקו ${challengesSnapshot.size} אתגרים`);
      
      const uploadsQuery = query(collection(db, 'daily_uploads'), where('parentId', '==', existingUserId));
      const uploadsSnapshot = await getDocs(uploadsQuery);
      for (const uploadDoc of uploadsSnapshot.docs) {
        await deleteDoc(uploadDoc.ref);
      }
      console.log(`   ✅ נמחקו ${uploadsSnapshot.size} העלאות`);
      
      const childrenQuery = query(collection(db, 'children'), where('parentId', '==', existingUserId));
      const childrenSnapshot = await getDocs(childrenQuery);
      for (const childDoc of childrenSnapshot.docs) {
        await deleteDoc(childDoc.ref);
      }
      console.log(`   ✅ נמחקו ${childrenSnapshot.size} ילדים`);
      
      // Delete notifications
      const notificationsQuery = query(collection(db, 'notifications'), where('parentId', '==', existingUserId));
      const notificationsSnapshot = await getDocs(notificationsQuery);
      for (const notificationDoc of notificationsSnapshot.docs) {
        await deleteDoc(notificationDoc.ref);
      }
      console.log(`   ✅ נמחקו ${notificationsSnapshot.size} התראות`);
      
      // Delete sessions
      const sessionsQuery = query(collection(db, 'sessions'), where('userId', '==', existingUserId));
      const sessionsSnapshot = await getDocs(sessionsQuery);
      for (const sessionDoc of sessionsSnapshot.docs) {
        await deleteDoc(sessionDoc.ref);
      }
      console.log(`   ✅ נמחקו ${sessionsSnapshot.size} סשנים`);
      
      await deleteDoc(doc(db, 'users', existingUserId));
      console.log('   ✅ נמחק מסמך משתמש');
      
      await deleteUser(existingUserCredential.user);
      console.log('   ✅ נמחק משתמש Auth');
      
    } catch (error) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        console.log('   ℹ️  לא נמצא משתמש קיים - ממשיך ביצירה');
      } else {
        console.log(`   ⚠️  שגיאה במחיקה (ממשיך בכל זאת): ${error.message}`);
      }
    }

    // Step 1: Create parent user
    console.log('\n👤 שלב 1: יוצר משתמש הורה...');
    console.log(`   אימייל: ${testEmail}`);
    console.log(`   שם משתמש: ${testUsername}`);
    
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    const userId = userCredential.user.uid;
    console.log(`   ✅ משתמש נוצר בהצלחה (ID: ${userId})`);

    // Create user document in Firestore
    const userData = {
      id: userId,
      username: testUsername.toLowerCase(),
      email: testEmail.toLowerCase(),
      firstName: parentName,
      lastName: 'כהן',
      gender: 'female',
      kidsAges: ['8'],
      notificationsEnabled: true,
      termsAccepted: true,
      signupDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', userId), userData);
    console.log('   ✅ נתוני משתמש נשמרו ב-Firestore');

    // Step 2: Create child profile
    console.log('\n👶 שלב 2: יוצר פרופיל ילד...');
    const childData = {
      parentId: userId,
      name: childName,
      age: '8',
      gender: 'boy',
      deviceType: 'ios',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const childRef = doc(collection(db, 'children'));
    const childId = childRef.id;
    await setDoc(childRef, {
      id: childId,
      ...childData,
    });
    console.log(`   ✅ פרופיל ילד נוצר (ID: ${childId})`);

    // Step 3: Create challenge starting last week's Sunday
    console.log('\n🎯 שלב 3: יוצר אתגר...');
    const startDate = getLastWeekSunday();
    const selectedBudget = CLIENT_CONFIG.challenge.defaultSelectedBudget;
    const dailyBudget = selectedBudget / CLIENT_CONFIG.challenge.budgetDivision;
    const dailyScreenTimeGoal = CLIENT_CONFIG.challenge.defaultDailyScreenTimeGoal;

    const challengeData = {
      parentId: userId,
      childId: childId,
      motivationReason: 'balance',
      selectedBudget: selectedBudget,
      dailyBudget: dailyBudget,
      dailyScreenTimeGoal: dailyScreenTimeGoal,
      weekNumber: 1,
      totalWeeks: CLIENT_CONFIG.challenge.totalWeeks,
      startDate: startDate.toISOString(),
      challengeDays: CLIENT_CONFIG.challenge.challengeDays,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const challengeRef = doc(collection(db, 'challenges'));
    const challengeId = challengeRef.id;
    await setDoc(challengeRef, {
      id: challengeId,
      ...challengeData,
    });
    console.log(`   ✅ אתגר נוצר (ID: ${challengeId})`);
    console.log(`   📅 תאריך התחלה: ${formatDate(startDate)} (${getHebrewDayName(startDate.getDay())})`);
    console.log(`   💰 תקציב יומי: ${dailyBudget.toFixed(2)} ₪`);
    console.log(`   ⏰ יעד זמן מסך יומי: ${dailyScreenTimeGoal} שעות`);
    console.log(`   📊 תקציב שבועי: ${selectedBudget} ₪`);

    // Step 4: Create uploads for past days (Sunday, Monday, Tuesday, Wednesday)
    // We're simulating being on Thursday - so we have uploads for the first 4 days
    console.log('\n📸 שלב 4: יוצר העלאות לימים שעברו...\n');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log(`   📅 תאריך התחלת אתגר: ${formatDate(startDate)} (${getHebrewDayName(startDate.getDay())})`);
    console.log(`   📅 היום (חמישי): ${formatDate(today)} (${getHebrewDayName(today.getDay())})`);
    console.log(`   💡 האתגר משבוע שעבר - יש העלאות לראשון-רביעי, חסרות חמישי-שישי\n`);

    // Define uploads for past days
    // Sunday: approved, successful
    // Monday: approved, successful  
    // Tuesday: approved, successful
    // Wednesday: awaiting approval, successful
    // Thursday, Friday: missing (not uploaded yet)
    const uploads = [];
    
    // Sunday (day 0) - approved, successful
    const sundayDate = new Date(startDate);
    const screenTimeSunday = 1.8; // hours
    const { coinsEarned: coinsSunday, success: successSunday } = calculateCoins(screenTimeSunday, dailyScreenTimeGoal, dailyBudget);
    const uploadDateSunday = new Date(startDate);
    uploadDateSunday.setDate(startDate.getDate() + 1); // Uploaded on Monday
    uploadDateSunday.setHours(19, 0, 0, 0);
    
    uploads.push({
      date: formatDate(sundayDate),
      dayName: getHebrewDayName(0),
      screenTimeHours: screenTimeSunday,
      coinsEarned: coinsSunday,
      success: successSunday,
      parentAction: 'approved', // Already approved
      uploadedAt: uploadDateSunday.toISOString(),
    });

    // Monday (day 1) - approved, successful
    const mondayDate = new Date(startDate);
    mondayDate.setDate(startDate.getDate() + 1);
    const screenTimeMonday = 1.9; // hours
    const { coinsEarned: coinsMonday, success: successMonday } = calculateCoins(screenTimeMonday, dailyScreenTimeGoal, dailyBudget);
    const uploadDateMonday = new Date(startDate);
    uploadDateMonday.setDate(startDate.getDate() + 2); // Uploaded on Tuesday
    uploadDateMonday.setHours(18, 30, 0, 0);
    
    uploads.push({
      date: formatDate(mondayDate),
      dayName: getHebrewDayName(1),
      screenTimeHours: screenTimeMonday,
      coinsEarned: coinsMonday,
      success: successMonday,
      parentAction: 'approved', // Already approved
      uploadedAt: uploadDateMonday.toISOString(),
    });

    // Tuesday (day 2) - approved, successful
    const tuesdayDate = new Date(startDate);
    tuesdayDate.setDate(startDate.getDate() + 2);
    const screenTimeTuesday = 2.1; // hours (slightly over goal)
    const { coinsEarned: coinsTuesday, success: successTuesday } = calculateCoins(screenTimeTuesday, dailyScreenTimeGoal, dailyBudget);
    const uploadDateTuesday = new Date(startDate);
    uploadDateTuesday.setDate(startDate.getDate() + 3); // Uploaded on Wednesday
    uploadDateTuesday.setHours(17, 0, 0, 0);
    
    uploads.push({
      date: formatDate(tuesdayDate),
      dayName: getHebrewDayName(2),
      screenTimeHours: screenTimeTuesday,
      coinsEarned: coinsTuesday,
      success: successTuesday,
      parentAction: 'approved', // Already approved
      uploadedAt: uploadDateTuesday.toISOString(),
    });

    // Wednesday (day 3) - awaiting approval, successful
    const wednesdayDate = new Date(startDate);
    wednesdayDate.setDate(startDate.getDate() + 3);
    const screenTimeWednesday = 1.7; // hours
    const { coinsEarned: coinsWednesday, success: successWednesday } = calculateCoins(screenTimeWednesday, dailyScreenTimeGoal, dailyBudget);
    const uploadDateWednesday = new Date(startDate);
    uploadDateWednesday.setDate(startDate.getDate() + 4); // Uploaded on Thursday
    uploadDateWednesday.setHours(16, 30, 0, 0);
    
    uploads.push({
      date: formatDate(wednesdayDate),
      dayName: getHebrewDayName(3),
      screenTimeHours: screenTimeWednesday,
      coinsEarned: coinsWednesday,
      success: successWednesday,
      parentAction: null, // Awaiting approval
      uploadedAt: uploadDateWednesday.toISOString(),
    });

    // Create upload documents
    for (const upload of uploads) {
      // Convert hours to minutes for screenTimeMinutes
      const screenTimeMinutes = Math.round(upload.screenTimeHours * 60);
      
      const uploadData = {
        challengeId: challengeId,
        parentId: userId,
        childId: childId,
        date: upload.date,
        dayName: upload.dayName,
        screenTimeUsed: upload.screenTimeHours,
        screenTimeMinutes: screenTimeMinutes, // Add minutes for manual entry support
        screenTimeGoal: dailyScreenTimeGoal,
        coinsEarned: upload.coinsEarned,
        coinsMaxPossible: dailyBudget,
        success: upload.success,
        requiresApproval: upload.parentAction === null ? true : false, // Only require approval if not already approved
        parentAction: upload.parentAction,
        uploadedAt: upload.uploadedAt,
        createdAt: upload.uploadedAt,
        updatedAt: upload.uploadedAt,
      };
      
      // If already approved, set requiresApproval to false and add approvedAt
      if (upload.parentAction === 'approved') {
        uploadData.requiresApproval = false;
        uploadData.approvedAt = upload.uploadedAt; // Use uploadedAt as approvedAt for already approved uploads
      }

      const uploadRef = doc(collection(db, 'daily_uploads'));
      await setDoc(uploadRef, {
        id: uploadRef.id,
        ...uploadData,
      });

      const status = upload.parentAction === 'approved' ? '✅ מאושר' : '⏳ ממתין לאישור';
      console.log(`   ${status} - ${upload.dayName} ${upload.date}: ${upload.screenTimeHours} שעות, ${upload.coinsEarned.toFixed(2)} ₪`);
    }

    // Show summary
    console.log('\n\n📊 סיכום:');
    console.log('='.repeat(50));
    console.log(`   👤 הורה: ${parentName} (${testEmail})`);
    console.log(`   👶 ילד: ${childName}`);
    console.log(`   🎯 אתגר ID: ${challengeId}`);
    console.log(`   📅 תאריך התחלה: ${formatDate(startDate)} (${getHebrewDayName(startDate.getDay())})`);
    console.log(`   📅 היום (חמישי): ${formatDate(today)} (${getHebrewDayName(today.getDay())})`);
    console.log(`   📸 העלאות שנוצרו: ${uploads.length}`);
    console.log(`   ✅ מאושרות: ${uploads.filter(u => u.parentAction === 'approved').length}`);
    console.log(`   ⏳ ממתינות לאישור: ${uploads.filter(u => u.parentAction === null).length}`);
    console.log(`   ❌ חסרות: חמישי, שישי`);
    
    // Calculate total coins from approved uploads
    const totalCoins = uploads
      .filter(u => u.parentAction === 'approved')
      .reduce((sum, u) => sum + u.coinsEarned, 0);
    console.log(`   💰 סה"כ מטבעות מאושרים: ${totalCoins.toFixed(2)} ₪`);

    // Generate URLs for child
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const setupUrl = generateSetupUrl(userId, childId, challengeId, baseUrl);
    const uploadUrl = generateUploadUrl(userId, childId, challengeId, baseUrl);

    console.log('\n✅ סימולציה הושלמה בהצלחה!');
    console.log(`\n📋 פרטי משתמש:`);
    console.log('='.repeat(50));
    console.log(`   👤 שם הורה: ${parentName}`);
    console.log(`   📧 אימייל: ${testEmail}`);
    console.log(`   🔑 סיסמה: ${testPassword}`);
    console.log(`   🆔 User ID: ${userId}`);
    console.log(`\n👶 פרטי ילד:`);
    console.log('='.repeat(50));
    console.log(`   👶 שם ילד: ${childName}`);
    console.log(`   🆔 Child ID: ${childId}`);
    console.log(`\n🔗 כתובות:`);
    console.log('='.repeat(50));
    console.log(`   📝 כתובת הגדרה (לילד):`);
    console.log(`      ${setupUrl}`);
    console.log(`\n   📤 כתובת העלאה (לילד):`);
    console.log(`      ${uploadUrl}`);
    console.log(`\n📱 הוראות בדיקה:`);
    console.log('='.repeat(50));
    console.log(`   1. התחבר כהורה עם:`);
    console.log(`      אימייל: ${testEmail}`);
    console.log(`      סיסמה: ${testPassword}`);
    console.log(`   2. עבור לדשבורד: ${baseUrl}/dashboard`);
    console.log(`   3. האתגר הוא משבוע שעבר`);
    console.log(`   4. העלאות מאושרות: ראשון, שני, שלישי`);
    console.log(`   5. העלאה ממתינה לאישור: רביעי`);
    console.log(`   6. ימים חסרים: חמישי, שישי (נשאר יום אחד להעלאה)`);
    console.log(`   7. ניתן להשתמש בכפתור "שלח תזכורת" - ישתמש בכתובת העלאה`);
    console.log(`   8. כתובת הגדרת ילד יכולה לשמש להשלמת הגדרת הילד`);
    console.log(`\n💡 בכל הרצה, המשתמש הקודם יימחק וייווצר מחדש`);

  } catch (error) {
    console.error('\n❌ שגיאה בסימולציה:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the simulation
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

