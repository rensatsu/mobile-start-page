import * as Constants from './constants';

export default class MessageCenter {
    constructor() {
        document.addEventListener(Constants.EVENT_MESSAGE, e => {
            this.add(e.detail.text, e.detail.duration);
        });

        this.container = null;
    }

    remove(elem) {
        elem.remove();
    }

    add(text, duration = Constants.DEFAULT_DURATION) {
        const alert = document.createElement('div');
        alert.textContent = text;
        alert.addEventListener('click', e => {
            e.preventDefault();
            this.remove(alert);
        });

        if (duration > 0) {
            setTimeout(_ => {
                this.remove(alert);
            }, duration);
        }

        this.container.append(alert);
    }

    render() {
        this.container = document.createElement('section');
        this.container.classList.add('message-center');
        return this.container;
    }
}
