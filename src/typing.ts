
export function a_an(s: string): "a" | "an" {
    if (s.toLowerCase().startsWith('a') ||
        s.toLowerCase().startsWith('e') ||
        s.toLowerCase().startsWith('i') ||
        s.toLowerCase().startsWith('o') ||
        s.toLowerCase().startsWith('u'))
        return 'an'
    else return 'a'
}export function camelToDash(str: string) {
    return str.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)
}
export function dashToCamel(str: string) {
    return str.replace(/-[a-z]/g, match => `${match.toUpperCase().replace('-', '')}`)
}

