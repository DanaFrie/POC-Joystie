'use client';

import { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { formatNumber } from '@/utils/formatting';
import { processScreenshot } from '@/lib/api/screenshot';
import { createUpload } from '@/lib/api/uploads';
import { getCurrentUserId } from '@/utils/auth';
import { validateUploadUrl } from '@/utils/url-validation';
import { generateRedemptionUrl } from '@/utils/url-encoding';
import { decodeParentToken } from '@/utils/url-encoding';
import { getChallenge } from '@/lib/api/challenges';
import { getActiveChallenge } from '@/lib/api/challenges';
import { getUser } from '@/lib/api/users';
import { getChild } from '@/lib/api/children';
import { clientConfig } from '@/config/client.config';
import { createContextLogger } from '@/utils/logger';

const logger = createContextLogger('Upload');

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
  const [deviceType, setDeviceType] = useState<'ios' | 'android'>('ios');
  const [ocrProgress, setOcrProgress] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const [showApprovedWarning, setShowApprovedWarning] = useState(false);
  const [approvedDayInfo, setApprovedDayInfo] = useState<{ date: string; dayName: string; isApproved?: boolean } | null>(null);
  const [showFridayWarning, setShowFridayWarning] = useState(false);
  const [uploadStep, setUploadStep] = useState<number>(1);
  const [showImageModal, setShowImageModal] = useState(false);
  const [urlValid, setUrlValid] = useState<boolean | null>(null);
  const [urlError, setUrlError] = useState<string>('');
  const [parentId, setParentId] = useState<string>('');
  const [childId, setChildId] = useState<string>('');
  const [challengeId, setChallengeId] = useState<string>('');
  const [challengeNotStarted, setChallengeNotStarted] = useState<boolean>(false);
  const [challengeStartDate, setChallengeStartDate] = useState<string>('');
  const [challengeInactive, setChallengeInactive] = useState<boolean>(false);
  const [parentName, setParentName] = useState<string>('אמא');
  const [parentGender, setParentGender] = useState<'male' | 'female'>('female');
  const [childGender, setChildGender] = useState<'boy' | 'girl'>('boy');
  const [weekDays, setWeekDays] = useState<any[]>([]);
  const [challengeData, setChallengeData] = useState<{
    dailyScreenTimeGoal: number;
    dailyBudget: number;
    parentName: string;
  }>({
    dailyScreenTimeGoal: clientConfig.challenge.defaultDailyScreenTimeGoal,
    dailyBudget: clientConfig.challenge.defaultSelectedBudget / clientConfig.challenge.budgetDivision,
    parentName: 'אמא'
  });
  const hasInitializedDay = useRef(false);

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
          // Check if challenge is not active (from validation result - no need for additional query)
          if (validation.challengeIsActive === false) {
            setUrlValid(false);
            setChallengeInactive(true);
            setUrlError(validation.error || 'האתגר לא פעיל. בדוק עם ההורה שלך.');
            return;
          }
          
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
          // Check if error indicates inactive challenge
          if (validation.error?.includes('לא פעיל') || validation.error?.includes('הושלם')) {
            setChallengeInactive(true);
          }
        }
      } catch (error) {
        logger.error('Error validating URL:', error);
        setUrlValid(false);
        setUrlError('שגיאה בבדיקת הכתובת');
      }
    };

    validateUrl();
  }, [token]);

  // Load week days from challenge
  useEffect(() => {
    const loadWeekDays = async () => {
      if (!parentId) return;
      
      // Skip loading if challenge is inactive - no need to load week days
      if (challengeInactive) {
        setWeekDays([]);
        return;
      }
      
      try {
        const { getDashboardData } = await import('@/lib/api/dashboard');
        const dashboardData = await getDashboardData(parentId, true); // Use cache for better performance
        
        if (dashboardData && dashboardData.week) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          // Filter days that:
          // 1. Belong to the challenge (not redemption day)
          // 2. Have ended (not today or future - only past days)
          // 3. Haven't been uploaded yet (missing status)
          const availableDays = dashboardData.week
            .filter(day => {
              if (day.isRedemptionDay) return false;
              
              // Parse date string to Date object
              const [dayNum, monthNum] = day.date.split('/').map(Number);
              const currentYear = new Date().getFullYear();
              const dayDate = new Date(currentYear, monthNum - 1, dayNum);
              dayDate.setHours(0, 0, 0, 0);
              
              // Check if day has ended (must be before today, not today or future)
              if (dayDate >= today) return false;
              
              // Check if day hasn't been uploaded yet
              return day.status === 'missing';
            })
            .map(day => {
              // Parse date string to Date object (already parsed in filter, but need it here too)
              const [dayNum, monthNum] = day.date.split('/').map(Number);
              const currentYear = new Date().getFullYear();
              const date = new Date(currentYear, monthNum - 1, dayNum);
              date.setHours(0, 0, 0, 0); // Ensure time is set to midnight for accurate day difference calculation
              
              // Find full day name
              const dayIndex = dayNames.findIndex(name => {
                const dayAbbr = day.dayName;
                const dayMap: { [key: string]: string } = {
                  'א׳': 'ראשון',
                  'ב׳': 'שני',
                  'ג׳': 'שלישי',
                  'ד׳': 'רביעי',
                  'ה׳': 'חמישי',
                  'ו׳': 'שישי',
                  'ש׳': 'שבת'
                };
                return dayMap[dayAbbr] === name;
              });
              const fullDayName = dayIndex >= 0 ? dayNames[dayIndex] : day.dayName;
              
              // Determine display text - calculate days difference correctly
              const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
              let displayText = '';
              if (daysDiff === 0) {
                displayText = 'היום';
              } else if (daysDiff === 1) {
                displayText = 'אתמול';
              } else if (daysDiff === 2) {
                displayText = 'שלשום';
              } else {
                displayText = `${fullDayName}, ${day.date}`;
              }
              
              return {
                date,
                dateStr: day.date,
                dayName: fullDayName,
                displayText
              };
            })
            .sort((a, b) => a.date.getTime() - b.date.getTime()); // Sort by date ascending (oldest first)
          
          setWeekDays(availableDays);
        }
      } catch (error) {
        logger.error('Error loading week days:', error);
        // Fallback to empty array
        setWeekDays([]);
      }
    };
    
    loadWeekDays();
  }, [parentId]);

  // Generate list of selectable days from challenge week
  const selectableDays = useMemo(() => {
    if (weekDays.length > 0) {
      return weekDays;
    }
    
    // Fallback: if no week days loaded yet, return empty array
    return [];
  }, [weekDays]);

  // Set default selected day to first available day (only once, or if selectedDay is null)
  useEffect(() => {
    if (selectableDays.length > 0) {
      if (!selectedDay || !selectableDays.find(d => d.dateStr === selectedDay.dateStr)) {
        setSelectedDay(selectableDays[0]);
        if (!hasInitializedDay.current) {
          hasInitializedDay.current = true;
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectableDays.length, selectableDays]); // Run when selectableDays changes

  // Find if selected day is the last day to upload (only one day left AND it's the last challenge day)
  const [isLastDayToUpload, setIsLastDayToUpload] = useState<boolean>(false);
  
  useEffect(() => {
    const checkIfLastDay = async () => {
      if (!selectedDay || !parentId || !challengeId) {
        setIsLastDayToUpload(false);
        return;
      }
      
      try {
        const { getDashboardData } = await import('@/lib/api/dashboard');
        const dashboardData = await getDashboardData(parentId);
        
        if (dashboardData && dashboardData.week) {
          // Get all non-redemption days (challenge days)
          const nonRedemptionDays = dashboardData.week.filter(day => !day.isRedemptionDay);
          
          // Find days that need UPLOAD (missing)
          const daysNeedingUpload = nonRedemptionDays.filter(day => 
            day.status === 'missing'
          );
          
          // Find days that have been uploaded (not missing - includes awaiting_approval, success, warning)
          const daysUploaded = nonRedemptionDays.filter(day => 
            day.status !== 'missing'
          );
          
          // Logic: Show warning only if:
          // 1. All days except one have been uploaded (X-1 days uploaded, 1 day left)
          // 2. The selected day is that one remaining day
          // This matches the redemption page logic: only show when all days are uploaded except one
          const totalChallengeDays = nonRedemptionDays.length;
          const uploadedCount = daysUploaded.length;
          const remainingCount = daysNeedingUpload.length;
          
          // Check if all days except one have been uploaded (X-1 uploaded, 1 remaining)
          if (uploadedCount === totalChallengeDays - 1 && remainingCount === 1) {
            // Check if the selected day is that one remaining day
            const onlyDayLeft = daysNeedingUpload[0];
            setIsLastDayToUpload(onlyDayLeft.date === selectedDay.dateStr);
          } else {
            setIsLastDayToUpload(false);
          }
        } else {
          setIsLastDayToUpload(false);
        }
      } catch (error) {
        logger.error('Error checking if last day:', error);
        setIsLastDayToUpload(false);
      }
    };
    
    checkIfLastDay();
  }, [selectedDay, parentId, challengeId]);

  // Update warning state based on isLastDayToUpload
  useEffect(() => {
    setShowFridayWarning(isLastDayToUpload);
  }, [isLastDayToUpload]);


  // Load parent and child data
  useEffect(() => {
    const loadData = async () => {
      if (!parentId) return;
      
      try {
        const challenge = await getActiveChallenge(parentId);
        if (!challenge) return;

        const childIdToUse = childId || challenge.childId;
        if (childIdToUse) {
          const child = await getChild(childIdToUse);
          if (child) {
            setChildGender(child.gender || 'boy');
            setDeviceType(child.deviceType || 'ios');
          }
        }

        const parent = await getUser(parentId);
        if (parent) {
          // Use parent.gender from Firestore instead of guessing from name
          const gender = parent.gender || 'female';
          setParentGender(gender);
          setParentName(gender === 'female' ? 'אמא' : 'אבא');
        }
      } catch (e) {
        logger.error('Error loading data:', e);
      }
    };

    loadData();
  }, [parentId, childId]);

  // Load challenge and parent data from Firestore based on token
  useEffect(() => {
    const loadChallengeData = async () => {
      if (!token) return;
      
      try {
        logger.log('Decoding token to get challenge data...');
        const decoded = decodeParentToken(token);
        
        if (!decoded || decoded.isExpired) {
          logger.warn('Invalid or expired token');
          return;
        }
        
        const { parentId: decodedParentId, challengeId: decodedChallengeId, childId: decodedChildId } = decoded;
        logger.log('Decoded token:', { decodedParentId, decodedChallengeId, decodedChildId });
        
        let challenge = null;
        
        // Try to fetch challenge data - first from challengeId in token, then from active challenge
        if (decodedChallengeId) {
          try {
            challenge = await getChallenge(decodedChallengeId);
            if (challenge) {
              logger.log('Loaded challenge from token challengeId:', challenge);
            }
          } catch (challengeError) {
            logger.error('Error loading challenge by ID:', challengeError);
          }
        }
        
        // If no challenge from token, try to get active challenge for parent
        if (!challenge) {
          try {
            challenge = await getActiveChallenge(decodedParentId);
            if (challenge) {
              logger.log('Loaded active challenge from parentId:', challenge);
            }
          } catch (activeChallengeError) {
            logger.error('Error loading active challenge:', activeChallengeError);
          }
        }
        
        // If we have challenge data, use it
        if (challenge) {
          // Calculate budgets
          const dailyBudget = challenge.dailyBudget;
          const dailyScreenTimeGoal = challenge.dailyScreenTimeGoal;
          
          // Get parent data for parent name
          let parentNameValue = 'אמא';
          try {
            const parent = await getUser(decodedParentId);
            if (parent) {
              // Use parent.gender from Firestore instead of guessing from name
              const gender = parent.gender || 'female';
              parentNameValue = gender === 'female' ? 'אמא' : 'אבא';
              logger.log('Loaded parent from Firestore:', parent.firstName);
            }
          } catch (parentError) {
            logger.error('Error loading parent:', parentError);
          }
          
          // Get child data for deviceType
          const childIdToUse = decodedChildId || challenge.childId;
          if (childIdToUse) {
            try {
              const child = await getChild(childIdToUse);
              if (child) {
                setDeviceType(child.deviceType || 'ios');
                logger.log('Loaded child from Firestore, deviceType:', child.deviceType);
              }
            } catch (childError) {
              logger.error('Error loading child:', childError);
            }
          }
          
          setChallengeData({
            dailyScreenTimeGoal,
            dailyBudget,
            parentName: parentNameValue
          });
          
          setParentName(parentNameValue);
          
          logger.log('Set challenge data from Firestore:', {
            dailyScreenTimeGoal,
            dailyBudget,
            parentName: parentNameValue
          });
        } else {
          // Fallback: if no challenge found, try to get parent data only
          logger.log('Challenge not available, using parent data only');
          try {
            const parent = await getUser(decodedParentId);
            if (parent) {
              // Use parent.gender from Firestore instead of guessing from name
              const gender = parent.gender || 'female';
              const parentNameValue = gender === 'female' ? 'אמא' : 'אבא';
              setParentName(parentNameValue);
              setParentGender(gender);
              setChallengeData(prev => ({
                ...prev,
                parentName: parentNameValue
              }));
            }
          } catch (parentError) {
            logger.error('Error loading parent as fallback:', parentError);
          }
        }
      } catch (error) {
        logger.error('Error loading challenge data:', error);
    }
  };
    
    loadChallengeData();
  }, [token]);

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
    logger.log('Starting screen time extraction', {
      fileName: imageFile.name,
      fileSize: imageFile.size,
      targetDay: targetDay.dayName
    });

    try {
      setOcrProgress('בעוד כמה שניות נגלה ...');
      logger.log('Step 1: Sending image to processing service');

      // Call the API to process the screenshot
      const result = await processScreenshot(imageFile, targetDay.dayName);

      logger.log('Processing complete:', result);

      // טיפול בשגיאות - תמיד להחזיר 0
      if (result.error) {
        logger.warn('Processing error:', result.error);
        setOcrProgress('שגיאה בעיבוד התמונה');
        return {
          time: 0,
          minutes: 0,
          extractedText: `שגיאה בעיבוד התמונה: ${result.error}`
        };
      }

      if (!result.found) {
        logger.warn('Target day not found in image');
        setOcrProgress('יום לא נמצא בתמונה');
        return {
          time: 0,
          minutes: 0,
          extractedText: `יום ${targetDay.dayName} לא נמצא בתמונה`
        };
      }

      setOcrProgress('מחשב זמן מסך...');
      logger.log('Step 2: Calculating screen time', {
        minutes: result.minutes,
        hours: result.time,
        metadata: result.metadata
      });

      // Convert minutes to hours
      const timeInHours = result.time || (result.minutes / 60);
      const minutes = result.minutes || 0;

      setOcrProgress('סיום עיבוד...');
      logger.log('Step 3: Processing complete', {
        timeInHours,
        minutes
      });

      // Format message with hours and minutes (with proper singular/plural)
      const hoursInt = Math.floor(minutes / 60);
      const minutesInt = Math.round(minutes % 60);
      let timeText = '';
      if (hoursInt > 0 && minutesInt > 0) {
        const hoursText = hoursInt === 1 ? 'שעה' : 'שעות';
        const minutesText = minutesInt === 1 ? 'דקה' : 'דקות';
        timeText = `${hoursInt} ${hoursText} ו-${minutesInt} ${minutesText}`;
      } else if (hoursInt > 0) {
        const hoursText = hoursInt === 1 ? 'שעה' : 'שעות';
        timeText = `${hoursInt} ${hoursText}`;
      } else {
        const minutesText = minutesInt === 1 ? 'דקה' : 'דקות';
        timeText = `${minutesInt} ${minutesText}`;
      }

      return {
        time: timeInHours,
        minutes: minutes,
        extractedText: `זמן מסך מזוהה ליום ${targetDay.dayName}: ${timeText}`
      };
    } catch (error: any) {
      logger.error('Error processing screenshot:', error);
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
    logger.log('Form submitted', {
      hasScreenshot: !!screenshot,
      selectedDay: selectedDay?.displayText
    });

    // Prevent submission if challenge hasn't started
    if (challengeNotStarted) {
      logger.warn('Challenge has not started yet');
      const childP = getChildPronouns();
      alert(`האתגר עדיין לא התחיל. ${childP.you} ${childP.youCan} לבדוק עם ${parentName} שלך.`);
      return;
    }

    if (!screenshot || !selectedDay) {
      logger.warn('Missing screenshot or selected day');
      return;
    }

    // Check if this day was already approved (should not allow re-upload)
    // Use direct query instead of loading entire dashboard for better performance
    try {
      if (parentId && challengeId) {
        logger.log('Checking day status from Firestore...');
        
        // Use direct query to check if upload exists and is approved
        const { getUploadByDate } = await import('@/lib/api/uploads');
        const existingUpload = await getUploadByDate(challengeId, selectedDay.dateStr, parentId);
        
        if (existingUpload) {
          // Allow re-upload even if approved (removed blocking)
          logger.log('Day exists, allowing re-upload');
        } else {
          // Allow if day doesn't exist (new upload)
          logger.log('Day does not exist, allowing new upload');
        }
      }
    } catch (e) {
      logger.warn('Error checking day status:', e);
      // Ignore errors and continue - better to allow upload than block incorrectly
    }

    setIsSubmitting(true);
    setOcrProgress('');

    // challengeData is now from state (loaded from Firestore)
    logger.log('Challenge data:', {
      dailyScreenTimeGoal: challengeData.dailyScreenTimeGoal,
      dailyBudget: challengeData.dailyBudget,
      parentName: challengeData.parentName
    });
    
    // Extract screen time from screenshot using OCR
    logger.log('Starting screen time extraction...');
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
        logger.warn('Extraction failed, returning 0 values:', { hasError, hasNoTime, ocrText });
        // Return 0 values instead of throwing error
        screenTimeUsed = 0;
        screenTimeMinutes = 0;
        // Keep the error text for display
      }
      
      setExtractedText(ocrText);
      logger.log('Screen time extracted:', {
        screenTimeUsed,
        screenTimeMinutes,
        extractedText: ocrText
      });
    } catch (extractionError: any) {
      logger.error('Screen time extraction failed:', extractionError);
      // If we get here, it means there was an exception - return 0 values
      screenTimeUsed = 0;
      screenTimeMinutes = 0;
      ocrText = `שגיאה בעיבוד התמונה: ${extractionError.message || 'שגיאה לא ידועה'}`;
      setExtractedText(ocrText);
      // Continue with submission with 0 values
    }

    const screenTimeGoal = challengeData.dailyScreenTimeGoal;
    
    // Calculate if goal was met
    const success = screenTimeUsed <= screenTimeGoal;
    logger.log('Goal check:', {
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
    logger.log('Coins calculation:', {
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

    // Calculate weekly total from Firestore uploads (not localStorage)
    // Use cache for better performance - uploads are used for calculation only
    let weeklyTotalBefore = 0;
    let weeklyTotal = coinsEarnedRounded; // At minimum, the new upload
    
    if (challengeId && parentId) {
      try {
        const { getUploadsByChallenge } = await import('@/lib/api/uploads');
        // Use cache (useCache=true) for uploads - they're used for calculation only and don't need to be real-time
        const existingUploads = await getUploadsByChallenge(challengeId, parentId, undefined, true);
        
        // Sum coins from existing approved uploads (exclude the current day if it exists)
        weeklyTotalBefore = existingUploads
          .filter(upload => upload.date !== selectedDay.dateStr) // Exclude current day
          .filter(upload => upload.parentAction === 'approved' || !upload.requiresApproval) // Only approved or auto-approved
          .reduce((sum: number, upload: any) => sum + (upload.coinsEarned || 0), 0);
        
        weeklyTotal = weeklyTotalBefore + coinsEarnedRounded;
        logger.log('Weekly totals (from cached Firestore):', {
          before: weeklyTotalBefore,
          new: coinsEarnedRounded,
          total: weeklyTotal,
          existingUploadsCount: existingUploads.length
        });
      } catch (error) {
        logger.warn('Error fetching weekly totals from Firestore, using new upload only:', error);
        // Fallback: just use the new upload amount
        weeklyTotal = coinsEarnedRounded;
      }
    } else {
      logger.warn('Missing challengeId or parentId, cannot calculate weekly total from Firestore');
    }

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

    // Log upload data without screenshot (to avoid console spam)
    const { screenshot: _, ...uploadDataWithoutScreenshot } = uploadData;
    logger.log('Saving upload data:', uploadDataWithoutScreenshot);

    // Save to Firestore (no localStorage)
    if (!challengeId || !parentId || !childId) {
      logger.error('Missing required IDs:', { challengeId, parentId, childId });
      setIsSubmitting(false);
      const childP = getChildPronouns();
      alert(`שגיאה בשמירת הנתונים. חסרים פרטים נדרשים.`);
      return;
    }

    try {
      const uploadChallengeId = challengeId;
      const uploadParentId = parentId;
      const uploadChildId = childId;
      
      if (uploadChallengeId && uploadParentId && uploadChildId) {
        
        // Save to Firestore first (with preview URL)
        const firestoreUpload = {
          challengeId: uploadChallengeId,
          parentId: uploadParentId,
          childId: uploadChildId,
          date: selectedDay.dateStr,
          dayName: selectedDay.dayName,
          screenTimeUsed: screenTimeUsed,
          screenTimeMinutes: screenTimeMinutes, // Store minutes for manual entry support
          screenTimeGoal: screenTimeGoal,
          coinsEarned: coinsEarnedRounded,
          coinsMaxPossible: coinsMaxPossible,
          success: success,
          screenshotUrl: screenshotPreview || undefined, // Use preview URL (data URL from FileReader)
          requiresApproval: true,
          parentAction: null, // Explicitly set to null for awaiting approval
          uploadedAt: new Date().toISOString(),
        };

        const uploadId = await createUpload(firestoreUpload);
        logger.log('Upload saved to Firestore:', uploadId);
        
        // Invalidate uploads cache since we just created a new upload
        const { dataCache, cacheKeys } = await import('@/utils/data-cache');
        dataCache.invalidate(cacheKeys.uploads(uploadChallengeId, uploadParentId));
        
        (result as any).uploadId = uploadId;
      } else {
        logger.log('User not authenticated, skipping Firestore save');
      }
    } catch (firestoreError) {
      logger.error('Failed to save to Firestore:', firestoreError);
      setIsSubmitting(false);
      const childP = getChildPronouns();
      alert(`שגיאה בשמירת הנתונים. אנא ${childP.youTryAgain}.`);
      return;
    }

    // Store weekly total in result for display
    (result as any).weeklyTotal = weeklyTotal;
    setUploadResult(result);

    // Trigger event for parent dashboard to update
    window.dispatchEvent(new Event('childUploaded'));

    logger.log('Upload complete!', {
      result,
      weeklyTotal
    });

    // Always set submitting to false and submitted to true
    setIsSubmitting(false);
    setSubmitted(true);
    // Reset upload step for next upload
    setUploadStep(1);

    // Check if this was the last day to upload (only one day left AND it's the last challenge day)
    // We check this condition directly here to ensure accuracy after upload
    const checkAndRedirect = async () => {
      if (!selectedDay || !parentId || !challengeId) return;
      
      try {
        // Use cache for redirect check - this is not critical for UX and improves performance
        const { getDashboardData } = await import('@/lib/api/dashboard');
        const dashboardData = await getDashboardData(parentId, true); // Use cache
        
        if (dashboardData && dashboardData.week) {
          // Find days that still need UPLOAD only (excluding redemption day and the day we just uploaded)
          const daysNeedingUpload = dashboardData.week
            .filter(day => {
              if (day.isRedemptionDay) return false;
              if (day.date === selectedDay.dateStr) return false; // Exclude the day we just uploaded
              // Only days that need upload (missing)
              if (day.status === 'missing') return true;
              return false;
            });
          
          // If there are still days that need upload, don't redirect
          if (daysNeedingUpload.length > 0) {
            return;
          }
          
          // If no days left need upload, redirect to redemption
          // The redemption page will handle the approval status and show appropriate UI
          const redemptionUrl = parentId 
            ? generateRedemptionUrl(parentId, childId || undefined, challengeId || undefined)
            : `/child/redemption?lastEarnings=${coinsEarnedRounded}&weeklyTotal=${weeklyTotal}`;
          
          logger.log('All days uploaded, redirecting to redemption');
          
          setTimeout(() => {
            router.push(`${redemptionUrl}${redemptionUrl.includes('?') ? '&' : '?'}lastEarnings=${coinsEarnedRounded}&weeklyTotal=${weeklyTotal}`);
          }, 500); // Short delay to ensure state is saved
        }
      } catch (error) {
        logger.error('Error checking redirect condition:', error);
        // Don't redirect on error - better to stay on upload page
      }
    };
    
    checkAndRedirect();
  };


  // Helper functions for gender-based pronouns
  const getChildPronouns = () => {
    const isBoy = childGender === 'boy';
    return {
      you: isBoy ? 'אתה' : 'את',
      youPast: isBoy ? 'היית' : 'היית',
      youFuture: isBoy ? 'תוכל' : 'תוכלי',
      youWill: isBoy ? 'תרוויח' : 'תרוויחי',
      youStart: isBoy ? 'תתחיל' : 'תתחילי',
      youUpload: isBoy ? 'אתה מעלה' : 'את מעלה',
      youEarn: isBoy ? 'אתה מרוויח' : 'את מרוויחה',
      youGo: isBoy ? 'תעבור' : 'תעברי',
      youNeed: isBoy ? 'תצטרך' : 'תצטרכי',
      youWant: isBoy ? 'רוצה' : 'רוצה',
      youCan: isBoy ? 'יכול' : 'יכולה',
      youCanPlural: isBoy ? 'יכולים' : 'יכולות',
      youUploaded: isBoy ? 'העלית' : 'העלית',
      youAccumulated: isBoy ? 'צברת' : 'צברת',
      youStood: isBoy ? 'עמדת' : 'עמדת',
      youTry: isBoy ? 'נסה' : 'נסי',
      youTryAgain: isBoy ? 'נסה שוב' : 'נסי שוב',
      youSucceeded: isBoy ? 'הצלחת' : 'הצלחת',
      youWillMeet: isBoy ? 'תפגשו' : 'תפגשו',
      youWillWin: isBoy ? 'תוכל לזכות' : 'תוכלי לזכות',
      youAccumulatedWhat: isBoy ? 'צברת' : 'צברת',
      watchWithParent: isBoy ? 'צפה עם' : 'צפי עם'
    };
  };

  const getParentPronouns = () => {
    const isMom = parentGender === 'female';
    return {
      needs: isMom ? 'צריכה' : 'צריך',
      pronoun: isMom ? 'שלה' : 'שלו',
      willLook: isMom ? 'תסתכל' : 'יסתכל',
      willApprove: isMom ? 'ותאשר' : 'ויאשר'
    };
  };

  // If last day was uploaded, redirect immediately to redemption (don't show result screen)
  if (submitted && uploadResult && selectedDay && isLastDayToUpload) {
    // Already redirected in handleSubmit, but in case it didn't work, redirect here too
    return null; // Component will unmount and redirect
  }

  // Show result in the same form instead of separate screen
  if (submitted && uploadResult && selectedDay) {
    const weeklyTotal = (uploadResult as any).weeklyTotal || uploadResult.coinsEarned;
    const childP = getChildPronouns();
    const parentP = getParentPronouns();
    const isYesterday = selectedDay.displayText === 'אתמול';
    const isDayBeforeYesterday = selectedDay.displayText === 'שלשום';
    const parentName = uploadResult.parentName;
    
    // Format time with hours and minutes (with proper singular/plural)
    const screenTimeMinutes = (uploadResult as any).screenTimeMinutes || (uploadResult.screenTimeUsed * 60);
    const hoursInt = Math.floor(screenTimeMinutes / 60);
    const minutesInt = Math.round(screenTimeMinutes % 60);
    let timeText = '';
    if (hoursInt > 0 && minutesInt > 0) {
      const hoursText = hoursInt === 1 ? 'שעה' : 'שעות';
      const minutesText = minutesInt === 1 ? 'דקה' : 'דקות';
      timeText = `${hoursInt} ${hoursText} ו-${minutesInt} ${minutesText}`;
    } else if (hoursInt > 0) {
      const hoursText = hoursInt === 1 ? 'שעה' : 'שעות';
      timeText = `${hoursInt} ${hoursText}`;
    } else {
      const minutesText = minutesInt === 1 ? 'דקה' : 'דקות';
      timeText = `${minutesInt} ${minutesText}`;
    }

    let dayMessage = '';
    const coinsEarnedText = uploadResult.coinsEarned === 1 ? 'שקל' : 'שקלים';
    const weeklyTotalText = weeklyTotal === 1 ? 'שקל' : 'שקלים';
    if (isYesterday || isDayBeforeYesterday) {
      dayMessage = `${selectedDay.displayText} ${childP.youPast} ${timeText} בטלפון ו${childP.youSucceeded} לצבור ${formatNumber(uploadResult.coinsEarned)} ${coinsEarnedText}, סה"כ ${childP.youAccumulated} ${formatNumber(weeklyTotal)} ${weeklyTotalText} השבוע`;
    } else {
      dayMessage = `ביום ${selectedDay.dayName} ${childP.youPast} ${timeText} בטלפון ו${childP.youSucceeded} לצבור ${formatNumber(uploadResult.coinsEarned)} ${coinsEarnedText}, סה"כ ${childP.youAccumulated} ${formatNumber(weeklyTotal)} ${weeklyTotalText} השבוע`;
    }

    // Success message based on goal and gender
    const successMessage = uploadResult.success 
      ? `כל הכבוד! ${childP.youStood} ביעד!`
      : `${childP.youTry} מחר לעבוד יותר טוב!`;

    return (
      <div className="min-h-screen bg-transparent pb-24">
        <div className="max-w-md mx-auto px-4 py-8 relative">
          {/* Piggy Bank - פינה ימנית עליונה */}
          <div className="absolute right-0 top-0 z-0 pointer-events-none">
            <Image
              src="/piggy-bank.png"
              alt="Piggy Bank"
              width={120}
              height={120}
              className="object-contain w-28 h-28 sm:w-28 sm:h-28 md:w-34 md:h-34 max-w-[112px] sm:max-w-[112px] md:max-w-[136px]"
            />
          </div>
          <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 mt-20">
            <h1 className="font-varela font-semibold text-2xl text-[#262135] mb-4 text-center">
              הסטטוס הועלה!
            </h1>
            
            <div className="space-y-4">
              {/* If screen time is 0, show only the warning message */}
              {screenTimeMinutes === 0 ? (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-[12px] p-4">
                  <p className="font-varela text-sm text-[#262135] text-center leading-relaxed">
                    <strong>⚠️ שימו לב:</strong> זמן המסך שזוהה הוא 0 דקות. כנראה משהו לא עבד טוב בעיבוד התמונה. נחכה ש{parentName} {(() => {
                      const parentP = getParentPronouns();
                      return `${parentP.willLook} ${parentP.willApprove}`;
                    })()} את הנתון.
                  </p>
                </div>
              ) : (
                <>
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
                      {(() => {
                        const childP = getChildPronouns();
                        const parentP = getParentPronouns();
                        return (
                          <>
                            בכל מקרה {parentName} {parentP.needs} לאשר לך את הסטטוס ש{childP.youUploaded}!
                            <br />
                            בסוף השבוע {childP.youWillMeet} כאן ו{childP.youWillWin} במה ש{childP.youAccumulatedWhat}
                          </>
                        );
                      })()}
                    </p>
                  </div>
                </>
              )}

              {/* Refresh button to upload another day */}
              <div className="mt-6">
                <button
                  onClick={async () => {
                    setSubmitted(false);
                    setUploadResult(null);
                    setScreenshot(null);
                    setScreenshotPreview(null);
                    setSelectedDay(null);
                    setUploadStep(1);
                    setExtractedText('');
                    setOcrProgress('');
                    
                    // Reload week days to refresh the list
                    if (parentId) {
                      try {
                        const { getDashboardData } = await import('@/lib/api/dashboard');
                        const dashboardData = await getDashboardData(parentId, false); // Don't use cache
                        
                        if (dashboardData && dashboardData.week) {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          
                          const availableDays = dashboardData.week
                            .filter(day => {
                              if (day.isRedemptionDay) return false;
                              
                              // Parse date string to Date object
                              const [dayNum, monthNum] = day.date.split('/').map(Number);
                              const currentYear = new Date().getFullYear();
                              const dayDate = new Date(currentYear, monthNum - 1, dayNum);
                              dayDate.setHours(0, 0, 0, 0);
                              
                              // Check if day has ended (must be before today, not today or future)
                              if (dayDate >= today) return false;
                              
                              // Check if day hasn't been uploaded yet
                              return day.status === 'missing';
                            })
                            .map(day => {
                              // Parse date string to Date object
                              const [dayNum, monthNum] = day.date.split('/').map(Number);
                              const currentYear = new Date().getFullYear();
                              const date = new Date(currentYear, monthNum - 1, dayNum);
                              date.setHours(0, 0, 0, 0);
                              
                              // Find full day name (convert abbreviation to full name)
                              const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
                              const dayIndex = dayNames.findIndex(name => {
                                const dayAbbr = day.dayName;
                                const dayMap: { [key: string]: string } = {
                                  'א׳': 'ראשון',
                                  'ב׳': 'שני',
                                  'ג׳': 'שלישי',
                                  'ד׳': 'רביעי',
                                  'ה׳': 'חמישי',
                                  'ו׳': 'שישי',
                                  'ש׳': 'שבת'
                                };
                                return dayMap[dayAbbr] === name;
                              });
                              const fullDayName = dayIndex >= 0 ? dayNames[dayIndex] : day.dayName;
                              
                              const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
                              
                              let displayText = '';
                              if (daysDiff === 0) {
                                displayText = 'היום';
                              } else if (daysDiff === 1) {
                                displayText = 'אתמול';
                              } else if (daysDiff === 2) {
                                displayText = 'שלשום';
                              } else {
                                displayText = `${fullDayName}, ${day.date}`;
                              }
                              
                              return {
                                date,
                                dateStr: day.date,
                                dayName: fullDayName,
                                displayText
                              };
                            })
                            .sort((a, b) => a.date.getTime() - b.date.getTime());
                          
                          setWeekDays(availableDays);
                        }
                      } catch (error) {
                        logger.error('Error reloading week days:', error);
                      }
                    }
                  }}
                  className="w-full py-4 px-6 rounded-[18px] text-lg font-varela font-semibold bg-[#E6F19A] text-[#262135] hover:bg-opacity-80 transition-all"
                >
                  העלה יום נוסף
                </button>
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
              כנראה שכבר סיימת את השלב הזה, תפנה להורה שלך לקבל כתובת עדכנית.
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

  // Show error if challenge is inactive (redemption completed)
  if (challengeInactive) {
    return (
      <div className="min-h-screen bg-transparent pb-24">
        <div className="max-w-md mx-auto px-4 py-8 relative">
          {/* Piggy Bank - פינה ימנית עליונה */}
          <div className="absolute right-0 top-0 z-0 pointer-events-none">
            <Image
              src="/piggy-bank.png"
              alt="Piggy Bank"
              width={120}
              height={120}
              className="object-contain w-28 h-28 sm:w-28 sm:h-28 md:w-34 md:h-34 max-w-[112px] sm:max-w-[112px] md:max-w-[136px]"
            />
          </div>
          <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 mb-6 mt-20">
            <h1 className="font-varela font-semibold text-2xl text-[#262135] mb-4 text-center">
              האתגר הושלם
            </h1>
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-[12px] p-4 mb-4">
              <p className="font-varela text-base text-[#262135] text-center leading-relaxed mb-2">
                האתגר הושלם והפדיון בוצע.
              </p>
              <p className="font-varela text-sm text-[#262135] text-center leading-relaxed">
                {(() => {
                  const parentP = getParentPronouns();
                  const childP = getChildPronouns();
                  return `${parentName} ${parentP.needs} ליצור אתגר חדש כדי ש${childP.you} תוכל${childGender === 'girl' ? 'י' : ''} להמשיך להעלות סטטוסים.`;
                })()}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show message if challenge hasn't started yet
  if (challengeNotStarted) {
    const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const startDate = challengeStartDate ? new Date(challengeStartDate) : null;
    const startDayName = startDate ? dayNames[startDate.getDay()] : 'היום הראשון';
    const nextDayName = startDate
      ? dayNames[new Date(startDate.getTime() + 24 * 60 * 60 * 1000).getDay()]
      : 'היום שאחרי';
    const childP = getChildPronouns();
    
    return (
      <div className="min-h-screen bg-transparent pb-24">
        <div className="max-w-md mx-auto px-4 py-8 relative">
          {/* Piggy Bank - פינה ימנית עליונה */}
          <div className="absolute right-0 top-0 z-0 pointer-events-none">
            <Image
              src="/piggy-bank.png"
              alt="Piggy Bank"
              width={120}
              height={120}
              className="object-contain w-28 h-28 sm:w-28 sm:h-28 md:w-34 md:h-34 max-w-[112px] sm:max-w-[112px] md:max-w-[136px]"
            />
          </div>
          <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 mb-6 mt-20">
            <h1 className="font-varela font-semibold text-2xl text-[#262135] mb-4 text-center">
              האתגר מתחיל ממש מחר
            </h1>
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-[12px] p-4 mb-4 space-y-3">
              <p className="font-varela text-base text-[#262135] text-center leading-relaxed">
                {childP.you} מוכן? אנחנו מקווים מאוד שכן! משהו טוב עומד לקרות
              </p>
              <p className="font-varela text-sm text-[#262135] text-center leading-relaxed">
                את צילום זמן המסך שלך תוכל{childP.you === 'את' ? 'י' : ''} להעלות על יום שעבר כבר. ביום {nextDayName} תוכל{childP.you === 'את' ? 'י' : ''} להעלות את יום {startDayName}.
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
        <div className="absolute right-0 top-0 z-0 pointer-events-none">
          <Image
            src="/piggy-bank.png"
            alt="Piggy Bank"
            width={120}
            height={120}
            className="object-contain w-28 h-28 sm:w-28 sm:h-28 md:w-34 md:h-34 max-w-[112px] sm:max-w-[112px] md:max-w-[136px]"
          />
        </div>
        <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-6 mb-6 mt-20">
          <h1 className="font-varela font-semibold text-2xl text-[#262135] mb-2 text-center">
            עדכון זמן מסך
          </h1>

          {/* Progress indicator */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="font-varela text-sm text-[#948DA9]">שלב {uploadStep} מתוך 3</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#273143] h-2 rounded-full transition-all"
                style={{ width: `${(uploadStep / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: How to take screenshot with example image */}
            {uploadStep === 1 && (
              <div className="space-y-4">
                <h2 className="font-varela font-semibold text-lg text-[#262135] text-center">
                  איך לצלם את מסך זמן המסך?
                </h2>
                {deviceType === 'android' ? (
                  <>
                    <p className="font-varela text-base text-[#282743] text-center leading-relaxed">
                      בקשו מ{parentName} את צילום 'זמן המסך' בטלפון ככה שהגרף יראה בדיוק כמו בתמונה המצורפת
                    </p>
                    {/* Video link for Android - right after explanation */}
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setShowHelpModal(true)}
                        className="font-varela text-sm text-[#273143] underline hover:text-[#273143]/80"
                      >
                      {`${getChildPronouns().watchWithParent} ${parentName} בסרטון הדרכה לאנדרואיד`}
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="font-varela text-base text-[#282743] text-center leading-relaxed">
                    צלמו את מסך 'זמן המסך' בטלפון ככה שהגרף יראה בדיוק כמו בתמונה המצורפת
                  </p>
                )}
                
                {/* Example image - clickable to enlarge - 50% size */}
                <div className="relative w-full bg-gray-100 rounded-[12px] overflow-hidden flex justify-center items-center py-4">
                  <button
                    type="button"
                    onClick={() => setShowImageModal(true)}
                    className="cursor-pointer relative"
                    style={{ width: '50%', maxWidth: '200px' }}
                  >
                    <Image
                      src={deviceType === 'ios' ? '/screen-time-example-ios.jpeg' : '/screen-time-example-android.jpeg'}
                      alt="דוגמא לצילום מסך זמן מסך"
                      width={400}
                      height={300}
                      className="w-full h-auto object-contain"
                    />
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg font-varela text-xs">
                      לחץ להגדלה
                    </div>
                  </button>
                </div>

                {/* Video link for iOS - below image */}
                {deviceType === 'ios' && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowHelpModal(true)}
                      className="font-varela text-sm text-[#273143] underline hover:text-[#273143]/80"
                    >
                      צפה בסרטון הדרכה לאייפון
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setUploadStep(2)}
                  className="w-full py-4 px-6 rounded-[18px] text-lg font-varela font-semibold bg-[#273143] text-white hover:bg-opacity-90 transition-all"
                >
                  הבנתי, המשך
                </button>
              </div>
            )}

            {/* Step 2: Day Selection */}
            {uploadStep === 2 && (
              <div className="space-y-4">
                <h2 className="font-varela font-semibold text-lg text-[#262135] text-center">
                  {(() => {
                    const childP = getChildPronouns();
                    return `איזה יום ${childP.youUpload}?`;
                  })()}
                </h2>
                <p className="font-varela text-sm text-[#948DA9] text-center">
                  אפשר לבחור רק יום שכבר עבר
                </p>
                
                {selectableDays.length > 0 ? (
                  <select
                    value={selectedDay ? selectableDays.findIndex(d => d.dateStr === selectedDay.dateStr) : 0}
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
                ) : (
                  <div className="w-full py-3 px-4 rounded-[12px] border-2 border-gray-300 bg-gray-50 font-varela text-base text-[#948DA9] text-center">
                    אין ימים זמינים להעלאה
                  </div>
                )}

                {/* Last Day Warning - need parent nearby */}
                {showFridayWarning && selectedDay && (() => {
                  const parentName = challengeData.parentName || 'אמא';
                  const childP = getChildPronouns();
                  const parentP = getParentPronouns();
                  
                  return (
                    <div className="bg-gradient-to-br from-[#E6F19A] to-[#BBE9FD] border-2 border-[#E6F19A] rounded-[12px] p-4 shadow-sm">
                      <p className="font-varela text-base text-[#262135] text-center leading-relaxed font-bold mb-3">
                        🎉 התראה חגיגית!
                      </p>
                      <p className="font-varela text-sm text-[#262135] text-center leading-relaxed mb-3">
                        {childP.youUpload} סטטוס של {selectedDay.dayName} {selectedDay.dateStr} - זה היום האחרון שנשאר להעלות בשבוע! זה אומר שאוטוטו {childP.youEarn} את הזכייה {childGender === 'boy' ? 'שלך' : 'שלך'}!
                      </p>
                      <p className="font-varela text-sm text-[#262135] text-center leading-relaxed">
                        ודא ש{parentName} לידך כי אחרי ההעלאה {childP.youGo} למסך הפדיון שבו {childP.youNeed} את האישור של {parentName}.
                      </p>
                    </div>
                  );
                })()}

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setUploadStep(1)}
                    className="flex-1 py-4 px-6 rounded-[18px] border-2 border-gray-300 text-lg font-varela font-semibold text-[#282743] hover:bg-gray-50 transition-all"
                  >
                    חזרה
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Ensure selectedDay is set before proceeding
                      if (!selectedDay && selectableDays.length > 0) {
                        setSelectedDay(selectableDays[0]);
                        setTimeout(() => setUploadStep(3), 0);
                      } else {
                        setUploadStep(3);
                      }
                    }}
                    disabled={selectableDays.length === 0}
                    className={`flex-1 py-4 px-6 rounded-[18px] text-lg font-varela font-semibold transition-all ${
                      selectableDays.length > 0
                        ? 'bg-[#273143] text-white hover:bg-opacity-90'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    המשך
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Screenshot Upload */}
            {uploadStep === 3 && (
              <div className="space-y-4">
                <h2 className="font-varela font-semibold text-lg text-[#262135] text-center">
                  העלה צילום מסך של זמן מסך
                </h2>
                
                <div className="flex items-center justify-center mb-2">
                  <button
                    type="button"
                    onClick={() => setShowHelpModal(true)}
                    className="font-varela text-sm text-[#273143] underline hover:text-[#273143]/80"
                  >
                    {deviceType === 'android' ? `${getChildPronouns().watchWithParent} ${parentName} בסרטון הדרכה לאנדרואיד` : 'הסבר כיצד לצלם מסך'}
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

                {/* Processing overlay when submitting */}
                {isSubmitting ? (
                  <div className="mb-4 text-center">
                    <div className="font-varela text-lg text-[#262135] mb-4">{ocrProgress || 'מעבד תמונה...'}</div>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#262135] mx-auto"></div>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setUploadStep(2)}
                      className="flex-1 py-4 px-6 rounded-[18px] border-2 border-gray-300 text-lg font-varela font-semibold text-[#282743] hover:bg-gray-50 transition-all"
                    >
                      חזרה
                    </button>
                    <button
                      type="submit"
                      disabled={!screenshot || !selectedDay}
                      className={`flex-1 py-4 px-6 rounded-[18px] text-lg font-varela font-semibold transition-all ${
                        screenshot && selectedDay
                          ? 'bg-[#273143] text-white hover:bg-opacity-90'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      שלח סטטוס
                    </button>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Image Modal - for enlarging example image */}
        {showImageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setShowImageModal(false)}>
            <div className="bg-[#FFFCF8] rounded-[18px] shadow-card p-4 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-varela font-semibold text-xl text-[#262135]">
                  דוגמא לצילום מסך זמן מסך
                </h2>
                <button
                  onClick={() => setShowImageModal(false)}
                  className="text-[#948DA9] hover:text-[#282743] text-2xl"
                >
                  ×
                </button>
              </div>
              <Image
                src={deviceType === 'ios' ? '/screen-time-example-ios.jpeg' : '/screen-time-example-android.jpeg'}
                alt="דוגמא לצילום מסך זמן מסך"
                width={800}
                height={600}
                className="w-full h-auto object-contain rounded-lg"
              />
            </div>
          </div>
        )}
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

            {/* Video Container */}
            <div className="mb-4">
              <div className="relative w-full bg-gray-100 rounded-[12px] overflow-hidden" style={{ minHeight: '195px' }}>
                {deviceType === 'ios' ? (
                  <video
                    controls
                    className="w-full h-auto object-contain"
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
                    className="w-full h-auto object-contain"
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

