/**
 * # KEYBOARD MANAGER.TS
 * 
 * Functions for keyboard shorcuts
 */

import { shortcutJS } from 'shortcutjs'
import shortcuts from './shortcuts.json'

export default class KeyboardManager {

	/** Singleton instance */
	static #instance?: KeyboardManager

	/** **Singleton:** prevents creation of another instance */
	constructor() {
		if (KeyboardManager.#instance) 
            throw new ReferenceError('You cannot create another instance!')

		KeyboardManager.#instance = this
	}

	/** **Singleton:** instance calls are made here */
	static get instance() {
		if (!KeyboardManager.#instance)
			KeyboardManager.#instance = new KeyboardManager()

		return KeyboardManager.#instance
	}

	/** **Singleton:** Initiation of for the keyboard manager */
	init() {
		if (shortcutJS.actions.size === 0)
			shortcutJS.loadFromJson(shortcuts)

		return this
	}

	/** 
	 * ### Keyboard Manager Event listener
	 * Performs `action` if `shortuctName` is performed
	 * 
	 * @example
	 * ```
	 * on('copy', () => console.log('Copied Wezzle!')) 
	 * 		// Prints "Copied Wezzle" to console when copy (Ctrl+C) is fired
	 * ```
	 */
	on(shortcutName: string, action: (ev: KeyboardEvent) => void) {
		if (shortcutJS.isPaused()) return this

		shortcutJS.subscribe(shortcutName, action)
		return this
	}
}
