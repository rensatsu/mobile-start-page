import * as Constants from './constants';
import Prompt from './prompt';
import Storage from './storage';
import Menu from './menu';
import TitleBar from './title-bar';
import Landing from './landing';
import ThemeSelector from './theme-selector';
import Entry from './entry';
import MessageCenter from './message-center';
import DataPortability from './data-portability';

export default class App {
    constructor(selector) {
        this.app = document.querySelector(selector);
        if (!this.app) throw new Error('App container selector didn\'t match any element');
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

        this.appMenu.add(Constants.BTN_ADD, {}, async () => {
            const title = await (new Prompt('Enter title:', '')).run();
            if (title === null) {
                return;
            }

            const url = await (new Prompt('Enter URL:', 'https://')).run();
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

        if ('themeName' in this.settings && this.settings.themeName) {
            this.themeSelector.apply(this.settings.themeName, false);
        } else {
            this.themeSelector.apply(Constants.THEME_DEFAULT, false);
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

        this.elements.forEach(async (elem) => {
            this.app.append(await elem.render());
        });
    }

    reload() {
        setTimeout(() => {
            location.reload();
        }, Constants.DEFAULT_DURATION);
    }
}
