declare module 'dom-autoscroller' {
    export function autoScroll(element: Element, options: object): any
    export function autoScroll(elements: HTMLElement[], options: object): any
    export default function autoScroll(elements: Element|Element[], options: object|{
        autoScroll: (this: {down: any}) => boolean
    }): any
}
