var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import React from 'react';
import './App.scss';
import { Player } from './components/Player';
var App = function () {
    /**
     * Regex to check if the given color code (hex value) is correct.
     *
     * @param text
     */
    // @ts-ignore
    var article = (typeof window !== 'undefined' && window.article) ? window.article : null;
    // @ts-ignore
    var audiofile = (typeof window !== 'undefined' && window.audiofile) ? window.audiofile : null;
    var isCorrectColorCode = function (colorCode) {
        var hex = "#" + colorCode;
        var regex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        return regex.test(hex);
    };
    var getUserDefinedPlayerThemeOptions = function () {
        var _a;
        var urlParams = new window.URLSearchParams(window.location.search);
        var defaultOptions = {
            buttonColor: '#0066FF',
            backgroundColor: '#ffffff',
            borderColor: '#e5e5e5',
            titleColor: '#000000',
            trackBackgroundColor: '#000000',
            trackThumbColor: '#000000',
            trackLabelBackgroundColor: '#000000'
        };
        var options = __assign({}, defaultOptions);
        for (var _i = 0, _b = Object.entries(defaultOptions); _i < _b.length; _i++) {
            var key = _b[_i][0];
            var paramValue = urlParams.get(key);
            if (paramValue && isCorrectColorCode(paramValue)) {
                options = __assign(__assign({}, options), (_a = {}, _a[key] = "#" + paramValue, _a));
            }
        }
        return options;
    };
    var playerThemeOptions = getUserDefinedPlayerThemeOptions();
    if (!article) {
        return (React.createElement("div", { className: "App" },
            React.createElement("p", null, "could not get article")));
    }
    if (!audiofile) {
        return (React.createElement("div", { className: "App" },
            React.createElement("p", null, "could not get audiofile")));
    }
    return (React.createElement("div", { className: "App" },
        React.createElement(Player, { articleId: article.id, articleTitle: article.title, articleUrl: article.url, articleSourceName: article.sourceName, voiceLabel: audiofile.voice.label, voiceLanguageCode: audiofile.voice.languageCode, audiofileUrl: audiofile.url, audiofileLength: audiofile.length, themeOptions: playerThemeOptions })));
};
export default App;
//# sourceMappingURL=App.js.map