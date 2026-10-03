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
        let genreName = document.getElementById("genre").selectedOptions[0].text;

        // These categories do not have enough questions on hard difficulty. 
        // Hard coding it to reduce requests made to the server.
        if (difficultyChoice == "hard" && (genreChoice == "26" || genreChoice == "30")) { 
            alert("This category does not have enough questions for hard difficulty. Please choose another option."); 
            return; 
        }

        localStorage.setItem("difficulty", difficultyChoice);
        localStorage.setItem("genre", genreChoice);
        localStorage.setItem("genreName", genreName);

        window.location.href = "game.html";
    });
}

// GAME PAGE
if (page == "game.html") {
    let point = 0;
    let questions = [];
    let allAnswers = [];
    let correctAnswers = []; 
    let myAnswers = [];
    let index = 0; 

    let difficultyChoice = localStorage.getItem("difficulty");
    let genreChoice = localStorage.getItem("genre");
    let genreName = localStorage.getItem("genreName");

    async function getQuestions() {

        let apiUrl = "https://opentdb.com/api.php?amount=10&category=" + genreChoice + "&difficulty=" + difficultyChoice + "&type=multiple";
        try {
            const response = await fetch(apiUrl); 
            const data = await response.json();
            let dataResult = data.results;
            shuffle(dataResult);

            for (let i = 0; i < 10; i++) {
                questions.push(decodeHtml(dataResult[i].question));
                correctAnswers.push(decodeHtml(dataResult[i].correct_answer));
                let incorrectAnswers = dataResult[i].incorrect_answers.map(decodeHtml);
                let answers = [correctAnswers[i], ...incorrectAnswers];
                shuffle(answers);
                allAnswers.push(answers);
            }
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
        console.log(allAnswers);

        document.getElementById("genre").textContent = genreName.toUpperCase();
        document.getElementById("mode").textContent = difficultyChoice.toUpperCase();
        document.getElementById("question-number").textContent = "Question " + (index + 1);
        document.getElementById("progressBar").style.width = Math.round(((index + 1) / 10) * 100) + '%';
        document.getElementById("question").textContent = questions[index];

        for (let i = 0; i < 4; i++) {
            buttons[i].textContent = allAnswers[index][i];
        }

        buttons.forEach(button => {
            button.addEventListener("click", handleAnswer);
        });
    }
    setQuestion();


    function handleAnswer(event) {
        myAnswers.push(event.target.textContent);
        if (myAnswers[index] == correctAnswers[index]) point++;

        buttons.forEach(button => {
            button.removeEventListener("click", handleAnswer);

            if (!(button.id == event.target.id)) button.style.opacity = "0.4";
            if (button.textContent == correctAnswers[index]) button.classList.add("right");
            else button.classList.add("wrong");
        });

        setTimeout(() => {
            if (index == 9) {
                localStorage.setItem("point", point);
                localStorage.setItem("questions", JSON.stringify(questions));
                localStorage.setItem("allAnswers", JSON.stringify(allAnswers));
                localStorage.setItem("correctAnswers", JSON.stringify(correctAnswers));
                localStorage.setItem("myAnswers", JSON.stringify(myAnswers));
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
    let index = 0;
    let point = localStorage.getItem("point");
    let questions = JSON.parse(localStorage.getItem("questions") || "[]");
    let allAnswers = JSON.parse(localStorage.getItem("allAnswers") || "[]");
    let correctAnswers = JSON.parse(localStorage.getItem("correctAnswers") || "[]");
    let myAnswers = JSON.parse(localStorage.getItem("myAnswers") || "[]");

    function update() {
        for (let i = 0; i < 10; i++) {
            let q = "q" + (i + 1);
            let btn = document.getElementById(q);

            if (myAnswers[i] == correctAnswers[i]) {
                if (i == index) {
                    btn.style.backgroundColor = "rgba(var(--review-green), 1)";
                    btn.style.color = "#15251A";
                    btn.style.borderColor = "rgba(var(--review-green), 1)";
                } else {
                    btn.style.backgroundColor = "rgba(var(--review-green), 0.15)";
                    btn.style.color = "rgba(var(--review-green), 1)";
                    btn.style.borderColor = "rgba(var(--review-green), 0.5)";
                }
            }
            else {
                if (i == index) {
                    btn.style.backgroundColor = "rgba(var(--review-red), 1)";
                    btn.style.color = "#15251A";
                    btn.style.borderColor = "rgba(var(--review-red), 1)";
                } else {
                    btn.style.backgroundColor = "rgba(var(--review-red), 0.15)";
                    btn.style.color = "rgba(var(--review-red), 1)";
                    btn.style.borderColor = "rgba(var(--review-red), 0.5)";
                }
            }
        }

        document.getElementById("question-on").textContent = index + 1;
        document.getElementById("question").textContent = questions[index];
        for (let i = 0; i < 4; i++) {
            let a = "a" + (i + 1);
            let ans = document.getElementById(a);
            ans.textContent = allAnswers[index][i];

            // Reset color
            ans.style.backgroundColor = "rgba(255, 255, 255, 2.5%)";
            ans.style.borderColor = "rgba(255, 255, 255, 10%)";

            if (allAnswers[index][i] == myAnswers[index]) {
                ans.style.backgroundColor = "rgba(var(--review-red), 0.15)";
                ans.style.borderColor = "rgba(var(--review-red), 0.5)";
            }
            if (allAnswers[index][i] == correctAnswers[index]) {
                ans.style.backgroundColor = "rgba(var(--review-green), 0.15)";
                ans.style.borderColor = "rgba(var(--review-green), 0.5)";
            }
        }
    }
    update();

    for (let i = 0; i < 10; i++) {
        let q = "q" + (i + 1);
        btn = document.getElementById(q);

        btn.addEventListener("mouseenter", (event) => {
            index = parseInt(event.target.id.slice(1)) - 1;
            update();
        })
    }

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