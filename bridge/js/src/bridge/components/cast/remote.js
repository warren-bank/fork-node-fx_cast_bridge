"use strict";
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("./client"));
const NS_MEDIA = "urn:x-cast:com.google.cast.media";
class Remote extends client_1.default {
    constructor(host, options) {
        super();
        this.host = host;
        this.options = options;
        super
            .connect(host, {
                port:
                    options === null || options === void 0
                        ? void 0
                        : options.port,
                onReceiverMessage: message => {
                    this.onReceiverMessage(message);
                }
            })
            .then(() => {
                this.sendReceiverMessage({ type: "GET_STATUS" });
            });
    }
    disconnect() {
        var _a;
        super.disconnect();
        (_a = this.transportClient) === null || _a === void 0
            ? void 0
            : _a.disconnect();
    }
    sendMediaMessage(message) {
        var _a;
        (_a = this.transportClient) === null || _a === void 0
            ? void 0
            : _a.sendMediaMessage(message);
    }
    onReceiverMessage(message) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (message.type !== "RECEIVER_STATUS") {
            return;
        }
        const application =
            (_a = message.status.applications) === null || _a === void 0
                ? void 0
                : _a[0];
        if (!application || application.isIdleScreen) {
            if (this.transportClient) {
                this.transportClient = undefined;
                (_c =
                    (_b = this.options) === null || _b === void 0
                        ? void 0
                        : _b.onApplicationClose) === null || _c === void 0
                    ? void 0
                    : _c.call(_b);
            }
        }
        (_e =
            (_d = this.options) === null || _d === void 0
                ? void 0
                : _d.onReceiverStatusUpdate) === null || _e === void 0
            ? void 0
            : _e.call(_d, message.status);
        if (application && !this.transportClient) {
            this.transportClient = new RemoteTransport(
                application.transportId,
                message => this.onMediaMessage(message)
            );
            this.transportClient
                .connect(this.host, {
                    port:
                        (_f = this.options) === null || _f === void 0
                            ? void 0
                            : _f.port
                })
                .then(() => {
                    var _a;
                    (_a = this.transportClient) === null || _a === void 0
                        ? void 0
                        : _a.sendMediaMessage({
                              type: "GET_STATUS",
                              requestId: 0
                          });
                });
            (_h =
                (_g = this.options) === null || _g === void 0
                    ? void 0
                    : _g.onApplicationFound) === null || _h === void 0
                ? void 0
                : _h.call(_g);
        }
    }
    onMediaMessage(message) {
        var _a, _b;
        if (message.type !== "MEDIA_STATUS") {
            return;
        }
        (_b =
            (_a = this.options) === null || _a === void 0
                ? void 0
                : _a.onMediaStatusUpdate) === null || _b === void 0
            ? void 0
            : _b.call(_a, message.status[0]);
    }
}
exports.default = Remote;
class RemoteTransport extends client_1.default {
    constructor(transportId, onMediaMessage) {
        super(undefined, transportId);
        this.mediaChannel = this.createChannel(NS_MEDIA);
        this.mediaChannel.on("message", message => onMediaMessage(message));
    }
    sendMediaMessage(message) {
        this.mediaChannel.send(message);
    }
}
