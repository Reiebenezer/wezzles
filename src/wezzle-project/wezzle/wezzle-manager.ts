/// <reference path="./.d.ts" />

/** # WEZZLE-MANAGER.TS
 * 
 * Handles the main wezzle application logic 
 * 
 * - Initializes the wezzle project page
 * - Handles wezzle parsing
 * - Handles wezzle logic
 */

// Imports the necessary libraries
import dragula from "dragula"
import autoScroll from "dom-autoscroller"
import Split from "split.js"
import anime from "animejs"

import Wezzle, { WezzleInstance } from "./wezzle"
import { WezzleData, WezzleGroup, parsedStringWezzle, parsedWezzle } from "./types"

import * as global from "../global"
import templates from "./templates"

import { KeyboardManager } from "../keyboard"
import { HistoryManager } from "../history"
import { FileManager } from "../filesystem"
import { toolbar } from "../toolbar"
import { shortcutJS } from "shortcutjs"

/** 
 * Wezzle Manager
 * 
 * The heart of the wezzles application
 * - Handles wezzle project loading
 * - Handles drag logic
 * - Handles real-time parsing
 */
export default class WezzleManager {

	/** Singleton instance */
	static #instance: WezzleManager

	/** Dragula drake (Wezzle Dragging API) */
	drake = dragula({
		
		// Enables copy wezzle on drag from template container
		copy: (_, source) => {
			return source === this.template_container
		},

		// Allows drag into the instance container (playground) 
		// and the extendable wezzles' containers
		accepts: (el, target) => {
			return (
				(target === this.instance_container ||
					target?.closest("#wz-playground") === this.instance_container) &&
				target !== this.property_container &&
				el !== undefined &&
				target !== undefined &&
				![...el.querySelectorAll(".contents")].includes(target)
			)
		},

		// Prevents dragging into the wezzle extender object
		invalid: (_, target) => {
			return target === undefined || target.classList.contains("wz-extender")
		},

		// Restricts drag events to wezzle elements only
		moves: el => {
			return (
				el !== undefined &&
				(el.classList.contains("wz") ||
					el.classList.contains("wz-extendable"))
			)
		},

		// Allows wezzle deletion on drag outside
		removeOnSpill: true,
	})

	/** ### Wezzle Toolbar panel
	 * Contains the toolbar buttons
	 */
	toolbar_container = document.getElementById("wz-toolbar")!

	/** ### Wezzle Groups Panel
	 * Contains the wezzle categories
	 */
	group_container = document.getElementById("wz-groups")!

	/** ### Wezzle Templates Panel
	 * Contains the different wezzle templates
	 */
	template_container = document.getElementById("wz-templates")!

	/** ### Wezzle Playground Panel
	 * The main area of the application
	 * User can place, arrange and remove wezzles here
	 */
	instance_container = document.getElementById("wz-playground")!

	/** ### Wezzle Preview Panel
	 * Previews the output of the wezzle project
	 */
	preview_container = document.getElementById("wz-preview")! as HTMLIFrameElement

	/** ### Wezzle Properties Panel
	 * Change wezzle properties here
	 */
	property_container = document.getElementById("wz-properties")!

	/** ### The split window instance
	 * Allows resizing the `preview_container` and `instance_container` panels horizontally
	 */
	#splitInstance?: Split.Instance

	/** ### Clipboard
	 * Stores copied wezzle data for paste later on
	 */
	#clipboard?: WezzleInstance

