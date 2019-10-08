import React from 'react';
export var Duration = function (_a) {
    var className = _a.className, seconds = _a.seconds;
    return (React.createElement("time", { dateTime: "P" + Math.round(seconds) + "S", className: className }, format(seconds)));
};
function format(seconds) {
    var date = new Date(seconds * 1000);
    var hh = date.getUTCHours();
    var mm = date.getUTCMinutes();
    var ss = pad(date.getUTCSeconds());
    if (hh) {
        return hh + ":" + pad(mm) + ":" + ss;
    }
    return mm + ":" + ss;
}
function pad(number) {
    return ('0' + number).slice(-2);
}
//# sourceMappingURL=index.js.map