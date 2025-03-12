const formatMessage = (user, text) => {
    return { user, text, time: new Date().toISOString() };
};

module.exports = { formatMessage };
