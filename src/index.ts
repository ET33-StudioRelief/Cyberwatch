import './index.css';

import { initHpAnimation, initStepsReveal } from './typescript/animations/home';
import { initJoinsUsFloat } from './typescript/animations/joinsUs';
import { initBgParallax } from './typescript/animations/parallaxBackground';
import { initStackedSections } from './typescript/animations/stackedSections';
import { initStepLegendFloat, initStepLines } from './typescript/animations/steps';
import { initAccordion } from './typescript/components/accordion';
import { initGlowOrbit } from './typescript/components/button';
import { initInfoDropdown } from './typescript/components/dropdown';
import { initFooterGlow } from './typescript/components/footer';
import { initDesktopDropdownHover, initNavbar, initNavMenu } from './typescript/components/navbar';
import { initShareLinks } from './typescript/components/share-links';
import { initBlogRelatedSlider } from './typescript/sliders/slider-blog-related';
import { initCasesSlider } from './typescript/sliders/slider-cases';
import { initHpStepsSlider } from './typescript/sliders/slider-hp-steps';
import { initIndustriesSlider } from './typescript/sliders/slider-industries';
import { initProgrammeSlider } from './typescript/sliders/slider-programme';
import { initTestimonialSlider } from './typescript/sliders/slider-testimonial';
import { initTimelineSlider } from './typescript/sliders/slider-timeline';
import { launchMarkerSDK } from './utils/marker';

window.Webflow ||= [];
window.Webflow.push(() => {
  initGlowOrbit();
  initFooterGlow();
  initNavMenu();
  initDesktopDropdownHover();
  initNavbar();
  initAccordion();

  if (window.location.href.includes('webflow.io')) {
    launchMarkerSDK();
    initBgParallax();
    initHpAnimation();
    initStepsReveal();
    initIndustriesSlider();
    initCasesSlider();
    initHpStepsSlider();
    initProgrammeSlider();
    initBlogRelatedSlider();
    initTimelineSlider();
    initStepLines();
    initStepLegendFloat();
    initJoinsUsFloat();
    initStackedSections();
    initTestimonialSlider();
    initInfoDropdown();
    initShareLinks();
  }
});
