import { EssentialPuzzleList, Puzzle, PuzzleGroup } from './types'

export const playgroundItems: EssentialPuzzleList = {}
export const AnimationTypes = {
	fancy: 'cubic-bezier( 0.215, 0.61, 0.355, 1 )',
	fast: 'cubic-bezier(0.23, 1, 0.32, 1)',
	bouncy: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
	static: 'linear',
	none: undefined,
}

export const PLAYGROUND: HTMLElement = document.getElementById('wz-playground') as HTMLElement
export const ARROW: SVGElement = document.getElementById('wz-arrow') as unknown as SVGElement
export const ARROWPATH: SVGPathElement = ARROW.querySelector('path') as SVGPathElement
export const ARROWHEAD: SVGGElement = ARROW.querySelector('g') as SVGGElement
export const PREVIEW = document.getElementById('wz-preview') as HTMLIFrameElement


// PUZZLE PIECES
export const puzzleOptions: Puzzle[] = [
	{
		name: 'container',
		tag: 'div',
		displayname: 'Generic Container',
		properties: {},
		include: 'all',
		group: PuzzleGroup.container,
	},
	{
		name: 'button',
		tag: 'button',
		displayname: 'Button',
		properties: {
			textContent: '',
		},
		include: ['inlinestyle', 'text'],
		group: PuzzleGroup.interactive,
	},
	{
		name: 'inlinestyle',
		tag: 'none',
		displayname: 'Inline Style',
		properties: {
			style: {
				name: '',
				value: '',
			},
		},
		include: 'none',
		group: PuzzleGroup.style,
	},
	{
		name: 'ptext',
		tag: 'p',
		displayname: 'Paragraph Text',
		properties: {
			textContent: '',
		},
		include: ['inlinestyle'],
		group: PuzzleGroup.text,
	},
	{
		name: 'input',
		tag: 'input',
		displayname: 'Text Input',
		properties: {
			value: '',
			placeholder: '',
		},
		include: ['inlinestyle'],
		group: PuzzleGroup.interactive,
	},
	{
		name: 'header',
		tag: 'header',
		displayname: 'Header Section',
		properties: {},
		exclude: ['input', 'footer'],
		group: PuzzleGroup.container,
		existOnce: true,
	},
	{
		name: 'title',
		tag: 'none',
		displayname: 'Title Text',
		properties: {
			textContent: '',
			titleSize: 'h1',
		},
		include: ['inlinestyle'],
		group: PuzzleGroup.text,
	},
	{
		name: 'footer',
		tag: 'footer',
		displayname: 'Footer Section',
		properties: {},
		exclude: ['header'],
		group: PuzzleGroup.container,
		existOnce: true,
	},
]
