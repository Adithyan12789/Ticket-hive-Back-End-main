"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AsyncHandler {
    static handle(fn) {
        return (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    }
}
exports.default = AsyncHandler;
//# sourceMappingURL=asyncHandler.js.map