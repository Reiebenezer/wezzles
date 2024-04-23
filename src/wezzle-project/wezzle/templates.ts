import { camelToDisplay } from '../global/util'
import { WezzleData, WezzleGroup } from './types'

const templates: WezzleData[] = [
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
		name: 'Container',
		extendable: true,
		group: WezzleGroup.container,
		parsed_name: 'div',
		properties: [
			{
				token: 'Orientation',
				input_type: 'select',
				options: [
					{
						display_text: 'Vertical',
						value: 'vertical',
					},
					{
						display_text: 'Horizontal',
						value: 'horizontal',
					},
				],
				value: 'horizontal'
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
				token: 'Style Type',
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
					{
						value: 'password',
						display_text: 'Password'
					}
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
	{
		name: 'Margin',
		extendable: false,
		group: WezzleGroup.style,
		parsed_name: 'style',
		properties: [
			{
				token: 'Style Type',
				input_type: 'select',
				options: [
					{
						display_text: 'Margin (All Sides)',
						value: 'margin'
					},
					{
						display_text: 'Top Margin',
						value: 'margin-top'
					},
					{
						display_text: 'Right Margin',
						value: 'margin-right'
					},
					{
						display_text: 'Left Margin',
						value: 'margin-left'
					},
					{
						display_text: 'Bottom Margin',
						value: 'margin-bottom'
					},
					{
						display_text: 'Top and Bottom Margin',
						value: 'margin-block'
					},
					{
						display_text: 'Left and Right Margin',
						value: 'margin-inline'
					}
				],
				value: 'margin'
			},
			{
				token: 'Value (Units)',
				input_type: 'number',
				value: '1'
			}
		]
	},
	{
		name: 'Padding',
		extendable: false,
		group: WezzleGroup.style,
		parsed_name: 'style',
		properties: [
			{
				token: 'Style Type',
				input_type: 'select',
				options: [
					{
						display_text: 'Padding (All Sides)',
						value: 'padding'
					},
					{
						display_text: 'Top Padding',
						value: 'padding-top'
					},
					{
						display_text: 'Right Padding',
						value: 'padding-right'
					},
					{
						display_text: 'Left Padding',
						value: 'padding-left'
					},
					{
						display_text: 'Bottom Padding',
						value: 'padding-bottom'
					},
					{
						display_text: 'Top and Bottom Padding',
						value: 'padding-block'
					},
					{
						display_text: 'Left and Right Padding',
						value: 'padding-inline'
					}
				],
				value: 'padding'
			},
			{
				token: 'Value (Units)',
				input_type: 'number',
				value: '1'
			}
		]
	},
	{
		name: 'Alignment', // justify-content
		extendable: false,
		group: WezzleGroup.style,
		parsed_name: 'style',
		properties: [
			{
				token: 'Style Type',
				input_type: 'select',
				options: [
					{
						display_text: 'Vertical Alignment',
						value: 'align-items'
					},
					{
						display_text: 'Horizontal Alignment',
						value: 'justify-items'
					}
				],
				value: 'align-items'
			},
			{
				token: 'Style Value',
				input_type: 'select',
				options: [
					{
						display_text: 'Beginning',
						value: 'flex-start'
					},
					{
						display_text: 'Center',
						value: 'center'
					},
					{
						display_text: 'End',
						value: 'flex-end'
					},
					{
						display_text: 'Fill Space',
						value: 'stretch'
					}
				],
				value: 'center'
			}
		]
	},
	{
		name: 'Distribution',
		extendable: false,
		group: WezzleGroup.style,
		parsed_name: 'style',
		properties: [
			{
				token: 'Style Type',
				input_type: 'select',
				options: [
					{
						display_text: 'Horizontal Distribution',
						value: 'justify-content'
					},
					{
						display_text: 'Vertical Distribution',
						value: 'align-content'
					}
				],
				value: 'justify-content'
			},
			{
				token: 'Style Value',
				input_type: 'select',
				options: [
					{
						display_text: 'Beginning',
						value: 'flex-start'
					},
					{
						display_text: 'Center',
						value: 'center'
					},
					{
						display_text: 'End',
						value: 'flex-end'
					},
					{
						display_text: 'Constant Object Margin',
						value: 'space-around'
					},
					{
						display_text: 'Spread Out',
						value: 'space-between'
					},
					{
						display_text: 'Equal Spacing',
						value: 'space-evenly'
					}
				],
				value: 'center'
			}
		]
	},
	{
		name: 'Image',
		extendable: false,
		group: WezzleGroup.interactable,
		parsed_name: 'img',
		properties: [
			{
				token: 'Image URL',
				input_type: 'text',
			},
			{
				token: 'Alternative Caption',
				input_type: 'text',
				value: 'Image'
			}
		]
	},
	{
		name: 'Quote',
		extendable: false,
		group: WezzleGroup.text,
		parsed_name: 'blockquote',
		properties: [
			{
				token: 'Text Content',
				input_type: 'multiline-text'
			}
		]
	},
	{
		name: 'Background Color',
		extendable: false,
		group: WezzleGroup.style,
		parsed_name: 'style',
		properties: [
			{
				token: 'Style Type',
				input_type: 'select',
				options: [
					{
						display_text: 'Background Color',
						value: 'background-color'
					}
				],
				value: 'background-color'
			},
			{
				token: 'Style Value',
				input_type: 'color',
			}
		]
	},
	{
		name: 'Text Color',
		extendable: false,
		group: WezzleGroup.style,
		parsed_name: 'style',
		properties: [
			{
				token: 'Style Type',
				input_type: 'select',
				options: [
					{
						display_text: 'Text Color',
						value: 'color'
					}
				],
				value: 'color'
			},
			{
				token: 'Style Value',
				input_type: 'color',
			}
		]
	},
	{
		name: 'Unordered List',
		extendable: true,
		group: WezzleGroup.container,
		parsed_name: 'ul',
		properties: []
	},
	{
		name: 'Ordered List',
		extendable: true,
		group: WezzleGroup.container,
		parsed_name: 'ol',
		properties: []
	},
	{
		name: 'List Item',
		extendable: true,
		group: WezzleGroup.container,
		parsed_name: 'li',
		properties: []
	},
]
export default templates