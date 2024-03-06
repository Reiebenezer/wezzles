import {
	ANIMATION_TIME,
	DEFAULT_ANIMATION,
	DEFAULT_GAP,
	FOLLOW_WEZZLE,
} from './config'
import { getBounds, notify } from './functions'
import { a_an } from './typing'
import { AnimationTypes, PLAYGROUND } from './global'
import { playgroundItems } from './global'
import { puzzleOptions } from './global'
import { hideProperties, showProperties } from './sort/properties'

/**
 * Prevents handling of logic while this is true
 * @type {boolean}
 */
export let currentlyAnimating = false

/**
 * A temporary container that handles element shifting
 * @type {HTMLElement} */
const shiftAnimationRect = document.getElementById('wz-shift-animation')!

/**
 * A temporary container that handles size changes
 * @type {HTMLElement}
 */
const resizeAnimationRect = document.getElementById('wz-resize-animation')!

/**
 * A temporary container that handles insertion
 * @type {HTMLElement}
 */
const insertContainer = document.getElementById('wz-insert-animation')!

/**
 * Removes the currently dragged element from the playground
 * @param source the element being dragged on
 * @param doAfter after the element is deleted, do this function
 */
export function goToTrash(source: HTMLElement, doAfter: Function) {
	currentlyAnimating = true

	const trashButton = document.getElementById('wz-delete-icon')!
	const trashBounds = getBounds(trashButton)
	const sourceBounds = getBounds(source)

	// Destination coordinates for the animation
	const trashCoords = {
		x: trashBounds.x - sourceBounds.w / 2 + trashBounds.w / 2,
		y: trashBounds.y - sourceBounds.h / 2 + trashBounds.h / 2,
	}

	const siblings = [...source.parentElement!.children] as HTMLElement[]
	const siblingsAfter = siblings
		.slice(siblings.indexOf(source) + 1)
		.filter(item => item.classList.contains('puzzle-piece'))

	if (siblingsAfter.length)
		shiftElements(siblingsAfter, source, ANIMATION_TIME)
	else closeGap(source)

	source.style.zIndex = '2'
	source.querySelectorAll('.wz-separator').forEach(item => item.remove())

	source.style.width = source.offsetWidth + 'px'
	source.style.position = 'absolute'

	document.body.append(source)

	// Animate the source puzzle piece
	source.animate(
		[
			{
				transform: `translate(${sourceBounds.x}px, ${sourceBounds.y}px) scale(1)`,
				easing: DEFAULT_ANIMATION,
			},
			{
				transform: `translate(${trashCoords.x}px, ${trashCoords.y}px) scale(1)`,
				offset: 0.8,
			},
			{
				transform: `translate(${trashCoords.x}px, ${trashCoords.y}px) scale(0)`,
			},
		],
		{
			duration: ANIMATION_TIME * 2,
			fill: 'forwards',
		}
	).onfinish = () => {
		currentlyAnimating = false
		doAfter()
	}
}

/**
 * Shifts all the elements upward after the dragged element is removed
 * @param elements The list of elements to shift
 * @param target the currently dragged element (the element that is moved out)
 * @param delay optional. Delays the animation by (ms)
 * @returns {void}
 */
export function shiftElements(
	elements: HTMLElement[],
	target: HTMLElement,
	delay = 0
) {
	if (elements.length === 0) return

	currentlyAnimating = true

	// Get the temporary container and parent of the elements
	const parent = elements[0].parentElement!

	const index = ([...parent.children] as HTMLElement[]).indexOf(target)

	// If target is not beside the elements, return
	if (index === -1) return

	// Insert the shift container after the target element
	parent.insertBefore(shiftAnimationRect, elements[0])

	// Remove the absolute positioning of shiftContainer
	shiftAnimationRect.style.position = 'static'

	const targetBounds = getBounds(target)

	// Default gap is added to prevent snappy behavior
	if (delay)
		shiftAnimationRect.style.paddingTop = `${
			targetBounds.h + DEFAULT_GAP
		}px`

	// Insert the elements in shiftContainer
	shiftAnimationRect.append(...elements)

	// Animate the shift container and reverse recent actions after animating
	shiftAnimationRect.animate(
		[
			{ paddingTop: `${targetBounds.h + DEFAULT_GAP}px` },
			{ paddingTop: '0' },
		],
		{
			delay,
			duration: ANIMATION_TIME,
			easing: DEFAULT_ANIMATION,
			timeline: document.timeline,
		}
	).onfinish = () => {
		parent.append(...elements)

		shiftAnimationRect.style.position = ''

		PLAYGROUND.prepend(shiftAnimationRect)
		currentlyAnimating = false
	}
}

/**
 * Animates the height change when an element is removed
 * @param removedContainer the container that was removed from its original parent
 * @param delay the delay before starting the animation
 */
