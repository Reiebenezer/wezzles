import '@phosphor-icons/webcomponents/PhArrowCounterClockwise'
import '@phosphor-icons/webcomponents/PhArrowClockwise'
import '@phosphor-icons/webcomponents/PhFloppyDisk'
import '@phosphor-icons/webcomponents/PhFolderOpen'

const toolbar: ToolbarData[] = [
    {
        name: 'undo',
        icon: 'ph-arrow-counter-clockwise',
        description: 'Undo the last action',
        command: 'undo'
    },
    {
        name: 'redo',
        icon: 'ph-arrow-clockwise',
        description: 'Redo the last action',
        command: 'redo'
    },
    {
        name: 'save',
        icon: 'ph-floppy-disk',
        description: 'Saves the current project',
        command: 'save'
    },
    {
        name: 'open',
        icon: 'ph-folder-open',
        description: 'Opens a wezzle (.wzzl) project',
        command: 'upload'
    }
]

interface ToolbarData {
    name: string,
    icon: string,
    description?: string,
    command: string | Function
}

export default toolbar