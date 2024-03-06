import { openPreview } from "./parsing"

const keypresses = new Set()
export default function recordKeyboard() {
    document.addEventListener('keydown', e => {
        if (!keypresses.has(e.code)) {
            keypresses.add(e.code)
            processKeys(e)
        }
    })

    document.addEventListener('keyup', e => {
        keypresses.delete(e.code)
    })

    window.addEventListener('blur', () => keypresses.clear())
}

function processKeys(e: Event) {
    keyCombination(e, true, ['ControlLeft', 'ControlRight'], 'KeyP') && openPreview()
}

function keyCombination(e: Event, preventDefault: boolean, ...keys: Array<string[]|string>) {
    const triggered = keys.every(key => {
        if (typeof key === 'string') return keypresses.has(key)
        else return key.findIndex(subkey => keypresses.has(subkey)) !== -1
    })

    triggered && preventDefault && e.preventDefault()
    return triggered
}