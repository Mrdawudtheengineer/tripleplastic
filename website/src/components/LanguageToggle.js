import { useTranslation } from "react-i18next";
export default function LanguageToggle() {
  const { i18n } = useTranslation();
  return (
    <button onClick={() => {
      i18n.changeLanguage(i18n.language === "en" ? "am" : "en");
    }}>
      {i18n.language === "en" ? "አማርኛ" : "English"}
    </button>
  );
}
