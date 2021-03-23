import * as Constants from "./constants";
import Prompt from "./prompt";
import Storage from "./storage";
import Menu from "./menu";
import TitleBar from "./title-bar";
import Landing from "./landing";
import Entry from "./entry";
import MessageCenter from "./message-center";
import DataPortability from "./data-portability";

import { library, dom } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowUp,
  faArrowDown,
  faPen,
  faTimes,
  faPlus,
  faFileImport,
  faFileExport,
  faEdit,
  faBars,
} from "@fortawesome/free-solid-svg-icons";

library.add(
  faArrowUp,
  faArrowDown,
  faPen,
  faTimes,
  faPlus,
  faFileImport,
  faFileExport,
  faEdit,
  faBars,
);
dom.watch();

export default class App {
  constructor(selector) {
    this.app = document.querySelector(selector);

    if (!this.app) {
      throw new Error("App container selector didn't match any element");
    }

    this.storage = new Storage("mstart");
    this.entries = [];
    this.isEditEnabled = false;

    this.init();
  }

  swap(a, b) {
    // prettier-ignore
    [this.bookmarks[a], this.bookmarks[b]] = [this.bookmarks[b], this.bookmarks[a]];
    this.save();
  }

  edit(index, title, url) {
    this.bookmarks[index] = {
      title: title,
      url: url,
    };

    this.save();
  }

  remove(index) {
    this.bookmarks.splice(index, 1);
    this.save();
  }

  add(title, url) {
    this.bookmarks.push({
      title: title,
      url: url,
    });

    this.save();
  }

  save() {
    this.storage.set("bookmarks", JSON.stringify(this.bookmarks));
    this.init();
  }

  init() {
    this.bookmarks = JSON.parse(this.storage.get("bookmarks")) || [];
    this.settings = JSON.parse(this.storage.get("settings")) || {};
    this.elements = [];

    this.dataPortability = new DataPortability(this, this.storage);

    this.appMenu = new Menu(this);
    this.elements.push(new TitleBar("New tab", this, this.appMenu));

    this.appMenu.add({
      title: Constants.BTN_ADD,
      icon: "fas fa-plus",
      handler: async () => {
        const title = await new Prompt("Enter title:", "").run();
        if (title === null) {
          return;
        }

        const url = await new Prompt("Enter URL:", "https://").run();
        if (url === null) {
          return;
        }

        this.add(title, url);
      },
    });

    this.appMenu.add({
      title: "Import data",
      icon: "fas fa-file-import",
      handler: () => this.dataPortability.import(),
    });

    this.appMenu.add({
      title: "Export data",
      icon: "fas fa-file-export",
      handler: () => this.dataPortability.export(),
    });

    this.appMenu.add({
      title: "Toggle editing",
      icon: "fas fa-edit",
      handler: () => {
        this.isEditEnabled = !this.isEditEnabled;

        if (this.isEditEnabled) {
          this.app.classList.add("app-editing");
        } else {
          this.app.classList.remove("app-editing");
        }
      },
    });

    this.elements.push(this.appMenu);

    this.render();
  }

  render() {
    this.app.innerHTML = "";

    if (this.bookmarks.length > 0) {
      this.bookmarks.forEach((elem, idx) => {
        const entry = new Entry(elem.title, elem.url, idx, this);
        this.elements.push(entry);
        this.entries.push(entry);
      });
    } else {
      this.elements.push(new Landing(this));
    }

    this.elements.push(new MessageCenter());

    this.elements.forEach(async (elem) => {
      this.app.append(await elem.render());
    });
  }

  reload() {
    setTimeout(() => location.reload(), Constants.DEFAULT_DURATION);
  }
}
