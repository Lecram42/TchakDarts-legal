// Voice announcer: event engine + voice collection.
// The spec wants REAL recordings (open question: who records them). Until
// they exist, each voice falls back to speech synthesis with its own
// phrases, pitch and rate. To ship recordings: drop the files in
// assets/voices/<voice id>/<event>-<n>.m4a and list the count per event in
// VOICES[id].files (e.g. files: { '180': 2, blank: 4 }). Names are never
// spoken in V1 (spec).
'use strict';

const VOICES = {
  classic: {
    free: true, lang: 'fr-FR', rate: 1.05, pitch: 1, files: {},
    lines: {
      '180': ['Cent quatre-vingts !'],
      '140': ['{n} !', 'Et {n} !'],
      '100': ['{n} !', 'La tonne !'],
      closed: ['Le {t} est fermé !'],
      closedAll: ['Le {t} est mort.'],
      triple: ['Triple !', 'Tchak !', 'Joli !'],
      bull: ['Dans le mille !', 'Bull !'],
      blank: ['Volée blanche !', 'Même pas la cible…', 'Le mur a pris cher.', 'On a vu mieux.'],
      finish: ['Il te reste {n}, {d}.'],
      bust: ['Trop gourmand !', 'Bust !'],
      leg: ['Game shot ! Et la manche !'],
      game: ['Game shot ! Et le match !'],
    },
  },
  tv: {
    lang: 'en-GB', rate: 0.95, pitch: 0.9, files: {},
    lines: {
      '180': ['One hundred and eighty!'],
      '140': ['{n}!'],
      '100': ['{n}!', 'Ton!'],
      closed: ['The {t} is closed!'],
      closedAll: ['That {t} is dead.'],
      triple: ['Treble!', 'Lovely darts!'],
      bull: ['Bullseye!'],
      blank: ['Not even on the board…', 'Oh dear. No score.', 'He will want that one back.'],
      finish: ['You require {n}. {d}.'],
      bust: ['No score! Bust!'],
      leg: ['Game shot, and the leg!'],
      game: ['Game shot, and the match!'],
    },
  },
  sud: {
    lang: 'fr-FR', rate: 1.12, pitch: 1.15, files: {},
    lines: {
      '180': ['Oh fan ! Cent quatre-vingts, peuchère !'],
      '140': ['{n}, té !'],
      '100': ['{n}, pas mal hein !'],
      closed: ['Et voilà le {t} fermé, té !'],
      closedAll: ['Le {t}, c’est fini mon vieux.'],
      triple: ['Boudu, triple !', 'Oh fan !'],
      bull: ['En plein dans le mille, peuchère !'],
      blank: ['Oh peuchère, même pas la cible !', 'Tu vises la buvette ou quoi ?'],
      finish: ['Il te reste {n}, mets-moi {d} !'],
      bust: ['Trop gourmand, mon vieux !'],
      leg: ['Et c’est gagné, la manche !'],
      game: ['Et c’est le match, oh fan !'],
    },
  },
  robot: {
    lang: 'fr-FR', rate: 0.9, pitch: 0.2, files: {},
    lines: {
      '180': ['Score maximal détecté. Cent quatre-vingts.'],
      '140': ['Score : {n}.'],
      '100': ['Score : {n}.'],
      closed: ['Cible {t} : verrouillée.'],
      closedAll: ['Cible {t} : désactivée.'],
      triple: ['Triple. Efficacité confirmée.'],
      bull: ['Centre atteint.'],
      blank: ['Erreur. Cible non atteinte.', 'Précision : zéro pour cent.'],
      finish: ['Reste {n}. Trajectoire suggérée : {d}.'],
      bust: ['Dépassement. Volée annulée.'],
      leg: ['Manche terminée.'],
      game: ['Partie terminée. Fin du programme.'],
    },
  },
};
const VOICE_IDS = Object.keys(VOICES);

function spokenDart(d, lang) {
  const fr = lang.startsWith('fr');
  if (d.s === 25) return d.m === 2 ? (fr ? 'bull' : 'bullseye') : '25';
  if (d.m === 3) return (fr ? 'triple ' : 'treble ') + d.s;
  if (d.m === 2) return 'double ' + d.s;
  return String(d.s);
}
function voiceLine(id, key, params) {
  const v = VOICES[id];
  const list = v && v.lines[key];
  if (!list) return null;
  let s = list[Math.floor(Math.random() * list.length)];
  const tName = params.n === 25 ? 'bull' : params.n;
  s = s.replace('{n}', params.n != null ? params.n : '').replace('{t}', tName != null ? tName : '');
  if (params.darts) s = s.replace('{d}', params.darts.map((d) => spokenDart(d, v.lang)).join(', '));
  return s;
}

let speakQueueAt = 0;
function speak(id, key, params) {
  const v = VOICES[id];
  if (!v) return;
  const nFiles = v.files[key];
  if (nFiles) {
    const a = new Audio(`assets/voices/${id}/${key}-${1 + Math.floor(Math.random() * nFiles)}.m4a`);
    a.volume = PREFS.volume;
    a.play().catch(() => {});
    return;
  }
  const line = voiceLine(id, key, params);
  if (!line || !('speechSynthesis' in window)) return;
  try {
    const u = new SpeechSynthesisUtterance(line);
    u.lang = v.lang; u.rate = v.rate; u.pitch = v.pitch; u.volume = PREFS.volume;
    const match = speechSynthesis.getVoices().find((x) => x.lang && x.lang.replace('_', '-').startsWith(v.lang.slice(0, 2)));
    if (match) u.voice = match;
    // A new big event cuts the previous line; small ones never pile up.
    const big = ['180', 'game', 'leg', 'closed', 'finish'].includes(key);
    if (speechSynthesis.speaking) { if (!big) return; speechSynthesis.cancel(); }
    speechSynthesis.speak(u);
    speakQueueAt = Date.now();
  } catch (e) {}
}

// Called by the game for every event. When a TV is connected the sound
// goes through the TV (spec), so the phone stays quiet.
let LAST_EVENT = null;
function announce(key, params) {
  // Sent to the TV, which plays it once (id) through its own speakers.
  LAST_EVENT = { k: key, n: params.n != null ? params.n : null, d: params.darts ? params.darts.map((d) => [d.s, d.m]) : null, id: uid(), at: Date.now(), voice: isUnlocked('voice', PREFS.voice) ? PREFS.voice : 'classic', on: PREFS.announcer };
  if (!PREFS.announcer) return;
  if (TV.connected) return;
  const id = isUnlocked('voice', PREFS.voice) ? PREFS.voice : 'classic';
  speak(id, key, params);
}
function previewVoice(id) {
  const keep = PREFS.announcer; PREFS.announcer = true;
  speak(id, '180', {});
  PREFS.announcer = keep;
}
