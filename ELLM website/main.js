const ellm = new ELLM();

const sampleKnowledge = `
All humans are mortal.
Socrates is human.
All birds can fly.
Penguins are birds.
Penguins cannot fly.
The engine is part of the car.
The car is part of the transportation system.
Alice likes mathematics.
Bob teaches mathematics.
If Bob teaches mathematics and Alice likes mathematics, then Alice likes Bob.
`;

function $(id) {
  return document.getElementById(id);
}

const knowledgeInput = $("knowledgeInput");
const learnLog = $("learnLog");
const factsList = $("facts");
const rulesList = $("rules");
const queryInput = $("queryInput");
const answerEl = $("answer");
const parsedEl = $("parsed");
const explanationEl = $("explanation");

function renderList(container, items, emptyLabel) {
  container.innerHTML = "";
  if (!items.length) {
    const li = document.createElement("li");
    li.className = "muted";
    li.textContent = emptyLabel;
    container.appendChild(li);
    return;
  }

  items.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    container.appendChild(li);
  });
}

function renderKnowledge() {
  const snapshot = ellm.getKnowledgeSummary();
  renderList(factsList, snapshot.facts, "No facts learned yet.");
  renderList(rulesList, snapshot.rules, "No rules learned yet.");
}

function renderLearnResults(results) {
  learnLog.innerHTML = "";
  if (!results.length) {
    learnLog.textContent = "Enter facts or rules for ELLM to learn.";
    return;
  }

  results.forEach(line => {
    const div = document.createElement("div");
    div.textContent = line;
    learnLog.appendChild(div);
  });
}

function learnFromText() {
  const text = knowledgeInput.value.trim();
  if (!text) {
    renderLearnResults(["Please enter at least one fact or rule."]);
    return;
  }

  const results = ellm.learn(text);
  renderLearnResults(results);
  renderKnowledge();
}

function askQuestion() {
  const question = queryInput.value.trim();
  if (!question) {
    answerEl.textContent = "—";
    parsedEl.textContent = "Please provide a question.";
    explanationEl.textContent = "Type a question like 'Is Socrates mortal?'";
    return;
  }

  const result = ellm.query(question);
  answerEl.textContent = result.answer;
  parsedEl.textContent = result.parsedQuery || "Could not parse";
  explanationEl.textContent = result.explanation;
}

function resetWorkspace() {
  ellm.reset();
  knowledgeInput.value = "";
  queryInput.value = "";
  renderLearnResults([]);
  renderKnowledge();
  answerEl.textContent = "—";
  parsedEl.textContent = "—";
  explanationEl.textContent = "Teach ELLM and ask something to see the reasoning steps.";
}

function loadSample() {
  resetWorkspace();
  knowledgeInput.value = sampleKnowledge.trim();
  learnFromText();
  queryInput.value = "Is Socrates mortal?";
}

function wireEvents() {
  $("learnButton").addEventListener("click", learnFromText);
  $("askButton").addEventListener("click", askQuestion);
  $("resetEllm").addEventListener("click", resetWorkspace);
  $("loadSample").addEventListener("click", loadSample);
  queryInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      askQuestion();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  wireEvents();
  renderKnowledge();
  renderLearnResults([]);
});
