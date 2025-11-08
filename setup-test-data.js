// Script to setup test data in localStorage
// Run this in the browser console on localhost:3000

(function() {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const lastSunday = new Date(today);
  lastSunday.setDate(today.getDate() - currentDay);
  
  const dayNames = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
  const week = [];
  
  // Screen time data from screenshot (2-5/11)
  const screenTimeDataFromScreenshot = {
    '02/11': { // Thursday - 1.8 hours from screenshot
      screenTime: 1.8,
      status: 'success',
      requiresApproval: false,
      parentAction: 'approved',
      screenshotUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+U2NyZWVuIFRpbWUgU2NyZWVuc2hvdDwvdGV4dD48L3N2Zz4=',
      apps: [
        { name: 'YouTube', timeUsed: 0.7, icon: '/youtube.png' },
        { name: 'TikTok', timeUsed: 0.5, icon: '/tiktok.png' },
        { name: 'Instagram', timeUsed: 0.6, icon: '/instagram.png' }
      ]
    },
    '03/11': { // Friday - no data
      screenTime: 0,
      status: 'missing',
      requiresApproval: false,
      parentAction: null,
      screenshotUrl: null,
      apps: []
    },
    '04/11': { // Saturday - no data
      screenTime: 0,
      status: 'missing',
      requiresApproval: false,
      parentAction: null,
      screenshotUrl: null,
      apps: []
    },
    '05/11': { // Sunday - no data
      screenTime: 0,
      status: 'missing',
      requiresApproval: false,
      parentAction: null,
      screenshotUrl: null,
      apps: []
    }
  };
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(lastSunday);
    day.setDate(lastSunday.getDate() + i);
    const dateStr = `${String(day.getDate()).padStart(2, '0')}/${String(day.getMonth() + 1).padStart(2, '0')}`;
    const dayName = dayNames[i];
    
    const screenTimeGoal = 3;
    const dailyBudget = 12.9;
    const hourlyRate = dailyBudget / screenTimeGoal;
    const isRedemptionDay = i === 5; // Friday
    
    // Check if this date matches screen time data from screenshot
    const screenshotData = screenTimeDataFromScreenshot[dateStr];
    
    let status, screenTimeUsed, coinsEarned, requiresApproval, parentAction, screenshotUrl, apps;
    
    if (screenshotData) {
      // Use data from screenshot
      screenTimeUsed = screenshotData.screenTime;
      status = screenshotData.status;
      requiresApproval = screenshotData.requiresApproval;
      parentAction = screenshotData.parentAction;
      screenshotUrl = screenshotData.screenshotUrl;
      apps = screenshotData.apps;
      
      if (screenTimeUsed > 0) {
        coinsEarned = screenTimeUsed * hourlyRate;
      } else {
        coinsEarned = 0;
      }
    } else {
      // Generate default data for other days
      // Set different statuses for different days
      if (i === 0) {
      // Sunday - Approved, goal met
      status = 'success';
      screenTimeUsed = 2.5;
      coinsEarned = screenTimeUsed * hourlyRate;
      requiresApproval = false;
      parentAction = 'approved';
      screenshotUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjMzMzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+U2NyZWVuc2hvdCAxPC90ZXh0Pjwvc3ZnPg==';
      apps = [
        { name: 'YouTube', timeUsed: screenTimeUsed * 0.4, icon: '/youtube.png' },
        { name: 'TikTok', timeUsed: screenTimeUsed * 0.3, icon: '/tiktok.png' },
        { name: 'Instagram', timeUsed: screenTimeUsed * 0.3, icon: '/instagram.png' }
      ];
    } else if (i === 1) {
      // Monday - Approved, goal not met
      status = 'warning';
      screenTimeUsed = 3.5;
      coinsEarned = Math.max(0, (screenTimeGoal - (screenTimeUsed - screenTimeGoal)) * hourlyRate);
      requiresApproval = false;
      parentAction = 'approved';
      screenshotUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjMzMzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+U2NyZWVuc2hvdCAyPC90ZXh0Pjwvc3ZnPg==';
      apps = [
        { name: 'YouTube', timeUsed: screenTimeUsed * 0.4, icon: '/youtube.png' },
        { name: 'TikTok', timeUsed: screenTimeUsed * 0.3, icon: '/tiktok.png' },
        { name: 'Instagram', timeUsed: screenTimeUsed * 0.3, icon: '/instagram.png' }
      ];
    } else if (i === 2) {
      // Tuesday - Needs approval
      status = 'awaiting_approval';
      screenTimeUsed = 2.8;
      coinsEarned = screenTimeUsed * hourlyRate;
      requiresApproval = true;
      parentAction = null;
      screenshotUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjMzMzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+U2NyZWVuc2hvdCAzPC90ZXh0Pjwvc3ZnPg==';
      apps = [
        { name: 'YouTube', timeUsed: screenTimeUsed * 0.4, icon: '/youtube.png' },
        { name: 'TikTok', timeUsed: screenTimeUsed * 0.3, icon: '/tiktok.png' },
        { name: 'Instagram', timeUsed: screenTimeUsed * 0.3, icon: '/instagram.png' }
      ];
    } else if (i === 3) {
      // Wednesday - Missing report
      status = 'missing';
      screenTimeUsed = 0;
      coinsEarned = 0;
      requiresApproval = false;
      parentAction = null;
      screenshotUrl = null;
      apps = [];
    } else if (i === 4) {
      // Thursday - Pending (today)
      status = 'pending';
      screenTimeUsed = 0;
      coinsEarned = 0;
      requiresApproval = false;
      parentAction = null;
      screenshotUrl = null;
      apps = [];
    } else if (i === 5) {
      // Friday - Redemption day (approved)
      status = 'success';
      screenTimeUsed = 2.2;
      coinsEarned = screenTimeUsed * hourlyRate;
      requiresApproval = false;
      parentAction = 'approved';
      screenshotUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjMzMzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+U2NyZWVuc2hvdCA0PC90ZXh0Pjwvc3ZnPg==';
      apps = [
        { name: 'YouTube', timeUsed: screenTimeUsed * 0.4, icon: '/youtube.png' },
        { name: 'TikTok', timeUsed: screenTimeUsed * 0.3, icon: '/tiktok.png' },
        { name: 'Instagram', timeUsed: screenTimeUsed * 0.3, icon: '/instagram.png' }
      ];
    } else {
      // Saturday - Future
      status = 'future';
      screenTimeUsed = 0;
      coinsEarned = 0;
      requiresApproval = false;
      parentAction = null;
      screenshotUrl = null;
      apps = [];
    }
    
    week.push({
      dayName,
      date: dateStr,
      status,
      coinsEarned: Math.round(coinsEarned * 10) / 10,
      screenTimeUsed: Math.round(screenTimeUsed * 10) / 10,
      screenTimeGoal: screenTimeGoal,
      isRedemptionDay,
      requiresApproval,
      parentAction,
      screenshotUrl,
      apps: apps || []
    });
  }
  
  // Calculate weekly totals
  const weeklyTotals = {
    coinsEarned: week.reduce((sum, day) => sum + day.coinsEarned, 0),
    coinsMaxPossible: 100,
    redemptionDate: week[5].date,
    redemptionDay: 'ו׳'
  };
  
  // Save to localStorage
  const dashboardData = {
    parent: { name: 'דנה', id: '123', googleAuth: {}, profilePicture: '/profile.jpg' },
    child: { name: 'יובל', id: '456', profilePicture: '/child.jpg' },
    challenge: {
      selectedBudget: 100,
      weeklyBudget: 90,
      dailyBudget: 12.9,
      dailyScreenTimeGoal: 3,
      penaltyRate: 10,
      weekNumber: 1,
      totalWeeks: 4,
      startDate: new Date().toISOString().split('T')[0],
      isActive: true
    },
    week: week,
    weeklyTotals: weeklyTotals
  };
  
  localStorage.setItem('dashboardTestData', JSON.stringify(dashboardData));
  
  // Add some test notifications
  const notifications = [
    {
      id: 'notif-1',
      type: 'upload_success',
      title: 'סטטוס יומי הועלה',
      message: 'איזה יופי! יובל העלה את הסטטוס היומי ועמד ביעד! 🥳 מזכירים שאתם נדרשים לאשר לפני הסיכום השבועי',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      read: false,
      dayDate: week[2].date,
      dayName: week[2].dayName
    },
    {
      id: 'notif-2',
      type: 'upload_exceeded',
      title: 'סטטוס יומי חרג מהיעד',
      message: 'נראה שיובל העלה נתונים שחורגים מהיעד. זו הזדמנות טובה לבדוק מה קרה.',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      read: false,
      dayDate: week[1].date,
      dayName: week[1].dayName
    },
    {
      id: 'notif-3',
      type: 'missing_report',
      title: 'בוקר טוב',
      message: `בוקר טוב. לא התקבל סטטוס מיובל עבור ${week[3].date}. זה טבעי שלילד יהיה קשה להניח את הטלפון. סביר מאוד הניסיונות הראשונים יהיו לא פשוטים, אולי שווה לדבר איתו ולחשוב יחד איך מצליחים מחר? טיפ:✨ הציעו לילד רעיון לתכלית של החיסכון הכספי לפי מה שאתם מכירים הכי טוב שיכול להתאים לו`,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      read: false,
      dayDate: week[3].date,
      dayName: week[3].dayName
    }
  ];
  
  localStorage.setItem('parentNotifications', JSON.stringify(notifications));
  
  console.log('✅ Test data setup complete!');
  console.log('Week data:', week);
  console.log('Notifications:', notifications);
  console.log('\n📋 Days status:');
  week.forEach(day => {
    console.log(`${day.dayName} ${day.date}: ${day.status}${day.isRedemptionDay ? ' (Redemption Day)' : ''}${day.requiresApproval ? ' (Needs Approval)' : ''}${day.parentAction ? ` (${day.parentAction})` : ''}`);
  });
  console.log('\n🔄 Please refresh the page to see the changes!');
})();

