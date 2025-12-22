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
exports.init = init;
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const bridge = __importStar(require("./bridge"));
const chalk_1 = __importDefault(require("chalk"));
const ws_1 = __importDefault(require("ws"));
const messaging_1 = require("./bridge/messaging");
process.on("SIGTERM", () =>
    __awaiter(void 0, void 0, void 0, function* () {
        process.exit(1);
    })
);
function init(opts) {
    const server = !opts.secure
        ? http_1.default.createServer()
        : https_1.default.createServer({
              key: opts.key,
              cert: opts.cert
          });
    const wss = new ws_1.default.Server({ noServer: true });
    wss.on("connection", socket => {
        bridge.run(new messaging_1.WebsocketMessenger(socket));
    });
    function authenticate(req) {
        if (!opts.password) return true;
        const password = new URL(
            req.url,
            `http://${req.headers.host}`
        ).searchParams.get("password");
        return password === opts.password;
    }
    server.on("upgrade", (req, socket, head) => {
        var _a;
        if (
            ((_a = req.headers.origin) === null || _a === void 0
                ? void 0
                : _a.startsWith("moz-extension://")) &&
            authenticate(req)
        ) {
            wss.handleUpgrade(req, socket, head, ws => {
                wss.emit("connection", ws, req);
            });
            return;
        }
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
    });
    server.on("request", (req, res) => {
        if ("origin" in req.headers) {
            req.destroy();
            return;
        }
        res.writeHead(authenticate(req) ? 200 : 401);
        res.end();
    });
    if (
        opts.host !== "localhost" &&
        opts.host !== "127.0.0.1" &&
        !opts.secure
    ) {
        process.stdout.write(
            chalk_1.default.red(
                "WARNING: A non-local host is set, but secure connections are not enabled!\n"
            )
        );
    }
    process.stdout.write(
        `Starting WebSocket server at ${opts.secure ? "wss" : "ws"}://${opts.host.includes(":") ? `[${opts.host}]` : opts.host}:${opts.port}... `
    );
    server.listen({ port: opts.port, host: opts.host }, () => {
        process.stdout.write("Done!\n");
    });
    server.on("error", err => {
        console.error("Failed!");
        console.error(err.message);
    });
}
