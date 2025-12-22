"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAction = exports.HlsVideoSegmentFormat = void 0;
var Capability;
(function (Capability) {
    Capability["VIDEO_OUT"] = "video_out";
    Capability["AUDIO_OUT"] = "audio_out";
    Capability["VIDEO_IN"] = "video_in";
    Capability["AUDIO_IN"] = "audio_in";
    Capability["MULTIZONE_GROUP"] = "multizone_group";
})(Capability || (Capability = {}));
var ReceiverType;
(function (ReceiverType) {
    ReceiverType["CAST"] = "cast";
    ReceiverType["DIAL"] = "dial";
    ReceiverType["HANGOUT"] = "hangout";
    ReceiverType["CUSTOM"] = "custom";
})(ReceiverType || (ReceiverType = {}));
var VolumeControlType;
(function (VolumeControlType) {
    VolumeControlType["ATTENUATION"] = "attenuation";
    VolumeControlType["FIXED"] = "fixed";
    VolumeControlType["MASTER"] = "master";
})(VolumeControlType || (VolumeControlType = {}));
var IdleReason;
(function (IdleReason) {
    IdleReason["CANCELLED"] = "CANCELLED";
    IdleReason["INTERRUPTED"] = "INTERRUPTED";
    IdleReason["FINISHED"] = "FINISHED";
    IdleReason["ERROR"] = "ERROR";
})(IdleReason || (IdleReason = {}));
var HlsSegmentFormat;
(function (HlsSegmentFormat) {
    HlsSegmentFormat["AAC"] = "aac";
    HlsSegmentFormat["AC3"] = "ac3";
    HlsSegmentFormat["MP3"] = "mp3";
    HlsSegmentFormat["TS"] = "ts";
    HlsSegmentFormat["TS_AAC"] = "ts_aac";
    HlsSegmentFormat["E_AC3"] = "e_ac3";
    HlsSegmentFormat["FMP4"] = "fmp4";
})(HlsSegmentFormat || (HlsSegmentFormat = {}));
var HlsVideoSegmentFormat;
(function (HlsVideoSegmentFormat) {
    HlsVideoSegmentFormat["MPEG2_TS"] = "mpeg2_ts";
    HlsVideoSegmentFormat["FMP4"] = "fmp4";
})(
    HlsVideoSegmentFormat ||
        (exports.HlsVideoSegmentFormat = HlsVideoSegmentFormat = {})
);
var MetadataType;
(function (MetadataType) {
    MetadataType[(MetadataType["GENERIC"] = 0)] = "GENERIC";
    MetadataType[(MetadataType["MOVIE"] = 1)] = "MOVIE";
    MetadataType[(MetadataType["TV_SHOW"] = 2)] = "TV_SHOW";
    MetadataType[(MetadataType["MUSIC_TRACK"] = 3)] = "MUSIC_TRACK";
    MetadataType[(MetadataType["PHOTO"] = 4)] = "PHOTO";
    MetadataType[(MetadataType["AUDIOBOOK_CHAPTER"] = 5)] = "AUDIOBOOK_CHAPTER";
})(MetadataType || (MetadataType = {}));
var PlayerState;
(function (PlayerState) {
    PlayerState["IDLE"] = "IDLE";
    PlayerState["PLAYING"] = "PLAYING";
    PlayerState["PAUSED"] = "PAUSED";
    PlayerState["BUFFERING"] = "BUFFERING";
})(PlayerState || (PlayerState = {}));
var RepeatMode;
(function (RepeatMode) {
    RepeatMode["OFF"] = "REPEAT_OFF";
    RepeatMode["ALL"] = "REPEAT_ALL";
    RepeatMode["SINGLE"] = "REPEAT_SINGLE";
    RepeatMode["ALL_AND_SHUFFLE"] = "REPEAT_ALL_AND_SHUFFLE";
})(RepeatMode || (RepeatMode = {}));
var ResumeState;
(function (ResumeState) {
    ResumeState["PLAYBACK_START"] = "PLAYBACK_START";
    ResumeState["PLAYBACK_PAUSE"] = "PLAYBACK_PAUSE";
})(ResumeState || (ResumeState = {}));
var StreamType;
(function (StreamType) {
    StreamType["BUFFERED"] = "BUFFERED";
    StreamType["LIVE"] = "LIVE";
    StreamType["OTHER"] = "OTHER";
})(StreamType || (StreamType = {}));
var TrackType;
(function (TrackType) {
    TrackType["TEXT"] = "TEXT";
    TrackType["AUDIO"] = "AUDIO";
    TrackType["VIDEO"] = "VIDEO";
})(TrackType || (TrackType = {}));
var UserAction;
(function (UserAction) {
    UserAction["LIKE"] = "LIKE";
    UserAction["DISLIKE"] = "DISLIKE";
    UserAction["FOLLOW"] = "FOLLOW";
    UserAction["UNFOLLOW"] = "UNFOLLOW";
})(UserAction || (exports.UserAction = UserAction = {}));
