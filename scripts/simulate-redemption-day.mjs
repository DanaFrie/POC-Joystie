/**
 * Simulation: משתמש שהגיע ליום הפדיון
 * כל השדות של ההורה והילד מלאים. האתגר התחיל לפני 6 ימים – היום יום הפדיון.
 * מקור נתונים אחד: challenge.weeklyUpload (עם processedData.minutesPerDay). אין weekUploads.
 * לוח הבקרה בונה את הגרף מהעלאה שבועית אחת (חלוקה לימים + אישור).
 *
 * Usage: node scripts/simulate-redemption-day.mjs
 *
 * דרוש .env.local עם:
 * - NEXT_PUBLIC_FIREBASE_API_KEY
 * - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
 * - NEXT_PUBLIC_FIREBASE_PROJECT_ID
 * - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
 * - NEXT_PUBLIC_FIREBASE_APP_ID
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env.local') });

const CLIENT_CONFIG = {
  token: { expirationDays: 14 },
  challenge: {
    totalWeeks: 4,
    challengeDays: 6,
    budgetDivision: 6,
    defaultDailyScreenTimeGoal: 2.5,
    defaultSelectedBudget: 100,
  },
};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

function getHebrewDayName(date) {
  const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  return dayNames[date.getDay()];
}

/** תאריך ההתחלה של האתגר = לפני 6 ימים (היום = יום הפדיון) */
function getChallengeStartDate() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(today.getDate() - 6);
  return start;
}

function encodeParentToken(parentId, childId, challengeId) {
  const expiresAt = Date.now() + CLIENT_CONFIG.token.expirationDays * 24 * 60 * 60 * 1000;
  const parts = [parentId, childId || '', challengeId || '', expiresAt.toString()];
  const compact = parts.join('|');
  return Buffer.from(compact, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function generateChildUrl(parentId, childId, challengeId, baseUrl = 'http://localhost:3000') {
  const token = encodeParentToken(parentId, childId, challengeId);
  return `${baseUrl}/child?token=${token}`;
}

async function main() {
  console.log('🚀 סימולציה: משתמש ביום הפדיון\n');
  console.log('תרחיש: הורה + ילד + אתגר ביום פדיון. נתוני השבוע ב-weeklyUpload (חלוקה לימים), ללא weekUploads.\n');
  console.log('='.repeat(50));

  const required = ['apiKey', 'authDomain', 'projectId', 'messagingSenderId', 'appId'];
  const missing = required.filter((k) => !firebaseConfig[k]);
  if (missing.length > 0) {
    console.error('❌ חסרים משתני סביבה:', missing.map((k) => `NEXT_PUBLIC_FIREBASE_${k}`).join(', '));
    process.exit(1);
  }

  console.log('\n📦 מאתחל Firebase...');
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const ts = Date.now();
  const testEmail = `redemption-${ts}@joystie-test.com`;
  const testPassword = 'TestPassword123!';

  try {
    // 1. הורה – כל השדות מהרשמה/אונבורדינג (ללא username)
    console.log('\n👤 יוצר משתמש הורה (כל השדות מההרשמה)...');
    const userCred = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    const userId = userCred.user.uid;

    const userData = {
      id: userId,
      email: testEmail.toLowerCase(),
      firstName: 'דנה',
      lastName: 'כהן',
      gender: 'female',
      kidsAges: ['8', '11'],
      notificationsEnabled: true,
      termsAccepted: true,
      signupDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', userId), userData);
    console.log('   ✅ הורה נוצר:', userData.firstName, userData.lastName, userData.email);

    // 2. ילד – כל השדות מ-setup (כינוי + יעדי חיסכון)
    console.log('\n👶 יוצר פרופיל ילד (כל השדות מ-setup)...');
    const childRef = doc(collection(db, 'children'));
    const childId = childRef.id;
    const childData = {
      id: childId,
      parentId: userId,
      name: 'יובל',
      age: '8',
      gender: 'boy',
      deviceType: 'ios',
      nickname: 'יובי',
      moneyGoals: ['אופניים', 'משחק'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(childRef, childData);
    console.log('   ✅ ילד נוצר:', childData.name, 'כינוי:', childData.nickname, 'יעדים:', childData.moneyGoals.join(', '));

    // 3. אתגר – התחיל לפני 6 ימים, היום = יום פדיון, פעיל ומוכן לפדיון
    const startDate = getChallengeStartDate();
    const selectedBudget = CLIENT_CONFIG.challenge.defaultSelectedBudget;
    const dailyBudget = selectedBudget / CLIENT_CONFIG.challenge.budgetDivision;
    const dailyScreenTimeGoal = CLIENT_CONFIG.challenge.defaultDailyScreenTimeGoal;

    // דקות ליום (שם יום בעברית -> דקות) – 6 ימי אתגר בלבד, מגרף שבועי אחד
    const minutesPerDay = {};
    for (let i = 0; i < CLIENT_CONFIG.challenge.challengeDays; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dayName = getHebrewDayName(d);
      // דוגמה: חלק עמדו ביעד (150 דק'), חלק חרגו
      const goalMins = dailyScreenTimeGoal * 60;
      minutesPerDay[dayName] = i < 3 ? Math.round(goalMins * 0.9) : Math.round(goalMins * 1.2);
    }
    const totalMinutes = Object.values(minutesPerDay).reduce((a, b) => a + b, 0);

    console.log('\n🎯 יוצר אתגר (התחלה:', formatDate(startDate), getHebrewDayName(startDate), ') – היום יום פדיון...');
    const challengeRef = doc(collection(db, 'challenges'));
    const challengeId = challengeRef.id;
    const challengeData = {
      id: challengeId,
      parentId: userId,
      childId,
      motivationReason: 'balance',
      selectedBudget,
      dailyBudget,
      dailyScreenTimeGoal,
      weekNumber: 1,
      totalWeeks: CLIENT_CONFIG.challenge.totalWeeks,
      challengeDays: CLIENT_CONFIG.challenge.challengeDays,
      startDate: startDate.toISOString(),
      isActive: true,
      consultationCompleted: true,
      // מקור יחיד: weeklyUpload (כולל שימוש פר יום). אין weekUploads.
      weeklyUpload: {
        screenshotUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'child',
        status: 'approved',
        processedData: {
          screenTimeMinutes: totalMinutes,
          minutesPerDay,
        },
        approvedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(challengeRef, challengeData);
    console.log('   ✅ אתגר נוצר (פעיל, weeklyUpload עם חלוקה לימים, אושר)');

    const childUrl = generateChildUrl(userId, childId, challengeId);
    console.log('\n' + '='.repeat(50));
    console.log('✅ סימולציה הושלמה בהצלחה\n');
    console.log('🔐 התחברות הורה (דשבורד):');
    console.log('   אימייל:', testEmail);
    console.log('   סיסמה:', testPassword);
    console.log('\n🔗 קישור לעמוד הילד (יום הפדיון):');
    console.log('   ', childUrl);
    console.log('');
  } catch (err) {
    console.error('\n❌ שגיאה:', err.message);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
