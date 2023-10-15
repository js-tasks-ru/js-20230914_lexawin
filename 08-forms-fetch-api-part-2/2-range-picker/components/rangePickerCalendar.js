import Dates from "../utils/dates.js";

export default class RangePickerCalendar {
  constructor(date, selectedRange) {
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
    const monthName = Dates.getLongMonthName(this.date);

    return `
      <div class="rangepicker__month-indicator">
        <time datetime="${monthName}">${monthName}</time>
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
        ${this.getDateCellsTemplate()}
      </div>
    `;
  }

  getDateCellsTemplate() {
    const dayOfWeekOfFirstDayOfMonth = Dates.getDayOfWeek(this.date);
    const nextMonthFirstDate = Dates.getNextMonthFirstDate(this.date);

    let result = "";
    const currentDate = new Date(this.date); // TODO: fix wrong iso string (gives 21 hour of last day)

    while (currentDate.getTime() < nextMonthFirstDate.getTime()) {
      const day = currentDate.getDate();

      result += `
        <button
          type="button"
          class="rangepicker__cell"
          data-value="${currentDate.toISOString()}"
          ${day === 1 ? `style = "--start-from: ${dayOfWeekOfFirstDayOfMonth}"` : ""}
        >
          ${day}
        </button>
      `;

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  }

  render() {
    this.element = this.createElement();
    this.element.innerHTML = this.createElementContentTemplate();
    this.updateClasses(this.selectedRange);
  }

  updateClasses(selectedRange) {
    const { dateFrom, dateTo } = selectedRange;
    const cells = this.element.querySelectorAll(".rangepicker__cell");

    for (const cell of cells) {
      cell.className = "rangepicker__cell";

      const date = new Date(cell.dataset.value);

      if (dateFrom && date.getTime() === dateFrom.getTime()) cell.classList.add("rangepicker__selected-from");
      if (dateFrom && dateTo && date.getTime() > dateFrom.getTime() && date.getTime() < dateTo.getTime()) {
        cell.classList.add("rangepicker__selected-between");
      }
      if (dateTo && date.getTime() === dateTo.getTime()) cell.classList.add("rangepicker__selected-to");
    }
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
