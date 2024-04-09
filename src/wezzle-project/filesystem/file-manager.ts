import { KeyboardManager } from "../keyboard"
import { parsedWezzle, WezzleData, ExportWezzle, ExportWezzleData } from "../wezzle/types"
import { WezzleInstance } from "../wezzle/wezzle"

export default class FileManager {
	static #instance: FileManager

	fileExtension = '.wzzl'
    instance_container = document.getElementById('wz-playground')!

	constructor() {
		if (FileManager.#instance)
            throw new ReferenceError('You cannot create another instance!')

		FileManager.#instance = this

		KeyboardManager.instance.on('save', e => {
			e.preventDefault()

			const filename = prompt('Save Wezzle Project', 'My Wezzle Project')
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
    
	download(filename: string) {
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

		const blob = new Blob([JSON.stringify(wzData)], { type: 'application/json' })
		const url  = URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = `${filename}.wzzl`
		link.click()
		URL.revokeObjectURL(url)
    }

	async upload() {
		const input = document.createElement('input')
		input.type = 'file'
		input.accept = '.wzzl'
		input.onchange = async (e) => {
			const files = (e.target as HTMLInputElement).files
			if (!files) return
			if (!files[0].name.endsWith('.wzzl')) 
				return alert('Error: The uploaded file is not a wezzle project!')
			
			const wzData = JSON.parse(await files[0].text()) as ExportWezzleData[]
			WezzleInstance.loadFromData(wzData, this.instance_container)
		}

		input.click()
	}

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
}