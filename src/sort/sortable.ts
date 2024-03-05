import interact from 'interactjs'
import { notify } from '../functions'
import { a_an } from "../typing"
import { playgroundItems } from "../global"
import {
	insert,
	goToTrash,
	insertSeparators,
	removeSeparators,
	insertSort,
	setCurrentlyAnimating,
} from '../animations'
import { DEFAULT_GAP } from '../config'

const arrow = document.getElementById('wz-arrow') as HTMLCanvasElement
const deleteIcon = document.getElementById('wz-delete-icon')!

export function makePlaygroundItem(list: HTMLElement) {
	for (const child of [...list.children] as HTMLElement[]) {
		if (child.classList.contains('puzzle-piece'))
			child.classList.add('wz-playground-item')

		if (child.hasChildNodes()) makePlaygroundItem(child)
	}

	document.addEventListener('mouseover', (e: Event) => {
		const target = e.target! as HTMLElement

		if (
			arrow.dataset.src &&
			arrow.dataset.dst &&
			(
				(target.classList.contains('puzzle-piece') && target.closest('#wz-playground') !== null) ||
				target.id === 'wz-delete-icon' ||
				target.classList.contains('wz-separator'))
		) {
			target.classList.add('wz-arrow-hovered')
		}
	})
	
	document.addEventListener('touchmove', e => {
		const { clientX, clientY } = e.targetTouches[0]

		function hovered(parent: HTMLElement) {
			let hoveredChild: HTMLElement | undefined

			for (const child of [...parent.children] as HTMLElement[]) {
				const { top, left, width, height } =
					child.getBoundingClientRect()

				if (
					top <= clientY &&
					top + height > clientY &&
					left <= clientX &&
					left + width > clientX
				) {
					hoveredChild = child

					if (hoveredChild.classList.contains('wz-separator')) return hoveredChild
					
					if (child.hasChildNodes()) {
						const temp = hovered(child)

						if (temp !== undefined) hoveredChild = temp
					}
				}
			}

			return hoveredChild
		}


		const h = hovered(list)

		if (clientX < list.offsetLeft || clientX > list.offsetLeft + list.offsetWidth) 
			list.querySelectorAll('.wz-arrow-hovered').forEach(item => item.classList.remove('wz-arrow-hovered'))

		if (h ?? list.querySelectorAll('.wz-arrow-hovered').length > 1) {
			list.querySelectorAll('.wz-arrow-hovered').forEach(item =>
				item.classList.remove('wz-arrow-hovered')
			)
			
			h?.classList.add('wz-arrow-hovered')
		}
	})

	document.addEventListener('mouseout', e => 
		(e.target as HTMLElement)?.classList.remove('wz-arrow-hovered')
	)

}

