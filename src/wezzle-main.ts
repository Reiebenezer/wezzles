/** 
 * # wezzle-main.ts
 * 
 * Loads the wezzle manager
 */

import Wezzle from './wezzle-project/wezzle/wezzle'
import WezzleManager from './wezzle-project/wezzle/wezzle-manager'

/**
 * Loads the wezzle creation window
 */
export default function load() {

	// Initialize Wezzle Manager 
	WezzleManager.instance.init().then(() => {
		
		// Fade in the project container
		document.getElementById('project-app')?.style.setProperty('opacity', '1')

		// Call parse() after every transition on property panel
		document.getElementById('project-app')?.addEventListener('transitionend', e => {
			if ((e.target as HTMLElement).id !== 'wz-properties')
				WezzleManager.instance.parse()
		})
	})

	// For debugging purposes
	window.wz = Wezzle
}

/** For debugging purposes */
declare global {
	interface Window {
		wz: typeof Wezzle
	}
}