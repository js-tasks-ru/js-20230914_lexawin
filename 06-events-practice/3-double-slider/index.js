export default class DoubleSlider {
  constructor({ min = 0, max = 100, selected: { from = min, to = max } = {}, formatValue = (value) => value } = {}) {
    this.min = min;
    this.max = max;
    this.from = from;
    this.to = to;
    this.formatValue = formatValue;

    this.createElement();
    this.createElementEvents();
    window.doubleSlider = this;
  }

  createElement() {
    const element = document.createElement("div");
    element.classList.add("range-slider");
    element.innerHTML = this.createElementTemplate();
    this.element = element;
  }

  createElementTemplate() {
    const { min, max, from, to, formatValue } = this;

    const roundedFrom = Math.round(from);
    const roundedTo = Math.round(to);
    const range = max - min;
    const leftThumbPosition = Math.round(((roundedFrom - min) * 100) / range);
    const rightThumbPosition = Math.round(((max - roundedTo) * 100) / range);

    return `
      <span data-element="from">${formatValue(roundedFrom)}</span>
      <div class="range-slider__inner">
        <span class="range-slider__progress" style="left: ${leftThumbPosition}%; right: ${rightThumbPosition}%"></span>
        <span class="range-slider__thumb-left" style="left: ${leftThumbPosition}%"></span>
        <span class="range-slider__thumb-right" style="right: ${rightThumbPosition}%"></span>
      </div>
      <span data-element="to">${formatValue(roundedTo)}</span>
    `;
  }

  getSliderWidth() {
    const sliderInner = this.element.querySelector(".range-slider__inner");
    const computedStyles = getComputedStyle(sliderInner);
    return parseInt(computedStyles.width);
  }

  createElementEvents() {
    this.element.addEventListener("pointerdown", this.handleElementPointerDown);
  }

  createDocumentEvents() {
    document.addEventListener("pointermove", this.handleDocumentPointerMove);
    document.addEventListener("pointerup", this.handleDocumentPointerUp);
  }

  removeElementEvents() {
    this.element.removeEventListener("pointerdown", this.handleElementPointerDown);
  }

  removeDocumentEvents() {
    document.removeEventListener("pointermove", this.handleDocumentPointerMove);
    document.removeEventListener("pointerup", this.handleDocumentPointerUp);
  }

  handleElementPointerDown = (e) => {
    this.draggedThumb = e.target.closest("[class^=range-slider__thumb-");

    if (!this.draggedThumb) return;

    this.element.classList.add("range-slider_dragging");
    this.createDocumentEvents();
    this.sliderWidth = this.getSliderWidth();
    this.thumbStartDragX = e.clientX;
  };

  handleDocumentPointerMove = (e) => {
    const thumbOffset = ((e.clientX - this.thumbStartDragX) * (this.max - this.min)) / this.sliderWidth;

    if (this.draggedThumb.classList.contains("range-slider__thumb-left")) {
      this.from = clamp(this.from + thumbOffset, this.min, this.to);
    } else {
      this.to = clamp(this.to + thumbOffset, this.from, this.max);
    }

    this.element.innerHTML = this.createElementTemplate();
    this.thumbStartDragX = e.clientX;
  };

  handleDocumentPointerUp = (e) => {
    this.element.classList.remove("range-slider_dragging");
    this.removeDocumentEvents();
    this.dispatchRangeSelectEvent();
  };

  dispatchRangeSelectEvent() {
    const event = new CustomEvent("range-select", { detail: { from: this.from, to: this.to } });
    this.element.dispatchEvent(event);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.removeElementEvents();
    this.remove();
  }
}

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
