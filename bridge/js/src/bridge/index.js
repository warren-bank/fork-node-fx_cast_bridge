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
exports.run = run;
const cast_1 = require("./components/cast");
const discovery_1 = __importDefault(require("./components/cast/discovery"));
const remote_1 = __importDefault(require("./components/cast/remote"));
const mediaServer_1 = require("./components/mediaServer");
const config_json_1 = require("../../config.json");
process.on("SIGTERM", () =>
    __awaiter(void 0, void 0, void 0, function* () {
        discovery === null || discovery === void 0 ? void 0 : discovery.stop();
        try {
            yield (0, mediaServer_1.stopMediaServer)();
        } catch (err) {
            console.error("Error stopping media server!", err);
        } finally {
            process.exit(1);
        }
    })
);
let discovery = null;
const remotes = new Map();
function run(messaging) {
    messaging.on("message", message => {
        var _a, _b;
        switch (message.subject) {
            case "bridge:getInfo":
            case "bridge:/getInfo": {
                messaging.send(config_json_1.applicationVersion);
                break;
            }
            case "bridge:startDiscovery": {
                const { shouldWatchStatus } = message.data;
                discovery = new discovery_1.default({
                    onDeviceFound(device) {
                        messaging.sendMessage({
                            subject: "main:deviceUp",
                            data: {
                                deviceId: device.id,
                                deviceInfo: device
                            }
                        });
                        if (shouldWatchStatus) {
                            remotes.set(
                                device.id,
                                new remote_1.default(device.host, {
                                    port: device.port,
                                    onReceiverStatusUpdate(status) {
                                        messaging.sendMessage({
                                            subject:
                                                "main:receiverDeviceStatusUpdated",
                                            data: {
                                                deviceId: device.id,
                                                status
                                            }
                                        });
                                    },
                                    onMediaStatusUpdate(status) {
                                        if (!status) return;
                                        messaging.sendMessage({
                                            subject:
                                                "main:receiverDeviceMediaStatusUpdated",
                                            data: {
                                                deviceId: device.id,
                                                status
                                            }
                                        });
                                    }
                                })
                            );
                        }
                    },
                    onDeviceDown(deviceId) {
                        var _a;
                        messaging.sendMessage({
                            subject: "main:deviceDown",
                            data: { deviceId }
                        });
                        if (shouldWatchStatus) {
                            if (remotes.has(deviceId)) {
                                (_a = remotes.get(deviceId)) === null ||
                                _a === void 0
                                    ? void 0
                                    : _a.disconnect();
                                remotes.delete(deviceId);
                            }
                        }
                    }
                });
                discovery.start();
                break;
            }
            case "bridge:sendReceiverMessage": {
                const { deviceId, message: receiverMessage } = message.data;
                (_a = remotes.get(deviceId)) === null || _a === void 0
                    ? void 0
                    : _a.sendReceiverMessage(receiverMessage);
                break;
            }
            case "bridge:sendMediaMessage": {
                const { deviceId, message: mediaMessage } = message.data;
                (_b = remotes.get(deviceId)) === null || _b === void 0
                    ? void 0
                    : _b.sendMediaMessage(mediaMessage);
                break;
            }
            case "bridge:startMediaServer": {
                const { filePath, port } = message.data;
                (0, mediaServer_1.startMediaServer)(messaging, filePath, port);
                break;
            }
            case "bridge:stopMediaServer": {
                (0, mediaServer_1.stopMediaServer)();
                break;
            }
            default: {
                (0, cast_1.handleCastMessage)(messaging, message);
            }
        }
    });
}
