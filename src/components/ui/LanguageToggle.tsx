
import React from 'react';
import { Toggle } from '@/components/ui/toggle';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageToggle = () => {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      <Globe className="w-4 h-4 text-gray-600" />
      <Toggle
        pressed={language === 'hi'}
        onPressedChange={toggleLanguage}
        className="data-[state=on]:bg-blue-600 data-[state=on]:text-white"
      >
        {language === 'en' ? t('language.hindi') : t('language.english')}
      </Toggle>
    </div>
  );
};

export default LanguageToggle;