export function closeGap(removedContainer: HTMLElement, delay = 0) {
	currentlyAnimating = true

	// Gets the height of the removed container.
	// Will be applied to the resize contaienr
	const { h } = getBounds(removedContainer)

	// Appends the resize container to the parent
	const parent = removedContainer.parentElement!
	parent.appendChild(resizeAnimationRect)

	// Sets the resize container position to static
	resizeAnimationRect.style.position = 'static'

	// Sets the height of the resize container (including gap)
	resizeAnimationRect.style.height = h + DEFAULT_GAP + 'px'

	resizeAnimationRect.animate(
		[{ height: `${h + DEFAULT_GAP}px` }, { height: '0' }],
		{
			delay,
			duration: ANIMATION_TIME,
			easing: DEFAULT_ANIMATION,
			timeline: document.timeline,
		}
	).onfinish = () => {
		resizeAnimationRect.style.position = ''
		resizeAnimationRect.style.height = ''

		PLAYGROUND.prepend(resizeAnimationRect)
		currentlyAnimating = false
	}
}

/**
 * Inserts the source element into another element
 * @param source the element that is being dragged
 * @param destContainer the destination container element
 */
export function insert(source: HTMLElement, destContainer: HTMLElement) {
	currentlyAnimating = true

	// Get bounds of source element
	const srcBounds = getBounds(source)

	// Adjust bounds to include gaps
	srcBounds.y -= DEFAULT_GAP
	srcBounds.h += DEFAULT_GAP

	// Get the siblings after the elements (for shifting)
	const sourceSiblings = [...source.parentElement!.children] as HTMLElement[]
	const sourceSiblingsAfter = sourceSiblings
		.slice(sourceSiblings.indexOf(source) + 1)
		.filter(item => item.classList.contains('puzzle-piece'))

	// If there are elements after the source element, shift them
	// Otherwise, close the gap (similar to goToTrash)
	if (sourceSiblingsAfter.length)
		shiftElements(sourceSiblingsAfter, source, ANIMATION_TIME)
	else closeGap(source, ANIMATION_TIME)

	// Append the source element to the destination container
	// This is for bounds measurement
	destContainer.appendChild(source)

	// Get destination bounds
	const dstBounds = getBounds(source)

	// Adjust bounds to account for default gap
	dstBounds.y -= DEFAULT_GAP

	// Add the source to the body for simpler animation
	document.body.appendChild(source)

	// Append the insertion container to the destination container
	destContainer.appendChild(insertContainer)

	// Make the insertion container expandable
	insertContainer.style.position = 'static'

	// Animate the source element
	source.animate(
		[
			{
				width: srcBounds.w + 'px',
				transform: `translate(${srcBounds.x}px, ${srcBounds.y}px)`,
			},
			{
				width: dstBounds.w + 'px',
				transform: `translate(${dstBounds.x}px, ${dstBounds.y}px)`,
			},
		],
		{
			duration: ANIMATION_TIME,
			easing: DEFAULT_ANIMATION,
		}
	)

	// Animate the insertion container
	// Execute cleanup code after
	insertContainer.animate([{ height: `0` }, { height: srcBounds.h + 'px' }], {
		duration: ANIMATION_TIME,
		easing: DEFAULT_ANIMATION,
	}).onfinish = () => {
		// Return the insertion container to the playground
		PLAYGROUND.prepend(insertContainer)

		// Revert its position
		insertContainer.style.position = ''

		// Append the source container
		destContainer.appendChild(source)

		// Scroll to see the destination
		followWezzle(source)

		currentlyAnimating = false
	}
}

/**
 * Inserts insertion separators for easier sorting
 * @param parent The parent of the dragged element
 * @param target The dragged element
 */
