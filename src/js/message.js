import * as Constants from "./constants";

export default class Message {
  constructor(text, duration = Constants.DEFAULT_DURATION) {
    const event = new CustomEvent(Constants.EVENT_MESSAGE, {
      detail: {
        text: text,
        duration: duration,
      },
    });

    document.dispatchEvent(event);
  }
}
