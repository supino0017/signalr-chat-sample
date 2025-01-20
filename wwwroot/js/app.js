document.addEventListener("DOMContentLoaded", async () => {
    const username = prompt("Enter your username:");
    if (!username) {
        alert("Username is required to join the chat.");
        return;
    }

    const connection = new signalR.HubConnectionBuilder()
        .withUrl("/chatHub?username=" + encodeURIComponent(username))
        .build();

    let selectedUser = null;

    //Start Connection
    try {
        await connection.start();
        console.log("SignalR connected successfully.");
    } catch (err) {
        console.error("Connection failed:", err);
        return;
    }

    // Message Received Event
    connection.on("ReceiveMessage", (sender, message) => {
        const messagesDiv = document.getElementById("messages");
        const messageElem = document.createElement("div");
        messageElem.classList.add("message", sender === selectedUser ? "received" : "sent");
        messageElem.innerHTML = `
            <span>${message}</span>
            <time>${new Date().toLocaleString()}</time>
        `;
        messagesDiv.appendChild(messageElem);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });

    // Generate Member List
    const members = ["Sample User 2", "Sample User 3", "Sample User 4", "Sample User 5"];
    const memberList = document.getElementById("memberList");
    members.forEach((member) => {
        const memberItem = document.createElement("div");
        memberItem.classList.add("member-item");
        memberItem.innerHTML = `
            <div class="avatar"></div>
            <div class="name">${member}</div>
            <div class="status ${member === "Sample User 2" || member === "Sample User 3" ? "online" : ""}"></div>
        `;
        memberItem.addEventListener("click", () => {
            selectedUser = member;
            document.getElementById("selectedUser").textContent = member;
            document.getElementById("messages").innerHTML = ""; // Clear Message History
        });
        memberList.appendChild(memberItem);
    });

    // Send Message
    document.getElementById("sendMessage").addEventListener("click", async () => {
        const messageInput = document.getElementById("messageInput");
        const message = messageInput.value.trim();
        if (selectedUser && message) {
            try {
                await connection.invoke("SendMessage", username, selectedUser, message);
                const messagesDiv = document.getElementById("messages");
                const messageElem = document.createElement("div");
                messageElem.classList.add("message", "sent");
                messageElem.innerHTML = `
                    <span>${message}</span>
                    <time>${new Date().toLocaleString()}</time>
                `;
                messagesDiv.appendChild(messageElem);
                messageInput.value = "";
            } catch (err) {
                console.error("Send error:", err);
            }
        } else {
            alert("Please select a user and type a message.");
        }
    });
});
