import cv2
import numpy as np
import json
import re
import sys
from typing import Dict, List, Optional, Any, Tuple
import os
from pathlib import Path

# Mock Gemini output when API key is empty
MOCK_GEMINI_OUTPUT = {
    "X-axis": [
        {"label": "שבת", "has_bar": False},
        {"label": "שישי", "has_bar": False},
        {"label": "חמישי", "has_bar": False},
        {"label": "רביעי", "has_bar": False},
        {"label": "שלישי", "has_bar": True},
        {"label": "שני", "has_bar": True},
        {"label": "ראשון", "has_bar": True}
    ],
    "Y-axisTopValue": "240"
}

# הגדרות קבועות
# צבעים לציור: BGR
COLOR_IOS = (255, 100, 0)  # כחול-כתום
COLOR_ANDROID_DARK = (0, 255, 255)  # צהוב
COLOR_ANDROID_LIGHT = (255, 100, 0)  # כחול-כתום
COLOR_RECLAIMED = (255, 0, 255)  # מג'נטה


def _draw_final_bars(image, bar_positions, detection_type, reclaimed_contours_bytes=None):
    """פונקציית עזר לציור הברים על תמונת הפלט הסופית."""
    debug_img = image.copy()
    
    if detection_type == "iOS":
        color = COLOR_IOS
    elif detection_type == "Android":
        color = COLOR_ANDROID_DARK
    elif detection_type == "Android-Light":
        color = COLOR_ANDROID_LIGHT
    else:
        color = (255, 255, 255)  # צבע ברירת מחדל
    
    # מיון לפי ציר X לצורך מספור נכון
    bar_positions.sort(key=lambda b: b['center_x'])
    
    for i, item in enumerate(bar_positions):
        x, y, w, h = item['bbox']
        
        # בחירת צבע הציור: מג'נטה למשוקם, רגיל לאחרים
        draw_color = color
        if reclaimed_contours_bytes and item.get('cnt') is not None:
            if item['cnt'].tobytes() in reclaimed_contours_bytes:
                draw_color = COLOR_RECLAIMED
        
        cv2.rectangle(debug_img, (x, y), (x + w, y + h), draw_color, 3)
        
        # סימון מספר מעמודה (או קודקוד לעמודות Light)
        if detection_type == "Android-Light":
            top_center_x = item['center_x']
            top_center_y = item['y_top']
            cv2.circle(debug_img, (top_center_x, top_center_y), 8, (0, 255, 0), -1)
            cv2.putText(debug_img, str(i+1), (top_center_x - 10, top_center_y - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        else:
            # מספר ממוקם מתחת לעמודה
            cv2.putText(debug_img, str(i+1), (x+w//2 - 10, y + h + 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
    
    return debug_img


def _process_contours_to_positions(final_contours, detection_type, reclaimed_contours_data=None):
    """ממיר רשימת קונטורים גולמיים לרשימת מילוני מיקום."""
    bar_positions = []
    
    # יצירת מזהה ייחודי לקונטורים המשוקמים לצורך סימון
    reclaimed_contours_bytes = set(d['cnt'].tobytes() for d in reclaimed_contours_data) if reclaimed_contours_data else set()
    
    for contour in final_contours:
        x, y, w, h = cv2.boundingRect(contour)
        cx = int(x + w / 2)
        cy = int(y + h / 2)
        
        item = {
            'center_x': cx,
            'center_y': cy,
            'y_top': y,
            'bbox': (x, y, w, h),
            'type': detection_type,
            'cnt': contour  # שמירת הקונטור לצורך זיהוי שחזור
        }
        bar_positions.append(item)
    
    return bar_positions, reclaimed_contours_bytes


## --- פונקציות זיהוי נפרדות ---

def detect_ios_bars(image, hsv):
    """שלב 1: זיהוי דפוסי iOS (סרגל כחול)."""
    lower_ios = np.array([85, 120, 120])
    upper_ios = np.array([105, 255, 255])
    mask_ios = cv2.inRange(hsv, lower_ios, upper_ios)
    contours_ios, _ = cv2.findContours(mask_ios, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    valid_ios = [c for c in contours_ios if cv2.contourArea(c) > 300]
    
    if len(valid_ios) >= 3:
        bar_positions, _ = _process_contours_to_positions(valid_ios, "iOS")
        return bar_positions
    return []


def detect_android_dark_bars(image, hsv):
    """שלב 2א: זיהוי דפוסי אנדרואיד (רקע כהה) עם לוגיקת שחזור."""
    
    img_width = image.shape[1]
    total_area = image.shape[0] * img_width
    
    RANGES = {
        "Dark": (np.array([100, 50, 100]), np.array([140, 255, 255])),
    }
    
    clean_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    close_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 15))
    best_candidates = []
    suspect_contours = []
    
    for _, (lower, upper) in RANGES.items():
        mask = cv2.inRange(hsv, lower, upper)
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, clean_kernel)
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, close_kernel)
        
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # 4. סינון המסגרת/רקע
        max_area = max([cv2.contourArea(c) for c in contours], default=0)
        max_area_contour_index = np.argmax([cv2.contourArea(c) for c in contours]) if contours else -1
        
        filtered_contours = []
        if max_area_contour_index != -1 and (max_area / total_area) > 0.8:
            for i, cnt in enumerate(contours):
                if i != max_area_contour_index:
                    filtered_contours.append(cnt)
        else:
            filtered_contours = contours
        
        # 5. סינון ראשוני (גודל ופרופורציה) - שמירת "חשודים"
        candidates = []
        suspect_contours = []
        
        for cnt in filtered_contours:
            x, y, w, h = cv2.boundingRect(cnt)
            area = cv2.contourArea(cnt)
            
            is_suspect = False
            reason = None
            
            if h < 5 or w < 5 or w > img_width * 0.9:
                reason = 'Size'
                is_suspect = True
            
            elif w > h * 2.5:
                reason = 'Ratio'
                is_suspect = True
            
            item = {'cnt': cnt, 'bottom': y + h, 'width': w, 'bbox': (x, y, w, h), 'area': area, 'reason': reason}
            
            if is_suspect:
                suspect_contours.append(item)
            else:
                candidates.append(item)
        
        if len(candidates) >= 3:
            best_candidates = candidates
            break
    
    if len(best_candidates) < 3:
        return [], []  # כשלון באנדרואיד כהה
    
    # 4. קיבוץ וסינון לפי קו בסיס (Baseline) - מציאת קו הבסיס המרכזי
    candidates = best_candidates
    candidates.sort(key=lambda k: k['bottom'])
    rows = []
    current_row = [candidates[0]]
    for i in range(1, len(candidates)):
        if candidates[i]['bottom'] - current_row[-1]['bottom'] < 30:
            current_row.append(candidates[i])
        else:
            rows.append(current_row)
            current_row = [candidates[i]]
    rows.append(current_row)
    
    best_row = max(rows, key=lambda r: sum(c['width'] for c in r), default=[])
    
    if not best_row:
        return [], []
    
    # 5. בדיקת אחידות רוחב (Uniform Width Check) וסינון סופי
    widths = [c['width'] for c in best_row]
    median_width = np.median(widths)
    baseline_y = np.median([c['bottom'] for c in best_row])
    
    final_contours = []
    
    for item in best_row:
        w = item['width']
        tolerance = max(12, median_width * 0.50)
        
        if abs(w - median_width) <= tolerance:
            final_contours.append(item['cnt'])
    
    # ==========================================
    # שלב 6: שחזור החשודים (Suspect Reclaiming)
    # ==========================================
    reclaimed_contours_data = []
    WIDTH_TOLERANCE = max(12, median_width * 0.50)
    BASELINE_TOLERANCE = 30
    
    for item in suspect_contours:
        w = item['width']
        
        is_width_ok = abs(w - median_width) <= WIDTH_TOLERANCE
        is_baseline_ok = abs(item['bottom'] - baseline_y) <= BASELINE_TOLERANCE
        
        if is_width_ok and is_baseline_ok:
            reclaimed_contours_data.append(item)
            final_contours.append(item['cnt'])
    
    # הכנה לפלט סופי - מיקום הבר
    bar_positions, reclaimed_contours_bytes = _process_contours_to_positions(final_contours, "Android", reclaimed_contours_data)
    
    return bar_positions, reclaimed_contours_bytes


def detect_android_light_bars(image, hsv):
    """שלב 2ב: זיהוי קשתות/כיפות לאנדרואיד עם רקע בהיר."""
    img_height = image.shape[0]
    img_width = image.shape[1]
    total_area = img_height * img_width
    clean_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (40, 1))
    
    # טווח צבע לרקע בהיר (טווח Light Mode)
    lower_light = np.array([90, 20, 20])
    upper_light = np.array([170, 255, 255])
    
    # 1. יצירת מסכה
    mask = cv2.inRange(hsv, lower_light, upper_light)
    
    # 2. הסרת קווים אופקיים
    horizontal_lines = cv2.morphologyEx(mask, cv2.MORPH_OPEN, horizontal_kernel)
    mask = cv2.subtract(mask, horizontal_lines)
    
    # 3. טיפול מורפולוגי - ניקוי רעש
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, clean_kernel)
    
    # 4. מציאת קונטורים
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # 5. סינון מסגרת/רקע
    max_area = max([cv2.contourArea(c) for c in contours], default=0)
    max_area_contour_index = np.argmax([cv2.contourArea(c) for c in contours]) if contours else -1
    filtered_contours = []
    
    if max_area_contour_index != -1 and (max_area / total_area) > 0.8:
        for i, cnt in enumerate(contours):
            if i != max_area_contour_index:
                filtered_contours.append(cnt)
    else:
        filtered_contours = contours
    
    # 6. ניתוח קונטורים וסינון קשתות
    dome_candidates = []
    
    for cnt in filtered_contours:
        x, y, w, h = cv2.boundingRect(cnt)
        area = cv2.contourArea(cnt)
        aspect_ratio = w / h if h > 0 else 0
        perimeter = cv2.arcLength(cnt, True)
        relative_y = y / img_height
        
        # תנאים לזיהוי קשת:
        if area < 100:
            continue
        if aspect_ratio < 2.0 or aspect_ratio > 10.0:
            continue
        if h < 5:
            continue
        if relative_y > 0.90:
            continue
        if w < 10 or w > img_width * 0.3:
            continue
        
        dome_candidates.append({
            'cnt': cnt,
            'center_x': x + w // 2,
            'top_y': y,
            'bbox': (x, y, w, h),
            'area': area,
            'aspect': aspect_ratio
        })
    
    if len(dome_candidates) >= 3:
        # 7. מיון לפי X
        dome_candidates.sort(key=lambda b: b['center_x'])
        
        bar_positions = [{
            'center_x': d['center_x'],
            'center_y': d['top_y'],
            'y_top': d['top_y'],
            'bbox': d['bbox'],
            'type': 'Android-Light',
            'cnt': d['cnt']  # שמירת הקונטור לצורך ציור
        } for d in dome_candidates]
        
        return bar_positions
    
    return []


