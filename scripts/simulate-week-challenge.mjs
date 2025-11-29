/**
 * Test script to simulate a week of challenge activity
 * Simulates: registration -> challenge start -> screen time uploads throughout the week
 * 
 * Usage: node scripts/simulate-week-challenge.mjs
 * 
 * Make sure to set environment variables in .env.local:
 * - NEXT_PUBLIC_FIREBASE_API_KEY
 * - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
 * - NEXT_PUBLIC_FIREBASE_PROJECT_ID
 * - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
 * - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
 * - NEXT_PUBLIC_FIREBASE_APP_ID
 */

import readline from 'readline';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env.local') });

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Helper to wait for Enter key
function waitForEnter(message = 'לחץ Enter להמשך...') {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`\n${message}`, () => {
      rl.close();
      resolve();
    });
  });
}

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

// Helper to calculate next Sunday
function getNextSunday() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  const startDate = new Date(today);
  startDate.setDate(today.getDate() + daysUntilSunday);
  startDate.setHours(0, 0, 0, 0);
  return startDate;
}

// Helper to calculate coins earned
function calculateCoins(screenTimeUsed, screenTimeGoal, dailyBudget) {
  const success = screenTimeUsed <= screenTimeGoal;
  const hourlyRate = screenTimeGoal > 0 ? dailyBudget / screenTimeGoal : 0;
  
  let coinsEarned;
  if (success) {
    coinsEarned = screenTimeUsed * hourlyRate;
  } else {
    // Penalty for exceeding goal
    const excess = screenTimeUsed - screenTimeGoal;
    coinsEarned = Math.max(0, dailyBudget - (excess * hourlyRate));
  }
  
  return {
    coinsEarned: Math.round(coinsEarned * 10) / 10,
    success,
  };
}

