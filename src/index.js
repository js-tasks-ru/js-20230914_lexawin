import DashbordPage from "../10-routes-browser-history-api/1-dashboard-page/index.js";
import ProductsPage from "../11-products-page/index.js";
import BrowserRouter from "./components/browserRouter.js";

const container = document.querySelector("#content");
const dashboardPage = new DashbordPage();
const productsPage = new ProductsPage();

const routes = [
  {
    route: "/",
    title: "Dashbord",
    component: dashboardPage,
  },
  {
    route: "/products",
    title: "Products",
    component: productsPage,
  },
];

const router = new BrowserRouter(container, routes);

router.run();
