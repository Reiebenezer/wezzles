import Toastify from "toastify-js"
import { PuzzleChildArray } from "./types"
import { puzzleOptions } from "./global"
import { addWezzle } from "./animations"

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

export function bindInput(initValue: string, input: HTMLInputElement, callback: (changedValue: string) => any) {
    input.value = initValue

    input.onkeyup = () => callback(input.value)
}

export function addToOptions() {
    const optionContainer = document.getElementById('wz-options')

    puzzleOptions.forEach(puzzle => {
        const el = document.createElement('div')
        el.classList.add('puzzle-piece')

        el.dataset.id = puzzle.name
        el.dataset.name = puzzle.displayname

        optionContainer?.appendChild(el)
        el.onclick = () => addWezzle(el)
    })
}

