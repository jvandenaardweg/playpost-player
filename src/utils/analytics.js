export var trackEvent = function (name, articleId, data) {
    return new Promise(function (resolve, reject) {
        return resolve(console.log('Should track:', name, articleId, data));
    });
};
//# sourceMappingURL=analytics.js.map