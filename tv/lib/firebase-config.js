// Firebase Realtime Database relay for the TV screen mode. Shared by the app
// (tvlink.js) and the TV page (tv/index.html loads a copy of this file).
// Setup (one time): docs/tv-mode-setup.md.
// The web apiKey is not a secret: access is enforced by database.rules.json.
const FIREBASE = {
  apiKey: 'AIzaSyBnmdjiZxBKdvqy3_vov9NDil4QjymHOqQ',
  databaseURL: 'https://tchak-darts-default-rtdb.europe-west1.firebasedatabase.app',
};
const TV_PAGE = 'https://lecram42.github.io/TchakDarts-legal/tv/';
