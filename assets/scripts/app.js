(_ => {
    'use strict';

    const BTN_EDIT = '🖊️';
    const BTN_DELETE = '❌';
    const BTN_ADD = 'Add';
    const BTN_UP = '🔺';
    const BTN_DOWN = '🔻';
    const BTN_MENU = '🍔';
    const DEFAULT_DURATION = 3000;
    const BLOB_REVOKE_TIMEOUT = 10000;
    const EVENT_MESSAGE = 'message-center-alert';
    const ICON_DEFAULT = 'assets/images/default.svg';

    class Prompt {
        constructor(text, defValue = null) {
            this.text = text;
            this.defValue = defValue;
        }

        run() {
            return new Promise(resolve => {
                const result = prompt(this.text, this.defValue);
                resolve(result === null ? null : result.trim());
            });
        }
    }

    class Confirm {
        constructor(text) {
            this.text = text;
        }

        run() {
            return new Promise(resolve => {
                const result = confirm(this.text);
                resolve(result);
            });
        }
    }

    class Storage {
        constructor(prefix = '') {
            this.prefix = prefix + '_';
        }

        check(key) {
            return (this.prefix + key) in localStorage;
        }

        get(key) {
            return localStorage.getItem(this.prefix + key);
        }

        set(key, val) {
            return localStorage.setItem(this.prefix + key, val);
        }

        del(key) {
            return localStorage.removeItem(this.prefix + key);
        }
    }

    class Menu {
        constructor(app) {
            this.app = app;
            this.items = [];
            this.menuElement = null;
        }

        add(title, params = {}, handler = () => { }) {
            this.items.push({
                title: title,
                params: params,
                handler: handler
            });
        }

        show() {
            this.menuElement.hidden = false;
        }

        hide() {
            this.menuElement.hidden = true;
        }

        toggle() {
            this.menuElement.hidden = !this.menuElement.hidden;
        }

        render() {
            this.menuElement = document.createElement('aside');
            this.menuElement.classList.add('menu');
            this.menuElement.hidden = true;

            const inner = document.createElement('ul');

            this.items.forEach(el => {
                const item = document.createElement('li');
                const link = document.createElement('a');
                link.textContent = el.title;
                link.addEventListener('click', e => {
                    e.preventDefault();
                    el.handler(e, el);
                    this.hide();
                });

                item.append(link);

                inner.append(item);
            });

            this.menuElement.append(inner);

            this.menuElement.addEventListener('click', e => {
                if (e.target === this.menuElement) {
                    e.preventDefault();
                    this.hide();
                }
            });

            return this.menuElement;
        }
    }

    class TitleBar {
        constructor(title, app, menu) {
            this.title = title;
            this.app = app;
            this.menu = menu;
        }

        render() {
            const elem = document.createElement('nav');
            const header = document.createElement('h1');
            header.textContent = this.title;

            const btnMenu = document.createElement('button');
            btnMenu.classList.add('btn');
            btnMenu.classList.add('btn-menu');
            btnMenu.textContent = BTN_MENU;
            btnMenu.addEventListener('click', e => {
                e.preventDefault();
                this.menu.toggle();
            });

            elem.append(header, btnMenu);
            return elem;
        }
    }

    class Landing {
        constructor() {

        }

        render() {
            const elem = document.createElement('div');
            elem.classList.add('landing');

            const image = document.createElement('img');
            image.src = './assets/images/landing.svg';
            image.alt = `Landing image`;

            const text = document.createElement('p');
            text.textContent = `Welcome to Your New Tab`;

            elem.append(image, text);

            return elem;
        }
    }

    class Entry {
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
            icon.addEventListener('error', () => {
                icon.src = ICON_DEFAULT;
            }, { once: true });

            const title = document.createElement('a');
            title.href = this.url;
            title.textContent = this.title;
            title.rel = 'noopener noreferrer';

            const btnUp = document.createElement('button');
            btnUp.classList.add('btn');
            btnUp.classList.add('btn-action');
            btnUp.textContent = BTN_UP;
            if (this.index === 0) btnUp.setAttribute('disabled', 'disabled');
            btnUp.addEventListener('click', e => {
                e.preventDefault();
                this.app.swap(this.index, this.index - 1);
            });

            const btnDown = document.createElement('button');
            btnDown.classList.add('btn');
            btnDown.classList.add('btn-action');
            btnDown.textContent = BTN_DOWN;
            if (this.index === this.app.bookmarks.length - 1) btnDown.setAttribute('disabled', 'disabled');
            btnDown.addEventListener('click', e => {
                e.preventDefault();
                this.app.swap(this.index, this.index + 1);
            });

            const btnEdit = document.createElement('button');
            btnEdit.classList.add('btn');
            btnEdit.classList.add('btn-action');
            btnEdit.textContent = BTN_EDIT;
            btnEdit.addEventListener('click', e => {
                e.preventDefault();

                (async () => {
                    const title = await (new Prompt(`Enter title:`, this.title)).run();
                    const url = await (new Prompt(`Enter URL:`, this.url)).run();

                    if (!title && !url) return;

                    this.app.edit(this.index, title || this.title, url || this.url);
                })();
            });

            const btnDelete = document.createElement('button');
            btnDelete.classList.add('btn');
            btnDelete.classList.add('btn-action');
            btnDelete.textContent = BTN_DELETE;
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

            document.addEventListener('click', e => {
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

    class MessageCenter {
        constructor() {
            document.addEventListener(EVENT_MESSAGE, e => {
                this.add(e.detail.text, e.detail.duration);
            });

            this.container = null;
        }

        remove(elem) {
            elem.remove();
        }

        add(text, duration = DEFAULT_DURATION) {
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

    class Message {
        constructor(text, duration = DEFAULT_DURATION) {
            const event = new CustomEvent(EVENT_MESSAGE, {
                detail: {
                    text: text,
                    duration: duration
                }
            });

            document.dispatchEvent(event);
        }
    }

    class DataPortability {
        constructor(app, storage) {
            this.app = app;
            this.storage = storage;
        }

        import() {
            const input = document.createElement('input');
            input.type = 'file';
            input.style.opacity = 0;
            input.style.pointerEvents = 'none';
            input.style.position = 'fixed';
            input.style.top = '-100px';
            document.body.append(input);
            input.click();
            document.body.removeChild(input);

            input.addEventListener('change', e => {
                e.preventDefault();

                if (input.files.length === 0) {
                    new Message("No file selected");
                    return;
                }

                const file = input.files[0];

                if (!file.name.endsWith('.json')) {
                    new Message("Incorrect file type");
                    return;
                }

                const reader = new FileReader();

                reader.addEventListener('load', (ev) => {
                    const imported = ev.target.result;
                    let json = null;

                    try {
                        json = JSON.parse(imported);
                    } catch (e) {
                        new Message("Unable to verify file");
                        return;
                    }

                    if (!('bookmarks' in json)) {
                        new Message("File has no 'bookmarks' key");
                        return;
                    }

                    if (!('settings' in json)) {
                        new Message("File has no 'settings' key");
                        return;
                    }

                    this.storage.set('bookmarks', JSON.stringify(json.bookmarks));
                    this.storage.set('settings', JSON.stringify(json.settings));

                    new Message("Data import completed. Reloading...");

                    setTimeout(_ => {
                        location.reload();
                    }, DEFAULT_DURATION);
                });

                reader.addEventListener('error', () => {
                    new Message("Unable to load file");
                    return;
                });

                reader.readAsText(file);
            });
        }

        export() {
            const download = (content, fileName, contentType) => {
                const a = document.createElement("a");
                const file = new Blob([content], { type: contentType });
                const url = URL.createObjectURL(file);
                a.href = url;
                a.download = fileName;
                a.click();

                setTimeout(_ => {
                    URL.revokeObjectURL(url);
                }, BLOB_REVOKE_TIMEOUT);
            }

            download(JSON.stringify({
                bookmarks: this.app.bookmarks,
                settings: this.app.settings,
            }), 'start-menu.json', 'text/plain');
        }
    }

    class ThemeSelector {
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
            }, DEFAULT_DURATION);
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

    class App {
        constructor(selector) {
            this.app = document.querySelector(selector);
            if (!this.app) throw new Error(`App container selector didn't match any element`);
            this.storage = new Storage('mstart');

            this.init();
        }

        swap(index1, index2) {
            [this.bookmarks[index1], this.bookmarks[index2]] = [this.bookmarks[index2], this.bookmarks[index1]];
            this.save();
        }

        edit(index, title, url) {
            this.bookmarks[index] = {
                title: title,
                url: url
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
                url: url
            });

            this.save();
        }

        save() {
            this.storage.set('bookmarks', JSON.stringify(this.bookmarks));
            this.init();
        }

        init() {
            this.bookmarks = JSON.parse(this.storage.get('bookmarks')) || [];
            this.settings = JSON.parse(this.storage.get('settings')) || {};
            this.elements = [];

            this.dataPortability = new DataPortability(this, this.storage);

            this.appMenu = new Menu(this);
            this.elements.push(new TitleBar('New tab', this, this.appMenu));

            this.themeSelector = new ThemeSelector(this, this.storage);

            this.appMenu.add(BTN_ADD, {}, async () => {
                const title = await (new Prompt(`Enter title:`, '')).run();
                if (title === null) {
                    return;
                }

                const url = await (new Prompt(`Enter URL:`, 'https://')).run();
                if (url === null) {
                    return;
                }

                this.add(title, url);
            });

            this.appMenu.add('Import data', {}, () => {
                this.dataPortability.import();
            });

            this.appMenu.add('Export data', {}, () => {
                this.dataPortability.export();
            });

            this.appMenu.add('Change theme', {}, () => {
                this.themeSelector.show();
            });

            this.elements.push(this.appMenu);

            this.render();
        }

        setTheme(name) {
            this.themeSelector.set(name);
        }

        render() {
            this.app.innerHTML = '';
            const rootElement = document.documentElement;

            if ('colorBg1' in this.settings && this.settings.colorBg1) {
                rootElement.style.setProperty('--color-wallpaper-bg1', this.settings.colorBg1);
            }

            if ('colorBg2' in this.settings && this.settings.colorBg2) {
                rootElement.style.setProperty('--color-wallpaper-bg2', this.settings.colorBg2);
            }

            if ('colorFg' in this.settings && this.settings.colorFg) {
                rootElement.style.setProperty('--color-fg', this.settings.colorFg);
            }

            if (this.bookmarks.length > 0) {
                this.bookmarks.forEach((elem, idx) => {
                    this.elements.push(new Entry(elem.title, elem.url, idx, this));
                });
            } else {
                this.elements.push(new Landing(this));
            }

            this.elements.push(new MessageCenter());
            this.elements.push(this.themeSelector);

            this.elements.forEach(elem => {
                this.app.append(elem.render());
            });
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        new App('main');

        if ('serviceWorker' in navigator) {
            console.info('[worker]', 'registration start');
            navigator.serviceWorker.register('sw.js', {
                scope: location.pathname
            })
                .then(reg => {
                    console.info('[worker]', 'registration completed');

                    reg.addEventListener('updatefound', () => {
                        const installingWorker = reg.installing;

                        installingWorker.addEventListener('statechange', () => {
                            switch (installingWorker.state) {
                                case 'installed':
                                    if (navigator.serviceWorker.controller) {
                                        // At this point, the old content will have been purged and the fresh content will
                                        // have been added to the cache.
                                        // It's the perfect time to display a "New content is available; please refresh."
                                        // message in the page's interface.
                                        new Message("App update available, please reload page");
                                        console.info('[worker]', 'new or updated content is available');
                                    } else {
                                        // At this point, everything has been precached.
                                        // It's the perfect time to display a "Content is cached for offline use." message.
                                        new Message("App is ready to be used offline");
                                        console.info('[worker]', 'content is now available offline');
                                    }
                                    break;

                                case 'waiting':
                                    console.log('[worker]', 'waiting state');
                                    break;
                                case 'redundant':
                                    console.error('[worker]', 'the installing service worker became redundant');
                                    break;
                            }
                        });
                    });
                })
                .catch(e => {
                    console.error('[worker]', 'registration failed', e);
                });
        }
    });
})();
