import { shortcutJS } from 'shortcutjs'
import shortcuts from './shortcuts.json'

export default class KeyboardManager {
	static #instance?: KeyboardManager

	constructor() {
		if (KeyboardManager.#instance) 
            throw new ReferenceError('You cannot create another instance!')

		KeyboardManager.#instance = this
	}

	static get instance() {
		if (!KeyboardManager.#instance)
			KeyboardManager.#instance = new KeyboardManager()

		return KeyboardManager.#instance
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
