import React from 'react';
import OnboardingScreen from '../../../components/OnboardingScreen';
import { useLanguage } from '@/config/languageRef';
import pageData from '@/data/content';
import { scale, scaleVertical } from '@/utils/responsive';
import { Spacing, BorderRadius } from '@/utils/spacing';
import { FontSizes, LineHeights } from '@/utils/typography';

export default function Page1() {
  const { languageCode } = useLanguage();
  const content = (pageData as any)[languageCode]?.page1 || (pageData as any)['ar'].page1;

  return (
    <OnboardingScreen
      backgroundImage={require('../../../assets/page1bg.png')}
      title={content.title}
      subtitle={content.subtitle}
      nextRoute="/pages/onboarding/page2"
      currentIndex={0}
      totalIndex={3}
    />
  );
}
