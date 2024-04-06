export default class HistoryManager {
	static #instance: HistoryManager

	undoHistory = new Array<HistoryData>()
	redoHistory = new Array<HistoryData>()

	constructor() {
		if (HistoryManager.#instance)
			throw new ReferenceError('You cannot create another instance!')

		HistoryManager.#instance = this
	}

	static get instance() {
		if (!HistoryManager.#instance)
			HistoryManager.#instance = new HistoryManager()

		return HistoryManager.#instance
	}

	add(item: HistoryData) {
		this.undoHistory.push(item)
		this.redoHistory.length = 0

		;(document.getElementById('toolbar-undo') as HTMLButtonElement).disabled = false
		;(document.getElementById('toolbar-redo') as HTMLButtonElement).disabled = true
	}

	undo() {
		const last = this.undoHistory.pop()
		if (!last) return

		last.undoAction()
		this.redoHistory.push(last)

		;(document.getElementById('toolbar-redo') as HTMLButtonElement).disabled = false

		if (this.undoHistory.length === 0) 
			(document.getElementById('toolbar-undo') as HTMLButtonElement).disabled = true
	
	}

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