export function makeItemsSortable(list: HTMLElement) {
	return interact('.wz-playground-item').draggable({
		autoScroll: {
			container: list,
		},
		cursorChecker: (): string => {
			return 'grab'
		},
		onstart: e => {
			console.log('started dragging')

			arrow.dataset.offset =
				e.target.getBoundingClientRect().left +
				e.target.getBoundingClientRect().width +
				100 +
				''

			deleteIcon.style.left = list.offsetLeft + DEFAULT_GAP + 'px'
			deleteIcon.style.setProperty('--delay', '0ms')
			deleteIcon.style.scale = '1'

			insertSeparators(list, e.target)
		},
		onmove: e => {
			const target = e.target as HTMLElement

			const targetRightEdge =
				target.getBoundingClientRect().left +
				target.getBoundingClientRect().width

			arrow.dataset.src = `${targetRightEdge} ${
				target.getBoundingClientRect().top +
				target.getBoundingClientRect().height / 2
			}`
			arrow.dataset.dst = `${e.clientX} ${e.clientY}`

			arrow.dataset.offset =
				e.clientX > targetRightEdge
					? e.clientX + 100 + ''
					: targetRightEdge + 100 + ''

			document.documentElement.style.cursor = 'grabbing'
			target.style.cursor = 'grabbing'

			
			const hovered = document.querySelector('.wz-arrow-hovered')! as HTMLElement
			if (!hovered) return

			const allowed = hovered.dataset.id
				? playgroundItems[hovered.dataset.id].allowedNestElements
				: 'all'

			if (
				target !== hovered &&
				target.parentElement !== hovered &&
				allowed !== 'none'
			) {
				if (hovered !== deleteIcon)
					arrow.dataset.offset =
						hovered.getBoundingClientRect().left +
						hovered.getBoundingClientRect().width +
						100 +
						''

				arrow.dataset.dst = `${
					hovered.getBoundingClientRect().left +
					hovered.getBoundingClientRect().width +
					10
				} ${
					hovered.getBoundingClientRect().top +
					hovered.getBoundingClientRect().height / 2
				}`
			}
		},
		onend: e => {
			console.log('ended dragging')

			const target = e.target as HTMLElement
			const hovered = document.querySelector(
				'.wz-arrow-hovered'
			)! as HTMLElement

			if (
				hovered &&
				target !== hovered &&
				target.parentElement !== hovered
			) {
				if (hovered === document.getElementById('wz-delete-icon')) {
					goToTrash(target, () => {
						target.remove()

						deleteIcon.style.setProperty('--delay', '100ms')
						deleteIcon.style.scale = '0'
					})

					notify.info(`${target.dataset.name} element deleted`)
				} else {
					const allowed = hovered.classList.contains('wz-separator')
						? hovered.parentElement &&
						  hovered.parentElement !==
								document.getElementById('wz-playground')
							? playgroundItems[hovered.parentElement.dataset.id!]
									.allowedNestElements
							: 'all'
						: playgroundItems[hovered.dataset.id!]
								.allowedNestElements

					const id = target.dataset.id!.split('-')[0]

					if (allowed === 'none') {
						notify.error(
							`You cannot nest anything in ${a_an(
								hovered.dataset.name!
							)} ${hovered.dataset.name}!`
						)
					} else if (
						allowed.includes('all') ||
						allowed.includes(id)
					) {
						if (hoveredIsChildOfTarget(target)) {
							notify.error(
								`You cannot nest ${a_an(
									target.dataset.name!
								)} ${
									target.dataset.name
								} in any of its children!`
							)
						} else {
							try {
								if (
									hovered.classList.contains('wz-separator')
								) {
									insertSort(target, hovered)
								} else {
									insert(target, hovered)
								}
							} catch (error) {
								console.error(e)
							}
						}
					} else {
						notify.error(
							`You cannot nest ${a_an(target.dataset.name!)} ${
								target.dataset.name
							} in ${a_an(
								(hovered.dataset.name ??
									hovered.parentElement!.dataset.name)!
							)} ${
								hovered.dataset.name ??
								hovered.parentElement!.dataset.name
							}!`
						)
					}
				}
			}

			removeSeparators()

			delete arrow.dataset.src
			delete arrow.dataset.dst

			document.body.style.cursor = ''
			for (const holder of document.querySelectorAll('.wz-arrow-hovered'))
				holder.classList.remove('wz-arrow-hovered')

			if (hovered !== deleteIcon) {
				deleteIcon.style.scale = '0'
			}

			setCurrentlyAnimating(false)

			function hoveredIsChildOfTarget(target: HTMLElement): boolean {
				let isChild = false

				for (const child of [...target.children] as HTMLElement[]) {
					if (child === hovered) {
						isChild = true
						break
					}

					if (child.hasChildNodes())
						isChild = hoveredIsChildOfTarget(child)
				}

				return isChild
			}
		},
	})
}

/**
 * FEATURES OF THE SORTABLE PLAYGROUND
 * - upon dragging, an arrow will show up. This arrow determines the destination of the element.
 * - the arrow will come from the right side of the selected div, then point to any of the hovered
 * elements or between them.
 * - upon dropping, the element will move to that space, and the others will move to adjust.
 */
