import './index.css';

import { initHpAnimation } from './typescript/animations/home';
import { initBgParallax } from './typescript/animations/parallaxBackground';
import { initStackedSections } from './typescript/animations/stackedSections';
import { initStepLines } from './typescript/animations/steps';
import { initAccordion } from './typescript/components/accordion';
import { initGlowOrbit } from './typescript/components/button';
import { initInfoDropdown } from './typescript/components/dropdown';
import { initFooterGlow } from './typescript/components/footer';
import { initDesktopDropdownHover, initNavbar, initNavMenu } from './typescript/components/navbar';
import { initHpCasesSlider } from './typescript/sliders/slider-hp-cases';
import { initHpStepsSlider } from './typescript/sliders/slider-hp-steps';
import { initIndustriesSlider } from './typescript/sliders/slider-industries';
import { initTestimonialSlider } from './typescript/sliders/slider-testimonial';
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
    initIndustriesSlider();
    initHpCasesSlider();
    initHpStepsSlider();
    initStepLines();
    initStackedSections();
    initTestimonialSlider();
    initInfoDropdown();
  }
});
