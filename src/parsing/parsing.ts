import { SHOW_INLINE_STYLES } from '../config'
import { camelToDash, getAllPuzzleChildrenIDs, isSameArray, playgroundItems } from '../defs'
import { WezzleProperty } from '../puzzle-pieces'

const playground = document.getElementById('wz-playground')!
let cachedElements = getAllPuzzleChildrenIDs(playground)

export async function parse(force?: boolean) {
	if (!force && isSameArray(cachedElements, getAllPuzzleChildrenIDs(playground))) return
	cachedElements = getAllPuzzleChildrenIDs(playground)

	// console.log(cachedElements)

	console.time('Parsed in')

	const parsedElementArray: parsedElement[] = []

	const preview = document.getElementById(
		'wz-preview-container'
	) as HTMLIFrameElement

	getElementsFromDom(playground, parsedElementArray)
	let parsedHTML = generateHTML(parsedElementArray)

	// console.log(parsedHTML)

	const stylehead = processStyling(parsedHTML)

	if (stylehead) {
		const head = document.createElement('style')
		head.innerHTML = stylehead

		preview.contentDocument!.head.appendChild(head)
	}
	preview.contentDocument!.body.innerHTML = parsedHTML.innerHTML
	console.timeEnd('Parsed in')

}

function getElementsFromDom(parent: HTMLElement, parentArray: parsedElement[]) {
	const children = ([...parent.children] as HTMLElement[]).filter(item =>
		item.classList.contains('puzzle-piece')
	)

	for (const child of children) {
		const id = child.dataset.id!

		const entry = playgroundItems[id]

		const tag = entry.tag
		const properties = entry.properties

		const parsed: parsedElement = { id, tag, properties }

		if (child.hasChildNodes()) {
			parsed.children = []
			getElementsFromDom(child, parsed.children)
		} else parsed.children = []

		parentArray.push(parsed)
	}
}

function generateHTML(parsedElementArray: parsedElement[]) {
	const domArray = []

	for (const parsedElement of parsedElementArray) {
		domArray.push(returnDOMElement(parsedElement))
	}

	const finalDom = document.createElement('div')
	finalDom.append(...domArray)

	return finalDom
}

function returnDOMElement(parsed: parsedElement) {
	let domElement: HTMLElement = document.createElement('div')

	if (parsed.tag !== 'none') {
		domElement = document.createElement(parsed.tag)
		domElement.id = parsed.id
	} else {
		const name = parsed.id.split('-')[0]

		if (name === 'inlinestyle') {
			domElement = document.createElement('style')
		}
	}
	processProperties(parsed.properties, domElement)

	if (parsed.children && parsed.children.length > 0) {
		for (const child of parsed.children)
			domElement.appendChild(returnDOMElement(child))
	}

	return domElement
}

function processStyling(parsedHTML: HTMLDivElement) {
	const styleArray: { [element: string]: { [name: string]: string } } = {}

	parsedHTML.querySelectorAll('style').forEach(styleTag => {
		const parentID = styleTag.parentElement!.id || 'body'
		const [stylename, stylevalue] = styleTag.innerHTML.split(':')

		if (SHOW_INLINE_STYLES)
			styleTag.parentElement!.style.setProperty(stylename, stylevalue)

		else if (stylename) {
			if (!styleArray[parentID]) styleArray[parentID] = {}
			styleArray[parentID][stylename] = stylevalue
		}

		styleTag.remove()
	})

	// Parse the stylearray into a css string
	let stringified = ''
	for (const [ selector, properties ] of Object.entries(styleArray)) {
		stringified += `#${selector} {\n`

		for (const [ key, value ] of Object.entries(properties)) {
			stringified += `\t${camelToDash(key)}: ${value};\n`
		}

		stringified += '}\n\n'
	}

	console.log(stringified)

	return stringified
}

function processProperties(properties: WezzleProperty, element: HTMLElement) {
	if (properties.style?.name && properties.style.value) {
		element.innerHTML = `${properties.style.name}:${properties.style.value}`
	}

	if (properties.textContent) {
		element.innerText = properties.textContent || ''
	}
}

export function openNewWindow() {
	const preview = document.getElementById('wz-preview')!

	const previewContainer: HTMLIFrameElement = document.getElementById(
		'wz-preview-container'
	)! as HTMLIFrameElement

	previewContainer.contentDocument!.body.innerHTML = JSON.stringify(
		'',
		undefined,
		3
	)
	preview.onclick = () => {
		const previewNew = window.open('', '_blank')!

		const windowContent =
			'<!DOCTYPE html><html><head>' +
			previewContainer.contentDocument!.head.innerHTML +
			'</head><body>' +
			previewContainer.contentDocument!.body.innerHTML +
			'</body></html>'

		previewNew.document.write(windowContent)
	}
}

export interface parsedElement {
	id: string
	tag: string | 'none'
	properties: WezzleProperty

	children?: parsedElement[]
}