## --- פונקציה ראשית ---

def detect_bars_positions(image):
    """
    מזהה את מיקומי העמודות בתמונה על ידי ניסיון לזהות דפוסי iOS,
    דפוסי אנדרואיד כהה (עם שחזור) או דפוסי אנדרואיד בהיר.
    הפלט מכיל רשימת מיקומי עמודות ותמונה ויזואלית של הברים שזוהו.
    """
    
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    
    # 1. ניסיון זיהוי iOS
    bar_positions_ios = detect_ios_bars(image, hsv)
    
    if bar_positions_ios:
        final_positions = bar_positions_ios
        detection_type = "iOS"
        reclaimed_contours_bytes = None
    else:
        # 2. ניסיון זיהוי אנדרואיד כהה
        bar_positions_android_dark, reclaimed_contours_bytes = detect_android_dark_bars(image, hsv)
        
        if len(bar_positions_android_dark) >= 3:
            final_positions = bar_positions_android_dark
            detection_type = "Android"
        else:
            # 3. ניסיון זיהוי אנדרואיד בהיר (Light Mode)
            bar_positions_android_light = detect_android_light_bars(image, hsv)
            
            if bar_positions_android_light:
                final_positions = bar_positions_android_light
                detection_type = "Android-Light"
                reclaimed_contours_bytes = None
            else:
                # כשלון סופי בזיהוי
                final_positions = []
                detection_type = "None"
                reclaimed_contours_bytes = None
    
    # יצירת תמונת הפלט הסופית עם הציורים
    final_debug_image = _draw_final_bars(image, final_positions, detection_type, reclaimed_contours_bytes)
    
    # הסרת הקונטור הגולמי (cnt) מהמילון לפני ההחזרה
    cleaned_final_positions = []
    for item in final_positions:
        cleaned_item = {k: v for k, v in item.items() if k != 'cnt'}
        cleaned_final_positions.append(cleaned_item)
    
    return cleaned_final_positions, final_debug_image


