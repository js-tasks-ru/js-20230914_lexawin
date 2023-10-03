export default class SortableTable {
  constructor(headerConfig = [], { data = [], sorted: { id = "", order = "asc", isSortLocally } } = {}) {
    this.headerConfig = headerConfig;
    this.data = [...data];
    this.element = this.createElement();
    this.sort(id, order, isSortLocally);
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

  updateElementContent() {
    this.removeEvents();
    this.element.innerHTML = this.createElementContentTemplate();
    this.subElements = this.getSubElements();
    this.createEvents();
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

  sort(id, order, isSortLocally = true) {
    this.sortingField = this.headerConfig.find((item) => item.id === id);
    this.sortingOrder = order;
    this.isSortLocally = isSortLocally;

    if (this.isSortLocally) {
      this.sortOnClient();
    } else {
      this.sortOnServer();
    }

    this.updateElementContent();
  }

  static sortingMethods = {
    number: (order, field) => (a, b) => order * (a[field] - b[field]),
    string: (order, field) => (a, b) => order * a[field].localeCompare(b[field], ["ru", "en"], { caseFirst: "upper" }),
  };

  sortOnClient() {
    const sortingFunction = SortableTable.sortingMethods[this.sortingField.sortType];

    if (!sortingFunction) return;

    const order = this.sortingOrder === "asc" ? 1 : -1;

    this.data.sort(sortingFunction(order, this.sortingField.id));
  }

  sortOnServer() {}

  // EVENTS

  createEvents() {
    if (!this.subElements) return;

    this.subElements.header.addEventListener("pointerdown", this.handleHeaderClick);
  }

  removeEvents() {
    if (!this.subElements) return;

    this.subElements.header.removeEventListener("pointerdown", this.handleHeaderClick);
  }

  handleHeaderClick = (e) => {
    const column = e.target.closest(".sortable-table__cell");

    if (!column) return;

    const id = column.dataset.id;
    const order = column.dataset.order === "desc" ? "asc" : "desc";

    this.sort(id, order, this.isSortLocally);
  };

  // REST METHODS

  remove() {
    this.element.remove();
  }

  destroy() {
    this.removeEvents();
    this.remove();
  }
}
