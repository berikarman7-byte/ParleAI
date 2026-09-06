// ==========================================
// PARLEAI 🇫🇷
// Французский словарь + обучение
// ==========================================

// ---------- ДАННЫЕ ----------

const words = [
    { french: "bonjour", russian: "здравствуйте", category: "basic" },
    { french: "salut", russian: "привет", category: "basic" },
    { french: "merci", russian: "спасибо", category: "basic" },
    { french: "pardon", russian: "извините", category: "basic" },
    { french: "oui", russian: "да", category: "basic" },
    { french: "non", russian: "нет", category: "basic" },
    { french: "au revoir", russian: "до свидания", category: "basic" },
    { french: "s'il vous plaît", russian: "пожалуйста", category: "basic" },
    { french: "ami", russian: "друг", category: "people" },
    { french: "amie", russian: "подруга", category: "people" },
    { french: "homme", russian: "мужчина", category: "people" },
    { french: "femme", russian: "женщина", category: "people" },
    { french: "enfant", russian: "ребёнок", category: "people" },
    { french: "père", russian: "отец", category: "people" },
    { french: "mère", russian: "мать", category: "people" },
    { french: "frère", russian: "брат", category: "people" },
    { french: "sœur", russian: "сестра", category: "people" },
    { french: "pain", russian: "хлеб", category: "food" },
    { french: "eau", russian: "вода", category: "food" },
    { french: "lait", russian: "молоко", category: "food" },
    { french: "fromage", russian: "сыр", category: "food" },
    { french: "pomme", russian: "яблоко", category: "food" },
    { french: "viande", russian: "мясо", category: "food" },
    { french: "poisson", russian: "рыба", category: "food" },
    { french: "maison", russian: "дом", category: "basic" },
    { french: "école", russian: "школа", category: "basic" },
    { french: "livre", russian: "книга", category: "basic" },
    { french: "ville", russian: "город", category: "basic" },
    { french: "pays", russian: "страна", category: "basic" },
    { french: "jour", russian: "день", category: "basic" },
    { french: "nuit", russian: "ночь", category: "basic" }
];


// ---------- СОСТОЯНИЕ ----------

let learnedWords =
    JSON.parse(localStorage.getItem("parleai_learned")) || [];

let favorites =
    JSON.parse(localStorage.getItem("parleai_favorites")) || [];

let xp =
    Number(localStorage.getItem("parleai_xp")) || 0;

let currentCategory = "all";

let reviewIndex = 0;

let quizIndex = 0;

let quizScore = 0;

let quizWords = [];


// ---------- СОХРАНЕНИЕ ----------

function saveData() {

    localStorage.setItem(
        "parleai_learned",
        JSON.stringify(learnedWords)
    );

    localStorage.setItem(
        "parleai_favorites",
        JSON.stringify(favorites)
    );

    localStorage.setItem(
        "parleai_xp",
        xp
    );

}


// ---------- НАВИГАЦИЯ ----------

function openPage(pageId) {

    document
        .querySelectorAll(".page")
        .forEach(page => {
            page.classList.add("hidden");
        });

    const page =
        document.getElementById(pageId);

    if (page) {
        page.classList.remove("hidden");
    }

    if (pageId === "wordsPage") {
        renderWords();
    }

    if (pageId === "favoritesPage") {
        renderFavorites();
    }

    if (pageId === "reviewPage") {
        prepareReview();
    }

    updateProgress();

}


function goHome() {

    openPage("homePage");

}


// ---------- СЛОВА ----------

function renderWords() {

    const list =
        document.getElementById("wordList");

    const search =
        document
        .getElementById("searchInput")
        ?.value
        .toLowerCase()
        .trim() || "";

    let filtered = words.filter(word => {

        const categoryMatch =
            currentCategory === "all" ||
            word.category === currentCategory;

        const searchMatch =
            word.french
            .toLowerCase()
            .includes(search) ||

            word.russian
            .toLowerCase()
            .includes(search);

        return categoryMatch && searchMatch;

    });


    if (filtered.length === 0) {

        list.innerHTML = `
            <div class="empty">
                <div class="empty-icon">🔎</div>
                <p>Ничего не найдено</p>
            </div>
        `;

        return;
    }


    list.innerHTML = filtered
        .map(word => createWordHTML(word))
        .join("");

}


