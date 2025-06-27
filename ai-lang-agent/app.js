// Update Quiz Stats (separate from learning stats)
function updateQuizStats() {
    const quizAccuracy = quizTotalAttempts > 0 ? Math.round((quizCorrectAnswers / quizTotalAttempts) * 100) : 0;
    
    // Update quiz display stats
    document.getElementById('quizAccuracy').textContent = quizAccuracy + '%';
    document.getElementById('quizStreak').textContent = streak;
}// Global Variables
let selectedMode = '';
let currentWord = 0;
let wordsLearned = 0;
let correctAnswers = 0;
let totalAttempts = 0;
let quizCorrectAnswers = 0;
let quizTotalAttempts = 0;
let streak = 0;
let apiKeys = {};
let completedWords = new Set();
let quizMode = false;
let currentQuiz = null;
let quizStats = {
    multipleChoice: { correct: 0, total: 0 },
    wordMatching: { correct: 0, total: 0 },
    synonym: { correct: 0, total: 0 }
};

// Free Visual Representations (Emoji-based)
function getFreeVisualRepresentation(word) {
    const visualMap = {
        "ubiquitous": "🌐📱💻🔗 Everywhere you look!",
        "ambiguous": "🤔❓🔀 Multiple meanings possible",
        "scrutinize": "🔍📋👀 Examining closely",
        "vindicate": "⚖️✅🎉 Proven right!",
        "plausible": "👍💡✨ Sounds reasonable",
        "aggregate": "🧩➕📊 All parts together",
        "substantiate": "📄✅🔬 Backed by evidence",
        "conducive": "🌱➡️🎯 Helps achieve goals",
        "mitigate": "🛡️⬇️💧 Reduces the problem",
        "commensurate": "⚖️📏✨ Properly balanced",
        "exemplary": "🏆⭐👑 Outstanding example",
        "prevalent": "📈🌍🔥 Widespread everywhere",
        "contingent": "🔗❓⏳ Depends on something",
        "arbitrary": "🎲🤷‍♂️💭 Random choice",
        "reciprocal": "🤝↔️💕 Mutual exchange",
        "inherent": "🧬💎🔒 Built-in naturally",
        "redundant": "📋📋❌ Not needed",
        "tangible": "✋🪨💯 You can touch it",
        "discern": "👁️🔍✨ See clearly",
        "pragmatic": "🔧💼✅ Practical approach",
        "fortuitous": "🍀✨🎯 Lucky chance",
        "consensus": "👥🤝✅ Everyone agrees",
        "delineate": "📝📏🎯 Define clearly",
        "juxtapose": "📊↔️🔍 Side by side",
        "comprehensive": "📚🧩💯 Complete coverage",
        "innovation": "💡🚀⚡ New breakthrough",
        "paradigm": "🏗️📋🔄 Framework model",
        "infrastructure": "🏗️🌉💻 Foundation systems",
        "allocate": "📊💰📦 Distribute resources",
        "collaborate": "👥🤝💼 Work together",
        "optimize": "⚙️📈✨ Make it better",
        "facilitate": "🌉🚪➡️ Make it easier",
        "synthesize": "🧪➕💡 Combine elements",
        "methodology": "📋🔄📊 System approach",
        "benchmark": "📏🎯📊 Standard measure",
        "analogy": "🔍↔️💡 Similar comparison",
        "hypothesis": "🧪❓🔬 Testable idea",
        "correlation": "📈📊🔗 Connected relationship",
        "empirical": "🔬📊👁️ Based on observation",
        "feasible": "✅🎯💡 Doable plan",
        "preliminary": "1️⃣📋🚀 First step",
        "subsequent": "2️⃣➡️⏭️ What comes next",
        "fundamental": "🏗️💎🔒 Essential base",
        "criterion": "📏✅🎯 Judging standard",
        "constitute": "🧩➕🏗️ Forms the whole",
        "derive": "⛲➡️💧 Comes from source",
        "implies": "💭➡️💡 Suggests meaning",
        "establish": "🏗️🔒✅ Set up firmly",
        "significant": "⭐📈🎯 Very important",
        "assess": "📋🔍💯 Evaluate carefully"
    };
    
    return visualMap[word] || "📚💭✨ Learning in progress";
}

