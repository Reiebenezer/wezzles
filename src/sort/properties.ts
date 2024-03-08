import { camelToDash, dashToCamel } from '../typing'
import { playgroundItems } from '../global'
import parse from '../parsing/parse'
import { bindInput } from '../functions'
import { WezzleProperty } from '../types'

const propertiesPanel = document.getElementById('wz-properties')!

export function showProperties(id: string) {
	const element = playgroundItems[id]
	const properties = element.properties

	hideProperties()

	if (!properties || Object.keys(properties).length === 0) {
		return
	}

	for (const [key, value] of Object.entries(properties)) {
		const dashKey = 'wz-property-' + camelToDash(key)
		const propertyModifier = document.getElementById(dashKey)!

		propertyModifier.classList.add('wz-visible')

		// NOTE: This is for the container ::before pseudo placeholder. Do not remove
		propertyModifier.dataset.wzShowProperty = 'true'

		// This is for object-based properties, such as style, etc.
		if (typeof value === 'object') {
			switch (key) {
				case 'style':
					processProperty.style(
						propertyModifier.children.item(0)
							?.firstElementChild as HTMLInputElement,
						propertyModifier.children.item(1)
							?.firstElementChild as HTMLInputElement,
						properties
					)

					;(
						propertyModifier.children.item(0)!
							.firstElementChild as HTMLInputElement
					).onchange = () => parse(true)
					;(
						propertyModifier.children.item(1)!
							.firstElementChild as HTMLInputElement
					).onchange = () => parse(true)

					break

				default:
					break
			}
		} else {
			const input = propertyModifier.firstElementChild

			switch (key) {
				case 'textContent':
					processProperty.textContent(input as HTMLTextAreaElement, properties)
					propertyModifier.onkeyup = () => parse(true)
					break
				
				case 'placeholder':
					processProperty.placeholder(properties)
					propertyModifier.onkeyup = () => parse(true)
					break

				case 'value':
					processProperty.value(properties)
					propertyModifier.onkeyup = () => parse(true)
					break

				case 'titleSize':
					processProperty.titleSize(properties)
					propertyModifier.onchange = () => parse(true)
					break

				default:
					break
			}

			propertyModifier.onchange = () => parse(true)
		}
	}
}

export function hideProperties() {
	for (const prop of [...propertiesPanel.children] as HTMLElement[]) {
		prop.classList.remove('wz-visible')

		// NOTE: This is for the container ::before pseudo placeholder. Do not remove
		prop.dataset.wzShowProperty = ''
	}
}
export const processProperty = {
	style: (
		nameModifier: HTMLInputElement,
		valueModifier: HTMLInputElement,
		properties: WezzleProperty
	) => {
		const stylePropertyObject = properties.style!
		nameModifier.classList.remove('value-error', 'value-valid')

		bindInput(stylePropertyObject.name, nameModifier, val => {
			const validProps = [...Object.keys(document.body.style)]
			const modifiedVal = dashToCamel(val)

			if (val.length === 0) {
				nameModifier.classList.remove('value-error', 'value-valid')
				stylePropertyObject.name = val
			} else if (validProps.includes(modifiedVal)) {
				nameModifier.classList.replace('value-error', 'value-valid') ||
					nameModifier.classList.add('value-valid')
				stylePropertyObject.name = val
			} else
				nameModifier.classList.replace('value-valid', 'value-error') ||
					nameModifier.classList.add('value-error')
		})

		bindInput(stylePropertyObject.value, valueModifier, val => {
			stylePropertyObject.value = val
		})
	},
	textContent: (modifier: HTMLTextAreaElement, properties: WezzleProperty) => {
		bindInput(
			properties.textContent!,
			modifier,
			val => (properties.textContent = val)
		)
	},
	value: (properties: WezzleProperty) => {
		bindInput(
			properties.value!,
			document.getElementById('wz-property-value')!.firstElementChild as HTMLInputElement,
			val => properties.value = val
		)
	},
	placeholder: (properties: WezzleProperty) => {
		bindInput(
			properties.placeholder!,
			document.getElementById('wz-property-placeholder')!.firstElementChild as HTMLInputElement,
			val => properties.placeholder = val
		)
	},
	titleSize: (properties: WezzleProperty) => {
		bindInput(
			properties.titleSize!,
			document.getElementById('wz-property-title-size')!.firstElementChild as HTMLSelectElement,
			val => properties.titleSize = val
		)
	}
}
