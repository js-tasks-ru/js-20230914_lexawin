import SortableTable from "../07-async-code-fetch-api-part-1/2-sortable-table-v3/index.js";
import RangePicker from "../08-forms-fetch-api-part-2/2-range-picker/index.js";
// import header from "./bestsellers-header.js";
// import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru/";

export default class Page {
  element;
  subElements;

  constructor() {}

  createElement() {
    const element = document.createElement("div");
    element.classList.add("products-list");

    return element;
  }

  createElementContentTemplate() {
    return `
      <div class="content__top-panel">
        <h1 class="page-title">Products</h1>
        <a href="#" class="button-primary">Add proudct</a>
      </div>

      <div class="content-box content-box_small">
        <form class="form-inline">
          <div class="form-group">
            <label class="form-label">Filter by:</label>
            <input
              type="text"
              data-elem="filterName"
              class="form-control"
              placeholder="Product name"
            >
          </div>

          <div class="form-group" data-elem="sliderContainer">
            <label class="form-label">Price:</label>
            <div data-element="rangeSlider">
              <!-- range-slider component -->
            </div
          </div>

          <div class="form-group">
            <label class="form-label">Status:</label>
            <select class="form-control" data-elem="filterStatus">
              <option value="" selected="">Any</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
        </form>
      </div>

      <div data-elem="productsContainer" class="products-list__container">
        <div data-element="sortableTable">
          <!-- sortable-table component -->
        </div>
      </div>
    `;
  }

  getSubElements() {
    const subElements = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const element of elements) {
      const name = element.dataset.element;
      subElements[name] = element;
    }

    return subElements;
  }

  createEventListeners() {}

  removeEventListeners() {}

  onElementDateSelect = (e) => {
    const { from, to } = e.detail;

    this.ordersChart.update(from, to);
    this.salesChart.update(from, to);
    this.customersChart.update(from, to);
    this.sortableTable.update(from, to);
  };

  async render() {
    this.element = this.createElement();
    this.element.innerHTML = this.createElementContentTemplate();

    this.subElements = this.getSubElements();

    this.createEventListeners();

    return this.element;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.removeEventListeners();
    this.remove();
  }
}
