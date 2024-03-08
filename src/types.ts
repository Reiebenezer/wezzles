export interface Puzzle {
    name: string
    tag: string | 'none'
    displayname: string
    properties: WezzleProperty
    include?: string[] | 'all' | 'none'
    exclude?: string[]
    group: PuzzleGroup
    existOnce?: boolean
}

export type EssentialPuzzleList = {
    [key: string]: Omit<Puzzle, 'displayname'|'group'>
}

export interface WezzleProperty {
    textContent?: string
    style?: { name: string; value: string} 
    value?: string
    placeholder?:string
}

export type PuzzleChildArray = Array<string | { id: string; children: PuzzleChildArray} >

export enum PuzzleGroup {
    container = 1,
    text,
    interactive,
    style,
}