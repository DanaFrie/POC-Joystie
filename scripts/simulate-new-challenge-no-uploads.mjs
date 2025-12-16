/**
 * Test script to simulate a new challenge setup (parent only)
 * Creates a challenge from a week before today - NO UPLOADS
 * Only the parent has set up the challenge, child hasn't uploaded anything yet
 * 
 * Usage: node scripts/simulate-new-challenge-no-uploads.mjs
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
    redemptionDay: 'saturday',
    budgetDivision: 6,
    defaultDailyScreenTimeGoal: 2.5, // Custom goal for this test
    defaultSelectedBudget: 80, // Custom budget for this test
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

async function main() {
  console.log('🚀 יצירת אתגר חדש - ללא העלאות\n');
  console.log('='.repeat(50));
  console.log('📋 תרחיש: ההורה הגדיר אתגר, הילד עדיין לא העלה כלום\n');

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
  const testEmail = 'test-new-challenge@joystie-test.com';
  const testPassword = 'TestPassword123!';
  const testUsername = 'testnewchallenge';
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
      redemptionDay: CLIENT_CONFIG.challenge.redemptionDay,
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

    // Show summary
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log('\n\n📊 סיכום:');
    console.log('='.repeat(50));
    console.log(`   👤 הורה: ${parentName} (${testEmail})`);
    console.log(`   👶 ילד: ${childName}`);
    console.log(`   🎯 אתגר ID: ${challengeId}`);
    console.log(`   📅 תאריך התחלה: ${formatDate(startDate)} (${getHebrewDayName(startDate.getDay())})`);
    console.log(`   📅 היום: ${formatDate(today)} (${getHebrewDayName(today.getDay())})`);
    console.log(`   📸 העלאות: 0 (אין העלאות - רק הגדרת אתגר)`);
    console.log(`   ⚠️  כל ימי האתגר כבר עברו - אין העלאות`);

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
    console.log(`   3. האתגר הוא משבוע שעבר (כל הימים כבר עברו)`);
    console.log(`   4. אין העלאות כלל - רק הגדרת אתגר`);
    console.log(`   5. כל 6 ימי האתגר חסרים (ראשון-שישי)`);
    console.log(`   6. ניתן להשתמש בכפתור "שלח תזכורת" - ישתמש בכתובת העלאה`);
    console.log(`   7. כתובת הגדרת ילד יכולה לשמש להשלמת הגדרת הילד`);
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

