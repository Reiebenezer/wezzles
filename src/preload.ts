/** 
 * # PRELOAD.TS
 * 
 * Preload fonts and stylesheets here
 */

// If the route is not set to home, redirect to home and prevent asset loading.
if (window.location.pathname !== '/') window.location.href = '/'

import '@fontsource-variable/grandstander'

import '@phosphor-icons/web/regular'
import 'dragula/dist/dragula.min.css'

import "/src/welcome-page/style.scss"
import "/src/wezzle-project/style/panels.scss"
import "/src/wezzle-project/style/wezzles.scss"