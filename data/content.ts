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
      bmiText: "Your Body Mass Index (BMI) shows your weight is normal",
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
    personalMeasurements: {
      title: "Enter your personal measurements",
      subtitle: "Enter your basic body measurements to provide size and shape recommendations tailored to you.",
      shoulder: "Shoulder",
      chest: "Chest",
      waist: "Waist",
      arm: "Arm",
      buttocks: "Hips",
      thigh: "Thigh",
      leg: "Leg",
      unit: "cm",
      nextButton: "Next"
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
      experience: "Years of experience",
      connectButton: "Connect with Stylist",
      hour: "Hour"
    },
    profile: {
      title: "Profile",
      personalInfo: "Personal Information",
      editProfile: "Edit Profile",
      changePassword: "Change Password",
      payments: "Payments",
      settings: "Settings",
      darkMode: "Dark Mode",
      notifications: "Notifications",
      language: "Language",
      support: "Support",
      help: "Help / FAQ",
      contactUs: "Contact Us",
      privacy: "Privacy & Safety",
      updateButton: "Update"
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
      packages:{
        title:"Packages designed for your needs", 
        box1:{
          icon:"x", 
          price:350,
          title:"Single set", 
          subtitle:"available under 24 hours", 
        }
      }
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
      footerText: "لم تصلك الرسالة؟ ",
      footerLink: "إعادة إرسال الرمز"
    },
    genderSelection: {
      title: "تحديد النوع",
      subtitle: "علشان نقدم لك تجربة تناسبك، اختر إذا كنت رجل أو امرأة، وبنحرص نعرض لك كل اللي يهمك من البداية.",
      nextButton: "التالي"
    },
    heightSelection: {
      title: "أخبرينا عن طولك",
      subtitle: "طولك يساعدنا في تحديد أطوال الفساتين والقطع المناسبة لضمان إطلالة متوازنة ومثالية.",
      unitCm: "سم",
      unitFt: "قدم",
      nextButton: "التالي"
    },
    weightSelection: {
      title: "أخبرينا عن وزنك",
      subtitle: "تحديد الوزن يساعدنا في فهم أبعاد جسمك بشكل أفضل، لنقترح لك أقمشة وقصات تمنحك الراحة التامة والثقة.",
      bmiText: "مؤشر كتلة جسمك (BMI) يظهر أن وزنك طبيعي",
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
      subtitle: "اختاري الدرجة الأقرب لبشرتك لنقوم بترشيح لوحة الألوان التي تتناغم معك بشكل مثالي.",
      nextButton: "التالي"
    },
    bodyShape: {
      title: "ما هو شكل قوامك؟",
      subtitle: "اختاري الأيقونة الأقرب لشكل جسمك لمساعدتنا في فلترة آلاف التصاميم واختيار الأنسب لك.",
      nextButton: "التالي"
    },
    personalMeasurements: {
      title: "أدخل قياساتك الشخصية",
      subtitle: "أدخلي قياسات جسمك الأساسية لتقديم توصيات ملائمة لمقاسك وشكلك.",
      shoulder: "الكتف",
      chest: "الصدر",
      waist: "الخصر",
      arm: "الذراع",
      buttocks: "المؤخرة",
      thigh: "الفخذ",
      leg: "الساق",
      unit: "سم",
      nextButton: "التالي"
    },
    fashionIdentity: {
      title: "حددي هويتك في الموضة",
      subtitle: "يمكنك اختيار أكثر من ستايل؛ فهم ذوقك العام يساعد المنسقة على تقديم اقتراحات تنسيق مثالية لكل مناسبة.",
      styles: {
        modernCasual: "كاجوال عصري",
        formalClassic: "كلاسيكي رسمي"
      },
      nextButton: "التالي"
    },
    stylistsList: {
      title: "كل المنسقات",
      searchPlaceholder: "بحث",
      filterTitle: "فلتر المنسقات",
      filterByPrice: "الميزانية",
      from: "من",
      to: "إلي",
      style: "الأستايل:",
      applyFilter: "شاهد المنسقات المتطابقة",
      clearFilter: "مسح كل الفلاتر"
    },
    stylistDetail: {
      about: "عن المنسقة",
      portfolio: "معرض الأعمال",
      reviews: "التقييمات",
      services: "الخدمات",
      experience: "خبرة أكثر من سنتين",
      connectButton: "تواصل مع المنسقة",
      hour: "ساعة"
    },
    profile: {
      title: "الملف الشخصي",
      personalInfo: "المعلومات الشخصية",
      editProfile: "تعديل الملف الشخصي",
      changePassword: "تغيير كلمة المرور",
      payments: "المدفوعات",
      settings: "الإعدادات",
      darkMode: "الوضع الداكن",
      notifications: "الإشعارات",
      language: "اللغة",
      support: "الدعم",
      help: "المساعدة / الأسئلة الشائعة",
      contactUs: "تواصل معنا",
      privacy: "الخصوصية والأمان",
      updateButton: "تحديث"
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
      packages:{
        title:"باقات مصممة لتلبية احتياجاتك", 
        box1:{
          icon:"x", 
          price:350,
          title:"مجموعة واحدة", 
          subtitle:"متوفرة خلال 24 ساعة", 
        }
      }
    }

  }
};

export default pageData;