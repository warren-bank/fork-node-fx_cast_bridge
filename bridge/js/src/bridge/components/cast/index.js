"use strict";
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCastMessage = handleCastMessage;
const Session_1 = __importDefault(require("./Session"));
const client_1 = __importDefault(require("./client"));
const sessions = new Map();
function handleCastMessage(messaging, message) {
    switch (message.subject) {
        case "bridge:createCastSession": {
            const { appId, receiverDevice } = message.data;
            const session = new Session_1.default(
                appId,
                receiverDevice,
                messaging,
                sessionId => {
                    sessions.set(sessionId, session);
                }
            );
            break;
        }
        case "bridge:sendCastReceiverMessage": {
            const { sessionId, messageData, messageId } = message.data;
            const session = sessions.get(sessionId);
            if (!session) {
                messaging.sendMessage({
                    subject: "cast:impl_sendMessage",
                    data: {
                        error: "Session does not exist",
                        sessionId,
                        messageId
                    }
                });
                break;
            }
            try {
                session.sendReceiverMessage(messageData);
            } catch (err) {
                messaging.sendMessage({
                    subject: "cast:impl_sendMessage",
                    data: {
                        error: `Failed to send message (${err})`,
                        sessionId,
                        messageId
                    }
                });
                break;
            }
            messaging.sendMessage({
                subject: "cast:impl_sendMessage",
                data: { sessionId, messageId }
            });
            break;
        }
        case "bridge:sendCastSessionMessage": {
            const { namespace, sessionId, messageId } = message.data;
            const session = sessions.get(sessionId);
            if (!session) {
                messaging.sendMessage({
                    subject: "cast:impl_sendMessage",
                    data: {
                        error: "Session does not exist",
                        sessionId,
                        messageId
                    }
                });
                break;
            }
            try {
                let { messageData } = message.data;
                if (typeof messageData === "string") {
                    messageData = JSON.parse(messageData);
                }
                session.sendMessage(namespace, messageData);
            } catch (err) {
                messaging.sendMessage({
                    subject: "cast:impl_sendMessage",
                    data: {
                        error: `Failed to send message (${err})`,
                        sessionId,
                        messageId
                    }
                });
                break;
            }
            messaging.sendMessage({
                subject: "cast:impl_sendMessage",
                data: { sessionId, messageId }
            });
            break;
        }
        case "bridge:stopCastSession": {
            const { receiverDevice } = message.data;
            const client = new client_1.default();
            client
                .connect(receiverDevice.host, { port: receiverDevice.port })
                .then(() => {
                    client.sendReceiverMessage({ type: "STOP" });
                });
            break;
        }
    }
}
