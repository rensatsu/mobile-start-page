export default class Storage {
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
