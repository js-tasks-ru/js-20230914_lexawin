export default class DoubleSlider {
  draggedThumb;
  element;
  sliderWidth;
  thumbStartDragX;

  constructor({ min = 0, max = 100, selected: { from = min, to = max } = {}, formatValue = (value) => value } = {}) {
    this.min = min;
    this.max = max;
    this.from = from;
    this.to = to;
    this.formatValue = formatValue;

    this.createElement();
    this.subElements = this.getSubElements();
    this.createElementEvents();
  }

  createElement() {
    const element = document.createElement("div");
    element.classList.add("range-slider");
    element.innerHTML = this.createElementContentTemplate();
    this.element = element;
  }

  createElementContentTemplate() {
    const { roundedFrom, roundedTo, leftThumbPosition, rightThumbPosition } = this.calculateSubElementsParams();

    return `
      <span data-element="from">${this.formatValue(roundedFrom)}</span>
      <div data-element="inner" class="range-slider__inner">
        <span
          data-element="progress"
          class="range-slider__progress"
          style="left: ${leftThumbPosition}%; right: ${rightThumbPosition}%"
        ></span>
        <span data-element="thumbLeft" class="range-slider__thumb-left" style="left: ${leftThumbPosition}%"></span>
        <span data-element="thumbRight" class="range-slider__thumb-right" style="right: ${rightThumbPosition}%"></span>
      </div>
      <span data-element="to">${this.formatValue(roundedTo)}</span>
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

  getSliderWidth() {
    return this.subElements.inner.getBoundingClientRect().width;
  }

  calculateDraggedThumbPositionInPixels() {
    const { left: innerLeft, width: innerWidth } = this.subElements.inner.getBoundingClientRect();

    if (this.draggedThumb.classList.contains("range-slider__thumb-left")) {
      return innerLeft + (innerWidth * (this.from - this.min)) / 100;
    }

    return innerLeft + (innerWidth * (this.to - this.min)) / 100;
  }

  calculateSubElementsParams() {
    const { max, min, from, to } = this;
    const roundedFrom = Math.round(from);
    const roundedTo = Math.round(to);
    const range = max - min;
    const leftThumbPosition = Math.round(((from - min) * 100) / range);
    const rightThumbPosition = Math.round(((max - to) * 100) / range);

    return { roundedFrom, roundedTo, leftThumbPosition, rightThumbPosition };
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
    this.thumbStartDragX = this.calculateDraggedThumbPositionInPixels();
  };

  handleDocumentPointerMove = (e) => {
    const thumbOffset = ((e.clientX - this.thumbStartDragX) * (this.max - this.min)) / this.sliderWidth;

    if (this.draggedThumb.classList.contains("range-slider__thumb-left")) {
      this.from = clamp(this.from + thumbOffset, this.min, this.to);
    } else {
      this.to = clamp(this.to + thumbOffset, this.from, this.max);
    }

    const { roundedFrom, roundedTo, leftThumbPosition, rightThumbPosition } = this.calculateSubElementsParams();

    this.subElements.from.textContent = this.formatValue(roundedFrom);
    this.subElements.to.textContent = this.formatValue(roundedTo);
    this.subElements.thumbLeft.style.left = leftThumbPosition + "%";
    this.subElements.thumbRight.style.right = rightThumbPosition + "%";
    this.subElements.progress.style.left = leftThumbPosition + "%";
    this.subElements.progress.style.right = rightThumbPosition + "%";

    this.thumbStartDragX = e.clientX;

    this.dispatchRangeSelectEvent();
  };

  handleDocumentPointerUp = (e) => {
    this.element.classList.remove("range-slider_dragging");
    this.removeDocumentEvents();
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
