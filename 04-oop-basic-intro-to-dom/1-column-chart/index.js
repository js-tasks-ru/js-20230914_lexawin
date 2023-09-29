export default class ColumnChart {
  constructor(options = {}) {
    const {
      data = [],
      label = "",
      value = 0,
      link = "",
      formatHeading = null,
    } = options;

    this.data = [...data];
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;
    this.chartHeight = 50;
    this.maxDataValue = this.calculateMaxDataValue();
    this.element = this.createElement();
  }

  calculateMaxDataValue() {
    return Math.max(...this.data);
  }

  createBarTemplate(height, percent) {
    return `<div style="--value: ${height};" data-tooltip="${percent}%"></div>`;
  }

  createChartTemplate() {
    return this.data
      .map((value) => {
        const relativeValue = value / this.maxDataValue;

        return this.createBarTemplate(
          Math.trunc(relativeValue * this.chartHeight),
          Math.round(relativeValue * 100)
        );
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
    return this.formatHeading ? this.formatHeading(this.value) : this.value;
  }

  createLinkTemplate() {
    return this.link
      ? `<a href="${this.link}" class="column-chart__link">View all</a>`
      : "";
  }

  destroy() {
    this.remove();
  }

  remove() {
    this.element.remove();
  }

  update(newData) {
    if (!this.data.length && newData.length) {
      this.element.classList.remove("column-chart_loading");
    } else if (this.data.length && !newData.length) {
      this.element.classList.add("column-chart_loading");
    }

    this.data = [...newData];
    this.maxDataValue = this.calculateMaxDataValue();

    if (!this.chart) {
      this.chart = this.element.querySelector(".column-chart__chart");
    }
    this.chart.innerHTML = this.createChartTemplate();
  }
}
