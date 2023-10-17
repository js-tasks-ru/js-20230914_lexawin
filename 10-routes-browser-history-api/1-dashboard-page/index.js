import RangePicker from "./components/range-picker/src/index.js";
import ColumnChart from "./components/column-chart/src/index.js";
import SortableTable from "../../07-async-code-fetch-api-part-1/2-sortable-table-v3/index.js";
import header from "./bestsellers-header.js";

import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru/";

export default class Page {
  element;
  subElements;
  rangePicker;
  ordersChart;

  constructor() {
    this.to = new Date();
    this.from = new Date(this.to);
    this.from.setMonth(this.to.getMonth() - 1);
  }

  createElement() {
    const element = document.createElement("div");
    element.classList.add("dashboard");

    return element;
  }

  createElementContentTemplate() {
    return `
      <div class="content__top-panel">
        <h2 class="page-title">Dashboard</h2>
        <!-- RangePicker component -->
        <div data-element="rangePicker"></div>
      </div>
      <div data-element="chartsRoot" class="dashboard__charts">
        <!-- column-chart components -->
        <div data-element="ordersChart" class="dashboard__chart_orders"></div>
        <div data-element="salesChart" class="dashboard__chart_sales"></div>
        <div data-element="customersChart" class="dashboard__chart_customers"></div>
      </div>

      <h3 class="block-title">Best sellers</h3>

      <div data-element="sortableTable">
        <!-- sortable-table component -->
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

  createEventListeners() {
    document.addEventListener("date-select", this.onElementDateSelect);
  }

  removeEventListeners() {
    document.removeEventListener("date-select", this.onElementDateSelect);
  }

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

    const range = { from: this.from, to: this.to };

    this.rangePicker = new RangePicker(range);
    this.subElements.rangePicker.append(this.rangePicker.element);

    this.ordersChart = new ColumnChart({
      url: "api/dashboard/orders",
      range,
      label: "orders",
      link: "#",
    });
    this.subElements.ordersChart.append(this.ordersChart.element);

    this.salesChart = new ColumnChart({
      url: "api/dashboard/sales",
      range,
      label: "sales",
      formatHeading: (data) => `$${data}`,
    });
    this.subElements.salesChart.append(this.salesChart.element);

    this.customersChart = new ColumnChart({
      url: "api/dashboard/customers",
      range,
      label: "customers",
    });
    this.subElements.customersChart.append(this.customersChart.element);

    this.sortableTable = new SortableTable(header, {
      url: "api/dashboard/bestsellers",
      sorted: { from: range.from, to: range.to },
      isSortLocally: true,
    });
    this.subElements.sortableTable.append(this.sortableTable.element);

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
