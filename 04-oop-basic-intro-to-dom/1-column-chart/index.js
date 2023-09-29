export default class ColumnChart {
  constructor(props) {
    this.props = { ...props };
    this.chartHeight = 50;
    this.maxDataValue = this.calculateMaxDataValue();
    this.element = this.createElement();
  }

  calculateMaxDataValue() {
    return this.props?.data?.reduce((max, value) => Math.max(max, value), 0);
  }

  createBarTemplate(height, percent) {
    return `<div style="--value: ${height};" data-tooltip="${percent}%"></div>`;
  }

  createChartTemplate() {
    return this.props?.data
      ?.map((value) => {
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

    if (!this.props?.data?.length) {
      element.classList.add("column-chart_loading");
    }

    element.innerHTML = this.createElementContentTemplate();

    return element;
  }

  createElementContentTemplate() {
    return `
        <div class="column-chart__title">
            Total ${this.props?.label}
            ${this.createLinkTemplate()}
        </div>
        <div class="column-chart__container">
            <div data-element="header" class="column-chart__header">
                ${this.formatHeading()}
            </div>
            <div data-element="body" class="column-chart__chart">
                ${this.createChartTemplate()}
            </div>
        </div>
    `;
  }

  createLinkTemplate() {
    return this.props?.link
      ? `<a href="${this.props.link}" class="column-chart__link">View all</a>`
      : "";
  }

  destroy() {
    this.remove();
  }

  initElement() {}

  formatHeading() {
    return this.props?.formatHeading
      ? this.props.formatHeading(this.props.value)
      : this.props?.value;
  }

  remove() {
    this.element.remove();
  }

  update(newData) {
    if (!this.props?.data?.length && newData.length) {
      this.element.classList.remove("column-chart_loading");
    } else if (this.props?.data?.length && !newData.length) {
      this.element.classList.add("column-chart_loading");
    }

    this.props.data = [...newData];
    this.maxDataValue = this.calculateMaxDataValue();

    if (!this.chart) {
      this.chart = this.element.querySelector(".column-chart__chart");
    }
    this.chart.innerHTML = this.createChartTemplate();
  }
}
