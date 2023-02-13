require("dotenv").config();

const { Router } = require("express");
const {
  adminSchema,
  teacherSchema,
  studentSchema,
} = require("../services/schemavalidation-service");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const {
  db,
  firebaseAuth,
  firebaseFirestore,
} = require("../services/firebase-service");
const passwordGenerator = require("generate-password");
const { sendPasswordResetMail } = require("../services/nodemail-service");

const { getAuth, createUserWithEmailAndPassword } = firebaseAuth;
const { doc, collection, addDoc, deleteDoc } = firebaseFirestore;

function checkBody(req, res, next) {
  if (
    req.body == null ||
    req.body == undefined ||
    req.body.type == null ||
    req.body.type == undefined ||
    req.body.type.length === 0
  ) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      title: ReasonPhrases.BAD_REQUEST,
      data: {
        error: "Invalid data provided",
      },
    });
  }

  var result = null;

  switch (req.body.type) {
    case "admin": {
      result = adminSchema.validate(req.body);
      break;
    }
    case "teacher": {
      result = teacherSchema.validate(req.body);
      break;
    }
    case "student": {
      result = studentSchema.validate(req.body);
      break;
    }
    default: {
      result = {
        error: "Type does not exist.",
      };
      break;
    }
  }

  if (result == null || result.error) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      title: ReasonPhrases.BAD_REQUEST,
      data: result.error,
    });
  }

  next();
}

module.exports = () => {
  var router = Router();

  router.post("/api/createuser", checkBody, async (req, res) => {
    var auth = getAuth();
    var data = req.body;

    var password = passwordGenerator.generate({
      length: 10,
      strict: true,
      numbers: true,
      symbols: true,
      excludeSimilarCharacters: true,
    });

    var createdUser;
    var addingResult;

    try {
      createdUser = await createUserWithEmailAndPassword(
        auth,
        data.email,
        password
      );

      if (createdUser.user) {
        console.log("New user account created.");

        var dbRef = collection(db, "users");

        var userData = {};

        if (data.type == "student") {
          userData = {
            img: process.env.DEFAULT_USER_IMG,
            role: data.type, // added to identify user role
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            idNum: data.idNum,
            uid: createdUser.user.uid,
            isArchived: data.isArchived,
            section: data.section,
            schoolyear: data.schoolyear,
          };
        } else if (data.type == "teacher") {
          userData = {
            img: process.env.DEFAULT_USER_IMG,
            role: data.type, // added to identify user role
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            uid: createdUser.user.uid,
            section: data.section,
          };
        } else {
          userData = {
            img: process.env.DEFAULT_USER_IMG,
            role: data.type, // added to identify user role
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            uid: createdUser.user.uid,
            isArchived: data.isArchived
          };
        }

        // if not provided force to set ""
        if(!data.midName){
          userData['midName'] = "";
        } else {
          userData['midName'] = data.midName;
        }


        // either admin or student or teacher we add it
        addingResult = await addDoc(dbRef, userData);
        console.log("New user document added.");

        if (addingResult) {
          // send an email here to the user
          sendPasswordResetMail(data.firstName, data.email, password)
            .then((info) => {
              console.log("The mail was sent to the new user.");
              return res.status(StatusCodes.CREATED).json({
                status: StatusCodes.CREATED,
                title: ReasonPhrases.CREATED,
                data: {
                  email: data.email,
                  id: addingResult.id
                },
              });
            })
            .catch((error) => {
              throw new Error(error);
            });
        }
      } else {
        throw new Error("Failed to create user account.");
      }
    } catch (error) {
      console.log(error);

      if (createdUser) {
        // delete the created account
        createdUser.user.delete();
      }

      // delete the created user document
      if (addingResult) {
        deleteDoc(doc(db, "users", addingResult.id));
      }

      var sentError = error;

      if (
        error.name == "FirebaseError" &&
        error.code == "auth/email-already-in-use"
      ) {
        sentError = {
          name: error.name,
          error: error.customData._tokenResponse.error.message,
        };
      }

      return res.status(StatusCodes.CONFLICT).json({
        status: StatusCodes.CONFLICT,
        title: ReasonPhrases.CONFLICT,
        data: sentError,
      });
    }
  });

  return router;
};
