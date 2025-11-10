'use client';

import { useState } from 'react';

interface DayTime {
  dayIndex: number;
  dayName: string;
  hours: number;
  minutes: number;
  totalHours: number;
}

interface GraphArea {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}

interface DayPosition {
  dayIndex: number;
  x: number;
  dayName: string;
}

interface HourScale {
  y: number;
  hours: number;
}

const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
const dayAbbreviations = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
const dayAbbreviationsEng = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const dayNamesEng = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ==================== Utility Functions ====================

const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

const preprocessImage = (img: HTMLImageElement): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; imageData: ImageData } => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return { canvas, ctx, imageData };
};

/**
 * זיהוי רקע - אגנוסטי ל-dark/light mode
 * רקע = שחור, אפור, או לבן
 */
const isBackgroundPixel = (r: number, g: number, b: number): boolean => {
  // שחור (dark mode)
  if (r < 30 && g < 30 && b < 30) return true;
  
  // לבן (light mode)
  if (r > 225 && g > 225 && b > 225) return true;
  
  // אפור - chroma נמוך (הפרש קטן בין RGB)
  const maxc = Math.max(r, g, b);
  const minc = Math.min(r, g, b);
  const chroma = maxc - minc;
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  
  // אפור = chroma נמוך ולבהירות בינונית
  if (chroma <= 20 && luma >= 50 && luma <= 240) return true;
  
  return false;
};

/**
 * זיהוי פיקסל עמודה - כל צבע חוץ מרקע
 * אגנוסטי לצבעים - כל מה שלא רקע = עמודה
 */
const isBarPixel = (r: number, g: number, b: number): boolean => {
  return !isBackgroundPixel(r, g, b);
};

/**
 * זיהוי קו רשת אופקי
 */
const isGridLinePixel = (r: number, g: number, b: number): boolean => {
  // קו רשת = אפור או רקע
  return isBackgroundPixel(r, g, b);
};

/**
 * המרת RGB ל-HSV
 */
const rgbToHsv = (r: number, g: number, b: number): { h: number; s: number; v: number } => {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    switch (max) {
      case rNorm:
        h = 60 * (((gNorm - bNorm) / d) % 6);
        break;
      case gNorm:
        h = 60 * ((bNorm - rNorm) / d + 2);
        break;
      default:
        h = 60 * ((rNorm - gNorm) / d + 4);
        break;
    }
  }
  if (h < 0) h += 360;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  return { h, s, v };
};

/**
 * זיהוי קו ממוצע והתעלמות ממנו
 * קו ממוצע = ירוק או אפור עם בהירות מסוימת
 */
const isAverageLinePixel = (r: number, g: number, b: number): boolean => {
  const { h, s, v } = rgbToHsv(r, g, b);
  const v255 = v * 255;
  
  // ירוק (קו ממוצע) - hue בין 100-150
  const isGreen = h >= 100 && h <= 150 && s >= 0.3 && v255 >= 100 && v255 <= 200;
  
  // אפור (קו ממוצע) - chroma נמוך
  const maxc = Math.max(r, g, b);
  const minc = Math.min(r, g, b);
  const chroma = maxc - minc;
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const isGray = chroma <= 25 && luma >= 100 && luma <= 200;
  
  return isGreen || isGray;
};

// ==================== OCR - זיהוי גבולות הגרף ====================

/**
 * זיהוי גבולות הגרף מ-OCR
 * גבול תחתון = אותיות הימים
 * גבול עליון = הקו הרציף העליון ביותר
 */
