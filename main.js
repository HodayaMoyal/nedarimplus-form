// פונקציה זו תופעל כאשר הטופס נטען, וכן כאשר משתנה שדה הסטטוס המשפחתי.
// היא אחראית על הצגת/הסתרת קטע "פרטי האשה".
function toggleWifeDetails() {
    const statusField = document.getElementById('Status_F');
    const wifeDetailsElements = [
        document.querySelector('Koteret[Text="פרטי האשה"]'), // הכותרת של פרטי האשה
        document.getElementById('WifeFirstName'),
        document.getElementById('WifeFamily'),
        document.getElementById('WifeZeout'),
        document.getElementById('WifeDob'),
        document.getElementById('WifeMobile'),
        document.getElementById('WifeEmail')
    ];

    // במידה והשדה 'Status_F' הוא מסוג רדיו, נצטרך למצוא את הערך הנבחר.
    // אם זו מערכת טפסים מורכבת כמו Matara.pro, ייתכן שקיים API לגשת לערך בקלות.
    // נניח כאן שבדיקת הערך של ה-input הנבחר מספיקה, או שצריך להאזין לאירועי שינוי לכל כפתור רדיו.
    const selectedStatus = statusField ? Array.from(statusField.querySelectorAll('input[type="radio"]')).find(radio => radio.checked)?.value : null;

    if (selectedStatus === 'נשוי') {
        wifeDetailsElements.forEach(el => {
            if (el) el.style.display = 'block'; // או 'flex', 'table-row' וכו' בהתאם לסוג האלמנט ועיצובו
            // בנוסף, אם שדה ה-DBName שלו רשום כ-mandatory (כמו ב-JSON שסיפקת), יש להפוך אותו לחובה כאן
            // (ייתכן שהפלטפורמה עושה זאת אוטומטית בהתאם ל-VisibilityCondition אם היא תומכת בו במלואו).
            // לדוגמה, אם יש שימוש ב-aria-required או הוספה/הסרה של האטיריביוט 'required'.
        });
    } else {
        wifeDetailsElements.forEach(el => {
            if (el) el.style.display = 'none';
        });
    }
}

// פונקציה זו תיצור באופן דינמי שדות קלט עבור פרטי הילדים.
// היא תופעל כאשר משתמש יזין ערך בשדה "מספר ילדים".
function createChildFields() {
    const numChildrenInput = document.getElementById('NumChildren');
    const numChildren = parseInt(numChildrenInput.value);
    const childrenContainer = document.getElementById('childrenContainer'); // וודא שקיים div עם ID זה ב-HTML שלך

    // נקה שדות ילדים קיימים
    childrenContainer.innerHTML = '';

    if (isNaN(numChildren) || numChildren <= 0) {
        return; // אם הקלט אינו מספר תקין או אפס/שלילי, אל תעשה כלום
    }

    for (let i = 1; i <= numChildren; i++) {
        const childDiv = document.createElement('div');
        childDiv.classList.add('child-details-group'); // לצורך עיצוב ב-CSS אם תרצה
        childDiv.innerHTML = `
            <h3>פרטי ילד ${i}</h3>
            <label for="Child${i}Name">שם ילד:</label>
            <input type="text" id="Child${i}Name" name="Child${i}Name" maxlength="50" required><br>

            <label for="Child${i}Gender">מגדר:</label>
            <input type="radio" id="Child${i}GenderMale" name="Child${i}Gender${i}" value="זכר" required>
            <label for="Child${i}GenderMale">זכר</label>
            <input type="radio" id="Child${i}GenderFemale" name="Child${i}Gender${i}" value="נקבה" required>
            <label for="Child${i}GenderFemale">נקבה</label><br>

            <label for="Child${i}Zeout">ת.ז. ילד:</label>
            <input type="tel" id="Child${i}Zeout" name="Child${i}Zeout" maxlength="9" pattern="[0-9]{9}" title="יש להזין 9 ספרות" required><br>

            <label for="Child${i}Dob">תאריך לידה (לועזי):</label>
            <input type="date" id="Child${i}Dob" name="Child${i}Dob" required><br>
            <hr>
        `;
        childrenContainer.appendChild(childDiv);
    }
}

