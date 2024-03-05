import {
	ANIMATION_TIME,
	DEFAULT_ANIMATION,
	DEFAULT_GAP,
	FOLLOW_WEZZLE,
} from './config'
import { notify } from './functions'
import { a_an } from "./typing"
import { AnimationTypes } from "./global"
import { playgroundItems } from "./global"
import { puzzleOptions } from "./global"
import { hideProperties, showProperties } from './sort/properties'

export let currentlyAnimating = false

export function goToTrash(source: HTMLElement, doAfter: Function) {
	currentlyAnimating = true

	const trashButton = document.getElementById('wz-delete-icon')

	const trashCoords = {
		x:
			trashButton!.getBoundingClientRect().left -
			source.offsetWidth / 2 +
			trashButton!.offsetWidth / 2,
		y:
			trashButton!.getBoundingClientRect().top -
			source.offsetHeight / 2 +
			trashButton!.offsetHeight / 2,
	}

	const sourceCoords = {
		x: source.getBoundingClientRect().left,
		y: source.getBoundingClientRect().top,
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

	const kfEffect = new KeyframeEffect(
		source,
		[
			{
				transform: `translate(${sourceCoords.x}px, ${sourceCoords.y}px) scale(1)`,
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
	)

	const anim = new Animation(kfEffect, document.timeline)
	anim.play()

	anim.onfinish = () => {
		currentlyAnimating = false

		doAfter()
	}
}

export function shiftElements(
	elements: HTMLElement[],
	target: HTMLElement,
	delay = 0
) {
	if (elements.length === 0) return

	currentlyAnimating = true

	// Get the temporary container and parent of the elements
	const shiftContainer = document.getElementById('wz-shift-animation')!
	const parent = elements[0].parentElement!

	const index = ([...parent.children] as HTMLElement[]).indexOf(target)

	// If target is not beside the elements, return
	if (index === -1) return

	const anim = new Animation(
		new KeyframeEffect(
			shiftContainer,
			[
				{ marginTop: `${target.offsetHeight + DEFAULT_GAP}px` },
				{ marginTop: '0' },
			],
			{
				delay,
				duration: ANIMATION_TIME,
				easing: DEFAULT_ANIMATION,
			}
		),
		document.timeline
	)

	// Insert the shift container after the target element
	parent.insertBefore(shiftContainer, elements[0])

	// Remove the absolute positioning of shiftContainer
	shiftContainer.style.position = 'static'

	if (delay)
		shiftContainer.style.marginTop = `${
			target.offsetHeight + DEFAULT_GAP
		}px`

	// Insert the elements in shiftContainer
	shiftContainer.append(...elements)

	anim.play()
	anim.onfinish = () => {
		parent.append(...elements)

		shiftContainer.style.position = ''
		// shiftContainer.style.marginTop = ''

		document.getElementById('wz-playground')!.prepend(shiftContainer)
		currentlyAnimating = false
	}
}

/**
 * ### Resize Container
 */
export function closeGap(removedContainer: HTMLElement, delay = 0) {
	currentlyAnimating = true

	const { height } = removedContainer.getBoundingClientRect()

	const resizeContainer = document.getElementById('wz-resize-animation')!
	const parent = removedContainer.parentElement!

	parent.appendChild(resizeContainer)
	resizeContainer.style.position = 'static'
	resizeContainer.style.height = height + DEFAULT_GAP + 'px'

	const anim = new Animation(
		new KeyframeEffect(
			resizeContainer,
			[{ height: `${height + DEFAULT_GAP}px` }, { height: '0' }],
			{
				delay,
				duration: ANIMATION_TIME,
				easing: DEFAULT_ANIMATION,
			}
		),
		document.timeline
	)

	anim.play()
	anim.onfinish = () => {
		resizeContainer.style.position = ''
		resizeContainer.style.height = ''

		document.getElementById('wz-playground')!.prepend(resizeContainer)
		currentlyAnimating = false
	}
}

export function insert(source: HTMLElement, destContainer: HTMLElement) {
	currentlyAnimating = true

	const playground = document.getElementById('wz-playground')!
	const insertContainer = document.getElementById('wz-insert-animation')!

	const sourceTop = source.getBoundingClientRect().top - DEFAULT_GAP + 'px'
	const sourceLeft = source.getBoundingClientRect().left + 'px'
	const sourceWidth = source.getBoundingClientRect().width + 'px'
	const height = source.getBoundingClientRect().height + DEFAULT_GAP + 'px'

	const sourceSiblings = [...source.parentElement!.children] as HTMLElement[]
	const sourceSiblingsAfter = sourceSiblings
		.slice(sourceSiblings.indexOf(source) + 1)
		.filter(item => item.classList.contains('puzzle-piece'))

	if (sourceSiblingsAfter.length)
		shiftElements(sourceSiblingsAfter, source, ANIMATION_TIME)
	else closeGap(source, ANIMATION_TIME)

	destContainer.appendChild(source)

	const destTop = source.getBoundingClientRect().top - DEFAULT_GAP + 'px'
	const destLeft = source.getBoundingClientRect().left + 'px'
	const destWidth = source.getBoundingClientRect().width + 'px'

	document.body.appendChild(source)
	destContainer.appendChild(insertContainer)

	insertContainer.style.position = 'static'

	const anim = new Animation(
		new KeyframeEffect(
			source,
			[
				{
					width: sourceWidth,
					transform: `translate(${sourceLeft}, ${sourceTop})`,
				},
				{
					width: destWidth,
					transform: `translate(${destLeft}, ${destTop})`,
				},
			],
			{
				duration: ANIMATION_TIME,
				easing: DEFAULT_ANIMATION,
			}
		),
		document.timeline
	)

	const anim2 = new Animation(
		new KeyframeEffect(insertContainer, [{ height: `0` }, { height }], {
			duration: ANIMATION_TIME,
			easing: DEFAULT_ANIMATION,
		})
	)

	anim2.play()
	anim.play()

	anim2.onfinish = () => {
		playground.prepend(insertContainer)
		insertContainer.style.position = ''

		destContainer.appendChild(source)
		followWezzle(source)

		currentlyAnimating = false
	}
}

export function insertSeparators(parent: HTMLElement, target: HTMLElement) {
	currentlyAnimating = true

	const children = ([...parent.children] as HTMLElement[])
		.filter(item => item.classList.contains('puzzle-piece'))
		.sort(() => Math.random() - 0.5)

	const separator = document.createElement('i')
	separator.classList.add('wz-separator', 'ph-bold', 'ph-arrow-left')

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

			const anim = new Animation(
				new KeyframeEffect(
					s,
					[
						{ transform: `translateX(50%)`, scale: '0' },
						{ transform: `translateX(0)`, scale: '1' },
					],
					{
						duration: ANIMATION_TIME,
						easing: 'ease-out',
						fill: 'backwards',
						delay: Math.floor(index / 5) * 50,
					}
				),
				document.timeline
			)
			anim.play()
			anim.onfinish = () => {
				if (DEFAULT_ANIMATION !== AnimationTypes.none)
					s.style.animation = 'wobble 2s ease-in-out infinite'
			}
		}

		if (child.hasChildNodes()) {
			insertSeparators(child, target)
		}

		if (
			child === document.getElementById('wz-playground')?.lastChild &&
			child !== target
		) {
			const s = separator.cloneNode() as HTMLElement

			s.style.left = child.offsetLeft + child.offsetWidth + 4 + 'px'
			s.style.top = child.offsetTop + child.offsetHeight + 'px'

			parent.append(s)
			s.style.position = 'absolute'

			const anim = new Animation(
				new KeyframeEffect(
					s,
					[
						{ transform: `translateX(50%)`, scale: '0' },
						{ transform: `translateX(0)`, scale: '1' },
					],
					{
						duration: ANIMATION_TIME,
						easing: 'ease',
						fill: 'backwards',
						delay: Math.floor(index / 5) * 50,
					}
				),
				document.timeline
			)
			anim.play()
			anim.onfinish = () => {
				if (DEFAULT_ANIMATION !== AnimationTypes.none)
					s.style.animation = 'wobble 2s ease-in-out infinite'

				currentlyAnimating = false
			}
		}
	})
}