function detectGraphBoundaries(
  ocrText: string,
  imageData: ImageData,
  canvas: HTMLCanvasElement
): GraphArea {
  const data = imageData.data;
  const width = canvas.width;
  const height = canvas.height;
  
  // 1. מציאת גבול עליון - הקו הרציף העליון ביותר
  let topY = 0;
  for (let y = 0; y < height; y++) {
    let continuousLineCount = 0;
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      // בדיקה אם זה קו רשת או קו גבול
      if (isGridLinePixel(r, g, b) || isBarPixel(r, g, b)) {
        continuousLineCount++;
      }
    }
    
    // אם יש קו רציף (יותר מ-50% מהרוחב)
    if (continuousLineCount > width * 0.5) {
      topY = y;
      break;
    }
  }
  
  // 2. מציאת גבול תחתון - חיפוש שורה עם אותיות ימים ב-OCR
  // נסרוק מלמטה למעלה למציאת אזור עם ימים
  let bottomY = height - 1;
  const lines = ocrText.split('\n');
  
  // חיפוש שורה עם אותיות ימים
  for (const line of lines) {
    const hasHebrewDay = dayAbbreviations.some(abbr => line.includes(abbr));
    const hasEnglishDay = dayAbbreviationsEng.some(abbr => line.includes(abbr));
    
    if (hasHebrewDay || hasEnglishDay) {
      // מצאנו שורה עם ימים - נחפש את האזור הזה בתמונה
      // (בפועל, נשתמש ב-OCR bounding boxes אם זמינים)
      // לעת עתה, נשתמש בגישה פשוטה: חיפוש אזור עם טקסט בתחתית
      break;
    }
  }
  
  // 3. מציאת גבולות אופקיים - חיפוש אזור עם עמודות
  let leftX = width;
  let rightX = 0;
  let minY = height;
  let maxY = 0;
  
  for (let y = topY; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      if (isBarPixel(r, g, b)) {
        if (x < leftX) leftX = x;
        if (x > rightX) rightX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  
  // אם לא מצאנו עמודות, נשתמש באזור מרכזי
  if (leftX >= rightX) {
    leftX = Math.floor(width * 0.1);
    rightX = Math.floor(width * 0.9);
  }
  
  // גבול תחתון = maxY או bottomY (הנמוך יותר)
  bottomY = Math.min(maxY + 50, height - 1);
  
  return {
    left: Math.max(0, leftX - 20),
    right: Math.min(width - 1, rightX + 20),
    top: topY,
    bottom: bottomY,
    width: Math.min(width - 1, rightX + 20) - Math.max(0, leftX - 20) + 1,
    height: bottomY - topY + 1
  };
}

/**
 * זיהוי שנתות ימים וסקאלת שעות מ-OCR + Fallback לזיהוי פיקסלים
 */
function detectScaleFromOCR(
  ocrText: string,
  graphArea: GraphArea,
  imageData: ImageData,
  canvas: HTMLCanvasElement
): { dayPositions: DayPosition[]; hourScale: HourScale[] } {
  const lines = ocrText.split('\n');
  const dayPositions: DayPosition[] = [];
  const hourScale: HourScale[] = [];
  
  // 1. זיהוי שנתות ימים (ציר X) מ-OCR - תמיכה ב-3 אותיות
  let foundDaysInOCR = false;
  
  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    const hebrewAbbr = dayAbbreviations[dayIndex];
    const englishAbbr = dayAbbreviationsEng[dayIndex];
    const englishFull = dayNamesEng[dayIndex];
    const english3Letters = englishFull.substring(0, 3); // Sun, Mon, Tue, etc.
    
    // חיפוש היום בטקסט - גם 3 אותיות וגם אות אחת
    for (const line of lines) {
      const normalizedLine = line.toUpperCase().replace(/\s/g, '');
      
      // חיפוש 3 אותיות (Tue, Wed, Thu, etc.)
      if (normalizedLine.includes(english3Letters.toUpperCase())) {
        foundDaysInOCR = true;
        // נחפש את כל הימים בשורה (3 אותיות)
        const daySequence3 = line.match(/(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat)/gi) || [];
        const dayIndexInLine = daySequence3.findIndex((d: string) => 
          d.toUpperCase().substring(0, 3) === english3Letters.toUpperCase()
        );
        
        if (dayIndexInLine >= 0) {
          // הערכת מיקום X על סמך סדר הימים
          const estimatedX = graphArea.left + (dayIndexInLine * (graphArea.width / 7));
          dayPositions.push({
            dayIndex,
            x: Math.floor(estimatedX),
            dayName: dayNames[dayIndex]
          });
        }
        break;
      }
      
      // חיפוש אות אחת (S, M, T, W, T, F, S) או עברית
      if (normalizedLine.includes(hebrewAbbr) || normalizedLine.includes(englishAbbr)) {
        foundDaysInOCR = true;
        // נחפש את כל הימים בשורה
        const daySequence = line.match(/[SMTWFא-ת]/gi) || [];
        const dayIndexInLine = daySequence.findIndex((d: string) => 
          d.toUpperCase() === hebrewAbbr || d.toUpperCase() === englishAbbr
        );
        
        if (dayIndexInLine >= 0) {
          // הערכת מיקום X על סמך סדר הימים
          const estimatedX = graphArea.left + (dayIndexInLine * (graphArea.width / 7));
          dayPositions.push({
            dayIndex,
            x: Math.floor(estimatedX),
            dayName: dayNames[dayIndex]
          });
        }
        break;
      }
    }
  }
  
  // Fallback: אם לא מצאנו ימים ב-OCR, נשתמש בזיהוי פיקסלים - חלוקה אחידה
  if (dayPositions.length === 0 || !foundDaysInOCR) {
    // נחפש את מיקומי העמודות על סמך פיקסלים
    const data = imageData.data;
    const width = canvas.width;
    const xProjection: number[] = new Array(graphArea.width).fill(0);
    
    // X projection - ספירת פיקסלי עמודות לכל X
    for (let x = graphArea.left; x <= graphArea.right; x++) {
      let count = 0;
      for (let y = graphArea.top; y <= graphArea.bottom; y++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        if (isBarPixel(r, g, b)) {
          count++;
        }
      }
      xProjection[x - graphArea.left] = count;
    }
    
    // מציאת 7 פסגות (peaks) - מרכזי העמודות
    const peaks: number[] = [];
    const threshold = Math.max(5, Math.max(...xProjection) * 0.3);
    
    for (let i = 1; i < xProjection.length - 1; i++) {
      if (xProjection[i] > threshold && 
          xProjection[i] > xProjection[i - 1] && 
          xProjection[i] > xProjection[i + 1]) {
        peaks.push(i + graphArea.left);
      }
    }
    
    // אם מצאנו פסגות, נשתמש בהן. אחרת, חלוקה אחידה
    if (peaks.length >= 5) {
      // מיון פסגות לפי X
      peaks.sort((a, b) => a - b);
      
      // אם יש יותר מ-7, ניקח את ה-7 הראשונות
      const selectedPeaks = peaks.slice(0, 7);
      
      // מיפוי ל-7 ימים
      for (let i = 0; i < 7; i++) {
        if (i < selectedPeaks.length) {
          dayPositions.push({
            dayIndex: i,
            x: selectedPeaks[i],
            dayName: dayNames[i]
          });
        } else {
          // אם חסרים, נשתמש בחלוקה אחידה
          const spacing = graphArea.width / 8;
          dayPositions.push({
            dayIndex: i,
            x: Math.floor(graphArea.left + spacing * (i + 1)),
            dayName: dayNames[i]
          });
        }
      }
    } else {
      // חלוקה אחידה
      for (let i = 0; i < 7; i++) {
        const spacing = graphArea.width / 8;
        dayPositions.push({
          dayIndex: i,
          x: Math.floor(graphArea.left + spacing * (i + 1)),
          dayName: dayNames[i]
        });
      }
    }
  }
  
  // 2. זיהוי סקאלת שעות (ציר Y) - חיפוש מספרים + h/m/שע/דק
  // התעלמות מ-"avg", "ממוצ'", "average"
  const ignorePatterns = [/avg/gi, /average/gi, /ממוצ/gi, /ממוצע/gi];
  const cleanedOcrText = ignorePatterns.reduce((text, pattern) => 
    text.replace(pattern, ''), ocrText
  );
  
  // דפוסים לחיפוש: שעות, דקות, עברית
  const timePatterns = [
    // שעות באנגלית: "6h", "1h", "hours"
    /(\d+(?:\.\d+)?)\s*h(?:ours?)?/gi,
    // דקות באנגלית: "40m", "20m", "minutes"
    /(\d+(?:\.\d+)?)\s*m(?:in(?:utes?)?)?/gi,
    // שעות בעברית: "4 שע'", "שעות"
    /(\d+(?:\.\d+)?)\s*שע(?:ות?|['׳])?/gi,
    // דקות בעברית: "40 דק'", "דקות"
    /(\d+(?:\.\d+)?)\s*דק(?:ות?|['׳])?/gi,
    // מספרים בודדים (יכול להיות "0" או "6")
    /\b(\d+)\b/g,
  ];
  
  const foundValues: { value: number; unit: 'hours' | 'minutes' }[] = [];
  
  for (const pattern of timePatterns) {
    let match;
    while ((match = pattern.exec(cleanedOcrText)) !== null) {
      const value = parseFloat(match[1]);
      if (value >= 0 && value <= 24) {
        let unit: 'hours' | 'minutes' = 'hours';
        
        // זיהוי יחידה
        if (pattern.source.includes('m') || pattern.source.includes('דק')) {
          unit = 'minutes';
        }
        
        // המרת דקות לשעות
        const hours = unit === 'minutes' ? value / 60 : value;
        
        // בדיקה אם כבר יש לנו את הערך הזה
        const exists = foundValues.some(v => Math.abs(v.value - hours) < 0.01);
        if (!exists) {
          foundValues.push({ value: hours, unit });
        }
      }
    }
  }
  
  // מציאת הערך המקסימלי (בשעות)
  const maxHours = foundValues.length > 0 
    ? Math.max(...foundValues.map(v => v.value))
    : 6; // default 6h
  
  // Fallback: זיהוי על סמך קווי רשת
  const data = imageData.data;
  const width = canvas.width;
  const gridLines: number[] = [];
  
  // חיפוש קווי רשת אופקיים
  for (let y = graphArea.top; y <= graphArea.bottom; y++) {
    let gridLineCount = 0;
    for (let x = graphArea.left; x <= graphArea.right; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      if (isGridLinePixel(r, g, b)) {
        gridLineCount++;
      }
    }
    if (gridLineCount > graphArea.width * 0.3) {
      gridLines.push(y);
    }
  }
  
  gridLines.sort((a, b) => a - b);
  
  // יצירת סקאלה - תחתית = 0, עליון = maxHours
  hourScale.push({ y: graphArea.bottom, hours: 0 });
  
  // אם יש קווי רשת, נשתמש בהם
  if (gridLines.length >= 2) {
    // קו תחתון = 0
    hourScale.push({ y: gridLines[gridLines.length - 1], hours: 0 });
    // קו עליון = maxHours
    hourScale.push({ y: gridLines[0], hours: maxHours });
    
    // אם יש קווי רשת נוספים, נחלק ביניהם
    if (gridLines.length > 2) {
      const step = maxHours / (gridLines.length - 1);
      for (let i = 1; i < gridLines.length - 1; i++) {
        const hours = maxHours - (i * step);
        hourScale.push({ y: gridLines[i], hours });
      }
    }
  } else {
    // Fallback: רק תחתית ועליון
    hourScale.push({ y: graphArea.top, hours: maxHours });
  }
  
  // מיון לפי Y
  hourScale.sort((a, b) => a.y - b.y);
  
  return { dayPositions, hourScale };
}

// ==================== Canvas - ניתוח עמודות ====================

/**
 * מציאת גבולות עמודה על ציר X
 * איפה נגמר הצבע והופך לרקע
 */
function findBarBoundariesX(
  dayPosition: DayPosition,
  graphArea: GraphArea,
  imageData: ImageData,
  canvas: HTMLCanvasElement
): { left: number; right: number; center: number } {
  const data = imageData.data;
  const width = canvas.width;
  const startX = dayPosition.x;
  
  // חיפוש שמאלה - איפה מתחיל הצבע (או נגמר הרקע)
  let leftX = startX;
  for (let x = startX; x >= graphArea.left; x--) {
    let hasBarColor = false;
    let hasBackground = false;
    
    // בדיקה על כמה שורות
    for (let y = graphArea.top; y <= graphArea.bottom; y += 5) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      if (isBarPixel(r, g, b)) {
        hasBarColor = true;
      }
      if (isBackgroundPixel(r, g, b)) {
        hasBackground = true;
      }
    }
    
    // אם יש רק רקע, זה הגבול
    if (!hasBarColor && hasBackground) {
      leftX = x + 1;
      break;
    }
    
    if (x === graphArea.left) {
      leftX = x;
      break;
    }
  }
  
  // חיפוש ימינה - איפה נגמר הצבע
  let rightX = startX;
  for (let x = startX; x <= graphArea.right; x++) {
    let hasBarColor = false;
    let hasBackground = false;
    
    for (let y = graphArea.top; y <= graphArea.bottom; y += 5) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      if (isBarPixel(r, g, b)) {
        hasBarColor = true;
      }
      if (isBackgroundPixel(r, g, b)) {
        hasBackground = true;
      }
    }
    
    if (!hasBarColor && hasBackground) {
      rightX = x - 1;
      break;
    }
    
    if (x === graphArea.right) {
      rightX = x;
      break;
    }
  }
  
  const centerX = Math.floor((leftX + rightX) / 2);
  
  return { left: leftX, right: rightX, center: centerX };
}

/**
 * ספירת פיקסלים צבעוניים לאורך ציר Y
 * עד שזה הופך לרקע
 * תוך התעלמות מקו ממוצע וקווי רשת
 */
function countBarPixelsY(
  centerX: number,
  graphArea: GraphArea,
  imageData: ImageData,
  canvas: HTMLCanvasElement
): number {
  const data = imageData.data;
  const width = canvas.width;
  let pixelCount = 0;
  
  // סריקה מלמטה למעלה
  for (let y = graphArea.bottom; y >= graphArea.top; y--) {
    const idx = (y * width + centerX) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    
    // התעלמות מקו ממוצע
    if (isAverageLinePixel(r, g, b)) {
      continue; // דלג על קו ממוצע
    }
    
    // התעלמות מקווי רשת
    if (isGridLinePixel(r, g, b)) {
      continue; // דלג על קווי רשת
    }
    
    // התעלמות מרקע
    if (isBackgroundPixel(r, g, b)) {
      // הגענו לרקע - עוצרים
      break;
    }
    
    // אם זה פיקסל עמודה (לא רקע, לא קו ממוצע, לא קו רשת)
    if (isBarPixel(r, g, b)) {
      pixelCount++;
    }
  }
  
  return pixelCount;
}

/**
 * חישוב שעות על סמך כמות פיקסלים ויחס הקליברציה
 */
function calculateHoursFromPixels(
  pixelCount: number,
  graphArea: GraphArea,
  hourScale: HourScale[]
): number {
  if (pixelCount === 0) return 0;
  
  // חישוב יחס: כמה שעות לכל פיקסל
  const maxHours = hourScale.length > 0 
    ? Math.max(...hourScale.map(s => s.hours))
    : 4; // default
  
  const graphHeight = graphArea.bottom - graphArea.top;
  if (graphHeight === 0) return 0;
  
  const hoursPerPixel = maxHours / graphHeight;
  
  // כמות השעות = כמות פיקסלים * יחס
  const hours = pixelCount * hoursPerPixel;
  
  return Math.max(0, Math.min(hours, maxHours));
}

/**
 * ניתוח עמודה פשוט - לפי האלגוריתם המפושט
 */
function analyzeBarForDay(
  dayIndex: number,
  dayPositions: DayPosition[],
  graphArea: GraphArea,
  imageData: ImageData,
  canvas: HTMLCanvasElement,
  hourScale: HourScale[]
): number {
  // מציאת מיקום היום
  const dayPosition = dayPositions.find(d => d.dayIndex === dayIndex);
  if (!dayPosition) return 0;
  
  // 1. מציאת גבולות עמודה על ציר X
  const { center } = findBarBoundariesX(dayPosition, graphArea, imageData, canvas);
  
  // 2. ספירת פיקסלים צבעוניים לאורך ציר Y
  const pixelCount = countBarPixelsY(center, graphArea, imageData, canvas);
  
  // 3. אם אין פיקסלים, זה יום עם ערך 0
  if (pixelCount === 0) return 0;
  
  // 4. חישוב שעות על סמך יחס הקליברציה
  const hours = calculateHoursFromPixels(pixelCount, graphArea, hourScale);
  
  return hours;
}

// ==================== Main Component ====================

function ScreenTimeAnalyzer() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [dayTime, setDayTime] = useState<DayTime | null>(null);
  const [error, setError] = useState<string>('');

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setExtractedText('');
      setDayTime(null);
      setSelectedDay(null);
      setError('');
    }
  };

  const analyzeImage = async (imageFile: File, dayIndex: number) => {
    setIsProcessing(true);
    setProgress('מתחיל ניתוח תמונה...');
    setError('');

    try {
      // 1. Load image
      setProgress('טוען תמונה...');
      const img = await loadImage(imageFile);

      // 2. Preprocess
      setProgress('מעבד תמונה...');
      const { canvas, ctx, imageData } = preprocessImage(img);

      // 3. Perform OCR - רק על אזור הגרף עם הגדלה ושיפור קונטרסט
      setProgress('מבצע OCR...');
      let ocrText = '';
      try {
        // חיתוך אזור מרכזי (הנחה שהגרף במרכז)
        const graphCanvas = document.createElement('canvas');
        const graphCtx = graphCanvas.getContext('2d');
        if (!graphCtx) throw new Error('Could not get graph canvas context');
        
        // הרחבת אזור כדי לכלול תוויות
        const expandedLeft = Math.max(0, Math.floor(canvas.width * 0.1));
        const expandedRight = Math.min(canvas.width - 1, Math.floor(canvas.width * 0.9));
        const expandedTop = Math.max(0, Math.floor(canvas.height * 0.1));
        const expandedBottom = Math.min(canvas.height - 1, Math.floor(canvas.height * 0.9));
        
        const expandedWidth = expandedRight - expandedLeft + 1;
        const expandedHeight = expandedBottom - expandedTop + 1;
        
        // הגדלת התמונה פי 3 כדי לשפר זיהוי טקסט קטן
        const scaleFactor = 3;
        graphCanvas.width = expandedWidth * scaleFactor;
        graphCanvas.height = expandedHeight * scaleFactor;
        
        // שיפור איכות הרינדור
        graphCtx.imageSmoothingEnabled = true;
        graphCtx.imageSmoothingQuality = 'high';
        
        // ציור התמונה בגדול
        graphCtx.drawImage(
          canvas,
          expandedLeft, expandedTop, expandedWidth, expandedHeight,
          0, 0, expandedWidth * scaleFactor, expandedHeight * scaleFactor
        );
        
        // שיפור קונטרסט לטקסט קטן
        const imageData = graphCtx.getImageData(0, 0, graphCanvas.width, graphCanvas.height);
        const data = imageData.data;
        
        // הגדלת קונטרסט
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // אם זה פיקסל כהה (טקסט), נהפוך אותו לשחור יותר
          // אם זה פיקסל בהיר (רקע), נהפוך אותו לבהיר יותר
          const brightness = (r + g + b) / 3;
          const contrast = 1.5; // הגדלת קונטרסט
          
          if (brightness < 128) {
            // טקסט כהה - נהפוך לשחור יותר
            data[i] = Math.max(0, Math.min(255, r * contrast));
            data[i + 1] = Math.max(0, Math.min(255, g * contrast));
            data[i + 2] = Math.max(0, Math.min(255, b * contrast));
          } else {
            // רקע בהיר - נהפוך לבהיר יותר
            data[i] = Math.max(0, Math.min(255, 255 - (255 - r) * contrast));
            data[i + 1] = Math.max(0, Math.min(255, 255 - (255 - g) * contrast));
            data[i + 2] = Math.max(0, Math.min(255, 255 - (255 - b) * contrast));
          }
        }
        
        graphCtx.putImageData(imageData, 0, 0);
        
        const { createWorker } = await import('tesseract.js');
        const worker = await createWorker('heb+eng', 1, {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setProgress(`מנתח תמונה... ${Math.round(m.progress * 100)}%`);
            }
          }
        });
        
        // הגדרת פרמטרים לטקסט קטן - כולל 3 אותיות לימים ועברית
        await worker.setParameters({
          tessedit_char_whitelist: '0123456789SM TWFhSunMonTueWedThuFriSatאב גדה וש',
        });
        
        const { data: { text } } = await worker.recognize(graphCanvas);
        await worker.terminate();
        ocrText = text;
        setExtractedText(text);
      } catch (ocrError) {
        console.warn('OCR failed, continuing with pixel analysis:', ocrError);
      }

      // 4. Detect graph boundaries from OCR
      setProgress('מזהה גבולות גרף...');
      const graphArea = detectGraphBoundaries(ocrText, imageData, canvas);

      // 5. Detect scale from OCR + pixel analysis
      setProgress('מזהה סקאלה...');
      const { dayPositions, hourScale } = detectScaleFromOCR(ocrText, graphArea, imageData, canvas);

      // 6. Analyze bar for selected day
      setProgress(`מנתח יום ${dayNames[dayIndex]}...`);
      const hours = analyzeBarForDay(dayIndex, dayPositions, graphArea, imageData, canvas, hourScale);

      // 7. Format result
      const hoursInt = Math.floor(hours);
      const minutes = Math.round((hours - hoursInt) * 60);
      setDayTime({
        dayIndex,
        dayName: dayNames[dayIndex],
        hours: hoursInt,
        minutes,
        totalHours: hours
      });

      setProgress('סיום עיבוד');
    } catch (err) {
      console.error('Processing error:', err);
      setError('אירעה שגיאה בעיבוד התמונה');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="font-varela font-semibold text-3xl text-[#262135] mb-6 text-center">
          בדיקת עיבוד תמונה - Screen Time
        </h1>
        
        <div className="bg-white rounded-[18px] shadow-card p-6 mb-6">
          <div className="mb-4">
            <label className="block font-varela text-base text-[#282743] mb-2">
              בחר תמונה:
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#BBE9FD] file:text-[#262135] hover:file:bg-[#E6F19A]"
              disabled={isProcessing}
            />
          </div>
          
          {imagePreview && (
            <div className="mb-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-full h-auto rounded-lg border border-gray-200"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block font-varela text-base text-[#282743] mb-2">
              בחר יום לניתוח:
            </label>
            <select
              value={selectedDay ?? ''}
              onChange={(e) => setSelectedDay(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg font-varela text-[#282743]"
              disabled={!imageFile || isProcessing}
            >
              <option value="">-- בחר יום --</option>
              {dayNames.map((dayName, index) => (
                <option key={index} value={index}>
                  {dayName}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={() => imageFile && selectedDay !== null && analyzeImage(imageFile, selectedDay)}
            disabled={!imageFile || selectedDay === null || isProcessing}
            className="w-full py-3 px-6 bg-[#BBE9FD] text-[#262135] font-varela font-semibold rounded-full hover:bg-[#E6F19A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? progress : 'עבד תמונה'}
          </button>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          {extractedText && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-varela font-semibold text-[#262135] mb-2">טקסט מזוהה (OCR):</h3>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap">{extractedText}</pre>
            </div>
          )}
        </div>
        
        {dayTime && (
          <div className="bg-white rounded-[18px] shadow-card p-6">
            <h2 className="font-varela font-semibold text-xl text-[#262135] mb-4">
              תוצאות עיבוד - {dayTime.dayName}:
            </h2>
            <div className="space-y-2">
              <p className="font-varela text-[#282743]">
                <span className="font-semibold">שעות:</span> {dayTime.hours}
              </p>
              <p className="font-varela text-[#282743]">
                <span className="font-semibold">דקות:</span> {dayTime.minutes}
              </p>
              <p className="font-varela text-[#282743]">
                <span className="font-semibold">סה"כ:</span> {dayTime.totalHours.toFixed(2)} שעות
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScreenTimeAnalyzer;
