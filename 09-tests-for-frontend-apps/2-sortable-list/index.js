export default class SortableList {
  element;
  placeholder;
  dragItem; // draggable item
  shiftX; // mouse X-position relative top-left corner of dragItem
  shiftY; // mouse Y-position relative top-left corner of dragItem

  constructor({ items = [] } = {}) {
    this.items = items;

    this.render();
  }

  createElement() {
    const element = document.createElement("ul");
    element.classList.add("sortable-list");
    return element;
  }

  appendItems() {
    this.items.forEach((item) => {
      item.classList.add("sortable-list__item");
      this.element.append(item);
    });
  }

  moveDragItemTo(x, y) {
    if (!this.dragItem) return;

    this.dragItem.style.left = x - this.shiftX + "px";
    this.dragItem.style.top = y - this.shiftY + "px";
  }

  createElementEventListeners() {
    this.element.addEventListener("pointerdown", this.handleElementPointerDown);
    this.element.ondragstart = () => false;
  }

  removeElementEventListeners() {
    this.element.removeEventListener("pointerdown", this.handleElementPointerDown);
    this.element.ondragstart = null;
  }

  createDragEventListeners() {
    document.addEventListener("pointermove", this.handleDocumentPointerMove);
    document.addEventListener("pointerup", this.handleElementPointerUp);
  }

  removeDragListeners() {
    document.removeEventListener("pointermove", this.handleDocumentPointerMove);
    document.removeEventListener("pointerup", this.handleElementPointerUp);
  }

  handleElementPointerDown = (e) => {
    const deleteHandle = e.target.closest("[data-delete-handle]");
    if (deleteHandle) {
      this.handleItemDelete(e, deleteHandle);
      return;
    }

    const grabHandle = e.target.closest("[data-grab-handle]");
    if (grabHandle) this.handleDragStart(e, grabHandle);
  };

  handleItemDelete(e, deleteHandle) {
    let deletedItem = deleteHandle.closest(".sortable-list__item");

    if (!deletedItem) return;

    deletedItem.remove();
    deletedItem = null;
    this.dispatchItemEvent("item-deleted");
  }

  handleDragStart(e, grabHandle) {
    this.dragItem = grabHandle.closest(".sortable-list__item");

    if (!this.dragItem) return;

    this.shiftX = e.clientX - this.dragItem.getBoundingClientRect().left;
    this.shiftY = e.clientY - this.dragItem.getBoundingClientRect().top;

    const dragItemBoundingRect = this.dragItem.getBoundingClientRect();
    this.placeholder = document.createElement("li");
    this.placeholder.classList.add("sortable-list__placeholder");
    this.placeholder.style.width = dragItemBoundingRect.width + "px";
    this.placeholder.style.height = dragItemBoundingRect.height + "px";
    this.dragItem.before(this.placeholder);
    this.dragItem.classList.add("sortable-list__item_dragging");
    this.dragItem.style.width = dragItemBoundingRect.width + "px";
    this.dragItem.style.height = dragItemBoundingRect.height + "px";

    this.moveDragItemTo(e.clientX, e.clientY);
    this.createDragEventListeners();
  }

  handleDocumentPointerMove = (e) => {
    this.moveDragItemTo(e.clientX, e.clientY);

    this.dragItem.style.visibility = "hidden";
    const listItemBelowDragItem = document.elementFromPoint(e.clientX, e.clientY).closest(".sortable-list__item");
    this.dragItem.style.visibility = "visible";

    if (!listItemBelowDragItem) return;

    const list = Array.from(this.element.children);

    if (list.indexOf(listItemBelowDragItem) < list.indexOf(this.placeholder)) {
      listItemBelowDragItem.before(this.placeholder);
    } else {
      listItemBelowDragItem.after(this.placeholder);
    }
  };

  handleElementPointerUp = (e) => {
    this.placeholder.before(this.dragItem);
    this.placeholder.remove();
    this.placeholder = null;
    this.dragItem.classList.remove("sortable-list__item_dragging");
    this.dragItem.style.left = "";
    this.dragItem.style.top = "";
    this.dragItem = null;
    this.removeDragListeners();
    this.dispatchItemEvent("item-dragged");
  };

  dispatchItemEvent(eventType) {
    const event = new CustomEvent(eventType, {
      bubbles: true,
    });
    this.element.dispatchEvent(event);
  }

  render() {
    this.element = this.createElement();
    this.appendItems();
    this.createElementEventListeners();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.removeElementEventListeners();
    this.remove();
  }
}
