import React from 'react';
import OnboardingScreen from '../components/OnboardingScreen';

export default function Page3() {
  return (
    <OnboardingScreen
      backgroundImage={require('../assets/page3bg.png')}
      title="إطلالة متكاملة لكل وقت و لكل لحظة في حياتك"
      nextRoute="/page4"
      currentIndex={2}
      totalIndex={3}
    />
  );
}
