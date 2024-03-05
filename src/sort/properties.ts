import { camelToDash } from "../typing";
import { playgroundItems } from "../global";
import { parse } from "../parsing";
import { processProperty } from "../global";

const propertiesPanel = document.getElementById('wz-properties')!

export function showProperties(id: string) {
    const element = playgroundItems[id]
    const properties = element.properties

    hideProperties()

    if (!properties || Object.keys(properties).length === 0) {
        return
    }

    for (const [ key, value ] of Object.entries(properties)) {
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
                        propertyModifier.children.item(0)?.firstElementChild as HTMLInputElement,
                        propertyModifier.children.item(1)?.firstElementChild as HTMLInputElement,
                        properties
                    );

                    (propertyModifier.children.item(0)!.firstElementChild as HTMLInputElement).onchange = () => parse(true);
                    (propertyModifier.children.item(1)!.firstElementChild as HTMLInputElement).onchange = () => parse(true);

                    break;
            
                default:
                    break;
            }
        } else {
            const input = propertyModifier.firstElementChild as HTMLInputElement

            switch (key) {
                case 'textContent':
                    processProperty.textContent(input, properties)
                    propertyModifier.onkeyup = () => parse(true)
                    break;
            
                default:
                    break;
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