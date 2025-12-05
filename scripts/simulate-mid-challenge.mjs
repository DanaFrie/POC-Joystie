/**
 * Test script to simulate a parent and child in the middle of a challenge
 * Creates a challenge that started a few days ago with partial uploads
 * 
 * Usage: node scripts/simulate-mid-challenge.mjs
 * 
 * Make sure to set environment variables in .env.local:
 * - NEXT_PUBLIC_FIREBASE_API_KEY
 * - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
 * - NEXT_PUBLIC_FIREBASE_PROJECT_ID
 * - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
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
// Note: Only client config values are used in simulation scripts
const CLIENT_CONFIG = {
  token: {
    expirationDays: 14,
  },
  challenge: {
    totalWeeks: 4,
    challengeDays: 6,
    redemptionDay: 'saturday',
    budgetDivision: 6,
    defaultDailyScreenTimeGoal: 1.5,
    defaultSelectedBudget: 20,
  },
};

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
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
// Uses compact pipe-delimited format: parentId|childId|challengeId|expiresAt
// Note: In browser, this uses btoa/atob, but in Node.js we use Buffer
function encodeParentToken(parentId, childId, challengeId) {
  const expiresAt = Date.now() + (CLIENT_CONFIG.token.expirationDays * 24 * 60 * 60 * 1000);
  
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
  // Buffer.from().toString('base64') is equivalent to btoa() in browser
  const encoded = Buffer.from(compact, 'utf8').toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  return encoded;
}

// Helper to generate setup URL
// Note: challengeId is NOT included in setup URL to keep it shorter (not needed for setup)
function generateSetupUrl(parentId, childId, challengeId, baseUrl = 'http://localhost:3000') {
  // Setup URL doesn't need challengeId - it's only needed for upload/redemption
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
  console.log('🚀 Creating parent and child in the middle of a challenge\n');
  console.log('='.repeat(50));

  // Validate Firebase config
  const required = ['apiKey', 'authDomain', 'projectId', 'messagingSenderId', 'appId'];
  const missing = required.filter(key => !firebaseConfig[key]);
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:');
    missing.forEach(key => {
      console.error(`   - NEXT_PUBLIC_FIREBASE_${key.toUpperCase()}`);
    });
    console.error('\nPlease make sure .env.local file exists and contains all required variables.');
    process.exit(1);
  }

  // Initialize Firebase
  console.log('\n📦 Initializing Firebase...');
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  // Use fixed test user data (will be deleted and recreated each run)
  const testEmail = 'test-mid@joystie-test.com';
  const testPassword = 'TestPassword123!';
  const testUsername = 'testmid';
  const parentName = 'דנה';
  const childName = 'יובל';

  try {
    // Step 0: Delete existing test user if exists
    console.log('\n🗑️  Step 0: Deleting previous user (if exists)...');
    try {
      // Try to sign in with the test email
      const existingUserCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
      const existingUserId = existingUserCredential.user.uid;
      
      console.log(`   Found existing user (ID: ${existingUserId}), deleting...`);
      
      // Delete all related documents
      // 1. Find and delete all challenges
      const challengesQuery = query(collection(db, 'challenges'), where('parentId', '==', existingUserId));
      const challengesSnapshot = await getDocs(challengesQuery);
      const challengeIds = [];
      for (const challengeDoc of challengesSnapshot.docs) {
        challengeIds.push(challengeDoc.id);
        await deleteDoc(challengeDoc.ref);
      }
      console.log(`   ✅ Deleted ${challengesSnapshot.size} challenges`);
      
      // 2. Delete all uploads for those challenges
      if (challengeIds.length > 0) {
        const uploadsQuery = query(collection(db, 'daily_uploads'), where('parentId', '==', existingUserId));
        const uploadsSnapshot = await getDocs(uploadsQuery);
        for (const uploadDoc of uploadsSnapshot.docs) {
          await deleteDoc(uploadDoc.ref);
        }
        console.log(`   ✅ Deleted ${uploadsSnapshot.size} uploads`);
      }
      
      // 3. Find and delete all children (or clear their setup data)
      const childrenQuery = query(collection(db, 'children'), where('parentId', '==', existingUserId));
      const childrenSnapshot = await getDocs(childrenQuery);
      for (const childDoc of childrenSnapshot.docs) {
        // Clear setup data (nickname and moneyGoals) to allow setup URL to work again
        const childData = childDoc.data();
        if (childData.nickname || childData.moneyGoals) {
          await setDoc(childDoc.ref, {
            ...childData,
            nickname: null,
            moneyGoals: null,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
        await deleteDoc(childDoc.ref);
      }
      console.log(`   ✅ Deleted ${childrenSnapshot.size} children (and cleared setup data)`);
      
      // 4. Delete user document
      await deleteDoc(doc(db, 'users', existingUserId));
      console.log('   ✅ Deleted user document');
      
      // 5. Delete auth user
      await deleteUser(existingUserCredential.user);
      console.log('   ✅ Deleted Auth user');
      
    } catch (error) {
      // User doesn't exist or already deleted - that's fine
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        console.log('   ℹ️  No existing user found - proceeding with creation');
      } else {
        console.log(`   ⚠️  Error during deletion (continuing anyway): ${error.message}`);
      }
    }

    // Step 1: Create parent user
    console.log('\n👤 Step 1: Creating parent user...');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Username: ${testUsername}`);
    
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    const userId = userCredential.user.uid;
    console.log(`   ✅ User created successfully (ID: ${userId})`);

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
    console.log('   ✅ User data saved to Firestore');

    // Step 2: Create child profile
    console.log('\n👶 Step 2: Creating child profile...');
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
    console.log(`   ✅ Child profile created (ID: ${childId})`);

    // Step 3: Create challenge starting last week's Sunday
    console.log('\n🎯 Step 3: Creating challenge...');
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
    console.log(`   ✅ Challenge created (ID: ${challengeId})`);
    console.log(`   📅 Start date: ${formatDate(startDate)} (${getHebrewDayName(startDate.getDay())})`);
    console.log(`   💰 Daily budget: ${dailyBudget.toFixed(2)} ₪`);
    console.log(`   ⏰ Daily screen time goal: ${dailyScreenTimeGoal} hours`);

    // Step 4: Create uploads for past days (we're simulating mid-week of last week)
    console.log('\n📸 Step 4: Creating uploads for past days...\n');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log(`   📅 Challenge start date: ${formatDate(startDate)} (${getHebrewDayName(startDate.getDay())})`);
    console.log(`   📅 Today: ${formatDate(today)} (${getHebrewDayName(today.getDay())})`);
    console.log(`   💡 Challenge is from last week - all days have already passed\n`);

    // Define uploads for past days (always create for Sunday, Monday, Tuesday)
    // Sunday: approved, successful
    // Monday: approved, successful  
    // Tuesday: awaiting approval, successful
    // Wednesday, Thursday, Friday: missing (not uploaded yet)
    const uploads = [];
    
    // Sunday (day 0) - approved, successful
    const sundayDate = new Date(startDate);
    const screenTimeSunday = 2.5; // hours
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
    const screenTimeMonday = 2.8; // hours
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

    // Tuesday (day 2) - awaiting approval, successful
    const tuesdayDate = new Date(startDate);
    tuesdayDate.setDate(startDate.getDate() + 2);
    const screenTimeTuesday = 2.9; // hours
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
      parentAction: null, // Awaiting approval
      uploadedAt: uploadDateTuesday.toISOString(),
    });

    // Create upload documents
    for (const upload of uploads) {
      const uploadData = {
        challengeId: challengeId,
        parentId: userId,
        childId: childId,
        date: upload.date,
        dayName: upload.dayName,
        screenTimeUsed: upload.screenTimeHours,
        screenTimeGoal: dailyScreenTimeGoal,
        coinsEarned: upload.coinsEarned,
        coinsMaxPossible: dailyBudget,
        success: upload.success,
        requiresApproval: true,
        parentAction: upload.parentAction,
        uploadedAt: upload.uploadedAt,
        createdAt: upload.uploadedAt,
        updatedAt: upload.uploadedAt,
      };

      const uploadRef = doc(collection(db, 'daily_uploads'));
      await setDoc(uploadRef, {
        id: uploadRef.id,
        ...uploadData,
      });

      const status = upload.parentAction === 'approved' ? '✅ Approved' : '⏳ Awaiting approval';
      console.log(`   ${status} - ${upload.dayName} ${upload.date}: ${upload.screenTimeHours} hours, ${upload.coinsEarned.toFixed(2)} ₪`);
    }

    // Show summary
    console.log('\n\n📊 Summary:');
    console.log('='.repeat(50));
    console.log(`   👤 Parent: ${parentName} (${testEmail})`);
    console.log(`   👶 Child: ${childName}`);
    console.log(`   🎯 Challenge ID: ${challengeId}`);
    console.log(`   📅 Start date: ${formatDate(startDate)} (${getHebrewDayName(startDate.getDay())})`);
    console.log(`   📅 Today: ${formatDate(today)} (${getHebrewDayName(today.getDay())})`);
    console.log(`   📸 Uploads created: ${uploads.length}`);
    console.log(`   ✅ Approved: ${uploads.filter(u => u.parentAction === 'approved').length}`);
    console.log(`   ⏳ Awaiting approval: ${uploads.filter(u => u.parentAction === null).length}`);
    
    // Calculate total coins from approved uploads
    const totalCoins = uploads
      .filter(u => u.parentAction === 'approved')
      .reduce((sum, u) => sum + u.coinsEarned, 0);
    console.log(`   💰 Total approved coins: ${totalCoins.toFixed(2)} ₪`);

    // Generate URLs for child
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const setupUrl = generateSetupUrl(userId, childId, challengeId, baseUrl);
    const uploadUrl = generateUploadUrl(userId, childId, challengeId, baseUrl);

    console.log('\n✅ Simulation completed successfully!');
    console.log(`\n📋 User Information:`);
    console.log('='.repeat(50));
    console.log(`   👤 Parent Name: ${parentName}`);
    console.log(`   📧 Email: ${testEmail}`);
    console.log(`   🔑 Password: ${testPassword}`);
    console.log(`   🆔 User ID: ${userId}`);
    console.log(`\n👶 Child Information:`);
    console.log('='.repeat(50));
    console.log(`   👶 Child Name: ${childName}`);
    console.log(`   🆔 Child ID: ${childId}`);
    console.log(`\n🔗 URLs:`);
    console.log('='.repeat(50));
    console.log(`   📝 Setup URL (for child):`);
    console.log(`      ${setupUrl}`);
    console.log(`\n   📤 Upload URL (for child):`);
    console.log(`      ${uploadUrl}`);
    console.log(`\n📱 Testing Instructions:`);
    console.log('='.repeat(50));
    console.log(`   1. Login as parent with:`);
    console.log(`      Email: ${testEmail}`);
    console.log(`      Password: ${testPassword}`);
    console.log(`   2. Go to dashboard: ${baseUrl}/dashboard`);
    console.log(`   3. Challenge is from last week (all days have passed)`);
    console.log(`   4. Approved uploads: Sunday, Monday`);
    console.log(`   5. Upload awaiting approval: Tuesday`);
    console.log(`   6. Missing days: Wednesday, Thursday, Friday`);
    console.log(`   7. Use "Send Reminder" button - it will use the upload URL`);
    console.log(`   8. Child setup URL can be used to complete child setup`);
    console.log(`\n💡 On each run, the previous user will be deleted and recreated`);

  } catch (error) {
    console.error('\n❌ Error in simulation:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the simulation
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

