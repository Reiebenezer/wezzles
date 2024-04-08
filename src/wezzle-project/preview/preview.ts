import '@fontsource-variable/grandstander'
import './preview.scss'
import { util } from '../global'

function update() {
    document.body.classList.toggle('show-outline', util.getUserSettings().get('showWezzleOutlines') as boolean)
    document.body.classList.toggle('show-placeholders', util.getUserSettings().get('showEmptyWezzlePlaceholders') as boolean)
}

window.addEventListener('message', ev => {
    if (ev.data === 'settings-update')
        update()
})

update()

document.onkeydown = e => {
    if (e.ctrlKey && (e.code === 'KeyS' || e.code === 'KeyO'))
        e.preventDefault()
}