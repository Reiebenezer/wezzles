import WezzleManager from './wezzle-project/wezzle/wezzle-manager'
import { FileManager } from './wezzle-project/filesystem'

if (window.location.pathname !== '/')
	window.location.href = '/'

export default function load() {
	WezzleManager.instance.init().then(() => {
		document.getElementById('project-app')?.style.setProperty('opacity', '1')
	})

	window.addEventListener('beforeunload', () => {
		FileManager.instance.saveLocalProject()
	})
}