
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation object
const translations = {
  en: {
    // Header
    'header.title': 'Muzaffarpur Seva Sathi',
    'header.subtitle': 'Smart Tax Monitoring System',
    'header.welcome': 'Welcome',
    'header.notifications': 'Notifications',
    'header.logout': 'Logout',
    'header.admin': 'Admin',
    
    // Dashboard
    'dashboard.welcome': 'Welcome to',
    'dashboard.digitalMuzaffarpur': 'Digital Muzaffarpur',
    'dashboard.description': 'Efficient tracking and management of municipal taxes and services',
    'dashboard.search': 'Search by Property ID or Address...',
    
    // Stats
    'stats.totalCollected': 'Total Collected',
    'stats.activeProperties': 'Active Properties',
    'stats.pendingPayments': 'Pending Payments',
    'stats.collectionRate': 'Collection Rate',
    
    // Tabs
    'tabs.dashboard': 'Tax Dashboard',
    'tabs.adminDashboard': 'Admin Dashboard',
    'tabs.services': 'Municipal Services',
    'tabs.complaints': 'Complaints',
    
    // Services
    'services.title': 'Municipal Services',
    'services.description': 'Access various municipal services and applications',
    'services.tradeLicense': 'Trade License',
    'services.birthCertificate': 'Birth Certificate',
    'services.deathCertificate': 'Death Certificate',
    'services.propertyRegistration': 'Property Registration',
    'services.waterConnection': 'Water Connection',
    'services.buildingPermit': 'Building Permit',
    'services.available': 'Available',
    
    // Footer
    'footer.contact': 'Contact Information',
    'footer.office': 'Municipal Corporation Office, Muzaffarpur',
    'footer.quickLinks': 'Quick Links',
    'footer.calculator': 'Property Tax Calculator',
    'footer.application': 'Trade License Application',
    'footer.history': 'Payment History',
    'footer.support': 'Help & Support',
    'footer.hours': 'Office Hours',
    'footer.weekdays': 'Monday - Friday: 10:00 AM - 6:00 PM',
    'footer.saturday': 'Saturday: 10:00 AM - 2:00 PM',
    'footer.sunday': 'Sunday: Closed',
    
    // Language toggle
    'language.english': 'English',
    'language.hindi': 'हिंदी'
  },
  hi: {
    // Header
    'header.title': 'मुजफ्फरपुर सेवा साथी',
    'header.subtitle': 'स्मार्ट कर निगरानी प्रणाली',
    'header.welcome': 'स्वागत है',
    'header.notifications': 'सूचनाएं',
    'header.logout': 'लॉग आउट',
    'header.admin': 'व्यवस्थापक',
    
    // Dashboard
    'dashboard.welcome': 'डिजिटल मुजफ्फरपुर में आपका स्वागत है',
    'dashboard.digitalMuzaffarpur': '',
    'dashboard.description': 'नगरपालिका करों और सेवाओं की कुशल ट्रैकिंग और प्रबंधन',
    'dashboard.search': 'संपत्ति आईडी या पता से खोजें...',
    
    // Stats
    'stats.totalCollected': 'कुल संग्रह',
    'stats.activeProperties': 'सक्रिय संपत्तियां',
    'stats.pendingPayments': 'लंबित भुगतान',
    'stats.collectionRate': 'संग्रह दर',
    
    // Tabs
    'tabs.dashboard': 'कर डैशबोर्ड',
    'tabs.adminDashboard': 'व्यवस्थापक डैशबोर्ड',
    'tabs.services': 'नगरपालिका सेवाएं',
    'tabs.complaints': 'शिकायतें',
    
    // Services
    'services.title': 'नगरपालिका सेवाएं',
    'services.description': 'विभिन्न नगरपालिका सेवाओं और आवेदनों तक पहुंच',
    'services.tradeLicense': 'व्यापार लाइसेंस',
    'services.birthCertificate': 'जन्म प्रमाण पत्र',
    'services.deathCertificate': 'मृत्यु प्रमाण पत्र',
    'services.propertyRegistration': 'संपत्ति पंजीकरण',
    'services.waterConnection': 'पानी कनेक्शन',
    'services.buildingPermit': 'भवन निर्माण अनुमति',
    'services.available': 'उपलब्ध',
    
    // Footer
    'footer.contact': 'संपर्क जानकारी',
    'footer.office': 'नगर निगम कार्यालय, मुजफ्फरपुर',
    'footer.quickLinks': 'त्वरित लिंक',
    'footer.calculator': 'संपत्ति कर कैलकुलेटर',
    'footer.application': 'व्यापार लाइसेंस आवेदन',
    'footer.history': 'भुगतान इतिहास',
    'footer.support': 'सहायता और समर्थन',
    'footer.hours': 'कार्यालय समय',
    'footer.weekdays': 'सोमवार - शुक्रवार: सुबह 10:00 - शाम 6:00',
    'footer.saturday': 'शनिवार: सुबह 10:00 - दोपहर 2:00',
    'footer.sunday': 'रविवार: बंद',
    
    // Language toggle
    'language.english': 'English',
    'language.hindi': 'हिंदी'
  }
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
