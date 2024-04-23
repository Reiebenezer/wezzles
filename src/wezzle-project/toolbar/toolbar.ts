import { settings } from "./functions"

const toolbar: ToolbarData[] = [
    {
        name: 'undo',
        icon: '/toolbar/undo.svg',
        description: 'Undo the last action',
        command: 'undo'
    },
    {
        name: 'redo',
        icon: '/toolbar/redo.svg',
        description: 'Redo the last action',
        command: 'redo'
    },
    {
        name: 'save',
        icon: '/toolbar/save.svg',
        description: 'Saves the current project',
        command: 'save'
    },
    {
        name: 'open',
        icon: '/toolbar/open.svg',
        description: 'Opens a wezzle (.wzzl) project',
        command: 'upload'
    },
    {
        name: 'settings',
        icon: '/toolbar/settings.svg',
        description: 'Opens the settings panel',
        command: settings
    }
]

interface ToolbarData {
    name: string,
    icon: string,
    description?: string,
    command: string | Function
}

export default toolbar