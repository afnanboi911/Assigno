const GEMINI_API_KEY = "AQ.Ab8RN6Iyw9IAby8iP2Dhc3gj8xvUmTBNeBGegKDLWvyBHiqy7w";

let currentUser = { username: "afnan", credits: 2, role: "user" };
let userHistory = [];
let systemLogs = ["[System Boot]: Secured environment loaded."];

// LOGIN
document.getElementById('loginBtn').addEventListener('click', () => {
    const user = document.getElementById('loginUsername').value.trim();
    const pass = document.getElementById('loginPassword').value.trim();

    if (!user) { alert("Enter username"); return; }

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
    logAction(`User '${currentUser.username}' logged in.`);
});

// LOGOUT
document.getElementById('logoutBtn').addEventListener('click', () => {
    document.getElementById('appLayout').style.display = 'none';
    document.getElementById('loginView').style.display = 'flex';
});

// TABS
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
        item.classList.add('active');
        document.getElementById(item.getAttribute('data-target')).style.display = 'block';
        document.getElementById('pageTitle').innerText = item.innerText.replace(/[^a-zA-Z ]/g, "").trim();
    });
});

// GENERATE ASSIGNMENT
document.getElementById('generateBtn').addEventListener('click', async () => {
    const promptText = document.getElementById('promptInput').value.trim();
    const isParaphrased = document.getElementById('paraphraseCheck').checked;

    if (!promptText) { alert("Please enter an assignment prompt!"); return; }

    if (currentUser.credits <= 0 && currentUser.role !== "admin") {
        document.getElementById('paywallModal').style.display = 'flex';
        return;
    }

    const outputArea = document.getElementById('outputArea');
    const resultDiv = document.getElementById('resultText');
    
    outputArea.style.display = 'block';
    resultDiv.innerText = "✍️ Writing response in handwritten exam style...";
    document.getElementById('paperTopicTitle').innerText = promptText.substring(0, 35) + "...";
    document.getElementById('paperDate').innerText = new Date().toLocaleDateString();

    let finalPrompt = promptText;
    if (isParaphrased) {
        finalPrompt = "Provide a clean, formal academic assignment answer structured with headings and bullet points where necessary for: " + promptText;
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ contents: [{ parts: [{ text: finalPrompt }] }] })
        });

        const data = await response.json();
        
        if (data.error) {
            resultDiv.innerText = "API Error: " + data.error.message;
            return;
        }

        const aiResponse = data.candidates[0].content.parts[0].text;
        resultDiv.innerText = aiResponse;

        if (currentUser.role !== "admin") {
            currentUser.credits--;
            document.getElementById('creditCount').innerText = currentUser.credits;
        }

        userHistory.unshift({ title: promptText, date: new Date().toLocaleDateString(), text: aiResponse });
        updateHistoryUI();
        logAction(`User '${currentUser.username}' generated assignment.`);

    } catch (error) {
        resultDiv.innerText = "Network Error: Check API connection.";
        console.error(error);
    }
});

// PAYWALL
document.getElementById('closeModalBtn').addEventListener('click', () => {
    document.getElementById('paywallModal').style.display = 'none';
});
document.getElementById('rechargeBtn').addEventListener('click', () => {
    currentUser.credits = 5;
    document.getElementById('creditCount').innerText = currentUser.credits;
    document.getElementById('paywallModal').style.display = 'none';
    alert('💳 5 credits added successfully!');
});

function updateHistoryUI() {
    const list = document.getElementById('userHistoryList');
    list.innerHTML = userHistory.map(h => `
        <tr><td>${h.title}</td><td>${h.date}</td><td><span class="badge-completed">Completed</span></td></tr>
    `).join('');
}

function logAction(msg) {
    systemLogs.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`);
    const box = document.getElementById('adminLogsBox');
    if (box) box.innerHTML = systemLogs.join('<br>');
}
