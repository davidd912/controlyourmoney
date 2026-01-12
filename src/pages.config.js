import Benefits from './pages/Benefits';
import Dashboard from './pages/Dashboard';
import Guide from './pages/Guide';
import HouseholdSettings from './pages/HouseholdSettings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Benefits": Benefits,
    "Dashboard": Dashboard,
    "Guide": Guide,
    "HouseholdSettings": HouseholdSettings,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};