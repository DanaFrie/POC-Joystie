// Script to clear old notifications from localStorage
// Run this in the browser console on localhost:3000

(function() {
  if (typeof window === 'undefined') {
    console.log('This script must be run in a browser');
    return;
  }
  
  // Clear all notifications
  localStorage.removeItem('parentNotifications');
  
  // Trigger event to update UI
  window.dispatchEvent(new Event('notificationsUpdated'));
  
  console.log('✅ All notifications cleared from localStorage');
  console.log('🔄 Please refresh the page to see the changes!');
})();

