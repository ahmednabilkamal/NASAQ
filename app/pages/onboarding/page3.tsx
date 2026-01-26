import React from 'react';
import OnboardingScreen from '../../../components/OnboardingScreen';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';

export default function Page3() {
  const { languageCode } = useLanguage();
  const content = (pageData as any)[languageCode]?.page3 || (pageData as any)['en'].page3;

  return (
    <OnboardingScreen
      backgroundImage={require('../../../assets/page3bg.png')}
      title={content.title}
      subtitle={content.subtitle}
      nextRoute="/pages/onboarding/page4"
      currentIndex={2}
      totalIndex={3}
    />
  );
}