export function insertSeparators(parent: HTMLElement, target: HTMLElement) {
	currentlyAnimating = true

	// Get the siblings of the target element that are puzzle pieces
	const children = ([...parent.children] as HTMLElement[]).filter(item =>
		item.classList.contains('puzzle-piece')
	)

	// Creates the separator element and adds its attributes
	const separator = document.createElement('i')
	separator.classList.add('wz-separator', 'ph-bold', 'ph-arrow-left')

	// Specifies the default animation of the separators
	const animKeyframes: Keyframe[] = [
		{ transform: `translateX(50%)`, scale: '0' },
		{ transform: `translateX(0)`, scale: '1' },
	]

	function animOptions(index: number): KeyframeAnimationOptions {
		return {
			duration: ANIMATION_TIME,
			easing: 'ease-out',
			fill: 'backwards',
			delay: Math.floor(index / 5) * 50,
			timeline: document.timeline,
		}
	}

	// Add a separator between the children
	children.forEach((child, index) => {
		if (
			child !== target &&
			(!child.previousElementSibling ||
				child.previousElementSibling !== target)
		) {
			const top = child.offsetTop
			const left = child.offsetLeft
			const width = child.offsetWidth

			const s = separator.cloneNode() as HTMLElement

			s.style.top = top + 'px'
			s.style.left = left + width + 4 + 'px'

			parent.insertBefore(s, child)

			s.animate(animKeyframes, animOptions(index)).onfinish = () => {
				if (DEFAULT_ANIMATION !== AnimationTypes.none)
					s.style.animation = 'wobble 2s ease-in-out infinite'

				currentlyAnimating = false
			}
		}

		// Execute this function on the child
		// if the child is also a parent
		if (child.hasChildNodes()) {
			insertSeparators(child, target)
		}

		// Add a separator to the end of the list
		// If the last puzzle piece is not the target
		if (
			child === document.getElementById('wz-playground')?.lastChild &&
			child !== target
		) {
			const s = separator.cloneNode() as HTMLElement

			s.style.left = child.offsetLeft + child.offsetWidth + 4 + 'px'
			s.style.top = child.offsetTop + child.offsetHeight + 'px'

			parent.append(s)
			s.style.position = 'absolute'

			s.animate(animKeyframes, animOptions(index)).onfinish = () => {
				if (DEFAULT_ANIMATION !== AnimationTypes.none)
					s.style.animation = 'wobble 2s ease-in-out infinite'

				currentlyAnimating = false
			}
		}
	})
}

/**
 * Removes the separators
 */
export function removeSeparators() {
	document.querySelectorAll('.wz-separator').forEach((separator, index) => {
		currentlyAnimating = true
		separator.animate([{ scale: '1' }, { scale: '0' }], {
			duration: ANIMATION_TIME,
			easing: 'ease',
			fill: 'both',
			delay: Math.floor(index / 5) * 50,
			timeline: document.timeline,
		}).onfinish = () => {
			separator.remove()
			currentlyAnimating = false
		}
	})
}

/**
 * Inserts the element to the location of the separator
 * @param source the element that is being dragged
 * @param separator the separator that it is dragged into
 * @returns {void}
 */
export function insertSort(source: HTMLElement, separator: HTMLElement) {
	// If the element is not a separator, do not execute this function
	if (!separator.classList.contains('wz-separator')) return

	currentlyAnimating = true

	// Get the source container and the destination container
	// We will be animating both of these at the same time
	const sourceContainer = source.parentElement!
	const destContainer = separator.parentElement!

	// Get the source bounds
	const sourceOffset = getBounds(source)

	// Get the puzzle piece after the source element
	// This is for shrinking the parent container
	let sourceInsert =
		(source.nextElementSibling as HTMLElement) ??
		(source.nextElementSibling?.nextElementSibling as HTMLElement)

	// Get the puzzle piece after the separator
	const destInsert = separator.nextElementSibling as HTMLElement

	// Insert the source before the separator in the destination container
	// This is for measurement of the destination bounds
	destContainer.insertBefore(source, separator)

	// Get the destination bounds
	const destOffset = getBounds(source)

	// Append the source to the body for animation
	document.body.appendChild(source)

	// Set the source's position to absolute
	source.style.position = 'absolute'

	// Creates two temporary containers:
	// One for shrinking the source parent
	// The other for growing the destination parent
	const temp = document.createElement('div')
	const tempClone = temp.cloneNode() as HTMLElement

	// Insert the temporary rects to their respective parent containers
	sourceContainer.insertBefore(temp, sourceInsert)
	destContainer.insertBefore(tempClone, destInsert)

	// Animate the movement of the source
	source.animate(
		[
			{
				transform: `translate(${sourceOffset.x}px, ${
					sourceOffset.y - DEFAULT_GAP
				}px)`,
				width: sourceOffset.w + 'px',
			},
			{
				transform: `translate(${destOffset.x}px, ${
					destOffset.y - DEFAULT_GAP
				}px)`,
				width: destOffset.w + 'px',
			},
		],
		{
			duration: ANIMATION_TIME,
			easing: DEFAULT_ANIMATION,
			timeline: document.timeline,
		}
	).onfinish = () => {
		destContainer.insertBefore(source, tempClone)
		source.style.position = ''

		tempClone.remove()
		temp.remove()
		currentlyAnimating = false
	}

	// Animate the temporary containers
	temp.animate(
		[{ height: sourceOffset.h + DEFAULT_GAP + 'px' }, { height: '0px' }],
		{
			duration: ANIMATION_TIME,
			easing: DEFAULT_ANIMATION,
			timeline: document.timeline,
		}
	)

	tempClone.animate(
		[{ height: '0px' }, { height: sourceOffset.h + DEFAULT_GAP + 'px' }],
		{
			duration: ANIMATION_TIME,
			easing: DEFAULT_ANIMATION,
			timeline: document.timeline,
		}
	)
}

