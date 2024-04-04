import { shortcutJS } from "shortcutjs";
import shortcuts from '../../shortcuts.json'

export default class KeyboardManager {
    static instance?: KeyboardManager

    constructor() {
        if (KeyboardManager.instance) {
            throw new Error('KeyboardManager is instantiated already!')
        }

        KeyboardManager.instance = this
    }

    init() {
        shortcutJS.loadFromJson(shortcuts)

        return this
    }

    on(shortcutName: string, action: (ev: KeyboardEvent) => void) {
        if (shortcutJS.isPaused()) return this
        
        shortcutJS.subscribe(shortcutName, action)
        return this
    }
}