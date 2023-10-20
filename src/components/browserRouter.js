export default class BrowserRouter {
  constructor(container, routes) {
    this.container = container;
    this.routes = routes;
  }

  async processPath(path) {
    const route = this.routes.find(({ route }) => route === path);

    if (!route) return;

    if (this.currentRoute) {
      this.currentRoute.component.destroy();
      window.history.pushState(null, null, path);
    }

    const element = await route.component.render();
    this.container.append(element);
    this.currentRoute = route;
  }

  onWindowClick = (e) => {
    e.preventDefault();

    const link = e.target.closest("a");

    if (!link) return;

    const href = link.getAttribute("href");

    if (!href) return;

    this.processPath(href);
  };

  run() {
    const path = window.location.pathname;
    this.processPath(path);
    window.addEventListener("click", this.onWindowClick);
  }

  destroy() {
    window.removeEventListener("click", this.onWindowClick);
  }
}