export function removeSeparators() {
	document.querySelectorAll('.wz-separator').forEach((separator, index) => {
		const anim = new Animation(
			new KeyframeEffect(separator, [{ scale: '1' }, { scale: '0' }], {
				duration: ANIMATION_TIME,
				easing: 'ease',
				fill: 'both',
				delay: Math.floor(index / 5) * 50,
			}),
			document.timeline
		)

		currentlyAnimating = true

		anim.play()
		anim.onfinish = () => {
			separator.remove()
			currentlyAnimating = false
		}
	})
}

export function insertSort(source: HTMLElement, separator: HTMLElement) {
	if (!separator.classList.contains('wz-separator')) return

	currentlyAnimating = true

	const sourceContainer = source.parentElement!
	const destContainer = separator.parentElement!

	const sourceOffset = source.getBoundingClientRect()

	let sourceInsert =
		(source.nextElementSibling as HTMLElement) ||
		(source.nextElementSibling?.nextElementSibling as HTMLElement)

	const destInsert = separator.nextElementSibling as HTMLElement

	destContainer.insertBefore(source, separator)

	const destOffset = source.getBoundingClientRect()

	document.body.appendChild(source)
	source.style.position = 'absolute'

	const temp = document.createElement('div')
	temp.className = 'wz-temp'

	const tempClone = document.createElement('div')
	tempClone.className = 'wz-temp2'

	sourceContainer.insertBefore(temp, sourceInsert)
	destContainer.insertBefore(tempClone, destInsert)

	const anim = new Animation(
		new KeyframeEffect(
			source,
			[
				{
					transform: `translate(${sourceOffset.left}px, ${
						sourceOffset.top - 16
					}px)`,
					width: sourceOffset.width + 'px',
				},
				{
					transform: `translate(${destOffset.left}px, ${
						destOffset.top - 16
					}px)`,
					width: destOffset.width + 'px',
				},
			],
			{
				duration: ANIMATION_TIME,
				easing: DEFAULT_ANIMATION,
			}
		),
		document.timeline
	)

	const anim2 = new Animation(
		new KeyframeEffect(
			tempClone,
			[
				{ height: '0px' },
				{ height: sourceOffset.height + DEFAULT_GAP + 'px' },
			],
			{
				duration: ANIMATION_TIME,
				easing: DEFAULT_ANIMATION,
			}
		),
		document.timeline
	)

	const anim3 = new Animation(
		new KeyframeEffect(
			temp,
			[
				{ height: sourceOffset.height + DEFAULT_GAP + 'px' },
				{ height: '0px' },
			],
			{
				duration: ANIMATION_TIME,
				easing: DEFAULT_ANIMATION,
			}
		),
		document.timeline
	)

	anim.play()
	anim2.play()
	anim3.play()

	anim.onfinish = () => {
		destContainer.insertBefore(source, tempClone)
		source.style.position = ''

		tempClone.remove()
		temp.remove()
		currentlyAnimating = false
	}
}

