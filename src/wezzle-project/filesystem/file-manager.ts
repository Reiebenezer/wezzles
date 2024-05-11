/**
 * Initialization function for the file manager of the web application
 */

import Swal from "sweetalert2"
import { KeyboardManager } from "../keyboard"
import { parsedWezzle, WezzleData, ExportWezzle } from "../wezzle/types"
import { WezzleInstance } from "../wezzle/wezzle"

export default class FileManager {
	static #instance: FileManager

	fileExtension = '.wzzl'
    instance_container = document.getElementById('wz-playground')!

	// function for saving or opening a created work 
	constructor() {
		if (FileManager.#instance)
            throw new ReferenceError('You cannot create another instance!')

		FileManager.#instance = this

		KeyboardManager.instance.init().on('save', async e => {
			e.preventDefault()

			// const filename = prompt('Save Wezzle Project', 'My Wezzle Project')
			const { value: filename } = await Swal.fire({
				title: 'Save Wezzle Project',
				input: 'text',
				inputLabel: 'Your Wezzle Project Name',
				inputValue: 'My Wezzle Project',
				inputValidator(value) {
					if (!value)
						return "You need to add a project name!"
				}
			})
			if (filename)
				this.download(filename)
		})

		.on('upload', e => {
			e.preventDefault()
			this.upload()
		})
	}

    static get instance() {
        if (!FileManager.#instance)
            FileManager.#instance = new FileManager()

        return FileManager.#instance
    }
    // download function to save created work on disk
	download(filename: string) {
		const wzData = this.convertToJSON()

		const blob = new Blob([JSON.stringify(wzData)], { type: 'application/octet-stream' })
		const url  = URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = `${filename}.wzzl`
		link.click()
		URL.revokeObjectURL(url)
    }
	// upload function to open created work from disk
	async upload() {
		const input = document.createElement('input')
		input.type = 'file'
		input.accept = '.wzzl'
		input.onchange = async (e) => {
			const files = (e.target as HTMLInputElement).files
			// validating input file name
			if (!files) return
			if (!files[0].name.endsWith('.wzzl')) {
				Swal.fire({
					icon: "error",
					title: "Upload Error",
					text: 'The uploaded file is not a wezzle project!'
				})
				return
			}
			
			// Loading and Parsing JSON file as a Wezzle Export
			const wzData = JSON.parse(await files[0].text()) as ExportWezzle[]

			// Pop up notification when opening an upload with an existing file opened
			if (this.instance_container.innerHTML) {
				Swal.fire({
					title: "Project Conflict",
					icon: "question",
					text: "Open the existing project, or append it to the existing one?",
					showCancelButton: true,
					cancelButtonText: "Append to existing",
					confirmButtonText: "Close existing and open"
				}).then(result => {
					if (result.isConfirmed) {
						this.instance_container.innerHTML = ''
					}
					WezzleInstance.loadFromData(wzData, this.instance_container)
				})
			} else {
				WezzleInstance.loadFromData(wzData, this.instance_container)
			}
		}

		input.click()
	}

	// upload function to open created work from homepage
	async uploadFromHome(): Promise<ExportWezzle[]> {
		const input = document.createElement('input')
		input.type = 'file'
		input.accept = '.wzzl'
		let wzData: ExportWezzle[] | undefined;
		input.onchange = async (e) => {
			const files = (e.target as HTMLInputElement).files
			// validating input file name
			if (!files) return
			if (!files[0].name.endsWith('.wzzl')) {
				Swal.fire({
					icon: "error",
					title: "Upload Error",
					text: 'The uploaded file is not a wezzle project!'
				})
				return
			}
			
			wzData = JSON.parse(await files[0].text()) as ExportWezzle[]
		}

		input.click()
		return new Promise<ExportWezzle[]>(resolve => setInterval(() => {
			if (wzData !== undefined)
				resolve(wzData)
		}, 1))
	}

	/**
	 * ### Get Wezzle Order 
	 * Converts elements into wezzle instances
	 * For each element in the wezzle playground panel
	 */
	getWezzleOrder(elements: HTMLElement[]) {
		const arr = new Array<parsedWezzle>()

		elements.forEach(el => {
			const contents = el.querySelector(
				':scope > .wz-extender > .contents'
			)

			if (contents === null || !contents.hasChildNodes())
				arr.push(WezzleInstance.getInstance(el))
			else
				arr.push({
					parent: WezzleInstance.getInstance(el),
					children: this.getWezzleOrder([
						...contents.querySelectorAll(
							':scope > :is(.wz, .wz-extendable)'
						),
					] as HTMLElement[]),
				})
		})

		return arr
	}

	/**
	 * ### Convert to JSON
	 * Fetches the HTML elements from the wezzle playground,
	 * converts them to wezzle instances via `getWezzleOrder`,
	 * and returns them as minified JSON for file saving
	 */
	convertToJSON() {
		const children = [...this.instance_container.querySelectorAll(':scope > :is(.wz, .wz-extendable)')] as HTMLElement[]
        const wzData = this.getWezzleOrder(children).map(function map(wz): ExportWezzle {
            if (wz instanceof WezzleInstance) {
                return minify(wz.data)
            } else {
                return {
                    parent: minify(wz.parent.data),
                    children: wz.children.map(map)
                }
            }
        })

		function minify(data: WezzleData) {
			return {
				name: data.name,
				properties: data.properties.map(item => {
					return { token: item.token, value: item.value }
				}),
			}
		}

		return wzData
	}
	
	/**
	 * ### Save Local Project
	 * Saves the wezzle project via localStorage
	 */
	saveLocalProject() {
		const data = this.convertToJSON()
		localStorage.setItem('local-project-data', JSON.stringify(data))
	}

	/**
	 * ### Retrieve Local Project
	 * Retrieves the wezzle project from localStorage
	 */
	getLocalProject() {
		const data_str = localStorage.getItem('local-project-data')
		if (!data_str) return

		const data = JSON.parse(data_str) as ExportWezzle[]
		WezzleInstance.loadFromData(
			data,
			this.instance_container ?? document.getElementById('wz-playground')
		)
	}
}