/**
 * Scrolls the document until the element is on screen
 * @param source the element to follow
 */
function followWezzle(source: HTMLElement) {
	if (FOLLOW_WEZZLE)
		source.scrollIntoView({
			behavior: 'smooth',
			block: 'nearest',
		})
}

/**
 * Adds a new wezzle to the playground
 * @param option the original option element template
 * @returns {void}
 */
export function addWezzle(option: HTMLElement) {
	// Prevents addition of new elements if the playground is animating
	if (currentlyAnimating) return

	// Clones the option wezzle template
	const clonedWezzle = option.cloneNode() as HTMLElement

	// Clones the properties of the template defined in puzzleOptions
	// JSON stringify/parse is used so that the original one is not modified
	const puzzle = JSON.parse(
		JSON.stringify(
			puzzleOptions.find(value => value.name === clonedWezzle.dataset.id)!
		)
	)

	// If puzzle is somehow null or undefined, return an error
	if (!puzzle) {
		console.error('Puzzle piece name not found.')
		return
	}

	// Give the cloned wezzle a unique id
	const id =
		clonedWezzle.dataset.id +
		'-' +
		Math.random().toString(16).substring(2, 10)

	// Get the selected element in the playground (the glowing one)
	const selected = document.querySelector('.wz-selected') as HTMLElement

	// Add the new puzzle data to the playgroundItems global array
	playgroundItems[id] = {
		name: clonedWezzle.dataset.id!,
		tag: puzzle.tag,
		properties: puzzle.properties,
		allowedNestElements: puzzle.allowedNestElements,
	}

	// prevent disallowed elements from being nested into the selected element
	if (selected) {
		const selectedAllowed =
			playgroundItems[selected.dataset.id!].allowedNestElements

		if (selectedAllowed === 'none') {
			return notify.error(
				`You cannot add anything in ${a_an(
					selected.dataset.name!
				)} ${selected.dataset.name!}!`
			)

		} else if (
			selectedAllowed !== 'all' &&
			!selectedAllowed.includes(playgroundItems[id].name)
		) {
			return notify.error(
				`You cannot add ${a_an(clonedWezzle.dataset.name!)} ${
					clonedWezzle.dataset.name
				} inside ${a_an(selected.dataset.name!)} ${selected.dataset
					.name!}!`
			)
		}
	}

	// Start animating
	currentlyAnimating = true

	// Append the animationRect to the selected animation
	selected?.appendChild(resizeAnimationRect)

	// Set the animation rect to static
	resizeAnimationRect.style.position = 'static'

	// Add the unique id to the cloned wezzle's dataset
	clonedWezzle.dataset.id = id

	// Animate the resize rect
	resizeAnimationRect.animate(
		[
			{ height: '0px' },
			{
				height: `${
					option.getBoundingClientRect().height + DEFAULT_GAP
				}px`,
			},
		],
		{
			duration: selected ? ANIMATION_TIME / 2 : 0,
			easing: DEFAULT_ANIMATION,
			timeline: document.timeline,
		}
	).onfinish = () => {
		currentlyAnimating = false

		// Return the resize rect to the playground
		PLAYGROUND.prepend(resizeAnimationRect)

		// Revert the resize rect's positioning 
		resizeAnimationRect.style.position = ''

		// Append the cloned wezzle to the destination container
		;(document.querySelector('.wz-selected') ?? PLAYGROUND).appendChild(
			clonedWezzle
		)

		// Animate the cloned wezzle
		clonedWezzle.animate(
			[
				{ opacity: 0, transform: `translateY(100%)` },
				{ opacity: 1, transform: `translateY(0)` },
			],
			{
				duration: ANIMATION_TIME,
				easing: DEFAULT_ANIMATION,
				timeline: document.timeline,
			}
		).onfinish = () => {

			// Show the wezzle
			followWezzle(clonedWezzle)

			// Add a click event listener to the cloned wezzle
			// Toggles the selected state to said wezzle
			clonedWezzle.addEventListener('click', e => {
				e.stopPropagation()

				document.querySelectorAll('.wz-selected').forEach(item => {
					if (item !== clonedWezzle)
						item.classList.remove('wz-selected')
				})
				clonedWezzle.classList.toggle('wz-selected')

				if (clonedWezzle.classList.contains('wz-selected')) {
					showProperties(id)
				} else hideProperties()
			})
		}
	}
}

// Force currentlyAnimating to the given value
// Fixes animation and logic bugs
export function setCurrentlyAnimating(value: boolean) {
	currentlyAnimating = value
}
