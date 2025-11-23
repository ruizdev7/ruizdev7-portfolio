import { useLanguage, LANGUAGES } from "../contexts/LanguageContext";

const LanguageSelector = () => {
  const { language, changeLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => changeLanguage(LANGUAGES.ES)}
        className={`p-2 transition-colors rounded-md ${
          language === LANGUAGES.ES
            ? "text-[#0272AD] dark:text-[#0272AD]"
            : "text-do_text_gray_light dark:text-do_text_gray_dark hover:text-[#0272AD] dark:hover:text-[#0272AD]"
        }`}
        title="Español"
      >
        <span className="text-xl">🇨🇴</span>
      </button>
      <button
        onClick={() => changeLanguage(LANGUAGES.EN)}
        className={`p-2 transition-colors rounded-md ${
          language === LANGUAGES.EN
            ? "text-[#0272AD] dark:text-[#0272AD]"
            : "text-do_text_gray_light dark:text-do_text_gray_dark hover:text-[#0272AD] dark:hover:text-[#0272AD]"
        }`}
        title="English"
      >
        <span className="text-xl">🇺🇸</span>
      </button>
    </div>
  );
};

export default LanguageSelector;
