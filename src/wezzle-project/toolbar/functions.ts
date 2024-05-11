/**
 * # TOOLBAR.TS
 * 
 * Functions and Animations for toolbar
 */


import anime from "animejs"
import {
	camelToDisplay,
	capitalizeFirstLetters,
	getUserSettings,
} from "../global/util"
import { util } from "../global"
import { WezzleInstance } from "../wezzle/wezzle"
import WezzleManager from "../wezzle/wezzle-manager"


/**
 * ### Toolbar functions
 */
export function settings() {
	const panel = document.getElementById("wz-settings")! as HTMLDialogElement
	const area = panel.querySelector(".area") as HTMLElement
	const close = panel.querySelector(".close") as HTMLButtonElement

	// Function to show settings panel
	panel.showModal()
	
	;(panel.querySelector(":scope > div") as HTMLElement).onclick = e =>
		e.stopPropagation()

	panel.onkeydown = e => {
		if (e.code === "Escape") {
			e.preventDefault()
			closeModal()
		}
	}
	// fetch settings from local storage
	showSettings()

	// Animate the settings panel
	anime({
		targets: panel,
		scale: [0, 1],
		easing: "easeOutQuart",
		duration: 300,
		complete() {
			panel.onclick = close.onclick = closeModal
		},
	})
	// Function to close settings panel
	function closeModal() {
		anime({
			targets: panel,
			scale: 0,
			easing: "easeInQuart",
			duration: 300,
			complete() {
				panel.close()
			},
		})
	}
	
	/**
	 * ### Fetch settings
	 * fetch settings from local storage
	 * 
	*/
	function showSettings() {
		const settings = getUserSettings()

		area.innerHTML = ""
		// fetch settings for each value from local storage
		settings.forEach((setting, key) => {
			const label = new util.ExtendedElement("label").html(
				capitalizeFirstLetters(camelToDisplay(key, " "))
			)
			const input = new util.ExtendedInputElement("input")

			let type = typeof setting as string
			if (type === "boolean") type = "checkbox"

			input.setProp("type", type)

			if (type === "checkbox") {
				input.bind(setting ? "true" : "false", val => {
					settings.set(key, val === "true")
					update()
				})
			} else {
				input.bind((setting as string | number).toString(), val => {
					settings.set(key, val)
					update()
				})
			}
			// Insert the input element inside the label
			label.append(input)

			// Add the label tag to the settings panel
			area.appendChild(label.element)
			
			// Automatically update the project based on the settings
			function update() {
				util.setUserSettings(settings)
				;(
					document.getElementById("wz-preview") as HTMLIFrameElement
				).contentWindow?.postMessage("settings-update")

				if (key === "useRemsInsteadOfPixels") {
					WezzleInstance.instances.forEach(instance => {
						const prop = instance.data.properties.find(
							p => p.token === "Value (Units)"
						)

						if (prop) {
							prop.value = settings.get(key) 
								? (parseFloat(prop.value ?? "0") / 16).toString()
								: (parseFloat(prop.value ?? "0") * 16).toString()
						}
					})

					WezzleManager.instance.instance_container.querySelector('.selected')?.classList.remove('selected')
				}
			}
		})
	}
}
