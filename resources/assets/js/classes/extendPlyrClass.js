//import Plyr from 'plyr'

import Plyr from '../../../../node_modules/plyr/src/js/plyr.js'

console.warn('HELLO')

console.error('PLYR', Plyr)

class PlyrExtend extends Plyr {

}

export default Plyr


/*
class PlyrExtend extends Plyr {
    
    sayGoodBye() {
        alert('goodBye');
    }

    sayHello() {
        //alert('hi, I am a student');
    }

    ready(){
    	alert('READY')
    }

}

const test = new PlyrExtend
console.warn('PLYR EXTEND', test)

export default PlyrExtend
*/
