import Message from "./message";
import downloadFile from "./download-file";

export default class DataPortability {
  constructor(app, storage) {
    this.app = app;
    this.storage = storage;
  }

  import() {
    const input = document.createElement("input");
    input.type = "file";
    input.style.opacity = 0;
    input.style.pointerEvents = "none";
    input.style.position = "fixed";
    input.style.top = "-100px";
    document.body.append(input);
    input.click();
    document.body.removeChild(input);

    input.addEventListener("change", (e) => {
      e.preventDefault();

      if (input.files.length === 0) {
        new Message("No file selected");
        return;
      }

      const file = input.files[0];

      if (!file.name.endsWith(".json")) {
        new Message("Incorrect file type");
        return;
      }

      const reader = new FileReader();

      reader.addEventListener("load", (ev) => {
        const imported = ev.target.result;
        let json = null;

        try {
          json = JSON.parse(imported);
        } catch (e) {
          new Message("Unable to verify file");
          return;
        }

        if (!("bookmarks" in json)) {
          new Message('File has no "bookmarks" key');
          return;
        }

        if (!("settings" in json)) {
          new Message('File has no "settings" key');
          return;
        }

        this.storage.set("bookmarks", JSON.stringify(json.bookmarks));
        this.storage.set("settings", JSON.stringify(json.settings));

        new Message("Data import completed. Reloading...");

        this.app.reload();
      });

      reader.addEventListener("error", () => {
        new Message("Unable to load file");
        return;
      });

      reader.readAsText(file);
    });
  }

  export() {
    downloadFile({
      content: JSON.stringify({
        bookmarks: this.app.bookmarks,
        settings: this.app.settings,
      }),
      fileName: "start-menu.json",
      contentType: "application/json",
    });
  }
}
