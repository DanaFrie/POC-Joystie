# מדריך הגדרה - התראות אימייל

מדריך זה מסביר איך להגדיר את כל השירותים הנדרשים להתראות אימייל.

## בחירת שירות אימייל

הקוד תומך בשני שירותים:

### 1. Google Workspace SMTP (מומלץ - ללא עלות נוספת)
- **מגבלה:** 500 אימיילים חיצוניים ביום
- **עלות:** כלול ב-Google Workspace Business
- **יתרונות:** ללא עלות נוספת, פשוט להגדרה

### 2. SendGrid API
- **מגבלה:** 100 אימיילים/יום (חינמי) או 50,000/חודש (Essentials - $19.95/חודש)
- **עלות:** חינמי או $19.95/חודש
- **יתרונות:** יותר אימיילים, analytics מתקדמים

---

## אופציה 1: Google Workspace SMTP (מומלץ - חינמי)

**חשוב:** אפשר להשתמש בחשבון קיים ב-Google Workspace - לא צריך ליצור משתמש חדש!

### שלב 1: בחירת חשבון קיים

בחרי חשבון קיים ב-Google Workspace (למשל החשבון המנהל או כל חשבון אחר):
- `info@joystie.com`
- `admin@joystie.com`
- או כל כתובת אחרת שכבר קיימת

**אין צורך ליצור משתמש חדש!**

### שלב 2: יצירת App Password

1. היכנסי לחשבון שבחרת (למשל `info@joystie.com`):
   - https://myaccount.google.com
   - התחברי עם החשבון הקיים

2. הפעילי 2-Factor Authentication (אם לא מופעל):
   - Security → 2-Step Verification → Get Started
   - עקבי אחרי ההוראות

3. צרי App Password:
   - https://myaccount.google.com/apppasswords
   - בחרי **Mail** ו-**Other (Custom name)**
   - הכניסי: `Joystie Firebase Functions`
   - לחצי **Generate**
   - **העתיקי את הסיסמה מיד** - לא תוכלי לראות אותה שוב!

### שלב 3: הגדרת Secrets ב-Firebase

1. פתחי Terminal/Command Prompt
2. התחברי ל-Firebase:
   ```bash
   firebase login
   ```

3. בחרי את הפרויקט:
   ```bash
   firebase use intgr  # לשלב Integration
   # או
   firebase use prod   # לשלב Production
   ```

4. הגדירי את השירות:
   ```bash
   firebase functions:secrets:set EMAIL_SERVICE
   ```
   - הכניסי: `workspace`
   - לחצי Enter

5. הגדירי את כתובת האימייל (החשבון הקיים שבחרת):
   ```bash
   firebase functions:secrets:set EMAIL_USER
   ```
   - הכניסי: `info@joystie.com` (או החשבון הקיים שבחרת)
   - לחצי Enter

6. (אופציונלי) הגדירי כתובת From שונה (לצורך הצגה):
   ```bash
   firebase functions:secrets:set EMAIL_FROM
   ```
   - הכניסי: `notifications@joystie.com` (זה מה שיוצג ב-From, אבל האימייל יישלח מהחשבון ב-EMAIL_USER)
   - לחצי Enter
   - **הערה:** אם לא תגדירי, יוצג `notifications@joystie.com` כברירת מחדל

7. הגדירי את ה-App Password:
   ```bash
   firebase functions:secrets:set EMAIL_PASSWORD
   ```
   - הדבקי את ה-App Password שיצרת
   - לחצי Enter

8. הגדירי את Base URL (לפי השלב):
   
   **לשלב Integration:**
   ```bash
   firebase functions:secrets:set BASE_URL
   ```
   - הכניסי: `https://integration.joystie.com` (או ה-URL של השלב שלך)
   
   **לשלב Production:**
   ```bash
   firebase functions:secrets:set BASE_URL
   ```
   - הכניסי: `https://joystie.com`

### שלב 4: התקנת Dependencies

```bash
cd functions
npm install
```

### שלב 5: Build ו-Deploy

```bash
# Build
npm run build

# Deploy כל הפונקציות
firebase deploy --only functions

# או deploy פונקציות ספציפיות:
firebase deploy --only functions:sendChallengeStartReminderScheduled
firebase deploy --only functions:sendMondayUploadReminderScheduled
```

---

## אופציה 2: SendGrid API

### שלב 1: הרשמה ל-SendGrid

1. היכנסי ל-https://sendgrid.com
2. הירשמי לחשבון (יש תוכנית חינמית עם 100 אימיילים ביום)
3. לאחר ההרשמה, עברי ל-Dashboard

### שלב 2: אימות דומיין ב-SendGrid

1. ב-SendGrid Dashboard:
   - לחצי על **Settings** (הגדרות) בתפריט השמאלי
   - לחצי על **Sender Authentication**
   - לחצי על **Domain Authentication**

