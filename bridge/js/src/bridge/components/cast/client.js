"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NS_RECEIVER = exports.NS_HEARTBEAT = exports.NS_CONNECTION = void 0;
const castv2_1 = require("castv2");
exports.NS_CONNECTION = "urn:x-cast:com.google.cast.tp.connection";
exports.NS_HEARTBEAT = "urn:x-cast:com.google.cast.tp.heartbeat";
exports.NS_RECEIVER = "urn:x-cast:com.google.cast.receiver";
const DEFAULT_PORT = 8009;
const HEARTBEAT_INTERVAL_MS = 5000;
class CastClient {
    constructor(sourceId = "sender-0", destinationId = "receiver-0") {
        this.sourceId = sourceId;
        this.destinationId = destinationId;
        this.client = new castv2_1.Client();
        this.receiverRequestId = Math.floor(Math.random() * 1e6);
    }
    createChannel(
        namespace,
        sourceId = this.sourceId,
        destinationId = this.destinationId
    ) {
        return this.client.createChannel(
            sourceId,
            destinationId,
            namespace,
            "JSON"
        );
    }
    sendReceiverMessage(message) {
        if (!this.receiverChannel) return;
        const requestId = this.receiverRequestId++;
        this.receiverChannel.send(
            Object.assign(Object.assign({}, message), { requestId })
        );
        return requestId;
    }
    connect(host, options) {
        return new Promise((resolve, reject) => {
            var _a;
            this.client.on("error", reject);
            this.client.on("close", () => {
                if (this.heartbeatChannel && this.heartbeatIntervalId) {
                    clearInterval(this.heartbeatIntervalId);
                }
            });
            this.client.connect(
                {
                    host,
                    port:
                        (_a =
                            options === null || options === void 0
                                ? void 0
                                : options.port) !== null && _a !== void 0
                            ? _a
                            : DEFAULT_PORT
                },
                () => {
                    this.connectionChannel = this.createChannel(
                        exports.NS_CONNECTION
                    );
                    this.heartbeatChannel = this.createChannel(
                        exports.NS_HEARTBEAT
                    );
                    this.receiverChannel = this.createChannel(
                        exports.NS_RECEIVER
                    );
                    this.receiverChannel.on("message", message => {
                        var _a;
                        (_a =
                            options === null || options === void 0
                                ? void 0
                                : options.onReceiverMessage) === null ||
                        _a === void 0
                            ? void 0
                            : _a.call(options, message);
                    });
                    this.connectionChannel.send({ type: "CONNECT" });
                    this.heartbeatChannel.send({ type: "PING" });
                    this.heartbeatIntervalId = setInterval(() => {
                        var _a, _b;
                        (_a = this.heartbeatChannel) === null || _a === void 0
                            ? void 0
                            : _a.send({ type: "PING" });
                        (_b =
                            options === null || options === void 0
                                ? void 0
                                : options.onHeartbeat) === null || _b === void 0
                            ? void 0
                            : _b.call(options);
                    }, HEARTBEAT_INTERVAL_MS);
                    resolve();
                }
            );
        });
    }
    disconnect() {
        var _a;
        if (this.heartbeatIntervalId) {
            clearInterval(this.heartbeatIntervalId);
        }
        (_a = this.connectionChannel) === null || _a === void 0
            ? void 0
            : _a.send({ type: "CLOSE" });
        this.client.close();
    }
}
exports.default = CastClient;
