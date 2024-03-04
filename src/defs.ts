import Toastify from "toastify-js"
import { EssentialPuzzleList } from "./puzzle-pieces"

export const playgroundItems: EssentialPuzzleList = {}

export const notify = {
    error: (message: string) => {
        Toastify({
            text: message,
            duration: 2500,
            style: {
                background: 'linear-gradient(to right, hsl(0, 49%, 46%) 0%, hsl(10, 86%, 60%) 100%)',
            },
        }).showToast()
    },
    warn: (message: string) => {
        Toastify({
            text: message,
            duration: 2500,
            style: {
                background:
                    'linear-gradient(90deg, hsl(50, 49%, 46%) 0%, hsl(60, 86%, 60%) 100%)',
            },
        }).showToast()
    },
    info: (message: string) => {
        Toastify({
            text: message,
            duration: 2500,
            style: {
                background:
                    'linear-gradient(90deg, hsl(200, 49%, 46%) 0%, hsl(210, 86%, 60%) 100%)',
            },
        }).showToast()
    },
}

export function returnAsHTMLElementArray(parent: HTMLElement) {
    const children: HTMLElement[] = [];
    for (const child of parent.children) {
        children.push(child as unknown as HTMLElement);
    }

    return children;
}

export function a_an(s: string) {
    if (
        s.toLowerCase().startsWith('a') ||
        s.toLowerCase().startsWith('e') ||
        s.toLowerCase().startsWith('i') ||
        s.toLowerCase().startsWith('o') ||
        s.toLowerCase().startsWith('u')
    )
        return 'an';
    else return 'a';
}

export function isSameArray(a: PuzzleChildArray, b: PuzzleChildArray) {
    if (a === b) return true
    if (a.length !== b.length) return false

    for (let i = 0; i < a.length; i++) {
        const item_a = a[i]
        const item_b = b[i]

        if (typeof item_a === 'object' && typeof item_b === 'object') {
            if (item_a.id !== item_b.id) return false

            return isSameArray(item_a.children, item_b.children)
        } else if (item_a !== item_b) return false
    }

    return true
}

export function getAllPuzzleChildrenIDs(element: HTMLElement) {
    const IDs: PuzzleChildArray = []

    for (const child of ([...element.children] as HTMLElement[]).filter(item => item.classList.contains('puzzle-piece'))) {
        
        if (child.hasChildNodes()) IDs.push({ id: child.dataset.id!, children: getAllPuzzleChildrenIDs(child)})
        else IDs.push(child.dataset.id!)
    }

    return IDs
}

type PuzzleChildArray = Array<string | { id: string, children: PuzzleChildArray }>

export function camelToDash(str: string) {
    return str.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)
}

export function dashToCamel(str: string) {
    return str.replace(/-[a-z]/g, match => `${match.toUpperCase().replace('-', '')}`)
}

export function bindInput(initValue: string, input: HTMLInputElement, callback: (changedValue: string) => any) {
    input.value = initValue

    input.onkeyup = () => callback(input.value)
}

export const AnimationTypes = {
	fancy: 'cubic-bezier( 0.215, 0.61, 0.355, 1 )',
	fast: 'cubic-bezier(0.23, 1, 0.32, 1)',
	bouncy: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
	static: 'linear',
	none: undefined,
}
