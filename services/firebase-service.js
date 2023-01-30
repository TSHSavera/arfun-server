require("dotenv").config();

const firebaseConfig = {
  apiKey: process.env.FB_API_KEY,
  authDomain: process.env.FB_AUTH_DOMAIN,
  databaseURL: process.env.FB_DB_URL,
  projectId: process.env.APP_PROJ_ID,
  storageBucket: process.env.FB_STORE_BUCKET,
  messagingSenderId: process.env.FB_MSG_SENDER_ID,
  appId: process.env.FB_APP_ID,
  measurementId: process.env.FB_MEASURE_ID,
};

const firebaseApp = require("firebase/app");
const firebaseAppAdmin = require("firebase-admin");
const firebaseAuth = require("firebase/auth");
const firebaseAuthAdmin = require("firebase-admin/auth");
const firebaseFirestore = require("firebase/firestore/lite");

// firebase basic
const app = firebaseApp.initializeApp(firebaseConfig);
const db = firebaseFirestore.getFirestore(app);

// firebase admin
const firebaseAdminConfig = require('../secrets/ServiceAccountAdmin.json');

console.log(firebaseAdminConfig);

const appAdmin = firebaseAppAdmin.initializeApp({
  credential: firebaseAppAdmin.credential.cert(firebaseAdminConfig),
  databaseURL: firebaseConfig.databaseURL,
});
const auth = firebaseAuthAdmin.getAuth(appAdmin);

module.exports = {
  db,
  app,
  auth,
  firebaseAuthAdmin,
  firebaseAuth,
  firebaseFirestore,
};
