import anime from 'animejs'
import { util } from '../global'
import templates from './templates'
import {
	WezzleGroup,
	type WezzleData,
	ExportWezzleData,
	ExportWezzle,
} from './types'
import WezzleManager from './wezzle-manager'

export default class Wezzle {
	data: WezzleData
	element: HTMLElement
	text: HTMLParagraphElement

	template = (document.getElementById('wz-tmp') as HTMLTemplateElement)
		?.content

	static instances = new Set<Wezzle>()

	constructor(data: WezzleData, element?: HTMLElement) {
		// Create a clone of the data rather than referencing it
		this.data = util.cloneObject(data) as WezzleData

		// Add Property Identifiers for every specified property
		this.data.properties.forEach(prop => {
			if (!prop.value) prop.value = ''
		})

		this.element =
			element ??
			(data.extendable
				? (this.template!.querySelector('.wz-extendable')!.cloneNode(
						true
				  ) as HTMLElement)
				: (this.template!.querySelector('.wz')!.cloneNode(
						true
				  ) as HTMLElement))

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

	get contents() {
		if (!this.data.extendable) return null
		return this.element.querySelector(
			':scope > .wz-extender > .contents'
		) as HTMLElement
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

	undoHistory: Array<{
		source: Element
		dest: Element | null
		srcIndex: number
		destIndex: number | null
	}>
	redoHistory: Array<{
		source: Element
		dest: Element | null
		srcIndex: number
		destIndex: number | null
	}>

	constructor(template: Wezzle)
	constructor(el: HTMLElement)
	constructor(data: WezzleData)
	constructor(templateOrElement: Wezzle | HTMLElement | WezzleData) {
		const data =
			templateOrElement instanceof HTMLElement
				? Wezzle.getInstance(templateOrElement)!.data
				: templateOrElement instanceof Wezzle
				? templateOrElement.data
				: templateOrElement

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

	static loadFromData(data: ExportWezzle[], parent: HTMLElement) {
		data.forEach((item, index) => {
			if ('parent' in item) {
				// Not WezzleData
				const data = mergeWithTemplate(item.parent)

				if (data) {
					const instance = new WezzleInstance(data)

					if (instance.data.extendable)
						WezzleManager.instance.drake.containers.push(
							instance.contents!
						)
					instance.addTo(parent)
					wzAnimate(instance.element, index)
					this.loadFromData(item.children, instance.contents!)
				}
			} else {
				const data = mergeWithTemplate(item)
				if (data) {
					const instance = new WezzleInstance(data)
					if (instance.data.extendable)
						WezzleManager.instance.drake.containers.push(
							instance.contents!
						)
					instance.addTo(parent)

					wzAnimate(instance.element, index)
				}
			}
		})

		function wzAnimate(target: HTMLElement, index: number) {
			anime({
				targets: target,
				opacity: [0, 1],
				translateY: ['100%', '0%'],
				delay: index * 100,
				complete() {
					target.classList.remove('preloading')
					target.style.opacity = ''
					target.style.transform = ''
				},
			})
		}

		function mergeWithTemplate(data: ExportWezzleData): WezzleData | null {
			const template = util.cloneObject(
				templates.find(template => template.name === data.name) ?? {}
			) as WezzleData

			if (Object.entries(template).length === 0) return null

			data.properties.forEach(prop => {
				const p = template.properties.find(p => p.token === prop.token)
				if (p) p.value = prop.value
			})

			return template
		}
	}
}
