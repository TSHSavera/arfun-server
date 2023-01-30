const { uuid } = require("uuidv4");
const fs = require("fs");
const { rejects } = require("assert");

function _layout(docOptions) {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${docOptions.title}</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"
            integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
    </head>
    <body>
        <div class="container p-3">
            ${docOptions.content}
        </div>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"
            integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM"
            crossorigin="anonymous"></script>

        ${docOptions.script}
    </body>
    </html>`;
}

function getSubmitButton(
  bgColor = "purple",
  borderColor = "purple",
  color = "white",
  loaderVisible = false
) {
  return `<div class="d-flex justify-content-end align-items-center">
    <button role="button" type="submit" class="btn btn-secondary"
        style="background-color: ${bgColor}; border-color: ${borderColor}; color: ${color};">
        <div class="d-flex align-items-center justify-content-center">
        <div class="spinner-border spinner-border-sm me-2" role="status" fill="currentColor" id="sbm-loader"
          style="display: ${
            loaderVisible ? 'block' : 'none'
          };">
        </div>
            <span>Submit</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                class="bi bi-arrow-right-short ms-2" viewBox="0 0 16 16">
                <path fill-rule="evenodd"
                    d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z" />
            </svg>
        </div>
    </button>
</div>`;
}

function getQuizHeaderTemplate(
  title,
  instructions,
  color = "purple",
  credentials
) {
  return `<div class="rounded-3 my-4 bg-light border border-2 shadow ">
            <div data-quizid="${credentials.quizId}" data-taker="${credentials.quizTakerId}" style="display: none;"></div>
            <div class="p-4 rounded-top" style="background-color: ${color};"></div>
            <div class="rowd-flex p-4  flex-column">
                <div class="col">
                    <div class="mb-4">
                        <span for="inp-quiz-name" class="form-label h1 mb-3">${title}</span>
                    </div>
                </div> 
                <div class="col">
                    <div class="mb-3">
                        <span for="inp-quiz-instruct" class="form-label mb-3">${instructions}</span>
                    </div>
                </div>
            </div>
        </div>`;
}

function getChoiceTemplate(qid, value, isChecked = false) {
  var uid = uuid();
  return `<div class="col d-flex">
        <div class="w-100 d-flex gap-2 align-items-center">
            <div>
                <input class="form-check-input" type="radio" name="choice-${qid}" id="choice-${uid}" ${
    isChecked ? `checked` : ``
  }>
            </div>
            <div>
                <label class="form-check-label" for="choice-${uid}">${value}</label>
            </div>
        </div>
    </div>`;
}

function getQuestionTemplate(qid, question, choices) {
  return `<div class="rounded-3 mt-2 p-4 mb-4 bg-light border border-2 shadow" data-qid="${qid}">
  <div class="row d-flex flex-column">
      <div class="col mb-3">
          <span  class="h6 mb-3">${question}</span>
      </div>
      <div class="col">
          <div class="row d-flex flex-column gap-3" data-choice-qid="${qid}">
                ${choices}
          </div>
      </div>
  </div>
</div>`;
}

function getQuizView(quizDoc, quizId, quizTakerId) {
  // can be moved to options
  var themeColor = "purple";

  var view = getQuizHeaderTemplate(
    quizDoc.title,
    quizDoc.instructions,
    themeColor,
    {
      quizId: quizId,
      quizTakerId: quizTakerId,
    }
  );

  quizDoc.questions.forEach((question, qid) => {
    var choices = "";

    question.choices.forEach((choice) => {
      choices += getChoiceTemplate(qid, choice.value);
    });

    view += getQuestionTemplate(qid, question.question, choices);
  });

  view += getSubmitButton(themeColor, themeColor);

  var script = fs.readFileSync(__dirname + "/scripts/quiz-script.html", {
    encoding: "utf8",
  });

  return _layout({
    title: quizDoc.title,
    content: view,
    script: script,
  });
}

module.exports = { getQuizView };
