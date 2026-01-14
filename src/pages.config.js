import Benefits from './pages/Benefits';
import Dashboard from './pages/Dashboard';
import Guide from './pages/Guide';
import HouseholdSettings from './pages/HouseholdSettings';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Benefits": Benefits,
    "Dashboard": Dashboard,
    "Guide": Guide,
    "HouseholdSettings": HouseholdSettings,
    "TermsOfService": TermsOfService,
    "PrivacyPolicy": PrivacyPolicy,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};