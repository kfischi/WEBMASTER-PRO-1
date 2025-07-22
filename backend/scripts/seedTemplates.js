// backend/scripts/seedTemplates.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// קונפיגורציה של dotenv כדי לטעון משתני סביבה מה-.env בתיקיית ה-backend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// הגדרות Supabase שלך (מהקובץ .env של ה-backend)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // חשוב: השתמש במפתח ה-SERVICE_ROLE שלך!

// וודא שמשתני הסביבה קיימים
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('שגיאה: SUPABASE_URL או SUPABASE_SERVICE_KEY חסרים בקובץ .env');
  console.error('ודא שיש לך קובץ .env בתיקיית ה-backend עם המפתחות הללו.');
  process.exit(1);
}

// יצירת קליינט Supabase עם מפתח ה-SERVICE_ROLE (יש לו הרשאות מלאות)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// מערך של 12 התבניות עם כל הנתונים והפרומפטים ל-AI
const templatesToSeed = [
  {
    name: 'ד"ר מיכל רוזן - רפואה אסתטית',
    slug: 'dr-michel-rosen',
    description: 'קליניקה לרפואה אסתטית מתקדמת',
    preview_image_url: 'https://webmasterproapp.com/demos/dr-michel-rosen/img/preview.jpg',
    category: 'רפואה אסתטית',
    price: 280000,
    is_premium: true,
    initial_ai_prompt: 'אתה מומחה לבניית אתרי אינטרנט בקליניקות לרפואה אסתטית.\nהמשימה שלך היא ליצור קוד HTML, CSS ו-JavaScript מלא עבור אתר אינטרנט מקצועי, חדשני ואמין, בהתבסס על הסגנון והאווירה של התבנית "ד"ר מיכל רוזן - רפואה אסתטית".\n\nהאתר צריך לכלול:\n1.  **סקשן הירו (Hero Section):** עם כותרת ראשית, כותרת משנה, כפתור קריאה לפעולה (כולל וואטסאפ), ורקע מתאים.\n2.  **סקשן אודות:** מידע על הרופאה/הקליניקה, עם כותרת, פסקאות תוכן ותמונה.\n3.  **סקשן שירותים:** רשימת השירותים העיקריים המוצעים (לדוגמה: מילוי קמטים, בוטוקס, פיסול פנים, אנטי-אייג\'ינג), עם אייקונים, שמות, תיאורים קצרים ומחירים.\n4.  **גלריית טיפולים:** תצוגה של תמונות לפני/אחרי או תמונות מהקליניקה.\n5.  **סקשן המלצות:** עדויות מלקוחות מרוצים, עם ציטוט, שם הלקוח ודירוג כוכבים.\n6.  **סקשן צור קשר:** פרטי התקשרות מלאים (כתובת, טלפון, אימייל, שעות פעילות), מפה (אם רלוונטי), וטופס יצירת קשר מפורט.\n7.  **פוטר:** עם קישורי ניווט חשובים וזכויות יוצרים.\n8.  **כפתורי וואטסאפ/טלפון צפים.\n\n**עקרונות עיצוב שיש ליישם:**\n* **צבעים:** השתמש בגוונים של חום-אדמה, ברונזה, וקרם (כפי שמופיע בתבנית המקורית של ד"ר מיכל רוזן).\n* **פונטים:** שילוב פונטים אלגנטיים ומקצועיים (כמו Heebo ו-Assistant/Montserrat מהתבנית המקורית).\n* **סגנון:** נקי, יוקרתי, אסתטי, ומשרה ביטחון.\n* **רספונסיביות:** וודא שהאתר מותאם באופן מושלם לכל המכשירים (מובייל, טאבלט, דסקטופ).\n* **קוד נקי:** הקפד על קוד HTML5, CSS3, ו-JavaScript (נטרטיבי) נקי, מאורגן, ומוטב לביצועים ו-SEO.\n\n**הימנע מ:**\n* שום תוכן placeholder (מילוי מקום) שאינו מפורט בנתוני העסק.\n\n**בהמשך, תקבל נתונים ספציפיים על העסק מהלקוח, ותצטרך להטמיע אותם בקוד שתייצר.'
  },
  {
    name: 'דני פיט - מאמן כושר',
    slug: 'danny-fit',
    description: 'מאמן כושר אישי מקצועי - אימונים אישיים וקבוצתיים',
    preview_image_url: 'https://webmasterproapp.com/demos/danny-fit/img/preview.jpg',
    category: 'כושר וספורט',
    price: 220000,
    is_premium: true,
    initial_ai_prompt: 'אתה מומחה לבניית אתרי אינטרנט למאמני כושר אישיים.\nהמשימה שלך היא ליצור קוד HTML, CSS ו-JavaScript מלא עבור אתר אינטרנט מקצועי, דינמי ומניע לפעולה, בהתבסס על הסגנון והאווירה של התבנית "דני פיט - מאמן כושר".\n\nהאתר צריך לכלול:\n1.  **סקשן הירו (Hero Section):** עם כותרת ראשית חזקה, כותרת משנה מעוררת השראה, סטטיסטיקות מרשימות (שנות ניסיון, לקוחות מרוצים, אחוזי הצלחה), וכפתורי קריאה לפעולה (כולל וואטסאפ).\n2.  **סקשן שירותים:** הצגת שירותי אימון מגוונים (אימון אישי, קבוצתי, אונליין, הכנה לתחרויות, הרזיה/עיצוב, שיקום/חיזוק), עם אייקונים, תיאורים קצרים, מחירים ומשך אימון.\n3.  **סקשן תוכניות אימון:** פירוט תוכניות אימון מדורגות (לדוגמה: Starter, Pro, Elite), עם תכונות בולטות ומחירים חודשיים.\n4.  **סקשן אודות:** מידע על המאמן (ניסיון, הסמכות, פילוסופיית אימון), עם פסקאות תוכן ואישורים/תעודות בולטות (כמו בוגר מדעי הספורט, הסמכות בינלאומיות).\n5.  **סקשן סיפורי הצלחה:** עדויות מלקוחות עם סיפור אישי, תוצאות מספריות (לדוגמה: ירידה במשקל, עלייה במסת שריר), שם הלקוח, גיל/מקצוע ודירוג כוכבים.\n6.  **סקשן צור קשר:** פרטי התקשרות מלאים (מיקום, טלפונים, אימייל, שעות פעילות), וטופס יצירת קשר מפורט עם שדות רלוונטיים (שם, טלפון, גיל, רמת ניסיון, שירות מבוקש, מטרות).\n7.  **פוטר:** עם קישורי ניווט חשובים וזכויות יוצרים.\n8.  **כפתורי וואטסאפ/טלפון צפים (אם רלוונטי).\n\n**עקרונות עיצוב שיש ליישם:**\n* **צבעים:** השתמש בגוונים של אדום, כתום כחול כהה (כפי שמופיע בתבנית המקורית של דני פיט).\n* **פונטים:** שילוב פונטים חזקים וספורטיביים (כמו Heebo ו-Assistant מהתבנית המקורית).\n* **סגנון:** אנרגטי, מניע לפעולה, מקצועי, ומשדר כוח ובריאות.\n* **רספונסיביות:** וודא שהאתר מותאם באופן מושלם לכל המכשירים (מובייל, טאבלט, דסקטופ).\n* **קוד נקי:** הקפד על קוד HTML5, CSS3, ו-JavaScript (נטרטיבי) נקי, מאורגן, ומוטב לביצועים ו-SEO.\n\n**הימנע מ:**\n* שום תוכן placeholder (מילוי מקום) שאינו מפורט בנתוני העסק.\n\n**בהמשך, תקבל נתונים ספציפיים על העסק מהלקוח, ותצטרך להטמיע אותם בקוד שתייצר.'
  },
  {
    name: 'סטודיו אוהם - יוגה ומדיטציה',
    slug: 'studio-ohm',
    description: 'מרחב של שלווה, איזון ותנועה מודעת בלב תל אביב',
    preview_image_url: 'https://webmasterproapp.com/demos/studio-ohm/img/preview.jpg',
    category: 'יוגה ומדיטציה',
    price: 190000,
    is_premium: true,
    initial_ai_prompt: 'אתה מומחה לבניית אתרי אינטרנט לסטודיו ליוגה ומדיטציה.\nהמשימה שלך היא ליצור קוד HTML, CSS ו-JavaScript מלא עבור אתר אינטרנט מקצועי, שליו ומאוזן, בהתבסס על הסגנון והאווירה של התבנית "סטודיו אוהם - יוגה ומדיטציה".\n\nהאתר צריך לכלול:\n1.  **סקשן הירו (Hero Section):** עם כותרת ראשית ("סטודיו אוהם"), כותרת משנה ("מרחב של שלווה, איזון ותנועה מודעת"), וציטוט השראה (לדוגמה: "היוגה היא המסע של העצמי, דרך העצמי, אל העצמי").\n2.  **סקשן שיעורים:** הצגת סוגי שיעורי יוגה ומדיטציה שונים (כמו האטה יוגה, ויניאסה פלו, מדיטציה מודרכת, שיעורים פרטיים), עם אייקונים מתאימים, תיאורים, משך שיעור, גודל כיתה, רמת קושי ומחיר.\n3.  **סקשן פילוסופיה:** הצגת הפילוסופיה של הסטודיו (אהבה עצמית, איזון, צמיחה, קהילה), עם פסקאות תוכן המתארות את הגישה והאמונה.\n4.  **סקשן לוח זמנים:** לוח זמנים שבועי מפורט של השיעורים (כולל שעה, יום, שם השיעור ומדריך).\n5.  **סקשן צור קשר:** פרטי התקשרות מלאים (טלפון, אימייל, כתובת, שעות פעילות) וטופס יצירת קשר לשאלות והרשמה (כולל שדות כמו שם, טלפון, סוג שיעור מעניין, רמת ניסיון ביוגה, והודעה נוספת).\n6.  **פוטר:** עם מידע על הסטודיו, קישורי ניווט, וקישורים לרשתות חברתיות.\n7.  **כפתור וואטסאפ צף.\n\n**עקרונות עיצוב שיש ליישם:**\n* **צבעים:** השתמש בגוונים רכים ומרגיעים (כמו גרדיאנטים של כחול-ירוק-ורוד-סגול מעורפל, גווני אדמה) כפי שמופיע בתבנית המקורית של סטודיו אוהם. אל תטמיע SVG ישירות בקוד, השתמש בקישורי תמונות חיצוניים אם נדרש.\n* **פונטים:** שילוב פונטים אלגנטיים ורוחניים (כמו Heebo ו-Dancing Script מהתבנית המקורית).\n* **סגנון:** זן, מדיטטיבי, שליו, נקי, ומזמין.\n* **רספונסיביות:** וודא שהאתר מותאם באופן מושלם לכל המכשירים (מובייל, טאבלט, דסקטופ).\n* **קוד נקי:** הקפד על קוד HTML5, CSS3, ו-JavaScript (נטרטיבי) נקי, מאורגן, ומוטב לביצועים ו-SEO.\n\n**הימנע מ:**\n* שום תוכן placeholder (מילוי מקום) שאינו מפורט בנתוני העסק.\n\n**בהמשך, תקבל נתונים ספציפיים על העסק מהלקוח, ותצטרך להטמיע אותם בקוד שתייצר.'
  },
  {
    name: 'ד"ר שרה כהן - תזונאית קלינית',
    slug: 'dr-sara-cohen',
    description: 'תזונאית קלינית מומחית עם ייעוץ תזונה וליווי אישי',
    preview_image_url: 'https://webmasterproapp.com/demos/dr-sara-cohen/img/preview.jpg',
    category: 'תזונה ובריאות',
    price: 240000,
    is_premium: true,
    initial_ai_prompt: 'אתה מומחה לבניית אתרי אינטרנט לתזונאים קליניים.\nהמשימה שלך היא ליצור קוד HTML, CSS ו-JavaScript מלא עבור אתר אינטרנט מקצועי, אינפורמטיבי ובריאותי, בהתבסס על הסגנון והאווירה של התבנית "ד"ר שרה כהן - תזונאית קלינית".\n\nהאתר צריך לכלול:\n1.  **סקשן הירו (Hero Section):** עם כותרת ראשית ("ד"ר שרה כהן"), כותרת משנה ("תזונאית קלינית מומחית - המסע שלך לחיים בריאים יותר"), סטטיסטיקות מרשימות (שנות ניסיון, לקוחות מצליחים, אחוזי הצלחה, ירידה ממוצעת במשקל), וכפתורי קריאה לפעולה (לדוגמה: "קבע פגישה", "מחשבון BMI").\n2.  **סקשן שירותים:** הצגת שירותי תזונה מקצועיים (ייעוץ אישי, תוכניות הרזיה, תזונה ספורטיבית, תזונה בהריון/הנקה, תזונת ילדים, תזונה רפואית), עם אייקונים, תיאורים קצרים, מחירים ומשך/תקופת שירות.\n3.  **סקשן מחשבון BMI:** מחשבון BMI אינטראקטיבי המאפשר למשתמשים להזין גובה ומשקל ולקבל תוצאה, סטטוס (משקל נמוך, תקין, עודף משקל, השמנה) ועצה מותאמת.\n4.  **סקשן אודות:** מידע מפורט על התזונאית (שנות ניסיון, תארים, הסמכות, שיטה ייחודית), עם פסקאות תוכן ואישורים בולטים (כמו תואר דוקטור, רישיון משרד הבריאות, פרסים, מאמרים).\n5.  **סקשן המלצות:** עדויות מלקוחות מרוצים עם טקסט המלצה, שם הלקוח, תיאור קצר (לדוגמה: "אמא לשלושה"), ודירוג כוכבים.\n6.  **סקשן צור קשר:** פרטי התקשרות מלאים (כתובת, טלפונים, אימייל, שעות קבלה) וטופס יצירת קשר מפורט עם שדות רלוונטיים (שם, טלפון, גיל, שירות מבוקש, מטרות).\n7.  **פוטר:** עם קישורי ניווט חשובים, זכויות יוצרים ופרטי רישיון/הסמכה רלוונטיים.\n8.  **כפתורי וואטסאפ/טלפון צפים (אם רלוונטי).\n\n**עקרונות עיצוב שיש ליישם:**\n* **צבעים:** השתמש בגוונים של ירוק (ראשי ומשני), כתום-אדום (אקצנט), וגווני אפור ניטרליים (כפי שמופיע בתבנית המקורית של ד"ר שרה כהן). אל תטמיע SVG ישירות בקוד, השתמש בקישורי תמונות חיצוניים אם נדרש.\n* **פונטים:** שילוב פונטים נקיים וקריאים (כמו Heebo ו-Assistant מהתבנית המקורית).\n* **סגנון:** נקי, מודרני, אמין, ומשרה תחושת בריאות ומומחיות.\n* **רספונסיביות:** וודא שהאתר מותאם באופן מושלם לכל המכשירים (מובייל, טאבלט, דסקטופ).\n* **קוד נקי:** הקפד על קוד HTML5, CSS3, ו-JavaScript (נטרטיבי) נקי, מאורגן, ומוטב לביצועים ו-SEO.\n\n**הימנע מ:**\n* שום תוכן placeholder (מילוי מקום) שאינו מפורט בנתוני העסק.\n\n**בהמשך, תקבל נתונים ספציפיים על העסק מהלקוח, ותצטרך להטמיע אותם בקוד שתייצר.'
  },
  {
    name: 'משרד ברקוביץ - עורכי דין',
    slug: 'berkowitz-law-firm',
    description: 'משרד עורכי דין מומחה ומוביל',
    preview_image_url: 'https://webmasterproapp.com/demos/berkowitz-law-firm/img/preview.jpg',
    category: 'משפטים ועסקים',
    price: 250000,
    is_premium: true,
    initial_ai_prompt: 'אתה מומחה לבניית אתרי אינטרנט למשרדי עורכי דין.\nהמשימה שלך היא ליצור קוד HTML, CSS ו-JavaScript מלא עבור אתר אינטרנט מקצועי, אמין ויוקרתי, בהתבסס על הסגנון והאווירה של התבנית "משרד ברקוביץ - עורכי דין".\n\nהאתר צריך לכלול:\n1.  **סקשן הירו (Hero Section):** עם כותרת ראשית בולטת, כותרת משנה המדגישה מומחיות, וכפתורי קריאה לפעולה (לדוגמה: "קבע פגישת ייעוץ").\n2.  **סקשן תחומי עיסוק:** הצגת תחומי המשפט העיקריים של המשרד (לדוגמה: דיני משפחה, נדל"ן, חברות, נזיקין), עם אייקונים, שמות ותיאורים קצרים.\n3.  **סקשן אודות:** מידע מפורט על המשרד/השותפים (שנות ניסיון, פילוסופיה, ערכים), עם פסקאות תוכן ואולי תמונות צוות.\n4.  **סקשן צוות (Team):** הצגת עורכי הדין במשרד (תמונה, שם, תפקיד, התמחות וקשר קצר).\n5.  **סקשן מאמרים/בלוג:** טיפים משפטיים, חדשות בתחום המשפט או מאמרים מקצועיים (הצגת כותרות ותקצירים).\n6.  **סקשן צור קשר:** פרטי התקשרות מלאים (כתובת המשרד, טלפונים, אימייל, שעות פעילות), מפה, וטופס יצירת קשר מפורט (שם, טלפון, אימייל, נושא, הודעה).\n7.  **פוטר:** עם קישורי ניווט חשובים, זכויות יוצרים, ומידע משפטי רלוונטי (לדוגמה: הצהרת פרטיות, תנאי שימוש). \n8.  **כפתורי וואטסאפ/טלפון צפים (אם רלוונטי).\n\n**עקרונות עיצוב שיש ליישם:**\n* **צבעים:** השתמש בגוונים כהים, כחולים, אפורים, עם נגיעות של צבע הדגשה (זהב/כסף) כפי שמופיע בתבנית המקורית של משרד ברקוביץ. אל תטמיע SVG ישירות בקוד, השתמש בקישורי תמונות חיצוניים אם נדרש.\n* **פונטים:** שילוב פונטים רשמיים, אלגנטיים וקריאים (כמו Heebo ו-Assistant מהתבנית המקורית).\n* **סגנון:** מקצועי, יוקרתי, אמין, סולידי, ומשדר סמכות.\n* **רספונסיביות:** וודא שהאתר מותאם באופן מושלם לכל המכשירים (מובייל, טאבלט, דסקטופ).\n* **קוד נקי:** הקפד על קוד HTML5, CSS3, ו-JavaScript (נטרטיבי) נקי, מאורגן, ומוטב לביצועים ו-SEO.\n\n**הימנע מ:**\n* שום תוכן placeholder (מילוי מקום) שאינו מפורט בנתוני העסק.\n\n**בהמשך, תקבל נתונים ספציפיים על העסק מהלקוח, ותצטרך להטמיע אותם בקוד שתייצר.'
  },
  {
    name: 'רינה לוי - חשבת שכר',
    slug: 'rina-levi-accountant',
    description: 'חשבת שכר ומנהלת חשבונות מקצועית לעסקים',
    preview_image_url: 'https://webmasterproapp.com/demos/rina-levi-accountant/img/preview.jpg',
    category: 'פיננסים וחשבונאות',
    price: 200000,
    is_premium: true,
    initial_ai_prompt: 'אתה מומחה לבניית אתרי אינטרנט לחשבי שכר ומנהלי חשבונות.\nהמשימה שלך היא ליצור קוד HTML, CSS ו-JavaScript מלא עבור אתר אינטרנט מקצועי, אמין וברור, בהתבסס על הסגנון והאווירה של התבנית "רינה לוי - חשבת שכר".\n\nהאתר צריך לכלול:\n1.  **סקשן הירו (Hero Section):** עם כותרת ראשית (שם חשבת השכר/המשרד), כותרת משנה המדגישה את השירותים העיקריים, וכפתור קריאה לפעולה (לדוגמה: "קבע פגישת ייעוץ", "צרו קשר").\n2.  **סקשן שירותים:** הצגת מגוון שירותי חשבות שכר וראיית חשבון (לדוגמה: חשבות שכר לעסקים, דוחות שנתיים, הצהרות הון, ייעוץ מס), עם אייקונים, תיאורים קצרים ויתרונות.\n3.  **סקשן אודות:** מידע על חשבת השכר/המשרד (שנות ניסיון, פילוסופיה, גישה אישית), עם פסקאות תוכן ותמונה אישית/תמונת משרד.\n4.  **סקשן יתרונות/למה לבחור בנו:** הדגשת יתרונות המשרד (מקצועיות, שירות אישי, דיוק, זמינות).\n5.  **סקשן שאלות נפוצות (FAQ):** שאלות ותשובות נפוצות בתחום חשבות השכר והמיסים.\n6.  **סקשן צור קשר:** פרטי התקשרות מלאים (כתובת המשרד, טלפונים, אימייל, שעות פעילות), וטופס יצירת קשר (שם, טלפון, אימייל, נושא, הודעה).\n7.  **פוטר:** עם קישורי ניווט חשובים, זכויות יוצרים ופרטי רישיון/הסמכה רלוונטיים.\n8.  **כפתורי וואטסאפ/טלפון צפים (אם רלוונטי).\n\n**עקרונות עיצוב שיש ליישם:**\n* **צבעים:** השתמש בגוונים של כחול בהיר, אפור, ולבן עם נגיעות של צבע הדגשה (לדוגמה: ירוק או כתום), כפי שמופיע בתבנית המקורית של רינה לוי. אל תטמיע SVG ישירות בקוד, השתמש בקישורי תמונות חיצוניים אם נדרש.\n* **פונטים:** שילוב פונטים נקיים, קריאים ומקצועיים (כמו Assistant ו-Heebo מהתבנית המקורית).\n* **סגנון:** נקי, מאורגן, אמין, ידידותי ומשדר מקצועיות ופשטות.\n* **רספונסיביות:** וודא שהאתר מותאם באופן מושלם לכל המכשירים (מובייל, טאבלט, דסקטופ).\n* **קוד נקי:** הקפד על קוד HTML5, CSS3, ו-JavaScript (נטרטיבי) נקי, מאורגן, ומוטב לביצועים ו-SEO.\n\n**הימנע מ:**\n* שום תוכן placeholder (מילוי מקום) שאינו מפורט בנתוני העסק.\n\n**בהמשך, תקבל נתונים ספציפיים על העסק מהלקוח, ותצטרך להטמיע אותם בקוד שתייצר.'
  },
  {
    name: 'מספרה BELLA - יופי',
    slug: 'bella-hair-salon',
    description: 'מספרה וסלון יופי מוביל',
    preview_image_url: 'https://webmasterproapp.com/demos/bella-hair-salon/img/preview.jpg',
    category: 'יופי וטיפוח',
    price: 170000,
    is_premium: true,
    initial_ai_prompt: 'אתה מומחה לבניית אתרי אינטרנט למספרות וסלוני יופי.\nהמשימה שלך היא ליצור קוד HTML, CSS ו-JavaScript מלא עבור אתר אינטרנט אופנתי, אסתטי ומזמין, בהתבסס על הסגנון והאווירה של התבנית "מספרה BELLA - יופי".\n\nהאתר צריך לכלול:\n1.  **סקשן הירו (Hero Section):** עם כותרת ראשית (שם המספרה/הסלון), כותרת משנה המדגישה את שירותי היופי, וכפתורי קריאה לפעולה (לדוגמה: "קבע תור", "צרו קשר").\n2.  **סקשן שירותים:** הצגת מגוון שירותי יופי וטיפוח (לדוגמה: תספורות, צבע, החלקות, תוספות שיער, טיפולי פנים, מניקור/פדיקור), עם תיאורים קצרים ומחירים.\n3.  **סקשן גלריה/פורטפוליו:** הצגת תמונות של עבודות קודמות (לפני/אחרי, תסרוקות, איפור), כדי להדגים את רמת המקצועיות והסגנון.\n4.  **סקשן אודות:** מידע על המספרה/מעצב השיער (פילוסופיה, ניסיון, התמחות), עם פסקאות תוכן ותמונה אישית/תמונת סלון.\n5.  **סקשן המלצות:** עדויות מלקוחות מרוצים, עם ציטוט, שם הלקוח ודירוג כוכבים.\n6.  **סקשן צור קשר:** פרטי התקשרות מלאים (כתובת, טלפון, אימייל, שעות פתיחה), וטופס יצירת קשר (שם, טלפון, אימייל, שירות מבוקש, הודעה).\n7.  **פוטר:** עם קישורי ניווט חשובים, זכויות יוצרים, וקישורים לרשתות חברתיות.\n8.  **כפתורי וואטסאפ/טלפון צפים (אם רלוונטי).\n\n**עקרונות עיצוב שיש ליישם:**\n* **צבעים:** השתמש בגוונים של ורוד, סגול, זהב/ברונזה, עם נגיעות של ניטרליים (שחור/לבן) כפי שמופיע בתבנית המקורית של מספרה BELLA. אל תטמיע SVG ישירות בקוד, השתמש בקישורי תמונות חיצוניים אם נדרש.\n* **פונטים:** שילוב פונטים אלגנטיים, נשיים ומודרניים.\n* **סגנון:** יוקרתי, נקי, נשי, אופנתי, ומשדר יופי וטיפוח.\n* **רספונסיביות:** וודא שהאתר מותאם באופן מושלם לכל המכשירים (מובייל, טאבלט, דסקטופ).\n* **קוד נקי:** הקפד על קוד HTML5, CSS3, ו-JavaScript (נטרטיבי) נקי, מאורגן, ומוטב לביצועים ו-SEO.\n\n**הימנע מ:**\n* שום תוכן placeholder (מילוי מקום) שאינו מפורט בנתוני העסק.\n\n**בהמשך, תקבל נתונים ספציפיים על העסק מהלקוח, ותצטרך להטמיע אותם בקוד שתייצר.'
  },
  {
    name: 'ד"ר רונית לוי - מורה פרטית',
    slug: 'dr-ronit-levi-private-tutor',
    description: 'מורה פרטית ומנטורית מקצועית לכל הגילאים',
    preview_image_url: 'https://webmasterproapp.com/demos/dr-ronit-levi-private-tutor/img/preview.jpg',
    category: 'חינוך וייעוץ',
    price: 210000,
    is_premium: true,
    initial_ai_prompt: 'אתה מומחה לבניית אתרי אינטרנט למורים פרטיים, מנטורים או יועצים.\nהמשימה שלך היא ליצור קוד HTML, CSS ו-JavaScript מלא עבור אתר אינטרנט אינפורמטיבי, מקצועי ונגיש, בהתבסס על הסגנון והאווירה של התבנית "ד"ר רונית לוי - מורה פרטית".\n\nהאתר צריך לכלול:\n1.  **סקשן הירו (Hero Section):** עם כותרת ראשית (שם המורה/יועץ), כותרת משנה המפרטת את תחום המומחיות (לדוגמה: "מורה פרטית למתמטיקה ולשון - לכל הגילאים"), וכפתור קריאה לפעולה (לדוגמה: "קבע שיעור ניסיון").\n2.  **סקשן תחומי לימוד/שירותים:** הצגת מקצועות הלימוד או תחומי הייעוץ המוצעים (לדוגמה: מתמטיקה, לשון, אנגלית, היסטוריה), עם תיאורים קצרים והתמחות (לדוגמה: הכנה לבגרויות, שיעורי עזר, מבוגרים, ילדים).\n3.  **סקשן אודות:** מידע על המורה/יועץ (השכלה, ניסיון, פילוסופיית הוראה/ייעוץ, גישה אישית), עם פסקאות תוכן ותמונה אישית.\n4.  **סקשן יתרונות/למה לבחור בי:** הדגשת יתרונות המורה (לדוגמה: סבלנות, שיטות לימוד ייחודיות, התאמה אישית, הצלחות מוכחות).\n5.  **סקשן המלצות:** עדויות מהורים או תלמידים מרוצים, עם ציטוט, שם הממליץ ודירוג כוכבים.\n6.  **סקשן שאלות נפוצות (FAQ):** שאלות ותשובות נפוצות לגבי שיעורים, מחירים, תיאום וכו''.\n7.  **סקשן צור קשר:** פרטי התקשרות מלאים (טלפון, אימייל, אפשרות למיקום שיעורים), וטופס יצירת קשר (שם, טלפון, אימייל, נושא/מקצוע לימוד, הודעה).\n8.  **פוטר:** עם קישורי ניווט חשובים, זכויות יוצרים, וקישורים לרשתות חברתיות (אם רלוונטי).\n9.  **כפתורי וואטסאפ/טלפון צפים (אם רלוונטי).\n\n**עקרונות עיצוב שיש ליישם:**\n* **צבעים:** השתמש בגוונים של כחול, לבן, ואפור עם נגיעות של צבע הדגשה (לדוגמה: צהוב או כתום) כפי שמופיע בתבנית המקורית של ד"ר רונית לוי. אל תטמיע SVG ישירות בקוד, השתמש בקישורי תמונות חיצוניים אם נדרש.\n* **פונטים:** שילוב פונטים ברורים, קריאים וידידותיים (כמו Heebo ו-Assistant מהתבנית המקורית).\n* **סגנון:** נקי, מאורגן, מקצועי, ומשדר אמינות ונגישות.\n* **רספונסיביות:** וודא שהאתר מותאם באופן מושלם לכל המכשירים (מובייל, טאבלט, דסקטופ).\n* **קוד נקי:** הקפד על קוד HTML5, CSS3, ו-JavaScript (נטרטיבי) נקי, מאורגן, ומוטב לביצועים ו-SEO.\n\n**הימנע מ:**\n* שום תוכן placeholder (מילוי מקום) שאינו מפורט בנתוני העסק.\n\n**בהמשך, תקבל נתונים ספציפיים על העסק מהלקוח, ותצטרך להטמיע אותם בקוד שתייצר.'
  },
  {
    name: 'קליניקת יופי פרמיום - אסתטיקה רפואית',
    slug: 'premium-beauty-clinic',
    description: 'קליניקה לאסתטיקה רפואית מתקדמת וטיפולים חדשניים',
    preview_image_url: 'https://webmasterproapp.com/demos/premium-beauty-clinic/img/preview.jpg',
    category: 'אסתטיקה רפואית',
    price: 320000,
    is_premium: true,
    initial_ai_prompt: 'אתה מומחה לבניית אתרי אינטרנט לקליניקות לאסתטיקה רפואית.\nהמשימה שלך היא ליצור קוד HTML, CSS ו-JavaScript מלא עבור אתר אינטרנט יוקרתי, מרשים ומקצועי, בהתבסס על הסגנון והאווירה של התבנית "קליניקת יופי פרמיום - אסתטיקה רפואית".\n\nהאתר צריך לכלול:\n1.  **סקשן הירו (Hero Section):** עם כותרת ראשית (שם הקליניקה), כותרת משנה המדגישה יוקרה וחידוש, וכפתורי קריאה לפעולה (לדוגמה: "קבע פגישת ייעוץ", "צפו בטיפולים").\\n2.  **סקשן טיפולים/שירותים:** הצגת מגוון טיפולים אסתטיים רפואיים (לדוגמה: הזרקות, לייזר, פילינגים, טיפולי פנים מתקדמים, הסרת שיער), עם תיאורים קצרים וטכנולוגיות.\\n3.  **סקשן אודות:** מידע על הקליניקה/הצוות הרפואי (מומחיות, ניסיון, פילוסופיה טיפולית), עם פסקאות תוכן ואולי תמונות צוות/קליניקה.\\n4.  **סקשן טכנולוגיות:** הצגת הטכנולוגיות והמכשירים המתקדמים בהם משתמשת הקליניקה.\\n5.  **גלריה:** תמונות לפני/אחרי (אם רלוונטי), תמונות של הקליניקה, או תמונות המדגימות את האווירה היוקרתית.\\n6.  **סקשן המלצות:** עדויות מלקוחות מרוצים, עם ציטוט, שם הלקוח ודירוג כוכבים.\\n7.  **סקשן צור קשר:** פרטי התקשרות מלאים (כתובת, טלפונים, אימייל, שעות פתיחה), מפה, וטופס יצירת קשר (שם, טלפון, אימייל, טיפול מבוקש, הודעה).\\n8.  **פוטר:** עם קישורי ניווט חשובים, זכויות יוצרים, וקישורים לרשתות חברתיות.\\n9.  **כפתורי וואטסאפ/טלפון צפים (אם רלוונטי).**\\n\\n**עקרונות עיצוב שיש ליישם:**\\n* **צבעים:** השתמש בגוונים יוקרתיים ורכים (לדוגמה: ורוד, זהב, לבן, אפור בהיר), עם נגיעות של כסף או שמפניה, כפי שמופיע בתבנית "קליניקת יופי פרמיום". אל תטמיע SVG ישירות בקוד, השתמש בקישורי תמונות חיצוניים אם נדרש.\\n* **פונטים:** שילוב פונטים אלגנטיים, נקיים ויוקרתיים.\\n* **סגנון:** יוקרתי, נקי, אסתטי, ומשרה תחושת מקצועיות וטיפוח.\\n* **רספונסיביות:** וודא שהאתר מותאם באופן מושלם לכל המכשירים (מובייל, טאבלט, דסקטופ).\\n* **קוד נקי:** הקפד על קוד HTML5, CSS3, ו-JavaScript (נטרטיבי) נקי, מאורגן, ומוטב לביצועים ו-SEO.\\n\\n**הימנע מ:**\\n* שום תוכן placeholder (מילוי מקום) שאינו מפורט בנתוני העסק.\\n\\n**בהמשך, תקבל נתונים ספציפיים על העסק מהלקוח, ותצטרך להטמיע אותם בקוד שתייצר.'
  },
  {
    name: 'מולטיבראון - נופש ואירועים',
    slug: 'multibrown-resort-events',
    description: 'פתרונות מושלמים לנופש ואירועים בלתי נשכחים',
    preview_image_url: 'https://webmasterproapp.com/demos/multibrown-resort-events/img/preview.jpg',
    category: 'נופש ואירועים',
    price: 230000,
    is_premium: true,
    initial_ai_prompt: 'אתה מומחה לבניית אתרי אינטרנט לחברות/מתחמי נופש ואירועים.\nהמשימה שלך היא ליצור קוד HTML, CSS ו-JavaScript מלא עבור אתר אינטרנט מזמין, ויזואלי ועשיר בפרטים, בהתבסס על הסגנון והאווירה של התבנית "מולטיבראון - נופש ואירועים".\n\nהאתר צריך לכלול:\n1.  **סקשן הירו (Hero Section):** עם כותרת ראשית (שם העסק), כותרת משנה המדגישה את מהות העסק (לדוגמה: "הפתרונות המושלמים לנופש ולאירועים בלתי נשכחים"), וכפתורי קריאה לפעולה (לדוגמה: "הזמינו עכשיו", "צרו קשר").\n2.  **סקשן אודות/ייחודיות:** מידע על החברה, הפילוסופיה שלה, והיתרונות הייחודיים של המתחם/שירותים (לדוגמה: מתחם אירועים רחב ידיים, חבילות נופש מותאמות אישית, צוות מקצועי).\n3.  **סקשן שירותים/חבילות:** הצגת מגוון השירותים או חבילות הנופש/אירועים המוצעות (לדוגמה: השכרת מתחם לאירועים, אירועי חברה, ימי כיף, חבילות נופש רומנטיות, פעילויות לילדים), עם תיאורים קצרים, תמונות/אייקונים רלוונטיים ואולי מחירים או החל מ-.\\n4.  **גלריה/סיורי וידאו:** גלריית תמונות מרהיבה של המתחם, חדרים, אירועים קודמים או אטרקציות, עם אפשרות לשילוב סרטוני וידאו (מיוטיוב/וימאו).\\n5.  **סקשן המלצות:** עדויות מלקוחות מרוצים (פרטיים או עסקיים), עם ציטוט, שם הממליץ ודירוג כוכבים.\\n6.  **סקשן שאלות נפוצות (FAQ):** שאלות ותשובות נפוצות לגבי תהליך ההזמנה, חבילות, מדיניות ביטול, שעות פעילות וכו''.\\n7.  **סקשן צור קשר:** פרטי התקשרות מלאים (כתובת, טלפונים, אימייל, שעות פעילות), מפה, וטופס יצירת קשר מפורט (שם, טלפון, אימייל, סוג אירוע/נופש, תאריך מבוקש, מספר משתתפים, הודעה).\\n8.  **פוטר:** עם קישורי ניווט חשובים, זכויות יוצרים, וקישורים לרשתות חברתיות.\\n9.  **כפתורי וואטסאפ/טלפון צפים (אם רלוונטי).\n\n**עקרונות עיצוב שיש ליישם:**\n* **צבעים:** השתמש בגוונים של חום, כתום, כחול וירוק, עם דגש על צבעים חמים ומזמינים, כפי שמופיע בתבנית המקורית של מולטיבראון. אל תטמיע SVG ישירות בקוד, השתמש בקישורי תמונות חיצוניים אם נדרש.\n* **פונטים:** שילוב פונטים אלגנטיים אך ידידותיים וקריאים.\n* **סגנון:** יוקרתי, מזמין, חם, ויזואלי, ומשדר אווירת חופש וכיף.\n* **רספונסיביות:** וודא שהאתר מותאם באופן מושלם לכל המכשירים (מובייל, טאבלט, דסקטופ).\n* **קוד נקי:** הקפד על קוד HTML5, CSS3, ו-JavaScript (נטרטיבי) נקי, מאורגן, ומוטב לביצועים ו-SEO.\n\n**הימנע מ:**\n* שום תוכן placeholder (מילוי מקום) שאינו מפורט בנתוני העסק.\n\n**בהמשך, תקבל נתונים ספציפיים על העסק מהלקוח, ותצטרך להטמיע אותם בקוד שתייצר.'
  },
  {
    name: 'נדל"ן פרמיום',
    slug: 'premium-real-estate',
    description: 'סוכנות נדל"ן יוקרתית וייעוץ השקעות',
    preview_image_url: 'https://webmasterproapp.com/demos/premium-real-estate/img/preview.jpg',
    category: 'נדל"ן והשקעות',
    price: 270000,
    is_premium: true,
    initial_ai_prompt: 'אתה מומחה לבניית אתרי אינטרנט לסוכנויות נדל"ן יוקרתיות ויועצי נדל"ן.\nהמשימה שלך היא ליצור קוד HTML, CSS ו-JavaScript מלא עבור אתר אינטרנט יוקרתי, מרשים ומזמין, בהתבסס על הסגנון והאווירה של התבנית "נדל"ן פרמיום".\n\nהאתר צריך לכלול:\n1.  **סקשן הירו (Hero Section):** עם כותרת ראשית חזקה (לדוגמה: "השקעה חכמה מתחילה כאן"), כותרת משנה המדגישה יוקרה ומומחיות, וכפתורי קריאה לפעולה (לדוגמה: "צפו בנכסים", "צרו קשר").\n2.  **סקשן נכסים מובילים/גלריה:** הצגת נכסים נבחרים למכירה/השכרה עם תמונות איכותיות, מחיר, מיקום ותיאור קצר. אפשרות לפילטרים (לדוגמה: למכירה/להשכרה, סוג נכס, אזור).\n3.  **סקשן שירותים:** פירוט שירותי הנדל"ן (לדוגמה: תיווך, ייעוץ השקעות, ניהול נכסים, שיווק פרויקטים חדשים), עם תיאורים קצרים ויתרונות.\n4.  **סקשן אודות:** מידע על סוכנות הנדל"ן/היועץ (ניסיון, מומחיות באזורים ספציפיים, פילוסופיה), עם פסקאות תוכן ויתרונות תחרותיים.\n5.  **סקשן עדויות/סיפורי הצלחה:** המלצות מלקוחות מרוצים, עם ציטוט, שם הלקוח ודירוג כוכבים.\n6.  **סקשן מאמרים/טיפים:** מאמרים או בלוג בנושאי נדל"ן, השקעות, או מידע לשוכרים/קונים.\n7.  **סקשן צור קשר:** פרטי התקשרות מלאים (כתובת, טלפונים, אימייל, שעות פעילות), מפה, וטופס יצירת קשר מפורט (שם, טלפון, אימייל, סוג פנייה, תקציב, סוג נכס, הודעה).\n8.  **פוטר:** עם קישורי ניווט חשובים, זכויות יוצרים, וקישורים לרשתות חברתיות (אם רלוונטי). \n9.  **כפתורי וואטסאפ/טלפון צפים (אם רלוונטי).\n\n**עקרונות עיצוב שיש ליישם:**\n* **צבעים:** השתמש בגוונים אלגנטיים ויוקרתיים כמו שחור, לבן, אפור, עם נגיעות של זהב, כסף או כחול כהה, כפי שמופיע בתבנית "נדל"ן פרמיום". אל תטמיע SVG ישירות בקוד, השתמש בקישורי תמונות חיצוניים אם נדרש.\n* **פונטים:** שילוב פונטים מודרניים, נקיים ויוקרתיים.\n* **סגנון:** אלגנטי, יוקרתי, מינימליסטי, מקצועי, ומשדר אמינות ועושר.\n* **רספונסיביות:** וודא שהאתר מותאם באופן מושלם לכל המכשירים (מובייל, טאבלט, דסקטופ).\n* **קוד נקי:** הקפד על קוד HTML5, CSS3, ו-JavaScript (נטרטיבי) נקי, מאורגן, ומוטב לביצועים ו-SEO.\n\n**הימנע מ:**\n* שום תוכן placeholder (מילוי מקום) שאינו מפורט בנתוני העסק.\n\n**בהמשך, תקבל נתונים ספציפיים על העסק מהלקוח, ותצטרך להטמיע אותם בקוד שתייצר.'
  },
  {
    name: 'רופא שיניים',
    slug: 'dentist-clinic',
    description: 'מרפאת שיניים מתקדמת לכל המשפחה',
    preview_image_url: 'https://webmasterproapp.com/demos/dentist-clinic/img/preview.jpg',
    category: 'רפואת שיניים',
    price: 210000,
    is_premium: true,
    initial_ai_prompt: 'אתה מומחה לבניית אתרי אינטרנט למרפאות שיניים ורופאי שיניים.\nהמשימה שלך היא ליצור קוד HTML, CSS ו-JavaScript מלא עבור אתר אינטרנט מקצועי, אמין ומרגיע, בהתבסס על הסגנון והאווירה של התבנית "רופא שיניים".\n\nהאתר צריך לכלול:\n1.  **סקשן הירו (Hero Section):** עם כותרת ראשית (שם המרפאה/הרופא), כותרת משנה המדגישה התמחות (לדוגמה: "רפואת שיניים מתקדמת לכל המשפחה"), וכפתורי קריאה לפעולה (לדוגמה: "קבע תור", "צרו קשר").\n2.  **סקשן שירותים:** הצגת מגוון שירותי המרפאה (לדוגמה: בדיקות תקופתיות, סתימות, טיפולי שורש, הלבנת שיניים, יישור שיניים, כירורגיה דנטלית), עם תיאורים קצרים ויתרונות.\n3.  **סקשן אודות:** מידע על הרופא/המרפאה (שנות ניסיון, השכלה, פילוסופיה טיפולית), עם פסקאות תוכן ויתרונות המרפאה (לדוגמה: ציוד מתקדם, יחס אישי, ניסיון רב).\n4.  **סקשן צוות:** הצגת צוות המרפאה (רופאים, סייעות, שינניות) עם תמונה, שם ותפקיד.\n5.  **סקשן גלריה (מרפאה/לפני-אחרי):** תמונות של המרפאה, חדרי הטיפולים או גלריית תוצאות (לפני/אחרי) (אם רלוונטי).\n6.  **סקשן המלצות:** עדויות מלקוחות מרוצים, עם ציטוט, שם הלקוח ודירוג כוכבים.\n7.  **סקשן צור קשר:** פרטי התקשרות מלאים (כתובת המרפאה, טלפונים, אימייל, שעות פתיחה), מפה, וטופס יצירת קשר (שם, טלפון, אימייל, נושא הפנייה, הודעה).\n8.  **פוטר:** עם קישורי ניווט חשובים, זכויות יוצרים, וקישורים לרשתות חברתיות.\n9.  **כפתורי וואטסאפ/טלפון צפים (אם רלוונטי).\n\n**עקרונות עיצוב שיש ליישם:**\n* **צבעים:** השתמש בגוונים של כחול בהיר, ירוק, לבן, ואפור בהיר, עם נגיעות של צבע הדגשה מרגיע (לדוגמה: טורקיז), כפי שמופיע בתבנית "רופא שיניים". אל תטמיע SVG ישירות בקוד, השתמש בקישורי תמונות חיצוניים אם נדרש.\n* **פונטים:** שילוב פונטים נקיים, קריאים ומרגיעים.\n* **סגנון:** נקי, היגייני, אמין, ידידותי, ומשדר מקצועיות ורוגע.\n* **רספונסיביות:** וודא שהאתר מותאם באופן מושלם לכל המכשירים (מובייל, טאבלט, דסקטופ).\n* **קוד נקי:** הקפד על קוד HTML5, CSS3, ו-JavaScript (נטרטיבי) נקי, מאורגן, ומוטב לביצועים ו-SEO.\n\n**הימנע מ:**\n* שום תוכן placeholder (מילוי מקום) שאינו מפורט בנתוני העסק.\n\n**בהמשך, תקבל נתונים ספציפיים על העסק מהלקוח, ותצטרך להטמיע אותם בקוד שתייצר.'
  }
];

