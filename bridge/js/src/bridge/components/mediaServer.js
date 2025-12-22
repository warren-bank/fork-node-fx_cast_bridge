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
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaServer = void 0;
exports.startMediaServer = startMediaServer;
exports.stopMediaServer = stopMediaServer;
const fs_1 = __importDefault(require("fs"));
const http_1 = __importDefault(require("http"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const stream_1 = __importDefault(require("stream"));
const mime_types_1 = __importDefault(require("mime-types"));
const subtitles_1 = require("../lib/subtitles");
function startMediaServer(messaging, filePath, port) {
    return __awaiter(this, void 0, void 0, function* () {
        if (
            exports.mediaServer === null || exports.mediaServer === void 0
                ? void 0
                : exports.mediaServer.listening
        ) {
            yield stopMediaServer();
        }
        let fileDir;
        let fileName;
        let fileSize;
        try {
            const stat = yield fs_1.default.promises.lstat(filePath);
            if (stat.isFile()) {
                fileDir = path_1.default.dirname(filePath);
                fileName = path_1.default.basename(filePath);
                fileSize = stat.size;
            } else {
                messaging.sendMessage({
                    subject: "mediaCast:mediaServerError",
                    data: "Media path is not a file."
                });
                return;
            }
        } catch (err) {
            messaging.sendMessage({
                subject: "mediaCast:mediaServerError",
                data: "Failed to find media path."
            });
            return;
        }
        const contentType = mime_types_1.default.lookup(filePath);
        if (!contentType) {
            messaging.sendMessage({
                subject: "mediaCast:mediaServerError",
                data: "Failed to find media type."
            });
            return;
        }
        const subtitles = new Map();
        try {
            const dirEntries = yield fs_1.default.promises.readdir(fileDir, {
                withFileTypes: true
            });
            for (const dirEntry of dirEntries) {
                if (
                    dirEntry.isFile() &&
                    mime_types_1.default.lookup(dirEntry.name) ===
                        "application/x-subrip"
                ) {
                    subtitles.set(
                        dirEntry.name,
                        yield (0, subtitles_1.convertSrtToVtt)(
                            path_1.default.join(fileDir, dirEntry.name)
                        )
                    );
                }
            }
        } catch (err) {
            console.error(
                `Error: Failed to find/convert subtitles (${filePath}).`
            );
        }
        exports.mediaServer = http_1.default.createServer((req, res) =>
            __awaiter(this, void 0, void 0, function* () {
                if (!req.url) {
                    return;
                }
                let decodedUrl = decodeURIComponent(req.url);
                if (decodedUrl.startsWith("/")) {
                    decodedUrl = decodedUrl.slice(1);
                }
                switch (decodedUrl) {
                    case fileName: {
                        const { range } = req.headers;
                        if (range) {
                            const bounds = range.substring(6).split("-");
                            const start = parseInt(bounds[0]);
                            const end = bounds[1]
                                ? parseInt(bounds[1])
                                : fileSize - 1;
                            res.writeHead(206, {
                                "Accept-Ranges": "bytes",
                                "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                                "Content-Length": end - start + 1,
                                "Content-Type": contentType
                            });
                            fs_1.default
                                .createReadStream(filePath, { start, end })
                                .pipe(res);
                        } else {
                            res.writeHead(200, {
                                "Content-Length": fileSize,
                                "Content-Type": contentType
                            });
                            fs_1.default.createReadStream(filePath).pipe(res);
                        }
                        break;
                    }
                    default: {
                        if (subtitles.has(req.url)) {
                            const vttSource = subtitles.get(req.url);
                            const vttStream =
                                stream_1.default.Readable.from(vttSource);
                            res.setHeader("Access-Control-Allow-Origin", "*");
                            vttStream.pipe(res);
                        }
                        break;
                    }
                }
            })
        );
        exports.mediaServer.on("close", () => {
            messaging.sendMessage({
                subject: "mediaCast:mediaServerStopped"
            });
        });
        exports.mediaServer.on("error", err => {
            messaging.sendMessage({
                subject: "mediaCast:mediaServerError",
                data: err.message
            });
        });
        exports.mediaServer.listen(port, () => {
            const localAddresses = [];
            for (const iface of Object.values(
                os_1.default.networkInterfaces()
            )) {
                const matchingIface =
                    iface === null || iface === void 0
                        ? void 0
                        : iface.find(
                              details =>
                                  details.family === "IPv4" && !details.internal
                          );
                if (matchingIface) {
                    localAddresses.push(matchingIface.address);
                }
            }
            if (!localAddresses.length) {
                messaging.sendMessage({
                    subject: "mediaCast:mediaServerError",
                    data: "Failed to get local address."
                });
                stopMediaServer();
                return;
            }
            messaging.sendMessage({
                subject: "mediaCast:mediaServerStarted",
                data: {
                    mediaPath: fileName,
                    subtitlePaths: Array.from(subtitles.keys()),
                    localAddress: localAddresses[0]
                }
            });
        });
    });
}
function stopMediaServer() {
    return new Promise((resolve, reject) => {
        if (
            !(exports.mediaServer === null || exports.mediaServer === void 0
                ? void 0
                : exports.mediaServer.listening)
        ) {
            resolve();
            return;
        }
        exports.mediaServer.close(err => {
            if (err) {
                reject();
            } else {
                resolve();
            }
        });
        exports.mediaServer = undefined;
    });
}
