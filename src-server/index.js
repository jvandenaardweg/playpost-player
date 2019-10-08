"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var express_1 = require("express");
var path_1 = require("path");
var ejs_1 = require("ejs");
var node_fetch_1 = require("node-fetch");
var app = express_1["default"]();
ejs_1["default"].delimiter = '$';
app.set('view engine', 'ejs');
app.set('views', path_1["default"].join(__dirname, './'));
app.use(express_1["default"].static(path_1["default"].join(__dirname, '../build')));
app.get('/ping', function (req, res) {
    return res.send('pong');
});
app.get('/articles/:articleId/audiofiles/:audiofileId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, articleId, audiofileId, errorPageRendered, errorPageRendered, response, json, article, audiofile, errorPageRendered, embedPageRendered, err_1, isApiUnavailable, errorMessage, title, description, errorPageRendered;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.params, articleId = _a.articleId, audiofileId = _a.audiofileId;
                if (!!articleId) return [3, 2];
                return [4, ejs_1["default"].renderFile(__dirname + '/pages/error.ejs', {
                        title: 'Oops!',
                        description: 'Please given an article ID.'
                    })];
            case 1:
                errorPageRendered = _b.sent();
                return [2, res.status(400).send(errorPageRendered)];
            case 2:
                if (!!audiofileId) return [3, 4];
                return [4, ejs_1["default"].renderFile(__dirname + '/pages/error.ejs', {
                        title: 'Oops!',
                        description: 'Please given an audiofile ID for the article.'
                    })];
            case 3:
                errorPageRendered = _b.sent();
                return [2, res.status(400).send(errorPageRendered)];
            case 4:
                _b.trys.push([4, 12, , 14]);
                return [4, node_fetch_1["default"]("http://localhost:3000/v1/articles/" + articleId, {
                        method: 'get',
                        headers: {
                            'X-Api-Key': '6892e59af722a2afa7147b348ba71100e56351bf3689cebc155c22db5b8c1d70',
                            'X-Api-Secret': 'f793d030c8062b5e1342ff9fcad0fc8177a966e61c809b02f2f207a473eeaf9a'
                        }
                    })];
            case 5:
                response = _b.sent();
                if (!!response.ok) return [3, 7];
                return [4, response.json()];
            case 6:
                json = _b.sent();
                throw new Error(json.message ? json.message : 'Did not got ok from api');
            case 7: return [4, response.json()];
            case 8:
                article = _b.sent();
                audiofile = article.audiofiles.find(function (audiofile) { return audiofile.id === audiofileId; });
                if (!!audiofile) return [3, 10];
                return [4, ejs_1["default"].renderFile(__dirname + '/pages/error.ejs', {
                        title: 'Oops!',
                        description: 'Could not find the audiofile in the article data.'
                    })];
            case 9:
                errorPageRendered = _b.sent();
                return [2, res.status(404).send(errorPageRendered)];
            case 10: return [4, ejs_1["default"].renderFile(__dirname + '/../build/index.ejs', {
                    title: article.title,
                    article: JSON.stringify(article),
                    audiofile: JSON.stringify(audiofile)
                })];
            case 11:
                embedPageRendered = _b.sent();
                return [2, res.send(embedPageRendered)];
            case 12:
                err_1 = _b.sent();
                isApiUnavailable = err_1 && err_1.code === 'ECONNREFUSED';
                errorMessage = err_1 && err_1.message;
                console.log(err_1);
                title = isApiUnavailable ? 'Playpost API not available.' : 'Oops!';
                description = errorMessage ? errorMessage : isApiUnavailable ? 'Could not connect to the Playpost API to get the article data.' : 'An unknown error happened. Please reload the page.';
                return [4, ejs_1["default"].renderFile(__dirname + '/pages/error.ejs', {
                        title: title,
                        description: description
                    })];
            case 13:
                errorPageRendered = _b.sent();
                if (isApiUnavailable) {
                    return [2, res.status(503).send(errorPageRendered)];
                }
                return [2, res.status(500).send(errorPageRendered)];
            case 14: return [2];
        }
    });
}); });
var port = process.env.PORT || 8080;
console.log('Server init on port:', port);
app.listen(port);
//# sourceMappingURL=index.js.map