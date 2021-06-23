import { ADJECTIVES, NOUNS } from "./mockData/names-const"

export default class Utils {
    static getRandomRange(min = 0, max = 20) {
        return Math.round(Math.random() * (max - min) + min);
    }
    static getRandomDate(res = 1000) {
        return Math.floor(Date.now() / res);

    }
    static getRandomString(length = 8) {
        return Math.random().toString(36).substring(4).substring(0, length);
    }

    static getAppOrigin() {
        return process.env.PublisherUrl;
    }

    static capFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    static generateName() {
        return (
            ADJECTIVES[Utils.getRandomRange(0, ADJECTIVES.length + 1)] +
            "-" +
            NOUNS[Utils.getRandomRange(0, NOUNS.length + 1)]
        )
    }
}