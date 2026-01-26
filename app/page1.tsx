import React from 'react';
import OnboardingScreen from '../components/OnboardingScreen';

export default function Page1() {
  return (
    <OnboardingScreen
      backgroundImage={require('../assets/page1bg.png')}
      title="ارتقي بذوقك واظهري بأفضل إطلالة تعبر عنك"
      nextRoute="/page2"
      currentIndex={0}
      totalIndex={3}
    />
  );
}
