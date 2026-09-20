import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: { translation: {
    nav: { sip: 'SIP planner', loan: 'Loan & EMI', fixed: 'Fixed income', mutual: 'Mutual fund tools', planning: 'Smart planning', onboarding: 'Onboarding', education: 'Education', account: 'Account' },
    hero: { eyebrow: 'YOUR MONEY, MADE CLEAR', title: 'Plan with clarity.', title2: 'Grow with intention.', subtitle: 'Illustrative tools for Indian investments, loans, and long-term decisions.' },
    common: { connected: 'API connected', offline: 'API offline', theme: 'Dark mode', language: 'Language', disclaimer: 'Educational estimates, not financial advice.' },
    onboarding: { title: 'Your five-step money map', subtitle: 'Answer a few questions to get a useful starting point.', next: 'Next', back: 'Back', finish: 'Build my plan', age: 'What is your age?', income: 'Monthly take-home income', obligations: 'Monthly obligations and debt payments', goals: 'What are you planning for?', risk: 'How comfortable are you with market ups and downs?', recommendations: 'Start with these calculators' },
    education: { title: 'Financial education hub', search: 'Search glossary and explainers', glossary: 'Glossary', articles: 'Explainers', disclaimer: 'Information is general education, not personal advice.' },
  } },
  hi: { translation: {
    nav: { sip: 'SIP प्लानर', loan: 'लोन और EMI', fixed: 'स्थिर आय', mutual: 'म्यूचुअल फंड', planning: 'स्मार्ट प्लानिंग', onboarding: 'ऑनबोर्डिंग', education: 'शिक्षा', account: 'खाता' },
    hero: { eyebrow: 'आपका पैसा, सरल तरीके से', title: 'स्पष्ट योजना बनाएं।', title2: 'इरादे से बढ़ें।', subtitle: 'भारतीय निवेश और ऋण के लिए शैक्षिक कैलकुलेटर।' },
    common: { connected: 'API जुड़ा है', offline: 'API ऑफलाइन', theme: 'डार्क मोड', language: 'भाषा', disclaimer: 'शैक्षिक अनुमान, वित्तीय सलाह नहीं।' },
    onboarding: { title: 'आपका पांच चरणों का मनी मैप', subtitle: 'सही शुरुआत के लिए कुछ सवालों के जवाब दें।', next: 'आगे', back: 'पीछे', finish: 'मेरी योजना बनाएं', age: 'आपकी उम्र क्या है?', income: 'मासिक हाथ में आय', obligations: 'मासिक दायित्व और ऋण भुगतान', goals: 'आप किस लक्ष्य के लिए योजना बना रहे हैं?', risk: 'बाजार के उतार-चढ़ाव के साथ आप कितने सहज हैं?', recommendations: 'इन कैलकुलेटर से शुरू करें' },
    education: { title: 'वित्तीय शिक्षा केंद्र', search: 'ग्लॉसरी और लेख खोजें', glossary: 'ग्लॉसरी', articles: 'समझाने वाले लेख', disclaimer: 'सामान्य जानकारी, व्यक्तिगत सलाह नहीं।' },
  } },
  bn: { translation: {
    nav: { sip: 'SIP প্ল্যানার', loan: 'লোন ও EMI', fixed: 'স্থির আয়', mutual: 'মিউচুয়াল ফান্ড', planning: 'স্মার্ট প্ল্যানিং', onboarding: 'অনবোর্ডিং', education: 'শিক্ষা', account: 'অ্যাকাউন্ট' },
    hero: { eyebrow: 'আপনার টাকা, সহজভাবে', title: 'স্পষ্ট পরিকল্পনা করুন।', title2: 'উদ্দেশ্য নিয়ে বাড়ান।', subtitle: 'ভারতীয় বিনিয়োগ ও ঋণের শিক্ষামূলক ক্যালকুলেটর।' },
    common: { connected: 'API সংযুক্ত', offline: 'API অফলাইন', theme: 'ডার্ক মোড', language: 'ভাষা', disclaimer: 'শিক্ষামূলক হিসাব, আর্থিক পরামর্শ নয়।' },
    onboarding: { title: 'আপনার পাঁচ ধাপের মানি ম্যাপ', subtitle: 'শুরু করার জন্য কয়েকটি প্রশ্নের উত্তর দিন।', next: 'পরবর্তী', back: 'পেছনে', finish: 'আমার পরিকল্পনা তৈরি করুন', age: 'আপনার বয়স কত?', income: 'মাসিক হাতে পাওয়া আয়', obligations: 'মাসিক দায় ও ঋণ পরিশোধ', goals: 'কোন লক্ষ্যের জন্য পরিকল্পনা করছেন?', risk: 'বাজারের ওঠানামায় আপনি কতটা স্বচ্ছন্দ?', recommendations: 'এই ক্যালকুলেটর দিয়ে শুরু করুন' },
    education: { title: 'আর্থিক শিক্ষা কেন্দ্র', search: 'গ্লসারি ও ব্যাখ্যা খুঁজুন', glossary: 'গ্লসারি', articles: 'ব্যাখ্যা', disclaimer: 'সাধারণ তথ্য, ব্যক্তিগত পরামর্শ নয়।' },
  } },
}

i18n.use(initReactI18next).init({ resources, lng: localStorage.getItem('infinance-language') || 'en', fallbackLng: 'en', interpolation: { escapeValue: false } })
export default i18n
