import Toastify from "toastify-js"
import { Puzzle, PuzzleChildArray, PuzzleGroup } from "./types"
import { puzzleOptions } from "./global"
import { addWezzle } from "./animations"
import { DEFAULT_GAP } from "./config"

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
    return JSON.stringify(a) === JSON.stringify(b)
}

export function getAllPuzzleChildrenIDs(element: HTMLElement) {
    const IDs: PuzzleChildArray = []

    for (const child of ([...element.children] as HTMLElement[]).filter(item => item.classList.contains('puzzle-piece'))) {
        
        if (child.hasChildNodes()) IDs.push({ id: child.dataset.id!, children: getAllPuzzleChildrenIDs(child)})
        else IDs.push(child.dataset.id!)
    }

    return IDs
}

export function bindInput(initValue: string, input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, callback: (changedValue: string) => any) {
    input.value = initValue

    if (input.tagName === 'SELECT')
        input.onchange = () => callback(input.value)

    else
        input.onkeyup = () => callback(input.value)
}

export function addToOptions() {
    // Get the option container
    const optionContainer = document.getElementById('wz-options')!
    
    // Get the category container
    const categoryContainer = document.getElementById('wz-categories')!

    // Get the sorted options
    const sortedOptions = puzzleOptions.sort((a, b) => a.group - b.group)

    for (const [key, value] of Object.entries(PuzzleGroup).filter(item => Number.isNaN(+item[0]))) {
        const btn = document.createElement('button')
        btn.classList.add('wz-group')

        btn.dataset.name = key
        btn.innerHTML = key[0]

        btn.onclick = e => {
            e.stopPropagation()
            
            const el = Array.from(optionContainer.children).find(
				opt =>
					(opt as HTMLElement).dataset.id ===
					sortedOptions.filter(item => item.group === value)[0].name
			)

            optionContainer.scrollTo({
                behavior: 'smooth',
                top: isMobile() ? 0 : (el as HTMLElement)?.offsetTop - DEFAULT_GAP + 1,
                left: isMobile() ? (el as HTMLElement)?.offsetLeft - DEFAULT_GAP + 1 : 0
            })
        }

        categoryContainer.appendChild(btn)
    }

    sortedOptions.forEach((puzzle: Puzzle) => {
        // Process the exclude calls for puzzle pieces
        if (!puzzle.include && puzzle.exclude) {
            puzzle.include = puzzleOptions.map(item => item.name).filter(p => p !== puzzle.name && !puzzle.exclude?.includes(p))
        }

        // Create option elements for each puzzle piece
		const el = document.createElement('div')
		el.classList.add('puzzle-piece')

		el.dataset.id = puzzle.name
		el.dataset.name = puzzle.displayname

		optionContainer?.appendChild(el)
		el.onclick = () => addWezzle(el)
	})
}

export function getBounds(source: HTMLElement, offset = false) {
    const coords = source.getBoundingClientRect()
    return {
        x: offset ? source.offsetLeft : coords.left,
        y: offset ? source.offsetTop  : coords.top,
        w: coords.width,
        h: coords.height
    }
}

export function isMobile() {
    return screen.width <= 820
}
