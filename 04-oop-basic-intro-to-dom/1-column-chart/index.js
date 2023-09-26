export default class ColumnChart {
  constructor(props) {
    this.props = props;
    this.chartHeight = 50;
    this.init();
  }

  calculateMaxDataValue() {
    return this.props?.data?.reduce((max, value) => Math.max(max, value), 0);
  }

  createBarElement(height, percent) {
    return `<div style="--value: ${height}" data-tooltip="${percent}%"></div>`;
  }

  createChart() {
    return this.props?.data
      ?.map((value) => {
        const relativeValue = value / this.maxDataValue;

        return this.createBarElement(
          Math.trunc(relativeValue * this.chartHeight),
          Math.round(relativeValue * 100)
        );
      })
      .join("");
  }

  createElement() {
    const element = document.createElement("div");
    element.classList.add("column-chart");

    if (!this.props?.data) {
      element.classList.add("column-chart_loading");
    }

    element.innerHTML = this.createElementContent();

    return element;
  }

  createElementContent() {
    return `
        <div class="column-chart__title">
            Total ${this.props?.label}
            ${this.createLinkElement()}
        </div>
        <div class="column-chart__container">
            <div data-element="header" class="column-chart__header">
                ${this.formatHeading()}
            </div>
            <div data-element="body" class="column-chart__chart">
                ${this.createChart()}
            </div>
        </div>
    `;
  }

  formatHeading() {
    return this.props?.formatHeading
      ? this.props.formatHeading(this.props.value)
      : this.props?.value;
  }

  createLinkElement() {
    return this.props?.link
      ? `<a href="${this.props.link}" class="column-chart__link">View all</a>`
      : "";
  }

  destroy() {
    this.remove();
  }

  init() {
    this.maxDataValue = this.calculateMaxDataValue();
    this.element = this.createElement();
  }

  remove() {
    this.element.remove();
  }

  update(newData) {
    this.init();
  }
}
