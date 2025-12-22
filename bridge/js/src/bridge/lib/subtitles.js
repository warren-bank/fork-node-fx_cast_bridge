"use strict";
var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value);
                  });
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator["throw"](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done
                    ? resolve(result.value)
                    : adopt(result.value).then(fulfilled, rejected);
            }
            step(
                (generator = generator.apply(thisArg, _arguments || [])).next()
            );
        });
    };
var __asyncValues =
    (this && this.__asyncValues) ||
    function (o) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator],
            i;
        return m
            ? m.call(o)
            : ((o =
                  typeof __values === "function"
                      ? __values(o)
                      : o[Symbol.iterator]()),
              (i = {}),
              verb("next"),
              verb("throw"),
              verb("return"),
              (i[Symbol.asyncIterator] = function () {
                  return this;
              }),
              i);
        function verb(n) {
            i[n] =
                o[n] &&
                function (v) {
                    return new Promise(function (resolve, reject) {
                        (v = o[n](v)), settle(resolve, reject, v.done, v.value);
                    });
                };
        }
        function settle(resolve, reject, d, v) {
            Promise.resolve(v).then(function (v) {
                resolve({ value: v, done: d });
            }, reject);
        }
    };
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertSrtToVtt = convertSrtToVtt;
const fs_1 = __importDefault(require("fs"));
function convertSrtToVtt(srtFilePath) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, e_1, _b, _c;
        const fileStream = fs_1.default.createReadStream(srtFilePath, {
            encoding: "utf-8"
        });
        let fileContents = "";
        try {
            for (
                var _d = true,
                    fileStream_1 = __asyncValues(fileStream),
                    fileStream_1_1;
                (fileStream_1_1 = yield fileStream_1.next()),
                    (_a = fileStream_1_1.done),
                    !_a;
                _d = true
            ) {
                _c = fileStream_1_1.value;
                _d = false;
                let chunk = _c;
                if (!fileContents && chunk[0] === "\uFEFF") {
                    chunk = chunk.slice(1);
                }
                fileContents += chunk.replace(/$\r\n/gm, "\n");
            }
        } catch (e_1_1) {
            e_1 = { error: e_1_1 };
        } finally {
            try {
                if (!_d && !_a && (_b = fileStream_1.return))
                    yield _b.call(fileStream_1);
            } finally {
                if (e_1) throw e_1.error;
            }
        }
        let vttText = "WEBVTT\n";
        const REGEX_CAPTION =
            /(?:(\d+)\n(\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}))\n((?:.+)\n?)*/g;
        for (const groups of fileContents.matchAll(REGEX_CAPTION)) {
            const captionIndex = groups[1];
            const captionTime = groups[2];
            const captionText = groups[3];
            vttText += `\n${captionIndex}\n`;
            vttText += `${captionTime.replace(/,/g, ".")}\n`;
            if (captionText) {
                vttText += `${captionText}`;
            }
        }
        return vttText;
    });
}
