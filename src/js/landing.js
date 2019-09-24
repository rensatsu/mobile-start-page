export default class Landing {
    constructor() {

    }

    async render() {
        const elem = document.createElement('div');
        elem.classList.add('landing');

        const image = document.createElement('img');
        const landImageModule = await import(/* webpackMode: "eager" */ './../images/landing.svg');

        image.src = landImageModule.default;
        image.alt = 'Landing image';

        const text = document.createElement('p');
        text.textContent = 'Welcome to Your New Tab';

        elem.append(image, text);

        return elem;
    }
}
