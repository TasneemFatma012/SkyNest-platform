const chatToggle = document.getElementById("chatToggle");
const chatWindow = document.getElementById("chatWindow");
const closeChat = document.getElementById("closeChat");

const sendBtn = document.getElementById("sendBtn");
const chatInput = document.getElementById("chatInput");
const chatBody = document.getElementById("chatBody");

chatToggle.addEventListener("click", () => {
    chatWindow.classList.add("show");
});

closeChat.addEventListener("click", () => {
    chatWindow.classList.remove("show");
});

function addMessage(text, type) {
    const div = document.createElement("div");
    div.className = type === "user" ? "user-msg" : "bot-msg";
    div.innerText = text;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
}

async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    addMessage(message, "user");
    chatInput.value = "";

    addMessage("Typing...", "bot");

    const res = await fetch("/chat/message", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: message })
    });

    const data = await res.json();

    chatBody.lastChild.remove();
    addMessage(data.reply, "bot");
}

sendBtn.addEventListener("click", sendMessage);

chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

document.querySelectorAll(".quick-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        chatInput.value = btn.innerText;
        sendMessage();
    });
});
function showLoader(){

    const loader=document.createElement("div");

    loader.className="ai-loader";

    loader.id="aiLoader";

    loader.innerHTML=`

    <div class="ai-avatar">
        🤖
    </div>

    <div class="ai-box">

        <div class="ai-title">
            Roamoi AI is thinking...
        </div>

        <div class="ai-shimmer"></div>

        <div class="ai-shimmer short"></div>

        <div class="ai-dots">

            <span></span>
            <span></span>
            <span></span>

        </div>

    </div>

    `;

    chatBody.appendChild(loader);

    chatBody.scrollTop=chatBody.scrollHeight;

}

function hideLoader(){

    const loader=document.getElementById("aiLoader");

    if(loader){

        loader.style.opacity="0";

        loader.style.transform="translateY(10px)";

        setTimeout(()=>{

            loader.remove();

        },250);

    }

}