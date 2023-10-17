import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class SortableTable {
  static LOADING_COUNT = 30;

  element;
  subElements;
  endLoadingLimit = 0;

  constructor(
    headerConfig = [],
    {
      data = [],
      url = "",
      isSortLocally = url === "",
      sorted: { id = headerConfig.find((item) => item.sortable).id, order = "asc", from, to } = {},
    } = {}
  ) {
    this.headerConfig = headerConfig;
    this.data = [...data];
    this.url = url;
    this.isSortLocally = isSortLocally;
    this.sortingField = id;
    this.sortingOrder = order;
    this.from = from;
    this.to = to;

    this.render();
  }

  // ELEMENT CREATING

  createElement() {
    const element = document.createElement("div");
    element.classList.add("sortable-table");
    return element;
  }

  createElementContentTemplate() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.createHeaderContentTemplate()}
      </div>
      ${this.createBodyTemplate()}
    `;
  }

  createHeaderContentTemplate() {
    return this.headerConfig
      .map(
        ({ id, sortable, title }) => `
          <div
            class="sortable-table__cell"
            data-id="${id}"
            data-sortable="${sortable}"
            data-order="${this.sortingField === id ? this.sortingOrder : ""}"
          >
            <span>${title}</span>
            <span data-element="arrow" class="sortable-table__sort-arrow">
              <span class="sort-arrow"></span>
            </span>
          </div>
        `
      )
      .join("");
  }

  createBodyTemplate() {
    return `
      <div data-element="body" class="sortable-table__body"></div>
      <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
      <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
        <div>
          <p>No products satisfies your filter criteria</p>
          <button type="button" class="button-primary-outline">Reset all filters</button>
        </div>
      </div>
    `;
  }

  createBodyRowsTemplate() {
    return this.data
      .map(
        (item) => `
          <a href="/products/${item.id}" class="sortable-table__row">
            ${this.createBodyRowTemplate(item)}
          </a>
        `
      )
      .join("");
  }

  createBodyRowTemplate(item) {
    return this.headerConfig.reduce(
      (result, { id, template = (value) => `<div class="sortable-table__cell">${value}</div>` }) =>
        result + template(item[id]),
      ""
    );
  }

  createLoadingTemplate() {
    return `
      <div data-element="loading" class="loading-line sortable-table__loading-line"></div>  
    `;
  }

  // SUBELEMENTS

  getSubElements() {
    const subElements = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const element of elements) {
      const name = element.dataset.element;
      subElements[name] = element;
    }

    return subElements;
  }

  // SORTING

  async sort(id = this.sortingField, order = this.sortingOrder, from = this.from, to = this.to) {
    this.sortingField = id;
    this.sortingOrder = order;
    this.from = from;
    this.to = to;

    if (id || order) {
      this.subElements.header.innerHTML = this.createHeaderContentTemplate();
    }

    this.subElements.body.innerHTML = "";

    if (this.isSortLocally) {
      this.sortOnClient(this.sortingField, this.sortingOrder);
    } else {
      this.endLoadingLimit = 0;
      this.data = [];
      await this.sortOnServer(this.sortingField, this.sortingOrder, this.from, this.to);
    }

    this.subElements.body.innerHTML = this.createBodyRowsTemplate();
  }

  static sortingMethods = {
    number: (order, field) => (a, b) => order * (a[field] - b[field]),
    string: (order, field) => (a, b) => order * a[field].localeCompare(b[field], ["ru", "en"], { caseFirst: "upper" }),
  };

  sortOnClient(id, order) {
    const sortType = this.headerConfig.find((item) => item.id === id).sortType;
    const sortingFunction = SortableTable.sortingMethods[sortType];

    if (!sortingFunction) return;

    order = order === "asc" ? 1 : -1;

    this.data.sort(sortingFunction(order, id));
  }

  async sortOnServer(id, order, from, to) {
    this.element.classList.add("sortable-table_loading");

    const data = await this.loadData(id, order, from, to);

    this.element.classList.remove("sortable-table_loading");

    if (!data.length) {
      return;
    }

    this.data.push(...data);

    this.createWindowEvents();
  }

  async loadData(id, order, from, to) {
    const start = this.endLoadingLimit;
    const end = this.endLoadingLimit + SortableTable.LOADING_COUNT;
    this.endLoadingLimit = end;

    const fetchUrl = new URL(this.url, BACKEND_URL);
    !this.url.toLowerCase().includes("bestsellers") && fetchUrl.searchParams.set("_embed", "subcategory.category");
    from && fetchUrl.searchParams.set("from", from.toISOString());
    to && fetchUrl.searchParams.set("to", to.toISOString());
    fetchUrl.searchParams.set("_sort", id);
    fetchUrl.searchParams.set("_order", order);
    fetchUrl.searchParams.set("_start", start);
    fetchUrl.searchParams.set("_end", end);

    const data = await fetchJson(fetchUrl);

    return data;
  }

  // EVENTS

  createSubElementsEvents() {
    if (!this.subElements?.header) return;

    this.subElements.header.addEventListener("pointerdown", this.handleHeaderClick);
  }

  removeSubElementsEvents() {
    if (!this.subElements?.header) return;

    this.subElements.header.removeEventListener("pointerdown", this.handleHeaderClick);
  }

  handleHeaderClick = async (e) => {
    e.preventDefault();

    const column = e.target.closest(".sortable-table__cell");

    if (!column || column.dataset.sortable !== "true") return;

    const id = column.dataset.id;
    const order = column.dataset.order === "desc" ? "asc" : "desc";

    await this.sort(id, order);
  };

  createWindowEvents() {
    window.addEventListener("scroll", this.handleWindowScroll);
  }

  removeWindowEvents() {
    window.removeEventListener("scroll", this.handleWindowScroll);
  }

  handleWindowScroll = async () => {
    const windowRelativeBottom = document.documentElement.getBoundingClientRect().bottom;

    if (windowRelativeBottom > document.documentElement.clientHeight + 10) return;

    this.removeWindowEvents();

    await this.sortOnServer(this.sortingField, this.sortingOrder, this.from, this.to);
    this.subElements.body.innerHTML += this.createBodyRowsTemplate();
  };

  // REST METHODS

  remove() {
    this.element.remove();
  }

  destroy() {
    this.removeWindowEvents();
    this.removeSubElementsEvents();
    this.remove();
  }

  async render() {
    this.element = this.createElement();
    this.element.innerHTML = this.createElementContentTemplate();
    this.subElements = this.getSubElements();
    this.createSubElementsEvents();

    if (this.url && this.isSortLocally) {
      this.data = await this.loadData(this.sortingField, this.sortingOrder, this.from, this.to);
    }

    await this.sort(this.sortingField, this.sortingOrder, this.from, this.to);

    this.element.classList[this.data.length ? "remove" : "add"]("sortable-table_empty");
    this.subElements.body.innerHTML = this.createBodyRowsTemplate();
  }
}
