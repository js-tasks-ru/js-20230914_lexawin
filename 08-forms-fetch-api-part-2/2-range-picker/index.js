import Dates from "./utils/dates.js";
import RangePickerCalendar from "./components/rangePickerCalendar.js";

export default class RangePicker {
  element;
  subElements;
  selectedRange;
  leftCalendar;
  rightCalendar;
  leftCalendarDate;
  rightCalendarDate;

  constructor({ from = null, to = null } = {}) {
    this.selectedRange = { dateFrom: from, dateTo: to };
    this.cellClicksCount = 0;

    this.render();
  }

  createElement() {
    const element = document.createElement("div");
    element.classList.add("rangepicker");

    return element;
  }

  createElementContentTemplate() {
    return `
      <div class="rangepicker__input" data-element="input">
        <span data-element="from">${this.selectedRange.dateFrom.toLocaleDateString()}</span> -
        <span data-element="to">${this.selectedRange.dateTo.toLocaleDateString()}</span>
      </div>
      <div class="rangepicker__selector" data-element="selector"></div>
    `;
  }

  createSelectorContentTemplate() {
    return `
      <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left" data-element="leftControl"></div>
      <div class="rangepicker__selector-control-right" data-element="rightControl"></div>
    `;
  }

  initCalendars() {
    const dateTo = this.selectedRange.dateTo ? this.selectedRange.dateTo : new Date();
    this.leftCalendarDate = Dates.getPrevMonthFirstDate(dateTo);
    this.rightCalendarDate = Dates.getFirstDateOfMonth(dateTo);
    this.leftCalendar = new RangePickerCalendar(this.leftCalendarDate, this.selectedRange);
    this.rightCalendar = new RangePickerCalendar(this.rightCalendarDate, this.selectedRange);
    this.subElements.selector.innerHTML = this.createSelectorContentTemplate();
    this.subElements.selector.append(this.leftCalendar.element);
    this.subElements.selector.append(this.rightCalendar.element);
    this.leftControl = this.subElements.selector.querySelector(".rangepicker__selector-control-left");
    this.rightControl = this.subElements.selector.querySelector(".rangepicker__selector-control-right");
    this.createControlsEvents();
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
    this.subElements.selector.addEventListener("click", this.handleSelectorClick);
    document.addEventListener("click", this.handleDocumentClick);
  }

  createControlsEvents() {
    this.leftControl.addEventListener("click", this.handleLeftControlClick);
    this.rightControl.addEventListener("click", this.handleRightControlClick);
  }

  removeEvents() {
    this.subElements.input.removeEventListener("click", this.handleInputClick);
    this.subElements.selector.removeEventListener("click", this.handleSelectorClick);
    document.removeEventListener("click", this.handleDocumentClick);
  }

  removeControlsEvents() {
    this.leftControl && this.leftControl.removeEventListener("click", this.handleLeftControlClick);
    this.rightControl && this.rightControl.removeEventListener("click", this.handleRightControlClick);
  }

  handleInputClick = () => {
    this.element.classList.toggle("rangepicker_open");
    this.cellClicksCount = 0;

    !this.subElements.selector.innerHTML && this.initCalendars();
  };

  handleSelectorClick = (e) => {
    const cell = e.target.closest(".rangepicker__cell");

    if (!cell) return;

    this.cellClicksCount++;

    if (this.cellClicksCount === 1) {
      this.selectedRange.dateFrom = new Date(cell.dataset.value);
      this.selectedRange.dateTo = null;
    } else {
      const newDateTo = new Date(cell.dataset.value);
      if (newDateTo.getTime() < this.selectedRange.dateFrom.getTime()) {
        this.selectedRange.dateTo = this.selectedRange.dateFrom;
        this.selectedRange.dateFrom = newDateTo;
      } else {
        this.selectedRange.dateTo = newDateTo;
      }
      this.close();
      this.updateInput();
      this.dispatchDateSelectEvent();
    }

    this.updateCalendar();
  };

  handleDocumentClick = (e) => {
    if (this.isOpen() && !this.element.contains(e.target)) this.close();
  };

  handleLeftControlClick = () => {
    this.rightCalendar.element.innerHTML = this.leftCalendar.element.innerHTML;
    this.rightCalendarDate = this.leftCalendarDate;
    this.leftCalendarDate = Dates.getPrevMonthFirstDate(this.leftCalendarDate);
    this.leftCalendar.destroy();
    this.leftCalendar = new RangePickerCalendar(this.leftCalendarDate, this.selectedRange);
    this.rightCalendar.element.before(this.leftCalendar.element);
  };

  handleRightControlClick = () => {
    this.leftCalendar.element.innerHTML = this.rightCalendar.element.innerHTML;
    this.leftCalendarDate = this.rightCalendarDate;
    this.rightCalendarDate = Dates.getNextMonthFirstDate(this.rightCalendarDate);
    this.rightCalendar.destroy();
    this.rightCalendar = new RangePickerCalendar(this.rightCalendarDate, this.selectedRange);
    this.leftCalendar.element.after(this.rightCalendar.element);
  };

  dispatchDateSelectEvent() {
    const event = new CustomEvent("date-select", {
      detail: { from: this.selectedRange.dateFrom, to: this.selectedRange.dateTo },
    });
    this.element.dispatchEvent(event);
  }

  render() {
    this.element = this.createElement();
    this.element.innerHTML = this.createElementContentTemplate();

    this.subElements = this.getSubElements();

    this.createEvents();
  }

  updateCalendar() {
    this.leftCalendar.updateClasses(this.selectedRange);
    this.rightCalendar.updateClasses(this.selectedRange);
  }

  updateInput() {
    this.subElements.input.firstElementChild.innerHTML = this.selectedRange.dateFrom.toLocaleDateString();
    this.subElements.input.lastElementChild.innerHTML = this.selectedRange.dateTo.toLocaleDateString();
  }

  isOpen() {
    return this.element.classList.contains("rangepicker_open");
  }

  close() {
    this.element.classList.remove("rangepicker_open");
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.removeControlsEvents();
    this.removeEvents();
    this.remove();
  }
}
