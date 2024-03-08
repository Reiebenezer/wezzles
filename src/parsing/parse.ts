import { SHOW_INLINE_STYLES } from '../config'
import { getAllPuzzleChildrenIDs, isSameArray } from '../functions'
import { camelToDash } from "../typing"
import { PLAYGROUND, PREVIEW, playgroundItems } from "../global"
import { WezzleProperty } from "../types"
import processProperties from './processProps'

let cachedElements = getAllPuzzleChildrenIDs(PLAYGROUND)

export default async function parse(force?: boolean) {
	if (!force && isSameArray(cachedElements, getAllPuzzleChildrenIDs(PLAYGROUND))) return
	cachedElements = getAllPuzzleChildrenIDs(PLAYGROUND)
	
	// console.time('Parsed in')

	const parsedElementArray: parsedElement[] = []

	getElementsFromDom(PLAYGROUND, parsedElementArray)

	let parsedHTML = generateHTML(parsedElementArray)

	const stylehead = processStyling(parsedHTML)

	if (stylehead) {
		const head = document.createElement('style')
		head.innerHTML = stylehead

		if (PREVIEW.contentDocument?.querySelector('style')) {
			PREVIEW.contentDocument?.querySelector('style')?.remove()
		} 

		PREVIEW.contentDocument!.head.appendChild(head)

	}
	PREVIEW.contentDocument!.body.innerHTML = parsedHTML.innerHTML
	// console.timeEnd('Parsed in')
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

	return stringified
}

export function openPreview() {
	const previewNew = window.open('', '_blank')!

	const windowContent =
		'<!DOCTYPE html><html><head>' +
		PREVIEW.contentDocument!.head.innerHTML +
		'</head><body id="body">' +
		PREVIEW.contentDocument!.body.innerHTML +
		'</body></html>'

	previewNew.document.write(windowContent)
}

interface parsedElement {
	id: string
	tag: string | 'none'
	properties: WezzleProperty

	children?: parsedElement[]
}
