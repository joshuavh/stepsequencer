import * as Tone from "https://cdn.skypack.dev/tone";

const makeSynths = (count) => {
  // declare array to store synths
  const synths = [];
	// I'll be using a one octive F minor pentatonic scale
  // so I'll need 6 synths
  for (let i = 0; i < count; i++) {
    let synth = new Tone.Sampler({
      urls: {
        "F4": "sounds/RKTD2_Noise_10.mp3",
        "Eb4": "sounds/RKTD2_Perc_04.mp3",
        "C4": "sounds/RKTD2_Hihat_04.mp3", 
        "Bb3": "sounds/RKTD2_Clap_04.mp3",
        "Ab3": "sounds/RKTD2_Kicks_99.mp3", 
        "F3": "sounds/RKTD2_Bass_08_A.mp3"
      },
      release: 1,
    }).toDestination();
      
   
    synths.push(synth);
  }

  return synths;
};

const makeGrid = (notes) => {
  // our "notation" will consist of an array with 6 sub arrays
  // each sub array corresponds to one row in our sequencer grid

  // parent array to hold each row subarray
  const rows = [];

  for (const note of notes) {
    // declare the subarray
    const row = [];
    // each subarray contains multiple objects that have an assigned note
    // and a boolean to flag whether they are "activated"
    // each element in the subarray corresponds to one eigth note
    for (let i = 0; i < 8; i++) {
      row.push({
        note: note,
        isActive: false
      });
    }
    rows.push(row);
  }

  // we now have 6 rows each containing 16 eighth notes
  return rows;
};

const synths = makeSynths(6);

// declaring the notes for each row
const notes = ["F4", "Eb4", "C4", "Bb3", "Ab3", "F3"];
let grid = makeGrid(notes);
let beat = 0;
let started = false;
var toneButtons = document.getElementsByClassName('note');
let activeNote;
let previousNote;


const configLoop = () => {

  const repeat = (time) => {
    grid.forEach((row, index) => {
      let synth = synths[index];
      let note = row[beat];
      if (beat > 0){
        previousNote = beat - 1 + index*8;
      }
      else {previousNote = 7 + index*8}

      if (note.isActive) {
        activeNote = beat + index*8;
        synth.triggerAttackRelease(note.note, "8n", time);
        toneButtons[activeNote].classList.add("playing");
      }
      toneButtons[previousNote].classList.remove("playing");
    }
    );

    beat = (beat + 1) % 8;
  };

  Tone.Transport.bpm.value = 128;
  Tone.Transport.scheduleRepeat(repeat, "8n");
};

let i = 0;

const makeSequencer = () => {
  const sequencer = document.getElementById("sequencer");
  grid.forEach((row, rowIndex) => {
    const seqRow = document.createElement("div");
    seqRow.id = `rowIndex`;
    seqRow.className = "sequencer-row";

    row.forEach((note, noteIndex) => {
      const button = document.createElement("button");
      if (note.note == "F4"){
        button.innerHTML = "FX"
      }
      if (note.note == "Eb4"){
        button.innerHTML = "Perc"
      }
      if (note.note == "C4"){
        button.innerHTML = "Hat"
      }
      if (note.note == "Bb3"){
        button.innerHTML = "Clap"
      }
      if (note.note == "Ab3"){
        button.innerHTML = "Kick"
      }
      if (note.note == "F3"){
        button.innerHTML = "Bass"
      }

      button.className = "note"
      button.addEventListener("click", function(e) {
        handleNoteClick(rowIndex, noteIndex, e);
      });

      seqRow.appendChild(button);
      i++;
    });

    sequencer.appendChild(seqRow);
  });
};

const handleNoteClick = (clickedRowIndex, clickedNoteIndex, e) => {
  grid.forEach((row, rowIndex) => {
    row.forEach((note, noteIndex) => {
      if (clickedRowIndex === rowIndex && clickedNoteIndex === noteIndex) {
        note.isActive = !note.isActive;
        if (note.isActive){
          e.target.classList.add("note-is-active");
        }
        else{
          e.target.classList.remove("note-is-active");
        }
      
      }
    });
  });
};


const configPlayButton = () => {
  document.body.addEventListener("click", (e) => {
    if (!started) {
      Tone.start();
      Tone.getDestination().volume.rampTo(-10, 0.001)
      configLoop();
      started = true;
      Tone.Transport.start();
    }
  });
};


window.addEventListener("DOMContentLoaded", () => {
  configPlayButton();
	makeSequencer();
});