function createWordHTML(word) {

    const isFavorite =
        favorites.includes(word.french);

    const isLearned =
        learnedWords.includes(word.french);

    return `

        <div class="word-item">

            <div class="word-main">

                <div class="word-french">
                    ${word.french}
                </div>

                <div class="word-russian">
                    ${word.russian}
                </div>

                <div class="word-category">
                    ${categoryName(word.category)}
                    ${isLearned ? " • ✅ изучено" : ""}
                </div>

            </div>

            <div class="word-actions">

                <button
                    class="small-action"
                    onclick="speakWord('${escapeText(word.french)}')">
                    🔊
                </button>

                <button
                    class="small-action"
                    onclick="toggleFavorite('${escapeText(word.french)}')">

                    ${isFavorite ? "❤️" : "🤍"}

                </button>

            </div>

        </div>
    `;
}


function categoryName(category) {

    const names = {

        basic: "Основное",

        people: "Люди",

        food: "Еда"

    };

    return names[category] || "Другое";

}


function escapeText(text) {

    return text
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");

}


// ---------- ПОИСК ----------

function searchWords() {

    renderWords();

}


// ---------- КАТЕГОРИИ ----------

function filterCategory(category, button) {

    currentCategory = category;

    document
        .querySelectorAll(".category")
        .forEach(item => {
            item.classList.remove("active");
        });

    button.classList.add("active");

    renderWords();

}


// ---------- ИЗБРАННОЕ ----------

function toggleFavorite(french) {

    if (favorites.includes(french)) {

        favorites =
            favorites.filter(
                word => word !== french
            );

    } else {

        favorites.push(french);

        addXP(2);

    }

    saveData();

    renderWords();

    renderFavorites();

    updateProgress();

}


function renderFavorites() {

    const list =
        document.getElementById("favoritesList");

    if (!favorites.length) {

        list.innerHTML = `
            <div class="empty">
                <div class="empty-icon">❤️</div>
                <p>Здесь пока нет избранных слов.</p>
            </div>
        `;

        return;
    }


    const favoriteWords =
        words.filter(
            word => favorites.includes(word.french)
        );


    list.innerHTML =
        favoriteWords
        .map(word => createWordHTML(word))
        .join("");

}


// ---------- ОЗВУЧКА ----------

function speakWord(text) {

    if (!("speechSynthesis" in window)) {

        alert(
            "Ваш браузер не поддерживает озвучку."
        );

        return;
    }


    speechSynthesis.cancel();

    const speech =
        new SpeechSynthesisUtterance(text);

    speech.lang = "fr-FR";

    speech.rate = 0.85;

    speech.pitch = 1;

    speechSynthesis.speak(speech);

}


// ---------- XP ----------

function addXP(amount) {

    xp += amount;

    saveData();

    updateProgress();

}


// ---------- ПРОГРЕСС ----------

function updateProgress() {

    const total =
        words.length;

    const learned =
        learnedWords.length;

    const percent =
        total === 0
            ? 0
            : Math.round((learned / total) * 100);


    const progressBar =
        document.getElementById("progressBar");

    const progressPercent =
        document.getElementById("progressPercent");

    const learnedCount =
        document.getElementById("learnedCount");

    const totalCount =
        document.getElementById("totalCount");

    const xpValue =
        document.getElementById("xpValue");


    if (progressBar) {

        progressBar.style.width =
            percent + "%";

    }


    if (progressPercent) {

        progressPercent.textContent =
            percent + "%";

    }


    if (learnedCount) {

        learnedCount.textContent =
            learned;

    }


    if (totalCount) {

        totalCount.textContent =
            total;

    }


    if (xpValue) {

        xpValue.textContent =
            xp;

    }


    updateDailyProgress();

}


// ---------- ОТМЕТИТЬ СЛОВО ----------

function markLearned(french) {

    if (!learnedWords.includes(french)) {

        learnedWords.push(french);

        addXP(10);

        saveData();

    }

    updateProgress();

}


// ---------- ДНЕВНАЯ ЦЕЛЬ ----------

function updateDailyProgress() {

    const amount =
        Math.min(
            learnedWords.length,
            10
        );

    const percent =
        amount * 10;


    const bar =
        document.getElementById("dailyProgress");

    const text =
        document.getElementById("dailyText");


    if (bar) {

        bar.style.width =
            percent + "%";

    }


    if (text) {

        text.textContent =
            `${amount} / 10 слов`;

    }

}


