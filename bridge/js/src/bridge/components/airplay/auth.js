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
exports.AirPlayAuth = exports.AirPlayAuthCredentials = void 0;
const crypto_1 = __importDefault(require("crypto"));
const fast_srp_hap_1 = __importDefault(require("fast-srp-hap"));
const node_fetch_1 = __importStar(require("node-fetch"));
const tweetnacl_1 = __importDefault(require("tweetnacl"));
const bplist_1 = __importDefault(require("./bplist"));
const AIRPLAY_PORT = 7000;
const MIMETYPE_BPLIST = "application/x-apple-binary-plist";
class AirPlayAuthCredentials {
    constructor(clientId, clientSk, clientPk) {
        if (clientId && clientSk && clientPk) {
            this.clientId = clientId;
            this.clientSk = clientSk;
            this.clientPk = clientPk;
        } else {
            const keyPair = tweetnacl_1.default.sign.keyPair();
            this.clientId = crypto_1.default.randomBytes(8).toString("hex");
            this.clientSk = keyPair.secretKey.slice(0, 32);
            this.clientPk = keyPair.publicKey;
        }
    }
}
exports.AirPlayAuthCredentials = AirPlayAuthCredentials;
class AirPlayAuth {
    constructor(address, credentials) {
        this.address = address;
        this.credentials = credentials;
        this.baseUrl = new URL(`http://${this.address}:${AIRPLAY_PORT}`);
    }
    beginPairing() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.sendPostRequest("/pair-pin-start");
        });
    }
    finishPairing(pin) {
        return __awaiter(this, void 0, void 0, function* () {
            const { pk: serverPk, salt: serverSalt } =
                yield this.pairSetupPin1();
            const srpParams = fast_srp_hap_1.default.params[2048];
            srpParams.hash = "sha1";
            const srpClient = new fast_srp_hap_1.default.Client(
                srpParams,
                serverSalt,
                Buffer.from(this.credentials.clientId),
                Buffer.from(pin),
                Buffer.from(this.credentials.clientSk)
            );
            srpClient.setB(serverPk);
            yield this.pairSetupPin2(
                srpClient.computeA(),
                srpClient.computeM1()
            );
            yield this.pairSetupPin3(srpClient.computeK());
        });
    }
    pairSetupPin1() {
        return __awaiter(this, void 0, void 0, function* () {
            const [response] = yield this.sendPostRequestBplist(
                "/pair-setup-pin",
                {
                    method: "pin",
                    user: this.credentials.clientId
                }
            );
            return response;
        });
    }
    pairSetupPin2(pk, proof) {
        return __awaiter(this, void 0, void 0, function* () {
            const [response] = yield this.sendPostRequestBplist(
                "/pair-setup-pin",
                {
                    pk,
                    proof
                }
            );
            return response;
        });
    }
    pairSetupPin3(sharedSecretHash) {
        return __awaiter(this, void 0, void 0, function* () {
            const aesKey = crypto_1.default
                .createHash("sha512")
                .update("Pair-Setup-AES-Key")
                .update(sharedSecretHash)
                .digest()
                .slice(0, 16);
            const aesIv = crypto_1.default
                .createHash("sha512")
                .update("Pair-Setup-AES-IV")
                .update(sharedSecretHash)
                .digest()
                .slice(0, 16);
            aesIv[15]++;
            const cipher = crypto_1.default.createCipheriv(
                "aes-128-gcm",
                aesKey,
                aesIv
            );
            const epk = cipher.update(this.credentials.clientPk);
            cipher.final();
            const authTag = cipher.getAuthTag();
            const [response] = yield this.sendPostRequestBplist(
                "/pair-setup-pin",
                {
                    epk,
                    authTag
                }
            );
            return response;
        });
    }
    sendPostRequest(path, contentType, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestUrl = new URL(path, this.baseUrl);
            const requestHeaders = new node_fetch_1.Headers({
                "User-Agent": "AirPlay/320.20"
            });
            if (data && contentType) {
                requestHeaders.append("Content-Type", contentType);
            }
            const response = yield (0, node_fetch_1.default)(requestUrl.href, {
                method: "POST",
                headers: requestHeaders,
                body: data
            });
            if (!response.ok) {
                throw new Error(`AirPlay request error: ${response.status}`);
            }
            return yield response.buffer();
        });
    }
    sendPostRequestBplist(path, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestBody = data
                ? bplist_1.default.create(data)
                : undefined;
            const response = yield this.sendPostRequest(
                path,
                MIMETYPE_BPLIST,
                requestBody
            );
            return bplist_1.default.parse.parseBuffer(response);
        });
    }
}
exports.AirPlayAuth = AirPlayAuth;
