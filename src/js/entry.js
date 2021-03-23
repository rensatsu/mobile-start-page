import Prompt from "./prompt";
import Confirm from "./confirm";
import getDefaultIcon from "./default-icon";
import faIcon from "./fa-icon";

export default class Entry {
  constructor(title, url, index, app) {
    this.title = title;
    this.url = url;
    this.index = index;
    this.app = app;
    this.icon =
      "https://favicon-api.rencloud.workers.dev/?url=" + new URL(url).host;
  }

  render() {
    const elem = document.createElement("div");
    elem.classList.add("entry");
    elem.dataset.url = this.url;
    elem.dataset.title = this.title;
    elem.dataset.icon = this.icon;

    const icon = document.createElement("img");
    icon.src = this.icon;

    icon.addEventListener(
      "error",
      async () => {
        icon.src = getDefaultIcon();
      },
      { once: true },
    );

    const titleWrapper = document.createElement("a");
    titleWrapper.href = this.url;
    titleWrapper.rel = "noopener noreferrer";

    const titleBlock = document.createElement("div");
    titleBlock.classList.add("title-block");

    const title = document.createElement("div");
    title.classList.add("title-block-title");
    title.textContent = this.title;

    const url = document.createElement("div");
    url.classList.add("title-block-url");
    url.textContent = this.url;

    titleBlock.append(title, url);
    titleWrapper.append(icon, titleBlock);

    const btnUp = document.createElement("button");
    btnUp.classList.add("btn");
    btnUp.classList.add("btn-action");

    const btnUpIcon = faIcon("fas fa-arrow-up");
    btnUp.append(btnUpIcon);

    if (this.index === 0) btnUp.setAttribute("disabled", "disabled");
    btnUp.addEventListener("click", (e) => {
      e.preventDefault();
      this.app.swap(this.index, this.index - 1);
    });

    const btnDown = document.createElement("button");
    btnDown.classList.add("btn");
    btnDown.classList.add("btn-action");

    const btnDownIcon = faIcon("fas fa-arrow-down");
    btnDown.append(btnDownIcon);

    if (this.index === this.app.bookmarks.length - 1)
      btnDown.setAttribute("disabled", "disabled");
    btnDown.addEventListener("click", (e) => {
      e.preventDefault();
      this.app.swap(this.index, this.index + 1);
    });

    const btnEdit = document.createElement("button");
    btnEdit.classList.add("btn");
    btnEdit.classList.add("btn-action");

    const btnEditIcon = faIcon("fas fa-pen");
    btnEdit.append(btnEditIcon);

    btnEdit.addEventListener("click", (e) => {
      e.preventDefault();

      (async () => {
        const title = await new Prompt("Enter title:", this.title).run();
        const url = await new Prompt("Enter URL:", this.url).run();

        if (!title && !url) return;

        this.app.edit(this.index, title || this.title, url || this.url);
      })();
    });

    const btnDelete = document.createElement("button");
    btnDelete.classList.add("btn");
    btnDelete.classList.add("btn-action");
    btnDelete.classList.add("btn-warning");

    const btnDeleteIcon = faIcon("fas fa-times");
    btnDelete.append(btnDeleteIcon);

    btnDelete.addEventListener("click", (e) => {
      e.preventDefault();

      (async () => {
        const confirmation = await new Confirm(
          `Do you really want to delete <${this.title}>?`,
        ).run();

        if (confirmation) {
          this.app.remove(this.index);
        }
      })();
    });

    /*
        elem.addEventListener('click', e => {
            e.preventDefault();

            if (e.button !== 0) {
                return;
            }

            if (!e.target.classList.contains('btn')) {
                location.href = this.url;
            }
        });
        */

    elem.append(titleWrapper, btnUp, btnDown, btnEdit, btnDelete);

    return elem;
  }
}
