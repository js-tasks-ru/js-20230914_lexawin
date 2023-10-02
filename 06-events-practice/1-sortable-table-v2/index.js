export default class SortableTable {
  constructor(headerConfig = [], { data = [], sorted: { id = "", order = "asc" } } = {}) {
    this.headerConfig = headerConfig;
    this.data = [...data];
    this.sortingField = headerConfig.find((item) => item.id === id);
    this.sortingOrder = order;

    if (this.sortingField.sortable) this.sortData(this.sortingField, this.sortingOrder);

    this.createElement();
    this.getSubElements();
    this.createEvents();
  }

  // SORTING METHODS

  static sortingMethods = {
    number: (order, field) => (a, b) => order * (a[field] - b[field]),
    string: (order, field) => (a, b) => order * a[field].localeCompare(b[field], ["ru", "en"], { caseFirst: "upper" }),
  };

  sortData({ id, sortType }, order) {
    const sortingFunction = SortableTable.sortingMethods[sortType];

    if (!sortingFunction) return;

    const sortingOrder = order === "asc" ? 1 : -1;

    this.data.sort(sortingFunction(sortingOrder, id));
  }

  sort(id, order) {
    this.sortingField = this.headerConfig.find((item) => item.id === id);
    this.sortingOrder = order;

    if (!this.sortingField.sortable) return;

    this.sortData(this.sortingField, this.sortingOrder);
    this.update();
  }

  // ELEMENT CREATING METHODS

  createElement() {
    const element = document.createElement("div");
    element.classList.add("sortable-table");
    this.element = element;

    this.element.innerHTML = this.createElementContentTemplate();
  }

  createElementContentTemplate() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.createHeaderTemplate()}
      </div>
      <div data-element="body" class="sortable-table__body">
        ${this.createBodyTemplate()}
      </div>
      <div data-element="loading" class="loading-line sortable-table__loading-line"></div>  
      <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
        <div>
          <p>No products satisfies your filter criteria</p>
          <button type="button" class="button-primary-outline">Reset all filters</button>
        </div>
      </div>
    `;
  }

  createHeaderTemplate() {
    return this.headerConfig
      .map(
        ({ id, sortable, title }) => `
          <div
            class="sortable-table__cell"
            data-id="${id}"
            data-sortable="${sortable}"
            data-order="${this.sortingField.id === id ? this.sortingOrder : ""}"
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
    return this.headerConfig.reduce((result, headerItem) => {
      if (headerItem.template) {
        return result + headerItem.template(item[headerItem.id]);
      }

      return result + `<div class="sortable-table__cell">${item[headerItem.id]}</div>`;
    }, "");
  }

  // SUBELEMENTS

  getSubElements() {
    const subElements = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      subElements[name] = subElement;
    }

    this.subElements = subElements;
  }

  // EVENTS METHODS

  createEvents() {
    this.subElements.header.addEventListener("click", this.handleHeaderClick);
  }

  removeEvents() {
    this.subElements.header.removeEventListener("click", this.handleHeaderClick);
  }

  handleHeaderClick = (e) => {
    const column = e.target.closest(".sortable-table__cell");

    if (!column) return;

    const id = column.dataset.id;
    const order = column.dataset.order === "asc" ? "desc" : "asc";

    this.sort(id, order);
  };

  // REST METHODS

  update() {
    this.removeEvents();
    this.element.innerHTML = this.createElementContentTemplate();
    this.getSubElements();
    this.createEvents();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.removeEvents();
    this.remove();
  }
}