async function main() {
  console.log('🚀 התחלת סימולציה של שבוע אתגר\n');
  console.log('='.repeat(50));

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

  // Generate unique test user data
  const timestamp = Date.now();
  const testEmail = `test-parent-${timestamp}@joystie-test.com`;
  const testPassword = 'TestPassword123!';
  const testUsername = `testuser${timestamp}`;
  const parentName = 'דנה';
  const childName = 'יובל';

  try {
    // Step 1: Create parent user
    console.log('\n👤 שלב 1: יצירת משתמש הורה...');
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

    await waitForEnter('לחץ Enter להמשך ליצירת פרופיל ילד...');

    // Step 2: Create child profile
    console.log('\n👶 שלב 2: יצירת פרופיל ילד...');
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

    await waitForEnter('לחץ Enter להמשך ליצירת אתגר...');

    // Step 3: Create challenge starting on Sunday
    console.log('\n🎯 שלב 3: יצירת אתגר...');
    const startDate = getNextSunday();
    const selectedBudget = 100;
    const weeklyBudget = selectedBudget; // Weekly budget equals selected budget (calculated, not saved to DB)
    const dailyBudget = selectedBudget / 6; // Divide selected budget by 6 days (Sunday-Friday)
    const dailyScreenTimeGoal = 3; // hours

    const challengeData = {
      parentId: userId,
      childId: childId,
      motivationReason: 'balance',
      selectedBudget: selectedBudget,
      dailyBudget: dailyBudget,
      dailyScreenTimeGoal: dailyScreenTimeGoal,
      weekNumber: 1,
      totalWeeks: 4,
      startDate: startDate.toISOString(),
      challengeDays: 6, // Sunday-Friday
      redemptionDay: 'saturday',
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

    await waitForEnter('לחץ Enter להמשך להעלאות זמני מסך...');

    // Step 4: Simulate screen time uploads throughout the week
    console.log('\n📸 שלב 4: סימולציה של העלאות זמני מסך...\n');
    console.log('💡 כל יום מדווח על היום הקודם (אתמול)\n');

    // Define upload schedule
    // Structure: { reportDay: day to report on, uploadDay: day when uploading, hour, screenTimeHours, isLate: boolean }
    // reportDay: 0 = Sunday, 1 = Monday, etc. (the day being reported)
    // uploadDay: 1 = Monday, 2 = Tuesday, etc. (the day when uploading)
    // Each day reports on the previous day (yesterday)
    const uploadSchedule = [
      // Monday reports on Sunday
      { reportDay: 0, uploadDay: 1, hour: 20, screenTimeHours: 2.5, isLate: false },
      // Tuesday should report on Monday - SKIPPED (will be reported later)
      // Wednesday should report on Tuesday - SKIPPED (will be reported later)
      // Thursday reports on Wednesday
      { reportDay: 3, uploadDay: 4, hour: 19, screenTimeHours: 2.9, isLate: false },
      // Friday reports on Thursday
      { reportDay: 4, uploadDay: 5, hour: 18, screenTimeHours: 3.2, isLate: false },
      // Friday also reports on Monday (late - making up for skipped Tuesday report)
      { reportDay: 1, uploadDay: 5, hour: 20, screenTimeHours: 2.7, isLate: true },
      // Saturday reports on Friday
      { reportDay: 5, uploadDay: 6, hour: 19, screenTimeHours: 2.3, isLate: false },
      // Saturday also reports on Tuesday (late - making up for skipped Wednesday report)
      { reportDay: 2, uploadDay: 6, hour: 21, screenTimeHours: 3.0, isLate: true },
    ];

    const weekDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    
    for (let i = 0; i < uploadSchedule.length; i++) {
      const schedule = uploadSchedule[i];

      // The date being reported (yesterday from upload day perspective)
      const reportedDate = new Date(startDate);
      reportedDate.setDate(startDate.getDate() + schedule.reportDay);
      
      // The date when uploading (today)
      const uploadDate = new Date(startDate);
      uploadDate.setDate(startDate.getDate() + schedule.uploadDay);
      uploadDate.setHours(schedule.hour, 0, 0, 0);

      const dateStr = formatDate(reportedDate);
      const reportedDayName = getHebrewDayName(reportedDate.getDay());
      const uploadDayName = getHebrewDayName(uploadDate.getDay());
      
      const { coinsEarned, success } = calculateCoins(
        schedule.screenTimeHours,
        dailyScreenTimeGoal,
        dailyBudget
      );

      console.log(`\n   📅 דיווח על: ${reportedDayName} ${dateStr}`);
      if (schedule.isLate) {
        console.log(`   ⚠️  דיווח מאוחר (הועלה ב-${uploadDayName})`);
      } else {
        console.log(`   📤 הועלה ב-${uploadDayName}`);
      }
      console.log(`   ⏰ שעת העלאה: ${schedule.hour}:00`);
      console.log(`   📊 זמן מסך: ${schedule.screenTimeHours} שעות`);
      console.log(`   🎯 יעד: ${dailyScreenTimeGoal} שעות`);
      console.log(`   ${success ? '✅' : '⚠️'} ${success ? 'עמד ביעד' : 'חרג מהיעד'}`);
      console.log(`   💰 מטבעות שנצברו: ${coinsEarned.toFixed(2)} ₪`);

      // Create upload document (without actual image processing)
      const uploadData = {
        challengeId: challengeId,
        parentId: userId,
        childId: childId,
        date: dateStr,
        dayName: reportedDayName,
        screenTimeUsed: schedule.screenTimeHours,
        screenTimeGoal: dailyScreenTimeGoal,
        coinsEarned: coinsEarned,
        coinsMaxPossible: dailyBudget,
        success: success,
        requiresApproval: true,
        parentAction: null,
        uploadedAt: uploadDate.toISOString(),
        createdAt: uploadDate.toISOString(),
        updatedAt: uploadDate.toISOString(),
      };

      const uploadRef = doc(collection(db, 'daily_uploads'));
      await setDoc(uploadRef, {
        id: uploadRef.id,
        ...uploadData,
      });

      console.log(`   ✅ העלאה נשמרה ב-Firestore (ID: ${uploadRef.id})`);

      // Wait for Enter between uploads (except for the last one)
      if (i < uploadSchedule.length - 1) {
        await waitForEnter('לחץ Enter להמשך להעלאה הבאה...');
      }
    }

    // Show summary
    console.log('\n\n📊 סיכום שבוע האתגר:');
    console.log('='.repeat(50));
    console.log(`   👤 הורה: ${parentName} (${testEmail})`);
    console.log(`   👶 ילד: ${childName}`);
    console.log(`   🎯 אתגר ID: ${challengeId}`);
    console.log(`   📅 תאריך התחלה: ${formatDate(startDate)}`);
    
    // Count unique reported days
    const reportedDays = new Set(uploadSchedule.map(u => u.reportDay));
    const lateReports = uploadSchedule.filter(u => u.isLate).length;
    console.log(`   📸 ימים שדווחו: ${reportedDays.size} מתוך 6 ימים`);
    console.log(`   ⚠️  דיווחים מאוחרים: ${lateReports} (שלישי ורביעי הושלמו מאוחר יותר)`);
    
    // Calculate total coins
    const totalCoins = uploadSchedule.reduce((sum, u) => {
      const { coinsEarned } = calculateCoins(u.screenTimeHours, dailyScreenTimeGoal, dailyBudget);
      return sum + coinsEarned;
    }, 0);
    console.log(`   💰 סה"כ מטבעות: ${totalCoins.toFixed(2)} ₪`);
    
    // Show which days were reported
    const reportedDaysList = Array.from(reportedDays).sort();
    const reportedDaysNames = reportedDaysList.map(day => weekDays[day]).join(', ');
    console.log(`   📋 ימים שדווחו: ${reportedDaysNames}`);

    console.log('\n✅ סימולציה הושלמה בהצלחה!');
    console.log(`\n💡 פרטי התחברות לבדיקה:`);
    console.log(`   אימייל: ${testEmail}`);
    console.log(`   סיסמה: ${testPassword}`);

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

