import { EssentialPuzzleList, Puzzle } from './types'

export const playgroundItems: EssentialPuzzleList = {}
export const AnimationTypes = {
	fancy: 'cubic-bezier( 0.215, 0.61, 0.355, 1 )',
	fast: 'cubic-bezier(0.23, 1, 0.32, 1)',
	bouncy: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
	static: 'linear',
	none: undefined,
}

export const PLAYGROUND: HTMLElement = document.getElementById(
	'wz-playground'
) as HTMLElement

export const ARROW: SVGElement = document.getElementById(
	'wz-arrow'
) as unknown as SVGElement

export const ARROWPATH: SVGPathElement = ARROW.querySelector(
	'path'
) as SVGPathElement

export const ARROWHEAD: SVGGElement = ARROW.querySelector(
	'g'
) as SVGGElement

export const puzzleOptions: Puzzle[] = [
	{
		name: 'container',
		tag: 'div',
		displayname: 'Container',
		properties: {},
		allowedNestElements: 'all',
	},
	{
		name: 'button',
		tag: 'button',
		displayname: 'Button',
		properties: {
			textContent: '',
		},
		allowedNestElements: ['inlinestyle', 'text'],
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
		allowedNestElements: 'none',
	},
]
