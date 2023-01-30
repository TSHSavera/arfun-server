const { Router } = require("express");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");

const { db, firebaseFirestore } = require('../services/firebase-service');

const {
  doc,
  getDoc,
  query,
  where,
  getDocs,
  collection,
  addDoc,
} = firebaseFirestore;

const { renderQuizTaking } = require("../services/quizview-render-service");

async function getTaker(quizTakerId) {
  // verify if tyhe quiz taker requesting is legitimate
  try {
    var collectionName = "users";
    var q = query(
      collection(db, collectionName),
      where("uid", "==", quizTakerId)
    );
    var takerSnap = await getDocs(q);

    var result = null;

    // we assume uid is unique for every user
    takerSnap.forEach((doc) => {
      result = doc.data();
      return;
    });

    return result;
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function getQuizData(quizId) {
  try {
    var collectionName = "quizzes";
    var quizRef = doc(db, collectionName, quizId);
    var quizSnapshot = await getDoc(quizRef);

    if (quizSnapshot.exists()) {
      return quizSnapshot.data();
    }

    throw Error();
  } catch (error) {
    return null;
  }
}

async function checkRequest(req, res, next) {
  if (req.query.qid == undefined || req.query.tid == undefined) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      title: ReasonPhrases.BAD_REQUEST,
    });
  }

  var quiz = await getQuizData(req.query.qid);

  if (quiz == null) {
    return res.status(StatusCodes.NOT_FOUND).json({
      status: StatusCodes.NOT_FOUND,
      title: ReasonPhrases.NOT_FOUND,
    });
  }

  var quizTaker = await getTaker(req.query.tid);

  if (quizTaker == null) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: StatusCodes.UNAUTHORIZED,
      title: ReasonPhrases.UNAUTHORIZED,
    });
  }

  req.quizDoc = quiz;
  req.quizTaker = quizTaker;

  next();
}

function getScore(answers, takerAnswers) {
  var correctAns = [];
  var userAns = [];

  takerAnswers.map((u) => {
    userAns.push(u.answerIdx);
  });

  answers.map((a) => {
    correctAns.push(a.answerIdx);
  });

  return userAns.filter((a) => correctAns.includes(a)).length;
}

module.exports = () => {
  const router = Router();

  router.get("/api/getquiz", checkRequest, async (req, res) => {
    if (req.query.v == null || req.query.v != 1) {
      return res.status(StatusCodes.OK).json({
        page: renderQuizTaking(req.quizDoc, req.query.qid, req.query.tid),
      });
    } else if (req.query.v == 1) {
      return res
        .status(StatusCodes.OK)
        .send(renderQuizTaking(req.quizDoc, req.query.qid, req.query.tid));
    }
  });

  router.post("/api/getscore", checkRequest, async (req, res) => {
    console.log(req.body);

    if (req.body.takerAnswers == undefined) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        title: ReasonPhrases.BAD_REQUEST,
      });
    }

    var score = getScore(req.quizDoc.answers, req.body.takerAnswers);

    var scoreData = {
      uid: req.query.tid,
      quizId: req.query.qid,
      score: score,
      items: req.quizDoc.answers.length,
      quizTitle: req.quizDoc.title,
      description: `${score}/${req.quizDoc.answers.length}`,
      dateCompleted: new Date(Date.now()).toISOString(),
    };

    var result = await addDoc(collection(db, 'quizScores'), scoreData);

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      data: 'Evaluation complete.',
    });
  });

  return router;
};
