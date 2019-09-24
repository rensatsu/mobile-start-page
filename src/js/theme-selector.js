import * as Constants from './constants';
import Message from './message';

export default class ThemeSelector {
    constructor(app, storage) {
        this.app = app;
        this.storage = storage;
        this.themeName = (app.settings || {}).themeName || null;

        this.themesCollection = {
            default: {
                name: 'Default'
            },
            lightGray: {
                name: 'Light Gray',
                colorBg1: '#ccc',
                colorBg2: '#ccc',
                colorFg: '#345'
            },
            darkPink: {
                name: 'Dark Pink',
                colorBg1: '#263238',
                colorBg2: '#CE93D8',
                colorFg: '#fff'
            },
            skyBlue: {
                name: 'Sky Blue',
                colorBg1: '#BBDEFB',
                colorBg2: '#90CAF9',
                colorFg: '#37474F'
            },
            grassGreen: {
                name: 'Grass Green',
                colorBg1: '#8BC34A',
                colorBg2: '#F9FBE7',
                colorFg: '#004D40'
            },
            dark: {
                name: 'Night Blue',
                colorBg1: '#070a1b',
                colorBg2: '#070a1b',
                colorFg: '#aaa'
            },
            amoled: {
                name: 'AMOLED Black',
                colorBg1: '#000',
                colorBg2: '#000',
                colorFg: '#999'
            }
        };
    }

    show() {
        this.elements.container.hidden = false;
    }

    hide() {
        this.elements.container.hidden = true;
    }

    set(name) {
        if (!name) return;

        if (!(name in this.themesCollection)) return;

        const config = this.themesCollection[name];

        this.themeName = name;
        this.app.settings.colorBg1 = config.colorBg1 || null;
        this.app.settings.colorBg2 = config.colorBg2 || null;
        this.app.settings.colorFg = config.colorFg || null;
        this.app.settings.themeName = name;
        this.storage.set('settings', JSON.stringify(this.app.settings));

        new Message("Theme saved, restarting...");

        setTimeout(() => {
            location.reload();
        }, Constants.DEFAULT_DURATION);
    }

    render() {
        const elem = document.createElement('div');
        elem.classList.add('dialog-wrapper');
        elem.hidden = true;

        const inner = document.createElement('div');
        inner.classList.add('dialog');

        elem.addEventListener('click', e => {
            if (e.target === elem) {
                e.preventDefault();
                this.hide();
            }
        });

        const header = document.createElement('h2');
        header.textContent = "Theme";

        const collection = document.createElement('ul');
        collection.classList.add('theme-collection');

        Object.entries(this.themesCollection).forEach(([name, theme]) => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.addEventListener('click', ev => {
                ev.preventDefault();
                this.set(name);
                this.hide();
            });

            if (name === this.themeName) {
                li.classList.add('active');
            }

            const e = document.createElement('div');
            e.classList.add('theme-preview');
            e.textContent = 'Aa';
            e.dataset.theme = name;

            if ('colorBg1' in theme) {
                e.style.setProperty('--color-bg1', theme.colorBg1);
            }

            if ('colorBg2' in theme) {
                e.style.setProperty('--color-bg2', theme.colorBg2);
            }

            if ('colorFg' in theme) {
                e.style.setProperty('--color-fg', theme.colorFg);
            }

            const d = document.createElement('span');
            d.textContent = theme.name;
            d.classList.add('theme-name');

            a.append(e, d);
            li.append(a);
            collection.append(li);
        });

        const footer = document.createElement('footer');

        const close = document.createElement('button');
        close.textContent = 'Cancel';
        close.classList.add('dialog-btn');
        close.classList.add('dialog-btn-cancel');
        close.addEventListener('click', ev => {
            ev.preventDefault();
            this.hide();
        });

        footer.append(close);
        inner.append(header, collection, footer);
        elem.append(inner);

        this.elements = {
            container: elem,
            inner: inner,
            header: header,
            collection: collection
        };

        return elem;
    }
}
