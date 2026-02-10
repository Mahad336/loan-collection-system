"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionOutcome = exports.ActionType = exports.CaseStatus = exports.CaseStage = void 0;
var CaseStage;
(function (CaseStage) {
    CaseStage["SOFT"] = "SOFT";
    CaseStage["HARD"] = "HARD";
    CaseStage["LEGAL"] = "LEGAL";
})(CaseStage || (exports.CaseStage = CaseStage = {}));
var CaseStatus;
(function (CaseStatus) {
    CaseStatus["OPEN"] = "OPEN";
    CaseStatus["IN_PROGRESS"] = "IN_PROGRESS";
    CaseStatus["RESOLVED"] = "RESOLVED";
    CaseStatus["CLOSED"] = "CLOSED";
})(CaseStatus || (exports.CaseStatus = CaseStatus = {}));
var ActionType;
(function (ActionType) {
    ActionType["CALL"] = "CALL";
    ActionType["SMS"] = "SMS";
    ActionType["EMAIL"] = "EMAIL";
    ActionType["WHATSAPP"] = "WHATSAPP";
})(ActionType || (exports.ActionType = ActionType = {}));
var ActionOutcome;
(function (ActionOutcome) {
    ActionOutcome["NO_ANSWER"] = "NO_ANSWER";
    ActionOutcome["PROMISE_TO_PAY"] = "PROMISE_TO_PAY";
    ActionOutcome["PAID"] = "PAID";
    ActionOutcome["WRONG_NUMBER"] = "WRONG_NUMBER";
})(ActionOutcome || (exports.ActionOutcome = ActionOutcome = {}));
//# sourceMappingURL=enums.js.map