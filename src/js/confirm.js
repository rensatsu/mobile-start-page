export default class Confirm {
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
