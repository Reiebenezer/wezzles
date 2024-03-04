import { addToOptions } from './puzzle-pieces'
import { currentlyAnimating } from './sort/animations';
import { parse } from './parsing/parsing';
import { makeItemsSortable, makePlaygroundItem } from './sort/sortable'
import { hideProperties } from './sort/properties';

const PLAYGROUND = document.getElementById('wz-playground')!

const arrow = document.getElementById('wz-arrow') as HTMLCanvasElement;
arrow.width = arrow.offsetWidth;
arrow.height = arrow.offsetHeight;

const context = arrow.getContext('2d');
addToOptions()
hideProperties()
PLAYGROUND.addEventListener('click', () => {
  document.querySelectorAll('.wz-selected').forEach(item => item.classList.remove('wz-selected'))
  hideProperties()
})

const mutationObserver = new MutationObserver(() => {
  makePlaygroundItem(PLAYGROUND)
  
  // PARSING
  
  if (!currentlyAnimating) {
    parse()
  }
})
mutationObserver.observe(PLAYGROUND, {
  childList: true,
  subtree: true,
})

window.onresize = () => {
  arrow.width = arrow.offsetWidth
  arrow.height = arrow.offsetHeight
}

makeItemsSortable(PLAYGROUND)

function animate() {
  context?.clearRect(0, 0, arrow.width, arrow.height)

  if (arrow.dataset.src && arrow.dataset.dst) {
    const src = arrow.dataset.src.split(' ').map(str => +str)
    const dst = arrow.dataset.dst.split(' ').map(str => +str)

    context!.strokeStyle = 'black'
    context!.lineWidth = 5

    const arrowLineOffset = +arrow.dataset.offset!

    context?.beginPath();
    context?.moveTo(src[0], src[1])
    context?.lineTo(arrowLineOffset, src[1])
    context?.lineTo(arrowLineOffset, dst[1])
    context?.lineTo(dst[0], dst[1]);
    context?.stroke()
    context?.closePath()
    
    context?.beginPath()
    context?.moveTo(
        dst[0] +
            (dst[0] - (arrowLineOffset) > 0
                ? 10
                : -10),
        dst[1]
    ); // -10 if less, 10 if more
    context?.lineTo(dst[0], dst[1] - 5)
    context?.lineTo(dst[0], dst[1] + 5)
    context?.closePath()
    context?.fill()
  }
  

  requestAnimationFrame(animate)
}
animate()