# ==================================
# 🚀 SinglePromptGraphExtractor (NEW)
# ==================================

class SinglePromptGraphExtractor:
    def __init__(self, google_api_key: str = None):
        self.model = None
        self.google_api_key = google_api_key
        self.use_mock = not google_api_key or google_api_key.strip() == ""
        
        if not self.use_mock:
            try:
                import google.generativeai as genai
                genai.configure(api_key=google_api_key)
                self.model = genai.GenerativeModel('gemini-flash-latest')
                print("✅ Gemini API מוגדר ומוכן.", file=sys.stderr)
            except Exception as e:
                print(f"🔥🔥🔥 שגיאה קריטית ב-INIT: לא ניתן להגדיר את Gemini API. {e}", file=sys.stderr)
                self.use_mock = True
        else:
            print("Using mock Gemini output (API key is empty)", file=sys.stderr)
        
        # Compilation of Regex for speed
        self.json_pattern = re.compile(r"\{.*\}", re.DOTALL)
    
    def _parse_gemini_response(self, text_response):
        """
        (חדש) מפענח את תגובת ה-JSON של המודל.
        הוא מחפש באופן יציב בלוק JSON גם אם יש טקסט מסביב.
        """
        print(f"📝 Gemini (Raw): {text_response}", file=sys.stderr)
        
        # נסה למצוא את בלוק ה-JSON, גם אם הוא עטוף ב-```json ... ```
        json_match = self.json_pattern.search(text_response)
        
        if not json_match:
            print("🔥🔥🔥 שגיאת פענוח: לא נמצא בלוק JSON בתגובה.", file=sys.stderr)
            return {"X-axis": [], "Y-axisTopValue": "JSON_PARSE_FAILED"}
        
        json_str = json_match.group(0)
        
        try:
            # פענח את ה-JSON
            parsed_data = json.loads(json_str)
            
            # ודא שהמפתחות הצפויים קיימים
            if "X-axis" not in parsed_data:
                parsed_data["X-axis"] = []
            if "Y-axisTopValue" not in parsed_data:
                parsed_data["Y-axisTopValue"] = "KEY_MISSING"
            
            return parsed_data
            
        except json.JSONDecodeError as e:
            print(f"🔥🔥🔥 שגיאת פענוח: ה-JSON שהתקבל אינו תקין. {e}", file=sys.stderr)
            return {"X-axis": [], "Y-axisTopValue": "JSON_DECODE_ERROR"}
    
    def _call_gemini_single_prompt(self, full_image):
        """
        (חדש) קורא ל-Gemini עם פרומפט יחיד על התמונה המלאה
        ומבקש פלט JSON.
        """
        if self.use_mock:
            print("Returning mock Gemini output", file=sys.stderr)
            return {'text_response': json.dumps(MOCK_GEMINI_OUTPUT)}
        
        if not self.model:
            print("🔥🔥🔥 קריאת API בוטלה: מודל Gemini לא אותחל.", file=sys.stderr)
            return {'text_response': '{"X-axis": [], "Y-axisTopValue": "MODEL_INIT_FAILED"}'}
        
        print(f"🤖 שולח בקשה יחידה ל-Gemini API (כל התמונה)...", file=sys.stderr)
        try:
            from PIL import Image
            image_pil = Image.fromarray(cv2.cvtColor(full_image, cv2.COLOR_BGR2RGB))
            
            prompt = (
                "You are an expert graph analyzer. Analyze the *entire* graph image.\n"
                "You have two tasks:\n"
                "1.  **X-Axis**: Identify ALL day-of-the-week labels (e.g., 'Sun', 'Mon', 'א', 'ב').\n"
                "    - **Format**: For EACH label found, map it to its full **Hebrew day name** (e.g., 'Sun' -> 'ראשון', 'Mon' -> 'שני', 'א' -> 'ראשון').\n"
                "    - **Order**: List these labels in the JSON array in strict visual order from **RIGHT-TO-LEFT** (starting with the rightmost label).\n"
                "    - **Status**: For EACH label, state if a colored bar is above it ('true') or if the space is empty ('false').\n"
                "\n"
                "2.  **Y-Axis**: Identify the *highest* numerical label shown on the Y-axis. This value represents a quantity of **minutes**. Extract *only* the numerical value you see (e.g., '120', '1.5k', '80').\n"
                "\n"
                "You MUST return *only* a single, valid JSON object in this exact format:\n"
                "{\n"
                "  \"X-axis\": [\n"
                "    {\"label\": \"שם_יום_עברי\", \"has_bar\": true/false}, \n"
                "    ... \n"
                "  ],\n"
                "  \"Y-axisTopValue\": \"TopValue\"\n"
                "}\n"
                "\n"
                "Example 1: Graph visually shows 'א(yes), ב(no)' from right-to-left.\n"
                "{\n"
                "  \"X-axis\": [\n"
                "    {\"label\": \"ראשון\", \"has_bar\": true},\n"
                "    {\"label\": \"שני\", \"has_bar\": false}\n"
                "  ],\n"
                "  \"Y-axisTopValue\": \"120\"\n"
                "}\n"
                "\n"
                "Example 2: Graph visually shows 'Sun(yes), Mon(no)' from left-to-right. Your output *must* be right-to-left.\n"
                "{\n"
                "  \"X-axis\": [\n"
                "    {\"label\": \"שני\", \"has_bar\": false},\n"
                "    {\"label\": \"ראשון\", \"has_bar\": true}\n"
                "  ],\n"
                "  \"Y-axisTopValue\": \"100\"\n"
                "}\n"
                "Do not add any text before or after the JSON object."
            )
            
            response = self.model.generate_content([prompt, image_pil])
            return {'text_response': response.text}
            
        except Exception as e:
            print(f"🔥🔥🔥 שגיאה קריטית בקריאה ל-Gemini API: {e}", file=sys.stderr)
            return {'text_response': '{"X-axis": [], "Y-axisTopValue": "API_CALL_FAILED"}'}
    
    def extract_graph_data(self, image):
        """
        (פונקציה ראשית משוכתבת)
        מפעילה קריאת API יחידה ומפענחת את ה-JSON.
        """
        img = image
        
        # --- 🚀 בדיקת הגנה ---
        if self.use_mock:
            return MOCK_GEMINI_OUTPUT
        
        if not self.model:
            print("🔥🔥🔥 בוטל: מודל Gemini לא אותחל כראוי (בדוק API key).", file=sys.stderr)
            return {"X-axis": [], "Y-axisTopValue": "MODEL_INIT_FAILED"}
        
        # --- Process 1: Single API Call ---
        gemini_response = self._call_gemini_single_prompt(img)
        
        # --- Process 2: Parse Response ---
        final_output = self._parse_gemini_response(gemini_response['text_response'])
        
        print("✅ חילוץ נתונים הושלם.", file=sys.stderr)
        return final_output


