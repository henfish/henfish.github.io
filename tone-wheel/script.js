
let fifths = 0;
const twelve_arr = [0,1,2,3,4,5,6,7,8,9,10,11];
let scaleName = "Ionian"
const twelve_notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const wheel = document.getElementById('wheel');
const wheelImages = document.querySelectorAll('.wheel-image');
const root_text = document.getElementById('root_text');
const scale_text = document.getElementById('scale_text');
const notches_to_radians = 2*Math.PI / 12;
let isDragging = false;
let initialAngle = 0;
let startAngle = 0;
let centerX, centerY;
let rotationAngle = 0;
let prevAngle = 0;
let turns = 0;
let top_note = 0;
let current_scale = [0,2,4,5,7,9,11];
let index = 0;
let offset = 0;
let notes = [0];
let scale_degree = 0;
currentNote = 0;

function getAngle(x, y, centerX, centerY) {
    return Math.atan2(y - centerY, x - centerX);
};

function setRoot(){
    // Sets the variable root_note, which tracks the root of the scale
    isOdd = (Math.ceil(unrounded/notches_to_radians)) % 2
    console.log(isOdd)
    if (fifths == 0){
        root_note = (Math.ceil(unrounded/notches_to_radians) + 6*offset) % 12
    }
    else{
        root_note = (Math.ceil(unrounded/notches_to_radians) + 6 * isOdd + 6*offset) % 12 
        
    }
    root_text.innerHTML = twelve_notes[root_note]
};

function rotateNotches(){
    // Sets the rotation of each notch in the wheel based on the mouse position, as well as their order in the list of notches
    index = -1;
    wheelImages.forEach(image => {
        if (index == 13){index += 5;}
        index ++;
        unrounded = rotationAngle + (index)*notches_to_radians;
        console.log(index, offset, (offset+index)%2)
        image.style.transform = `rotate(${Math.ceil(unrounded/notches_to_radians)*notches_to_radians  +  (offset  + fifths*((index)%2)) * Math.PI +(turns-1)*2*Math.PI }rad)`;
    });
};


window.onload = function() {
    rotateNotches();
	setScale(current_scale);
};


wheel.addEventListener('mousedown', (e) => {
    // Check when the mouse wants to turn
    const rect = wheel.getBoundingClientRect();
    centerX = rect.left + rect.width / 2;
    centerY = rect.top + rect.height / 2;
    
    const startMouseAngle = getAngle(e.clientX, e.clientY, centerX, centerY);
    startAngle = startMouseAngle - initialAngle;
    isDragging = true;
    wheel.style.cursor = 'grabbing';
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    wheel.style.cursor = 'grab';
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        // Determine whether the wheel is transitioning from 2pi radians to -2pi radians or from -2pi to 2pi radians
        // In which case we need some extra code to make the animation smooth
        prevAngle = rotationAngle;
        const currentMouseAngle = getAngle(e.clientX, e.clientY, centerX, centerY);
        rotationAngle = currentMouseAngle - startAngle;
        initialAngle = rotationAngle;
        
        if (rotationAngle-prevAngle > 4){
            turns--;
        } else if (rotationAngle-prevAngle < -4){
            turns++;
        };
        console.log(current_scale);
        rotateNotches();
        setRoot();
        
    };
});

function setScale(notes, deg){
    // Determine which of the twelve notes in the wheel should be showing, and hides those notches accordingly

	current_scale = notes;
    
	for (const note of twelve_arr){
		if (notes.includes(note)){
			wheelImages[note].classList.add('hidden');
			//hidden means the NOTCH is hidden so the note shows.
		} else {
			wheelImages[note].classList.remove('hidden');
		}
	};
    // Swaps the root note if fifths is enabled
    scale_degree = deg;
    wheelImages[12].classList.remove('hidden');
    rotateNotches();
    setRoot();
}
   
document.querySelectorAll('.scaleButton').forEach(button => {
    button.addEventListener('click', function(event) {
        // Get the innerHTML of the clicked button
        scaleName = event.target.innerHTML;
        scale_text.innerHTML = scaleName;
    });
});

function toggleFifths(){
    // Toggles the variable fifths and swaps the circle image when the button is pressed
	circ = document.getElementById("circnotes")
    isOdd = (Math.ceil(unrounded/notches_to_radians)) % 2
    if (fifths == 1){
        fifths = 0;
        circ.src = "circ_semis.png";
    } else {
        fifths = 1;
        circ.src = "circ_fifths.png";
    };
    offset = (offset + isOdd)%2
    rotateNotches();
	setScale(current_scale);
    console.log("hello")
    // Rearrange the order of the scales

    // Get all containers with the class "container"
    const containers = document.querySelectorAll('.container');
    
    // Specify the desired order of indices (1-based)
    let order = [];
    if (fifths == 0){
        order = [2, 4, 6, 1, 3, 5, 7];}
    else{
        order = [4, 1, 5, 2, 6, 3, 7];
    }
    
    // Loop through each container and rearrange its elements
    containers.forEach(container => {
        const elements = Array.from(container.children);
        
        // Create a new array to store elements in the desired order
        const rearrangedElements = order.map(index => elements[index - 1]);

        // Clear the container and re-append the elements in the new order
        container.innerHTML = '';
        rearrangedElements.forEach(element => {
            container.appendChild(element);
        });
    });
}


// Function to play a major scale
async function playScale() {
    // Ensure the audio context is started
    await Tone.start();

    const synth = new Tone.Synth().toDestination(); // Create a synthesizer and connect it to the output
    const rootKey = 48 + root_note; // MIDI note for C4 (Middle C)
    const duration = "8n"; // Duration of each note (eighth note)

    // Convert scaleArray to note names based on rootNote
    fullScale = current_scale.concat(12)
    const notes = fullScale.map(semitoneOffset => {
        const noteIndex = rootKey + semitoneOffset;
        return Tone.Frequency(noteIndex, "midi").toNote(); // Convert MIDI index to note name
    });

    // Schedule notes to play
    let now = Tone.now(); // Start time
    notes.forEach((note, index) => {
        synth.triggerAttackRelease(note, duration, now + index * Tone.Time(duration).toSeconds());
    });

    // Start Tone.js Transport (not necessary here, as we use synth directly)
}

// Set up the button to play the scale when clicked
document.getElementById('playScaleButton').addEventListener('click', playScale);