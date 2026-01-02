import Dashboard from './pages/Dashboard';
import Benefits from './pages/Benefits';
import Documents from './pages/Documents';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Benefits": Benefits,
    "Documents": Documents,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};