2. הוספת דומיין:
   - לחצי על **Authenticate Your Domain**
   - בחרי **Google** כ-DNS Provider
   - הכניסי את הדומיין: `joystie.com`
   - לחצי **Next**

3. הוספת רשומות DNS:
   - SendGrid יציג לך רשומות DNS שצריך להוסיף
   - יש 3-4 רשומות CNAME להוספה
   - העתיקי את הרשומות

4. הוספת רשומות ב-Google Domains / Google Cloud DNS:
   
   **אם הדומיין ב-Google Domains:**
   - היכנסי ל-https://domains.google.com
   - בחרי את הדומיין `joystie.com`
   - לחצי על **DNS** בתפריט
   - לחצי על **Custom records**
   - הוסיפי כל רשומת CNAME שהעתקת מ-SendGrid
   - שמרי את השינויים

   **אם הדומיין ב-Google Cloud DNS:**
   - היכנסי ל-Google Cloud Console: https://console.cloud.google.com
   - חפשי **Cloud DNS** בחיפוש
   - בחרי את ה-Zone של `joystie.com`
   - לחצי על **Create Record Set**
   - הוסיפי כל רשומת CNAME שהעתקת מ-SendGrid
   - לחצי **Create**

5. אימות:
   - חזרי ל-SendGrid Dashboard
   - לחצי על **Verify** ב-Domain Authentication
   - המתני לאימות (יכול לקחת עד 48 שעות, בדרך כלל כמה דקות)

### שלב 3: יצירת API Key ב-SendGrid

1. ב-SendGrid Dashboard:
   - לחצי על **Settings** → **API Keys**
   - לחצי על **Create API Key**
   - תני שם: `Joystie Firebase Functions`
   - בחרי **Full Access** (או **Restricted Access** עם הרשאות לשליחת אימיילים)
   - לחצי **Create & View**
   - **העתיקי את ה-API Key מיד** - לא תוכלי לראות אותו שוב!

### שלב 4: הגדרת Secrets ב-Firebase

1. פתחי Terminal/Command Prompt
2. התחברי ל-Firebase:
   ```bash
   firebase login
   ```

3. בחרי את הפרויקט:
   ```bash
   firebase use intgr  # לשלב Integration
   # או
   firebase use prod   # לשלב Production
   ```

4. הגדירי את השירות:
   ```bash
   firebase functions:secrets:set EMAIL_SERVICE
   ```
   - הכניסי: `sendgrid`
   - לחצי Enter

5. הגדירי את ה-SendGrid API Key:
   ```bash
   firebase functions:secrets:set SENDGRID_API_KEY
   ```
   - הדבקי את ה-API Key שהעתקת מ-SendGrid
   - לחצי Enter

6. הגדירי את Base URL (לפי השלב):
   
   **לשלב Integration:**
   ```bash
   firebase functions:secrets:set BASE_URL
   ```
   - הכניסי: `https://integration.joystie.com` (או ה-URL של השלב שלך)
   
   **לשלב Production:**
   ```bash
   firebase functions:secrets:set BASE_URL
   ```
   - הכניסי: `https://joystie.com`

### שלב 5: התקנת Dependencies

```bash
cd functions
npm install
```

### שלב 6: Build ו-Deploy

```bash
# Build
npm run build

# Deploy כל הפונקציות
firebase deploy --only functions
```

---

## הגדרת Cloud Scheduler (אוטומטי)

הפונקציות המתוזמנות (`sendChallengeStartReminderScheduled` ו-`sendMondayUploadReminderScheduled`) יוצרות Cloud Scheduler jobs אוטומטית בעת ה-deploy.

אפשר גם לבדוק/לנהל אותם ב-Google Cloud Console:

1. היכנסי ל-Google Cloud Console: https://console.cloud.google.com
2. חפשי **Cloud Scheduler** בחיפוש
3. תראי שתי jobs:
   - `sendChallengeStartReminderScheduled` - רץ כל שבת ב-20:00
   - `sendMondayUploadReminderScheduled` - רץ כל יום שני ב-8:00

4. לבדיקת סטטוס:
   - לחצי על כל job
   - תראי את ההיסטוריה של הרצות
   - אפשר להריץ ידנית עם **RUN NOW**

## בדיקה

### בדיקת Email Service:

**עבור Google Workspace:**
- בדקי את ה-Logs ב-Firebase Functions
- נסי לשלוח אימייל ידנית דרך Cloud Scheduler → RUN NOW

**עבור SendGrid:**
1. ב-SendGrid Dashboard → **Activity**
2. תראי את כל האימיילים שנשלחו
3. אפשר לבדוק סטטוס delivery

### בדיקת Firebase Functions:
```bash
firebase functions:log
```

