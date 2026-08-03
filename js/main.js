document.documentElement.style.setProperty("--app-height", `${window.innerHeight}px`);

const page = window.location.pathname.split("/").pop();

// INDEX PAGE
if (page == "" || page == "index.html") {
    async function getCategories() {
        try { 
            const response = await fetch("https://opentdb.com/api_category.php"); 
            const data = await response.json();
            const categories = data.trivia_categories;
        
            categories.forEach(element => {
                document.getElementById("genre").innerHTML += "<option value='" + element.id + "'>" + element.name + "</option>";
            });
        }
        catch (error) {
            console.log("Failed to load category: ", error);
            alert("Failed to load category.");
        }
    }
    getCategories();
    
    document.getElementById("start-button").addEventListener("click", () => {
        let difficultyChoice = document.getElementById("difficulty").value;
        let genreChoice = document.getElementById("genre").value;

        localStorage.setItem("difficulty", difficultyChoice);
        localStorage.setItem("genre", genreChoice);

        window.location.href = "game.html";
    });
}

// GAME PAGE
if (page == "game.html") {
    let point = 0;
    let questions;
    let correctAnswer;
    let index = 0; 

    async function getQuestions() {
        let difficultyChoice = localStorage.getItem("difficulty");
        let genreChoice = localStorage.getItem("genre");

        let apiUrl = "https://opentdb.com/api.php?amount=10&category=" + genreChoice + "&difficulty=" + difficultyChoice + "&type=multiple";
        try {
            const response = await fetch(apiUrl); 
            const data = await response.json();
            questions = data.results;
            shuffle(questions);
        }
        catch (error) {
            console.log("Failure to load questions: ", error);
            alert("Failure to load questions.");
        }
    }

    let r = document.getElementById("red");
    let b = document.getElementById("blue");
    let y = document.getElementById("yellow");
    let g = document.getElementById("green");
    let buttons = [r, b, y, g];

    async function setQuestion() {
        if (index == 0) await getQuestions();

        document.getElementById("question-number").textContent = "Question " + (index + 1) + " of 10";
        document.getElementById("question").textContent = decodeHtml(questions[index].question);
        correctAnswer = decodeHtml(questions[index].correct_answer);
        let incorrectAnswers = questions[index].incorrect_answers.map(decodeHtml);
        let answers = [correctAnswer, ...incorrectAnswers];

        shuffle(answers);

        for (let i = 0; i < answers.length; i++) {
            buttons[i].textContent = answers[i];
        }

        buttons.forEach(button => {
            button.addEventListener("click", handleAnswer);
        });
    }
    setQuestion();


    function handleAnswer(event) {
        if (event.target.textContent == decodeHtml(correctAnswer)) point++;

        buttons.forEach(button => {
            button.removeEventListener("click", handleAnswer);

            if (!(button.id == event.target.id)) button.style.opacity = "0.4";
            if (button.textContent == decodeHtml(correctAnswer)) button.classList.add("right");
            else button.classList.add("wrong");
        });

        setTimeout(() => {
            

            if (index == 9) {
                localStorage.setItem("point", point);
                window.location.href = "result.html";
            } else {
                buttons.forEach(button => {
                    button.className = "";
                    button.style.opacity = "1";
                });

                index++;
                setQuestion();
            }
        }, 1500);
    }
}

// RESULT PAGE
if (page == "result.html") {
    point = localStorage.getItem("point");
    
    document.getElementById("correct").textContent = point;
    document.getElementById("mainMenu").addEventListener("click", () => {
        window.location.href = "index.html";
    });
}

// Fisher yates shuffle
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// For data sanitization
function decodeHtml(str) {
    const txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
}