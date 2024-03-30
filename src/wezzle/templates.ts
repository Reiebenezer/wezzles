import { camelToDisplay } from '../global/util'
import { WezzleData, WezzleGroup } from './types'

export const templates: WezzleData[] = [
	{
		name: 'Paragraph Text',
		extendable: false,
		group: WezzleGroup.text,
		parsed_name: 'p',
		properties: [
			{
				token: 'Text Content',
				input_type: 'multiline-text',
			},
		],
	},
	{
		name: 'Generic Container',
		extendable: true,
		group: WezzleGroup.container,
		parsed_name: 'div',
		properties: [
			{
				token: 'Alignment',
				input_type: 'select',
				options: [
					{
						display_text: 'Automatic',
						value: 'auto',
					},
					{
						display_text: 'Vertical',
						value: 'vertical',
					},
					{
						display_text: 'Horizontal',
						value: 'horizontal',
					},
				],
			},
		],
	},
	{
		name: 'Heading',
		extendable: false,
		group: WezzleGroup.text,
		parsed_name: 'h1',
		properties: [
			{
				token: 'Text Content',
				input_type: 'multiline-text',
			},
		],
	},
	{
		name: 'Subheading',
		extendable: false,
		group: WezzleGroup.text,
		parsed_name: 'h2',
		properties: [
			{
				token: 'Text Content',
				input_type: 'multiline-text',
			},
		],
	},
	{
		name: 'Subheading 2',
		extendable: false,
		group: WezzleGroup.text,
		parsed_name: 'h3',
		properties: [
			{
				token: 'Text Content',
				input_type: 'multiline-text',
			},
		],
	},
	{
		name: 'Subheading 3',
		extendable: false,
		group: WezzleGroup.text,
		parsed_name: 'h4',
		properties: [
			{
				token: 'Text Content',
				input_type: 'multiline-text',
			},
		],
	},
	{
		name: 'Subheading 4',
		extendable: false,
		group: WezzleGroup.text,
		parsed_name: 'h5',
		properties: [
			{
				token: 'Text Content',
				input_type: 'multiline-text',
			},
		],
	},
	{
		name: 'Subheading 5',
		extendable: false,
		group: WezzleGroup.text,
		parsed_name: 'h6',
		properties: [
			{
				token: 'Text Content',
				input_type: 'multiline-text',
			},
		],
	},
	{
		name: 'Button',
		extendable: false,
		group: WezzleGroup.interactable,
		parsed_name: 'button',
		properties: [
			{
				token: 'Text Content',
				input_type: 'text',
			},
		],
	},
	{
		name: 'Header',
		extendable: true,
		group: WezzleGroup.container,
		parsed_name: 'header',
		properties: [],
	},
	{
		name: 'Footer',
		extendable: true,
		group: WezzleGroup.container,
		parsed_name: 'footer',
		properties: [],
	},
	{
		name: 'Line Break',
		extendable: false,
		group: WezzleGroup.text,
		parsed_name: 'br',
		properties: [],
	},
	{
		name: 'Text Box',
		extendable: false,
		group: WezzleGroup.interactable,
		parsed_name: 'textarea',
		properties: [
			{
				token: 'Placeholder',
				input_type: 'text',
			},
			{
				token: 'Initial Value',
				input_type: 'multiline-text',
			},
		],
	},
	{
		name: 'Custom Style',
		extendable: false,
		group: WezzleGroup.style,
		parsed_name: 'style',
		properties: [
			{
				token: 'Style Name',
				input_type: 'text-with-datalist',
				options: [...getComputedStyle(document.body)].map(item => {
					return {
						value: camelToDisplay(item),
						display_text: camelToDisplay(item),
					}
				}),
			},
			{
				token: 'Style Value',
				input_type: 'text',
			},
		],
	},
	{
		name: 'Input Field',
		extendable: false,
		group: WezzleGroup.interactable,
		parsed_name: 'input',
		properties: [
			{
				token: 'Input Type',
				input_type: 'select',
				options: [
					{
						value: 'text',
						display_text: 'Text',
					},
					{
						value: 'number',
						display_text: 'Number',
					},
				],
			},
			{
				token: 'Placeholder',
				input_type: 'text',
			},
			{
				token: 'Initial Value',
				input_type: 'text',
			},
		],
	},
]
