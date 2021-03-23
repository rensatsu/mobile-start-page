export default class Menu {
  constructor(app) {
    this.app = app;
    this.items = [];
    this.menuElement = null;

    this.isVisible = false;

    this.animation = {
      keyframes: {
        show: [
          {
            transform: "translate(0, 3px)",
            opacity: 0,
          },
          {
            transform: "none",
            opacity: 1,
          },
        ],
        hide: [
          {
            transform: "none",
            opacity: 1,
          },
          {
            transform: "translate(0, 3px)",
            opacity: 0,
          },
        ],
      },

      duration: 150,
    };
  }

  add({ title, icon, handler } = {}) {
    this.items.push({
      title: title,
      params: { icon },
      handler: handler,
    });
  }

  show() {
    this.menuElement.hidden = false;
    this.isVisible = true;

    this.menuElement.animate(this.animation.keyframes.show, {
      fill: "forwards",
      duration: this.animation.duration,
    });
  }

  hide() {
    const animation = this.menuElement.animate(this.animation.keyframes.hide, {
      fill: "forwards",
      duration: this.animation.duration,
    });

    animation.addEventListener("finish", () => {
      this.menuElement.hidden = true;
      this.isVisible = false;
    });
  }

  toggle() {
    this.isVisible ? this.hide() : this.show();
  }

  render() {
    this.menuElement = document.createElement("aside");
    this.menuElement.classList.add("menu");
    this.menuElement.hidden = true;

    const inner = document.createElement("ul");

    this.items.forEach((el) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      const icon = document.createElement("span");
      const text = document.createElement("span");

      text.classList.add("text");

      icon.classList.add("icon");
      icon.classList.add("fas", "fa-fw");

      if ("icon" in el.params) {
        icon.classList.add(...el.params.icon.split(" "));
      }

      text.textContent = el.title;
      link.addEventListener("click", (e) => {
        e.preventDefault();
        el.handler(e, el);
        this.hide();
      });

      link.append(icon, text);
      item.append(link);
      inner.append(item);
    });

    this.menuElement.append(inner);

    this.menuElement.addEventListener("click", (e) => {
      if (e.target === this.menuElement) {
        e.preventDefault();
        this.hide();
      }
    });

    return this.menuElement;
  }
}
