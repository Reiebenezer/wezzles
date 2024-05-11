export default class HistoryManager {

	/** Singleton instance */
	static #instance: HistoryManager

	undoHistory = new Array<HistoryData>()
	redoHistory = new Array<HistoryData>()

	/** **Singleton:** prevents creation of another instance */
	constructor() {
		if (HistoryManager.#instance)
			throw new ReferenceError('You cannot create another instance!')

		HistoryManager.#instance = this
	}

	/** **Singleton:** instance calls are made here */
	static get instance() {
		if (!HistoryManager.#instance)
			HistoryManager.#instance = new HistoryManager()

		return HistoryManager.#instance
	}
	/**
	 * ### Add History Data
	 * create a history data for the redo and undo functions
	 */
	add(item: HistoryData) {
		this.undoHistory.push(item)
		this.redoHistory.length = 0

		;(document.getElementById('toolbar-undo') as HTMLButtonElement).disabled = false
		;(document.getElementById('toolbar-redo') as HTMLButtonElement).disabled = true
	}
	/**
	 * ### Undo History Data
	 * Undo the last action
	 */
	undo() {
		const last = this.undoHistory.pop()
		if (!last) return

		last.undoAction()
		this.redoHistory.push(last)

		;(document.getElementById('toolbar-redo') as HTMLButtonElement).disabled = false

		if (this.undoHistory.length === 0) 
			(document.getElementById('toolbar-undo') as HTMLButtonElement).disabled = true
	
	}
	/**
	 * ### Redo History Data
	 * Redo last action
	 */
	redo() {
		const last = this.redoHistory.pop()
		if (!last) return

		last.redoAction()
		this.undoHistory.push(last)

		;(document.getElementById('toolbar-undo') as HTMLButtonElement).disabled = false

		if (this.redoHistory.length === 0) 
			(document.getElementById('toolbar-redo') as HTMLButtonElement).disabled = true
	}
}

export interface HistoryData {
	undoAction: () => void
	redoAction: () => void
}
