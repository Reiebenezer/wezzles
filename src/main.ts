import '@fontsource-variable/open-sans'
import '@fontsource-variable/montserrat'
import 'dragula/dist/dragula.min.css'
import '@phosphor-icons/web/regular'

import './style/wezzles.scss'
import './style/panels.scss'

import WezzleManager from './wezzle/wezzle-manager'
import Wezzle, { WezzleInstance } from './wezzle/wezzle'
import { FileManager } from './filesystem'

const manager = WezzleManager.instance.init()
const fs = FileManager.instance

declare global {
	interface Window {
		wz: {
			manager: WezzleManager,
			instances: Set<Wezzle>,
			playgroundInstances: Set<WezzleInstance>,
		},
		fs: FileManager
	}
}
window.wz = {
	manager,
	instances: Wezzle.instances,
	playgroundInstances: WezzleInstance.instances,
}
window.fs = fs
