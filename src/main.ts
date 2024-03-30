import '@fontsource-variable/open-sans'
import '@fontsource-variable/montserrat'
import 'dragula/dist/dragula.min.css'
import './style.scss'
import WezzleManager from './wezzle/wezzle-manager'
import Wezzle, { WezzleInstance } from './wezzle/wezzle'

const manager = new WezzleManager().init()

declare global {
	interface Window {
		wz: {
			manager: WezzleManager,
			instances: Set<Wezzle>,
			playgroundInstances: Set<WezzleInstance>
		}
	}
}
window.wz = {
	manager,
	instances: Wezzle.instances,
	playgroundInstances: WezzleInstance.instances
}
