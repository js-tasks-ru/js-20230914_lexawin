export default class NotificationMessage {
  static lastMessage = null;

  constructor(message = "", options = {}) {
    const { duration = 1000, type = "success" } = options;

    this.message = message;
    this.duration = duration;
    this.type = type;
    this.element = this.createElement();
  }

  createElement() {
    const element = document.createElement("div");
    element.classList.add("notification", this.type);
    element.setAttribute("style", `--value: ${this.duration / 1000}s;`);

    element.innerHTML = this.createElementContent();

    return element;
  }

  createElementContent() {
    return `
        <div class="timer"></div>
        <div class="inner-wrapper">
            <div class="notification-header">${this.type}</div>
            <div class="notification-body">
                ${this.message}
            </div>
        </div>
    `;
  }

  destroy() {
    clearTimeout(this.timer);
    this.timer = null;
    this.remove();
    NotificationMessage.lastMessage = null;
  }

  remove() {
    this.element.remove();
  }

  show(target = document.body) {
    const lastMessage = NotificationMessage.lastMessage;
    if (lastMessage) lastMessage.destroy();

    NotificationMessage.lastMessage = this;

    target.append(this.element);
    this.timer = setTimeout(() => this.destroy(), this.duration);
  }
}
