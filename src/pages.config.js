import Benefits from './pages/Benefits';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Benefits": Benefits,
    "Dashboard": Dashboard,
    "Documents": Documents,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};