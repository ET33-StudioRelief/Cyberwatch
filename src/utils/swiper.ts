import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';

// Central place to enable Swiper modules. CSS is intentionally not imported:
// navigation/pagination elements are custom Webflow markup styled by project CSS.
Swiper.use([Navigation, Pagination]);

export { Swiper };