// פונקציה ראשית להכנסת הנתונים
async function seedTemplates() {
  console.log('מתחיל אכלוס טבלת התבניות...');

  try {
    // 1. וודא שהעמודות קיימות (פקודות ALTER TABLE)
    console.log('מוודא/יוצר עמודות initial_ai_prompt, final_html_code, last_ai_interaction_log...');
    
    const { error: templatesAlterError } = await supabase.rpc('execute_sql', {
        sql_query: 'ALTER TABLE templates ADD COLUMN IF NOT EXISTS initial_ai_prompt TEXT;'
    });
    if (templatesAlterError) throw templatesAlterError;

    const { error: userSitesAlterError1 } = await supabase.rpc('execute_sql', {
        sql_query: 'ALTER TABLE user_sites ADD COLUMN IF NOT EXISTS final_html_code TEXT;'
    });
    if (userSitesAlterError1) throw userSitesAlterError1;

    const { error: userSitesAlterError2 } = await supabase.rpc('execute_sql', {
        sql_query: 'ALTER TABLE user_sites ADD COLUMN IF NOT EXISTS last_ai_interaction_log JSONB DEFAULT \'{}\';'
    });
    if (userSitesAlterError2) throw userSitesAlterError2;
    
    console.log('אימות עמודות הסתיים.');

    // 2. נקה את טבלת התבניות מתוכן קיים
    console.log('מנקה את טבלת templates...');
    const { error: truncateError } = await supabase
      .from('templates')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // מחיקת הכל למעט ID ספציפי אם קיים (לא רלוונטי כאן אבל מונע מחיקת ID מסוים)
      // אלטרנטיבה בטוחה יותר ל-truncate:
      // const { error: truncateError } = await supabase.rpc('truncate_table', { table_name: 'templates' });
      // כדי להשתמש ב-rpc צריך ליצור פונקציית SQL שתאפשר TRUNCATE
      // לכן, כרגע, delete() is good enough.
    
    if (truncateError) {
      if (truncateError.code === '42P01') { // table not found error
        console.warn('הטבלה "templates" לא נמצאה. ייתכן שהיא עדיין לא נוצרה. המשיכו.');
      } else {
        throw truncateError;
      }
    }
    console.log('טבלת templates נוקתה בהצלחה (או שלא היה צורך).');


    // 3. הכנס את הנתונים החדשים לטבלת התבניות
    console.log('מכניס את 12 התבניות החדשות...');
    const { data: insertedData, error: insertError } = await supabase
      .from('templates')
      .insert(templatesToSeed)
      .select();

    if (insertError) {
      throw insertError;
    }

    console.log(`🎉 הצלחה! הוכנסו ${insertedData.length} תבניות.`);
    console.log('נתונים שהוכנסו:', insertedData.map(t => t.name));

  } catch (error) {
    console.error('שגיאה קריטית באכלוס התבניות:', error.message);
    console.error('פרטי שגיאה:', error);
  } finally {
    console.log('סיום סקריפט אכלוס תבניות.');
  }
}

seedTemplates();
