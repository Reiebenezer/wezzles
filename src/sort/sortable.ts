import interact from 'interactjs'
import { getBounds, notify } from '../functions'
import { a_an } from "../typing"
import { ARROW, playgroundItems } from "../global"
import {
	insert,
	goToTrash,
	insertSeparators,
	removeSeparators,
	insertSort,
	setCurrentlyAnimating,
} from '../animations'

const deleteIcon = document.getElementById('wz-delete-icon')!

export function makePlaygroundItem(list: HTMLElement) {
	for (const child of [...list.children] as HTMLElement[]) {
		if (child.classList.contains('puzzle-piece'))
			child.classList.add('wz-playground-item')

		if (child.hasChildNodes()) makePlaygroundItem(child)
	}

	document.onmouseover = (e: Event) => {
		const target = e.target! as HTMLElement

		if (
			ARROW.dataset.src &&
			ARROW.dataset.dst &&
			((target.classList.contains('puzzle-piece') &&
				target.closest('#wz-playground') !== null) ||
				target.id === 'wz-delete-icon' ||
				target.classList.contains('wz-separator'))
		) {
			target.classList.add('wz-arrow-hovered')
		}
	}
	
	document.ontouchmove = e => {
		const { clientX, clientY } = e.targetTouches[0]

		const h = hovered(list)

		if (clientX < list.offsetLeft || clientX > list.offsetLeft + list.offsetWidth) 
			list.querySelectorAll('.wz-arrow-hovered').forEach(item => item.classList.remove('wz-arrow-hovered'))

		if (h ?? list.querySelectorAll('.wz-arrow-hovered').length > 1) {
			list.querySelectorAll('.wz-arrow-hovered').forEach(item =>
				item.classList.remove('wz-arrow-hovered')
			)
			
			h?.classList.add('wz-arrow-hovered')
		}

		function hovered(parent: HTMLElement) {
			let hoveredChild: HTMLElement | undefined

			for (const child of [...parent.children] as HTMLElement[]) {
				const { x, y, w, h } = getBounds(child)

				if (
					y <= clientY &&
					y + h > clientY &&
					x <= clientX &&
					x + w > clientX
				) {
					hoveredChild = child

					if (hoveredChild === deleteIcon) return hoveredChild
					if (hoveredChild.classList.contains('wz-separator'))
						return hoveredChild

					if (child.hasChildNodes()) {
						const temp = hovered(child)
						if (temp !== undefined) hoveredChild = temp
					}
				}
			}

			return hoveredChild
		}

	}

	document.onmouseout = e => (e.target as HTMLElement)?.classList.remove('wz-arrow-hovered')

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

			ARROW.dataset.offset =
				e.target.getBoundingClientRect().left +
				e.target.getBoundingClientRect().width +
				100 +
				''
				
			deleteIcon.style.setProperty('--delay', '0ms')
			deleteIcon.style.scale = '1'

			insertSeparators(list, e.target)
		},
		onmove: e => {
			const target = e.target as HTMLElement
			
			const targetBounds = getBounds(target)
			const targetRightEdge = targetBounds.x + targetBounds.w

			const maxOffset = (50 + Math.floor(window.screen.width / 100))

			ARROW.dataset.src = `${targetRightEdge} ${
				targetBounds.y + targetBounds.h / 2
			}`
			ARROW.dataset.dst = `${e.clientX} ${e.clientY}`

			ARROW.dataset.offset =
				e.clientX > targetRightEdge
					? e.clientX + maxOffset + ''
					: targetRightEdge + maxOffset + ''

			document.documentElement.style.cursor = 'grabbing'
			target.style.cursor = 'grabbing'

			
			const hovered = document.querySelector('.wz-arrow-hovered')! as HTMLElement

			if (!hovered) return

			const hoveredBounds = getBounds(hovered)

			const allowed = hovered.dataset.id
				? playgroundItems[hovered.dataset.id].include
				: 'all'

			if (
				target !== hovered &&
				target.parentElement !== hovered &&
				allowed !== 'none'
			) {
				if (hovered !== deleteIcon)
					ARROW.dataset.offset =
						hoveredBounds.x + hoveredBounds.w + maxOffset + ''

				ARROW.dataset.dst = `${
					hoveredBounds.x + hoveredBounds.w + 10
				} ${
					hoveredBounds.y + hoveredBounds.h / 2
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
						deleteFromPlaygroundItems(target)
						
						deleteIcon.style.setProperty('--delay', '100ms')
						deleteIcon.style.scale = '0'

						function deleteFromPlaygroundItems(target: HTMLElement) {
							delete playgroundItems[target.dataset.id ?? '']
							
							if (target.hasChildNodes()) {
								[...target.children].forEach(child => deleteFromPlaygroundItems(child as HTMLElement))
							}
						}
					})

					notify.info(`${target.dataset.name} element deleted`)
				} else {
					const allowed = hovered.classList.contains('wz-separator')
						? hovered.parentElement &&
						  hovered.parentElement !==
								document.getElementById('wz-playground')
							? playgroundItems[hovered.parentElement.dataset.id!]
									.include
							: 'all'
						: playgroundItems[hovered.dataset.id!]
								.include

					const id = target.dataset.id!.split('-')[0]

					if (allowed === 'none') {
						notify.error(
							`You cannot nest anything in ${a_an(
								hovered.dataset.name!
							)} ${hovered.dataset.name}!`
						)
					} else if (
						allowed!.includes('all') ||
						allowed!.includes(id)
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

			delete ARROW.dataset.src
			delete ARROW.dataset.dst

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