// ---------- ПОВТОРЕНИЕ ----------

function prepareReview() {

    const learned =
        words.filter(
            word =>
                learnedWords.includes(word.french)
        );


    if (!learned.length) {

        document.getElementById("flashFrench")
            .textContent = "Нет слов";

        document.getElementById("flashRussian")
            .textContent =
            "Сначала изучи несколько слов.";

        return;

    }


    reviewIndex =
        Math.floor(
            Math.random() * learned.length
        );


    showReviewCard(learned[reviewIndex]);

}


function showReviewCard(word) {

    document.getElementById("flashFront")
        .classList.remove("hidden");

    document.getElementById("flashBack")
        .classList.add("hidden");


    document.getElementById("flashFrench")
        .textContent = word.french;

    document.getElementById("flashRussian")
        .textContent = word.russian;

}


function flipCard() {

    document
        .getElementById("flashFront")
        .classList.toggle("hidden");

    document
        .getElementById("flashBack")
        .classList.toggle("hidden");

}


function reviewAnswer(correct) {

    if (correct) {

        addXP(5);

    }


    prepareReview();

}


// ---------- ТЕСТ ----------

function startQuiz() {

    openPage("quizPage");

    quizIndex = 0;

    quizScore = 0;

    quizWords =
        shuffle([...words])
        .slice(0, 10);

    showQuizQuestion();

}


function showQuizQuestion() {

    const word =
        quizWords[quizIndex];


    if (!word) {

        finishQuiz();

        return;

    }


    document.getElementById("quizNumber")
        .textContent =
        quizIndex + 1;


    document.getElementById("quizQuestion")
        .textContent =
        `Что означает «${word.french}»?`;


    document.getElementById("quizResult")
        .textContent = "";


    let answers = [

        word.russian

    ];


    const others =
        shuffle(
            words.filter(
                item =>
                    item.french !== word.french
            )
        );


    for (
        let i = 0;
        i < 3;
        i++
    ) {

        if (others[i]) {

            answers.push(
                others[i].russian
            );

        }

    }


    answers =
        shuffle(answers);


    const container =
        document.getElementById(
            "quizAnswers"
        );


    container.innerHTML =
        answers
        .map(answer => `

            <button
                class="quiz-answer"
                onclick="answerQuiz(
                    '${escapeText(answer)}',
                    '${escapeText(word.russian)}',
                    this
                )">

                ${answer}

            </button>

        `)
        .join("");

}


function answerQuiz(answer, correct, button) {

    const buttons =
        document.querySelectorAll(
            ".quiz-answer"
        );


    buttons.forEach(item => {

        item.disabled = true;

    });


    if (answer === correct) {

        button.classList.add(
            "correct-answer"
        );

        document.getElementById(
            "quizResult"
        ).textContent =
            "✅ Правильно!";

        quizScore++;

        addXP(10);

    } else {

        button.classList.add(
            "wrong-answer"
        );

        document.getElementById(
            "quizResult"
        ).textContent =
            `❌ Правильный ответ: ${correct}`;

    }


    setTimeout(() => {

        quizIndex++;

        showQuizQuestion();

    }, 900);

}


function finishQuiz() {

    const container =
        document.getElementById(
            "quizAnswers"
        );


    document.getElementById(
        "quizQuestion"
    ).textContent =
        "Тест завершён! 🎉";


    container.innerHTML = `

        <div class="card">

            <h2>
                ${quizScore} / 10
            </h2>

            <p>
                Ты получил ${quizScore * 10} XP.
            </p>

            <button
                onclick="goHome()">

                На главную

            </button>

        </div>

    `;

}


// ---------- ПЕРЕМЕШИВАНИЕ ----------

function shuffle(array) {

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            array[i],
            array[j]
        ] =
        [
            array[j],
            array[i]
        ];

    }

    return array;

}


// ---------- ТЕМА ----------

function toggleTheme() {

    document.body
        .classList
        .toggle("dark");


    const dark =
        document.body
        .classList
        .contains("dark");


    localStorage.setItem(
        "parleai_dark",
        dark
    );

}


// ---------- ЗАГРУЗКА ----------

function loadTheme() {

    const dark =
        localStorage.getItem(
            "parleai_dark"
        );


    if (dark === "true") {

        document.body
            .classList
            .add("dark");

    }

}


// ---------- СТАРТ ----------

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadTheme();

        updateProgress();

        renderWords();

    }
);