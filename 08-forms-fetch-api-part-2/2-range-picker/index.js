export default class RangePicker {
  element;
  subElements;

  constructor({ from, to } = {}) {
    this.dateFrom = from;
    this.dateTo = to;

    this.rightCalendarDate = new Date(to.getFullYear(), to.getMonth(), 1);
    this.leftCalendarDate = new Date(to.getFullYear(), to.getMonth() - 1, 1);

    this.render();

    window.rangePicker = this; // TODO: delete this
  }

  createElement() {
    const element = document.createElement("div");
    element.classList.add("rangepicker");

    return element;
  }

  createElementContentTemplate() {
    return `
      <div class="rangepicker__input" data-element="input">
        <span data-element="from">${this.dateFrom.toLocaleDateString()}</span> -
        <span data-element="to">${this.dateTo.toLocaleDateString()}</span>
      </div>
      <div class="rangepicker__selector" data-element="selector"></div>
    `;
  }

  createSelectorContentTemplate() {
    return `
      <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
      ${new RangePickerCalendar(this.leftCalendarDate).element.outerHTML}
      ${new RangePickerCalendar(this.rightCalendarDate).element.outerHTML}
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

  createEvents() {
    this.subElements.input.addEventListener("click", this.handleInputClick);
  }

  removeEvents() {
    this.subElements.input.removeEventListener("click", this.handleInputClick);
  }

  handleInputClick = (e) => {
    this.element.classList.toggle("rangepicker_open");

    if (!this.subElements.selector.innerHTML) {
      this.subElements.selector.innerHTML = this.createSelectorContentTemplate();
    }
  };

  render() {
    this.element = this.createElement();
    this.element.innerHTML = this.createElementContentTemplate();

    this.subElements = this.getSubElements();

    this.createEvents();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}

class RangePickerCalendar {
  constructor(date, selectedRange = []) {
    if (!(date instanceof Date)) throw new Error("You must define the date!");

    this.date = date;
    this.selectedRange = selectedRange;

    this.render();
  }

  createElement() {
    const element = document.createElement("div");
    element.classList.add("rangepicker__calendar");

    return element;
  }

  createElementContentTemplate() {
    const month = this.date.toLocaleDateString("en", { month: "long" });

    return `
      <div class="rangepicker__month-indicator">
        <time datetime="${month}">${month}</time>
      </div>
      <div class="rangepicker__day-of-week">
        <div>Пн</div>
        <div>Вт</div>
        <div>Ср</div>
        <div>Чт</div>
        <div>Пт</div>
        <div>Сб</div>
        <div>Вс</div>
      </div>
      <div class="rangepicker__date-grid">
        <button
          type="button"
          class="rangepicker__cell"
          data-value="2019-11-01T17:53:50.338Z"
          style="--start-from: 5"
        >
          1
        </button>
        <button type="button" class="rangepicker__cell" data-value="2019-11-02T17:53:50.338Z">2</button>
        <button type="button" class="rangepicker__cell" data-value="2019-11-03T17:53:50.338Z">3</button>
        <button type="button" class="rangepicker__cell" data-value="2019-11-04T17:53:50.338Z">4</button>
        <button type="button" class="rangepicker__cell" data-value="2019-11-05T17:53:50.338Z">5</button>
        <button type="button" class="rangepicker__cell" data-value="2019-11-06T17:53:50.338Z">6</button>
        <button type="button" class="rangepicker__cell" data-value="2019-11-07T17:53:50.338Z">7</button>
        <button type="button" class="rangepicker__cell" data-value="2019-11-08T17:53:50.338Z">8</button>
        <button type="button" class="rangepicker__cell" data-value="2019-11-09T17:53:50.338Z">9</button>
        <button type="button" class="rangepicker__cell" data-value="2019-11-10T17:53:50.338Z">10</button>
        <button type="button" class="rangepicker__cell" data-value="2019-11-11T17:53:50.338Z">11</button>
        <button type="button" class="rangepicker__cell" data-value="2019-11-12T17:53:50.338Z">12</button>
        <button type="button" class="rangepicker__cell" data-value="2019-11-13T17:53:50.338Z">13</button>
        <button type="button" class="rangepicker__cell" data-value="2019-11-14T17:53:50.338Z">14</button>
        <button type="button" class="rangepicker__cell" data-value="2019-11-15T17:53:50.338Z">15</button>
        <button type="button" class="rangepicker__cell" data-value="2019-11-16T17:53:50.338Z">16</button>
        <button type="button" class="rangepicker__cell" data-value="2019-11-17T17:53:50.338Z">17</button>
        <button type="button" class="rangepicker__cell" data-value="2019-11-18T17:53:50.338Z">18</button>
        <button type="button" class="rangepicker__cell" data-value="2019-11-19T17:53:50.338Z">19</button>
        <button type="button" class="rangepicker__cell" data-value="2019-11-20T17:53:50.338Z">20</button>
        <button type="button" class="rangepicker__cell" data-value="2019-11-21T17:53:50.338Z">21</button>
        <button type="button" class="rangepicker__cell" data-value="2019-11-22T17:53:50.338Z">22</button>
        <button type="button" class="rangepicker__cell" data-value="2019-11-23T17:53:50.338Z">23</button>
        <button type="button" class="rangepicker__cell" data-value="2019-11-24T17:53:50.338Z">24</button>
        <button type="button" class="rangepicker__cell" data-value="2019-11-25T17:53:50.338Z">25</button>
        <button
          type="button"
          class="rangepicker__cell rangepicker__selected-from"
          data-value="2019-11-26T17:53:50.338Z"
        >
          26
        </button>
        <button
          type="button"
          class="rangepicker__cell rangepicker__selected-between"
          data-value="2019-11-27T17:53:50.338Z"
        >
          27
        </button>
        <button
          type="button"
          class="rangepicker__cell rangepicker__selected-between"
          data-value="2019-11-28T17:53:50.338Z"
        >
          28
        </button>
        <button
          type="button"
          class="rangepicker__cell rangepicker__selected-between"
          data-value="2019-11-29T17:53:50.338Z"
        >
          29
        </button>
        <button
          type="button"
          class="rangepicker__cell rangepicker__selected-between"
          data-value="2019-11-30T17:53:50.338Z"
        >
          30
        </button>
      </div>
    `;
  }

  render() {
    this.element = this.createElement();
    this.element.innerHTML = this.createElementContentTemplate();
  }
}
