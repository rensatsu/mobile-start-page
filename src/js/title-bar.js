import * as Constants from './constants';

export default class TitleBar {
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
        btnMenu.textContent = Constants.BTN_MENU;
        btnMenu.addEventListener('click', e => {
            e.preventDefault();
            this.menu.toggle();
        });

        elem.append(header, btnMenu);
        return elem;
    }
}
