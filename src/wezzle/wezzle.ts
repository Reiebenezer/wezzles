import { util } from '../global'
import { WezzleGroup, type WezzleData } from './types'

const template = document.querySelector('template')!.content

export default class Wezzle {
	data: WezzleData
	element: HTMLElement
	text: HTMLParagraphElement

	static instances = new Set<Wezzle>()

	constructor(data: WezzleData, element?: HTMLElement) {
		// Create a clone of the data rather than referencing it
		this.data = util.cloneObject(data)

		// Add Property Identifiers for every specified property
		this.data.properties.forEach(prop => {
			if (!prop.value) prop.value = ''
		})

		this.element =
			element ??
			(data.extendable
				? (template
						.querySelector('.wz-extendable')!
						.cloneNode(true) as HTMLElement)
				: (template
						.querySelector('.wz')!
						.cloneNode(true) as HTMLElement))

		if (this.data.group === WezzleGroup.style) {
			this.element.classList.add('wz-style')
		}

		this.text = this.element.querySelector('p')!

		if (this.text.innerHTML.length === 0) this.text.innerHTML = data.name

		Wezzle.instances.add(this)
	}

	// PUBLIC FUNCTIONS

	static getInstance(el: HTMLElement): Wezzle | undefined {
		return [...this.instances.values()].find(
			instance =>
				instance.text.innerHTML ===
				(el.querySelector(':scope > p.name') as HTMLElement).innerHTML
		)
	}

	addTo(container: HTMLElement, before?: Element): Wezzle {
		before
			? container.insertBefore(this.element, before)
			: container.appendChild(this.element)

		return this
	}

	// PRIVATE FUNCTIONS
}

export class WezzleInstance extends Wezzle {
	static instances = new Set<WezzleInstance>()

	undoHistory: Array<{ source: Element, dest: Element | null, srcIndex: number, destIndex: number | null }>
	redoHistory: Array<{ source: Element, dest: Element | null, srcIndex: number, destIndex: number | null }>

	constructor(template: Wezzle)
	constructor(el: HTMLElement)
	constructor(templateOrElement: Wezzle | HTMLElement) {
		const data =
			templateOrElement instanceof HTMLElement
				? Wezzle.getInstance(templateOrElement)!.data
				: templateOrElement.data

		templateOrElement instanceof HTMLElement
			? super(data, templateOrElement)
			: super(data)

		WezzleInstance.instances.add(this)

		if (this.data.extendable) {
			const extender = this.element.querySelector(
				'.wz-extender'
			) as HTMLElement
			extender.onclick = e => {
				if (e.target !== extender) return
				extender?.classList.toggle('expanded')
			}
		}

		this.undoHistory = []
		this.redoHistory = []
	}

	static getInstance(el: HTMLElement): WezzleInstance {
		const instance =
			[...this.instances.values()].find(
				instance => instance.element === el
			) ?? new WezzleInstance(el)

		return instance
	}

	static removeInstance(el: HTMLElement) {
		this.instances.delete(this.getInstance(el))
		el.remove()
	}
}
