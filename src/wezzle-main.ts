import Wezzle from './wezzle-project/wezzle/wezzle'
import WezzleManager from './wezzle-project/wezzle/wezzle-manager'

export default function load() {
	WezzleManager.instance.init().then(() => {
		document.getElementById('project-app')?.style.setProperty('opacity', '1')
		document.getElementById('project-app')?.addEventListener('transitionend', e => {
			if ((e.target as HTMLElement).id !== 'wz-properties')
				WezzleManager.instance.parse()
		})
	})

	window.wz = Wezzle
}

declare global {
	interface Window {
		wz: typeof Wezzle
	}
}