או ב-Google Cloud Console:
1. חפשי **Cloud Functions**
2. בחרי את הפונקציה
3. לחצי על **Logs**

### הרצה ידנית לבדיקה:

1. **להתראה בשבת 20:00:**
   ```bash
   # דרך Google Cloud Console → Cloud Scheduler → RUN NOW
   ```

2. **להתראה ביום שני 8:00:**
   ```bash
   # דרך Google Cloud Console → Cloud Scheduler → RUN NOW
   ```

## Troubleshooting

### אימיילים לא נשלחים:

1. **בדקי Secrets:**
   ```bash
   firebase functions:secrets:access EMAIL_SERVICE
   firebase functions:secrets:access EMAIL_USER  # עבור workspace
   firebase functions:secrets:access SENDGRID_API_KEY  # עבור sendgrid
   ```

2. **בדקי Logs:**
   ```bash
   firebase functions:log --only sendChallengeStartReminderScheduled
   ```

3. **עבור Google Workspace:**
   - ודאי ש-2FA מופעל על החשבון הקיים
   - ודאי שהשתמשת ב-App Password (לא סיסמה רגילה)
   - בדקי שהכתובת ב-EMAIL_USER קיימת ופועלת

4. **עבור SendGrid:**
   - בדקי ב-SendGrid Dashboard → Activity
   - ודאי שהדומיין מאומת

### Scheduled Functions לא רצות:

1. בדקי ב-Cloud Scheduler שהן מוגדרות
2. בדקי את ה-timezone: `Asia/Jerusalem`
3. בדקי את ה-cron schedule:
   - שבת 20:00: `0 20 * * 6`
   - יום שני 8:00: `0 8 * * 1`

## הגדרות חשובות

### כתובות אימייל:
- **From (הצגה):** `notifications@joystie.com` (מוגדר דרך EMAIL_FROM או ברירת מחדל)
- **From (שליחה בפועל):** החשבון הקיים ב-EMAIL_USER (למשל `info@joystie.com`)
- **Reply-To:** `info@joystie.com` (צריך ליצור בפועל אם רוצים לקבל replies)

**הערה חשובה:** האימייל יישלח מהחשבון ב-EMAIL_USER, אבל יוצג כ-`notifications@joystie.com` ב-From. זה מאפשר להשתמש בחשבון קיים ב-Google Workspace בלי ליצור משתמש חדש!

### Timezone:
- כל הפונקציות המתוזמנות מוגדרות ל-`Asia/Jerusalem`

### Integration vs Production:

**Integration:**
```bash
firebase use intgr
firebase functions:secrets:set BASE_URL
# הכניסי: https://integration.joystie.com
```

**Production:**
```bash
firebase use prod
firebase functions:secrets:set BASE_URL
# הכניסי: https://joystie.com
```

## סיכום - רשימת פעולות

### עבור Google Workspace (חינמי - משתמש קיים):
- [ ] בחירת חשבון קיים ב-Google Workspace (לא צריך ליצור חדש!)
- [ ] הפעלת 2FA על החשבון הקיים
- [ ] יצירת App Password
- [ ] הגדרת `EMAIL_SERVICE=workspace` ב-Firebase Secrets
- [ ] הגדרת `EMAIL_USER` ב-Firebase Secrets (החשבון הקיים)
- [ ] הגדרת `EMAIL_PASSWORD` ב-Firebase Secrets (App Password)
- [ ] (אופציונלי) הגדרת `EMAIL_FROM=notifications@joystie.com` ב-Firebase Secrets
- [ ] הגדרת `BASE_URL` ב-Firebase Secrets (לפי השלב)
- [ ] `npm install` ב-`functions/`
- [ ] `npm run build` ב-`functions/`
- [ ] `firebase deploy --only functions`
- [ ] בדיקה ב-Cloud Scheduler

### עבור SendGrid:
- [ ] הרשמה ל-SendGrid
- [ ] אימות דומיין `joystie.com` ב-SendGrid
- [ ] הוספת רשומות DNS ב-Google Domains/Cloud DNS
- [ ] יצירת API Key ב-SendGrid
- [ ] הגדרת `EMAIL_SERVICE=sendgrid` ב-Firebase Secrets
- [ ] הגדרת `SENDGRID_API_KEY` ב-Firebase Secrets
- [ ] הגדרת `BASE_URL` ב-Firebase Secrets (לפי השלב)
- [ ] `npm install` ב-`functions/`
- [ ] `npm run build` ב-`functions/`
- [ ] `firebase deploy --only functions`
- [ ] בדיקה ב-Cloud Scheduler

## תמיכה

אם יש בעיות:
1. בדקי את ה-Logs ב-Firebase Functions
2. בדקי את SendGrid Activity (אם משתמשת ב-SendGrid)
3. בדקי את Cloud Scheduler jobs
