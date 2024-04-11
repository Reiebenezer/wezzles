import WezzleManager from './wezzle-project/wezzle/wezzle-manager'

export default function load() {
	WezzleManager.instance.init().then(() => {
		document.getElementById('project-app')?.style.setProperty('opacity', '1')
		document.getElementById('project-app')?.addEventListener('transitionend', () => WezzleManager.instance.parse())
	})
}