	/** **Singleton:** prevents creation of another instance */
	constructor() {
		if (WezzleManager.#instance)
			throw new ReferenceError("You cannot create another instance!")

		WezzleManager.#instance = this
	}

	/** **Singleton:** instance calls are made here */
	static get instance() {
		if (!WezzleManager.#instance)
			WezzleManager.#instance = new WezzleManager()
		return WezzleManager.#instance
	}

	/** Initialize the Wezzle Manager */
	async init() {
		this.#setupProject()
		this.#setupKeyboard()
		
		this.#setupPanel()
		// When user resizes the screen, panels are set up again
		if (visualViewport) visualViewport.onresize = () => this.#setupPanel()

		this.#setupClickEvents()
		this.#setupGroupsAndTemplates()
		this.#setupDrag()
		this.#setupAutoscroll()
		this.#setupObservers()

		return this
	}

	/** ### Setup Project
	 * Fetches the project saved in localStorage
	 */
	#setupProject() {
		FileManager.instance.getLocalProject()
	}

	/** 
	 * ### Setup Panel
	 * Initialize the panel layout and split window instance
	 * Initialize the toolbars
	 */
	async #setupPanel() {
		
		// Get the autosaved split window size
		const sizeData = localStorage.getItem("play-preview-sizes")

		// Set a default size if the autosave does not exist
		const sizes = sizeData ? JSON.parse(sizeData) : [33, 67]

		// Destroy the previous instance if it exists (prevents bugs)
		if (this.#splitInstance) this.#splitInstance.destroy()

		// Initialize the Split instance (for panel splitting)
		this.#splitInstance = Split(["#left-panel", this.preview_container], {
			direction:
				global.util.deviceOrientation() === "portrait"
					? "vertical"
					: "horizontal",
			sizes,
			minSize: global.util.deviceTypeByWidth() === "phone" ? 150 : 250,
			gutterSize:
				global.util.deviceTypeByWidth() === "desktop"
					? 30
					: global.util.deviceTypeByWidth() === "tablet"
					? 20
					: 10,
			onDragEnd(sizes) {
				localStorage.setItem("play-preview-sizes", JSON.stringify(sizes))
			},
		})

		// Instantiate the toolbars in the toolbar panel
		toolbar.forEach(item => {
			
			// Map the buttons to their corresponding keyboard shortcut action when clicked
			new global.util.ExtendedElement(
				document.getElementById(`toolbar-${item.name}`)!
			)
				.onclick(e => {
					if (typeof item.command === "string") {
						shortcutJS.actions
							.get(item.command)!
							.callbacks.forEach(callback => callback(e))
					} else item.command()
				})

		})
		
