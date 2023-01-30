const { getQuizView } = require("../views/quiz-taking-view");

function renderQuizTaking(quizDoc, quizId, quizTakerId) {
  // returns an html page for quiz taking
  return getQuizView(quizDoc, quizId, quizTakerId);
}

module.exports = { renderQuizTaking };
