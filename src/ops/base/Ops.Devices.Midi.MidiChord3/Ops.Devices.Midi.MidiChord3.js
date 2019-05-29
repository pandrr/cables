/* UTIL */
const NOTE_OFF = 0x8;
const NOTE_ON = 0x9;
const NOTE_VALUES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const MIDIChannels = Array.from(Array(16).keys()).map(i => i + 1);

function getMIDINote(dataByte1LSB) {
  return dataByte1LSB <= 126
    ? `${NOTE_VALUES[dataByte1LSB % 12]}${Math.floor(dataByte1LSB / 12) - 2} - ${dataByte1LSB}`
    : 'NO NOTE';
}

const noteValues = Array.from(Array(128).keys()).map(key => getMIDINote(key));

/* IN */
const inEvent = op.inObject('MIDI Event In');
const midiChannelDropdown = op.inValueSelect('MIDI Channel', MIDIChannels, 1);
const noteDropdown = op.inValueSelect('Note 1', noteValues, 0);
const noteDropdown2 = op.inValueSelect('Note 2', noteValues, 0);
const noteDropdown3 = op.inValueSelect('Note 3', noteValues, 0);
const noteDropdowns = [noteDropdown, noteDropdown2, noteDropdown3];

const normalizeDropdown = op.inValueSelect(
  'Normalize Velocity',
  ['none', '0 to 1', '-1 to 1'],
  'none',
);
const learn = op.inTriggerButton('learn');
const reset = op.inTriggerButton('reset');

/* OUT */

const eventOut = op.outObject('MIDI Event Out');

const noteNameOut1 = op.outValue('Note Name 1');
const noteIndexOut1 = op.outValue('Note Index 1');
const velocityOut1 = op.outValue('Velocity 1');
const gateOut1 = op.outValueBool('Gate 1');

const out1 = {
  noteNameOut: noteNameOut1,
  noteIndexOut: noteIndexOut1,
  velocityOut: velocityOut1,
  gateOut: gateOut1,
};

const noteNameOut2 = op.outValue('Note Name 2');
const noteIndexOut2 = op.outValue('Note Index 2');
const velocityOut2 = op.outValue('Velocity 2');
const gateOut2 = op.outValueBool('Gate 2');

const out2 = {
  noteNameOut: noteNameOut2,
  noteIndexOut: noteIndexOut2,
  velocityOut: velocityOut2,
  gateOut: gateOut2,
};

const noteNameOut3 = op.outValue('Note Name 3');
const noteIndexOut3 = op.outValue('Note Index 3');
const velocityOut3 = op.outValue('Velocity 3');
const gateOut3 = op.outValueBool('Gate 3');

const out3 = {
  noteNameOut: noteNameOut3,
  noteIndexOut: noteIndexOut3,
  velocityOut: velocityOut3,
  gateOut: gateOut3,
};

const outs = [out1, out2, out3];

noteDropdown.set(0);
midiChannelDropdown.set(1);

let learning = false;
let learnCount = 0;
let learnedNotes = [];

learn.onTriggered = () => {
  learning = true;
};

reset.onTriggered = () => {
  learning = false;
  learnCount = 0;
  learnedNotes = [];
  noteDropdowns.forEach(nd => nd.set(0));
};

inEvent.onChange = () => {
  const event = inEvent.get();
  if (!event) return;
  if (event.messageType !== 'Note') return;
  if (!event.newNote) return;

  const [statusByte] = event.data;

  const { newNote, velocity, channel } = event;
  const [noteIndex, noteName] = newNote;
  const midiNote = getMIDINote(noteIndex);
  const msgType = statusByte >> 4;

  if (learning && learnCount < 3) {
    if (msgType === NOTE_OFF) {
      eventOut.set(event);
      return;
    }
    if (!learnedNotes.includes(midiNote)) noteDropdowns[learnCount].set(midiNote);
    else {
      eventOut.set(event);
      return;
    }

    learnedNotes.push(midiNote);
    if (learnCount === 0) midiChannelDropdown.set(event.channel + 1);

    if (CABLES.UI) {
      op.uiAttr({ info: `bound to Note: ${noteDropdowns[learnCount].get()}` });
      gui.patch().showOpParams(op);
    }

    learnCount += 1;
    learning = learnCount < 3;
  }

  if (channel === midiChannelDropdown.get() - 1) {
    const chordIndex = noteDropdowns.map(nd => nd.get()).indexOf(midiNote);

    if (chordIndex === -1) {
      eventOut.set(event);
      return;
    }

    const {
      gateOut, noteNameOut, noteIndexOut, velocityOut,
    } = outs[chordIndex];

    if (msgType === NOTE_OFF || velocity === 0) {
      gateOut.set(false);
      if (velocity === 0) velocityOut.set(0);
    }

    if (msgType === NOTE_ON) {
      gateOut.set(true);
      noteNameOut.set(noteName);
      noteIndexOut.set(noteIndex);

      if (normalizeDropdown.get() === '0 to 1') velocityOut.set(velocity / 127);
      else if (normalizeDropdown.get() === '-1 to 1') {
        const normalizedValue = velocity / (127 / 2) - 1;
        velocityOut.set(normalizedValue);
      } else if (normalizeDropdown.get() === 'none') velocityOut.set(velocity);
    }
  }

  eventOut.set(event);
};
