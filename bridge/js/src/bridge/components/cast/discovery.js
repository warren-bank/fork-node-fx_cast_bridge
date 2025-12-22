"use strict";
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, "__esModule", { value: true });
const mdns_1 = __importDefault(require("../../lib/mdns"));
class Discovery {
    constructor(opts) {
        this.browser = mdns_1.default.createBrowser(
            "googlecast",
            function hasServiceChanged(a, b) {
                const txtFields = ['id', 'fn', 'md', 'ca'];
                for (const key of txtFields) {
                    if (a.txtRecord[key] !== b.txtRecord[key]) {
                        return true;
                    }
                }
                return false;
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
                host: service.address,
                port: service.port
            };
            opts.onDeviceFound(device);
        });
        this.browser.on("serviceDown", service => {
            if (!service.txtRecord || !service.name) return;
            const record = service.txtRecord;
            opts.onDeviceDown(record.id);
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
