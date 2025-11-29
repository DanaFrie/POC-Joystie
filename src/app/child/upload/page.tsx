'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { formatNumber } from '@/utils/formatting';
import { processScreenshot } from '@/lib/api/screenshot';
import { createUpload } from '@/lib/api/uploads';
import { uploadScreenshot } from '@/lib/api/storage';
import { getCurrentUserId } from '@/utils/auth';
import { validateUploadUrl } from '@/utils/url-validation';
import { generateRedemptionUrl } from '@/utils/url-encoding';
import { getActiveChallenge } from '@/lib/api/challenges';
import { getUser } from '@/lib/api/users';
import { getChild } from '@/lib/api/children';

interface UploadResult {
  screenTimeUsed: number;
  screenTimeGoal: number;
  coinsEarned: number;
  coinsMaxPossible: number;
  success: boolean;
  parentName: string;
}

interface SelectableDay {
  date: Date;
  dateStr: string;
  dayName: string;
  displayText: string;
}

function ChildUploadContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [selectedDay, setSelectedDay] = useState<SelectableDay | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'ios' | 'android'>('ios');
  const [ocrProgress, setOcrProgress] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const [showApprovedWarning, setShowApprovedWarning] = useState(false);
  const [approvedDayInfo, setApprovedDayInfo] = useState<{ date: string; dayName: string; isApproved?: boolean } | null>(null);
  const [showFridayWarning, setShowFridayWarning] = useState(false);
  const [urlValid, setUrlValid] = useState<boolean | null>(null);
  const [urlError, setUrlError] = useState<string>('');
  const [parentId, setParentId] = useState<string>('');
  const [childId, setChildId] = useState<string>('');
  const [challengeId, setChallengeId] = useState<string>('');
  const [challengeNotStarted, setChallengeNotStarted] = useState<boolean>(false);
  const [challengeStartDate, setChallengeStartDate] = useState<string>('');
  const [parentName, setParentName] = useState<string>('אמא');
  const [childGender, setChildGender] = useState<'boy' | 'girl'>('boy');

  const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  // Validate URL token on mount
  useEffect(() => {
    const validateUrl = async () => {
      if (!token) {
        setUrlValid(false);
        setUrlError('כתובת לא תקינה - חסר טוקן');
        return;
      }

      try {
        const validation = await validateUploadUrl(token);
        if (validation.isValid && validation.parentId) {
          setUrlValid(true);
          setParentId(validation.parentId);
          if (validation.childId) {
            setChildId(validation.childId);
          }
          if (validation.challengeId) {
            setChallengeId(validation.challengeId);
          }
          if (validation.challengeNotStarted) {
            setChallengeNotStarted(true);
          }
          if (validation.challengeStartDate) {
            setChallengeStartDate(validation.challengeStartDate);
          }
        } else {
          setUrlValid(false);
          setUrlError(validation.error || 'כתובת לא תקינה');
        }
      } catch (error) {
        console.error('Error validating URL:', error);
        setUrlValid(false);
        setUrlError('שגיאה בבדיקת הכתובת');
      }
    };

    validateUrl();
  }, [token]);

  // Generate list of selectable days (only past days - at least one day back)
  const selectableDays = useMemo(() => {
  const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const days: SelectableDay[] = [];
    
    // Start from yesterday (at least one day back)
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dateStr = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
      const dayName = dayNames[date.getDay()];
      
      let displayText = '';
      if (i === 1) {
        displayText = 'אתמול';
      } else if (i === 2) {
        displayText = 'שלשום';
      } else {
        displayText = `${dayName}, ${dateStr}`;
      }
      
      days.push({
        date,
        dateStr,
        dayName,
        displayText
      });
    }
    
    return days;
  }, []);

  // Set default selected day to yesterday
  useEffect(() => {
    if (selectableDays.length > 0 && !selectedDay) {
      setSelectedDay(selectableDays[0]);
    }
  }, [selectableDays, selectedDay]);

  // Check if selected day is Friday and show warning
  useEffect(() => {
    if (selectedDay && selectedDay.dayName === 'שישי') {
      setShowFridayWarning(true);
    } else {
      setShowFridayWarning(false);
    }
  }, [selectedDay]);

  // Check if there's an approved upload for the selected day
  useEffect(() => {
    if (!selectedDay) return;
    
    try {
      if (typeof window !== 'undefined') {
        let foundApproved = false;
        let approvedInfo: { date: string; dayName: string; isApproved?: boolean } | null = null;
        
        // Check dashboard test data for approved days
        const dashboardData = localStorage.getItem('dashboardTestData');
        if (dashboardData) {
          try {
            const parsed = JSON.parse(dashboardData);
            const week = parsed.week || [];
            
            // Find if there's an approved day matching the selected day
            const approvedDay = week.find((day: any) => 
              day.date === selectedDay.dateStr && 
              day.parentAction === 'approved'
            );
            
            if (approvedDay) {
              foundApproved = true;
              approvedInfo = {
                date: approvedDay.date,
                dayName: approvedDay.dayName || selectedDay.dayName,
                isApproved: true
              };
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
        
        // Also check if there's an existing upload in childUploads
        if (!foundApproved) {
          try {
            const existingUploads = JSON.parse(localStorage.getItem('childUploads') || '[]');
            const existingUpload = existingUploads.find((upload: any) => upload.date === selectedDay.dateStr);
            
            if (existingUpload) {
              foundApproved = true;
              approvedInfo = {
                date: selectedDay.dateStr,
                dayName: selectedDay.dayName,
                isApproved: false
              };
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
        
        if (foundApproved && approvedInfo) {
          setApprovedDayInfo(approvedInfo);
          setShowApprovedWarning(true);
        } else {
          setShowApprovedWarning(false);
          setApprovedDayInfo(null);
        }
      }
    } catch (e) {
      // Ignore errors
      setShowApprovedWarning(false);
      setApprovedDayInfo(null);
    }
  }, [selectedDay]);

  // Get challenge data from localStorage (mock - in real app this would come from API)
  const getChallengeData = () => {
    // Try to get from localStorage or use defaults
    const challengeData = {
      dailyScreenTimeGoal: 3, // hours
      dailyBudget: 12.9, // שקלים
      parentName: 'אמא' // default
    };

    // Try to get parent name from localStorage or mock data
    try {
      // In a real app, this would come from API/backend
      // For now, we'll try to get from localStorage or use mock data
      let parentNameFromStorage = '';
      
      // Try to get from localStorage first
      if (typeof window !== 'undefined') {
        const storedChallenge = localStorage.getItem('challengeData');
        if (storedChallenge) {
          try {
            const parsed = JSON.parse(storedChallenge);
            parentNameFromStorage = parsed.parentName || '';
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
      
      // If not found, use mock data (from dashboard)
      if (!parentNameFromStorage) {
        parentNameFromStorage = 'דנה'; // Default from dashboard mock data
      }
      
      // Simple heuristic: if name ends with 'ה' or 'ית', it's likely female
      // In a real app, this would be stored explicitly
      if (parentNameFromStorage && typeof parentNameFromStorage === 'string') {
        const name = parentNameFromStorage.trim();
        if (name.endsWith('ה') || name.endsWith('ית')) {
          challengeData.parentName = 'אמא';
        } else {
          challengeData.parentName = 'אבא';
        }
      }
      
      return challengeData;
    } catch (e) {
      return challengeData;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Map Hebrew day names to single letter abbreviations used in Screen Time
  const getDayAbbreviation = (dayName: string): { hebrew: string; english: string[] } => {
    const dayMap: { [key: string]: { hebrew: string; english: string[] } } = {
      'ראשון': { hebrew: 'א', english: ['Sun', 'S', 'Sunday'] },
      'שני': { hebrew: 'ב', english: ['Mon', 'M', 'Monday'] },
      'שלישי': { hebrew: 'ג', english: ['Tue', 'T', 'Tuesday'] },
      'רביעי': { hebrew: 'ד', english: ['Wed', 'W', 'Wednesday'] },
      'חמישי': { hebrew: 'ה', english: ['Thu', 'Th', 'Thursday'] },
      'שישי': { hebrew: 'ו', english: ['Fri', 'F', 'Friday'] },
      'שבת': { hebrew: 'ש', english: ['Sat', 'Sa', 'Saturday'] }
    };
    return dayMap[dayName] || { hebrew: '', english: [] };
  };

  // Parse time string to hours (decimal) - supports both Hebrew and English
  const parseTimeToHours = (timeText: string): number => {
    // Hebrew patterns: "שעה ו-21 דק'", "2 שעות", "1:30"
    const hourMatchHeb = timeText.match(/(\d+)\s*שעה/);
    const minuteMatchHeb = timeText.match(/(\d+)\s*דק/);
    
    // English patterns: "1h 21m", "1 hour 21 min", "1:30", "1.5 hours"
    const hourMatchEng = timeText.match(/(\d+)\s*(?:h|hour|hours|hr|hrs)/i);
    const minuteMatchEng = timeText.match(/(\d+)\s*(?:m|min|minute|minutes)/i);
    
    // Colon format: "1:30" (works for both)
    const colonMatch = timeText.match(/(\d+):(\d+)/);
    
    let hours = 0;
    let minutes = 0;
    
    if (colonMatch) {
      // Format like "1:30"
      hours = parseInt(colonMatch[1]) || 0;
      minutes = parseInt(colonMatch[2]) || 0;
    } else {
      // Try Hebrew first
      if (hourMatchHeb) {
        hours = parseInt(hourMatchHeb[1]) || 0;
      }
      if (minuteMatchHeb) {
        minutes = parseInt(minuteMatchHeb[1]) || 0;
      }
      
      // Try English if Hebrew didn't match
      if (hours === 0 && hourMatchEng) {
        hours = parseInt(hourMatchEng[1]) || 0;
      }
      if (minutes === 0 && minuteMatchEng) {
        minutes = parseInt(minuteMatchEng[1]) || 0;
      }
      
      // Try decimal format: "1.5 hours" or "1.5 שעות"
      if (hours === 0) {
        const decimalMatch = timeText.match(/(\d+\.?\d*)\s*(?:hours?|שעות?)/i);
        if (decimalMatch) {
          hours = parseFloat(decimalMatch[1]) || 0;
        }
      }
    }
    
    return hours + (minutes / 60);
  };

  // Analyze image pixels to find bar height in graph
  const analyzeGraphPixels = async (
    imageFile: File,
    targetDayIndex: number,
    maxTime: number
  ): Promise<number> => {
    return new Promise((resolve) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(0);
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Find graph area - look for bar chart colors (typically blue/cyan)
        // Screen Time bars are usually blue/cyan (#007AFF or similar)
        const barColorThreshold = 80; // Minimum blue value to consider as bar
        
        // Estimate graph area (usually in middle/lower part of screen)
        // We need to find the actual graph boundaries by looking for the baseline (0 hours) and top (max hours)
        let graphStartY = Math.floor(canvas.height * 0.3);
        let graphEndY = Math.floor(canvas.height * 0.85);
        
        // Find the actual baseline (0 hours) - usually at the bottom of the graph
        // Look for horizontal lines or grid lines that might indicate the baseline
        // The baseline is typically where the bars start (bottom of the graph)
        let baselineY = graphEndY;
        let foundBaseline = false;
        
        // Scan from bottom up to find the baseline
        for (let y = graphEndY; y >= graphStartY; y -= 2) {
          // Check if this might be a baseline (look for consistent color or grid line)
          let consistentPixels = 0;
          let darkPixels = 0;
          for (let x = Math.floor(canvas.width * 0.1); x < Math.floor(canvas.width * 0.9); x += 5) {
            const index = (y * canvas.width + x) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            // Baseline might be light colored (background) or dark (grid line)
            if (r > 200 && g > 200 && b > 200) {
              consistentPixels++;
            }
            if (r < 100 && g < 100 && b < 100) {
              darkPixels++;
            }
          }
          // If we found a consistent line (either light or dark), this might be the baseline
          if (consistentPixels > 15 || darkPixels > 10) {
            baselineY = y;
            foundBaseline = true;
            break;
          }
        }
        
        // If we didn't find a baseline, use the estimated bottom
        if (!foundBaseline) {
          baselineY = graphEndY;
        }
        
        // Find the top of the graph (max hours) - usually where the highest bar ends
        // Look for the highest point where we can find bar pixels
        let graphTopY = graphStartY;
        for (let y = graphStartY; y < baselineY; y += 2) {
          // Check if there are any bar pixels at this height
          for (let x = Math.floor(canvas.width * 0.1); x < Math.floor(canvas.width * 0.9); x += 5) {
            const index = (y * canvas.width + x) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            if (b > barColorThreshold && b > r * 1.2 && b > g * 1.2) {
              graphTopY = y; // Found a bar pixel, update top
              break;
            }
          }
        }
        
        // Use the actual graph boundaries
        // graphStartY is the top (max hours), baselineY is the bottom (0 hours)
        graphStartY = graphTopY;
        graphEndY = baselineY;
        const graphHeightPixels = graphEndY - graphStartY;
        
        // Find all bars by scanning horizontally for blue/cyan pixels
        // First, find the approximate X positions of all bars
        const barPositions: number[] = [];
        const barWidth = Math.floor(canvas.width / 12); // Approximate bar width
        const scanY = Math.floor((graphStartY + graphEndY) / 2); // Scan at middle of graph
        
        // Find all potential bar positions
        for (let x = Math.floor(canvas.width * 0.1); x < Math.floor(canvas.width * 0.9); x++) {
          const index = (scanY * canvas.width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          
          // Check if this pixel is part of a bar (blue/cyan color)
          if (b > barColorThreshold && b > r * 1.2 && b > g * 1.2) {
            // Check if this is a new bar (not too close to existing ones)
            const isNewBar = barPositions.every(pos => Math.abs(x - pos) > barWidth * 2);
            if (isNewBar) {
              barPositions.push(x);
            }
          }
        }
        
        // Sort bar positions
        barPositions.sort((a, b) => a - b);
        
        // If we found bars, use the target day's bar
        if (barPositions.length > targetDayIndex && barPositions[targetDayIndex]) {
          const targetBarX = barPositions[targetDayIndex];
          
          // Scan the entire width of the bar to find its height
          const scanWidth = Math.min(barWidth * 2, 30); // Scan a reasonable width
          
          // Scan vertically from bottom to top to find the top of the bar
          // The bar starts at graphEndY (baseline - 0 hours) and goes up
          let barTop = graphEndY; // Start from baseline
          
          // Scan from bottom (baseline) to top to find where the bar ends
          // Start from baseline (graphEndY) and scan up to find the top of the bar
          for (let y = graphEndY; y >= graphStartY; y--) {
            let hasBarPixels = false;
            let barPixelsInRow = 0;
            
            // Scan horizontally across the bar width to find bar pixels
            for (let offset = -scanWidth / 2; offset <= scanWidth / 2; offset += 1) {
              const x = Math.floor(targetBarX + offset);
              if (x < 0 || x >= canvas.width) continue;
              
              const index = (y * canvas.width + x) * 4;
              const r = data[index];
              const g = data[index + 1];
              const b = data[index + 2];
              
              // Check if this pixel is part of a bar (blue/cyan color)
              if (b > barColorThreshold && b > r * 1.2 && b > g * 1.2) {
                hasBarPixels = true;
                barPixelsInRow++;
              }
            }
            
            // If we found bar pixels in this row, update the top
            if (hasBarPixels && barPixelsInRow > 2) {
              barTop = y; // Update top as we go up (this is the highest point of the bar)
            } else if (barTop < graphEndY) {
              // We've left the bar area, stop scanning
              break;
            }
          }
          
          // Calculate bar height from baseline (graphEndY) to top of bar (barTop)
          // The bar height represents the time in hours
          const barHeight = graphEndY - barTop;
          
          // Convert bar height to time (proportional to max time)
          // graphHeightPixels represents maxTime hours (from 0 to maxTime)
          if (barHeight > 5 && graphHeightPixels > 0) { // Minimum bar height of 5 pixels
            const timeRatio = barHeight / graphHeightPixels;
            const timeInHours = timeRatio * maxTime;
            // Round to 2 decimal places for better accuracy (e.g., 2.67 hours = 2 hours 40 minutes)
            const result = Math.max(0, Math.min(timeInHours, maxTime));
            resolve(Math.round(result * 100) / 100);
            return;
          }
        }
        
        // Fallback: try estimated positions if we didn't find bars
        const barSpacing = Math.floor(canvas.width / 8);
        const graphStartX = Math.floor(canvas.width * 0.1);
        const targetBarX = graphStartX + (targetDayIndex * barSpacing) + (barWidth / 2);
        
        let barTop = graphEndY; // Start from baseline
        
        // Scan vertically at the estimated bar position from bottom to top
        for (let y = graphEndY; y >= graphStartY; y--) {
          const index = (y * canvas.width + targetBarX) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          
          // Check if this pixel is part of a bar
          if (b > barColorThreshold && b > r * 1.2 && b > g * 1.2) {
            barTop = y; // Update top as we go up
          } else if (barTop < graphEndY) {
            // We've left the bar area, stop
            break;
          }
        }
        
        // Calculate bar height from baseline to top
        const barHeight = graphEndY - barTop;
        if (barHeight > 5 && graphHeightPixels > 0) {
          const timeRatio = barHeight / graphHeightPixels;
          const timeInHours = timeRatio * maxTime;
          // Round to 2 decimal places for better accuracy
          resolve(Math.round(Math.max(0, Math.min(timeInHours, maxTime)) * 100) / 100);
        } else {
          resolve(0);
        }
      };
      
      img.onerror = () => resolve(0);
      img.src = URL.createObjectURL(imageFile);
    });
  };

  // Extract screen time from screenshot using Python service
  const extractScreenTimeFromImage = async (
    imageFile: File,
    targetDay: SelectableDay
  ): Promise<{ time: number; minutes: number; extractedText: string }> => {
    console.log('[Upload] Starting screen time extraction', {
      fileName: imageFile.name,
      fileSize: imageFile.size,
      targetDay: targetDay.dayName
    });

    try {
      setOcrProgress('מעבד תמונה...');
      console.log('[Upload] Step 1: Sending image to processing service');

      // Call the API to process the screenshot
      const result = await processScreenshot(imageFile, targetDay.dayName);

      console.log('[Upload] Processing complete:', result);

      if (result.error) {
        console.error('[Upload] Processing error:', result.error);
        throw new Error(result.error);
      }

      if (!result.found) {
        console.warn('[Upload] Target day not found in image');
        setOcrProgress('יום לא נמצא בתמונה');
        return {
          time: 0,
          minutes: 0,
          extractedText: `יום ${targetDay.dayName} לא נמצא בתמונה`
        };
      }

      setOcrProgress('מחשב זמן מסך...');
      console.log('[Upload] Step 2: Calculating screen time', {
        minutes: result.minutes,
        hours: result.time,
        metadata: result.metadata
      });

      // Convert minutes to hours
      const timeInHours = result.time || (result.minutes / 60);
      const minutes = result.minutes || 0;

      setOcrProgress('סיום עיבוד...');
      console.log('[Upload] Step 3: Processing complete', {
        timeInHours,
        minutes
      });

      // Format message with hours and minutes
      const hoursInt = Math.floor(minutes / 60);
      const minutesInt = Math.round(minutes % 60);
      let timeText = '';
      if (hoursInt > 0 && minutesInt > 0) {
        timeText = `${hoursInt} שעות ו-${minutesInt} דקות`;
      } else if (hoursInt > 0) {
        timeText = `${hoursInt} שעות`;
      } else {
        timeText = `${minutesInt} דקות`;
      }

      return {
        time: timeInHours,
        minutes: minutes,
        extractedText: `זמן מסך מזוהה ליום ${targetDay.dayName}: ${timeText}`
      };
    } catch (error: any) {
      console.error('[Upload] Error processing screenshot:', error);
      setOcrProgress('שגיאה בעיבוד התמונה');
      
      // Return error result
      return {
        time: 0,
        minutes: 0,
        extractedText: `שגיאה בעיבוד התמונה: ${error.message || 'שגיאה לא ידועה'}`
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[Upload] Form submitted', {
      hasScreenshot: !!screenshot,
      selectedDay: selectedDay?.displayText
    });

    // Prevent submission if challenge hasn't started
    if (challengeNotStarted) {
      console.warn('[Upload] Challenge has not started yet');
      alert('האתגר עדיין לא התחיל. בדוק עם ההורה שלך.');
      return;
    }

    if (!screenshot || !selectedDay) {
      console.warn('[Upload] Missing screenshot or selected day');
      return;
    }

    // Check if there's an approved upload for this day
    try {
      if (typeof window !== 'undefined') {
        console.log('[Upload] Checking for existing uploads...');
        const dashboardData = localStorage.getItem('dashboardTestData');
        if (dashboardData) {
          try {
            const parsed = JSON.parse(dashboardData);
            const week = parsed.week || [];
            
            const approvedDay = week.find((day: any) => 
              day.date === selectedDay.dateStr && 
              day.parentAction === 'approved'
            );
            
            if (approvedDay) {
              console.warn('[Upload] Found approved upload for this day, blocking submission');
              alert(`שימו לב: נמצא במאגר נתון תמונה מאושרת על ידי ההורה עבור ${approvedDay.dayName || selectedDay.dayName}, ${approvedDay.date}.\n\nאם את/ה רוצה להעלות תמונה של יום אחר, את/ה יכולים לחזור ולהעלות.`);
              return;
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
        
        // Also check if there's an existing upload in childUploads
        const existingUploads = JSON.parse(localStorage.getItem('childUploads') || '[]');
        const existingUpload = existingUploads.find((upload: any) => upload.date === selectedDay.dateStr);
        
        if (existingUpload) {
          console.warn('[Upload] Found existing upload for this day, blocking submission');
          alert(`שימו לב: כבר הועלתה תמונה עבור ${selectedDay.displayText} (${selectedDay.dateStr}).\n\nאם את/ה רוצה להעלות תמונה של יום אחר, את/ה יכולים לחזור ולהעלות.`);
          return;
        }
        console.log('[Upload] No existing uploads found, proceeding');
      }
    } catch (e) {
      console.warn('[Upload] Error checking existing uploads:', e);
      // Ignore errors and continue
    }

    setIsSubmitting(true);
    setOcrProgress('');

    const challengeData = getChallengeData();
    console.log('[Upload] Challenge data:', {
      dailyScreenTimeGoal: challengeData.dailyScreenTimeGoal,
      dailyBudget: challengeData.dailyBudget,
      parentName: challengeData.parentName
    });
    
    // Extract screen time from screenshot using OCR
    console.log('[Upload] Starting screen time extraction...');
    let screenTimeUsed: number;
    let screenTimeMinutes: number;
    let ocrText: string;
    
    try {
      const extractionResult = await extractScreenTimeFromImage(screenshot, selectedDay);
      screenTimeUsed = extractionResult.time;
      screenTimeMinutes = extractionResult.minutes;
      ocrText = extractionResult.extractedText;
      
      // Check if extraction failed (error or day not found)
      const hasError = ocrText.includes('שגיאה') || ocrText.includes('לא נמצא');
      const hasNoTime = screenTimeUsed === 0 && screenTimeMinutes === 0;
      
      if (hasError || (hasNoTime && !extractionResult.extractedText.includes('זמן מסך מזוהה'))) {
        console.error('[Upload] Extraction failed:', { hasError, hasNoTime, ocrText });
        throw new Error(ocrText);
      }
      
      setExtractedText(ocrText);
      console.log('[Upload] Screen time extracted:', {
        screenTimeUsed,
        screenTimeMinutes,
        extractedText: ocrText
      });
    } catch (extractionError: any) {
      console.error('[Upload] Screen time extraction failed:', extractionError);
      setIsSubmitting(false);
      setOcrProgress('');
      setExtractedText('');
      // Show error to user - don't save anything
      alert(`שגיאה בעיבוד התמונה: ${extractionError.message || 'לא הצלחנו לעבד את התמונה. אנא נסה שוב.'}`);
      return; // Exit early - don't save anything
    }

    const screenTimeGoal = challengeData.dailyScreenTimeGoal;
    
    // Calculate if goal was met
    const success = screenTimeUsed <= screenTimeGoal;
    console.log('[Upload] Goal check:', {
      screenTimeUsed,
      screenTimeGoal,
      success
    });
    
    // Calculate coins earned
    // If goal met: full daily budget
    // If not met: proportional reduction
    const coinsMaxPossible = challengeData.dailyBudget;
    const coinsEarned = success 
      ? coinsMaxPossible 
      : Math.max(0, coinsMaxPossible * (1 - (screenTimeUsed - screenTimeGoal) / screenTimeGoal));

    const coinsEarnedRounded = Math.round(coinsEarned * 10) / 10;
    console.log('[Upload] Coins calculation:', {
      coinsMaxPossible,
      coinsEarned,
      coinsEarnedRounded
    });
    
    const result: UploadResult = {
      screenTimeUsed,
      screenTimeGoal,
      coinsEarned: coinsEarnedRounded,
      coinsMaxPossible,
      success,
      parentName: challengeData.parentName
    };

    // Store minutes in result for display
    (result as any).screenTimeMinutes = screenTimeMinutes;

    // Calculate weekly total BEFORE saving new upload
    const existingUploads = JSON.parse(localStorage.getItem('childUploads') || '[]');
    const weeklyTotalBefore = existingUploads.reduce((sum: number, upload: any) => {
      return sum + (upload.coinsEarned || 0);
    }, 0);
    const weeklyTotal = weeklyTotalBefore + coinsEarnedRounded;
    console.log('[Upload] Weekly totals:', {
      before: weeklyTotalBefore,
      new: coinsEarnedRounded,
      total: weeklyTotal
    });

    // Prepare upload data with minutes
    const uploadData = {
      date: selectedDay.dateStr,
      dayName: selectedDay.dayName,
      screenTime: screenTimeUsed,
      screenTimeMinutes: screenTimeMinutes, // Store minutes for display
      screenshot: screenshotPreview,
      uploadedAt: new Date().toISOString(),
      requiresApproval: true,
      coinsEarned: result.coinsEarned,
      coinsMaxPossible: result.coinsMaxPossible,
      success: result.success
    };

    console.log('[Upload] Saving upload data:', uploadData);

    // Save to localStorage (for demo/testing) - only if extraction succeeded
    try {
      existingUploads.push(uploadData);
      localStorage.setItem('childUploads', JSON.stringify(existingUploads));
      console.log('[Upload] Upload saved to localStorage');
    } catch (localStorageError) {
      console.error('[Upload] Failed to save to localStorage:', localStorageError);
      setIsSubmitting(false);
      alert('שגיאה בשמירת הנתונים. אנא נסה שוב.');
      return; // Exit early
    }

    // Try to save to Firestore if we have challengeId
    try {
      const userId = await getCurrentUserId();
      const uploadChallengeId = challengeId || localStorage.getItem('currentChallengeId') || 'demo-challenge';
      const uploadParentId = parentId || localStorage.getItem('currentParentId') || userId;
      const uploadChildId = childId || userId;
      
      if (uploadChallengeId && uploadParentId) {
        
        // Upload screenshot to Cloud Storage
        let screenshotUrl = screenshotPreview;
        let screenshotStoragePath = '';
        try {
          if (screenshot) {
            const storageResult = await uploadScreenshot(
              screenshot,
              userId,
              challengeId,
              selectedDay.dateStr
            );
            screenshotUrl = storageResult.url;
            screenshotStoragePath = storageResult.path;
            console.log('[Upload] Screenshot uploaded to Cloud Storage:', storageResult);
          }
        } catch (storageError) {
          console.warn('[Upload] Failed to upload to Cloud Storage, using preview:', storageError);
          // Continue with preview URL - not critical
        }

        // Save to Firestore
        const firestoreUpload = {
          challengeId: uploadChallengeId,
          parentId: uploadParentId,
          childId: uploadChildId,
          date: selectedDay.dateStr,
          dayName: selectedDay.dayName,
          screenTimeUsed: screenTimeUsed,
          screenTimeGoal: screenTimeGoal,
          coinsEarned: coinsEarnedRounded,
          coinsMaxPossible: coinsMaxPossible,
          success: success,
          screenshotUrl: screenshotUrl,
          screenshotStoragePath: screenshotStoragePath,
          requiresApproval: true,
          uploadedAt: new Date().toISOString(),
        };

        const uploadId = await createUpload(firestoreUpload);
        console.log('[Upload] Upload saved to Firestore:', uploadId);
      } else {
        console.log('[Upload] User not authenticated, skipping Firestore save');
      }
    } catch (firestoreError) {
      console.error('[Upload] Failed to save to Firestore:', firestoreError);
      // Firestore save failed, but localStorage already succeeded
      // Don't fail the whole operation - user can see the result
      // In production, you might want to rollback localStorage here
    }

    // Store weekly total in result for display
    (result as any).weeklyTotal = weeklyTotal;
    setUploadResult(result);

    // Trigger event for parent dashboard to update
    window.dispatchEvent(new Event('childUploaded'));
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'childUploads',
      newValue: JSON.stringify(existingUploads)
    }));

    console.log('[Upload] Upload complete!', {
      result,
      weeklyTotal
    });

    setIsSubmitting(false);
    setSubmitted(true);

    // If Friday was uploaded, redirect immediately to redemption page (don't show result screen)
    if (selectedDay.dayName === 'שישי') {
      // Redirect immediately to redemption page with Friday earnings and token
      const redemptionUrl = parentId 
        ? generateRedemptionUrl(parentId, childId || undefined)
        : `/child/redemption?fridayEarnings=${coinsEarnedRounded}&weeklyTotal=${weeklyTotal}`;
      
      setTimeout(() => {
        router.push(`${redemptionUrl}${redemptionUrl.includes('?') ? '&' : '?'}fridayEarnings=${coinsEarnedRounded}&weeklyTotal=${weeklyTotal}`);
      }, 500); // Short delay to ensure state is saved
    }
  };


  // Get child gender for pronouns
  const getChildGender = () => {
    try {
      if (typeof window !== 'undefined') {
        const dashboardData = localStorage.getItem('dashboardTestData');
        if (dashboardData) {
          const parsed = JSON.parse(dashboardData);
          return parsed.child?.gender || 'boy';
        }
      }
    } catch (e) {
      // Ignore errors
    }
    return 'boy';
  };

  // If Friday was uploaded, redirect immediately to redemption (don't show result screen)
  if (submitted && uploadResult && selectedDay && selectedDay.dayName === 'שישי') {
    // Already redirected in handleSubmit, but in case it didn't work, redirect here too
    return null; // Component will unmount and redirect
  }

  // Show result in the same form instead of separate screen
  if (submitted && uploadResult && selectedDay) {
    const weeklyTotal = (uploadResult as any).weeklyTotal || uploadResult.coinsEarned;
    const childGender = getChildGender();
    const isYesterday = selectedDay.displayText === 'אתמול';
    const isDayBeforeYesterday = selectedDay.displayText === 'שלשום';
    const parentName = uploadResult.parentName;
    
    // Determine message based on day and gender
    const accumulatedVerb = childGender === 'boy' ? 'צברת' : 'צברת';
    
    // Format time with hours and minutes
    const screenTimeMinutes = (uploadResult as any).screenTimeMinutes || (uploadResult.screenTimeUsed * 60);
    const hoursInt = Math.floor(screenTimeMinutes / 60);
    const minutesInt = Math.round(screenTimeMinutes % 60);
    let timeText = '';
    if (hoursInt > 0 && minutesInt > 0) {
      timeText = `${hoursInt} שעות ו-${minutesInt} דקות`;
    } else if (hoursInt > 0) {
      timeText = `${hoursInt} שעות`;
    } else {
      timeText = `${minutesInt} דקות`;
    }

    let dayMessage = '';
    if (isYesterday || isDayBeforeYesterday) {
      dayMessage = `${selectedDay.displayText} היית ${timeText} בטלפון והצלחת לצבור ${formatNumber(uploadResult.coinsEarned)} שקלים, סה"כ ${accumulatedVerb} ${formatNumber(weeklyTotal)} שקלים השבוע`;
    } else {
      dayMessage = `ביום ${selectedDay.dayName} היית ${timeText} בטלפון והצלחת לצבור ${formatNumber(uploadResult.coinsEarned)} שקלים, סה"כ ${accumulatedVerb} ${formatNumber(weeklyTotal)} שקלים השבוע`;
    }

    // Success message based on goal and gender
    const successMessage = uploadResult.success 
      ? `כל הכבוד! ${childGender === 'boy' ? 'עמדת' : 'עמדת'} ביעד!`
      : childGender === 'boy' ? 'נסה מחר לעבוד יותר טוב!' : 'נסי מחר לעבוד יותר טוב!';

    return (
      <div className="min-h-screen bg-transparent pb-24">
        <div className="max-w-md mx-auto px-4 py-8 relative">
          {/* Piggy Bank - פינה ימנית עליונה */}
          <div className="absolute right-0 top-0 z-10">
            <Image
              src="/piggy-bank.png"
              alt="Piggy Bank"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>
          <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 mt-20">
            <h1 className="font-varela font-semibold text-2xl text-[#262135] mb-4 text-center">
              הסטטוס הועלה!
            </h1>
            
            <div className="space-y-4">
              <div className="bg-white rounded-[12px] p-4">
                <p className="font-varela text-base text-[#282743] text-center mb-3 leading-relaxed">
                  {dayMessage}
                </p>
                <p className="font-varela text-sm text-[#262135] text-center font-semibold">
                  {successMessage}
                </p>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-[12px] p-4">
                <p className="font-varela text-sm text-[#262135] text-center leading-relaxed">
                  בכל מקרה {parentName} {parentName.endsWith('ה') || parentName.endsWith('ית') ? 'צריכה' : 'צריך'} לאשר לך את הסטטוס ש{childGender === 'boy' ? 'העלית' : 'העלית'}!
                  <br />
                  בסוף השבוע תפגשו כאן ו{childGender === 'boy' ? 'תוכל' : 'תוכלי'} לזכות במה ש{childGender === 'boy' ? 'צברת' : 'צברת'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if URL is invalid
  if (urlValid === false) {
    return (
      <div className="min-h-screen bg-transparent pb-24 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 text-center">
            <h1 className="font-varela font-semibold text-2xl text-[#262135] mb-4">
              כתובת לא תקינה
            </h1>
            <p className="font-varela text-base text-[#282743] mb-4">
              {urlError || 'הכתובת ששותפה איתך לא תקינה או שהאתגר לא פעיל.'}
            </p>
            <p className="font-varela text-sm text-[#948DA9]">
              בדוק עם ההורה שלך לקבלת כתובת חדשה.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while validating
  if (urlValid === null) {
    return (
      <div className="min-h-screen bg-transparent pb-24 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 text-center">
            <p className="font-varela text-base text-[#282743]">בודק כתובת...</p>
          </div>
        </div>
      </div>
    );
  }

  // Load parent and child data when challenge not started
  useEffect(() => {
    const loadData = async () => {
      if (!challengeNotStarted || !parentId) return;
      
      try {
        const challenge = await getActiveChallenge(parentId);
        if (!challenge) return;

        const childIdToUse = childId || challenge.childId;
        if (childIdToUse) {
          const child = await getChild(childIdToUse);
          if (child) {
            setChildGender(child.gender || 'boy');
          }
        }

        const parent = await getUser(parentId);
        if (parent) {
          const name = parent.firstName || 'דנה';
          // Determine if parent is mom or dad
          if (name.endsWith('ה') || name.endsWith('ית')) {
            setParentName('אמא');
          } else {
            setParentName('אבא');
          }
        }
      } catch (e) {
        console.error('Error loading data:', e);
      }
    };

    loadData();
  }, [challengeNotStarted, parentId, childId]);

  // Fix scroll position to 0 when challenge not started
  useEffect(() => {
    if (challengeNotStarted) {
      window.scrollTo(0, 0);
    }
  }, [challengeNotStarted]);

  // Show message if challenge hasn't started yet
  if (challengeNotStarted) {
    const startDate = challengeStartDate ? new Date(challengeStartDate) : null;
    const formattedDate = startDate 
      ? `${String(startDate.getDate()).padStart(2, '0')}/${String(startDate.getMonth() + 1).padStart(2, '0')}`
      : '';
    
    return (
      <div className="min-h-screen bg-transparent pb-24">
        <div className="max-w-md mx-auto px-4 py-8 relative">
          {/* Piggy Bank - פינה ימנית עליונה */}
          <div className="absolute right-0 top-0 z-10">
            <Image
              src="/piggy-bank.png"
              alt="Piggy Bank"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>
          <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 mb-6 mt-20">
            <h1 className="font-varela font-semibold text-2xl text-[#262135] mb-4 text-center">
              ממש בקרוב האתגר יתחיל
            </h1>
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-[12px] p-4 mb-4">
              <p className="font-varela text-base text-[#262135] text-center leading-relaxed mb-2">
                יום ראשון הקרוב {formattedDate ? formattedDate : ''} זה קורה
              </p>
              <p className="font-varela text-sm text-[#262135] text-center leading-relaxed">
                כדי ש{childGender === 'boy' ? 'אתה' : 'את'} תרוויח{childGender === 'boy' ? '' : 'י'}! תתחיל{childGender === 'boy' ? '' : 'י'} לחשוב עם {parentName} איך הכי כדאי לנצל את הזמן במסך ומחוצה לו.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-24">
      <div className="max-w-md mx-auto px-4 py-8 relative">
        {/* Piggy Bank - פינה ימנית עליונה */}
        <div className="absolute right-0 top-0 z-10">
          <Image
            src="/piggy-bank.png"
            alt="Piggy Bank"
            width={120}
            height={120}
            className="object-contain"
          />
        </div>
        <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 mb-6 mt-20">
          <h1 className="font-varela font-semibold text-2xl text-[#262135] mb-2 text-center">
            עדכון זמן מסך
          </h1>
          <p className="font-varela text-base text-[#282743] mb-6 text-center">
            כדי להתקדם, צלמו את מסך 'זמן המסך' בטלפון והעלו אותו כאן.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Day Selection */}
            <div>
              <label className="block font-varela font-semibold text-base text-[#282743] mb-2">
                איזה יום אתה מעלה?
              </label>
              <select
                value={selectedDay ? selectableDays.findIndex(d => d.dateStr === selectedDay.dateStr) : -1}
                onChange={(e) => {
                  const index = parseInt(e.target.value);
                  if (index >= 0 && index < selectableDays.length) {
                    setSelectedDay(selectableDays[index]);
                  }
                }}
                className="w-full py-3 px-4 rounded-[12px] border-2 border-gray-300 bg-white font-varela text-base text-[#282743] focus:outline-none focus:border-[#273143]"
                required
              >
                {selectableDays.map((day, index) => (
                  <option key={index} value={index}>
                    {day.displayText}
                  </option>
                ))}
              </select>
            </div>

            {/* Friday Warning - need parent nearby */}
            {showFridayWarning && (() => {
              const challengeData = getChallengeData();
              const parentName = challengeData.parentName || 'אמא';
              const parentPronoun = parentName === 'אמא' ? 'שלה' : 'שלו';
              
              return (
                <div className="bg-gradient-to-br from-[#E6F19A] to-[#BBE9FD] border-2 border-[#E6F19A] rounded-[12px] p-4 shadow-sm">
                  <p className="font-varela text-base text-[#262135] text-center leading-relaxed font-bold mb-3">
                    🎉 התראה חגיגית!
                  </p>
                  <p className="font-varela text-sm text-[#262135] text-center leading-relaxed mb-3">
                    אתה מעלה סטטוס של יום שישי - זה אומר שאוטוטו אתה מרוויח את הזכיה שלך!
                  </p>
                  <p className="font-varela text-sm text-[#262135] text-center leading-relaxed">
                    ודא ש{parentName} לידך כי אחרי ההעלאה תעבור למסך הפדיון שבו תצטרך את האישור {parentPronoun}.
                  </p>
                </div>
              );
            })()}

            {/* Approved Warning */}
            {showApprovedWarning && approvedDayInfo && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-[12px] p-4">
                <p className="font-varela text-sm text-[#262135] text-center leading-relaxed mb-2">
                  <strong>שימו לב:</strong> {approvedDayInfo.isApproved 
                    ? `נמצא במאגר נתון תמונה מאושרת על ידי ההורה עבור ${approvedDayInfo.dayName}, ${approvedDayInfo.date}.`
                    : `כבר הועלתה תמונה עבור ${approvedDayInfo.dayName}, ${approvedDayInfo.date}.`}
                </p>
                <p className="font-varela text-sm text-[#262135] text-center leading-relaxed">
                  אם את/ה רוצה להעלות תמונה של יום אחר, את/ה יכולים לחזור ולהעלות.
                </p>
              </div>
            )}

            {/* Screenshot Upload */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block font-varela font-semibold text-base text-[#282743]">
                העלה צילום מסך של זמן מסך
              </label>
                <button
                  type="button"
                  onClick={() => setShowHelpModal(true)}
                  className="font-varela text-xs text-[#273143] underline hover:text-[#273143]/80"
                >
                  הסבר כיצד לצלם מסך
                </button>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-[18px] p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="screenshot-upload"
                  required
                />
                <label
                  htmlFor="screenshot-upload"
                  className="cursor-pointer block"
                >
                  {screenshotPreview ? (
                    <div className="space-y-3">
                      <Image
                        src={screenshotPreview}
                        alt="Screenshot preview"
                        width={300}
                        height={200}
                        className="mx-auto rounded-lg object-contain max-h-64"
                      />
                      <p className="font-varela text-sm text-[#273143]">
                        לחץ לשנות תמונה
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="font-varela text-base text-[#948DA9]">
                        לחץ להעלאת צילום מסך
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!screenshot || !selectedDay || isSubmitting}
              className={`w-full py-4 px-6 rounded-[18px] text-lg font-varela font-semibold transition-all ${
                screenshot && selectedDay && !isSubmitting
                  ? 'bg-[#273143] text-white hover:bg-opacity-90'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (ocrProgress || 'מעבד תמונה...') : 'שלח סטטוס'}
            </button>
          </form>
        </div>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-varela font-semibold text-xl text-[#262135]">
                איך להעלות צילום מסך של זמן מסך?
              </h2>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-[#948DA9] hover:text-[#282743] text-2xl"
              >
                ×
              </button>
            </div>
            
            {/* Platform Selection */}
            <div className="mb-4">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setSelectedPlatform('ios')}
                  className={`flex-1 py-2 px-4 rounded-[12px] font-varela font-semibold transition-all ${
                    selectedPlatform === 'ios'
                      ? 'bg-[#273143] text-white'
                      : 'bg-gray-200 text-[#282743]'
                  }`}
                >
                  iPhone
                </button>
                <button
                  onClick={() => setSelectedPlatform('android')}
                  className={`flex-1 py-2 px-4 rounded-[12px] font-varela font-semibold transition-all ${
                    selectedPlatform === 'android'
                      ? 'bg-[#273143] text-white'
                      : 'bg-gray-200 text-[#282743]'
                  }`}
                >
                  Android
                </button>
              </div>
            </div>

            {/* Video Container */}
            <div className="mb-4">
              <div className="relative w-full aspect-video bg-gray-100 rounded-[12px] overflow-hidden">
                {selectedPlatform === 'ios' ? (
                  <video
                    controls
                    className="w-full h-full object-contain"
                    poster="/video-poster-ios.jpg"
                  >
                    <source src="/screenshot-tutorial-ios.mp4" type="video/mp4" />
                    <source src="/screenshot-tutorial-ios.webm" type="video/webm" />
                    <p className="font-varela text-base text-[#282743] p-4 text-center">
                      הדפדפן שלך לא תומך בהצגת סרטונים. 
                      <br />
                      <a href="/screenshot-tutorial-ios.mp4" className="underline" download>
                        הורד את הסרטון כאן
                      </a>
                    </p>
                  </video>
                ) : (
                  <video
                    controls
                    className="w-full h-full object-contain"
                    poster="/video-poster-android.jpg"
                  >
                    <source src="/screenshot-tutorial-android.mp4" type="video/mp4" />
                    <source src="/screenshot-tutorial-android.webm" type="video/webm" />
                    <p className="font-varela text-base text-[#282743] p-4 text-center">
                      הדפדפן שלך לא תומך בהצגת סרטונים. 
                      <br />
                      <a href="/screenshot-tutorial-android.mp4" className="underline" download>
                        הורד את הסרטון כאן
                      </a>
                    </p>
                  </video>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-3 px-6 rounded-[12px] bg-[#273143] text-white font-varela font-semibold hover:bg-opacity-90 transition-all"
            >
              הבנתי
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChildUploadPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">טוען...</div>}>
      <ChildUploadContent />
    </Suspense>
  );
}

