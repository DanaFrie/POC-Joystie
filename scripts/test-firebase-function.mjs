/**
 * Test script to call the deployed Firebase Function
 * 
 * Usage: node scripts/test-firebase-function.mjs
 * 
 * Prerequisites:
 * 1. Set Firebase config in .env.local:
 *    - NEXT_PUBLIC_FIREBASE_API_KEY
 *    - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
 *    - NEXT_PUBLIC_FIREBASE_PROJECT_ID
 *    - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
 *    - NEXT_PUBLIC_FIREBASE_APP_ID
 * 
 * 2. Set test credentials in .env.local:
 *    - TEST_EMAIL=your-test-user@example.com
 *    - TEST_PASSWORD=your-password
 * 
 * 3. Optional: Set test image path:
 *    - TEST_IMAGE_PATH=path/to/test-image.jpg
 *    - TEST_TARGET_DAY=ראשון (default: ראשון)
 * 
 * Note: The test user must exist in Firebase Authentication.
 *       Create it in Firebase Console or via the app registration.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
config({ path: join(__dirname, '..', '.env.local') });

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate config
const required = ['apiKey', 'authDomain', 'projectId', 'messagingSenderId', 'appId'];
const missing = required.filter(key => !firebaseConfig[key]);
if (missing.length > 0) {
  console.error('❌ Missing Firebase environment variables:');
  missing.forEach(key => {
    console.error(`   - NEXT_PUBLIC_FIREBASE_${key.toUpperCase()}`);
  });
  console.error('\nPlease check your .env.local file.');
  process.exit(1);
}

async function testFirebaseFunction() {
  console.log('🚀 Testing Firebase Function: processScreenshot\n');
  console.log('='.repeat(60));

  try {
    // Initialize Firebase
    console.log('\n📦 Initializing Firebase...');
    console.log('   Project ID:', firebaseConfig.projectId);
    console.log('   Auth Domain:', firebaseConfig.authDomain);
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    
    // Initialize Functions with explicit region and project
    console.log('   Initializing Functions for region: us-central1');
    const functions = getFunctions(app, 'us-central1');

    // Authenticate (email/password required)
    console.log('\n🔐 Authenticating...');
    let user;
    
    const testEmail = process.env.TEST_EMAIL;
    const testPassword = process.env.TEST_PASSWORD;
    
    if (!testEmail || !testPassword) {
      console.error('\n❌ Authentication required!');
      console.error('   Please set TEST_EMAIL and TEST_PASSWORD in .env.local');
      console.error('   Example:');
      console.error('   TEST_EMAIL=test@example.com');
      console.error('   TEST_PASSWORD=your-password');
      console.error('\n   Or create a test user in Firebase Console and add credentials to .env.local');
      process.exit(1);
    }
    
    console.log(`   Using email: ${testEmail}`);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
      user = userCredential.user;
      console.log(`   ✅ Authenticated as: ${user.email || user.uid}`);
    } catch (authError) {
      if (authError.code === 'auth/user-not-found') {
        console.error('\n❌ User not found. Please create the user in Firebase Console first.');
        console.error('   Or use an existing user email/password.');
      } else if (authError.code === 'auth/wrong-password') {
        console.error('\n❌ Wrong password. Please check TEST_PASSWORD in .env.local');
      } else {
        console.error('\n❌ Authentication failed:', authError.message);
      }
      process.exit(1);
    }

    console.log('✅ Authenticated successfully');

    // Get the callable function
    console.log('\n📞 Getting callable function reference...');
    console.log('   Function name: processScreenshot');
    console.log('   Region: us-central1');
    console.log('   Project:', firebaseConfig.projectId);
    
    const processScreenshot = httpsCallable(functions, 'processScreenshot');

    // Prepare test data
    // Option 1: Use a test image file if provided
    let imageData;
    const testImagePath = process.env.TEST_IMAGE_PATH;
    
    if (testImagePath) {
      console.log(`\n📷 Loading test image from: ${testImagePath}`);
      try {
        const imageBuffer = readFileSync(testImagePath);
        imageData = imageBuffer.toString('base64');
        console.log(`   Image loaded: ${imageBuffer.length} bytes`);
      } catch (error) {
        console.error(`   ❌ Failed to load image: ${error.message}`);
        console.log('   Using placeholder base64 data...');
        // Use a minimal 1x1 pixel PNG as placeholder
        imageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      }
    } else {
      console.log('\n📷 Using placeholder base64 image data...');
      // Minimal 1x1 pixel PNG
      imageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    }

    const targetDay = process.env.TEST_TARGET_DAY || 'ראשון';
    
    console.log(`\n📤 Calling Firebase Function...`);
    console.log(`   Target day: ${targetDay}`);
    console.log(`   Image data size: ${imageData.length} characters (base64)`);
    console.log(`   Function: processScreenshot`);
    console.log(`   Region: us-central1`);

    const startTime = Date.now();

    // Call the function
    const result = await processScreenshot({
      imageData,
      targetDay,
    });

    const duration = Date.now() - startTime;

    console.log(`\n✅ Function call succeeded! (${duration}ms)`);
    console.log('\n📥 Response:');
    console.log(JSON.stringify(result.data, null, 2));

    // Sign out
    await auth.signOut();
    console.log('\n👋 Signed out');

  } catch (error) {
    console.error('\n❌ Error testing Firebase Function:');
    console.error('   Code:', error.code);
    console.error('   Message:', error.message);
    if (error.details) {
      console.error('   Details:', error.details);
    }
    process.exit(1);
  }
}

// Run the test
testFirebaseFunction();