// פונקציה זו תבצע ולידציות נוספות לפני שליחת הטופס.
// יש לקרוא לפונקציה זו באירוע submit של הטופס.
function validateFormOnSubmit() {
    // בדיקה 1: אימות שזהות הבעל וזהות האשה אינן זהות (אם שתיהן הוזנו).
    const husbandId = document.getElementById('Zeout')?.value;
    const wifeId = document.getElementById('WifeZeout')?.value;

    if (husbandId && wifeId && husbandId === wifeId) {
        alert('מספר תעודת הזהות של הבעל ושל האשה אינם יכולים להיות זהים.');
        return false; // מונע שליחת טופס
    }

    // בדיקה 2: ולידציית מייל
    const emailField = document.getElementById('Email');
    if (emailField && emailField.value && !isValidEmail(emailField.value)) {
        alert('נא הזן כתובת מייל תקינה.');
        return false;
    }
    const wifeEmailField = document.getElementById('WifeEmail');
    if (wifeEmailField && wifeEmailField.value && !isValidEmail(wifeEmailField.value)) {
        alert('נא הזן כתובת מייל תקינה עבור האשה.');
        return false;
    }

    // בדיקה 3: ולידציית טלפון (מספרים בלבד)
    const mobileField = document.getElementById('Mobile');
    if (mobileField && mobileField.value && !isValidPhoneNumber(mobileField.value)) {
        alert('נא הזן מספר טלפון נייד תקין (9-10 ספרות בלבד).');
        return false;
    }
    const wifeMobileField = document.getElementById('WifeMobile');
    if (wifeMobileField && wifeMobileField.value && !isValidPhoneNumber(wifeMobileField.value)) {
        alert('נא הזן מספר טלפון נייד תקין עבור האשה (9-10 ספרות בלבד).');
        return false;
    }

    // בדיקה 4: ולידציית תאריך (אם שדה התאריך אינו Date input מובנה)
    // אם אתה משתמש ב-input type="date", הדפדפן בדרך כלל מטפל בוולידציה אוטומטית.
    // אם לא, יש להוסיף פונקציה כמו isValidDate.

    // בדיקה 5: ולידציית פרטי בנק (מספרים בלבד)
    const bankNumberField = document.getElementById('BankNumber');
    if (bankNumberField && bankNumberField.value && !isNumeric(bankNumberField.value)) {
        alert('מספר בנק חייב להכיל ספרות בלבד.');
        return false;
    }
    const branchNumberField = document.getElementById('BranchNumber');
    if (branchNumberField && branchNumberField.value && !isNumeric(branchNumberField.value)) {
        alert('מספר סניף חייב להכיל ספרות בלבד.');
        return false;
    }
    const accountNumberField = document.getElementById('AccountNumber');
    if (accountNumberField && accountNumberField.value && !isNumeric(accountNumberField.value)) {
        alert('מספר חשבון חייב להכיל ספרות בלבד.');
        return false;
    }


    // אם הגעת לכאן, כל הבדיקות עברו בהצלחה
    return true;
}

// פונקציות עזר לוולידציה (ניתן למקם אותן גם כן בקובץ ה-JS החדש)
function isValidEmail(email) {
    // Regex בסיסי לבדיקת מייל
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhoneNumber(phone) {
    // Regex למספר טלפון ישראלי (9 או 10 ספרות)
    return /^(0\d{1,2}-?\d{7}|0\d{9})$/.test(phone.replace(/-/g, ''));
}

function isNumeric(value) {
    return /^\d+$/.test(value);
}

// פונקציה להאזנה לאירועי טעינת הדף ושינויים בשדות
document.addEventListener('DOMContentLoaded', function() {
    // הפעל את הפונקציה הראשונית להצגת/הסתרת פרטי האשה בטעינת הדף
    toggleWifeDetails();

    // הוסף מאזין לאירוע שינוי (change) לשדה הסטטוס המשפחתי
    const statusField = document.getElementById('Status_F');
    if (statusField) {
        // בגלל שזה radio group, ייתכן שתצטרך להאזין לכל כפתור רדיו בנפרד
        // או לוודא שהפלטפורמה של Matara.pro מאפשרת האזנה ל-ID של הקבוצה.
        // נניח שיש כאן אלמנט עוטף שאפשר להאזין לו.
        // אם לא, ייתכן שיהיה צורך בלולאה על כל ה-inputs מסוג radio תחת Status_F.
        statusField.addEventListener('change', toggleWifeDetails);
    }

    // הוסף מאזין לאירוע הקלדה (keyup) לשדה מספר הילדים
    const numChildrenInput = document.getElementById('NumChildren');
    if (numChildrenInput) {
        numChildrenInput.addEventListener('keyup', createChildFields);
        numChildrenInput.addEventListener('change', createChildFields); // למקרה של הדבקה או שינוי אחר
    }

    // הוסף מאזין לאירוע שליחת הטופס (submit) לביצוע ולידציות נוספות
    // יש להחליף 'yourFormId' ב-ID האמיתי של הטופס שלך, או למצוא אותו בדרך אחרת.
    // אם זו פלטפורמת טפסים, ייתכן שיש לה מנגנון משלה להוספת ולידציות מותאמות אישית.
    const form = document.querySelector('form'); // או document.getElementById('yourFormId');
    if (form) {
        form.addEventListener('submit', function(event) {
            if (!validateFormOnSubmit()) {
                event.preventDefault(); // מונע שליחת הטופס אם הוולידציה נכשלה
            }
        });
    }
});