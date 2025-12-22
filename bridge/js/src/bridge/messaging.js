"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketMessenger =
    exports.StdioMessenger =
    exports.Messenger =
        void 0;
const tiny_typed_emitter_1 = require("tiny-typed-emitter");
const transforms_1 = require("../transforms");
class Messenger extends tiny_typed_emitter_1.TypedEmitter {}
exports.Messenger = Messenger;
class StdioMessenger extends tiny_typed_emitter_1.TypedEmitter {
    constructor() {
        super();
        this.decodeTransform = new transforms_1.DecodeTransform();
        this.encodeTransform = new transforms_1.EncodeTransform();
        process.stdin.pipe(this.decodeTransform);
        this.encodeTransform.pipe(process.stdout);
        this.decodeTransform.on("error", err =>
            console.error("err (message decode):", err)
        );
        this.encodeTransform.on("error", err =>
            console.error("err (message encode):", err)
        );
        this.decodeTransform.on("data", message => {
            this.emit("message", message);
        });
    }
    sendMessage(message) {
        this.send(message);
    }
    send(data) {
        this.encodeTransform.write(data);
    }
}
exports.StdioMessenger = StdioMessenger;
class WebsocketMessenger extends tiny_typed_emitter_1.TypedEmitter {
    constructor(socket) {
        super();
        this.socket = socket;
        socket.on("message", message => {
            try {
                const parsed = JSON.parse(message);
                this.emit("message", parsed);
            } catch (err) {
                socket.close();
            }
        });
    }
    sendMessage(message) {
        this.send(message);
    }
    send(data) {
        this.socket.send(JSON.stringify(data));
    }
}
exports.WebsocketMessenger = WebsocketMessenger;
