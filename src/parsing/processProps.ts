import { WezzleProperty } from '../types';


export default function processProperties(properties: WezzleProperty, element: HTMLElement) {
	if (properties.style?.name && properties.style.value) {
		element.innerHTML = `${properties.style.name}:${properties.style.value}`
	}

	if (properties.textContent) {
		element.innerText = properties.textContent ?? ''
	}

	if (properties.value) {
		(element as HTMLInputElement).setAttribute('value', properties.value)
	}

	if (properties.placeholder) {
		(element as HTMLInputElement).placeholder = properties.placeholder
	}
}
