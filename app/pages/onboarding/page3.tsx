import React from 'react';
import OnboardingScreen from '../../../components/OnboardingScreen';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { useAuth } from '@/config/authContext';
import { scale, scaleVertical } from '@/utils/responsive';
import { Spacing, BorderRadius } from '@/utils/spacing';
import { FontSizes, LineHeights } from '@/utils/typography';

export default function Page3() {
  const { languageCode } = useLanguage();
  const { isAuthenticated } = useAuth();
  const content = (pageData as any)[languageCode]?.page3 || (pageData as any)['en'].page3;

  return (
    <OnboardingScreen
      backgroundImage={require('../../../assets/page3bg.png')}
      title={content.title}
      subtitle={content.subtitle}
      nextRoute={isAuthenticated ? "/pages/onboarding/genderSelection" : "/pages/login"}

      currentIndex={2}
      totalIndex={3}
    />
  );
}