// Quiz System Functions
function generateMultipleChoiceQuiz(wordIndex) {
    const targetWord = vocabulary[wordIndex];
    const otherWords = vocabulary.filter((_, i) => i !== wordIndex);
    
    // Randomly choose quiz type
    const quizTypes = ['wordToDefinition', 'definitionToWord', 'synonymMatch', 'contextClue'];
    const quizType = quizTypes[Math.floor(Math.random() * quizTypes.length)];
    
    let question, correctAnswer, wrongAnswers;
    
    switch(quizType) {
        case 'wordToDefinition':
            question = `What does "${targetWord.word}" mean?`;
            correctAnswer = targetWord.definition;
            wrongAnswers = otherWords.sort(() => 0.5 - Math.random()).slice(0, 3).map(w => w.definition);
            break;
            
        case 'definitionToWord':
            question = `Which word means: "${targetWord.definition}"?`;
            correctAnswer = targetWord.word;
            wrongAnswers = otherWords.sort(() => 0.5 - Math.random()).slice(0, 3).map(w => w.word);
            break;
            
        case 'synonymMatch':
            question = `Which word is a synonym for "${targetWord.word}"?`;
            const synonyms = targetWord.synonyms.split(', ');
            correctAnswer = synonyms[0];
            wrongAnswers = otherWords.sort(() => 0.5 - Math.random()).slice(0, 3).map(w => w.synonyms.split(', ')[0]);
            break;
            
        case 'contextClue':
            question = `Complete the sentence: "${targetWord.example.replace(targetWord.word, '_____')}"`;
            correctAnswer = targetWord.word;
            wrongAnswers = otherWords.sort(() => 0.5 - Math.random()).slice(0, 3).map(w => w.word);
            break;
    }
    
    // Shuffle answers
    const allAnswers = [correctAnswer, ...wrongAnswers].sort(() => 0.5 - Math.random());
    
    return {
        type: 'multipleChoice',
        question,
        answers: allAnswers,
        correctAnswer,
        explanation: `"${targetWord.word}" means ${targetWord.definition}. Example: ${targetWord.example}`,
        targetWord: targetWord
    };
}

function generateWordMatchingQuiz(wordIndex) {
    const targetWord = vocabulary[wordIndex];
    const otherWords = vocabulary.filter((_, i) => i !== wordIndex);
    
    // Create word-definition pairs
    const pairs = [targetWord, ...otherWords.sort(() => 0.5 - Math.random()).slice(0, 3)];
    const shuffledDefinitions = pairs.map(w => w.definition).sort(() => 0.5 - Math.random());
    
    return {
        type: 'wordMatching',
        question: `Match "${targetWord.word}" with its correct definition:`,
        targetWord: targetWord.word,
        definitions: shuffledDefinitions,
        correctAnswer: targetWord.definition,
        explanation: `"${targetWord.word}" means ${targetWord.definition}. Example: ${targetWord.example}`,
        targetWordObj: targetWord
    };
}

function generateSynonymQuiz(wordIndex) {
    const targetWord = vocabulary[wordIndex];
    const synonyms = targetWord.synonyms.split(', ');
    const mainSynonym = synonyms[0];
    
    // Get other words as distractors
    const otherWords = vocabulary.filter((_, i) => i !== wordIndex);
    const distractors = otherWords.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    const allChoices = [mainSynonym, ...distractors.map(w => w.synonyms.split(', ')[0])];
    const shuffledChoices = allChoices.sort(() => 0.5 - Math.random());
    
    return {
        type: 'synonym',
        question: `Which word is the best synonym for "${targetWord.word}"?`,
        answers: shuffledChoices,
        correctAnswer: mainSynonym,
        explanation: `"${targetWord.word}" means ${targetWord.definition}. "${mainSynonym}" is a synonym. Example: ${targetWord.example}`,
        targetWord: targetWord
    };
}

