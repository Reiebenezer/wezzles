import '@fontsource-variable/grandstander'
import './preview.scss'
import { showPreviewOutlines } from '../global/user-settings'

if (showPreviewOutlines) document.body.classList.add('show-outline')

document.onkeydown = e => {
    if (e.ctrlKey && (e.code === 'KeyS' || e.code === 'KeyO'))
        e.preventDefault()
}