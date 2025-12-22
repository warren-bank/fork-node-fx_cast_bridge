"use strict";
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, "__esModule", { value: true });
const bplist_creator_1 = __importDefault(require("bplist-creator"));
const bplist_parser_1 = __importDefault(require("bplist-parser"));
exports.default = {
    create: bplist_creator_1.default,
    parse: bplist_parser_1.default
};