function followWezzle(source: HTMLElement) {
	if (FOLLOW_WEZZLE)
		source.scrollIntoView({
			behavior: 'smooth',
			block: 'nearest',
		})
}

export function addWezzle(option: HTMLElement) {
	if (currentlyAnimating) return

	const clonedWezzle = option.cloneNode() as HTMLElement
	const playground = document.getElementById('wz-playground')!

	const puzzle = JSON.parse(JSON.stringify(puzzleOptions.find(value => value.name === clonedWezzle.dataset.id)!))

	if (!puzzle) {
		console.error('Puzzle piece name not found.')
		return
	}

	// Give the cloned wezzle a unique id
	const id =
		clonedWezzle.dataset.id +
		'-' +
		Math.random().toString(16).substring(2, 10)
	const anim = new Animation(
		new KeyframeEffect(
			clonedWezzle,
			[
				{ opacity: 0, transform: `translateY(100%)` },
				{ opacity: 1, transform: `translateY(0)` },
			],
			{
				duration: ANIMATION_TIME,
				easing: DEFAULT_ANIMATION,
			}
		),
		document.timeline
	)

	const selected = document.querySelector('.wz-selected') as HTMLElement

	playgroundItems[id] = {
		name: clonedWezzle.dataset.id!,
		tag: puzzle.tag,
		properties: puzzle.properties,
		allowedNestElements: puzzle.allowedNestElements,
	}
	
	// prevent incompatibilities
	if (selected) {
		const selectedAllowed = playgroundItems[selected.dataset.id!].allowedNestElements

		if (selectedAllowed === 'none') {
			notify.error(
				`You cannot add anything in ${a_an(
					selected.dataset.name!
				)} ${selected.dataset.name!}!`
			)
			return
		}
		else if ((selectedAllowed !== 'all' && !selectedAllowed.includes(playgroundItems[id].name))) {
			notify.error(
				`You cannot add ${a_an(clonedWezzle.dataset.name!)} ${clonedWezzle.dataset.name} inside ${a_an(selected.dataset.name!)} ${selected.dataset.name!}!`
			)
			return
		}
	}
	
	//
	currentlyAnimating = true

	const resizeContainer = document.getElementById('wz-resize-animation')!
	selected?.appendChild(resizeContainer)
	resizeContainer.style.position = 'static'

	const growAnim = new Animation(
		new KeyframeEffect(
			resizeContainer,
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
			}
		),
		document.timeline
	)

	clonedWezzle.dataset.id = id

	growAnim.play()
	growAnim.onfinish = () => {
		currentlyAnimating = false
		playground.prepend(resizeContainer)

		resizeContainer.style.position = ''

		;(document.querySelector('.wz-selected') || playground).appendChild(
			clonedWezzle
		)
		anim.play()
	}

	anim.onfinish = () => {
		followWezzle(clonedWezzle)

		clonedWezzle.addEventListener('click', e => {
			e.stopPropagation()

			document.querySelectorAll('.wz-selected').forEach(item => {
				if (item !== clonedWezzle) item.classList.remove('wz-selected')
			})
			clonedWezzle.classList.toggle('wz-selected')

			if (clonedWezzle.classList.contains('wz-selected')) {
				showProperties(id)
			}
			else hideProperties()
		})
	}

	// Selection
}

// To Fix Animation bugs when not hovering over any puzzle piece
export function setCurrentlyAnimating(value: boolean) {
	currentlyAnimating = value
}