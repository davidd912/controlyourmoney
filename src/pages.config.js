import AIPlanning from './pages/AIPlanning';
import Benefits from './pages/Benefits';
import Dashboard from './pages/Dashboard';
import Guide from './pages/Guide';
import HouseholdSettings from './pages/HouseholdSettings';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIPlanning": AIPlanning,
    "Benefits": Benefits,
    "Dashboard": Dashboard,
    "Guide": Guide,
    "HouseholdSettings": HouseholdSettings,
    "PrivacyPolicy": PrivacyPolicy,
    "TermsOfService": TermsOfService,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};