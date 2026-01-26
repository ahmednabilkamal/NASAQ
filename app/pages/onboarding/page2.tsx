import React from 'react';
import OnboardingScreen from '../../../components/OnboardingScreen';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';

export default function Page2() {
  const { languageCode } = useLanguage();
  const content = (pageData as any)[languageCode]?.page2 || (pageData as any)['en'].page2;

  return (
    <OnboardingScreen
      backgroundImage={require('../../../assets/page2bg.png')}
      title={content.title}
      subtitle={content.subtitle}
      nextRoute="/pages/onboarding/page3"
      currentIndex={1}
      totalIndex={3}
    />
  );
}