# ==================================
# Main processing function (UPDATED)
# ==================================

def extract_graph_labels(image, google_api_key: str = None):
    """
    פונקציה ראשית חדשה המשתמשת ב-SinglePromptGraphExtractor
    כדי לחלץ את כל הנתונים בקריאה אחת.
    """
    detector = SinglePromptGraphExtractor(google_api_key)
    # קבל את הפלט הסופי
    final_output = detector.extract_graph_data(image)
    
    # הדפס את הפלט הסופי בפורמט JSON יפה
    print("\n✅ Final Extracted Data (JSON Output):", file=sys.stderr)
    print(json.dumps(final_output, indent=2, ensure_ascii=False), file=sys.stderr)
    
    if not final_output.get("X-axis") and "FAILED" in final_output.get("Y-axisTopValue", "FAILED"):
        print("\n❌ Could not extract any data from the graph.", file=sys.stderr)
    
    return final_output


def _load_image(path: str) -> Optional[np.ndarray]:
    """ טוען תמונה, עם fallback ל-PIL עבור פורמטים בעייתיים """
    img = cv2.imread(path)
    if img is None:
        try:
            from PIL import Image
            pil_img = Image.open(path).convert('RGB')
            img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
        except Exception as e:
            print(f"Error loading image: {e}", file=sys.stderr)
            return None
    return img


