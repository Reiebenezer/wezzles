import { AnimationTypes } from "./global"

export var DEFAULT_ANIMATION = AnimationTypes.fast
export var DEFAULT_ANIMATION_TIME = 300
export var ANIMATION_TIME = DEFAULT_ANIMATION !== AnimationTypes.none ? DEFAULT_ANIMATION_TIME : 0

export var DEFAULT_GAP = 16
export var FOLLOW_WEZZLE = true

export var SHOW_INLINE_STYLES = false