import Benefits from './pages/Benefits';
import Dashboard from './pages/Dashboard';
import HouseholdSettings from './pages/HouseholdSettings';
import Guide from './pages/Guide';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Benefits": Benefits,
    "Dashboard": Dashboard,
    "HouseholdSettings": HouseholdSettings,
    "Guide": Guide,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};