function generateMatchingQuiz() {
    // Select 4 random words for matching
    const selectedWords = vocabulary.sort(() => 0.5 - Math.random()).slice(0, 4);
    
    return {
        type: 'matching',
        question: 'Match the words with their definitions:',
        words: selectedWords.map(w => w.word),
        definitions: selectedWords.map(w => w.definition).sort(() => 0.5 - Math.random()),
        correctMatches: selectedWords.reduce((acc, word) => {
            acc[word.word] = word.definition;
            return acc;
        }, {}),
        explanation: 'Great job matching the words!',
        selectedWords
    };
}

// Memory Mode Selection
function selectMode(mode) {
    selectedMode = mode;
    document.querySelectorAll('.mode-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.target.closest('.mode-card').classList.add('selected');
}

// Start Learning Function
function startLearning() {
    if (!selectedMode) {
        alert('Please select a learning style first!');
        return;
    }
    
    // Store API keys (optional - app works without them)
    apiKeys.openai = document.getElementById('openaiKey').value;
    apiKeys.stability = document.getElementById('stabilityKey').value;
    
    document.getElementById('setup').style.display = 'none';
    document.getElementById('learning').style.display = 'block';
    
    loadCurrentWord();
    showContentForMode();
}

// Start Quiz Mode
function startQuiz() {
    quizMode = true;
    document.getElementById('learning').style.display = 'none';
    document.getElementById('quiz').style.display = 'block';
    updateQuizStats(); // Initialize quiz stats display
    generateNewQuiz();
}

// Generate New Quiz
function generateNewQuiz() {
    const quizTypes = ['multipleChoice', 'wordMatching', 'synonym'];
    const randomType = quizTypes[Math.floor(Math.random() * quizTypes.length)];
    
    switch(randomType) {
        case 'multipleChoice':
            currentQuiz = generateMultipleChoiceQuiz(Math.floor(Math.random() * vocabulary.length));
            displayMultipleChoiceQuiz();
            break;
        case 'wordMatching':
            currentQuiz = generateWordMatchingQuiz(Math.floor(Math.random() * vocabulary.length));
            displayWordMatchingQuiz();
            break;
        case 'synonym':
            currentQuiz = generateSynonymQuiz(Math.floor(Math.random() * vocabulary.length));
            displaySynonymQuiz();
            break;
    }
}

// Display Quiz Functions
function displayMultipleChoiceQuiz() {
    const quizContainer = document.getElementById('quizContainer');
    quizContainer.innerHTML = `
        <div class="quiz-question">
            <h3>${currentQuiz.question}</h3>
        </div>
        <div class="quiz-answers">
            ${currentQuiz.answers.map((answer, index) => `
                <button class="quiz-answer-btn" onclick="selectAnswer('${answer}', this)">
                    ${String.fromCharCode(65 + index)}. ${answer}
                </button>
            `).join('')}
        </div>
        <div id="quizFeedback" class="quiz-feedback" style="display:none;"></div>
        <div class="quiz-controls" id="quizControls" style="display:none;">
            <button class="btn-primary" onclick="generateNewQuiz()">Next Question</button>
            <button class="btn-secondary" onclick="exitQuiz()">Exit Quiz</button>
        </div>
        <div class="quiz-back-controls">
            <button class="btn-secondary" onclick="exitQuiz()">← Back to Learning</button>
        </div>
    `;
}

function displayWordMatchingQuiz() {
    const quizContainer = document.getElementById('quizContainer');
    quizContainer.innerHTML = `
        <div class="quiz-question">
            <h3>${currentQuiz.question}</h3>
        </div>
        <div class="quiz-answers">
            ${currentQuiz.definitions.map((definition, index) => `
                <button class="quiz-answer-btn" onclick="selectAnswer('${definition}', this)">
                    ${String.fromCharCode(65 + index)}. ${definition}
                </button>
            `).join('')}
        </div>
        <div id="quizFeedback" class="quiz-feedback" style="display:none;"></div>
        <div class="quiz-controls" id="quizControls" style="display:none;">
            <button class="btn-primary" onclick="generateNewQuiz()">Next Question</button>
            <button class="btn-secondary" onclick="exitQuiz()">Exit Quiz</button>
        </div>
        <div class="quiz-back-controls">
            <button class="btn-secondary" onclick="exitQuiz()">← Back to Learning</button>
        </div>
    `;
}

function displaySynonymQuiz() {
    const quizContainer = document.getElementById('quizContainer');
    quizContainer.innerHTML = `
        <div class="quiz-question">
            <h3>${currentQuiz.question}</h3>
            <div class="quiz-hint">Choose the word that means the same thing.</div>
        </div>
        <div class="quiz-answers">
            ${currentQuiz.answers.map((answer, index) => `
                <button class="quiz-answer-btn" onclick="selectAnswer('${answer}', this)">
                    ${String.fromCharCode(65 + index)}. ${answer}
                </button>
            `).join('')}
        </div>
        <div id="quizFeedback" class="quiz-feedback" style="display:none;"></div>
        <div class="quiz-controls" id="quizControls" style="display:none;">
            <button class="btn-primary" onclick="generateNewQuiz()">Next Question</button>
            <button class="btn-secondary" onclick="exitQuiz()">Exit Quiz</button>
        </div>
        <div class="quiz-back-controls">
            <button class="btn-secondary" onclick="exitQuiz()">← Back to Learning</button>
        </div>
    `;
}

// Quiz Answer Functions
function selectAnswer(selectedAnswer, buttonElement) {
    const isCorrect = selectedAnswer === currentQuiz.correctAnswer;
    const feedbackDiv = document.getElementById('quizFeedback');
    
    // Update overall quiz tracking
    quizTotalAttempts++;
    if (isCorrect) {
        quizCorrectAnswers++;
        streak++;
    } else {
        streak = 0;
    }
    
    // Update quiz stats based on quiz type
    if (currentQuiz.type === 'multipleChoice') {
        quizStats.multipleChoice.total++;
        if (isCorrect) quizStats.multipleChoice.correct++;
    } else if (currentQuiz.type === 'wordMatching') {
        quizStats.wordMatching = quizStats.wordMatching || { correct: 0, total: 0 };
        quizStats.wordMatching.total++;
        if (isCorrect) quizStats.wordMatching.correct++;
    } else if (currentQuiz.type === 'synonym') {
        quizStats.synonym = quizStats.synonym || { correct: 0, total: 0 };
        quizStats.synonym.total++;
        if (isCorrect) quizStats.synonym.correct++;
    }
    
    // Update overall stats (for learning mode tracking)
    correctAnswers++;
    totalAttempts++;
    
    // Disable all answer buttons
    document.querySelectorAll('.quiz-answer-btn').forEach(btn => {
        btn.disabled = true;
        if (btn.textContent.includes(currentQuiz.correctAnswer)) {
            btn.classList.add('correct-answer');
        } else if (btn === buttonElement && !isCorrect) {
            btn.classList.add('wrong-answer');
        }
    });
    
    // Show feedback
    feedbackDiv.innerHTML = `
        <div class="${isCorrect ? 'correct' : 'incorrect'}">
            ${isCorrect ? '✅ Excellent!' : '❌ Not quite right'}
        </div>
        <div class="explanation">${currentQuiz.explanation}</div>
    `;
    feedbackDiv.style.display = 'block';
    document.getElementById('quizControls').style.display = 'block';
    
    updateQuizStats();
}

// Remove the old checkFillInAnswer function since we're not using it anymore

function exitQuiz() {
    quizMode = false;
    document.getElementById('quiz').style.display = 'none';
    document.getElementById('learning').style.display = 'block';
}

// AI Image Generation (Premium Feature)
async function generateImage(prompt) {
    if (!apiKeys.stability) {
        return null;
    }
    
    try {
        const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKeys.stability}`
            },
            body: JSON.stringify({
                text_prompts: [{ text: prompt }],
                cfg_scale: 7,
                height: 512,
                width: 512,
                samples: 1,
                steps: 30
            })
        });
        
        const data = await response.json();
        if (data.artifacts && data.artifacts[0]) {
            return `data:image/png;base64,${data.artifacts[0].base64}`;
        }
    } catch (error) {
        console.error('Image generation failed:', error);
    }
    return null;
}

// Enhanced Content Generation with OpenAI (Premium Feature)
async function generateEnhancedContent(word, type) {
    if (!apiKeys.openai) {
        return null;
    }
    
    let prompt = '';
    switch(type) {
        case 'scenario':
            prompt = `Create a vivid, practical scenario where someone would use the word "${word}" naturally. Make it relatable and memorable for language learners.`;
            break;
        case 'examples':
            prompt = `Generate 3 diverse example sentences using the word "${word}" in different contexts (academic, casual, professional).`;
            break;
        case 'memory_tips':
            prompt = `Create memorable mnemonics and memory tricks to help remember the word "${word}" and its meaning.`;
            break;
    }
    
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKeys.openai}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 200,
                temperature: 0.7
            })
        });
        
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Content generation failed:', error);
    }
    return null;
}

// Load Current Word (Updated for Free Version)
function loadCurrentWord() {
    const word = vocabulary[currentWord];
    document.getElementById('wordTitle').textContent = word.word;
    document.getElementById('pronunciation').textContent = word.pronunciation;
    document.getElementById('definition').textContent = word.definition;
    
    // Update image content - FREE version with emoji visuals
    const imageContainer = document.getElementById('imageContent');
    
    if (apiKeys.stability) {
        // Premium: Try to generate real AI image
        imageContainer.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <span>Generating AI image...</span>
            </div>
        `;
        
        generateImage(word.imagePrompt).then(imageUrl => {
            if (imageUrl) {
                imageContainer.innerHTML = `<img src="${imageUrl}" alt="Visual representation of ${word.word}">`;
            } else {
                // Fallback to free visual
                const freeVisual = getFreeVisualRepresentation(word.word);
                imageContainer.innerHTML = `<div style="font-size: 1.2em; text-align: center; padding: 20px; color: #667eea;">${freeVisual}</div>`;
            }
        });
    } else {
        // Free: Use emoji-based visual representation
        const freeVisual = getFreeVisualRepresentation(word.word);
        imageContainer.innerHTML = `<div style="font-size: 1.2em; text-align: center; padding: 20px; color: #667eea; line-height: 1.6;">${freeVisual}</div>`;
    }
    
    // Update text content
    document.getElementById('exampleText').textContent = `"${word.example}"`;
    document.getElementById('synonymsText').textContent = word.synonyms;
    document.getElementById('etymologyText').textContent = word.etymology;
    
    // Update sound content
    document.getElementById('phoneticBreakdown').textContent = word.pronunciation.replace(/[\/]/g, '');
    
    // Update scenario content
    document.getElementById('scenarioText').textContent = word.scenario;
}