		// Disable the undo and redo buttons (as there are no history actions on startup)
		;(document.getElementById("toolbar-undo") as HTMLButtonElement)?.setAttribute('disabled', '')
		;(document.getElementById("toolbar-redo") as HTMLButtonElement)?.setAttribute('disabled', '')
	}

	/** 
	 * ### Setup Groups and Templates Panel
	 * Fetches the wezzle groups and templates from `templates.ts`
	 * and initializes them
	 */
	#setupGroupsAndTemplates() {
		
		// Get the text-based keys from the wezzle group enum
		const groups = Object.keys(WezzleGroup).filter(g => isNaN(Number(g)))

		// Sort the templates by group
		const sortedTemplates = templates.sort((a, b) => {
			if (a.group < b.group) return -1
			if (a.group > b.group) return 1
			return 0
		})

		// Instantiate the wezzle templates
		sortedTemplates.forEach(data => {
			
			// Create a new wezzle for each template and append it to the templates panel
			const wz = new Wezzle(data).addTo(this.template_container)

			// Create a copy of the wezzle and place it in `wezzle-playground`
			const add = () => {
				// Clone the element
				const cloned = wz.element.cloneNode(true) as HTMLElement

				// Add the cloned element to `wezzle-playground`
				this.instance_container.appendChild(cloned)

				// Add draggable functionality to cloned element
				this.#addDragContainerIfExtendable(cloned, this.drake)

				// Add undo and redo action to history entries
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

			// Execute `add` function on click and on keypress `Spacebar` and `Enter`
			wz.element.onclick = add
			wz.element.onkeydown = e => {
				if (e.code === "Space" || e.code === "Enter") add()
			}
		})

		// Add a button in `wezzle-group` panel for each group 
		// And scroll the `wezzle-templates` panel to the specific group on click
		this.group_container.prepend(
			...groups.map(
				groupName =>
					new global.util.ExtendedElement("button")
						.html(groupName)
						.onclick(() => {
							
							const groupIndex = new Map(
								Object.entries(WezzleGroup)
							).get(groupName)
							
							const el = [...Wezzle.instances.values()]
								.find(item => item.data.group === groupIndex && item.element.closest('#wz-playground') === null)!

							el.element.scrollIntoView({
									inline: "start",
									behavior: global.util.prefersReducedMotion
										? "instant"
										: "smooth",
								})
						}).element
			)
		)
	}

	#setupClickEvents() {
		// Open property panel when a wezzle is clicked
		// Close the property panel when it is clicked outside
		// Toggle the "selected" classname on the clicked wezzle
		document.addEventListener("click", e => {

			// Get the click target
			const target = e.target as HTMLElement

			// If the target is the playground panel itself
			if (target === this.instance_container) {

				// Do nothing if the properties panel is closed
				if (!this.property_container.classList.contains("active")) return

				// Close the property panel
				this.property_container.classList.remove("active")

				// Remove the "selected" classname from all wezzles in the playground
				this.instance_container
					.querySelector(".selected")?.classList.remove("selected")


			}
			
			// Otherwise, if the target is anything inside the playground
			else if (target.closest(`#${this.instance_container.id}`)) {

				// Do nothing if the target element is not a wezzle
				if (
					!(
						target.classList.contains("wz") ||
						target.classList.contains("wz-extendable")
					)
				)
					return

				// Remove the `selected` classname from all wezzles
				;[
					...this.instance_container.querySelectorAll(
						":is(.wz, .wz-extendable).selected"
					),
				]
					.filter(el => el !== target)
					.forEach(el => el.classList.remove("selected"))

				// Toggle the `selected` classname on the target element
				target.classList.toggle("selected")
			}
		})
	}

	/** 
	 * ### Setup Drag
	 * Add dragging functionality to the wezzle instances
	 */
	#setupDrag() {

		// Identify `templates` panel and `playground` panel as a drag container
		this.drake.containers.push(
			this.template_container,
			this.instance_container
		)
		
		// Add events on the dragula instance
		this.drake
		
			// A wezzle is dragged
			.on("drag", (el, source) => {

				// If the wezzle was dragged from the `templates` panel, do nothing
				if (source === this.template_container) return

				// Get the wezzle instance from the dragged element
				const instance = WezzleInstance.getInstance(el as HTMLElement)

				// Add current position to the list of positions for history
				instance.undoHistory.push({
					source,
					srcIndex: [...source.children].findIndex(item => item === el),
					dest: null,
					destIndex: null,
				})
			})

			// When the dragged wezzle was dropped
			.on("drop", (el, target, source) => {

				// If the wezzle is extendable, identify `contents` container as a drag container
				this.#addDragContainerIfExtendable(el, this.drake)

				// Get the wezzle instance
				const instance = WezzleInstance.getInstance(el as HTMLElement)

				// If the wezzle was dragged from the `templates` panel
				if (source === this.template_container) {

					// Register current position to history
					instance.undoHistory.push({
						source,
						srcIndex: Number.POSITIVE_INFINITY,
						dest: target,
						destIndex: [...target.children].findIndex(
							item => item === el
						),
					})
				} else {

					// Get the last position entry in the wezzle
					const hist =
						instance.undoHistory[instance.undoHistory.length - 1]
					
					// Update the last history entry to include the current position
					hist.dest = target
					hist.destIndex = [...target.children].findIndex(
						item => item === el
					)
				}
				// add undo and redo action to history entries
				HistoryManager.instance.add({
						undoAction: () => {
						if (source === this.template_container) {
							WezzleInstance.removeInstance(el as HTMLElement)

							const hist = instance.undoHistory.pop()
							if (hist) instance.redoHistory.push(hist)

							return
						}

						// Get the last wezzle position entry
						const hist = instance.undoHistory.pop()
						if (!hist) return

						// Get the element
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

						const sibling = hist.dest?.children.item(hist.destIndex ?? 0)

						if (sibling) hist.dest?.insertBefore(el, sibling)
						else hist.dest?.appendChild(el)

						instance.undoHistory.push(hist)
					},
				})
			})
			// Create a shadow to a wezzle instance
			// where the dragged wezzle instance can be applied to
			.on("shadow", (_, container) => {
				if (!container.classList.contains("contents")) return
				;(container as HTMLElement).style.maxHeight =
					(container as HTMLElement).offsetHeight * 2 +
					+getComputedStyle(container).padding.replace("px", "") +
					"px"
			})
			// Removing the wezzle instance when dragged and dropped outside the container
			.on("remove", (el, container) => {
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

						el.classList.remove("gu-hide")

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
		this.template_container.addEventListener("touchmove", e => {
			const target = e.targetTouches[0].target as HTMLElement
			if (
				target.classList.contains("wz") ||
				target.classList.contains("wz-extendable")
			) {
				e.preventDefault()
			}
		})
	}
	// Automatically scroll the playground when wezzles is dragged near an edge  of the container
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
			if (mutations.filter(mut => mut.attributeName !== 'class').length > 0)
				this.parse()


			// Property selection
			const selectedElement = this.instance_container.querySelector('.selected')
			const isActive = this.property_container.classList.contains("active")

			this.property_container.classList.toggle(
				"active",
				this.instance_container.querySelector(
					":is(.wz, .wz-extendable).selected"
				) !== null
			)
			
			if (!selectedElement) {
				this.property_container.innerHTML = ""
				return
			}

			const selectedWezzle = WezzleInstance.getInstance(
				selectedElement as HTMLElement
			)

			this.#handleProps(selectedWezzle)

			if (global.util.prefersReducedMotion) {
				;(selectedElement as HTMLElement).scrollIntoView({
					block: "nearest",
				})
			} else {
				this.property_container.ontransitionstart = () =>
					this.property_container.style.overflowY = ''

				this.property_container.ontransitionend = () => {
					this.property_container.style.overflowY = 'auto';

					(selectedElement as HTMLElement).scrollIntoView({
						behavior: "smooth",
						block: "nearest",
					})
				}

				if (!isActive) {
					anime({
						targets: [...this.property_container.children],
						opacity: [0, 1],
						translateX: ["100%", "0"],
						easing: "easeOutExpo",
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
				attributeFilter: ["class"],
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

				const firstElementVisible = activeElements.has(
					this.template_container.children.item(0) as HTMLElement
				)

				const wzGroup = firstElementVisible
					? Wezzle.getInstance(
							this.template_container.children.item(0) as HTMLElement
					  )?.data.group
					: sortedInstances.slice(-1)[0].data.group

				;[...this.group_container.children].forEach((el, index) =>
					el.classList.toggle("active", index === wzGroup)
				)
			},
			{
				threshold: 1,
			}
		)

		;[...this.template_container.children].forEach((template, index) => {
			anime({
				targets: template,
				opacity: [0, 1],
				translateY: ["100%", "0%"],
				delay: index * 100,
				complete() {
					scrollObserver.observe(template)
					template.classList.remove("preloading")
					;(template as HTMLElement).style.opacity = ""
					;(template as HTMLElement).style.transform = ""
				},
			})
		})
	}

	#setupKeyboard() {
		// Paste action
		const clone = (
			wz: WezzleInstance,
			parent: HTMLElement,
			before?: HTMLElement
		) => {
			const newElement = wz.element.cloneNode(true) as HTMLElement
			const contents = newElement.querySelector(
				":scope > .wz-extender > .contents"
			) as HTMLElement

			const newInstance = new WezzleInstance(newElement)

			newInstance.data = global.util.cloneObject(wz.data) as WezzleData
			newInstance.text.innerHTML = wz.text.innerHTML

			newElement.classList.remove("selected")
			newInstance.addTo(parent, before)

			if (!contents) return newInstance

			contents.innerHTML = ""
			contents.parentElement?.classList.remove("expanded")

			this.drake?.containers.push(contents)

			const children = wz.element.querySelectorAll(
				":scope > .wz-extender > .contents > :is(.wz, .wz-extendable)"
			)

			children.forEach(child =>
				clone(WezzleInstance.getInstance(child as HTMLElement), contents)
			)

			return newInstance
		}

		// Handle wezzle actions
		KeyboardManager.instance
			.init()
			.on("paste", e => {
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
				// console.log('Pasted Wezzle')
			})
			// Copy action
			.on("copy", () => {
				if (getSelection()?.toString()) return

				const selected = this.instance_container.querySelector(".selected")
				if (!selected) return

				this.#clipboard = WezzleInstance.getInstance(
					selected as HTMLElement
				)

				// console.log('Copied Wezzle')
			})
			// Cut action
			.on("cut", () => {
				if (getSelection()?.toString()) return

				const selected = this.instance_container.querySelector(".selected")
				if (!selected) return

				this.#clipboard = WezzleInstance.getInstance(
					selected as HTMLElement
				)

				const instance = WezzleInstance.getInstance(selected as HTMLElement)
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

				// console.log('Cut Wezzle')
			})
			// Duplicate
			.on("duplicate", ev => {
				ev.preventDefault()

				if (getSelection()?.toString()) return

				const selected = this.instance_container.querySelector(
					".selected"
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

				// console.log('Duplicated Wezzle')
			})

			.on("undo", () => HistoryManager.instance.undo())
			.on("redo", () => HistoryManager.instance.redo())
	}
	// Adds a extender wezzle instance to the instance if applicable
	#addDragContainerIfExtendable(el: Element, drake?: dragula.Drake) {
		const instance = WezzleInstance.getInstance(el as HTMLElement)
		const extender = instance?.element.querySelector(
			":scope > .wz-extender"
		) as HTMLElement

		const extenderContainer = extender?.querySelector(
			":scope > .contents"
		) as HTMLElement

		if (extenderContainer && !drake?.containers.includes(extenderContainer)) {
			drake?.containers.push(extenderContainer)
		}
	}

	parse() {
		const children = [
			...this.instance_container.querySelectorAll(
				":scope > :is(.wz, .wz-extendable)"
			),
		] as HTMLElement[]

		// console.error('parse!')

		const parsed = FileManager.instance.getWezzleOrder(children)

		const parsedElements = document.createElement("div")
		updatePreview(parsed, parsedElements)
		parseStyles(parsedElements)
		parseAttributes(parsedElements)
		
		
		this.preview_container.contentDocument!.body.innerHTML = ""
		this.preview_container.contentDocument!.body.append(...parsedElements.childNodes)
		
		parseScripts(this.preview_container.contentDocument!.body)

		global.dev.logJSON(parsed.map(getParsedName))

		FileManager.instance.saveLocalProject()

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
						: new global.util.ExtendedElement(wz.parent.data.parsed_name)

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
					case "Text Content":
						el.html(prop.value ?? "")
						break

					case "Initial Value":
						if (prop.input_type === "multiline-text")
							el.html(prop.value ?? "")
						else if (prop.input_type === "select")
							el.children
								.find(item => item.getProp("value") === prop.value)
								?.setProp("selected", "true")
						else el.setProp("value", prop.value ?? "")

						break

					case "Placeholder":
						el.setProp(
							"placeholder",
							prop.value || "<" + wezzle.data.name + ">"
						)
						break

					case "Orientation":
						if (!prop.value || prop.value === "auto") break

						el.setStyle("display", "flex").setStyle(
							"flex-direction",
							prop.value === "horizontal" ? "row" : "column"
						)

						break
					case "Style Type":
						el.setProp("data-name", prop.value ?? "")
						break

					case "Style Value":
						el.setProp("data-value", prop.value ?? "")
						break

					case "Value (Units)":
						el.setProp(
							"data-value",
							(prop.value ?? 0).toString() +
							(global.util.getUserSettings().get('useRemsInsteadOfPixels')
							? "rem"
							: "px")
						)
						break

					case "Input Type":
						el.setProp("type", prop.value ?? "text")
						break

					case 'Image File':
						el.setProp('src', prop.value ?? '')
						break

					case 'Alternative Caption':
						el.setProp('alt', prop.value ?? '')
						break

					case 'ID Name':
						el.setProp('data-id', prop.value ?? '')
						break

					case 'Command':
						el.setProp('data-command', prop.value ?? '')
						break

					case 'Class Name':
						el.setProp('data-classname', prop.value ?? '')
						break
						
					case 'Element ID(s)':
						el.setProp('data-elements', prop.value ?? '')
						break

					case 'Trigger Event':
						el.setProp('data-event', prop.value ?? '')
						break
				}
			})
		}

		function parseStyles(parsedElement: HTMLElement) {
			const styleTags = parsedElement.querySelectorAll("style")

			styleTags.forEach(style => {
				const nearestElement = global.util.findElementMatch(
					style,
					"previous",
					el => 
						el.tagName.toLowerCase() !== "wz-identifiers" && 
						el.tagName.toLowerCase() !== "style" &&
						el.tagName.toLowerCase() !== "wz-logic"
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

		function parseAttributes(parsedElement: HTMLElement) {
			const scriptIdentifiers = [...parsedElement.querySelectorAll('wz-identifiers')] as HTMLElement[]

			scriptIdentifiers.forEach(identifier => {
				const nearestElement = global.util.findElementMatch(
					identifier,
					"previous",
					el => 
						el.tagName.toLowerCase() !== "wz-identifiers" && 
						el.tagName.toLowerCase() !== "style" &&
						el.tagName.toLowerCase() !== "wz-logic"
				) as HTMLElement

				if (nearestElement === null) return
				if (identifier.dataset.id) {
					nearestElement.id = identifier.dataset.id
				}

				else if (identifier.dataset.classname) {
					nearestElement.classList.add(identifier.dataset.classname)
				}
			})

			scriptIdentifiers.forEach(tag => tag.remove())
		}

		function parseScripts(parsedElement: HTMLElement) {
			const scriptLogicElements = [...parsedElement.querySelectorAll('wz-logic')] as HTMLElement[]

			scriptLogicElements.forEach(script => {
				const nearestElement = global.util.findElementMatch(
					script,
					"previous",
					el => 
						el.tagName.toLowerCase() !== "wz-identifiers" && 
						el.tagName.toLowerCase() !== "style" &&
						el.tagName.toLowerCase() !== "wz-logic"
				) as HTMLElement
				if (nearestElement === null) return

				const { command, elements: elementArr, event } = script.dataset
				if (!command || !elementArr || !event) return

				const IDs = elementArr.split(",").map(str => str.trim())
				const handler = () => {
					switch(command) {
						case 'replace-with':
							if (IDs.length > 1) {
								const el0 = WezzleManager.instance.preview_container.contentDocument!.getElementById(IDs[0])
								const el1 = WezzleManager.instance.preview_container.contentDocument!.getElementById(IDs[1])
	
								if (el0 && el1)
									el0.innerHTML = el1.innerHTML
							}
					}
				}
				
				// console.log(command, IDs, event)
				if (event === 'eager')
					handler()
				
				else nearestElement.addEventListener(event, handler)
			})
		}
	}

	#handleProps(instance: WezzleInstance) {
		this.property_container.innerHTML = ""
		const properties = instance.data.properties

		let isprocessing = false

		properties.forEach(property => {
			let el: global.util.ExtendedInputElement
			const additionalElements = []

			const update = (val: string) => {
				const oldValue = property.value ?? ""
				property.value = val

				this.parse()

				if (!isprocessing) {
					isprocessing = true
					const addUndoState = async (
						oldvalue: string,
						input: global.util.ExtendedInputElement
					) => {
						await new Promise(resolve => setTimeout(resolve, 700))

						const newValue = (input.element as HTMLInputElement).value

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
				case "text":
					el = new global.util.ExtendedInputElement("input")
						.setProp("type", "text")
						.bind(property.value, update)
					break
				case "multiline-text":
					el = new global.util.ExtendedInputElement("textarea").bind(
						property.value,
						update
					)
					break
				case "number":
					el = new global.util.ExtendedInputElement("input")
						.setProp("type", "number")
						.bind(property.value, update)
					break
				case "select":
					el = new global.util.ExtendedInputElement("select")
					if (
						property.options === undefined ||
						property.options.length === 0
					)
						el.append(
							new global.util.ExtendedElement("option")
								.html("<No option added>")
								.setProp("disabled", "true")
								.setProp("selected", "true")
						)
					else {
						property.options.forEach(opt =>
							el.append(
								new global.util.ExtendedElement("option")
									.html(opt.display_text)
									.id(opt.value)
									.setProp("value", opt.value)
							)
						)
					}
					;(el as global.util.ExtendedInputElement).bind(
						property.value,
						update
					)
					break

				case "text-with-datalist":
					const uniqID = Math.random().toString(16).substring(2, 8)
					el = new global.util.ExtendedInputElement("input")
						.setProp("type", "text")
						.setProp("list", "datalist-" + uniqID)
						.bind(property.value, update)

					if (
						property.options !== undefined &&
						property.options.length > 0
					) {
						additionalElements.push(
							new global.util.ExtendedElement("datalist")
								.id("datalist-" + uniqID)
								.append(
									...property.options.map(opt =>
										new global.util.ExtendedElement("option")
											.html(opt.display_text)
											.setProp("value", opt.value)
									)
								)
						)
					}
					break

				case 'color':
					el = new global.util.ExtendedInputElement("input")
						.setProp("type", "color")
						.bind(property.value, update)
					break

				case 'file':
					el = new global.util.ExtendedInputElement('input')
						.setProp('type', 'file')

					;(el.element as HTMLInputElement).onchange = () => {
						const files = (el.element as HTMLInputElement).files

						if (!files || !files[0]) return

						const reader = new FileReader()
						reader.onload = () => {
							update(reader.result as string)
						}
						reader.readAsDataURL(files[0])
					}

					break
				
			}

			let label = new global.util.ExtendedElement("label")
				.html(
					property.token === "Value (Units)"
						? `Value (${
								global.util.getUserSettings().get('useRemsInsteadOfPixels') ? "rem" : "px"
						  })`
						: property.token
				)
				.append(el)
			
			this.property_container.appendChild(label.element)
			this.property_container.append(
				...additionalElements.map(el => el.element)
			)
		})
	}
}
