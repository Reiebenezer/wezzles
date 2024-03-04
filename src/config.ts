import { AnimationTypes } from "./defs"

export let DEFAULT_ANIMATION = AnimationTypes.fast
export let DEFAULT_ANIMATION_TIME = 300
export let ANIMATION_TIME = DEFAULT_ANIMATION !== AnimationTypes.none ? DEFAULT_ANIMATION_TIME : 0

export let DEFAULT_GAP = 16
export let FOLLOW_WEZZLE = true

export let SHOW_INLINE_STYLES = true