// In src/components/AdBanner.jsx
import React from 'react';
import { AdMobBanner } from 'react-admob';

const AdBanner = () => {
  // REPLACE THIS LINE WITH YOUR REAL AD UNIT ID
    const BANNER_AD_UNIT_ID = 
    " ca-app-pub-1898502758132262~8067743654 "; // Your real ID!
      
return (
<div className="ad-banner">
 <AdMobBanner
 adSize="smartBannerPortrait"
 adUnitID={ ca-app-pub-1898502758132262/6563090296 }
 targetingInfo={{
 forChildDirectedTreatment: true,  // CRITICAL for kids app
 forUnderAgeOfConsent: true        // CRITICAL for kids app
  }}
 onAdFailedToLoad={(error) => {
console.log("Ad failed to load:", error);
// Silently fail - don't show errors to users
 }}
 />
 </div>
);
 };

export default AdBanner;