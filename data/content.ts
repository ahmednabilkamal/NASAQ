const pageData = {
  en: {
    dir: "ltr",
    welcome: {
      title: "Welcome",
      subtitle: "Start coding faster"
    },
    page1: {
      title: "Elevate your style and show",
      subtitle: "off your best look",
      buttonText: "Next",
      skipText: "Skip"
    },
    page2: {
      title: "Connect with a stylist",
      subtitle: "Who understands you and your taste",
      buttonText: "Next",
      skipText: "Skip"
    },
    page3: {
      title: "A complete look for every time and every",
      subtitle: "moment in your life",
      buttonText: "Next",
      skipText: "Skip"
    },
    page4: {
      title: "Welcome to Venus Style!",
      buttonText: "Start Exploring"
    },
    login: {
      title: "Sign in",
      subtitle: "Sign in and complete a shopping experience tailored just for you.",
      identifierPlaceholder: "Mobile number or email",
      passwordPlaceholder: "Password",
      rememberMe: "Remember me",
      nextButton: "Next",
      googleButton: "Continue with Google",
      footerText: "Don't have an account? ",
      footerLink: "Register now"
    },
    register: {
      title: "Create an account",
      subtitle: "Hello, create your new account and get started now",
      namePlaceholder: "Name",
      emailPlaceholder: "Email",
      mobilePlaceholder: "Mobile number",
      passwordPlaceholder: "Password",
      confirmPasswordPlaceholder: "Confirm password",
      nextButton: "Next",
      footerText: "Already have an account? ",
      footerLink: "Log in"
    },
    verification: {
      title: "Verification Code",
      subtitle: "Enter the 5-digit verification code",
      verifyButton: "Verify",
      footerText: "Didn't receive the code? ",
      footerLink: "Send the code"
    },
    genderSelection: {
      title: "Select Gender",
      subtitle: "To provide an experience that suits you, choose if you are a man or a woman. We will show you everything you care about from the start.",
      nextButton: "Next"
    },
    heightSelection: {
      title: "Tell us about your height",
      subtitle: "Your height helps us determine the appropriate lengths of dresses and pieces to ensure a balanced and ideal look.",
      unitCm: "cm",
      unitFt: "ft",
      nextButton: "Next"
    },
    weightSelection: {
      title: "Tell us about your weight",
      subtitle: "Determining weight helps us understand your body dimensions better to suggest fabrics and cuts that give you complete comfort and confidence.",
      bmiText: "Body mass index (BMI) reflects how your weight relates to your height.",
      bmiCategories: {
        underweight: "Underweight",
        normal: "Normal",
        overweight: "Overweight",
        obese: "Obese"
      },
      nextButton: "Next"
    },
    skinTone: {
      title: "Which of these tones is like yours?",
      subtitle: "Choose the tone closest to your skin so we can filter the color palette that harmonizes with you perfectly.",
      nextButton: "Next"
    },
    bodyShape: {
      title: "What is your body shape?",
      subtitle: "Choose the icon closest to your body shape to help us filter thousands of designs and choose the most suitable for you.",
      nextButton: "Next"
    },
    boyMeasurements: {
      title: "Your measurements",
      subtitle: "Accurate numbers help stylists suggest fits and sizes. Use a soft tape measure in centimeters.",
      unitHint: "All values in centimeters (cm)",
      progressLine: "{{n}} of {{total}} filled",
      placeholder: "0",
      nextButton: "Next",
      skipButton: "Skip for now",
      skipSaving: "...",
      fields: {
        shoulder: "Shoulder width",
        chest: "Chest",
        waist: "Waist",
        arm: "Arm length",
        hip: "Hips",
        thigh: "Thigh",
        leg: "Inside leg"
      },
      hints: {
        shoulder: "Across the shoulders, back to front",
        chest: "Around the fullest part",
        waist: "Around the natural waistline",
        arm: "Shoulder to wrist",
        hip: "Around the fullest part of the seat",
        thigh: "Around the fullest part of one thigh",
        leg: "Crotch to ankle along the inside"
      }
    },
    fashionIdentity: {
      title: "Define your fashion identity",
      subtitle: "You can choose more than one style; understanding your general taste helps the stylist provide ideal coordination for every occasion.",
      styles: {
        modernCasual: "Modern Casual",
        formalClassic: "Formal Classic"
      },
      nextButton: "Next"
    },
    stylistsList: {
      title: "All Stylists",
      searchPlaceholder: "Search...",
      filterTitle: "Filter Stylists",
      filterByPrice: "Price Range",
      from: "From",
      to: "To",
      style: "Style:",
      applyFilter: "Show Matches",
      clearFilter: "Clear Filters"
    },
    stylistDetail: {
      about: "About",
      portfolio: "Portfolio",
      reviews: "Reviews",
      services: "Services",
      connectButton: "Connect with Stylist",
      payToChatButton: "Pay to Chat",
      hour: "Hour"
    },
    profile: {
      title: "Profile",
      personalInfo: "Personal Information",
      editProfile: "Edit Profile",
      changePassword: "Change Password",
      payments: "Payments",
      settings: "Settings",
      notifications: "Notifications",
      support: "Support",
      help: "Help / FAQ",
      contactUs: "Contact Us",
      privacy: "Privacy & Safety",
      updateButton: "Update",
      verify: "Verify",
      logout: "Logout",
      languageArabic: "Arabic",
      languageEnglish: "English",
      newPassword: "New Password",
      confirmPassword: "Confirm Password",
      enterPassword: "Enter password",
      otpInstruction: "Enter the verification code sent to your phone",
      didntReceiveCode: "Didn't receive the code?",
      resendCode: "Resend code",
      resendAfter: "Resend after"
    },
    payment: {
      title: "Payment",
      addCard: "Add New Card",
      cardNumber: "Card Number",
      expiryDate: "Expiry Date",
      cvv: "CVV",
      cardNickname: "Card Nickname (Optional)",
      saveCard: "Save this card",
      payNow: "Pay Now",
      paymentSummary: "Payment Summary",
      total: "Total (incl. tax)"
    },
    home:{
      heroBannerTitle: "Choosing the right cut for your body makes more difference than the piece itself.",
      trustedStylists: "Stylists trusted by many",
      packages:{
        title:"Packages designed for your needs",
        box1:{
          icon:"x",
          price:350,
          title:"Single set",
          subtitle:"available under 24 hours",
        }
      }
    },
    errors: {
      title: "Error",
      success: "Success",
      passwordRequired: "Please enter password",
      passwordMismatch: "Passwords do not match",
      allFieldsRequired: "Please fill all required fields",
      invalidEmail: "Please enter valid email",
      verificationIncomplete: "Please enter complete verification code",
      verificationDataMissing: "Verification data not found",
      saveFailed: "Save failed, please try again",
      sendFailed: "Send failed",
      permissionDenied: "Permission denied",
      permissionSettingsHint: "Allow Photos or Camera access for this app in your device settings.",
      openSettings: "Open Settings",
      imageSelectFailed: "Image selection failed"
    },
    toast: {
      sent: "Sent",
      verificationSent: "Verification code sent to your phone",
      passwordChanged: "Password changed successfully",
      profileUpdated: "Profile updated successfully",
      cardSaved: "Card saved successfully"
    },
    orders: {
      title: "Orders",
      tabs: {
        all: "All",
        new: "New",
        recent: "Recent",
        saved: "Saved"
      },
      status: {
        pending: "Pending",
        new: "New",
        in_progress: "In Progress",
        processing: "Processing",
        completed: "Completed",
        done: "Done",
        active: "Active",
        inactive: "Cancelled",
        cancelled: "Cancelled"
      },
      orderNumber: "Order #",
      orderDetails: "Order details",
      noOrders: "No orders",
      emptySubtitle: "Completed and in-progress orders will show up here."
    },
    common: {
      or: "or",
      edit: "Edit",
      verify: "Verify",
      next: "Next",
      cancel: "Cancel",
      apply: "Apply",
      clear: "Clear",
      save: "Save",
      update: "Update",
      delete: "Delete",
      viewAll: "View All",
      noResults: "No results",
      noData: "No data available",
      currency: "SAR",
      perHour: "/ hour",
      defaultName: "Guest User",
      greeting: "Good morning",
      seconds: "seconds"
    },
    imageAction: {
      title: "Change Photo",
      message: "Choose upload method",
      cancel: "Cancel",
      takePhoto: "Take Photo",
      chooseFromGallery: "Choose from Gallery"
    },
    contactUs: {
      title: "Contact Us",
      customerSupport: "Customer Support",
      phoneLabel: "Contact Number",
      emailLabel: "Email Address",
      socialMedia: "Social Media",
      instagram: "Instagram",
      twitter: "Twitter",
      facebook: "Facebook"
    },
    favorites: {
      title: "Favorites",
      empty: "No favorites yet",
      emptySubtitle: "Start adding stylists to your favorites"
    }
  },

  ar: {
    dir: "rtl",
    welcome: {
      title: "أهلاً بك",
      subtitle: "ابدأ البرمجة بشكل أسرع"
    },
    page1: {
      title: "ارتقِ بأسلوبك وأظهر",
      subtitle: "أفضل إطلالة لديك",
      buttonText: "التالي",
      optionalChoice: "تخطي"
    },
    page2: {
      title: "تواصل مع خبير مظهر",
      subtitle: "يفهمك ويفهم ذوقك الخاص",
      buttonText: "التالي",
      optionalChoice: "تخطي"
    },
    page3: {
      title: "إطلالة متكاملة لكل وقت وكل",
      subtitle: "لحظة في حياتك",
      buttonText: "التالي",
      optionalChoice: "تخطي"
    },
    page4: {
      title: "مرحباً بكم في فينوس ستايل!",
      buttonText: "ابدأ الاستكشاف"
    },
    login: {
      title: "تسجيل الدخول",
      subtitle: "سجل دخولك واستمتع بتجربة تسوق فريدة مصممة خصيصاً لك.",
      identifierPlaceholder: "رقم الجوال أو البريد الإلكتروني",
      passwordPlaceholder: "كلمة المرور",
      rememberMe: "تذكرني",
      nextButton: "التالي",
      googleButton: "المتابعة باستخدام جوجل",
      footerText: "ليس لديك حساب؟ ",
      footerLink: "سجل الآن"
    },
    register: {
      title: "إنشاء حساب",
      subtitle: "مرحباً، قم بإنشاء حسابك الجديد وابدأ الآن",
      namePlaceholder: "الاسم",
      emailPlaceholder: "البريد الإلكتروني",
      mobilePlaceholder: "رقم الجوال",
      passwordPlaceholder: "كلمة المرور",
      confirmPasswordPlaceholder: "تأكيد كلمة المرور",
      nextButton: "التالي",
      footerText: "لديك حساب بالفعل؟ ",
      footerLink: "تسجيل الدخول"
    },
    verification: {
      title: "رمز التحقق",
      subtitle: "أدخل رمز التحقق المكون من 5 أرقام",
      verifyButton: "تحقق",
      footerText: "لم تصلك الرسالة؟ ",
      footerLink: "إعادة إرسال الرمز"
    },
    genderSelection: {
      title: "تحديد النوع",
      subtitle: "علشان نقدم لك تجربة تناسبك، اختر إذا كنت رجل أو امرأة، وبنحرص نعرض لك كل اللي يهمك من البداية.",
      nextButton: "التالي"
    },
    heightSelection: {
      title: "أخبرنا عن طولك",
      subtitle: "طولك يساعدنا في تحديد أطوال الفساتين والقطع المناسبة لضمان إطلالة متوازنة ومثالية.",
      unitCm: "سم",
      unitFt: "قدم",
      nextButton: "التالي"
    },
    weightSelection: {
      title: "أخبرنا عن وزنك",
      subtitle: "تحديد الوزن يساعدنا في فهم أبعاد جسمك بشكل أفضل، لنقترح لك أقمشة وقصات تمنحك الراحة التامة والثقة.",
      bmiText: "مؤشر كتلة الجسم (BMI) يعكس علاقة وزنك بطولك.",
      bmiCategories: {
        underweight: "وزن ناقص",
        normal: "وزن طبيعي",
        overweight: "وزن زائد",
        obese: "سمنة"
      },
      nextButton: "التالي"
    },
    skinTone: {
      title: "أيُّ هذه الدرجات تشبهك؟",
      subtitle: "اختر الدرجة الأقرب لبشرتك لنقوم بترشيح لوحة الألوان التي تتناغم معك بشكل مثالي.",
      nextButton: "التالي"
    },
    bodyShape: {
      title: "ما هو شكل قوامك؟",
      subtitle: "اختر الأيقونة الأقرب لشكل جسمك لمساعدتنا في فلترة آلاف التصاميم واختيار الأنسب لك.",
      nextButton: "التالي"
    },
    boyMeasurements: {
      title: "قياساتك",
      subtitle: "الأرقام الدقيقة تساعد المنسقين على اقتراح المقاس والقص المناسب. استخدم شريط قياس لين بالسنتيمتر.",
      unitHint: "جميع القيم بالسنتيمتر (سم)",
      progressLine: "تم إدخال {{n}} من {{total}}",
      placeholder: "0",
      nextButton: "التالي",
      skipButton: "تخطي",
      skipSaving: "...",
      fields: {
        shoulder: "عرض الأكتاف",
        chest: "محيط الصدر",
        waist: "محيط الخصر",
        arm: "طول الذراع",
        hip: "محيط الورك",
        thigh: "محيط الفخذ",
        leg: "طول الساق من الداخل"
      },
      hints: {
        shoulder: "من كتف إلى كتف في الخلف",
        chest: "حول أعرض جزء من الصدر",
        waist: "حول الخصر الطبيعي",
        arm: "من الكتف إلى المعصم",
        hip: "حول أعرض جزء من الورك",
        thigh: "حول أعرض جزء من الفخذ",
        leg: "من الفرج إلى الكاحل من الداخل"
      }
    },
    fashionIdentity: {
      title: "حدّد هويتك في الموضة",
      subtitle: "يمكنك اختيار أكثر من ستايل؛ فهم ذوقك العام يساعد المنسّق على تقديم اقتراحات تنسيق مثالية لكل مناسبة.",
      styles: {
        modernCasual: "كاجوال عصري",
        formalClassic: "كلاسيكي رسمي"
      },
      nextButton: "التالي"
    },
    stylistsList: {
      title: "كل المنسّقين",
      searchPlaceholder: "بحث",
      filterTitle: "فلتر المنسّقين",
      filterByPrice: "الميزانية",
      from: "من",
      to: "إلي",
      style: "الأستايل:",
      applyFilter: "شاهد المنسّقين المتطابقين",
      clearFilter: "مسح كل الفلاتر"
    },
    stylistDetail: {
      about: "عن المنسّق",
      portfolio: "معرض الأعمال",
      reviews: "التقييمات",
      services: "الخدمات",
      connectButton: "تواصل مع المنسّق",
      payToChatButton: "ادفع للدردشة",
      hour: "ساعة"
    },
    profile: {
      title: "الملف الشخصي",
      personalInfo: "المعلومات الشخصية",
      editProfile: "تعديل الملف الشخصي",
      changePassword: "تغيير كلمة المرور",
      payments: "المدفوعات",
      settings: "الإعدادات",
      notifications: "الإشعارات",
      support: "الدعم",
      help: "المساعدة / الأسئلة الشائعة",
      contactUs: "تواصل معنا",
      privacy: "الخصوصية والأمان",
      updateButton: "تحديث",
      verify: "تأكيد",
      logout: "تسجيل الخروج",
      languageArabic: "العربية",
      languageEnglish: "الانجليزية",
      newPassword: "كلمة المرور الجديدة",
      confirmPassword: "تأكيد كلمة المرور",
      enterPassword: "أدخل كلمة المرور",
      otpInstruction: "أدخل رمز التحقق المرسل إلى رقم هاتفك",
      didntReceiveCode: "لم يصلك الرمز؟",
      resendCode: "يمكنك إعادة الإرسال",
      resendAfter: "يمكنك إعادة الإرسال بعد"
    },
    payment: {
      title: "الدفع",
      addCard: "إضافة بطاقة جديدة",
      cardNumber: "رقم البطاقة",
      expiryDate: "تاريخ الانتهاء",
      cvv: "رمز الأمان (CVV)",
      cardNickname: "اسم مستعار للبطاقة (اختياري)",
      saveCard: "تذكر هذه البطاقة (حفظ البيانات)",
      payNow: "ادفع",
      paymentSummary: "ملخص الدفع",
      total: "الإجمالي (شامل الضريبة)"
    },
      home:{
      heroBannerTitle: "اختيار القصة المناسبة لجسمك يفرق أكثر من القطعة نفسها.",
      trustedStylists: "منسّقون موثوقون لدى الكثيرين",
      packages:{
        title:"باقات مصممة لتلبية احتياجاتك",
        box1:{
          icon:"x",
          price:350,
          title:"مجموعة واحدة",
          subtitle:"متوفرة خلال 24 ساعة",
        }
      }
    },
    errors: {
      title: "خطأ",
      success: "نجاح",
      passwordRequired: "يرجى إدخال كلمة المرور",
      passwordMismatch: "كلمات المرور غير متطابقة",
      allFieldsRequired: "يرجى ملء جميع الحقول المطلوبة",
      invalidEmail: "يرجى إدخال بريد إلكتروني صحيح",
      verificationIncomplete: "يرجى إدخال رمز التحقق كاملاً",
      verificationDataMissing: "بيانات التحقق غير موجودة",
      saveFailed: "فشل الحفظ، يرجى المحاولة مجدداً",
      sendFailed: "فشل الإرسال",
      permissionDenied: "تم رفض الإذن",
      permissionSettingsHint: "فعّل الوصول للصور أو الكاميرا من إعدادات الجهاز لهذا التطبيق.",
      openSettings: "فتح الإعدادات",
      imageSelectFailed: "فشل اختيار الصورة"
    },
    toast: {
      sent: "تم الإرسال",
      verificationSent: "تم إرسال رمز التحقق إلى هاتفك",
      passwordChanged: "تم تغيير كلمة المرور بنجاح",
      profileUpdated: "تم تحديث الملف الشخصي بنجاح",
      cardSaved: "تم حفظ البطاقة بنجاح"
    },
    orders: {
      title: "الطلبات",
      tabs: {
        all: "الكل",
        new: "جديد",
        recent: "الأخيرة",
        saved: "محفوظ"
      },
      status: {
        pending: "قيد الانتظار",
        new: "جديد",
        in_progress: "قيد المعالجة",
        processing: "معالجة",
        completed: "مكتمل",
        done: "تم",
        active: "نشط",
        inactive: "ملغى",
        cancelled: "ملغى"
      },
      orderNumber: "طلب رقم #",
      orderDetails: "تفاصيل الطلب",
      noOrders: "لا توجد طلبات",
      emptySubtitle: "ستظهر طلباتك المكتملة والجارية هنا."
    },
    common: {
      or: "أو",
      edit: "تعديل",
      verify: "تحقق",
      next: "التالي",
      cancel: "إلغاء",
      apply: "تطبيق",
      clear: "مسح",
      save: "حفظ",
      update: "تحديث",
      delete: "حذف",
      viewAll: "عرض الكل",
      noResults: "لا توجد نتائج",
      noData: "لا توجد بيانات متاحة",
      currency: "\u20C1",
      perHour: "/ الساعة",
      defaultName: "مستخدم ضيف",
      greeting: "صباح الخير",
      seconds: "ثانية"
    },
    imageAction: {
      title: "تغيير الصورة",
      message: "اختر طريقة التحميل",
      cancel: "إلغاء",
      takePhoto: "التقط صورة",
      chooseFromGallery: "اختر من المعرض"
    },
    contactUs: {
      title: "تواصل معنا",
      customerSupport: "خدمة العملاء",
      phoneLabel: "رقم التواصل",
      emailLabel: "عنوان البريد الإلكتروني",
      socialMedia: "وسائل التواصل الاجتماعي",
      instagram: "إنستغرام",
      twitter: "تويتر",
      facebook: "فيسبوك"
    },
    favorites: {
      title: "المفضلة",
      empty: "لا توجد عناصر مفضلة بعد",
      emptySubtitle: "ابدأ بإضافة منسقات إلى قائمة المفضلة لديك"
    }

  }
};

export default pageData;