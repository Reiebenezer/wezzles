import { bindInput } from "./functions";
import { dashToCamel } from "./typing";
import { EssentialPuzzleList, Puzzle, WezzleProperty } from "./types";


export const playgroundItems: EssentialPuzzleList = {};export const AnimationTypes = {
    fancy: 'cubic-bezier( 0.215, 0.61, 0.355, 1 )',
    fast: 'cubic-bezier(0.23, 1, 0.32, 1)',
    bouncy: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    static: 'linear',
    none: undefined,
};

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
                value: ''
            }
        },
        allowedNestElements: 'none',
    },
];

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
    },
    textContent: (modifier: HTMLInputElement, properties: WezzleProperty) => {
        bindInput(properties.textContent!, modifier, val => properties.textContent = val)
    }
}

export const PLAYGROUND: HTMLElement = document.getElementById('wz-playground') as HTMLElement;
export const CANVAS: HTMLCanvasElement = document.getElementById('wz-arrow') as HTMLCanvasElement;
export const CANVASCONTEXT: CanvasRenderingContext2D | null = CANVAS.getContext('2d')