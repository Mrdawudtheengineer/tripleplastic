const translations = {
  en: {
    nav_home: "Home",
    nav_products: "Products",
    nav_gallery: "Gallery",
    nav_about: "About",
    nav_contact: "Contact",
    nav_signin: "Sign In",

    signin_title: "Admin Sign In",
    signin_desc: "Use your administrator credentials to continue.",
    signin_email: "Email Address",
    signin_password: "Password",
    signin_button: "Sign In",

    admin_hero_title: "Administrator Access",
    admin_hero_desc:
      "Secure access for inventory, orders, and business operations. Authorized personnel only."
  },

  am: {
    nav_home: "መነሻ",
    nav_products: "ምርቶች",
    nav_gallery: "ጋለሪ",
    nav_about: "ስለ እኛ",
    nav_contact: "አግኙን",
    nav_signin: "ግባ",

    signin_title: "የአስተዳዳሪ መግቢያ",
    signin_desc: "ለመቀጠል የአስተዳዳሪ መረጃዎችዎን ያስገቡ።",
    signin_email: "የኢሜይል አድራሻ",
    signin_password: "የይለፍ ቃል",
    signin_button: "ግባ",

    admin_hero_title: "የአስተዳዳሪ መዳረሻ",
    admin_hero_desc:
      "ለእቃ አስተዳደር፣ ትዕዛዞችና የንግድ አገልግሎቶች የተጠበቀ መዳረሻ። ለተፈቀዱ ሰራተኞች ብቻ።"
  }
};

const buttons = document.querySelectorAll(".lang-btn");

function setLanguage(lang) {
  localStorage.setItem("lang", lang);

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  buttons.forEach(btn => btn.classList.remove("active"));
  document.getElementById(`lang-${lang}`).classList.add("active");
}

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    const lang = btn.id.replace("lang-", "");
    setLanguage(lang);
  });
});

// Load saved language
const savedLang = localStorage.getItem("lang") || "en";
setLanguage(savedLang);
