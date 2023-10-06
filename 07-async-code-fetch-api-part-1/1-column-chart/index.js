import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class ColumnChart {
  chartHeight = 50;
  data = [];
  dataSum;
  maxDataValue;
  subElements;

  constructor(options = {}) {
    const {
      url = "",
      label = "",
      link = "",
      formatHeading = (value) => value,
      range: { from = new Date(), to = new Date() } = {},
    } = options;

    this.url = url;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;
    this.from = from.toISOString();
    this.to = to.toISOString();
    this.element = this.createElement();
    this.subElements = this.getSubElements();
    this.update(from, to);
  }

  createBarTemplate(height, percent) {
    return `<div style="--value: ${height};" data-tooltip="${percent}%"></div>`;
  }

  createChartTemplate() {
    return this.data
      .map((value) => {
        const relativeValue = value / this.maxDataValue;

        return this.createBarTemplate(Math.trunc(relativeValue * this.chartHeight), Math.round(relativeValue * 100));
      })
      .join("");
  }

  createElement() {
    const element = document.createElement("div");
    element.classList.add("column-chart");

    if (!this.data.length) {
      element.classList.add("column-chart_loading");
    }

    element.innerHTML = this.createElementContentTemplate();

    return element;
  }

  createElementContentTemplate() {
    return `
        <div class="column-chart__title">
            Total ${this.label}
            ${this.createLinkTemplate()}
        </div>
        <div class="column-chart__container">
            <div data-element="header" class="column-chart__header">
                ${this.createHeaderTemplate()}
            </div>
            <div data-element="body" class="column-chart__chart">
                ${this.createChartTemplate()}
            </div>
        </div>
    `;
  }

  createHeaderTemplate() {
    return this.formatHeading(this.dataSum);
  }

  createLinkTemplate() {
    return this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : "";
  }

  destroy() {
    this.remove();
  }

  processData() {
    const { maxValue, sum } = this.data.reduce(
      ({ maxValue, sum }, value) => ({
        maxValue: Math.max(maxValue, value),
        sum: sum + value,
      }),
      { maxValue: 0, sum: 0 }
    );

    this.maxDataValue = maxValue;
    this.dataSum = sum;
  }

  remove() {
    this.element.remove();
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

  async update(from, to) {
    this.updateData([]);

    const url = `${BACKEND_URL}/${this.url}?from=${from}&to=${to}`;

    const data = await fetchJson(url);

    this.updateData(data);

    return data;
  }

  updateData(newData) {
    newData = Object.values(newData);

    if (!this.data.length && newData.length) {
      this.element.classList.remove("column-chart_loading");
    } else if (this.data.length && !newData.length) {
      this.element.classList.add("column-chart_loading");
    }

    this.data = newData;
    this.processData();

    this.subElements.header.innerHTML = this.createHeaderTemplate();
    this.subElements.body.innerHTML = this.createChartTemplate();
  }
}