def _cluster_lines(lines: List[np.ndarray], orientation: str = 'horizontal') -> List[int]:
    """ מקבץ מקטעי קווים לקווים בודדים על ידי מיצוע """
    if not lines:
        return []
    sort_index = 1 if orientation == 'horizontal' else 0
    lines.sort(key=lambda line: line[0][sort_index])
    clustered_lines = []
    current_cluster = [lines[0][0][sort_index]]
    last_pos = lines[0][0][sort_index]
    for line in lines[1:]:
        pos = line[0][sort_index]
        if abs(pos - last_pos) < 10:
            current_cluster.append(pos)
        else:
            clustered_lines.append(int(np.mean(current_cluster)))
            current_cluster = [pos]
        last_pos = pos
    if current_cluster:
        clustered_lines.append(int(np.mean(current_cluster)))
    return clustered_lines


# --- 💡 שינוי: פונקציית עזר V5 💡 ---
# 1. נוסף hough_params דינמי
# 2. קרנל מורפולוגי הוגדל ל-(1, 80)
def _find_graph_grid_internal(
    img: np.ndarray,
    canny_thresholds: Tuple[int, int],
    use_morphology: bool = False,
    hough_params: Optional[Dict[str, int]] = None  # 💡 תוספת חדשה
) -> Dict[str, List[int]]:
    """
    פונקציית עזר פנימית לזיהוי רשת עם ערכי סף דינמיים,
    מורפולוגיה, ופרמטרי Hough דינמיים.
    """
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    
    # --- *** תוספת חדשה *** ---
    if use_morphology:
        # 💡 שינוי: קרנל (גרעין) אופקי רחב יותר לחיבור מקטעים רחוקים
        kernel = np.ones((1, 80), np.uint8)  # הועלה מ-30
        gray = cv2.morphologyEx(gray, cv2.MORPH_CLOSE, kernel)
    
    # 1. השתמש ב-Canny Edge Detection
    edges = cv2.Canny(gray, canny_thresholds[0], canny_thresholds[1])
    
    # 2. השתמש ב-Hough Line Transform
    # --- 💡 שינוי: הגדרת פרמטרים גמישים ---
    default_hough = {
        'threshold': 20,
        'minLineLength': w // 10,  # ברירת מחדל: 10% מרוחב המסך
        'maxLineGap': 30
    }
    if hough_params:
        # דרוס את ברירות המחדל עם הפרמטרים שסופקו
        default_hough.update(hough_params)
    
    lines = cv2.HoughLinesP(
        edges,
        rho=1,
        theta=np.pi / 180,
        threshold=default_hough['threshold'],
        minLineLength=default_hough['minLineLength'],
        maxLineGap=default_hough['maxLineGap']
    )
    
    if lines is None:
        return {'horizontal': [], 'vertical': []}
    
    horizontal_lines = []
    vertical_lines = []
    
    # 3. סנן ומיין
    for line in lines:
        x1, y1, x2, y2 = line[0]
        if abs(y1 - y2) < 10:
            horizontal_lines.append(line)
        elif abs(x1 - x2) < 10:
            vertical_lines.append(line)
    
    # 4. קבץ
    clustered_horizontal = _cluster_lines(horizontal_lines, 'horizontal')
    clustered_vertical = _cluster_lines(vertical_lines, 'vertical')
    
    return {
        'horizontal': clustered_horizontal,
        'vertical': clustered_vertical
    }


# --- 💡 שינוי: פונקציה מרכזית (ארכיטקטורה V9 - הטיית מיקום אגרסיבית) 💡 ---

