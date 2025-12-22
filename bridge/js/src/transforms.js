"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncodeTransform =
    exports.DecodeTransform =
    exports.ResponseTransform =
        void 0;
const stream_1 = require("stream");
class ResponseTransform extends stream_1.Transform {
    constructor(_handler) {
        super({
            readableObjectMode: true,
            writableObjectMode: true
        });
        this._handler = _handler;
    }
    _transform(chunk, _encoding, callback) {
        Promise.resolve(this._handler(chunk)).then(res => {
            if (res) {
                callback(null, res);
            } else {
                callback(null);
            }
        });
    }
}
exports.ResponseTransform = ResponseTransform;
class DecodeTransform extends stream_1.Transform {
    constructor() {
        super({
            readableObjectMode: true
        });
        this._messageBuffer = Buffer.alloc(0);
    }
    _transform(chunk, _encoding, callback) {
        this._messageBuffer = Buffer.concat([this._messageBuffer, chunk]);
        for (;;) {
            if (this._messageLength === undefined) {
                if (this._messageBuffer.length >= 4) {
                    this._messageLength = this._messageBuffer.readUInt32LE(0);
                    this._messageBuffer = this._messageBuffer.slice(4);
                    continue;
                }
            } else {
                if (this._messageBuffer.length >= this._messageLength) {
                    const message = JSON.parse(
                        this._messageBuffer
                            .slice(0, this._messageLength)
                            .toString()
                    );
                    this.push(message);
                    this._messageBuffer = this._messageBuffer.slice(
                        this._messageLength
                    );
                    this._messageLength = undefined;
                    continue;
                }
            }
            callback();
            break;
        }
    }
}
exports.DecodeTransform = DecodeTransform;
class EncodeTransform extends stream_1.Transform {
    constructor() {
        super({
            writableObjectMode: true
        });
    }
    _transform(chunk, _encoding, callback) {
        const messageLength = Buffer.alloc(4);
        const message = Buffer.from(JSON.stringify(chunk));
        messageLength.writeUInt32LE(message.length, 0);
        callback(null, Buffer.concat([messageLength, message]));
    }
}
exports.EncodeTransform = EncodeTransform;
