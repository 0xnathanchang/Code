// VocabGenius - Enhanced GMAT Vocabulary Learning App with Analytics
// Complete app.js with 150-word support and comprehensive analytics

// Global Variables
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
let reviewMode = false;
let currentQuiz = null;
let quizStats = {
    multipleChoice: { correct: 0, total: 0 },
    wordMatching: { correct: 0, total: 0 },
    synonym: { correct: 0, total: 0 }
};

// SRS (Spaced Repetition System) Data
let srsData = {};
let reviewQueue = [];
let currentReviewIndex = 0;

// SRS Configuration
const SRS_INTERVALS = {
    NEW: 0,           // New word
    LEARNING: 1,      // 1 day
    YOUNG: 3,         // 3 days  
    MATURE: 7,        // 7 days
    MASTERED: 14      // 14 days, then 30, 60, etc.
};

const SRS_MULTIPLIERS = {
    EASY: 2.5,        // Easy - multiply interval
    GOOD: 2.0,        // Good - normal progression
    HARD: 1.2,        // Hard - smaller increase
    AGAIN: 0.0        // Again - reset to learning
};

// Analytics Integration
function initializeAnalytics() {
    // Initialize analytics if not already done
    if (!window.vocabAnalytics) {
        window.vocabAnalytics = new VocabGeniusAnalytics();
    }
    
    // Track app initialization
    if (window.vocabAnalytics) {
        window.vocabAnalytics.integrateWithMainApp();
    }
}

// Show Analytics Dashboard
function showAnalytics() {
    if (!window.vocabAnalytics) {
        alert('Analytics system not loaded. Please refresh the page.');
        return;
    }
    
    // Create analytics modal/popup
    const analyticsModal = document.createElement('div');
    analyticsModal.id = 'analyticsModal';
    analyticsModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;
    
    const analyticsContainer = document.createElement('div');
    analyticsContainer.style.cssText = `
        width: 95%;
        max-width: 1200px;
        height: 90%;
        background: white;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        position: relative;
    `;
    
    // Create iframe for analytics dashboard
    const iframe = document.createElement('iframe');
    iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
        border-radius: 20px;
    `;
    
    // Generate analytics data and create dashboard
    const analyticsData = window.vocabAnalytics.exportAnalyticsData();
    const dashboardHTML = generateAnalyticsDashboard(analyticsData);
    
    iframe.onload = function() {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(dashboardHTML);
        iframeDoc.close();
    };
    
    iframe.src = 'about:blank';
    
    // Close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        width: 40px;
        height: 40px;
        border: none;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        font-size: 24px;
        cursor: pointer;
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
    `;
    
    closeButton.onmouseover = () => {
        closeButton.style.background = 'rgba(255, 59, 48, 0.8)';
        closeButton.style.color = 'white';
    };
    
    closeButton.onmouseout = () => {
        closeButton.style.background = 'rgba(0, 0, 0, 0.1)';
        closeButton.style.color = 'black';
    };
    
    closeButton.onclick = () => {
        document.body.removeChild(analyticsModal);
    };
    
    analyticsContainer.appendChild(iframe);
    analyticsContainer.appendChild(closeButton);
    analyticsModal.appendChild(analyticsContainer);
    document.body.appendChild(analyticsModal);
    
    // Close on background click
    analyticsModal.onclick = (e) => {
        if (e.target === analyticsModal) {
            document.body.removeChild(analyticsModal);
        }
    };
}

