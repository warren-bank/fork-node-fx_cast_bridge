"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiverDeviceCapabilities = void 0;
var ReceiverDeviceCapabilities;
(function (ReceiverDeviceCapabilities) {
    ReceiverDeviceCapabilities[(ReceiverDeviceCapabilities["NONE"] = 0)] =
        "NONE";
    ReceiverDeviceCapabilities[(ReceiverDeviceCapabilities["VIDEO_OUT"] = 1)] =
        "VIDEO_OUT";
    ReceiverDeviceCapabilities[(ReceiverDeviceCapabilities["VIDEO_IN"] = 2)] =
        "VIDEO_IN";
    ReceiverDeviceCapabilities[(ReceiverDeviceCapabilities["AUDIO_OUT"] = 4)] =
        "AUDIO_OUT";
    ReceiverDeviceCapabilities[(ReceiverDeviceCapabilities["AUDIO_IN"] = 8)] =
        "AUDIO_IN";
    ReceiverDeviceCapabilities[
        (ReceiverDeviceCapabilities["MULTIZONE_GROUP"] = 32)
    ] = "MULTIZONE_GROUP";
})(
    ReceiverDeviceCapabilities ||
        (exports.ReceiverDeviceCapabilities = ReceiverDeviceCapabilities = {})
);
