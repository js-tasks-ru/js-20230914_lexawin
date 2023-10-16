import SortableList from "../2-sortable-list/index.js";
import escapeHtml from "./utils/escape-html.js";
import fetchJson from "./utils/fetch-json.js";
import ProductFormV1 from "./components/index.js";

const IMGUR_CLIENT_ID = "28aaa2e823b03b1";
const BACKEND_URL = "https://course-js.javascript.ru";

export default class ProductForm extends ProductFormV1 {
  createImageList() {
    const container = document.createElement("div");
    container.innerHTML = this.createImageListTemplate();
    const items = Array.from(container.children[0].children);
    this.sortableList = new SortableList({ items });
    this.subElements.imageListContainer.append(this.sortableList.element);
  }

  createEvents() {
    super.createEvents();
    this.subElements.productForm.addEventListener("item-deleted", this.handleImageListChange);
    this.subElements.productForm.addEventListener("item-dragged", this.handleImageListChange);
  }

  removeEvents() {
    super.removeEvents();
    this.subElements.productForm.removeEventListener("item-deleted", this.handleImageListChange);
    this.subElements.productForm.removeEventListener("item-dragged", this.handleImageListChange);
  }

  handleImageListChange = () => {
    const imageList = Array.from(this.subElements.imageListContainer.children[0].children);

    const pointerEventsValue = this.sortableList.element.style.pointerEvents;
    this.sortableList.element.style.pointerEvents = "none";

    this.formData.images = imageList.map((item) => ({
      url: item.querySelector('input[name="url"]').value,
      source: item.querySelector('input[name="source"]').value,
    }));

    this.sortableList.element.style.pointerEvents = pointerEventsValue;
  };
}
