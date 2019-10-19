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

        const btnMenuIcon = document.createElement('i');
        btnMenuIcon.classList.add('fas');
        btnMenuIcon.classList.add('fa-bars');

        btnMenu.append(btnMenuIcon);

        btnMenu.addEventListener('click', e => {
            e.preventDefault();
            this.menu.toggle();
        });

        elem.append(header, btnMenu);
        return elem;
    }
}
