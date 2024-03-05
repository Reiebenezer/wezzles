import { addToOptions } from "./functions";
import { currentlyAnimating } from './animations';
import { parse } from './parsing';
import { makeItemsSortable, makePlaygroundItem } from './sort/sortable'
import { hideProperties } from './sort/properties';
import { PLAYGROUND, CANVAS, CANVASCONTEXT } from "./global";

CANVAS.width = CANVAS.offsetWidth;
CANVAS.height = CANVAS.offsetHeight;

addToOptions()
hideProperties()

PLAYGROUND.addEventListener('click', () => {
  document.querySelectorAll('.wz-selected').forEach(item => item.classList.remove('wz-selected'))
  hideProperties()
})

const mutationObserver = new MutationObserver(() => {
  makePlaygroundItem(PLAYGROUND)
  
  if (!currentlyAnimating) {
    parse()
  }
})
mutationObserver.observe(PLAYGROUND, {
  childList: true,
  subtree: true,
})

window.onresize = () => {
  CANVAS.width = CANVAS.offsetWidth
  CANVAS.height = CANVAS.offsetHeight
}

makeItemsSortable(PLAYGROUND)

function animate() {
  CANVASCONTEXT?.clearRect(0, 0, CANVAS.width, CANVAS.height)

  if (CANVAS.dataset.src && CANVAS.dataset.dst) {
    const src = CANVAS.dataset.src.split(' ').map(str => +str)
    const dst = CANVAS.dataset.dst.split(' ').map(str => +str)

    CANVASCONTEXT!.strokeStyle = 'black'
    CANVASCONTEXT!.lineWidth = 5

    const arrowLineOffset = +CANVAS.dataset.offset!

    CANVASCONTEXT?.beginPath();
    CANVASCONTEXT?.moveTo(src[0], src[1])
    CANVASCONTEXT?.lineTo(arrowLineOffset, src[1])
    CANVASCONTEXT?.lineTo(arrowLineOffset, dst[1])
    CANVASCONTEXT?.lineTo(dst[0], dst[1]);
    CANVASCONTEXT?.stroke()
    CANVASCONTEXT?.closePath()
    
    CANVASCONTEXT?.beginPath()
    CANVASCONTEXT?.moveTo(
        dst[0] +
            (dst[0] - (arrowLineOffset) > 0
                ? 10
                : -10),
        dst[1]
    ); // -10 if less, 10 if more
    CANVASCONTEXT?.lineTo(dst[0], dst[1] - 5)
    CANVASCONTEXT?.lineTo(dst[0], dst[1] + 5)
    CANVASCONTEXT?.closePath()
    CANVASCONTEXT?.fill()
  }
  

  requestAnimationFrame(animate)
}
animate()
