import { bindInput, dashToCamel } from "./defs"
import { addWezzle } from "./sort/animations"

interface Puzzle {
    name: string
    tag: string | 'none'
    displayname: string
    properties: WezzleProperty
    allowedNestElements: string[] | 'all' | 'none'
}

export type EssentialPuzzleList = {
    [key: string]: Omit<Puzzle, 'displayname'>
}

export interface WezzleProperty {
	textContent?: string
	style?: { name: string; value: string }
}

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
            textContent: 'Button',
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
                value: ''
            }
        },
        allowedNestElements: 'none',
    },
]

export function addToOptions() {
    const optionContainer = document.getElementById('wz-options')

    puzzleOptions.forEach(puzzle => {
        const el = document.createElement('div')
        el.classList.add('puzzle-piece')
        
        el.dataset.id = puzzle.name
        el.dataset.name = puzzle.displayname

        optionContainer?.appendChild(el)
        el.onclick = () => addWezzle(el)
    });
}

export const processProperty = {
    style: (
        nameModifier: HTMLInputElement,
        valueModifier: HTMLInputElement,
        properties: WezzleProperty
    ) => {
        const stylePropertyObject = properties.style!
        nameModifier.classList.remove('value-error', 'value-valid')

        bindInput(stylePropertyObject.name, nameModifier, val => {
            const validProps = [...Object.keys(document.body.style)]
            const modifiedVal = dashToCamel(val)

            if (val.length === 0) {
                nameModifier.classList.remove('value-error', 'value-valid')
                stylePropertyObject.name = val
            }

            else if (validProps.includes(modifiedVal)) {
                nameModifier.classList.replace('value-error', 'value-valid') || nameModifier.classList.add('value-valid')
                stylePropertyObject.name = val
            } 
            
            else nameModifier.classList.replace('value-valid', 'value-error') || nameModifier.classList.add('value-error')
        })

        bindInput(stylePropertyObject.value, valueModifier, val => {
            stylePropertyObject.value = dashToCamel(val)
        })
    }
}