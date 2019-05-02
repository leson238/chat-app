const socket = io();

//elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $shareLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

//template
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//options
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const autoScroll = () => {
    //get new message element
    const $newMessage = $messages.lastElementChild;

    //height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
    //visible height
    const visibleHeight = $messages.offsetHeight;
    //message container height
    const containerHeight = $messages.scrollHeight;
    //How far I have scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
};

socket.on("locationMessage", message => {
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.text,
        createdAt: moment(message.createdAt).format("h:mm a")
    });
    $messages.insertAdjacentHTML("beforeend", html);
    autoScroll();
});

socket.on("roomData", ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    document.querySelector("#sidebar").innerHTML = html;
});

socket.on("message", message => {
    const html = Mustache.render(messageTemplate, {
        createdAt: moment(message.createdAt).format("h:mm a"),
        message: message.text,
        username: message.username
    });
    $messages.insertAdjacentHTML("beforeend", html);
    autoScroll();
});

$messageForm.addEventListener("submit", e => {
    e.preventDefault();

    $messageFormButton.setAttribute("disabled", "disabled");

    const message = e.target.elements.message.value;
    socket.emit("sendMessage", message, error => {
        $messageFormButton.removeAttribute("disabled");
        $messageFormInput.value = "";
        $messageFormInput.focus();
        if (error) {
            return console.log(error);
        }
        console.log("Message delivered");
    });
});

$shareLocationButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
        return alert("Geolocation is not supported by your browser");
    }

    $shareLocationButton.setAttribute("disabled", "disabled");

    navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        socket.emit("sendLocation", { latitude, longitude }, () => {
            $shareLocationButton.removeAttribute("disabled");
            console.log("Location shared!");
        });
    });
});

socket.emit("join", { username, room }, error => {
    if (error) {
        alert(error);
        location.href = "/";
    }
});