def find_graph_area(img: np.ndarray) -> Optional[Dict[str, Any]]:
    """
    V9 Updates:
    1. Threshold Update: "Kill Zone" ירד מ-0.82 ל-0.75.
    2. Aggressive Penalty: העונש הוחמר מ-0.2 ל-0.1.
    3. Center/Top Boost: בונוס קטן לאשכולות בחלק העליון של המסך.
    """
    print("--- Starting Graph Area Detection (V9: Aggressive Footer Filter) ---", file=sys.stderr)
    image_height, image_width = img.shape[:2]
    Y_MIN_BOUND = image_height * 0.10
    Y_MAX_BOUND = image_height * 0.98
    
    strategies = [
        {'name': 'Pass 1: Standard', 'canny': (50, 150), 'morph': False, 'hough': None},
        {'name': 'Pass 2: Sensitive', 'canny': (20, 60), 'morph': False, 'hough': None},
        {'name': 'Pass 3: Dark Mode', 'canny': (5, 25), 'morph': False, 'hough': None},
        {'name': 'Pass 4: Android/Dotted', 'canny': (10, 30), 'morph': True, 'hough': {
            'minLineLength': image_width // 20,
            'maxLineGap': 60
        }}
    ]
    
    all_passes_candidates = []
    all_lines_debug = set()
    all_vertical_debug = set()
    
    MIN_SPACING = 25  # סובלני יותר
    MAX_LINES_IN_CLUSTER = 9
    
    for s in strategies:
        grid_data = _find_graph_grid_internal(
            img,
            s['canny'],
            use_morphology=s['morph'],
            hough_params=s['hough']
        )
        
        lines_sorted = sorted(grid_data['horizontal'])
        all_lines_debug.update(lines_sorted)
        all_vertical_debug.update(grid_data['vertical'])
        
        if len(lines_sorted) < 3:
            continue
        
        best_cluster_this_pass = None
        best_score_this_pass = 0
        DELTA_TOLERANCE = 6
        
        for i in range(len(lines_sorted)):
            line_start = lines_sorted[i]
            if not (Y_MIN_BOUND < line_start < Y_MAX_BOUND):
                continue
            
            for j in range(i + 1, len(lines_sorted)):
                line_next = lines_sorted[j]
                delta = line_next - line_start
                if not (MIN_SPACING < delta < 300):
                    continue
                
                current_cluster = [line_start, line_next]
                current_line = line_next
                
                for k in range(j + 1, len(lines_sorted)):
                    next_line_candidate = lines_sorted[k]
                    expected_line = current_line + delta
                    if abs(next_line_candidate - expected_line) < DELTA_TOLERANCE:
                        current_cluster.append(next_line_candidate)
                        current_line = next_line_candidate
                    elif next_line_candidate > expected_line + DELTA_TOLERANCE:
                        break
                
                if len(current_cluster) >= 3:
                    if len(current_cluster) > MAX_LINES_IN_CLUSTER:
                        continue
                    
                    actual_deltas = np.diff(current_cluster)
                    std_dev = np.std(actual_deltas)
                    # Base Score
                    base_score = (pow(len(current_cluster), 3) * 100) / (std_dev + 0.5)
                    
                    # --- 🛡️ V9: מיקום יחסי 🛡️ ---
                    cluster_bottom_relative = current_cluster[-1] / image_height
                    
                    # ברירת מחדל
                    location_multiplier = 1.0
                    if cluster_bottom_relative > 0.75:
                        # 🛑 Kill Zone: Footer area (Bottom 25%)
                        location_multiplier = 0.1
                    elif cluster_bottom_relative > 0.65:
                        # ⚠️ Danger Zone: Lower third (Android graphs live here sometimes)
                        location_multiplier = 0.8
                    else:
                        # ✅ Safe Zone: Top/Center (Bonus)
                        location_multiplier = 1.2
                    
                    final_score = base_score * location_multiplier
                    
                    if final_score > best_score_this_pass:
                        best_score_this_pass = final_score
                        best_cluster_this_pass = {
                            'cluster': current_cluster,
                            'score': final_score,
                            'type': f'{len(current_cluster)}-line',
                            'pass_name': s['name'],
                            'loc_debug': f"{cluster_bottom_relative:.2f}"  # Debug info
                        }
        
        if best_cluster_this_pass:
            all_passes_candidates.append(best_cluster_this_pass)
    
    # --- סיכום ---
    debug_grid_data = {
        'horizontal': sorted(list(all_lines_debug)),
        'vertical': sorted(list(all_vertical_debug))
    }
    
    if not all_passes_candidates:
        print("\n   > ❌ FAILURE: All passes failed.", file=sys.stderr)
        return {
            'y_top': None,
            'y_bottom': None,
            'lines': [],
            'avg_delta': 0,
            'all_grid_data': debug_grid_data
        }
    
    best_candidate = max(all_passes_candidates, key=lambda x: x['score'])
    best_cluster = best_candidate['cluster']
    
    y_top = min(best_cluster)
    y_bottom = max(best_cluster)
    avg_delta = np.median(np.diff(best_cluster))
    
    print(f"\n--- 🏆 WINNER: {best_candidate['pass_name']} ---", file=sys.stderr)
    print(f"   > Lines: {len(best_cluster)}", file=sys.stderr)
    print(f"   > Rel Position: {best_candidate['loc_debug']}", file=sys.stderr)
    print(f"   > Score: {best_candidate['score']:.1f}", file=sys.stderr)
    
    return {
        'y_top': y_top,
        'y_bottom': y_bottom,
        'lines': best_cluster,
        'avg_delta': avg_delta,
        'all_grid_data': debug_grid_data
    }


