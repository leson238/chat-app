const generateMessage = (username, message) => {
    return {
        username,
        text: message,
        createdAt: new Date().getTime()
    };
};

const generateLocationMessage = (username, url) => {
    return {
        username,
        text: url,
        createdAt: new Date().getTime()
    };
};

module.exports = {
    generateMessage,
    generateLocationMessage
};
