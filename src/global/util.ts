export class ExtendedElement {
    element: Element

    constructor(element: Element)
    constructor(tagName: string)
    constructor(elementOrName: Element | string)
    constructor(elementOrName: Element | string) {
        this.element = 
            typeof elementOrName === 'string'
            ? document.createElement(elementOrName)
            : elementOrName
    }
    
    html(html: string, replace = true) {
        this.element.innerHTML = replace ? html : this.element.innerHTML + html
        return this
    }

    class(...tokens: string[]) {
        this.element.classList.add(...tokens)
        return this
    }

    toggleClass(token: string) {
        this.element.classList.toggle(token)
        return this
    }

    onclick(handler: (evt: Event, instance: ExtendedElement) => void) {
        this.element.addEventListener('click', e => handler(e, this))

        return this
    }

    on<K extends keyof ElementEventMap>(type: K, listener: (this: Element, ev: ElementEventMap[K]) => any) {
        this.element.addEventListener(type, listener)
        return this
    }

    setProp(token: string, value: string) {
        this.element.setAttribute(token, value)
        return this
    }

    getProp(token: string) {
        return this.element.getAttribute(token)
    }

    append(...elements: Array<Element | ExtendedElement>) {
        elements.forEach(el => this.element.appendChild(
            el instanceof ExtendedElement ? el.element : el
        ))
        return this
    }

    get children() {
        return [...this.element.children].map(child => new ExtendedElement(child))
    }

    setStyle(name: string, value: string) {
        (this.element as HTMLElement).style.setProperty(name, value)
        return this
    }

    id(name: string) {
        this.element.id = name
        return this
    }
}

export class ExtendedInputElement extends ExtendedElement {
    bind(initialValue: string | undefined, callbackOnChange: (value: string) => void) {
        if (
            this.element instanceof HTMLInputElement || 
            this.element instanceof HTMLTextAreaElement
        ) {
            ;(this.element as HTMLInputElement).value = initialValue ?? ''
            ;(this.element as HTMLInputElement).oninput = () => callbackOnChange((this.element as HTMLInputElement).value)
        }

        else if (this.element instanceof HTMLSelectElement)  {
            const option = (this.element as HTMLSelectElement).options.namedItem(initialValue ?? '')

            if (option) {
                option.selected = true
            } else {
                (this.element as HTMLSelectElement).options[0].selected = true
            }
            this.element.onchange = () => callbackOnChange((this.element as HTMLSelectElement).value)
        }

        return this
    }

}

export function deviceOrientation() {
    return window.innerWidth >= window.innerHeight
        ? 'landscape'
        : 'portrait'
}

export function deviceTypeByWidth() {
    if (deviceOrientation() === 'portrait') {
        if (window.innerWidth <= 420) return 'phone'
        if (window.innerWidth <= 820) return 'tablet'
    } else {
        if (window.innerHeight <= 420) return 'phone'
        if (window.innerHeight <= 820) return 'tablet'
    }

    return 'desktop'
}

export function cloneObject(obj: object) {
    return JSON.parse(JSON.stringify(obj))
}

let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
export let prefersReducedMotion = reducedMotion.matches
reducedMotion.addEventListener('change', e => prefersReducedMotion = e.matches)

export function camelToDisplay(camelCaseText: string, separator: string = '-') {
    return camelCaseText.replace(/[A-Z]/g, match => `${separator}${match.toLowerCase()}`)
}

export function findElementMatch(element: Element, direction: 'previous' | 'next', matchFunction: (el: Element) => boolean): Element | null {
    const sibling = direction === 'previous' ? element.previousElementSibling : element.nextElementSibling
    if (sibling === null) return null
    if (matchFunction(sibling)) return sibling

    return findElementMatch(sibling, direction, matchFunction)
}