// Initialize
import { initialize } from './initialize.js'
import { watch } from './watch.js'

if(typeof(localStorage) !== "undefined"){
    initialize();
    watch();
}

export default { initialize }