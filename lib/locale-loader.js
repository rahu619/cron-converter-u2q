"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadLocale = void 0;
const index_1 = require("./locales/index");
/**
 * Loads a locale JSON file from disk and registers it under its id (or the
 * optional localeId override). Once registered, the locale can be referenced
 * by id in DescriberOptions.locale.
 *
 * The JSON file must conform to the CronLocaleJSON shape.
 * This function uses fs/promises and is intended for Node.js environments.
 *
 * @param filePath  - Absolute or relative path to the JSON locale file.
 * @param localeId  - Optional id override. Defaults to the id field in the JSON.
 */
function loadLocale(filePath, localeId) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        // Dynamic import keeps 'fs' out of browser bundles when this function is unused.
        const { readFile } = yield Promise.resolve().then(() => __importStar(require('fs/promises')));
        const raw = yield readFile(filePath, 'utf-8');
        const json = JSON.parse(raw);
        const id = localeId !== null && localeId !== void 0 ? localeId : json.id;
        if (!id) {
            throw new Error(`Locale file "${filePath}" must include an "id" field, or pass localeId as the second argument.`);
        }
        const suffix = (_a = json.ordinalSuffix) !== null && _a !== void 0 ? _a : '';
        (0, index_1.registerLocale)({
            id,
            dayNames: json.dayNames,
            monthNames: json.monthNames,
            ordinal: (n) => !Number.isInteger(n) || n <= 0 ? json.tokens.invalidDay : `${n}${suffix}`,
            use24HourTimeFormat: (_b = json.use24HourTimeFormat) !== null && _b !== void 0 ? _b : false,
            timezone: json.timezone,
            tokens: json.tokens,
        });
    });
}
exports.loadLocale = loadLocale;