// Generate Analytics Dashboard HTML
function generateAnalyticsDashboard(data) {
    const insights = window.vocabAnalytics.generateInsights();
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>VocabGenius Analytics</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@300;400;500;600;700;800;900&family=SF+Pro+Text:wght@300;400;500;600;700&display=swap');
            
            :root {
                --primary: #007AFF;
                --success: #30D158;
                --warning: #FF9F0A;
                --error: #FF3B30;
                --background: #FBFBFD;
                --surface: #FFFFFF;
                --text-primary: #1D1D1F;
                --text-secondary: #86868B;
                --separator: #D2D2D7;
                --shadow-2: 0 4px 6px rgba(0,0,0,0.07);
                --radius-lg: 16px;
                --radius-2xl: 24px;
            }
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body {
                font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif;
                background: var(--background);
                color: var(--text-primary);
                line-height: 1.47059;
                padding: 20px;
            }
            
            .analytics-container { max-width: 1200px; margin: 0 auto; }
            .analytics-header { margin-bottom: 32px; text-align: center; }
            .analytics-header h1 { font-size: 36px; font-weight: 700; margin-bottom: 8px; }
            .analytics-subtitle { font-size: 18px; color: var(--text-secondary); }
            
            .metrics-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 32px;
            }
            
            .metric-card {
                background: linear-gradient(135deg, var(--primary), #0056CC);
                color: white;
                border-radius: var(--radius-lg);
                padding: 24px;
                position: relative;
                overflow: hidden;
            }
            
            .metric-card.success { background: linear-gradient(135deg, var(--success), #28CD4F); }
            .metric-card.warning { background: linear-gradient(135deg, var(--warning), #FF8C00); }
            .metric-card.purple { background: linear-gradient(135deg, #AF52DE, #9A41C7); }
            
            .metric-value { font-size: 32px; font-weight: 800; margin-bottom: 4px; }
            .metric-label { font-size: 15px; opacity: 0.9; font-weight: 500; }
            .metric-change { font-size: 13px; opacity: 0.8; margin-top: 8px; }
            
            .analytics-grid { display: grid; gap: 24px; margin-bottom: 24px; }
            .analytics-card {
                background: var(--surface);
                border: 1px solid var(--separator);
                border-radius: var(--radius-2xl);
                padding: 24px;
                box-shadow: var(--shadow-2);
            }
            
            .card-title { font-size: 20px; font-weight: 600; margin-bottom: 16px; }
            
            .difficulty-bars { display: flex; flex-direction: column; gap: 16px; }
            .difficulty-bar { display: flex; align-items: center; gap: 12px; }
            .difficulty-label { min-width: 100px; font-weight: 500; font-size: 15px; }
            .difficulty-label.beginner { color: var(--success); }
            .difficulty-label.intermediate { color: var(--warning); }
            .difficulty-label.advanced { color: var(--error); }
            
            .bar-container { flex: 1; height: 8px; background: #E5E5EA; border-radius: 4px; overflow: hidden; }
            .bar-fill { height: 100%; border-radius: 4px; transition: width 0.8s ease; }
            .bar-fill.beginner { background: var(--success); }
            .bar-fill.intermediate { background: var(--warning); }
            .bar-fill.advanced { background: var(--error); }
            
            .difficulty-stats { min-width: 80px; text-align: right; font-size: 13px; color: var(--text-secondary); }
            
            .category-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
            .category-item {
                background: #F2F2F7;
                border-radius: var(--radius-lg);
                padding: 20px;
                text-align: center;
                transition: all 0.3s ease;
            }
            .category-item:hover { background: var(--surface); box-shadow: var(--shadow-2); }
            .category-icon { font-size: 32px; margin-bottom: 12px; }
            .category-name { font-weight: 600; font-size: 16px; margin-bottom: 8px; }
            .category-score { font-size: 24px; font-weight: 700; color: var(--primary); margin-bottom: 4px; }
            .category-total { font-size: 13px; color: var(--text-secondary); }
            
            .insights-list { display: flex; flex-direction: column; gap: 16px; }
            .insight-item {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 16px;
                background: #F2F2F7;
                border-radius: var(--radius-lg);
            }
            .insight-icon {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                flex-shrink: 0;
            }
            .insight-icon.tip { background: rgba(0, 122, 255, 0.1); color: var(--primary); }
            .insight-icon.warning { background: rgba(255, 159, 10, 0.1); color: var(--warning); }
            .insight-icon.success { background: rgba(48, 209, 88, 0.1); color: var(--success); }
            .insight-content { flex: 1; }
            .insight-title { font-weight: 600; font-size: 15px; margin-bottom: 4px; }
            .insight-description { font-size: 13px; color: var(--text-secondary); line-height: 1.4; }
            
            @media (max-width: 768px) {
                .metrics-grid { grid-template-columns: 1fr; }
                .category-grid { grid-template-columns: repeat(2, 1fr); }
            }
        </style>
    </head>
    <body>
        <div class="analytics-container">
            <div class="analytics-header">
                <h1>📊 Your Learning Analytics</h1>
                <p class="analytics-subtitle">Detailed insights into your GMAT vocabulary progress</p>
            </div>
            
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-value">${data.overview.totalWordsStudied}</div>
                    <div class="metric-label">Words Studied</div>
                    <div class="metric-change">of ${data.totalWords} total</div>
                </div>
                
                <div class="metric-card success">
                    <div class="metric-value">${Math.round(data.overview.overallAccuracy)}%</div>
                    <div class="metric-label">Overall Accuracy</div>
                    <div class="metric-change">${data.overview.totalAttempts} total attempts</div>
                </div>
                
                <div class="metric-card warning">
                    <div class="metric-value">${data.streak.currentStreak}</div>
                    <div class="metric-label">Current Streak</div>
                    <div class="metric-change">Best: ${data.streak.bestStreak} days</div>
                </div>
                
                <div class="metric-card purple">
                    <div class="metric-value">${data.overview.totalStudyTime.toFixed(1)}h</div>
                    <div class="metric-label">Study Time</div>
                    <div class="metric-change">${Math.round(data.overview.averageSessionTime)} min avg</div>
                </div>
            </div>
            
            <div class="analytics-grid">
                <div class="analytics-card">
                    <div class="card-title">Learning Progress by Difficulty</div>
                    <div class="difficulty-bars">
                        <div class="difficulty-bar">
                            <div class="difficulty-label beginner">Beginner</div>
                            <div class="bar-container">
                                <div class="bar-fill beginner" style="width: ${(data.difficulty.beginner.learned / data.difficulty.beginner.total * 100)}%"></div>
                            </div>
                            <div class="difficulty-stats">${data.difficulty.beginner.learned}/${data.difficulty.beginner.total}</div>
                        </div>
                        <div class="difficulty-bar">
                            <div class="difficulty-label intermediate">Intermediate</div>
                            <div class="bar-container">
                                <div class="bar-fill intermediate" style="width: ${(data.difficulty.intermediate.learned / data.difficulty.intermediate.total * 100)}%"></div>
                            </div>
                            <div class="difficulty-stats">${data.difficulty.intermediate.learned}/${data.difficulty.intermediate.total}</div>
                        </div>
                        <div class="difficulty-bar">
                            <div class="difficulty-label advanced">Advanced</div>
                            <div class="bar-container">
                                <div class="bar-fill advanced" style="width: ${(data.difficulty.advanced.learned / data.difficulty.advanced.total * 100)}%"></div>
                            </div>
                            <div class="difficulty-stats">${data.difficulty.advanced.learned}/${data.difficulty.advanced.total}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="analytics-grid">
                <div class="analytics-card">
                    <div class="card-title">Category Performance</div>
                    <div class="category-grid">
                        <div class="category-item">
                            <div class="category-icon">💼</div>
                            <div class="category-name">Business</div>
                            <div class="category-score">${Math.round(data.categories.business.learned / data.categories.business.total * 100)}%</div>
                            <div class="category-total">${data.categories.business.learned}/${data.categories.business.total} words</div>
                        </div>
                        <div class="category-item">
                            <div class="category-icon">🎓</div>
                            <div class="category-name">Academic</div>
                            <div class="category-score">${Math.round(data.categories.academic.learned / data.categories.academic.total * 100)}%</div>
                            <div class="category-total">${data.categories.academic.learned}/${data.categories.academic.total} words</div>
                        </div>
                        <div class="category-item">
                            <div class="category-icon">🌐</div>
                            <div class="category-name">General</div>
                            <div class="category-score">${Math.round(data.categories.general.learned / data.categories.general.total * 100)}%</div>
                            <div class="category-total">${data.categories.general.learned}/${data.categories.general.total} words</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="analytics-grid">
                <div class="analytics-card">
                    <div class="card-title">💡 Learning Insights</div>
                    <div class="insights-list">
                        ${insights.map(insight => `
                            <div class="insight-item">
                                <div class="insight-icon ${insight.type}">
                                    ${insight.icon}
                                </div>
                                <div class="insight-content">
                                    <div class="insight-title">${insight.title}</div>
                                    <div class="insight-description">${insight.description}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
}

// Advanced Analytics Features
function getStudyRecommendations() {
    if (!window.vocabAnalytics) return [];
    
    const analytics = window.vocabAnalytics;
    const difficultyStats = analytics.calculateDifficultyBreakdown();
    const categoryStats = analytics.calculateCategoryBreakdown();
    const overallStats = analytics.calculateOverallStats();
    const recommendations = [];
    
    // Difficulty-based recommendations
    const beginnerProgress = difficultyStats.beginner.learned / difficultyStats.beginner.total;
    const intermediateProgress = difficultyStats.intermediate.learned / difficultyStats.intermediate.total;
    const advancedProgress = difficultyStats.advanced.learned / difficultyStats.advanced.total;
    
    if (beginnerProgress < 0.8 && intermediateProgress > 0.3) {
        recommendations.push({
            type: 'focus',
            title: 'Strengthen Your Foundation',
            description: 'Focus on beginner words to build a solid base before advancing.',
            action: 'Study Beginner Words',
            priority: 'high'
        });
    }
    
    if (advancedProgress < 0.1 && beginnerProgress > 0.6) {
        recommendations.push({
            type: 'challenge',
            title: 'Ready for Advanced Words',
            description: 'You\'ve mastered the basics. Try some advanced vocabulary!',
            action: 'Challenge Yourself',
            priority: 'medium'
        });
    }
    
    // Category-based recommendations
    const weakestCategory = Object.entries(categoryStats)
        .map(([cat, stats]) => ({ category: cat, progress: stats.learned / stats.total }))
        .sort((a, b) => a.progress - b.progress)[0];
    
    if (weakestCategory && weakestCategory.progress < 0.4) {
        recommendations.push({
            type: 'category',
            title: `Improve ${weakestCategory.category} Vocabulary`,
            description: `Your ${weakestCategory.category} category needs attention.`,
            action: `Study ${weakestCategory.category} Words`,
            priority: 'medium'
        });
    }
    
    // Streak-based recommendations
    const streakData = analytics.calculateStreakData();
    if (streakData.currentStreak === 0 && overallStats.totalSessions > 0) {
        recommendations.push({
            type: 'habit',
            title: 'Restart Your Learning Streak',
            description: 'Consistent daily practice improves retention significantly.',
            action: 'Study Today',
            priority: 'high'
        });
    }
    
    // Accuracy-based recommendations
    if (overallStats.overallAccuracy < 70 && overallStats.totalAttempts > 20) {
        recommendations.push({
            type: 'review',
            title: 'Review Challenging Words',
            description: 'Focus on words you\'ve struggled with to improve accuracy.',
            action: 'Review Mode',
            priority: 'high'
        });
    }
    
    return recommendations;
}

function showStudyRecommendations() {
    const recommendations = getStudyRecommendations();
    
    if (recommendations.length === 0) {
        alert('🎉 Great job! No specific recommendations right now. Keep up the excellent work!');
        return;
    }
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        border-radius: 20px;
        padding: 32px;
        max-width: 500px;
        width: 90%;
        max-height: 80%;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    `;
    
    content.innerHTML = `
        <h2 style="margin-bottom: 24px; color: #1D1D1F; font-size: 24px;">📚 Study Recommendations</h2>
        <div style="display: flex; flex-direction: column; gap: 16px;">
            ${recommendations.map(rec => `
                <div style="padding: 16px; background: #F2F2F7; border-radius: 12px; border-left: 4px solid ${rec.priority === 'high' ? '#FF3B30' : '#007AFF'};">
                    <h3 style="margin-bottom: 8px; font-size: 16px; color: #1D1D1F;">${rec.title}</h3>
                    <p style="margin-bottom: 12px; font-size: 14px; color: #86868B; line-height: 1.4;">${rec.description}</p>
                    <button onclick="closeRecommendations(); implementRecommendation('${rec.type}');" style="
                        background: #007AFF;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 8px;
                        font-size: 14px;
                        cursor: pointer;
                        font-weight: 500;
                    ">${rec.action}</button>
                </div>
            `).join('')}
        </div>
        <button onclick="closeRecommendations()" style="
            width: 100%;
            margin-top: 24px;
            background: #E5E5EA;
            color: #1D1D1F;
            border: none;
            padding: 12px;
            border-radius: 12px;
            font-size: 16px;
            cursor: pointer;
            font-weight: 500;
        ">Close</button>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    window.closeRecommendations = () => {
        document.body.removeChild(modal);
        delete window.closeRecommendations;
        delete window.implementRecommendation;
    };
    
    window.implementRecommendation = (type) => {
        switch(type) {
            case 'focus':
                alert('💡 Tip: Focus on the beginner-level words in your learning session!');
                break;
            case 'challenge':
                alert('🚀 Great idea! Try tackling some advanced vocabulary words!');
                break;
            case 'category':
                alert('📊 Good strategy! Pay attention to category-specific words during your study!');
                break;
            case 'habit':
                alert('🔥 Excellent! Starting a daily study habit will boost your progress!');
                break;
            case 'review':
                startReview();
                break;
        }
    };
}

// Export Analytics Data
function exportAnalyticsData() {
    if (!window.vocabAnalytics) {
        alert('Analytics system not available.');
        return;
    }
    
    const data = window.vocabAnalytics.exportAnalyticsData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `vocabgenius-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('📊 Analytics data exported successfully!');
}

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

// Review Mode Functions
let reviewedWords = []; // Track reviewed words for previous functionality

function startReview() {
    if (reviewQueue.length === 0) {
        alert('No words to review right now! Come back later or learn some new words first.');
        return;
    }
    
    reviewMode = true;
    currentReviewIndex = 0;
    reviewedWords = []; // Reset reviewed words
    
    document.getElementById('setup').style.display = 'none';
    document.getElementById('review').style.display = 'block';
    
    loadReviewWord();
    showReviewContent();
    updateReviewNavigation();
}

function loadReviewWord() {
    if (currentReviewIndex >= reviewQueue.length) {
        completeReviewSession();
        return;
    }
    
    const wordIndex = reviewQueue[currentReviewIndex];
    const word = vocabulary[wordIndex];
    
    document.getElementById('reviewWordTitle').textContent = word.word;
    document.getElementById('reviewPronunciation').textContent = word.pronunciation;
    document.getElementById('reviewDefinition').textContent = word.definition;
    
    // Update review content
    const freeVisual = getFreeVisualRepresentation(word.word);
    document.getElementById('reviewImageContent').innerHTML = `<div style="font-size: 1.2em; text-align: center; padding: 20px; color: #007AFF; line-height: 1.6;">${freeVisual}</div>`;
    
    document.getElementById('reviewExampleText').textContent = `"${word.example}"`;
    document.getElementById('reviewSynonymsText').textContent = word.synonyms;
    document.getElementById('reviewEtymologyText').textContent = word.etymology;
    document.getElementById('reviewPhoneticBreakdown').textContent = word.pronunciation.replace(/[\/]/g, '');
    document.getElementById('reviewScenarioText').textContent = word.scenario;
    
    // Update progress
    document.getElementById('reviewProgress').textContent = `${currentReviewIndex + 1} / ${reviewQueue.length}`;
    const progress = ((currentReviewIndex + 1) / reviewQueue.length) * 100;
    document.getElementById('reviewProgressBar').style.width = progress + '%';
    
    updateReviewNavigation();
}

function updateReviewNavigation() {
    const prevBtn = document.getElementById('prevReviewBtn');
    if (prevBtn) {
        prevBtn.disabled = currentReviewIndex === 0;
        prevBtn.style.opacity = currentReviewIndex === 0 ? '0.5' : '1';
    }
}

function previousReviewWord() {
    if (currentReviewIndex > 0) {
        currentReviewIndex--;
        
        // Remove the last reviewed word rating if going back
        if (reviewedWords.length > 0) {
            const lastReviewed = reviewedWords.pop();
            // Optionally revert the SRS update (complex, for now just navigate back)
        }
        
        loadReviewWord();
        showReviewContent();
    }
}

function showReviewContent() {
    // Hide all content first
    document.getElementById('reviewImageContent').style.display = 'none';
    document.getElementById('reviewTextContent').style.display = 'none';
    document.getElementById('reviewSoundContent').style.display = 'none';
    document.getElementById('reviewScenarioContent').style.display = 'none';
    
    // Show content based on selected mode
    switch(selectedMode) {
        case 'image':
            document.getElementById('reviewImageContent').style.display = 'block';
            break;
        case 'text':
            document.getElementById('reviewTextContent').style.display = 'block';
            break;
        case 'sound':
            document.getElementById('reviewSoundContent').style.display = 'block';
            break;
        case 'scenario':
            document.getElementById('reviewScenarioContent').style.display = 'block';
            break;
    }
}

function rateDifficulty(difficulty) {
    const wordIndex = reviewQueue[currentReviewIndex];
    
    // Store the review for potential undo
    reviewedWords.push({
        wordIndex: wordIndex,
        difficulty: difficulty,
        reviewIndex: currentReviewIndex
    });
    
    updateWordDifficulty(wordIndex, difficulty);
    
    // Move to next word
    currentReviewIndex++;
    loadReviewWord();
    showReviewContent();
}

function completeReviewSession() {
    const reviewedCount = reviewQueue.length;
    document.getElementById('review').style.display = 'none';
    document.getElementById('setup').style.display = 'block';
    
    // Update review button
    updateReviewQueue();
    
    alert(`🎉 Review session complete! You reviewed ${reviewedCount} words. Great job!`);
}

function exitReview() {
    reviewMode = false;
    document.getElementById('review').style.display = 'none';
    document.getElementById('setup').style.display = 'block';
}

function playReviewPronunciation() {
    const wordIndex = reviewQueue[currentReviewIndex];
    const word = vocabulary[wordIndex].word;
    
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        const voices = speechSynthesis.getVoices();
        const englishVoice = voices.find(voice => 
            voice.lang.startsWith('en') && voice.name.includes('Google')
        ) || voices.find(voice => voice.lang.startsWith('en'));
        
        if (englishVoice) {
            utterance.voice = englishVoice;
        }
        
        speechSynthesis.speak(utterance);
    } else {
        alert('🔊 Playing pronunciation: ' + vocabulary[wordIndex].pronunciation);
    }
}

// SRS (Spaced Repetition System) Functions
function initializeSRS() {
    // Initialize SRS data for all vocabulary words
    vocabulary.forEach((word, index) => {
        if (!srsData[index]) {
            srsData[index] = {
                wordIndex: index,
                interval: SRS_INTERVALS.NEW,
                repetitions: 0,
                easeFactor: 2.5,
                nextReview: new Date(),
                lastReview: null,
                difficulty: 'new',
                totalReviews: 0,
                correctReviews: 0
            };
        }
    });
    
    updateReviewQueue();
    loadSRSData();
}

function updateWordDifficulty(wordIndex, performance) {
    const card = srsData[wordIndex];
    const now = new Date();
    
    card.lastReview = now;
    card.totalReviews++;
    
    if (performance === 'easy' || performance === 'good') {
        card.correctReviews++;
    }
    
    // Calculate new interval based on performance
    let newInterval = card.interval;
    
    switch(performance) {
        case 'again':
            card.repetitions = 0;
            card.easeFactor = Math.max(1.3, card.easeFactor - 0.2);
            newInterval = SRS_INTERVALS.LEARNING;
            card.difficulty = 'learning';
            break;
            
        case 'hard':
            card.repetitions++;
            card.easeFactor = Math.max(1.3, card.easeFactor - 0.15);
            newInterval = Math.max(1, Math.ceil(card.interval * SRS_MULTIPLIERS.HARD));
            card.difficulty = 'hard';
            break;
            
        case 'good':
            card.repetitions++;
            if (card.repetitions === 1) {
                newInterval = SRS_INTERVALS.LEARNING;
            } else if (card.repetitions === 2) {
                newInterval = SRS_INTERVALS.YOUNG;
            } else {
                newInterval = Math.ceil(card.interval * card.easeFactor);
            }
            card.difficulty = 'good';
            break;
            
        case 'easy':
            card.repetitions++;
            card.easeFactor = Math.min(3.0, card.easeFactor + 0.15);
            if (card.repetitions === 1) {
                newInterval = SRS_INTERVALS.YOUNG;
            } else {
                newInterval = Math.ceil(card.interval * card.easeFactor * SRS_MULTIPLIERS.EASY);
            }
            card.difficulty = 'easy';
            break;
    }
    
    card.interval = newInterval;
    card.nextReview = new Date(now.getTime() + (newInterval * 24 * 60 * 60 * 1000));
    
    saveSRSData();
    updateReviewQueue();
}

function updateReviewQueue() {
    const now = new Date();
    reviewQueue = [];
    
    Object.values(srsData).forEach(card => {
        if (card.nextReview <= now) {
            reviewQueue.push(card.wordIndex);
        }
    });
    
    // Sort by priority (overdue first, then by difficulty)
    reviewQueue.sort((a, b) => {
        const cardA = srsData[a];
        const cardB = srsData[b];
        
        // Overdue cards first
        const overdueA = Math.floor((now - cardA.nextReview) / (24 * 60 * 60 * 1000));
        const overdueB = Math.floor((now - cardB.nextReview) / (24 * 60 * 60 * 1000));
        
        if (overdueA !== overdueB) {
            return overdueB - overdueA; // More overdue first
        }
        
        // Then by difficulty (harder first)
        const difficultyOrder = { 'again': 0, 'hard': 1, 'learning': 2, 'good': 3, 'easy': 4, 'new': 5 };
        return difficultyOrder[cardA.difficulty] - difficultyOrder[cardB.difficulty];
    });
    
    updateReviewStats();
}

function updateReviewStats() {
    const reviewCount = reviewQueue.length;
    const newCount = Object.values(srsData).filter(card => card.difficulty === 'new').length;
    const learningCount = Object.values(srsData).filter(card => card.difficulty === 'learning').length;
    
    // Update UI elements if they exist
    const reviewCountElement = document.getElementById('reviewCount');
    const newCountElement = document.getElementById('newCount');
    const learningCountElement = document.getElementById('learningCount');
    
    if (reviewCountElement) reviewCountElement.textContent = reviewCount;
    if (newCountElement) newCountElement.textContent = newCount;
    if (learningCountElement) learningCountElement.textContent = learningCount;
}

function saveSRSData() {
    localStorage.setItem('vocabgenius_srs', JSON.stringify(srsData));
}

function loadSRSData() {
    const saved = localStorage.getItem('vocabgenius_srs');
    if (saved) {
        srsData = JSON.parse(saved);
        // Convert date strings back to Date objects
        Object.values(srsData).forEach(card => {
            card.nextReview = new Date(card.nextReview);
            if (card.lastReview) {
                card.lastReview = new Date(card.lastReview);
            }
        });
    }
}

// API Settings Modal Functions
function showApiSettings() {
    document.getElementById('apiModal').style.display = 'flex';
}

function hideApiSettings() {
    document.getElementById('apiModal').style.display = 'none';
}

function saveApiSettings() {
    // Store API keys
    apiKeys.openai = document.getElementById('openaiKey').value;
    apiKeys.stability = document.getElementById('stabilityKey').value;
    
    hideApiSettings();
    
    // Show confirmation if keys were added
    if (apiKeys.openai || apiKeys.stability) {
        alert('AI settings saved! You now have access to premium features.');
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('apiModal');
    if (event.target === modal) {
        hideApiSettings();
    }
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
    
    // API keys are already stored from modal or can be empty
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

// Quiz Answer Functions - Updated with Analytics
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
    
    // Analytics tracking
    if (window.vocabAnalytics) {
        window.vocabAnalytics.trackQuizCompleted(currentQuiz.type, isCorrect);
        
        // Also track the target word if available
        if (currentQuiz.targetWord || currentQuiz.targetWordObj) {
            const targetWord = currentQuiz.targetWord || currentQuiz.targetWordObj;
            const wordIndex = vocabulary.findIndex(w => w.word === (targetWord.word || targetWord));
            if (wordIndex !== -1) {
                const word = vocabulary[wordIndex];
                window.vocabAnalytics.trackWordStudied(
                    wordIndex, 
                    word.difficulty || 'intermediate', 
                    word.category || 'general', 
                    isCorrect
                );
            }
        }
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

// Update Quiz Stats (separate from learning stats)
function updateQuizStats() {
    const quizAccuracy = quizTotalAttempts > 0 ? Math.round((quizCorrectAnswers / quizTotalAttempts) * 100) : 0;
    
    // Update quiz display stats
    document.getElementById('quizAccuracy').textContent = quizAccuracy + '%';
    document.getElementById('quizStreak').textContent = streak;
}

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

// Enhanced Load Current Word with Analytics
function loadCurrentWord() {
    const word = vocabulary[currentWord];
    document.getElementById('wordTitle').textContent = word.word;
    document.getElementById('pronunciation').textContent = word.pronunciation;
    document.getElementById('definition').textContent = word.definition;
    
    // Analytics tracking - word viewed
    if (window.vocabAnalytics) {
        window.vocabAnalytics.trackWordStudied(
            currentWord, 
            word.difficulty || 'intermediate', 
            word.category || 'general'
        );
    }
    
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

// Test Word Function - Updated with Analytics
function testWord() {
    // Mark word as completed
    completedWords.add(currentWord);
    correctAnswers++;
    totalAttempts++;
    streak++;
    wordsLearned++;
    
    // Analytics tracking
    const word = vocabulary[currentWord];
    if (window.vocabAnalytics) {
        window.vocabAnalytics.trackWordStudied(
            currentWord, 
            word.difficulty || 'intermediate', 
            word.category || 'general', 
            true
        );
    }
    
    // Update SRS data - assume "good" performance for "I Know This"
    updateWordDifficulty(currentWord, 'good');
    
    updateStats();
    
    // Check if all words completed
    if (completedWords.size >= vocabulary.length) {
        showCompletion();
    } else {
        nextWord();
    }
}

// Smart Word Selection based on Analytics
function selectNextWord() {
    if (!window.vocabAnalytics) {
        return getRandomUnlearnedWord();
    }
    
    const analytics = window.vocabAnalytics;
    const difficultyStats = analytics.calculateDifficultyBreakdown();
    const overallStats = analytics.calculateOverallStats();
    
    // Determine optimal difficulty based on progress
    let targetDifficulty = 'beginner';
    
    const beginnerProgress = difficultyStats.beginner.learned / difficultyStats.beginner.total;
    const intermediateProgress = difficultyStats.intermediate.learned / difficultyStats.intermediate.total;
    
    if (beginnerProgress >= 0.7 && overallStats.overallAccuracy >= 75) {
        targetDifficulty = 'intermediate';
    }
    
    if (beginnerProgress >= 0.8 && intermediateProgress >= 0.5 && overallStats.overallAccuracy >= 80) {
        targetDifficulty = 'advanced';
    }
    
    // Find unlearned words of target difficulty
    const unlearnedWords = vocabulary
        .map((word, index) => ({ ...word, index }))
        .filter(word => !completedWords.has(word.index) && word.difficulty === targetDifficulty);
    
    if (unlearnedWords.length > 0) {
        return unlearnedWords[Math.floor(Math.random() * unlearnedWords.length)].index;
    }
    
    // Fallback to any unlearned word
    return getRandomUnlearnedWord();
}

function getRandomUnlearnedWord() {
    const unlearned = [];
    for (let i = 0; i < vocabulary.length; i++) {
        if (!completedWords.has(i)) {
            unlearned.push(i);
        }
    }
    return unlearned.length > 0 ? unlearned[Math.floor(Math.random() * unlearned.length)] : 0;
}

// Enhanced Next Word Function
function nextWord() {
    const nextIndex = selectNextWord();
    
    if (nextIndex === null || completedWords.size >= vocabulary.length) {
        showCompletion();
        return;
    }
    
    currentWord = nextIndex;
    loadCurrentWord();
    showContentForMode();
    
    // Update progress based on completed words
    const progress = (completedWords.size / vocabulary.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    
    // Update difficulty progress
    updateDifficultyProgress();
}

// Show Completion Screen - Enhanced with Analytics Summary
function showCompletion() {
    document.getElementById('learning').style.display = 'none';
    document.getElementById('completion').style.display = 'block';
    
    // Update final stats
    document.getElementById('finalWordsLearned').textContent = completedWords.size;
    document.getElementById('finalAccuracy').textContent = 
        totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) + '%' : '0%';
    document.getElementById('finalStreak').textContent = streak;
    
    // Analytics summary
    if (window.vocabAnalytics) {
        const analytics = window.vocabAnalytics.exportAnalyticsData();
        const difficultyStats = analytics.difficulty;
        
        // Show difficulty breakdown in completion
        const completionStats = document.querySelector('#completion .stats');
        if (completionStats) {
            const difficultyBreakdown = document.createElement('div');
            difficultyBreakdown.style.cssText = `
                margin-top: 20px;
                padding: 16px;
                background: #F2F2F7;
                border-radius: 12px;
                text-align: left;
            `;
            difficultyBreakdown.innerHTML = `
                <h4 style="margin-bottom: 12px; text-align: center;">📊 Breakdown by Difficulty</h4>
                <div style="display: flex; justify-content: space-around; text-align: center;">
                    <div>
                        <div style="color: #30D158; font-weight: 600;">Beginner</div>
                        <div style="font-size: 18px; font-weight: 700;">${difficultyStats.beginner.learned}/${difficultyStats.beginner.total}</div>
                    </div>
                    <div>
                        <div style="color: #FF9F0A; font-weight: 600;">Intermediate</div>
                        <div style="font-size: 18px; font-weight: 700;">${difficultyStats.intermediate.learned}/${difficultyStats.intermediate.total}</div>
                    </div>
                    <div>
                        <div style="color: #FF3B30; font-weight: 600;">Advanced</div>
                        <div style="font-size: 18px; font-weight: 700;">${difficultyStats.advanced.learned}/${difficultyStats.advanced.total}</div>
                    </div>
                </div>
            `;
            completionStats.parentNode.insertBefore(difficultyBreakdown, completionStats.nextSibling);
        }
        
        // Track completion
        window.vocabAnalytics.trackSessionEnd();
    }
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

// Update Stats - Enhanced with Difficulty Progress
function updateStats() {
    document.getElementById('wordsLearned').textContent = wordsLearned;
    document.getElementById('accuracy').textContent = 
        totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) + '%' : '0%';
    document.getElementById('streak').textContent = streak;
    
    // Update difficulty progress if analytics is available
    if (window.vocabAnalytics) {
        updateDifficultyProgress();
    }
}

// Update Difficulty Progress Indicators
function updateDifficultyProgress() {
    if (!window.vocabAnalytics) return;
    
    const difficultyStats = window.vocabAnalytics.calculateDifficultyBreakdown();
    
    // Update beginner progress
    const beginnerPercent = (difficultyStats.beginner.learned / difficultyStats.beginner.total) * 100;
    const beginnerBar = document.getElementById('beginnerProgress');
    const beginnerText = document.getElementById('beginnerText');
    if (beginnerBar && beginnerText) {
        beginnerBar.style.width = beginnerPercent + '%';
        beginnerText.textContent = `${difficultyStats.beginner.learned}/${difficultyStats.beginner.total}`;
    }
    
    // Update intermediate progress
    const intermediatePercent = (difficultyStats.intermediate.learned / difficultyStats.intermediate.total) * 100;
    const intermediateBar = document.getElementById('intermediateProgress');
    const intermediateText = document.getElementById('intermediateText');
    if (intermediateBar && intermediateText) {
        intermediateBar.style.width = intermediatePercent + '%';
        intermediateText.textContent = `${difficultyStats.intermediate.learned}/${difficultyStats.intermediate.total}`;
    }
    
    // Update advanced progress
    const advancedPercent = (difficultyStats.advanced.learned / difficultyStats.advanced.total) * 100;
    const advancedBar = document.getElementById('advancedProgress');
    const advancedText = document.getElementById('advancedText');
    if (advancedBar && advancedText) {
        advancedBar.style.width = advancedPercent + '%';
        advancedText.textContent = `${difficultyStats.advanced.learned}/${difficultyStats.advanced.total}`;
    }
}

// Initialize voices, SRS, and Analytics when page loads
window.addEventListener('load', () => {
    if ('speechSynthesis' in window) {
        speechSynthesis.getVoices();
    }
    
    // Initialize SRS system
    initializeSRS();
    
    // Initialize Analytics
    if (window.vocabAnalytics) {
        window.vocabAnalytics.integrateWithMainApp();
        console.log('VocabGenius Analytics initialized successfully!');
    }
});