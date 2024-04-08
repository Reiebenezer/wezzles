/// <reference path="./.d.ts" />

import dragula from 'dragula'
import autoScroll from 'dom-autoscroller'
import Split from 'split.js'
import anime from 'animejs'

import Wezzle, { WezzleInstance } from './wezzle'
import { WezzleGroup, parsedStringWezzle, parsedWezzle } from './types'

import * as global from '../global'
import templates from './templates'

import { KeyboardManager } from '../keyboard'
import { HistoryManager } from '../history'
import { FileManager } from '../filesystem'
import { toolbar } from '../toolbar'
import { shortcutJS } from 'shortcutjs'

export default class WezzleManager {
	static #instance: WezzleManager

	drake?: dragula.Drake

	toolbar_container  = document.getElementById('wz-toolbar')!
	group_container    = document.getElementById('wz-groups')!
	template_container = document.getElementById('wz-templates')!
	instance_container = document.getElementById('wz-playground')!
	preview_container  = document.getElementById('wz-preview')! as HTMLIFrameElement
	property_container = document.getElementById('wz-properties')!

	#splitInstance?: Split.Instance
	#clipboard?: WezzleInstance

	constructor() {
		if (WezzleManager.#instance)
			throw new ReferenceError('You cannot create another instance!')

		WezzleManager.#instance = this
	}

	static get instance() {
		if (!WezzleManager.#instance)
			WezzleManager.#instance = new WezzleManager()
		return WezzleManager.#instance
	}

	init() {
		// Set up panels
		this.#setupPanel()

		// When user resizes the screen, panels are set up again
		if (visualViewport) visualViewport.onresize = () => this.#setupPanel()

		this.#setupClickEvents()
		this.#setupGroupsAndTemplates()

		this.#setupDrag()
		this.#setupAutoscroll()
		this.#setupObservers()

		this.#setupKeyboard()

		return this
	}

	#setupPanel() {
		const sizeData = localStorage.getItem('play-preview-sizes')
		const sizes = sizeData ? JSON.parse(sizeData) : [33, 67]

		if (this.#splitInstance) this.#splitInstance.destroy()
		this.#splitInstance = Split(['#left-panel', this.preview_container], {
			direction:
				global.util.deviceOrientation() === 'portrait'
					? 'vertical'
					: 'horizontal',
			sizes,
			minSize: global.util.deviceTypeByWidth() === 'phone' ? 150 : 250,
			gutterSize:
				global.util.deviceTypeByWidth() === 'desktop'
					? 30
					: global.util.deviceTypeByWidth() === 'tablet'
					? 20
					: 10,
			onDragEnd(sizes) {
				localStorage.setItem(
					'play-preview-sizes',
					JSON.stringify(sizes)
				)
			},
		})

		toolbar.forEach(item => {
			if (document.getElementById('toolbar-' + item.name)) return

			const button = 
				new global.util.ExtendedElement('button')
					.id('toolbar-' + item.name)
					.append(
						new global.util.ExtendedElement('span')
							.class('ph', item.icon)
							.setProp('title', item.description ?? '')
							.setProp('weight', 'bold')
							.setProp('size', '1rem')
					).onclick(e => {
						if (typeof item.command === 'string') {
							shortcutJS.actions
								.get(item.command)!
								.callbacks.forEach(callback => callback(e))
						}

						else item.command()
					})

			this.toolbar_container.appendChild(button.element)
		})

		;(document.getElementById('toolbar-undo') as HTMLButtonElement).disabled = true
		;(document.getElementById('toolbar-redo') as HTMLButtonElement).disabled = true
	}

	#setupGroupsAndTemplates() {
		// Initialize Wezzles by group
		const groups = Object.keys(WezzleGroup).filter(g => isNaN(Number(g)))

		const sortedTemplates = templates.sort((a, b) => {
			if (a.group < b.group) return -1
			if (a.group > b.group) return 1
			return 0
		})