def calculate_minutes_for_day(image_path: str, target_day: str, google_api_key: str = None) -> Dict[str, Any]:
    """
    מחשב כמה דקות שימוש היו ביום ספציפי מתוך צילום מסך של גרף.
    הפונקציה חותכת את התמונה, מנתחת את הברים, ומנרמלת את הקואורדינטות
    של ראשי הברים בחזרה לתמונה המקורית לצורך חישוב מדויק.
    """
    # 1. טעינת התמונה
    img = _load_image(image_path)
    if img is None:
        return {"error": "Image could not be loaded"}
    
    image_height, image_width = img.shape[:2]
    print(f"\n--- 🚀 Starting Analysis for Day: {target_day} ---", file=sys.stderr)
    
    # 2. זיהוי רשת הגרף (קואורדינטות מקוריות)
    grid_info = find_graph_area(img)
    
    if grid_info['y_bottom'] is None or grid_info['y_top'] is None:
        return {"error": "Failed to detect graph grid lines"}
    
    zero_line_y = int(grid_info['y_bottom'])  # Y מקורי לקו האפס
    max_line_y = int(grid_info['y_top'])  # Y מקורי לקו המקסימום
    
    # --- הגדרת החיתוך ---
    crop_top = max(0, max_line_y - 50)
    crop_bottom = min(image_height, zero_line_y + 100)
    
    # יצירת התמונה החתוכה
    cropped_img = img[crop_top:crop_bottom, 0:image_width]
    
    # 3. חילוץ סמנטי באמצעות Gemini (משתמש ב-cropped_img)
    extractor = SinglePromptGraphExtractor(google_api_key)
    semantic_data = extractor.extract_graph_data(cropped_img)
    
    # ניקוי והמרת הערך העליון
    try:
        raw_top_value = str(semantic_data.get('Y-axisTopValue', '0'))
        clean_val = re.sub(r"[^\d\.]", "", raw_top_value)
        max_value_minutes = float(clean_val) if clean_val else 0
    except ValueError:
        max_value_minutes = 0
    
    # 4. חישוב פקטור המרה (Minutes per Pixel) - משתמש בקואורדינטות מקוריות
    pixel_span = zero_line_y - max_line_y
    scale_minutes_per_px = max_value_minutes / pixel_span if pixel_span > 0 and max_value_minutes > 0 else 0
    
    print(f"⚖️ Scale Factor: {scale_minutes_per_px:.4f} minutes/pixel", file=sys.stderr)
    
    # 5. זיהוי פיזי של העמודות (משתמש ב-cropped_img)
    detected_bars_cropped, debug_img_cropped = detect_bars_positions(cropped_img)
    
    # מיון העמודות מימין-לשמאל (R-to-L)
    bars_rtl = sorted(detected_bars_cropped, key=lambda b: b['center_x'], reverse=True)
    
    print(f"👀 Vision: Detected {len(bars_rtl)} bars (sorted Right-to-Left)", file=sys.stderr)
    
    # 6. מיפוי (Mapping) וחישוב
    day_value_map = {}
    labels_rtl = semantic_data.get("X-axis", [])
    bar_index = 0
    
    for label_obj in labels_rtl:
        day_name = label_obj.get('label')
        has_bar = label_obj.get('has_bar')
        
        calculated_minutes = 0.0
        bar_pixel_height = 0
        
        if has_bar:
            if bar_index < len(bars_rtl):
                current_bar = bars_rtl[bar_index]
                
                # ה-y_top של הבר הוא בתוך התמונה החתוכה
                bar_top_y_cropped = current_bar['y_top']
                
                # 💡 הנירמול: החזרת הקואורדינטה למערכת הייחוס המקורית!
                bar_top_y_normalized = bar_top_y_cropped + crop_top
                
                # חישוב גובה העמודה בפיקסלים ביחס לקו האפס המקורי
                # (zero_line_y הוא הקואורדינטה המקורית של קו האפס)
                bar_pixel_height = zero_line_y - bar_top_y_normalized
                
                # המרה לדקות
                calculated_minutes = bar_pixel_height * scale_minutes_per_px
                
                bar_index += 1
            else:
                print(f"⚠️ Mismatch: Label '{day_name}' expects a bar, but no more physical bars found.", file=sys.stderr)
        
        day_value_map[day_name] = {
            "minutes": round(calculated_minutes, 1),
            "pixels": bar_pixel_height
        }
    
    # 7. הצגת התוצאה עבור היום המבוקש (ללא שינוי)
    result_data = day_value_map.get(target_day)
    
    if result_data:
        final_minutes = result_data['minutes']
        print(f"\n🎯 === RESULT for '{target_day}' ===", file=sys.stderr)
        print(f"   Values: {final_minutes} minutes", file=sys.stderr)
        print(f"   Calculation: {result_data['pixels']}px height * {scale_minutes_per_px:.4f} scale", file=sys.stderr)
    else:
        final_minutes = 0
        print(f"\n❌ Day '{target_day}' not found in graph data.", file=sys.stderr)
    
    # 8. בניית תמונת דיבוג בגודל מלא (ללא שינוי)
    if debug_img_cropped is not None:
        img[crop_top:crop_bottom, 0:image_width] = debug_img_cropped
        final_debug_img = img
    else:
        final_debug_img = None
    
    # 9. החזרת אובייקט תשובה מפורט (ללא שינוי)
    return {
        "target_day": target_day,
        "minutes": final_minutes,
        "raw_max_value": max_value_minutes,
        "zero_line_y_original": zero_line_y,
        "pixels_height": result_data['pixels'] if result_data else 0,
        "scale_factor": scale_minutes_per_px,
        "full_map": day_value_map,
        "debug_image": final_debug_img
    }


# ==========================================
# GraphTelemetryService - Wrapper for compatibility
# ==========================================

