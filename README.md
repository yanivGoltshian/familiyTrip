# 🥕 קפריסין 2026 · אגדה משפחתית

אתר משפחתי אינטראקטיבי לחופשת אוגוסט 2026 בלרנקה, קפריסין — בעיצוב אגדת דיסני בהשראת "אֱלִיעֶזֶר וְהַגֶּזֶר". 💛

נבנה באהבה לכל החבר'ה. בואו נתכונן! ✨

## מה יש באתר
- ⏳ **ספירה לאחור** חיה עד ההמראה
- ✈️ **עדכוני טיסות** עם ספירה לאחור לכל טיסה ותזכורת צ'ק-אין (TUS Airways)
- 🧳 **כרטיסי כבודה** אישיים — משקל, מידות ומה מותר לכל נוסע (כולל תינוק + עגלה)
- 🎒 **רשימות אריזה** אישיות לכל אחד (מודע לתינוקות)
- 🏨 **פרטי המלון** + גלריה (Lordos Beach Hotel & Spa)
- 🍽️ **המלצות** — מסעדות במרחק הליכה, אטרקציות ושווקים
- 🗺️ **מפה חיה** עם שיתוף מיקום בזמן אמת בין בני המשפחה
- 🌤️ **מזג אוויר** אוטומטי ללרנקה ולתל אביב
- 🎉 אנימציות, דמויות מקוריות וקונפטי

## הרצה מקומית
זהו אתר סטטי לחלוטין (HTML/CSS/JS בלבד, ללא שלב build). אפשר פשוט לפתוח את `index.html`, או להריץ שרת מקומי:

```bash
python3 -m http.server 8000
# ואז לגלוש אל http://localhost:8000
```

## פריסה חינמית (GitHub Pages)
האתר עובד כ-**static web app** חינמי לגמרי. שתי דרכים:

**אפשרות א' — Deploy from a branch (הכי פשוט):**
1. ‏Settings → Pages
2. תחת *Build and deployment* → *Source*: בחרו **Deploy from a branch**
3. ‏Branch: `main`, Folder: `/ (root)` → Save
4. כעבור דקה האתר יהיה זמין בכתובת: `https://yanivgoltshian.github.io/familiyTrip/`

**אפשרות ב' — GitHub Actions:**
הקובץ `.github/workflows/deploy-pages.yml` כבר כלול. תחת Settings → Pages → Source בחרו **GitHub Actions**. כל push ל-`main` יפרוס אוטומטית.

> הקובץ `.nojekyll` כלול כדי ש-GitHub Pages יגיש את הקבצים כמו שהם.

## טכנולוגיות
- ‏Vanilla HTML / CSS / JavaScript (ללא תלות build)
- ‏[Leaflet](https://leafletjs.com/) + OpenStreetMap — מפה חיה
- ‏MQTT over WebSocket — שיתוף מיקום בזמן אמת
- ‏[Open-Meteo](https://open-meteo.com/) — מזג אוויר (ללא מפתח API)
- גופנים: Heebo · Suez One · Fredoka

## מבנה הקבצים
```
index.html     · מבנה הדף + דמויות SVG מקוריות
styles.css     · עיצוב אגדת דיסני
app.js         · כל הלוגיקה (ספירה, מפה, מזג אוויר, אריזה...)
data.js        · כל תוכן הטיול (נוסעים, טיסות, מלון, המלצות)
```

כדי לעדכן תוכן — עורכים את `data.js` בלבד.