		sortedTemplates.forEach(data => {
			const wz = new Wezzle(data).addTo(this.template_container)
			const add = () => {
				const cloned = wz.element.cloneNode(true) as HTMLElement
				this.instance_container.appendChild(cloned)

				this.#addInstance(cloned, this.drake)
				HistoryManager.instance.add({
					undoAction: () => {
						WezzleInstance.removeInstance(cloned)
					},
					redoAction: () => {
						WezzleInstance.getInstance(cloned).addTo(
							this.instance_container,
							cloned.nextElementSibling as HTMLElement
						)
					},
				})
			}
			wz.element.onclick = add
			wz.element.onkeydown = e => {
				if (e.code === 'Space' || e.code === 'Enter') add()
			}
		})

		// Add group buttons and scrolling
		this.group_container.prepend(
			...groups.map(
				groupName =>
					new global.util.ExtendedElement('button')
						.html(groupName)
						.onclick(() => {
							const groupIndex = new Map(
								Object.entries(WezzleGroup)
							).get(groupName)

							;[...Wezzle.instances.values()]
								.find(item => item.data.group === groupIndex)
								?.element.scrollIntoView({
									inline: 'start',
									behavior: global.util.prefersReducedMotion
										? 'instant'
										: 'smooth',
								})
						}).element
			)
		)
	}

	#setupClickEvents() {
		// Remove selected state on property panel on click outside
		document.addEventListener('click', e => {
			const target = e.target as HTMLElement

			if (target === this.instance_container) {
				if (!this.property_container.classList.contains('active'))
					return

				this.property_container.classList.remove('active')
				this.instance_container
					.querySelector('.selected')
					?.classList.remove('selected')
			} else if (target.closest(`#${this.instance_container.id}`)) {
				if (
					!(
						target.classList.contains('wz') ||
						target.classList.contains('wz-extendable')
					)
				)
					return
				;[
					...this.instance_container.querySelectorAll(
						':is(.wz, .wz-extendable).selected'
					),
				]
					.filter(el => el !== target)
					.forEach(el => el.classList.remove('selected'))

				target.classList.toggle('selected')
			}
		})
	}

	#setupDrag() {
		this.drake = dragula(
			[this.template_container, this.instance_container],
			{
				copy: (_, source) => {
					return source === this.template_container
				},
				accepts: (el, target) => {
					return (
						(target === this.instance_container ||
							target?.closest('#wz-playground') ===
								this.instance_container) &&
						target !== this.property_container &&
						el !== undefined &&
						target !== undefined &&
						![...el.querySelectorAll('.contents')].includes(target)
					)
				},
				invalid: (_, target) => {
					return (
						target === undefined ||
						target.classList.contains('wz-extender')
					)
				},
				moves: el => {
					return (
						el !== undefined &&
						(el.classList.contains('wz') ||
							el.classList.contains('wz-extendable'))
					)
				},
				removeOnSpill: true,
			}
		)

		this.drake
			.on('drag', (el, source) => {
				if (source === this.template_container) return

				const instance = WezzleInstance.getInstance(el as HTMLElement)
				instance.undoHistory.push({
					source,
					srcIndex: [...source.children].findIndex(
						item => item === el
					),
					dest: null,
					destIndex: null,
				})
			})
			.on('drop', (el, target, source) => {
				this.#addInstance(el, this.drake)

				const instance = WezzleInstance.getInstance(el as HTMLElement)
				if (source === this.template_container) {
					instance.undoHistory.push({
						source,
						srcIndex: Number.POSITIVE_INFINITY,
						dest: target,
						destIndex: [...target.children].findIndex(
							item => item === el
						),
					})
				} else {
					const hist =
						instance.undoHistory[instance.undoHistory.length - 1]

					hist.dest = target
					hist.destIndex = [...target.children].findIndex(
						item => item === el
					)
				}

				HistoryManager.instance.add({
					undoAction: () => {
						if (source === this.template_container) {
							WezzleInstance.removeInstance(el as HTMLElement)

							const hist = instance.undoHistory.pop()
							if (hist) instance.redoHistory.push(hist)

							return
						}

						const hist = instance.undoHistory.pop()
						if (!hist) return

						const sibling = hist.source.children.item(
							hist.srcIndex +
								(hist.srcIndex <= (hist.destIndex ?? 0) ? 0 : 1)
						)

						if (sibling) hist.source.insertBefore(el, sibling)
						else hist.source.appendChild(el)

						instance.redoHistory.push(hist)
					},
					redoAction: () => {
						if (source === this.template_container) {
							WezzleInstance.instances.add(instance)
						}

						const hist = instance.redoHistory.pop()
						if (!hist) return

						const sibling = hist.dest?.children.item(
							hist.destIndex ?? 0
						)

						if (sibling) hist.dest?.insertBefore(el, sibling)
						else hist.dest?.appendChild(el)

						instance.undoHistory.push(hist)
					},
				})
			})
			.on('shadow', (_, container) => {
				if (!container.classList.contains('contents')) return
				;(container as HTMLElement).style.maxHeight =
					(container as HTMLElement).offsetHeight * 2 +
					+getComputedStyle(container).padding.replace('px', '') +
					'px'
			})
			.on('remove', (el, container) => {
				const instance = WezzleInstance.getInstance(el as HTMLElement)
				WezzleInstance.instances.delete(instance)

				HistoryManager.instance.add({
					undoAction: () => {
						WezzleInstance.instances.add(instance)

						const hist = instance.undoHistory.pop()
						if (!hist) return

						const index = container.children.item(hist.srcIndex)

						index
							? container.insertBefore(el, index)
							: container.appendChild(el)

						el.classList.remove('gu-hide')

						instance.redoHistory.push(hist)
					},
					redoAction: () => {
						WezzleInstance.removeInstance(instance.element)

						const hist = instance.redoHistory.pop()
						if (!hist) return

						instance.undoHistory.push(hist)
					},
				})
			})

		// Touch devices
		this.template_container.addEventListener('touchmove', e => {
			const target = e.targetTouches[0].target as HTMLElement
			if (
				target.classList.contains('wz') ||
				target.classList.contains('wz-extendable')
			) {
				e.preventDefault()
			}
		})
	}

	#setupAutoscroll() {
		if (!this.drake) return

		const drake = this.drake

		autoScroll(this.drake.containers, {
			margin: 30,
			maxSpeed: 6,
			scrollWhenOutside: false,
			autoScroll: function () {
				return this.down && drake.dragging
			},
		})
	}

	#setupObservers() {
		const mutObserver = new MutationObserver(mutations => {
			this.parse()

			// Property selection
			const selectedElement = mutations
				.map(mut => mut.target)
				.filter(el =>
					(el as HTMLElement).classList.contains('selected')
				)[0]

			const isActive =
				this.property_container.classList.contains('active')

			this.property_container.classList.toggle(
				'active',
				this.instance_container.querySelector(
					':is(.wz, .wz-extendable).selected'
				) !== null
			)

			if (!selectedElement) {
				this.property_container.innerHTML = ''
				return
			}

			const selectedWezzle = WezzleInstance.getInstance(
				selectedElement as HTMLElement
			)
			this.#handleProps(selectedWezzle)

			if (global.util.prefersReducedMotion) {
				;(selectedElement as HTMLElement).scrollIntoView({
					block: 'nearest',
				})
			} else {
				this.property_container.ontransitionend = () =>
					(selectedElement as HTMLElement).scrollIntoView({
						behavior: 'smooth',
						block: 'nearest',
					})

				if (!isActive) {
					anime({
						targets: [...this.property_container.children],
						opacity: [0, 1],
						translateX: ['100%', '0'],
						easing: 'easeOutExpo',
						duration: 500,
						delay: anime.stagger(100, { start: 350 }),
					})
				}
			}
		})

		for (const container of this.drake!.containers) {
			mutObserver.observe(container, {
				childList: true,
				subtree: true,
				attributeFilter: ['class'],
			})
		}

		// Add active group state on scroll
		const activeElements = new Set<HTMLElement>()

		const scrollObserver = new IntersectionObserver(
			entries => {
				for (const entry of entries) {
					if (entry.isIntersecting)
						activeElements.add(entry.target as HTMLElement)
					else activeElements.delete(entry.target as HTMLElement)
				}

				const sortedInstances = (
					[...activeElements.values()]
						.map(el => Wezzle.getInstance(el))
						.filter(wz => wz !== undefined) as Wezzle[]
				).sort((a, b) => a.data.group - b.data.group)

				if (sortedInstances.length === 0) return

				const firstElementVisible =
					entries[0].isIntersecting &&
					entries[0].target ===
						this.template_container.children.item(0)

				const wzGroup = firstElementVisible
					? Wezzle.getInstance(
							this.template_container.children.item(
								0
							) as HTMLElement
					  )?.data.group
					: sortedInstances.slice(-1)[0].data.group

				;[...this.group_container.children].forEach((el, index) =>
					el.classList.toggle('active', index === wzGroup)
				)
			},
			{
				threshold: 1,
			}
		)

		for (const template of this.template_container.children) {
			scrollObserver.observe(template)
		}
	}

	#setupKeyboard() {
		KeyboardManager.instance.init()

		// Paste action
		const clone = (
			wz: WezzleInstance,
			parent: HTMLElement,
			before?: HTMLElement
		) => {
			const newElement = wz.element.cloneNode(true) as HTMLElement
			const contents = newElement.querySelector(
				':scope > .wz-extender > .contents'
			) as HTMLElement

			const newInstance = new WezzleInstance(newElement)

			newInstance.data = global.util.cloneObject(wz.data)
			newInstance.text.innerHTML = wz.text.innerHTML

			newElement.classList.remove('selected')
			newInstance.addTo(parent, before)

			if (!contents) return newInstance

			contents.innerHTML = ''
			contents.parentElement?.classList.remove('expanded')

			this.drake?.containers.push(contents)

			const children = wz.element.querySelectorAll(
				':scope > .wz-extender > .contents > :is(.wz, .wz-extendable)'
			)

			children.forEach(child =>
				clone(
					WezzleInstance.getInstance(child as HTMLElement),
					contents
				)
			)

			return newInstance
		}

		// Handle wezzle actions
		KeyboardManager.instance
			.on('paste', e => {
				if (!this.#clipboard) return
				if (document.activeElement !== document.body) return

				e.preventDefault()

				const cloned = clone(this.#clipboard, this.instance_container)
				let parent = cloned.element.parentElement

				HistoryManager.instance.add({
					undoAction: () => {
						WezzleInstance.removeInstance(cloned.element)
					},
					redoAction: () => {
						WezzleInstance.instances.add(cloned)
						parent?.appendChild(cloned.element)
					},
				})
				console.log('Pasted Wezzle')
			})

			.on('copy', () => {
				if (getSelection()?.toString()) return

				const selected =
					this.instance_container.querySelector('.selected')
				if (!selected) return

				this.#clipboard = WezzleInstance.getInstance(
					selected as HTMLElement
				)

				console.log('Copied Wezzle')
			})

			.on('cut', () => {
				if (getSelection()?.toString()) return

				const selected =
					this.instance_container.querySelector('.selected')
				if (!selected) return

				this.#clipboard = WezzleInstance.getInstance(
					selected as HTMLElement
				)

				const instance = WezzleInstance.getInstance(
					selected as HTMLElement
				)
				const hist = instance.undoHistory.pop()

				console.log(instance, hist)

				const sibling = hist?.dest?.children.item(
					(hist?.destIndex ?? -2) + 1
				)

				WezzleInstance.removeInstance(selected as HTMLElement)

				HistoryManager.instance.add({
					undoAction: () => {
						console.log(hist)
						if (hist && hist.dest) {
							this.#clipboard?.addTo(
								hist.dest as HTMLElement,
								sibling ?? undefined
							)

							this.#clipboard?.undoHistory.push(hist)
							instance.undoHistory.push(hist)
						}

						this.#clipboard = undefined
					},
					redoAction: () => {
						this.#clipboard = instance
						WezzleInstance.removeInstance(selected as HTMLElement)
					},
				})

				console.log('Cut Wezzle')
			})

			.on('duplicate', ev => {
				ev.preventDefault()

				if (getSelection()?.toString()) return

				const selected = this.instance_container.querySelector(
					'.selected'
				) as HTMLElement
				if (!selected) return

				const instance = WezzleInstance.getInstance(selected)

				let cloned = clone(
					instance,
					selected.parentElement as HTMLElement,
					selected.nextElementSibling as HTMLElement
				)

				HistoryManager.instance.add({
					undoAction: () => {
						WezzleInstance.removeInstance(cloned.element)
					},
					redoAction: () => {
						cloned = clone(
							instance,
							selected.parentElement as HTMLElement,
							selected.nextElementSibling as HTMLElement
						)
					},
				})

				console.log('Duplicated Wezzle')
			})

			.on('undo', () => HistoryManager.instance.undo())
			.on('redo', () => HistoryManager.instance.redo())
	}

	#addInstance(el: Element, drake?: dragula.Drake) {
		const instance = WezzleInstance.getInstance(el as HTMLElement)
		const extender = instance?.element.querySelector(
			':scope > .wz-extender'
		) as HTMLElement

		const extenderContainer = extender?.querySelector(
			':scope > .contents'
		) as HTMLElement

		if (
			extenderContainer &&
			!drake?.containers.includes(extenderContainer)
		) {
			drake?.containers.push(extenderContainer)
		}
	}

	parse() {
		const children = [
			...this.instance_container.querySelectorAll(
				':scope > :is(.wz, .wz-extendable)'
			),
		] as HTMLElement[]

		const parsed = FileManager.instance.getWezzleOrder(children)

		const parsedElements = document.createElement('div')
		updatePreview(parsed, parsedElements)
		parseStyles(parsedElements)

		this.preview_container.contentDocument!.body.innerHTML =
			parsedElements.innerHTML

		global.dev.logJSON(parsed.map(getParsedName))

		function getParsedName(wz: parsedWezzle): parsedStringWezzle {
			return wz instanceof WezzleInstance
				? wz.data.parsed_name
				: {
						parent: wz.parent.data.parsed_name,
						children: wz.children.map(getParsedName),
				  }
		}

		function updatePreview(arr: parsedWezzle[], el: Element) {
			arr.forEach(wz => {
				const parsedElement =
					wz instanceof WezzleInstance
						? new global.util.ExtendedElement(wz.data.parsed_name)
						: new global.util.ExtendedElement(
								wz.parent.data.parsed_name
						  )

				el.appendChild(parsedElement.element)
				parseProps(
					wz instanceof WezzleInstance ? wz : wz.parent,
					parsedElement
				)

				if (wz instanceof WezzleInstance === false) {
					updatePreview(wz.children, parsedElement.element)
				}
			})
		}

		function parseProps(
			wezzle: WezzleInstance,
			el: global.util.ExtendedElement
		) {
			wezzle.data.properties.forEach(prop => {
				switch (prop.token) {
					case 'Text Content':
						el.html(prop.value ?? '')
						break

					case 'Initial Value':
						if (prop.input_type === 'multiline-text')
							el.html(prop.value ?? '')
						else if (prop.input_type === 'select')
							el.children
								.find(
									item => item.getProp('value') === prop.value
								)
								?.setProp('selected', 'true')
						else el.setProp('value', prop.value ?? '')

						break

					case 'Placeholder':
						el.setProp(
							'placeholder',
							prop.value || '<' + wezzle.data.name + '>'
						)
						break

					case 'Alignment':
						if (!prop.value || prop.value === 'auto') break

						el.setStyle('display', 'flex').setStyle(
							'flex-direction',
							prop.value === 'horizontal' ? 'row' : 'column'
						)

						break
					case 'Style Name':
						el.setProp('data-name', prop.value ?? '')
						break

					case 'Style Value':
						el.setProp('data-value', prop.value ?? '')
						break

					case 'Input Type':
						el.setProp('type', prop.value ?? 'text')
				}
			})
		}

		function parseStyles(parsedElement: HTMLElement) {
			const styleTags = parsedElement.querySelectorAll('style')

			styleTags.forEach(style => {
				const nearestElement = global.util.findElementMatch(
					style,
					'previous',
					el => el.tagName !== 'style'
				)

				if (nearestElement === null) {
				} else if (style.dataset.name && style.dataset.value) {
					const modifiedName = global.util.camelToDisplay(
						style.dataset.name
					)

					;(nearestElement as HTMLElement).style.setProperty(
						modifiedName,
						style.dataset.value
					)
				}

				style.remove()
			})
		}
	}

	#handleProps(instance: WezzleInstance) {
		this.property_container.innerHTML = ''
		const properties = instance.data.properties

		let isprocessing = false

		properties.forEach(property => {
			let el: global.util.ExtendedInputElement
			const additionalElements = []

			const update = (val: string) => {
				const oldValue = property.value ?? ''
				property.value = val

				this.parse()

				if (!isprocessing) {
					isprocessing = true
					const addUndoState = async (
						oldvalue: string,
						input: global.util.ExtendedInputElement
					) => {
						await new Promise(resolve => setTimeout(resolve, 700))

						const newValue = (input.element as HTMLInputElement)
							.value

						console.log(newValue)

						HistoryManager.instance.add({
							undoAction: () => {
								property.value = oldvalue
								input.bind(oldvalue, update)
								this.parse()
							},
							redoAction: () => {
								property.value = newValue
								input.bind(newValue, update)
								this.parse()
							},
						})
					}

					addUndoState(oldValue, el)
						.then(() => (isprocessing = false))
						.catch(err => {
							console.error(err)
							isprocessing = false
						})
				}
			}

			switch (property.input_type) {
				case 'text':
					el = new global.util.ExtendedInputElement('input')
						.setProp('type', 'text')
						.bind(property.value, update)
					break
				case 'multiline-text':
					el = new global.util.ExtendedInputElement('textarea').bind(
						property.value,
						update
					)
					break
				case 'number':
					el = new global.util.ExtendedInputElement('input')
						.setProp('type', 'number')
						.bind(property.value, update)
					break
				case 'select':
					el = new global.util.ExtendedInputElement('select')
					if (
						property.options === undefined ||
						property.options.length === 0
					)
						el.append(
							new global.util.ExtendedElement('option')
								.html('<No option added>')
								.setProp('disabled', 'true')
								.setProp('selected', 'true')
						)
					else {
						property.options.forEach(opt =>
							el.append(
								new global.util.ExtendedElement('option')
									.html(opt.display_text)
									.id(opt.value)
									.setProp('value', opt.value)
							)
						)
					}
					;(el as global.util.ExtendedInputElement).bind(
						property.value,
						update
					)
					break

				case 'text-with-datalist':
					const uniqID = Math.random().toString(16).substring(2, 8)
					el = new global.util.ExtendedInputElement('input')
						.setProp('type', 'text')
						.setProp('list', 'datalist-' + uniqID)
						.bind(property.value, update)

					if (
						property.options !== undefined &&
						property.options.length > 0
					) {
						additionalElements.push(
							new global.util.ExtendedElement('datalist')
								.id('datalist-' + uniqID)
								.append(
									...property.options.map(opt =>
										new global.util.ExtendedElement(
											'option'
										)
											.html(opt.display_text)
											.setProp('value', opt.value)
									)
								)
						)
					}
			}

			let label = new global.util.ExtendedElement('label')
				.html(property.token)
				.append(el)

			this.property_container.appendChild(label.element)
			this.property_container.append(
				...additionalElements.map(el => el.element)
			)
		})
	}
}
