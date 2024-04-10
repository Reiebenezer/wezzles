import anime from 'animejs'

import { FileManager } from './wezzle-project/filesystem'
import { ExportWezzle } from './wezzle-project/wezzle/types'

import Swup from "swup"
import SwupRouteNamePlugin from '@swup/route-name-plugin'
import loadProject from './wezzle-main'

//
const app = document.getElementById('app') as HTMLElement
const splashscreen = fetch('/splashscreen.svg')

const swup = new Swup({
	plugins: [
		new SwupRouteNamePlugin({
			routes: [
				{ name: 'project', path: '/project' }
			]
		})
	]
})

document.addEventListener('DOMContentLoaded', () => {
	
	splashscreen
		.then(response => response.text())
		.then(contents => {
			app.innerHTML = contents + app.innerHTML
            app.style.opacity = '1'

			animateSplashscreen()
		})
})

function animateSplashscreen() {
	const splashscreen = document.getElementById('splashscreen') as HTMLElement

	anime({
		targets: '#splashscreen path[mask]',
		strokeDashoffset: [anime.setDashoffset, 0],
		easing: 'easeInOutQuart',
		duration: 800,
		delay: anime.stagger(70, { from: 'last' }),

		complete() {
			splashscreen.classList.add('completed')
			app.classList.add('loaded')

			load()
		},
	})
}

async function load() {
	const newbtn = document.getElementById('create-new') as HTMLButtonElement
	const openbtn = document.getElementById('open-file') as HTMLButtonElement

	openbtn.onclick = async () => {
		FileManager.instance
			.uploadFromHome()
			.then((data: ExportWezzle[]) => {
				localStorage.setItem('local-project-data', JSON.stringify(data))
			})
	}
	newbtn.onclick = () => {
		localStorage.removeItem('local-project-data')

		swup.navigate('project', { history: 'replace' })
		swup.hooks.on('animation:in:end', loadProject)
	}
}
