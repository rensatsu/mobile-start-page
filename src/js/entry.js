import * as Constants from './constants';
import Prompt from './prompt';
import Confirm from './confirm';
import getDefaultIcon from './default-icon';

export default class Entry {
    constructor(title, url, index, app) {
        this.title = title;
        this.url = url;
        this.index = index;
        this.app = app;
        // this.icon = 'https://www.google.com/s2/favicons?domain=' + (new URL(url).host);
        this.icon = 'https://icons.duckduckgo.com/ip3/' + (new URL(url).host) + '.ico';
    }

    render() {
        const elem = document.createElement('div');
        elem.classList.add('entry');
        elem.dataset.url = this.url;
        elem.dataset.title = this.title;
        elem.dataset.icon = this.icon;

        const icon = document.createElement('img');
        icon.src = this.icon;

        icon.addEventListener('error', async () => {
            icon.src = getDefaultIcon();
        }, { once: true });

        const title = document.createElement('a');
        title.href = this.url;
        title.textContent = this.title;
        title.rel = 'noopener noreferrer';

        const btnUp = document.createElement('button');
        btnUp.classList.add('btn');
        btnUp.classList.add('btn-action');
        btnUp.textContent = Constants.BTN_UP;
        if (this.index === 0) btnUp.setAttribute('disabled', 'disabled');
        btnUp.addEventListener('click', e => {
            e.preventDefault();
            this.app.swap(this.index, this.index - 1);
        });

        const btnDown = document.createElement('button');
        btnDown.classList.add('btn');
        btnDown.classList.add('btn-action');
        btnDown.textContent = Constants.BTN_DOWN;
        if (this.index === this.app.bookmarks.length - 1) btnDown.setAttribute('disabled', 'disabled');
        btnDown.addEventListener('click', e => {
            e.preventDefault();
            this.app.swap(this.index, this.index + 1);
        });

        const btnEdit = document.createElement('button');
        btnEdit.classList.add('btn');
        btnEdit.classList.add('btn-action');
        btnEdit.textContent = Constants.BTN_EDIT;
        btnEdit.addEventListener('click', e => {
            e.preventDefault();

            (async () => {
                const title = await (new Prompt('Enter title:', this.title)).run();
                const url = await (new Prompt('Enter URL:', this.url)).run();

                if (!title && !url) return;

                this.app.edit(this.index, title || this.title, url || this.url);
            })();
        });

        const btnDelete = document.createElement('button');
        btnDelete.classList.add('btn');
        btnDelete.classList.add('btn-action');
        btnDelete.textContent = Constants.BTN_DELETE;
        btnDelete.addEventListener('click', e => {
            e.preventDefault();

            (async () => {
                const confirmation =
                    await (new Confirm(`Do you really want to delete <${this.title}>?`)).run();

                if (confirmation) {
                    this.app.remove(this.index);
                }
            })();
        });

        elem.addEventListener('click', e => {
            e.preventDefault();

            if (e.button !== 0) {
                return;
            }

            if (!e.target.classList.contains('btn')) {
                location.href = this.url;
            }
        });

        document.addEventListener('click', () => {
            elem.classList.remove('is-editable');
        });

        elem.addEventListener('contextmenu', e => {
            e.preventDefault();
            elem.classList.toggle('is-editable');
        }, { useCapture: true });

        elem.append(icon, title, btnUp, btnDown, btnEdit, btnDelete);

        return elem;
    }
}
