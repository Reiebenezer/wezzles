export interface Puzzle {
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
    style?: { name: string; value: string} 
}

export type PuzzleChildArray = Array<string | { id: string; children: PuzzleChildArray} >
