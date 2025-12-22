"use strict";
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, "__esModule", { value: true });
const mdns_1 = __importDefault(require("mdns"));
class Discovery {
    constructor(opts) {
        this.browser = mdns_1.default.createBrowser(
            mdns_1.default.tcp("googlecast"),
            {
                resolverSequence: [
                    mdns_1.default.rst.DNSServiceResolve(),
                    "DNSServiceGetAddrInfo" in mdns_1.default.dns_sd
                        ? mdns_1.default.rst.DNSServiceGetAddrInfo()
                        : mdns_1.default.rst.getaddrinfo({ families: [4] }),
                    mdns_1.default.rst.makeAddressesUnique()
                ]
            }
        );
        this.browser.on("serviceUp", service => {
            if (!service.txtRecord || !service.name) return;
            const record = service.txtRecord;
            const device = {
                id: record.id,
                friendlyName: record.fn,
                modelName: record.md,
                capabilities: parseInt(record.ca),
                host: service.addresses[0],
                port: service.port
            };
            opts.onDeviceFound(device);
        });
        this.browser.on("serviceDown", service => {
            if (!service.name) return;
            opts.onDeviceDown(service.name);
        });
    }
    start() {
        this.browser.start();
    }
    stop() {
        this.browser.stop();
    }
}
exports.default = Discovery;
