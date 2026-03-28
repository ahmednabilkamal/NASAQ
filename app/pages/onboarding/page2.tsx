import React from 'react';
import OnboardingScreen from '../../../components/OnboardingScreen';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { scale, scaleVertical } from '@/utils/responsive';
import { Spacing, BorderRadius } from '@/utils/spacing';
import { FontSizes, LineHeights } from '@/utils/typography';

export default function Page2() {
  const { languageCode } = useLanguage();
  const content = (pageData as any)[languageCode]?.page2 || (pageData as any)['ar'].page2;

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
