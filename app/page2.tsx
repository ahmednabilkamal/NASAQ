import React from 'react';
import OnboardingScreen from '../components/OnboardingScreen';

export default function Page2() {
  return (
    <OnboardingScreen
      backgroundImage={require('../assets/page2bg.png')}
      title="تواصلي مع منسقة ملابس تفهمك وتفهم ذوقك"
      nextRoute="/page3"
      currentIndex={1}
      totalIndex={3}
    />
  );
}