// Show Content for Selected Mode
function showContentForMode() {
    // Hide all content
    document.getElementById('imageContent').style.display = 'none';
    document.getElementById('textContent').style.display = 'none';
    document.getElementById('soundContent').style.display = 'none';
    document.getElementById('scenarioContent').style.display = 'none';
    
    // Show content for selected mode
    switch(selectedMode) {
        case 'image':
            document.getElementById('imageContent').style.display = 'block';
            break;
        case 'text':
            document.getElementById('textContent').style.display = 'block';
            break;
        case 'sound':
            document.getElementById('soundContent').style.display = 'block';
            break;
        case 'scenario':
            document.getElementById('scenarioContent').style.display = 'block';
            break;
    }
}

// Test Word Function
function testWord() {
    // Mark word as completed
    completedWords.add(currentWord);
    correctAnswers++;
    totalAttempts++;
    streak++;
    wordsLearned++;
    
    updateStats();
    
    // Check if all words completed
    if (completedWords.size >= vocabulary.length) {
        showCompletion();
    } else {
        nextWord();
    }
}

// Next Word Function
function nextWord() {
    // Find next unlearned word
    let nextIndex = (currentWord + 1) % vocabulary.length;
    let attempts = 0;
    
    // Skip already completed words
    while (completedWords.has(nextIndex) && attempts < vocabulary.length) {
        nextIndex = (nextIndex + 1) % vocabulary.length;
        attempts++;
    }
    
    // If all words completed, show completion
    if (attempts >= vocabulary.length) {
        showCompletion();
        return;
    }
    
    currentWord = nextIndex;
    loadCurrentWord();
    showContentForMode();
    
    // Update progress based on completed words
    const progress = (completedWords.size / vocabulary.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
}

// Show Completion Screen
function showCompletion() {
    document.getElementById('learning').style.display = 'none';
    document.getElementById('completion').style.display = 'block';
    
    // Update final stats
    document.getElementById('finalWordsLearned').textContent = completedWords.size;
    document.getElementById('finalAccuracy').textContent = 
        totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) + '%' : '0%';
    document.getElementById('finalStreak').textContent = streak;
}

