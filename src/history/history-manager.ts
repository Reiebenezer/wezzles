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

		// console.log(this.undoHistory)
	}

	undo() {
		const last = this.undoHistory.pop()
		if (!last) return

		last.undoAction()
		this.redoHistory.push(last)

		// console.log(this.undoHistory)
	}

	redo() {
		const last = this.redoHistory.pop()
		if (!last) return

		last.redoAction()
		this.undoHistory.push(last)

		// console.log(this.undoHistory)
	}
}

export interface HistoryData {
	undoAction: () => void
	redoAction: () => void
}
