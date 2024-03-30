export interface WezzleData {
    name: string
    extendable: boolean
    parsed_name: string
    group: WezzleGroup
    properties: WezzleProperty[]
}

export enum WezzleGroup {
    container,
    text,
    interactable,
    style
}

export interface WezzleProperty {
    token: 
        | 'Text Content' 
        | 'Placeholder'
        | 'Initial Value'
        | 'Alignment'
        | 'Style Name'
        | 'Style Value'
        | 'Input Type'

    input_type: 'text' | 'multiline-text' | 'number' | 'select' | 'text-with-datalist'
    options?: {value: string, display_text: string}[]
    value?: string
}