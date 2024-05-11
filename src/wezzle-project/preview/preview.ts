/**
 * # PREVIEW.TS
 * 
 * Functions for keyboard shorcuts
 */

import '@fontsource-variable/grandstander'
import './preview.scss'
import { util } from '../global'

/**
 * ### Update Preview
 * Automatically applies changes to wezzle settings
 */
function applySettings() {
    document.body.classList.toggle('show-outline', util.getUserSettings().get('showWezzleOutlines') as boolean)
    document.body.classList.toggle('show-placeholders', util.getUserSettings().get('showEmptyWezzlePlaceholders') as boolean)
}

/** 
 * When the preview panel receives a settings update call
 * from the main application, apply the settings
 */
window.addEventListener('message', ev => {
    if (ev.data === 'settings-update')
        applySettings()
})

// Apply the settings on startup
applySettings()

// Prevent default actions on Ctrl+S and Ctrl+O (Bugfix)
document.onkeydown = e => {
    if (e.ctrlKey && (e.code === 'KeyS' || e.code === 'KeyO'))
        e.preventDefault()
}