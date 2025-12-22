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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const yargs_1 = __importDefault(require("yargs"));
const config_json_1 = require("../config.json");
const messaging_1 = require("./bridge/messaging");
const argv = (0, yargs_1.default)()
    .scriptName(config_json_1.applicationName)
    .usage("$0 [args]")
    .help()
    .alias("help", "h")
    .version(`v${config_json_1.applicationVersion}`)
    .alias("version", "v")
    .config("config", parseConfig)
    .option("daemon", {
        alias: "d",
        describe: `Launch in daemon mode. This starts a WebSocket server that \
the extension can be configured to connect to under bridge options.`,
        type: "boolean"
    })
    .option("host", {
        alias: "n",
        describe: `Host for daemon WebSocket server. This must match the host \
set in the extension options.`,
        default: "localhost"
    })
    .option("port", {
        alias: "p",
        describe: `Port number for daemon WebSocket server. This must match \
the port set in the extension options.`,
        default: 9556
    })
    .option("password", {
        alias: "P",
        describe: `Set an optional password for the daemon WebSocket server. \
This must match the password set in the extension options.
Note: If using this option it is highly recommended that you enable secure \
connections to avoid leaking plaintext passwords!`,
        type: "string"
    })
    .option("secure", {
        alias: "s",
        describe: `Use a secure HTTPS server for WebSocket connections. \
Requires key/cert file options to be specified.`,
        type: "boolean",
        default: false
    })
    .option("key-file", {
        alias: "k",
        describe: `Path to the private key PEM file to use for the \
HTTPS server.`,
        type: "string"
    })
    .option("cert-file", {
        alias: "c",
        describe: `Path to the certificate PEM file to use for the \
HTTPS server.`,
        type: "string"
    })
    .check(argv => {
        if (argv.port < 1025 || argv.port > 65535) {
            throw new Error("Invalid port specified!");
        }
        if (argv.secure) {
            if (!argv["key-file"] || !argv["cert-file"]) {
                throw new Error("Missing required key/cert files.");
            }
            if (
                !fs_1.default.existsSync(argv["key-file"]) ||
                !fs_1.default.existsSync(argv["cert-file"])
            ) {
                throw new Error("Specified key/cert files do not exist.");
            }
        }
        return true;
    })
    .parseSync(process.argv);
function parseConfig(configPath) {
    let config;
    try {
        config = JSON.parse(
            fs_1.default.readFileSync(configPath, { encoding: "utf-8" })
        );
    } catch (err) {
        throw new Error(`Failed to parse config file!`);
    }
    const configDirName = path_1.default.dirname(configPath);
    if (typeof config["key-file"] === "string") {
        config["key-file"] = path_1.default.resolve(
            configDirName,
            config["key-file"]
        );
    }
    if (typeof config["cert-file"] === "string") {
        config["cert-file"] = path_1.default.resolve(
            configDirName,
            config["cert-file"]
        );
    }
    return config;
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        if (argv.daemon) {
            const daemon = yield Promise.resolve().then(() =>
                __importStar(require("./daemon"))
            );
            const daemonOpts = {
                host: argv.host,
                port: argv.port,
                password: argv.password
            };
            if (argv.secure) {
                daemonOpts.secure = true;
                daemonOpts.key = fs_1.default.readFileSync(argv.keyFile);
                daemonOpts.cert = fs_1.default.readFileSync(argv.certFile);
            }
            daemon.init(daemonOpts);
        } else {
            const bridge = yield Promise.resolve().then(() =>
                __importStar(require("./bridge"))
            );
            bridge.run(new messaging_1.StdioMessenger());
        }
    });
}
main();
