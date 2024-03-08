import { addToOptions, getBounds } from './functions'
import { currentlyAnimating } from './animations'
import parse, { decrementParseTimeout } from './parsing/parse'
import { makeItemsSortable, makePlaygroundItem } from './sort/sortable'
import { hideProperties } from './sort/properties'
import { ARROW, ARROWHEAD, ARROWPATH, PLAYGROUND } from './global'
import { ARROW_COLOR, ARROW_WIDTH } from './config'
import recordKeyboard from './keyboard'

recordKeyboard()

addToOptions()
hideProperties()

PLAYGROUND.addEventListener('click', () => {
	document
		.querySelectorAll('.wz-selected')
		.forEach(item => item.classList.remove('wz-selected'))
	hideProperties()
})

const mutationObserver = new MutationObserver(() => {
	makePlaygroundItem(PLAYGROUND)

	if (!currentlyAnimating) {
		parse()
	}
})
mutationObserver.observe(PLAYGROUND, {
	childList: true,
	subtree: true,
})

makeItemsSortable(PLAYGROUND)

let mainBounds = getBounds(document.querySelector('main')!)
window.onresize = () => mainBounds = getBounds(document.querySelector('main')!)

function animate() {
	decrementParseTimeout()

	const source = ARROW.dataset.src?.split(' ').map(_ => +_)
	const dest = ARROW.dataset.dst?.split(' ').map(_ => +_)
	let offset = +(ARROW.dataset.offset ?? 0)

	if (source && dest && offset) {
		source[0] -= mainBounds.x
		source[1] -= mainBounds.y

		offset -= mainBounds.x
		
		dest[0] -= mainBounds.x
		dest[1] -= mainBounds.y

		ARROWPATH.setAttribute(
			'd',
			`M${source[0]} ${source[1]} ` +
			`L${offset}    ${source[1]}` +
			`L${offset}    ${dest[1]}` +
			`L${dest[0]}   ${dest[1]}`
		)

    ARROWPATH.setAttribute('stroke-width', ARROW_WIDTH + 'px')
    ARROWHEAD.setAttribute('transform', `translate(${dest[0]} ${dest[1]})`)

    ARROWHEAD.style.fill = ARROW_COLOR
    ARROWPATH.style.stroke = ARROW_COLOR

	} else {
    ARROWPATH.setAttribute('d', '')
    ARROWHEAD.setAttribute('transform', `translate(-1000, -1000)`)
  }

	requestAnimationFrame(animate)
}
animate()
