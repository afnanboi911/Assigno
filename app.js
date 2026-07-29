const GEMINI_API_KEY = "AQ.Ab8RN6Iyw9IAby8iP2Dhc3gj8xvUmTBNeBGegKDLWvyBHiqy7w";

// State Management
let currentUser = {
    username: "afnan",
    credits: 2,
    role: "user"
};

let userHistory = [
    { title: "History of computers", date: "July 29, 2026", text: "Early computers were massive mechanical devices..." }
];

let systemLogs = ["[System Boot]: Assigno OS initialized successfully."];

// LOGIN HANDLER
document.getElementById('loginBtn').addEventListener('click', () => {
    const user = document.getElementById('loginUsername').value.trim();
    const pass = document.getElementById('loginPassword').value.trim();

    if (!user) {
        alert("Please enter a username.");
        return;
    }

    if (user === "admin" && pass === "assigno_god_2026") {
        currentUser = { username: "admin", credits: 999, role: "admin" };
        document.getElementById('adminNavLink').style.display = 'block';
    } else {
        currentUser = { username: user, credits: 2, role: "user" };
        document.getElementById('adminNavLink').style.display = 'none';
    }

    document.getElementById('loginView').style.display = 'none';
    document.getElementById('appLayout').style.display = 'flex';
    document.getElementById('userNameDisplay').innerText = currentUser.username;
    document.getElementById('userAvatar').innerText = currentUser.username.charAt(0).toUpperCase();
    document.getElementById('creditCount').innerText = currentUser.credits;

    logAction(`User '${currentUser.username}' logged in successfully.`);
});

// LOGOUT HANDLER
document.getElementById('logoutBtn').addEventListener('click', () => {
    document.getElementById('appLayout').style.display = 'none';
    document.getElementById('loginView').style.display = 'flex';
    document.getElementById('loginPassword').value = '';
});

// NAVIGATION TABS
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');

        item.classList.add('active');
        const targetId = item.getAttribute('data-target');
        document.getElementById(targetId).style.display = 'block';

        const titles = { dashboardTab: "Dashboard", generateTab: "Generate Assignment", historyTab: "My Assignments", adminTab: "Admin Control Center", settingsTab: "Settings" };
        document.getElementById('pageTitle').innerText = titles[targetId] || "Dashboard";
    });
});

// GENERATE ASSIGNMENT HANDLER
async function handleGeneration(promptId) {
    const promptText = document.getElementById(promptId).value.trim();
    const isParaphrased = document.getElementById('paraphraseCheck') ? document.getElementById('paraphraseCheck').checked : false;

    if (!promptText) {
        alert('Please enter an assignment prompt first!');
        return;
    }

    // FIREWALL CHECK
    if (currentUser.credits <= 0 && currentUser.role !== "admin") {
        document.getElementById('paywallModal').style.display = 'flex';
        return;
    }

    const outputArea = document.getElementById('outputArea');
    const resultDiv = document.getElementById('resultText');
    
    outputArea.style.display = 'block';
    resultDiv.innerText = "✨ Generating handwritten academic assignment...";

    let finalPrompt = promptText;
    if (isParaphrased) {
        finalPrompt = "Rewrite and paraphrase this heavily to ensure it bypasses AI detectors and plagiarism checkers, keeping academic tone: " + promptText;
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: finalPrompt }] }] })
        });

        const data = await response.json();
        
        if (data.error) {
            resultDiv.innerText = "API Error: " + data.error.message;
            return;
        }

        const aiResponse = data.candidates[0].content.parts[0].text;
        resultDiv.innerText = aiResponse;

        // DEDUCT CREDIT
        if (currentUser.role !== "admin") {
            currentUser.credits--;
            document.getElementById('creditCount').innerText = currentUser.credits;
        }

        // ADD TO HISTORY
        userHistory.unshift({ title: promptText.substring(0, 30) + "...", date: new Date().toLocaleDateString(), text: aiResponse });
        updateHistoryUI();
        logAction(`User '${currentUser.username}' generated assignment: "${promptText.substring(0, 20)}..."`);

    } catch (error) {
        resultDiv.innerText = "Network Error: Could not connect to AI service.";
        console.error(error);
    }
}

document.getElementById('generateBtn').addEventListener('click', () => handleGeneration('promptInput'));

// PAYWALL MODAL ACTIONS
document.getElementById('closeModalBtn').addEventListener('click', () => {
    document.getElementById('paywallModal').style.display = 'none';
});

document.getElementById('rechargeBtn').addEventListener('click', () => {
    currentUser.credits = 5;
    document.getElementById('creditCount').innerText = currentUser.credits;
    document.getElementById('paywallModal').style.display = 'none';
    alert('💳 Success! 5 new credits added to your workspace.');
    logAction(`User '${currentUser.username}' recharged credits.`);
});

// UPDATE HISTORY UI
function updateHistoryUI() {
    const list = document.getElementById('userHistoryList');
    list.innerHTML = userHistory.map(h => `
        <tr>
            <td>${h.title}</td>
            <td>${h.date}</td>
            <td><span class="badge-completed">Completed</span></td>
            <td><button class="action-btn" onclick="alert('${h.text.replace(/'/g, "\\'")}')">View</button></td>
        </tr>
    `).join('');
    document.getElementById('totalGeneratedCount').innerText = userHistory.length;
}

// LOG SYSTEM
function logAction(msg) {
    systemLogs.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`);
    const box = document.getElementById('adminLogsBox');
    if (box) {
        box.innerHTML = systemLogs.join('<br>');
    }
}
