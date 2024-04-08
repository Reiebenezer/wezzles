import '@fontsource-variable/montserrat'
import '@fontsource-variable/grandstander'

import '@phosphor-icons/web/regular'

import anime from 'animejs'

import './welcome-page/style.scss'

//
const app = document.getElementById('app') as HTMLElement
const splashscreen = fetch('/splashscreen.svg')

document.addEventListener('DOMContentLoaded', () => {
	splashscreen
		.then(response => response.text())
		.then(contents => {
			app.innerHTML = contents + app.innerHTML
            app.style.display = ''

			animateSplashscreen()
		})
})

function animateSplashscreen() {
	const splashscreen = document.getElementById('splashscreen') as HTMLElement

	anime({
		targets: '#splashscreen path[mask]',
		strokeDashoffset: [anime.setDashoffset, 0],
		easing: 'easeInOutSine',
		duration: 700,
		delay: anime.stagger(300, { from: 'last' }),

		complete() {
			splashscreen.classList.add('completed')
			app.classList.add('loaded')

			loadProjects()
		},
	})
}

function loadProjects() {
	// const projectStorage = 
}