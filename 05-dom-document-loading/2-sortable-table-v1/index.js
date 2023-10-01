export default class SortableTable {
  isSorting = false;
  sortingField = "";
  sortingOrder = "ask";

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = [...data];

    this.render();
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
            ${this.createSortingAttribute(sortable)}
          >
            <span>${title}</span>
            ${this.createSortingTemplate(id)}
          </div>
        `
      )
      .join("");
  }

  createSortingAttribute(sortable) {
    return this.isSorting && sortable
      ? `data-order="${this.sortingOrder}"`
      : "";
  }

  createSortingTemplate(columnId) {
    return this.isSorting && columnId === this.sortingField
      ? `
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      `
      : "";
  }

  destroy() {
    this.remove();
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  remove() {
    this.element.remove();
  }

  render() {
    const element = document.createElement("div");
    element.classList.add("sortable-table");
    this.element = element;

    this.update();
  }

  sort(fieldValue, orderValue) {
    this.isSorting = true;
    this.sortingField = fieldValue;
    this.sortingOrder = orderValue;

    const sortType = this.headerConfig.find(
      (item) => item.id === fieldValue
    )?.sortType;

    if (sortType === "string") {
      this.sortStrings(fieldValue, orderValue);
    } else if (sortType === "number") {
      this.sortNumbers(fieldValue, orderValue);
    } else {
      return;
    }

    this.update();
  }

  sortNumbers(field, param = "asc") {
    const order = param === "asc" ? 1 : -1;

    this.data.sort((a, b) => order * (a[field] - b[field]));
  }

  sortStrings(field, param = "asc") {
    const order = param === "asc" ? 1 : -1;

    this.data.sort(
      (a, b) =>
        order *
        a[field].localeCompare(b[field], ["ru", "en"], { caseFirst: "upper" })
    );
  }

  update() {
    this.element.innerHTML = this.createElementContentTemplate();
    this.subElements = this.getSubElements(this.element);
  }
}