class GraphTelemetryService:
    def __init__(self, google_api_key: str):
        """
        Initialize the service with the API key.
        """
        self.google_api_key = google_api_key
        self.use_mock = not google_api_key or google_api_key.strip() == ""
        
        if not self.use_mock:
            try:
                import google.generativeai as genai
                genai.configure(api_key=google_api_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash')
            except ImportError:
                print("Warning: google.generativeai not available, using mock data", file=sys.stderr)
                self.use_mock = True
        else:
            print("Using mock Gemini output (API key is empty)", file=sys.stderr)
        
        # Compilation of Regex for speed
        self.num_pattern = re.compile(r"[^\d\.]")
        self.json_pattern = re.compile(r"\{.*\}", re.DOTALL)
    
    def process_day(self, image_input, target_day: str) -> Dict[str, Any]:
        """
        Main entry point.
        image_input: Can be a file path (str) or numpy array.
        """
        # Convert numpy array to file path if needed
        if isinstance(image_input, np.ndarray):
            # For numpy arrays, we'll process directly
            # Save to temp file or process in memory
            import tempfile
            with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_file:
                cv2.imwrite(tmp_file.name, image_input)
                temp_path = tmp_file.name
            try:
                result = calculate_minutes_for_day(temp_path, target_day, self.google_api_key)
            finally:
                os.unlink(temp_path)
            return result
        elif isinstance(image_input, str):
            result = calculate_minutes_for_day(image_input, target_day, self.google_api_key)
            # Convert to old format for compatibility
            return {
                "day": result.get("target_day", target_day),
                "minutes": result.get("minutes", 0),
                "found": result.get("minutes", 0) > 0 or target_day in result.get("full_map", {}),
                "metadata": {
                    "scale_min_per_px": result.get("scale_factor", 0),
                    "max_val_y": result.get("raw_max_value", 0)
                }
            }
        else:
            return {"error": "Invalid image input"}


# ==========================================
# Helper function to load .env.local
# ==========================================

def _load_env_local() -> Dict[str, str]:
    """
    מחפש וקורא את קובץ .env.local מהתיקייה הראשית של הפרויקט.
    מחפש במיקומים הבאים:
    1. תיקיית הפרויקט (2 רמות מעלה מ-services/graph-telemetry)
    2. תיקיית services/graph-telemetry
    3. תיקייה נוכחית
    """
    env_vars = {}
    
    # מצא את התיקייה הראשית של הפרויקט
    current_file = Path(__file__).resolve()
    project_root = current_file.parent.parent.parent  # services/graph-telemetry -> services -> project root
    
    # רשימת מיקומים לבדיקה
    search_paths = [
        project_root / '.env.local',
        current_file.parent / '.env.local',
        Path.cwd() / '.env.local',
    ]
    
    for env_path in search_paths:
        if env_path.exists() and env_path.is_file():
            try:
                print(f"📁 Loading .env.local from: {env_path}", file=sys.stderr)
                with open(env_path, 'r', encoding='utf-8') as f:
                    for line in f:
                        line = line.strip()
                        # דלג על שורות ריקות והערות
                        if not line or line.startswith('#'):
                            continue
                        # פרסר KEY=VALUE
                        if '=' in line:
                            key, value = line.split('=', 1)
                            key = key.strip()
                            value = value.strip().strip('"').strip("'")
                            env_vars[key] = value
                print(f"✅ Loaded {len(env_vars)} variables from .env.local", file=sys.stderr)
                break
            except Exception as e:
                print(f"⚠️ Warning: Could not read .env.local from {env_path}: {e}", file=sys.stderr)
    
    return env_vars


# ==========================================
# CLI Entry Point
# ==========================================
if __name__ == "__main__":
    import argparse
    import sys
    
    # Fix Windows console encoding for Hebrew characters
    if sys.platform == 'win32':
        # Set stdout to UTF-8 encoding
        if hasattr(sys.stdout, 'reconfigure'):
            sys.stdout.reconfigure(encoding='utf-8')
        if hasattr(sys.stderr, 'reconfigure'):
            sys.stderr.reconfigure(encoding='utf-8')
    
    parser = argparse.ArgumentParser(description='Process screen time screenshot')
    parser.add_argument('image_path', help='Path to the screenshot image')
    parser.add_argument('target_day', help='Target Hebrew day name (e.g., ראשון)')
    parser.add_argument('--api-key', help='Google API Key (optional, uses mock if empty)', default='')
    
    args = parser.parse_args()
    
    # Load .env.local first
    env_local = _load_env_local()
    
    # Get API Key: argument > .env.local > environment variable
    api_key = args.api_key or env_local.get("GOOGLE_API_KEY", "") or os.environ.get("GOOGLE_API_KEY", "")
    
    service = GraphTelemetryService(api_key)
    result = service.process_day(args.image_path, args.target_day)
    
    # Output JSON to stdout with UTF-8 encoding
    # Always write to stdout buffer to avoid Windows encoding issues
    try:
        json_output = json.dumps(result, indent=2, ensure_ascii=False)
        # Write directly to stdout buffer with UTF-8 encoding (bypasses console encoding)
        sys.stdout.buffer.write(json_output.encode('utf-8'))
        sys.stdout.buffer.write(b'\n')
        sys.stdout.buffer.flush()
    except (UnicodeEncodeError, AttributeError, OSError) as e:
        # Fallback: use ASCII-safe JSON (Hebrew will be escaped as \uXXXX)
        try:
            json_output_ascii = json.dumps(result, indent=2, ensure_ascii=True)
            sys.stdout.buffer.write(json_output_ascii.encode('utf-8'))
            sys.stdout.buffer.write(b'\n')
            sys.stdout.buffer.flush()
        except Exception:
            # Last resort: write to stderr (which might have different encoding)
            print(json.dumps(result, indent=2, ensure_ascii=True), file=sys.stderr)