// Show Hint Function
function showHint() {
    // Show additional content
    if (selectedMode !== 'text') {
        document.getElementById('textContent').style.display = 'block';
    }
    if (selectedMode !== 'scenario') {
        document.getElementById('scenarioContent').style.display = 'block';
    }
}

// Play Pronunciation (FREE Feature)
function playPronunciation() {
    const word = vocabulary[currentWord].word;
    
    // Use Web Speech API for text-to-speech (FREE!)
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        // Try to use a high-quality voice
        const voices = speechSynthesis.getVoices();
        const englishVoice = voices.find(voice => 
            voice.lang.startsWith('en') && voice.name.includes('Google')
        ) || voices.find(voice => voice.lang.startsWith('en'));
        
        if (englishVoice) {
            utterance.voice = englishVoice;
        }
        
        speechSynthesis.speak(utterance);
    } else {
        alert('🔊 Playing pronunciation: ' + vocabulary[currentWord].pronunciation);
    }
}

// Restart Learning
function restartLearning() {
    // Reset all variables
    currentWord = 0;
    wordsLearned = 0;
    correctAnswers = 0;
    totalAttempts = 0;
    quizCorrectAnswers = 0;
    quizTotalAttempts = 0;
    streak = 0;
    completedWords.clear();
    quizMode = false;
    
    // Reset quiz stats
    quizStats = {
        multipleChoice: { correct: 0, total: 0 },
        wordMatching: { correct: 0, total: 0 },
        synonym: { correct: 0, total: 0 }
    };
    
    // Show setup screen again
    document.getElementById('completion').style.display = 'none';
    document.getElementById('quiz').style.display = 'none';
    document.getElementById('setup').style.display = 'block';
    
    // Reset progress bar
    document.getElementById('progressBar').style.width = '0%';
    
    // Clear selection
    document.querySelectorAll('.mode-card').forEach(card => {
        card.classList.remove('selected');
    });
    selectedMode = '';
}

// Review Missed Words
function reviewMissed() {
    // For now, just restart - in a real app, this would show only difficult words
    alert('Feature coming soon! For now, you can restart to review all words.');
    restartLearning();
}

// Go Back to Setup
function goBack() {
    // Return to setup screen
    document.getElementById('learning').style.display = 'none';
    document.getElementById('quiz').style.display = 'none';
    document.getElementById('setup').style.display = 'block';
    
    // Keep current progress but allow mode reselection
    document.querySelectorAll('.mode-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Re-select current mode if one was selected
    if (selectedMode) {
        const modeCards = document.querySelectorAll('.mode-card');
        modeCards.forEach(card => {
            if (card.onclick.toString().includes(selectedMode)) {
                card.classList.add('selected');
            }
        });
    }
}

// Update Stats
function updateStats() {
    document.getElementById('wordsLearned').textContent = wordsLearned;
    document.getElementById('accuracy').textContent = 
        totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) + '%' : '0%';
    document.getElementById('streak').textContent = streak;
}

// Initialize voices when page loads
window.addEventListener('load', () => {
    if ('speechSynthesis' in window) {
        speechSynthesis.getVoices();
    }
});