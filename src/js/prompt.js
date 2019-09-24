export default class Prompt {
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
