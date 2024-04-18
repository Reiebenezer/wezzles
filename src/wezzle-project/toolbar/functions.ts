import anime from "animejs"
import {
	camelToDisplay,
	capitalizeFirstLetters,
	getUserSettings,
} from "../global/util"
import { util } from "../global"
import { WezzleInstance } from "../wezzle/wezzle"
import WezzleManager from "../wezzle/wezzle-manager"

export function settings() {
	const panel = document.getElementById("wz-settings")! as HTMLDialogElement
	const area = panel.querySelector(".area") as HTMLElement
	const close = panel.querySelector(".close") as HTMLButtonElement

	panel.showModal()
	;(panel.querySelector(":scope > div") as HTMLElement).onclick = e =>
		e.stopPropagation()
	panel.onkeydown = e => {
		if (e.code === "Escape") {
			e.preventDefault()
			closeModal()
		}
	}
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

	function showSettings() {
		const settings = getUserSettings()

		area.innerHTML = ""
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

			label.append(input)

			area.appendChild(label.element)

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
