const { Router } = require("express");
const {
  db,
  firebaseFirestore,
  firebaseAuth,
} = require("../services/firebase-service");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");

const { getAuth, signInWithEmailAndPassword } = firebaseAuth;
const { collection, query, where, getDoc, getDocs } = firebaseFirestore;

function getUserDisplayName(user) {
  var displayName = "";
  var firstName = user.firstName;
  var lastName = user.lastName;

  var formattedFname = "";
  var formattedLname = "";

  var fNameSegments = firstName.split(" ");
  var lNameSegments = lastName.split(" ");

  for (var i = 0; i < fNameSegments.length; i++) {
    formattedFname +=
      fNameSegments[i][0].toUpperCase() + fNameSegments[i].substring(1);

    if (i != fNameSegments.length - 1) {
      formattedFname += " ";
    }
  }

  for (var i = 0; i < lNameSegments.length; i++) {
    formattedLname +=
      lNameSegments[i][0].toUpperCase() + lNameSegments[i].substring(1);

    if (i != lNameSegments.length - 1) {
      formattedLname += " ";
    }
  }

  if (user.midName) {
    var midName = user.midName;
    var formattedMidName = "";

    midName.split(" ").forEach((segments) => {
      formattedMidName += segments[0].toUpperCase() + ".";
    });

    displayName =
      formattedFname + " " + formattedMidName + " " + formattedLname;
  } else {
    displayName = formattedFname + " " + formattedLname;
  }

  return displayName;
}

module.exports = () => {
  const router = Router();

  router.post("/api/login", async (req, res) => {
    if (
      req.body == null ||
      req.body.email == null ||
      req.body.password == null
    ) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        title: ReasonPhrases.BAD_REQUEST,
        data: {
          error: "Invalid data provided",
        },
      });
    }

    var email = req.body.email;
    var password = req.body.password;

    var isStudent = false;

    signInWithEmailAndPassword(getAuth(), email, password)
      .then(async (userCredentials) => {
        // check role
        var dbRef = collection(db, "users");
        var q = query(dbRef, where("uid", "==", userCredentials.user.uid));

        var querySnapshot = await getDocs(q);
        var user = querySnapshot.docs[0].data();

        // TODO should be updated to 3 part name configuration
        // for now just use "name";

        if (user["role"] == "student") {
          isStudent = true;
          throw new Error("Student detected");
        }

        console.log(user);

        return res.status(StatusCodes.OK).json({
          status: StatusCodes.OK,
          title: ReasonPhrases.OK,
          data: {
            uid: userCredentials.user.uid,
            email: userCredentials.user.email,
            idTokenString: await userCredentials.user.getIdToken(),
            role: user["role"],
            displayName: getUserDisplayName(user),
          },
        });
      })
      .catch((error) => {
        console.log(error);
        if (isStudent) {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            status: StatusCodes.UNAUTHORIZED,
            title: ReasonPhrases.UNAUTHORIZED,
            data: {
              error: "Students are not allowed on this domain",
            },
          });
        } else {
          return res.status(StatusCodes.BAD_REQUEST).json({
            status: StatusCodes.BAD_REQUEST,
            title: ReasonPhrases.BAD_REQUEST,
            data: error,
          });
        }
      });

    /**
     * data.code = 'auth/wrong-password'
     * data.code = 'auth/invalid-email'
     * data.code = 'auth/internal-error'
     */

    /**
       * {
    "status": 200,
    "title": "OK",
    "data": {
        "uid": "OD3rxEIMrPdffwbxZ4PENCy5qZK2",
        "email": "zianjolo.catacutan.m@gmail.com",
        "idTokenString": "eyJhbGciOiJSUzI1NiIsImtpZCI6Ijk3OGI1NmM2NmVhYmIwZDlhNmJhOGNhMzMwMTU2NGEyMzhlYWZjODciLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vbXluZXdtYWluLWIxNWYwIiwiYXVkIjoibXluZXdtYWluLWIxNWYwIiwiYXV0aF90aW1lIjoxNjcwODU5ODA1LCJ1c2VyX2lkIjoiT0QzcnhFSU1yUGRmZndieFo0UEVOQ3k1cVpLMiIsInN1YiI6Ik9EM3J4RUlNclBkZmZ3YnhaNFBFTkN5NXFaSzIiLCJpYXQiOjE2NzA4NTk4MDUsImV4cCI6MTY3MDg2MzQwNSwiZW1haWwiOiJ6aWFuam9sby5jYXRhY3V0YW4ubUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJ6aWFuam9sby5jYXRhY3V0YW4ubUBnbWFpbC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.wolwNn-OFexW5x8XbHxOxukSn97nwSfak-o7AVce4NEvbMHhiZrDnVZxnmlRZ3XgzfkXq6t1kXtIzET_ugtl-dB29sOK0cInjIimXjbAK0SmFgBm-QT3sfBKwdC2EDK3yt3sfF7G0ciVPqnpeDlSu53hJJvnnFzJwyOCYke_EL-dAwMLd6kKITZ4mUJTTK0g851McaZhMPCz3idwW3_zTyIt-Iyqv6u1tE5Hngc0WkWW6lAbHFGN3NZhfe9HnITDHkKEKdHvrYYUdTa5JEUWLFwnjU5Evq9mR13Qhlnr5MGlynSW3beR7_BruN_kQaGWM5FbEpDDjEOGhcYpkj5tQw",
        "role": "admin"
    }
}
       */
  });

  return router;
};
