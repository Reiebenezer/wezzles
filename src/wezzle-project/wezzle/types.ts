import { WezzleInstance } from './wezzle'

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
	style,
}

export interface WezzleProperty {
	token:
		| 'Text Content'
		| 'Placeholder'
		| 'Initial Value'
		| 'Orientation'
		| 'Style Type'
		| 'Style Value'
		| 'Input Type'
		| 'Value (Units)'
		| 'Image URL'
		| 'Alternative Caption'

	input_type:
		| 'text'
		| 'multiline-text'
		| 'number'
		| 'select'
		| 'text-with-datalist'
		| 'color'
		
	options?: { value: string; display_text: string }[]
	value?: string
}

export type parsedWezzle =
	| WezzleInstance
	| { parent: WezzleInstance; children: parsedWezzle[] }

export type parsedStringWezzle =
	| string
	| { parent: string; children: parsedStringWezzle[] }
    
export type parsedWezzleData = WezzleData | { parent: WezzleData; children: parsedWezzleData[]} 

export interface ExportWezzleData {
	name: string
	properties: {
		token: string
		value?: string
	}[]
}

export type ExportWezzle =
	| ExportWezzleData
	| { parent: ExportWezzleData; children: ExportWezzle[] }