// Bilingual (English / Arabic) support with RTL. Numbers stay Western (0-9).
// Keys are the English source strings; values are the Arabic translations.
window.BSG = window.BSG || {};

window.BSG.i18n = (function () {
  const KEY = 'bsg_lang';
  let lang = localStorage.getItem(KEY) || 'en';

  const dict = {
    // ---- Navbar / chrome ----
    'Dashboard': 'لوحة التحكم',
    'New Assessment': 'تقييم جديد',
    'History': 'السجل',
    'Contact': 'تواصل معنا',
    'Profile': 'الملف الشخصي',
    'Log out': 'تسجيل الخروج',
    'Home': 'الرئيسية',
    'Log in': 'تسجيل الدخول',
    'Register': 'إنشاء حساب',
    'Online': 'متصل',
    'Offline': 'غير متصل',
    'pending': 'بانتظار المزامنة',

    // ---- Landing ----
    'Building Damage Assessment Platform': 'منصة تقييم أضرار المباني',
    'hero.lead': 'حلٌّ رقميٌّ موحَّد يساعد المهندسين الميدانيين على تقييم المباني المتضررة جزئياً في غزة، وتوثيق الأضرار بالصور والفيديو، وتوليد تقارير منظَّمة — حتى دون اتصال بالإنترنت.',
    'Start Assessing': 'ابدأ التقييم',
    'Learn more': 'اعرف المزيد',
    'Why this platform?': 'لماذا هذه المنصة؟',
    'why.body': 'بعد دمار عام 2023 في غزة، تحتاج آلاف المباني إلى تقييم. واليوم تُجرى هذه التقييمات يدوياً، وغير موحَّدة، ويصعب توثيقها ومشاركتها.',
    'Replaces slow, paper-based methods': 'تستبدل الطرق الورقية البطيئة',
    'Standardized, structured damage records': 'سجلات أضرار موحَّدة ومنظَّمة',
    'Works in areas with poor connectivity': 'تعمل في المناطق ضعيفة الاتصال',
    'Faster reporting and decision-making': 'تسريع إعداد التقارير واتخاذ القرار',
    'Who is it for?': 'لمن هذه المنصة؟',
    'Field Engineers': 'المهندسون الميدانيون',
    'Enter building & owner data, assess damage, upload media, generate reports.': 'إدخال بيانات المبنى والمالك، تقييم الضرر، رفع الوسائط، وتوليد التقارير.',
    'Humanitarian Organizations': 'المنظمات الإنسانية',
    'Collect reports, analyze conditions, prioritize emergency response.': 'جمع التقارير، تحليل الأوضاع، وتحديد أولويات الاستجابة الطارئة.',
    'Government Authorities': 'الجهات الحكومية',
    'Use structured records for reconstruction planning.': 'استخدام السجلات المنظَّمة لتخطيط إعادة الإعمار.',
    'Core Features': 'الميزات الأساسية',
    'Field Inspection Form': 'نموذج الفحص الميداني',
    'Capture owner info, building details, damage type and severity, and engineer notes in one structured form.': 'توثيق بيانات المالك وتفاصيل المبنى ونوع الضرر وشدّته وملاحظات المهندس في نموذج واحد منظَّم.',
    'Media Documentation': 'التوثيق بالوسائط',
    'Attach images and videos of the damage as visual evidence for every assessment.': 'إرفاق صور وفيديوهات للضرر كدليل بصري لكل تقييم.',
    'Automated Reports': 'تقارير تلقائية',
    'Generate a structured PDF report instantly — ready to print, export and share.': 'توليد تقرير PDF منظَّم فوراً — جاهز للطباعة والتصدير والمشاركة.',
    'Offline Collection': 'العمل دون اتصال',
    'Keep working without internet. Data and photos are stored on the device.': 'تابع العمل دون إنترنت. تُحفظ البيانات والصور على الجهاز.',
    'Automatic Sync': 'مزامنة تلقائية',
    'When connectivity returns, offline records sync to the central server automatically.': 'عند عودة الاتصال، تُزامَن السجلات تلقائياً مع الخادم المركزي.',
    'Dashboard & History': 'لوحة التحكم والسجل',
    'Track all your inspections, filter by severity, and review past assessments.': 'تتبّع جميع عمليات الفحص، التصفية حسب الشدّة، ومراجعة التقييمات السابقة.',
    'Ready to standardize damage assessment?': 'جاهز لتوحيد عملية تقييم الأضرار؟',
    'Create an account and start documenting building damage in minutes.': 'أنشئ حساباً وابدأ بتوثيق أضرار المباني خلال دقائق.',
    'Get started': 'ابدأ الآن',
    'Islamic University of Gaza · Software Engineering Project (2026)': 'الجامعة الإسلامية بغزة · مشروع هندسة البرمجيات (2026)',

    // ---- Auth ----
    'Welcome back': 'مرحباً بعودتك',
    'Log in to access your assessments': 'سجّل الدخول للوصول إلى تقييماتك',
    'Email': 'البريد الإلكتروني',
    'Password': 'كلمة المرور',
    'No account?': 'لا تملك حساباً؟',
    'Demo accounts': 'حسابات تجريبية',
    'Engineer:': 'مهندس:',
    'Admin:': 'مدير:',
    'Logging in…': 'جارٍ تسجيل الدخول…',
    'Create your account': 'أنشئ حسابك',
    'Register as a field engineer': 'سجّل كمهندس ميداني',
    'Full name': 'الاسم الكامل',
    'Phone': 'رقم الهاتف',
    'At least 6 characters.': '6 أحرف على الأقل.',
    'Already have an account?': 'لديك حساب بالفعل؟',
    'Creating…': 'جارٍ الإنشاء…',

    // ---- Dashboard ----
    'Recent Assessments': 'أحدث التقييمات',
    'ID': 'المعرّف',
    'Location': 'الموقع',
    'Severity': 'الشدّة',
    'Status': 'الحالة',
    'Date': 'التاريخ',
    'Loading…': 'جارٍ التحميل…',
    'Total Assessments': 'إجمالي التقييمات',
    'Severe / Critical': 'بالغ / حرِج',
    'Media Files': 'ملفات الوسائط',
    'Engineers': 'المهندسون',
    'Reviewed': 'تمت المراجعة',
    'Sync now': 'زامن الآن',
    'View': 'عرض',
    'Your personal assessments': 'تقييماتك الشخصية',
    'System-wide view (admin)': 'عرض على مستوى النظام (مدير)',
    'No assessments yet. Create your first one!': 'لا توجد تقييمات بعد. أنشئ أول تقييم!',
    'Welcome, {name}': 'مرحباً، {name}',
    '{n} assessment(s) saved offline and waiting to sync.': 'تم حفظ {n} تقييم على الجهاز بانتظار المزامنة.',
    'Synced {n} offline record(s).': 'تمت مزامنة {n} سجل بنجاح.',
    'Synced {n} record(s).': 'تمت مزامنة {n} سجل.',
    'Still offline — cannot sync yet.': 'ما زلت دون اتصال — لا يمكن المزامنة الآن.',

    // ---- Assessment form ----
    'New Building Assessment': 'تقييم مبنى جديد',
    'Edit Assessment': 'تعديل التقييم',
    'Document the condition of a damaged building.': 'وثّق حالة مبنى متضرر.',
    'Editing assessment #{id}': 'تعديل التقييم رقم {id}',
    'Building Information': 'معلومات المبنى',
    'Owner Information': 'معلومات المالك',
    'Damage Assessment': 'تقييم الضرر',
    'Building location / address': 'موقع / عنوان المبنى',
    'Building type': 'نوع المبنى',
    'Number of floors': 'عدد الطوابق',
    'Year built': 'سنة البناء',
    'GPS latitude': 'خط العرض (GPS)',
    'GPS longitude': 'خط الطول (GPS)',
    'Locate': 'تحديد الموقع',
    'Owner name': 'اسم المالك',
    'National ID': 'رقم الهوية',
    'Damage type': 'نوع الضرر',
    'Habitability': 'قابلية السكن',
    'Engineer notes & observations': 'ملاحظات المهندس والمشاهدات',
    'Attach photos (and optional video) of the damage. You can select multiple files.': 'أرفق صوراً (وفيديو اختياري) للضرر. يمكنك اختيار عدة ملفات.',
    'Save Assessment': 'حفظ التقييم',
    'Cancel': 'إلغاء',
    'You are offline. This assessment will be saved on your device and synced automatically when you reconnect.': 'أنت غير متصل. سيُحفظ هذا التقييم على جهازك وتتم مزامنته تلقائياً عند عودة الاتصال.',
    'e.g. Al-Rimal, Gaza City — Omar Al-Mukhtar St.': 'مثال: الرمال، مدينة غزة — شارع عمر المختار',
    'Describe the observed damage, risks, and recommendations…': 'صف الضرر الملحوظ والمخاطر والتوصيات…',
    '— select —': '— اختر —',
    'Saving…': 'جارٍ الحفظ…',
    'Building location and severity are required.': 'موقع المبنى والشدّة مطلوبان.',
    'Existing media:': 'الوسائط الحالية:',
    'Delete this media file?': 'حذف ملف الوسائط هذا؟',
    'Media deleted.': 'تم حذف الوسائط.',
    'Assessment updated.': 'تم تحديث التقييم.',
    'Assessment saved.': 'تم حفظ التقييم.',
    'Saved offline. It will sync automatically when you reconnect.': 'تم الحفظ دون اتصال. ستتم المزامنة تلقائياً عند عودة الاتصال.',
    'Network unavailable — saved offline.': 'لا يوجد اتصال — تم الحفظ على الجهاز.',
    'Location captured.': 'تم التقاط الموقع.',
    'Could not get location.': 'تعذّر الحصول على الموقع.',
    'Geolocation not supported.': 'تحديد الموقع غير مدعوم.',

    // ---- Enums (display only; stored values stay English) ----
    'Residential': 'سكني', 'Commercial': 'تجاري', 'Industrial': 'صناعي',
    'Public': 'مرفق عام', 'Mixed-use': 'متعدد الاستخدام', 'Other': 'أخرى',
    'Structural': 'إنشائي', 'Partial collapse': 'انهيار جزئي', 'Cracks': 'تصدعات',
    'Fire': 'حريق', 'Water': 'مياه', 'Facade': 'أضرار واجهة',
    'Minor': 'بسيط', 'Moderate': 'متوسط', 'Severe': 'جسيم', 'Critical': 'شديد الخطورة',
    'Habitable': 'صالح للسكن', 'Conditional': 'مشروط', 'Uninhabitable': 'غير صالح للسكن',
    'submitted': 'مُرسَل', 'draft': 'مسودة', 'reviewed': 'تمت المراجعة',
    'engineer': 'مهندس', 'admin': 'مدير', 'online': 'عبر الإنترنت', 'offline-sync': 'مزامنة دون اتصال',

    // ---- View ----
    'Assessment': 'التقييم',
    'Back to history': 'العودة إلى السجل',
    'Generate PDF': 'توليد PDF',
    'Edit': 'تعديل',
    'Assessed By': 'أجراه',
    'Engineer': 'المهندس',
    'Source': 'المصدر',
    'Engineer Notes': 'ملاحظات المهندس',
    'No notes.': 'لا توجد ملاحظات.',
    'Floors': 'الطوابق',
    'No media attached to this assessment.': 'لا توجد وسائط مرفقة بهذا التقييم.',
    'Could not load assessment:': 'تعذّر تحميل التقييم:',
    'No assessment specified.': 'لم يُحدَّد أي تقييم.',
    'Delete this assessment and all its media? This cannot be undone.': 'حذف هذا التقييم وكل وسائطه؟ لا يمكن التراجع عن ذلك.',
    'Assessment deleted.': 'تم حذف التقييم.',
    'Media Documentation ({n})': 'التوثيق بالوسائط ({n})',

    // ---- Report (print) ----
    'Damage Assessment Report': 'تقرير تقييم أضرار المبنى',
    'Report ID': 'رقم التقرير',
    'Generated on': 'تاريخ الإصدار',
    'Print / Save as PDF': 'طباعة / حفظ PDF',
    'Photo Documentation': 'التوثيق بالصور',
    'Back': 'رجوع',
    'GPS coordinates': 'إحداثيات GPS',
    'Loading report…': 'جارٍ تحميل التقرير…',
    'This is a preliminary field assessment generated by BuildSafe Gaza.': 'هذا تقييم ميداني أولي صادر عن منصة BuildSafe Gaza.',
    'Islamic University of Gaza — Software Engineering Project': 'الجامعة الإسلامية بغزة — مشروع هندسة البرمجيات',
    'video file(s) attached (view in the app).': 'ملف/ملفات فيديو مرفقة (تُشاهد داخل التطبيق).',

    // ---- History ----
    'Assessment History': 'سجل التقييمات',
    'Offline — showing locally cached and pending records.': 'دون اتصال — عرض السجلات المخزّنة محلياً وبانتظار المزامنة.',
    'Search location, owner, notes…': 'ابحث في الموقع، المالك، الملاحظات…',
    'All severities': 'كل الدرجات',
    'All statuses': 'كل الحالات',
    'Submitted': 'مُرسَل',
    'Draft': 'مسودة',
    'Newest first': 'الأحدث أولاً',
    'Oldest first': 'الأقدم أولاً',
    'Type': 'النوع',
    'Media': 'الوسائط',
    'pending sync': 'بانتظار المزامنة',
    'on device': 'على الجهاز',
    'No assessments found.': 'لا توجد تقييمات مطابقة.',
    '{n} assessment(s)': '{n} تقييم',
    '{n} pending sync': '{n} بانتظار المزامنة',

    // ---- Profile ----
    'My Profile': 'ملفي الشخصي',
    'Account Information': 'معلومات الحساب',
    'Role': 'الدور',
    'Save changes': 'حفظ التغييرات',
    'Change Password': 'تغيير كلمة المرور',
    'Current password': 'كلمة المرور الحالية',
    'New password': 'كلمة المرور الجديدة',
    'Update password': 'تحديث كلمة المرور',
    'Profile updated.': 'تم تحديث الملف الشخصي.',
    'Password updated.': 'تم تحديث كلمة المرور.',

    // ---- Contact ----
    'Contact Us': 'تواصل معنا',
    'Questions, feedback, or partnership requests? Send us a message.': 'أسئلة أو ملاحظات أو طلبات شراكة؟ أرسل لنا رسالة.',
    'Name': 'الاسم',
    'Subject': 'الموضوع',
    'Message': 'الرسالة',
    'Send message': 'إرسال الرسالة',
    'Thank you — your message has been received.': 'شكراً — تم استلام رسالتك.',

    // ---- Offline page ----
    'You are offline': 'أنت غير متصل',
    "This page isn't available offline yet. Don't worry — any assessments you saved on this device are safe and will sync automatically when you reconnect.": 'هذه الصفحة غير متاحة دون اتصال بعد. لا تقلق — أي تقييمات حفظتها على هذا الجهاز آمنة وستتم مزامنتها تلقائياً عند عودة الاتصال.',
    'Go to Dashboard': 'الذهاب إلى لوحة التحكم',

    // ---- Connectivity toasts ----
    'Back online — synchronizing…': 'عاد الاتصال — جارٍ المزامنة…',
    'You are offline — data will be saved on this device.': 'أنت غير متصل — ستُحفظ البيانات على هذا الجهاز.',
  };

  function isAr() { return lang === 'ar'; }

  // Translate a key, with optional {var} interpolation.
  function t(s, vars) {
    let out = isAr() && dict[s] != null ? dict[s] : s;
    if (vars) for (const k in vars) out = out.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
    return out;
  }

  function set(newLang) {
    localStorage.setItem(KEY, newLang);
    location.reload();
  }

  // Apply translations to the current DOM (static content). Dynamic content uses t() directly.
  function apply() {
    const ar = isAr();
    const html = document.documentElement;
    html.lang = ar ? 'ar' : 'en';
    html.dir = ar ? 'rtl' : 'ltr';

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const k = el.getAttribute('data-i18n-html');
      if (ar && dict[k]) el.innerHTML = dict[k];
    });

    if (!ar) return;

    // Replace exact-match text nodes
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        const p = n.parentNode;
        if (!p) return NodeFilter.FILTER_REJECT;
        if (p.nodeName === 'SCRIPT' || p.nodeName === 'STYLE') return NodeFilter.FILTER_REJECT;
        if (p.hasAttribute && (p.hasAttribute('data-i18n') || p.hasAttribute('data-i18n-html'))) return NodeFilter.FILTER_REJECT;
        return n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((n) => {
      const key = n.nodeValue.trim();
      if (dict[key]) n.nodeValue = n.nodeValue.replace(key, dict[key]);
    });

    // Placeholders
    document.querySelectorAll('[placeholder]').forEach((el) => {
      const key = el.getAttribute('placeholder').trim();
      if (dict[key]) el.setAttribute('placeholder', dict[key]);
    });
  }

  // A small EN/AR toggle button for the navbar
  function switcherHTML() {
    return `<button class="btn btn-sm btn-light fw-bold" id="lang-switch" title="Language / اللغة">${isAr() ? 'EN' : 'ع'}</button>`;
  }
  function bindSwitcher() {
    const b = document.getElementById('lang-switch');
    if (b) b.onclick = () => set(isAr() ? 'en' : 'ar');
  }

  // Translate static content as soon as this script runs (DOM body already parsed)
  apply();

  return { t, set, isAr, apply, switcherHTML, bindSwitcher, get lang() { return lang; } };
})();
