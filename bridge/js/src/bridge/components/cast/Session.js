"use strict";
var __createBinding =
    (this && this.__createBinding) ||
    (Object.create
        ? function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              var desc = Object.getOwnPropertyDescriptor(m, k);
              if (
                  !desc ||
                  ("get" in desc
                      ? !m.__esModule
                      : desc.writable || desc.configurable)
              ) {
                  desc = {
                      enumerable: true,
                      get: function () {
                          return m[k];
                      }
                  };
              }
              Object.defineProperty(o, k2, desc);
          }
        : function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              o[k2] = m[k];
          });
var __setModuleDefault =
    (this && this.__setModuleDefault) ||
    (Object.create
        ? function (o, v) {
              Object.defineProperty(o, "default", {
                  enumerable: true,
                  value: v
              });
          }
        : function (o, v) {
              o["default"] = v;
          });
var __importStar =
    (this && this.__importStar) ||
    (function () {
        var ownKeys = function (o) {
            ownKeys =
                Object.getOwnPropertyNames ||
                function (o) {
                    var ar = [];
                    for (var k in o)
                        if (Object.prototype.hasOwnProperty.call(o, k))
                            ar[ar.length] = k;
                    return ar;
                };
            return ownKeys(o);
        };
        return function (mod) {
            if (mod && mod.__esModule) return mod;
            var result = {};
            if (mod != null)
                for (var k = ownKeys(mod), i = 0; i < k.length; i++)
                    if (k[i] !== "default") __createBinding(result, mod, k[i]);
            __setModuleDefault(result, mod);
            return result;
        };
    })();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importStar(require("./client"));
class Session extends client_1.default {
    establishAppConnection(transportId) {
        this.transportConnection = this.createChannel(
            client_1.NS_CONNECTION,
            this.sourceId,
            transportId
        );
        this.transportHeartbeat = this.createChannel(
            client_1.NS_HEARTBEAT,
            this.sourceId,
            transportId
        );
        this.transportConnection.send({ type: "CONNECT" });
    }
    sendMessage(namespace, message) {
        let channel = this.namespaceChannelMap.get(namespace);
        if (!channel) {
            channel = this.createChannel(
                namespace,
                this.sourceId,
                this.transportId
            );
            channel.on("message", messageData => {
                if (!this.sessionId) {
                    return;
                }
                messageData = JSON.stringify(messageData);
                this.messaging.sendMessage({
                    subject: "cast:sessionMessageReceived",
                    data: {
                        sessionId: this.sessionId,
                        namespace,
                        messageData
                    }
                });
            });
            this.namespaceChannelMap.set(namespace, channel);
        }
        channel.send(message);
    }
    constructor(appId, receiverDevice, messaging, onSessionCreated) {
        super();
        this.appId = appId;
        this.receiverDevice = receiverDevice;
        this.messaging = messaging;
        this.onSessionCreated = onSessionCreated;
        this.namespaceChannelMap = new Map();
        this.onReceiverMessage = message => {
            var _a, _b;
            switch (message.type) {
                case "RECEIVER_STATUS": {
                    const { status } = message;
                    const application =
                        (_a = status.applications) === null || _a === void 0
                            ? void 0
                            : _a.find(app => app.appId === this.appId);
                    if (!this.sessionId) {
                        if (message.requestId !== this.launchRequestId) {
                            break;
                        }
                        if (application) {
                            this.sessionId = application.sessionId;
                            this.transportId = application.transportId;
                            this.establishAppConnection(this.transportId);
                            (_b = this.onSessionCreated) === null ||
                            _b === void 0
                                ? void 0
                                : _b.call(this, this.sessionId);
                            this.messaging.sendMessage({
                                subject: "main:castSessionCreated",
                                data: {
                                    sessionId: this.sessionId,
                                    statusText: application.statusText,
                                    namespaces: application.namespaces,
                                    volume: status.volume,
                                    appId: application.appId,
                                    displayName: application.displayName,
                                    receiverId: this.receiverDevice.id,
                                    receiverFriendlyName:
                                        this.receiverDevice.friendlyName,
                                    transportId: this.sessionId,
                                    senderApps: [],
                                    appImages: []
                                }
                            });
                        }
                        break;
                    }
                    if (!application) {
                        this.client.close();
                        break;
                    }
                    this.messaging.sendMessage({
                        subject: "main:castSessionUpdated",
                        data: {
                            sessionId: this.sessionId,
                            statusText: application.statusText,
                            namespaces: application.namespaces,
                            volume: message.status.volume
                        }
                    });
                    break;
                }
                case "LAUNCH_ERROR": {
                    console.error(`err: LAUNCH_ERROR, ${message.reason}`);
                    this.client.close();
                    break;
                }
            }
        };
        super
            .connect(receiverDevice.host, {
                port: receiverDevice.port,
                onHeartbeat: () => {
                    if (this.transportHeartbeat) {
                        this.transportHeartbeat.send({ type: "PING" });
                    }
                },
                onReceiverMessage: message => {
                    this.onReceiverMessage(message);
                }
            })
            .then(() => {
                this.launchRequestId = this.sendReceiverMessage({
                    type: "LAUNCH",
                    appId: this.appId
                });
            });
        this.client.on("close", () => {
            if (this.sessionId) {
                messaging.sendMessage({
                    subject: "cast:sessionStopped",
                    data: { sessionId: this.sessionId }
                });
            }
        });
    }
}
exports.default = Session;
