"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/core/patch.ts
function validatePatches(source, patches) {
  if (!patches.length) throw new PatchError("empty", "\u4E8B\u52A1\u4E0D\u5305\u542B\u4EFB\u4F55\u8865\u4E01");
  let lastEnd = -1;
  let prevRisky = false;
  for (const p of [...patches].sort((a, b) => a.start - b.start)) {
    if (!Number.isInteger(p.start) || !Number.isInteger(p.end) || p.start < 0 || p.end < p.start || p.end > source.length)
      throw new PatchError("invalid-range", `\u975E\u6CD5\u533A\u95F4 [${p.start},${p.end})\uFF0C\u5F53\u524D\u957F\u5EA6 ${source.length}`);
    if (p.start < lastEnd) throw new PatchError("overlap", `\u8865\u4E01\u533A\u95F4\u91CD\u53E0\uFF1A${p.start} < ${lastEnd}`);
    if (source.slice(p.start, p.end) !== p.expected)
      throw new PatchError("expected-mismatch", `\u533A\u95F4 [${p.start},${p.end}) \u5185\u5BB9\u5DF2\u53D8\u5316\uFF0C\u62D2\u7EDD\u5E94\u7528`);
    const risky = p.start === p.end || p.replacement.length !== p.expected.length;
    if (p.start === lastEnd && (risky || prevRisky))
      throw new PatchError("overlap", `\u96F6\u957F\u5EA6\u6216\u53D8\u957F\u533A\u95F4\u4E0D\u5F97\u4E0E\u76F8\u90BB\u533A\u95F4\u5171\u4EAB\u8FB9\u754C ${p.start}\uFF0C\u8BF7\u5408\u5E76\u4E3A\u5355\u4E2A\u8865\u4E01`);
    lastEnd = Math.max(lastEnd, p.end);
    prevRisky = risky;
  }
}
function applyPatches(source, patches) {
  validatePatches(source, patches);
  let out = source;
  for (const p of [...patches].sort((a, b) => b.start - a.start)) {
    if (out.slice(p.start, p.end) !== p.expected)
      throw new PatchError("expected-mismatch", `\u5E94\u7528\u65F6\u533A\u95F4 [${p.start},${p.end}) \u5185\u5BB9\u5DF2\u53D8\u5316\uFF0C\u62D2\u7EDD\u5E94\u7528`);
    out = out.slice(0, p.start) + p.replacement + out.slice(p.end);
  }
  return out;
}
function computeInverse(patches) {
  const sorted = [...patches].sort((a, b) => a.start - b.start);
  let delta = 0;
  return sorted.map((p) => {
    const inv = { start: p.start + delta, end: p.start + delta + p.replacement.length, expected: p.replacement, replacement: p.expected };
    delta += p.replacement.length - p.expected.length;
    return inv;
  });
}
var PatchError;
var init_patch = __esm({
  "src/core/patch.ts"() {
    "use strict";
    PatchError = class extends Error {
      constructor(code, message) {
        super(message);
        this.code = code;
        this.name = "PatchError";
      }
    };
  }
});

// src/settings/schema.ts
function bool(input, key, fallback, warnings) {
  const v = input[key];
  if (typeof v === "boolean") return v;
  if (v !== void 0) warnings.push(`${key}: \u975E\u5E03\u5C14\u503C\uFF0C\u5DF2\u56DE\u9000\u9ED8\u8BA4 ${fallback}`);
  return fallback;
}
function num(input, key, fallback, min, max, warnings, int = true) {
  const v = input[key];
  if (typeof v === "number" && Number.isFinite(v)) {
    let out = v;
    if (int) out = Math.round(out);
    if (out < min || out > max) {
      out = Math.min(max, Math.max(min, out));
      warnings.push(`${key}: ${v} \u8D85\u51FA [${min},${max}]\uFF0C\u5DF2\u6536\u655B\u4E3A ${out}`);
    }
    return out;
  }
  if (v !== void 0) warnings.push(`${key}: \u975E\u6570\u5B57\uFF0C\u5DF2\u56DE\u9000\u9ED8\u8BA4 ${fallback}`);
  return fallback;
}
function enumer(input, key, allowed, fallback, warnings) {
  const v = input[key];
  if (typeof v === "string" && allowed.includes(v)) return v;
  if (v !== void 0) {
    const shown = typeof v === "string" || typeof v === "number" || typeof v === "boolean" ? String(v) : "\u590D\u6742\u503C";
    warnings.push(`${key}: "${shown}" \u4E0D\u5728 [${allowed.join("/")}]\uFF0C\u5DF2\u56DE\u9000 ${fallback}`);
  }
  return fallback;
}
function widthHeight(input, key, fallback, min, max, warnings) {
  const v = input[key];
  if (v === "auto") return "auto";
  if (typeof v === "number" && Number.isFinite(v)) {
    const out = Math.round(Math.min(max, Math.max(min, v)));
    if (out !== v) warnings.push(`${key}: ${v} \u8D85\u51FA [${min},${max}]\uFF0C\u5DF2\u6536\u655B\u4E3A ${out}`);
    return out;
  }
  if (v !== void 0) warnings.push(`${key}: \u975E\u6CD5\u89C6\u53E3\u503C\uFF0C\u5DF2\u56DE\u9000\u9ED8\u8BA4`);
  return fallback;
}
function normalizeSettings(input) {
  const warnings = [];
  const retainedUnknown = {};
  const src = isObj(input) ? input : {};
  for (const k of Object.keys(src)) {
    if (UNSAFE_KEYS.has(k)) {
      warnings.push(`${k}: \u4E0D\u5B89\u5168\u7684\u672A\u77E5\u5B57\u6BB5\u540D,\u5DF2\u5FFD\u7565`);
      continue;
    }
    if (!Object.prototype.hasOwnProperty.call(DEFAULT_SETTINGS, k)) retainedUnknown[k] = src[k];
  }
  const sidebar = isObj(src.sidebar) ? src.sidebar : {};
  const links = isObj(src.links) ? src.links : {};
  const editor = isObj(src.editor) ? src.editor : {};
  const search = isObj(src.search) ? src.search : {};
  const preview = isObj(src.preview) ? src.preview : {};
  const draftsIn = isObj(src.drafts) ? src.drafts : {};
  const saveAs = isObj(src.saveAs) ? src.saveAs : {};
  const embeds = isObj(src.embeds) ? src.embeds : {};
  const source = isObj(src.source) ? src.source : {};
  const ui = isObj(src.ui) ? src.ui : {};
  for (const [g, obj] of Object.entries({ sidebar, links, editor, search, preview, drafts: draftsIn, saveAs, embeds, source, ui }))
    for (const k of Object.keys(obj)) {
      const key = `${g}.${k}`;
      if (UNSAFE_KEYS.has(k)) {
        warnings.push(`${key}: \u4E0D\u5B89\u5168\u7684\u672A\u77E5\u5B57\u6BB5\u540D,\u5DF2\u5FFD\u7565`);
        continue;
      }
      if (Object.prototype.hasOwnProperty.call(DEFAULT_SETTINGS[g], k)) continue;
      if (key in retainedUnknown) {
        warnings.push(`${key}: \u672A\u77E5\u5B57\u6BB5\u952E\u51B2\u7A81,\u4FDD\u7559\u9996\u4E2A\u503C`);
        continue;
      }
      retainedUnknown[key] = obj[k];
    }
  let debounceMs = num(draftsIn, "debounceMs", DEFAULT_SETTINGS.drafts.debounceMs, DRAFTS_BOUNDS.debounceMs[0], DRAFTS_BOUNDS.debounceMs[1], warnings);
  let maxWaitMs = num(draftsIn, "maxWaitMs", DEFAULT_SETTINGS.drafts.maxWaitMs, DRAFTS_BOUNDS.maxWaitMs[0], DRAFTS_BOUNDS.maxWaitMs[1], warnings);
  if (maxWaitMs < debounceMs) {
    maxWaitMs = debounceMs;
    warnings.push(`drafts.maxWaitMs: \u4E0D\u5C0F\u4E8E debounceMs\uFF0C\u5DF2\u8C03\u6574\u4E3A ${maxWaitMs}`);
  }
  const draftsEnabled = bool(draftsIn, "enabled", true, warnings);
  let closeBehavior = enumer(draftsIn, "closeBehavior", ENUM_VALUES["drafts.closeBehavior"], DEFAULT_SETTINGS.drafts.closeBehavior, warnings);
  if (!draftsEnabled && closeBehavior === "keep") {
    closeBehavior = "ask";
    warnings.push("drafts.closeBehavior: \u5907\u4EFD\u5173\u95ED\u65F6\u5F3A\u5236\u4E3A ask");
  }
  return {
    warnings,
    retainedUnknown,
    settings: {
      sidebar: {
        autoShowHtml: bool(sidebar, "autoShowHtml", true, warnings),
        closeOnLeave: bool(sidebar, "closeOnLeave", true, warnings),
        markdownTarget: enumer(sidebar, "markdownTarget", ENUM_VALUES["sidebar.markdownTarget"], "outline", warnings),
        otherTarget: enumer(sidebar, "otherTarget", ENUM_VALUES["sidebar.otherTarget"], "previous", warnings),
        respectManualCollapse: bool(sidebar, "respectManualCollapse", true, warnings),
        defaultTab: enumer(sidebar, "defaultTab", ENUM_VALUES["sidebar.defaultTab"], "edit", warnings)
      },
      links: {
        externalTarget: enumer(links, "externalTarget", ENUM_VALUES["links.externalTarget"], "browser", warnings),
        internalTarget: enumer(links, "internalTarget", ENUM_VALUES["links.internalTarget"], "current", warnings),
        respectBlankTarget: bool(links, "respectBlankTarget", true, warnings),
        browserGesture: enumer(links, "browserGesture", ENUM_VALUES["links.browserGesture"], "Mod", warnings),
        showHoverTarget: bool(links, "showHoverTarget", true, warnings),
        browserApplication: (() => {
          const v = links.browserApplication;
          if (typeof v === "string" && v) return v;
          if (v !== void 0) warnings.push("links.browserApplication: \u975E\u6CD5\u503C,\u5DF2\u56DE\u9000 auto");
          return "auto";
        })(),
        unsavedBrowserAction: enumer(links, "unsavedBrowserAction", ENUM_VALUES["links.unsavedBrowserAction"], "ask", warnings)
      },
      editor: {
        defaultMode: enumer(editor, "defaultMode", ENUM_VALUES["editor.defaultMode"], "preview", warnings),
        defaultTextMode: enumer(editor, "defaultTextMode", ENUM_VALUES["editor.defaultTextMode"], "segment", warnings),
        historyLimit: num(editor, "historyLimit", 200, HISTORY_LIMITS_BOUNDS.historyLimit[0], HISTORY_LIMITS_BOUNDS.historyLimit[1], warnings),
        mergeDelayMs: num(editor, "mergeDelayMs", 800, HISTORY_LIMITS_BOUNDS.mergeDelayMs[0], HISTORY_LIMITS_BOUNDS.mergeDelayMs[1], warnings),
        showChangeHighlights: bool(editor, "showChangeHighlights", true, warnings),
        restoreFocusAfterSave: bool(editor, "restoreFocusAfterSave", true, warnings),
        toolbarPlacement: enumer(editor, "toolbarPlacement", ENUM_VALUES["editor.toolbarPlacement"], "sidebar", warnings)
      },
      search: { includeHidden: bool(search, "includeHidden", false, warnings) },
      preview: {
        defaultWidth: widthHeight(preview, "defaultWidth", "auto", 240, 3840, warnings),
        defaultZoom: num(preview, "defaultZoom", 100, 25, 200, warnings),
        rememberViewport: bool(preview, "rememberViewport", true, warnings),
        rememberPosition: bool(preview, "rememberPosition", true, warnings),
        positionLimit: num(preview, "positionLimit", 200, PREVIEW_BOUNDS.positionLimit[0], PREVIEW_BOUNDS.positionLimit[1], warnings),
        autoRefreshAssets: bool(preview, "autoRefreshAssets", true, warnings),
        allowNetworkAssets: bool(preview, "allowNetworkAssets", true, warnings)
      },
      drafts: {
        enabled: draftsEnabled,
        debounceMs,
        maxWaitMs,
        storageWarningMiB: num(draftsIn, "storageWarningMiB", 50, DRAFTS_BOUNDS.storageWarningMiB[0], DRAFTS_BOUNDS.storageWarningMiB[1], warnings),
        closeBehavior
      },
      saveAs: {
        rebaseRelativeUrls: bool(saveAs, "rebaseRelativeUrls", true, warnings),
        openCopy: bool(saveAs, "openCopy", true, warnings)
      },
      embeds: {
        enabled: bool(embeds, "enabled", true, warnings),
        defaultHeight: num(embeds, "defaultHeight", 480, EMBEDS_BOUNDS.defaultHeight[0], EMBEDS_BOUNDS.defaultHeight[1], warnings),
        autoHeightMax: num(embeds, "autoHeightMax", 1200, EMBEDS_BOUNDS.autoHeightMax[0], EMBEDS_BOUNDS.autoHeightMax[1], warnings),
        showToolbar: bool(embeds, "showToolbar", true, warnings),
        showDrafts: bool(embeds, "showDrafts", false, warnings)
      },
      source: {
        lineNumbers: bool(source, "lineNumbers", true, warnings),
        lineWrapping: bool(source, "lineWrapping", true, warnings),
        previewDelayMs: num(source, "previewDelayMs", 400, SOURCE_BOUNDS.previewDelayMs[0], SOURCE_BOUNDS.previewDelayMs[1], warnings)
      },
      ui: { language: enumer(ui, "language", ENUM_VALUES["ui.language"], "auto", warnings) }
    }
  };
}
var DEFAULT_SETTINGS, ENUM_VALUES, HISTORY_LIMITS_BOUNDS, DRAFTS_BOUNDS, PREVIEW_BOUNDS, EMBEDS_BOUNDS, SOURCE_BOUNDS, isObj, UNSAFE_KEYS;
var init_schema = __esm({
  "src/settings/schema.ts"() {
    "use strict";
    DEFAULT_SETTINGS = {
      sidebar: { autoShowHtml: true, closeOnLeave: true, markdownTarget: "outline", otherTarget: "previous", respectManualCollapse: true, defaultTab: "edit" },
      links: { externalTarget: "browser", internalTarget: "current", respectBlankTarget: true, browserGesture: "Mod", showHoverTarget: true, browserApplication: "auto", unsavedBrowserAction: "ask" },
      editor: { defaultMode: "preview", defaultTextMode: "segment", historyLimit: 200, mergeDelayMs: 800, showChangeHighlights: true, restoreFocusAfterSave: true, toolbarPlacement: "sidebar" },
      search: { includeHidden: false },
      preview: { defaultWidth: "auto", defaultZoom: 100, rememberViewport: true, rememberPosition: true, positionLimit: 200, autoRefreshAssets: true, allowNetworkAssets: true },
      drafts: { enabled: true, debounceMs: 750, maxWaitMs: 3e3, storageWarningMiB: 50, closeBehavior: "keep" },
      saveAs: { rebaseRelativeUrls: true, openCopy: true },
      embeds: { enabled: true, defaultHeight: 480, autoHeightMax: 1200, showToolbar: true, showDrafts: false },
      source: { lineNumbers: true, lineWrapping: true, previewDelayMs: 400 },
      ui: { language: "auto" }
    };
    ENUM_VALUES = {
      "sidebar.markdownTarget": ["outline", "previous", "none"],
      "sidebar.otherTarget": ["previous", "none"],
      "sidebar.defaultTab": ["edit", "outline", "changes", "resources"],
      "links.externalTarget": ["browser", "web-viewer"],
      "links.internalTarget": ["current", "new-tab"],
      "links.browserGesture": ["Mod", "Alt", "Mod+Shift", "off"],
      "links.unsavedBrowserAction": ["ask", "saved"],
      "editor.defaultMode": ["preview", "edit", "source", "split"],
      "editor.defaultTextMode": ["segment", "paragraph"],
      "editor.toolbarPlacement": ["sidebar", "view"],
      "drafts.closeBehavior": ["keep", "ask"],
      "ui.language": ["auto", "zh-CN", "en"]
    };
    HISTORY_LIMITS_BOUNDS = { historyLimit: [50, 1e3], mergeDelayMs: [300, 2e3] };
    DRAFTS_BOUNDS = { debounceMs: [250, 5e3], maxWaitMs: [250, 1e4], storageWarningMiB: [10, 500] };
    PREVIEW_BOUNDS = { positionLimit: [20, 2e3] };
    EMBEDS_BOUNDS = { defaultHeight: [160, 1600], autoHeightMax: [100, 1e4] };
    SOURCE_BOUNDS = { previewDelayMs: [150, 2e3] };
    isObj = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
    UNSAFE_KEYS = /* @__PURE__ */ new Set(["__proto__", "constructor", "prototype"]);
  }
});

// node_modules/parse5/dist/common/unicode.js
function isSurrogate(cp) {
  return cp >= 55296 && cp <= 57343;
}
function isSurrogatePair(cp) {
  return cp >= 56320 && cp <= 57343;
}
function getSurrogatePairCodePoint(cp1, cp2) {
  return (cp1 - 55296) * 1024 + 9216 + cp2;
}
function isControlCodePoint(cp) {
  return cp !== 32 && cp !== 10 && cp !== 13 && cp !== 9 && cp !== 12 && cp >= 1 && cp <= 31 || cp >= 127 && cp <= 159;
}
function isUndefinedCodePoint(cp) {
  return cp >= 64976 && cp <= 65007 || UNDEFINED_CODE_POINTS.has(cp);
}
var UNDEFINED_CODE_POINTS, REPLACEMENT_CHARACTER, CODE_POINTS, SEQUENCES;
var init_unicode = __esm({
  "node_modules/parse5/dist/common/unicode.js"() {
    UNDEFINED_CODE_POINTS = /* @__PURE__ */ new Set([
      65534,
      65535,
      131070,
      131071,
      196606,
      196607,
      262142,
      262143,
      327678,
      327679,
      393214,
      393215,
      458750,
      458751,
      524286,
      524287,
      589822,
      589823,
      655358,
      655359,
      720894,
      720895,
      786430,
      786431,
      851966,
      851967,
      917502,
      917503,
      983038,
      983039,
      1048574,
      1048575,
      1114110,
      1114111
    ]);
    REPLACEMENT_CHARACTER = "\uFFFD";
    (function(CODE_POINTS2) {
      CODE_POINTS2[CODE_POINTS2["EOF"] = -1] = "EOF";
      CODE_POINTS2[CODE_POINTS2["NULL"] = 0] = "NULL";
      CODE_POINTS2[CODE_POINTS2["TABULATION"] = 9] = "TABULATION";
      CODE_POINTS2[CODE_POINTS2["CARRIAGE_RETURN"] = 13] = "CARRIAGE_RETURN";
      CODE_POINTS2[CODE_POINTS2["LINE_FEED"] = 10] = "LINE_FEED";
      CODE_POINTS2[CODE_POINTS2["FORM_FEED"] = 12] = "FORM_FEED";
      CODE_POINTS2[CODE_POINTS2["SPACE"] = 32] = "SPACE";
      CODE_POINTS2[CODE_POINTS2["EXCLAMATION_MARK"] = 33] = "EXCLAMATION_MARK";
      CODE_POINTS2[CODE_POINTS2["QUOTATION_MARK"] = 34] = "QUOTATION_MARK";
      CODE_POINTS2[CODE_POINTS2["AMPERSAND"] = 38] = "AMPERSAND";
      CODE_POINTS2[CODE_POINTS2["APOSTROPHE"] = 39] = "APOSTROPHE";
      CODE_POINTS2[CODE_POINTS2["HYPHEN_MINUS"] = 45] = "HYPHEN_MINUS";
      CODE_POINTS2[CODE_POINTS2["SOLIDUS"] = 47] = "SOLIDUS";
      CODE_POINTS2[CODE_POINTS2["DIGIT_0"] = 48] = "DIGIT_0";
      CODE_POINTS2[CODE_POINTS2["DIGIT_9"] = 57] = "DIGIT_9";
      CODE_POINTS2[CODE_POINTS2["SEMICOLON"] = 59] = "SEMICOLON";
      CODE_POINTS2[CODE_POINTS2["LESS_THAN_SIGN"] = 60] = "LESS_THAN_SIGN";
      CODE_POINTS2[CODE_POINTS2["EQUALS_SIGN"] = 61] = "EQUALS_SIGN";
      CODE_POINTS2[CODE_POINTS2["GREATER_THAN_SIGN"] = 62] = "GREATER_THAN_SIGN";
      CODE_POINTS2[CODE_POINTS2["QUESTION_MARK"] = 63] = "QUESTION_MARK";
      CODE_POINTS2[CODE_POINTS2["LATIN_CAPITAL_A"] = 65] = "LATIN_CAPITAL_A";
      CODE_POINTS2[CODE_POINTS2["LATIN_CAPITAL_Z"] = 90] = "LATIN_CAPITAL_Z";
      CODE_POINTS2[CODE_POINTS2["RIGHT_SQUARE_BRACKET"] = 93] = "RIGHT_SQUARE_BRACKET";
      CODE_POINTS2[CODE_POINTS2["GRAVE_ACCENT"] = 96] = "GRAVE_ACCENT";
      CODE_POINTS2[CODE_POINTS2["LATIN_SMALL_A"] = 97] = "LATIN_SMALL_A";
      CODE_POINTS2[CODE_POINTS2["LATIN_SMALL_Z"] = 122] = "LATIN_SMALL_Z";
    })(CODE_POINTS || (CODE_POINTS = {}));
    SEQUENCES = {
      DASH_DASH: "--",
      CDATA_START: "[CDATA[",
      DOCTYPE: "doctype",
      SCRIPT: "script",
      PUBLIC: "public",
      SYSTEM: "system"
    };
  }
});

// node_modules/parse5/dist/common/error-codes.js
var ERR;
var init_error_codes = __esm({
  "node_modules/parse5/dist/common/error-codes.js"() {
    (function(ERR2) {
      ERR2["controlCharacterInInputStream"] = "control-character-in-input-stream";
      ERR2["noncharacterInInputStream"] = "noncharacter-in-input-stream";
      ERR2["surrogateInInputStream"] = "surrogate-in-input-stream";
      ERR2["nonVoidHtmlElementStartTagWithTrailingSolidus"] = "non-void-html-element-start-tag-with-trailing-solidus";
      ERR2["endTagWithAttributes"] = "end-tag-with-attributes";
      ERR2["endTagWithTrailingSolidus"] = "end-tag-with-trailing-solidus";
      ERR2["unexpectedSolidusInTag"] = "unexpected-solidus-in-tag";
      ERR2["unexpectedNullCharacter"] = "unexpected-null-character";
      ERR2["unexpectedQuestionMarkInsteadOfTagName"] = "unexpected-question-mark-instead-of-tag-name";
      ERR2["invalidFirstCharacterOfTagName"] = "invalid-first-character-of-tag-name";
      ERR2["unexpectedEqualsSignBeforeAttributeName"] = "unexpected-equals-sign-before-attribute-name";
      ERR2["missingEndTagName"] = "missing-end-tag-name";
      ERR2["unexpectedCharacterInAttributeName"] = "unexpected-character-in-attribute-name";
      ERR2["unknownNamedCharacterReference"] = "unknown-named-character-reference";
      ERR2["missingSemicolonAfterCharacterReference"] = "missing-semicolon-after-character-reference";
      ERR2["unexpectedCharacterAfterDoctypeSystemIdentifier"] = "unexpected-character-after-doctype-system-identifier";
      ERR2["unexpectedCharacterInUnquotedAttributeValue"] = "unexpected-character-in-unquoted-attribute-value";
      ERR2["eofBeforeTagName"] = "eof-before-tag-name";
      ERR2["eofInTag"] = "eof-in-tag";
      ERR2["missingAttributeValue"] = "missing-attribute-value";
      ERR2["missingWhitespaceBetweenAttributes"] = "missing-whitespace-between-attributes";
      ERR2["missingWhitespaceAfterDoctypePublicKeyword"] = "missing-whitespace-after-doctype-public-keyword";
      ERR2["missingWhitespaceBetweenDoctypePublicAndSystemIdentifiers"] = "missing-whitespace-between-doctype-public-and-system-identifiers";
      ERR2["missingWhitespaceAfterDoctypeSystemKeyword"] = "missing-whitespace-after-doctype-system-keyword";
      ERR2["missingQuoteBeforeDoctypePublicIdentifier"] = "missing-quote-before-doctype-public-identifier";
      ERR2["missingQuoteBeforeDoctypeSystemIdentifier"] = "missing-quote-before-doctype-system-identifier";
      ERR2["missingDoctypePublicIdentifier"] = "missing-doctype-public-identifier";
      ERR2["missingDoctypeSystemIdentifier"] = "missing-doctype-system-identifier";
      ERR2["abruptDoctypePublicIdentifier"] = "abrupt-doctype-public-identifier";
      ERR2["abruptDoctypeSystemIdentifier"] = "abrupt-doctype-system-identifier";
      ERR2["cdataInHtmlContent"] = "cdata-in-html-content";
      ERR2["incorrectlyOpenedComment"] = "incorrectly-opened-comment";
      ERR2["eofInScriptHtmlCommentLikeText"] = "eof-in-script-html-comment-like-text";
      ERR2["eofInDoctype"] = "eof-in-doctype";
      ERR2["nestedComment"] = "nested-comment";
      ERR2["abruptClosingOfEmptyComment"] = "abrupt-closing-of-empty-comment";
      ERR2["eofInComment"] = "eof-in-comment";
      ERR2["incorrectlyClosedComment"] = "incorrectly-closed-comment";
      ERR2["eofInCdata"] = "eof-in-cdata";
      ERR2["absenceOfDigitsInNumericCharacterReference"] = "absence-of-digits-in-numeric-character-reference";
      ERR2["nullCharacterReference"] = "null-character-reference";
      ERR2["surrogateCharacterReference"] = "surrogate-character-reference";
      ERR2["characterReferenceOutsideUnicodeRange"] = "character-reference-outside-unicode-range";
      ERR2["controlCharacterReference"] = "control-character-reference";
      ERR2["noncharacterCharacterReference"] = "noncharacter-character-reference";
      ERR2["missingWhitespaceBeforeDoctypeName"] = "missing-whitespace-before-doctype-name";
      ERR2["missingDoctypeName"] = "missing-doctype-name";
      ERR2["invalidCharacterSequenceAfterDoctypeName"] = "invalid-character-sequence-after-doctype-name";
      ERR2["duplicateAttribute"] = "duplicate-attribute";
      ERR2["nonConformingDoctype"] = "non-conforming-doctype";
      ERR2["missingDoctype"] = "missing-doctype";
      ERR2["misplacedDoctype"] = "misplaced-doctype";
      ERR2["endTagWithoutMatchingOpenElement"] = "end-tag-without-matching-open-element";
      ERR2["closingOfElementWithOpenChildElements"] = "closing-of-element-with-open-child-elements";
      ERR2["disallowedContentInNoscriptInHead"] = "disallowed-content-in-noscript-in-head";
      ERR2["openElementsLeftAfterEof"] = "open-elements-left-after-eof";
      ERR2["abandonedHeadElementChild"] = "abandoned-head-element-child";
      ERR2["misplacedStartTagForHeadElement"] = "misplaced-start-tag-for-head-element";
      ERR2["nestedNoscriptInHead"] = "nested-noscript-in-head";
      ERR2["eofInElementThatCanContainOnlyText"] = "eof-in-element-that-can-contain-only-text";
    })(ERR || (ERR = {}));
  }
});

// node_modules/parse5/dist/tokenizer/preprocessor.js
var DEFAULT_BUFFER_WATERLINE, Preprocessor;
var init_preprocessor = __esm({
  "node_modules/parse5/dist/tokenizer/preprocessor.js"() {
    init_unicode();
    init_error_codes();
    DEFAULT_BUFFER_WATERLINE = 1 << 16;
    Preprocessor = class {
      constructor(handler) {
        this.handler = handler;
        this.html = "";
        this.pos = -1;
        this.lastGapPos = -2;
        this.gapStack = [];
        this.skipNextNewLine = false;
        this.lastChunkWritten = false;
        this.endOfChunkHit = false;
        this.bufferWaterline = DEFAULT_BUFFER_WATERLINE;
        this.isEol = false;
        this.lineStartPos = 0;
        this.droppedBufferSize = 0;
        this.line = 1;
        this.lastErrOffset = -1;
      }
      /** The column on the current line. If we just saw a gap (eg. a surrogate pair), return the index before. */
      get col() {
        return this.pos - this.lineStartPos + Number(this.lastGapPos !== this.pos);
      }
      get offset() {
        return this.droppedBufferSize + this.pos;
      }
      getError(code, cpOffset) {
        const { line, col, offset } = this;
        const startCol = col + cpOffset;
        const startOffset = offset + cpOffset;
        return {
          code,
          startLine: line,
          endLine: line,
          startCol,
          endCol: startCol,
          startOffset,
          endOffset: startOffset
        };
      }
      _err(code) {
        if (this.handler.onParseError && this.lastErrOffset !== this.offset) {
          this.lastErrOffset = this.offset;
          this.handler.onParseError(this.getError(code, 0));
        }
      }
      _addGap() {
        this.gapStack.push(this.lastGapPos);
        this.lastGapPos = this.pos;
      }
      _processSurrogate(cp) {
        if (this.pos !== this.html.length - 1) {
          const nextCp = this.html.charCodeAt(this.pos + 1);
          if (isSurrogatePair(nextCp)) {
            this.pos++;
            this._addGap();
            return getSurrogatePairCodePoint(cp, nextCp);
          }
        } else if (!this.lastChunkWritten) {
          this.endOfChunkHit = true;
          return CODE_POINTS.EOF;
        }
        this._err(ERR.surrogateInInputStream);
        return cp;
      }
      willDropParsedChunk() {
        return this.pos > this.bufferWaterline;
      }
      dropParsedChunk() {
        if (this.willDropParsedChunk()) {
          this.html = this.html.substring(this.pos);
          this.lineStartPos -= this.pos;
          this.droppedBufferSize += this.pos;
          this.pos = 0;
          this.lastGapPos = -2;
          this.gapStack.length = 0;
        }
      }
      write(chunk, isLastChunk) {
        if (this.html.length > 0) {
          this.html += chunk;
        } else {
          this.html = chunk;
        }
        this.endOfChunkHit = false;
        this.lastChunkWritten = isLastChunk;
      }
      insertHtmlAtCurrentPos(chunk) {
        this.html = this.html.substring(0, this.pos + 1) + chunk + this.html.substring(this.pos + 1);
        this.endOfChunkHit = false;
      }
      startsWith(pattern, caseSensitive) {
        if (this.pos + pattern.length > this.html.length) {
          this.endOfChunkHit = !this.lastChunkWritten;
          return false;
        }
        if (caseSensitive) {
          return this.html.startsWith(pattern, this.pos);
        }
        for (let i = 0; i < pattern.length; i++) {
          const cp = this.html.charCodeAt(this.pos + i) | 32;
          if (cp !== pattern.charCodeAt(i)) {
            return false;
          }
        }
        return true;
      }
      peek(offset) {
        const pos = this.pos + offset;
        if (pos >= this.html.length) {
          this.endOfChunkHit = !this.lastChunkWritten;
          return CODE_POINTS.EOF;
        }
        const code = this.html.charCodeAt(pos);
        return code === CODE_POINTS.CARRIAGE_RETURN ? CODE_POINTS.LINE_FEED : code;
      }
      advance() {
        this.pos++;
        if (this.isEol) {
          this.isEol = false;
          this.line++;
          this.lineStartPos = this.pos;
        }
        if (this.pos >= this.html.length) {
          this.endOfChunkHit = !this.lastChunkWritten;
          return CODE_POINTS.EOF;
        }
        let cp = this.html.charCodeAt(this.pos);
        if (cp === CODE_POINTS.CARRIAGE_RETURN) {
          this.isEol = true;
          this.skipNextNewLine = true;
          return CODE_POINTS.LINE_FEED;
        }
        if (cp === CODE_POINTS.LINE_FEED) {
          this.isEol = true;
          if (this.skipNextNewLine) {
            this.line--;
            this.skipNextNewLine = false;
            this._addGap();
            return this.advance();
          }
        }
        this.skipNextNewLine = false;
        if (isSurrogate(cp)) {
          cp = this._processSurrogate(cp);
        }
        const isCommonValidRange = this.handler.onParseError === null || cp > 31 && cp < 127 || cp === CODE_POINTS.LINE_FEED || cp === CODE_POINTS.CARRIAGE_RETURN || cp > 159 && cp < 64976;
        if (!isCommonValidRange) {
          this._checkForProblematicCharacters(cp);
        }
        return cp;
      }
      _checkForProblematicCharacters(cp) {
        if (isControlCodePoint(cp)) {
          this._err(ERR.controlCharacterInInputStream);
        } else if (isUndefinedCodePoint(cp)) {
          this._err(ERR.noncharacterInInputStream);
        }
      }
      retreat(count) {
        this.pos -= count;
        while (this.pos < this.lastGapPos) {
          this.lastGapPos = this.gapStack.pop();
          this.pos--;
        }
        this.isEol = false;
      }
    };
  }
});

// node_modules/parse5/dist/common/token.js
function getTokenAttr(token, attrName) {
  for (let i = token.attrs.length - 1; i >= 0; i--) {
    if (token.attrs[i].name === attrName) {
      return token.attrs[i].value;
    }
  }
  return null;
}
var TokenType;
var init_token = __esm({
  "node_modules/parse5/dist/common/token.js"() {
    (function(TokenType2) {
      TokenType2[TokenType2["CHARACTER"] = 0] = "CHARACTER";
      TokenType2[TokenType2["NULL_CHARACTER"] = 1] = "NULL_CHARACTER";
      TokenType2[TokenType2["WHITESPACE_CHARACTER"] = 2] = "WHITESPACE_CHARACTER";
      TokenType2[TokenType2["START_TAG"] = 3] = "START_TAG";
      TokenType2[TokenType2["END_TAG"] = 4] = "END_TAG";
      TokenType2[TokenType2["COMMENT"] = 5] = "COMMENT";
      TokenType2[TokenType2["DOCTYPE"] = 6] = "DOCTYPE";
      TokenType2[TokenType2["EOF"] = 7] = "EOF";
      TokenType2[TokenType2["HIBERNATION"] = 8] = "HIBERNATION";
    })(TokenType || (TokenType = {}));
  }
});

// node_modules/entities/dist/esm/generated/decode-data-html.js
var htmlDecodeTree;
var init_decode_data_html = __esm({
  "node_modules/entities/dist/esm/generated/decode-data-html.js"() {
    htmlDecodeTree = /* @__PURE__ */ new Uint16Array(
      // prettier-ignore
      /* @__PURE__ */ '\u1D41<\xD5\u0131\u028A\u049D\u057B\u05D0\u0675\u06DE\u07A2\u07D6\u080F\u0A4A\u0A91\u0DA1\u0E6D\u0F09\u0F26\u10CA\u1228\u12E1\u1415\u149D\u14C3\u14DF\u1525\0\0\0\0\0\0\u156B\u16CD\u198D\u1C12\u1DDD\u1F7E\u2060\u21B0\u228D\u23C0\u23FB\u2442\u2824\u2912\u2D08\u2E48\u2FCE\u3016\u32BA\u3639\u37AC\u38FE\u3A28\u3A71\u3AE0\u3B2E\u0800EMabcfglmnoprstu\\bfms\x7F\x84\x8B\x90\x95\x98\xA6\xB3\xB9\xC8\xCFlig\u803B\xC6\u40C6P\u803B&\u4026cute\u803B\xC1\u40C1reve;\u4102\u0100iyx}rc\u803B\xC2\u40C2;\u4410r;\uC000\u{1D504}rave\u803B\xC0\u40C0pha;\u4391acr;\u4100d;\u6A53\u0100gp\x9D\xA1on;\u4104f;\uC000\u{1D538}plyFunction;\u6061ing\u803B\xC5\u40C5\u0100cs\xBE\xC3r;\uC000\u{1D49C}ign;\u6254ilde\u803B\xC3\u40C3ml\u803B\xC4\u40C4\u0400aceforsu\xE5\xFB\xFE\u0117\u011C\u0122\u0127\u012A\u0100cr\xEA\xF2kslash;\u6216\u0176\xF6\xF8;\u6AE7ed;\u6306y;\u4411\u0180crt\u0105\u010B\u0114ause;\u6235noullis;\u612Ca;\u4392r;\uC000\u{1D505}pf;\uC000\u{1D539}eve;\u42D8c\xF2\u0113mpeq;\u624E\u0700HOacdefhilorsu\u014D\u0151\u0156\u0180\u019E\u01A2\u01B5\u01B7\u01BA\u01DC\u0215\u0273\u0278\u027Ecy;\u4427PY\u803B\xA9\u40A9\u0180cpy\u015D\u0162\u017Aute;\u4106\u0100;i\u0167\u0168\u62D2talDifferentialD;\u6145leys;\u612D\u0200aeio\u0189\u018E\u0194\u0198ron;\u410Cdil\u803B\xC7\u40C7rc;\u4108nint;\u6230ot;\u410A\u0100dn\u01A7\u01ADilla;\u40B8terDot;\u40B7\xF2\u017Fi;\u43A7rcle\u0200DMPT\u01C7\u01CB\u01D1\u01D6ot;\u6299inus;\u6296lus;\u6295imes;\u6297o\u0100cs\u01E2\u01F8kwiseContourIntegral;\u6232eCurly\u0100DQ\u0203\u020FoubleQuote;\u601Duote;\u6019\u0200lnpu\u021E\u0228\u0247\u0255on\u0100;e\u0225\u0226\u6237;\u6A74\u0180git\u022F\u0236\u023Aruent;\u6261nt;\u622FourIntegral;\u622E\u0100fr\u024C\u024E;\u6102oduct;\u6210nterClockwiseContourIntegral;\u6233oss;\u6A2Fcr;\uC000\u{1D49E}p\u0100;C\u0284\u0285\u62D3ap;\u624D\u0580DJSZacefios\u02A0\u02AC\u02B0\u02B4\u02B8\u02CB\u02D7\u02E1\u02E6\u0333\u048D\u0100;o\u0179\u02A5trahd;\u6911cy;\u4402cy;\u4405cy;\u440F\u0180grs\u02BF\u02C4\u02C7ger;\u6021r;\u61A1hv;\u6AE4\u0100ay\u02D0\u02D5ron;\u410E;\u4414l\u0100;t\u02DD\u02DE\u6207a;\u4394r;\uC000\u{1D507}\u0100af\u02EB\u0327\u0100cm\u02F0\u0322ritical\u0200ADGT\u0300\u0306\u0316\u031Ccute;\u40B4o\u0174\u030B\u030D;\u42D9bleAcute;\u42DDrave;\u4060ilde;\u42DCond;\u62C4ferentialD;\u6146\u0470\u033D\0\0\0\u0342\u0354\0\u0405f;\uC000\u{1D53B}\u0180;DE\u0348\u0349\u034D\u40A8ot;\u60DCqual;\u6250ble\u0300CDLRUV\u0363\u0372\u0382\u03CF\u03E2\u03F8ontourIntegra\xEC\u0239o\u0274\u0379\0\0\u037B\xBB\u0349nArrow;\u61D3\u0100eo\u0387\u03A4ft\u0180ART\u0390\u0396\u03A1rrow;\u61D0ightArrow;\u61D4e\xE5\u02CAng\u0100LR\u03AB\u03C4eft\u0100AR\u03B3\u03B9rrow;\u67F8ightArrow;\u67FAightArrow;\u67F9ight\u0100AT\u03D8\u03DErrow;\u61D2ee;\u62A8p\u0241\u03E9\0\0\u03EFrrow;\u61D1ownArrow;\u61D5erticalBar;\u6225n\u0300ABLRTa\u0412\u042A\u0430\u045E\u047F\u037Crrow\u0180;BU\u041D\u041E\u0422\u6193ar;\u6913pArrow;\u61F5reve;\u4311eft\u02D2\u043A\0\u0446\0\u0450ightVector;\u6950eeVector;\u695Eector\u0100;B\u0459\u045A\u61BDar;\u6956ight\u01D4\u0467\0\u0471eeVector;\u695Fector\u0100;B\u047A\u047B\u61C1ar;\u6957ee\u0100;A\u0486\u0487\u62A4rrow;\u61A7\u0100ct\u0492\u0497r;\uC000\u{1D49F}rok;\u4110\u0800NTacdfglmopqstux\u04BD\u04C0\u04C4\u04CB\u04DE\u04E2\u04E7\u04EE\u04F5\u0521\u052F\u0536\u0552\u055D\u0560\u0565G;\u414AH\u803B\xD0\u40D0cute\u803B\xC9\u40C9\u0180aiy\u04D2\u04D7\u04DCron;\u411Arc\u803B\xCA\u40CA;\u442Dot;\u4116r;\uC000\u{1D508}rave\u803B\xC8\u40C8ement;\u6208\u0100ap\u04FA\u04FEcr;\u4112ty\u0253\u0506\0\0\u0512mallSquare;\u65FBerySmallSquare;\u65AB\u0100gp\u0526\u052Aon;\u4118f;\uC000\u{1D53C}silon;\u4395u\u0100ai\u053C\u0549l\u0100;T\u0542\u0543\u6A75ilde;\u6242librium;\u61CC\u0100ci\u0557\u055Ar;\u6130m;\u6A73a;\u4397ml\u803B\xCB\u40CB\u0100ip\u056A\u056Fsts;\u6203onentialE;\u6147\u0280cfios\u0585\u0588\u058D\u05B2\u05CCy;\u4424r;\uC000\u{1D509}lled\u0253\u0597\0\0\u05A3mallSquare;\u65FCerySmallSquare;\u65AA\u0370\u05BA\0\u05BF\0\0\u05C4f;\uC000\u{1D53D}All;\u6200riertrf;\u6131c\xF2\u05CB\u0600JTabcdfgorst\u05E8\u05EC\u05EF\u05FA\u0600\u0612\u0616\u061B\u061D\u0623\u066C\u0672cy;\u4403\u803B>\u403Emma\u0100;d\u05F7\u05F8\u4393;\u43DCreve;\u411E\u0180eiy\u0607\u060C\u0610dil;\u4122rc;\u411C;\u4413ot;\u4120r;\uC000\u{1D50A};\u62D9pf;\uC000\u{1D53E}eater\u0300EFGLST\u0635\u0644\u064E\u0656\u065B\u0666qual\u0100;L\u063E\u063F\u6265ess;\u62DBullEqual;\u6267reater;\u6AA2ess;\u6277lantEqual;\u6A7Eilde;\u6273cr;\uC000\u{1D4A2};\u626B\u0400Aacfiosu\u0685\u068B\u0696\u069B\u069E\u06AA\u06BE\u06CARDcy;\u442A\u0100ct\u0690\u0694ek;\u42C7;\u405Eirc;\u4124r;\u610ClbertSpace;\u610B\u01F0\u06AF\0\u06B2f;\u610DizontalLine;\u6500\u0100ct\u06C3\u06C5\xF2\u06A9rok;\u4126mp\u0144\u06D0\u06D8ownHum\xF0\u012Fqual;\u624F\u0700EJOacdfgmnostu\u06FA\u06FE\u0703\u0707\u070E\u071A\u071E\u0721\u0728\u0744\u0778\u078B\u078F\u0795cy;\u4415lig;\u4132cy;\u4401cute\u803B\xCD\u40CD\u0100iy\u0713\u0718rc\u803B\xCE\u40CE;\u4418ot;\u4130r;\u6111rave\u803B\xCC\u40CC\u0180;ap\u0720\u072F\u073F\u0100cg\u0734\u0737r;\u412AinaryI;\u6148lie\xF3\u03DD\u01F4\u0749\0\u0762\u0100;e\u074D\u074E\u622C\u0100gr\u0753\u0758ral;\u622Bsection;\u62C2isible\u0100CT\u076C\u0772omma;\u6063imes;\u6062\u0180gpt\u077F\u0783\u0788on;\u412Ef;\uC000\u{1D540}a;\u4399cr;\u6110ilde;\u4128\u01EB\u079A\0\u079Ecy;\u4406l\u803B\xCF\u40CF\u0280cfosu\u07AC\u07B7\u07BC\u07C2\u07D0\u0100iy\u07B1\u07B5rc;\u4134;\u4419r;\uC000\u{1D50D}pf;\uC000\u{1D541}\u01E3\u07C7\0\u07CCr;\uC000\u{1D4A5}rcy;\u4408kcy;\u4404\u0380HJacfos\u07E4\u07E8\u07EC\u07F1\u07FD\u0802\u0808cy;\u4425cy;\u440Cppa;\u439A\u0100ey\u07F6\u07FBdil;\u4136;\u441Ar;\uC000\u{1D50E}pf;\uC000\u{1D542}cr;\uC000\u{1D4A6}\u0580JTaceflmost\u0825\u0829\u082C\u0850\u0863\u09B3\u09B8\u09C7\u09CD\u0A37\u0A47cy;\u4409\u803B<\u403C\u0280cmnpr\u0837\u083C\u0841\u0844\u084Dute;\u4139bda;\u439Bg;\u67EAlacetrf;\u6112r;\u619E\u0180aey\u0857\u085C\u0861ron;\u413Ddil;\u413B;\u441B\u0100fs\u0868\u0970t\u0500ACDFRTUVar\u087E\u08A9\u08B1\u08E0\u08E6\u08FC\u092F\u095B\u0390\u096A\u0100nr\u0883\u088FgleBracket;\u67E8row\u0180;BR\u0899\u089A\u089E\u6190ar;\u61E4ightArrow;\u61C6eiling;\u6308o\u01F5\u08B7\0\u08C3bleBracket;\u67E6n\u01D4\u08C8\0\u08D2eeVector;\u6961ector\u0100;B\u08DB\u08DC\u61C3ar;\u6959loor;\u630Aight\u0100AV\u08EF\u08F5rrow;\u6194ector;\u694E\u0100er\u0901\u0917e\u0180;AV\u0909\u090A\u0910\u62A3rrow;\u61A4ector;\u695Aiangle\u0180;BE\u0924\u0925\u0929\u62B2ar;\u69CFqual;\u62B4p\u0180DTV\u0937\u0942\u094CownVector;\u6951eeVector;\u6960ector\u0100;B\u0956\u0957\u61BFar;\u6958ector\u0100;B\u0965\u0966\u61BCar;\u6952ight\xE1\u039Cs\u0300EFGLST\u097E\u098B\u0995\u099D\u09A2\u09ADqualGreater;\u62DAullEqual;\u6266reater;\u6276ess;\u6AA1lantEqual;\u6A7Dilde;\u6272r;\uC000\u{1D50F}\u0100;e\u09BD\u09BE\u62D8ftarrow;\u61DAidot;\u413F\u0180npw\u09D4\u0A16\u0A1Bg\u0200LRlr\u09DE\u09F7\u0A02\u0A10eft\u0100AR\u09E6\u09ECrrow;\u67F5ightArrow;\u67F7ightArrow;\u67F6eft\u0100ar\u03B3\u0A0Aight\xE1\u03BFight\xE1\u03CAf;\uC000\u{1D543}er\u0100LR\u0A22\u0A2CeftArrow;\u6199ightArrow;\u6198\u0180cht\u0A3E\u0A40\u0A42\xF2\u084C;\u61B0rok;\u4141;\u626A\u0400acefiosu\u0A5A\u0A5D\u0A60\u0A77\u0A7C\u0A85\u0A8B\u0A8Ep;\u6905y;\u441C\u0100dl\u0A65\u0A6FiumSpace;\u605Flintrf;\u6133r;\uC000\u{1D510}nusPlus;\u6213pf;\uC000\u{1D544}c\xF2\u0A76;\u439C\u0480Jacefostu\u0AA3\u0AA7\u0AAD\u0AC0\u0B14\u0B19\u0D91\u0D97\u0D9Ecy;\u440Acute;\u4143\u0180aey\u0AB4\u0AB9\u0ABEron;\u4147dil;\u4145;\u441D\u0180gsw\u0AC7\u0AF0\u0B0Eative\u0180MTV\u0AD3\u0ADF\u0AE8ediumSpace;\u600Bhi\u0100cn\u0AE6\u0AD8\xEB\u0AD9eryThi\xEE\u0AD9ted\u0100GL\u0AF8\u0B06reaterGreate\xF2\u0673essLes\xF3\u0A48Line;\u400Ar;\uC000\u{1D511}\u0200Bnpt\u0B22\u0B28\u0B37\u0B3Areak;\u6060BreakingSpace;\u40A0f;\u6115\u0680;CDEGHLNPRSTV\u0B55\u0B56\u0B6A\u0B7C\u0BA1\u0BEB\u0C04\u0C5E\u0C84\u0CA6\u0CD8\u0D61\u0D85\u6AEC\u0100ou\u0B5B\u0B64ngruent;\u6262pCap;\u626DoubleVerticalBar;\u6226\u0180lqx\u0B83\u0B8A\u0B9Bement;\u6209ual\u0100;T\u0B92\u0B93\u6260ilde;\uC000\u2242\u0338ists;\u6204reater\u0380;EFGLST\u0BB6\u0BB7\u0BBD\u0BC9\u0BD3\u0BD8\u0BE5\u626Fqual;\u6271ullEqual;\uC000\u2267\u0338reater;\uC000\u226B\u0338ess;\u6279lantEqual;\uC000\u2A7E\u0338ilde;\u6275ump\u0144\u0BF2\u0BFDownHump;\uC000\u224E\u0338qual;\uC000\u224F\u0338e\u0100fs\u0C0A\u0C27tTriangle\u0180;BE\u0C1A\u0C1B\u0C21\u62EAar;\uC000\u29CF\u0338qual;\u62ECs\u0300;EGLST\u0C35\u0C36\u0C3C\u0C44\u0C4B\u0C58\u626Equal;\u6270reater;\u6278ess;\uC000\u226A\u0338lantEqual;\uC000\u2A7D\u0338ilde;\u6274ested\u0100GL\u0C68\u0C79reaterGreater;\uC000\u2AA2\u0338essLess;\uC000\u2AA1\u0338recedes\u0180;ES\u0C92\u0C93\u0C9B\u6280qual;\uC000\u2AAF\u0338lantEqual;\u62E0\u0100ei\u0CAB\u0CB9verseElement;\u620CghtTriangle\u0180;BE\u0CCB\u0CCC\u0CD2\u62EBar;\uC000\u29D0\u0338qual;\u62ED\u0100qu\u0CDD\u0D0CuareSu\u0100bp\u0CE8\u0CF9set\u0100;E\u0CF0\u0CF3\uC000\u228F\u0338qual;\u62E2erset\u0100;E\u0D03\u0D06\uC000\u2290\u0338qual;\u62E3\u0180bcp\u0D13\u0D24\u0D4Eset\u0100;E\u0D1B\u0D1E\uC000\u2282\u20D2qual;\u6288ceeds\u0200;EST\u0D32\u0D33\u0D3B\u0D46\u6281qual;\uC000\u2AB0\u0338lantEqual;\u62E1ilde;\uC000\u227F\u0338erset\u0100;E\u0D58\u0D5B\uC000\u2283\u20D2qual;\u6289ilde\u0200;EFT\u0D6E\u0D6F\u0D75\u0D7F\u6241qual;\u6244ullEqual;\u6247ilde;\u6249erticalBar;\u6224cr;\uC000\u{1D4A9}ilde\u803B\xD1\u40D1;\u439D\u0700Eacdfgmoprstuv\u0DBD\u0DC2\u0DC9\u0DD5\u0DDB\u0DE0\u0DE7\u0DFC\u0E02\u0E20\u0E22\u0E32\u0E3F\u0E44lig;\u4152cute\u803B\xD3\u40D3\u0100iy\u0DCE\u0DD3rc\u803B\xD4\u40D4;\u441Eblac;\u4150r;\uC000\u{1D512}rave\u803B\xD2\u40D2\u0180aei\u0DEE\u0DF2\u0DF6cr;\u414Cga;\u43A9cron;\u439Fpf;\uC000\u{1D546}enCurly\u0100DQ\u0E0E\u0E1AoubleQuote;\u601Cuote;\u6018;\u6A54\u0100cl\u0E27\u0E2Cr;\uC000\u{1D4AA}ash\u803B\xD8\u40D8i\u016C\u0E37\u0E3Cde\u803B\xD5\u40D5es;\u6A37ml\u803B\xD6\u40D6er\u0100BP\u0E4B\u0E60\u0100ar\u0E50\u0E53r;\u603Eac\u0100ek\u0E5A\u0E5C;\u63DEet;\u63B4arenthesis;\u63DC\u0480acfhilors\u0E7F\u0E87\u0E8A\u0E8F\u0E92\u0E94\u0E9D\u0EB0\u0EFCrtialD;\u6202y;\u441Fr;\uC000\u{1D513}i;\u43A6;\u43A0usMinus;\u40B1\u0100ip\u0EA2\u0EADncareplan\xE5\u069Df;\u6119\u0200;eio\u0EB9\u0EBA\u0EE0\u0EE4\u6ABBcedes\u0200;EST\u0EC8\u0EC9\u0ECF\u0EDA\u627Aqual;\u6AAFlantEqual;\u627Cilde;\u627Eme;\u6033\u0100dp\u0EE9\u0EEEuct;\u620Fortion\u0100;a\u0225\u0EF9l;\u621D\u0100ci\u0F01\u0F06r;\uC000\u{1D4AB};\u43A8\u0200Ufos\u0F11\u0F16\u0F1B\u0F1FOT\u803B"\u4022r;\uC000\u{1D514}pf;\u611Acr;\uC000\u{1D4AC}\u0600BEacefhiorsu\u0F3E\u0F43\u0F47\u0F60\u0F73\u0FA7\u0FAA\u0FAD\u1096\u10A9\u10B4\u10BEarr;\u6910G\u803B\xAE\u40AE\u0180cnr\u0F4E\u0F53\u0F56ute;\u4154g;\u67EBr\u0100;t\u0F5C\u0F5D\u61A0l;\u6916\u0180aey\u0F67\u0F6C\u0F71ron;\u4158dil;\u4156;\u4420\u0100;v\u0F78\u0F79\u611Cerse\u0100EU\u0F82\u0F99\u0100lq\u0F87\u0F8Eement;\u620Builibrium;\u61CBpEquilibrium;\u696Fr\xBB\u0F79o;\u43A1ght\u0400ACDFTUVa\u0FC1\u0FEB\u0FF3\u1022\u1028\u105B\u1087\u03D8\u0100nr\u0FC6\u0FD2gleBracket;\u67E9row\u0180;BL\u0FDC\u0FDD\u0FE1\u6192ar;\u61E5eftArrow;\u61C4eiling;\u6309o\u01F5\u0FF9\0\u1005bleBracket;\u67E7n\u01D4\u100A\0\u1014eeVector;\u695Dector\u0100;B\u101D\u101E\u61C2ar;\u6955loor;\u630B\u0100er\u102D\u1043e\u0180;AV\u1035\u1036\u103C\u62A2rrow;\u61A6ector;\u695Biangle\u0180;BE\u1050\u1051\u1055\u62B3ar;\u69D0qual;\u62B5p\u0180DTV\u1063\u106E\u1078ownVector;\u694FeeVector;\u695Cector\u0100;B\u1082\u1083\u61BEar;\u6954ector\u0100;B\u1091\u1092\u61C0ar;\u6953\u0100pu\u109B\u109Ef;\u611DndImplies;\u6970ightarrow;\u61DB\u0100ch\u10B9\u10BCr;\u611B;\u61B1leDelayed;\u69F4\u0680HOacfhimoqstu\u10E4\u10F1\u10F7\u10FD\u1119\u111E\u1151\u1156\u1161\u1167\u11B5\u11BB\u11BF\u0100Cc\u10E9\u10EEHcy;\u4429y;\u4428FTcy;\u442Ccute;\u415A\u0280;aeiy\u1108\u1109\u110E\u1113\u1117\u6ABCron;\u4160dil;\u415Erc;\u415C;\u4421r;\uC000\u{1D516}ort\u0200DLRU\u112A\u1134\u113E\u1149ownArrow\xBB\u041EeftArrow\xBB\u089AightArrow\xBB\u0FDDpArrow;\u6191gma;\u43A3allCircle;\u6218pf;\uC000\u{1D54A}\u0272\u116D\0\0\u1170t;\u621Aare\u0200;ISU\u117B\u117C\u1189\u11AF\u65A1ntersection;\u6293u\u0100bp\u118F\u119Eset\u0100;E\u1197\u1198\u628Fqual;\u6291erset\u0100;E\u11A8\u11A9\u6290qual;\u6292nion;\u6294cr;\uC000\u{1D4AE}ar;\u62C6\u0200bcmp\u11C8\u11DB\u1209\u120B\u0100;s\u11CD\u11CE\u62D0et\u0100;E\u11CD\u11D5qual;\u6286\u0100ch\u11E0\u1205eeds\u0200;EST\u11ED\u11EE\u11F4\u11FF\u627Bqual;\u6AB0lantEqual;\u627Dilde;\u627FTh\xE1\u0F8C;\u6211\u0180;es\u1212\u1213\u1223\u62D1rset\u0100;E\u121C\u121D\u6283qual;\u6287et\xBB\u1213\u0580HRSacfhiors\u123E\u1244\u1249\u1255\u125E\u1271\u1276\u129F\u12C2\u12C8\u12D1ORN\u803B\xDE\u40DEADE;\u6122\u0100Hc\u124E\u1252cy;\u440By;\u4426\u0100bu\u125A\u125C;\u4009;\u43A4\u0180aey\u1265\u126A\u126Fron;\u4164dil;\u4162;\u4422r;\uC000\u{1D517}\u0100ei\u127B\u1289\u01F2\u1280\0\u1287efore;\u6234a;\u4398\u0100cn\u128E\u1298kSpace;\uC000\u205F\u200ASpace;\u6009lde\u0200;EFT\u12AB\u12AC\u12B2\u12BC\u623Cqual;\u6243ullEqual;\u6245ilde;\u6248pf;\uC000\u{1D54B}ipleDot;\u60DB\u0100ct\u12D6\u12DBr;\uC000\u{1D4AF}rok;\u4166\u0AE1\u12F7\u130E\u131A\u1326\0\u132C\u1331\0\0\0\0\0\u1338\u133D\u1377\u1385\0\u13FF\u1404\u140A\u1410\u0100cr\u12FB\u1301ute\u803B\xDA\u40DAr\u0100;o\u1307\u1308\u619Fcir;\u6949r\u01E3\u1313\0\u1316y;\u440Eve;\u416C\u0100iy\u131E\u1323rc\u803B\xDB\u40DB;\u4423blac;\u4170r;\uC000\u{1D518}rave\u803B\xD9\u40D9acr;\u416A\u0100di\u1341\u1369er\u0100BP\u1348\u135D\u0100ar\u134D\u1350r;\u405Fac\u0100ek\u1357\u1359;\u63DFet;\u63B5arenthesis;\u63DDon\u0100;P\u1370\u1371\u62C3lus;\u628E\u0100gp\u137B\u137Fon;\u4172f;\uC000\u{1D54C}\u0400ADETadps\u1395\u13AE\u13B8\u13C4\u03E8\u13D2\u13D7\u13F3rrow\u0180;BD\u1150\u13A0\u13A4ar;\u6912ownArrow;\u61C5ownArrow;\u6195quilibrium;\u696Eee\u0100;A\u13CB\u13CC\u62A5rrow;\u61A5own\xE1\u03F3er\u0100LR\u13DE\u13E8eftArrow;\u6196ightArrow;\u6197i\u0100;l\u13F9\u13FA\u43D2on;\u43A5ing;\u416Ecr;\uC000\u{1D4B0}ilde;\u4168ml\u803B\xDC\u40DC\u0480Dbcdefosv\u1427\u142C\u1430\u1433\u143E\u1485\u148A\u1490\u1496ash;\u62ABar;\u6AEBy;\u4412ash\u0100;l\u143B\u143C\u62A9;\u6AE6\u0100er\u1443\u1445;\u62C1\u0180bty\u144C\u1450\u147Aar;\u6016\u0100;i\u144F\u1455cal\u0200BLST\u1461\u1465\u146A\u1474ar;\u6223ine;\u407Ceparator;\u6758ilde;\u6240ThinSpace;\u600Ar;\uC000\u{1D519}pf;\uC000\u{1D54D}cr;\uC000\u{1D4B1}dash;\u62AA\u0280cefos\u14A7\u14AC\u14B1\u14B6\u14BCirc;\u4174dge;\u62C0r;\uC000\u{1D51A}pf;\uC000\u{1D54E}cr;\uC000\u{1D4B2}\u0200fios\u14CB\u14D0\u14D2\u14D8r;\uC000\u{1D51B};\u439Epf;\uC000\u{1D54F}cr;\uC000\u{1D4B3}\u0480AIUacfosu\u14F1\u14F5\u14F9\u14FD\u1504\u150F\u1514\u151A\u1520cy;\u442Fcy;\u4407cy;\u442Ecute\u803B\xDD\u40DD\u0100iy\u1509\u150Drc;\u4176;\u442Br;\uC000\u{1D51C}pf;\uC000\u{1D550}cr;\uC000\u{1D4B4}ml;\u4178\u0400Hacdefos\u1535\u1539\u153F\u154B\u154F\u155D\u1560\u1564cy;\u4416cute;\u4179\u0100ay\u1544\u1549ron;\u417D;\u4417ot;\u417B\u01F2\u1554\0\u155BoWidt\xE8\u0AD9a;\u4396r;\u6128pf;\u6124cr;\uC000\u{1D4B5}\u0BE1\u1583\u158A\u1590\0\u15B0\u15B6\u15BF\0\0\0\0\u15C6\u15DB\u15EB\u165F\u166D\0\u1695\u169B\u16B2\u16B9\0\u16BEcute\u803B\xE1\u40E1reve;\u4103\u0300;Ediuy\u159C\u159D\u15A1\u15A3\u15A8\u15AD\u623E;\uC000\u223E\u0333;\u623Frc\u803B\xE2\u40E2te\u80BB\xB4\u0306;\u4430lig\u803B\xE6\u40E6\u0100;r\xB2\u15BA;\uC000\u{1D51E}rave\u803B\xE0\u40E0\u0100ep\u15CA\u15D6\u0100fp\u15CF\u15D4sym;\u6135\xE8\u15D3ha;\u43B1\u0100ap\u15DFc\u0100cl\u15E4\u15E7r;\u4101g;\u6A3F\u0264\u15F0\0\0\u160A\u0280;adsv\u15FA\u15FB\u15FF\u1601\u1607\u6227nd;\u6A55;\u6A5Clope;\u6A58;\u6A5A\u0380;elmrsz\u1618\u1619\u161B\u161E\u163F\u164F\u1659\u6220;\u69A4e\xBB\u1619sd\u0100;a\u1625\u1626\u6221\u0461\u1630\u1632\u1634\u1636\u1638\u163A\u163C\u163E;\u69A8;\u69A9;\u69AA;\u69AB;\u69AC;\u69AD;\u69AE;\u69AFt\u0100;v\u1645\u1646\u621Fb\u0100;d\u164C\u164D\u62BE;\u699D\u0100pt\u1654\u1657h;\u6222\xBB\xB9arr;\u637C\u0100gp\u1663\u1667on;\u4105f;\uC000\u{1D552}\u0380;Eaeiop\u12C1\u167B\u167D\u1682\u1684\u1687\u168A;\u6A70cir;\u6A6F;\u624Ad;\u624Bs;\u4027rox\u0100;e\u12C1\u1692\xF1\u1683ing\u803B\xE5\u40E5\u0180cty\u16A1\u16A6\u16A8r;\uC000\u{1D4B6};\u402Amp\u0100;e\u12C1\u16AF\xF1\u0288ilde\u803B\xE3\u40E3ml\u803B\xE4\u40E4\u0100ci\u16C2\u16C8onin\xF4\u0272nt;\u6A11\u0800Nabcdefiklnoprsu\u16ED\u16F1\u1730\u173C\u1743\u1748\u1778\u177D\u17E0\u17E6\u1839\u1850\u170D\u193D\u1948\u1970ot;\u6AED\u0100cr\u16F6\u171Ek\u0200ceps\u1700\u1705\u170D\u1713ong;\u624Cpsilon;\u43F6rime;\u6035im\u0100;e\u171A\u171B\u623Dq;\u62CD\u0176\u1722\u1726ee;\u62BDed\u0100;g\u172C\u172D\u6305e\xBB\u172Drk\u0100;t\u135C\u1737brk;\u63B6\u0100oy\u1701\u1741;\u4431quo;\u601E\u0280cmprt\u1753\u175B\u1761\u1764\u1768aus\u0100;e\u010A\u0109ptyv;\u69B0s\xE9\u170Cno\xF5\u0113\u0180ahw\u176F\u1771\u1773;\u43B2;\u6136een;\u626Cr;\uC000\u{1D51F}g\u0380costuvw\u178D\u179D\u17B3\u17C1\u17D5\u17DB\u17DE\u0180aiu\u1794\u1796\u179A\xF0\u0760rc;\u65EFp\xBB\u1371\u0180dpt\u17A4\u17A8\u17ADot;\u6A00lus;\u6A01imes;\u6A02\u0271\u17B9\0\0\u17BEcup;\u6A06ar;\u6605riangle\u0100du\u17CD\u17D2own;\u65BDp;\u65B3plus;\u6A04e\xE5\u1444\xE5\u14ADarow;\u690D\u0180ako\u17ED\u1826\u1835\u0100cn\u17F2\u1823k\u0180lst\u17FA\u05AB\u1802ozenge;\u69EBriangle\u0200;dlr\u1812\u1813\u1818\u181D\u65B4own;\u65BEeft;\u65C2ight;\u65B8k;\u6423\u01B1\u182B\0\u1833\u01B2\u182F\0\u1831;\u6592;\u65914;\u6593ck;\u6588\u0100eo\u183E\u184D\u0100;q\u1843\u1846\uC000=\u20E5uiv;\uC000\u2261\u20E5t;\u6310\u0200ptwx\u1859\u185E\u1867\u186Cf;\uC000\u{1D553}\u0100;t\u13CB\u1863om\xBB\u13CCtie;\u62C8\u0600DHUVbdhmptuv\u1885\u1896\u18AA\u18BB\u18D7\u18DB\u18EC\u18FF\u1905\u190A\u1910\u1921\u0200LRlr\u188E\u1890\u1892\u1894;\u6557;\u6554;\u6556;\u6553\u0280;DUdu\u18A1\u18A2\u18A4\u18A6\u18A8\u6550;\u6566;\u6569;\u6564;\u6567\u0200LRlr\u18B3\u18B5\u18B7\u18B9;\u655D;\u655A;\u655C;\u6559\u0380;HLRhlr\u18CA\u18CB\u18CD\u18CF\u18D1\u18D3\u18D5\u6551;\u656C;\u6563;\u6560;\u656B;\u6562;\u655Fox;\u69C9\u0200LRlr\u18E4\u18E6\u18E8\u18EA;\u6555;\u6552;\u6510;\u650C\u0280;DUdu\u06BD\u18F7\u18F9\u18FB\u18FD;\u6565;\u6568;\u652C;\u6534inus;\u629Flus;\u629Eimes;\u62A0\u0200LRlr\u1919\u191B\u191D\u191F;\u655B;\u6558;\u6518;\u6514\u0380;HLRhlr\u1930\u1931\u1933\u1935\u1937\u1939\u193B\u6502;\u656A;\u6561;\u655E;\u653C;\u6524;\u651C\u0100ev\u0123\u1942bar\u803B\xA6\u40A6\u0200ceio\u1951\u1956\u195A\u1960r;\uC000\u{1D4B7}mi;\u604Fm\u0100;e\u171A\u171Cl\u0180;bh\u1968\u1969\u196B\u405C;\u69C5sub;\u67C8\u016C\u1974\u197El\u0100;e\u1979\u197A\u6022t\xBB\u197Ap\u0180;Ee\u012F\u1985\u1987;\u6AAE\u0100;q\u06DC\u06DB\u0CE1\u19A7\0\u19E8\u1A11\u1A15\u1A32\0\u1A37\u1A50\0\0\u1AB4\0\0\u1AC1\0\0\u1B21\u1B2E\u1B4D\u1B52\0\u1BFD\0\u1C0C\u0180cpr\u19AD\u19B2\u19DDute;\u4107\u0300;abcds\u19BF\u19C0\u19C4\u19CA\u19D5\u19D9\u6229nd;\u6A44rcup;\u6A49\u0100au\u19CF\u19D2p;\u6A4Bp;\u6A47ot;\u6A40;\uC000\u2229\uFE00\u0100eo\u19E2\u19E5t;\u6041\xEE\u0693\u0200aeiu\u19F0\u19FB\u1A01\u1A05\u01F0\u19F5\0\u19F8s;\u6A4Don;\u410Ddil\u803B\xE7\u40E7rc;\u4109ps\u0100;s\u1A0C\u1A0D\u6A4Cm;\u6A50ot;\u410B\u0180dmn\u1A1B\u1A20\u1A26il\u80BB\xB8\u01ADptyv;\u69B2t\u8100\xA2;e\u1A2D\u1A2E\u40A2r\xE4\u01B2r;\uC000\u{1D520}\u0180cei\u1A3D\u1A40\u1A4Dy;\u4447ck\u0100;m\u1A47\u1A48\u6713ark\xBB\u1A48;\u43C7r\u0380;Ecefms\u1A5F\u1A60\u1A62\u1A6B\u1AA4\u1AAA\u1AAE\u65CB;\u69C3\u0180;el\u1A69\u1A6A\u1A6D\u42C6q;\u6257e\u0261\u1A74\0\0\u1A88rrow\u0100lr\u1A7C\u1A81eft;\u61BAight;\u61BB\u0280RSacd\u1A92\u1A94\u1A96\u1A9A\u1A9F\xBB\u0F47;\u64C8st;\u629Birc;\u629Aash;\u629Dnint;\u6A10id;\u6AEFcir;\u69C2ubs\u0100;u\u1ABB\u1ABC\u6663it\xBB\u1ABC\u02EC\u1AC7\u1AD4\u1AFA\0\u1B0Aon\u0100;e\u1ACD\u1ACE\u403A\u0100;q\xC7\xC6\u026D\u1AD9\0\0\u1AE2a\u0100;t\u1ADE\u1ADF\u402C;\u4040\u0180;fl\u1AE8\u1AE9\u1AEB\u6201\xEE\u1160e\u0100mx\u1AF1\u1AF6ent\xBB\u1AE9e\xF3\u024D\u01E7\u1AFE\0\u1B07\u0100;d\u12BB\u1B02ot;\u6A6Dn\xF4\u0246\u0180fry\u1B10\u1B14\u1B17;\uC000\u{1D554}o\xE4\u0254\u8100\xA9;s\u0155\u1B1Dr;\u6117\u0100ao\u1B25\u1B29rr;\u61B5ss;\u6717\u0100cu\u1B32\u1B37r;\uC000\u{1D4B8}\u0100bp\u1B3C\u1B44\u0100;e\u1B41\u1B42\u6ACF;\u6AD1\u0100;e\u1B49\u1B4A\u6AD0;\u6AD2dot;\u62EF\u0380delprvw\u1B60\u1B6C\u1B77\u1B82\u1BAC\u1BD4\u1BF9arr\u0100lr\u1B68\u1B6A;\u6938;\u6935\u0270\u1B72\0\0\u1B75r;\u62DEc;\u62DFarr\u0100;p\u1B7F\u1B80\u61B6;\u693D\u0300;bcdos\u1B8F\u1B90\u1B96\u1BA1\u1BA5\u1BA8\u622Arcap;\u6A48\u0100au\u1B9B\u1B9Ep;\u6A46p;\u6A4Aot;\u628Dr;\u6A45;\uC000\u222A\uFE00\u0200alrv\u1BB5\u1BBF\u1BDE\u1BE3rr\u0100;m\u1BBC\u1BBD\u61B7;\u693Cy\u0180evw\u1BC7\u1BD4\u1BD8q\u0270\u1BCE\0\0\u1BD2re\xE3\u1B73u\xE3\u1B75ee;\u62CEedge;\u62CFen\u803B\xA4\u40A4earrow\u0100lr\u1BEE\u1BF3eft\xBB\u1B80ight\xBB\u1BBDe\xE4\u1BDD\u0100ci\u1C01\u1C07onin\xF4\u01F7nt;\u6231lcty;\u632D\u0980AHabcdefhijlorstuwz\u1C38\u1C3B\u1C3F\u1C5D\u1C69\u1C75\u1C8A\u1C9E\u1CAC\u1CB7\u1CFB\u1CFF\u1D0D\u1D7B\u1D91\u1DAB\u1DBB\u1DC6\u1DCDr\xF2\u0381ar;\u6965\u0200glrs\u1C48\u1C4D\u1C52\u1C54ger;\u6020eth;\u6138\xF2\u1133h\u0100;v\u1C5A\u1C5B\u6010\xBB\u090A\u016B\u1C61\u1C67arow;\u690Fa\xE3\u0315\u0100ay\u1C6E\u1C73ron;\u410F;\u4434\u0180;ao\u0332\u1C7C\u1C84\u0100gr\u02BF\u1C81r;\u61CAtseq;\u6A77\u0180glm\u1C91\u1C94\u1C98\u803B\xB0\u40B0ta;\u43B4ptyv;\u69B1\u0100ir\u1CA3\u1CA8sht;\u697F;\uC000\u{1D521}ar\u0100lr\u1CB3\u1CB5\xBB\u08DC\xBB\u101E\u0280aegsv\u1CC2\u0378\u1CD6\u1CDC\u1CE0m\u0180;os\u0326\u1CCA\u1CD4nd\u0100;s\u0326\u1CD1uit;\u6666amma;\u43DDin;\u62F2\u0180;io\u1CE7\u1CE8\u1CF8\u40F7de\u8100\xF7;o\u1CE7\u1CF0ntimes;\u62C7n\xF8\u1CF7cy;\u4452c\u026F\u1D06\0\0\u1D0Arn;\u631Eop;\u630D\u0280lptuw\u1D18\u1D1D\u1D22\u1D49\u1D55lar;\u4024f;\uC000\u{1D555}\u0280;emps\u030B\u1D2D\u1D37\u1D3D\u1D42q\u0100;d\u0352\u1D33ot;\u6251inus;\u6238lus;\u6214quare;\u62A1blebarwedg\xE5\xFAn\u0180adh\u112E\u1D5D\u1D67ownarrow\xF3\u1C83arpoon\u0100lr\u1D72\u1D76ef\xF4\u1CB4igh\xF4\u1CB6\u0162\u1D7F\u1D85karo\xF7\u0F42\u026F\u1D8A\0\0\u1D8Ern;\u631Fop;\u630C\u0180cot\u1D98\u1DA3\u1DA6\u0100ry\u1D9D\u1DA1;\uC000\u{1D4B9};\u4455l;\u69F6rok;\u4111\u0100dr\u1DB0\u1DB4ot;\u62F1i\u0100;f\u1DBA\u1816\u65BF\u0100ah\u1DC0\u1DC3r\xF2\u0429a\xF2\u0FA6angle;\u69A6\u0100ci\u1DD2\u1DD5y;\u445Fgrarr;\u67FF\u0900Dacdefglmnopqrstux\u1E01\u1E09\u1E19\u1E38\u0578\u1E3C\u1E49\u1E61\u1E7E\u1EA5\u1EAF\u1EBD\u1EE1\u1F2A\u1F37\u1F44\u1F4E\u1F5A\u0100Do\u1E06\u1D34o\xF4\u1C89\u0100cs\u1E0E\u1E14ute\u803B\xE9\u40E9ter;\u6A6E\u0200aioy\u1E22\u1E27\u1E31\u1E36ron;\u411Br\u0100;c\u1E2D\u1E2E\u6256\u803B\xEA\u40EAlon;\u6255;\u444Dot;\u4117\u0100Dr\u1E41\u1E45ot;\u6252;\uC000\u{1D522}\u0180;rs\u1E50\u1E51\u1E57\u6A9Aave\u803B\xE8\u40E8\u0100;d\u1E5C\u1E5D\u6A96ot;\u6A98\u0200;ils\u1E6A\u1E6B\u1E72\u1E74\u6A99nters;\u63E7;\u6113\u0100;d\u1E79\u1E7A\u6A95ot;\u6A97\u0180aps\u1E85\u1E89\u1E97cr;\u4113ty\u0180;sv\u1E92\u1E93\u1E95\u6205et\xBB\u1E93p\u01001;\u1E9D\u1EA4\u0133\u1EA1\u1EA3;\u6004;\u6005\u6003\u0100gs\u1EAA\u1EAC;\u414Bp;\u6002\u0100gp\u1EB4\u1EB8on;\u4119f;\uC000\u{1D556}\u0180als\u1EC4\u1ECE\u1ED2r\u0100;s\u1ECA\u1ECB\u62D5l;\u69E3us;\u6A71i\u0180;lv\u1EDA\u1EDB\u1EDF\u43B5on\xBB\u1EDB;\u43F5\u0200csuv\u1EEA\u1EF3\u1F0B\u1F23\u0100io\u1EEF\u1E31rc\xBB\u1E2E\u0269\u1EF9\0\0\u1EFB\xED\u0548ant\u0100gl\u1F02\u1F06tr\xBB\u1E5Dess\xBB\u1E7A\u0180aei\u1F12\u1F16\u1F1Als;\u403Dst;\u625Fv\u0100;D\u0235\u1F20D;\u6A78parsl;\u69E5\u0100Da\u1F2F\u1F33ot;\u6253rr;\u6971\u0180cdi\u1F3E\u1F41\u1EF8r;\u612Fo\xF4\u0352\u0100ah\u1F49\u1F4B;\u43B7\u803B\xF0\u40F0\u0100mr\u1F53\u1F57l\u803B\xEB\u40EBo;\u60AC\u0180cip\u1F61\u1F64\u1F67l;\u4021s\xF4\u056E\u0100eo\u1F6C\u1F74ctatio\xEE\u0559nential\xE5\u0579\u09E1\u1F92\0\u1F9E\0\u1FA1\u1FA7\0\0\u1FC6\u1FCC\0\u1FD3\0\u1FE6\u1FEA\u2000\0\u2008\u205Allingdotse\xF1\u1E44y;\u4444male;\u6640\u0180ilr\u1FAD\u1FB3\u1FC1lig;\u8000\uFB03\u0269\u1FB9\0\0\u1FBDg;\u8000\uFB00ig;\u8000\uFB04;\uC000\u{1D523}lig;\u8000\uFB01lig;\uC000fj\u0180alt\u1FD9\u1FDC\u1FE1t;\u666Dig;\u8000\uFB02ns;\u65B1of;\u4192\u01F0\u1FEE\0\u1FF3f;\uC000\u{1D557}\u0100ak\u05BF\u1FF7\u0100;v\u1FFC\u1FFD\u62D4;\u6AD9artint;\u6A0D\u0100ao\u200C\u2055\u0100cs\u2011\u2052\u03B1\u201A\u2030\u2038\u2045\u2048\0\u2050\u03B2\u2022\u2025\u2027\u202A\u202C\0\u202E\u803B\xBD\u40BD;\u6153\u803B\xBC\u40BC;\u6155;\u6159;\u615B\u01B3\u2034\0\u2036;\u6154;\u6156\u02B4\u203E\u2041\0\0\u2043\u803B\xBE\u40BE;\u6157;\u615C5;\u6158\u01B6\u204C\0\u204E;\u615A;\u615D8;\u615El;\u6044wn;\u6322cr;\uC000\u{1D4BB}\u0880Eabcdefgijlnorstv\u2082\u2089\u209F\u20A5\u20B0\u20B4\u20F0\u20F5\u20FA\u20FF\u2103\u2112\u2138\u0317\u213E\u2152\u219E\u0100;l\u064D\u2087;\u6A8C\u0180cmp\u2090\u2095\u209Dute;\u41F5ma\u0100;d\u209C\u1CDA\u43B3;\u6A86reve;\u411F\u0100iy\u20AA\u20AErc;\u411D;\u4433ot;\u4121\u0200;lqs\u063E\u0642\u20BD\u20C9\u0180;qs\u063E\u064C\u20C4lan\xF4\u0665\u0200;cdl\u0665\u20D2\u20D5\u20E5c;\u6AA9ot\u0100;o\u20DC\u20DD\u6A80\u0100;l\u20E2\u20E3\u6A82;\u6A84\u0100;e\u20EA\u20ED\uC000\u22DB\uFE00s;\u6A94r;\uC000\u{1D524}\u0100;g\u0673\u061Bmel;\u6137cy;\u4453\u0200;Eaj\u065A\u210C\u210E\u2110;\u6A92;\u6AA5;\u6AA4\u0200Eaes\u211B\u211D\u2129\u2134;\u6269p\u0100;p\u2123\u2124\u6A8Arox\xBB\u2124\u0100;q\u212E\u212F\u6A88\u0100;q\u212E\u211Bim;\u62E7pf;\uC000\u{1D558}\u0100ci\u2143\u2146r;\u610Am\u0180;el\u066B\u214E\u2150;\u6A8E;\u6A90\u8300>;cdlqr\u05EE\u2160\u216A\u216E\u2173\u2179\u0100ci\u2165\u2167;\u6AA7r;\u6A7Aot;\u62D7Par;\u6995uest;\u6A7C\u0280adels\u2184\u216A\u2190\u0656\u219B\u01F0\u2189\0\u218Epro\xF8\u209Er;\u6978q\u0100lq\u063F\u2196les\xF3\u2088i\xED\u066B\u0100en\u21A3\u21ADrtneqq;\uC000\u2269\uFE00\xC5\u21AA\u0500Aabcefkosy\u21C4\u21C7\u21F1\u21F5\u21FA\u2218\u221D\u222F\u2268\u227Dr\xF2\u03A0\u0200ilmr\u21D0\u21D4\u21D7\u21DBrs\xF0\u1484f\xBB\u2024il\xF4\u06A9\u0100dr\u21E0\u21E4cy;\u444A\u0180;cw\u08F4\u21EB\u21EFir;\u6948;\u61ADar;\u610Firc;\u4125\u0180alr\u2201\u220E\u2213rts\u0100;u\u2209\u220A\u6665it\xBB\u220Alip;\u6026con;\u62B9r;\uC000\u{1D525}s\u0100ew\u2223\u2229arow;\u6925arow;\u6926\u0280amopr\u223A\u223E\u2243\u225E\u2263rr;\u61FFtht;\u623Bk\u0100lr\u2249\u2253eftarrow;\u61A9ightarrow;\u61AAf;\uC000\u{1D559}bar;\u6015\u0180clt\u226F\u2274\u2278r;\uC000\u{1D4BD}as\xE8\u21F4rok;\u4127\u0100bp\u2282\u2287ull;\u6043hen\xBB\u1C5B\u0AE1\u22A3\0\u22AA\0\u22B8\u22C5\u22CE\0\u22D5\u22F3\0\0\u22F8\u2322\u2367\u2362\u237F\0\u2386\u23AA\u23B4cute\u803B\xED\u40ED\u0180;iy\u0771\u22B0\u22B5rc\u803B\xEE\u40EE;\u4438\u0100cx\u22BC\u22BFy;\u4435cl\u803B\xA1\u40A1\u0100fr\u039F\u22C9;\uC000\u{1D526}rave\u803B\xEC\u40EC\u0200;ino\u073E\u22DD\u22E9\u22EE\u0100in\u22E2\u22E6nt;\u6A0Ct;\u622Dfin;\u69DCta;\u6129lig;\u4133\u0180aop\u22FE\u231A\u231D\u0180cgt\u2305\u2308\u2317r;\u412B\u0180elp\u071F\u230F\u2313in\xE5\u078Ear\xF4\u0720h;\u4131f;\u62B7ed;\u41B5\u0280;cfot\u04F4\u232C\u2331\u233D\u2341are;\u6105in\u0100;t\u2338\u2339\u621Eie;\u69DDdo\xF4\u2319\u0280;celp\u0757\u234C\u2350\u235B\u2361al;\u62BA\u0100gr\u2355\u2359er\xF3\u1563\xE3\u234Darhk;\u6A17rod;\u6A3C\u0200cgpt\u236F\u2372\u2376\u237By;\u4451on;\u412Ff;\uC000\u{1D55A}a;\u43B9uest\u803B\xBF\u40BF\u0100ci\u238A\u238Fr;\uC000\u{1D4BE}n\u0280;Edsv\u04F4\u239B\u239D\u23A1\u04F3;\u62F9ot;\u62F5\u0100;v\u23A6\u23A7\u62F4;\u62F3\u0100;i\u0777\u23AElde;\u4129\u01EB\u23B8\0\u23BCcy;\u4456l\u803B\xEF\u40EF\u0300cfmosu\u23CC\u23D7\u23DC\u23E1\u23E7\u23F5\u0100iy\u23D1\u23D5rc;\u4135;\u4439r;\uC000\u{1D527}ath;\u4237pf;\uC000\u{1D55B}\u01E3\u23EC\0\u23F1r;\uC000\u{1D4BF}rcy;\u4458kcy;\u4454\u0400acfghjos\u240B\u2416\u2422\u2427\u242D\u2431\u2435\u243Bppa\u0100;v\u2413\u2414\u43BA;\u43F0\u0100ey\u241B\u2420dil;\u4137;\u443Ar;\uC000\u{1D528}reen;\u4138cy;\u4445cy;\u445Cpf;\uC000\u{1D55C}cr;\uC000\u{1D4C0}\u0B80ABEHabcdefghjlmnoprstuv\u2470\u2481\u2486\u248D\u2491\u250E\u253D\u255A\u2580\u264E\u265E\u2665\u2679\u267D\u269A\u26B2\u26D8\u275D\u2768\u278B\u27C0\u2801\u2812\u0180art\u2477\u247A\u247Cr\xF2\u09C6\xF2\u0395ail;\u691Barr;\u690E\u0100;g\u0994\u248B;\u6A8Bar;\u6962\u0963\u24A5\0\u24AA\0\u24B1\0\0\0\0\0\u24B5\u24BA\0\u24C6\u24C8\u24CD\0\u24F9ute;\u413Amptyv;\u69B4ra\xEE\u084Cbda;\u43BBg\u0180;dl\u088E\u24C1\u24C3;\u6991\xE5\u088E;\u6A85uo\u803B\xAB\u40ABr\u0400;bfhlpst\u0899\u24DE\u24E6\u24E9\u24EB\u24EE\u24F1\u24F5\u0100;f\u089D\u24E3s;\u691Fs;\u691D\xEB\u2252p;\u61ABl;\u6939im;\u6973l;\u61A2\u0180;ae\u24FF\u2500\u2504\u6AABil;\u6919\u0100;s\u2509\u250A\u6AAD;\uC000\u2AAD\uFE00\u0180abr\u2515\u2519\u251Drr;\u690Crk;\u6772\u0100ak\u2522\u252Cc\u0100ek\u2528\u252A;\u407B;\u405B\u0100es\u2531\u2533;\u698Bl\u0100du\u2539\u253B;\u698F;\u698D\u0200aeuy\u2546\u254B\u2556\u2558ron;\u413E\u0100di\u2550\u2554il;\u413C\xEC\u08B0\xE2\u2529;\u443B\u0200cqrs\u2563\u2566\u256D\u257Da;\u6936uo\u0100;r\u0E19\u1746\u0100du\u2572\u2577har;\u6967shar;\u694Bh;\u61B2\u0280;fgqs\u258B\u258C\u0989\u25F3\u25FF\u6264t\u0280ahlrt\u2598\u25A4\u25B7\u25C2\u25E8rrow\u0100;t\u0899\u25A1a\xE9\u24F6arpoon\u0100du\u25AF\u25B4own\xBB\u045Ap\xBB\u0966eftarrows;\u61C7ight\u0180ahs\u25CD\u25D6\u25DErrow\u0100;s\u08F4\u08A7arpoon\xF3\u0F98quigarro\xF7\u21F0hreetimes;\u62CB\u0180;qs\u258B\u0993\u25FAlan\xF4\u09AC\u0280;cdgs\u09AC\u260A\u260D\u261D\u2628c;\u6AA8ot\u0100;o\u2614\u2615\u6A7F\u0100;r\u261A\u261B\u6A81;\u6A83\u0100;e\u2622\u2625\uC000\u22DA\uFE00s;\u6A93\u0280adegs\u2633\u2639\u263D\u2649\u264Bppro\xF8\u24C6ot;\u62D6q\u0100gq\u2643\u2645\xF4\u0989gt\xF2\u248C\xF4\u099Bi\xED\u09B2\u0180ilr\u2655\u08E1\u265Asht;\u697C;\uC000\u{1D529}\u0100;E\u099C\u2663;\u6A91\u0161\u2669\u2676r\u0100du\u25B2\u266E\u0100;l\u0965\u2673;\u696Alk;\u6584cy;\u4459\u0280;acht\u0A48\u2688\u268B\u2691\u2696r\xF2\u25C1orne\xF2\u1D08ard;\u696Bri;\u65FA\u0100io\u269F\u26A4dot;\u4140ust\u0100;a\u26AC\u26AD\u63B0che\xBB\u26AD\u0200Eaes\u26BB\u26BD\u26C9\u26D4;\u6268p\u0100;p\u26C3\u26C4\u6A89rox\xBB\u26C4\u0100;q\u26CE\u26CF\u6A87\u0100;q\u26CE\u26BBim;\u62E6\u0400abnoptwz\u26E9\u26F4\u26F7\u271A\u272F\u2741\u2747\u2750\u0100nr\u26EE\u26F1g;\u67ECr;\u61FDr\xEB\u08C1g\u0180lmr\u26FF\u270D\u2714eft\u0100ar\u09E6\u2707ight\xE1\u09F2apsto;\u67FCight\xE1\u09FDparrow\u0100lr\u2725\u2729ef\xF4\u24EDight;\u61AC\u0180afl\u2736\u2739\u273Dr;\u6985;\uC000\u{1D55D}us;\u6A2Dimes;\u6A34\u0161\u274B\u274Fst;\u6217\xE1\u134E\u0180;ef\u2757\u2758\u1800\u65CAnge\xBB\u2758ar\u0100;l\u2764\u2765\u4028t;\u6993\u0280achmt\u2773\u2776\u277C\u2785\u2787r\xF2\u08A8orne\xF2\u1D8Car\u0100;d\u0F98\u2783;\u696D;\u600Eri;\u62BF\u0300achiqt\u2798\u279D\u0A40\u27A2\u27AE\u27BBquo;\u6039r;\uC000\u{1D4C1}m\u0180;eg\u09B2\u27AA\u27AC;\u6A8D;\u6A8F\u0100bu\u252A\u27B3o\u0100;r\u0E1F\u27B9;\u601Arok;\u4142\u8400<;cdhilqr\u082B\u27D2\u2639\u27DC\u27E0\u27E5\u27EA\u27F0\u0100ci\u27D7\u27D9;\u6AA6r;\u6A79re\xE5\u25F2mes;\u62C9arr;\u6976uest;\u6A7B\u0100Pi\u27F5\u27F9ar;\u6996\u0180;ef\u2800\u092D\u181B\u65C3r\u0100du\u2807\u280Dshar;\u694Ahar;\u6966\u0100en\u2817\u2821rtneqq;\uC000\u2268\uFE00\xC5\u281E\u0700Dacdefhilnopsu\u2840\u2845\u2882\u288E\u2893\u28A0\u28A5\u28A8\u28DA\u28E2\u28E4\u0A83\u28F3\u2902Dot;\u623A\u0200clpr\u284E\u2852\u2863\u287Dr\u803B\xAF\u40AF\u0100et\u2857\u2859;\u6642\u0100;e\u285E\u285F\u6720se\xBB\u285F\u0100;s\u103B\u2868to\u0200;dlu\u103B\u2873\u2877\u287Bow\xEE\u048Cef\xF4\u090F\xF0\u13D1ker;\u65AE\u0100oy\u2887\u288Cmma;\u6A29;\u443Cash;\u6014asuredangle\xBB\u1626r;\uC000\u{1D52A}o;\u6127\u0180cdn\u28AF\u28B4\u28C9ro\u803B\xB5\u40B5\u0200;acd\u1464\u28BD\u28C0\u28C4s\xF4\u16A7ir;\u6AF0ot\u80BB\xB7\u01B5us\u0180;bd\u28D2\u1903\u28D3\u6212\u0100;u\u1D3C\u28D8;\u6A2A\u0163\u28DE\u28E1p;\u6ADB\xF2\u2212\xF0\u0A81\u0100dp\u28E9\u28EEels;\u62A7f;\uC000\u{1D55E}\u0100ct\u28F8\u28FDr;\uC000\u{1D4C2}pos\xBB\u159D\u0180;lm\u2909\u290A\u290D\u43BCtimap;\u62B8\u0C00GLRVabcdefghijlmoprstuvw\u2942\u2953\u297E\u2989\u2998\u29DA\u29E9\u2A15\u2A1A\u2A58\u2A5D\u2A83\u2A95\u2AA4\u2AA8\u2B04\u2B07\u2B44\u2B7F\u2BAE\u2C34\u2C67\u2C7C\u2CE9\u0100gt\u2947\u294B;\uC000\u22D9\u0338\u0100;v\u2950\u0BCF\uC000\u226B\u20D2\u0180elt\u295A\u2972\u2976ft\u0100ar\u2961\u2967rrow;\u61CDightarrow;\u61CE;\uC000\u22D8\u0338\u0100;v\u297B\u0C47\uC000\u226A\u20D2ightarrow;\u61CF\u0100Dd\u298E\u2993ash;\u62AFash;\u62AE\u0280bcnpt\u29A3\u29A7\u29AC\u29B1\u29CCla\xBB\u02DEute;\u4144g;\uC000\u2220\u20D2\u0280;Eiop\u0D84\u29BC\u29C0\u29C5\u29C8;\uC000\u2A70\u0338d;\uC000\u224B\u0338s;\u4149ro\xF8\u0D84ur\u0100;a\u29D3\u29D4\u666El\u0100;s\u29D3\u0B38\u01F3\u29DF\0\u29E3p\u80BB\xA0\u0B37mp\u0100;e\u0BF9\u0C00\u0280aeouy\u29F4\u29FE\u2A03\u2A10\u2A13\u01F0\u29F9\0\u29FB;\u6A43on;\u4148dil;\u4146ng\u0100;d\u0D7E\u2A0Aot;\uC000\u2A6D\u0338p;\u6A42;\u443Dash;\u6013\u0380;Aadqsx\u0B92\u2A29\u2A2D\u2A3B\u2A41\u2A45\u2A50rr;\u61D7r\u0100hr\u2A33\u2A36k;\u6924\u0100;o\u13F2\u13F0ot;\uC000\u2250\u0338ui\xF6\u0B63\u0100ei\u2A4A\u2A4Ear;\u6928\xED\u0B98ist\u0100;s\u0BA0\u0B9Fr;\uC000\u{1D52B}\u0200Eest\u0BC5\u2A66\u2A79\u2A7C\u0180;qs\u0BBC\u2A6D\u0BE1\u0180;qs\u0BBC\u0BC5\u2A74lan\xF4\u0BE2i\xED\u0BEA\u0100;r\u0BB6\u2A81\xBB\u0BB7\u0180Aap\u2A8A\u2A8D\u2A91r\xF2\u2971rr;\u61AEar;\u6AF2\u0180;sv\u0F8D\u2A9C\u0F8C\u0100;d\u2AA1\u2AA2\u62FC;\u62FAcy;\u445A\u0380AEadest\u2AB7\u2ABA\u2ABE\u2AC2\u2AC5\u2AF6\u2AF9r\xF2\u2966;\uC000\u2266\u0338rr;\u619Ar;\u6025\u0200;fqs\u0C3B\u2ACE\u2AE3\u2AEFt\u0100ar\u2AD4\u2AD9rro\xF7\u2AC1ightarro\xF7\u2A90\u0180;qs\u0C3B\u2ABA\u2AEAlan\xF4\u0C55\u0100;s\u0C55\u2AF4\xBB\u0C36i\xED\u0C5D\u0100;r\u0C35\u2AFEi\u0100;e\u0C1A\u0C25i\xE4\u0D90\u0100pt\u2B0C\u2B11f;\uC000\u{1D55F}\u8180\xAC;in\u2B19\u2B1A\u2B36\u40ACn\u0200;Edv\u0B89\u2B24\u2B28\u2B2E;\uC000\u22F9\u0338ot;\uC000\u22F5\u0338\u01E1\u0B89\u2B33\u2B35;\u62F7;\u62F6i\u0100;v\u0CB8\u2B3C\u01E1\u0CB8\u2B41\u2B43;\u62FE;\u62FD\u0180aor\u2B4B\u2B63\u2B69r\u0200;ast\u0B7B\u2B55\u2B5A\u2B5Flle\xEC\u0B7Bl;\uC000\u2AFD\u20E5;\uC000\u2202\u0338lint;\u6A14\u0180;ce\u0C92\u2B70\u2B73u\xE5\u0CA5\u0100;c\u0C98\u2B78\u0100;e\u0C92\u2B7D\xF1\u0C98\u0200Aait\u2B88\u2B8B\u2B9D\u2BA7r\xF2\u2988rr\u0180;cw\u2B94\u2B95\u2B99\u619B;\uC000\u2933\u0338;\uC000\u219D\u0338ghtarrow\xBB\u2B95ri\u0100;e\u0CCB\u0CD6\u0380chimpqu\u2BBD\u2BCD\u2BD9\u2B04\u0B78\u2BE4\u2BEF\u0200;cer\u0D32\u2BC6\u0D37\u2BC9u\xE5\u0D45;\uC000\u{1D4C3}ort\u026D\u2B05\0\0\u2BD6ar\xE1\u2B56m\u0100;e\u0D6E\u2BDF\u0100;q\u0D74\u0D73su\u0100bp\u2BEB\u2BED\xE5\u0CF8\xE5\u0D0B\u0180bcp\u2BF6\u2C11\u2C19\u0200;Ees\u2BFF\u2C00\u0D22\u2C04\u6284;\uC000\u2AC5\u0338et\u0100;e\u0D1B\u2C0Bq\u0100;q\u0D23\u2C00c\u0100;e\u0D32\u2C17\xF1\u0D38\u0200;Ees\u2C22\u2C23\u0D5F\u2C27\u6285;\uC000\u2AC6\u0338et\u0100;e\u0D58\u2C2Eq\u0100;q\u0D60\u2C23\u0200gilr\u2C3D\u2C3F\u2C45\u2C47\xEC\u0BD7lde\u803B\xF1\u40F1\xE7\u0C43iangle\u0100lr\u2C52\u2C5Ceft\u0100;e\u0C1A\u2C5A\xF1\u0C26ight\u0100;e\u0CCB\u2C65\xF1\u0CD7\u0100;m\u2C6C\u2C6D\u43BD\u0180;es\u2C74\u2C75\u2C79\u4023ro;\u6116p;\u6007\u0480DHadgilrs\u2C8F\u2C94\u2C99\u2C9E\u2CA3\u2CB0\u2CB6\u2CD3\u2CE3ash;\u62ADarr;\u6904p;\uC000\u224D\u20D2ash;\u62AC\u0100et\u2CA8\u2CAC;\uC000\u2265\u20D2;\uC000>\u20D2nfin;\u69DE\u0180Aet\u2CBD\u2CC1\u2CC5rr;\u6902;\uC000\u2264\u20D2\u0100;r\u2CCA\u2CCD\uC000<\u20D2ie;\uC000\u22B4\u20D2\u0100At\u2CD8\u2CDCrr;\u6903rie;\uC000\u22B5\u20D2im;\uC000\u223C\u20D2\u0180Aan\u2CF0\u2CF4\u2D02rr;\u61D6r\u0100hr\u2CFA\u2CFDk;\u6923\u0100;o\u13E7\u13E5ear;\u6927\u1253\u1A95\0\0\0\0\0\0\0\0\0\0\0\0\0\u2D2D\0\u2D38\u2D48\u2D60\u2D65\u2D72\u2D84\u1B07\0\0\u2D8D\u2DAB\0\u2DC8\u2DCE\0\u2DDC\u2E19\u2E2B\u2E3E\u2E43\u0100cs\u2D31\u1A97ute\u803B\xF3\u40F3\u0100iy\u2D3C\u2D45r\u0100;c\u1A9E\u2D42\u803B\xF4\u40F4;\u443E\u0280abios\u1AA0\u2D52\u2D57\u01C8\u2D5Alac;\u4151v;\u6A38old;\u69BClig;\u4153\u0100cr\u2D69\u2D6Dir;\u69BF;\uC000\u{1D52C}\u036F\u2D79\0\0\u2D7C\0\u2D82n;\u42DBave\u803B\xF2\u40F2;\u69C1\u0100bm\u2D88\u0DF4ar;\u69B5\u0200acit\u2D95\u2D98\u2DA5\u2DA8r\xF2\u1A80\u0100ir\u2D9D\u2DA0r;\u69BEoss;\u69BBn\xE5\u0E52;\u69C0\u0180aei\u2DB1\u2DB5\u2DB9cr;\u414Dga;\u43C9\u0180cdn\u2DC0\u2DC5\u01CDron;\u43BF;\u69B6pf;\uC000\u{1D560}\u0180ael\u2DD4\u2DD7\u01D2r;\u69B7rp;\u69B9\u0380;adiosv\u2DEA\u2DEB\u2DEE\u2E08\u2E0D\u2E10\u2E16\u6228r\xF2\u1A86\u0200;efm\u2DF7\u2DF8\u2E02\u2E05\u6A5Dr\u0100;o\u2DFE\u2DFF\u6134f\xBB\u2DFF\u803B\xAA\u40AA\u803B\xBA\u40BAgof;\u62B6r;\u6A56lope;\u6A57;\u6A5B\u0180clo\u2E1F\u2E21\u2E27\xF2\u2E01ash\u803B\xF8\u40F8l;\u6298i\u016C\u2E2F\u2E34de\u803B\xF5\u40F5es\u0100;a\u01DB\u2E3As;\u6A36ml\u803B\xF6\u40F6bar;\u633D\u0AE1\u2E5E\0\u2E7D\0\u2E80\u2E9D\0\u2EA2\u2EB9\0\0\u2ECB\u0E9C\0\u2F13\0\0\u2F2B\u2FBC\0\u2FC8r\u0200;ast\u0403\u2E67\u2E72\u0E85\u8100\xB6;l\u2E6D\u2E6E\u40B6le\xEC\u0403\u0269\u2E78\0\0\u2E7Bm;\u6AF3;\u6AFDy;\u443Fr\u0280cimpt\u2E8B\u2E8F\u2E93\u1865\u2E97nt;\u4025od;\u402Eil;\u6030enk;\u6031r;\uC000\u{1D52D}\u0180imo\u2EA8\u2EB0\u2EB4\u0100;v\u2EAD\u2EAE\u43C6;\u43D5ma\xF4\u0A76ne;\u660E\u0180;tv\u2EBF\u2EC0\u2EC8\u43C0chfork\xBB\u1FFD;\u43D6\u0100au\u2ECF\u2EDFn\u0100ck\u2ED5\u2EDDk\u0100;h\u21F4\u2EDB;\u610E\xF6\u21F4s\u0480;abcdemst\u2EF3\u2EF4\u1908\u2EF9\u2EFD\u2F04\u2F06\u2F0A\u2F0E\u402Bcir;\u6A23ir;\u6A22\u0100ou\u1D40\u2F02;\u6A25;\u6A72n\u80BB\xB1\u0E9Dim;\u6A26wo;\u6A27\u0180ipu\u2F19\u2F20\u2F25ntint;\u6A15f;\uC000\u{1D561}nd\u803B\xA3\u40A3\u0500;Eaceinosu\u0EC8\u2F3F\u2F41\u2F44\u2F47\u2F81\u2F89\u2F92\u2F7E\u2FB6;\u6AB3p;\u6AB7u\xE5\u0ED9\u0100;c\u0ECE\u2F4C\u0300;acens\u0EC8\u2F59\u2F5F\u2F66\u2F68\u2F7Eppro\xF8\u2F43urlye\xF1\u0ED9\xF1\u0ECE\u0180aes\u2F6F\u2F76\u2F7Approx;\u6AB9qq;\u6AB5im;\u62E8i\xED\u0EDFme\u0100;s\u2F88\u0EAE\u6032\u0180Eas\u2F78\u2F90\u2F7A\xF0\u2F75\u0180dfp\u0EEC\u2F99\u2FAF\u0180als\u2FA0\u2FA5\u2FAAlar;\u632Eine;\u6312urf;\u6313\u0100;t\u0EFB\u2FB4\xEF\u0EFBrel;\u62B0\u0100ci\u2FC0\u2FC5r;\uC000\u{1D4C5};\u43C8ncsp;\u6008\u0300fiopsu\u2FDA\u22E2\u2FDF\u2FE5\u2FEB\u2FF1r;\uC000\u{1D52E}pf;\uC000\u{1D562}rime;\u6057cr;\uC000\u{1D4C6}\u0180aeo\u2FF8\u3009\u3013t\u0100ei\u2FFE\u3005rnion\xF3\u06B0nt;\u6A16st\u0100;e\u3010\u3011\u403F\xF1\u1F19\xF4\u0F14\u0A80ABHabcdefhilmnoprstux\u3040\u3051\u3055\u3059\u30E0\u310E\u312B\u3147\u3162\u3172\u318E\u3206\u3215\u3224\u3229\u3258\u326E\u3272\u3290\u32B0\u32B7\u0180art\u3047\u304A\u304Cr\xF2\u10B3\xF2\u03DDail;\u691Car\xF2\u1C65ar;\u6964\u0380cdenqrt\u3068\u3075\u3078\u307F\u308F\u3094\u30CC\u0100eu\u306D\u3071;\uC000\u223D\u0331te;\u4155i\xE3\u116Emptyv;\u69B3g\u0200;del\u0FD1\u3089\u308B\u308D;\u6992;\u69A5\xE5\u0FD1uo\u803B\xBB\u40BBr\u0580;abcfhlpstw\u0FDC\u30AC\u30AF\u30B7\u30B9\u30BC\u30BE\u30C0\u30C3\u30C7\u30CAp;\u6975\u0100;f\u0FE0\u30B4s;\u6920;\u6933s;\u691E\xEB\u225D\xF0\u272El;\u6945im;\u6974l;\u61A3;\u619D\u0100ai\u30D1\u30D5il;\u691Ao\u0100;n\u30DB\u30DC\u6236al\xF3\u0F1E\u0180abr\u30E7\u30EA\u30EEr\xF2\u17E5rk;\u6773\u0100ak\u30F3\u30FDc\u0100ek\u30F9\u30FB;\u407D;\u405D\u0100es\u3102\u3104;\u698Cl\u0100du\u310A\u310C;\u698E;\u6990\u0200aeuy\u3117\u311C\u3127\u3129ron;\u4159\u0100di\u3121\u3125il;\u4157\xEC\u0FF2\xE2\u30FA;\u4440\u0200clqs\u3134\u3137\u313D\u3144a;\u6937dhar;\u6969uo\u0100;r\u020E\u020Dh;\u61B3\u0180acg\u314E\u315F\u0F44l\u0200;ips\u0F78\u3158\u315B\u109Cn\xE5\u10BBar\xF4\u0FA9t;\u65AD\u0180ilr\u3169\u1023\u316Esht;\u697D;\uC000\u{1D52F}\u0100ao\u3177\u3186r\u0100du\u317D\u317F\xBB\u047B\u0100;l\u1091\u3184;\u696C\u0100;v\u318B\u318C\u43C1;\u43F1\u0180gns\u3195\u31F9\u31FCht\u0300ahlrst\u31A4\u31B0\u31C2\u31D8\u31E4\u31EErrow\u0100;t\u0FDC\u31ADa\xE9\u30C8arpoon\u0100du\u31BB\u31BFow\xEE\u317Ep\xBB\u1092eft\u0100ah\u31CA\u31D0rrow\xF3\u0FEAarpoon\xF3\u0551ightarrows;\u61C9quigarro\xF7\u30CBhreetimes;\u62CCg;\u42DAingdotse\xF1\u1F32\u0180ahm\u320D\u3210\u3213r\xF2\u0FEAa\xF2\u0551;\u600Foust\u0100;a\u321E\u321F\u63B1che\xBB\u321Fmid;\u6AEE\u0200abpt\u3232\u323D\u3240\u3252\u0100nr\u3237\u323Ag;\u67EDr;\u61FEr\xEB\u1003\u0180afl\u3247\u324A\u324Er;\u6986;\uC000\u{1D563}us;\u6A2Eimes;\u6A35\u0100ap\u325D\u3267r\u0100;g\u3263\u3264\u4029t;\u6994olint;\u6A12ar\xF2\u31E3\u0200achq\u327B\u3280\u10BC\u3285quo;\u603Ar;\uC000\u{1D4C7}\u0100bu\u30FB\u328Ao\u0100;r\u0214\u0213\u0180hir\u3297\u329B\u32A0re\xE5\u31F8mes;\u62CAi\u0200;efl\u32AA\u1059\u1821\u32AB\u65B9tri;\u69CEluhar;\u6968;\u611E\u0D61\u32D5\u32DB\u32DF\u332C\u3338\u3371\0\u337A\u33A4\0\0\u33EC\u33F0\0\u3428\u3448\u345A\u34AD\u34B1\u34CA\u34F1\0\u3616\0\0\u3633cute;\u415Bqu\xEF\u27BA\u0500;Eaceinpsy\u11ED\u32F3\u32F5\u32FF\u3302\u330B\u330F\u331F\u3326\u3329;\u6AB4\u01F0\u32FA\0\u32FC;\u6AB8on;\u4161u\xE5\u11FE\u0100;d\u11F3\u3307il;\u415Frc;\u415D\u0180Eas\u3316\u3318\u331B;\u6AB6p;\u6ABAim;\u62E9olint;\u6A13i\xED\u1204;\u4441ot\u0180;be\u3334\u1D47\u3335\u62C5;\u6A66\u0380Aacmstx\u3346\u334A\u3357\u335B\u335E\u3363\u336Drr;\u61D8r\u0100hr\u3350\u3352\xEB\u2228\u0100;o\u0A36\u0A34t\u803B\xA7\u40A7i;\u403Bwar;\u6929m\u0100in\u3369\xF0nu\xF3\xF1t;\u6736r\u0100;o\u3376\u2055\uC000\u{1D530}\u0200acoy\u3382\u3386\u3391\u33A0rp;\u666F\u0100hy\u338B\u338Fcy;\u4449;\u4448rt\u026D\u3399\0\0\u339Ci\xE4\u1464ara\xEC\u2E6F\u803B\xAD\u40AD\u0100gm\u33A8\u33B4ma\u0180;fv\u33B1\u33B2\u33B2\u43C3;\u43C2\u0400;deglnpr\u12AB\u33C5\u33C9\u33CE\u33D6\u33DE\u33E1\u33E6ot;\u6A6A\u0100;q\u12B1\u12B0\u0100;E\u33D3\u33D4\u6A9E;\u6AA0\u0100;E\u33DB\u33DC\u6A9D;\u6A9Fe;\u6246lus;\u6A24arr;\u6972ar\xF2\u113D\u0200aeit\u33F8\u3408\u340F\u3417\u0100ls\u33FD\u3404lsetm\xE9\u336Ahp;\u6A33parsl;\u69E4\u0100dl\u1463\u3414e;\u6323\u0100;e\u341C\u341D\u6AAA\u0100;s\u3422\u3423\u6AAC;\uC000\u2AAC\uFE00\u0180flp\u342E\u3433\u3442tcy;\u444C\u0100;b\u3438\u3439\u402F\u0100;a\u343E\u343F\u69C4r;\u633Ff;\uC000\u{1D564}a\u0100dr\u344D\u0402es\u0100;u\u3454\u3455\u6660it\xBB\u3455\u0180csu\u3460\u3479\u349F\u0100au\u3465\u346Fp\u0100;s\u1188\u346B;\uC000\u2293\uFE00p\u0100;s\u11B4\u3475;\uC000\u2294\uFE00u\u0100bp\u347F\u348F\u0180;es\u1197\u119C\u3486et\u0100;e\u1197\u348D\xF1\u119D\u0180;es\u11A8\u11AD\u3496et\u0100;e\u11A8\u349D\xF1\u11AE\u0180;af\u117B\u34A6\u05B0r\u0165\u34AB\u05B1\xBB\u117Car\xF2\u1148\u0200cemt\u34B9\u34BE\u34C2\u34C5r;\uC000\u{1D4C8}tm\xEE\xF1i\xEC\u3415ar\xE6\u11BE\u0100ar\u34CE\u34D5r\u0100;f\u34D4\u17BF\u6606\u0100an\u34DA\u34EDight\u0100ep\u34E3\u34EApsilo\xEE\u1EE0h\xE9\u2EAFs\xBB\u2852\u0280bcmnp\u34FB\u355E\u1209\u358B\u358E\u0480;Edemnprs\u350E\u350F\u3511\u3515\u351E\u3523\u352C\u3531\u3536\u6282;\u6AC5ot;\u6ABD\u0100;d\u11DA\u351Aot;\u6AC3ult;\u6AC1\u0100Ee\u3528\u352A;\u6ACB;\u628Alus;\u6ABFarr;\u6979\u0180eiu\u353D\u3552\u3555t\u0180;en\u350E\u3545\u354Bq\u0100;q\u11DA\u350Feq\u0100;q\u352B\u3528m;\u6AC7\u0100bp\u355A\u355C;\u6AD5;\u6AD3c\u0300;acens\u11ED\u356C\u3572\u3579\u357B\u3326ppro\xF8\u32FAurlye\xF1\u11FE\xF1\u11F3\u0180aes\u3582\u3588\u331Bppro\xF8\u331Aq\xF1\u3317g;\u666A\u0680123;Edehlmnps\u35A9\u35AC\u35AF\u121C\u35B2\u35B4\u35C0\u35C9\u35D5\u35DA\u35DF\u35E8\u35ED\u803B\xB9\u40B9\u803B\xB2\u40B2\u803B\xB3\u40B3;\u6AC6\u0100os\u35B9\u35BCt;\u6ABEub;\u6AD8\u0100;d\u1222\u35C5ot;\u6AC4s\u0100ou\u35CF\u35D2l;\u67C9b;\u6AD7arr;\u697Bult;\u6AC2\u0100Ee\u35E4\u35E6;\u6ACC;\u628Blus;\u6AC0\u0180eiu\u35F4\u3609\u360Ct\u0180;en\u121C\u35FC\u3602q\u0100;q\u1222\u35B2eq\u0100;q\u35E7\u35E4m;\u6AC8\u0100bp\u3611\u3613;\u6AD4;\u6AD6\u0180Aan\u361C\u3620\u362Drr;\u61D9r\u0100hr\u3626\u3628\xEB\u222E\u0100;o\u0A2B\u0A29war;\u692Alig\u803B\xDF\u40DF\u0BE1\u3651\u365D\u3660\u12CE\u3673\u3679\0\u367E\u36C2\0\0\0\0\0\u36DB\u3703\0\u3709\u376C\0\0\0\u3787\u0272\u3656\0\0\u365Bget;\u6316;\u43C4r\xEB\u0E5F\u0180aey\u3666\u366B\u3670ron;\u4165dil;\u4163;\u4442lrec;\u6315r;\uC000\u{1D531}\u0200eiko\u3686\u369D\u36B5\u36BC\u01F2\u368B\0\u3691e\u01004f\u1284\u1281a\u0180;sv\u3698\u3699\u369B\u43B8ym;\u43D1\u0100cn\u36A2\u36B2k\u0100as\u36A8\u36AEppro\xF8\u12C1im\xBB\u12ACs\xF0\u129E\u0100as\u36BA\u36AE\xF0\u12C1rn\u803B\xFE\u40FE\u01EC\u031F\u36C6\u22E7es\u8180\xD7;bd\u36CF\u36D0\u36D8\u40D7\u0100;a\u190F\u36D5r;\u6A31;\u6A30\u0180eps\u36E1\u36E3\u3700\xE1\u2A4D\u0200;bcf\u0486\u36EC\u36F0\u36F4ot;\u6336ir;\u6AF1\u0100;o\u36F9\u36FC\uC000\u{1D565}rk;\u6ADA\xE1\u3362rime;\u6034\u0180aip\u370F\u3712\u3764d\xE5\u1248\u0380adempst\u3721\u374D\u3740\u3751\u3757\u375C\u375Fngle\u0280;dlqr\u3730\u3731\u3736\u3740\u3742\u65B5own\xBB\u1DBBeft\u0100;e\u2800\u373E\xF1\u092E;\u625Cight\u0100;e\u32AA\u374B\xF1\u105Aot;\u65ECinus;\u6A3Alus;\u6A39b;\u69CDime;\u6A3Bezium;\u63E2\u0180cht\u3772\u377D\u3781\u0100ry\u3777\u377B;\uC000\u{1D4C9};\u4446cy;\u445Brok;\u4167\u0100io\u378B\u378Ex\xF4\u1777head\u0100lr\u3797\u37A0eftarro\xF7\u084Fightarrow\xBB\u0F5D\u0900AHabcdfghlmoprstuw\u37D0\u37D3\u37D7\u37E4\u37F0\u37FC\u380E\u381C\u3823\u3834\u3851\u385D\u386B\u38A9\u38CC\u38D2\u38EA\u38F6r\xF2\u03EDar;\u6963\u0100cr\u37DC\u37E2ute\u803B\xFA\u40FA\xF2\u1150r\u01E3\u37EA\0\u37EDy;\u445Eve;\u416D\u0100iy\u37F5\u37FArc\u803B\xFB\u40FB;\u4443\u0180abh\u3803\u3806\u380Br\xF2\u13ADlac;\u4171a\xF2\u13C3\u0100ir\u3813\u3818sht;\u697E;\uC000\u{1D532}rave\u803B\xF9\u40F9\u0161\u3827\u3831r\u0100lr\u382C\u382E\xBB\u0957\xBB\u1083lk;\u6580\u0100ct\u3839\u384D\u026F\u383F\0\0\u384Arn\u0100;e\u3845\u3846\u631Cr\xBB\u3846op;\u630Fri;\u65F8\u0100al\u3856\u385Acr;\u416B\u80BB\xA8\u0349\u0100gp\u3862\u3866on;\u4173f;\uC000\u{1D566}\u0300adhlsu\u114B\u3878\u387D\u1372\u3891\u38A0own\xE1\u13B3arpoon\u0100lr\u3888\u388Cef\xF4\u382Digh\xF4\u382Fi\u0180;hl\u3899\u389A\u389C\u43C5\xBB\u13FAon\xBB\u389Aparrows;\u61C8\u0180cit\u38B0\u38C4\u38C8\u026F\u38B6\0\0\u38C1rn\u0100;e\u38BC\u38BD\u631Dr\xBB\u38BDop;\u630Eng;\u416Fri;\u65F9cr;\uC000\u{1D4CA}\u0180dir\u38D9\u38DD\u38E2ot;\u62F0lde;\u4169i\u0100;f\u3730\u38E8\xBB\u1813\u0100am\u38EF\u38F2r\xF2\u38A8l\u803B\xFC\u40FCangle;\u69A7\u0780ABDacdeflnoprsz\u391C\u391F\u3929\u392D\u39B5\u39B8\u39BD\u39DF\u39E4\u39E8\u39F3\u39F9\u39FD\u3A01\u3A20r\xF2\u03F7ar\u0100;v\u3926\u3927\u6AE8;\u6AE9as\xE8\u03E1\u0100nr\u3932\u3937grt;\u699C\u0380eknprst\u34E3\u3946\u394B\u3952\u395D\u3964\u3996app\xE1\u2415othin\xE7\u1E96\u0180hir\u34EB\u2EC8\u3959op\xF4\u2FB5\u0100;h\u13B7\u3962\xEF\u318D\u0100iu\u3969\u396Dgm\xE1\u33B3\u0100bp\u3972\u3984setneq\u0100;q\u397D\u3980\uC000\u228A\uFE00;\uC000\u2ACB\uFE00setneq\u0100;q\u398F\u3992\uC000\u228B\uFE00;\uC000\u2ACC\uFE00\u0100hr\u399B\u399Fet\xE1\u369Ciangle\u0100lr\u39AA\u39AFeft\xBB\u0925ight\xBB\u1051y;\u4432ash\xBB\u1036\u0180elr\u39C4\u39D2\u39D7\u0180;be\u2DEA\u39CB\u39CFar;\u62BBq;\u625Alip;\u62EE\u0100bt\u39DC\u1468a\xF2\u1469r;\uC000\u{1D533}tr\xE9\u39AEsu\u0100bp\u39EF\u39F1\xBB\u0D1C\xBB\u0D59pf;\uC000\u{1D567}ro\xF0\u0EFBtr\xE9\u39B4\u0100cu\u3A06\u3A0Br;\uC000\u{1D4CB}\u0100bp\u3A10\u3A18n\u0100Ee\u3980\u3A16\xBB\u397En\u0100Ee\u3992\u3A1E\xBB\u3990igzag;\u699A\u0380cefoprs\u3A36\u3A3B\u3A56\u3A5B\u3A54\u3A61\u3A6Airc;\u4175\u0100di\u3A40\u3A51\u0100bg\u3A45\u3A49ar;\u6A5Fe\u0100;q\u15FA\u3A4F;\u6259erp;\u6118r;\uC000\u{1D534}pf;\uC000\u{1D568}\u0100;e\u1479\u3A66at\xE8\u1479cr;\uC000\u{1D4CC}\u0AE3\u178E\u3A87\0\u3A8B\0\u3A90\u3A9B\0\0\u3A9D\u3AA8\u3AAB\u3AAF\0\0\u3AC3\u3ACE\0\u3AD8\u17DC\u17DFtr\xE9\u17D1r;\uC000\u{1D535}\u0100Aa\u3A94\u3A97r\xF2\u03C3r\xF2\u09F6;\u43BE\u0100Aa\u3AA1\u3AA4r\xF2\u03B8r\xF2\u09EBa\xF0\u2713is;\u62FB\u0180dpt\u17A4\u3AB5\u3ABE\u0100fl\u3ABA\u17A9;\uC000\u{1D569}im\xE5\u17B2\u0100Aa\u3AC7\u3ACAr\xF2\u03CEr\xF2\u0A01\u0100cq\u3AD2\u17B8r;\uC000\u{1D4CD}\u0100pt\u17D6\u3ADCr\xE9\u17D4\u0400acefiosu\u3AF0\u3AFD\u3B08\u3B0C\u3B11\u3B15\u3B1B\u3B21c\u0100uy\u3AF6\u3AFBte\u803B\xFD\u40FD;\u444F\u0100iy\u3B02\u3B06rc;\u4177;\u444Bn\u803B\xA5\u40A5r;\uC000\u{1D536}cy;\u4457pf;\uC000\u{1D56A}cr;\uC000\u{1D4CE}\u0100cm\u3B26\u3B29y;\u444El\u803B\xFF\u40FF\u0500acdefhiosw\u3B42\u3B48\u3B54\u3B58\u3B64\u3B69\u3B6D\u3B74\u3B7A\u3B80cute;\u417A\u0100ay\u3B4D\u3B52ron;\u417E;\u4437ot;\u417C\u0100et\u3B5D\u3B61tr\xE6\u155Fa;\u43B6r;\uC000\u{1D537}cy;\u4436grarr;\u61DDpf;\uC000\u{1D56B}cr;\uC000\u{1D4CF}\u0100jn\u3B85\u3B87;\u600Dj;\u600C'.split("").map((c) => c.charCodeAt(0))
    );
  }
});

// node_modules/entities/dist/esm/generated/decode-data-xml.js
var init_decode_data_xml = __esm({
  "node_modules/entities/dist/esm/generated/decode-data-xml.js"() {
  }
});

// node_modules/entities/dist/esm/decode-codepoint.js
function replaceCodePoint(codePoint) {
  var _a2;
  if (codePoint >= 55296 && codePoint <= 57343 || codePoint > 1114111) {
    return 65533;
  }
  return (_a2 = decodeMap.get(codePoint)) !== null && _a2 !== void 0 ? _a2 : codePoint;
}
var _a, decodeMap, fromCodePoint;
var init_decode_codepoint = __esm({
  "node_modules/entities/dist/esm/decode-codepoint.js"() {
    decodeMap = /* @__PURE__ */ new Map([
      [0, 65533],
      // C1 Unicode control character reference replacements
      [128, 8364],
      [130, 8218],
      [131, 402],
      [132, 8222],
      [133, 8230],
      [134, 8224],
      [135, 8225],
      [136, 710],
      [137, 8240],
      [138, 352],
      [139, 8249],
      [140, 338],
      [142, 381],
      [145, 8216],
      [146, 8217],
      [147, 8220],
      [148, 8221],
      [149, 8226],
      [150, 8211],
      [151, 8212],
      [152, 732],
      [153, 8482],
      [154, 353],
      [155, 8250],
      [156, 339],
      [158, 382],
      [159, 376]
    ]);
    fromCodePoint = // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, n/no-unsupported-features/es-builtins
    (_a = String.fromCodePoint) !== null && _a !== void 0 ? _a : function(codePoint) {
      let output = "";
      if (codePoint > 65535) {
        codePoint -= 65536;
        output += String.fromCharCode(codePoint >>> 10 & 1023 | 55296);
        codePoint = 56320 | codePoint & 1023;
      }
      output += String.fromCharCode(codePoint);
      return output;
    };
  }
});

// node_modules/entities/dist/esm/decode.js
function isNumber(code) {
  return code >= CharCodes.ZERO && code <= CharCodes.NINE;
}
function isHexadecimalCharacter(code) {
  return code >= CharCodes.UPPER_A && code <= CharCodes.UPPER_F || code >= CharCodes.LOWER_A && code <= CharCodes.LOWER_F;
}
function isAsciiAlphaNumeric(code) {
  return code >= CharCodes.UPPER_A && code <= CharCodes.UPPER_Z || code >= CharCodes.LOWER_A && code <= CharCodes.LOWER_Z || isNumber(code);
}
function isEntityInAttributeInvalidEnd(code) {
  return code === CharCodes.EQUALS || isAsciiAlphaNumeric(code);
}
function determineBranch(decodeTree, current, nodeIndex, char) {
  const branchCount = (current & BinTrieFlags.BRANCH_LENGTH) >> 7;
  const jumpOffset = current & BinTrieFlags.JUMP_TABLE;
  if (branchCount === 0) {
    return jumpOffset !== 0 && char === jumpOffset ? nodeIndex : -1;
  }
  if (jumpOffset) {
    const value = char - jumpOffset;
    return value < 0 || value >= branchCount ? -1 : decodeTree[nodeIndex + value] - 1;
  }
  let lo = nodeIndex;
  let hi = lo + branchCount - 1;
  while (lo <= hi) {
    const mid = lo + hi >>> 1;
    const midValue = decodeTree[mid];
    if (midValue < char) {
      lo = mid + 1;
    } else if (midValue > char) {
      hi = mid - 1;
    } else {
      return decodeTree[mid + branchCount];
    }
  }
  return -1;
}
var CharCodes, TO_LOWER_BIT, BinTrieFlags, EntityDecoderState, DecodingMode, EntityDecoder;
var init_decode = __esm({
  "node_modules/entities/dist/esm/decode.js"() {
    init_decode_data_html();
    init_decode_data_xml();
    init_decode_codepoint();
    init_decode_data_html();
    init_decode_data_xml();
    init_decode_codepoint();
    (function(CharCodes2) {
      CharCodes2[CharCodes2["NUM"] = 35] = "NUM";
      CharCodes2[CharCodes2["SEMI"] = 59] = "SEMI";
      CharCodes2[CharCodes2["EQUALS"] = 61] = "EQUALS";
      CharCodes2[CharCodes2["ZERO"] = 48] = "ZERO";
      CharCodes2[CharCodes2["NINE"] = 57] = "NINE";
      CharCodes2[CharCodes2["LOWER_A"] = 97] = "LOWER_A";
      CharCodes2[CharCodes2["LOWER_F"] = 102] = "LOWER_F";
      CharCodes2[CharCodes2["LOWER_X"] = 120] = "LOWER_X";
      CharCodes2[CharCodes2["LOWER_Z"] = 122] = "LOWER_Z";
      CharCodes2[CharCodes2["UPPER_A"] = 65] = "UPPER_A";
      CharCodes2[CharCodes2["UPPER_F"] = 70] = "UPPER_F";
      CharCodes2[CharCodes2["UPPER_Z"] = 90] = "UPPER_Z";
    })(CharCodes || (CharCodes = {}));
    TO_LOWER_BIT = 32;
    (function(BinTrieFlags2) {
      BinTrieFlags2[BinTrieFlags2["VALUE_LENGTH"] = 49152] = "VALUE_LENGTH";
      BinTrieFlags2[BinTrieFlags2["BRANCH_LENGTH"] = 16256] = "BRANCH_LENGTH";
      BinTrieFlags2[BinTrieFlags2["JUMP_TABLE"] = 127] = "JUMP_TABLE";
    })(BinTrieFlags || (BinTrieFlags = {}));
    (function(EntityDecoderState2) {
      EntityDecoderState2[EntityDecoderState2["EntityStart"] = 0] = "EntityStart";
      EntityDecoderState2[EntityDecoderState2["NumericStart"] = 1] = "NumericStart";
      EntityDecoderState2[EntityDecoderState2["NumericDecimal"] = 2] = "NumericDecimal";
      EntityDecoderState2[EntityDecoderState2["NumericHex"] = 3] = "NumericHex";
      EntityDecoderState2[EntityDecoderState2["NamedEntity"] = 4] = "NamedEntity";
    })(EntityDecoderState || (EntityDecoderState = {}));
    (function(DecodingMode2) {
      DecodingMode2[DecodingMode2["Legacy"] = 0] = "Legacy";
      DecodingMode2[DecodingMode2["Strict"] = 1] = "Strict";
      DecodingMode2[DecodingMode2["Attribute"] = 2] = "Attribute";
    })(DecodingMode || (DecodingMode = {}));
    EntityDecoder = class {
      constructor(decodeTree, emitCodePoint, errors) {
        this.decodeTree = decodeTree;
        this.emitCodePoint = emitCodePoint;
        this.errors = errors;
        this.state = EntityDecoderState.EntityStart;
        this.consumed = 1;
        this.result = 0;
        this.treeIndex = 0;
        this.excess = 1;
        this.decodeMode = DecodingMode.Strict;
      }
      /** Resets the instance to make it reusable. */
      startEntity(decodeMode) {
        this.decodeMode = decodeMode;
        this.state = EntityDecoderState.EntityStart;
        this.result = 0;
        this.treeIndex = 0;
        this.excess = 1;
        this.consumed = 1;
      }
      /**
       * Write an entity to the decoder. This can be called multiple times with partial entities.
       * If the entity is incomplete, the decoder will return -1.
       *
       * Mirrors the implementation of `getDecoder`, but with the ability to stop decoding if the
       * entity is incomplete, and resume when the next string is written.
       *
       * @param input The string containing the entity (or a continuation of the entity).
       * @param offset The offset at which the entity begins. Should be 0 if this is not the first call.
       * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
       */
      write(input, offset) {
        switch (this.state) {
          case EntityDecoderState.EntityStart: {
            if (input.charCodeAt(offset) === CharCodes.NUM) {
              this.state = EntityDecoderState.NumericStart;
              this.consumed += 1;
              return this.stateNumericStart(input, offset + 1);
            }
            this.state = EntityDecoderState.NamedEntity;
            return this.stateNamedEntity(input, offset);
          }
          case EntityDecoderState.NumericStart: {
            return this.stateNumericStart(input, offset);
          }
          case EntityDecoderState.NumericDecimal: {
            return this.stateNumericDecimal(input, offset);
          }
          case EntityDecoderState.NumericHex: {
            return this.stateNumericHex(input, offset);
          }
          case EntityDecoderState.NamedEntity: {
            return this.stateNamedEntity(input, offset);
          }
        }
      }
      /**
       * Switches between the numeric decimal and hexadecimal states.
       *
       * Equivalent to the `Numeric character reference state` in the HTML spec.
       *
       * @param input The string containing the entity (or a continuation of the entity).
       * @param offset The current offset.
       * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
       */
      stateNumericStart(input, offset) {
        if (offset >= input.length) {
          return -1;
        }
        if ((input.charCodeAt(offset) | TO_LOWER_BIT) === CharCodes.LOWER_X) {
          this.state = EntityDecoderState.NumericHex;
          this.consumed += 1;
          return this.stateNumericHex(input, offset + 1);
        }
        this.state = EntityDecoderState.NumericDecimal;
        return this.stateNumericDecimal(input, offset);
      }
      addToNumericResult(input, start, end, base) {
        if (start !== end) {
          const digitCount = end - start;
          this.result = this.result * Math.pow(base, digitCount) + Number.parseInt(input.substr(start, digitCount), base);
          this.consumed += digitCount;
        }
      }
      /**
       * Parses a hexadecimal numeric entity.
       *
       * Equivalent to the `Hexademical character reference state` in the HTML spec.
       *
       * @param input The string containing the entity (or a continuation of the entity).
       * @param offset The current offset.
       * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
       */
      stateNumericHex(input, offset) {
        const startIndex = offset;
        while (offset < input.length) {
          const char = input.charCodeAt(offset);
          if (isNumber(char) || isHexadecimalCharacter(char)) {
            offset += 1;
          } else {
            this.addToNumericResult(input, startIndex, offset, 16);
            return this.emitNumericEntity(char, 3);
          }
        }
        this.addToNumericResult(input, startIndex, offset, 16);
        return -1;
      }
      /**
       * Parses a decimal numeric entity.
       *
       * Equivalent to the `Decimal character reference state` in the HTML spec.
       *
       * @param input The string containing the entity (or a continuation of the entity).
       * @param offset The current offset.
       * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
       */
      stateNumericDecimal(input, offset) {
        const startIndex = offset;
        while (offset < input.length) {
          const char = input.charCodeAt(offset);
          if (isNumber(char)) {
            offset += 1;
          } else {
            this.addToNumericResult(input, startIndex, offset, 10);
            return this.emitNumericEntity(char, 2);
          }
        }
        this.addToNumericResult(input, startIndex, offset, 10);
        return -1;
      }
      /**
       * Validate and emit a numeric entity.
       *
       * Implements the logic from the `Hexademical character reference start
       * state` and `Numeric character reference end state` in the HTML spec.
       *
       * @param lastCp The last code point of the entity. Used to see if the
       *               entity was terminated with a semicolon.
       * @param expectedLength The minimum number of characters that should be
       *                       consumed. Used to validate that at least one digit
       *                       was consumed.
       * @returns The number of characters that were consumed.
       */
      emitNumericEntity(lastCp, expectedLength) {
        var _a2;
        if (this.consumed <= expectedLength) {
          (_a2 = this.errors) === null || _a2 === void 0 ? void 0 : _a2.absenceOfDigitsInNumericCharacterReference(this.consumed);
          return 0;
        }
        if (lastCp === CharCodes.SEMI) {
          this.consumed += 1;
        } else if (this.decodeMode === DecodingMode.Strict) {
          return 0;
        }
        this.emitCodePoint(replaceCodePoint(this.result), this.consumed);
        if (this.errors) {
          if (lastCp !== CharCodes.SEMI) {
            this.errors.missingSemicolonAfterCharacterReference();
          }
          this.errors.validateNumericCharacterReference(this.result);
        }
        return this.consumed;
      }
      /**
       * Parses a named entity.
       *
       * Equivalent to the `Named character reference state` in the HTML spec.
       *
       * @param input The string containing the entity (or a continuation of the entity).
       * @param offset The current offset.
       * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
       */
      stateNamedEntity(input, offset) {
        const { decodeTree } = this;
        let current = decodeTree[this.treeIndex];
        let valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;
        for (; offset < input.length; offset++, this.excess++) {
          const char = input.charCodeAt(offset);
          this.treeIndex = determineBranch(decodeTree, current, this.treeIndex + Math.max(1, valueLength), char);
          if (this.treeIndex < 0) {
            return this.result === 0 || // If we are parsing an attribute
            this.decodeMode === DecodingMode.Attribute && // We shouldn't have consumed any characters after the entity,
            (valueLength === 0 || // And there should be no invalid characters.
            isEntityInAttributeInvalidEnd(char)) ? 0 : this.emitNotTerminatedNamedEntity();
          }
          current = decodeTree[this.treeIndex];
          valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;
          if (valueLength !== 0) {
            if (char === CharCodes.SEMI) {
              return this.emitNamedEntityData(this.treeIndex, valueLength, this.consumed + this.excess);
            }
            if (this.decodeMode !== DecodingMode.Strict) {
              this.result = this.treeIndex;
              this.consumed += this.excess;
              this.excess = 0;
            }
          }
        }
        return -1;
      }
      /**
       * Emit a named entity that was not terminated with a semicolon.
       *
       * @returns The number of characters consumed.
       */
      emitNotTerminatedNamedEntity() {
        var _a2;
        const { result, decodeTree } = this;
        const valueLength = (decodeTree[result] & BinTrieFlags.VALUE_LENGTH) >> 14;
        this.emitNamedEntityData(result, valueLength, this.consumed);
        (_a2 = this.errors) === null || _a2 === void 0 ? void 0 : _a2.missingSemicolonAfterCharacterReference();
        return this.consumed;
      }
      /**
       * Emit a named entity.
       *
       * @param result The index of the entity in the decode tree.
       * @param valueLength The number of bytes in the entity.
       * @param consumed The number of characters consumed.
       *
       * @returns The number of characters consumed.
       */
      emitNamedEntityData(result, valueLength, consumed) {
        const { decodeTree } = this;
        this.emitCodePoint(valueLength === 1 ? decodeTree[result] & ~BinTrieFlags.VALUE_LENGTH : decodeTree[result + 1], consumed);
        if (valueLength === 3) {
          this.emitCodePoint(decodeTree[result + 2], consumed);
        }
        return consumed;
      }
      /**
       * Signal to the parser that the end of the input was reached.
       *
       * Remaining data will be emitted and relevant errors will be produced.
       *
       * @returns The number of characters consumed.
       */
      end() {
        var _a2;
        switch (this.state) {
          case EntityDecoderState.NamedEntity: {
            return this.result !== 0 && (this.decodeMode !== DecodingMode.Attribute || this.result === this.treeIndex) ? this.emitNotTerminatedNamedEntity() : 0;
          }
          // Otherwise, emit a numeric entity if we have one.
          case EntityDecoderState.NumericDecimal: {
            return this.emitNumericEntity(0, 2);
          }
          case EntityDecoderState.NumericHex: {
            return this.emitNumericEntity(0, 3);
          }
          case EntityDecoderState.NumericStart: {
            (_a2 = this.errors) === null || _a2 === void 0 ? void 0 : _a2.absenceOfDigitsInNumericCharacterReference(this.consumed);
            return 0;
          }
          case EntityDecoderState.EntityStart: {
            return 0;
          }
        }
      }
    };
  }
});

// node_modules/parse5/dist/common/html.js
function getTagID(tagName) {
  var _a2;
  return (_a2 = TAG_NAME_TO_ID.get(tagName)) !== null && _a2 !== void 0 ? _a2 : TAG_ID.UNKNOWN;
}
function hasUnescapedText(tn, scriptingEnabled) {
  return UNESCAPED_TEXT.has(tn) || scriptingEnabled && tn === TAG_NAMES.NOSCRIPT;
}
var NS, ATTRS, DOCUMENT_MODE, TAG_NAMES, TAG_ID, TAG_NAME_TO_ID, $, SPECIAL_ELEMENTS, NUMBERED_HEADERS, UNESCAPED_TEXT;
var init_html = __esm({
  "node_modules/parse5/dist/common/html.js"() {
    (function(NS2) {
      NS2["HTML"] = "http://www.w3.org/1999/xhtml";
      NS2["MATHML"] = "http://www.w3.org/1998/Math/MathML";
      NS2["SVG"] = "http://www.w3.org/2000/svg";
      NS2["XLINK"] = "http://www.w3.org/1999/xlink";
      NS2["XML"] = "http://www.w3.org/XML/1998/namespace";
      NS2["XMLNS"] = "http://www.w3.org/2000/xmlns/";
    })(NS || (NS = {}));
    (function(ATTRS2) {
      ATTRS2["TYPE"] = "type";
      ATTRS2["ACTION"] = "action";
      ATTRS2["ENCODING"] = "encoding";
      ATTRS2["PROMPT"] = "prompt";
      ATTRS2["NAME"] = "name";
      ATTRS2["COLOR"] = "color";
      ATTRS2["FACE"] = "face";
      ATTRS2["SIZE"] = "size";
    })(ATTRS || (ATTRS = {}));
    (function(DOCUMENT_MODE2) {
      DOCUMENT_MODE2["NO_QUIRKS"] = "no-quirks";
      DOCUMENT_MODE2["QUIRKS"] = "quirks";
      DOCUMENT_MODE2["LIMITED_QUIRKS"] = "limited-quirks";
    })(DOCUMENT_MODE || (DOCUMENT_MODE = {}));
    (function(TAG_NAMES2) {
      TAG_NAMES2["A"] = "a";
      TAG_NAMES2["ADDRESS"] = "address";
      TAG_NAMES2["ANNOTATION_XML"] = "annotation-xml";
      TAG_NAMES2["APPLET"] = "applet";
      TAG_NAMES2["AREA"] = "area";
      TAG_NAMES2["ARTICLE"] = "article";
      TAG_NAMES2["ASIDE"] = "aside";
      TAG_NAMES2["B"] = "b";
      TAG_NAMES2["BASE"] = "base";
      TAG_NAMES2["BASEFONT"] = "basefont";
      TAG_NAMES2["BGSOUND"] = "bgsound";
      TAG_NAMES2["BIG"] = "big";
      TAG_NAMES2["BLOCKQUOTE"] = "blockquote";
      TAG_NAMES2["BODY"] = "body";
      TAG_NAMES2["BR"] = "br";
      TAG_NAMES2["BUTTON"] = "button";
      TAG_NAMES2["CAPTION"] = "caption";
      TAG_NAMES2["CENTER"] = "center";
      TAG_NAMES2["CODE"] = "code";
      TAG_NAMES2["COL"] = "col";
      TAG_NAMES2["COLGROUP"] = "colgroup";
      TAG_NAMES2["DD"] = "dd";
      TAG_NAMES2["DESC"] = "desc";
      TAG_NAMES2["DETAILS"] = "details";
      TAG_NAMES2["DIALOG"] = "dialog";
      TAG_NAMES2["DIR"] = "dir";
      TAG_NAMES2["DIV"] = "div";
      TAG_NAMES2["DL"] = "dl";
      TAG_NAMES2["DT"] = "dt";
      TAG_NAMES2["EM"] = "em";
      TAG_NAMES2["EMBED"] = "embed";
      TAG_NAMES2["FIELDSET"] = "fieldset";
      TAG_NAMES2["FIGCAPTION"] = "figcaption";
      TAG_NAMES2["FIGURE"] = "figure";
      TAG_NAMES2["FONT"] = "font";
      TAG_NAMES2["FOOTER"] = "footer";
      TAG_NAMES2["FOREIGN_OBJECT"] = "foreignObject";
      TAG_NAMES2["FORM"] = "form";
      TAG_NAMES2["FRAME"] = "frame";
      TAG_NAMES2["FRAMESET"] = "frameset";
      TAG_NAMES2["H1"] = "h1";
      TAG_NAMES2["H2"] = "h2";
      TAG_NAMES2["H3"] = "h3";
      TAG_NAMES2["H4"] = "h4";
      TAG_NAMES2["H5"] = "h5";
      TAG_NAMES2["H6"] = "h6";
      TAG_NAMES2["HEAD"] = "head";
      TAG_NAMES2["HEADER"] = "header";
      TAG_NAMES2["HGROUP"] = "hgroup";
      TAG_NAMES2["HR"] = "hr";
      TAG_NAMES2["HTML"] = "html";
      TAG_NAMES2["I"] = "i";
      TAG_NAMES2["IMG"] = "img";
      TAG_NAMES2["IMAGE"] = "image";
      TAG_NAMES2["INPUT"] = "input";
      TAG_NAMES2["IFRAME"] = "iframe";
      TAG_NAMES2["KEYGEN"] = "keygen";
      TAG_NAMES2["LABEL"] = "label";
      TAG_NAMES2["LI"] = "li";
      TAG_NAMES2["LINK"] = "link";
      TAG_NAMES2["LISTING"] = "listing";
      TAG_NAMES2["MAIN"] = "main";
      TAG_NAMES2["MALIGNMARK"] = "malignmark";
      TAG_NAMES2["MARQUEE"] = "marquee";
      TAG_NAMES2["MATH"] = "math";
      TAG_NAMES2["MENU"] = "menu";
      TAG_NAMES2["META"] = "meta";
      TAG_NAMES2["MGLYPH"] = "mglyph";
      TAG_NAMES2["MI"] = "mi";
      TAG_NAMES2["MO"] = "mo";
      TAG_NAMES2["MN"] = "mn";
      TAG_NAMES2["MS"] = "ms";
      TAG_NAMES2["MTEXT"] = "mtext";
      TAG_NAMES2["NAV"] = "nav";
      TAG_NAMES2["NOBR"] = "nobr";
      TAG_NAMES2["NOFRAMES"] = "noframes";
      TAG_NAMES2["NOEMBED"] = "noembed";
      TAG_NAMES2["NOSCRIPT"] = "noscript";
      TAG_NAMES2["OBJECT"] = "object";
      TAG_NAMES2["OL"] = "ol";
      TAG_NAMES2["OPTGROUP"] = "optgroup";
      TAG_NAMES2["OPTION"] = "option";
      TAG_NAMES2["P"] = "p";
      TAG_NAMES2["PARAM"] = "param";
      TAG_NAMES2["PLAINTEXT"] = "plaintext";
      TAG_NAMES2["PRE"] = "pre";
      TAG_NAMES2["RB"] = "rb";
      TAG_NAMES2["RP"] = "rp";
      TAG_NAMES2["RT"] = "rt";
      TAG_NAMES2["RTC"] = "rtc";
      TAG_NAMES2["RUBY"] = "ruby";
      TAG_NAMES2["S"] = "s";
      TAG_NAMES2["SCRIPT"] = "script";
      TAG_NAMES2["SEARCH"] = "search";
      TAG_NAMES2["SECTION"] = "section";
      TAG_NAMES2["SELECT"] = "select";
      TAG_NAMES2["SOURCE"] = "source";
      TAG_NAMES2["SMALL"] = "small";
      TAG_NAMES2["SPAN"] = "span";
      TAG_NAMES2["STRIKE"] = "strike";
      TAG_NAMES2["STRONG"] = "strong";
      TAG_NAMES2["STYLE"] = "style";
      TAG_NAMES2["SUB"] = "sub";
      TAG_NAMES2["SUMMARY"] = "summary";
      TAG_NAMES2["SUP"] = "sup";
      TAG_NAMES2["TABLE"] = "table";
      TAG_NAMES2["TBODY"] = "tbody";
      TAG_NAMES2["TEMPLATE"] = "template";
      TAG_NAMES2["TEXTAREA"] = "textarea";
      TAG_NAMES2["TFOOT"] = "tfoot";
      TAG_NAMES2["TD"] = "td";
      TAG_NAMES2["TH"] = "th";
      TAG_NAMES2["THEAD"] = "thead";
      TAG_NAMES2["TITLE"] = "title";
      TAG_NAMES2["TR"] = "tr";
      TAG_NAMES2["TRACK"] = "track";
      TAG_NAMES2["TT"] = "tt";
      TAG_NAMES2["U"] = "u";
      TAG_NAMES2["UL"] = "ul";
      TAG_NAMES2["SVG"] = "svg";
      TAG_NAMES2["VAR"] = "var";
      TAG_NAMES2["WBR"] = "wbr";
      TAG_NAMES2["XMP"] = "xmp";
    })(TAG_NAMES || (TAG_NAMES = {}));
    (function(TAG_ID2) {
      TAG_ID2[TAG_ID2["UNKNOWN"] = 0] = "UNKNOWN";
      TAG_ID2[TAG_ID2["A"] = 1] = "A";
      TAG_ID2[TAG_ID2["ADDRESS"] = 2] = "ADDRESS";
      TAG_ID2[TAG_ID2["ANNOTATION_XML"] = 3] = "ANNOTATION_XML";
      TAG_ID2[TAG_ID2["APPLET"] = 4] = "APPLET";
      TAG_ID2[TAG_ID2["AREA"] = 5] = "AREA";
      TAG_ID2[TAG_ID2["ARTICLE"] = 6] = "ARTICLE";
      TAG_ID2[TAG_ID2["ASIDE"] = 7] = "ASIDE";
      TAG_ID2[TAG_ID2["B"] = 8] = "B";
      TAG_ID2[TAG_ID2["BASE"] = 9] = "BASE";
      TAG_ID2[TAG_ID2["BASEFONT"] = 10] = "BASEFONT";
      TAG_ID2[TAG_ID2["BGSOUND"] = 11] = "BGSOUND";
      TAG_ID2[TAG_ID2["BIG"] = 12] = "BIG";
      TAG_ID2[TAG_ID2["BLOCKQUOTE"] = 13] = "BLOCKQUOTE";
      TAG_ID2[TAG_ID2["BODY"] = 14] = "BODY";
      TAG_ID2[TAG_ID2["BR"] = 15] = "BR";
      TAG_ID2[TAG_ID2["BUTTON"] = 16] = "BUTTON";
      TAG_ID2[TAG_ID2["CAPTION"] = 17] = "CAPTION";
      TAG_ID2[TAG_ID2["CENTER"] = 18] = "CENTER";
      TAG_ID2[TAG_ID2["CODE"] = 19] = "CODE";
      TAG_ID2[TAG_ID2["COL"] = 20] = "COL";
      TAG_ID2[TAG_ID2["COLGROUP"] = 21] = "COLGROUP";
      TAG_ID2[TAG_ID2["DD"] = 22] = "DD";
      TAG_ID2[TAG_ID2["DESC"] = 23] = "DESC";
      TAG_ID2[TAG_ID2["DETAILS"] = 24] = "DETAILS";
      TAG_ID2[TAG_ID2["DIALOG"] = 25] = "DIALOG";
      TAG_ID2[TAG_ID2["DIR"] = 26] = "DIR";
      TAG_ID2[TAG_ID2["DIV"] = 27] = "DIV";
      TAG_ID2[TAG_ID2["DL"] = 28] = "DL";
      TAG_ID2[TAG_ID2["DT"] = 29] = "DT";
      TAG_ID2[TAG_ID2["EM"] = 30] = "EM";
      TAG_ID2[TAG_ID2["EMBED"] = 31] = "EMBED";
      TAG_ID2[TAG_ID2["FIELDSET"] = 32] = "FIELDSET";
      TAG_ID2[TAG_ID2["FIGCAPTION"] = 33] = "FIGCAPTION";
      TAG_ID2[TAG_ID2["FIGURE"] = 34] = "FIGURE";
      TAG_ID2[TAG_ID2["FONT"] = 35] = "FONT";
      TAG_ID2[TAG_ID2["FOOTER"] = 36] = "FOOTER";
      TAG_ID2[TAG_ID2["FOREIGN_OBJECT"] = 37] = "FOREIGN_OBJECT";
      TAG_ID2[TAG_ID2["FORM"] = 38] = "FORM";
      TAG_ID2[TAG_ID2["FRAME"] = 39] = "FRAME";
      TAG_ID2[TAG_ID2["FRAMESET"] = 40] = "FRAMESET";
      TAG_ID2[TAG_ID2["H1"] = 41] = "H1";
      TAG_ID2[TAG_ID2["H2"] = 42] = "H2";
      TAG_ID2[TAG_ID2["H3"] = 43] = "H3";
      TAG_ID2[TAG_ID2["H4"] = 44] = "H4";
      TAG_ID2[TAG_ID2["H5"] = 45] = "H5";
      TAG_ID2[TAG_ID2["H6"] = 46] = "H6";
      TAG_ID2[TAG_ID2["HEAD"] = 47] = "HEAD";
      TAG_ID2[TAG_ID2["HEADER"] = 48] = "HEADER";
      TAG_ID2[TAG_ID2["HGROUP"] = 49] = "HGROUP";
      TAG_ID2[TAG_ID2["HR"] = 50] = "HR";
      TAG_ID2[TAG_ID2["HTML"] = 51] = "HTML";
      TAG_ID2[TAG_ID2["I"] = 52] = "I";
      TAG_ID2[TAG_ID2["IMG"] = 53] = "IMG";
      TAG_ID2[TAG_ID2["IMAGE"] = 54] = "IMAGE";
      TAG_ID2[TAG_ID2["INPUT"] = 55] = "INPUT";
      TAG_ID2[TAG_ID2["IFRAME"] = 56] = "IFRAME";
      TAG_ID2[TAG_ID2["KEYGEN"] = 57] = "KEYGEN";
      TAG_ID2[TAG_ID2["LABEL"] = 58] = "LABEL";
      TAG_ID2[TAG_ID2["LI"] = 59] = "LI";
      TAG_ID2[TAG_ID2["LINK"] = 60] = "LINK";
      TAG_ID2[TAG_ID2["LISTING"] = 61] = "LISTING";
      TAG_ID2[TAG_ID2["MAIN"] = 62] = "MAIN";
      TAG_ID2[TAG_ID2["MALIGNMARK"] = 63] = "MALIGNMARK";
      TAG_ID2[TAG_ID2["MARQUEE"] = 64] = "MARQUEE";
      TAG_ID2[TAG_ID2["MATH"] = 65] = "MATH";
      TAG_ID2[TAG_ID2["MENU"] = 66] = "MENU";
      TAG_ID2[TAG_ID2["META"] = 67] = "META";
      TAG_ID2[TAG_ID2["MGLYPH"] = 68] = "MGLYPH";
      TAG_ID2[TAG_ID2["MI"] = 69] = "MI";
      TAG_ID2[TAG_ID2["MO"] = 70] = "MO";
      TAG_ID2[TAG_ID2["MN"] = 71] = "MN";
      TAG_ID2[TAG_ID2["MS"] = 72] = "MS";
      TAG_ID2[TAG_ID2["MTEXT"] = 73] = "MTEXT";
      TAG_ID2[TAG_ID2["NAV"] = 74] = "NAV";
      TAG_ID2[TAG_ID2["NOBR"] = 75] = "NOBR";
      TAG_ID2[TAG_ID2["NOFRAMES"] = 76] = "NOFRAMES";
      TAG_ID2[TAG_ID2["NOEMBED"] = 77] = "NOEMBED";
      TAG_ID2[TAG_ID2["NOSCRIPT"] = 78] = "NOSCRIPT";
      TAG_ID2[TAG_ID2["OBJECT"] = 79] = "OBJECT";
      TAG_ID2[TAG_ID2["OL"] = 80] = "OL";
      TAG_ID2[TAG_ID2["OPTGROUP"] = 81] = "OPTGROUP";
      TAG_ID2[TAG_ID2["OPTION"] = 82] = "OPTION";
      TAG_ID2[TAG_ID2["P"] = 83] = "P";
      TAG_ID2[TAG_ID2["PARAM"] = 84] = "PARAM";
      TAG_ID2[TAG_ID2["PLAINTEXT"] = 85] = "PLAINTEXT";
      TAG_ID2[TAG_ID2["PRE"] = 86] = "PRE";
      TAG_ID2[TAG_ID2["RB"] = 87] = "RB";
      TAG_ID2[TAG_ID2["RP"] = 88] = "RP";
      TAG_ID2[TAG_ID2["RT"] = 89] = "RT";
      TAG_ID2[TAG_ID2["RTC"] = 90] = "RTC";
      TAG_ID2[TAG_ID2["RUBY"] = 91] = "RUBY";
      TAG_ID2[TAG_ID2["S"] = 92] = "S";
      TAG_ID2[TAG_ID2["SCRIPT"] = 93] = "SCRIPT";
      TAG_ID2[TAG_ID2["SEARCH"] = 94] = "SEARCH";
      TAG_ID2[TAG_ID2["SECTION"] = 95] = "SECTION";
      TAG_ID2[TAG_ID2["SELECT"] = 96] = "SELECT";
      TAG_ID2[TAG_ID2["SOURCE"] = 97] = "SOURCE";
      TAG_ID2[TAG_ID2["SMALL"] = 98] = "SMALL";
      TAG_ID2[TAG_ID2["SPAN"] = 99] = "SPAN";
      TAG_ID2[TAG_ID2["STRIKE"] = 100] = "STRIKE";
      TAG_ID2[TAG_ID2["STRONG"] = 101] = "STRONG";
      TAG_ID2[TAG_ID2["STYLE"] = 102] = "STYLE";
      TAG_ID2[TAG_ID2["SUB"] = 103] = "SUB";
      TAG_ID2[TAG_ID2["SUMMARY"] = 104] = "SUMMARY";
      TAG_ID2[TAG_ID2["SUP"] = 105] = "SUP";
      TAG_ID2[TAG_ID2["TABLE"] = 106] = "TABLE";
      TAG_ID2[TAG_ID2["TBODY"] = 107] = "TBODY";
      TAG_ID2[TAG_ID2["TEMPLATE"] = 108] = "TEMPLATE";
      TAG_ID2[TAG_ID2["TEXTAREA"] = 109] = "TEXTAREA";
      TAG_ID2[TAG_ID2["TFOOT"] = 110] = "TFOOT";
      TAG_ID2[TAG_ID2["TD"] = 111] = "TD";
      TAG_ID2[TAG_ID2["TH"] = 112] = "TH";
      TAG_ID2[TAG_ID2["THEAD"] = 113] = "THEAD";
      TAG_ID2[TAG_ID2["TITLE"] = 114] = "TITLE";
      TAG_ID2[TAG_ID2["TR"] = 115] = "TR";
      TAG_ID2[TAG_ID2["TRACK"] = 116] = "TRACK";
      TAG_ID2[TAG_ID2["TT"] = 117] = "TT";
      TAG_ID2[TAG_ID2["U"] = 118] = "U";
      TAG_ID2[TAG_ID2["UL"] = 119] = "UL";
      TAG_ID2[TAG_ID2["SVG"] = 120] = "SVG";
      TAG_ID2[TAG_ID2["VAR"] = 121] = "VAR";
      TAG_ID2[TAG_ID2["WBR"] = 122] = "WBR";
      TAG_ID2[TAG_ID2["XMP"] = 123] = "XMP";
    })(TAG_ID || (TAG_ID = {}));
    TAG_NAME_TO_ID = /* @__PURE__ */ new Map([
      [TAG_NAMES.A, TAG_ID.A],
      [TAG_NAMES.ADDRESS, TAG_ID.ADDRESS],
      [TAG_NAMES.ANNOTATION_XML, TAG_ID.ANNOTATION_XML],
      [TAG_NAMES.APPLET, TAG_ID.APPLET],
      [TAG_NAMES.AREA, TAG_ID.AREA],
      [TAG_NAMES.ARTICLE, TAG_ID.ARTICLE],
      [TAG_NAMES.ASIDE, TAG_ID.ASIDE],
      [TAG_NAMES.B, TAG_ID.B],
      [TAG_NAMES.BASE, TAG_ID.BASE],
      [TAG_NAMES.BASEFONT, TAG_ID.BASEFONT],
      [TAG_NAMES.BGSOUND, TAG_ID.BGSOUND],
      [TAG_NAMES.BIG, TAG_ID.BIG],
      [TAG_NAMES.BLOCKQUOTE, TAG_ID.BLOCKQUOTE],
      [TAG_NAMES.BODY, TAG_ID.BODY],
      [TAG_NAMES.BR, TAG_ID.BR],
      [TAG_NAMES.BUTTON, TAG_ID.BUTTON],
      [TAG_NAMES.CAPTION, TAG_ID.CAPTION],
      [TAG_NAMES.CENTER, TAG_ID.CENTER],
      [TAG_NAMES.CODE, TAG_ID.CODE],
      [TAG_NAMES.COL, TAG_ID.COL],
      [TAG_NAMES.COLGROUP, TAG_ID.COLGROUP],
      [TAG_NAMES.DD, TAG_ID.DD],
      [TAG_NAMES.DESC, TAG_ID.DESC],
      [TAG_NAMES.DETAILS, TAG_ID.DETAILS],
      [TAG_NAMES.DIALOG, TAG_ID.DIALOG],
      [TAG_NAMES.DIR, TAG_ID.DIR],
      [TAG_NAMES.DIV, TAG_ID.DIV],
      [TAG_NAMES.DL, TAG_ID.DL],
      [TAG_NAMES.DT, TAG_ID.DT],
      [TAG_NAMES.EM, TAG_ID.EM],
      [TAG_NAMES.EMBED, TAG_ID.EMBED],
      [TAG_NAMES.FIELDSET, TAG_ID.FIELDSET],
      [TAG_NAMES.FIGCAPTION, TAG_ID.FIGCAPTION],
      [TAG_NAMES.FIGURE, TAG_ID.FIGURE],
      [TAG_NAMES.FONT, TAG_ID.FONT],
      [TAG_NAMES.FOOTER, TAG_ID.FOOTER],
      [TAG_NAMES.FOREIGN_OBJECT, TAG_ID.FOREIGN_OBJECT],
      [TAG_NAMES.FORM, TAG_ID.FORM],
      [TAG_NAMES.FRAME, TAG_ID.FRAME],
      [TAG_NAMES.FRAMESET, TAG_ID.FRAMESET],
      [TAG_NAMES.H1, TAG_ID.H1],
      [TAG_NAMES.H2, TAG_ID.H2],
      [TAG_NAMES.H3, TAG_ID.H3],
      [TAG_NAMES.H4, TAG_ID.H4],
      [TAG_NAMES.H5, TAG_ID.H5],
      [TAG_NAMES.H6, TAG_ID.H6],
      [TAG_NAMES.HEAD, TAG_ID.HEAD],
      [TAG_NAMES.HEADER, TAG_ID.HEADER],
      [TAG_NAMES.HGROUP, TAG_ID.HGROUP],
      [TAG_NAMES.HR, TAG_ID.HR],
      [TAG_NAMES.HTML, TAG_ID.HTML],
      [TAG_NAMES.I, TAG_ID.I],
      [TAG_NAMES.IMG, TAG_ID.IMG],
      [TAG_NAMES.IMAGE, TAG_ID.IMAGE],
      [TAG_NAMES.INPUT, TAG_ID.INPUT],
      [TAG_NAMES.IFRAME, TAG_ID.IFRAME],
      [TAG_NAMES.KEYGEN, TAG_ID.KEYGEN],
      [TAG_NAMES.LABEL, TAG_ID.LABEL],
      [TAG_NAMES.LI, TAG_ID.LI],
      [TAG_NAMES.LINK, TAG_ID.LINK],
      [TAG_NAMES.LISTING, TAG_ID.LISTING],
      [TAG_NAMES.MAIN, TAG_ID.MAIN],
      [TAG_NAMES.MALIGNMARK, TAG_ID.MALIGNMARK],
      [TAG_NAMES.MARQUEE, TAG_ID.MARQUEE],
      [TAG_NAMES.MATH, TAG_ID.MATH],
      [TAG_NAMES.MENU, TAG_ID.MENU],
      [TAG_NAMES.META, TAG_ID.META],
      [TAG_NAMES.MGLYPH, TAG_ID.MGLYPH],
      [TAG_NAMES.MI, TAG_ID.MI],
      [TAG_NAMES.MO, TAG_ID.MO],
      [TAG_NAMES.MN, TAG_ID.MN],
      [TAG_NAMES.MS, TAG_ID.MS],
      [TAG_NAMES.MTEXT, TAG_ID.MTEXT],
      [TAG_NAMES.NAV, TAG_ID.NAV],
      [TAG_NAMES.NOBR, TAG_ID.NOBR],
      [TAG_NAMES.NOFRAMES, TAG_ID.NOFRAMES],
      [TAG_NAMES.NOEMBED, TAG_ID.NOEMBED],
      [TAG_NAMES.NOSCRIPT, TAG_ID.NOSCRIPT],
      [TAG_NAMES.OBJECT, TAG_ID.OBJECT],
      [TAG_NAMES.OL, TAG_ID.OL],
      [TAG_NAMES.OPTGROUP, TAG_ID.OPTGROUP],
      [TAG_NAMES.OPTION, TAG_ID.OPTION],
      [TAG_NAMES.P, TAG_ID.P],
      [TAG_NAMES.PARAM, TAG_ID.PARAM],
      [TAG_NAMES.PLAINTEXT, TAG_ID.PLAINTEXT],
      [TAG_NAMES.PRE, TAG_ID.PRE],
      [TAG_NAMES.RB, TAG_ID.RB],
      [TAG_NAMES.RP, TAG_ID.RP],
      [TAG_NAMES.RT, TAG_ID.RT],
      [TAG_NAMES.RTC, TAG_ID.RTC],
      [TAG_NAMES.RUBY, TAG_ID.RUBY],
      [TAG_NAMES.S, TAG_ID.S],
      [TAG_NAMES.SCRIPT, TAG_ID.SCRIPT],
      [TAG_NAMES.SEARCH, TAG_ID.SEARCH],
      [TAG_NAMES.SECTION, TAG_ID.SECTION],
      [TAG_NAMES.SELECT, TAG_ID.SELECT],
      [TAG_NAMES.SOURCE, TAG_ID.SOURCE],
      [TAG_NAMES.SMALL, TAG_ID.SMALL],
      [TAG_NAMES.SPAN, TAG_ID.SPAN],
      [TAG_NAMES.STRIKE, TAG_ID.STRIKE],
      [TAG_NAMES.STRONG, TAG_ID.STRONG],
      [TAG_NAMES.STYLE, TAG_ID.STYLE],
      [TAG_NAMES.SUB, TAG_ID.SUB],
      [TAG_NAMES.SUMMARY, TAG_ID.SUMMARY],
      [TAG_NAMES.SUP, TAG_ID.SUP],
      [TAG_NAMES.TABLE, TAG_ID.TABLE],
      [TAG_NAMES.TBODY, TAG_ID.TBODY],
      [TAG_NAMES.TEMPLATE, TAG_ID.TEMPLATE],
      [TAG_NAMES.TEXTAREA, TAG_ID.TEXTAREA],
      [TAG_NAMES.TFOOT, TAG_ID.TFOOT],
      [TAG_NAMES.TD, TAG_ID.TD],
      [TAG_NAMES.TH, TAG_ID.TH],
      [TAG_NAMES.THEAD, TAG_ID.THEAD],
      [TAG_NAMES.TITLE, TAG_ID.TITLE],
      [TAG_NAMES.TR, TAG_ID.TR],
      [TAG_NAMES.TRACK, TAG_ID.TRACK],
      [TAG_NAMES.TT, TAG_ID.TT],
      [TAG_NAMES.U, TAG_ID.U],
      [TAG_NAMES.UL, TAG_ID.UL],
      [TAG_NAMES.SVG, TAG_ID.SVG],
      [TAG_NAMES.VAR, TAG_ID.VAR],
      [TAG_NAMES.WBR, TAG_ID.WBR],
      [TAG_NAMES.XMP, TAG_ID.XMP]
    ]);
    $ = TAG_ID;
    SPECIAL_ELEMENTS = {
      [NS.HTML]: /* @__PURE__ */ new Set([
        $.ADDRESS,
        $.APPLET,
        $.AREA,
        $.ARTICLE,
        $.ASIDE,
        $.BASE,
        $.BASEFONT,
        $.BGSOUND,
        $.BLOCKQUOTE,
        $.BODY,
        $.BR,
        $.BUTTON,
        $.CAPTION,
        $.CENTER,
        $.COL,
        $.COLGROUP,
        $.DD,
        $.DETAILS,
        $.DIR,
        $.DIV,
        $.DL,
        $.DT,
        $.EMBED,
        $.FIELDSET,
        $.FIGCAPTION,
        $.FIGURE,
        $.FOOTER,
        $.FORM,
        $.FRAME,
        $.FRAMESET,
        $.H1,
        $.H2,
        $.H3,
        $.H4,
        $.H5,
        $.H6,
        $.HEAD,
        $.HEADER,
        $.HGROUP,
        $.HR,
        $.HTML,
        $.IFRAME,
        $.IMG,
        $.INPUT,
        $.LI,
        $.LINK,
        $.LISTING,
        $.MAIN,
        $.MARQUEE,
        $.MENU,
        $.META,
        $.NAV,
        $.NOEMBED,
        $.NOFRAMES,
        $.NOSCRIPT,
        $.OBJECT,
        $.OL,
        $.P,
        $.PARAM,
        $.PLAINTEXT,
        $.PRE,
        $.SCRIPT,
        $.SECTION,
        $.SELECT,
        $.SOURCE,
        $.STYLE,
        $.SUMMARY,
        $.TABLE,
        $.TBODY,
        $.TD,
        $.TEMPLATE,
        $.TEXTAREA,
        $.TFOOT,
        $.TH,
        $.THEAD,
        $.TITLE,
        $.TR,
        $.TRACK,
        $.UL,
        $.WBR,
        $.XMP
      ]),
      [NS.MATHML]: /* @__PURE__ */ new Set([$.MI, $.MO, $.MN, $.MS, $.MTEXT, $.ANNOTATION_XML]),
      [NS.SVG]: /* @__PURE__ */ new Set([$.TITLE, $.FOREIGN_OBJECT, $.DESC]),
      [NS.XLINK]: /* @__PURE__ */ new Set(),
      [NS.XML]: /* @__PURE__ */ new Set(),
      [NS.XMLNS]: /* @__PURE__ */ new Set()
    };
    NUMBERED_HEADERS = /* @__PURE__ */ new Set([$.H1, $.H2, $.H3, $.H4, $.H5, $.H6]);
    UNESCAPED_TEXT = /* @__PURE__ */ new Set([
      TAG_NAMES.STYLE,
      TAG_NAMES.SCRIPT,
      TAG_NAMES.XMP,
      TAG_NAMES.IFRAME,
      TAG_NAMES.NOEMBED,
      TAG_NAMES.NOFRAMES,
      TAG_NAMES.PLAINTEXT
    ]);
  }
});

// node_modules/parse5/dist/tokenizer/index.js
function isAsciiDigit(cp) {
  return cp >= CODE_POINTS.DIGIT_0 && cp <= CODE_POINTS.DIGIT_9;
}
function isAsciiUpper(cp) {
  return cp >= CODE_POINTS.LATIN_CAPITAL_A && cp <= CODE_POINTS.LATIN_CAPITAL_Z;
}
function isAsciiLower(cp) {
  return cp >= CODE_POINTS.LATIN_SMALL_A && cp <= CODE_POINTS.LATIN_SMALL_Z;
}
function isAsciiLetter(cp) {
  return isAsciiLower(cp) || isAsciiUpper(cp);
}
function isAsciiAlphaNumeric2(cp) {
  return isAsciiLetter(cp) || isAsciiDigit(cp);
}
function toAsciiLower(cp) {
  return cp + 32;
}
function isWhitespace(cp) {
  return cp === CODE_POINTS.SPACE || cp === CODE_POINTS.LINE_FEED || cp === CODE_POINTS.TABULATION || cp === CODE_POINTS.FORM_FEED;
}
function isScriptDataDoubleEscapeSequenceEnd(cp) {
  return isWhitespace(cp) || cp === CODE_POINTS.SOLIDUS || cp === CODE_POINTS.GREATER_THAN_SIGN;
}
function getErrorForNumericCharacterReference(code) {
  if (code === CODE_POINTS.NULL) {
    return ERR.nullCharacterReference;
  } else if (code > 1114111) {
    return ERR.characterReferenceOutsideUnicodeRange;
  } else if (isSurrogate(code)) {
    return ERR.surrogateCharacterReference;
  } else if (isUndefinedCodePoint(code)) {
    return ERR.noncharacterCharacterReference;
  } else if (isControlCodePoint(code) || code === CODE_POINTS.CARRIAGE_RETURN) {
    return ERR.controlCharacterReference;
  }
  return null;
}
var State, TokenizerMode, Tokenizer;
var init_tokenizer = __esm({
  "node_modules/parse5/dist/tokenizer/index.js"() {
    init_preprocessor();
    init_unicode();
    init_token();
    init_decode();
    init_error_codes();
    init_html();
    (function(State2) {
      State2[State2["DATA"] = 0] = "DATA";
      State2[State2["RCDATA"] = 1] = "RCDATA";
      State2[State2["RAWTEXT"] = 2] = "RAWTEXT";
      State2[State2["SCRIPT_DATA"] = 3] = "SCRIPT_DATA";
      State2[State2["PLAINTEXT"] = 4] = "PLAINTEXT";
      State2[State2["TAG_OPEN"] = 5] = "TAG_OPEN";
      State2[State2["END_TAG_OPEN"] = 6] = "END_TAG_OPEN";
      State2[State2["TAG_NAME"] = 7] = "TAG_NAME";
      State2[State2["RCDATA_LESS_THAN_SIGN"] = 8] = "RCDATA_LESS_THAN_SIGN";
      State2[State2["RCDATA_END_TAG_OPEN"] = 9] = "RCDATA_END_TAG_OPEN";
      State2[State2["RCDATA_END_TAG_NAME"] = 10] = "RCDATA_END_TAG_NAME";
      State2[State2["RAWTEXT_LESS_THAN_SIGN"] = 11] = "RAWTEXT_LESS_THAN_SIGN";
      State2[State2["RAWTEXT_END_TAG_OPEN"] = 12] = "RAWTEXT_END_TAG_OPEN";
      State2[State2["RAWTEXT_END_TAG_NAME"] = 13] = "RAWTEXT_END_TAG_NAME";
      State2[State2["SCRIPT_DATA_LESS_THAN_SIGN"] = 14] = "SCRIPT_DATA_LESS_THAN_SIGN";
      State2[State2["SCRIPT_DATA_END_TAG_OPEN"] = 15] = "SCRIPT_DATA_END_TAG_OPEN";
      State2[State2["SCRIPT_DATA_END_TAG_NAME"] = 16] = "SCRIPT_DATA_END_TAG_NAME";
      State2[State2["SCRIPT_DATA_ESCAPE_START"] = 17] = "SCRIPT_DATA_ESCAPE_START";
      State2[State2["SCRIPT_DATA_ESCAPE_START_DASH"] = 18] = "SCRIPT_DATA_ESCAPE_START_DASH";
      State2[State2["SCRIPT_DATA_ESCAPED"] = 19] = "SCRIPT_DATA_ESCAPED";
      State2[State2["SCRIPT_DATA_ESCAPED_DASH"] = 20] = "SCRIPT_DATA_ESCAPED_DASH";
      State2[State2["SCRIPT_DATA_ESCAPED_DASH_DASH"] = 21] = "SCRIPT_DATA_ESCAPED_DASH_DASH";
      State2[State2["SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN"] = 22] = "SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN";
      State2[State2["SCRIPT_DATA_ESCAPED_END_TAG_OPEN"] = 23] = "SCRIPT_DATA_ESCAPED_END_TAG_OPEN";
      State2[State2["SCRIPT_DATA_ESCAPED_END_TAG_NAME"] = 24] = "SCRIPT_DATA_ESCAPED_END_TAG_NAME";
      State2[State2["SCRIPT_DATA_DOUBLE_ESCAPE_START"] = 25] = "SCRIPT_DATA_DOUBLE_ESCAPE_START";
      State2[State2["SCRIPT_DATA_DOUBLE_ESCAPED"] = 26] = "SCRIPT_DATA_DOUBLE_ESCAPED";
      State2[State2["SCRIPT_DATA_DOUBLE_ESCAPED_DASH"] = 27] = "SCRIPT_DATA_DOUBLE_ESCAPED_DASH";
      State2[State2["SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH"] = 28] = "SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH";
      State2[State2["SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN"] = 29] = "SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN";
      State2[State2["SCRIPT_DATA_DOUBLE_ESCAPE_END"] = 30] = "SCRIPT_DATA_DOUBLE_ESCAPE_END";
      State2[State2["BEFORE_ATTRIBUTE_NAME"] = 31] = "BEFORE_ATTRIBUTE_NAME";
      State2[State2["ATTRIBUTE_NAME"] = 32] = "ATTRIBUTE_NAME";
      State2[State2["AFTER_ATTRIBUTE_NAME"] = 33] = "AFTER_ATTRIBUTE_NAME";
      State2[State2["BEFORE_ATTRIBUTE_VALUE"] = 34] = "BEFORE_ATTRIBUTE_VALUE";
      State2[State2["ATTRIBUTE_VALUE_DOUBLE_QUOTED"] = 35] = "ATTRIBUTE_VALUE_DOUBLE_QUOTED";
      State2[State2["ATTRIBUTE_VALUE_SINGLE_QUOTED"] = 36] = "ATTRIBUTE_VALUE_SINGLE_QUOTED";
      State2[State2["ATTRIBUTE_VALUE_UNQUOTED"] = 37] = "ATTRIBUTE_VALUE_UNQUOTED";
      State2[State2["AFTER_ATTRIBUTE_VALUE_QUOTED"] = 38] = "AFTER_ATTRIBUTE_VALUE_QUOTED";
      State2[State2["SELF_CLOSING_START_TAG"] = 39] = "SELF_CLOSING_START_TAG";
      State2[State2["BOGUS_COMMENT"] = 40] = "BOGUS_COMMENT";
      State2[State2["MARKUP_DECLARATION_OPEN"] = 41] = "MARKUP_DECLARATION_OPEN";
      State2[State2["COMMENT_START"] = 42] = "COMMENT_START";
      State2[State2["COMMENT_START_DASH"] = 43] = "COMMENT_START_DASH";
      State2[State2["COMMENT"] = 44] = "COMMENT";
      State2[State2["COMMENT_LESS_THAN_SIGN"] = 45] = "COMMENT_LESS_THAN_SIGN";
      State2[State2["COMMENT_LESS_THAN_SIGN_BANG"] = 46] = "COMMENT_LESS_THAN_SIGN_BANG";
      State2[State2["COMMENT_LESS_THAN_SIGN_BANG_DASH"] = 47] = "COMMENT_LESS_THAN_SIGN_BANG_DASH";
      State2[State2["COMMENT_LESS_THAN_SIGN_BANG_DASH_DASH"] = 48] = "COMMENT_LESS_THAN_SIGN_BANG_DASH_DASH";
      State2[State2["COMMENT_END_DASH"] = 49] = "COMMENT_END_DASH";
      State2[State2["COMMENT_END"] = 50] = "COMMENT_END";
      State2[State2["COMMENT_END_BANG"] = 51] = "COMMENT_END_BANG";
      State2[State2["DOCTYPE"] = 52] = "DOCTYPE";
      State2[State2["BEFORE_DOCTYPE_NAME"] = 53] = "BEFORE_DOCTYPE_NAME";
      State2[State2["DOCTYPE_NAME"] = 54] = "DOCTYPE_NAME";
      State2[State2["AFTER_DOCTYPE_NAME"] = 55] = "AFTER_DOCTYPE_NAME";
      State2[State2["AFTER_DOCTYPE_PUBLIC_KEYWORD"] = 56] = "AFTER_DOCTYPE_PUBLIC_KEYWORD";
      State2[State2["BEFORE_DOCTYPE_PUBLIC_IDENTIFIER"] = 57] = "BEFORE_DOCTYPE_PUBLIC_IDENTIFIER";
      State2[State2["DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED"] = 58] = "DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED";
      State2[State2["DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED"] = 59] = "DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED";
      State2[State2["AFTER_DOCTYPE_PUBLIC_IDENTIFIER"] = 60] = "AFTER_DOCTYPE_PUBLIC_IDENTIFIER";
      State2[State2["BETWEEN_DOCTYPE_PUBLIC_AND_SYSTEM_IDENTIFIERS"] = 61] = "BETWEEN_DOCTYPE_PUBLIC_AND_SYSTEM_IDENTIFIERS";
      State2[State2["AFTER_DOCTYPE_SYSTEM_KEYWORD"] = 62] = "AFTER_DOCTYPE_SYSTEM_KEYWORD";
      State2[State2["BEFORE_DOCTYPE_SYSTEM_IDENTIFIER"] = 63] = "BEFORE_DOCTYPE_SYSTEM_IDENTIFIER";
      State2[State2["DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED"] = 64] = "DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED";
      State2[State2["DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED"] = 65] = "DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED";
      State2[State2["AFTER_DOCTYPE_SYSTEM_IDENTIFIER"] = 66] = "AFTER_DOCTYPE_SYSTEM_IDENTIFIER";
      State2[State2["BOGUS_DOCTYPE"] = 67] = "BOGUS_DOCTYPE";
      State2[State2["CDATA_SECTION"] = 68] = "CDATA_SECTION";
      State2[State2["CDATA_SECTION_BRACKET"] = 69] = "CDATA_SECTION_BRACKET";
      State2[State2["CDATA_SECTION_END"] = 70] = "CDATA_SECTION_END";
      State2[State2["CHARACTER_REFERENCE"] = 71] = "CHARACTER_REFERENCE";
      State2[State2["AMBIGUOUS_AMPERSAND"] = 72] = "AMBIGUOUS_AMPERSAND";
    })(State || (State = {}));
    TokenizerMode = {
      DATA: State.DATA,
      RCDATA: State.RCDATA,
      RAWTEXT: State.RAWTEXT,
      SCRIPT_DATA: State.SCRIPT_DATA,
      PLAINTEXT: State.PLAINTEXT,
      CDATA_SECTION: State.CDATA_SECTION
    };
    Tokenizer = class {
      constructor(options, handler) {
        this.options = options;
        this.handler = handler;
        this.paused = false;
        this.inLoop = false;
        this.inForeignNode = false;
        this.lastStartTagName = "";
        this.active = false;
        this.state = State.DATA;
        this.returnState = State.DATA;
        this.entityStartPos = 0;
        this.consumedAfterSnapshot = -1;
        this.currentCharacterToken = null;
        this.currentToken = null;
        this.currentAttr = { name: "", value: "" };
        this.preprocessor = new Preprocessor(handler);
        this.currentLocation = this.getCurrentLocation(-1);
        this.entityDecoder = new EntityDecoder(htmlDecodeTree, (cp, consumed) => {
          this.preprocessor.pos = this.entityStartPos + consumed - 1;
          this._flushCodePointConsumedAsCharacterReference(cp);
        }, handler.onParseError ? {
          missingSemicolonAfterCharacterReference: () => {
            this._err(ERR.missingSemicolonAfterCharacterReference, 1);
          },
          absenceOfDigitsInNumericCharacterReference: (consumed) => {
            this._err(ERR.absenceOfDigitsInNumericCharacterReference, this.entityStartPos - this.preprocessor.pos + consumed);
          },
          validateNumericCharacterReference: (code) => {
            const error = getErrorForNumericCharacterReference(code);
            if (error)
              this._err(error, 1);
          }
        } : void 0);
      }
      //Errors
      _err(code, cpOffset = 0) {
        var _a2, _b;
        (_b = (_a2 = this.handler).onParseError) === null || _b === void 0 ? void 0 : _b.call(_a2, this.preprocessor.getError(code, cpOffset));
      }
      // NOTE: `offset` may never run across line boundaries.
      getCurrentLocation(offset) {
        if (!this.options.sourceCodeLocationInfo) {
          return null;
        }
        return {
          startLine: this.preprocessor.line,
          startCol: this.preprocessor.col - offset,
          startOffset: this.preprocessor.offset - offset,
          endLine: -1,
          endCol: -1,
          endOffset: -1
        };
      }
      _runParsingLoop() {
        if (this.inLoop)
          return;
        this.inLoop = true;
        while (this.active && !this.paused) {
          this.consumedAfterSnapshot = 0;
          const cp = this._consume();
          if (!this._ensureHibernation()) {
            this._callState(cp);
          }
        }
        this.inLoop = false;
      }
      //API
      pause() {
        this.paused = true;
      }
      resume(writeCallback) {
        if (!this.paused) {
          throw new Error("Parser was already resumed");
        }
        this.paused = false;
        if (this.inLoop)
          return;
        this._runParsingLoop();
        if (!this.paused) {
          writeCallback === null || writeCallback === void 0 ? void 0 : writeCallback();
        }
      }
      write(chunk, isLastChunk, writeCallback) {
        this.active = true;
        this.preprocessor.write(chunk, isLastChunk);
        this._runParsingLoop();
        if (!this.paused) {
          writeCallback === null || writeCallback === void 0 ? void 0 : writeCallback();
        }
      }
      insertHtmlAtCurrentPos(chunk) {
        this.active = true;
        this.preprocessor.insertHtmlAtCurrentPos(chunk);
        this._runParsingLoop();
      }
      //Hibernation
      _ensureHibernation() {
        if (this.preprocessor.endOfChunkHit) {
          this.preprocessor.retreat(this.consumedAfterSnapshot);
          this.consumedAfterSnapshot = 0;
          this.active = false;
          return true;
        }
        return false;
      }
      //Consumption
      _consume() {
        this.consumedAfterSnapshot++;
        return this.preprocessor.advance();
      }
      _advanceBy(count) {
        this.consumedAfterSnapshot += count;
        for (let i = 0; i < count; i++) {
          this.preprocessor.advance();
        }
      }
      _consumeSequenceIfMatch(pattern, caseSensitive) {
        if (this.preprocessor.startsWith(pattern, caseSensitive)) {
          this._advanceBy(pattern.length - 1);
          return true;
        }
        return false;
      }
      //Token creation
      _createStartTagToken() {
        this.currentToken = {
          type: TokenType.START_TAG,
          tagName: "",
          tagID: TAG_ID.UNKNOWN,
          selfClosing: false,
          ackSelfClosing: false,
          attrs: [],
          location: this.getCurrentLocation(1)
        };
      }
      _createEndTagToken() {
        this.currentToken = {
          type: TokenType.END_TAG,
          tagName: "",
          tagID: TAG_ID.UNKNOWN,
          selfClosing: false,
          ackSelfClosing: false,
          attrs: [],
          location: this.getCurrentLocation(2)
        };
      }
      _createCommentToken(offset) {
        this.currentToken = {
          type: TokenType.COMMENT,
          data: "",
          location: this.getCurrentLocation(offset)
        };
      }
      _createDoctypeToken(initialName) {
        this.currentToken = {
          type: TokenType.DOCTYPE,
          name: initialName,
          forceQuirks: false,
          publicId: null,
          systemId: null,
          location: this.currentLocation
        };
      }
      _createCharacterToken(type, chars) {
        this.currentCharacterToken = {
          type,
          chars,
          location: this.currentLocation
        };
      }
      //Tag attributes
      _createAttr(attrNameFirstCh) {
        this.currentAttr = {
          name: attrNameFirstCh,
          value: ""
        };
        this.currentLocation = this.getCurrentLocation(0);
      }
      _leaveAttrName() {
        var _a2;
        var _b;
        const token = this.currentToken;
        if (getTokenAttr(token, this.currentAttr.name) === null) {
          token.attrs.push(this.currentAttr);
          if (token.location && this.currentLocation) {
            const attrLocations = (_a2 = (_b = token.location).attrs) !== null && _a2 !== void 0 ? _a2 : _b.attrs = /* @__PURE__ */ Object.create(null);
            attrLocations[this.currentAttr.name] = this.currentLocation;
            this._leaveAttrValue();
          }
        } else {
          this._err(ERR.duplicateAttribute);
        }
      }
      _leaveAttrValue() {
        if (this.currentLocation) {
          this.currentLocation.endLine = this.preprocessor.line;
          this.currentLocation.endCol = this.preprocessor.col;
          this.currentLocation.endOffset = this.preprocessor.offset;
        }
      }
      //Token emission
      prepareToken(ct) {
        this._emitCurrentCharacterToken(ct.location);
        this.currentToken = null;
        if (ct.location) {
          ct.location.endLine = this.preprocessor.line;
          ct.location.endCol = this.preprocessor.col + 1;
          ct.location.endOffset = this.preprocessor.offset + 1;
        }
        this.currentLocation = this.getCurrentLocation(-1);
      }
      emitCurrentTagToken() {
        const ct = this.currentToken;
        this.prepareToken(ct);
        ct.tagID = getTagID(ct.tagName);
        if (ct.type === TokenType.START_TAG) {
          this.lastStartTagName = ct.tagName;
          this.handler.onStartTag(ct);
        } else {
          if (ct.attrs.length > 0) {
            this._err(ERR.endTagWithAttributes);
          }
          if (ct.selfClosing) {
            this._err(ERR.endTagWithTrailingSolidus);
          }
          this.handler.onEndTag(ct);
        }
        this.preprocessor.dropParsedChunk();
      }
      emitCurrentComment(ct) {
        this.prepareToken(ct);
        this.handler.onComment(ct);
        this.preprocessor.dropParsedChunk();
      }
      emitCurrentDoctype(ct) {
        this.prepareToken(ct);
        this.handler.onDoctype(ct);
        this.preprocessor.dropParsedChunk();
      }
      _emitCurrentCharacterToken(nextLocation) {
        if (this.currentCharacterToken) {
          if (nextLocation && this.currentCharacterToken.location) {
            this.currentCharacterToken.location.endLine = nextLocation.startLine;
            this.currentCharacterToken.location.endCol = nextLocation.startCol;
            this.currentCharacterToken.location.endOffset = nextLocation.startOffset;
          }
          switch (this.currentCharacterToken.type) {
            case TokenType.CHARACTER: {
              this.handler.onCharacter(this.currentCharacterToken);
              break;
            }
            case TokenType.NULL_CHARACTER: {
              this.handler.onNullCharacter(this.currentCharacterToken);
              break;
            }
            case TokenType.WHITESPACE_CHARACTER: {
              this.handler.onWhitespaceCharacter(this.currentCharacterToken);
              break;
            }
          }
          this.currentCharacterToken = null;
        }
      }
      _emitEOFToken() {
        const location = this.getCurrentLocation(0);
        if (location) {
          location.endLine = location.startLine;
          location.endCol = location.startCol;
          location.endOffset = location.startOffset;
        }
        this._emitCurrentCharacterToken(location);
        this.handler.onEof({ type: TokenType.EOF, location });
        this.active = false;
      }
      //Characters emission
      //OPTIMIZATION: The specification uses only one type of character token (one token per character).
      //This causes a huge memory overhead and a lot of unnecessary parser loops. parse5 uses 3 groups of characters.
      //If we have a sequence of characters that belong to the same group, the parser can process it
      //as a single solid character token.
      //So, there are 3 types of character tokens in parse5:
      //1)TokenType.NULL_CHARACTER - \u0000-character sequences (e.g. '\u0000\u0000\u0000')
      //2)TokenType.WHITESPACE_CHARACTER - any whitespace/new-line character sequences (e.g. '\n  \r\t   \f')
      //3)TokenType.CHARACTER - any character sequence which don't belong to groups 1 and 2 (e.g. 'abcdef1234@@#$%^')
      _appendCharToCurrentCharacterToken(type, ch) {
        if (this.currentCharacterToken) {
          if (this.currentCharacterToken.type === type) {
            this.currentCharacterToken.chars += ch;
            return;
          } else {
            this.currentLocation = this.getCurrentLocation(0);
            this._emitCurrentCharacterToken(this.currentLocation);
            this.preprocessor.dropParsedChunk();
          }
        }
        this._createCharacterToken(type, ch);
      }
      _emitCodePoint(cp) {
        const type = isWhitespace(cp) ? TokenType.WHITESPACE_CHARACTER : cp === CODE_POINTS.NULL ? TokenType.NULL_CHARACTER : TokenType.CHARACTER;
        this._appendCharToCurrentCharacterToken(type, String.fromCodePoint(cp));
      }
      //NOTE: used when we emit characters explicitly.
      //This is always for non-whitespace and non-null characters, which allows us to avoid additional checks.
      _emitChars(ch) {
        this._appendCharToCurrentCharacterToken(TokenType.CHARACTER, ch);
      }
      // Character reference helpers
      _startCharacterReference() {
        this.returnState = this.state;
        this.state = State.CHARACTER_REFERENCE;
        this.entityStartPos = this.preprocessor.pos;
        this.entityDecoder.startEntity(this._isCharacterReferenceInAttribute() ? DecodingMode.Attribute : DecodingMode.Legacy);
      }
      _isCharacterReferenceInAttribute() {
        return this.returnState === State.ATTRIBUTE_VALUE_DOUBLE_QUOTED || this.returnState === State.ATTRIBUTE_VALUE_SINGLE_QUOTED || this.returnState === State.ATTRIBUTE_VALUE_UNQUOTED;
      }
      _flushCodePointConsumedAsCharacterReference(cp) {
        if (this._isCharacterReferenceInAttribute()) {
          this.currentAttr.value += String.fromCodePoint(cp);
        } else {
          this._emitCodePoint(cp);
        }
      }
      // Calling states this way turns out to be much faster than any other approach.
      _callState(cp) {
        switch (this.state) {
          case State.DATA: {
            this._stateData(cp);
            break;
          }
          case State.RCDATA: {
            this._stateRcdata(cp);
            break;
          }
          case State.RAWTEXT: {
            this._stateRawtext(cp);
            break;
          }
          case State.SCRIPT_DATA: {
            this._stateScriptData(cp);
            break;
          }
          case State.PLAINTEXT: {
            this._statePlaintext(cp);
            break;
          }
          case State.TAG_OPEN: {
            this._stateTagOpen(cp);
            break;
          }
          case State.END_TAG_OPEN: {
            this._stateEndTagOpen(cp);
            break;
          }
          case State.TAG_NAME: {
            this._stateTagName(cp);
            break;
          }
          case State.RCDATA_LESS_THAN_SIGN: {
            this._stateRcdataLessThanSign(cp);
            break;
          }
          case State.RCDATA_END_TAG_OPEN: {
            this._stateRcdataEndTagOpen(cp);
            break;
          }
          case State.RCDATA_END_TAG_NAME: {
            this._stateRcdataEndTagName(cp);
            break;
          }
          case State.RAWTEXT_LESS_THAN_SIGN: {
            this._stateRawtextLessThanSign(cp);
            break;
          }
          case State.RAWTEXT_END_TAG_OPEN: {
            this._stateRawtextEndTagOpen(cp);
            break;
          }
          case State.RAWTEXT_END_TAG_NAME: {
            this._stateRawtextEndTagName(cp);
            break;
          }
          case State.SCRIPT_DATA_LESS_THAN_SIGN: {
            this._stateScriptDataLessThanSign(cp);
            break;
          }
          case State.SCRIPT_DATA_END_TAG_OPEN: {
            this._stateScriptDataEndTagOpen(cp);
            break;
          }
          case State.SCRIPT_DATA_END_TAG_NAME: {
            this._stateScriptDataEndTagName(cp);
            break;
          }
          case State.SCRIPT_DATA_ESCAPE_START: {
            this._stateScriptDataEscapeStart(cp);
            break;
          }
          case State.SCRIPT_DATA_ESCAPE_START_DASH: {
            this._stateScriptDataEscapeStartDash(cp);
            break;
          }
          case State.SCRIPT_DATA_ESCAPED: {
            this._stateScriptDataEscaped(cp);
            break;
          }
          case State.SCRIPT_DATA_ESCAPED_DASH: {
            this._stateScriptDataEscapedDash(cp);
            break;
          }
          case State.SCRIPT_DATA_ESCAPED_DASH_DASH: {
            this._stateScriptDataEscapedDashDash(cp);
            break;
          }
          case State.SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN: {
            this._stateScriptDataEscapedLessThanSign(cp);
            break;
          }
          case State.SCRIPT_DATA_ESCAPED_END_TAG_OPEN: {
            this._stateScriptDataEscapedEndTagOpen(cp);
            break;
          }
          case State.SCRIPT_DATA_ESCAPED_END_TAG_NAME: {
            this._stateScriptDataEscapedEndTagName(cp);
            break;
          }
          case State.SCRIPT_DATA_DOUBLE_ESCAPE_START: {
            this._stateScriptDataDoubleEscapeStart(cp);
            break;
          }
          case State.SCRIPT_DATA_DOUBLE_ESCAPED: {
            this._stateScriptDataDoubleEscaped(cp);
            break;
          }
          case State.SCRIPT_DATA_DOUBLE_ESCAPED_DASH: {
            this._stateScriptDataDoubleEscapedDash(cp);
            break;
          }
          case State.SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH: {
            this._stateScriptDataDoubleEscapedDashDash(cp);
            break;
          }
          case State.SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN: {
            this._stateScriptDataDoubleEscapedLessThanSign(cp);
            break;
          }
          case State.SCRIPT_DATA_DOUBLE_ESCAPE_END: {
            this._stateScriptDataDoubleEscapeEnd(cp);
            break;
          }
          case State.BEFORE_ATTRIBUTE_NAME: {
            this._stateBeforeAttributeName(cp);
            break;
          }
          case State.ATTRIBUTE_NAME: {
            this._stateAttributeName(cp);
            break;
          }
          case State.AFTER_ATTRIBUTE_NAME: {
            this._stateAfterAttributeName(cp);
            break;
          }
          case State.BEFORE_ATTRIBUTE_VALUE: {
            this._stateBeforeAttributeValue(cp);
            break;
          }
          case State.ATTRIBUTE_VALUE_DOUBLE_QUOTED: {
            this._stateAttributeValueDoubleQuoted(cp);
            break;
          }
          case State.ATTRIBUTE_VALUE_SINGLE_QUOTED: {
            this._stateAttributeValueSingleQuoted(cp);
            break;
          }
          case State.ATTRIBUTE_VALUE_UNQUOTED: {
            this._stateAttributeValueUnquoted(cp);
            break;
          }
          case State.AFTER_ATTRIBUTE_VALUE_QUOTED: {
            this._stateAfterAttributeValueQuoted(cp);
            break;
          }
          case State.SELF_CLOSING_START_TAG: {
            this._stateSelfClosingStartTag(cp);
            break;
          }
          case State.BOGUS_COMMENT: {
            this._stateBogusComment(cp);
            break;
          }
          case State.MARKUP_DECLARATION_OPEN: {
            this._stateMarkupDeclarationOpen(cp);
            break;
          }
          case State.COMMENT_START: {
            this._stateCommentStart(cp);
            break;
          }
          case State.COMMENT_START_DASH: {
            this._stateCommentStartDash(cp);
            break;
          }
          case State.COMMENT: {
            this._stateComment(cp);
            break;
          }
          case State.COMMENT_LESS_THAN_SIGN: {
            this._stateCommentLessThanSign(cp);
            break;
          }
          case State.COMMENT_LESS_THAN_SIGN_BANG: {
            this._stateCommentLessThanSignBang(cp);
            break;
          }
          case State.COMMENT_LESS_THAN_SIGN_BANG_DASH: {
            this._stateCommentLessThanSignBangDash(cp);
            break;
          }
          case State.COMMENT_LESS_THAN_SIGN_BANG_DASH_DASH: {
            this._stateCommentLessThanSignBangDashDash(cp);
            break;
          }
          case State.COMMENT_END_DASH: {
            this._stateCommentEndDash(cp);
            break;
          }
          case State.COMMENT_END: {
            this._stateCommentEnd(cp);
            break;
          }
          case State.COMMENT_END_BANG: {
            this._stateCommentEndBang(cp);
            break;
          }
          case State.DOCTYPE: {
            this._stateDoctype(cp);
            break;
          }
          case State.BEFORE_DOCTYPE_NAME: {
            this._stateBeforeDoctypeName(cp);
            break;
          }
          case State.DOCTYPE_NAME: {
            this._stateDoctypeName(cp);
            break;
          }
          case State.AFTER_DOCTYPE_NAME: {
            this._stateAfterDoctypeName(cp);
            break;
          }
          case State.AFTER_DOCTYPE_PUBLIC_KEYWORD: {
            this._stateAfterDoctypePublicKeyword(cp);
            break;
          }
          case State.BEFORE_DOCTYPE_PUBLIC_IDENTIFIER: {
            this._stateBeforeDoctypePublicIdentifier(cp);
            break;
          }
          case State.DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED: {
            this._stateDoctypePublicIdentifierDoubleQuoted(cp);
            break;
          }
          case State.DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED: {
            this._stateDoctypePublicIdentifierSingleQuoted(cp);
            break;
          }
          case State.AFTER_DOCTYPE_PUBLIC_IDENTIFIER: {
            this._stateAfterDoctypePublicIdentifier(cp);
            break;
          }
          case State.BETWEEN_DOCTYPE_PUBLIC_AND_SYSTEM_IDENTIFIERS: {
            this._stateBetweenDoctypePublicAndSystemIdentifiers(cp);
            break;
          }
          case State.AFTER_DOCTYPE_SYSTEM_KEYWORD: {
            this._stateAfterDoctypeSystemKeyword(cp);
            break;
          }
          case State.BEFORE_DOCTYPE_SYSTEM_IDENTIFIER: {
            this._stateBeforeDoctypeSystemIdentifier(cp);
            break;
          }
          case State.DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED: {
            this._stateDoctypeSystemIdentifierDoubleQuoted(cp);
            break;
          }
          case State.DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED: {
            this._stateDoctypeSystemIdentifierSingleQuoted(cp);
            break;
          }
          case State.AFTER_DOCTYPE_SYSTEM_IDENTIFIER: {
            this._stateAfterDoctypeSystemIdentifier(cp);
            break;
          }
          case State.BOGUS_DOCTYPE: {
            this._stateBogusDoctype(cp);
            break;
          }
          case State.CDATA_SECTION: {
            this._stateCdataSection(cp);
            break;
          }
          case State.CDATA_SECTION_BRACKET: {
            this._stateCdataSectionBracket(cp);
            break;
          }
          case State.CDATA_SECTION_END: {
            this._stateCdataSectionEnd(cp);
            break;
          }
          case State.CHARACTER_REFERENCE: {
            this._stateCharacterReference();
            break;
          }
          case State.AMBIGUOUS_AMPERSAND: {
            this._stateAmbiguousAmpersand(cp);
            break;
          }
          default: {
            throw new Error("Unknown state");
          }
        }
      }
      // State machine
      // Data state
      //------------------------------------------------------------------
      _stateData(cp) {
        switch (cp) {
          case CODE_POINTS.LESS_THAN_SIGN: {
            this.state = State.TAG_OPEN;
            break;
          }
          case CODE_POINTS.AMPERSAND: {
            this._startCharacterReference();
            break;
          }
          case CODE_POINTS.NULL: {
            this._err(ERR.unexpectedNullCharacter);
            this._emitCodePoint(cp);
            break;
          }
          case CODE_POINTS.EOF: {
            this._emitEOFToken();
            break;
          }
          default: {
            this._emitCodePoint(cp);
          }
        }
      }
      //  RCDATA state
      //------------------------------------------------------------------
      _stateRcdata(cp) {
        switch (cp) {
          case CODE_POINTS.AMPERSAND: {
            this._startCharacterReference();
            break;
          }
          case CODE_POINTS.LESS_THAN_SIGN: {
            this.state = State.RCDATA_LESS_THAN_SIGN;
            break;
          }
          case CODE_POINTS.NULL: {
            this._err(ERR.unexpectedNullCharacter);
            this._emitChars(REPLACEMENT_CHARACTER);
            break;
          }
          case CODE_POINTS.EOF: {
            this._emitEOFToken();
            break;
          }
          default: {
            this._emitCodePoint(cp);
          }
        }
      }
      // RAWTEXT state
      //------------------------------------------------------------------
      _stateRawtext(cp) {
        switch (cp) {
          case CODE_POINTS.LESS_THAN_SIGN: {
            this.state = State.RAWTEXT_LESS_THAN_SIGN;
            break;
          }
          case CODE_POINTS.NULL: {
            this._err(ERR.unexpectedNullCharacter);
            this._emitChars(REPLACEMENT_CHARACTER);
            break;
          }
          case CODE_POINTS.EOF: {
            this._emitEOFToken();
            break;
          }
          default: {
            this._emitCodePoint(cp);
          }
        }
      }
      // Script data state
      //------------------------------------------------------------------
      _stateScriptData(cp) {
        switch (cp) {
          case CODE_POINTS.LESS_THAN_SIGN: {
            this.state = State.SCRIPT_DATA_LESS_THAN_SIGN;
            break;
          }
          case CODE_POINTS.NULL: {
            this._err(ERR.unexpectedNullCharacter);
            this._emitChars(REPLACEMENT_CHARACTER);
            break;
          }
          case CODE_POINTS.EOF: {
            this._emitEOFToken();
            break;
          }
          default: {
            this._emitCodePoint(cp);
          }
        }
      }
      // PLAINTEXT state
      //------------------------------------------------------------------
      _statePlaintext(cp) {
        switch (cp) {
          case CODE_POINTS.NULL: {
            this._err(ERR.unexpectedNullCharacter);
            this._emitChars(REPLACEMENT_CHARACTER);
            break;
          }
          case CODE_POINTS.EOF: {
            this._emitEOFToken();
            break;
          }
          default: {
            this._emitCodePoint(cp);
          }
        }
      }
      // Tag open state
      //------------------------------------------------------------------
      _stateTagOpen(cp) {
        if (isAsciiLetter(cp)) {
          this._createStartTagToken();
          this.state = State.TAG_NAME;
          this._stateTagName(cp);
        } else
          switch (cp) {
            case CODE_POINTS.EXCLAMATION_MARK: {
              this.state = State.MARKUP_DECLARATION_OPEN;
              break;
            }
            case CODE_POINTS.SOLIDUS: {
              this.state = State.END_TAG_OPEN;
              break;
            }
            case CODE_POINTS.QUESTION_MARK: {
              this._err(ERR.unexpectedQuestionMarkInsteadOfTagName);
              this._createCommentToken(1);
              this.state = State.BOGUS_COMMENT;
              this._stateBogusComment(cp);
              break;
            }
            case CODE_POINTS.EOF: {
              this._err(ERR.eofBeforeTagName);
              this._emitChars("<");
              this._emitEOFToken();
              break;
            }
            default: {
              this._err(ERR.invalidFirstCharacterOfTagName);
              this._emitChars("<");
              this.state = State.DATA;
              this._stateData(cp);
            }
          }
      }
      // End tag open state
      //------------------------------------------------------------------
      _stateEndTagOpen(cp) {
        if (isAsciiLetter(cp)) {
          this._createEndTagToken();
          this.state = State.TAG_NAME;
          this._stateTagName(cp);
        } else
          switch (cp) {
            case CODE_POINTS.GREATER_THAN_SIGN: {
              this._err(ERR.missingEndTagName);
              this.state = State.DATA;
              break;
            }
            case CODE_POINTS.EOF: {
              this._err(ERR.eofBeforeTagName);
              this._emitChars("</");
              this._emitEOFToken();
              break;
            }
            default: {
              this._err(ERR.invalidFirstCharacterOfTagName);
              this._createCommentToken(2);
              this.state = State.BOGUS_COMMENT;
              this._stateBogusComment(cp);
            }
          }
      }
      // Tag name state
      //------------------------------------------------------------------
      _stateTagName(cp) {
        const token = this.currentToken;
        switch (cp) {
          case CODE_POINTS.SPACE:
          case CODE_POINTS.LINE_FEED:
          case CODE_POINTS.TABULATION:
          case CODE_POINTS.FORM_FEED: {
            this.state = State.BEFORE_ATTRIBUTE_NAME;
            break;
          }
          case CODE_POINTS.SOLIDUS: {
            this.state = State.SELF_CLOSING_START_TAG;
            break;
          }
          case CODE_POINTS.GREATER_THAN_SIGN: {
            this.state = State.DATA;
            this.emitCurrentTagToken();
            break;
          }
          case CODE_POINTS.NULL: {
            this._err(ERR.unexpectedNullCharacter);
            token.tagName += REPLACEMENT_CHARACTER;
            break;
          }
          case CODE_POINTS.EOF: {
            this._err(ERR.eofInTag);
            this._emitEOFToken();
            break;
          }
          default: {
            token.tagName += String.fromCodePoint(isAsciiUpper(cp) ? toAsciiLower(cp) : cp);
          }
        }
      }
      // RCDATA less-than sign state
      //------------------------------------------------------------------
      _stateRcdataLessThanSign(cp) {
        if (cp === CODE_POINTS.SOLIDUS) {
          this.state = State.RCDATA_END_TAG_OPEN;
        } else {
          this._emitChars("<");
          this.state = State.RCDATA;
          this._stateRcdata(cp);
        }
      }
      // RCDATA end tag open state
      //------------------------------------------------------------------
      _stateRcdataEndTagOpen(cp) {
        if (isAsciiLetter(cp)) {
          this.state = State.RCDATA_END_TAG_NAME;
          this._stateRcdataEndTagName(cp);
        } else {
          this._emitChars("</");
          this.state = State.RCDATA;
          this._stateRcdata(cp);
        }
      }
      handleSpecialEndTag(_cp) {
        if (!this.preprocessor.startsWith(this.lastStartTagName, false)) {
          return !this._ensureHibernation();
        }
        this._createEndTagToken();
        const token = this.currentToken;
        token.tagName = this.lastStartTagName;
        const cp = this.preprocessor.peek(this.lastStartTagName.length);
        switch (cp) {
          case CODE_POINTS.SPACE:
          case CODE_POINTS.LINE_FEED:
          case CODE_POINTS.TABULATION:
          case CODE_POINTS.FORM_FEED: {
            this._advanceBy(this.lastStartTagName.length);
            this.state = State.BEFORE_ATTRIBUTE_NAME;
            return false;
          }
          case CODE_POINTS.SOLIDUS: {
            this._advanceBy(this.lastStartTagName.length);
            this.state = State.SELF_CLOSING_START_TAG;
            return false;
          }
          case CODE_POINTS.GREATER_THAN_SIGN: {
            this._advanceBy(this.lastStartTagName.length);
            this.emitCurrentTagToken();
            this.state = State.DATA;
            return false;
          }
          default: {
            return !this._ensureHibernation();
          }
        }
      }
      // RCDATA end tag name state
      //------------------------------------------------------------------
      _stateRcdataEndTagName(cp) {
        if (this.handleSpecialEndTag(cp)) {
          this._emitChars("</");
          this.state = State.RCDATA;
          this._stateRcdata(cp);
        }
      }
      // RAWTEXT less-than sign state
      //------------------------------------------------------------------
      _stateRawtextLessThanSign(cp) {
        if (cp === CODE_POINTS.SOLIDUS) {
          this.state = State.RAWTEXT_END_TAG_OPEN;
        } else {
          this._emitChars("<");
          this.state = State.RAWTEXT;
          this._stateRawtext(cp);
        }
      }
      // RAWTEXT end tag open state
      //------------------------------------------------------------------
      _stateRawtextEndTagOpen(cp) {
        if (isAsciiLetter(cp)) {
          this.state = State.RAWTEXT_END_TAG_NAME;
          this._stateRawtextEndTagName(cp);
        } else {
          this._emitChars("</");
          this.state = State.RAWTEXT;
          this._stateRawtext(cp);
        }
      }
      // RAWTEXT end tag name state
      //------------------------------------------------------------------
      _stateRawtextEndTagName(cp) {
        if (this.handleSpecialEndTag(cp)) {
          this._emitChars("</");
          this.state = State.RAWTEXT;
          this._stateRawtext(cp);
        }
      }
      // Script data less-than sign state
      //------------------------------------------------------------------
      _stateScriptDataLessThanSign(cp) {
        switch (cp) {
          case CODE_POINTS.SOLIDUS: {
            this.state = State.SCRIPT_DATA_END_TAG_OPEN;
            break;
          }
          case CODE_POINTS.EXCLAMATION_MARK: {
            this.state = State.SCRIPT_DATA_ESCAPE_START;
            this._emitChars("<!");
            break;
          }
          default: {
            this._emitChars("<");
            this.state = State.SCRIPT_DATA;
            this._stateScriptData(cp);
          }
        }
      }
      // Script data end tag open state
      //------------------------------------------------------------------
      _stateScriptDataEndTagOpen(cp) {
        if (isAsciiLetter(cp)) {
          this.state = State.SCRIPT_DATA_END_TAG_NAME;
          this._stateScriptDataEndTagName(cp);
        } else {
          this._emitChars("</");
          this.state = State.SCRIPT_DATA;
          this._stateScriptData(cp);
        }
      }
      // Script data end tag name state
      //------------------------------------------------------------------
      _stateScriptDataEndTagName(cp) {
        if (this.handleSpecialEndTag(cp)) {
          this._emitChars("</");
          this.state = State.SCRIPT_DATA;
          this._stateScriptData(cp);
        }
      }
      // Script data escape start state
      //------------------------------------------------------------------
      _stateScriptDataEscapeStart(cp) {
        if (cp === CODE_POINTS.HYPHEN_MINUS) {
          this.state = State.SCRIPT_DATA_ESCAPE_START_DASH;
          this._emitChars("-");
        } else {
          this.state = State.SCRIPT_DATA;
          this._stateScriptData(cp);
        }
      }
      // Script data escape start dash state
      //------------------------------------------------------------------
      _stateScriptDataEscapeStartDash(cp) {
        if (cp === CODE_POINTS.HYPHEN_MINUS) {
          this.state = State.SCRIPT_DATA_ESCAPED_DASH_DASH;
          this._emitChars("-");
        } else {
          this.state = State.SCRIPT_DATA;
          this._stateScriptData(cp);
        }
      }
      // Script data escaped state
      //------------------------------------------------------------------
      _stateScriptDataEscaped(cp) {
        switch (cp) {
          case CODE_POINTS.HYPHEN_MINUS: {
            this.state = State.SCRIPT_DATA_ESCAPED_DASH;
            this._emitChars("-");
            break;
          }
          case CODE_POINTS.LESS_THAN_SIGN: {
            this.state = State.SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN;
            break;
          }
          case CODE_POINTS.NULL: {
            this._err(ERR.unexpectedNullCharacter);
            this._emitChars(REPLACEMENT_CHARACTER);
            break;
          }
          case CODE_POINTS.EOF: {
            this._err(ERR.eofInScriptHtmlCommentLikeText);
            this._emitEOFToken();
            break;
          }
          default: {
            this._emitCodePoint(cp);
          }
        }
      }
      // Script data escaped dash state
      //------------------------------------------------------------------
      _stateScriptDataEscapedDash(cp) {
        switch (cp) {
          case CODE_POINTS.HYPHEN_MINUS: {
            this.state = State.SCRIPT_DATA_ESCAPED_DASH_DASH;
            this._emitChars("-");
            break;
          }
          case CODE_POINTS.LESS_THAN_SIGN: {
            this.state = State.SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN;
            break;
          }
          case CODE_POINTS.NULL: {
            this._err(ERR.unexpectedNullCharacter);
            this.state = State.SCRIPT_DATA_ESCAPED;
            this._emitChars(REPLACEMENT_CHARACTER);
            break;
          }
          case CODE_POINTS.EOF: {
            this._err(ERR.eofInScriptHtmlCommentLikeText);
            this._emitEOFToken();
            break;
          }
          default: {
            this.state = State.SCRIPT_DATA_ESCAPED;
            this._emitCodePoint(cp);
          }
        }
      }
      // Script data escaped dash dash state
      //------------------------------------------------------------------
      _stateScriptDataEscapedDashDash(cp) {
        switch (cp) {
          case CODE_POINTS.HYPHEN_MINUS: {
            this._emitChars("-");
            break;
          }
          case CODE_POINTS.LESS_THAN_SIGN: {
            this.state = State.SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN;
            break;
          }
          case CODE_POINTS.GREATER_THAN_SIGN: {
            this.state = State.SCRIPT_DATA;
            this._emitChars(">");
            break;
          }
          case CODE_POINTS.NULL: {
            this._err(ERR.unexpectedNullCharacter);
            this.state = State.SCRIPT_DATA_ESCAPED;
            this._emitChars(REPLACEMENT_CHARACTER);
            break;
          }
          case CODE_POINTS.EOF: {
            this._err(ERR.eofInScriptHtmlCommentLikeText);
            this._emitEOFToken();
            break;
          }
          default: {
            this.state = State.SCRIPT_DATA_ESCAPED;
            this._emitCodePoint(cp);
          }
        }
      }
      // Script data escaped less-than sign state
      //------------------------------------------------------------------
      _stateScriptDataEscapedLessThanSign(cp) {
        if (cp === CODE_POINTS.SOLIDUS) {
          this.state = State.SCRIPT_DATA_ESCAPED_END_TAG_OPEN;
        } else if (isAsciiLetter(cp)) {
          this._emitChars("<");
          this.state = State.SCRIPT_DATA_DOUBLE_ESCAPE_START;
          this._stateScriptDataDoubleEscapeStart(cp);
        } else {
          this._emitChars("<");
          this.state = State.SCRIPT_DATA_ESCAPED;
          this._stateScriptDataEscaped(cp);
        }
      }
      // Script data escaped end tag open state
      //------------------------------------------------------------------
      _stateScriptDataEscapedEndTagOpen(cp) {
        if (isAsciiLetter(cp)) {
          this.state = State.SCRIPT_DATA_ESCAPED_END_TAG_NAME;
          this._stateScriptDataEscapedEndTagName(cp);
        } else {
          this._emitChars("</");
          this.state = State.SCRIPT_DATA_ESCAPED;
          this._stateScriptDataEscaped(cp);
        }
      }
      // Script data escaped end tag name state
      //------------------------------------------------------------------
      _stateScriptDataEscapedEndTagName(cp) {
        if (this.handleSpecialEndTag(cp)) {
          this._emitChars("</");
          this.state = State.SCRIPT_DATA_ESCAPED;
          this._stateScriptDataEscaped(cp);
        }
      }
      // Script data double escape start state
      //------------------------------------------------------------------
      _stateScriptDataDoubleEscapeStart(cp) {
        if (this.preprocessor.startsWith(SEQUENCES.SCRIPT, false) && isScriptDataDoubleEscapeSequenceEnd(this.preprocessor.peek(SEQUENCES.SCRIPT.length))) {
          this._emitCodePoint(cp);
          for (let i = 0; i < SEQUENCES.SCRIPT.length; i++) {
            this._emitCodePoint(this._consume());
          }
          this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED;
        } else if (!this._ensureHibernation()) {
          this.state = State.SCRIPT_DATA_ESCAPED;
          this._stateScriptDataEscaped(cp);
        }
      }
      // Script data double escaped state
      //------------------------------------------------------------------
      _stateScriptDataDoubleEscaped(cp) {
        switch (cp) {
          case CODE_POINTS.HYPHEN_MINUS: {
            this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED_DASH;
            this._emitChars("-");
            break;
          }
          case CODE_POINTS.LESS_THAN_SIGN: {
            this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN;
            this._emitChars("<");
            break;
          }
          case CODE_POINTS.NULL: {
            this._err(ERR.unexpectedNullCharacter);
            this._emitChars(REPLACEMENT_CHARACTER);
            break;
          }
          case CODE_POINTS.EOF: {
            this._err(ERR.eofInScriptHtmlCommentLikeText);
            this._emitEOFToken();
            break;
          }
          default: {
            this._emitCodePoint(cp);
          }
        }
      }
      // Script data double escaped dash state
      //------------------------------------------------------------------
      _stateScriptDataDoubleEscapedDash(cp) {
        switch (cp) {
          case CODE_POINTS.HYPHEN_MINUS: {
            this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH;
            this._emitChars("-");
            break;
          }
          case CODE_POINTS.LESS_THAN_SIGN: {
            this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN;
            this._emitChars("<");
            break;
          }
          case CODE_POINTS.NULL: {
            this._err(ERR.unexpectedNullCharacter);
            this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED;
            this._emitChars(REPLACEMENT_CHARACTER);
            break;
          }
          case CODE_POINTS.EOF: {
            this._err(ERR.eofInScriptHtmlCommentLikeText);
            this._emitEOFToken();
            break;
          }
          default: {
            this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED;
            this._emitCodePoint(cp);
          }
        }
      }
      // Script data double escaped dash dash state
      //------------------------------------------------------------------
      _stateScriptDataDoubleEscapedDashDash(cp) {
        switch (cp) {
          case CODE_POINTS.HYPHEN_MINUS: {
            this._emitChars("-");
            break;
          }
          case CODE_POINTS.LESS_THAN_SIGN: {
            this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN;
            this._emitChars("<");
            break;
          }
          case CODE_POINTS.GREATER_THAN_SIGN: {
            this.state = State.SCRIPT_DATA;
            this._emitChars(">");
            break;
          }
          case CODE_POINTS.NULL: {
            this._err(ERR.unexpectedNullCharacter);
            this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED;
            this._emitChars(REPLACEMENT_CHARACTER);
            break;
          }
          case CODE_POINTS.EOF: {
            this._err(ERR.eofInScriptHtmlCommentLikeText);
            this._emitEOFToken();
            break;
          }
          default: {
            this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED;
            this._emitCodePoint(cp);
          }
        }
      }
      // Script data double escaped less-than sign state
      //------------------------------------------------------------------
      _stateScriptDataDoubleEscapedLessThanSign(cp) {
        if (cp === CODE_POINTS.SOLIDUS) {
          this.state = State.SCRIPT_DATA_DOUBLE_ESCAPE_END;
          this._emitChars("/");
        } else {
          this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED;
          this._stateScriptDataDoubleEscaped(cp);
        }
      }
      // Script data double escape end state
      //------------------------------------------------------------------
      _stateScriptDataDoubleEscapeEnd(cp) {
        if (this.preprocessor.startsWith(SEQUENCES.SCRIPT, false) && isScriptDataDoubleEscapeSequenceEnd(this.preprocessor.peek(SEQUENCES.SCRIPT.length))) {
          this._emitCodePoint(cp);
          for (let i = 0; i < SEQUENCES.SCRIPT.length; i++) {
            this._emitCodePoint(this._consume());
          }
          this.state = State.SCRIPT_DATA_ESCAPED;
        } else if (!this._ensureHibernation()) {
          this.state = State.SCRIPT_DATA_DOUBLE_ESCAPED;
          this._stateScriptDataDoubleEscaped(cp);
        }
      }
      // Before attribute name state
      //------------------------------------------------------------------
      _stateBeforeAttributeName(cp) {
        switch (cp) {
          case CODE_POINTS.SPACE:
          case CODE_POINTS.LINE_FEED:
          case CODE_POINTS.TABULATION:
          case CODE_POINTS.FORM_FEED: {
            break;
          }
          case CODE_POINTS.SOLIDUS:
          case CODE_POINTS.GREATER_THAN_SIGN:
          case CODE_POINTS.EOF: {
            this.state = State.AFTER_ATTRIBUTE_NAME;
            this._stateAfterAttributeName(cp);
            break;
          }
          case CODE_POINTS.EQUALS_SIGN: {
            this._err(ERR.unexpectedEqualsSignBeforeAttributeName);
            this._createAttr("=");
            this.state = State.ATTRIBUTE_NAME;
            break;
          }
          default: {
            this._createAttr("");
            this.state = State.ATTRIBUTE_NAME;
            this._stateAttributeName(cp);
          }
        }
      }
      // Attribute name state
      //------------------------------------------------------------------
      _stateAttributeName(cp) {
        switch (cp) {
          case CODE_POINTS.SPACE:
          case CODE_POINTS.LINE_FEED:
          case CODE_POINTS.TABULATION:
          case CODE_POINTS.FORM_FEED:
          case CODE_POINTS.SOLIDUS:
          case CODE_POINTS.GREATER_THAN_SIGN:
          case CODE_POINTS.EOF: {
            this._leaveAttrName();
            this.state = State.AFTER_ATTRIBUTE_NAME;
            this._stateAfterAttributeName(cp);
            break;
          }
          case CODE_POINTS.EQUALS_SIGN: {
            this._leaveAttrName();
            this.state = State.BEFORE_ATTRIBUTE_VALUE;
            break;
          }
          case CODE_POINTS.QUOTATION_MARK:
          case CODE_POINTS.APOSTROPHE:
          case CODE_POINTS.LESS_THAN_SIGN: {
            this._err(ERR.unexpectedCharacterInAttributeName);
            this.currentAttr.name += String.fromCodePoint(cp);
            break;
          }
          case CODE_POINTS.NULL: {
            this._err(ERR.unexpectedNullCharacter);
            this.currentAttr.name += REPLACEMENT_CHARACTER;
            break;
          }
          default: {
            this.currentAttr.name += String.fromCodePoint(isAsciiUpper(cp) ? toAsciiLower(cp) : cp);
          }
        }
      }
      // After attribute name state
      //------------------------------------------------------------------
      _stateAfterAttributeName(cp) {
        switch (cp) {
          case CODE_POINTS.SPACE:
          case CODE_POINTS.LINE_FEED:
          case CODE_POINTS.TABULATION:
          case CODE_POINTS.FORM_FEED: {
            break;
          }
          case CODE_POINTS.SOLIDUS: {
            this.state = State.SELF_CLOSING_START_TAG;
            break;
          }
          case CODE_POINTS.EQUALS_SIGN: {
            this.state = State.BEFORE_ATTRIBUTE_VALUE;
            break;
          }
          case CODE_POINTS.GREATER_THAN_SIGN: {
            this.state = State.DATA;
            this.emitCurrentTagToken();
            break;
          }
          case CODE_POINTS.EOF: {
            this._err(ERR.eofInTag);
            this._emitEOFToken();
            break;
          }
          default: {
            this._createAttr("");
            this.state = State.ATTRIBUTE_NAME;
            this._stateAttributeName(cp);
          }
        }
      }
      // Before attribute value state
      //------------------------------------------------------------------
      _stateBeforeAttributeValue(cp) {
        switch (cp) {
          case CODE_POINTS.SPACE:
          case CODE_POINTS.LINE_FEED:
          case CODE_POINTS.TABULATION:
          case CODE_POINTS.FORM_FEED: {
            break;
          }
          case CODE_POINTS.QUOTATION_MARK: {
            this.state = State.ATTRIBUTE_VALUE_DOUBLE_QUOTED;
            break;
          }
          case CODE_POINTS.APOSTROPHE: {
            this.state = State.ATTRIBUTE_VALUE_SINGLE_QUOTED;
            break;
          }
          case CODE_POINTS.GREATER_THAN_SIGN: {
            this._err(ERR.missingAttributeValue);
            this.state = State.DATA;
            this.emitCurrentTagToken();
            break;
          }
          default: {
            this.state = State.ATTRIBUTE_VALUE_UNQUOTED;
            this._stateAttributeValueUnquoted(cp);
          }
        }
      }
      // Attribute value (double-quoted) state
      //------------------------------------------------------------------
      _stateAttributeValueDoubleQuoted(cp) {
        switch (cp) {
          case CODE_POINTS.QUOTATION_MARK: {
            this.state = State.AFTER_ATTRIBUTE_VALUE_QUOTED;
            break;
          }
          case CODE_POINTS.AMPERSAND: {
            this._startCharacterReference();
            break;
          }
          case CODE_POINTS.NULL: {
            this._err(ERR.unexpectedNullCharacter);
            this.currentAttr.value += REPLACEMENT_CHARACTER;
            break;
          }
          case CODE_POINTS.EOF: {
            this._err(ERR.eofInTag);
            this._emitEOFToken();
            break;
          }
          default: {
            this.currentAttr.value += String.fromCodePoint(cp);
          }
        }
      }
      // Attribute value (single-quoted) state
      //------------------------------------------------------------------
      _stateAttributeValueSingleQuoted(cp) {
        switch (cp) {
          case CODE_POINTS.APOSTROPHE: {
            this.state = State.AFTER_ATTRIBUTE_VALUE_QUOTED;
            break;
          }
          case CODE_POINTS.AMPERSAND: {
            this._startCharacterReference();
            break;
          }
          case CODE_POINTS.NULL: {
            this._err(ERR.unexpectedNullCharacter);
            this.currentAttr.value += REPLACEMENT_CHARACTER;
            break;
          }
          case CODE_POINTS.EOF: {
            this._err(ERR.eofInTag);
            this._emitEOFToken();
            break;
          }
          default: {
            this.currentAttr.value += String.fromCodePoint(cp);
          }
        }
      }
      // Attribute value (unquoted) state
      //------------------------------------------------------------------
      _stateAttributeValueUnquoted(cp) {
        switch (cp) {
          case CODE_POINTS.SPACE:
          case CODE_POINTS.LINE_FEED:
          case CODE_POINTS.TABULATION:
          case CODE_POINTS.FORM_FEED: {
            this._leaveAttrValue();
            this.state = State.BEFORE_ATTRIBUTE_NAME;
            break;
          }
          case CODE_POINTS.AMPERSAND: {
            this._startCharacterReference();
            break;
          }
          case CODE_POINTS.GREATER_THAN_SIGN: {
            this._leaveAttrValue();
            this.state = State.DATA;
            this.emitCurrentTagToken();
            break;
          }
          case CODE_POINTS.NULL: {
            this._err(ERR.unexpectedNullCharacter);
            this.currentAttr.value += REPLACEMENT_CHARACTER;
            break;
          }
          case CODE_POINTS.QUOTATION_MARK:
          case CODE_POINTS.APOSTROPHE:
          case CODE_POINTS.LESS_THAN_SIGN:
          case CODE_POINTS.EQUALS_SIGN:
          case CODE_POINTS.GRAVE_ACCENT: {
            this._err(ERR.unexpectedCharacterInUnquotedAttributeValue);
            this.currentAttr.value += String.fromCodePoint(cp);
            break;
          }
          case CODE_POINTS.EOF: {
            this._err(ERR.eofInTag);
            this._emitEOFToken();
            break;
          }
          default: {
            this.currentAttr.value += String.fromCodePoint(cp);
          }
        }
      }
      // After attribute value (quoted) state
      //------------------------------------------------------------------
      _stateAfterAttributeValueQuoted(cp) {
        switch (cp) {
          case CODE_POINTS.SPACE:
          case CODE_POINTS.LINE_FEED:
          case CODE_POINTS.TABULATION:
          case CODE_POINTS.FORM_FEED: {
            this._leaveAttrValue();
            this.state = State.BEFORE_ATTRIBUTE_NAME;
            break;
          }
          case CODE_POINTS.SOLIDUS: {
            this._leaveAttrValue();
            this.state = State.SELF_CLOSING_START_TAG;
            break;
          }
          case CODE_POINTS.GREATER_THAN_SIGN: {
            this._leaveAttrValue();
            this.state = State.DATA;
            this.emitCurrentTagToken();
            break;
          }
          case CODE_POINTS.EOF: {
            this._err(ERR.eofInTag);
            this._emitEOFToken();
            break;
          }
          default: {
            this._err(ERR.missingWhitespaceBetweenAttributes);
            this.state = State.BEFORE_ATTRIBUTE_NAME;
            this._stateBeforeAttributeName(cp);
          }
        }
      }
      // Self-closing start tag state
      //------------------------------------------------------------------
      _stateSelfClosingStartTag(cp) {
        switch (cp) {
          case CODE_POINTS.GREATER_THAN_SIGN: {
            const token = this.currentToken;
            token.selfClosing = true;
            this.state = State.DATA;
            this.emitCurrentTagToken();
            break;
          }
          case CODE_POINTS.EOF: {
            this._err(ERR.eofInTag);
            this._emitEOFToken();
            break;
          }
          default: {
            this._err(ERR.unexpectedSolidusInTag);
            this.state = State.BEFORE_ATTRIBUTE_NAME;
            this._stateBeforeAttributeName(cp);
          }
        }
      }
      // Bogus comment state
      //------------------------------------------------------------------
      _stateBogusComment(cp) {
        const token = this.currentToken;
        switch (cp) {
          case CODE_POINTS.GREATER_THAN_SIGN: {
            this.state = State.DATA;
            this.emitCurrentComment(token);
            break;
          }
          case CODE_POINTS.EOF: {
            this.emitCurrentComment(token);
            this._emitEOFToken();
            break;
          }
          case CODE_POINTS.NULL: {
            this._err(ERR.unexpectedNullCharacter);
            token.data += REPLACEMENT_CHARACTER;
            break;
          }
          default: {
            token.data += String.fromCodePoint(cp);
          }
        }
      }
      // Markup declaration open state
      //------------------------------------------------------------------
      _stateMarkupDeclarationOpen(cp) {
        if (this._consumeSequenceIfMatch(SEQUENCES.DASH_DASH, true)) {
          this._createCommentToken(SEQUENCES.DASH_DASH.length + 1);
          this.state = State.COMMENT_START;
        } else if (this._consumeSequenceIfMatch(SEQUENCES.DOCTYPE, false)) {
          this.currentLocation = this.getCurrentLocation(SEQUENCES.DOCTYPE.length + 1);
          this.state = State.DOCTYPE;
        } else if (this._consumeSequenceIfMatch(SEQUENCES.CDATA_START, true)) {
          if (this.inForeignNode) {
            this.state = State.CDATA_SECTION;
          } else {
            this._err(ERR.cdataInHtmlContent);
            this._createCommentToken(SEQUENCES.CDATA_START.length + 1);
            this.currentToken.data = "[CDATA[";
            this.state = State.BOGUS_COMMENT;
          }
        } else if (!this._ensureHibernation()) {
          this._err(ERR.incorrectlyOpenedComment);
          this._createCommentToken(2);
          this.state = State.BOGUS_COMMENT;
          this._stateBogusComment(cp);
        }
      }
      // Comment start state
      //------------------------------------------------------------------
      _stateCommentStart(cp) {
        switch (cp) {
          case CODE_POINTS.HYPHEN_MINUS: {
            this.state = State.COMMENT_START_DASH;
            break;
          }
          case CODE_POINTS.GREATER_THAN_SIGN: {
            this._err(ERR.abruptClosingOfEmptyComment);
            this.state = State.DATA;
            const token = this.currentToken;
            this.emitCurrentComment(token);
            break;
          }
          default: {
            this.state = State.COMMENT;
            this._stateComment(cp);
          }
        }
      }
      // Comment start dash state
      //------------------------------------------------------------------
      _stateCommentStartDash(cp) {
        const token = this.currentToken;
        switch (cp) {
          case CODE_POINTS.HYPHEN_MINUS: {
            this.state = State.COMMENT_END;
            break;
          }
          case CODE_POINTS.GREATER_THAN_SIGN: {
            this._err(ERR.abruptClosingOfEmptyComment);
            this.state = State.DATA;
            this.emitCurrentComment(token);
            break;
          }
          case CODE_POINTS.EOF: {
            this._err(ERR.eofInComment);
            this.emitCurrentComment(token);
            this._emitEOFToken();
            break;
          }
          default: {
            token.data += "-";
            this.state = State.COMMENT;
            this._stateComment(cp);
          }
        }
      }
      // Comment state
      //------------------------------------------------------------------
      _stateComment(cp) {
        const token = this.currentToken;
        switch (cp) {
          case CODE_POINTS.HYPHEN_MINUS: {
            this.state = State.COMMENT_END_DASH;
            break;
          }
          case CODE_POINTS.LESS_THAN_SIGN: {
            token.data += "<";
            this.state = State.COMMENT_LESS_THAN_SIGN;
            break;
          }
          case CODE_POINTS.NULL: {
            this._err(ERR.unexpectedNullCharacter);
            token.data += REPLACEMENT_CHARACTER;
            break;
          }
          case CODE_POINTS.EOF: {
            this._err(ERR.eofInComment);
            this.emitCurrentComment(token);
            this._emitEOFToken();
            break;
          }
          default: {
            token.data += String.fromCodePoint(cp);
          }
        }
      }
      // Comment less-than sign state
      //------------------------------------------------------------------
      _stateCommentLessThanSign(cp) {
        const token = this.currentToken;
        switch (cp) {
          case CODE_POINTS.EXCLAMATION_MARK: {
            token.data += "!";
            this.state = State.COMMENT_LESS_THAN_SIGN_BANG;
            break;
          }
          case CODE_POINTS.LESS_THAN_SIGN: {
            token.data += "<";
            break;
          }
          default: {
            this.state = State.COMMENT;
            this._stateComment(cp);
          }
        }
      }
      // Comment less-than sign bang state
      //------------------------------------------------------------------
      _stateCommentLessThanSignBang(cp) {
        if (cp === CODE_POINTS.HYPHEN_MINUS) {
          this.state = State.COMMENT_LESS_THAN_SIGN_BANG_DASH;
        } else {
          this.state = State.COMMENT;
          this._stateComment(cp);
        }
      }
      // Comment less-than sign bang dash state
      //------------------------------------------------------------------
      _stateCommentLessThanSignBangDash(cp) {
        if (cp === CODE_POINTS.HYPHEN_MINUS) {
          this.state = State.COMMENT_LESS_THAN_SIGN_BANG_DASH_DASH;
        } else {
          this.state = State.COMMENT_END_DASH;
          this._stateCommentEndDash(cp);
        }
      }
      // Comment less-than sign bang dash dash state
      //------------------------------------------------------------------
      _stateCommentLessThanSignBangDashDash(cp) {
        if (cp !== CODE_POINTS.GREATER_THAN_SIGN && cp !== CODE_POINTS.EOF) {
          this._err(ERR.nestedComment);
        }
        this.state = State.COMMENT_END;
        this._stateCommentEnd(cp);
      }
      // Comment end dash state
      //------------------------------------------------------------------
      _stateCommentEndDash(cp) {
        const token = this.currentToken;
        switch (cp) {
          case CODE_POINTS.HYPHEN_MINUS: {
            this.state = State.COMMENT_END;
            break;
          }
          case CODE_POINTS.EOF: {
            this._err(ERR.eofInComment);
            this.emitCurrentComment(token);
            this._emitEOFToken();
            break;
          }
          default: {
            token.data += "-";
            this.state = State.COMMENT;
            this._stateComment(cp);
          }
        }
      }
      // Comment end state
      //------------------------------------------------------------------
      _stateCommentEnd(cp) {
        const token = this.currentToken;
        switch (cp) {
          case CODE_POINTS.GREATER_THAN_SIGN: {
            this.state = State.DATA;
            this.emitCurrentComment(token);
            break;
          }
          case CODE_POINTS.EXCLAMATION_MARK: {
            this.state = State.COMMENT_END_BANG;
            break;
          }
          case CODE_POINTS.HYPHEN_MINUS: {
            token.data += "-";
            break;
          }
          case CODE_POINTS.EOF: {
            this._err(ERR.eofInComment);
            this.emitCurrentComment(token);
            this._emitEOFToken();
            break;
          }
          default: {
            token.data += "--";
            this.state = State.COMMENT;
            this._stateComment(cp);
          }
        }
      }
      // Comment end bang state
      //------------------------------------------------------------------
      _stateCommentEndBang(cp) {
        const token = this.currentToken;
        switch (cp) {
          case CODE_POINTS.HYPHEN_MINUS: {
            token.data += "--!";
            this.state = State.COMMENT_END_DASH;
            break;
          }
          case CODE_POINTS.GREATER_THAN_SIGN: {
            this._err(ERR.incorrectlyClosedComment);
            this.state = State.DATA;
            this.emitCurrentComment(token);
            break;
          }
          case CODE_POINTS.EOF: {
            this._err(ERR.eofInComment);
            this.emitCurrentComment(token);
            this._emitEOFToken();
            break;
          }
          default: {
            token.data += "--!";
            this.state = State.COMMENT;
            this._stateComment(cp);
          }
        }
      }
      // DOCTYPE state
      //------------------------------------------------------------------
      _stateDoctype(cp) {
        switch (cp) {
          case CODE_POINTS.SPACE:
          case CODE_POINTS.LINE_FEED:
          case CODE_POINTS.TABULATION:
          case CODE_POINTS.FORM_FEED: {
            this.state = State.BEFORE_DOCTYPE_NAME;
            break;
          }
          case CODE_POINTS.GREATER_THAN_SIGN: {
            this.state = State.BEFORE_DOCTYPE_NAME;
            this._stateBeforeDoctypeName(cp);
            break;
          }
          case CODE_POINTS.EOF: {
            this._err(ERR.eofInDoctype);
            this._createDoctypeToken(null);
            const token = this.currentToken;
            token.forceQuirks = true;
            this.emitCurrentDoctype(token);
            this._emitEOFToken();
            break;
          }
          default: {
            this._err(ERR.missingWhitespaceBeforeDoctypeName);
            this.state = State.BEFORE_DOCTYPE_NAME;
            this._stateBeforeDoctypeName(cp);
          }
        }
      }
      // Before DOCTYPE name state
      //------------------------------------------------------------------
      _stateBeforeDoctypeName(cp) {
        if (isAsciiUpper(cp)) {
          this._createDoctypeToken(String.fromCharCode(toAsciiLower(cp)));
          this.state = State.DOCTYPE_NAME;
        } else
          switch (cp) {
            case CODE_POINTS.SPACE:
            case CODE_POINTS.LINE_FEED:
            case CODE_POINTS.TABULATION:
            case CODE_POINTS.FORM_FEED: {
              break;
            }
            case CODE_POINTS.NULL: {
              this._err(ERR.unexpectedNullCharacter);
              this._createDoctypeToken(REPLACEMENT_CHARACTER);
              this.state = State.DOCTYPE_NAME;
              break;
            }
            case CODE_POINTS.GREATER_THAN_SIGN: {
              this._err(ERR.missingDoctypeName);
              this._createDoctypeToken(null);
              const token = this.currentToken;
              token.forceQuirks = true;
              this.emitCurrentDoctype(token);
              this.state = State.DATA;
              break;
            }
            case CODE_POINTS.EOF: {
              this._err(ERR.eofInDoctype);
              this._createDoctypeToken(null);
              const token = this.currentToken;
              token.forceQuirks = true;
              this.emitCurrentDoctype(token);
              this._emitEOFToken();
              break;
            }
            default: {
              this._createDoctypeToken(String.fromCodePoint(cp));
              this.state = State.DOCTYPE_NAME;
            }
          }
      }
      // DOCTYPE name state
      //------------------------------------------------------------------
      _stateDoctypeName(cp) {
        const token = this.currentToken;
        switch (cp) {
          case CODE_POINTS.SPACE:
          case CODE_POINTS.LINE_FEED:
          case CODE_POINTS.TABULATION:
          case CODE_POINTS.FORM_FEED: {
            this.state = State.AFTER_DOCTYPE_NAME;
            break;
          }
          case CODE_POINTS.GREATER_THAN_SIGN: {
            this.state = State.DATA;
            this.emitCurrentDoctype(token);
            break;
          }
          case CODE_POINTS.NULL: {
            this._err(ERR.unexpectedNullCharacter);
            token.name += REPLACEMENT_CHARACTER;
            break;
          }
          case CODE_POINTS.EOF: {
            this._err(ERR.eofInDoctype);
            token.forceQuirks = true;
            this.emitCurrentDoctype(token);
            this._emitEOFToken();
            break;
          }
          default: {
            token.name += String.fromCodePoint(isAsciiUpper(cp) ? toAsciiLower(cp) : cp);
          }
        }
      }
      // After DOCTYPE name state
      //------------------------------------------------------------------
      _stateAfterDoctypeName(cp) {
        const token = this.currentToken;
        switch (cp) {
          case CODE_POINTS.SPACE:
          case CODE_POINTS.LINE_FEED:
          case CODE_POINTS.TABULATION:
          case CODE_POINTS.FORM_FEED: {
            break;
          }
          case CODE_POINTS.GREATER_THAN_SIGN: {
            this.state = State.DATA;
            this.emitCurrentDoctype(token);
            break;
          }
          case CODE_POINTS.EOF: {
            this._err(ERR.eofInDoctype);
            token.forceQuirks = true;
            this.emitCurrentDoctype(token);
            this._emitEOFToken();
            break;
          }
          default: {
            if (this._consumeSequenceIfMatch(SEQUENCES.PUBLIC, false)) {
              this.state = State.AFTER_DOCTYPE_PUBLIC_KEYWORD;
            } else if (this._consumeSequenceIfMatch(SEQUENCES.SYSTEM, false)) {
              this.state = State.AFTER_DOCTYPE_SYSTEM_KEYWORD;
            } else if (!this._ensureHibernation()) {
              this._err(ERR.invalidCharacterSequenceAfterDoctypeName);
              token.forceQuirks = true;
              this.state = State.BOGUS_DOCTYPE;
              this._stateBogusDoctype(cp);
            }
          }
        }
      }
      // After DOCTYPE public keyword state
      //------------------------------------------------------------------
      _stateAfterDoctypePublicKeyword(cp) {
        const token = this.currentToken;
        switch (cp) {
          case CODE_POINTS.SPACE:
          case CODE_POINTS.LINE_FEED:
          case CODE_POINTS.TABULATION:
          case CODE_POINTS.FORM_FEED: {
            this.state = State.BEFORE_DOCTYPE_PUBLIC_IDENTIFIER;
            break;
          }
          case CODE_POINTS.QUOTATION_MARK: {
            this._err(ERR.missingWhitespaceAfterDoctypePublicKeyword);
            token.publicId = "";
            this.state = State.DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED;
            break;
          }
          case CODE_POINTS.APOSTROPHE: {
            this._err(ERR.missingWhitespaceAfterDoctypePublicKeyword);
            token.publicId = "";
            this.state = State.DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED;
            break;
          }
          case CODE_POINTS.GREATER_THAN_SIGN: {
            this._err(ERR.missingDoctypePublicIdentifier);
            token.forceQuirks = true;
            this.state = State.DATA;
            this.emitCurrentDoctype(token);
            break;
          }
          case CODE_POINTS.EOF: {
            this._err(ERR.eofInDoctype);
            token.forceQuirks = true;
            this.emitCurrentDoctype(token);
            this._emitEOFToken();
            break;
          }
          default: {
            this._err(ERR.missingQuoteBeforeDoctypePublicIdentifier);
            token.forceQuirks = true;
            this.state = State.BOGUS_DOCTYPE;
            this._stateBogusDoctype(cp);
          }
        }
      }
      // Before DOCTYPE public identifier state
      //------------------------------------------------------------------
      _stateBeforeDoctypePublicIdentifier(cp) {
        const token = this.currentToken;
        switch (cp) {
          case CODE_POINTS.SPACE:
          case CODE_POINTS.LINE_FEED:
          case CODE_POINTS.TABULATION:
          case CODE_POINTS.FORM_FEED: {
            break;
          }
          case CODE_POINTS.QUOTATION_MARK: {
            token.publicId = "";
            this.state = State.DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED;
            break;
          }
          case CODE_POINTS.APOSTROPHE: {
            token.publicId = "";
            this.state = State.DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED;
            break;
          }
          case CODE_POINTS.GREATER_THAN_SIGN: {
            this._err(ERR.missingDoctypePublicIdentifier);
            token.forceQuirks = true;
            this.state = State.DATA;
            this.emitCurrentDoctype(token);
            break;
          }
          case CODE_POINTS.EOF: {
            this._err(ERR.eofInDoctype);
            token.forceQuirks = true;
            this.emitCurrentDoctype(token);
            this._emitEOFToken();
            break;
          }
          default: {
            this._err(ERR.missingQuoteBeforeDoctypePublicIdentifier);
            token.forceQuirks = true;
            this.state = State.BOGUS_DOCTYPE;
            this._stateBogusDoctype(cp);
          }
        }
      }
      // DOCTYPE public identifier (double-quoted) state
      //------------------------------------------------------------------
      _stateDoctypePublicIdentifierDoubleQuoted(cp) {
        const token = this.currentToken;
        switch (cp) {
          case CODE_POINTS.QUOTATION_MARK: {
            this.state = State.AFTER_DOCTYPE_PUBLIC_IDENTIFIER;
            break;
          }
          case CODE_POINTS.NULL: {
            this._err(ERR.unexpectedNullCharacter);
            token.publicId += REPLACEMENT_CHARACTER;
            break;
          }
          case CODE_POINTS.GREATER_THAN_SIGN: {
            this._err(ERR.abruptDoctypePublicIdentifier);
            token.forceQuirks = true;
            this.emitCurrentDoctype(token);
            this.state = State.DATA;
            break;
          }
          case CODE_POINTS.EOF: {
            this._err(ERR.eofInDoctype);
            token.forceQuirks = true;
            this.emitCurrentDoctype(token);
            this._emitEOFToken();
            break;
          }
          default: {
            token.publicId += String.fromCodePoint(cp);
          }
        }
      }
      // DOCTYPE public identifier (single-quoted) state
      //------------------------------------------------------------------
      _stateDoctypePublicIdentifierSingleQuoted(cp) {
        const token = this.currentToken;
        switch (cp) {
          case CODE_POINTS.APOSTROPHE: {
            this.state = State.AFTER_DOCTYPE_PUBLIC_IDENTIFIER;
            break;
          }
          case CODE_POINTS.NULL: {
            this._err(ERR.unexpectedNullCharacter);
            token.publicId += REPLACEMENT_CHARACTER;
            break;
          }
          case CODE_POINTS.GREATER_THAN_SIGN: {
            this._err(ERR.abruptDoctypePublicIdentifier);
            token.forceQuirks = true;
            this.emitCurrentDoctype(token);
            this.state = State.DATA;
            break;
          }
          case CODE_POINTS.EOF: {
            this._err(ERR.eofInDoctype);
            token.forceQuirks = true;
            this.emitCurrentDoctype(token);
            this._emitEOFToken();
            break;
          }
          default: {
            token.publicId += String.fromCodePoint(cp);
          }
        }
      }
      // After DOCTYPE public identifier state
      //------------------------------------------------------------------
      _stateAfterDoctypePublicIdentifier(cp) {
        const token = this.currentToken;
        switch (cp) {
          case CODE_POINTS.SPACE:
          case CODE_POINTS.LINE_FEED:
          case CODE_POINTS.TABULATION:
          case CODE_POINTS.FORM_FEED: {
            this.state = State.BETWEEN_DOCTYPE_PUBLIC_AND_SYSTEM_IDENTIFIERS;
            break;
          }
          case CODE_POINTS.GREATER_THAN_SIGN: {
            this.state = State.DATA;
            this.emitCurrentDoctype(token);
            break;
          }
          case CODE_POINTS.QUOTATION_MARK: {
            this._err(ERR.missingWhitespaceBetweenDoctypePublicAndSystemIdentifiers);
            token.systemId = "";
            this.state = State.DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED;
            break;
          }
          case CODE_POINTS.APOSTROPHE: {
            this._err(ERR.missingWhitespaceBetweenDoctypePublicAndSystemIdentifiers);
            token.systemId = "";
            this.state = State.DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED;
            break;
          }
          case CODE_POINTS.EOF: {
            this._err(ERR.eofInDoctype);
            token.forceQuirks = true;
            this.emitCurrentDoctype(token);
            this._emitEOFToken();
            break;
          }
          default: {
            this._err(ERR.missingQuoteBeforeDoctypeSystemIdentifier);
            token.forceQuirks = true;
            this.state = State.BOGUS_DOCTYPE;
            this._stateBogusDoctype(cp);
          }
        }
      }
      // Between DOCTYPE public and system identifiers state
      //------------------------------------------------------------------
      _stateBetweenDoctypePublicAndSystemIdentifiers(cp) {
        const token = this.currentToken;
        switch (cp) {
          case CODE_POINTS.SPACE:
          case CODE_POINTS.LINE_FEED:
          case CODE_POINTS.TABULATION:
          case CODE_POINTS.FORM_FEED: {
            break;
          }
          case CODE_POINTS.GREATER_THAN_SIGN: {
            this.emitCurrentDoctype(token);
            this.state = State.DATA;
            break;
          }
          case CODE_POINTS.QUOTATION_MARK: {
            token.systemId = "";
            this.state = State.DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED;
            break;
          }
          case CODE_POINTS.APOSTROPHE: {
            token.systemId = "";
            this.state = State.DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED;
            break;
          }
          case CODE_POINTS.EOF: {
            this._err(ERR.eofInDoctype);
            token.forceQuirks = true;
            this.emitCurrentDoctype(token);
            this._emitEOFToken();
            break;
          }
          default: {
            this._err(ERR.missingQuoteBeforeDoctypeSystemIdentifier);
            token.forceQuirks = true;
            this.state = State.BOGUS_DOCTYPE;
            this._stateBogusDoctype(cp);
          }
        }
      }
      // After DOCTYPE system keyword state
      //------------------------------------------------------------------
      _stateAfterDoctypeSystemKeyword(cp) {
        const token = this.currentToken;
        switch (cp) {
          case CODE_POINTS.SPACE:
          case CODE_POINTS.LINE_FEED:
          case CODE_POINTS.TABULATION:
          case CODE_POINTS.FORM_FEED: {
            this.state = State.BEFORE_DOCTYPE_SYSTEM_IDENTIFIER;
            break;
          }
          case CODE_POINTS.QUOTATION_MARK: {
            this._err(ERR.missingWhitespaceAfterDoctypeSystemKeyword);
            token.systemId = "";
            this.state = State.DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED;
            break;
          }
          case CODE_POINTS.APOSTROPHE: {
            this._err(ERR.missingWhitespaceAfterDoctypeSystemKeyword);
            token.systemId = "";
            this.state = State.DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED;
            break;
          }
          case CODE_POINTS.GREATER_THAN_SIGN: {
            this._err(ERR.missingDoctypeSystemIdentifier);
            token.forceQuirks = true;
            this.state = State.DATA;
            this.emitCurrentDoctype(token);
            break;
          }
          case CODE_POINTS.EOF: {
            this._err(ERR.eofInDoctype);
            token.forceQuirks = true;
            this.emitCurrentDoctype(token);
            this._emitEOFToken();
            break;
          }
          default: {
            this._err(ERR.missingQuoteBeforeDoctypeSystemIdentifier);
            token.forceQuirks = true;
            this.state = State.BOGUS_DOCTYPE;
            this._stateBogusDoctype(cp);
          }
        }
      }
      // Before DOCTYPE system identifier state
      //------------------------------------------------------------------
      _stateBeforeDoctypeSystemIdentifier(cp) {
        const token = this.currentToken;
        switch (cp) {
          case CODE_POINTS.SPACE:
          case CODE_POINTS.LINE_FEED:
          case CODE_POINTS.TABULATION:
          case CODE_POINTS.FORM_FEED: {
            break;
          }
          case CODE_POINTS.QUOTATION_MARK: {
            token.systemId = "";
            this.state = State.DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED;
            break;
          }
          case CODE_POINTS.APOSTROPHE: {
            token.systemId = "";
            this.state = State.DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED;
            break;
          }
          case CODE_POINTS.GREATER_THAN_SIGN: {
            this._err(ERR.missingDoctypeSystemIdentifier);
            token.forceQuirks = true;
            this.state = State.DATA;
            this.emitCurrentDoctype(token);
            break;
          }
          case CODE_POINTS.EOF: {
            this._err(ERR.eofInDoctype);
            token.forceQuirks = true;
            this.emitCurrentDoctype(token);
            this._emitEOFToken();
            break;
          }
          default: {
            this._err(ERR.missingQuoteBeforeDoctypeSystemIdentifier);
            token.forceQuirks = true;
            this.state = State.BOGUS_DOCTYPE;
            this._stateBogusDoctype(cp);
          }
        }
      }
      // DOCTYPE system identifier (double-quoted) state
      //------------------------------------------------------------------
      _stateDoctypeSystemIdentifierDoubleQuoted(cp) {
        const token = this.currentToken;
        switch (cp) {
          case CODE_POINTS.QUOTATION_MARK: {
            this.state = State.AFTER_DOCTYPE_SYSTEM_IDENTIFIER;
            break;
          }
          case CODE_POINTS.NULL: {
            this._err(ERR.unexpectedNullCharacter);
            token.systemId += REPLACEMENT_CHARACTER;
            break;
          }
          case CODE_POINTS.GREATER_THAN_SIGN: {
            this._err(ERR.abruptDoctypeSystemIdentifier);
            token.forceQuirks = true;
            this.emitCurrentDoctype(token);
            this.state = State.DATA;
            break;
          }
          case CODE_POINTS.EOF: {
            this._err(ERR.eofInDoctype);
            token.forceQuirks = true;
            this.emitCurrentDoctype(token);
            this._emitEOFToken();
            break;
          }
          default: {
            token.systemId += String.fromCodePoint(cp);
          }
        }
      }
      // DOCTYPE system identifier (single-quoted) state
      //------------------------------------------------------------------
      _stateDoctypeSystemIdentifierSingleQuoted(cp) {
        const token = this.currentToken;
        switch (cp) {
          case CODE_POINTS.APOSTROPHE: {
            this.state = State.AFTER_DOCTYPE_SYSTEM_IDENTIFIER;
            break;
          }
          case CODE_POINTS.NULL: {
            this._err(ERR.unexpectedNullCharacter);
            token.systemId += REPLACEMENT_CHARACTER;
            break;
          }
          case CODE_POINTS.GREATER_THAN_SIGN: {
            this._err(ERR.abruptDoctypeSystemIdentifier);
            token.forceQuirks = true;
            this.emitCurrentDoctype(token);
            this.state = State.DATA;
            break;
          }
          case CODE_POINTS.EOF: {
            this._err(ERR.eofInDoctype);
            token.forceQuirks = true;
            this.emitCurrentDoctype(token);
            this._emitEOFToken();
            break;
          }
          default: {
            token.systemId += String.fromCodePoint(cp);
          }
        }
      }
      // After DOCTYPE system identifier state
      //------------------------------------------------------------------
      _stateAfterDoctypeSystemIdentifier(cp) {
        const token = this.currentToken;
        switch (cp) {
          case CODE_POINTS.SPACE:
          case CODE_POINTS.LINE_FEED:
          case CODE_POINTS.TABULATION:
          case CODE_POINTS.FORM_FEED: {
            break;
          }
          case CODE_POINTS.GREATER_THAN_SIGN: {
            this.emitCurrentDoctype(token);
            this.state = State.DATA;
            break;
          }
          case CODE_POINTS.EOF: {
            this._err(ERR.eofInDoctype);
            token.forceQuirks = true;
            this.emitCurrentDoctype(token);
            this._emitEOFToken();
            break;
          }
          default: {
            this._err(ERR.unexpectedCharacterAfterDoctypeSystemIdentifier);
            this.state = State.BOGUS_DOCTYPE;
            this._stateBogusDoctype(cp);
          }
        }
      }
      // Bogus DOCTYPE state
      //------------------------------------------------------------------
      _stateBogusDoctype(cp) {
        const token = this.currentToken;
        switch (cp) {
          case CODE_POINTS.GREATER_THAN_SIGN: {
            this.emitCurrentDoctype(token);
            this.state = State.DATA;
            break;
          }
          case CODE_POINTS.NULL: {
            this._err(ERR.unexpectedNullCharacter);
            break;
          }
          case CODE_POINTS.EOF: {
            this.emitCurrentDoctype(token);
            this._emitEOFToken();
            break;
          }
          default:
        }
      }
      // CDATA section state
      //------------------------------------------------------------------
      _stateCdataSection(cp) {
        switch (cp) {
          case CODE_POINTS.RIGHT_SQUARE_BRACKET: {
            this.state = State.CDATA_SECTION_BRACKET;
            break;
          }
          case CODE_POINTS.EOF: {
            this._err(ERR.eofInCdata);
            this._emitEOFToken();
            break;
          }
          default: {
            this._emitCodePoint(cp);
          }
        }
      }
      // CDATA section bracket state
      //------------------------------------------------------------------
      _stateCdataSectionBracket(cp) {
        if (cp === CODE_POINTS.RIGHT_SQUARE_BRACKET) {
          this.state = State.CDATA_SECTION_END;
        } else {
          this._emitChars("]");
          this.state = State.CDATA_SECTION;
          this._stateCdataSection(cp);
        }
      }
      // CDATA section end state
      //------------------------------------------------------------------
      _stateCdataSectionEnd(cp) {
        switch (cp) {
          case CODE_POINTS.GREATER_THAN_SIGN: {
            this.state = State.DATA;
            break;
          }
          case CODE_POINTS.RIGHT_SQUARE_BRACKET: {
            this._emitChars("]");
            break;
          }
          default: {
            this._emitChars("]]");
            this.state = State.CDATA_SECTION;
            this._stateCdataSection(cp);
          }
        }
      }
      // Character reference state
      //------------------------------------------------------------------
      _stateCharacterReference() {
        let length = this.entityDecoder.write(this.preprocessor.html, this.preprocessor.pos);
        if (length < 0) {
          if (this.preprocessor.lastChunkWritten) {
            length = this.entityDecoder.end();
          } else {
            this.active = false;
            this.preprocessor.pos = this.preprocessor.html.length - 1;
            this.consumedAfterSnapshot = 0;
            this.preprocessor.endOfChunkHit = true;
            return;
          }
        }
        if (length === 0) {
          this.preprocessor.pos = this.entityStartPos;
          this._flushCodePointConsumedAsCharacterReference(CODE_POINTS.AMPERSAND);
          this.state = !this._isCharacterReferenceInAttribute() && isAsciiAlphaNumeric2(this.preprocessor.peek(1)) ? State.AMBIGUOUS_AMPERSAND : this.returnState;
        } else {
          this.state = this.returnState;
        }
      }
      // Ambiguos ampersand state
      //------------------------------------------------------------------
      _stateAmbiguousAmpersand(cp) {
        if (isAsciiAlphaNumeric2(cp)) {
          this._flushCodePointConsumedAsCharacterReference(cp);
        } else {
          if (cp === CODE_POINTS.SEMICOLON) {
            this._err(ERR.unknownNamedCharacterReference);
          }
          this.state = this.returnState;
          this._callState(cp);
        }
      }
    };
  }
});

// node_modules/parse5/dist/parser/open-element-stack.js
var IMPLICIT_END_TAG_REQUIRED, IMPLICIT_END_TAG_REQUIRED_THOROUGHLY, SCOPING_ELEMENTS_HTML, SCOPING_ELEMENTS_HTML_LIST, SCOPING_ELEMENTS_HTML_BUTTON, SCOPING_ELEMENTS_MATHML, SCOPING_ELEMENTS_SVG, TABLE_ROW_CONTEXT, TABLE_BODY_CONTEXT, TABLE_CONTEXT, TABLE_CELLS, OpenElementStack;
var init_open_element_stack = __esm({
  "node_modules/parse5/dist/parser/open-element-stack.js"() {
    init_html();
    IMPLICIT_END_TAG_REQUIRED = /* @__PURE__ */ new Set([TAG_ID.DD, TAG_ID.DT, TAG_ID.LI, TAG_ID.OPTGROUP, TAG_ID.OPTION, TAG_ID.P, TAG_ID.RB, TAG_ID.RP, TAG_ID.RT, TAG_ID.RTC]);
    IMPLICIT_END_TAG_REQUIRED_THOROUGHLY = /* @__PURE__ */ new Set([
      ...IMPLICIT_END_TAG_REQUIRED,
      TAG_ID.CAPTION,
      TAG_ID.COLGROUP,
      TAG_ID.TBODY,
      TAG_ID.TD,
      TAG_ID.TFOOT,
      TAG_ID.TH,
      TAG_ID.THEAD,
      TAG_ID.TR
    ]);
    SCOPING_ELEMENTS_HTML = /* @__PURE__ */ new Set([
      TAG_ID.APPLET,
      TAG_ID.CAPTION,
      TAG_ID.HTML,
      TAG_ID.MARQUEE,
      TAG_ID.OBJECT,
      TAG_ID.TABLE,
      TAG_ID.TD,
      TAG_ID.TEMPLATE,
      TAG_ID.TH
    ]);
    SCOPING_ELEMENTS_HTML_LIST = /* @__PURE__ */ new Set([...SCOPING_ELEMENTS_HTML, TAG_ID.OL, TAG_ID.UL]);
    SCOPING_ELEMENTS_HTML_BUTTON = /* @__PURE__ */ new Set([...SCOPING_ELEMENTS_HTML, TAG_ID.BUTTON]);
    SCOPING_ELEMENTS_MATHML = /* @__PURE__ */ new Set([TAG_ID.ANNOTATION_XML, TAG_ID.MI, TAG_ID.MN, TAG_ID.MO, TAG_ID.MS, TAG_ID.MTEXT]);
    SCOPING_ELEMENTS_SVG = /* @__PURE__ */ new Set([TAG_ID.DESC, TAG_ID.FOREIGN_OBJECT, TAG_ID.TITLE]);
    TABLE_ROW_CONTEXT = /* @__PURE__ */ new Set([TAG_ID.TR, TAG_ID.TEMPLATE, TAG_ID.HTML]);
    TABLE_BODY_CONTEXT = /* @__PURE__ */ new Set([TAG_ID.TBODY, TAG_ID.TFOOT, TAG_ID.THEAD, TAG_ID.TEMPLATE, TAG_ID.HTML]);
    TABLE_CONTEXT = /* @__PURE__ */ new Set([TAG_ID.TABLE, TAG_ID.TEMPLATE, TAG_ID.HTML]);
    TABLE_CELLS = /* @__PURE__ */ new Set([TAG_ID.TD, TAG_ID.TH]);
    OpenElementStack = class {
      get currentTmplContentOrNode() {
        return this._isInTemplate() ? this.treeAdapter.getTemplateContent(this.current) : this.current;
      }
      constructor(document, treeAdapter, handler) {
        this.treeAdapter = treeAdapter;
        this.handler = handler;
        this.items = [];
        this.tagIDs = [];
        this.stackTop = -1;
        this.tmplCount = 0;
        this.currentTagId = TAG_ID.UNKNOWN;
        this.current = document;
      }
      //Index of element
      _indexOf(element) {
        return this.items.lastIndexOf(element, this.stackTop);
      }
      //Update current element
      _isInTemplate() {
        return this.currentTagId === TAG_ID.TEMPLATE && this.treeAdapter.getNamespaceURI(this.current) === NS.HTML;
      }
      _updateCurrentElement() {
        this.current = this.items[this.stackTop];
        this.currentTagId = this.tagIDs[this.stackTop];
      }
      //Mutations
      push(element, tagID) {
        this.stackTop++;
        this.items[this.stackTop] = element;
        this.current = element;
        this.tagIDs[this.stackTop] = tagID;
        this.currentTagId = tagID;
        if (this._isInTemplate()) {
          this.tmplCount++;
        }
        this.handler.onItemPush(element, tagID, true);
      }
      pop() {
        const popped = this.current;
        if (this.tmplCount > 0 && this._isInTemplate()) {
          this.tmplCount--;
        }
        this.stackTop--;
        this._updateCurrentElement();
        this.handler.onItemPop(popped, true);
      }
      replace(oldElement, newElement) {
        const idx = this._indexOf(oldElement);
        this.items[idx] = newElement;
        if (idx === this.stackTop) {
          this.current = newElement;
        }
      }
      insertAfter(referenceElement, newElement, newElementID) {
        const insertionIdx = this._indexOf(referenceElement) + 1;
        this.items.splice(insertionIdx, 0, newElement);
        this.tagIDs.splice(insertionIdx, 0, newElementID);
        this.stackTop++;
        if (insertionIdx === this.stackTop) {
          this._updateCurrentElement();
        }
        if (this.current && this.currentTagId !== void 0) {
          this.handler.onItemPush(this.current, this.currentTagId, insertionIdx === this.stackTop);
        }
      }
      popUntilTagNamePopped(tagName) {
        let targetIdx = this.stackTop + 1;
        do {
          targetIdx = this.tagIDs.lastIndexOf(tagName, targetIdx - 1);
        } while (targetIdx > 0 && this.treeAdapter.getNamespaceURI(this.items[targetIdx]) !== NS.HTML);
        this.shortenToLength(Math.max(targetIdx, 0));
      }
      shortenToLength(idx) {
        while (this.stackTop >= idx) {
          const popped = this.current;
          if (this.tmplCount > 0 && this._isInTemplate()) {
            this.tmplCount -= 1;
          }
          this.stackTop--;
          this._updateCurrentElement();
          this.handler.onItemPop(popped, this.stackTop < idx);
        }
      }
      popUntilElementPopped(element) {
        const idx = this._indexOf(element);
        this.shortenToLength(Math.max(idx, 0));
      }
      popUntilPopped(tagNames, targetNS) {
        const idx = this._indexOfTagNames(tagNames, targetNS);
        this.shortenToLength(Math.max(idx, 0));
      }
      popUntilNumberedHeaderPopped() {
        this.popUntilPopped(NUMBERED_HEADERS, NS.HTML);
      }
      popUntilTableCellPopped() {
        this.popUntilPopped(TABLE_CELLS, NS.HTML);
      }
      popAllUpToHtmlElement() {
        this.tmplCount = 0;
        this.shortenToLength(1);
      }
      _indexOfTagNames(tagNames, namespace) {
        for (let i = this.stackTop; i >= 0; i--) {
          if (tagNames.has(this.tagIDs[i]) && this.treeAdapter.getNamespaceURI(this.items[i]) === namespace) {
            return i;
          }
        }
        return -1;
      }
      clearBackTo(tagNames, targetNS) {
        const idx = this._indexOfTagNames(tagNames, targetNS);
        this.shortenToLength(idx + 1);
      }
      clearBackToTableContext() {
        this.clearBackTo(TABLE_CONTEXT, NS.HTML);
      }
      clearBackToTableBodyContext() {
        this.clearBackTo(TABLE_BODY_CONTEXT, NS.HTML);
      }
      clearBackToTableRowContext() {
        this.clearBackTo(TABLE_ROW_CONTEXT, NS.HTML);
      }
      remove(element) {
        const idx = this._indexOf(element);
        if (idx >= 0) {
          if (idx === this.stackTop) {
            this.pop();
          } else {
            this.items.splice(idx, 1);
            this.tagIDs.splice(idx, 1);
            this.stackTop--;
            this._updateCurrentElement();
            this.handler.onItemPop(element, false);
          }
        }
      }
      //Search
      tryPeekProperlyNestedBodyElement() {
        return this.stackTop >= 1 && this.tagIDs[1] === TAG_ID.BODY ? this.items[1] : null;
      }
      contains(element) {
        return this._indexOf(element) > -1;
      }
      getCommonAncestor(element) {
        const elementIdx = this._indexOf(element) - 1;
        return elementIdx >= 0 ? this.items[elementIdx] : null;
      }
      isRootHtmlElementCurrent() {
        return this.stackTop === 0 && this.tagIDs[0] === TAG_ID.HTML;
      }
      //Element in scope
      hasInDynamicScope(tagName, htmlScope) {
        for (let i = this.stackTop; i >= 0; i--) {
          const tn = this.tagIDs[i];
          switch (this.treeAdapter.getNamespaceURI(this.items[i])) {
            case NS.HTML: {
              if (tn === tagName)
                return true;
              if (htmlScope.has(tn))
                return false;
              break;
            }
            case NS.SVG: {
              if (SCOPING_ELEMENTS_SVG.has(tn))
                return false;
              break;
            }
            case NS.MATHML: {
              if (SCOPING_ELEMENTS_MATHML.has(tn))
                return false;
              break;
            }
          }
        }
        return true;
      }
      hasInScope(tagName) {
        return this.hasInDynamicScope(tagName, SCOPING_ELEMENTS_HTML);
      }
      hasInListItemScope(tagName) {
        return this.hasInDynamicScope(tagName, SCOPING_ELEMENTS_HTML_LIST);
      }
      hasInButtonScope(tagName) {
        return this.hasInDynamicScope(tagName, SCOPING_ELEMENTS_HTML_BUTTON);
      }
      hasNumberedHeaderInScope() {
        for (let i = this.stackTop; i >= 0; i--) {
          const tn = this.tagIDs[i];
          switch (this.treeAdapter.getNamespaceURI(this.items[i])) {
            case NS.HTML: {
              if (NUMBERED_HEADERS.has(tn))
                return true;
              if (SCOPING_ELEMENTS_HTML.has(tn))
                return false;
              break;
            }
            case NS.SVG: {
              if (SCOPING_ELEMENTS_SVG.has(tn))
                return false;
              break;
            }
            case NS.MATHML: {
              if (SCOPING_ELEMENTS_MATHML.has(tn))
                return false;
              break;
            }
          }
        }
        return true;
      }
      hasInTableScope(tagName) {
        for (let i = this.stackTop; i >= 0; i--) {
          if (this.treeAdapter.getNamespaceURI(this.items[i]) !== NS.HTML) {
            continue;
          }
          switch (this.tagIDs[i]) {
            case tagName: {
              return true;
            }
            case TAG_ID.TABLE:
            case TAG_ID.HTML: {
              return false;
            }
          }
        }
        return true;
      }
      hasTableBodyContextInTableScope() {
        for (let i = this.stackTop; i >= 0; i--) {
          if (this.treeAdapter.getNamespaceURI(this.items[i]) !== NS.HTML) {
            continue;
          }
          switch (this.tagIDs[i]) {
            case TAG_ID.TBODY:
            case TAG_ID.THEAD:
            case TAG_ID.TFOOT: {
              return true;
            }
            case TAG_ID.TABLE:
            case TAG_ID.HTML: {
              return false;
            }
          }
        }
        return true;
      }
      hasInSelectScope(tagName) {
        for (let i = this.stackTop; i >= 0; i--) {
          if (this.treeAdapter.getNamespaceURI(this.items[i]) !== NS.HTML) {
            continue;
          }
          switch (this.tagIDs[i]) {
            case tagName: {
              return true;
            }
            case TAG_ID.OPTION:
            case TAG_ID.OPTGROUP: {
              break;
            }
            default: {
              return false;
            }
          }
        }
        return true;
      }
      //Implied end tags
      generateImpliedEndTags() {
        while (this.currentTagId !== void 0 && IMPLICIT_END_TAG_REQUIRED.has(this.currentTagId)) {
          this.pop();
        }
      }
      generateImpliedEndTagsThoroughly() {
        while (this.currentTagId !== void 0 && IMPLICIT_END_TAG_REQUIRED_THOROUGHLY.has(this.currentTagId)) {
          this.pop();
        }
      }
      generateImpliedEndTagsWithExclusion(exclusionId) {
        while (this.currentTagId !== void 0 && this.currentTagId !== exclusionId && IMPLICIT_END_TAG_REQUIRED_THOROUGHLY.has(this.currentTagId)) {
          this.pop();
        }
      }
    };
  }
});

// node_modules/parse5/dist/parser/formatting-element-list.js
var NOAH_ARK_CAPACITY, EntryType, MARKER, FormattingElementList;
var init_formatting_element_list = __esm({
  "node_modules/parse5/dist/parser/formatting-element-list.js"() {
    NOAH_ARK_CAPACITY = 3;
    (function(EntryType2) {
      EntryType2[EntryType2["Marker"] = 0] = "Marker";
      EntryType2[EntryType2["Element"] = 1] = "Element";
    })(EntryType || (EntryType = {}));
    MARKER = { type: EntryType.Marker };
    FormattingElementList = class {
      constructor(treeAdapter) {
        this.treeAdapter = treeAdapter;
        this.entries = [];
        this.bookmark = null;
      }
      //Noah Ark's condition
      //OPTIMIZATION: at first we try to find possible candidates for exclusion using
      //lightweight heuristics without thorough attributes check.
      _getNoahArkConditionCandidates(newElement, neAttrs) {
        const candidates = [];
        const neAttrsLength = neAttrs.length;
        const neTagName = this.treeAdapter.getTagName(newElement);
        const neNamespaceURI = this.treeAdapter.getNamespaceURI(newElement);
        for (let i = 0; i < this.entries.length; i++) {
          const entry = this.entries[i];
          if (entry.type === EntryType.Marker) {
            break;
          }
          const { element } = entry;
          if (this.treeAdapter.getTagName(element) === neTagName && this.treeAdapter.getNamespaceURI(element) === neNamespaceURI) {
            const elementAttrs = this.treeAdapter.getAttrList(element);
            if (elementAttrs.length === neAttrsLength) {
              candidates.push({ idx: i, attrs: elementAttrs });
            }
          }
        }
        return candidates;
      }
      _ensureNoahArkCondition(newElement) {
        if (this.entries.length < NOAH_ARK_CAPACITY)
          return;
        const neAttrs = this.treeAdapter.getAttrList(newElement);
        const candidates = this._getNoahArkConditionCandidates(newElement, neAttrs);
        if (candidates.length < NOAH_ARK_CAPACITY)
          return;
        const neAttrsMap = new Map(neAttrs.map((neAttr) => [neAttr.name, neAttr.value]));
        let validCandidates = 0;
        for (let i = 0; i < candidates.length; i++) {
          const candidate = candidates[i];
          if (candidate.attrs.every((cAttr) => neAttrsMap.get(cAttr.name) === cAttr.value)) {
            validCandidates += 1;
            if (validCandidates >= NOAH_ARK_CAPACITY) {
              this.entries.splice(candidate.idx, 1);
            }
          }
        }
      }
      //Mutations
      insertMarker() {
        this.entries.unshift(MARKER);
      }
      pushElement(element, token) {
        this._ensureNoahArkCondition(element);
        this.entries.unshift({
          type: EntryType.Element,
          element,
          token
        });
      }
      insertElementAfterBookmark(element, token) {
        const bookmarkIdx = this.entries.indexOf(this.bookmark);
        this.entries.splice(bookmarkIdx, 0, {
          type: EntryType.Element,
          element,
          token
        });
      }
      removeEntry(entry) {
        const entryIndex = this.entries.indexOf(entry);
        if (entryIndex !== -1) {
          this.entries.splice(entryIndex, 1);
        }
      }
      /**
       * Clears the list of formatting elements up to the last marker.
       *
       * @see https://html.spec.whatwg.org/multipage/parsing.html#clear-the-list-of-active-formatting-elements-up-to-the-last-marker
       */
      clearToLastMarker() {
        const markerIdx = this.entries.indexOf(MARKER);
        if (markerIdx === -1) {
          this.entries.length = 0;
        } else {
          this.entries.splice(0, markerIdx + 1);
        }
      }
      //Search
      getElementEntryInScopeWithTagName(tagName) {
        const entry = this.entries.find((entry2) => entry2.type === EntryType.Marker || this.treeAdapter.getTagName(entry2.element) === tagName);
        return entry && entry.type === EntryType.Element ? entry : null;
      }
      getElementEntry(element) {
        return this.entries.find((entry) => entry.type === EntryType.Element && entry.element === element);
      }
    };
  }
});

// node_modules/parse5/dist/tree-adapters/default.js
var defaultTreeAdapter;
var init_default = __esm({
  "node_modules/parse5/dist/tree-adapters/default.js"() {
    init_html();
    defaultTreeAdapter = {
      //Node construction
      createDocument() {
        return {
          nodeName: "#document",
          mode: DOCUMENT_MODE.NO_QUIRKS,
          childNodes: []
        };
      },
      createDocumentFragment() {
        return {
          nodeName: "#document-fragment",
          childNodes: []
        };
      },
      createElement(tagName, namespaceURI, attrs) {
        return {
          nodeName: tagName,
          tagName,
          attrs,
          namespaceURI,
          childNodes: [],
          parentNode: null
        };
      },
      createCommentNode(data) {
        return {
          nodeName: "#comment",
          data,
          parentNode: null
        };
      },
      createTextNode(value) {
        return {
          nodeName: "#text",
          value,
          parentNode: null
        };
      },
      //Tree mutation
      appendChild(parentNode, newNode) {
        parentNode.childNodes.push(newNode);
        newNode.parentNode = parentNode;
      },
      insertBefore(parentNode, newNode, referenceNode) {
        const insertionIdx = parentNode.childNodes.indexOf(referenceNode);
        parentNode.childNodes.splice(insertionIdx, 0, newNode);
        newNode.parentNode = parentNode;
      },
      setTemplateContent(templateElement, contentElement) {
        templateElement.content = contentElement;
      },
      getTemplateContent(templateElement) {
        return templateElement.content;
      },
      setDocumentType(document, name, publicId, systemId) {
        const doctypeNode = document.childNodes.find((node) => node.nodeName === "#documentType");
        if (doctypeNode) {
          doctypeNode.name = name;
          doctypeNode.publicId = publicId;
          doctypeNode.systemId = systemId;
        } else {
          const node = {
            nodeName: "#documentType",
            name,
            publicId,
            systemId,
            parentNode: null
          };
          defaultTreeAdapter.appendChild(document, node);
        }
      },
      setDocumentMode(document, mode) {
        document.mode = mode;
      },
      getDocumentMode(document) {
        return document.mode;
      },
      detachNode(node) {
        if (node.parentNode) {
          const idx = node.parentNode.childNodes.indexOf(node);
          node.parentNode.childNodes.splice(idx, 1);
          node.parentNode = null;
        }
      },
      insertText(parentNode, text) {
        if (parentNode.childNodes.length > 0) {
          const prevNode = parentNode.childNodes[parentNode.childNodes.length - 1];
          if (defaultTreeAdapter.isTextNode(prevNode)) {
            prevNode.value += text;
            return;
          }
        }
        defaultTreeAdapter.appendChild(parentNode, defaultTreeAdapter.createTextNode(text));
      },
      insertTextBefore(parentNode, text, referenceNode) {
        const prevNode = parentNode.childNodes[parentNode.childNodes.indexOf(referenceNode) - 1];
        if (prevNode && defaultTreeAdapter.isTextNode(prevNode)) {
          prevNode.value += text;
        } else {
          defaultTreeAdapter.insertBefore(parentNode, defaultTreeAdapter.createTextNode(text), referenceNode);
        }
      },
      adoptAttributes(recipient, attrs) {
        const recipientAttrsMap = new Set(recipient.attrs.map((attr) => attr.name));
        for (let j = 0; j < attrs.length; j++) {
          if (!recipientAttrsMap.has(attrs[j].name)) {
            recipient.attrs.push(attrs[j]);
          }
        }
      },
      //Tree traversing
      getFirstChild(node) {
        return node.childNodes[0];
      },
      getChildNodes(node) {
        return node.childNodes;
      },
      getParentNode(node) {
        return node.parentNode;
      },
      getAttrList(element) {
        return element.attrs;
      },
      //Node data
      getTagName(element) {
        return element.tagName;
      },
      getNamespaceURI(element) {
        return element.namespaceURI;
      },
      getTextNodeContent(textNode) {
        return textNode.value;
      },
      getCommentNodeContent(commentNode) {
        return commentNode.data;
      },
      getDocumentTypeNodeName(doctypeNode) {
        return doctypeNode.name;
      },
      getDocumentTypeNodePublicId(doctypeNode) {
        return doctypeNode.publicId;
      },
      getDocumentTypeNodeSystemId(doctypeNode) {
        return doctypeNode.systemId;
      },
      //Node types
      isTextNode(node) {
        return node.nodeName === "#text";
      },
      isCommentNode(node) {
        return node.nodeName === "#comment";
      },
      isDocumentTypeNode(node) {
        return node.nodeName === "#documentType";
      },
      isElementNode(node) {
        return Object.prototype.hasOwnProperty.call(node, "tagName");
      },
      // Source code location
      setNodeSourceCodeLocation(node, location) {
        node.sourceCodeLocation = location;
      },
      getNodeSourceCodeLocation(node) {
        return node.sourceCodeLocation;
      },
      updateNodeSourceCodeLocation(node, endLocation) {
        node.sourceCodeLocation = { ...node.sourceCodeLocation, ...endLocation };
      }
    };
  }
});

// node_modules/parse5/dist/common/doctype.js
function hasPrefix(publicId, prefixes) {
  return prefixes.some((prefix) => publicId.startsWith(prefix));
}
function isConforming(token) {
  return token.name === VALID_DOCTYPE_NAME && token.publicId === null && (token.systemId === null || token.systemId === VALID_SYSTEM_ID);
}
function getDocumentMode(token) {
  if (token.name !== VALID_DOCTYPE_NAME) {
    return DOCUMENT_MODE.QUIRKS;
  }
  const { systemId } = token;
  if (systemId && systemId.toLowerCase() === QUIRKS_MODE_SYSTEM_ID) {
    return DOCUMENT_MODE.QUIRKS;
  }
  let { publicId } = token;
  if (publicId !== null) {
    publicId = publicId.toLowerCase();
    if (QUIRKS_MODE_PUBLIC_IDS.has(publicId)) {
      return DOCUMENT_MODE.QUIRKS;
    }
    let prefixes = systemId === null ? QUIRKS_MODE_NO_SYSTEM_ID_PUBLIC_ID_PREFIXES : QUIRKS_MODE_PUBLIC_ID_PREFIXES;
    if (hasPrefix(publicId, prefixes)) {
      return DOCUMENT_MODE.QUIRKS;
    }
    prefixes = systemId === null ? LIMITED_QUIRKS_PUBLIC_ID_PREFIXES : LIMITED_QUIRKS_WITH_SYSTEM_ID_PUBLIC_ID_PREFIXES;
    if (hasPrefix(publicId, prefixes)) {
      return DOCUMENT_MODE.LIMITED_QUIRKS;
    }
  }
  return DOCUMENT_MODE.NO_QUIRKS;
}
var VALID_DOCTYPE_NAME, VALID_SYSTEM_ID, QUIRKS_MODE_SYSTEM_ID, QUIRKS_MODE_PUBLIC_ID_PREFIXES, QUIRKS_MODE_NO_SYSTEM_ID_PUBLIC_ID_PREFIXES, QUIRKS_MODE_PUBLIC_IDS, LIMITED_QUIRKS_PUBLIC_ID_PREFIXES, LIMITED_QUIRKS_WITH_SYSTEM_ID_PUBLIC_ID_PREFIXES;
var init_doctype = __esm({
  "node_modules/parse5/dist/common/doctype.js"() {
    init_html();
    VALID_DOCTYPE_NAME = "html";
    VALID_SYSTEM_ID = "about:legacy-compat";
    QUIRKS_MODE_SYSTEM_ID = "http://www.ibm.com/data/dtd/v11/ibmxhtml1-transitional.dtd";
    QUIRKS_MODE_PUBLIC_ID_PREFIXES = [
      "+//silmaril//dtd html pro v0r11 19970101//",
      "-//as//dtd html 3.0 aswedit + extensions//",
      "-//advasoft ltd//dtd html 3.0 aswedit + extensions//",
      "-//ietf//dtd html 2.0 level 1//",
      "-//ietf//dtd html 2.0 level 2//",
      "-//ietf//dtd html 2.0 strict level 1//",
      "-//ietf//dtd html 2.0 strict level 2//",
      "-//ietf//dtd html 2.0 strict//",
      "-//ietf//dtd html 2.0//",
      "-//ietf//dtd html 2.1e//",
      "-//ietf//dtd html 3.0//",
      "-//ietf//dtd html 3.2 final//",
      "-//ietf//dtd html 3.2//",
      "-//ietf//dtd html 3//",
      "-//ietf//dtd html level 0//",
      "-//ietf//dtd html level 1//",
      "-//ietf//dtd html level 2//",
      "-//ietf//dtd html level 3//",
      "-//ietf//dtd html strict level 0//",
      "-//ietf//dtd html strict level 1//",
      "-//ietf//dtd html strict level 2//",
      "-//ietf//dtd html strict level 3//",
      "-//ietf//dtd html strict//",
      "-//ietf//dtd html//",
      "-//metrius//dtd metrius presentational//",
      "-//microsoft//dtd internet explorer 2.0 html strict//",
      "-//microsoft//dtd internet explorer 2.0 html//",
      "-//microsoft//dtd internet explorer 2.0 tables//",
      "-//microsoft//dtd internet explorer 3.0 html strict//",
      "-//microsoft//dtd internet explorer 3.0 html//",
      "-//microsoft//dtd internet explorer 3.0 tables//",
      "-//netscape comm. corp.//dtd html//",
      "-//netscape comm. corp.//dtd strict html//",
      "-//o'reilly and associates//dtd html 2.0//",
      "-//o'reilly and associates//dtd html extended 1.0//",
      "-//o'reilly and associates//dtd html extended relaxed 1.0//",
      "-//sq//dtd html 2.0 hotmetal + extensions//",
      "-//softquad software//dtd hotmetal pro 6.0::19990601::extensions to html 4.0//",
      "-//softquad//dtd hotmetal pro 4.0::19971010::extensions to html 4.0//",
      "-//spyglass//dtd html 2.0 extended//",
      "-//sun microsystems corp.//dtd hotjava html//",
      "-//sun microsystems corp.//dtd hotjava strict html//",
      "-//w3c//dtd html 3 1995-03-24//",
      "-//w3c//dtd html 3.2 draft//",
      "-//w3c//dtd html 3.2 final//",
      "-//w3c//dtd html 3.2//",
      "-//w3c//dtd html 3.2s draft//",
      "-//w3c//dtd html 4.0 frameset//",
      "-//w3c//dtd html 4.0 transitional//",
      "-//w3c//dtd html experimental 19960712//",
      "-//w3c//dtd html experimental 970421//",
      "-//w3c//dtd w3 html//",
      "-//w3o//dtd w3 html 3.0//",
      "-//webtechs//dtd mozilla html 2.0//",
      "-//webtechs//dtd mozilla html//"
    ];
    QUIRKS_MODE_NO_SYSTEM_ID_PUBLIC_ID_PREFIXES = [
      ...QUIRKS_MODE_PUBLIC_ID_PREFIXES,
      "-//w3c//dtd html 4.01 frameset//",
      "-//w3c//dtd html 4.01 transitional//"
    ];
    QUIRKS_MODE_PUBLIC_IDS = /* @__PURE__ */ new Set([
      "-//w3o//dtd w3 html strict 3.0//en//",
      "-/w3c/dtd html 4.0 transitional/en",
      "html"
    ]);
    LIMITED_QUIRKS_PUBLIC_ID_PREFIXES = ["-//w3c//dtd xhtml 1.0 frameset//", "-//w3c//dtd xhtml 1.0 transitional//"];
    LIMITED_QUIRKS_WITH_SYSTEM_ID_PUBLIC_ID_PREFIXES = [
      ...LIMITED_QUIRKS_PUBLIC_ID_PREFIXES,
      "-//w3c//dtd html 4.01 frameset//",
      "-//w3c//dtd html 4.01 transitional//"
    ];
  }
});

// node_modules/parse5/dist/common/foreign-content.js
function causesExit(startTagToken) {
  const tn = startTagToken.tagID;
  const isFontWithAttrs = tn === TAG_ID.FONT && startTagToken.attrs.some(({ name }) => name === ATTRS.COLOR || name === ATTRS.SIZE || name === ATTRS.FACE);
  return isFontWithAttrs || EXITS_FOREIGN_CONTENT.has(tn);
}
function adjustTokenMathMLAttrs(token) {
  for (let i = 0; i < token.attrs.length; i++) {
    if (token.attrs[i].name === DEFINITION_URL_ATTR) {
      token.attrs[i].name = ADJUSTED_DEFINITION_URL_ATTR;
      break;
    }
  }
}
function adjustTokenSVGAttrs(token) {
  for (let i = 0; i < token.attrs.length; i++) {
    const adjustedAttrName = SVG_ATTRS_ADJUSTMENT_MAP.get(token.attrs[i].name);
    if (adjustedAttrName != null) {
      token.attrs[i].name = adjustedAttrName;
    }
  }
}
function adjustTokenXMLAttrs(token) {
  for (let i = 0; i < token.attrs.length; i++) {
    const adjustedAttrEntry = XML_ATTRS_ADJUSTMENT_MAP.get(token.attrs[i].name);
    if (adjustedAttrEntry) {
      token.attrs[i].prefix = adjustedAttrEntry.prefix;
      token.attrs[i].name = adjustedAttrEntry.name;
      token.attrs[i].namespace = adjustedAttrEntry.namespace;
    }
  }
}
function adjustTokenSVGTagName(token) {
  const adjustedTagName = SVG_TAG_NAMES_ADJUSTMENT_MAP.get(token.tagName);
  if (adjustedTagName != null) {
    token.tagName = adjustedTagName;
    token.tagID = getTagID(token.tagName);
  }
}
function isMathMLTextIntegrationPoint(tn, ns) {
  return ns === NS.MATHML && (tn === TAG_ID.MI || tn === TAG_ID.MO || tn === TAG_ID.MN || tn === TAG_ID.MS || tn === TAG_ID.MTEXT);
}
function isHtmlIntegrationPoint(tn, ns, attrs) {
  if (ns === NS.MATHML && tn === TAG_ID.ANNOTATION_XML) {
    for (let i = 0; i < attrs.length; i++) {
      if (attrs[i].name === ATTRS.ENCODING) {
        const value = attrs[i].value.toLowerCase();
        return value === MIME_TYPES.TEXT_HTML || value === MIME_TYPES.APPLICATION_XML;
      }
    }
  }
  return ns === NS.SVG && (tn === TAG_ID.FOREIGN_OBJECT || tn === TAG_ID.DESC || tn === TAG_ID.TITLE);
}
function isIntegrationPoint(tn, ns, attrs, foreignNS) {
  return (!foreignNS || foreignNS === NS.HTML) && isHtmlIntegrationPoint(tn, ns, attrs) || (!foreignNS || foreignNS === NS.MATHML) && isMathMLTextIntegrationPoint(tn, ns);
}
var MIME_TYPES, DEFINITION_URL_ATTR, ADJUSTED_DEFINITION_URL_ATTR, SVG_ATTRS_ADJUSTMENT_MAP, XML_ATTRS_ADJUSTMENT_MAP, SVG_TAG_NAMES_ADJUSTMENT_MAP, EXITS_FOREIGN_CONTENT;
var init_foreign_content = __esm({
  "node_modules/parse5/dist/common/foreign-content.js"() {
    init_html();
    MIME_TYPES = {
      TEXT_HTML: "text/html",
      APPLICATION_XML: "application/xhtml+xml"
    };
    DEFINITION_URL_ATTR = "definitionurl";
    ADJUSTED_DEFINITION_URL_ATTR = "definitionURL";
    SVG_ATTRS_ADJUSTMENT_MAP = new Map([
      "attributeName",
      "attributeType",
      "baseFrequency",
      "baseProfile",
      "calcMode",
      "clipPathUnits",
      "diffuseConstant",
      "edgeMode",
      "filterUnits",
      "glyphRef",
      "gradientTransform",
      "gradientUnits",
      "kernelMatrix",
      "kernelUnitLength",
      "keyPoints",
      "keySplines",
      "keyTimes",
      "lengthAdjust",
      "limitingConeAngle",
      "markerHeight",
      "markerUnits",
      "markerWidth",
      "maskContentUnits",
      "maskUnits",
      "numOctaves",
      "pathLength",
      "patternContentUnits",
      "patternTransform",
      "patternUnits",
      "pointsAtX",
      "pointsAtY",
      "pointsAtZ",
      "preserveAlpha",
      "preserveAspectRatio",
      "primitiveUnits",
      "refX",
      "refY",
      "repeatCount",
      "repeatDur",
      "requiredExtensions",
      "requiredFeatures",
      "specularConstant",
      "specularExponent",
      "spreadMethod",
      "startOffset",
      "stdDeviation",
      "stitchTiles",
      "surfaceScale",
      "systemLanguage",
      "tableValues",
      "targetX",
      "targetY",
      "textLength",
      "viewBox",
      "viewTarget",
      "xChannelSelector",
      "yChannelSelector",
      "zoomAndPan"
    ].map((attr) => [attr.toLowerCase(), attr]));
    XML_ATTRS_ADJUSTMENT_MAP = /* @__PURE__ */ new Map([
      ["xlink:actuate", { prefix: "xlink", name: "actuate", namespace: NS.XLINK }],
      ["xlink:arcrole", { prefix: "xlink", name: "arcrole", namespace: NS.XLINK }],
      ["xlink:href", { prefix: "xlink", name: "href", namespace: NS.XLINK }],
      ["xlink:role", { prefix: "xlink", name: "role", namespace: NS.XLINK }],
      ["xlink:show", { prefix: "xlink", name: "show", namespace: NS.XLINK }],
      ["xlink:title", { prefix: "xlink", name: "title", namespace: NS.XLINK }],
      ["xlink:type", { prefix: "xlink", name: "type", namespace: NS.XLINK }],
      ["xml:lang", { prefix: "xml", name: "lang", namespace: NS.XML }],
      ["xml:space", { prefix: "xml", name: "space", namespace: NS.XML }],
      ["xmlns", { prefix: "", name: "xmlns", namespace: NS.XMLNS }],
      ["xmlns:xlink", { prefix: "xmlns", name: "xlink", namespace: NS.XMLNS }]
    ]);
    SVG_TAG_NAMES_ADJUSTMENT_MAP = new Map([
      "altGlyph",
      "altGlyphDef",
      "altGlyphItem",
      "animateColor",
      "animateMotion",
      "animateTransform",
      "clipPath",
      "feBlend",
      "feColorMatrix",
      "feComponentTransfer",
      "feComposite",
      "feConvolveMatrix",
      "feDiffuseLighting",
      "feDisplacementMap",
      "feDistantLight",
      "feFlood",
      "feFuncA",
      "feFuncB",
      "feFuncG",
      "feFuncR",
      "feGaussianBlur",
      "feImage",
      "feMerge",
      "feMergeNode",
      "feMorphology",
      "feOffset",
      "fePointLight",
      "feSpecularLighting",
      "feSpotLight",
      "feTile",
      "feTurbulence",
      "foreignObject",
      "glyphRef",
      "linearGradient",
      "radialGradient",
      "textPath"
    ].map((tn) => [tn.toLowerCase(), tn]));
    EXITS_FOREIGN_CONTENT = /* @__PURE__ */ new Set([
      TAG_ID.B,
      TAG_ID.BIG,
      TAG_ID.BLOCKQUOTE,
      TAG_ID.BODY,
      TAG_ID.BR,
      TAG_ID.CENTER,
      TAG_ID.CODE,
      TAG_ID.DD,
      TAG_ID.DIV,
      TAG_ID.DL,
      TAG_ID.DT,
      TAG_ID.EM,
      TAG_ID.EMBED,
      TAG_ID.H1,
      TAG_ID.H2,
      TAG_ID.H3,
      TAG_ID.H4,
      TAG_ID.H5,
      TAG_ID.H6,
      TAG_ID.HEAD,
      TAG_ID.HR,
      TAG_ID.I,
      TAG_ID.IMG,
      TAG_ID.LI,
      TAG_ID.LISTING,
      TAG_ID.MENU,
      TAG_ID.META,
      TAG_ID.NOBR,
      TAG_ID.OL,
      TAG_ID.P,
      TAG_ID.PRE,
      TAG_ID.RUBY,
      TAG_ID.S,
      TAG_ID.SMALL,
      TAG_ID.SPAN,
      TAG_ID.STRONG,
      TAG_ID.STRIKE,
      TAG_ID.SUB,
      TAG_ID.SUP,
      TAG_ID.TABLE,
      TAG_ID.TT,
      TAG_ID.U,
      TAG_ID.UL,
      TAG_ID.VAR
    ]);
  }
});

// node_modules/parse5/dist/parser/index.js
function aaObtainFormattingElementEntry(p, token) {
  let formattingElementEntry = p.activeFormattingElements.getElementEntryInScopeWithTagName(token.tagName);
  if (formattingElementEntry) {
    if (!p.openElements.contains(formattingElementEntry.element)) {
      p.activeFormattingElements.removeEntry(formattingElementEntry);
      formattingElementEntry = null;
    } else if (!p.openElements.hasInScope(token.tagID)) {
      formattingElementEntry = null;
    }
  } else {
    genericEndTagInBody(p, token);
  }
  return formattingElementEntry;
}
function aaObtainFurthestBlock(p, formattingElementEntry) {
  let furthestBlock = null;
  let idx = p.openElements.stackTop;
  for (; idx >= 0; idx--) {
    const element = p.openElements.items[idx];
    if (element === formattingElementEntry.element) {
      break;
    }
    if (p._isSpecialElement(element, p.openElements.tagIDs[idx])) {
      furthestBlock = element;
    }
  }
  if (!furthestBlock) {
    p.openElements.shortenToLength(Math.max(idx, 0));
    p.activeFormattingElements.removeEntry(formattingElementEntry);
  }
  return furthestBlock;
}
function aaInnerLoop(p, furthestBlock, formattingElement) {
  let lastElement = furthestBlock;
  let nextElement = p.openElements.getCommonAncestor(furthestBlock);
  for (let i = 0, element = nextElement; element !== formattingElement; i++, element = nextElement) {
    nextElement = p.openElements.getCommonAncestor(element);
    const elementEntry = p.activeFormattingElements.getElementEntry(element);
    const counterOverflow = elementEntry && i >= AA_INNER_LOOP_ITER;
    const shouldRemoveFromOpenElements = !elementEntry || counterOverflow;
    if (shouldRemoveFromOpenElements) {
      if (counterOverflow) {
        p.activeFormattingElements.removeEntry(elementEntry);
      }
      p.openElements.remove(element);
    } else {
      element = aaRecreateElementFromEntry(p, elementEntry);
      if (lastElement === furthestBlock) {
        p.activeFormattingElements.bookmark = elementEntry;
      }
      p.treeAdapter.detachNode(lastElement);
      p.treeAdapter.appendChild(element, lastElement);
      lastElement = element;
    }
  }
  return lastElement;
}
function aaRecreateElementFromEntry(p, elementEntry) {
  const ns = p.treeAdapter.getNamespaceURI(elementEntry.element);
  const newElement = p.treeAdapter.createElement(elementEntry.token.tagName, ns, elementEntry.token.attrs);
  p.openElements.replace(elementEntry.element, newElement);
  elementEntry.element = newElement;
  return newElement;
}
function aaInsertLastNodeInCommonAncestor(p, commonAncestor, lastElement) {
  const tn = p.treeAdapter.getTagName(commonAncestor);
  const tid = getTagID(tn);
  if (p._isElementCausesFosterParenting(tid)) {
    p._fosterParentElement(lastElement);
  } else {
    const ns = p.treeAdapter.getNamespaceURI(commonAncestor);
    if (tid === TAG_ID.TEMPLATE && ns === NS.HTML) {
      commonAncestor = p.treeAdapter.getTemplateContent(commonAncestor);
    }
    p.treeAdapter.appendChild(commonAncestor, lastElement);
  }
}
function aaReplaceFormattingElement(p, furthestBlock, formattingElementEntry) {
  const ns = p.treeAdapter.getNamespaceURI(formattingElementEntry.element);
  const { token } = formattingElementEntry;
  const newElement = p.treeAdapter.createElement(token.tagName, ns, token.attrs);
  p._adoptNodes(furthestBlock, newElement);
  p.treeAdapter.appendChild(furthestBlock, newElement);
  p.activeFormattingElements.insertElementAfterBookmark(newElement, token);
  p.activeFormattingElements.removeEntry(formattingElementEntry);
  p.openElements.remove(formattingElementEntry.element);
  p.openElements.insertAfter(furthestBlock, newElement, token.tagID);
}
function callAdoptionAgency(p, token) {
  for (let i = 0; i < AA_OUTER_LOOP_ITER; i++) {
    const formattingElementEntry = aaObtainFormattingElementEntry(p, token);
    if (!formattingElementEntry) {
      break;
    }
    const furthestBlock = aaObtainFurthestBlock(p, formattingElementEntry);
    if (!furthestBlock) {
      break;
    }
    p.activeFormattingElements.bookmark = formattingElementEntry;
    const lastElement = aaInnerLoop(p, furthestBlock, formattingElementEntry.element);
    const commonAncestor = p.openElements.getCommonAncestor(formattingElementEntry.element);
    p.treeAdapter.detachNode(lastElement);
    if (commonAncestor)
      aaInsertLastNodeInCommonAncestor(p, commonAncestor, lastElement);
    aaReplaceFormattingElement(p, furthestBlock, formattingElementEntry);
  }
}
function appendComment(p, token) {
  p._appendCommentNode(token, p.openElements.currentTmplContentOrNode);
}
function appendCommentToRootHtmlElement(p, token) {
  p._appendCommentNode(token, p.openElements.items[0]);
}
function appendCommentToDocument(p, token) {
  p._appendCommentNode(token, p.document);
}
function stopParsing(p, token) {
  p.stopped = true;
  if (token.location) {
    const target = p.fragmentContext ? 0 : 2;
    for (let i = p.openElements.stackTop; i >= target; i--) {
      p._setEndLocation(p.openElements.items[i], token);
    }
    if (!p.fragmentContext && p.openElements.stackTop >= 0) {
      const htmlElement = p.openElements.items[0];
      const htmlLocation = p.treeAdapter.getNodeSourceCodeLocation(htmlElement);
      if (htmlLocation && !htmlLocation.endTag) {
        p._setEndLocation(htmlElement, token);
        if (p.openElements.stackTop >= 1) {
          const bodyElement = p.openElements.items[1];
          const bodyLocation = p.treeAdapter.getNodeSourceCodeLocation(bodyElement);
          if (bodyLocation && !bodyLocation.endTag) {
            p._setEndLocation(bodyElement, token);
          }
        }
      }
    }
  }
}
function doctypeInInitialMode(p, token) {
  p._setDocumentType(token);
  const mode = token.forceQuirks ? DOCUMENT_MODE.QUIRKS : getDocumentMode(token);
  if (!isConforming(token)) {
    p._err(token, ERR.nonConformingDoctype);
  }
  p.treeAdapter.setDocumentMode(p.document, mode);
  p.insertionMode = InsertionMode.BEFORE_HTML;
}
function tokenInInitialMode(p, token) {
  p._err(token, ERR.missingDoctype, true);
  p.treeAdapter.setDocumentMode(p.document, DOCUMENT_MODE.QUIRKS);
  p.insertionMode = InsertionMode.BEFORE_HTML;
  p._processToken(token);
}
function startTagBeforeHtml(p, token) {
  if (token.tagID === TAG_ID.HTML) {
    p._insertElement(token, NS.HTML);
    p.insertionMode = InsertionMode.BEFORE_HEAD;
  } else {
    tokenBeforeHtml(p, token);
  }
}
function endTagBeforeHtml(p, token) {
  const tn = token.tagID;
  if (tn === TAG_ID.HTML || tn === TAG_ID.HEAD || tn === TAG_ID.BODY || tn === TAG_ID.BR) {
    tokenBeforeHtml(p, token);
  }
}
function tokenBeforeHtml(p, token) {
  p._insertFakeRootElement();
  p.insertionMode = InsertionMode.BEFORE_HEAD;
  p._processToken(token);
}
function startTagBeforeHead(p, token) {
  switch (token.tagID) {
    case TAG_ID.HTML: {
      startTagInBody(p, token);
      break;
    }
    case TAG_ID.HEAD: {
      p._insertElement(token, NS.HTML);
      p.headElement = p.openElements.current;
      p.insertionMode = InsertionMode.IN_HEAD;
      break;
    }
    default: {
      tokenBeforeHead(p, token);
    }
  }
}
function endTagBeforeHead(p, token) {
  const tn = token.tagID;
  if (tn === TAG_ID.HEAD || tn === TAG_ID.BODY || tn === TAG_ID.HTML || tn === TAG_ID.BR) {
    tokenBeforeHead(p, token);
  } else {
    p._err(token, ERR.endTagWithoutMatchingOpenElement);
  }
}
function tokenBeforeHead(p, token) {
  p._insertFakeElement(TAG_NAMES.HEAD, TAG_ID.HEAD);
  p.headElement = p.openElements.current;
  p.insertionMode = InsertionMode.IN_HEAD;
  p._processToken(token);
}
function startTagInHead(p, token) {
  switch (token.tagID) {
    case TAG_ID.HTML: {
      startTagInBody(p, token);
      break;
    }
    case TAG_ID.BASE:
    case TAG_ID.BASEFONT:
    case TAG_ID.BGSOUND:
    case TAG_ID.LINK:
    case TAG_ID.META: {
      p._appendElement(token, NS.HTML);
      token.ackSelfClosing = true;
      break;
    }
    case TAG_ID.TITLE: {
      p._switchToTextParsing(token, TokenizerMode.RCDATA);
      break;
    }
    case TAG_ID.NOSCRIPT: {
      if (p.options.scriptingEnabled) {
        p._switchToTextParsing(token, TokenizerMode.RAWTEXT);
      } else {
        p._insertElement(token, NS.HTML);
        p.insertionMode = InsertionMode.IN_HEAD_NO_SCRIPT;
      }
      break;
    }
    case TAG_ID.NOFRAMES:
    case TAG_ID.STYLE: {
      p._switchToTextParsing(token, TokenizerMode.RAWTEXT);
      break;
    }
    case TAG_ID.SCRIPT: {
      p._switchToTextParsing(token, TokenizerMode.SCRIPT_DATA);
      break;
    }
    case TAG_ID.TEMPLATE: {
      p._insertTemplate(token);
      p.activeFormattingElements.insertMarker();
      p.framesetOk = false;
      p.insertionMode = InsertionMode.IN_TEMPLATE;
      p.tmplInsertionModeStack.unshift(InsertionMode.IN_TEMPLATE);
      break;
    }
    case TAG_ID.HEAD: {
      p._err(token, ERR.misplacedStartTagForHeadElement);
      break;
    }
    default: {
      tokenInHead(p, token);
    }
  }
}
function endTagInHead(p, token) {
  switch (token.tagID) {
    case TAG_ID.HEAD: {
      p.openElements.pop();
      p.insertionMode = InsertionMode.AFTER_HEAD;
      break;
    }
    case TAG_ID.BODY:
    case TAG_ID.BR:
    case TAG_ID.HTML: {
      tokenInHead(p, token);
      break;
    }
    case TAG_ID.TEMPLATE: {
      templateEndTagInHead(p, token);
      break;
    }
    default: {
      p._err(token, ERR.endTagWithoutMatchingOpenElement);
    }
  }
}
function templateEndTagInHead(p, token) {
  if (p.openElements.tmplCount > 0) {
    p.openElements.generateImpliedEndTagsThoroughly();
    if (p.openElements.currentTagId !== TAG_ID.TEMPLATE) {
      p._err(token, ERR.closingOfElementWithOpenChildElements);
    }
    p.openElements.popUntilTagNamePopped(TAG_ID.TEMPLATE);
    p.activeFormattingElements.clearToLastMarker();
    p.tmplInsertionModeStack.shift();
    p._resetInsertionMode();
  } else {
    p._err(token, ERR.endTagWithoutMatchingOpenElement);
  }
}
function tokenInHead(p, token) {
  p.openElements.pop();
  p.insertionMode = InsertionMode.AFTER_HEAD;
  p._processToken(token);
}
function startTagInHeadNoScript(p, token) {
  switch (token.tagID) {
    case TAG_ID.HTML: {
      startTagInBody(p, token);
      break;
    }
    case TAG_ID.BASEFONT:
    case TAG_ID.BGSOUND:
    case TAG_ID.HEAD:
    case TAG_ID.LINK:
    case TAG_ID.META:
    case TAG_ID.NOFRAMES:
    case TAG_ID.STYLE: {
      startTagInHead(p, token);
      break;
    }
    case TAG_ID.NOSCRIPT: {
      p._err(token, ERR.nestedNoscriptInHead);
      break;
    }
    default: {
      tokenInHeadNoScript(p, token);
    }
  }
}
function endTagInHeadNoScript(p, token) {
  switch (token.tagID) {
    case TAG_ID.NOSCRIPT: {
      p.openElements.pop();
      p.insertionMode = InsertionMode.IN_HEAD;
      break;
    }
    case TAG_ID.BR: {
      tokenInHeadNoScript(p, token);
      break;
    }
    default: {
      p._err(token, ERR.endTagWithoutMatchingOpenElement);
    }
  }
}
function tokenInHeadNoScript(p, token) {
  const errCode = token.type === TokenType.EOF ? ERR.openElementsLeftAfterEof : ERR.disallowedContentInNoscriptInHead;
  p._err(token, errCode);
  p.openElements.pop();
  p.insertionMode = InsertionMode.IN_HEAD;
  p._processToken(token);
}
function startTagAfterHead(p, token) {
  switch (token.tagID) {
    case TAG_ID.HTML: {
      startTagInBody(p, token);
      break;
    }
    case TAG_ID.BODY: {
      p._insertElement(token, NS.HTML);
      p.framesetOk = false;
      p.insertionMode = InsertionMode.IN_BODY;
      break;
    }
    case TAG_ID.FRAMESET: {
      p._insertElement(token, NS.HTML);
      p.insertionMode = InsertionMode.IN_FRAMESET;
      break;
    }
    case TAG_ID.BASE:
    case TAG_ID.BASEFONT:
    case TAG_ID.BGSOUND:
    case TAG_ID.LINK:
    case TAG_ID.META:
    case TAG_ID.NOFRAMES:
    case TAG_ID.SCRIPT:
    case TAG_ID.STYLE:
    case TAG_ID.TEMPLATE:
    case TAG_ID.TITLE: {
      p._err(token, ERR.abandonedHeadElementChild);
      p.openElements.push(p.headElement, TAG_ID.HEAD);
      startTagInHead(p, token);
      p.openElements.remove(p.headElement);
      break;
    }
    case TAG_ID.HEAD: {
      p._err(token, ERR.misplacedStartTagForHeadElement);
      break;
    }
    default: {
      tokenAfterHead(p, token);
    }
  }
}
function endTagAfterHead(p, token) {
  switch (token.tagID) {
    case TAG_ID.BODY:
    case TAG_ID.HTML:
    case TAG_ID.BR: {
      tokenAfterHead(p, token);
      break;
    }
    case TAG_ID.TEMPLATE: {
      templateEndTagInHead(p, token);
      break;
    }
    default: {
      p._err(token, ERR.endTagWithoutMatchingOpenElement);
    }
  }
}
function tokenAfterHead(p, token) {
  p._insertFakeElement(TAG_NAMES.BODY, TAG_ID.BODY);
  p.insertionMode = InsertionMode.IN_BODY;
  modeInBody(p, token);
}
function modeInBody(p, token) {
  switch (token.type) {
    case TokenType.CHARACTER: {
      characterInBody(p, token);
      break;
    }
    case TokenType.WHITESPACE_CHARACTER: {
      whitespaceCharacterInBody(p, token);
      break;
    }
    case TokenType.COMMENT: {
      appendComment(p, token);
      break;
    }
    case TokenType.START_TAG: {
      startTagInBody(p, token);
      break;
    }
    case TokenType.END_TAG: {
      endTagInBody(p, token);
      break;
    }
    case TokenType.EOF: {
      eofInBody(p, token);
      break;
    }
    default:
  }
}
function whitespaceCharacterInBody(p, token) {
  p._reconstructActiveFormattingElements();
  p._insertCharacters(token);
}
function characterInBody(p, token) {
  p._reconstructActiveFormattingElements();
  p._insertCharacters(token);
  p.framesetOk = false;
}
function htmlStartTagInBody(p, token) {
  if (p.openElements.tmplCount === 0) {
    p.treeAdapter.adoptAttributes(p.openElements.items[0], token.attrs);
  }
}
function bodyStartTagInBody(p, token) {
  const bodyElement = p.openElements.tryPeekProperlyNestedBodyElement();
  if (bodyElement && p.openElements.tmplCount === 0) {
    p.framesetOk = false;
    p.treeAdapter.adoptAttributes(bodyElement, token.attrs);
  }
}
function framesetStartTagInBody(p, token) {
  const bodyElement = p.openElements.tryPeekProperlyNestedBodyElement();
  if (p.framesetOk && bodyElement) {
    p.treeAdapter.detachNode(bodyElement);
    p.openElements.popAllUpToHtmlElement();
    p._insertElement(token, NS.HTML);
    p.insertionMode = InsertionMode.IN_FRAMESET;
  }
}
function addressStartTagInBody(p, token) {
  if (p.openElements.hasInButtonScope(TAG_ID.P)) {
    p._closePElement();
  }
  p._insertElement(token, NS.HTML);
}
function numberedHeaderStartTagInBody(p, token) {
  if (p.openElements.hasInButtonScope(TAG_ID.P)) {
    p._closePElement();
  }
  if (p.openElements.currentTagId !== void 0 && NUMBERED_HEADERS.has(p.openElements.currentTagId)) {
    p.openElements.pop();
  }
  p._insertElement(token, NS.HTML);
}
function preStartTagInBody(p, token) {
  if (p.openElements.hasInButtonScope(TAG_ID.P)) {
    p._closePElement();
  }
  p._insertElement(token, NS.HTML);
  p.skipNextNewLine = true;
  p.framesetOk = false;
}
function formStartTagInBody(p, token) {
  const inTemplate = p.openElements.tmplCount > 0;
  if (!p.formElement || inTemplate) {
    if (p.openElements.hasInButtonScope(TAG_ID.P)) {
      p._closePElement();
    }
    p._insertElement(token, NS.HTML);
    if (!inTemplate) {
      p.formElement = p.openElements.current;
    }
  }
}
function listItemStartTagInBody(p, token) {
  p.framesetOk = false;
  const tn = token.tagID;
  for (let i = p.openElements.stackTop; i >= 0; i--) {
    const elementId = p.openElements.tagIDs[i];
    if (tn === TAG_ID.LI && elementId === TAG_ID.LI || (tn === TAG_ID.DD || tn === TAG_ID.DT) && (elementId === TAG_ID.DD || elementId === TAG_ID.DT)) {
      p.openElements.generateImpliedEndTagsWithExclusion(elementId);
      p.openElements.popUntilTagNamePopped(elementId);
      break;
    }
    if (elementId !== TAG_ID.ADDRESS && elementId !== TAG_ID.DIV && elementId !== TAG_ID.P && p._isSpecialElement(p.openElements.items[i], elementId)) {
      break;
    }
  }
  if (p.openElements.hasInButtonScope(TAG_ID.P)) {
    p._closePElement();
  }
  p._insertElement(token, NS.HTML);
}
function plaintextStartTagInBody(p, token) {
  if (p.openElements.hasInButtonScope(TAG_ID.P)) {
    p._closePElement();
  }
  p._insertElement(token, NS.HTML);
  p.tokenizer.state = TokenizerMode.PLAINTEXT;
}
function buttonStartTagInBody(p, token) {
  if (p.openElements.hasInScope(TAG_ID.BUTTON)) {
    p.openElements.generateImpliedEndTags();
    p.openElements.popUntilTagNamePopped(TAG_ID.BUTTON);
  }
  p._reconstructActiveFormattingElements();
  p._insertElement(token, NS.HTML);
  p.framesetOk = false;
}
function aStartTagInBody(p, token) {
  const activeElementEntry = p.activeFormattingElements.getElementEntryInScopeWithTagName(TAG_NAMES.A);
  if (activeElementEntry) {
    callAdoptionAgency(p, token);
    p.openElements.remove(activeElementEntry.element);
    p.activeFormattingElements.removeEntry(activeElementEntry);
  }
  p._reconstructActiveFormattingElements();
  p._insertElement(token, NS.HTML);
  p.activeFormattingElements.pushElement(p.openElements.current, token);
}
function bStartTagInBody(p, token) {
  p._reconstructActiveFormattingElements();
  p._insertElement(token, NS.HTML);
  p.activeFormattingElements.pushElement(p.openElements.current, token);
}
function nobrStartTagInBody(p, token) {
  p._reconstructActiveFormattingElements();
  if (p.openElements.hasInScope(TAG_ID.NOBR)) {
    callAdoptionAgency(p, token);
    p._reconstructActiveFormattingElements();
  }
  p._insertElement(token, NS.HTML);
  p.activeFormattingElements.pushElement(p.openElements.current, token);
}
function appletStartTagInBody(p, token) {
  p._reconstructActiveFormattingElements();
  p._insertElement(token, NS.HTML);
  p.activeFormattingElements.insertMarker();
  p.framesetOk = false;
}
function tableStartTagInBody(p, token) {
  if (p.treeAdapter.getDocumentMode(p.document) !== DOCUMENT_MODE.QUIRKS && p.openElements.hasInButtonScope(TAG_ID.P)) {
    p._closePElement();
  }
  p._insertElement(token, NS.HTML);
  p.framesetOk = false;
  p.insertionMode = InsertionMode.IN_TABLE;
}
function areaStartTagInBody(p, token) {
  p._reconstructActiveFormattingElements();
  p._appendElement(token, NS.HTML);
  p.framesetOk = false;
  token.ackSelfClosing = true;
}
function isHiddenInput(token) {
  const inputType = getTokenAttr(token, ATTRS.TYPE);
  return inputType != null && inputType.toLowerCase() === HIDDEN_INPUT_TYPE;
}
function inputStartTagInBody(p, token) {
  p._reconstructActiveFormattingElements();
  p._appendElement(token, NS.HTML);
  if (!isHiddenInput(token)) {
    p.framesetOk = false;
  }
  token.ackSelfClosing = true;
}
function paramStartTagInBody(p, token) {
  p._appendElement(token, NS.HTML);
  token.ackSelfClosing = true;
}
function hrStartTagInBody(p, token) {
  if (p.openElements.hasInButtonScope(TAG_ID.P)) {
    p._closePElement();
  }
  p._appendElement(token, NS.HTML);
  p.framesetOk = false;
  token.ackSelfClosing = true;
}
function imageStartTagInBody(p, token) {
  token.tagName = TAG_NAMES.IMG;
  token.tagID = TAG_ID.IMG;
  areaStartTagInBody(p, token);
}
function textareaStartTagInBody(p, token) {
  p._insertElement(token, NS.HTML);
  p.skipNextNewLine = true;
  p.tokenizer.state = TokenizerMode.RCDATA;
  p.originalInsertionMode = p.insertionMode;
  p.framesetOk = false;
  p.insertionMode = InsertionMode.TEXT;
}
function xmpStartTagInBody(p, token) {
  if (p.openElements.hasInButtonScope(TAG_ID.P)) {
    p._closePElement();
  }
  p._reconstructActiveFormattingElements();
  p.framesetOk = false;
  p._switchToTextParsing(token, TokenizerMode.RAWTEXT);
}
function iframeStartTagInBody(p, token) {
  p.framesetOk = false;
  p._switchToTextParsing(token, TokenizerMode.RAWTEXT);
}
function rawTextStartTagInBody(p, token) {
  p._switchToTextParsing(token, TokenizerMode.RAWTEXT);
}
function selectStartTagInBody(p, token) {
  p._reconstructActiveFormattingElements();
  p._insertElement(token, NS.HTML);
  p.framesetOk = false;
  p.insertionMode = p.insertionMode === InsertionMode.IN_TABLE || p.insertionMode === InsertionMode.IN_CAPTION || p.insertionMode === InsertionMode.IN_TABLE_BODY || p.insertionMode === InsertionMode.IN_ROW || p.insertionMode === InsertionMode.IN_CELL ? InsertionMode.IN_SELECT_IN_TABLE : InsertionMode.IN_SELECT;
}
function optgroupStartTagInBody(p, token) {
  if (p.openElements.currentTagId === TAG_ID.OPTION) {
    p.openElements.pop();
  }
  p._reconstructActiveFormattingElements();
  p._insertElement(token, NS.HTML);
}
function rbStartTagInBody(p, token) {
  if (p.openElements.hasInScope(TAG_ID.RUBY)) {
    p.openElements.generateImpliedEndTags();
  }
  p._insertElement(token, NS.HTML);
}
function rtStartTagInBody(p, token) {
  if (p.openElements.hasInScope(TAG_ID.RUBY)) {
    p.openElements.generateImpliedEndTagsWithExclusion(TAG_ID.RTC);
  }
  p._insertElement(token, NS.HTML);
}
function mathStartTagInBody(p, token) {
  p._reconstructActiveFormattingElements();
  adjustTokenMathMLAttrs(token);
  adjustTokenXMLAttrs(token);
  if (token.selfClosing) {
    p._appendElement(token, NS.MATHML);
  } else {
    p._insertElement(token, NS.MATHML);
  }
  token.ackSelfClosing = true;
}
function svgStartTagInBody(p, token) {
  p._reconstructActiveFormattingElements();
  adjustTokenSVGAttrs(token);
  adjustTokenXMLAttrs(token);
  if (token.selfClosing) {
    p._appendElement(token, NS.SVG);
  } else {
    p._insertElement(token, NS.SVG);
  }
  token.ackSelfClosing = true;
}
function genericStartTagInBody(p, token) {
  p._reconstructActiveFormattingElements();
  p._insertElement(token, NS.HTML);
}
function startTagInBody(p, token) {
  switch (token.tagID) {
    case TAG_ID.I:
    case TAG_ID.S:
    case TAG_ID.B:
    case TAG_ID.U:
    case TAG_ID.EM:
    case TAG_ID.TT:
    case TAG_ID.BIG:
    case TAG_ID.CODE:
    case TAG_ID.FONT:
    case TAG_ID.SMALL:
    case TAG_ID.STRIKE:
    case TAG_ID.STRONG: {
      bStartTagInBody(p, token);
      break;
    }
    case TAG_ID.A: {
      aStartTagInBody(p, token);
      break;
    }
    case TAG_ID.H1:
    case TAG_ID.H2:
    case TAG_ID.H3:
    case TAG_ID.H4:
    case TAG_ID.H5:
    case TAG_ID.H6: {
      numberedHeaderStartTagInBody(p, token);
      break;
    }
    case TAG_ID.P:
    case TAG_ID.DL:
    case TAG_ID.OL:
    case TAG_ID.UL:
    case TAG_ID.DIV:
    case TAG_ID.DIR:
    case TAG_ID.NAV:
    case TAG_ID.MAIN:
    case TAG_ID.MENU:
    case TAG_ID.ASIDE:
    case TAG_ID.CENTER:
    case TAG_ID.FIGURE:
    case TAG_ID.FOOTER:
    case TAG_ID.HEADER:
    case TAG_ID.HGROUP:
    case TAG_ID.DIALOG:
    case TAG_ID.DETAILS:
    case TAG_ID.ADDRESS:
    case TAG_ID.ARTICLE:
    case TAG_ID.SEARCH:
    case TAG_ID.SECTION:
    case TAG_ID.SUMMARY:
    case TAG_ID.FIELDSET:
    case TAG_ID.BLOCKQUOTE:
    case TAG_ID.FIGCAPTION: {
      addressStartTagInBody(p, token);
      break;
    }
    case TAG_ID.LI:
    case TAG_ID.DD:
    case TAG_ID.DT: {
      listItemStartTagInBody(p, token);
      break;
    }
    case TAG_ID.BR:
    case TAG_ID.IMG:
    case TAG_ID.WBR:
    case TAG_ID.AREA:
    case TAG_ID.EMBED:
    case TAG_ID.KEYGEN: {
      areaStartTagInBody(p, token);
      break;
    }
    case TAG_ID.HR: {
      hrStartTagInBody(p, token);
      break;
    }
    case TAG_ID.RB:
    case TAG_ID.RTC: {
      rbStartTagInBody(p, token);
      break;
    }
    case TAG_ID.RT:
    case TAG_ID.RP: {
      rtStartTagInBody(p, token);
      break;
    }
    case TAG_ID.PRE:
    case TAG_ID.LISTING: {
      preStartTagInBody(p, token);
      break;
    }
    case TAG_ID.XMP: {
      xmpStartTagInBody(p, token);
      break;
    }
    case TAG_ID.SVG: {
      svgStartTagInBody(p, token);
      break;
    }
    case TAG_ID.HTML: {
      htmlStartTagInBody(p, token);
      break;
    }
    case TAG_ID.BASE:
    case TAG_ID.LINK:
    case TAG_ID.META:
    case TAG_ID.STYLE:
    case TAG_ID.TITLE:
    case TAG_ID.SCRIPT:
    case TAG_ID.BGSOUND:
    case TAG_ID.BASEFONT:
    case TAG_ID.TEMPLATE: {
      startTagInHead(p, token);
      break;
    }
    case TAG_ID.BODY: {
      bodyStartTagInBody(p, token);
      break;
    }
    case TAG_ID.FORM: {
      formStartTagInBody(p, token);
      break;
    }
    case TAG_ID.NOBR: {
      nobrStartTagInBody(p, token);
      break;
    }
    case TAG_ID.MATH: {
      mathStartTagInBody(p, token);
      break;
    }
    case TAG_ID.TABLE: {
      tableStartTagInBody(p, token);
      break;
    }
    case TAG_ID.INPUT: {
      inputStartTagInBody(p, token);
      break;
    }
    case TAG_ID.PARAM:
    case TAG_ID.TRACK:
    case TAG_ID.SOURCE: {
      paramStartTagInBody(p, token);
      break;
    }
    case TAG_ID.IMAGE: {
      imageStartTagInBody(p, token);
      break;
    }
    case TAG_ID.BUTTON: {
      buttonStartTagInBody(p, token);
      break;
    }
    case TAG_ID.APPLET:
    case TAG_ID.OBJECT:
    case TAG_ID.MARQUEE: {
      appletStartTagInBody(p, token);
      break;
    }
    case TAG_ID.IFRAME: {
      iframeStartTagInBody(p, token);
      break;
    }
    case TAG_ID.SELECT: {
      selectStartTagInBody(p, token);
      break;
    }
    case TAG_ID.OPTION:
    case TAG_ID.OPTGROUP: {
      optgroupStartTagInBody(p, token);
      break;
    }
    case TAG_ID.NOEMBED:
    case TAG_ID.NOFRAMES: {
      rawTextStartTagInBody(p, token);
      break;
    }
    case TAG_ID.FRAMESET: {
      framesetStartTagInBody(p, token);
      break;
    }
    case TAG_ID.TEXTAREA: {
      textareaStartTagInBody(p, token);
      break;
    }
    case TAG_ID.NOSCRIPT: {
      if (p.options.scriptingEnabled) {
        rawTextStartTagInBody(p, token);
      } else {
        genericStartTagInBody(p, token);
      }
      break;
    }
    case TAG_ID.PLAINTEXT: {
      plaintextStartTagInBody(p, token);
      break;
    }
    case TAG_ID.COL:
    case TAG_ID.TH:
    case TAG_ID.TD:
    case TAG_ID.TR:
    case TAG_ID.HEAD:
    case TAG_ID.FRAME:
    case TAG_ID.TBODY:
    case TAG_ID.TFOOT:
    case TAG_ID.THEAD:
    case TAG_ID.CAPTION:
    case TAG_ID.COLGROUP: {
      break;
    }
    default: {
      genericStartTagInBody(p, token);
    }
  }
}
function bodyEndTagInBody(p, token) {
  if (p.openElements.hasInScope(TAG_ID.BODY)) {
    p.insertionMode = InsertionMode.AFTER_BODY;
    if (p.options.sourceCodeLocationInfo) {
      const bodyElement = p.openElements.tryPeekProperlyNestedBodyElement();
      if (bodyElement) {
        p._setEndLocation(bodyElement, token);
      }
    }
  }
}
function htmlEndTagInBody(p, token) {
  if (p.openElements.hasInScope(TAG_ID.BODY)) {
    p.insertionMode = InsertionMode.AFTER_BODY;
    endTagAfterBody(p, token);
  }
}
function addressEndTagInBody(p, token) {
  const tn = token.tagID;
  if (p.openElements.hasInScope(tn)) {
    p.openElements.generateImpliedEndTags();
    p.openElements.popUntilTagNamePopped(tn);
  }
}
function formEndTagInBody(p) {
  const inTemplate = p.openElements.tmplCount > 0;
  const { formElement } = p;
  if (!inTemplate) {
    p.formElement = null;
  }
  if ((formElement || inTemplate) && p.openElements.hasInScope(TAG_ID.FORM)) {
    p.openElements.generateImpliedEndTags();
    if (inTemplate) {
      p.openElements.popUntilTagNamePopped(TAG_ID.FORM);
    } else if (formElement) {
      p.openElements.remove(formElement);
    }
  }
}
function pEndTagInBody(p) {
  if (!p.openElements.hasInButtonScope(TAG_ID.P)) {
    p._insertFakeElement(TAG_NAMES.P, TAG_ID.P);
  }
  p._closePElement();
}
function liEndTagInBody(p) {
  if (p.openElements.hasInListItemScope(TAG_ID.LI)) {
    p.openElements.generateImpliedEndTagsWithExclusion(TAG_ID.LI);
    p.openElements.popUntilTagNamePopped(TAG_ID.LI);
  }
}
function ddEndTagInBody(p, token) {
  const tn = token.tagID;
  if (p.openElements.hasInScope(tn)) {
    p.openElements.generateImpliedEndTagsWithExclusion(tn);
    p.openElements.popUntilTagNamePopped(tn);
  }
}
function numberedHeaderEndTagInBody(p) {
  if (p.openElements.hasNumberedHeaderInScope()) {
    p.openElements.generateImpliedEndTags();
    p.openElements.popUntilNumberedHeaderPopped();
  }
}
function appletEndTagInBody(p, token) {
  const tn = token.tagID;
  if (p.openElements.hasInScope(tn)) {
    p.openElements.generateImpliedEndTags();
    p.openElements.popUntilTagNamePopped(tn);
    p.activeFormattingElements.clearToLastMarker();
  }
}
function brEndTagInBody(p) {
  p._reconstructActiveFormattingElements();
  p._insertFakeElement(TAG_NAMES.BR, TAG_ID.BR);
  p.openElements.pop();
  p.framesetOk = false;
}
function genericEndTagInBody(p, token) {
  const tn = token.tagName;
  const tid = token.tagID;
  for (let i = p.openElements.stackTop; i > 0; i--) {
    const element = p.openElements.items[i];
    const elementId = p.openElements.tagIDs[i];
    if (tid === elementId && (tid !== TAG_ID.UNKNOWN || p.treeAdapter.getTagName(element) === tn)) {
      p.openElements.generateImpliedEndTagsWithExclusion(tid);
      if (p.openElements.stackTop >= i)
        p.openElements.shortenToLength(i);
      break;
    }
    if (p._isSpecialElement(element, elementId)) {
      break;
    }
  }
}
function endTagInBody(p, token) {
  switch (token.tagID) {
    case TAG_ID.A:
    case TAG_ID.B:
    case TAG_ID.I:
    case TAG_ID.S:
    case TAG_ID.U:
    case TAG_ID.EM:
    case TAG_ID.TT:
    case TAG_ID.BIG:
    case TAG_ID.CODE:
    case TAG_ID.FONT:
    case TAG_ID.NOBR:
    case TAG_ID.SMALL:
    case TAG_ID.STRIKE:
    case TAG_ID.STRONG: {
      callAdoptionAgency(p, token);
      break;
    }
    case TAG_ID.P: {
      pEndTagInBody(p);
      break;
    }
    case TAG_ID.DL:
    case TAG_ID.UL:
    case TAG_ID.OL:
    case TAG_ID.DIR:
    case TAG_ID.DIV:
    case TAG_ID.NAV:
    case TAG_ID.PRE:
    case TAG_ID.MAIN:
    case TAG_ID.MENU:
    case TAG_ID.ASIDE:
    case TAG_ID.BUTTON:
    case TAG_ID.CENTER:
    case TAG_ID.FIGURE:
    case TAG_ID.FOOTER:
    case TAG_ID.HEADER:
    case TAG_ID.HGROUP:
    case TAG_ID.DIALOG:
    case TAG_ID.ADDRESS:
    case TAG_ID.ARTICLE:
    case TAG_ID.DETAILS:
    case TAG_ID.SEARCH:
    case TAG_ID.SECTION:
    case TAG_ID.SUMMARY:
    case TAG_ID.LISTING:
    case TAG_ID.FIELDSET:
    case TAG_ID.BLOCKQUOTE:
    case TAG_ID.FIGCAPTION: {
      addressEndTagInBody(p, token);
      break;
    }
    case TAG_ID.LI: {
      liEndTagInBody(p);
      break;
    }
    case TAG_ID.DD:
    case TAG_ID.DT: {
      ddEndTagInBody(p, token);
      break;
    }
    case TAG_ID.H1:
    case TAG_ID.H2:
    case TAG_ID.H3:
    case TAG_ID.H4:
    case TAG_ID.H5:
    case TAG_ID.H6: {
      numberedHeaderEndTagInBody(p);
      break;
    }
    case TAG_ID.BR: {
      brEndTagInBody(p);
      break;
    }
    case TAG_ID.BODY: {
      bodyEndTagInBody(p, token);
      break;
    }
    case TAG_ID.HTML: {
      htmlEndTagInBody(p, token);
      break;
    }
    case TAG_ID.FORM: {
      formEndTagInBody(p);
      break;
    }
    case TAG_ID.APPLET:
    case TAG_ID.OBJECT:
    case TAG_ID.MARQUEE: {
      appletEndTagInBody(p, token);
      break;
    }
    case TAG_ID.TEMPLATE: {
      templateEndTagInHead(p, token);
      break;
    }
    default: {
      genericEndTagInBody(p, token);
    }
  }
}
function eofInBody(p, token) {
  if (p.tmplInsertionModeStack.length > 0) {
    eofInTemplate(p, token);
  } else {
    stopParsing(p, token);
  }
}
function endTagInText(p, token) {
  var _a2;
  if (token.tagID === TAG_ID.SCRIPT) {
    (_a2 = p.scriptHandler) === null || _a2 === void 0 ? void 0 : _a2.call(p, p.openElements.current);
  }
  p.openElements.pop();
  p.insertionMode = p.originalInsertionMode;
}
function eofInText(p, token) {
  p._err(token, ERR.eofInElementThatCanContainOnlyText);
  p.openElements.pop();
  p.insertionMode = p.originalInsertionMode;
  p.onEof(token);
}
function characterInTable(p, token) {
  if (p.openElements.currentTagId !== void 0 && TABLE_STRUCTURE_TAGS.has(p.openElements.currentTagId)) {
    p.pendingCharacterTokens.length = 0;
    p.hasNonWhitespacePendingCharacterToken = false;
    p.originalInsertionMode = p.insertionMode;
    p.insertionMode = InsertionMode.IN_TABLE_TEXT;
    switch (token.type) {
      case TokenType.CHARACTER: {
        characterInTableText(p, token);
        break;
      }
      case TokenType.WHITESPACE_CHARACTER: {
        whitespaceCharacterInTableText(p, token);
        break;
      }
    }
  } else {
    tokenInTable(p, token);
  }
}
function captionStartTagInTable(p, token) {
  p.openElements.clearBackToTableContext();
  p.activeFormattingElements.insertMarker();
  p._insertElement(token, NS.HTML);
  p.insertionMode = InsertionMode.IN_CAPTION;
}
function colgroupStartTagInTable(p, token) {
  p.openElements.clearBackToTableContext();
  p._insertElement(token, NS.HTML);
  p.insertionMode = InsertionMode.IN_COLUMN_GROUP;
}
function colStartTagInTable(p, token) {
  p.openElements.clearBackToTableContext();
  p._insertFakeElement(TAG_NAMES.COLGROUP, TAG_ID.COLGROUP);
  p.insertionMode = InsertionMode.IN_COLUMN_GROUP;
  startTagInColumnGroup(p, token);
}
function tbodyStartTagInTable(p, token) {
  p.openElements.clearBackToTableContext();
  p._insertElement(token, NS.HTML);
  p.insertionMode = InsertionMode.IN_TABLE_BODY;
}
function tdStartTagInTable(p, token) {
  p.openElements.clearBackToTableContext();
  p._insertFakeElement(TAG_NAMES.TBODY, TAG_ID.TBODY);
  p.insertionMode = InsertionMode.IN_TABLE_BODY;
  startTagInTableBody(p, token);
}
function tableStartTagInTable(p, token) {
  if (p.openElements.hasInTableScope(TAG_ID.TABLE)) {
    p.openElements.popUntilTagNamePopped(TAG_ID.TABLE);
    p._resetInsertionMode();
    p._processStartTag(token);
  }
}
function inputStartTagInTable(p, token) {
  if (isHiddenInput(token)) {
    p._appendElement(token, NS.HTML);
  } else {
    tokenInTable(p, token);
  }
  token.ackSelfClosing = true;
}
function formStartTagInTable(p, token) {
  if (!p.formElement && p.openElements.tmplCount === 0) {
    p._insertElement(token, NS.HTML);
    p.formElement = p.openElements.current;
    p.openElements.pop();
  }
}
function startTagInTable(p, token) {
  switch (token.tagID) {
    case TAG_ID.TD:
    case TAG_ID.TH:
    case TAG_ID.TR: {
      tdStartTagInTable(p, token);
      break;
    }
    case TAG_ID.STYLE:
    case TAG_ID.SCRIPT:
    case TAG_ID.TEMPLATE: {
      startTagInHead(p, token);
      break;
    }
    case TAG_ID.COL: {
      colStartTagInTable(p, token);
      break;
    }
    case TAG_ID.FORM: {
      formStartTagInTable(p, token);
      break;
    }
    case TAG_ID.TABLE: {
      tableStartTagInTable(p, token);
      break;
    }
    case TAG_ID.TBODY:
    case TAG_ID.TFOOT:
    case TAG_ID.THEAD: {
      tbodyStartTagInTable(p, token);
      break;
    }
    case TAG_ID.INPUT: {
      inputStartTagInTable(p, token);
      break;
    }
    case TAG_ID.CAPTION: {
      captionStartTagInTable(p, token);
      break;
    }
    case TAG_ID.COLGROUP: {
      colgroupStartTagInTable(p, token);
      break;
    }
    default: {
      tokenInTable(p, token);
    }
  }
}
function endTagInTable(p, token) {
  switch (token.tagID) {
    case TAG_ID.TABLE: {
      if (p.openElements.hasInTableScope(TAG_ID.TABLE)) {
        p.openElements.popUntilTagNamePopped(TAG_ID.TABLE);
        p._resetInsertionMode();
      }
      break;
    }
    case TAG_ID.TEMPLATE: {
      templateEndTagInHead(p, token);
      break;
    }
    case TAG_ID.BODY:
    case TAG_ID.CAPTION:
    case TAG_ID.COL:
    case TAG_ID.COLGROUP:
    case TAG_ID.HTML:
    case TAG_ID.TBODY:
    case TAG_ID.TD:
    case TAG_ID.TFOOT:
    case TAG_ID.TH:
    case TAG_ID.THEAD:
    case TAG_ID.TR: {
      break;
    }
    default: {
      tokenInTable(p, token);
    }
  }
}
function tokenInTable(p, token) {
  const savedFosterParentingState = p.fosterParentingEnabled;
  p.fosterParentingEnabled = true;
  modeInBody(p, token);
  p.fosterParentingEnabled = savedFosterParentingState;
}
function whitespaceCharacterInTableText(p, token) {
  p.pendingCharacterTokens.push(token);
}
function characterInTableText(p, token) {
  p.pendingCharacterTokens.push(token);
  p.hasNonWhitespacePendingCharacterToken = true;
}
function tokenInTableText(p, token) {
  let i = 0;
  if (p.hasNonWhitespacePendingCharacterToken) {
    for (; i < p.pendingCharacterTokens.length; i++) {
      tokenInTable(p, p.pendingCharacterTokens[i]);
    }
  } else {
    for (; i < p.pendingCharacterTokens.length; i++) {
      p._insertCharacters(p.pendingCharacterTokens[i]);
    }
  }
  p.insertionMode = p.originalInsertionMode;
  p._processToken(token);
}
function startTagInCaption(p, token) {
  const tn = token.tagID;
  if (TABLE_VOID_ELEMENTS.has(tn)) {
    if (p.openElements.hasInTableScope(TAG_ID.CAPTION)) {
      p.openElements.generateImpliedEndTags();
      p.openElements.popUntilTagNamePopped(TAG_ID.CAPTION);
      p.activeFormattingElements.clearToLastMarker();
      p.insertionMode = InsertionMode.IN_TABLE;
      startTagInTable(p, token);
    }
  } else {
    startTagInBody(p, token);
  }
}
function endTagInCaption(p, token) {
  const tn = token.tagID;
  switch (tn) {
    case TAG_ID.CAPTION:
    case TAG_ID.TABLE: {
      if (p.openElements.hasInTableScope(TAG_ID.CAPTION)) {
        p.openElements.generateImpliedEndTags();
        p.openElements.popUntilTagNamePopped(TAG_ID.CAPTION);
        p.activeFormattingElements.clearToLastMarker();
        p.insertionMode = InsertionMode.IN_TABLE;
        if (tn === TAG_ID.TABLE) {
          endTagInTable(p, token);
        }
      }
      break;
    }
    case TAG_ID.BODY:
    case TAG_ID.COL:
    case TAG_ID.COLGROUP:
    case TAG_ID.HTML:
    case TAG_ID.TBODY:
    case TAG_ID.TD:
    case TAG_ID.TFOOT:
    case TAG_ID.TH:
    case TAG_ID.THEAD:
    case TAG_ID.TR: {
      break;
    }
    default: {
      endTagInBody(p, token);
    }
  }
}
function startTagInColumnGroup(p, token) {
  switch (token.tagID) {
    case TAG_ID.HTML: {
      startTagInBody(p, token);
      break;
    }
    case TAG_ID.COL: {
      p._appendElement(token, NS.HTML);
      token.ackSelfClosing = true;
      break;
    }
    case TAG_ID.TEMPLATE: {
      startTagInHead(p, token);
      break;
    }
    default: {
      tokenInColumnGroup(p, token);
    }
  }
}
function endTagInColumnGroup(p, token) {
  switch (token.tagID) {
    case TAG_ID.COLGROUP: {
      if (p.openElements.currentTagId === TAG_ID.COLGROUP) {
        p.openElements.pop();
        p.insertionMode = InsertionMode.IN_TABLE;
      }
      break;
    }
    case TAG_ID.TEMPLATE: {
      templateEndTagInHead(p, token);
      break;
    }
    case TAG_ID.COL: {
      break;
    }
    default: {
      tokenInColumnGroup(p, token);
    }
  }
}
function tokenInColumnGroup(p, token) {
  if (p.openElements.currentTagId === TAG_ID.COLGROUP) {
    p.openElements.pop();
    p.insertionMode = InsertionMode.IN_TABLE;
    p._processToken(token);
  }
}
function startTagInTableBody(p, token) {
  switch (token.tagID) {
    case TAG_ID.TR: {
      p.openElements.clearBackToTableBodyContext();
      p._insertElement(token, NS.HTML);
      p.insertionMode = InsertionMode.IN_ROW;
      break;
    }
    case TAG_ID.TH:
    case TAG_ID.TD: {
      p.openElements.clearBackToTableBodyContext();
      p._insertFakeElement(TAG_NAMES.TR, TAG_ID.TR);
      p.insertionMode = InsertionMode.IN_ROW;
      startTagInRow(p, token);
      break;
    }
    case TAG_ID.CAPTION:
    case TAG_ID.COL:
    case TAG_ID.COLGROUP:
    case TAG_ID.TBODY:
    case TAG_ID.TFOOT:
    case TAG_ID.THEAD: {
      if (p.openElements.hasTableBodyContextInTableScope()) {
        p.openElements.clearBackToTableBodyContext();
        p.openElements.pop();
        p.insertionMode = InsertionMode.IN_TABLE;
        startTagInTable(p, token);
      }
      break;
    }
    default: {
      startTagInTable(p, token);
    }
  }
}
function endTagInTableBody(p, token) {
  const tn = token.tagID;
  switch (token.tagID) {
    case TAG_ID.TBODY:
    case TAG_ID.TFOOT:
    case TAG_ID.THEAD: {
      if (p.openElements.hasInTableScope(tn)) {
        p.openElements.clearBackToTableBodyContext();
        p.openElements.pop();
        p.insertionMode = InsertionMode.IN_TABLE;
      }
      break;
    }
    case TAG_ID.TABLE: {
      if (p.openElements.hasTableBodyContextInTableScope()) {
        p.openElements.clearBackToTableBodyContext();
        p.openElements.pop();
        p.insertionMode = InsertionMode.IN_TABLE;
        endTagInTable(p, token);
      }
      break;
    }
    case TAG_ID.BODY:
    case TAG_ID.CAPTION:
    case TAG_ID.COL:
    case TAG_ID.COLGROUP:
    case TAG_ID.HTML:
    case TAG_ID.TD:
    case TAG_ID.TH:
    case TAG_ID.TR: {
      break;
    }
    default: {
      endTagInTable(p, token);
    }
  }
}
function startTagInRow(p, token) {
  switch (token.tagID) {
    case TAG_ID.TH:
    case TAG_ID.TD: {
      p.openElements.clearBackToTableRowContext();
      p._insertElement(token, NS.HTML);
      p.insertionMode = InsertionMode.IN_CELL;
      p.activeFormattingElements.insertMarker();
      break;
    }
    case TAG_ID.CAPTION:
    case TAG_ID.COL:
    case TAG_ID.COLGROUP:
    case TAG_ID.TBODY:
    case TAG_ID.TFOOT:
    case TAG_ID.THEAD:
    case TAG_ID.TR: {
      if (p.openElements.hasInTableScope(TAG_ID.TR)) {
        p.openElements.clearBackToTableRowContext();
        p.openElements.pop();
        p.insertionMode = InsertionMode.IN_TABLE_BODY;
        startTagInTableBody(p, token);
      }
      break;
    }
    default: {
      startTagInTable(p, token);
    }
  }
}
function endTagInRow(p, token) {
  switch (token.tagID) {
    case TAG_ID.TR: {
      if (p.openElements.hasInTableScope(TAG_ID.TR)) {
        p.openElements.clearBackToTableRowContext();
        p.openElements.pop();
        p.insertionMode = InsertionMode.IN_TABLE_BODY;
      }
      break;
    }
    case TAG_ID.TABLE: {
      if (p.openElements.hasInTableScope(TAG_ID.TR)) {
        p.openElements.clearBackToTableRowContext();
        p.openElements.pop();
        p.insertionMode = InsertionMode.IN_TABLE_BODY;
        endTagInTableBody(p, token);
      }
      break;
    }
    case TAG_ID.TBODY:
    case TAG_ID.TFOOT:
    case TAG_ID.THEAD: {
      if (p.openElements.hasInTableScope(token.tagID) || p.openElements.hasInTableScope(TAG_ID.TR)) {
        p.openElements.clearBackToTableRowContext();
        p.openElements.pop();
        p.insertionMode = InsertionMode.IN_TABLE_BODY;
        endTagInTableBody(p, token);
      }
      break;
    }
    case TAG_ID.BODY:
    case TAG_ID.CAPTION:
    case TAG_ID.COL:
    case TAG_ID.COLGROUP:
    case TAG_ID.HTML:
    case TAG_ID.TD:
    case TAG_ID.TH: {
      break;
    }
    default: {
      endTagInTable(p, token);
    }
  }
}
function startTagInCell(p, token) {
  const tn = token.tagID;
  if (TABLE_VOID_ELEMENTS.has(tn)) {
    if (p.openElements.hasInTableScope(TAG_ID.TD) || p.openElements.hasInTableScope(TAG_ID.TH)) {
      p._closeTableCell();
      startTagInRow(p, token);
    }
  } else {
    startTagInBody(p, token);
  }
}
function endTagInCell(p, token) {
  const tn = token.tagID;
  switch (tn) {
    case TAG_ID.TD:
    case TAG_ID.TH: {
      if (p.openElements.hasInTableScope(tn)) {
        p.openElements.generateImpliedEndTags();
        p.openElements.popUntilTagNamePopped(tn);
        p.activeFormattingElements.clearToLastMarker();
        p.insertionMode = InsertionMode.IN_ROW;
      }
      break;
    }
    case TAG_ID.TABLE:
    case TAG_ID.TBODY:
    case TAG_ID.TFOOT:
    case TAG_ID.THEAD:
    case TAG_ID.TR: {
      if (p.openElements.hasInTableScope(tn)) {
        p._closeTableCell();
        endTagInRow(p, token);
      }
      break;
    }
    case TAG_ID.BODY:
    case TAG_ID.CAPTION:
    case TAG_ID.COL:
    case TAG_ID.COLGROUP:
    case TAG_ID.HTML: {
      break;
    }
    default: {
      endTagInBody(p, token);
    }
  }
}
function startTagInSelect(p, token) {
  switch (token.tagID) {
    case TAG_ID.HTML: {
      startTagInBody(p, token);
      break;
    }
    case TAG_ID.OPTION: {
      if (p.openElements.currentTagId === TAG_ID.OPTION) {
        p.openElements.pop();
      }
      p._insertElement(token, NS.HTML);
      break;
    }
    case TAG_ID.OPTGROUP: {
      if (p.openElements.currentTagId === TAG_ID.OPTION) {
        p.openElements.pop();
      }
      if (p.openElements.currentTagId === TAG_ID.OPTGROUP) {
        p.openElements.pop();
      }
      p._insertElement(token, NS.HTML);
      break;
    }
    case TAG_ID.HR: {
      if (p.openElements.currentTagId === TAG_ID.OPTION) {
        p.openElements.pop();
      }
      if (p.openElements.currentTagId === TAG_ID.OPTGROUP) {
        p.openElements.pop();
      }
      p._appendElement(token, NS.HTML);
      token.ackSelfClosing = true;
      break;
    }
    case TAG_ID.INPUT:
    case TAG_ID.KEYGEN:
    case TAG_ID.TEXTAREA:
    case TAG_ID.SELECT: {
      if (p.openElements.hasInSelectScope(TAG_ID.SELECT)) {
        p.openElements.popUntilTagNamePopped(TAG_ID.SELECT);
        p._resetInsertionMode();
        if (token.tagID !== TAG_ID.SELECT) {
          p._processStartTag(token);
        }
      }
      break;
    }
    case TAG_ID.SCRIPT:
    case TAG_ID.TEMPLATE: {
      startTagInHead(p, token);
      break;
    }
    default:
  }
}
function endTagInSelect(p, token) {
  switch (token.tagID) {
    case TAG_ID.OPTGROUP: {
      if (p.openElements.stackTop > 0 && p.openElements.currentTagId === TAG_ID.OPTION && p.openElements.tagIDs[p.openElements.stackTop - 1] === TAG_ID.OPTGROUP) {
        p.openElements.pop();
      }
      if (p.openElements.currentTagId === TAG_ID.OPTGROUP) {
        p.openElements.pop();
      }
      break;
    }
    case TAG_ID.OPTION: {
      if (p.openElements.currentTagId === TAG_ID.OPTION) {
        p.openElements.pop();
      }
      break;
    }
    case TAG_ID.SELECT: {
      if (p.openElements.hasInSelectScope(TAG_ID.SELECT)) {
        p.openElements.popUntilTagNamePopped(TAG_ID.SELECT);
        p._resetInsertionMode();
      }
      break;
    }
    case TAG_ID.TEMPLATE: {
      templateEndTagInHead(p, token);
      break;
    }
    default:
  }
}
function startTagInSelectInTable(p, token) {
  const tn = token.tagID;
  if (tn === TAG_ID.CAPTION || tn === TAG_ID.TABLE || tn === TAG_ID.TBODY || tn === TAG_ID.TFOOT || tn === TAG_ID.THEAD || tn === TAG_ID.TR || tn === TAG_ID.TD || tn === TAG_ID.TH) {
    p.openElements.popUntilTagNamePopped(TAG_ID.SELECT);
    p._resetInsertionMode();
    p._processStartTag(token);
  } else {
    startTagInSelect(p, token);
  }
}
function endTagInSelectInTable(p, token) {
  const tn = token.tagID;
  if (tn === TAG_ID.CAPTION || tn === TAG_ID.TABLE || tn === TAG_ID.TBODY || tn === TAG_ID.TFOOT || tn === TAG_ID.THEAD || tn === TAG_ID.TR || tn === TAG_ID.TD || tn === TAG_ID.TH) {
    if (p.openElements.hasInTableScope(tn)) {
      p.openElements.popUntilTagNamePopped(TAG_ID.SELECT);
      p._resetInsertionMode();
      p.onEndTag(token);
    }
  } else {
    endTagInSelect(p, token);
  }
}
function startTagInTemplate(p, token) {
  switch (token.tagID) {
    // First, handle tags that can start without a mode change
    case TAG_ID.BASE:
    case TAG_ID.BASEFONT:
    case TAG_ID.BGSOUND:
    case TAG_ID.LINK:
    case TAG_ID.META:
    case TAG_ID.NOFRAMES:
    case TAG_ID.SCRIPT:
    case TAG_ID.STYLE:
    case TAG_ID.TEMPLATE:
    case TAG_ID.TITLE: {
      startTagInHead(p, token);
      break;
    }
    // Re-process the token in the appropriate mode
    case TAG_ID.CAPTION:
    case TAG_ID.COLGROUP:
    case TAG_ID.TBODY:
    case TAG_ID.TFOOT:
    case TAG_ID.THEAD: {
      p.tmplInsertionModeStack[0] = InsertionMode.IN_TABLE;
      p.insertionMode = InsertionMode.IN_TABLE;
      startTagInTable(p, token);
      break;
    }
    case TAG_ID.COL: {
      p.tmplInsertionModeStack[0] = InsertionMode.IN_COLUMN_GROUP;
      p.insertionMode = InsertionMode.IN_COLUMN_GROUP;
      startTagInColumnGroup(p, token);
      break;
    }
    case TAG_ID.TR: {
      p.tmplInsertionModeStack[0] = InsertionMode.IN_TABLE_BODY;
      p.insertionMode = InsertionMode.IN_TABLE_BODY;
      startTagInTableBody(p, token);
      break;
    }
    case TAG_ID.TD:
    case TAG_ID.TH: {
      p.tmplInsertionModeStack[0] = InsertionMode.IN_ROW;
      p.insertionMode = InsertionMode.IN_ROW;
      startTagInRow(p, token);
      break;
    }
    default: {
      p.tmplInsertionModeStack[0] = InsertionMode.IN_BODY;
      p.insertionMode = InsertionMode.IN_BODY;
      startTagInBody(p, token);
    }
  }
}
function endTagInTemplate(p, token) {
  if (token.tagID === TAG_ID.TEMPLATE) {
    templateEndTagInHead(p, token);
  }
}
function eofInTemplate(p, token) {
  if (p.openElements.tmplCount > 0) {
    p.openElements.popUntilTagNamePopped(TAG_ID.TEMPLATE);
    p.activeFormattingElements.clearToLastMarker();
    p.tmplInsertionModeStack.shift();
    p._resetInsertionMode();
    p.onEof(token);
  } else {
    stopParsing(p, token);
  }
}
function startTagAfterBody(p, token) {
  if (token.tagID === TAG_ID.HTML) {
    startTagInBody(p, token);
  } else {
    tokenAfterBody(p, token);
  }
}
function endTagAfterBody(p, token) {
  var _a2;
  if (token.tagID === TAG_ID.HTML) {
    if (!p.fragmentContext) {
      p.insertionMode = InsertionMode.AFTER_AFTER_BODY;
    }
    if (p.options.sourceCodeLocationInfo && p.openElements.tagIDs[0] === TAG_ID.HTML) {
      p._setEndLocation(p.openElements.items[0], token);
      const bodyElement = p.openElements.items[1];
      if (bodyElement && !((_a2 = p.treeAdapter.getNodeSourceCodeLocation(bodyElement)) === null || _a2 === void 0 ? void 0 : _a2.endTag)) {
        p._setEndLocation(bodyElement, token);
      }
    }
  } else {
    tokenAfterBody(p, token);
  }
}
function tokenAfterBody(p, token) {
  p.insertionMode = InsertionMode.IN_BODY;
  modeInBody(p, token);
}
function startTagInFrameset(p, token) {
  switch (token.tagID) {
    case TAG_ID.HTML: {
      startTagInBody(p, token);
      break;
    }
    case TAG_ID.FRAMESET: {
      p._insertElement(token, NS.HTML);
      break;
    }
    case TAG_ID.FRAME: {
      p._appendElement(token, NS.HTML);
      token.ackSelfClosing = true;
      break;
    }
    case TAG_ID.NOFRAMES: {
      startTagInHead(p, token);
      break;
    }
    default:
  }
}
function endTagInFrameset(p, token) {
  if (token.tagID === TAG_ID.FRAMESET && !p.openElements.isRootHtmlElementCurrent()) {
    p.openElements.pop();
    if (!p.fragmentContext && p.openElements.currentTagId !== TAG_ID.FRAMESET) {
      p.insertionMode = InsertionMode.AFTER_FRAMESET;
    }
  }
}
function startTagAfterFrameset(p, token) {
  switch (token.tagID) {
    case TAG_ID.HTML: {
      startTagInBody(p, token);
      break;
    }
    case TAG_ID.NOFRAMES: {
      startTagInHead(p, token);
      break;
    }
    default:
  }
}
function endTagAfterFrameset(p, token) {
  if (token.tagID === TAG_ID.HTML) {
    p.insertionMode = InsertionMode.AFTER_AFTER_FRAMESET;
  }
}
function startTagAfterAfterBody(p, token) {
  if (token.tagID === TAG_ID.HTML) {
    startTagInBody(p, token);
  } else {
    tokenAfterAfterBody(p, token);
  }
}
function tokenAfterAfterBody(p, token) {
  p.insertionMode = InsertionMode.IN_BODY;
  modeInBody(p, token);
}
function startTagAfterAfterFrameset(p, token) {
  switch (token.tagID) {
    case TAG_ID.HTML: {
      startTagInBody(p, token);
      break;
    }
    case TAG_ID.NOFRAMES: {
      startTagInHead(p, token);
      break;
    }
    default:
  }
}
function nullCharacterInForeignContent(p, token) {
  token.chars = REPLACEMENT_CHARACTER;
  p._insertCharacters(token);
}
function characterInForeignContent(p, token) {
  p._insertCharacters(token);
  p.framesetOk = false;
}
function popUntilHtmlOrIntegrationPoint(p) {
  while (p.treeAdapter.getNamespaceURI(p.openElements.current) !== NS.HTML && p.openElements.currentTagId !== void 0 && !p._isIntegrationPoint(p.openElements.currentTagId, p.openElements.current)) {
    p.openElements.pop();
  }
}
function startTagInForeignContent(p, token) {
  if (causesExit(token)) {
    popUntilHtmlOrIntegrationPoint(p);
    p._startTagOutsideForeignContent(token);
  } else {
    const current = p._getAdjustedCurrentElement();
    const currentNs = p.treeAdapter.getNamespaceURI(current);
    if (currentNs === NS.MATHML) {
      adjustTokenMathMLAttrs(token);
    } else if (currentNs === NS.SVG) {
      adjustTokenSVGTagName(token);
      adjustTokenSVGAttrs(token);
    }
    adjustTokenXMLAttrs(token);
    if (token.selfClosing) {
      p._appendElement(token, currentNs);
    } else {
      p._insertElement(token, currentNs);
    }
    token.ackSelfClosing = true;
  }
}
function endTagInForeignContent(p, token) {
  if (token.tagID === TAG_ID.P || token.tagID === TAG_ID.BR) {
    popUntilHtmlOrIntegrationPoint(p);
    p._endTagOutsideForeignContent(token);
    return;
  }
  for (let i = p.openElements.stackTop; i > 0; i--) {
    const element = p.openElements.items[i];
    if (p.treeAdapter.getNamespaceURI(element) === NS.HTML) {
      p._endTagOutsideForeignContent(token);
      break;
    }
    const tagName = p.treeAdapter.getTagName(element);
    if (tagName.toLowerCase() === token.tagName) {
      token.tagName = tagName;
      p.openElements.shortenToLength(i);
      break;
    }
  }
}
var HIDDEN_INPUT_TYPE, AA_OUTER_LOOP_ITER, AA_INNER_LOOP_ITER, InsertionMode, BASE_LOC, TABLE_STRUCTURE_TAGS, defaultParserOptions, Parser, TABLE_VOID_ELEMENTS;
var init_parser = __esm({
  "node_modules/parse5/dist/parser/index.js"() {
    init_tokenizer();
    init_open_element_stack();
    init_formatting_element_list();
    init_default();
    init_doctype();
    init_foreign_content();
    init_error_codes();
    init_unicode();
    init_html();
    init_token();
    HIDDEN_INPUT_TYPE = "hidden";
    AA_OUTER_LOOP_ITER = 8;
    AA_INNER_LOOP_ITER = 3;
    (function(InsertionMode2) {
      InsertionMode2[InsertionMode2["INITIAL"] = 0] = "INITIAL";
      InsertionMode2[InsertionMode2["BEFORE_HTML"] = 1] = "BEFORE_HTML";
      InsertionMode2[InsertionMode2["BEFORE_HEAD"] = 2] = "BEFORE_HEAD";
      InsertionMode2[InsertionMode2["IN_HEAD"] = 3] = "IN_HEAD";
      InsertionMode2[InsertionMode2["IN_HEAD_NO_SCRIPT"] = 4] = "IN_HEAD_NO_SCRIPT";
      InsertionMode2[InsertionMode2["AFTER_HEAD"] = 5] = "AFTER_HEAD";
      InsertionMode2[InsertionMode2["IN_BODY"] = 6] = "IN_BODY";
      InsertionMode2[InsertionMode2["TEXT"] = 7] = "TEXT";
      InsertionMode2[InsertionMode2["IN_TABLE"] = 8] = "IN_TABLE";
      InsertionMode2[InsertionMode2["IN_TABLE_TEXT"] = 9] = "IN_TABLE_TEXT";
      InsertionMode2[InsertionMode2["IN_CAPTION"] = 10] = "IN_CAPTION";
      InsertionMode2[InsertionMode2["IN_COLUMN_GROUP"] = 11] = "IN_COLUMN_GROUP";
      InsertionMode2[InsertionMode2["IN_TABLE_BODY"] = 12] = "IN_TABLE_BODY";
      InsertionMode2[InsertionMode2["IN_ROW"] = 13] = "IN_ROW";
      InsertionMode2[InsertionMode2["IN_CELL"] = 14] = "IN_CELL";
      InsertionMode2[InsertionMode2["IN_SELECT"] = 15] = "IN_SELECT";
      InsertionMode2[InsertionMode2["IN_SELECT_IN_TABLE"] = 16] = "IN_SELECT_IN_TABLE";
      InsertionMode2[InsertionMode2["IN_TEMPLATE"] = 17] = "IN_TEMPLATE";
      InsertionMode2[InsertionMode2["AFTER_BODY"] = 18] = "AFTER_BODY";
      InsertionMode2[InsertionMode2["IN_FRAMESET"] = 19] = "IN_FRAMESET";
      InsertionMode2[InsertionMode2["AFTER_FRAMESET"] = 20] = "AFTER_FRAMESET";
      InsertionMode2[InsertionMode2["AFTER_AFTER_BODY"] = 21] = "AFTER_AFTER_BODY";
      InsertionMode2[InsertionMode2["AFTER_AFTER_FRAMESET"] = 22] = "AFTER_AFTER_FRAMESET";
    })(InsertionMode || (InsertionMode = {}));
    BASE_LOC = {
      startLine: -1,
      startCol: -1,
      startOffset: -1,
      endLine: -1,
      endCol: -1,
      endOffset: -1
    };
    TABLE_STRUCTURE_TAGS = /* @__PURE__ */ new Set([TAG_ID.TABLE, TAG_ID.TBODY, TAG_ID.TFOOT, TAG_ID.THEAD, TAG_ID.TR]);
    defaultParserOptions = {
      scriptingEnabled: true,
      sourceCodeLocationInfo: false,
      treeAdapter: defaultTreeAdapter,
      onParseError: null
    };
    Parser = class {
      constructor(options, document, fragmentContext = null, scriptHandler = null) {
        this.fragmentContext = fragmentContext;
        this.scriptHandler = scriptHandler;
        this.currentToken = null;
        this.stopped = false;
        this.insertionMode = InsertionMode.INITIAL;
        this.originalInsertionMode = InsertionMode.INITIAL;
        this.headElement = null;
        this.formElement = null;
        this.currentNotInHTML = false;
        this.tmplInsertionModeStack = [];
        this.pendingCharacterTokens = [];
        this.hasNonWhitespacePendingCharacterToken = false;
        this.framesetOk = true;
        this.skipNextNewLine = false;
        this.fosterParentingEnabled = false;
        this.options = {
          ...defaultParserOptions,
          ...options
        };
        this.treeAdapter = this.options.treeAdapter;
        this.onParseError = this.options.onParseError;
        if (this.onParseError) {
          this.options.sourceCodeLocationInfo = true;
        }
        this.document = document !== null && document !== void 0 ? document : this.treeAdapter.createDocument();
        this.tokenizer = new Tokenizer(this.options, this);
        this.activeFormattingElements = new FormattingElementList(this.treeAdapter);
        this.fragmentContextID = fragmentContext ? getTagID(this.treeAdapter.getTagName(fragmentContext)) : TAG_ID.UNKNOWN;
        this._setContextModes(fragmentContext !== null && fragmentContext !== void 0 ? fragmentContext : this.document, this.fragmentContextID);
        this.openElements = new OpenElementStack(this.document, this.treeAdapter, this);
      }
      // API
      static parse(html, options) {
        const parser = new this(options);
        parser.tokenizer.write(html, true);
        return parser.document;
      }
      static getFragmentParser(fragmentContext, options) {
        const opts = {
          ...defaultParserOptions,
          ...options
        };
        fragmentContext !== null && fragmentContext !== void 0 ? fragmentContext : fragmentContext = opts.treeAdapter.createElement(TAG_NAMES.TEMPLATE, NS.HTML, []);
        const documentMock = opts.treeAdapter.createElement("documentmock", NS.HTML, []);
        const parser = new this(opts, documentMock, fragmentContext);
        if (parser.fragmentContextID === TAG_ID.TEMPLATE) {
          parser.tmplInsertionModeStack.unshift(InsertionMode.IN_TEMPLATE);
        }
        parser._initTokenizerForFragmentParsing();
        parser._insertFakeRootElement();
        parser._resetInsertionMode();
        parser._findFormInFragmentContext();
        return parser;
      }
      getFragment() {
        const rootElement = this.treeAdapter.getFirstChild(this.document);
        const fragment = this.treeAdapter.createDocumentFragment();
        this._adoptNodes(rootElement, fragment);
        return fragment;
      }
      //Errors
      /** @internal */
      _err(token, code, beforeToken) {
        var _a2;
        if (!this.onParseError)
          return;
        const loc = (_a2 = token.location) !== null && _a2 !== void 0 ? _a2 : BASE_LOC;
        const err = {
          code,
          startLine: loc.startLine,
          startCol: loc.startCol,
          startOffset: loc.startOffset,
          endLine: beforeToken ? loc.startLine : loc.endLine,
          endCol: beforeToken ? loc.startCol : loc.endCol,
          endOffset: beforeToken ? loc.startOffset : loc.endOffset
        };
        this.onParseError(err);
      }
      //Stack events
      /** @internal */
      onItemPush(node, tid, isTop) {
        var _a2, _b;
        (_b = (_a2 = this.treeAdapter).onItemPush) === null || _b === void 0 ? void 0 : _b.call(_a2, node);
        if (isTop && this.openElements.stackTop > 0)
          this._setContextModes(node, tid);
      }
      /** @internal */
      onItemPop(node, isTop) {
        var _a2, _b;
        if (this.options.sourceCodeLocationInfo) {
          this._setEndLocation(node, this.currentToken);
        }
        (_b = (_a2 = this.treeAdapter).onItemPop) === null || _b === void 0 ? void 0 : _b.call(_a2, node, this.openElements.current);
        if (isTop) {
          let current;
          let currentTagId;
          if (this.openElements.stackTop === 0 && this.fragmentContext) {
            current = this.fragmentContext;
            currentTagId = this.fragmentContextID;
          } else {
            ({ current, currentTagId } = this.openElements);
          }
          this._setContextModes(current, currentTagId);
        }
      }
      _setContextModes(current, tid) {
        const isHTML = current === this.document || current && this.treeAdapter.getNamespaceURI(current) === NS.HTML;
        this.currentNotInHTML = !isHTML;
        this.tokenizer.inForeignNode = !isHTML && current !== void 0 && tid !== void 0 && !this._isIntegrationPoint(tid, current);
      }
      /** @protected */
      _switchToTextParsing(currentToken, nextTokenizerState) {
        this._insertElement(currentToken, NS.HTML);
        this.tokenizer.state = nextTokenizerState;
        this.originalInsertionMode = this.insertionMode;
        this.insertionMode = InsertionMode.TEXT;
      }
      switchToPlaintextParsing() {
        this.insertionMode = InsertionMode.TEXT;
        this.originalInsertionMode = InsertionMode.IN_BODY;
        this.tokenizer.state = TokenizerMode.PLAINTEXT;
      }
      //Fragment parsing
      /** @protected */
      _getAdjustedCurrentElement() {
        return this.openElements.stackTop === 0 && this.fragmentContext ? this.fragmentContext : this.openElements.current;
      }
      /** @protected */
      _findFormInFragmentContext() {
        let node = this.fragmentContext;
        while (node) {
          if (this.treeAdapter.getTagName(node) === TAG_NAMES.FORM) {
            this.formElement = node;
            break;
          }
          node = this.treeAdapter.getParentNode(node);
        }
      }
      _initTokenizerForFragmentParsing() {
        if (!this.fragmentContext || this.treeAdapter.getNamespaceURI(this.fragmentContext) !== NS.HTML) {
          return;
        }
        switch (this.fragmentContextID) {
          case TAG_ID.TITLE:
          case TAG_ID.TEXTAREA: {
            this.tokenizer.state = TokenizerMode.RCDATA;
            break;
          }
          case TAG_ID.STYLE:
          case TAG_ID.XMP:
          case TAG_ID.IFRAME:
          case TAG_ID.NOEMBED:
          case TAG_ID.NOFRAMES:
          case TAG_ID.NOSCRIPT: {
            this.tokenizer.state = TokenizerMode.RAWTEXT;
            break;
          }
          case TAG_ID.SCRIPT: {
            this.tokenizer.state = TokenizerMode.SCRIPT_DATA;
            break;
          }
          case TAG_ID.PLAINTEXT: {
            this.tokenizer.state = TokenizerMode.PLAINTEXT;
            break;
          }
          default:
        }
      }
      //Tree mutation
      /** @protected */
      _setDocumentType(token) {
        const name = token.name || "";
        const publicId = token.publicId || "";
        const systemId = token.systemId || "";
        this.treeAdapter.setDocumentType(this.document, name, publicId, systemId);
        if (token.location) {
          const documentChildren = this.treeAdapter.getChildNodes(this.document);
          const docTypeNode = documentChildren.find((node) => this.treeAdapter.isDocumentTypeNode(node));
          if (docTypeNode) {
            this.treeAdapter.setNodeSourceCodeLocation(docTypeNode, token.location);
          }
        }
      }
      /** @protected */
      _attachElementToTree(element, location) {
        if (this.options.sourceCodeLocationInfo) {
          const loc = location && {
            ...location,
            startTag: location
          };
          this.treeAdapter.setNodeSourceCodeLocation(element, loc);
        }
        if (this._shouldFosterParentOnInsertion()) {
          this._fosterParentElement(element);
        } else {
          const parent = this.openElements.currentTmplContentOrNode;
          this.treeAdapter.appendChild(parent !== null && parent !== void 0 ? parent : this.document, element);
        }
      }
      /**
       * For self-closing tags. Add an element to the tree, but skip adding it
       * to the stack.
       */
      /** @protected */
      _appendElement(token, namespaceURI) {
        const element = this.treeAdapter.createElement(token.tagName, namespaceURI, token.attrs);
        this._attachElementToTree(element, token.location);
      }
      /** @protected */
      _insertElement(token, namespaceURI) {
        const element = this.treeAdapter.createElement(token.tagName, namespaceURI, token.attrs);
        this._attachElementToTree(element, token.location);
        this.openElements.push(element, token.tagID);
      }
      /** @protected */
      _insertFakeElement(tagName, tagID) {
        const element = this.treeAdapter.createElement(tagName, NS.HTML, []);
        this._attachElementToTree(element, null);
        this.openElements.push(element, tagID);
      }
      /** @protected */
      _insertTemplate(token) {
        const tmpl = this.treeAdapter.createElement(token.tagName, NS.HTML, token.attrs);
        const content = this.treeAdapter.createDocumentFragment();
        this.treeAdapter.setTemplateContent(tmpl, content);
        this._attachElementToTree(tmpl, token.location);
        this.openElements.push(tmpl, token.tagID);
        if (this.options.sourceCodeLocationInfo)
          this.treeAdapter.setNodeSourceCodeLocation(content, null);
      }
      /** @protected */
      _insertFakeRootElement() {
        const element = this.treeAdapter.createElement(TAG_NAMES.HTML, NS.HTML, []);
        if (this.options.sourceCodeLocationInfo)
          this.treeAdapter.setNodeSourceCodeLocation(element, null);
        this.treeAdapter.appendChild(this.openElements.current, element);
        this.openElements.push(element, TAG_ID.HTML);
      }
      /** @protected */
      _appendCommentNode(token, parent) {
        const commentNode = this.treeAdapter.createCommentNode(token.data);
        this.treeAdapter.appendChild(parent, commentNode);
        if (this.options.sourceCodeLocationInfo) {
          this.treeAdapter.setNodeSourceCodeLocation(commentNode, token.location);
        }
      }
      /** @protected */
      _insertCharacters(token) {
        let parent;
        let beforeElement;
        if (this._shouldFosterParentOnInsertion()) {
          ({ parent, beforeElement } = this._findFosterParentingLocation());
          if (beforeElement) {
            this.treeAdapter.insertTextBefore(parent, token.chars, beforeElement);
          } else {
            this.treeAdapter.insertText(parent, token.chars);
          }
        } else {
          parent = this.openElements.currentTmplContentOrNode;
          this.treeAdapter.insertText(parent, token.chars);
        }
        if (!token.location)
          return;
        const siblings = this.treeAdapter.getChildNodes(parent);
        const textNodeIdx = beforeElement ? siblings.lastIndexOf(beforeElement) : siblings.length;
        const textNode = siblings[textNodeIdx - 1];
        const tnLoc = this.treeAdapter.getNodeSourceCodeLocation(textNode);
        if (tnLoc) {
          const { endLine, endCol, endOffset } = token.location;
          this.treeAdapter.updateNodeSourceCodeLocation(textNode, { endLine, endCol, endOffset });
        } else if (this.options.sourceCodeLocationInfo) {
          this.treeAdapter.setNodeSourceCodeLocation(textNode, token.location);
        }
      }
      /** @protected */
      _adoptNodes(donor, recipient) {
        for (let child = this.treeAdapter.getFirstChild(donor); child; child = this.treeAdapter.getFirstChild(donor)) {
          this.treeAdapter.detachNode(child);
          this.treeAdapter.appendChild(recipient, child);
        }
      }
      /** @protected */
      _setEndLocation(element, closingToken) {
        if (this.treeAdapter.getNodeSourceCodeLocation(element) && closingToken.location) {
          const ctLoc = closingToken.location;
          const tn = this.treeAdapter.getTagName(element);
          const endLoc = (
            // NOTE: For cases like <p> <p> </p> - First 'p' closes without a closing
            // tag and for cases like <td> <p> </td> - 'p' closes without a closing tag.
            closingToken.type === TokenType.END_TAG && tn === closingToken.tagName ? {
              endTag: { ...ctLoc },
              endLine: ctLoc.endLine,
              endCol: ctLoc.endCol,
              endOffset: ctLoc.endOffset
            } : {
              endLine: ctLoc.startLine,
              endCol: ctLoc.startCol,
              endOffset: ctLoc.startOffset
            }
          );
          this.treeAdapter.updateNodeSourceCodeLocation(element, endLoc);
        }
      }
      //Token processing
      shouldProcessStartTagTokenInForeignContent(token) {
        if (!this.currentNotInHTML)
          return false;
        let current;
        let currentTagId;
        if (this.openElements.stackTop === 0 && this.fragmentContext) {
          current = this.fragmentContext;
          currentTagId = this.fragmentContextID;
        } else {
          ({ current, currentTagId } = this.openElements);
        }
        if (token.tagID === TAG_ID.SVG && this.treeAdapter.getTagName(current) === TAG_NAMES.ANNOTATION_XML && this.treeAdapter.getNamespaceURI(current) === NS.MATHML) {
          return false;
        }
        return (
          // Check that `current` is not an integration point for HTML or MathML elements.
          this.tokenizer.inForeignNode || // If it _is_ an integration point, then we might have to check that it is not an HTML
          // integration point.
          (token.tagID === TAG_ID.MGLYPH || token.tagID === TAG_ID.MALIGNMARK) && currentTagId !== void 0 && !this._isIntegrationPoint(currentTagId, current, NS.HTML)
        );
      }
      /** @protected */
      _processToken(token) {
        switch (token.type) {
          case TokenType.CHARACTER: {
            this.onCharacter(token);
            break;
          }
          case TokenType.NULL_CHARACTER: {
            this.onNullCharacter(token);
            break;
          }
          case TokenType.COMMENT: {
            this.onComment(token);
            break;
          }
          case TokenType.DOCTYPE: {
            this.onDoctype(token);
            break;
          }
          case TokenType.START_TAG: {
            this._processStartTag(token);
            break;
          }
          case TokenType.END_TAG: {
            this.onEndTag(token);
            break;
          }
          case TokenType.EOF: {
            this.onEof(token);
            break;
          }
          case TokenType.WHITESPACE_CHARACTER: {
            this.onWhitespaceCharacter(token);
            break;
          }
        }
      }
      //Integration points
      /** @protected */
      _isIntegrationPoint(tid, element, foreignNS) {
        const ns = this.treeAdapter.getNamespaceURI(element);
        const attrs = this.treeAdapter.getAttrList(element);
        return isIntegrationPoint(tid, ns, attrs, foreignNS);
      }
      //Active formatting elements reconstruction
      /** @protected */
      _reconstructActiveFormattingElements() {
        const listLength = this.activeFormattingElements.entries.length;
        if (listLength) {
          const endIndex = this.activeFormattingElements.entries.findIndex((entry) => entry.type === EntryType.Marker || this.openElements.contains(entry.element));
          const unopenIdx = endIndex === -1 ? listLength - 1 : endIndex - 1;
          for (let i = unopenIdx; i >= 0; i--) {
            const entry = this.activeFormattingElements.entries[i];
            this._insertElement(entry.token, this.treeAdapter.getNamespaceURI(entry.element));
            entry.element = this.openElements.current;
          }
        }
      }
      //Close elements
      /** @protected */
      _closeTableCell() {
        this.openElements.generateImpliedEndTags();
        this.openElements.popUntilTableCellPopped();
        this.activeFormattingElements.clearToLastMarker();
        this.insertionMode = InsertionMode.IN_ROW;
      }
      /** @protected */
      _closePElement() {
        this.openElements.generateImpliedEndTagsWithExclusion(TAG_ID.P);
        this.openElements.popUntilTagNamePopped(TAG_ID.P);
      }
      //Insertion modes
      /** @protected */
      _resetInsertionMode() {
        for (let i = this.openElements.stackTop; i >= 0; i--) {
          switch (i === 0 && this.fragmentContext ? this.fragmentContextID : this.openElements.tagIDs[i]) {
            case TAG_ID.TR: {
              this.insertionMode = InsertionMode.IN_ROW;
              return;
            }
            case TAG_ID.TBODY:
            case TAG_ID.THEAD:
            case TAG_ID.TFOOT: {
              this.insertionMode = InsertionMode.IN_TABLE_BODY;
              return;
            }
            case TAG_ID.CAPTION: {
              this.insertionMode = InsertionMode.IN_CAPTION;
              return;
            }
            case TAG_ID.COLGROUP: {
              this.insertionMode = InsertionMode.IN_COLUMN_GROUP;
              return;
            }
            case TAG_ID.TABLE: {
              this.insertionMode = InsertionMode.IN_TABLE;
              return;
            }
            case TAG_ID.BODY: {
              this.insertionMode = InsertionMode.IN_BODY;
              return;
            }
            case TAG_ID.FRAMESET: {
              this.insertionMode = InsertionMode.IN_FRAMESET;
              return;
            }
            case TAG_ID.SELECT: {
              this._resetInsertionModeForSelect(i);
              return;
            }
            case TAG_ID.TEMPLATE: {
              this.insertionMode = this.tmplInsertionModeStack[0];
              return;
            }
            case TAG_ID.HTML: {
              this.insertionMode = this.headElement ? InsertionMode.AFTER_HEAD : InsertionMode.BEFORE_HEAD;
              return;
            }
            case TAG_ID.TD:
            case TAG_ID.TH: {
              if (i > 0) {
                this.insertionMode = InsertionMode.IN_CELL;
                return;
              }
              break;
            }
            case TAG_ID.HEAD: {
              if (i > 0) {
                this.insertionMode = InsertionMode.IN_HEAD;
                return;
              }
              break;
            }
          }
        }
        this.insertionMode = InsertionMode.IN_BODY;
      }
      /** @protected */
      _resetInsertionModeForSelect(selectIdx) {
        if (selectIdx > 0) {
          for (let i = selectIdx - 1; i > 0; i--) {
            const tn = this.openElements.tagIDs[i];
            if (tn === TAG_ID.TEMPLATE) {
              break;
            } else if (tn === TAG_ID.TABLE) {
              this.insertionMode = InsertionMode.IN_SELECT_IN_TABLE;
              return;
            }
          }
        }
        this.insertionMode = InsertionMode.IN_SELECT;
      }
      //Foster parenting
      /** @protected */
      _isElementCausesFosterParenting(tn) {
        return TABLE_STRUCTURE_TAGS.has(tn);
      }
      /** @protected */
      _shouldFosterParentOnInsertion() {
        return this.fosterParentingEnabled && this.openElements.currentTagId !== void 0 && this._isElementCausesFosterParenting(this.openElements.currentTagId);
      }
      /** @protected */
      _findFosterParentingLocation() {
        for (let i = this.openElements.stackTop; i >= 0; i--) {
          const openElement = this.openElements.items[i];
          switch (this.openElements.tagIDs[i]) {
            case TAG_ID.TEMPLATE: {
              if (this.treeAdapter.getNamespaceURI(openElement) === NS.HTML) {
                return { parent: this.treeAdapter.getTemplateContent(openElement), beforeElement: null };
              }
              break;
            }
            case TAG_ID.TABLE: {
              const parent = this.treeAdapter.getParentNode(openElement);
              if (parent) {
                return { parent, beforeElement: openElement };
              }
              return { parent: this.openElements.items[i - 1], beforeElement: null };
            }
            default:
          }
        }
        return { parent: this.openElements.items[0], beforeElement: null };
      }
      /** @protected */
      _fosterParentElement(element) {
        const location = this._findFosterParentingLocation();
        if (location.beforeElement) {
          this.treeAdapter.insertBefore(location.parent, element, location.beforeElement);
        } else {
          this.treeAdapter.appendChild(location.parent, element);
        }
      }
      //Special elements
      /** @protected */
      _isSpecialElement(element, id) {
        const ns = this.treeAdapter.getNamespaceURI(element);
        return SPECIAL_ELEMENTS[ns].has(id);
      }
      /** @internal */
      onCharacter(token) {
        this.skipNextNewLine = false;
        if (this.tokenizer.inForeignNode) {
          characterInForeignContent(this, token);
          return;
        }
        switch (this.insertionMode) {
          case InsertionMode.INITIAL: {
            tokenInInitialMode(this, token);
            break;
          }
          case InsertionMode.BEFORE_HTML: {
            tokenBeforeHtml(this, token);
            break;
          }
          case InsertionMode.BEFORE_HEAD: {
            tokenBeforeHead(this, token);
            break;
          }
          case InsertionMode.IN_HEAD: {
            tokenInHead(this, token);
            break;
          }
          case InsertionMode.IN_HEAD_NO_SCRIPT: {
            tokenInHeadNoScript(this, token);
            break;
          }
          case InsertionMode.AFTER_HEAD: {
            tokenAfterHead(this, token);
            break;
          }
          case InsertionMode.IN_BODY:
          case InsertionMode.IN_CAPTION:
          case InsertionMode.IN_CELL:
          case InsertionMode.IN_TEMPLATE: {
            characterInBody(this, token);
            break;
          }
          case InsertionMode.TEXT:
          case InsertionMode.IN_SELECT:
          case InsertionMode.IN_SELECT_IN_TABLE: {
            this._insertCharacters(token);
            break;
          }
          case InsertionMode.IN_TABLE:
          case InsertionMode.IN_TABLE_BODY:
          case InsertionMode.IN_ROW: {
            characterInTable(this, token);
            break;
          }
          case InsertionMode.IN_TABLE_TEXT: {
            characterInTableText(this, token);
            break;
          }
          case InsertionMode.IN_COLUMN_GROUP: {
            tokenInColumnGroup(this, token);
            break;
          }
          case InsertionMode.AFTER_BODY: {
            tokenAfterBody(this, token);
            break;
          }
          case InsertionMode.AFTER_AFTER_BODY: {
            tokenAfterAfterBody(this, token);
            break;
          }
          default:
        }
      }
      /** @internal */
      onNullCharacter(token) {
        this.skipNextNewLine = false;
        if (this.tokenizer.inForeignNode) {
          nullCharacterInForeignContent(this, token);
          return;
        }
        switch (this.insertionMode) {
          case InsertionMode.INITIAL: {
            tokenInInitialMode(this, token);
            break;
          }
          case InsertionMode.BEFORE_HTML: {
            tokenBeforeHtml(this, token);
            break;
          }
          case InsertionMode.BEFORE_HEAD: {
            tokenBeforeHead(this, token);
            break;
          }
          case InsertionMode.IN_HEAD: {
            tokenInHead(this, token);
            break;
          }
          case InsertionMode.IN_HEAD_NO_SCRIPT: {
            tokenInHeadNoScript(this, token);
            break;
          }
          case InsertionMode.AFTER_HEAD: {
            tokenAfterHead(this, token);
            break;
          }
          case InsertionMode.TEXT: {
            this._insertCharacters(token);
            break;
          }
          case InsertionMode.IN_TABLE:
          case InsertionMode.IN_TABLE_BODY:
          case InsertionMode.IN_ROW: {
            characterInTable(this, token);
            break;
          }
          case InsertionMode.IN_COLUMN_GROUP: {
            tokenInColumnGroup(this, token);
            break;
          }
          case InsertionMode.AFTER_BODY: {
            tokenAfterBody(this, token);
            break;
          }
          case InsertionMode.AFTER_AFTER_BODY: {
            tokenAfterAfterBody(this, token);
            break;
          }
          default:
        }
      }
      /** @internal */
      onComment(token) {
        this.skipNextNewLine = false;
        if (this.currentNotInHTML) {
          appendComment(this, token);
          return;
        }
        switch (this.insertionMode) {
          case InsertionMode.INITIAL:
          case InsertionMode.BEFORE_HTML:
          case InsertionMode.BEFORE_HEAD:
          case InsertionMode.IN_HEAD:
          case InsertionMode.IN_HEAD_NO_SCRIPT:
          case InsertionMode.AFTER_HEAD:
          case InsertionMode.IN_BODY:
          case InsertionMode.IN_TABLE:
          case InsertionMode.IN_CAPTION:
          case InsertionMode.IN_COLUMN_GROUP:
          case InsertionMode.IN_TABLE_BODY:
          case InsertionMode.IN_ROW:
          case InsertionMode.IN_CELL:
          case InsertionMode.IN_SELECT:
          case InsertionMode.IN_SELECT_IN_TABLE:
          case InsertionMode.IN_TEMPLATE:
          case InsertionMode.IN_FRAMESET:
          case InsertionMode.AFTER_FRAMESET: {
            appendComment(this, token);
            break;
          }
          case InsertionMode.IN_TABLE_TEXT: {
            tokenInTableText(this, token);
            break;
          }
          case InsertionMode.AFTER_BODY: {
            appendCommentToRootHtmlElement(this, token);
            break;
          }
          case InsertionMode.AFTER_AFTER_BODY:
          case InsertionMode.AFTER_AFTER_FRAMESET: {
            appendCommentToDocument(this, token);
            break;
          }
          default:
        }
      }
      /** @internal */
      onDoctype(token) {
        this.skipNextNewLine = false;
        switch (this.insertionMode) {
          case InsertionMode.INITIAL: {
            doctypeInInitialMode(this, token);
            break;
          }
          case InsertionMode.BEFORE_HEAD:
          case InsertionMode.IN_HEAD:
          case InsertionMode.IN_HEAD_NO_SCRIPT:
          case InsertionMode.AFTER_HEAD: {
            this._err(token, ERR.misplacedDoctype);
            break;
          }
          case InsertionMode.IN_TABLE_TEXT: {
            tokenInTableText(this, token);
            break;
          }
          default:
        }
      }
      /** @internal */
      onStartTag(token) {
        this.skipNextNewLine = false;
        this.currentToken = token;
        this._processStartTag(token);
        if (token.selfClosing && !token.ackSelfClosing) {
          this._err(token, ERR.nonVoidHtmlElementStartTagWithTrailingSolidus);
        }
      }
      /**
       * Processes a given start tag.
       *
       * `onStartTag` checks if a self-closing tag was recognized. When a token
       * is moved inbetween multiple insertion modes, this check for self-closing
       * could lead to false positives. To avoid this, `_processStartTag` is used
       * for nested calls.
       *
       * @param token The token to process.
       * @protected
       */
      _processStartTag(token) {
        if (this.shouldProcessStartTagTokenInForeignContent(token)) {
          startTagInForeignContent(this, token);
        } else {
          this._startTagOutsideForeignContent(token);
        }
      }
      /** @protected */
      _startTagOutsideForeignContent(token) {
        switch (this.insertionMode) {
          case InsertionMode.INITIAL: {
            tokenInInitialMode(this, token);
            break;
          }
          case InsertionMode.BEFORE_HTML: {
            startTagBeforeHtml(this, token);
            break;
          }
          case InsertionMode.BEFORE_HEAD: {
            startTagBeforeHead(this, token);
            break;
          }
          case InsertionMode.IN_HEAD: {
            startTagInHead(this, token);
            break;
          }
          case InsertionMode.IN_HEAD_NO_SCRIPT: {
            startTagInHeadNoScript(this, token);
            break;
          }
          case InsertionMode.AFTER_HEAD: {
            startTagAfterHead(this, token);
            break;
          }
          case InsertionMode.IN_BODY: {
            startTagInBody(this, token);
            break;
          }
          case InsertionMode.IN_TABLE: {
            startTagInTable(this, token);
            break;
          }
          case InsertionMode.IN_TABLE_TEXT: {
            tokenInTableText(this, token);
            break;
          }
          case InsertionMode.IN_CAPTION: {
            startTagInCaption(this, token);
            break;
          }
          case InsertionMode.IN_COLUMN_GROUP: {
            startTagInColumnGroup(this, token);
            break;
          }
          case InsertionMode.IN_TABLE_BODY: {
            startTagInTableBody(this, token);
            break;
          }
          case InsertionMode.IN_ROW: {
            startTagInRow(this, token);
            break;
          }
          case InsertionMode.IN_CELL: {
            startTagInCell(this, token);
            break;
          }
          case InsertionMode.IN_SELECT: {
            startTagInSelect(this, token);
            break;
          }
          case InsertionMode.IN_SELECT_IN_TABLE: {
            startTagInSelectInTable(this, token);
            break;
          }
          case InsertionMode.IN_TEMPLATE: {
            startTagInTemplate(this, token);
            break;
          }
          case InsertionMode.AFTER_BODY: {
            startTagAfterBody(this, token);
            break;
          }
          case InsertionMode.IN_FRAMESET: {
            startTagInFrameset(this, token);
            break;
          }
          case InsertionMode.AFTER_FRAMESET: {
            startTagAfterFrameset(this, token);
            break;
          }
          case InsertionMode.AFTER_AFTER_BODY: {
            startTagAfterAfterBody(this, token);
            break;
          }
          case InsertionMode.AFTER_AFTER_FRAMESET: {
            startTagAfterAfterFrameset(this, token);
            break;
          }
          default:
        }
      }
      /** @internal */
      onEndTag(token) {
        this.skipNextNewLine = false;
        this.currentToken = token;
        if (this.currentNotInHTML) {
          endTagInForeignContent(this, token);
        } else {
          this._endTagOutsideForeignContent(token);
        }
      }
      /** @protected */
      _endTagOutsideForeignContent(token) {
        switch (this.insertionMode) {
          case InsertionMode.INITIAL: {
            tokenInInitialMode(this, token);
            break;
          }
          case InsertionMode.BEFORE_HTML: {
            endTagBeforeHtml(this, token);
            break;
          }
          case InsertionMode.BEFORE_HEAD: {
            endTagBeforeHead(this, token);
            break;
          }
          case InsertionMode.IN_HEAD: {
            endTagInHead(this, token);
            break;
          }
          case InsertionMode.IN_HEAD_NO_SCRIPT: {
            endTagInHeadNoScript(this, token);
            break;
          }
          case InsertionMode.AFTER_HEAD: {
            endTagAfterHead(this, token);
            break;
          }
          case InsertionMode.IN_BODY: {
            endTagInBody(this, token);
            break;
          }
          case InsertionMode.TEXT: {
            endTagInText(this, token);
            break;
          }
          case InsertionMode.IN_TABLE: {
            endTagInTable(this, token);
            break;
          }
          case InsertionMode.IN_TABLE_TEXT: {
            tokenInTableText(this, token);
            break;
          }
          case InsertionMode.IN_CAPTION: {
            endTagInCaption(this, token);
            break;
          }
          case InsertionMode.IN_COLUMN_GROUP: {
            endTagInColumnGroup(this, token);
            break;
          }
          case InsertionMode.IN_TABLE_BODY: {
            endTagInTableBody(this, token);
            break;
          }
          case InsertionMode.IN_ROW: {
            endTagInRow(this, token);
            break;
          }
          case InsertionMode.IN_CELL: {
            endTagInCell(this, token);
            break;
          }
          case InsertionMode.IN_SELECT: {
            endTagInSelect(this, token);
            break;
          }
          case InsertionMode.IN_SELECT_IN_TABLE: {
            endTagInSelectInTable(this, token);
            break;
          }
          case InsertionMode.IN_TEMPLATE: {
            endTagInTemplate(this, token);
            break;
          }
          case InsertionMode.AFTER_BODY: {
            endTagAfterBody(this, token);
            break;
          }
          case InsertionMode.IN_FRAMESET: {
            endTagInFrameset(this, token);
            break;
          }
          case InsertionMode.AFTER_FRAMESET: {
            endTagAfterFrameset(this, token);
            break;
          }
          case InsertionMode.AFTER_AFTER_BODY: {
            tokenAfterAfterBody(this, token);
            break;
          }
          default:
        }
      }
      /** @internal */
      onEof(token) {
        switch (this.insertionMode) {
          case InsertionMode.INITIAL: {
            tokenInInitialMode(this, token);
            break;
          }
          case InsertionMode.BEFORE_HTML: {
            tokenBeforeHtml(this, token);
            break;
          }
          case InsertionMode.BEFORE_HEAD: {
            tokenBeforeHead(this, token);
            break;
          }
          case InsertionMode.IN_HEAD: {
            tokenInHead(this, token);
            break;
          }
          case InsertionMode.IN_HEAD_NO_SCRIPT: {
            tokenInHeadNoScript(this, token);
            break;
          }
          case InsertionMode.AFTER_HEAD: {
            tokenAfterHead(this, token);
            break;
          }
          case InsertionMode.IN_BODY:
          case InsertionMode.IN_TABLE:
          case InsertionMode.IN_CAPTION:
          case InsertionMode.IN_COLUMN_GROUP:
          case InsertionMode.IN_TABLE_BODY:
          case InsertionMode.IN_ROW:
          case InsertionMode.IN_CELL:
          case InsertionMode.IN_SELECT:
          case InsertionMode.IN_SELECT_IN_TABLE: {
            eofInBody(this, token);
            break;
          }
          case InsertionMode.TEXT: {
            eofInText(this, token);
            break;
          }
          case InsertionMode.IN_TABLE_TEXT: {
            tokenInTableText(this, token);
            break;
          }
          case InsertionMode.IN_TEMPLATE: {
            eofInTemplate(this, token);
            break;
          }
          case InsertionMode.AFTER_BODY:
          case InsertionMode.IN_FRAMESET:
          case InsertionMode.AFTER_FRAMESET:
          case InsertionMode.AFTER_AFTER_BODY:
          case InsertionMode.AFTER_AFTER_FRAMESET: {
            stopParsing(this, token);
            break;
          }
          default:
        }
      }
      /** @internal */
      onWhitespaceCharacter(token) {
        if (this.skipNextNewLine) {
          this.skipNextNewLine = false;
          if (token.chars.charCodeAt(0) === CODE_POINTS.LINE_FEED) {
            if (token.chars.length === 1) {
              return;
            }
            token.chars = token.chars.substr(1);
          }
        }
        if (this.tokenizer.inForeignNode) {
          this._insertCharacters(token);
          return;
        }
        switch (this.insertionMode) {
          case InsertionMode.IN_HEAD:
          case InsertionMode.IN_HEAD_NO_SCRIPT:
          case InsertionMode.AFTER_HEAD:
          case InsertionMode.TEXT:
          case InsertionMode.IN_COLUMN_GROUP:
          case InsertionMode.IN_SELECT:
          case InsertionMode.IN_SELECT_IN_TABLE:
          case InsertionMode.IN_FRAMESET:
          case InsertionMode.AFTER_FRAMESET: {
            this._insertCharacters(token);
            break;
          }
          case InsertionMode.IN_BODY:
          case InsertionMode.IN_CAPTION:
          case InsertionMode.IN_CELL:
          case InsertionMode.IN_TEMPLATE:
          case InsertionMode.AFTER_BODY:
          case InsertionMode.AFTER_AFTER_BODY:
          case InsertionMode.AFTER_AFTER_FRAMESET: {
            whitespaceCharacterInBody(this, token);
            break;
          }
          case InsertionMode.IN_TABLE:
          case InsertionMode.IN_TABLE_BODY:
          case InsertionMode.IN_ROW: {
            characterInTable(this, token);
            break;
          }
          case InsertionMode.IN_TABLE_TEXT: {
            whitespaceCharacterInTableText(this, token);
            break;
          }
          default:
        }
      }
    };
    TABLE_VOID_ELEMENTS = /* @__PURE__ */ new Set([TAG_ID.CAPTION, TAG_ID.COL, TAG_ID.COLGROUP, TAG_ID.TBODY, TAG_ID.TD, TAG_ID.TFOOT, TAG_ID.TH, TAG_ID.THEAD, TAG_ID.TR]);
  }
});

// node_modules/entities/dist/esm/escape.js
function getEscaper(regex, map) {
  return function escape(data) {
    let match;
    let lastIndex = 0;
    let result = "";
    while (match = regex.exec(data)) {
      if (lastIndex !== match.index) {
        result += data.substring(lastIndex, match.index);
      }
      result += map.get(match[0].charCodeAt(0));
      lastIndex = match.index + 1;
    }
    return result + data.substring(lastIndex);
  };
}
var getCodePoint, escapeAttribute, escapeText;
var init_escape = __esm({
  "node_modules/entities/dist/esm/escape.js"() {
    getCodePoint = // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    String.prototype.codePointAt == null ? (c, index) => (c.charCodeAt(index) & 64512) === 55296 ? (c.charCodeAt(index) - 55296) * 1024 + c.charCodeAt(index + 1) - 56320 + 65536 : c.charCodeAt(index) : (
      // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
      (input, index) => input.codePointAt(index)
    );
    escapeAttribute = /* @__PURE__ */ getEscaper(/["&\u00A0]/g, /* @__PURE__ */ new Map([
      [34, "&quot;"],
      [38, "&amp;"],
      [160, "&nbsp;"]
    ]));
    escapeText = /* @__PURE__ */ getEscaper(/[&<>\u00A0]/g, /* @__PURE__ */ new Map([
      [38, "&amp;"],
      [60, "&lt;"],
      [62, "&gt;"],
      [160, "&nbsp;"]
    ]));
  }
});

// node_modules/parse5/dist/serializer/index.js
function isVoidElement(node, options) {
  return options.treeAdapter.isElementNode(node) && options.treeAdapter.getNamespaceURI(node) === NS.HTML && VOID_ELEMENTS.has(options.treeAdapter.getTagName(node));
}
function serialize(node, options) {
  const opts = { ...defaultOpts, ...options };
  if (isVoidElement(node, opts)) {
    return "";
  }
  return serializeChildNodes(node, opts);
}
function serializeChildNodes(parentNode, options) {
  let html = "";
  const container = options.treeAdapter.isElementNode(parentNode) && options.treeAdapter.getTagName(parentNode) === TAG_NAMES.TEMPLATE && options.treeAdapter.getNamespaceURI(parentNode) === NS.HTML ? options.treeAdapter.getTemplateContent(parentNode) : parentNode;
  const childNodes = options.treeAdapter.getChildNodes(container);
  if (childNodes) {
    for (const currentNode of childNodes) {
      html += serializeNode(currentNode, options);
    }
  }
  return html;
}
function serializeNode(node, options) {
  if (options.treeAdapter.isElementNode(node)) {
    return serializeElement(node, options);
  }
  if (options.treeAdapter.isTextNode(node)) {
    return serializeTextNode(node, options);
  }
  if (options.treeAdapter.isCommentNode(node)) {
    return serializeCommentNode(node, options);
  }
  if (options.treeAdapter.isDocumentTypeNode(node)) {
    return serializeDocumentTypeNode(node, options);
  }
  return "";
}
function serializeElement(node, options) {
  const tn = options.treeAdapter.getTagName(node);
  return `<${tn}${serializeAttributes(node, options)}>${isVoidElement(node, options) ? "" : `${serializeChildNodes(node, options)}</${tn}>`}`;
}
function serializeAttributes(node, { treeAdapter }) {
  let html = "";
  for (const attr of treeAdapter.getAttrList(node)) {
    html += " ";
    if (attr.namespace) {
      switch (attr.namespace) {
        case NS.XML: {
          html += `xml:${attr.name}`;
          break;
        }
        case NS.XMLNS: {
          if (attr.name !== "xmlns") {
            html += "xmlns:";
          }
          html += attr.name;
          break;
        }
        case NS.XLINK: {
          html += `xlink:${attr.name}`;
          break;
        }
        default: {
          html += `${attr.prefix}:${attr.name}`;
        }
      }
    } else {
      html += attr.name;
    }
    html += `="${escapeAttribute(attr.value)}"`;
  }
  return html;
}
function serializeTextNode(node, options) {
  const { treeAdapter } = options;
  const content = treeAdapter.getTextNodeContent(node);
  const parent = treeAdapter.getParentNode(node);
  const parentTn = parent && treeAdapter.isElementNode(parent) && treeAdapter.getTagName(parent);
  return parentTn && treeAdapter.getNamespaceURI(parent) === NS.HTML && hasUnescapedText(parentTn, options.scriptingEnabled) ? content : escapeText(content);
}
function serializeCommentNode(node, { treeAdapter }) {
  return `<!--${treeAdapter.getCommentNodeContent(node)}-->`;
}
function serializeDocumentTypeNode(node, { treeAdapter }) {
  return `<!DOCTYPE ${treeAdapter.getDocumentTypeNodeName(node)}>`;
}
var VOID_ELEMENTS, defaultOpts;
var init_serializer = __esm({
  "node_modules/parse5/dist/serializer/index.js"() {
    init_html();
    init_escape();
    init_default();
    VOID_ELEMENTS = /* @__PURE__ */ new Set([
      TAG_NAMES.AREA,
      TAG_NAMES.BASE,
      TAG_NAMES.BASEFONT,
      TAG_NAMES.BGSOUND,
      TAG_NAMES.BR,
      TAG_NAMES.COL,
      TAG_NAMES.EMBED,
      TAG_NAMES.FRAME,
      TAG_NAMES.HR,
      TAG_NAMES.IMG,
      TAG_NAMES.INPUT,
      TAG_NAMES.KEYGEN,
      TAG_NAMES.LINK,
      TAG_NAMES.META,
      TAG_NAMES.PARAM,
      TAG_NAMES.SOURCE,
      TAG_NAMES.TRACK,
      TAG_NAMES.WBR
    ]);
    defaultOpts = { treeAdapter: defaultTreeAdapter, scriptingEnabled: true };
  }
});

// node_modules/parse5/dist/index.js
function parse(html, options) {
  return Parser.parse(html, options);
}
var init_dist = __esm({
  "node_modules/parse5/dist/index.js"() {
    init_parser();
    init_default();
    init_parser();
    init_serializer();
    init_error_codes();
    init_foreign_content();
    init_html();
    init_token();
    init_tokenizer();
  }
});

// src/parsing/sourceIndex.ts
function styleAttrHides(styleValue) {
  for (const decl of styleValue.split(";")) {
    const idx = decl.indexOf(":");
    if (idx < 0) continue;
    const prop = decl.slice(0, idx).trim().toLowerCase();
    const value = decl.slice(idx + 1).trim().toLowerCase();
    if (prop === "display" && value === "none") return true;
    if (prop === "visibility" && value === "hidden") return true;
  }
  return false;
}
function tokenizeStartTag(source, tagStart, tagEnd) {
  const tokens = [];
  let i = tagStart + 1;
  while (i < tagEnd && !/[\s/>]/.test(source[i])) i++;
  while (i < tagEnd) {
    while (i < tagEnd && /\s/.test(source[i])) i++;
    if (i >= tagEnd || source[i] === ">" || source[i] === "/") break;
    const nameStart = i;
    while (i < tagEnd && !/[\s=>]/.test(source[i])) i++;
    if (i === nameStart) {
      i++;
      continue;
    }
    const nameEnd = i;
    let j = i;
    while (j < tagEnd && /\s/.test(source[j])) j++;
    if (source[j] === "=") {
      j++;
      while (j < tagEnd && /\s/.test(source[j])) j++;
      const q = source[j];
      if (q === '"' || q === "'") {
        let k = j + 1;
        while (k < tagEnd && source[k] !== q) k++;
        tokens.push({
          name: source.slice(nameStart, nameEnd).toLowerCase(),
          nameStart,
          nameEnd,
          hasEqual: true,
          valueStart: j + 1,
          valueEnd: Math.min(k, tagEnd),
          quote: q
        });
        i = Math.min(k + 1, tagEnd);
      } else {
        let k = j;
        while (k < tagEnd && !/[\s>]/.test(source[k])) k++;
        tokens.push({
          name: source.slice(nameStart, nameEnd).toLowerCase(),
          nameStart,
          nameEnd,
          hasEqual: true,
          valueStart: j,
          valueEnd: k,
          quote: ""
        });
        i = k;
      }
    } else {
      tokens.push({
        name: source.slice(nameStart, nameEnd).toLowerCase(),
        nameStart,
        nameEnd,
        hasEqual: false,
        valueStart: nameEnd,
        valueEnd: nameEnd,
        quote: ""
      });
      i = nameEnd;
    }
  }
  return tokens;
}
var EXCLUDED, SourceIndex;
var init_sourceIndex = __esm({
  "src/parsing/sourceIndex.ts"() {
    "use strict";
    init_dist();
    EXCLUDED = /* @__PURE__ */ new Set(["script", "style", "noscript", "template", "textarea", "select", "option", "svg", "math", "title", "head", "iframe", "object", "embed", "canvas"]);
    SourceIndex = class {
      constructor(source) {
        this.source = source;
        this.nodes = [];
        this.build();
      }
      get root() {
        return this.nodes[0];
      }
      node(id) {
        return this.nodes[id];
      }
      elements(tag) {
        return this.nodes.filter((n) => n.kind === "element" && (!tag || n.tag === tag));
      }
      textNodes() {
        return this.nodes.filter((n) => n.kind === "text");
      }
      element(node, parentId, ancestorsExcluded, ancestorsHidden, depth) {
        const loc = node.sourceCodeLocation ?? null;
        const tag = (node.tagName ?? "").toLowerCase();
        const synthetic = !loc;
        const start = loc?.startOffset ?? -1, end = loc?.endOffset ?? -1;
        const styleAttr = node.attrs?.find((a) => a.name === "style")?.value ?? "";
        const selfHidden = !!(ancestorsHidden || node.attrs?.some((a) => a.name === "hidden") || !!styleAttr && styleAttrHides(styleAttr) || tag === "input" && node.attrs?.some((a) => a.name === "type" && a.value?.toLowerCase() === "hidden"));
        const el = {
          kind: "element",
          id: this.nodes.length,
          tag,
          start,
          end,
          startTagStart: loc?.startTag?.startOffset ?? start,
          startTagEnd: loc?.startTag?.endOffset ?? end,
          endTagStart: loc?.endTag?.startOffset ?? null,
          endTagEnd: loc?.endTag?.endOffset ?? null,
          attrs: [],
          parentId,
          childIds: [],
          hidden: selfHidden,
          excluded: ancestorsExcluded || EXCLUDED.has(tag),
          synthetic
        };
        this.nodes.push(el);
        if (loc && node.attrs && el.startTagEnd > el.startTagStart) {
          const tokens = tokenizeStartTag(this.source, el.startTagStart, el.startTagEnd);
          const byName = /* @__PURE__ */ new Map();
          for (const t of tokens) if (!byName.has(t.name)) byName.set(t.name, t);
          for (const a of node.attrs) {
            const loc2 = loc.attrs?.[a.name];
            const t = byName.get(a.name);
            if (t) {
              el.attrs.push({
                name: a.name,
                value: a.value,
                start: t.nameStart,
                end: t.nameEnd,
                hasEqual: t.hasEqual,
                valueStart: t.valueStart,
                valueEnd: t.valueEnd,
                quote: t.quote
              });
            } else if (loc2) {
              el.attrs.push({
                name: a.name,
                value: a.value,
                start: loc2.startOffset,
                end: loc2.endOffset,
                hasEqual: false,
                valueStart: loc2.endOffset,
                valueEnd: loc2.endOffset,
                quote: ""
              });
            }
          }
        }
        const selfExcluded = el.excluded;
        for (const child of node.childNodes ?? []) {
          if (child.nodeName === "#text") {
            const id = this.text(child, el.id, selfExcluded, selfHidden);
            if (id !== null) el.childIds.push(id);
          } else if (child.nodeName === "#comment") {
            const cloc = child.sourceCodeLocation;
            const id = this.nodes.length;
            this.nodes.push({ kind: "comment", id, start: cloc?.startOffset ?? -1, end: cloc?.endOffset ?? -1, parentId: el.id });
            el.childIds.push(id);
          } else el.childIds.push(this.element(child, el.id, selfExcluded, selfHidden, depth + 1).id);
        }
        return el;
      }
      // 返回登记后的节点 id;合成节点无源位置时不登记,返回 null。
      // childIds 必须真正填充:大纲标题文字、<style> 内 CSS 重写、<picture> 检测都依赖它
      // (audit/复检 §3.16/§3.18:此前恒为空数组,三处功能同时失效)。
      text(node, parentId, excluded2, hidden) {
        const loc = node.sourceCodeLocation;
        if (!loc) return null;
        const raw = this.source.slice(loc.startOffset, loc.endOffset);
        const id = this.nodes.length;
        this.nodes.push({
          kind: "text",
          id,
          start: loc.startOffset,
          end: loc.endOffset,
          raw,
          value: node.value ?? raw,
          parentId,
          hidden,
          excluded: excluded2
        });
        return id;
      }
      build() {
        const doc = parse(this.source, { sourceCodeLocationInfo: true });
        this.element(doc, null, false, false, 0);
      }
    };
  }
});

// src/parsing/escape.ts
function escapeAttrValue(s, quote) {
  let out = s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  if (quote === "") {
    out = out.replace(/[\t\n\r\f >]/g, (c) => {
      if (c === "	") return "&#9;";
      if (c === "\n") return "&#10;";
      if (c === "\r") return "&#13;";
      if (c === "\f") return "&#12;";
      if (c === ">") return "&gt;";
      return "&#32;";
    });
  }
  return out;
}
function escapeAttrPath(s, quote) {
  if (quote !== "") return quote === '"' ? s.replace(/"/g, "&quot;") : s.replace(/'/g, "&#39;");
  return s.replace(/[\t\n\r\f >]/g, (c) => {
    if (c === "	") return "&#9;";
    if (c === "\n") return "&#10;";
    if (c === "\r") return "&#13;";
    if (c === "\f") return "&#12;";
    if (c === ">") return "&gt;";
    return "&#32;";
  });
}
var escapeText2;
var init_escape2 = __esm({
  "src/parsing/escape.ts"() {
    "use strict";
    escapeText2 = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
});

// src/parsing/url.ts
function classifyRef(ref) {
  if (!ref) return "empty";
  if (ref.startsWith("#")) return "anchor";
  if (ref.startsWith("//")) return "protocol-relative";
  if (ref.startsWith("/")) return "vault-root";
  if (SCHEME.test(ref)) return "absolute";
  return "relative";
}
function isRemoteRef(ref) {
  const kind = classifyRef(ref);
  return kind === "empty" || kind === "anchor" || kind === "absolute" || kind === "protocol-relative" || kind === "vault-root";
}
function normJoin(dir, rel) {
  const parts = dir ? dir.split("/") : [];
  for (const part of rel.split("/")) {
    if (part === "." || part === "") continue;
    if (part === "..") {
      parts.pop();
      continue;
    }
    parts.push(part);
  }
  return parts.join("/");
}
function dirOf(path) {
  return path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";
}
function escapesVaultRoot(dir, rel) {
  let depth = dir ? dir.split("/").filter(Boolean).length : 0;
  for (const part of rel.split("/")) {
    if (part === "." || part === "") continue;
    if (part === "..") {
      if (depth === 0) return true;
      depth--;
      continue;
    }
    depth++;
  }
  return false;
}
function resolveVaultRef(pageDir, ref) {
  const clean = stripQuery(ref).trim();
  if (classifyRef(clean) === "vault-root") return clean.replace(/^\/+/, "");
  return normJoin(pageDir, clean);
}
function srcsetCandidates(value) {
  const out = [];
  let i = 0;
  while (true) {
    while (i < value.length && (value[i] === "," || isAsciiWs(value[i]))) i++;
    if (i >= value.length) break;
    const start = i;
    while (i < value.length && !isAsciiWs(value[i])) i++;
    let end = i;
    let url = value.slice(start, end);
    if (url.endsWith(",")) {
      url = url.slice(0, -1);
      end--;
      out.push({ url, start, end });
      break;
    }
    out.push({ url, start, end });
    let depth = 0;
    while (i < value.length) {
      const ch = value[i];
      if (ch === "(") depth++;
      else if (ch === ")") depth = Math.max(0, depth - 1);
      else if (ch === "," && depth === 0) break;
      i++;
    }
  }
  return out;
}
function srcsetUrls(value) {
  return srcsetCandidates(value).map((c) => c.url).filter(Boolean);
}
var SCHEME, stripQuery, isAsciiWs, isDirRef;
var init_url = __esm({
  "src/parsing/url.ts"() {
    "use strict";
    SCHEME = /^[a-z][a-z0-9+.-]*:/i;
    stripQuery = (ref) => ref.split("#")[0].split("?")[0];
    isAsciiWs = (ch) => ch === " " || ch === "	" || ch === "\n" || ch === "\f" || ch === "\r";
    isDirRef = (ref) => stripQuery(ref).trim().endsWith("/");
  }
});

// src/services/saveAsPlan.ts
function planSaveAs(source, sourcePath, targetDir, rebase) {
  const index = new SourceIndex(source);
  const patches = [];
  const rewritten = [];
  const unresolved = [];
  const sourceDir = dirOf(sourcePath);
  const done = () => patches.length ? { content: applyPatches(source, patches.sort((a, b) => b.start - a.start)), rewritten, unresolved } : { content: source, rewritten, unresolved };
  if (!rebase || targetDir === sourceDir) return { content: source, rewritten, unresolved };
  const slice = (start, end) => source.slice(start, end);
  const baseAttr = findBaseHref(index);
  if (baseAttr) {
    const raw = slice(baseAttr.valueStart, baseAttr.valueEnd);
    if (isRemoteRef(raw)) return { content: source, rewritten, unresolved };
    const next = rebaseRef(raw, sourceDir, targetDir);
    if (next && next !== raw) {
      patches.push({ start: baseAttr.valueStart, end: baseAttr.valueEnd, expected: raw, replacement: escapeAttrPath(next, baseAttr.quote) });
      rewritten.push({ from: raw, to: next });
    }
    return done();
  }
  for (const el of index.nodes) {
    if (el.kind !== "element") continue;
    for (const attr of el.attrs) {
      if (!REWRITE_ATTRS.has(attr.name) || !attr.hasEqual) continue;
      const raw = slice(attr.valueStart, attr.valueEnd);
      const next = rebaseRef(raw, sourceDir, targetDir);
      if (next === null) {
        if (!isRemoteRef(raw)) unresolved.push(raw);
        continue;
      }
      if (next === raw) continue;
      patches.push({
        start: attr.valueStart,
        end: attr.valueEnd,
        expected: raw,
        replacement: escapeAttrPath(next, attr.quote)
      });
      rewritten.push({ from: raw, to: next });
    }
  }
  for (const el of index.nodes) {
    if (el.kind !== "element") continue;
    for (const attr of el.attrs) {
      if (attr.name !== "srcset" || !attr.hasEqual) continue;
      rewriteSrcset(slice(attr.valueStart, attr.valueEnd), attr.valueStart, sourceDir, targetDir, patches, rewritten, unresolved);
    }
  }
  for (const el of index.nodes) {
    if (el.kind !== "element") continue;
    if (el.tag === "style" && el.childIds.length) {
      const textNode = index.nodes[el.childIds[0]];
      if (textNode?.kind === "text") rewriteCssUrls(textNode.raw, textNode.start, sourceDir, targetDir, patches, rewritten, unresolved);
    }
    for (const attr of el.attrs) {
      if (attr.name !== "style" || !attr.hasEqual) continue;
      rewriteCssUrls(slice(attr.valueStart, attr.valueEnd), attr.valueStart, sourceDir, targetDir, patches, rewritten, unresolved);
    }
  }
  return done();
}
function findBaseHref(index) {
  for (const n of index.nodes) {
    if (n.kind !== "element" || n.tag !== "base") continue;
    const attr = n.attrs.find((a) => a.name === "href" && a.hasEqual);
    if (attr) return { valueStart: attr.valueStart, valueEnd: attr.valueEnd, quote: attr.quote };
  }
  return null;
}
function rebaseRef(raw, sourceDir, targetDir) {
  if (isRemoteRef(raw)) return null;
  const path = stripQuery(raw).trim();
  if (!path) return raw;
  const suffix = raw.slice(stripQuery(raw).length);
  const dir = isDirRef(raw);
  if (escapesVaultRoot(sourceDir, path)) return null;
  const abs = normJoin(sourceDir, path);
  if (!abs) return null;
  const rel = relPathFrom(targetDir, abs);
  if (!rel) return null;
  return rel + (dir ? "/" : "") + suffix;
}
function rewriteSrcset(value, valueStart, sourceDir, targetDir, patches, rewritten, unresolved) {
  for (const cand of srcsetCandidates(value)) {
    const url = cand.url;
    if (!url) continue;
    const next = rebaseRef(url, sourceDir, targetDir);
    if (next === null) {
      if (!isRemoteRef(url)) unresolved.push(url);
      continue;
    }
    if (next === url) continue;
    if (/["'\s]/.test(next)) {
      unresolved.push(url);
      continue;
    }
    patches.push({ start: valueStart + cand.start, end: valueStart + cand.end, expected: url, replacement: next });
    rewritten.push({ from: url, to: next });
  }
}
function rewriteCssUrls(css, baseOffset, sourceDir, targetDir, patches, rewritten, unresolved) {
  const re = /url\(\s*['"]?([^'")]+)/gi;
  let m;
  while ((m = re.exec(css)) !== null) {
    const raw = m[1];
    if (isRemoteRef(raw)) continue;
    const next = rebaseRef(raw, sourceDir, targetDir);
    if (next === null) {
      unresolved.push(raw);
      continue;
    }
    if (/["'\s]/.test(next)) {
      unresolved.push(raw);
      continue;
    }
    if (next === raw) continue;
    const pathStart = m.index + (m[0].length - raw.length);
    patches.push({ start: baseOffset + pathStart, end: baseOffset + pathStart + raw.length, expected: raw, replacement: next });
    rewritten.push({ from: raw, to: next });
  }
}
function relPathFrom(fromDir, toPath) {
  if (!toPath || toPath.startsWith("/")) return null;
  const from = fromDir ? fromDir.split("/") : [];
  const to = toPath.split("/");
  let i = 0;
  while (i < from.length && i < to.length && from[i] === to[i]) i++;
  const ups = Array.from({ length: from.length - i }, () => "..");
  const rest = to.slice(i);
  return [...ups, ...rest].join("/") || to[to.length - 1];
}
var REWRITE_ATTRS;
var init_saveAsPlan = __esm({
  "src/services/saveAsPlan.ts"() {
    "use strict";
    init_sourceIndex();
    init_patch();
    init_escape2();
    init_url();
    REWRITE_ATTRS = /* @__PURE__ */ new Set(["src", "href", "poster"]);
  }
});

// src/services/saveService.ts
var saveService_exports = {};
__export(saveService_exports, {
  SaveAsService: () => SaveAsService,
  planSaveAs: () => planSaveAs
});
var import_obsidian5, SaveAsService;
var init_saveService = __esm({
  "src/services/saveService.ts"() {
    "use strict";
    import_obsidian5 = require("obsidian");
    init_saveAsPlan();
    SaveAsService = class {
      constructor(app, t) {
        this.app = app;
        this.t = t;
      }
      uniquePath(dir, base) {
        let stem = dir ? `${dir}/${base}` : base;
        let path = `${stem}.html`;
        let n = 1;
        while (this.app.vault.getAbstractFileByPath(path)) path = `${stem}-${n++}.html`;
        return path;
      }
      async save(source, sourcePath, targetPath) {
        try {
          const dir = targetPath.includes("/") ? targetPath.slice(0, targetPath.lastIndexOf("/")) : "";
          if (dir && !this.app.vault.getAbstractFileByPath(dir)) {
            await this.app.vault.createFolder(dir).catch(async () => {
              await this.app.vault.adapter.mkdir(dir);
            });
          }
          const existing = this.app.vault.getAbstractFileByPath(targetPath);
          if (existing instanceof import_obsidian5.TFile) await this.app.vault.modify(existing, source);
          else await this.app.vault.create(targetPath, source);
          const f = this.app.vault.getAbstractFileByPath(targetPath);
          return f instanceof import_obsidian5.TFile ? f : null;
        } catch (e) {
          console.error(e);
          new import_obsidian5.Notice(this.t("noticeSaveFailed"));
          return null;
        }
      }
      defaultDir(file) {
        return file.parent?.path && file.parent instanceof import_obsidian5.TFolder && file.parent.path !== "/" ? file.parent.path : "";
      }
    };
  }
});

// src/views/sourceEditor.ts
var sourceEditor_exports = {};
__export(sourceEditor_exports, {
  SourceEditor: () => SourceEditor
});
var SourceEditor;
var init_sourceEditor = __esm({
  "src/views/sourceEditor.ts"() {
    "use strict";
    SourceEditor = class {
      constructor(opts) {
        this.view = null;
        this.composing = false;
        this.opts = opts;
        this.mount();
      }
      mount() {
        const viewMod = require("@codemirror/view");
        const stateMod = require("@codemirror/state");
        const extensions = [];
        if (this.opts.lineNumbers && viewMod.lineNumbers) extensions.push(viewMod.lineNumbers());
        if (this.opts.lineWrapping && viewMod.EditorView.lineWrapping) extensions.push(viewMod.EditorView.lineWrapping);
        if (viewMod.EditorView.updateListener) extensions.push(viewMod.EditorView.updateListener.of((u) => {
          if (u.docChanged) this.opts.onDocChanged(u.state.doc.toString());
          else if (u.selection && this.opts.onSelectionChanged) this.opts.onSelectionChanged(u.selection.main.from, u.selection.main.to);
        }));
        const EV = viewMod.EditorView;
        this.view = new EV({ state: stateMod.EditorState.create({ doc: this.opts.doc, extensions }), parent: this.opts.parent });
        const dom = this.view.contentDOM;
        if (dom) {
          dom.addEventListener("compositionstart", () => {
            this.composing = true;
          });
          dom.addEventListener("compositionend", () => {
            this.composing = false;
          });
        }
      }
      // 正在输入法组合中(或编辑器自报组合中)
      isComposing() {
        return this.composing || this.view?.composing === true;
      }
      setDoc(doc) {
        if (!this.view) return;
        const cur = this.view.state.doc.toString();
        if (cur === doc) return;
        this.view.dispatch({ changes: { from: 0, to: cur.length, insert: doc } });
      }
      getDoc() {
        return this.view?.state.doc.toString() ?? "";
      }
      revealOffset(offset) {
        if (!this.view) return;
        const len = this.view.state.doc.length;
        const pos = Math.min(Math.max(0, offset), len);
        this.view.dispatch({ selection: { anchor: pos, head: pos }, scrollIntoView: true });
        this.view.focus();
      }
      getCursorOffset() {
        return this.view?.state.selection.main.head ?? 0;
      }
      destroy() {
        this.view?.destroy();
        this.view = null;
      }
    };
  }
});

// src/core/bytes.ts
function utf8Bytes(text) {
  let n = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0;
    if (cp < 128) n += 1;
    else if (cp < 2048) n += 2;
    else if (cp < 65536) n += 3;
    else n += 4;
  }
  return n;
}
var init_bytes = __esm({
  "src/core/bytes.ts"() {
    "use strict";
  }
});

// src/views/modals.ts
var modals_exports = {};
__export(modals_exports, {
  ConflictModal: () => ConflictModal,
  DraftManagerModal: () => DraftManagerModal,
  RelinkModal: () => RelinkModal,
  SaveAsModal: () => SaveAsModal,
  filePickerModal: () => filePickerModal,
  pickFolderModal: () => pickFolderModal
});
function filePickerModal(app, filter, onPick) {
  const files = app.vault.getFiles().filter(filter);
  class Picker extends import_obsidian8.FuzzySuggestModal {
    getItems() {
      return files;
    }
    getItemText(f) {
      return f.path;
    }
    onChooseItem(f) {
      onPick(f.path);
    }
  }
  new Picker(app).open();
}
function pickFolderModal(app, onPick) {
  const folders = app.vault.getAllLoadedFiles().filter((f) => f instanceof import_obsidian8.TFolder);
  class Picker extends import_obsidian8.FuzzySuggestModal {
    getItems() {
      return folders;
    }
    getItemText(f) {
      return f.path;
    }
    onChooseItem(f) {
      onPick(f.path);
    }
  }
  new Picker(app).open();
}
var import_obsidian8, SaveAsModal, ConflictModal, DraftManagerModal, RelinkModal;
var init_modals = __esm({
  "src/views/modals.ts"() {
    "use strict";
    import_obsidian8 = require("obsidian");
    init_bytes();
    init_schema();
    SaveAsModal = class extends import_obsidian8.Modal {
      constructor(t, file, draftSource, settings, service, onSaved, app) {
        super(app);
        this.t = t;
        this.file = file;
        this.draftSource = draftSource;
        this.settings = settings;
        this.service = service;
        this.onSaved = onSaved;
      }
      onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.createEl("h3", { text: this.t("saveAsTitle") });
        contentEl.createDiv({ cls: "html-atelier-hint", text: this.t("saveAsIsDraft") });
        const nameRow = contentEl.createDiv({ cls: "html-atelier-form" });
        nameRow.createEl("label", { text: this.t("saveAsName") });
        const nameInput = nameRow.createEl("input", { cls: "html-atelier-input", attr: { type: "text", spellcheck: "false" } });
        nameInput.value = `${this.file.basename}-\u526F\u672C`;
        const folderRow = contentEl.createDiv({ cls: "html-atelier-form" });
        folderRow.createEl("label", { text: this.t("saveAsFolder") });
        const folderInput = folderRow.createEl("input", { cls: "html-atelier-input", attr: { type: "text", spellcheck: "false" } });
        folderInput.value = this.service.defaultDir(this.file);
        const rebaseRow = contentEl.createDiv({ cls: "html-atelier-form" });
        const rebaseCheck = rebaseRow.createEl("input", { attr: { type: "checkbox" } });
        rebaseCheck.checked = this.settings().saveAs.rebaseRelativeUrls;
        rebaseRow.createEl("label", { text: this.t("saveAsRebase") });
        const openRow = contentEl.createDiv({ cls: "html-atelier-form" });
        const openCheck = openRow.createEl("input", { attr: { type: "checkbox" } });
        openCheck.checked = this.settings().saveAs.openCopy;
        openRow.createEl("label", { text: this.t("saveAsOpen") });
        const summary = contentEl.createDiv({ cls: "html-atelier-hint" });
        void summary;
        const buttons = contentEl.createDiv({ cls: "html-atelier-btnrow" });
        const cancel = buttons.createEl("button", { attr: { "type": "button" }, text: this.t("actionCancel") });
        cancel.addEventListener("click", () => this.close());
        const save = buttons.createEl("button", { cls: "html-atelier-savebtn", attr: { "type": "button" }, text: this.t("saveAsSave") });
        save.addEventListener("click", () => {
          void (async () => {
            const name = nameInput.value.trim().replace(/\.html?$/i, "");
            if (!name) {
              new import_obsidian8.Notice(this.t("saveAsName"));
              return;
            }
            let dir = folderInput.value.trim().replace(/^\/+|\/+$/g, "");
            let plan;
            try {
              plan = (await Promise.resolve().then(() => (init_saveService(), saveService_exports))).planSaveAs(this.draftSource, this.file.path, dir, rebaseCheck.checked);
            } catch (e) {
              console.error(e);
              new import_obsidian8.Notice(this.t("noticeSaveAsFailed"), 8e3);
              return;
            }
            const target = this.service.uniquePath(dir, name);
            if (plan.unresolved.length) new import_obsidian8.Notice(this.t("saveAsUnresolved", { n: String(plan.unresolved.length) }), 6e3);
            const created = await this.service.save(plan.content, this.file.path, target);
            if (created) {
              new import_obsidian8.Notice(`${this.t("noticeDraftExported", { path: created.path })}`);
              if (openCheck.checked) this.onSaved(created);
              this.close();
            }
          })();
        });
      }
    };
    ConflictModal = class extends import_obsidian8.Modal {
      // commit:把合并结果真正落盘(调用方负责先备份草稿并写 vault),返回写盘结果;
      // adopt:采用磁盘版本(调用方负责清掉被放弃的草稿)。两者都由宿主提供,避免弹窗
      // 自己"宣布已保存"而磁盘没变(审计 round4 BUG 4)。
      constructor(t, file, session, merge, onApplied, commit, adopt, app) {
        super(app);
        this.t = t;
        this.file = file;
        this.session = session;
        this.merge = merge;
        this.onApplied = onApplied;
        this.commit = commit;
        this.adopt = adopt;
        this.chunks = null;
        this.choices = /* @__PURE__ */ new Map();
        // index → 'local'|'remote'|custom text
        this.state = null;
      }
      async onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.createEl("h3", { text: this.t("conflictTitle") });
        const remote = await this.merge.readDisk(this.file);
        if (remote === null) {
          contentEl.setText(this.t("linkTargetMissing"));
          return;
        }
        this.state = this.merge.openState(this.session, remote);
        this.render(remote);
      }
      render(remote) {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.createEl("h3", { text: this.t("conflictTitle") });
        const result = this.merge.merge(this.session.baseSource, this.session.workingSource, remote);
        this.chunks = result.chunks;
        const summary = contentEl.createDiv({ cls: "html-atelier-hint" });
        summary.setText(`${this.t("conflictCount", { n: String(result.conflictCount) })} \xB7 ${this.t("conflictSummary", { n: String(result.chunks.length - result.conflictCount) })}`);
        if (this.merge.isExpired(this.session, this.state)) {
          const warn = contentEl.createDiv({ cls: "html-atelier-warn", text: this.t("conflictExpired") });
          void warn;
          const re = contentEl.createEl("button", { attr: { type: "button" }, text: this.t("conflictRecompare") });
          re.addEventListener("click", () => void this.onOpen());
        }
        const list = contentEl.createDiv({ cls: "html-atelier-mergechunks" });
        this.chunks.forEach((chunk, i) => {
          if (chunk.type === "same") return;
          const box = list.createDiv({ cls: `html-atelier-mergechunk html-atelier-merge-${chunk.type}` });
          if (chunk.type === "conflict") {
            const head = box.createDiv({ cls: "html-atelier-btnrow" });
            const mine = head.createEl("button", { attr: { type: "button" }, text: this.t("conflictKeepMine") });
            const disk = head.createEl("button", { attr: { type: "button" }, text: this.t("conflictUseDisk") });
            const edit = head.createEl("button", { attr: { type: "button" }, text: this.t("conflictEdit") });
            const ta = box.createEl("textarea", { cls: "html-atelier-textarea", attr: { rows: "3" } });
            let choice = this.choices.get(i);
            if (choice === void 0) {
              choice = "local";
              this.choices.set(i, choice);
            }
            ta.value = choice === "local" ? chunk.localText ?? "" : choice === "remote" ? chunk.remoteText ?? "" : choice;
            mine.addEventListener("click", () => {
              this.choices.set(i, "local");
              ta.value = chunk.localText ?? "";
            });
            disk.addEventListener("click", () => {
              this.choices.set(i, "remote");
              ta.value = chunk.remoteText ?? "";
            });
            edit.addEventListener("click", () => {
              this.choices.set(i, ta.value);
            });
            ta.addEventListener("input", () => this.choices.set(i, ta.value));
          } else {
            box.createDiv({ cls: "html-atelier-diffline", text: chunk.text });
          }
        });
        const buttons = contentEl.createDiv({ cls: "html-atelier-btnrow" });
        const apply = buttons.createEl("button", { cls: "html-atelier-savebtn", attr: { type: "button" }, text: this.t("conflictApply") });
        apply.disabled = this.merge.isExpired(this.session, this.state);
        apply.addEventListener("click", () => {
          void (async () => {
            const merged = this.chunks.map((c, i) => {
              if (c.type !== "conflict") return c.text;
              const choice = this.choices.get(i) ?? "local";
              return choice === "local" ? c.localText ?? c.text : choice === "remote" ? c.remoteText ?? c.text : choice;
            }).join("");
            const outcome = await this.merge.apply(this.file, this.session, this.state, merged);
            if (outcome === "applied") {
              const written = await this.commit();
              this.onApplied();
              if (written === "written") {
                new import_obsidian8.Notice(this.t("noticeSaved"));
                this.close();
              } else if (written === "conflict") new import_obsidian8.Notice(this.t("noticeExternalConflict"), 8e3);
              else if (written === "missing") new import_obsidian8.Notice(this.t("noticeFileMissing"), 8e3);
              else new import_obsidian8.Notice(this.t("noticeMergeNotSaved"), 8e3);
            } else if (outcome === "busy") new import_obsidian8.Notice(this.t("noticeMergeBusy"), 6e3);
            else if (outcome === "expired") new import_obsidian8.Notice(this.t("conflictExpired"));
            else new import_obsidian8.Notice(this.t("linkTargetMissing"));
          })();
        });
        const adopt = buttons.createEl("button", { attr: { "type": "button" }, text: this.t("conflictUseDiskVersion") });
        adopt.addEventListener("click", () => {
          void (async () => {
            if (await this.adopt()) this.close();
          })();
        });
        const cancel = buttons.createEl("button", { attr: { type: "button" }, text: this.t("conflictCancel") });
        cancel.addEventListener("click", () => this.close());
      }
      onClose() {
        this.contentEl.empty();
      }
    };
    DraftManagerModal = class extends import_obsidian8.Modal {
      // settings 用于 drafts.storageWarningMiB:草稿总量超过阈值时在管理器顶部提示
      // (此前该设置无读取方 —— 审计 round4 缺陷 38)
      constructor(t, drafts, onOpenFile, app, settings = () => DEFAULT_SETTINGS) {
        super(app);
        this.t = t;
        this.drafts = drafts;
        this.onOpenFile = onOpenFile;
        this.settings = settings;
        this.filter = "";
      }
      async onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.createEl("h3", { text: this.t("draftManagerTitle") });
        const search = contentEl.createEl("input", { cls: "html-atelier-input", attr: { type: "search", placeholder: "" } });
        search.placeholder = this.t("draftManagerSearch");
        search.addEventListener("input", () => {
          this.filter = search.value.toLowerCase();
          void this.render();
        });
        this.listEl = contentEl.createDiv({ cls: "html-atelier-list" });
        const buttons = contentEl.createDiv({ cls: "html-atelier-btnrow" });
        const discard = buttons.createEl("button", { attr: { type: "button" }, text: this.t("draftManagerDiscard") });
        discard.addEventListener("click", () => {
          void (async () => {
            const selected = [...contentEl.querySelectorAll(".html-atelier-row input[type=checkbox]:checked")].map((el) => el.closest(".html-atelier-row").dataset.path).filter(Boolean);
            if (!selected.length) return;
            if (!window.confirm(this.t("draftManagerConfirmDiscard", { n: String(selected.length) }))) return;
            const { ok } = await this.drafts.discardMany(selected);
            new import_obsidian8.Notice(`${ok.length}`);
            void this.render();
          })();
        });
        await this.render();
      }
      async render() {
        const { records } = await this.drafts.list();
        this.listEl.empty();
        const t = this.t;
        this.renderStorageWarning(records);
        const shown = records.filter((r) => r.filePath.toLowerCase().includes(this.filter));
        if (!shown.length) {
          this.listEl.createDiv({ cls: "html-atelier-panelnote", text: t("draftManagerEmpty") });
          return;
        }
        for (const { filePath, record } of shown) {
          const exists = !!this.app.vault.getAbstractFileByPath(filePath);
          const diskSame = exists ? await this.app.vault.cachedRead(this.app.vault.getAbstractFileByPath(filePath)).catch(() => null) : null;
          const conflict = diskSame !== null && diskSame !== record.baseSource;
          const missing = !exists;
          const row = this.listEl.createDiv({ cls: "html-atelier-row html-atelier-draftrow" });
          row.dataset.path = filePath;
          const check = row.createEl("input", { attr: { type: "checkbox", "aria-label": filePath } });
          void check;
          row.createSpan({ text: `${filePath} \xB7 ${record.workingSource.length}B` });
          row.createSpan({
            cls: "html-atelier-badge",
            text: missing ? t("draftManagerStatusMissing") : conflict ? t("draftManagerStatusConflict") : t("draftManagerStatusNormal")
          });
          const open = row.createEl("button", { attr: { type: "button" }, text: t("draftManagerOpen") });
          open.disabled = missing;
          open.addEventListener("click", () => {
            this.onOpenFile(filePath);
            this.close();
          });
        }
      }
      // 草稿总量提醒:只提示、不自动删(报告 §8.1)。按 UTF-8 字节统计,
      // 与草稿文件的实际占用一致(中文字符不是 1 字节)。
      renderStorageWarning(records) {
        const limit = this.settings().drafts.storageWarningMiB;
        if (!(limit > 0)) return;
        const bytes = records.reduce((n, r) => n + utf8Bytes(r.record.baseSource) + utf8Bytes(r.record.workingSource), 0);
        const total = bytes / 1048576;
        if (total <= limit) return;
        this.listEl.createDiv({
          cls: "html-atelier-panelnote html-atelier-storagewarning",
          text: this.t("draftManagerStorageWarning", { total: total.toFixed(1), limit: String(limit) })
        });
      }
      onClose() {
        this.contentEl.empty();
      }
    };
    RelinkModal = class extends import_obsidian8.FuzzySuggestModal {
      constructor(app, onPick) {
        super(app);
        this.onPick = onPick;
      }
      // app 由基类持有
      getItems() {
        return this.app.vault.getMarkdownFiles().concat(this.app.vault.getFiles().filter((f) => ["html", "htm", "md", "pdf"].includes(f.extension.toLowerCase()))).filter((f, i, arr) => arr.indexOf(f) === i);
      }
      getItemText(f) {
        return f.path;
      }
      onChooseItem(f) {
        this.onPick(f);
      }
    };
  }
});

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => HtmlAtelier
});
module.exports = __toCommonJS(main_exports);
var import_obsidian13 = require("obsidian");

// src/core/history.ts
init_patch();

// src/core/fingerprint.ts
function fingerprint(source) {
  let h1 = 2166136261, h2 = 16777619 ^ source.length;
  for (let i = 0; i < source.length; i++) {
    const c = source.charCodeAt(i);
    h1 = (h1 ^ c) >>> 0;
    h1 = Math.imul(h1, 16777619) >>> 0;
    h2 = (h2 ^ c + i) >>> 0;
    h2 = Math.imul(h2, 2246822507) >>> 0;
  }
  return `${h1.toString(16).padStart(8, "0")}${h2.toString(16).padStart(8, "0")}:${source.length}`;
}

// src/core/history.ts
var DEFAULT_HISTORY_LIMITS = { maxEvents: 200, maxBytes: 32 * 1024 * 1024, mergeDelayMs: 800 };
var HistoryError = class extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = "HistoryError";
  }
};
var uidCounter = 0;
var uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${(++uidCounter).toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
var eventBytes = (e) => {
  let n = 0;
  for (const s of e.steps) for (const p of s.patches) if (p.expected === p.replacement) n += p.expected.length * 2;
  else n += (p.expected.length + p.replacement.length) * 2;
  for (const s of e.steps) for (const p of s.inversePatches) n += (p.expected.length + p.replacement.length) * 2;
  return n;
};
var TransactionController = class {
  constructor(source, limits = DEFAULT_HISTORY_LIMITS) {
    this.limits = limits;
    this.revision = 0;
    this.undoStack = [];
    this.redoStack = [];
    this.currentGroup = null;
    this.lastGroupKey = null;
    this.lastGroupAt = -Infinity;
    this.bytes = 0;
    this.epochCounter = 0;
    this.source = source;
    this.epoch = `e${++this.epochCounter}`;
  }
  get undoDepth() {
    return this.undoStack.length;
  }
  get redoDepth() {
    return this.redoStack.length;
  }
  get historyBytes() {
    return this.bytes;
  }
  endGroup() {
    this.currentGroup = null;
    this.lastGroupKey = null;
    this.lastGroupAt = -Infinity;
  }
  // 外部重载或应用合并后调用：新 epoch，历史不跨基准重放；返回被丢弃的事件供检查点另存。
  resetForExternalLoad(newSource) {
    this.endGroup();
    const dropped = [...this.undoStack, ...this.redoStack];
    this.undoStack = [];
    this.redoStack = [];
    this.bytes = 0;
    this.source = newSource;
    this.revision++;
    this.epoch = `e${++this.epochCounter}-${uid("epoch")}`;
    return dropped;
  }
  // 普通保存成功：不递增 revision、不重置 epoch，只关闭输入分组。
  checkpointSave() {
    this.endGroup();
  }
  // 供会话在保存/切换对象/批量操作前结束当前输入分组。
  endGroupPublic() {
    this.endGroup();
  }
  apply(patches, opts = {}) {
    const now = opts.now ?? Date.now();
    const origin = opts.origin ?? "edit";
    const kind = opts.kind ?? "text";
    const before = this.source;
    const merging = origin === "edit" && !!opts.groupingKey && opts.groupingKey === this.lastGroupKey && this.currentGroup !== null && this.currentGroup.epoch === this.epoch && now - this.lastGroupAt <= this.limits.mergeDelayMs;
    if (!merging) this.endGroup();
    validatePatches(before, patches);
    const out = applyPatches(before, patches);
    const tx = {
      id: uid("tx"),
      fromRevision: this.revision,
      toRevision: this.revision + 1,
      origin,
      kind,
      patches,
      inversePatches: computeInverse(patches),
      selectionBefore: opts.selectionBefore ?? null,
      selectionAfter: opts.selectionAfter ?? null,
      timestamp: now
    };
    this.source = out;
    this.revision++;
    if (merging && this.currentGroup) {
      this.currentGroup.steps.push(tx);
      this.currentGroup.lastRevision = tx.toRevision;
      this.currentGroup.afterFingerprint = fingerprint(out);
      this.lastGroupAt = now;
      this.bytes += eventBytes({ id: "", epoch: "", firstRevision: 0, lastRevision: 0, beforeFingerprint: "", afterFingerprint: "", steps: [tx] });
    } else {
      const event = {
        id: uid("ev"),
        epoch: this.epoch,
        firstRevision: tx.fromRevision,
        lastRevision: tx.toRevision,
        beforeFingerprint: fingerprint(before),
        afterFingerprint: fingerprint(out),
        steps: [tx]
      };
      this.undoStack.push(event);
      this.bytes += eventBytes(event);
      this.currentGroup = origin === "edit" && opts.groupingKey ? event : null;
      this.lastGroupKey = opts.groupingKey ?? null;
      this.lastGroupAt = now;
    }
    if (this.redoStack.length) {
      let reclaimed = 0;
      for (const dropped of this.redoStack) reclaimed += eventBytes(dropped);
      this.bytes -= reclaimed;
      this.redoStack = [];
    }
    this.trim();
    return { source: out, transaction: tx };
  }
  trim() {
    while (this.bytes > this.limits.maxBytes || this.undoStack.length + this.redoStack.length > this.limits.maxEvents) {
      const victim = this.undoStack.length ? this.undoStack : this.redoStack;
      if (!victim.length) break;
      const removed = victim.shift();
      this.bytes -= eventBytes(removed);
      if (victim === this.undoStack && this.currentGroup === removed) this.endGroup();
    }
  }
  // 撤销（§12.2.1 算法）：结束分组 → 校验 epoch 与栈顶 afterFingerprint →
  // 临时缓冲倒序应用逆向步骤并逐步校验 expected → 校验 beforeFingerprint → 原子提交。
  undo() {
    this.endGroup();
    const top = this.undoStack[this.undoStack.length - 1];
    if (!top) throw new HistoryError("no-undo", "\u6CA1\u6709\u53EF\u64A4\u9500\u7684\u5386\u53F2");
    const startRevision = this.revision, startEpoch = this.epoch;
    if (top.epoch !== startEpoch) throw new HistoryError("epoch-changed", "\u5386\u53F2\u4E8B\u4EF6\u5C5E\u4E8E\u65E7\u57FA\u51C6\uFF0C\u4E0D\u80FD\u76F4\u63A5\u91CD\u653E");
    if (top.afterFingerprint !== fingerprint(this.source))
      throw new HistoryError("fingerprint-mismatch", "\u5F53\u524D\u5185\u5BB9\u4E0E\u6808\u9876\u4E8B\u4EF6\u7684\u8F93\u51FA\u4E0D\u4E00\u81F4\uFF0C\u62D2\u7EDD\u64A4\u9500");
    let buffer = this.source;
    try {
      for (let i = top.steps.length - 1; i >= 0; i--) buffer = applyPatches(buffer, top.steps[i].inversePatches);
    } catch (e) {
      throw new HistoryError("fingerprint-mismatch", `\u64A4\u9500\u6B65\u9AA4\u6821\u9A8C\u5931\u8D25\uFF1A${e instanceof Error ? e.message : String(e)}`);
    }
    if (top.beforeFingerprint !== fingerprint(buffer))
      throw new HistoryError("fingerprint-mismatch", "\u64A4\u9500\u7ED3\u679C\u4E0E\u4E8B\u4EF6\u8D77\u70B9\u4E0D\u4E00\u81F4\uFF0C\u62D2\u7EDD\u63D0\u4EA4");
    if (this.revision !== startRevision || this.epoch !== startEpoch || this.undoStack[this.undoStack.length - 1] !== top)
      throw new HistoryError("top-changed", "\u64A4\u9500\u8BA1\u7B97\u671F\u95F4\u5185\u5BB9\u6216\u5386\u53F2\u5DF2\u53D8\u5316\uFF0C\u4E34\u65F6\u7ED3\u679C\u4E0D\u843D\u5730");
    this.undoStack.pop();
    this.redoStack.push(top);
    this.source = buffer;
    this.revision++;
    return { source: buffer, event: top, fromRevision: startRevision, toRevision: this.revision };
  }
  // 重做（对称）：校验 beforeFingerprint → 正序应用正向步骤 → 校验 afterFingerprint → 原子提交。
  redo() {
    this.endGroup();
    const top = this.redoStack[this.redoStack.length - 1];
    if (!top) throw new HistoryError("no-redo", "\u6CA1\u6709\u53EF\u91CD\u505A\u7684\u5386\u53F2");
    const startRevision = this.revision, startEpoch = this.epoch;
    if (top.epoch !== startEpoch) throw new HistoryError("epoch-changed", "\u5386\u53F2\u4E8B\u4EF6\u5C5E\u4E8E\u65E7\u57FA\u51C6\uFF0C\u4E0D\u80FD\u76F4\u63A5\u91CD\u653E");
    if (top.beforeFingerprint !== fingerprint(this.source))
      throw new HistoryError("fingerprint-mismatch", "\u5F53\u524D\u5185\u5BB9\u4E0E\u6808\u9876\u4E8B\u4EF6\u7684\u8F93\u5165\u4E0D\u4E00\u81F4\uFF0C\u62D2\u7EDD\u91CD\u505A");
    let buffer = this.source;
    try {
      for (const step of top.steps) buffer = applyPatches(buffer, step.patches);
    } catch (e) {
      throw new HistoryError("fingerprint-mismatch", `\u91CD\u505A\u6B65\u9AA4\u6821\u9A8C\u5931\u8D25\uFF1A${e instanceof Error ? e.message : String(e)}`);
    }
    if (top.afterFingerprint !== fingerprint(buffer))
      throw new HistoryError("fingerprint-mismatch", "\u91CD\u505A\u7ED3\u679C\u4E0E\u4E8B\u4EF6\u7EC8\u70B9\u4E0D\u4E00\u81F4\uFF0C\u62D2\u7EDD\u63D0\u4EA4");
    if (this.revision !== startRevision || this.epoch !== startEpoch || this.redoStack[this.redoStack.length - 1] !== top)
      throw new HistoryError("top-changed", "\u91CD\u505A\u8BA1\u7B97\u671F\u95F4\u5185\u5BB9\u6216\u5386\u53F2\u5DF2\u53D8\u5316\uFF0C\u4E34\u65F6\u7ED3\u679C\u4E0D\u843D\u5730");
    this.redoStack.pop();
    this.undoStack.push(top);
    this.source = buffer;
    this.revision++;
    return { source: buffer, event: top, fromRevision: startRevision, toRevision: this.revision };
  }
};

// src/core/session.ts
var MissingError = class extends Error {
  constructor(message = "\u6587\u4EF6\u4E0D\u5B58\u5728") {
    super(message);
    this.name = "MissingError";
  }
};
var CONFLICT_SENTINEL = Symbol("html-atelier-conflict");
var DocumentSession = class {
  constructor(filePath, baseSource, workingSource, limits, nowRevision = 0) {
    this.filePath = filePath;
    this.baseSource = baseSource;
    this.workingSource = workingSource;
    this.parsedRevision = -1;
    this.contentState = "clean";
    this.operation = "idle";
    this.lastError = null;
    this.draftStatus = "idle";
    this.index = null;
    this.pendingExternal = false;
    this.controller = new TransactionController(workingSource, limits);
    this.controller.revision = nowRevision;
    this.baseHash = fingerprint(baseSource);
  }
  // 保存/合并期间收到过外部变化时为 true；宿主必须在操作结束后读取磁盘并补发 externalChange。
  get hasQueuedExternal() {
    return this.pendingExternal;
  }
  get dirty() {
    return this.workingSource !== this.baseSource;
  }
  get revision() {
    return this.controller.revision;
  }
  get historyEpoch() {
    return this.controller.epoch;
  }
  get source() {
    return this.workingSource;
  }
  recomputeContentState() {
    if (this.contentState === "conflict" || this.contentState === "missing") return;
    this.contentState = this.workingSource === this.baseSource ? "clean" : "dirty";
  }
  // 内容编辑入口（可视化与源码编辑共用）。operation 非 idle 时拒绝（保存/合并窗口内禁改）。
  applyEdit(patches, opts = {}) {
    if (this.operation !== "idle") throw new Error("\u5F53\u524D\u6B63\u5728\u4FDD\u5B58\u6216\u5408\u5E76\uFF0C\u5185\u5BB9\u4FEE\u6539\u6682\u65F6\u7981\u7528");
    if (this.contentState === "missing") throw new Error("\u539F\u6587\u4EF6\u5DF2\u5220\u9664\uFF0C\u5185\u5BB9\u53EA\u8BFB\uFF1B\u8BF7\u4F7F\u7528\u53E6\u5B58\u6062\u590D");
    const { source } = this.controller.apply(patches, {
      origin: opts.origin,
      kind: opts.kind,
      groupingKey: opts.origin === "restore" ? null : opts.groupingKey,
      selectionBefore: opts.selectionBefore,
      selectionAfter: opts.selectionAfter,
      now: opts.now
    });
    this.workingSource = source;
    this.recomputeContentState();
    return patches;
  }
  undo() {
    return this.guardedMove(() => this.controller.undo());
  }
  redo() {
    return this.guardedMove(() => this.controller.redo());
  }
  guardedMove(move) {
    if (this.operation !== "idle") throw new Error("\u5F53\u524D\u6B63\u5728\u4FDD\u5B58\u6216\u5408\u5E76\uFF0C\u64A4\u9500/\u91CD\u505A\u6682\u65F6\u7981\u7528");
    if (this.contentState === "missing") throw new Error("\u539F\u6587\u4EF6\u5DF2\u5220\u9664\uFF0C\u5386\u53F2\u4E0D\u53EF\u7528");
    const result = move();
    this.workingSource = result.source;
    this.recomputeContentState();
    return result;
  }
  endInputGroup() {
    this.controller.endGroupPublic();
  }
  // 解析结果登记：只有匹配当前 revision 的解析结果可开放可视化编辑。
  setParsed(index) {
    this.index = index;
    this.parsedRevision = this.revision;
  }
  canUseVisualEdits() {
    return this.parsedRevision === this.revision;
  }
  // 普通保存（§12.4）：串行化由宿主保证（每文件一次）；compositionend 由宿主先行处理。
  async save(io) {
    if (this.operation !== "idle") return { result: "blocked" };
    this.controller.endGroupPublic();
    if (this.contentState === "conflict") return { result: "blocked" };
    if (this.contentState === "missing") return { result: "missing" };
    if (!this.dirty) return { result: "clean" };
    this.operation = "saving";
    this.lastError = null;
    try {
      const outcome = await io.process((current) => current === this.baseSource ? this.workingSource : null);
      if (outcome === "written") {
        this.baseSource = this.workingSource;
        this.baseHash = fingerprint(this.baseSource);
        this.contentState = "clean";
        this.lastError = null;
      } else this.contentState = "conflict";
      return { result: outcome };
    } catch (e) {
      if (e instanceof MissingError) {
        this.contentState = "missing";
        return { result: "missing" };
      }
      this.lastError = { action: "save", message: e instanceof Error ? e.message : String(e) };
      return { result: "io-error" };
    } finally {
      this.operation = "idle";
    }
  }
  // 宿主在补发完排队的外部变化后调用,清掉标记。
  consumeQueuedExternal() {
    this.pendingExternal = false;
  }
  // 外部变化（vault modify）。operation 非 idle 时排队，由保存结束后宿主补发。
  // 干净内容的外部更新：采用磁盘版本，递增 revision 并开启新 epoch（旧历史丢弃并返回）。
  // 有本地改动：进入 conflict，Local 保留，普通保存禁用。
  externalChange(diskSource) {
    if (this.operation !== "idle") {
      this.pendingExternal = true;
      return null;
    }
    if (diskSource === this.baseSource) return null;
    if (this.workingSource === this.baseSource) {
      const dropped = this.controller.resetForExternalLoad(diskSource);
      this.workingSource = diskSource;
      this.baseSource = diskSource;
      this.baseHash = fingerprint(diskSource);
      this.contentState = "clean";
      return { adopted: true, droppedHistory: dropped };
    }
    this.contentState = "conflict";
    return { adopted: false, droppedHistory: [] };
  }
  markMissing() {
    if (this.operation === "idle") this.contentState = "missing";
  }
  // 冲突解除路径一：采用磁盘版本（"使用磁盘版本"）。
  // 保存或合并进行中时拒绝:此时 workingSource/baseSource 正被事务占用,竞态调用会留下
  // "base 指向旧内容、dirty 谎报为 false"的永久冲突状态(audit/core S5)。
  adoptRemote(diskSource) {
    if (this.operation !== "idle") throw new Error("\u6B63\u5728\u4FDD\u5B58\u6216\u5408\u5E76,\u4E0D\u80FD\u91C7\u7528\u78C1\u76D8\u7248\u672C;\u8BF7\u7A0D\u540E\u91CD\u8BD5");
    const dropped = this.controller.resetForExternalLoad(diskSource);
    this.workingSource = diskSource;
    this.baseSource = diskSource;
    this.baseHash = fingerprint(diskSource);
    this.contentState = "clean";
    this.lastError = null;
    return dropped;
  }
  // 冲突解除路径二：应用三方合并结果（§11.1）。base 设为本次 Remote，working 设为合并稿。
  // 新历史段；旧 Local 由调用方通过返回值交草稿层做"恢复合并前草稿"检查点。
  applyMergeResult(mergedSource, remoteBase) {
    if (this.operation !== "idle" && this.operation !== "merging") throw new Error("\u6B63\u5728\u4FDD\u5B58,\u4E0D\u80FD\u5E94\u7528\u5408\u5E76\u7ED3\u679C;\u8BF7\u7A0D\u540E\u91CD\u8BD5");
    const dropped = this.controller.resetForExternalLoad(mergedSource);
    this.workingSource = mergedSource;
    this.baseSource = remoteBase;
    this.baseHash = fingerprint(remoteBase);
    this.contentState = mergedSource === remoteBase ? "clean" : "dirty";
    this.lastError = null;
    return dropped;
  }
};

// src/main.ts
init_schema();

// src/settings/tab.ts
var import_obsidian = require("obsidian");
init_schema();

// src/settings/settingsText.ts
var ZH = {
  "sidebar.autoShowHtml": { name: "\u6253\u5F00 HTML \u65F6\u663E\u793A\u4E13\u5C5E\u9762\u677F", desc: "\u6FC0\u6D3B HTML \u6587\u4EF6\u65F6\u81EA\u52A8\u5C55\u5F00 HTML Atelier \u4FA7\u680F\u3002\u5DE5\u5177\u680F\u653E\u5728\u4FA7\u680F\u65F6,\u5373\u4F7F\u6B64\u9879\u5173\u95ED\u4E5F\u4F1A\u5C55\u5F00(\u5426\u5219\u6CA1\u6709\u6A21\u5F0F\u5207\u6362\u5165\u53E3)\u3002" },
  "sidebar.closeOnLeave": { name: "\u79BB\u5F00 HTML \u65F6\u5173\u95ED\u9762\u677F", desc: "\u5207\u6362\u5230\u5176\u4ED6\u6587\u4EF6\u7C7B\u578B\u65F6\u79FB\u9664\u672C\u63D2\u4EF6\u7BA1\u7406\u7684\u4FA7\u680F\u53F6\u5B50\u3002" },
  "sidebar.markdownTarget": { name: "\u5207\u5230 Markdown \u65F6", desc: "\u9009\u62E9\u5C55\u793A\u539F\u751F\u5927\u7EB2\u3001\u6062\u590D\u65E7\u9762\u677F\u6216\u4E0D\u52A8\u4F5C\u3002" },
  "sidebar.otherTarget": { name: "\u5207\u5230\u5176\u4ED6\u6587\u4EF6\u65F6", desc: "\u6062\u590D\u65E7\u9762\u677F\u6216\u4E0D\u52A8\u4F5C\u3002" },
  "sidebar.respectManualCollapse": { name: "\u8BB0\u4F4F\u624B\u52A8\u6536\u8D77", desc: "\u624B\u52A8\u6536\u8D77\u53F3\u4FA7\u680F\u540E,\u81EA\u52A8\u884C\u4E3A\u4E0D\u518D\u5C55\u5F00;\u663E\u5F0F\u547D\u4EE4\u53EF\u89E3\u9664\u3002" },
  "sidebar.defaultTab": { name: "\u9ED8\u8BA4\u6807\u7B7E", desc: "HTML \u4FA7\u680F\u521D\u59CB\u663E\u793A\u7684\u6807\u7B7E\u9875\u3002" },
  "links.externalTarget": { name: "\u5916\u94FE\u6253\u5F00\u65B9\u5F0F", desc: "\u7CFB\u7EDF\u6D4F\u89C8\u5668\u6216\u5E94\u7528\u5185\u7F51\u9875\u67E5\u770B\u5668;\u67E5\u770B\u5668\u4E0D\u53EF\u7528\u65F6\u81EA\u52A8\u56DE\u9000\u3002" },
  "links.internalTarget": { name: "\u5E93\u5185\u94FE\u63A5\u6253\u5F00\u65B9\u5F0F", desc: "\u5F53\u524D\u6807\u7B7E\u6216\u65B0\u6807\u7B7E\u9875\u3002" },
  "links.respectBlankTarget": { name: "\u9075\u5FAA target=_blank", desc: "\u9875\u9762\u58F0\u660E\u65B0\u7A97\u53E3\u76EE\u6807\u65F6\u5728\u65B0\u6807\u7B7E\u9875\u6253\u5F00\u3002" },
  "links.browserGesture": { name: "\u6D4F\u89C8\u5668\u6253\u5F00\u624B\u52BF", desc: "\u6309\u4F4F\u4FEE\u9970\u952E\u70B9\u51FB\u94FE\u63A5\u5728\u6D4F\u89C8\u5668\u4E2D\u6253\u5F00\u3002" },
  "links.showHoverTarget": { name: "\u60AC\u505C\u663E\u793A\u76EE\u6807\u5730\u5740", desc: "\u60AC\u505C\u6216\u952E\u76D8\u805A\u7126\u94FE\u63A5\u65F6\u5728\u72B6\u6001\u680F\u663E\u793A\u5B8C\u6574\u76EE\u6807\u3002" },
  "links.browserApplication": { name: "\u6D4F\u89C8\u5668\u7A0B\u5E8F", desc: "auto \u4F7F\u7528\u7CFB\u7EDF\u9ED8\u8BA4;\u4E5F\u53EF\u6307\u5B9A\u6D4F\u89C8\u5668\u5E94\u7528\u8DEF\u5F84(\u672C\u5730\u542B\u4E2D\u6587/\u7A7A\u683C\u8DEF\u5F84\u65F6\u5EFA\u8BAE\u663E\u5F0F\u6307\u5B9A)\u3002" },
  "links.unsavedBrowserAction": { name: "\u6709\u672A\u4FDD\u5B58\u8349\u7A3F\u65F6", desc: "\u5728\u6D4F\u89C8\u5668\u6253\u5F00\u524D\u8BE2\u95EE,\u6216\u4EC5\u6253\u5F00\u5DF2\u4FDD\u5B58\u7248\u672C\u3002" },
  "editor.defaultMode": { name: "\u9ED8\u8BA4\u6A21\u5F0F", desc: "\u6253\u5F00 HTML \u6587\u4EF6\u65F6\u7684\u521D\u59CB\u6A21\u5F0F\u3002" },
  "editor.defaultTextMode": { name: "\u9ED8\u8BA4\u6587\u5B57\u7F16\u8F91\u7C92\u5EA6", desc: "\u6587\u5B57\u7247\u6BB5\u6216\u6574\u6BB5\u7F16\u8F91\u3002" },
  "editor.historyLimit": { name: "\u64A4\u9500\u5386\u53F2\u4E0A\u9650", desc: "50\u20131000 \u4E2A\u4E8B\u52A1;\u540C\u65F6\u53D7\u5185\u5B58\u9884\u7B97\u9650\u5236\u3002" },
  "editor.mergeDelayMs": { name: "\u8F93\u5165\u5408\u5E76\u7A97\u53E3", desc: "\u8FDE\u7EED\u8F93\u5165\u5408\u5E76\u4E3A\u4E00\u6B21\u64A4\u9500\u7684\u65F6\u95F4\u7A97(300\u20132000ms)\u3002" },
  "editor.showChangeHighlights": { name: "\u663E\u793A\u4FEE\u6539\u6807\u8BB0", desc: "\u9875\u9762\u4E0A\u9AD8\u4EAE\u5DF2\u4FEE\u6539\u6587\u5B57\u3002" },
  "editor.restoreFocusAfterSave": { name: "\u4FDD\u5B58\u540E\u6062\u590D\u7126\u70B9", desc: "\u4FDD\u5B58\u6210\u529F\u540E\u6062\u590D\u6B64\u524D\u7684\u9009\u62E9\u4E0E\u7F16\u8F91\u4F4D\u7F6E\u3002" },
  "editor.toolbarPlacement": { name: "\u5DE5\u5177\u680F\u4F4D\u7F6E", desc: "\u4FA7\u680F:\u4E3B\u89C6\u56FE\u53EA\u7559\u9875\u9762\u5185\u5BB9,\u6A21\u5F0F\u4E0E\u5BFC\u822A\u63A7\u4EF6\u653E\u5728 HTML \u4FA7\u680F\u9762\u677F\u9876\u90E8;\u89C6\u56FE\u5185:\u6CBF\u7528\u6587\u4EF6\u89C6\u56FE\u9876\u90E8\u90A3\u6761\u5DE5\u5177\u680F\u3002" },
  "search.includeHidden": { name: "\u641C\u7D22\u5305\u542B\u9690\u85CF\u6587\u5B57", desc: "\u9690\u85CF\u5185\u5BB9\u4F1A\u6807\u6CE8\u201C\u5F53\u524D\u4E0D\u53EF\u89C1\u201D\u5E76\u63D0\u4F9B\u6E90\u7801\u5B9A\u4F4D\u3002" },
  "preview.defaultWidth": { name: "\u9ED8\u8BA4\u9884\u89C8\u5BBD\u5EA6", desc: "auto \u6216 240\u20133840 CSS \u50CF\u7D20\u3002" },
  "preview.defaultZoom": { name: "\u9ED8\u8BA4\u7F29\u653E", desc: "25%\u2013200%\u3002" },
  "preview.rememberViewport": { name: "\u8BB0\u4F4F\u6BCF\u6587\u4EF6\u5C3A\u5BF8", desc: "\u6309\u6587\u4EF6\u8BB0\u5FC6\u9884\u89C8\u5BBD\u5EA6\u4E0E\u7F29\u653E(\u9AD8\u5EA6\u7531\u5E03\u5C40\u51B3\u5B9A)\u3002" },
  "preview.rememberPosition": { name: "\u8BB0\u4F4F\u9605\u8BFB\u4F4D\u7F6E", desc: "\u91CD\u65B0\u6253\u5F00\u65F6\u6062\u590D\u5230\u4E0A\u6B21\u9605\u8BFB\u4F4D\u7F6E\u3002" },
  "preview.positionLimit": { name: "\u4F4D\u7F6E\u8BB0\u5FC6\u4E0A\u9650", desc: "\u4E3A\u6700\u8FD1\u591A\u5C11\u4E2A\u6587\u4EF6\u4FDD\u5B58\u9605\u8BFB\u4F4D\u7F6E\u3002" },
  "preview.autoRefreshAssets": { name: "\u4F9D\u8D56\u53D8\u5316\u81EA\u52A8\u5237\u65B0", desc: "\u5173\u8054 CSS/\u56FE\u7247\u53D8\u5316\u540E\u81EA\u52A8\u5237\u65B0\u9884\u89C8\u3002" },
  "preview.allowNetworkAssets": { name: "\u5141\u8BB8\u52A0\u8F7D\u7F51\u7EDC\u8D44\u6E90", desc: "\u5173\u95ED\u540E\u62E6\u622A\u8FDC\u7A0B\u56FE\u7247/\u6837\u5F0F/\u5B57\u4F53;\u9875\u9762\u811A\u672C\u59CB\u7EC8\u4E0D\u6267\u884C\u3002" },
  "drafts.enabled": { name: "\u542F\u7528\u8349\u7A3F\u5907\u4EFD", desc: "\u5173\u95ED\u524D\u5217\u51FA\u73B0\u5B58\u8349\u7A3F,\u8981\u6C42\u5148\u4FDD\u5B58\u6216\u653E\u5F03\u3002" },
  "drafts.debounceMs": { name: "\u8349\u7A3F\u9632\u6296", desc: "\u8FDE\u7EED\u8F93\u5165\u540E\u591A\u5C11\u6BEB\u79D2\u63D0\u4EA4\u4E00\u6B21\u8349\u7A3F\u5FEB\u7167\u3002" },
  "drafts.maxWaitMs": { name: "\u8349\u7A3F\u6700\u957F\u7B49\u5F85", desc: "\u81EA\u9996\u6B21\u5F85\u5199\u8D77\u7684\u6700\u957F\u63D0\u4EA4\u95F4\u9694,\u4E0D\u5C0F\u4E8E\u9632\u6296\u503C\u3002" },
  "drafts.storageWarningMiB": { name: "\u8349\u7A3F\u5BB9\u91CF\u63D0\u9192", desc: "\u8349\u7A3F\u603B\u91CF\u8D85\u8FC7\u8BE5\u503C\u65F6\u5728\u7BA1\u7406\u5668\u63D0\u793A\u3002" },
  "drafts.closeBehavior": { name: "\u5173\u95ED\u6587\u4EF6\u65F6", desc: "\u4FDD\u7559\u8349\u7A3F\u6216\u6BCF\u6B21\u8BE2\u95EE;\u5907\u4EFD\u5173\u95ED\u65F6\u5F3A\u5236\u8BE2\u95EE\u3002" },
  "saveAs.rebaseRelativeUrls": { name: "\u53E6\u5B58\u65F6\u91CD\u5199\u76F8\u5BF9\u5F15\u7528", desc: "\u8DE8\u76EE\u5F55\u53E6\u5B58\u65F6\u6309\u65B0\u76EE\u5F55\u6539\u5199\u672C\u5730\u76F8\u5BF9 src/href \u7B49\u3002" },
  "saveAs.openCopy": { name: "\u4FDD\u5B58\u540E\u6253\u5F00\u526F\u672C", desc: "\u53E6\u5B58\u6210\u529F\u540E\u81EA\u52A8\u6253\u5F00\u526F\u672C\u3002" },
  "embeds.enabled": { name: "\u542F\u7528 HTML \u5D4C\u5165", desc: "\u5904\u7406 Markdown \u4E2D\u7684 html-atelier \u4EE3\u7801\u5757\u3002" },
  "embeds.defaultHeight": { name: "\u5D4C\u5165\u9ED8\u8BA4\u9AD8\u5EA6", desc: "160\u20131600 \u50CF\u7D20,\u6216\u7531\u4EE3\u7801\u5757 height \u6307\u5B9A\u3002" },
  "embeds.autoHeightMax": { name: "\u81EA\u9002\u5E94\u9AD8\u5EA6\u4E0A\u9650", desc: "height:auto \u65F6\u7684\u6700\u5927\u9AD8\u5EA6\u3002" },
  "embeds.showToolbar": { name: "\u5D4C\u5165\u5DE5\u5177\u680F", desc: "\u663E\u793A\u6587\u4EF6\u540D\u3001\u5237\u65B0\u4E0E\u6253\u5F00\u7F16\u8F91\u3002" },
  "embeds.showDrafts": { name: "\u5D4C\u5165\u663E\u793A\u8349\u7A3F", desc: "\u5B58\u5728\u672A\u4FDD\u5B58\u8349\u7A3F\u65F6\u5728\u5D4C\u5165\u6807\u9898\u5904\u6807\u8BB0\u201C\u8349\u7A3F\u201D\u3002" },
  "source.lineNumbers": { name: "\u6E90\u7801\u884C\u53F7", desc: "\u6E90\u7801\u7F16\u8F91\u5668\u663E\u793A\u884C\u53F7\u3002" },
  "source.lineWrapping": { name: "\u6E90\u7801\u8F6F\u6362\u884C", desc: "\u957F\u884C\u81EA\u52A8\u6362\u884C\u663E\u793A,\u4E0D\u6539\u53D8\u5B9E\u9645\u6362\u884C\u3002" },
  "source.previewDelayMs": { name: "\u6E90\u7801\u5237\u65B0\u5EF6\u8FDF", desc: "\u6E90\u7801\u7F16\u8F91\u540E\u5230\u9884\u89C8\u5237\u65B0\u7684\u9632\u6296\u65F6\u957F(150\u20132000ms)\u3002" },
  "ui.language": { name: "\u754C\u9762\u8BED\u8A00", desc: "auto \u8DDF\u968F Obsidian \u8BED\u8A00;\u53EF\u9009\u4E2D\u6587\u6216\u82F1\u6587\u3002" }
};
var GROUP_NAMES = {
  sidebar: "\u4FA7\u680F",
  links: "\u94FE\u63A5",
  editor: "\u7F16\u8F91",
  search: "\u641C\u7D22",
  preview: "\u9884\u89C8",
  drafts: "\u8349\u7A3F",
  saveAs: "\u53E6\u5B58",
  embeds: "\u5D4C\u5165",
  source: "\u6E90\u7801",
  ui: "\u901A\u7528"
};
var EN = {
  "sidebar.autoShowHtml": { name: "Show panel when opening HTML", desc: "Reveal the HTML Atelier sidebar when an HTML file becomes active. When the toolbar lives in the sidebar, the panel opens regardless (otherwise there would be no mode switch)." },
  "sidebar.closeOnLeave": { name: "Close panel when leaving HTML", desc: "Remove the plugin-owned sidebar leaf when switching to other file types." },
  "sidebar.markdownTarget": { name: "When switching to Markdown", desc: "Show the native outline, restore the previous panel, or do nothing." },
  "sidebar.otherTarget": { name: "When switching to other files", desc: "Restore the previous panel or do nothing." },
  "sidebar.respectManualCollapse": { name: "Remember manual collapse", desc: "After manually collapsing the sidebar, automation will not expand it; explicit command can." },
  "sidebar.defaultTab": { name: "Default tab", desc: "Initial tab shown in the HTML sidebar." },
  "links.externalTarget": { name: "External links", desc: "System browser or in-app web viewer; falls back when unavailable." },
  "links.internalTarget": { name: "Library links", desc: "Open in the current tab or a new tab." },
  "links.respectBlankTarget": { name: "Honor target=_blank", desc: "Open in a new tab when the page declares a new-window target." },
  "links.browserGesture": { name: "Browser-open gesture", desc: "Hold a modifier and click a link to open it in the browser." },
  "links.showHoverTarget": { name: "Hover shows target", desc: "Show the full target in the status bar on hover or keyboard focus." },
  "links.browserApplication": { name: "Browser application", desc: "auto uses the system default; or specify a browser app path (recommended for non-ASCII paths)." },
  "links.unsavedBrowserAction": { name: "With unsaved draft", desc: "Ask before opening in browser, or open the saved version only." },
  "editor.defaultMode": { name: "Default mode", desc: "Initial mode when opening an HTML file." },
  "editor.defaultTextMode": { name: "Default text granularity", desc: "Text segment or whole-paragraph editing." },
  "editor.historyLimit": { name: "Undo history limit", desc: "50\u20131000 transactions; also bounded by memory budget." },
  "editor.mergeDelayMs": { name: "Input merge window", desc: "Consecutive inputs merge into one undo within this window (300\u20132000ms)." },
  "editor.showChangeHighlights": { name: "Show change highlights", desc: "Highlight modified text on the page." },
  "editor.restoreFocusAfterSave": { name: "Restore focus after save", desc: "Restore the previous selection and editing position after saving." },
  "editor.toolbarPlacement": { name: "Toolbar location", desc: "Sidebar: the main view shows page content only, and mode/navigation controls sit at the top of the HTML sidebar panel. In view: keep the toolbar above the file view." },
  "search.includeHidden": { name: "Search hidden text", desc: "Hidden content is marked \u201Ccurrently hidden\u201D with source location." },
  "preview.defaultWidth": { name: "Default preview width", desc: "auto or 240\u20133840 CSS pixels." },
  "preview.defaultZoom": { name: "Default zoom", desc: "25%\u2013200%." },
  "preview.rememberViewport": { name: "Remember per-file viewport", desc: "Remember preview width and zoom per file (height follows the layout)." },
  "preview.rememberPosition": { name: "Remember reading position", desc: "Restore the last reading position when reopening." },
  "preview.positionLimit": { name: "Position memory limit", desc: "How many recent files keep reading positions." },
  "preview.autoRefreshAssets": { name: "Auto-refresh on asset change", desc: "Refresh the preview when linked CSS/images change." },
  "preview.allowNetworkAssets": { name: "Allow network assets", desc: "When off, remote images/styles/fonts are blocked; page scripts never run." },
  "drafts.enabled": { name: "Enable draft backup", desc: "Existing drafts are listed before turning off; save or discard first." },
  "drafts.debounceMs": { name: "Draft debounce", desc: "Milliseconds of idle before a draft snapshot is committed." },
  "drafts.maxWaitMs": { name: "Draft max wait", desc: "Maximum commit interval since the first pending write; not below debounce." },
  "drafts.storageWarningMiB": { name: "Draft size warning", desc: "Warn in the manager when total drafts exceed this size." },
  "drafts.closeBehavior": { name: "When closing a file", desc: "Keep drafts or ask each time; forced to ask when backup is off." },
  "saveAs.rebaseRelativeUrls": { name: "Rewrite relative references on save-as", desc: "Rewrite local relative src/href for the new directory when saving across folders." },
  "saveAs.openCopy": { name: "Open copy after saving", desc: "Open the copy automatically after saving." },
  "embeds.enabled": { name: "Enable HTML embeds", desc: "Process html-atelier code blocks in Markdown." },
  "embeds.defaultHeight": { name: "Embed default height", desc: "160\u20131600 pixels; can be overridden by block height." },
  "embeds.autoHeightMax": { name: "Auto-height cap", desc: "Maximum height when height is auto." },
  "embeds.showToolbar": { name: "Embed toolbar", desc: "Show file name, refresh and open-in-editor." },
  "embeds.showDrafts": { name: "Embeds show drafts", desc: "Mark \u201Cdraft\u201D in the embed header when unsaved changes exist." },
  "source.lineNumbers": { name: "Source line numbers", desc: "Show line numbers in the source editor." },
  "source.lineWrapping": { name: "Source soft wrap", desc: "Wrap long lines visually without changing them." },
  "source.previewDelayMs": { name: "Source refresh delay", desc: "Debounce from source edits to preview refresh (150\u20132000ms)." },
  "ui.language": { name: "Interface language", desc: "auto follows Obsidian; or force Chinese/English." }
};
var GROUP_NAMES_EN = {
  sidebar: "Sidebar",
  links: "Links",
  editor: "Editing",
  search: "Search",
  preview: "Preview",
  drafts: "Drafts",
  saveAs: "Save as",
  embeds: "Embeds",
  source: "Source",
  ui: "General"
};
function settingsText(group, key) {
  const path = key ? `${group}.${key}` : "";
  const zh = ZH[path];
  const en2 = EN[path];
  if (key) return zh && en2 ? { name: zh.name, desc: zh.desc } : null;
  return { name: GROUP_NAMES[group] ?? group, desc: "" };
}
function settingsTextEn(group, key) {
  const path = key ? `${group}.${key}` : "";
  const zh = ZH[path];
  const en2 = EN[path];
  if (key) return zh && en2 ? { name: en2.name, desc: en2.desc } : null;
  return { name: GROUP_NAMES_EN[group] ?? group, desc: "" };
}
var OPTIONS_ZH = {
  "sidebar.markdownTarget": { outline: "\u5C55\u793A\u539F\u751F\u5927\u7EB2", previous: "\u6062\u590D\u65E7\u9762\u677F", none: "\u4E0D\u52A8\u4F5C" },
  "sidebar.otherTarget": { previous: "\u6062\u590D\u65E7\u9762\u677F", none: "\u4E0D\u52A8\u4F5C" },
  "sidebar.defaultTab": { edit: "\u7F16\u8F91", outline: "\u5927\u7EB2", changes: "\u4FEE\u6539", resources: "\u8D44\u6E90" },
  "links.externalTarget": { browser: "\u7CFB\u7EDF\u6D4F\u89C8\u5668", "web-viewer": "\u5E94\u7528\u5185\u7F51\u9875\u67E5\u770B\u5668" },
  "links.internalTarget": { current: "\u5F53\u524D\u6807\u7B7E\u9875", "new-tab": "\u65B0\u6807\u7B7E\u9875" },
  "links.browserGesture": { Mod: "Ctrl/Cmd + \u70B9\u51FB", Alt: "Alt + \u70B9\u51FB", "Mod+Shift": "Ctrl/Cmd + Shift + \u70B9\u51FB", off: "\u5173\u95ED" },
  "links.unsavedBrowserAction": { ask: "\u5148\u8BE2\u95EE", saved: "\u53EA\u6253\u5F00\u5DF2\u4FDD\u5B58\u7684\u7248\u672C" },
  "editor.defaultMode": { preview: "\u9884\u89C8", edit: "\u7F16\u8F91", source: "\u6E90\u7801", split: "\u5206\u680F" },
  "editor.defaultTextMode": { segment: "\u6587\u5B57\u7247\u6BB5", paragraph: "\u6574\u6BB5" },
  "editor.toolbarPlacement": { sidebar: "\u4FA7\u680F\u9762\u677F", view: "\u89C6\u56FE\u5185" },
  "drafts.closeBehavior": { keep: "\u4FDD\u7559\u8349\u7A3F", ask: "\u6BCF\u6B21\u8BE2\u95EE" },
  "ui.language": { auto: "\u8DDF\u968F Obsidian", "zh-CN": "\u4E2D\u6587", en: "English" }
};
var OPTIONS_EN = {
  "sidebar.markdownTarget": { outline: "Show the native outline", previous: "Restore the previous panel", none: "Do nothing" },
  "sidebar.otherTarget": { previous: "Restore the previous panel", none: "Do nothing" },
  "sidebar.defaultTab": { edit: "Edit", outline: "Outline", changes: "Changes", resources: "Resources" },
  "links.externalTarget": { browser: "System browser", "web-viewer": "In-app web viewer" },
  "links.internalTarget": { current: "Current tab", "new-tab": "New tab" },
  "links.browserGesture": { Mod: "Ctrl/Cmd + click", Alt: "Alt + click", "Mod+Shift": "Ctrl/Cmd + Shift + click", off: "Off" },
  "links.unsavedBrowserAction": { ask: "Ask first", saved: "Open the saved version only" },
  "editor.defaultMode": { preview: "Preview", edit: "Edit", source: "Source", split: "Split" },
  "editor.defaultTextMode": { segment: "Text segment", paragraph: "Whole paragraph" },
  "editor.toolbarPlacement": { sidebar: "Sidebar panel", view: "In the view" },
  "drafts.closeBehavior": { keep: "Keep drafts", ask: "Ask each time" },
  "ui.language": { auto: "Follow Obsidian", "zh-CN": "Chinese", en: "English" }
};
var RESTORE_GROUP_TEXT = { zh: "\u6062\u590D\u672C\u7EC4\u9ED8\u8BA4", en: "Restore group defaults" };
function settingsOptions(group, key) {
  return OPTIONS_ZH[`${group}.${key}`] ?? null;
}
function settingsOptionsEn(group, key) {
  return OPTIONS_EN[`${group}.${key}`] ?? null;
}

// src/i18n/zh-CN.ts
var zhCN = {
  panelToggleReplace: "\u5C55\u5F00\u6216\u6536\u8D77\u66FF\u6362",
  // 通知
  noticeExtensionTakenOver: "HTML Atelier\uFF1A.{ext} \u5DF2\u88AB\u5176\u4ED6\u63D2\u4EF6\u63A5\u7BA1\u3002\u505C\u7528\u65E7 HTML \u63D2\u4EF6\u540E\u91CD\u542F\u5373\u53EF\u81EA\u52A8\u6253\u5F00\uFF0C\u4E5F\u53EF\u4F7F\u7528\u6587\u4EF6\u53F3\u952E\u83DC\u5355\u3002",
  noticeDraftRestored: "\u5DF2\u6062\u590D\u8BE5 HTML \u7684\u672A\u4FDD\u5B58\u6587\u6848\u8349\u7A3F\u3002",
  noticeDraftRestoredConflict: "HTML \u8349\u7A3F\u5DF2\u6062\u590D\uFF0C\u4F46\u539F\u6587\u4EF6\u5DF2\u53D8\u5316\u3002\u8BF7\u5148\u5904\u7406\u53F3\u4FA7\u680F\u4E2D\u7684\u51B2\u7A81\u3002",
  noticeSaved: "HTML \u6587\u6848\u5DF2\u4FDD\u5B58",
  noticeExternalConflict: "\u539F\u6587\u4EF6\u5DF2\u88AB\u5176\u4ED6\u7A0B\u5E8F\u4FEE\u6539\u3002\u5DF2\u963B\u6B62\u8986\u76D6\uFF0C\u4F60\u7684\u6587\u6848\u8349\u7A3F\u4ECD\u4FDD\u7559\u3002",
  noticeSaveFailed: "\u4FDD\u5B58\u5931\u8D25\uFF0C\u6587\u6848\u8349\u7A3F\u5DF2\u4FDD\u7559\u3002",
  noticeDraftExported: "\u5DF2\u53E6\u5B58\u8349\u7A3F\uFF1A{path}",
  noticeDraftPersistFailed: "HTML \u8349\u7A3F\u5907\u4EFD\u5931\u8D25\uFF0C\u8BF7\u53CA\u65F6\u4FDD\u5B58\u539F\u6587\u4EF6\u3002",
  noticeLinkUnsupported: "\u6B64\u9884\u89C8\u4EC5\u652F\u6301\u9875\u5185\u951A\u70B9\u548C\u7F51\u9875\u94FE\u63A5\u3002",
  noticeDraftReloadFailed: "\u8BFB\u53D6\u5931\u8D25\uFF0C\u8349\u7A3F\u4ECD\u4FDD\u7559\u3002",
  // 命令
  cmdShowPanel: "\u6253\u5F00 HTML \u53F3\u4FA7\u680F",
  cmdSaveHtml: "\u4FDD\u5B58\u5F53\u524D HTML",
  cmdToggleMode: "\u5207\u6362 HTML \u9884\u89C8 / \u7F16\u8F91",
  cmdOpenWithAtelier: "\u4F7F\u7528 HTML Atelier \u6253\u5F00",
  // 视图
  viewLoadFailed: "\u65E0\u6CD5\u8BFB\u53D6 HTML \u6587\u4EF6\u3002\u8BF7\u68C0\u67E5\u6587\u4EF6\u662F\u5426\u5B58\u5728\u3002",
  viewPreviewTitle: "{name} \u2014 HTML \u9884\u89C8",
  // 面板
  panelDisplayName: "HTML",
  panelModePreview: "\u9884\u89C8",
  panelModeEdit: "\u7F16\u8F91\u6587\u6848",
  panelUndo: "\u64A4\u9500",
  panelRedo: "\u91CD\u505A",
  panelSave: "\u4FDD\u5B58",
  panelSaving: "\u6B63\u5728\u4FDD\u5B58",
  panelTextLabel: "\u6587\u5B57\u5185\u5BB9",
  panelSectionText: "\u6587\u6848",
  panelHintLive: "\u4FEE\u6539\u5373\u65F6\u9884\u89C8 \xB7 \u4FDD\u5B58\u540E\u5199\u5165\u539F\u6587\u4EF6",
  panelSectionBefore: "\u4FDD\u5B58\u524D",
  panelRestore: "\u6062\u590D",
  panelRestoreAria: "\u6062\u590D\u5F53\u524D\u6587\u6848\u5230\u6700\u8FD1\u4E00\u6B21\u4FDD\u5B58",
  panelFooterHint: "\u70B9\u51FB\u9875\u9762\u4E2D\u7684\u5176\u4ED6\u6587\u5B57\uFF0C\u5207\u6362\u7F16\u8F91\u5BF9\u8C61\u3002",
  panelEmptyNoFile: "\u6253\u5F00\u4E00\u4E2A HTML \u6587\u4EF6\uFF0C\u5F00\u59CB\u9884\u89C8\u548C\u7F16\u8F91\u6587\u6848\u3002",
  panelEmptyPreviewMode: "\u6B63\u5728\u9884\u89C8\u3002\u5207\u6362\u5230\u300C\u7F16\u8F91\u6587\u6848\u300D\uFF0C\u70B9\u51FB\u9875\u9762\u6587\u5B57\u5373\u53EF\u4FEE\u6539\u3002",
  panelEmptyPick: "\u70B9\u51FB\u9875\u9762\u4E2D\u7684\u6807\u9898\u3001\u6BB5\u843D\u6216\u6309\u94AE\u6587\u5B57\u3002\u5D4C\u5957\u6837\u5F0F\u4E2D\u7684\u6587\u5B57\u5206\u6BB5\u7F16\u8F91\u3002",
  panelEmptyNoText: "\u672A\u627E\u5230\u53EF\u7F16\u8F91\u6587\u5B57\u3002\u6B64\u7248\u672C\u4E0D\u6267\u884C\u7F51\u9875\u811A\u672C\u3002",
  statusIdle: "\u9759\u6001 HTML \xB7 \u6587\u6848\u7F16\u8F91",
  statusSaving: "\u6B63\u5728\u4FDD\u5B58\u2026",
  statusConflict: "\u539F\u6587\u4EF6\u53D8\u5316 \xB7 \u8349\u7A3F\u4FDD\u7559",
  statusDirty: "{n} \u5904\u672A\u4FDD\u5B58 \xB7 \u81EA\u52A8\u4FDD\u7559\u8349\u7A3F",
  statusClean: "\u65E0\u672A\u4FDD\u5B58\u66F4\u6539",
  panelExportDraft: "\u53E6\u5B58\u8349\u7A3F",
  panelReloadOriginal: "\u91CD\u65B0\u8F7D\u5165\u539F\u6587\u4EF6",
  conflictExplanation: "\u539F\u6587\u4EF6\u5DF2\u53D8\u5316\u3002\u4E3A\u907F\u514D\u8986\u76D6\uFF0C\u8BF7\u5148\u53E6\u5B58\u6587\u6848\u8349\u7A3F\uFF0C\u518D\u91CD\u65B0\u8F7D\u5165\u539F\u6587\u4EF6\u3002",
  reloadTitle: "\u91CD\u65B0\u8F7D\u5165\u539F\u6587\u4EF6\uFF1F",
  reloadWarning: "\u8FD9\u4F1A\u653E\u5F03\u5F53\u524D\u6587\u4EF6\u7684\u5168\u90E8\u672A\u4FDD\u5B58\u6587\u6848\u3002\u9700\u8981\u4FDD\u7559\u65F6\uFF0C\u8BF7\u5148\u53D6\u6D88\u5E76\u4F7F\u7528\u300C\u53E6\u5B58\u8349\u7A3F\u300D\u3002",
  actionCancel: "\u53D6\u6D88",
  actionDiscardAndReload: "\u653E\u5F03\u4FEE\u6539\u5E76\u8F7D\u5165"
};
var zhCN2 = {
  // 工具栏
  tbBack: "\u540E\u9000",
  tbForward: "\u524D\u8FDB",
  tbPreview: "\u9884\u89C8",
  tbEdit: "\u7F16\u8F91",
  tbSource: "\u6E90\u7801",
  tbSplit: "\u5206\u680F",
  tbRefresh: "\u5237\u65B0\u9884\u89C8",
  tbWidth: "\u5BBD\u5EA6",
  tbZoom: "\u7F29\u653E",
  tbMore: "\u66F4\u591A",
  tbZoomReset: "\u6062\u590D 100%",
  tbSave: "\u4FDD\u5B58",
  tbUnsaved: "\u6709\u672A\u4FDD\u5B58\u4FEE\u6539",
  menuSaveAs: "\u53E6\u5B58\u4E3A\u2026",
  menuOpenBrowserCurrent: "\u5728\u6D4F\u89C8\u5668\u4E2D\u6253\u5F00\u5F53\u524D\u6587\u4EF6",
  menuCopyPageLink: "\u590D\u5236\u9875\u9762\u94FE\u63A5",
  menuCopySectionLink: "\u590D\u5236\u5F53\u524D\u7AE0\u8282\u94FE\u63A5",
  menuCopyEmbed: "\u590D\u5236 HTML \u5D4C\u5165\u4EE3\u7801",
  menuDraftManager: "\u8349\u7A3F\u7BA1\u7406\u2026",
  menuConflict: "\u51B2\u7A81\u5904\u7406\u2026",
  menuDisableSidebar: "\u5173\u95ED\u5168\u90E8\u4FA7\u680F\u81EA\u52A8\u884C\u4E3A",
  // 链接菜单/提示
  menuOpen: "\u6253\u5F00",
  menuOpenNewLeaf: "\u5728\u65B0\u6807\u7B7E\u9875\u6253\u5F00",
  menuOpenBrowser: "\u5728\u6D4F\u89C8\u5668\u4E2D\u6253\u5F00",
  menuCopyAddress: "\u590D\u5236\u5730\u5740",
  menuCopyRaw: "\u590D\u5236\u539F\u59CB\u5730\u5740",
  menuCopyNoteLink: "\u590D\u5236\u7B14\u8BB0\u94FE\u63A5",
  menuEditLink: "\u7F16\u8F91\u94FE\u63A5",
  menuRelink: "\u91CD\u65B0\u94FE\u63A5\u2026",
  noticeCopied: "\u5DF2\u590D\u5236",
  noticeWebViewerFallback: "\u7F51\u9875\u67E5\u770B\u5668\u4E0D\u53EF\u7528,\u5DF2\u5728\u7CFB\u7EDF\u6D4F\u89C8\u5668\u6253\u5F00\u3002",
  noticeLinkUnsupportedReason: "\u6B64\u94FE\u63A5\u65E0\u6CD5\u6253\u5F00({reason})\u3002\u53EF\u590D\u5236\u539F\u59CB\u5730\u5740\u3002",
  linkTargetMissing: "\u76EE\u6807\u4E0D\u5B58\u5728",
  noticeBrowserOpenFailed: "\u6D4F\u89C8\u5668\u6253\u5F00\u5931\u8D25:\u65E0\u6CD5\u786E\u5B9A\u6587\u4EF6\u4F4D\u7F6E\u3002",
  noticeBrowserOpenFailedWithCopy: "\u6D4F\u89C8\u5668\u6253\u5F00\u5931\u8D25\u3002\u53EF\u590D\u5236\u5730\u5740\u624B\u52A8\u6253\u5F00:{url}",
  noticeBrowserOpenVerify: "\u5DF2\u8C03\u7528\u7CFB\u7EDF\u6D4F\u89C8\u5668;\u82E5\u672A\u6253\u5F00,\u8BF7\u5728\u8BBE\u7F6E\u4E2D\u9009\u62E9\u6D4F\u89C8\u5668\u7A0B\u5E8F\u3002",
  noticeOutlineDisabled: "\u6838\u5FC3\u201C\u5927\u7EB2\u201D\u63D2\u4EF6\u672A\u542F\u7528;\u53EF\u5728\u8BBE\u7F6E \u2192 \u6838\u5FC3\u63D2\u4EF6\u4E2D\u5F00\u542F\u3002",
  statusHoverLocal: "\u672C\u5730:{target}",
  statusHoverRemote: "{host}",
  statusHoverMissing: "\u76EE\u6807\u4E0D\u5B58\u5728:{target}",
  relinkTitle: "\u91CD\u65B0\u94FE\u63A5",
  relinkPick: "\u9009\u62E9\u76EE\u6807\u6587\u4EF6",
  relinkCopy: "\u590D\u5236\u5730\u5740",
  // 模式/宽度/缩放
  widthAuto: "\u81EA\u9002\u5E94",
  widthDesktop: "\u684C\u9762 1440",
  widthTablet: "\u5E73\u677F 768",
  widthMobile: "\u624B\u673A 390",
  widthCustom: "\u81EA\u5B9A\u4E49\u2026",
  // 面板标签与状态
  tabEdit: "\u7F16\u8F91",
  tabOutline: "\u5927\u7EB2",
  tabChanges: "\u4FEE\u6539",
  tabResources: "\u8D44\u6E90",
  statusDraftPending: "\u5F85\u5907\u4EFD",
  statusDraftWriting: "\u6B63\u5728\u5907\u4EFD",
  statusDraftSaved: "\u8349\u7A3F\u5DF2\u5907\u4EFD",
  statusDraftFailed: "\u8349\u7A3F\u5907\u4EFD\u5931\u8D25",
  statusDraftDisabled: "\u5907\u4EFD\u5DF2\u5173\u95ED",
  statusConflict: "\u5B58\u5728\u5916\u90E8\u51B2\u7A81",
  statusConflictDraft: "\u5B58\u5728\u5916\u90E8\u51B2\u7A81 \xB7 \u8349\u7A3F\u5DF2\u5907\u4EFD",
  statusClean: "\u65E0\u672A\u4FDD\u5B58\u66F4\u6539",
  statusDirty: "{n} \u5904\u672A\u4FDD\u5B58",
  statusSaving: "\u6B63\u5728\u4FDD\u5B58\u2026",
  statusMerging: "\u6B63\u5728\u5E94\u7528\u5408\u5E76\u2026",
  formTextLabel: "\u6587\u5B57\u5185\u5BB9",
  formTextKind: "\u5BF9\u8C61\u7C7B\u578B",
  formRestore: "\u6062\u590D\u6B64\u9879",
  formHintSegment: "\u4FEE\u6539\u5373\u65F6\u9884\u89C8,\u4FDD\u5B58\u540E\u5199\u5165\u539F\u6587\u4EF6\u3002",
  formEmptyNoSelection: "\u70B9\u51FB\u9875\u9762\u4E2D\u7684\u6587\u5B57\u3001\u94FE\u63A5\u6216\u56FE\u7247,\u6216\u4ECE\u5927\u7EB2\u4E2D\u9009\u62E9\u5BF9\u8C61\u3002",
  formEmptyPreview: "\u6B63\u5728\u9884\u89C8\u3002\u5207\u6362\u5230\u300C\u7F16\u8F91\u300D\u540E\u70B9\u51FB\u9875\u9762\u6587\u5B57\u5373\u53EF\u4FEE\u6539\u3002",
  formLinkText: "\u94FE\u63A5\u6587\u5B57",
  formLinkHref: "\u94FE\u63A5\u5730\u5740",
  formLinkOpenTest: "\u6253\u5F00\u6D4B\u8BD5",
  formLinkResolved: "\u89E3\u6790\u7ED3\u679C",
  formLinkBrowse: "\u9009\u62E9\u5E93\u5185\u6587\u4EF6\u2026",
  formLinkTitle: "title \u63D0\u793A(\u53EF\u9009)",
  formImageSrc: "\u56FE\u7247\u5730\u5740",
  formImageAlt: "\u66FF\u4EE3\u6587\u672C(alt)",
  formImagePick: "\u9009\u62E9\u5E93\u5185\u56FE\u7247\u2026",
  formImageImport: "\u4ECE\u5916\u90E8\u5BFC\u5165\u2026",
  formImageResponsive: "\u6B64\u56FE\u7247\u4F4D\u4E8E picture/srcset \u54CD\u5E94\u5F0F\u7ED3\u6784\u4E2D",
  formImageReplaceSingle: "\u66FF\u6362\u4E3A\u5355\u4E00\u56FE\u7247",
  formParagraph: "\u6574\u6BB5\u7F16\u8F91",
  formParagraphHint: "\u5F53\u524D\u7F16\u8F91\u5355\u4E2A\u6BB5\u843D;Enter \u63D2\u5165\u6362\u884C\u3002",
  formSegment: "\u6587\u5B57\u7247\u6BB5",
  outlineTabOutline: "\u6807\u9898\u5927\u7EB2",
  outlineTabTexts: "\u6587\u6848\u5217\u8868",
  outlineFilterChanges: "\u53EA\u770B\u5DF2\u4FEE\u6539",
  outlineEmpty: "\u5F53\u524D\u8349\u7A3F\u6CA1\u6709\u6807\u9898\u6216\u53EF\u7F16\u8F91\u6587\u5B57\u3002",
  outlineHiddenMark: "(\u5F53\u524D\u4E0D\u53EF\u89C1)",
  outlineBlankRow: "(\u7A7A\u6BB5\u843D)",
  statusFileMissing: "\u6587\u4EF6\u5DF2\u4E22\u5931\u6216\u88AB\u79FB\u52A8\u3002",
  changesEmpty: "\u6CA1\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\u3002",
  changesRestoreAll: "\u5168\u90E8\u6062\u590D",
  changesRestoreOne: "\u6062\u590D",
  changesConfirmAll: "\u786E\u5B9A\u6062\u590D\u5168\u90E8 {n} \u5904\u4FEE\u6539?",
  changesKindText: "\u6587\u5B57",
  changesKindLink: "\u94FE\u63A5",
  changesKindImage: "\u56FE\u7247",
  changesKindStructure: "\u7ED3\u6784",
  changesKindSource: "\u6E90\u7801",
  changesLocation: "\u5B9A\u4F4D",
  resourcesRefresh: "\u91CD\u65B0\u52A0\u8F7D\u6E05\u5355",
  resourcesEmpty: "\u672A\u53D1\u73B0\u5F15\u7528\u8D44\u6E90\u3002",
  resourcesJumpSource: "\u6E90\u7801",
  resourcesStatusLocalOk: "\u5DF2\u52A0\u8F7D",
  resourcesStatusMissing: "\u7F3A\u5931",
  resourcesStatusRemote: "\u8FDC\u7A0B",
  resourcesStatusBlocked: "\u5DF2\u6309\u8BBE\u7F6E\u62E6\u622A",
  searchLabel: "\u641C\u7D22\u6587\u6848",
  searchPlaceholder: "\u641C\u7D22\u6587\u6848(\u8349\u7A3F\u8303\u56F4\u5185)\u2026",
  searchReplace: "\u66FF\u6362\u4E3A\u2026",
  searchReplaceAll: "\u5168\u90E8\u66FF\u6362",
  searchSkipped: "{n} \u5904\u8DE8\u683C\u5F0F\u547D\u4E2D\u5DF2\u8DF3\u8FC7(\u53EF\u7528\u6574\u6BB5\u7F16\u8F91\u5904\u7406)",
  searchCase: "\u533A\u5206\u5927\u5C0F\u5199",
  searchPrev: "\u4E0A\u4E00\u5904",
  searchNext: "\u4E0B\u4E00\u5904",
  searchCount: "{i}/{n}",
  searchNoResults: "\u65E0\u7ED3\u679C",
  searchHidden: "\u5305\u62EC\u9690\u85CF\u6587\u5B57",
  noticeParagraphUnavailable: "\u8BE5\u6BB5\u843D\u6682\u4E0D\u80FD\u6574\u6BB5\u7F16\u8F91(\u6587\u5B57\u4E0E\u6E90\u7801\u65E0\u6CD5\u5BF9\u9F50),\u8BF7\u6539\u7528\u6587\u5B57\u7247\u6BB5\u7F16\u8F91\u3002",
  sourceLocatePreview: "\u5B9A\u4F4D\u5230\u9884\u89C8",
  sourceLocateSource: "\u5B9A\u4F4D\u5230\u6E90\u7801",
  // 模态
  conflictTitle: "\u4E09\u65B9\u5408\u5E76",
  conflictLocal: "\u6211\u7684\u8349\u7A3F",
  conflictRemote: "\u78C1\u76D8\u7248\u672C",
  conflictBase: "\u5171\u540C\u57FA\u51C6",
  conflictKeepMine: "\u4FDD\u7559\u6211\u7684",
  conflictUseDisk: "\u4F7F\u7528\u78C1\u76D8",
  conflictEdit: "\u624B\u52A8\u7F16\u8F91",
  conflictApply: "\u5E94\u7528\u5408\u5E76",
  conflictUseDiskVersion: "\u4F7F\u7528\u78C1\u76D8\u7248\u672C(\u653E\u5F03\u8349\u7A3F)",
  conflictCancel: "\u53D6\u6D88",
  conflictExpired: "\u6587\u4EF6\u6216\u8349\u7A3F\u5DF2\u53D8\u5316,\u8BF7\u91CD\u65B0\u6BD4\u8F83\u3002",
  conflictRecompare: "\u91CD\u65B0\u6BD4\u8F83",
  conflictSummary: "\u65E0\u51B2\u7A81 {n} \u5904\u5C06\u5408\u5E76",
  conflictCount: "\u51B2\u7A81 {n} \u5904",
  draftManagerTitle: "\u8349\u7A3F\u7BA1\u7406",
  draftManagerEmpty: "\u5F53\u524D\u6CA1\u6709\u8349\u7A3F\u3002",
  draftManagerOpen: "\u6253\u5F00\u539F\u6587\u4EF6",
  draftManagerDiscard: "\u4E22\u5F03\u6240\u9009\u8349\u7A3F",
  draftManagerSearch: "\u641C\u7D22\u8349\u7A3F\u2026",
  draftManagerStatusConflict: "\u51B2\u7A81",
  draftManagerStatusMissing: "\u539F\u6587\u4EF6\u7F3A\u5931",
  draftManagerStatusNormal: "\u6B63\u5E38",
  draftManagerConfirmDiscard: "\u786E\u5B9A\u4E22\u5F03\u6240\u9009 {n} \u4EFD\u8349\u7A3F?\u539F\u6587\u4EF6\u4E0D\u53D7\u5F71\u54CD\u3002",
  draftManagerStorageWarning: "\u8349\u7A3F\u603B\u91CF\u7EA6 {total}MiB,\u5DF2\u8D85\u8FC7\u63D0\u9192\u9608\u503C {limit}MiB;\u5EFA\u8BAE\u6E05\u7406\u4E0D\u518D\u9700\u8981\u7684\u8349\u7A3F\u3002",
  draftsAskOnClose: "{path} \u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539;\u73B0\u5728\u5199\u5165\u6587\u4EF6\u5417?(\u53D6\u6D88\u5219\u4FDD\u7559\u8349\u7A3F)",
  saveAsTitle: "\u53E6\u5B58\u4E3A",
  saveAsName: "\u6587\u4EF6\u540D",
  saveAsFolder: "\u6587\u4EF6\u5939",
  saveAsRebase: "\u4FDD\u6301\u8D44\u6E90\u4E0E\u94FE\u63A5\u6307\u5411",
  saveAsOpen: "\u4FDD\u5B58\u540E\u6253\u5F00\u526F\u672C",
  saveAsIsDraft: "\u4FDD\u5B58\u7684\u662F\u5F53\u524D\u8349\u7A3F(\u542B\u672A\u4FDD\u5B58\u4FEE\u6539)",
  saveAsSave: "\u4FDD\u5B58\u526F\u672C",
  // 与 saveAsRebase(复选框标签)分开:同一条文案既当"保持指向"又当"未能保持的计数"会让用户读反
  saveAsUnresolved: "{n} \u5904\u5F15\u7528\u672A\u80FD\u91CD\u5199,\u8BF7\u5728\u526F\u672C\u4E2D\u624B\u52A8\u8C03\u6574",
  noticeSaveAsFailed: "\u53E6\u5B58\u4E3A\u5931\u8D25:\u65E0\u6CD5\u91CD\u5199\u5F15\u7528,\u526F\u672C\u672A\u521B\u5EFA\u3002",
  noticeFileMissing: "\u539F\u6587\u4EF6\u5DF2\u4E22\u5931,\u65E0\u6CD5\u4FDD\u5B58;\u8BF7\u7528\u300C\u53E6\u5B58\u4E3A\u300D\u6062\u590D\u3002",
  linksConfirmOpenUnsaved: "\u5F53\u524D\u8349\u7A3F\u5C1A\u672A\u4FDD\u5B58;\u4ECD\u8981\u5728\u6D4F\u89C8\u5668\u4E2D\u6253\u5F00\u5417?",
  noticeNoAnchor: "\u5F53\u524D\u6CA1\u6709\u9009\u4E2D\u951A\u70B9,\u672A\u590D\u5236\u4EFB\u4F55\u5185\u5BB9\u3002",
  noticeMergeNotSaved: "\u5408\u5E76\u7ED3\u679C\u5DF2\u5E94\u7528\u5230\u8349\u7A3F\u4F46\u672A\u80FD\u5199\u5165\u78C1\u76D8;\u8349\u7A3F\u5DF2\u5907\u4EFD,\u53EF\u7A0D\u540E\u91CD\u8BD5\u3002",
  noticeMergeBusy: "\u6B63\u5728\u4FDD\u5B58,\u8BF7\u7A0D\u540E\u518D\u5E94\u7528\u5408\u5E76\u3002",
  noticeSaveBusy: "\u6B63\u5728\u4FDD\u5B58\u6216\u5408\u5E76,\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002",
  conflictDiskMissing: "\u539F\u6587\u4EF6\u5DF2\u4E22\u5931,\u65E0\u6CD5\u91C7\u7528\u78C1\u76D8\u7248\u672C;\u8349\u7A3F\u5DF2\u4FDD\u7559,\u53EF\u7A0D\u540E\u53E6\u5B58\u6062\u590D\u3002",
  noticePatchRejected: "\u4FEE\u6539\u672A\u5E94\u7528:\u4E0E\u76F8\u90BB\u4FEE\u6539\u51B2\u7A81,\u8BF7\u5206\u5F00\u5904\u7406\u3002",
  relinkChoose: "\u9009\u62E9\u65B0\u7684\u94FE\u63A5\u76EE\u6807",
  imageImportTitle: "\u5BFC\u5165\u56FE\u7247\u5230\u5E93",
  imageImportPick: "\u9009\u62E9\u6587\u4EF6\u5939\u2026",
  imageImportDone: "\u5DF2\u5BFC\u5165:{path}",
  noticeAnchorCopied: "\u5DF2\u590D\u5236;\u6CE8\u610F:\u951A\u70B9\u5C1A\u672A\u4FDD\u5B58\u5230\u6587\u4EF6\u3002",
  noticeAnchorAdded: "\u5DF2\u6DFB\u52A0\u951A\u70B9(\u53EF\u64A4\u9500),\u5C1A\u672A\u4FDD\u5B58\u3002",
  commandInsertEmbed: "\u63D2\u5165 HTML \u5D4C\u5165",
  embedPickFile: "\u9009\u62E9 HTML \u6587\u4EF6\u2026",
  panelNoActiveHtml: "\u5F53\u524D\u672A\u6FC0\u6D3B HTML \u6587\u4EF6\u3002",
  panelOpenRecent: "\u6253\u5F00\u6700\u8FD1:{path}",
  previewUpdating: "\u9884\u89C8\u6B63\u5728\u66F4\u65B0\u2026",
  bigFileMode: "\u5927\u6587\u4EF6\u6A21\u5F0F:\u5DF2\u964D\u4F4E\u5B9E\u65F6\u6027\u4EE5\u4FDD\u8BC1\u6D41\u7545\u3002",
  sourcePreviewDelay: "\u6E90\u7801\u53D8\u66F4\u540E\u81EA\u52A8\u5237\u65B0\u9884\u89C8",
  sourceLineNumbers: "\u884C\u53F7",
  sourceWrap: "\u8F6F\u6362\u884C"
};
var zhCNAll = { ...zhCN, ...zhCN2 };

// src/i18n/en-v2.ts
var enV2 = {
  tbBack: "Back",
  tbForward: "Forward",
  tbPreview: "Preview",
  tbEdit: "Edit",
  tbSource: "Source",
  tbSplit: "Split",
  tbRefresh: "Refresh preview",
  tbWidth: "Width",
  tbZoom: "Zoom",
  tbMore: "More",
  tbZoomReset: "Reset 100%",
  tbSave: "Save",
  tbUnsaved: "Unsaved changes",
  menuSaveAs: "Save as\u2026",
  menuOpenBrowserCurrent: "Open current file in browser",
  menuCopyPageLink: "Copy page link",
  menuCopySectionLink: "Copy section link",
  menuCopyEmbed: "Copy HTML embed code",
  menuDraftManager: "Draft manager\u2026",
  menuConflict: "Conflict resolution\u2026",
  menuDisableSidebar: "Disable all sidebar automation",
  menuOpen: "Open",
  menuOpenNewLeaf: "Open in new tab",
  menuOpenBrowser: "Open in browser",
  menuCopyAddress: "Copy address",
  menuCopyRaw: "Copy raw address",
  menuCopyNoteLink: "Copy note link",
  menuEditLink: "Edit link",
  menuRelink: "Relink\u2026",
  noticeCopied: "Copied",
  noticeWebViewerFallback: "Web viewer unavailable; opened in system browser.",
  noticeLinkUnsupportedReason: "This link cannot be opened ({reason}). You can copy the raw address.",
  linkTargetMissing: "target missing",
  noticeBrowserOpenFailed: "Failed to open in browser: cannot determine file location.",
  noticeBrowserOpenFailedWithCopy: "Failed to open in browser. Copy the address to open manually: {url}",
  noticeBrowserOpenVerify: "Invoked the system browser; if nothing opened, choose a browser app in settings.",
  noticeOutlineDisabled: "The core Outline plugin is disabled; enable it in Settings \u2192 Core plugins.",
  statusHoverLocal: "Local: {target}",
  statusHoverRemote: "{host}",
  statusHoverMissing: "Missing target: {target}",
  relinkTitle: "Relink",
  relinkPick: "Choose target file",
  relinkCopy: "Copy address",
  widthAuto: "Auto",
  widthDesktop: "Desktop 1440",
  widthTablet: "Tablet 768",
  widthMobile: "Mobile 390",
  widthCustom: "Custom\u2026",
  tabEdit: "Edit",
  tabOutline: "Outline",
  tabChanges: "Changes",
  tabResources: "Resources",
  statusDraftPending: "Draft pending",
  statusDraftWriting: "Backing up draft",
  statusDraftSaved: "Draft backed up",
  statusDraftFailed: "Draft backup failed",
  statusDraftDisabled: "Draft backup off",
  statusConflict: "External conflict",
  statusConflictDraft: "External conflict \xB7 draft backed up",
  statusClean: "No unsaved changes",
  statusDirty: "{n} unsaved",
  statusSaving: "Saving\u2026",
  statusMerging: "Applying merge\u2026",
  formTextLabel: "Text content",
  formTextKind: "Object type",
  formRestore: "Restore this",
  formHintSegment: "Edits preview instantly; written on save.",
  formEmptyNoSelection: "Click text, a link or an image on the page, or pick an object from the outline.",
  formEmptyPreview: "Previewing. Switch to \u201CEdit\u201D and click page text to modify.",
  formLinkText: "Link text",
  formLinkHref: "Link address",
  formLinkOpenTest: "Open test",
  formLinkResolved: "Resolved target",
  formLinkBrowse: "Choose library file\u2026",
  formLinkTitle: "title tooltip (optional)",
  formImageSrc: "Image address",
  formImageAlt: "Alternative text (alt)",
  formImagePick: "Choose library image\u2026",
  formImageImport: "Import from outside\u2026",
  formImageResponsive: "This image is inside a picture/srcset responsive structure",
  formImageReplaceSingle: "Replace with a single image",
  formParagraph: "Paragraph editing",
  formParagraphHint: "Editing a single paragraph; Enter inserts a line break.",
  formSegment: "Text segment",
  outlineTabOutline: "Headings",
  outlineTabTexts: "Text list",
  outlineFilterChanges: "Modified only",
  outlineEmpty: "No headings or editable text in the current draft.",
  outlineHiddenMark: "(currently hidden)",
  outlineBlankRow: "(blank paragraph)",
  statusFileMissing: "This file was deleted or moved.",
  changesEmpty: "No unsaved changes.",
  changesRestoreAll: "Restore all",
  changesRestoreOne: "Restore",
  changesConfirmAll: "Restore all {n} changes?",
  changesKindText: "Text",
  changesKindLink: "Link",
  changesKindImage: "Image",
  changesKindStructure: "Structure",
  changesKindSource: "Source",
  changesLocation: "Locate",
  resourcesRefresh: "Reload list",
  resourcesEmpty: "No referenced resources.",
  resourcesJumpSource: "Source",
  resourcesStatusLocalOk: "Loaded",
  resourcesStatusMissing: "Missing",
  resourcesStatusRemote: "Remote",
  resourcesStatusBlocked: "Blocked by setting",
  searchLabel: "Search text",
  searchPlaceholder: "Search text (draft scope)\u2026",
  searchReplace: "Replace with\u2026",
  searchReplaceAll: "Replace all",
  searchSkipped: "{n} cross-format hits skipped (use paragraph editing)",
  searchCase: "Match case",
  searchPrev: "Previous",
  searchNext: "Next",
  searchCount: "{i}/{n}",
  searchNoResults: "No results",
  searchHidden: "Include hidden text",
  noticeParagraphUnavailable: "Whole-paragraph editing is unavailable for this paragraph (text cannot be aligned to source). Use segment editing instead.",
  sourceLocatePreview: "Reveal in preview",
  sourceLocateSource: "Reveal in source",
  conflictTitle: "Three-way merge",
  conflictLocal: "My draft",
  conflictRemote: "Disk version",
  conflictBase: "Common base",
  conflictKeepMine: "Keep mine",
  conflictUseDisk: "Use disk",
  conflictEdit: "Edit manually",
  conflictApply: "Apply merge",
  conflictUseDiskVersion: "Use disk version (discard draft)",
  conflictCancel: "Cancel",
  conflictExpired: "File or draft changed; please compare again.",
  conflictRecompare: "Compare again",
  conflictSummary: "{n} non-conflicting parts will merge",
  conflictCount: "{n} conflicts",
  draftManagerTitle: "Draft manager",
  draftManagerEmpty: "No drafts.",
  draftManagerOpen: "Open original",
  draftManagerDiscard: "Discard selected drafts",
  draftManagerSearch: "Search drafts\u2026",
  draftManagerStatusConflict: "Conflict",
  draftManagerStatusMissing: "Original missing",
  draftManagerStatusNormal: "Normal",
  draftManagerConfirmDiscard: "Discard {n} selected drafts? Original files are not touched.",
  draftManagerStorageWarning: "Drafts total about {total}MiB, over the {limit}MiB warning threshold; consider deleting drafts you no longer need.",
  draftsAskOnClose: "{path} has unsaved changes. Write them to the file now? (Cancel keeps the draft)",
  saveAsTitle: "Save as",
  saveAsName: "File name",
  saveAsFolder: "Folder",
  saveAsRebase: "Keep resources and links pointing at originals",
  saveAsOpen: "Open the copy after saving",
  saveAsIsDraft: "Saves the current draft (including unsaved changes)",
  saveAsSave: "Save copy",
  saveAsUnresolved: "{n} reference(s) could not be rewritten; fix them in the copy",
  noticeSaveAsFailed: "Save-as failed: references could not be rewritten, no copy was created.",
  noticeFileMissing: 'The original file is gone and cannot be saved; use "Save as" to recover it.',
  linksConfirmOpenUnsaved: "This draft has unsaved changes; still open it in the browser?",
  noticeNoAnchor: "No anchor is selected, so nothing was copied.",
  noticeMergeNotSaved: "The merge was applied to the draft but not written to disk; the draft is backed up, retry later.",
  noticeMergeBusy: "A save is in progress; apply the merge again in a moment.",
  noticeSaveBusy: "A save or merge is in progress; try again in a moment.",
  conflictDiskMissing: "The original file is gone, so the disk version cannot be used; your draft is kept and can be restored with Save as.",
  noticePatchRejected: "Edit not applied: it conflicts with an adjacent edit. Please apply them separately.",
  relinkChoose: "Choose the new link target",
  imageImportTitle: "Import image into vault",
  imageImportPick: "Choose folder\u2026",
  imageImportDone: "Imported: {path}",
  noticeAnchorCopied: "Copied. Note: the anchor is not saved to the file yet.",
  noticeAnchorAdded: "Anchor added (undoable), not saved yet.",
  commandInsertEmbed: "Insert HTML embed",
  embedPickFile: "Choose an HTML file\u2026",
  panelNoActiveHtml: "No HTML file is active.",
  panelOpenRecent: "Open recent: {path}",
  previewUpdating: "Preview updating\u2026",
  bigFileMode: "Large file mode: reduced interactivity for smoothness.",
  sourcePreviewDelay: "Auto-refresh preview after source edits",
  sourceLineNumbers: "Line numbers",
  sourceWrap: "Soft wrap"
};

// src/i18n/en.ts
var enBase = {
  panelToggleReplace: "Show or hide replace",
  noticeExtensionTakenOver: "HTML Atelier: the .{ext} extension is handled by another plugin. Disable the old HTML plugin and restart to open files automatically, or use the file context menu.",
  noticeDraftRestored: "Restored the unsaved text draft for this HTML.",
  noticeDraftRestoredConflict: "HTML draft restored, but the original file has changed. Resolve the conflict in the sidebar first.",
  noticeSaved: "HTML text saved",
  noticeExternalConflict: "The original file was modified by another program. Overwrite blocked; your text draft is preserved.",
  noticeSaveFailed: "Save failed. Your text draft is preserved.",
  noticeDraftExported: "Draft exported: {path}",
  noticeDraftPersistFailed: "HTML draft backup failed. Save the original file promptly.",
  noticeLinkUnsupported: "This preview supports in-page anchors and web links only.",
  noticeDraftReloadFailed: "Failed to read the file. Draft preserved.",
  cmdShowPanel: "Open HTML sidebar",
  cmdSaveHtml: "Save current HTML",
  cmdToggleMode: "Toggle HTML preview / edit",
  cmdOpenWithAtelier: "Open with HTML Atelier",
  viewLoadFailed: "Cannot read the HTML file. Check that the file exists.",
  viewPreviewTitle: "{name} \u2014 HTML preview",
  panelDisplayName: "HTML",
  panelModePreview: "Preview",
  panelModeEdit: "Edit text",
  panelUndo: "Undo",
  panelRedo: "Redo",
  panelSave: "Save",
  panelSaving: "Saving",
  panelTextLabel: "Text content",
  panelSectionText: "Text",
  panelHintLive: "Edits preview instantly \xB7 Saved only when you save",
  panelSectionBefore: "Before save",
  panelRestore: "Restore",
  panelRestoreAria: "Restore current text to the last save",
  panelFooterHint: "Click other text on the page to switch the editing target.",
  panelEmptyNoFile: "Open an HTML file to preview and edit its text.",
  panelEmptyPreviewMode: "Previewing. Switch to \u201CEdit text\u201D, then click page text to modify it.",
  panelEmptyPick: "Click a heading, paragraph or button text on the page. Nested inline text is edited per segment.",
  panelEmptyNoText: "No editable text found. This version does not run page scripts.",
  statusIdle: "Static HTML \xB7 text editing",
  statusSaving: "Saving\u2026",
  statusConflict: "Original file changed \xB7 draft preserved",
  statusDirty: "{n} unsaved changes \xB7 draft kept automatically",
  statusClean: "No unsaved changes",
  panelExportDraft: "Export draft",
  panelReloadOriginal: "Reload original file",
  conflictExplanation: "The original file has changed. To avoid overwriting, export the draft first, then reload the original.",
  reloadTitle: "Reload original file?",
  reloadWarning: "This discards all unsaved text for the file. To keep it, cancel and use \u201CExport draft\u201D first.",
  actionCancel: "Cancel",
  actionDiscardAndReload: "Discard changes and reload"
};
var en = { ...enBase, ...enV2 };

// src/i18n/index.ts
function resolveLocale(pref, hostLanguage) {
  if (pref !== "auto") return pref;
  const lang = (hostLanguage ?? "").toLowerCase();
  if (lang.startsWith("zh")) return "zh-CN";
  return "en";
}
function createTranslator(locale) {
  const dict = locale === "zh-CN" ? zhCNAll : en;
  return (key, params) => {
    let text = dict[key] ?? zhCNAll[key] ?? String(key);
    if (params) for (const [k, v] of Object.entries(params)) text = text.split(`{${k}}`).join(String(v));
    return text;
  };
}

// src/settings/tab.ts
var AtelierSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin, get, set) {
    super(app, plugin);
    this.get = get;
    this.set = set;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    const current = structuredCloneProxy(this.get());
    const hostLang = window.moment?.locale() ?? "zh";
    const useEn = resolveLocale(current.ui.language, hostLang) === "en";
    const text = (g, k) => useEn ? settingsTextEn(g, k) : settingsText(g, k);
    const groups = [
      ["sidebar", ["autoShowHtml", "closeOnLeave", "markdownTarget", "otherTarget", "respectManualCollapse", "defaultTab"]],
      ["links", ["externalTarget", "internalTarget", "respectBlankTarget", "browserGesture", "showHoverTarget", "browserApplication", "unsavedBrowserAction"]],
      ["editor", ["defaultMode", "defaultTextMode", "toolbarPlacement", "historyLimit", "mergeDelayMs", "showChangeHighlights", "restoreFocusAfterSave"]],
      ["search", ["includeHidden"]],
      ["preview", ["defaultWidth", "defaultZoom", "rememberViewport", "rememberPosition", "positionLimit", "autoRefreshAssets", "allowNetworkAssets"]],
      ["drafts", ["enabled", "debounceMs", "maxWaitMs", "storageWarningMiB", "closeBehavior"]],
      ["saveAs", ["rebaseRelativeUrls", "openCopy"]],
      ["embeds", ["enabled", "defaultHeight", "autoHeightMax", "showToolbar", "showDrafts"]],
      ["source", ["lineNumbers", "lineWrapping", "previewDelayMs"]],
      ["ui", ["language"]]
    ];
    const save = () => this.set(current);
    for (const [group, keys] of groups) {
      const head = new import_obsidian.Setting(containerEl).setName(text(group, "")?.name ?? group).setHeading();
      const restore = containerEl.createEl("button", { cls: "html-atelier-restoregroup", attr: { type: "button" }, text: useEn ? RESTORE_GROUP_TEXT.en : RESTORE_GROUP_TEXT.zh });
      restore.addEventListener("click", () => {
        current[group] = structuredClone(DEFAULT_SETTINGS[group]);
        save();
        this.display();
      });
      void head;
      for (const key of keys) {
        const text2 = text(group, key) ?? { name: key, desc: "" };
        const path = `${group}.${key}`;
        const setting = new import_obsidian.Setting(containerEl).setName(text2.name).setDesc(text2.desc);
        const value = () => getByPath(current, path);
        const write = (v) => {
          setByPath(current, path, v);
          save();
        };
        const def = getByPath(DEFAULT_SETTINGS, path);
        const freeText = group === "links" && key === "browserApplication" || group === "preview" && key === "defaultWidth";
        if (typeof def === "boolean") {
          setting.addToggle((t) => t.setValue(!!value()).onChange((v) => write(v)));
        } else if (typeof def === "number") {
          setting.addText((tx) => {
            tx.setValue(String(value())).onChange((v) => {
              const raw = v.trim();
              if (raw === "") return;
              const n = Number(raw);
              if (Number.isFinite(n)) write(n);
            });
          });
        } else if (freeText) {
          setting.addText((tx) => {
            tx.setValue(String(value())).onChange((v) => write(v));
          });
        } else {
          const optionLabels = (useEn ? settingsOptionsEn : settingsOptions)(group, key) ?? {};
          const options = Object.keys(optionLabels);
          setting.addDropdown((d) => {
            for (const opt of options) d.addOption(opt, optionLabels[opt]);
            if (!options.length) d.addOption(String(def), String(def));
            d.setValue(String(value())).onChange((v) => write(v));
          });
        }
      }
    }
  }
};
function structuredCloneProxy(v) {
  return JSON.parse(JSON.stringify(v));
}
function getByPath(obj, path) {
  const [g, k] = path.split(".");
  const group = obj[g];
  return group?.[k];
}
function setByPath(obj, path, value) {
  const [g, k] = path.split(".");
  const group = obj[g];
  if (group) group[k] = value;
}

// src/services/links.ts
var import_obsidian2 = require("obsidian");
var UNSAFE_PROTOCOL = /^(javascript|vbscript|file|data:text\/html)/i;
function decodeOnce(s) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}
function resolveLink(app, raw, sourcePath) {
  const href = raw.trim();
  const hashIdx = href.indexOf("#");
  const qIdx = href.indexOf("?");
  const fragStart = hashIdx >= 0 ? hashIdx : href.length;
  const queryStart = qIdx >= 0 && qIdx < fragStart ? qIdx : fragStart;
  const target = decodeOnce(href.slice(0, Math.min(queryStart, fragStart)));
  const query = queryStart < fragStart ? href.slice(queryStart, fragStart) : "";
  const fragment = hashIdx >= 0 ? href.slice(hashIdx) : "";
  const base = { kind: "unsupported", raw: href, target, query, fragment, file: null };
  if (!href || href === "#") {
    return { ...base, kind: "empty", target: "" };
  }
  const out = { ...base, target, query, fragment };
  if (!target) {
    return { ...out, kind: "anchor" };
  }
  if (UNSAFE_PROTOCOL.test(target)) {
    return { ...out, reason: "unsupported-protocol" };
  }
  if (/^(https?):\/\//i.test(target)) {
    return { ...out, kind: "http" };
  }
  if (target.startsWith("//")) return { ...out, kind: "http", target: `https:${target}` };
  if (/^mailto:/i.test(target)) {
    return { ...out, kind: "mailto" };
  }
  if (/^obsidian:/i.test(target)) {
    return { ...out, kind: "obsidian" };
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(target)) {
    return { ...out, reason: "unsupported-protocol" };
  }
  let path = target.replace(/\\/g, "/");
  if (path.startsWith("/")) path = path.slice(1);
  else {
    const dir = sourcePath.includes("/") ? sourcePath.slice(0, sourcePath.lastIndexOf("/") + 1) : "";
    path = dir + path;
  }
  const parts = [];
  for (const part of path.split("/")) {
    if (part === "." || part === "") continue;
    if (part === "..") {
      parts.pop();
      continue;
    }
    parts.push(part);
  }
  const norm = parts.join("/");
  const file = app.vault.getAbstractFileByPath(norm);
  if (file instanceof import_obsidian2.TFile) {
    const ext = file.extension.toLowerCase();
    if (ext === "html" || ext === "htm") return { ...out, kind: "library-html", file };
    if (ext === "md") return { ...out, kind: "markdown", file };
    return { ...out, kind: "library-file", file };
  }
  return { ...out, reason: "not-found", target: norm };
}
function electronBrowserLauncher(getSettings) {
  async function openViaShell(url) {
    const { shell } = require("electron");
    await shell.openExternal(url);
  }
  return {
    async open(url) {
      const configured = (getSettings?.().links.browserApplication ?? "").trim();
      if (configured && configured.toLowerCase() !== "auto") {
        try {
          const { spawn } = require("child_process");
          spawn(configured, [url], { detached: true, stdio: "ignore" }).on?.("error", () => {
            void openViaShell(url);
          });
          return;
        } catch {
        }
      }
      await openViaShell(url);
    }
  };
}
var LinkRouter = class {
  constructor(app, settings, t, browser, openHtml, openLibraryFile) {
    this.app = app;
    this.settings = settings;
    this.t = t;
    this.browser = browser;
    this.openHtml = openHtml;
    this.openLibraryFile = openLibraryFile;
  }
  // F02:按分类路由。返回是否已处理。
  async open(resolved, opts) {
    const st = this.settings();
    switch (resolved.kind) {
      case "anchor": {
        if (!resolved.fragment) return;
        this.openHtml("", resolved.fragment, false);
        break;
      }
      case "library-html":
        this.openHtml(resolved.file.path, resolved.fragment, opts.newLeaf || st.links.internalTarget === "new-tab");
        break;
      case "markdown":
        await this.app.workspace.openLinkText(resolved.file.path, resolved.fragment.slice(1) || "", opts.newLeaf);
        break;
      case "library-file":
        if (opts.newLeaf || st.links.internalTarget === "new-tab") this.openLibraryFile(resolved.file, true);
        else this.openLibraryFile(resolved.file, false);
        break;
      case "http": {
        if (opts.inAppExternal && st.links.externalTarget === "web-viewer") {
          const wv = this.app.internalPlugins?.getPluginById("webviewer");
          if (wv?.enabled) {
            const leaf = this.app.workspace.getLeaf(true);
            await leaf.setViewState({ type: "webviewer", state: { url: resolved.target } });
            break;
          }
          new import_obsidian2.Notice(this.t("noticeWebViewerFallback"));
        }
        await this.browser.open(resolved.target);
        break;
      }
      case "mailto":
        await this.browser.open(resolved.target);
        break;
      case "unsupported":
        new import_obsidian2.Notice(this.t("noticeLinkUnsupportedReason", { reason: resolved.reason === "unsupported-protocol" ? resolved.target.split(":")[0] : this.t("linkTargetMissing") }));
        break;
      case "empty":
        break;
      case "obsidian":
        await this.browser.open(resolved.raw);
        break;
    }
  }
  // 浏览器手势(browserGesture)的执行入口:与右键菜单同权——只对菜单里提供
  // "在浏览器中打开"的类别生效(http/mailto 用原 URL,库内 HTML 用 file URL),
  // 其余类别(锚点/笔记/库内文件)返回 false,由调用方回落普通路由。
  // 此前手势分支只是原样调 router.open,库内 HTML 仍在插件内打开,设置承诺落空。
  openInBrowser(resolved) {
    if (resolved.kind === "http" || resolved.kind === "mailto") {
      void this.browser.open(resolved.target);
      return true;
    }
    if (resolved.kind === "library-html" && resolved.file) {
      void this.openHtmlInBrowser(resolved);
      return true;
    }
    return false;
  }
  // F03:链接右键菜单。
  showMenu(event, resolved, opts) {
    const menu = new import_obsidian2.Menu();
    const st = this.settings();
    const t = this.t;
    const addLocal = (label, icon, run) => menu.addItem((i) => {
      i.setTitle(label).setIcon(icon).onClick(() => run());
    });
    if (resolved.kind === "anchor" || resolved.kind === "library-html" || resolved.kind === "empty") {
      addLocal(t("menuOpen"), st.links.internalTarget === "new-tab" ? "external-link" : "file", opts.onOpenCurrent);
      addLocal(t("menuOpenNewLeaf"), "external-link", opts.onOpenNew);
    }
    if (resolved.kind === "http" || resolved.kind === "mailto") {
      addLocal(t("menuOpenBrowser"), "globe", () => {
        void this.browser.open(resolved.target);
      });
    } else if (resolved.kind === "library-html") {
      addLocal(t("menuOpenBrowser"), "globe", () => {
        void this.openHtmlInBrowser(resolved);
      });
    }
    menu.addSeparator();
    addLocal(t("menuCopyAddress"), "copy", () => {
      void this.copyAddress(resolved, false);
    });
    addLocal(t("menuCopyRaw"), "clipboard-copy", () => {
      void navigator.clipboard.writeText(resolved.raw).then(() => new import_obsidian2.Notice(t("noticeCopied")));
    });
    if (resolved.kind === "library-html" || resolved.kind === "markdown" || resolved.kind === "library-file") {
      addLocal(t("menuCopyNoteLink"), "link", () => {
        void this.copyAddress(resolved, true);
      });
    }
    menu.addSeparator();
    if (resolved.kind === "anchor" || resolved.kind === "library-html" || resolved.kind === "empty") {
      addLocal(t("menuEditLink"), "pencil", opts.onEdit);
    } else if (resolved.kind === "unsupported" && resolved.reason === "not-found") {
      if (opts.onRelink) addLocal(t("menuRelink"), "link-2", opts.onRelink);
    }
    const doc = event.target.ownerDocument;
    menu.showAtPosition({ x: event.clientX, y: event.clientY }, doc);
  }
  // 复制地址:F03 规则——HTTP 复制完整 URL;库内复制规范化库根相对路径(不泄露绝对路径)
  async copyAddress(resolved, noteLink) {
    let text = "";
    if (noteLink && resolved.file) {
      const encoded = resolved.file.path.split("/").map((p) => p.replace(/ /g, "%20")).join("/");
      text = `${encoded}${resolved.fragment}${resolved.query}`;
    } else if (resolved.kind === "http" || resolved.kind === "mailto") {
      text = resolved.raw;
    } else if (resolved.file) {
      text = `${resolved.file.path}${resolved.fragment}${resolved.query}`;
    } else text = resolved.raw;
    await navigator.clipboard.writeText(text);
    new import_obsidian2.Notice(this.t("noticeCopied"));
  }
  // 本地 HTML 的浏览器打开:验证实际 file URL(D0-04:非 ASCII 路径 openExternal 失败,
  // 需要配置浏览器程序 spawn;此处先用 file URL,失败给出可复制地址的明确提示)。
  async openHtmlInBrowser(resolved) {
    const ad = this.app.vault.adapter.basePath;
    if (!ad || !resolved.file) {
      new import_obsidian2.Notice(this.t("noticeBrowserOpenFailed"));
      return;
    }
    const url = "file:///" + encodeURI(`${ad.replace(/\\/g, "/")}/${resolved.file.path}`).replace(/#/g, "%23").replace(/\?/g, "%3F");
    try {
      await this.browser.open(url);
      if (/[^\u0080-\uFFFF]/.test(ad + resolved.file.path)) new import_obsidian2.Notice(this.t("noticeBrowserOpenVerify"));
    } catch {
      new import_obsidian2.Notice(this.t("noticeBrowserOpenFailedWithCopy", { url }));
    }
  }
};

// src/services/nav.ts
var NavigationService = class {
  constructor() {
    this.stacks = /* @__PURE__ */ new WeakMap();
    this.owners = [];
    // 仅用于 rename 时遍历各叶片的栈(WeakMap 不可枚举)
    this.positions = /* @__PURE__ */ new Map();
  }
  // 文件级最近位置(会话内)
  stackFor(owner) {
    let st = this.stacks.get(owner);
    if (!st) {
      st = { entries: [], index: -1 };
      this.stacks.set(owner, st);
      this.owners.push(owner);
    }
    return st;
  }
  // 更新栈顶同路径条目的位置(滚动比例等)。用户在页面上滚动时调用,
  // 而不是在新页面加载的那一刻抓取——后者永远拿到 0(审计 round4 BUG 34:
  // 每个栈条目的 scrollRatio 都是 0,Back/Forward 因此从不恢复阅读位置)。
  updateTop(owner, entry) {
    const st = this.stackFor(owner);
    const top = st.entries[st.index];
    if (!top || top.path !== entry.path) return;
    st.entries[st.index] = entry;
    this.recordPosition(entry);
  }
  // 记录访问:删除后重设,让 Map 的迭代顺序始终是"最近访问在后"(LRU 接触)。
  recordPosition(entry) {
    this.positions.delete(entry.path);
    this.positions.set(entry.path, entry);
  }
  lastPosition(path) {
    return this.positions.get(path);
  }
  // 前往新目标:截断前进分支,压栈;同一文件的连续状态(模式/视口变化)更新栈顶而非新增
  push(owner, entry) {
    const st = this.stackFor(owner);
    st.entries = st.entries.slice(0, st.index + 1);
    const top = st.entries[st.entries.length - 1];
    if (top && top.path === entry.path) {
      st.entries[st.entries.length - 1] = entry;
    } else {
      st.entries.push(entry);
      if (st.entries.length > 100) st.entries.shift();
    }
    st.index = st.entries.length - 1;
    this.recordPosition(entry);
  }
  // 程序性导航(后退/前进)完成加载后:把索引对齐到目标路径的条目,不截断前进分支。
  // 栈里同一路径可以出现多次(A→B→A),因此必须取"离当前索引最近"的那一项:
  // findIndex 取首个匹配会让一次后退跳到最早那次访问,前进分支随即错位(AC10 实测)。
  alignToPath(owner, path) {
    const st = this.stackFor(owner);
    if (st.entries[st.index]?.path === path) return;
    let best = -1, bestDistance = Infinity;
    for (let i = 0; i < st.entries.length; i++) {
      if (st.entries[i].path !== path) continue;
      const distance = Math.abs(i - st.index);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = i;
      }
    }
    if (best >= 0) st.index = best;
  }
  canBack(owner) {
    const st = this.stackFor(owner);
    return st.index > 0;
  }
  canForward(owner) {
    const st = this.stackFor(owner);
    return st.index < st.entries.length - 1;
  }
  back(owner) {
    const st = this.stackFor(owner);
    if (st.index <= 0) return null;
    st.index--;
    return st.entries[st.index];
  }
  forward(owner) {
    const st = this.stackFor(owner);
    if (st.index >= st.entries.length - 1) return null;
    st.index++;
    return st.entries[st.index];
  }
  // F06:文件重命名迁移位置记录。
  // 必须同时迁移**每叶片的导航栈**:只改 positions 的话,back() 仍返回旧路径,视图按旧路径
  // 找不到文件、静默什么都不打开,而 index 已经减 1 —— 用户既没回到目标文件,也丢了那一步
  // (审计 round4 BUG 37:结构性缺陷,全仓库没有任何地方迁移 stacks)。
  rename(oldPath, newPath) {
    const pos = this.positions.get(oldPath);
    if (pos) {
      this.positions.delete(oldPath);
      this.positions.set(newPath, { ...pos, path: newPath });
    }
    for (const owner of this.owners) {
      const st = this.stacks.get(owner);
      if (!st) continue;
      for (let i = 0; i < st.entries.length; i++) {
        if (st.entries[i].path === oldPath) st.entries[i] = { ...st.entries[i], path: newPath };
      }
    }
  }
  // 文件级持久化(最近 200 个文件,存插件数据)。
  // 必须保留"最近"的 200 个:positions 的迭代顺序是插入序,取前 200 会留下最早访问的
  // 文件,而用户最近读的文件全部丢失(审计复检 §3.20)。recordPosition 做 LRU 接触,
  // 因此这里取尾部。
  toJSON(limit = 200) {
    const out = {};
    const keys = [...this.positions.keys()];
    for (const k of keys.slice(Math.max(0, keys.length - limit))) {
      const v = this.positions.get(k);
      if (v) out[k] = v;
    }
    return out;
  }
  fromJSON(data) {
    if (typeof data !== "object" || data === null) return;
    for (const [k, v] of Object.entries(data)) {
      const e = v;
      if (typeof e?.path === "string" && k === e.path) this.positions.set(k, e);
    }
  }
  // iframe 元素被移除后,它的 WindowProxy 仍然可以取到,但 document/documentElement 已为 null
  // (Chromium 108+ 丢弃浏览上下文)。调用方(菜单/滚动抓取/重绘)持有的是旧窗口引用,
  // 不设防就会抛 "Cannot read properties of null (reading 'scrollHeight')"。
  // 见 audit/runtime/selfcheck-newpaths.mjs 第 6 节。
  scrollRatioOf(win) {
    if (!win || !win.document || !win.document.documentElement) return 0;
    const max = win.document.documentElement.scrollHeight - win.innerHeight;
    return max > 0 ? Math.min(1, Math.max(0, win.scrollY / max)) : 0;
  }
  restoreScroll(win, ratio) {
    if (!win || !win.document || !win.document.documentElement) return;
    const max = win.document.documentElement.scrollHeight - win.innerHeight;
    win.scrollTo(0, max * ratio);
  }
};
function currentNavEntry(file, anchor, win, zoom, width) {
  if (!file) return null;
  return { path: file.path, anchor, scrollRatio: win ? Math.min(1, Math.max(0, (() => {
    const max = win.document.documentElement.scrollHeight - win.innerHeight;
    return max > 0 ? win.scrollY / max : 0;
  })())) : 0, zoom, width };
}

// src/services/sidebar.ts
var import_obsidian3 = require("obsidian");

// src/services/debug.ts
var KEY = "__atelierDebug";
var CAP = 200;
function debugLog(message) {
  const w = window;
  const arr = w[KEY] = w[KEY] ?? [];
  arr.push(message);
  if (arr.length > CAP) arr.splice(0, arr.length - CAP);
}
function clearDebugLog() {
  window[KEY] = [];
}

// src/services/sidebar.ts
var HTML_PANEL_TYPE = "html-atelier-panel";
var SidebarCoordinator = class {
  constructor(app, settings, t) {
    this.app = app;
    this.settings = settings;
    this.t = t;
    this.suppressByWindow = /* @__PURE__ */ new WeakMap();
    this.lastNonHtmlLeaf = null;
    this.oneTimeNoticeShown = false;
  }
  // 多窗口细化:关键路径由调用方传入窗口;此处默认主窗口
  win() {
    return window;
  }
  isSuppressed(w = window) {
    return this.settings().sidebar.respectManualCollapse && this.suppressByWindow.get(w)?.collapsed === true;
  }
  // 手动收起的第二条判定路径(A02 实测):layout-change 在宿主里的触发时机不保证,
  // 且程序性 collapse() 与用户点击同样只改 rightSplit.collapsed。本插件从不变更
  // 折叠状态(自动路径只 reveal),因此"面板叶子已存在 + 右栏处于折叠"只可能是
  // 用户收起的。existedBefore 由 showPanel 在创建叶子之前捕获,避免把自己的
  // 首次创建误判成手动收起。
  isManuallyCollapsed(existedBefore, w = window) {
    return this.settings().sidebar.respectManualCollapse && existedBefore && this.rightCollapsed();
  }
  debugState() {
    return {
      collapsed: this.rightCollapsed(),
      suppressed: this.isSuppressed(),
      suppressedDerived: this.isManuallyCollapsed(this.panelLeaves().length > 0),
      suppressions: "weakmap",
      panelLeaves: this.panelLeaves().length
    };
  }
  clearSuppression(w = window) {
    this.suppressByWindow.delete(w);
  }
  // 宿主右侧栏折叠状态(D0-03:rightSplit 可读)
  rightCollapsed() {
    const rs = this.app.workspace.rightSplit;
    return rs?.collapsed === true;
  }
  // 观察手动收起:在折叠事件上记录抑制(workspace layout-change 里检测折叠沿)。
  // 反方向同样要处理:用户**自己重新展开**右栏就是"我想要侧栏"的信号,手动收起记忆
  // 必须到此为止。此前抑制会跨整个窗口会话存活——用户收起过一次之后,即使自己把
  // 侧栏重新打开,回到 HTML 文件面板也永不自动出现,看起来就是功能坏了(用户实测 2026-09-14)。
  observe() {
    this.app.workspace.on("layout-change", () => {
      const rs = this.app.workspace.rightSplit;
      if (!rs) return;
      const w = this.win();
      if (rs.collapsed) {
        const hasPanel = this.app.workspace.getLeavesOfType(HTML_PANEL_TYPE).length > 0;
        if (hasPanel) this.suppressByWindow.set(w, { collapsed: true });
      } else if (this.suppressByWindow.get(w)) {
        this.clearSuppression(w);
      }
    });
  }
  panelLeaves() {
    return this.app.workspace.getLeavesOfType(HTML_PANEL_TYPE);
  }
  // 显示 HTML 面板。explicit=命令/用户动作(清除手动收起抑制);
  // 自动路径(autoShowHtml)不清除抑制(报告 §5.1)。
  async showPanel(refresh, explicit = false) {
    const existedBefore = this.panelLeaves().length > 0;
    const collapsedBefore = this.rightCollapsed();
    const explicitRequest = explicit;
    const suppressed = explicitRequest ? false : this.isSuppressed() || this.isManuallyCollapsed(existedBefore);
    if (explicitRequest) this.clearSuppression();
    const leaf = await this.ensurePanelLeaf();
    if (!leaf) return;
    refresh(leaf);
    const w = explicitRequest ? null : this.win();
    if (!explicitRequest && w && existedBefore && collapsedBefore) this.suppressByWindow.set(w, { collapsed: true });
    debugLog(`showPanel explicit=${explicitRequest} suppressed=${suppressed} existed=${existedBefore} collapsed=${collapsedBefore}`);
    if (suppressed) return;
    await this.app.workspace.revealLeaf(leaf);
  }
  // D0-02:ensureSideLeaf 创建/复用,reveal=false 不强制展开
  async ensurePanelLeaf() {
    const ws = this.app.workspace;
    const existing = this.panelLeaves()[0];
    if (existing) return existing;
    if (typeof ws.ensureSideLeaf === "function") {
      try {
        return await ws.ensureSideLeaf(HTML_PANEL_TYPE, "right", { reveal: false, active: false });
      } catch {
      }
    }
    const right = ws.getRightLeaf(false);
    if (!right) return null;
    await right.setViewState({ type: HTML_PANEL_TYPE, active: false });
    return right;
  }
  // 离开 HTML 时关闭本插件叶子并按设置恢复目标
  async closeOnLeave(activeFile) {
    const st = this.settings().sidebar;
    if (!st.closeOnLeave) return;
    const w = this.win();
    for (const leaf of this.panelLeaves()) leaf.detach();
    const isMd = activeFile && activeFile.extension === "md";
    const target = isMd ? st.markdownTarget : st.otherTarget;
    if (target === "none") return;
    if (this.isSuppressed(w)) return;
    if (target === "outline") {
      const outlineEnabled = this.app.internalPlugins?.getPluginById("outline")?.enabled;
      if (!outlineEnabled) {
        if (!this.oneTimeNoticeShown) {
          this.oneTimeNoticeShown = true;
          new import_obsidian3.Notice(this.t("noticeOutlineDisabled"));
        }
        return;
      }
      const ws = this.app.workspace;
      try {
        if (typeof ws.ensureSideLeaf === "function") await ws.ensureSideLeaf("outline", "right", { reveal: true });
        else {
          const leaf = this.app.workspace.getRightLeaf(false);
          if (leaf) {
            await leaf.setViewState({ type: "outline", active: false });
            await this.app.workspace.revealLeaf(leaf);
          }
        }
      } catch {
      }
    } else if (target === "previous") {
      const prev = this.lastNonHtmlLeaf;
      if (!prev) return;
      const alive = this.app.workspace.getLeavesOfType(prev.type).find((l) => l.window === w || true);
      if (!alive) return;
      try {
        await this.app.workspace.revealLeaf(alive);
      } catch {
      }
    }
  }
  // 记录"进入 HTML 之前的侧栏叶子":由 main.ts 在 active-leaf-change 上喂入。
  notePreviousLeaf(leaf) {
    const type = leaf.view?.getViewType?.();
    if (!type || type === HTML_PANEL_TYPE) return;
    this.lastNonHtmlLeaf = { type, leaf };
  }
  // 一键关闭全部侧栏自动行为(报告 §5.1):只改设置,不动叶子
  disableAllActions() {
    return {
      sidebar: { ...this.settings().sidebar, autoShowHtml: false, closeOnLeave: false, markdownTarget: "none", otherTarget: "none" }
    };
  }
};

// src/drafts/record.ts
function computeChecksum(record) {
  const canonical = JSON.stringify([
    record.schemaVersion,
    record.deviceId,
    record.filePath,
    record.baseSource,
    record.baseHash,
    record.workingSource,
    record.revision,
    record.updatedAt
  ]);
  return fingerprint(canonical);
}
function sealDraftRecord(record) {
  return { ...record, checksum: computeChecksum(record) };
}
function verifyDraftRecord(parsed) {
  if (typeof parsed !== "object" || parsed === null) return null;
  const r = parsed;
  if (r.schemaVersion !== 2) return null;
  const asStr = (v) => typeof v === "string" ? v : "";
  const typed = {
    schemaVersion: 2,
    deviceId: asStr(r.deviceId),
    filePath: asStr(r.filePath),
    baseSource: asStr(r.baseSource),
    baseHash: asStr(r.baseHash),
    workingSource: asStr(r.workingSource),
    revision: typeof r.revision === "number" ? r.revision : 0,
    updatedAt: typeof r.updatedAt === "number" ? r.updatedAt : 0,
    checksum: asStr(r.checksum)
  };
  if (!typed.filePath || !typed.deviceId) return null;
  if (computeChecksum(typed) !== typed.checksum) return null;
  if (typed.baseHash !== fingerprint(typed.baseSource)) return null;
  return typed;
}

// src/drafts/store.ts
var encodeFileName = (filePath, deviceId) => {
  const hash = fingerprint(`${deviceId}\0${filePath}`).replace(/[^0-9a-f]/g, "");
  const safeDevice = deviceId.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 16) || "dev";
  return `${safeDevice}-${hash}.json`;
};
var DraftStore = class {
  constructor(adapter, dir, deviceId) {
    this.adapter = adapter;
    this.dir = dir;
    this.deviceId = deviceId;
  }
  fileName(filePath) {
    return encodeFileName(filePath, this.deviceId);
  }
  fullPath(fileName) {
    return `${this.dir}/${fileName}`;
  }
  async ensureDir() {
    if (!this.adapter.mkdir) return;
    try {
      if (this.adapter.exists && !await this.adapter.exists(this.dir)) await this.adapter.mkdir(this.dir);
    } catch {
    }
  }
  async saveDraft(record) {
    const sealed = sealDraftRecord(record);
    if (sealed.deviceId !== this.deviceId) throw new Error("\u8349\u7A3F deviceId \u4E0E\u5B58\u50A8\u547D\u540D\u7A7A\u95F4\u4E0D\u4E00\u81F4");
    await this.ensureDir();
    const final = this.fullPath(this.fileName(record.filePath));
    const temp = `${final}.tmp`;
    const existing = await this.loadDraft(record.filePath).catch(() => null);
    if (existing && existing.revision > sealed.revision)
      throw new Error(`\u8349\u7A3F\u5199\u5165\u88AB\u62D2\u7EDD:\u78C1\u76D8\u4E0A\u5DF2\u6709\u66F4\u65B0 revision(${existing.revision} > ${sealed.revision})`);
    const text = JSON.stringify(sealed);
    await this.adapter.write(temp, text);
    let roundTrip = null;
    try {
      roundTrip = verifyDraftRecord(JSON.parse(await this.adapter.read(temp)));
    } catch {
      roundTrip = null;
    }
    if (!roundTrip || roundTrip.checksum !== sealed.checksum)
      throw new Error("\u8349\u7A3F\u4E34\u65F6\u6587\u4EF6\u6821\u9A8C\u5931\u8D25\uFF0C\u4FDD\u7559\u4E0A\u4E00\u4EFD\u6709\u6548\u5FEB\u7167");
    await this.adapter.write(final, text);
    if (this.adapter.remove) await this.adapter.remove(temp).catch(() => {
    });
  }
  // 同一份草稿可能同时存在正式文件与 .tmp(写正式文件失败/中断的撕裂写)。
  // 模块注释承诺"两份副本中取 revision 较新的有效者",而 loadDraft 此前只读正式文件、
  // 失败才回退,与 listDrafts 的判定**相反** —— 于是管理器展示新草稿、打开文件却还原旧内容,
  // 用户最新一段工作被静默丢弃(审计报告 5 N1)。两条路径现在共用这一个读取器。
  async readNameBest(baseName, expectedFilePath) {
    const final = this.fullPath(baseName);
    let best = null;
    for (const p of [final, `${final}.tmp`]) {
      try {
        const r = verifyDraftRecord(JSON.parse(await this.adapter.read(p)));
        if (!r) continue;
        if (expectedFilePath !== void 0 && r.filePath !== expectedFilePath) continue;
        if (!best || r.revision > best.revision) best = r;
      } catch {
      }
    }
    return best;
  }
  async loadDraft(filePath) {
    return this.readNameBest(this.fileName(filePath), filePath);
  }
  async listDrafts() {
    const records = [];
    const broken = [];
    if (!this.adapter.list) return { records, broken };
    let names = [];
    try {
      const raw = await this.adapter.list(this.dir);
      const arr = Array.isArray(raw) ? raw : raw?.files ?? [];
      names = arr.map((p) => p.startsWith(`${this.dir}/`) ? p.slice(this.dir.length + 1) : p);
    } catch {
      return { records, broken };
    }
    if (!names.length) return { records, broken };
    const bases = /* @__PURE__ */ new Set();
    for (const name of names) {
      if (name.endsWith(".json.tmp")) bases.add(name.slice(0, -4));
      else if (name.endsWith(".json")) bases.add(name);
    }
    for (const base of bases) {
      const record = await this.readNameBest(base);
      if (record) records.push({ filePath: record.filePath, record });
      else broken.push(base);
    }
    return { records, broken };
  }
  async removeDraft(filePath) {
    if (!this.adapter.remove) return;
    const final = this.fullPath(this.fileName(filePath));
    await this.adapter.remove(final).catch(() => {
    });
    await this.adapter.remove(`${final}.tmp`).catch(() => {
    });
  }
};

// src/services/draftsService.ts
function getDeviceId() {
  try {
    let id = localStorage.getItem("html-atelier-device-id");
    if (!id) {
      id = "dev-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
      localStorage.setItem("html-atelier-device-id", id);
    }
    return id;
  } catch {
    return "dev-unknown";
  }
}
var DraftsService = class {
  constructor(app, settings, deviceId) {
    this.app = app;
    this.settings = settings;
    this.timers = /* @__PURE__ */ new Map();
    // 每个"进行中的 saveDraft 写入"。clearDraft/干净分支的 flush 在删草稿前先等它落地:
    // 否则防抖到期的 flush 正在 await store.saveDraft(记录已按保存前内容快照)时,保存成功
    // 的 clearDraft 先删、旧快照后写回,磁盘残留保存前草稿,重启被 recover 判成幽灵冲突(审计 m5)
    this.inflight = /* @__PURE__ */ new Map();
    // 状态栏跟随(2026-09-30 复查):flush/清除草稿多在防抖定时器里异步改 draftStatus,
    // 面板不会自己知道,改字后状态栏一直停在"待备份"。宿主注册此回调(接到 refreshPanels)。
    this.onStatusChange = null;
    this.store = new DraftStore(this.app.vault.adapter, `${this.app.vault.configDir}/plugins/html-atelier/drafts`, deviceId);
  }
  emitStatus() {
    this.onStatusChange?.();
  }
  get storeRef() {
    return this.store;
  }
  // 会话内容变更后调用:内存即时,落盘防抖
  scheduleSave(session) {
    const st = this.settings().drafts;
    if (!st.enabled) {
      session.draftStatus = "disabled";
      this.emitStatus();
      return;
    }
    session.draftStatus = "pending";
    this.emitStatus();
    const existing = this.timers.get(session.filePath);
    const now = Date.now();
    const firstAt = existing?.firstAt ?? now;
    if (existing) window.clearTimeout(existing.timer);
    const flush = () => {
      this.timers.delete(session.filePath);
      void this.flush(session);
    };
    const timer = window.setTimeout(flush, Math.max(50, st.debounceMs - (now - firstAt) >= 0 ? st.debounceMs - (now - firstAt) : 50));
    this.timers.set(session.filePath, { timer, firstAt });
    if (now - firstAt >= st.maxWaitMs) {
      window.clearTimeout(timer);
      this.timers.delete(session.filePath);
      void this.flush(session);
    }
  }
  // 等待该文件在途的草稿写入完成(失败也算落地:clearDraft 随后会把残留删掉)
  async settleInflight(filePath) {
    const p = this.inflight.get(filePath);
    if (p) await p.catch(() => {
    });
  }
  // 立即写草稿(临时→校验→正式在 DraftStore 内部)
  async flush(session) {
    if (!this.settings().drafts.enabled) {
      session.draftStatus = "disabled";
      this.emitStatus();
      return;
    }
    if (!session.dirty && session.contentState !== "conflict") {
      await this.settleInflight(session.filePath);
      this.store.removeDraft(session.filePath).catch(() => {
      });
      session.draftStatus = "idle";
      this.emitStatus();
      return;
    }
    session.draftStatus = "writing";
    this.emitStatus();
    const write = (async () => {
      try {
        await this.store.saveDraft({
          schemaVersion: 2,
          deviceId: getDeviceId(),
          filePath: session.filePath,
          baseSource: session.baseSource,
          baseHash: fingerprint(session.baseSource),
          workingSource: session.workingSource,
          revision: session.revision,
          updatedAt: Date.now()
        });
        session.draftStatus = "saved";
      } catch {
        session.draftStatus = "failed";
      }
      this.emitStatus();
    })();
    this.inflight.set(session.filePath, write);
    await write;
    if (this.inflight.get(session.filePath) === write) this.inflight.delete(session.filePath);
  }
  // 会话恢复:读取草稿;若磁盘已变化则进入冲突
  async recover(file) {
    const record = await this.store.loadDraft(file.path).catch(() => null);
    if (!record) return null;
    const disk = await this.app.vault.read(file);
    const conflict = disk !== record.baseSource;
    return { workingSource: record.workingSource, conflict, revision: record.revision };
  }
  // 保存成功后清除草稿。传入 session 时同步 draftStatus:草稿已不存在,干净会话
  // 回到 idle(此前状态停在保存前的 'pending'/'saved',保存后一直显示"待备份/草稿已备份")。
  async clearDraft(filePath, session) {
    const t = this.timers.get(filePath);
    if (t) {
      window.clearTimeout(t.timer);
      this.timers.delete(filePath);
    }
    await this.settleInflight(filePath);
    await this.store.removeDraft(filePath).catch(() => {
    });
    if (session) {
      session.draftStatus = this.settings().drafts.enabled ? "idle" : "disabled";
      this.emitStatus();
    }
  }
  // F23:草稿清单
  async list() {
    return this.store.listDrafts();
  }
  // F23:批量丢弃(只删草稿,不删原文件)
  async discardMany(paths) {
    const ok = [];
    const failed = [];
    for (const p of paths) {
      try {
        await this.store.removeDraft(p);
        ok.push(p);
      } catch {
        failed.push(p);
      }
    }
    return { ok, failed };
  }
};

// src/services/merge/diff.ts
var DIFF_CELL_LIMIT = 4e6;
function tokenizeLines(text) {
  const tokens = [];
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === "\n") {
      tokens.push(text.slice(start, i + 1));
      start = i + 1;
    } else if (c === "\r" && text[i + 1] !== "\n") {
      tokens.push(text.slice(start, i + 1));
      start = i + 1;
    }
  }
  if (start < text.length) tokens.push(text.slice(start));
  return tokens;
}
function diffHunks(a, b) {
  let start = 0;
  const minLen = Math.min(a.length, b.length);
  while (start < minLen && a[start] === b[start]) start++;
  let endA = a.length, endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--;
    endB--;
  }
  const innerA = a.slice(start, endA), innerB = b.slice(start, endB);
  if (innerA.length === 0 && innerB.length === 0) return [];
  if (innerA.length * innerB.length > DIFF_CELL_LIMIT)
    return [{ aStart: start, aEnd: endA, tokens: innerB }];
  if (innerA.length === 0) return [{ aStart: start, aEnd: start, tokens: innerB }];
  if (innerB.length === 0) return [{ aStart: start, aEnd: endA, tokens: [] }];
  const n = innerA.length, m = innerB.length;
  const width = m + 1;
  const table = new Uint32Array((n + 1) * width);
  for (let i2 = 1; i2 <= n; i2++) {
    const ai2 = innerA[i2 - 1];
    for (let j2 = 1; j2 <= m; j2++) {
      table[i2 * width + j2] = ai2 === innerB[j2 - 1] ? table[(i2 - 1) * width + (j2 - 1)] + 1 : Math.max(table[(i2 - 1) * width + j2], table[i2 * width + (j2 - 1)]);
    }
  }
  const ops = [];
  let i = n, j = m;
  while (i > 0 && j > 0) {
    if (innerA[i - 1] === innerB[j - 1]) {
      ops.push("same");
      i--;
      j--;
    } else if (table[(i - 1) * width + j] >= table[i * width + (j - 1)]) {
      ops.push("del");
      i--;
    } else {
      ops.push("ins");
      j--;
    }
  }
  while (i > 0) {
    ops.push("del");
    i--;
  }
  while (j > 0) {
    ops.push("ins");
    j--;
  }
  ops.reverse();
  const hunks = [];
  let ai = 0, bi = 0, p = 0;
  while (p < ops.length) {
    if (ops[p] === "same") {
      ai++;
      bi++;
      p++;
      continue;
    }
    const delStart = ai;
    const ins = [];
    while (p < ops.length && ops[p] !== "same") {
      if (ops[p] === "del") ai++;
      else {
        ins.push(innerB[bi]);
        bi++;
      }
      p++;
    }
    hunks.push({ aStart: start + delStart, aEnd: start + ai, tokens: ins });
  }
  return hunks;
}

// src/services/merge/diff3.ts
var overlaps = (groupLo, groupHi, hunk) => {
  const zero = hunk.aStart === hunk.aEnd || groupLo === groupHi;
  if (zero) return Math.max(hunk.aStart, groupLo) <= Math.min(hunk.aEnd, groupHi);
  return hunk.aStart < groupHi && groupLo < hunk.aEnd;
};
function applyHunks(base, hunks, lo, hi) {
  const out = [];
  let pos = lo;
  let k = 0;
  while (k < hunks.length && hunks[k].aStart <= hi) {
    const h = hunks[k];
    out.push(...base.slice(pos, h.aStart));
    out.push(...h.tokens);
    pos = Math.max(h.aEnd, h.aStart);
    k++;
  }
  out.push(...base.slice(pos, hi));
  return out;
}
function diff3Merge(baseText, localText, remoteText) {
  const base = tokenizeLines(baseText), local = tokenizeLines(localText), remote = tokenizeLines(remoteText);
  const lh = diffHunks(base, local), rh = diffHunks(base, remote);
  const chunks = [];
  const emitSame = (tokens) => {
    if (tokens.length) chunks.push({ type: "same", text: tokens.join("") });
  };
  let pos = 0, i = 0, j = 0;
  while (i < lh.length || j < rh.length) {
    const takeLocal = j >= rh.length || i < lh.length && lh[i].aStart <= rh[j].aStart;
    const first = takeLocal ? lh[i] : rh[j];
    let lo = first.aStart, hi = first.aEnd;
    const localGroup = [], remoteGroup = [];
    let grew = true;
    while (grew) {
      grew = false;
      while (i < lh.length && overlaps(lo, hi, lh[i])) {
        localGroup.push(lh[i]);
        hi = Math.max(hi, lh[i].aEnd);
        lo = Math.min(lo, lh[i].aStart);
        i++;
        grew = true;
      }
      while (j < rh.length && overlaps(lo, hi, rh[j])) {
        remoteGroup.push(rh[j]);
        hi = Math.max(hi, rh[j].aEnd);
        lo = Math.min(lo, rh[j].aStart);
        j++;
        grew = true;
      }
    }
    emitSame(base.slice(pos, lo));
    const localTokens = applyHunks(base, localGroup, lo, hi);
    const remoteTokens = applyHunks(base, remoteGroup, lo, hi);
    if (remoteGroup.length === 0) chunks.push({ type: "local", text: localTokens.join("") });
    else if (localGroup.length === 0) chunks.push({ type: "remote", text: remoteTokens.join("") });
    else if (localTokens.join("") === remoteTokens.join("")) chunks.push({ type: "same", text: localTokens.join("") });
    else chunks.push({ type: "conflict", text: base.slice(lo, hi).join(""), localText: localTokens.join(""), remoteText: remoteTokens.join("") });
    pos = hi;
  }
  emitSame(base.slice(pos));
  const conflictCount = chunks.filter((c) => c.type === "conflict").length;
  return { chunks, conflictCount };
}
function assemble(chunks, resolve) {
  return chunks.map((c) => c.type === "conflict" ? resolve(c) : c.text).join("");
}

// src/services/mergeService.ts
var MergeService = class {
  constructor(app) {
    this.app = app;
  }
  async readDisk(file) {
    try {
      return await this.app.vault.read(file);
    } catch {
      return null;
    }
  }
  openState(session, remote) {
    return {
      remoteSnapshot: remote,
      baseAtOpen: session.baseSource,
      localRevision: session.revision,
      localEpoch: session.historyEpoch,
      expired: false
    };
  }
  isExpired(session, st) {
    return st.localRevision !== session.revision || st.localEpoch !== session.historyEpoch || st.baseAtOpen !== session.baseSource;
  }
  merge(base, local, remote) {
    return diff3Merge(base, local, remote);
  }
  assemble(chunks, resolve) {
    return assemble(chunks, resolve);
  }
  // 应用合并:短暂进入 merging,重新读盘校验 Remote 仍一致(audit §11.1);
  // 校验失败返回 null(不改 Local/Base/历史),由调用方提示重新比较。
  // 会话正忙(保存中)时返回 'busy' 而不是强行接管:此前 finally 无条件把 operation
  // 复位为 idle,等于把别人持有的保存锁抢走,写入中途的编辑被接受并落盘损坏文件
  // (审计 round4 BUG 6)。调用方必须把 'busy' 如实告知用户。
  async apply(file, session, st, merged) {
    if (session.operation !== "idle") return "busy";
    let disk = null;
    try {
      disk = await this.app.vault.read(file);
    } catch {
      return "missing";
    }
    if (disk !== st.remoteSnapshot) return "expired";
    if (session.operation !== "idle") return "busy";
    session.operation = "merging";
    try {
      if (session.revision !== st.localRevision || session.historyEpoch !== st.localEpoch) return "expired";
      session.applyMergeResult(merged, disk);
      return "applied";
    } finally {
      if (session.operation === "merging") session.operation = "idle";
    }
  }
};

// src/services/noteRef.ts
var import_obsidian4 = require("obsidian");
function pageReference(filePath, format) {
  if (format === "wiki") return `[[${filePath}]]`;
  return `[${fileTitle(filePath)}](${linkTarget(filePath)})`;
}
function sectionReference(filePath, anchorId, format) {
  if (format === "wiki") return `[[${filePath}#${anchorId}]]`;
  return `[${fileTitle(filePath)}#${anchorId}](${linkTarget(filePath)}#${anchorId})`;
}
function fileTitle(path) {
  const base = path.split("/").pop() ?? path;
  return base.replace(/\.(html?|htm)$/i, "");
}
function linkTarget(filePath) {
  return filePath.split("/").map((p) => p.replace(/ /g, "%20").replace(/[#?]/g, (c) => c === "#" ? "%23" : "%3F")).join("/");
}
function embedCode(filePath, height, width, anchor, toolbar) {
  const lines = ["```html-atelier", `path: "${filePath}"`];
  if (height !== "auto") lines.push(`height: ${height}`);
  if (width !== "auto") lines.push(`width: ${width}`);
  if (anchor) lines.push(`anchor: "${anchor}"`);
  lines.push(`toolbar: ${toolbar}`);
  lines.push("```");
  return lines.join("\n");
}
var NoteReferenceService = class {
  constructor(app, t) {
    this.app = app;
    this.t = t;
  }
  async copy(text) {
    await navigator.clipboard.writeText(text);
    new import_obsidian4.Notice(this.t("noticeCopied"));
  }
  // 目标 Markdown 笔记上下文:若当前活动文件是 md,相对其目录生成路径;否则库根相对
  relativeTo(targetPath) {
    const active = this.app.workspace.getActiveFile();
    if (active && active.extension === "md") {
      const dir = active.path.includes("/") ? active.path.slice(0, active.path.lastIndexOf("/") + 1) : "";
      if (targetPath.startsWith(dir)) return targetPath.slice(dir.length);
    }
    return targetPath;
  }
  async copyPage(file, format) {
    const path = this.relativeTo(file.path);
    await this.copy(pageReference(path, format));
  }
  async copySection(file, anchorId, format) {
    const path = this.relativeTo(file.path);
    await this.copy(sectionReference(path, anchorId, format));
  }
};

// src/main.ts
init_saveService();

// src/services/assetRefresh.ts
var import_obsidian6 = require("obsidian");
function createAssetRefresher(onRefresh) {
  return (0, import_obsidian6.debounce)(() => {
    onRefresh();
  }, 300, true);
}

// src/services/assets.ts
init_sourceIndex();
init_url();
var TRACK_TAGS = /* @__PURE__ */ new Set(["img", "link", "script", "source", "video", "audio"]);
var NON_RESOURCE = /* @__PURE__ */ new Set(["script", "template", "svg", "math", "textarea", "select", "option", "canvas", "iframe", "object", "embed", "title"]);
function insideNonResource(index, nodeId) {
  const guard = /* @__PURE__ */ new Set();
  let cur = index.nodes[nodeId];
  while (cur && cur.parentId !== null && !guard.has(cur.id)) {
    guard.add(cur.id);
    const parent = index.nodes[cur.parentId];
    if (!parent) return false;
    if (parent.kind === "element" && NON_RESOURCE.has(parent.tag)) return true;
    cur = parent;
  }
  return false;
}
function collectResources(index) {
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  for (const n of index.nodes) {
    if (n.kind !== "element" || !TRACK_TAGS.has(n.tag) || insideNonResource(index, n.id)) continue;
    const attrName = n.tag === "link" ? "href" : "src";
    const attr = n.attrs.find((a) => a.name === attrName);
    const rel = n.tag === "link" ? n.attrs.find((a) => a.name === "rel")?.value ?? "" : "";
    if (!attr) continue;
    if (n.tag === "link" && rel && !/stylesheet|icon|preload/i.test(rel)) continue;
    const raw = attr.value;
    const key = `${n.id}:${raw}`;
    if (seen.has(key)) continue;
    seen.add(key);
    let resolved = raw;
    let local = false;
    let status = "remote";
    const kind = classifyRef(raw);
    if (kind === "relative" || kind === "vault-root") {
      local = true;
      resolved = resolveVaultRef("", raw);
      status = "missing";
    } else if (kind === "anchor" || kind === "empty" || /^(data:|blob:)/i.test(raw)) {
      continue;
    }
    out.push({ tag: n.tag, attr: attrName, raw, resolved, local, status, nodeId: n.id });
  }
  return out;
}
function collectResourcesWithBase(index, sourcePath, exists, allowNetwork) {
  const dir = dirOf(sourcePath);
  const out = collectResources(index);
  for (const r of out) {
    if (r.local) {
      const path = resolveVaultRef(dir, r.raw);
      r.resolved = path;
      r.status = exists(path) ? "local-ok" : "missing";
    } else if (r.raw && r.raw !== "(inline)") {
      r.status = allowNetwork ? "remote" : "blocked";
    }
  }
  return out;
}
var CSS_URL_RE = /@import\s+(?:url\(\s*)?['"]?([^'")\s;]+)|url\(\s*['"]?([^'")]+)/gi;
function cssUrls(cssText) {
  const patterns = new RegExp(CSS_URL_RE.source, "gi");
  const refs = [];
  let m;
  while ((m = patterns.exec(cssText)) !== null) {
    const ref = (m[1] ?? m[2]).trim();
    if (!ref) continue;
    refs.push(ref);
  }
  return refs;
}
function pageReferences(index, pageDir) {
  const out = /* @__PURE__ */ new Set();
  const add = (ref) => {
    const kind = classifyRef(ref);
    if (kind !== "relative" && kind !== "vault-root") return;
    const rel = stripQuery(ref).trim();
    if (!rel) return;
    out.add(resolveVaultRef(pageDir, rel));
  };
  for (const n of index.nodes) {
    if (n.kind !== "element" || insideNonResource(index, n.id)) continue;
    for (const a of n.attrs) {
      if (!a.hasEqual) continue;
      if (n.tag === "link" && a.name === "href") {
        add(a.value);
        continue;
      }
      if ((a.name === "src" || a.name === "poster") && n.tag !== "link") add(a.value);
      if (a.name === "srcset") for (const url of srcsetUrls(a.value)) add(url);
      if (a.name === "style") for (const u of cssUrls(a.value)) add(u);
    }
    if (n.tag === "style" && n.childIds.length) {
      const text = index.nodes[n.childIds[0]];
      if (text?.kind === "text") for (const u of cssUrls(text.raw)) add(u);
    }
  }
  return [...out];
}
var isCssPath = (p) => /\.css$/i.test(p);
async function isPageDependency(modifiedPath, pageSource, pagePath, readCss) {
  const pageDir = dirOf(pagePath);
  const refs = pageReferences(new SourceIndex(pageSource), pageDir);
  if (refs.includes(modifiedPath)) return true;
  const queue = refs.filter(isCssPath).map((p) => [p, 0]);
  const seen = /* @__PURE__ */ new Set();
  while (queue.length) {
    const [cssPath, depth] = queue.shift();
    if (seen.has(cssPath) || depth > 5) continue;
    seen.add(cssPath);
    const text = await readCss(cssPath);
    if (text === null) continue;
    const dir = dirOf(cssPath);
    for (const ref of cssUrls(text)) {
      const kind = classifyRef(ref);
      if (kind !== "relative" && kind !== "vault-root") continue;
      const p = resolveVaultRef(dir, ref);
      if (p === modifiedPath) return true;
      if (isCssPath(p)) queue.push([p, depth + 1]);
    }
  }
  return false;
}

// src/services/commands.ts
function guardCommand(run) {
  return (checking) => run(checking);
}

// src/services/regexp/workerHost.ts
var TaskTimeoutError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "TaskTimeoutError";
  }
};
var WorkerTaskError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "WorkerTaskError";
  }
};
function schedule(cb, ms) {
  if (typeof window !== "undefined") return window.setTimeout(cb, ms);
  return setTimeout(cb, ms);
}
function clearTimer(t) {
  if (typeof window !== "undefined") window.clearTimeout(t);
  else clearTimeout(t);
}
var TaskHost = class {
  constructor(factory, options = { timeoutMs: 1e3 }) {
    this.factory = factory;
    this.options = options;
    this.worker = null;
    this.pending = /* @__PURE__ */ new Map();
    this.nextId = 1;
    this.disposed = false;
  }
  get activeTaskCount() {
    return this.pending.size;
  }
  ensureWorker() {
    if (!this.worker) {
      this.worker = this.factory();
      this.worker.onMessage((msg) => this.handleMessage(msg));
    }
    return this.worker;
  }
  killWorker() {
    if (this.worker) {
      try {
        this.worker.terminate();
      } catch {
      }
      this.worker = null;
    }
  }
  run(payload, timeoutMs) {
    if (this.disposed) return Promise.reject(new Error("TaskHost \u5DF2\u91CA\u653E"));
    const requestId = this.nextId++;
    return new Promise((resolve, reject) => {
      const taskLabel = typeof payload.type === "string" ? payload.type : "task";
      const timer = schedule(() => {
        this.pending.delete(requestId);
        this.failAllPending(`\u4EFB\u52A1 ${taskLabel} \u8D85\u65F6\u5BFC\u81F4 Worker \u7EC8\u6B62,\u5176\u4F59\u5728\u9014\u4EFB\u52A1\u4E00\u5E76\u4E2D\u6B62`);
        reject(new TaskTimeoutError(`\u4EFB\u52A1 ${taskLabel} \u8D85\u65F6\uFF08${timeoutMs ?? this.options.timeoutMs}ms\uFF09\uFF0CWorker \u5DF2\u7EC8\u6B62`));
      }, timeoutMs ?? this.options.timeoutMs);
      this.pending.set(requestId, { resolve, reject, timer });
      try {
        this.ensureWorker().post({ requestId, ...payload });
      } catch (e) {
        clearTimer(timer);
        this.pending.delete(requestId);
        this.killWorker();
        reject(e instanceof Error ? e : new Error(String(e)));
      }
    });
  }
  // 结构校验：非对象、缺 requestId、无对应 pending（已取消/超时）一律丢弃。
  handleMessage(msg) {
    if (typeof msg !== "object" || msg === null) return;
    const m = msg;
    if (typeof m.requestId !== "number") return;
    const entry = this.pending.get(m.requestId);
    if (!entry) return;
    clearTimer(entry.timer);
    this.pending.delete(m.requestId);
    if (m.ok === true) entry.resolve(m.result);
    else entry.reject(new WorkerTaskError(typeof m.error === "string" ? m.error : "worker \u4EFB\u52A1\u5931\u8D25"));
  }
  // 取消全部未完成任务（切换/关闭视图时调用）：被取消的任务可能是灾难性回溯,
  // 无法从外部中断,必须终止 Worker 本身,否则它会继续占用通道饿死后续任务
  // （audit/services rx2 #10）。延迟到达的旧结果因查不到 pending 而丢弃。
  cancelAll(reason = "\u4EFB\u52A1\u5DF2\u53D6\u6D88") {
    for (const [, entry] of this.pending) {
      clearTimer(entry.timer);
      entry.reject(new Error(reason));
    }
    this.pending.clear();
    this.killWorker();
  }
  failAllPending(reason) {
    for (const [, entry] of this.pending) {
      clearTimer(entry.timer);
      entry.reject(new TaskTimeoutError(reason));
    }
    this.pending.clear();
    this.killWorker();
  }
  dispose() {
    this.disposed = true;
    for (const [, entry] of this.pending) {
      clearTimer(entry.timer);
      entry.reject(new Error("TaskHost \u5DF2\u91CA\u653E"));
    }
    this.pending.clear();
    this.killWorker();
  }
};

// src/services/regexp/regexpCore.ts
var RegexpInputError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "RegexpInputError";
  }
};
var ALLOWED_FLAGS = /[dgimsuvy]/g;
function sanitizeFlags(flags) {
  const chars = [...new Set(flags.match(ALLOWED_FLAGS) ?? [])];
  if (!chars.includes("g")) chars.push("g");
  return chars.sort().join("");
}
function compileRegex(pattern, flags) {
  if (pattern.length > 1e4) throw new RegexpInputError("\u6B63\u5219\u8868\u8FBE\u5F0F\u8FC7\u957F");
  const clean = sanitizeFlags(flags);
  try {
    return new RegExp(pattern, clean);
  } catch (e) {
    throw new RegexpInputError(`\u65E0\u6548\u6B63\u5219\u8868\u8FBE\u5F0F\uFF1A${e instanceof Error ? e.message : String(e)}`);
  }
}

// src/services/regexp/regexpSearch.ts
var DEFAULT_REGEXP_LIMITS = { maxMatches: 5e3, maxIterations: 2e6, maxInputLength: 5e6, timeoutMs: 1e3 };
var RegExpSearchAdapter = class {
  constructor(host, limits = DEFAULT_REGEXP_LIMITS) {
    this.host = host;
    this.limits = limits;
  }
  async search(input) {
    if (input.text.length > this.limits.maxInputLength)
      throw new RegexpInputError(`\u8F93\u5165\u8FC7\u957F\uFF08${input.text.length} > ${this.limits.maxInputLength}\uFF09\uFF0C\u8BF7\u7F29\u5C0F\u8303\u56F4`);
    compileRegex(input.pattern, input.flags);
    const result = await this.host.run({
      type: "regexp-search",
      text: input.text,
      pattern: input.pattern,
      flags: input.flags,
      maxMatches: this.limits.maxMatches,
      maxIterations: this.limits.maxIterations,
      revision: input.revision
    }, input.timeoutMs);
    if (!result || !Array.isArray(result.matches)) throw new WorkerTaskError("\u7ED3\u679C\u7ED3\u6784\u975E\u6CD5");
    if (input.revision !== void 0 && result.revision !== input.revision)
      throw new Error("\u7ED3\u679C\u4FEE\u8BA2\u53F7\u8FC7\u671F\uFF0C\u5DF2\u4E22\u5F03");
    return result;
  }
  dispose() {
    this.host.dispose();
  }
};

// src/views/htmlView.ts
var import_obsidian9 = require("obsidian");

// src/views/toolbar.ts
var import_obsidian7 = require("obsidian");
function disabledTarget() {
  return {
    hasFile: () => false,
    title: () => "",
    dirty: () => false,
    canBack: () => false,
    canForward: () => false,
    goBack: () => {
    },
    goForward: () => {
    },
    mode: () => "preview",
    setMode: () => {
    },
    refreshPreview: () => {
    },
    canSave: () => false,
    save: () => {
    },
    widthMenu: () => {
    },
    zoomMenu: () => {
    },
    moreMenu: () => {
    }
  };
}
function showMenuAt(menu, anchor) {
  const rect = anchor.getBoundingClientRect();
  const doc = anchor.ownerDocument;
  const win = doc.defaultView ?? window;
  menu.showAtPosition({ x: rect.left + win.scrollX, y: rect.bottom + win.scrollY }, doc);
}
var ViewToolbar = class {
  constructor(parent, getTarget, t, opts) {
    this.getTarget = getTarget;
    this.labels = [];
    this.titleEl = null;
    this.dirtyEl = null;
    this.modes = {};
    this.saveEl = null;
    this.el = parent.createDiv({ cls: "html-atelier-toolbar" });
    const btn = (host, key, icon, run, cls = "") => {
      const b = host.createEl("button", { cls: "html-atelier-button " + cls, attr: { "aria-label": t(key), title: t(key), "type": "button" } });
      const i = b.createSpan();
      (0, import_obsidian7.setIcon)(i, icon);
      b.addEventListener("click", () => run(b));
      this.labels.push({ el: b, key });
      return b;
    };
    this.backEl = btn(this.el, "tbBack", "arrow-left", () => this.getTarget().goBack());
    this.forwardEl = btn(this.el, "tbForward", "arrow-right", () => this.getTarget().goForward());
    if (opts.showTitle) {
      this.titleEl = this.el.createSpan({ cls: "html-atelier-filetitle" });
      this.dirtyEl = this.el.createSpan({ cls: "html-atelier-dirtydot", attr: { "aria-hidden": "true" }, text: "\u25CF" });
    }
    const modes = this.el.createDiv({ cls: "html-atelier-modes" });
    const modeButtons = [
      ["preview", "tbPreview", "eye"],
      ["edit", "tbEdit", "mouse-pointer-2"],
      ["source", "tbSource", "code-2"],
      ["split", "tbSplit", "columns-2"]
    ];
    for (const [mode, key, icon] of modeButtons) {
      const b = btn(modes, key, icon, () => this.getTarget().setMode(mode));
      const label = b.createSpan({ cls: "html-atelier-mode-label", text: t(key) });
      this.labels.push({ el: label, key });
      this.modes[mode] = b;
    }
    const actions = this.el.createDiv({ cls: "html-atelier-actions" });
    btn(actions, "tbRefresh", "refresh-cw", () => this.getTarget().refreshPreview());
    btn(actions, "tbWidth", "rectangle-horizontal", (el) => this.getTarget().widthMenu(el));
    btn(actions, "tbZoom", "zoom-in", (el) => this.getTarget().zoomMenu(el));
    btn(actions, "tbMore", "more-horizontal", (el) => this.getTarget().moreMenu(el));
    if (opts.showSave) this.saveEl = btn(actions, "tbSave", "save", () => this.getTarget().save(), "html-atelier-save");
  }
  // 状态刷新。目标可能随时变化(面板的"活动视图"),所以每次重新取。
  refresh() {
    const t = this.getTarget();
    const hasFile = t.hasFile();
    if (this.titleEl) {
      this.titleEl.setText(t.title());
      this.titleEl.toggleClass("html-atelier-hidden", !hasFile);
    }
    if (this.dirtyEl) this.dirtyEl.toggleClass("html-atelier-hidden", !t.dirty());
    const mode = t.mode();
    for (const [k, el] of Object.entries(this.modes)) {
      const active = hasFile && mode === k;
      el.toggleClass("html-atelier-active", active);
      el.setAttribute("aria-pressed", String(active));
    }
    this.backEl.disabled = !t.canBack();
    this.forwardEl.disabled = !t.canForward();
    if (this.saveEl) this.saveEl.disabled = !t.canSave();
  }
  // 语言切换后重新求值(可视部分只有图标,文字在 aria-label 上)
  relabel(t) {
    for (const { el, key } of this.labels) {
      if (el.classList.contains("html-atelier-mode-label")) el.setText(t(key));
      else {
        el.setAttribute("aria-label", t(key));
        el.setAttribute("title", t(key));
      }
    }
  }
  destroy() {
    this.el.remove();
  }
};

// src/views/selectionOverlay.ts
var BOX_TAG = "html-atelier-selection-box";
function renderSelectionBoxes(root, rects, selected) {
  for (const old of root.querySelectorAll(BOX_TAG)) old.remove();
  const border = `${selected ? "2px solid" : "1px dashed"} #9275df`;
  for (const rect of rects) {
    const box = root.ownerDocument.createElement(BOX_TAG);
    box.style.setProperty("--html-atelier-x", `${rect.left - 3}px`);
    box.style.setProperty("--html-atelier-y", `${rect.top - 2}px`);
    box.style.setProperty("--html-atelier-w", `${rect.width + 6}px`);
    box.style.setProperty("--html-atelier-h", `${rect.height + 4}px`);
    box.style.setProperty("--html-atelier-border", border);
    root.append(box);
  }
}

// src/views/htmlView.ts
init_patch();

// src/model.ts
init_dist();
function alignSegments(base, work) {
  const eq = (a, b) => a.text === b.text;
  let p = 0;
  while (p < base.length && p < work.length && eq(base[p], work[p])) p++;
  let be = base.length, we = work.length;
  while (be > p && we > p && eq(base[be - 1], work[we - 1])) {
    be--;
    we--;
  }
  const out = [];
  for (let i = 0; i < p; i++) out.push({ base: base[i], work: work[i] });
  const bm = base.slice(p, be), wm = work.slice(p, we);
  const m = bm.length, n = wm.length;
  if (m && n) {
    const dp = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1));
    for (let i2 = m - 1; i2 >= 0; i2--) for (let j2 = n - 1; j2 >= 0; j2--)
      dp[i2][j2] = eq(bm[i2], wm[j2]) ? dp[i2 + 1][j2 + 1] + 1 : Math.max(dp[i2 + 1][j2], dp[i2][j2 + 1]);
    let i = 0, j = 0;
    const gapB = [], gapW = [];
    const flush = () => {
      const k = Math.min(gapB.length, gapW.length);
      for (let x = 0; x < k; x++) out.push({ base: gapB[x], work: gapW[x] });
      for (let x = k; x < gapB.length; x++) out.push({ base: gapB[x], work: null });
      for (let x = k; x < gapW.length; x++) out.push({ base: null, work: gapW[x] });
      gapB.length = 0;
      gapW.length = 0;
    };
    while (i < m && j < n) {
      if (eq(bm[i], wm[j])) {
        flush();
        out.push({ base: bm[i], work: wm[j] });
        i++;
        j++;
      } else if (dp[i + 1][j] >= dp[i][j + 1]) {
        gapB.push(bm[i]);
        i++;
      } else {
        gapW.push(wm[j]);
        j++;
      }
    }
    for (; i < m; i++) gapB.push(bm[i]);
    for (; j < n; j++) gapW.push(wm[j]);
    flush();
  } else {
    for (const s of bm) out.push({ base: s, work: null });
    for (const s of wm) out.push({ base: null, work: s });
  }
  const suffixLen = base.length - be;
  for (let k = 0; k < suffixLen; k++) out.push({ base: base[be + k], work: work[we + k] });
  return out;
}
var excluded = /* @__PURE__ */ new Set(["script", "style", "noscript", "template", "textarea", "select", "option", "svg", "math", "title", "head", "iframe", "object", "embed", "canvas"]);
function parseDocument(source) {
  const doc = parse(source, { sourceCodeLocationInfo: true });
  const segments = [];
  function visit(node, blocked = false, kind = "\u6587\u5B57") {
    const tag = node.tagName ?? "";
    blocked = blocked || excluded.has(tag) || !!node.attrs?.some((a) => a.name === "hidden" || a.name === "contenteditable");
    if (/^h[1-6]$/.test(tag)) kind = "\u6807\u9898";
    else if (tag === "button") kind = "\u6309\u94AE";
    else if (tag === "a") kind = "\u94FE\u63A5";
    else if (tag === "p") kind = "\u6BB5\u843D";
    if (node.nodeName === "#text" && !blocked && node.value?.trim() && node.sourceCodeLocation) {
      const l = node.sourceCodeLocation;
      segments.push({ id: "t" + segments.length, text: node.value, start: l.startOffset, end: l.endOffset, kind });
    }
    for (const child of node.childNodes ?? []) visit(child, blocked, kind);
  }
  visit(doc);
  return { source, segments };
}
var escapeText3 = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function applyText(model, changes) {
  let source = model.source;
  for (const s of [...model.segments].sort((a, b) => b.start - a.start)) {
    const value = changes.get(s.id);
    if (value !== void 0 && value !== s.text) source = source.slice(0, s.start) + escapeText3(value) + source.slice(s.end);
  }
  return source;
}
function makePreview(model, base, nonce, opts) {
  const doc = parse(model.source, { sourceCodeLocationInfo: true });
  const byStart = new Map(model.segments.map((s) => [s.start, s]));
  function visit(node) {
    if (node.attrs) node.attrs = node.attrs.filter((a) => !a.name.startsWith("on") && !["contenteditable", "autofocus"].includes(a.name));
    if (node.childNodes) node.childNodes = node.childNodes.filter((n) => !["script", "base", "iframe", "object", "embed"].includes(n.tagName ?? "") && !(n.tagName === "meta" && n.attrs?.some((a) => a.name === "http-equiv")));
    const kids = node.childNodes;
    if (!kids) return;
    for (let i = 0; i < kids.length; i++) {
      const child = kids[i];
      const seg = child.nodeName === "#text" ? byStart.get(child.sourceCodeLocation?.startOffset ?? -1) : void 0;
      if (seg) {
        kids.splice(i, 0, { nodeName: "#comment", data: `html-atelier-text:${nonce}:${seg.id}`, parentNode: node });
        i++;
      } else visit(child);
    }
  }
  visit(doc);
  const safeBase = base.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  const remote = opts?.allowNetwork === false ? "" : " https: http:";
  const policy = `default-src 'none'; img-src app: obsidian: data: blob:${remote}; media-src app: obsidian: data: blob:${remote}; style-src 'unsafe-inline' app: obsidian: data:${remote}; font-src app: obsidian: data:${remote}; script-src 'none'; frame-src 'none'; connect-src 'none'; form-action 'none'; base-uri app: obsidian:;`;
  const meta = { nodeName: "meta", tagName: "meta", attrs: [{ name: "http-equiv", value: "Content-Security-Policy" }, { name: "content", value: policy }], childNodes: [] };
  const baseEl = { nodeName: "base", tagName: "base", attrs: [{ name: "href", value: safeBase }], childNodes: [] };
  const head = doc.childNodes?.find((n) => n.tagName === "head");
  if (head?.childNodes) {
    head.childNodes.unshift(baseEl, meta);
  } else {
    const html = doc.childNodes?.find((n) => n.tagName === "html");
    const headEl = { nodeName: "head", tagName: "head", attrs: [], childNodes: [baseEl, meta] };
    if (html?.childNodes) html.childNodes.unshift(headEl);
    else doc.childNodes?.unshift(headEl);
  }
  return serialize(doc);
}
function markerRegex(nonce) {
  return new RegExp(`^html-atelier-text:${nonce}:(t\\d+)$`);
}

// src/views/htmlView.ts
init_sourceIndex();

// src/parsing/textMap.ts
init_escape2();
var NAMED_ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: "\xA0",
  copy: "\xA9",
  reg: "\xAE",
  trade: "\u2122",
  hellip: "\u2026",
  mdash: "\u2014",
  ndash: "\u2013",
  lsquo: "\u2018",
  rsquo: "\u2019",
  ldquo: "\u201C",
  rdquo: "\u201D",
  laquo: "\xAB",
  raquo: "\xBB",
  deg: "\xB0",
  plusmn: "\xB1",
  frac12: "\xBD",
  times: "\xD7",
  divide: "\xF7",
  euro: "\u20AC",
  pound: "\xA3",
  yen: "\xA5",
  cent: "\xA2",
  sect: "\xA7",
  para: "\xB6",
  middot: "\xB7"
};
function decodeEntityBody(body) {
  const numeric = /^#([0-9]+)$/.exec(body);
  const hex = /^#[xX]([0-9a-fA-F]+)$/.exec(body);
  if (numeric) {
    const cp = Number(numeric[1]);
    return cp > 0 && cp <= 1114111 ? String.fromCodePoint(cp) : null;
  }
  if (hex) {
    const cp = parseInt(hex[1], 16);
    return cp > 0 && cp <= 1114111 ? String.fromCodePoint(cp) : null;
  }
  return NAMED_ENTITIES[body] ?? null;
}
function alignValueToSlice(value, slice) {
  const map = [];
  let i = 0;
  for (let v = 0; v < value.length; ) {
    const ch = value[v];
    if (ch === "\n" && slice[i] === "\r") {
      const len = slice[i + 1] === "\n" ? 2 : 1;
      map.push([i, i + len]);
      v++;
      i += len;
      continue;
    }
    if (slice[i] === "&") {
      const semi = slice.indexOf(";", i + 1);
      if (semi > 0 && semi - i <= 34) {
        const dec = decodeEntityBody(slice.slice(i + 1, semi));
        if (dec !== null && value.startsWith(dec, v)) {
          for (let k = 0; k < dec.length; k++) map.push([i, semi + 1]);
          v += dec.length;
          i = semi + 1;
          continue;
        }
        if (value[v] !== "&") {
          const cp = value.codePointAt(v) ?? 0;
          const units = cp > 65535 ? 2 : 1;
          for (let k = 0; k < units; k++) map.push([i, semi + 1]);
          v += units;
          i = semi + 1;
          continue;
        }
      }
    }
    if (slice.startsWith(ch, i)) {
      map.push([i, i + 1]);
      v++;
      i++;
      continue;
    }
    return null;
  }
  return i === slice.length ? map : null;
}
var COLLAPSIBLE = /[ \t\n\r\f]/;
var isCollapsibleOnly = (s) => [...s].every((c) => c === "\uFEFF" || COLLAPSIBLE.test(c));
var BLOCK = /* @__PURE__ */ new Set([
  "p",
  "div",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "td",
  "th",
  "blockquote",
  "pre",
  "dl",
  "dt",
  "dd",
  "figure",
  "figcaption",
  "section",
  "article",
  "aside",
  "header",
  "footer",
  "nav",
  "main",
  "form",
  "fieldset",
  "details",
  "summary",
  "address",
  "hgroup",
  "button",
  "caption"
]);
var EMPTY_SLOT = /* @__PURE__ */ new Set(["p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "td", "th", "button", "a", "blockquote", "dd", "dt", "caption", "figcaption", "summary", "pre"]);
function buildTextMap(index) {
  const nodes = index.nodes;
  const nearestBlock = (nodeId) => {
    let cur = nodes[nodeId];
    while (cur) {
      if (cur.kind === "element" && BLOCK.has(cur.tag)) return cur.id;
      cur = cur.parentId === null ? void 0 : nodes[cur.parentId];
    }
    return null;
  };
  const fallback = index.elements("body")[0]?.id ?? index.root?.id ?? null;
  const grouped = /* @__PURE__ */ new Map();
  const unmappableNodes = [];
  const addSegment = (containerId, seg) => {
    let arr = grouped.get(containerId);
    if (!arr) {
      arr = [];
      grouped.set(containerId, arr);
    }
    arr.push(seg);
  };
  for (const n of nodes) {
    if (n.kind === "element" && n.tag === "br" && !n.excluded) {
      const containerId2 = nearestBlock(n.id) ?? fallback;
      if (containerId2 !== null) addSegment(containerId2, { nodeId: n.id, text: "", map: [], isBr: true, brRange: [n.startTagStart, n.startTagEnd] });
      continue;
    }
    if (n.kind !== "text" || n.excluded) continue;
    const containerId = nearestBlock(n.id) ?? fallback;
    if (containerId === null) continue;
    const aligned = alignValueToSlice(n.value, n.raw);
    if (aligned) {
      const shifted = aligned.map(([s, e]) => [s + n.start, e + n.start]);
      addSegment(containerId, { nodeId: n.id, text: n.value, map: shifted, isBr: false, brRange: [0, 0] });
    } else if (isCollapsibleOnly(n.value)) {
      addSegment(containerId, { nodeId: n.id, text: " ", map: [[n.start, n.end]], isBr: false, brRange: [0, 0] });
    } else {
      unmappableNodes.push(n.id);
    }
  }
  const containers = [];
  for (const [containerId, segments] of grouped) {
    const el = nodes[containerId];
    if (!el || el.kind !== "element") continue;
    segments.sort((a, b) => a.nodeId - b.nodeId);
    const preserve = el.tag === "pre";
    let logical = "";
    const map = [];
    let pendingWs = false;
    let atLineStart = true;
    let wsRun = null;
    let wsRunClosed = false;
    for (const seg of segments) {
      if (seg.isBr) {
        if (pendingWs && !atLineStart && wsRun) {
          logical += " ";
          map.push(wsRun);
        }
        pendingWs = false;
        wsRun = null;
        wsRunClosed = false;
        logical += "\n";
        map.push({ nodeId: seg.nodeId, srcStart: seg.brRange[0], srcEnd: seg.brRange[1] });
        atLineStart = true;
        continue;
      }
      const chars = seg.map;
      for (let k = 0; k < seg.text.length; k++) {
        const ch = seg.text[k];
        const [ss, se] = chars[k];
        if (!preserve && COLLAPSIBLE.test(ch)) {
          if (!wsRun) wsRun = { nodeId: seg.nodeId, srcStart: ss, srcEnd: se };
          else if (!wsRunClosed) wsRun.srcEnd = se;
          pendingWs = true;
          continue;
        }
        if (pendingWs && !atLineStart && wsRun) {
          logical += " ";
          map.push(wsRun);
        }
        pendingWs = false;
        wsRun = null;
        wsRunClosed = false;
        atLineStart = false;
        logical += ch;
        map.push({ nodeId: seg.nodeId, srcStart: ss, srcEnd: se });
      }
      wsRunClosed = true;
    }
    containers.push({ nodeId: containerId, tag: el.tag, logical, map, hidden: el.hidden, preserveWhitespace: preserve });
  }
  for (const el of nodes) {
    if (el.kind !== "element") continue;
    if (!EMPTY_SLOT.has(el.tag)) continue;
    if (grouped.has(el.id)) continue;
    const hasText = el.childIds.some((id) => nodes[id]?.kind === "text" || nodes[id]?.kind === "element" && EMPTY_SLOT.has(nodes[id].tag));
    if (hasText) continue;
    containers.push({ nodeId: el.id, tag: el.tag, logical: "", map: [], hidden: el.hidden, preserveWhitespace: el.tag === "pre" });
  }
  containers.sort((a, b) => a.nodeId - b.nodeId);
  return { containers, unmappableNodes };
}
function rangesForLogical(container, lStart, lEnd) {
  const ranges = [];
  if (!Number.isFinite(lStart) || !Number.isFinite(lEnd) || lStart < 0) return ranges;
  const from = Math.floor(lStart);
  const to = Math.min(container.map.length, Math.floor(lEnd));
  for (let i = from; i < to; i++) {
    const m = container.map[i];
    const last = ranges[ranges.length - 1];
    if (last && last.nodeId === m.nodeId && last.srcEnd === m.srcStart) last.srcEnd = m.srcEnd;
    else ranges.push({ nodeId: m.nodeId, srcStart: m.srcStart, srcEnd: m.srcEnd });
  }
  return ranges;
}
function replaceLogical(index, container, lStart, lEnd, replacement) {
  if (lStart < 0 || lEnd > container.logical.length || lStart > lEnd) return { ok: false, reason: "out-of-range", ranges: [] };
  const ranges = rangesForLogical(container, lStart, lEnd);
  if (!ranges.length) return { ok: false, reason: "empty-range", ranges };
  if (ranges.length > 1) return { ok: false, reason: "cross-node", ranges };
  const r = ranges[0];
  return { ok: true, patch: { start: r.srcStart, end: r.srcEnd, expected: index.source.slice(r.srcStart, r.srcEnd), replacement: escapeText2(replacement) } };
}

// src/views/htmlView.ts
init_escape2();

// src/services/cssInline.ts
init_dist();
init_url();
var IMPORT_RE = /@import\s+(?:url\(\s*(['"]?)([^'")\s;]+)\1\s*\)|(['"])([^'"]+)\3)[^;]*;/gi;
var URL_RE = /url\(\s*(['"]?)([^'")]+)\1\s*\)/gi;
var MAX_DEPTH = 5;
function rewriteUrl(whole, target, cssPath, io) {
  const kind = classifyRef(target);
  if (kind !== "relative" && kind !== "vault-root") return whole;
  const abs = io.resourceUrl(resolveVaultRef(dirOf(cssPath), target));
  if (!abs) return whole;
  return `url("${abs.replace(/"/g, "%22")}")`;
}
function rewriteUrls(css, cssPath, io) {
  URL_RE.lastIndex = 0;
  return css.replace(URL_RE, (whole, _q, target) => rewriteUrl(whole, target, cssPath, io));
}
function splitCssLex(text) {
  const spans = [];
  let seg = 0, i = 0;
  const push = (end, code) => {
    if (end > seg) spans.push({ s: text.slice(seg, end), code });
  };
  while (i < text.length) {
    if (text.startsWith("/*", i)) {
      const close = text.indexOf("*/", i + 2);
      const stop = close === -1 ? text.length : close + 2;
      push(i, true);
      seg = i;
      push(stop, false);
      seg = stop;
      i = stop;
      continue;
    }
    const c = text[i];
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < text.length && text[j] !== c) {
        if (text[j] === "\\") j++;
        j++;
      }
      const stop = Math.min(j + 1, text.length);
      push(i, true);
      seg = i;
      push(stop, false);
      seg = stop;
      i = stop;
      continue;
    }
    if (text.slice(i, i + 3).toLowerCase() === "url" && text[i + 3] === "(") {
      let depth = 0, j = i + 3;
      do {
        if (text[j] === "(") depth++;
        else if (text[j] === ")") depth--;
        j++;
      } while (j < text.length && depth > 0);
      i = j;
      continue;
    }
    if (text.slice(i, i + 7).toLowerCase() === "@import") {
      const semi = text.indexOf(";", i + 7);
      i = semi === -1 ? text.length : semi + 1;
      continue;
    }
    i++;
  }
  push(text.length, true);
  return spans;
}
async function expandCssText(text, ownerPath, depth, visited, io) {
  const parts = [];
  for (const span of splitCssLex(text)) {
    if (!span.code) {
      parts.push({ s: span.s, final: true });
      continue;
    }
    let last = 0;
    IMPORT_RE.lastIndex = 0;
    let m;
    while ((m = IMPORT_RE.exec(span.s)) !== null) {
      const target = (m[2] ?? m[4] ?? "").trim();
      const kind = classifyRef(target);
      if (kind !== "relative" && kind !== "vault-root") continue;
      const importPath = resolveVaultRef(dirOf(ownerPath), target);
      if (depth >= MAX_DEPTH || visited.has(importPath)) continue;
      visited.add(importPath);
      const sub = await io.readCss(importPath);
      if (sub === null) continue;
      parts.push({ s: span.s.slice(last, m.index), final: false });
      parts.push({ s: await expandCssText(sub, importPath, depth + 1, visited, io), final: true });
      last = m.index + m[0].length;
    }
    parts.push({ s: span.s.slice(last), final: false });
  }
  return parts.map((p) => p.final ? p.s : rewriteUrls(p.s, ownerPath, io)).join("");
}
async function loadCss(cssPath, io) {
  const text = await io.readCss(cssPath);
  if (text === null) return null;
  return expandCssText(text, cssPath, 0, /* @__PURE__ */ new Set(), io);
}
function escapeStyleClose(css) {
  return css.replace(/<\/(style)/gi, "<\\/$1");
}
function isLocalStylesheetLink(node) {
  if (node.tagName !== "link" || !node.attrs) return null;
  const rel = (node.attrs.find((a) => a.name === "rel")?.value ?? "").trim().toLowerCase().split(/\s+/);
  if (!rel.includes("stylesheet") || rel.includes("alternate")) return null;
  if (node.attrs.some((a) => a.name === "disabled")) return null;
  const href = node.attrs.find((a) => a.name === "href")?.value;
  return href ? { node, href } : null;
}
async function inlineLocalStylesheets(source, pagePath, io) {
  const doc = parse(source);
  const pageDir = dirOf(pagePath);
  const walk = async (nodes) => {
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (n.childNodes?.length) await walk(n.childNodes);
      if (n.tagName === "style") {
        const textNode = n.childNodes?.find((c) => c.nodeName === "#text");
        if (textNode && textNode.value !== void 0)
          textNode.value = escapeStyleClose(await expandCssText(textNode.value, pagePath, 0, /* @__PURE__ */ new Set(), io));
        continue;
      }
      const link = isLocalStylesheetLink(n);
      if (!link) continue;
      const kind = classifyRef(link.href);
      if (kind !== "relative" && kind !== "vault-root") continue;
      const css = await loadCss(resolveVaultRef(pageDir, link.href), io);
      if (css === null) continue;
      const style = {
        nodeName: "style",
        tagName: "style",
        namespaceURI: "http://www.w3.org/1999/xhtml",
        attrs: n.attrs.filter((a) => a.name !== "rel" && a.name !== "href" && a.name !== "disabled").map((a) => ({ ...a })),
        childNodes: [],
        parentNode: n.parentNode
      };
      const text = { nodeName: "#text", value: escapeStyleClose(css), parentNode: style };
      style.childNodes.push(text);
      nodes[i] = style;
    }
  };
  await walk(doc.childNodes ?? []);
  return serialize(doc);
}

// src/views/htmlView.ts
var HTML_VIEW = "html-atelier-preview";
var OVERLAY_CSS = "html-atelier-selection-layer{all:initial;position:fixed;inset:0;pointer-events:none;z-index:2147483647}html-atelier-selection-box{position:fixed;pointer-events:none;box-sizing:border-box;left:var(--html-atelier-x);top:var(--html-atelier-y);width:var(--html-atelier-w);height:var(--html-atelier-h);border:var(--html-atelier-border);border-radius:2px}";
var EMPTY_SLOT_CSS = "p:empty,li:empty,div:empty,td:empty,th:empty{min-height:1.2em}";
var HtmlFileView = class extends import_obsidian9.FileView {
  constructor(leaf, callbacks) {
    super(leaf);
    this.session = null;
    this.mode = "preview";
    this.width = "auto";
    this.zoom = 100;
    this.selected = null;
    this.nonce = "";
    this.textNodes = /* @__PURE__ */ new Map();
    this.overlay = null;
    this.emptySlotStyle = null;
    this.iframe = null;
    this.iframeWrap = null;
    this.sourceHost = null;
    this.sourceEditor = null;
    this.loadToken = 0;
    this.previewTimer = null;
    this.lastNavWin = null;
    this.hovered = null;
    // 后退/前进正在加载的目标路径。只在"这次加载确实来自该次遍历"时用于对齐索引,
    // 否则按普通导航压栈——若遍历的打开失败又来了别的文件,压栈行为必须保持正常。
    this.pendingTraverse = null;
    // 换文件时等待恢复的滚动比例(来自目标文件的导航记录)
    this.pendingRestoreRatio = null;
    // 视图级默认值只应用一次(之后由导航位置/用户操作决定)
    this.viewDefaultsApplied = false;
    // 面板内最近持有焦点的输入框:保存按钮的 mousedown 会先把焦点从文字框拿走,
    // click 处理器/saveFile 里再读 activeElement 已经是按钮(2026-09-30 复查:保存后
    // 焦点离开侧栏文字框)。这里持续跟踪,保存时作为兜底。
    this.lastPanelInput = null;
    this.panelInputTracked = false;
    // 工具栏作用于本视图。面板持有的是活动视图的这个对象,因此两处共用同一份语义。
    this.targetCache = null;
    this.toolbar = null;
    this.toolbarHost = null;
    this.lastSession = null;
    this.lastFile = null;
    // 抓取当前位置并更新栈顶。必须在用户**滚动时**与**离开页面前**调用:
    // 新页面加载那一刻窗口还是空白的,那时抓到的 scrollRatio 恒为 0,
    // Back/Forward 于是永远回到顶部(审计 round4 BUG 34)。
    this.scrollCaptureTimer = null;
    this.currentAnchor = "";
    this.pendingAnchor = "";
    // ---- 预览渲染 ----
    this.renderCount = 0;
    this.previewBuildToken = 0;
    // 当前可见帧:预加载期间 this.iframe 指向隐藏的新帧,可见的仍是它
    this.visibleFrame = null;
    // ---- 修改标记(editor.showChangeHighlights)----
    // 用 CSS Custom Highlight API 做 Range 级高亮:不改 DOM 结构,所以 marker 注释与
    // 文字节点的相邻关系(选择/编辑全靠它)不受影响。宿主不支持时退到元素级属性高亮。
    this.changeStyle = null;
    this.preSaveSelection = null;
    this.preSaveScroll = null;
    this.preSaveFocus = null;
    this.callbacks = callbacks;
  }
  getViewType() {
    return HTML_VIEW;
  }
  getIcon() {
    return "file-code-2";
  }
  canAcceptExtension(ext) {
    return ["html", "htm"].includes(ext.toLowerCase());
  }
  getDisplayText() {
    return this.file?.name ?? "HTML Atelier";
  }
  async onOpen() {
    this.contentEl.addClass("html-atelier-view");
    this.toolbarHost = this.contentEl.createDiv({ cls: "html-atelier-toolbarhost" });
    this.contentEl.createDiv({ cls: "html-atelier-main", attr: { "data-main": "" } });
    this.syncToolbarPlacement();
    this.trackPanelInput();
  }
  trackPanelInput() {
    if (this.panelInputTracked) return;
    this.panelInputTracked = true;
    const onFocusIn = (e) => {
      const t = e.target;
      if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement)
        this.lastPanelInput = t.closest(".html-atelier-panel") ? t : null;
    };
    const doc = this.contentEl.ownerDocument;
    this.registerDomEvent(doc, "focusin", onFocusIn, true);
  }
  // 工具栏跟随 editor.toolbarPlacement:'view' 时自绘,'sidebar' 时交给右侧栏面板。
  // 用固定的 toolbarHost 占位,避免在 contentEl 里插入/删除节点时打乱 [data-main]。
  syncToolbarPlacement() {
    if (!this.toolbarHost) return;
    const inView = this.callbacks.settings().editor.toolbarPlacement === "view";
    if (inView && !this.toolbar) {
      this.toolbar = new ViewToolbar(this.toolbarHost, () => this.toolbarTarget(), this.callbacks.t, { showTitle: true, showSave: true });
    } else if (!inView && this.toolbar) {
      this.toolbar.destroy();
      this.toolbar = null;
    }
    this.toolbarHost.toggleClass("html-atelier-hidden", !inView);
    this.refreshToolbar();
  }
  toolbarTarget() {
    if (!this.targetCache) this.targetCache = {
      hasFile: () => !!this.file,
      title: () => this.file?.name ?? "",
      dirty: () => !!this.session && this.session.dirty,
      canBack: () => this.callbacks.nav.canBack(this),
      canForward: () => this.callbacks.nav.canForward(this),
      goBack: () => this.goBack(),
      goForward: () => this.goForward(),
      mode: () => this.mode,
      setMode: (m) => this.setMode(m),
      refreshPreview: () => this.renderFrame(true),
      canSave: () => !!this.session && this.session.dirty && this.session.operation === "idle",
      save: () => {
        if (this.file && this.session) void this.callbacks.save(this.file, this.session);
      },
      widthMenu: (a) => this.showWidthMenu(a),
      zoomMenu: (a) => this.showZoomMenu(a),
      moreMenu: (a) => this.showMoreMenu(a)
    };
    return this.targetCache;
  }
  // 语言切换后重新求值工具栏标签(可视部分只有图标,文字在 aria-label 上)
  relabelToolbar() {
    this.toolbar?.relabel(this.callbacks.t);
  }
  // ---- 状态持久化(D0-10 实测:getState/setState 跨重启恢复)----
  getState() {
    return {
      ...super.getState(),
      mode: this.mode,
      width: this.width,
      zoom: this.zoom,
      selected: this.selected ?? null
    };
  }
  async setState(state, result) {
    void result;
    await super.setState(state, result);
    const st = state ?? {};
    if (st.mode) this.mode = st.mode;
    if (st.width !== void 0) this.width = st.width;
    if (st.zoom !== void 0) this.zoom = st.zoom;
  }
  async onLoadFile(file) {
    const token = ++this.loadToken;
    try {
      const s = await this.callbacks.getSession(file);
      if (token !== this.loadToken) return;
      this.session = s;
      this.lastSession = s;
      this.lastFile = file;
      const st = this.callbacks.nav.lastPosition(file.path);
      const pv = this.callbacks.settings().preview;
      if (st && pv.rememberViewport) {
        this.zoom = st.zoom;
        this.width = st.width;
      }
      if (!this.viewDefaultsApplied) {
        this.viewDefaultsApplied = true;
        this.mode = this.callbacks.settings().editor.defaultMode;
        if (this.width === "auto") this.width = pv.defaultWidth;
        if (this.zoom === 100) this.zoom = pv.defaultZoom;
      }
      this.pendingRestoreRatio = st && pv.rememberPosition ? st.scrollRatio : null;
      this.mountMain();
      this.renderFrame(true);
      const pending = window.htmlAtelierPendingAnchor;
      if (pending) {
        this.currentAnchor = pending;
        window.htmlAtelierPendingAnchor = void 0;
      }
      const loadedPath = this.file?.path ?? file.path;
      if (this.pendingTraverse === loadedPath) {
        this.pendingTraverse = null;
        this.callbacks.nav.alignToPath(this, loadedPath);
      } else this.pushNav();
      this.callbacks.onSelectChanged(null, s);
    } catch (e) {
      console.error(e);
      this.contentEl.setText(this.callbacks.t("viewLoadFailed"));
    }
  }
  async onUnloadFile() {
    this.flushSourceSync();
    ++this.loadToken;
    this.cancelSourceSync();
    this.detachSource();
    this.iframe = null;
    this.visibleFrame = null;
    this.session = null;
    this.selected = null;
    this.callbacks.onSelectChanged(null, null);
  }
  async onClose() {
    this.captureScroll();
    this.flushSourceSync();
    this.cancelSourceSync();
    this.detachSource();
    const session = this.session ?? this.lastSession;
    const file = this.file ?? this.lastFile;
    if (session?.dirty && file && !this.callbacks.isUnloading() && this.callbacks.settings().drafts.closeBehavior === "ask" && window.confirm(this.callbacks.t("draftsAskOnClose", { path: file.path })))
      await this.callbacks.save(file, session);
  }
  mountMain() {
    const main = this.contentEl.querySelector("[data-main]") ?? this.contentEl.createDiv({ cls: "html-atelier-main", attr: { "data-main": "" } });
    main.empty();
    this.iframe = null;
    this.visibleFrame = null;
    this.lastNavWin = null;
    this.iframeWrap = main.createDiv({ cls: "html-atelier-viewport" });
    this.sourceHost = main.createDiv({ cls: "html-atelier-sourcehost" });
    this.applyMode();
    this.applyViewport();
  }
  // ---- 模式与视口 ----
  setMode(mode) {
    this.mode = mode;
    this.applyMode();
    this.applyViewport();
    if (mode === "source" || mode === "split") this.mountSource();
    this.hovered = null;
    this.drawSelection();
    this.refreshToolbar();
    this.pushNav();
  }
  applyMode() {
    if (!this.iframeWrap || !this.sourceHost) return;
    const showPreview = this.mode === "preview" || this.mode === "edit" || this.mode === "split";
    const showSource = this.mode === "source" || this.mode === "split";
    this.iframeWrap.toggleClass("html-atelier-hidden", !showPreview);
    this.sourceHost.toggleClass("html-atelier-hidden", !showSource);
    this.iframeWrap.toggleClass("html-atelier-editmode", this.mode === "edit" || this.mode === "split");
    this.contentEl.toggleClass("html-atelier-issplit", this.mode === "split");
    this.updateEmptySlots();
  }
  // 空块占位只在编辑/分栏生效:预览要保持与浏览器一致的还原度
  updateEmptySlots() {
    if (this.emptySlotStyle) this.emptySlotStyle.disabled = !(this.mode === "edit" || this.mode === "split");
  }
  applyViewport() {
    if (!this.iframeWrap) return;
    const w = this.width === "auto" ? "100%" : `${this.width}px`;
    setCss(this.iframeWrap, "width", w);
    const z = this.zoom / 100;
    const frame = this.iframe;
    if (frame) {
      setCss(frame, "transform-origin", "top left");
      setCss(frame, "width", `${100 / z}%`);
      setCss(frame, "height", `${100 / z}%`);
      setCss(frame, "transform", `scale(${z})`);
    }
  }
  showWidthMenu(anchor) {
    const t = this.callbacks.t;
    const menu = new import_obsidian9.Menu();
    const set = (w, label) => menu.addItem((i) => {
      i.setTitle(label).onClick(() => {
        this.width = w;
        this.applyViewport();
        this.pushNav();
      });
    });
    set("auto", t("widthAuto"));
    set(1440, t("widthDesktop"));
    set(768, t("widthTablet"));
    set(390, t("widthMobile"));
    menu.addSeparator();
    menu.addItem((i) => i.setTitle(t("widthCustom")).onClick(() => {
      const v = window.prompt(this.callbacks.t("widthCustom"), String(this.width === "auto" ? 1280 : this.width));
      if (v === null) return;
      const n = Math.round(Math.min(3840, Math.max(240, Number(v) || 0)));
      if (n) {
        this.width = n;
        this.applyViewport();
        this.pushNav();
      }
    }));
    showMenuAt(menu, anchor);
  }
  showZoomMenu(anchor) {
    const menu = new import_obsidian9.Menu();
    for (const z of [25, 50, 75, 100, 125, 150, 200]) {
      menu.addItem((i) => i.setTitle(`${z}%`).onClick(() => {
        this.zoom = z;
        this.applyViewport();
        this.pushNav();
      }));
    }
    menu.addSeparator();
    menu.addItem((i) => i.setTitle(this.callbacks.t("tbZoomReset")).onClick(() => {
      this.zoom = 100;
      this.applyViewport();
      this.pushNav();
    }));
    showMenuAt(menu, anchor);
  }
  showMoreMenu(anchor) {
    const t = this.callbacks.t;
    const menu = new import_obsidian9.Menu();
    menu.addItem((i) => i.setTitle(t("menuSaveAs")).onClick(() => this.pluginEvent("save-as")));
    menu.addItem((i) => i.setTitle(t("menuOpenBrowserCurrent")).onClick(() => this.openCurrentInBrowser()));
    menu.addSeparator();
    menu.addItem((i) => i.setTitle(t("menuCopyPageLink")).onClick(() => this.pluginEvent("copy-page-link")));
    menu.addItem((i) => i.setTitle(t("menuCopySectionLink")).onClick(() => this.pluginEvent("copy-section-link")));
    menu.addItem((i) => i.setTitle(t("menuCopyEmbed")).onClick(() => this.pluginEvent("copy-embed")));
    menu.addSeparator();
    menu.addItem((i) => i.setTitle(t("menuDraftManager")).onClick(() => this.pluginEvent("draft-manager")));
    menu.addItem((i) => i.setTitle(t("menuConflict")).onClick(() => this.pluginEvent("conflict")));
    showMenuAt(menu, anchor);
  }
  pluginEvent(name) {
    window.dispatchEvent(new CustomEvent("html-atelier-cmd", { detail: { name, view: this } }));
  }
  openCurrentInBrowser() {
    if (!this.file || !this.session) return;
    const act = this.callbacks.settings().links.unsavedBrowserAction;
    if (this.session.dirty) {
      if (act === "saved") void this.callbacks.save(this.file, this.session);
      else if (!window.confirm(this.callbacks.t("linksConfirmOpenUnsaved"))) return;
    }
    void this.callbacks.router.openHtmlInBrowser({ kind: "library-html", raw: "", target: this.file.path, query: "", fragment: "", file: this.file });
  }
  // ---- 导航(F06)----
  pushNav() {
    if (!this.file) return;
    const entry = currentNavEntry(this.file, this.currentAnchor, this.lastNavWin ?? this.iframe?.contentWindow ?? null, this.zoom, this.width);
    if (entry) this.callbacks.nav.push(this, entry);
    this.refreshToolbar();
  }
  captureScroll() {
    if (!this.file || !this.session) return;
    const win = this.lastNavWin ?? this.iframe?.contentWindow ?? null;
    if (!win) return;
    try {
      const entry = currentNavEntry(this.file, this.currentAnchor, win, this.zoom, this.width);
      if (entry) this.callbacks.nav.updateTop(this, entry);
    } catch {
    }
  }
  // 帧的 load 事件到达时,长文档的布局可能还没完成(scrollHeight 仍小),此时按比例算出的
  // 目标位置约等于 0。因此按需重试几次,直到实际滚动位置与目标一致(审计 round4 BUG 34 的
  // 后半段:比例已经记录正确,但恢复落空)。
  restoreScrollWhenReady(win, ratio, attempt = 0) {
    if (!win || !this.session) return;
    if (!win.document || !win.document.documentElement) return;
    if (this.iframe && this.iframe.contentWindow !== win) return;
    const max = () => win.document.documentElement.scrollHeight - win.innerHeight;
    if (ratio <= 0) return;
    const target = max() * ratio;
    if (max() > 0) win.scrollTo(0, target);
    if (attempt >= 6) return;
    if (max() === 0 || Math.abs(win.scrollY - target) > 4) {
      window.setTimeout(() => this.restoreScrollWhenReady(win, ratio, attempt + 1), 60);
    }
  }
  scheduleScrollCapture() {
    if (this.scrollCaptureTimer !== null) window.clearTimeout(this.scrollCaptureTimer);
    this.scrollCaptureTimer = window.setTimeout(() => {
      this.scrollCaptureTimer = null;
      this.captureScroll();
    }, 300);
  }
  goBack() {
    const e = this.callbacks.nav.back(this);
    if (!e) return;
    this.navigateEntry(e);
  }
  goForward() {
    const e = this.callbacks.nav.forward(this);
    if (!e) return;
    this.navigateEntry(e);
  }
  navigateEntry(e) {
    this.zoom = e.zoom;
    this.width = e.width;
    if (this.file && e.path !== this.file.path) {
      this.pendingAnchor = e.anchor;
      this.pendingTraverse = e.path;
      const target = this.app.vault.getAbstractFileByPath(e.path);
      if (target instanceof import_obsidian9.TFile) {
        if (!this.callbacks.sidebarSuppressed()) void this.app.workspace.revealLeaf(this.leaf);
        void this.leaf.openFile(target).catch((err) => {
          this.pendingTraverse = null;
          window.htmlAtelierNavError = String(err);
        });
        return;
      }
      void this.app.workspace.openLinkText(e.path, "", "active").catch((err) => {
        this.pendingTraverse = null;
        window.htmlAtelierNavError = String(err);
      });
    } else {
      this.currentAnchor = e.anchor;
      this.scrollToAnchor(e.anchor);
      this.applyViewport();
    }
  }
  scrollToAnchor(anchor) {
    const win = this.iframe?.contentWindow;
    if (!win) return;
    this.currentAnchor = anchor;
    const id = anchor.replace(/^#/, "");
    if (!id) {
      win.scrollTo(0, 0);
      return;
    }
    let target = null;
    try {
      target = win.document.getElementById(decodeURIComponent(id));
    } catch {
      target = win.document.getElementById(id);
    }
    if (!target) {
      const dom = this.textNodes.get(id);
      if (dom?.parentElement) target = dom.parentElement;
    }
    if (target) target.scrollIntoView();
    else win.scrollTo(0, 0);
  }
  // 逻辑区间 → 预览定位(F10 文字列表)。按容器与逻辑偏移反查源节点,再经预览标记
  // 找到对应的 DOM 文字节点并滚动;查不到时返回 false,由调用方决定降级。
  // 面板定位入口(大纲/文案/搜索命中共用)在滚动之前必须先让预览**可见**:
  // 源码模式下 iframe 是 display:none,scrollIntoView 打在隐藏元素上等于什么都没发生
  // (用户反馈"点右侧大纲没反应"的第三种成因)。预览模式则切到编辑,才能显示选中高亮。
  prepareLocate() {
    if (this.mode === "source") this.setMode("split");
    else if (this.mode === "preview") this.setMode("edit");
  }
  // 搜索命中 → 在预览里选中那段文字,与点击预览文字走同一条选择路径
  // (视图 selected、侧栏表单、撤销分组键都以它为准)。
  selectText(segmentId) {
    if (!this.session) return;
    this.prepareLocate();
    this.selected = { kind: "text", segmentId };
    this.describeSelection();
    this.hovered = null;
    this.scrollToAnchor(`#${segmentId}`);
    this.callbacks.onSelectChanged(this.selected, this.session);
    this.drawSelection();
  }
  locateLogical(containerIndex, lStart, lEnd) {
    void lEnd;
    if (!this.session) return false;
    this.prepareLocate();
    const { index, map } = this.currentTextMap();
    const c = map[containerIndex];
    if (!c || !c.map.length) return false;
    const at = Math.min(Math.max(0, lStart), c.map.length - 1);
    const ordered = [...c.map.slice(at), ...c.map.slice(0, at).reverse()];
    const model = this.currentModel();
    let segId = null;
    let dom = null;
    for (const m of ordered) {
      const node = index.nodes[m.nodeId];
      if (!node || node.kind !== "text") continue;
      const seg = model.segments.find((x) => x.start >= node.start && x.start < node.end);
      const candidate = seg ? this.textNodes.get(seg.id) : null;
      if (seg && candidate) {
        segId = seg.id;
        dom = candidate;
        break;
      }
    }
    if (!segId || !dom) return false;
    const short = dom.data.trim().length <= 80;
    dom.parentElement?.scrollIntoView({ block: short ? "start" : "center" });
    this.hovered = segId;
    this.drawSelection();
    return true;
  }
  refreshToolbar() {
    this.toolbar?.refresh();
    this.callbacks.onViewStateChanged();
  }
  renderFrame(reposition = false) {
    if (!this.session || !this.file || !this.iframeWrap) return;
    this.renderCount++;
    const oldWin = (this.visibleFrame ?? this.iframe)?.contentWindow ?? null;
    let ratio = 0;
    if (oldWin?.document?.documentElement && reposition) ratio = this.callbacks.nav.scrollRatioOf(oldWin);
    if (this.iframe && this.iframe !== this.visibleFrame) this.iframe.remove();
    const previous = this.visibleFrame;
    this.nonce = Math.random().toString(36).slice(2, 10);
    const resource = this.app.vault.getResourcePath(this.file);
    const base = resource.slice(0, resource.lastIndexOf("/") + 1);
    const frame = this.iframeWrap.createEl("iframe", { cls: "html-atelier-frame", attr: { sandbox: "allow-same-origin", title: `${this.file.name} \u2014 HTML Atelier`, referrerpolicy: "no-referrer" } });
    frame.addClass("html-atelier-hidden");
    this.iframe = frame;
    frame.addEventListener("load", () => {
      if (!frame.getAttribute("srcdoc")) return;
      const doc = frame.contentDocument;
      if (!doc) return;
      if (this.iframe !== frame) {
        frame.remove();
        return;
      }
      previous?.remove();
      frame.toggleClass("html-atelier-hidden", false);
      this.visibleFrame = frame;
      this.lastNavWin = frame.contentWindow;
      this.applyViewport();
      this.textNodes.clear();
      const re = markerRegex(this.nonce);
      const walker = doc.createTreeWalker(doc, 128);
      let comment;
      while (comment = walker.nextNode()) {
        const match = re.exec(comment.nodeValue ?? "");
        if (match && comment.nextSibling?.nodeType === 3) this.textNodes.set(match[1], comment.nextSibling);
      }
      const styleEl = doc.createElement("style");
      styleEl.textContent = OVERLAY_CSS;
      doc.head?.append(styleEl);
      this.changeStyle = null;
      const slotStyle = doc.createElement("style");
      slotStyle.textContent = EMPTY_SLOT_CSS;
      doc.head?.append(slotStyle);
      this.emptySlotStyle = slotStyle;
      this.updateEmptySlots();
      const layer = doc.createElement("html-atelier-selection-layer");
      doc.documentElement?.append(layer);
      this.overlay = layer.attachShadow({ mode: "open" });
      const shadowStyle = doc.createElement("style");
      shadowStyle.textContent = OVERLAY_CSS;
      this.overlay.append(shadowStyle);
      this.wirePreviewEvents(doc);
      this.syncTextNodes();
      this.applyChangeHighlights();
      const anchor = this.pendingAnchor || this.currentAnchor;
      this.pendingAnchor = "";
      if (anchor) this.scrollToAnchor(anchor);
      else if (this.pendingRestoreRatio !== null) {
        const target = this.pendingRestoreRatio;
        this.pendingRestoreRatio = null;
        this.callbacks.nav.restoreScroll(frame.contentWindow, target);
      } else if (reposition) this.restoreScrollWhenReady(frame.contentWindow, ratio);
      this.drawSelection();
      this.refreshToolbar();
    });
    const buildToken = ++this.previewBuildToken;
    const source = this.session.workingSource;
    const filePath = this.file.path;
    const allowNetwork = this.callbacks.settings().preview.allowNetworkAssets;
    const commit = (preview) => {
      if (buildToken !== this.previewBuildToken || this.iframe !== frame) return;
      if (this.session && this.session.workingSource !== source) {
        void this.renderFrame(reposition);
        return;
      }
      frame.srcdoc = preview;
    };
    void this.buildPreviewSource(source, filePath, base).then(commit).catch((e) => {
      console.error("\u9884\u89C8\u6784\u5EFA\u5931\u8D25,\u56DE\u9000\u4E0D\u5185\u8054", e);
      commit(makePreview(parseDocument(source), base, this.nonce, { allowNetwork }));
    });
  }
  // 预览源生成:库内本地样式表先内联成 <style>(宿主 CSP 拦截 app:// 样式表加载,
  // 2026-09-30 真机定因,见 services/cssInline.ts);内联失败回退原始源,与旧行为一致。
  async buildPreviewSource(source, filePath, base) {
    const io = {
      readCss: async (p) => {
        const f = this.app.vault.getAbstractFileByPath(p);
        return f instanceof import_obsidian9.TFile ? await this.app.vault.cachedRead(f).catch(() => null) : null;
      },
      resourceUrl: (p) => {
        const f = this.app.vault.getAbstractFileByPath(p);
        return f instanceof import_obsidian9.TFile ? this.app.vault.getResourcePath(f) : null;
      }
    };
    const inlined = await inlineLocalStylesheets(source, filePath, io);
    return makePreview(
      parseDocument(inlined),
      base,
      this.nonce,
      { allowNetwork: this.callbacks.settings().preview.allowNetworkAssets }
    );
  }
  // 事件:选择(F20 编辑入口)、链接路由(F02/F04)、菜单(F03)、悬停(F05)
  wirePreviewEvents(doc) {
    const findText = (event) => {
      const hasCoords = event.clientX !== 0 || event.clientY !== 0;
      if (hasCoords) {
        const pos = doc.caretPositionFromPoint?.(event.clientX, event.clientY);
        let range = null;
        if (pos) {
          range = doc.createRange();
          range.setStart(pos.offsetNode, pos.offset);
          range.collapse(true);
        } else range = doc.caretRangeFromPoint(event.clientX, event.clientY);
        if (range) {
          for (const [id, node] of this.textNodes) if (node === range.startContainer && this.containsPoint(node, event.clientX, event.clientY)) return id;
        }
      }
      const target = event.target;
      if (target.nodeType === 3) {
        for (const [id, node] of this.textNodes) if (node === target) return id;
      }
      const matches = [...this.textNodes].filter(([, node]) => target.contains(node));
      if (matches.length === 1) return matches[0][0];
      if (!hasCoords) return matches.find(([, node]) => node.data.trim().length > 0)?.[0] ?? null;
      return null;
    };
    doc.addEventListener("mousemove", (event) => {
      if (this.mode !== "edit" && this.mode !== "split") return;
      const id = findText(event);
      if (id !== this.hovered) {
        this.hovered = id;
        this.drawSelection();
      }
    });
    doc.addEventListener("mouseleave", () => {
      this.hovered = null;
      this.drawSelection();
    });
    doc.addEventListener("scroll", () => {
      this.drawSelection();
      this.scheduleScrollCapture();
    }, true);
    doc.defaultView?.addEventListener("resize", () => this.drawSelection());
    doc.addEventListener("click", (event) => {
      const target = event.target;
      const anchorEl = target.closest("a");
      const st = this.callbacks.settings();
      if (this.mode === "edit" || this.mode === "split") {
        const id = findText(event);
        if (id) {
          event.preventDefault();
          event.stopPropagation();
          this.selected = { kind: "text", segmentId: id };
          this.describeSelection();
          this.callbacks.onSelectChanged(this.selected, this.session);
          this.drawSelection();
          return;
        }
      }
      if (anchorEl) {
        event.preventDefault();
        event.stopPropagation();
        const href = anchorEl.getAttribute("href") ?? "";
        const resolved = resolveLink(this.app, href, this.file?.path ?? "");
        const gesture = st.links.browserGesture;
        const mod = event.ctrlKey || event.metaKey;
        const gestureHit = gesture === "Mod" && mod && !event.altKey && !event.shiftKey || gesture === "Alt" && event.altKey && !mod || gesture === "Mod+Shift" && mod && event.shiftKey;
        if (gesture !== "off" && gestureHit) {
          if (this.callbacks.router.openInBrowser(resolved)) return;
        }
        if (resolved.kind === "anchor") {
          this.scrollToAnchor(resolved.fragment);
          this.pushNav();
          return;
        }
        if (resolved.kind === "library-html" && resolved.fragment) {
          this.pendingAnchor = resolved.fragment;
        }
        const blank = (anchorEl.getAttribute("target") ?? "").toLowerCase() === "_blank";
        const wantsNewLeaf = st.links.respectBlankTarget && blank || event.ctrlKey || event.metaKey;
        void this.callbacks.router.open(resolved, { newLeaf: wantsNewLeaf, inAppExternal: true });
      } else {
        const img = target.closest("img");
        if (img && (this.mode === "edit" || this.mode === "split")) {
          const index = this.currentIndex();
          const node = index.nodes.find((n) => n.kind === "element" && n.tag === "img" && n.start >= 0 && img.outerHTML && sourceHasImg(this.session.workingSource, n.start));
          void node;
          event.preventDefault();
          this.selectImageByElement(img);
        }
      }
    }, true);
    doc.addEventListener("contextmenu", (event) => {
      const target = event.target;
      const anchorEl = target.closest("a");
      if (!anchorEl) return;
      event.preventDefault();
      event.stopPropagation();
      const href = anchorEl.getAttribute("href") ?? "";
      const resolved = resolveLink(this.app, href, this.file?.path ?? "");
      this.callbacks.router.showMenu(event, resolved, {
        onEdit: () => {
          this.selectLinkByElement(anchorEl);
        },
        onRelink: () => this.relinkLink(anchorEl, href),
        onOpenCurrent: () => {
          if (resolved.kind === "anchor") this.scrollToAnchor(resolved.fragment);
          else void this.callbacks.router.open(resolved, { newLeaf: false, inAppExternal: true });
        },
        onOpenNew: () => void this.callbacks.router.open(resolved, { newLeaf: true, inAppExternal: true })
      });
    }, true);
    doc.addEventListener("mouseover", (event) => {
      if (!this.callbacks.settings().links.showHoverTarget) return;
      const anchorEl = event.target.closest("a");
      if (!anchorEl) {
        this.callbacks.onHoverStatus(null);
        return;
      }
      const resolved = resolveLink(this.app, anchorEl.getAttribute("href") ?? "", this.file?.path ?? "");
      const t = this.callbacks.t;
      if (resolved.kind === "anchor" || resolved.kind === "library-html") this.callbacks.onHoverStatus(t("statusHoverLocal", { target: resolved.file ? resolved.file.path : resolved.target + resolved.fragment }));
      else if (resolved.kind === "http") this.callbacks.onHoverStatus(t("statusHoverRemote", { host: new URL(resolved.target).host }));
      else if (resolved.reason === "not-found") this.callbacks.onHoverStatus(t("statusHoverMissing", { target: resolved.target }));
      else this.callbacks.onHoverStatus(null);
    });
    doc.addEventListener("submit", (e) => e.preventDefault(), true);
    doc.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (this.file && this.session) void this.callbacks.save(this.file, this.session);
      }
    });
  }
  describeSelection() {
    if (!this.session) return;
    const sel = this.selected;
    if (!sel) return;
    if (sel.kind === "text" && sel.segmentId) {
      const seg = parseDocument(this.session.workingSource).segments.find((x) => x.id === sel.segmentId);
      sel.description = seg?.kind;
      sel.offset = seg?.start;
    }
  }
  containsPoint(node, x, y) {
    const r = node.ownerDocument.createRange();
    r.selectNodeContents(node);
    return [...r.getClientRects()].some((rect) => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom);
  }
  drawSelection() {
    if (!this.overlay) return;
    const editing = this.mode === "edit" || this.mode === "split";
    const id = editing ? this.hovered ?? (this.selected?.kind === "text" ? this.selected.segmentId : null) : null;
    const node = id ? this.textNodes.get(id) : void 0;
    let rects = [];
    if (node) {
      const range = node.ownerDocument.createRange();
      range.selectNodeContents(node);
      rects = range.getClientRects();
    }
    renderSelectionBoxes(this.overlay, rects, id === this.selected?.segmentId);
  }
  // ---- 内容更新管线 ----
  // 解析结果按 revision 登记:revision 一变缓存立即失效并重解析(会话里声明的
  // "只有匹配当前 revision 的解析结果可开放可视化编辑"这道门禁此前从未被调用 ——
  // 审计 round4 缺陷 42)。保存只改 baseSource、不动 workingSource,因此不会误判失效。
  currentIndex() {
    const s = this.session;
    if (!s) return new SourceIndex("");
    if (!s.canUseVisualEdits() || !(s.index instanceof SourceIndex)) s.setParsed(new SourceIndex(s.workingSource));
    return s.index;
  }
  currentModel() {
    return parseDocument(this.session?.workingSource ?? "");
  }
  currentTextMap() {
    const i = this.currentIndex();
    return { index: i, map: buildTextMap(i).containers };
  }
  syncTextNodes() {
    if (!this.session) return;
    const model = this.currentModel();
    for (const [id, node] of this.textNodes) {
      const seg = model.segments.find((x) => x.id === id);
      const value = seg?.text ?? "";
      if (node.data !== value) node.data = value;
    }
    this.drawSelection();
  }
  // 编辑应用入口(可视化):段文本补丁
  applyTextPatch(patch, origin) {
    if (!this.session) return;
    try {
      this.session.applyEdit([patch], { origin, kind: "text", groupingKey: this.selected?.segmentId ?? "text" });
    } catch (e) {
      new import_obsidian9.Notice(e instanceof PatchError ? this.callbacks.t("noticePatchRejected") : this.callbacks.t("noticeSaveFailed"));
      console.error(e);
      return;
    }
    this.afterEdit();
  }
  // silent:调用方(如查找替换)会自行降级并汇总结果,不需要中途弹出失败提示
  applyPatches(patches, kind, groupingKey, origin, silent = false) {
    if (!this.session) return false;
    try {
      this.session.applyEdit(patches, { origin, kind, groupingKey });
    } catch (e) {
      debugLog(`applyErr ${e instanceof Error ? e.message : String(e)}`);
      if (!silent) new import_obsidian9.Notice(e instanceof PatchError ? this.callbacks.t("noticePatchRejected") : this.callbacks.t("noticeSaveFailed"));
      console.error(e);
      return false;
    }
    this.afterEdit();
    return true;
  }
  afterEdit() {
    this.syncTextNodes();
    this.applyChangeHighlights();
    if (this.sourceEditor && this.sourceEditor.getDoc() !== this.session.workingSource) this.sourceEditor.setDoc(this.session.workingSource);
    this.refreshToolbar();
    if (this.file && this.session) this.callbacks.onSessionEdited(this.file, this.session);
  }
  changedSegmentIds() {
    const out = /* @__PURE__ */ new Set();
    if (!this.session) return out;
    const base = parseDocument(this.session.baseSource);
    const work = parseDocument(this.session.workingSource);
    const before = new Map(base.segments.map((s) => [s.id, s.text]));
    for (const seg of work.segments) {
      const old = before.get(seg.id);
      if (old === void 0 || old !== seg.text) out.add(seg.id);
    }
    return out;
  }
  applyChangeHighlights() {
    const win = this.iframe?.contentWindow;
    const doc = win?.document;
    const CH = "html-atelier-changed";
    if (!doc || !this.session) return;
    if (this.changeStyle) {
      this.changeStyle.remove();
      this.changeStyle = null;
    }
    const highlights = win.CSS?.highlights;
    const HighlightCtor = win.Highlight;
    try {
      highlights?.delete(CH);
    } catch {
    }
    doc.querySelectorAll("[data-atelier-changed]").forEach((el) => el.removeAttribute("data-atelier-changed"));
    if (!this.callbacks.settings().editor.showChangeHighlights) return;
    const ids = this.changedSegmentIds();
    if (!ids.size) return;
    const style = doc.createElement("style");
    style.setAttribute("data-atelier-change", "");
    style.textContent = `::highlight(${CH}){background-color:rgba(146,117,223,.28);text-decoration:underline wavy rgba(146,117,223,.85)}[data-atelier-changed]{background-color:rgba(146,117,223,.18)}`;
    doc.head?.append(style);
    this.changeStyle = style;
    const ranges = [];
    for (const [id, node] of this.textNodes) {
      if (!ids.has(id)) continue;
      const range = doc.createRange();
      range.selectNodeContents(node);
      ranges.push(range);
    }
    if (!ranges.length) return;
    if (highlights && HighlightCtor) {
      try {
        highlights.set(CH, new HighlightCtor(...ranges));
        return;
      } catch {
      }
    }
    for (const range of ranges) range.startContainer.parentElement?.setAttribute("data-atelier-changed", "");
  }
  // 行号/软换行变化后重建源码编辑器:CM 扩展在构造时固定,重建比引入 compartment 更稳
  reconfigureSourceEditor() {
    if (!this.sourceEditor) return;
    this.flushSourceSync();
    this.detachSource();
    if (this.mode === "source" || this.mode === "split") this.mountSource();
  }
  // 源码编辑 → 400ms 防抖 → 统一事务(F19)
  // 定时器必须绑定"当初那个会话与那次加载":在防抖窗口内切换文件时,旧编辑器的文本
  // 会被提交给新会话,把 A 的内容写进 B(A→B 切换即复现,审计复检 §3.13 BLOCKER)。
  cancelSourceSync() {
    if (this.previewTimer === null) return;
    window.clearTimeout(this.previewTimer);
    this.previewTimer = null;
  }
  // 立即提交待写的源码编辑(不等防抖)。只在会话与编辑器仍属于同一份文档时生效。
  flushSourceSync() {
    if (this.previewTimer === null) return;
    window.clearTimeout(this.previewTimer);
    this.previewTimer = null;
    if (!this.session || !this.sourceEditor) return;
    const doc = this.sourceEditor.getDoc();
    if (doc === this.session.workingSource) return;
    this.applyPatches([{ start: 0, end: this.session.workingSource.length, expected: this.session.workingSource, replacement: doc }], "source", "source-editor");
  }
  scheduleSourceSync() {
    this.cancelSourceSync();
    const ownerSession = this.session;
    const ownerToken = this.loadToken;
    this.previewTimer = window.setTimeout(() => {
      this.previewTimer = null;
      if (!this.session || !this.sourceEditor) return;
      if (this.session !== ownerSession || this.loadToken !== ownerToken) return;
      if (this.sourceEditor.isComposing()) {
        this.scheduleSourceSync();
        return;
      }
      const doc = this.sourceEditor.getDoc();
      if (doc === this.session.workingSource) return;
      this.applyPatches([{ start: 0, end: this.session.workingSource.length, expected: this.session.workingSource, replacement: doc }], "source", "source-editor");
    }, this.callbacks.settings().source.previewDelayMs);
  }
  mountSource() {
    if (!this.sourceHost) return;
    if (!this.sourceEditor) {
      void Promise.resolve().then(() => (init_sourceEditor(), sourceEditor_exports)).then(({ SourceEditor: SourceEditor2 }) => {
        if (!this.sourceHost) return;
        this.sourceHost.empty();
        this.sourceEditor = new SourceEditor2({
          parent: this.sourceHost,
          lineNumbers: this.callbacks.settings().source.lineNumbers,
          lineWrapping: this.callbacks.settings().source.lineWrapping,
          doc: this.session?.workingSource ?? "",
          onDocChanged: () => this.scheduleSourceSync()
        });
      });
    } else this.sourceEditor.setDoc(this.session?.workingSource ?? "");
  }
  detachSource() {
    this.sourceEditor?.destroy();
    this.sourceEditor = null;
  }
  // F11「修改」清单的定位:预览与源码都要能到那处改动。
  // 模式切换与 prepareLocate 同策略(用户反馈 2026-09-16:修改清单点定位不应被
  // 强切到分栏):源码模式切分栏(预览不可见时高亮落空),预览模式切编辑,
  // 编辑/分栏保持原样;只有源码面板可见时才滚源码。
  // 预览侧没有可指目标时(源码级改动 —— 链接/图片等属性编辑落不到文字节点;
  // 或该文字节点不在预览),必须退到分栏滚源码:编辑模式下静默不动等于"点了没反应"。
  locateChange(offset, segmentId) {
    const seg = segmentId ? this.currentModel().segments.find((x) => x.id === segmentId) : null;
    const dom = seg ? this.textNodes.get(seg.id) : null;
    if (!seg || !dom) {
      if (this.mode !== "split") this.setMode("split");
      this.locateInSource(offset);
      return;
    }
    if (this.mode === "source") this.setMode("split");
    else if (this.mode === "preview") this.setMode("edit");
    if (this.mode === "source" || this.mode === "split") this.locateInSource(offset);
    dom.parentElement?.scrollIntoView({ block: "center" });
    this.hovered = seg.id;
    this.drawSelection();
  }
  locateInSource(offset) {
    if (!(this.mode === "source" || this.mode === "split")) this.setMode("split");
    const tryReveal = () => {
      if (this.sourceEditor) this.sourceEditor.revealOffset(offset);
      else window.setTimeout(tryReveal, 120);
    };
    tryReveal();
  }
  locateFromSource(offset) {
    const index = this.currentIndex();
    let best = null;
    for (const seg of this.currentModel().segments) {
      if (seg.start <= offset && offset <= seg.end && (!best || seg.start > best.start)) best = { id: seg.id, start: seg.start };
    }
    void index;
    if (best) {
      const node = this.textNodes.get(best.id);
      node?.parentElement?.scrollIntoView({ block: "center" });
    }
  }
  // 链接/图片选择(F08/F15)
  // F07:失效本地链接重新选择目标(草稿级修改,可撤销)
  relinkLink(anchorEl, href) {
    void Promise.resolve().then(() => (init_modals(), modals_exports)).then(({ RelinkModal: RelinkModal2 }) => {
      new RelinkModal2(this.app, (file) => {
        const index = this.currentIndex();
        const el = index.nodes.find((n) => n.kind === "element" && n.tag === "a" && n.start >= 0);
        const target = el ? el.attrs.find((a) => a.name === "href") : null;
        if (!target) {
          new import_obsidian9.Notice(this.callbacks.t("noticeSaveFailed"));
          return;
        }
        const quote = target.quote;
        const next = file.path + resolvedFragmentOf(href);
        this.applyPatches([{
          start: target.valueStart,
          end: target.valueEnd,
          expected: target.value,
          replacement: escapeAttrValue(next, quote)
        }], "attribute", "relink");
        new import_obsidian9.Notice(this.callbacks.t("noticeCopied"));
      }).open();
    });
  }
  // 被点击元素在同类标签中的序号。DOM 顺序与 SourceIndex 的登记顺序一致,
  // 因此序号可精确定位到源节点。此前按属性值反查,两个同值元素永远命中第一个,
  // 于是"编辑第二个链接/改第二张图"会改到第一个上(审计复检 §3.19)。
  sourceElementAt(domEl, tag) {
    const doc = domEl.ownerDocument;
    const sameTag = [...doc.querySelectorAll(tag)];
    const pos = sameTag.indexOf(domEl);
    const sourceEls = this.currentIndex().elements(tag);
    if (pos >= 0 && pos < sourceEls.length) return sourceEls[pos];
    return null;
  }
  selectLinkByElement(anchorEl) {
    const index = this.currentIndex();
    const href = anchorEl.getAttribute("href");
    const node = this.sourceElementAt(anchorEl, "a") ?? index.nodes.find((n) => n.kind === "element" && n.tag === "a" && n.attrs.find((a) => a.name === "href")?.value === (href ?? ""));
    this.selected = node ? { kind: "link", nodeId: node.id, offset: node.start, tagName: "a" } : null;
    this.callbacks.onSelectChanged(this.selected, this.session);
  }
  selectImageByElement(img) {
    const index = this.currentIndex();
    const src = img.getAttribute("src") ?? "";
    const rect = img.getBoundingClientRect();
    const node = this.sourceElementAt(img, "img") ?? index.nodes.find((n) => n.kind === "element" && n.tag === "img" && n.attrs.find((a) => a.name === "src")?.value === src);
    this.selected = node ? {
      kind: "image",
      nodeId: node.id,
      offset: node.start,
      tagName: "img",
      description: `${Math.round(rect.width)}\xD7${Math.round(rect.height)}`
    } : null;
    this.callbacks.onSelectChanged(this.selected, this.session);
  }
  // F26:保存后焦点恢复(滚动/选中/焦点与光标)
  saveFocus() {
    this.preSaveSelection = this.selected;
    const capWin = (this.visibleFrame ?? this.iframe)?.contentWindow ?? null;
    this.preSaveScroll = capWin ? this.callbacks.nav.scrollRatioOf(capWin) : null;
    const active = this.contentEl.ownerDocument.activeElement;
    let focusEl = null;
    if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) focusEl = active;
    else if (this.lastPanelInput?.isConnected && this.lastPanelInput.closest(".html-atelier-panel")) focusEl = this.lastPanelInput;
    this.preSaveFocus = focusEl ? { el: focusEl, start: focusEl.selectionStart, end: focusEl.selectionEnd } : null;
  }
  restoreFocusAfterSave() {
    if (!this.callbacks.settings().editor.restoreFocusAfterSave) return;
    const resWin = (this.visibleFrame ?? this.iframe)?.contentWindow ?? null;
    if (this.preSaveScroll !== null && resWin) this.callbacks.nav.restoreScroll(resWin, this.preSaveScroll);
    if (this.preSaveSelection?.kind === "text" && this.preSaveSelection.segmentId) {
      const exists = this.currentModel().segments.some((x) => x.id === this.preSaveSelection.segmentId);
      if (exists) {
        if (this.selected !== this.preSaveSelection) {
          this.selected = this.preSaveSelection;
          this.callbacks.onSelectChanged(this.selected, this.session);
        }
        this.syncTextNodes();
      } else {
        this.selected = null;
        this.callbacks.onSelectChanged(null, this.session);
      }
    }
    const f = this.preSaveFocus;
    if (f) {
      const doc = this.contentEl.ownerDocument;
      const cur = doc.activeElement;
      const sideEffectOnly = cur === f.el || cur === doc.body || cur === null || cur instanceof HTMLElement && cur.tagName === "BUTTON" && !!cur.closest(".html-atelier-panel,.html-atelier-toolbarhost");
      if (sideEffectOnly) {
        let target = f.el;
        if (!f.el.isConnected) {
          const tas = doc.querySelectorAll(".html-atelier-panel textarea");
          if (tas.length === 1) target = tas[0];
        }
        if (target.isConnected) {
          target.focus();
          if (f.start !== null && f.end !== null) {
            const len = target.value?.length ?? 0;
            try {
              target.setSelectionRange(Math.min(f.start, len), Math.min(f.end, len));
            } catch {
            }
          }
        }
      }
    }
  }
};
function resolvedFragmentOf(href) {
  const i = href.indexOf("#");
  return i >= 0 ? href.slice(i) : "";
}
function sourceHasImg(source, offset) {
  return offset >= 0 && offset < source.length;
}
function setCss(el, key, value) {
  el.style.setProperty(key, value);
  return el;
}

// src/views/panel.ts
var import_obsidian11 = require("obsidian");
init_sourceIndex();

// src/parsing/paragraphEdit.ts
init_sourceIndex();
init_escape2();
function graphemes(text) {
  const Seg = Intl.Segmenter;
  if (Seg) {
    try {
      return [...new Seg(void 0, { granularity: "grapheme" }).segment(text)].map((s) => s.segment);
    } catch {
    }
  }
  return [...text];
}
function boundaryOffset(container, logicalIndex) {
  const map = container.map;
  if (!map.length) return null;
  if (logicalIndex >= map.length) return map[map.length - 1].srcEnd;
  return map[Math.max(0, logicalIndex)].srcStart;
}
function containerIndexForOffsetIn(map, offset, index) {
  for (let i = 0; i < map.length; i++) if (map[i].map.some((m) => offset >= m.srcStart && offset < m.srcEnd)) return i;
  if (index) {
    const node = index.nodes.find((n) => n.kind === "text" && n.start !== null && n.start <= offset && n.end !== null && offset < n.end);
    if (node) {
      for (let i = 0; i < map.length; i++) if (map[i].map.some((m) => m.nodeId === node.id)) return i;
    }
  }
  return -1;
}
function containerForOffset(map, offset, index) {
  const i = containerIndexForOffsetIn(map, offset, index);
  return i < 0 ? null : map[i];
}
function containerIndexForOffset(map, offset, index) {
  return containerIndexForOffsetIn(map, offset, index);
}
function planParagraphEdit(index, container, lStart, lEnd, replacement) {
  const from = Math.max(0, Math.min(lStart, container.logical.length));
  const to = Math.max(from, Math.min(lEnd, container.logical.length));
  const oldLogical = container.logical.slice(from, to);
  let prefix = 0;
  const maxPrefix = Math.min(oldLogical.length, replacement.length);
  while (prefix < maxPrefix && oldLogical[prefix] === replacement[prefix]) prefix++;
  let suffix = 0;
  const maxSuffix = Math.min(oldLogical.length - prefix, replacement.length - prefix);
  while (suffix < maxSuffix && oldLogical[oldLogical.length - 1 - suffix] === replacement[replacement.length - 1 - suffix]) suffix++;
  const oldMidStart = from + prefix, oldMidEnd = to - suffix;
  const midNew = replacement.slice(prefix, replacement.length - suffix);
  const emit = (text) => container.preserveWhitespace ? escapeText2(text) : text.split("\n").map(escapeText2).join("<br>");
  if (oldMidStart >= oldMidEnd) {
    if (!midNew) return [];
    let at = boundaryOffset(container, oldMidStart);
    if (at === null) {
      const el = index.nodes[container.nodeId];
      if (el && el.kind === "element") at = el.startTagEnd;
    }
    if (at === null) return [];
    return [{ start: at, end: at, expected: "", replacement: emit(midNew) }];
  }
  const midRanges = rangesForLogical(container, oldMidStart, oldMidEnd);
  if (!midRanges.length) return [];
  const blocks = [];
  for (const r of midRanges) {
    const last = blocks[blocks.length - 1];
    if (last) {
      const gap = index.source.slice(last.to, r.srcStart);
      if (!/<(?!\/?br[\s/>])/i.test(gap)) {
        last.to = r.srcEnd;
        continue;
      }
    }
    blocks.push({ from: r.srcStart, to: r.srcEnd });
  }
  const patches = [];
  const units = graphemes(midNew);
  const totalUnits = units.length;
  const totalOld = blocks.reduce((n, b) => n + (b.to - b.from), 0) || 1;
  let usedUnits = 0;
  let consumed = 0;
  blocks.forEach((b, i) => {
    const len = b.to - b.from;
    consumed += len;
    const want = i === blocks.length - 1 ? totalUnits - usedUnits : Math.round(totalUnits * (consumed / totalOld)) - usedUnits;
    const share = Math.max(0, want);
    const slice = units.slice(usedUnits, usedUnits + share).join("");
    usedUnits += share;
    const expected = index.source.slice(b.from, b.to);
    const next = emit(slice);
    if (next !== expected) patches.push({ start: b.from, end: b.to, expected, replacement: next });
  });
  return patches;
}

// src/views/panel.ts
init_escape2();

// src/views/panelHelpers.ts
var import_obsidian10 = require("obsidian");

// src/parsing/patchPlan.ts
function planSrcsetRemoval(source, attr) {
  const valueEnd = attr.quote ? attr.valueEnd + 1 : attr.valueEnd;
  const after = valueEnd < source.length && /\s/.test(source[valueEnd]) ? valueEnd + 1 : valueEnd;
  if (after > source.length) return null;
  return { start: attr.start, end: after, expected: source.slice(attr.start, after), replacement: "" };
}

// src/views/panelHelpers.ts
function normJoinDir(dir, rel) {
  const parts = dir && dir !== "/" ? dir.replace(/\/$/, "").split("/") : [];
  for (const part of rel.split("/")) {
    if (part === "." || part === "") continue;
    if (part === "..") {
      parts.pop();
      continue;
    }
    parts.push(part);
  }
  return parts.join("/");
}
function collectResourcesIndexed(index, sourcePath, exists, allowNetwork) {
  const infos = collectResourcesWithBase(index, sourcePath, exists, allowNetwork);
  const out = [];
  const used = /* @__PURE__ */ new Set();
  for (const n of index.nodes) {
    if (n.kind !== "element") continue;
    const attr = n.attrs.find((a) => a.name === "src") ?? n.attrs.find((a) => a.name === "href");
    if (!attr) continue;
    if (used.has(n.id)) continue;
    const info = infos.find((r) => r.raw === attr.value && !used.has(n.id));
    if (info) {
      used.add(n.id);
      out.push({ ...info, offset: attr.start });
    }
  }
  return out;
}
function resourceStatusText(status, t) {
  const map = {
    "local-ok": t("resourcesStatusLocalOk"),
    "missing": t("resourcesStatusMissing"),
    "remote": t("resourcesStatusRemote"),
    "blocked": t("resourcesStatusBlocked")
  };
  return map[status] ?? t("resourcesStatusRemote");
}

// src/views/panel.ts
var HTML_PANEL = "html-atelier-panel";
var TAB_KEYS = ["edit", "outline", "changes", "resources"];
var HtmlPanelView = class extends import_obsidian11.ItemView {
  constructor(leaf, callbacks) {
    super(leaf);
    this.tab = "edit";
    // 整段表单里点「文字片段」置位,下一次 renderEditTab 消费:这一次强制片段表单
    this.segmentOverride = false;
    this.searchHits = [];
    this.searchAt = -1;
    this.lastRenderedRev = "";
    this.lastRenderedSession = null;
    this.outlineStates = /* @__PURE__ */ new WeakMap();
    this.outlineOwner = null;
    this.toolbar = null;
    this.toolbarHost = null;
    // 输入期间不重建面板 DOM,但表单里的**派生状态**(按钮禁用等)必须跟上,
    // 否则用户改完文字后「恢复此项」还是灰的、点不动(不重建的直接后果)
    this.derivedSyncs = [];
    // 输入法组合(中文/日文)状态。composition 事件会冒泡,所以挂在根上即可覆盖
    // 面板内所有输入控件:组合期间的 input 事件带的是拼音,既不该提交进文档,
    // 也不该在此时重建 DOM。
    this.composing = false;
    // ---- 搜索(F09) ----
    this.searchDebounceTimer = null;
    this.callbacks = callbacks;
  }
  getViewType() {
    return HTML_PANEL;
  }
  getDisplayText() {
    return "HTML Atelier";
  }
  getIcon() {
    return "text-cursor-input";
  }
  async onOpen() {
    const t = this.callbacks.t;
    this.tab = this.callbacks.settings().sidebar.defaultTab;
    const root = this.contentEl;
    root.empty();
    root.addClass("html-atelier-panel");
    this.fileLabel = root.createDiv({ cls: "html-atelier-file" });
    const fileIcon = this.fileLabel.createSpan({ cls: "html-atelier-fileicon", attr: { "aria-hidden": "true" } });
    (0, import_obsidian11.setIcon)(fileIcon, "file-code-2");
    const fileInfo = this.fileLabel.createDiv({ cls: "html-atelier-fileinfo" });
    this.fileName = fileInfo.createDiv({ cls: "html-atelier-filename" });
    this.fileFolder = fileInfo.createDiv({ cls: "html-atelier-filefolder" });
    this.toolbarHost = root.createDiv({ cls: "html-atelier-toolbarhost" });
    const searchBlock = root.createDiv({ cls: "html-atelier-searchblock" });
    const searchWrap = searchBlock.createDiv({ cls: "html-atelier-searchwrap" });
    const searchIcon = searchWrap.createSpan({ cls: "html-atelier-searchicon", attr: { "aria-hidden": "true" } });
    (0, import_obsidian11.setIcon)(searchIcon, "search");
    this.searchBox = searchWrap.createEl("input", { cls: "html-atelier-search", attr: { type: "search", "aria-label": t("searchLabel"), placeholder: "" } });
    this.searchCase = searchWrap.createEl("input", { attr: { type: "checkbox", "aria-label": t("searchCase") } });
    const caseLabel = searchWrap.createEl("label", { cls: "html-atelier-caselabel", attr: { "title": t("searchCase") }, text: "Aa" });
    caseLabel.prepend(this.searchCase);
    this.replaceToggle = searchWrap.createEl("button", { cls: "html-atelier-replacetoggle", attr: { type: "button", title: t("panelToggleReplace"), "aria-label": t("panelToggleReplace"), "aria-expanded": "false" } });
    (0, import_obsidian11.setIcon)(this.replaceToggle, "replace");
    this.replaceToggle.addEventListener("click", () => {
      this.replaceWrap.hidden = !this.replaceWrap.hidden;
      this.replaceToggle.setAttribute("aria-expanded", String(!this.replaceWrap.hidden));
      if (!this.replaceWrap.hidden) this.replaceBox.focus();
    });
    const syncCase = () => caseLabel.toggleClass("html-atelier-caselabel-on", this.searchCase.checked);
    syncCase();
    this.searchBox.addEventListener("input", () => this.runSearchDebounced());
    this.searchCase.addEventListener("change", () => {
      syncCase();
      this.runSearch();
    });
    const replaceWrap = searchBlock.createDiv({ cls: "html-atelier-searchwrap html-atelier-replacewrap" });
    this.replaceWrap = replaceWrap;
    replaceWrap.hidden = true;
    this.replaceBox = replaceWrap.createEl("input", { cls: "html-atelier-search", attr: { type: "text", "aria-label": t("searchReplace"), placeholder: "" } });
    this.replaceBox.placeholder = t("searchReplace");
    const replaceAllBtn = replaceWrap.createEl("button", { cls: "html-atelier-btnrow", attr: { type: "button" }, text: t("searchReplaceAll") });
    this.replaceAllBtn = replaceAllBtn;
    replaceAllBtn.addEventListener("click", () => this.replaceAll());
    this.replaceBox.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.replaceAll();
    });
    this.searchResults = root.createDiv({ cls: "html-atelier-searchresults" });
    this.tabsEl = root.createDiv({ cls: "html-atelier-tabs" });
    this.content = root.createDiv({ cls: "html-atelier-panelcontent" });
    const statusbar = root.createDiv({ cls: "html-atelier-statusbar" });
    const statusInfo = statusbar.createDiv({ cls: "html-atelier-statusinfo" });
    this.statusFile = statusInfo.createDiv({ cls: "html-atelier-statusfile", attr: { "aria-live": "polite" } });
    this.statusDraft = statusInfo.createDiv({ cls: "html-atelier-statusdraft", attr: { "aria-live": "polite" } });
    const actions = statusbar.createDiv({ cls: "html-atelier-statusactions" });
    this.undoBtn = actions.createEl("button", { attr: { "type": "button", "aria-label": t("panelUndo"), title: t("panelUndo") } });
    const undoIcon = this.undoBtn.createSpan();
    (0, import_obsidian11.setIcon)(undoIcon, "undo-2");
    this.undoBtn.addEventListener("click", () => this.callbacks.undo());
    this.redoBtn = actions.createEl("button", { attr: { "type": "button", "aria-label": t("panelRedo"), title: t("panelRedo") } });
    const redoIcon = this.redoBtn.createSpan();
    (0, import_obsidian11.setIcon)(redoIcon, "redo-2");
    this.redoBtn.addEventListener("click", () => this.callbacks.redo());
    this.saveBtn = actions.createEl("button", { cls: "html-atelier-savebtn", attr: { "type": "button" } });
    this.saveBtn.addEventListener("click", () => this.callbacks.saveActive());
    this.buildTabs();
    this.syncToolbarPlacement();
    root.addEventListener("compositionstart", () => {
      this.composing = true;
    });
    root.addEventListener("compositionend", () => {
      this.composing = false;
    });
    root.addEventListener("focusout", () => {
      this.composing = false;
    });
    this.refresh(true);
  }
  // ---- 工具栏(F16:editor.toolbarPlacement='sidebar' 时只在这里) ----
  // 保存按钮不重复:面板状态行已有;文件名与脏标记也用状态行与文件名标签呈现。
  syncToolbarPlacement() {
    if (!this.toolbarHost) return;
    const here = this.callbacks.settings().editor.toolbarPlacement === "sidebar";
    if (here && !this.toolbar) {
      this.toolbar = new ViewToolbar(this.toolbarHost, () => this.callbacks.toolbarTarget(), this.callbacks.t, { showTitle: false, showSave: false });
    } else if (!here && this.toolbar) {
      this.toolbar.destroy();
      this.toolbar = null;
    }
    this.toolbarHost.toggleClass("html-atelier-hidden", !here);
    this.refreshToolbar();
  }
  refreshToolbar() {
    this.toolbar?.refresh();
  }
  // 语言热切:面板静态文案此前只在 onOpen 求值一次,切换语言后标签页与占位符
  // 会留在旧语言(工具栏更明显——它是现在唯一的模式入口)。
  relabel() {
    if (!this.content) return;
    const t = this.callbacks.t;
    for (const [button, key] of [[this.undoBtn, "panelUndo"], [this.redoBtn, "panelRedo"]]) {
      button.setAttribute("aria-label", t(key));
      button.title = t(key);
    }
    this.searchBox.setAttribute("aria-label", t("searchLabel"));
    this.replaceBox.setAttribute("aria-label", t("searchReplace"));
    this.searchCase.setAttribute("aria-label", t("searchCase"));
    if (this.searchCase.parentElement) this.searchCase.parentElement.title = t("searchCase");
    this.buildTabs();
    this.searchBox.placeholder = this.callbacks.t("searchPlaceholder");
    this.replaceBox.placeholder = this.callbacks.t("searchReplace");
    this.replaceToggle.setAttribute("aria-label", this.callbacks.t("panelToggleReplace"));
    this.replaceToggle.title = this.callbacks.t("panelToggleReplace");
    this.replaceAllBtn.setText(this.callbacks.t("searchReplaceAll"));
    this.toolbar?.relabel(this.callbacks.t);
    this.refresh(true);
  }
  // 只建一次按钮;切换标签走 setTab()。此前每次点击都重建整条标签栏:
  // 指示块的过渡会被重新挂载(视觉上闪一下),外部持有的按钮引用也会失效。
  buildTabs() {
    const t = this.callbacks.t;
    this.tabsEl.empty();
    for (const key of TAB_KEYS) {
      const label = { edit: t("tabEdit"), outline: t("tabOutline"), changes: t("tabChanges"), resources: t("tabResources") }[key];
      const b = this.tabsEl.createEl("button", { attr: { "type": "button", title: label, "aria-label": label } });
      const icon = b.createSpan({ attr: { "aria-hidden": "true" } });
      (0, import_obsidian11.setIcon)(icon, { edit: "sliders-horizontal", outline: "list-tree", changes: "git-compare-arrows", resources: "layers" }[key]);
      b.createSpan({ cls: "html-atelier-tablabel", text: label });
      b.addEventListener("click", () => this.setTab(key));
    }
    this.syncTabs();
  }
  // 切换当前标签(含指示块位置与入场动效)。段落表单/大纲的"回到编辑"入口也走这里,
  // 否则手工改 this.tab 后高亮会停在旧标签上。
  setTab(key) {
    if (this.tab === key) return;
    this.tab = key;
    this.syncTabs();
    this.playEnter();
    this.refresh(true);
  }
  syncTabs() {
    const index = Math.max(0, TAB_KEYS.indexOf(this.tab));
    [...this.tabsEl.children].forEach((el, i) => {
      el.toggleClass("html-atelier-active", i === index);
      el.setAttribute("aria-pressed", String(i === index));
    });
    this.tabsEl.style.setProperty("--html-atelier-tab", String(index));
  }
  // 切标签时的入场动画。同一个类不能连续触发两次动画(第二次不会重放),
  // 所以先摘掉、强制重排、再挂上。
  playEnter() {
    const el = this.content;
    if (!el) return;
    el.toggleClass("html-atelier-enter", false);
    void el.offsetWidth;
    el.toggleClass("html-atelier-enter", true);
  }
  refresh(force = false) {
    if (!this.content) return;
    const details = this.content.querySelector(".html-atelier-textlistdetails");
    if (details && this.outlineOwner) this.outlineState(this.outlineOwner).open = details.open;
    this.refreshToolbar();
    const active = this.callbacks.getActiveSession();
    const t = this.callbacks.t;
    const file = this.callbacks.activeFilePath();
    const parts = file?.split("/") ?? [];
    this.fileName.setText(parts.pop() ?? t("panelNoActiveHtml"));
    this.fileFolder.setText(file ? parts.join("/") || "HTML" : "HTML Atelier");
    this.fileLabel.toggleClass("html-atelier-fileempty", !file);
    this.fileLabel.title = file ?? t("panelNoActiveHtml");
    const s = active?.session ?? null;
    this.undoBtn.disabled = !s || s.controller.undoDepth === 0 || s.operation !== "idle";
    this.redoBtn.disabled = !s || s.controller.redoDepth === 0 || s.operation !== "idle";
    this.saveBtn.disabled = !s || !s.dirty || s.operation !== "idle" || s.contentState === "conflict";
    this.saveBtn.setText(t("tbSave"));
    let fileStatus;
    if (!s) fileStatus = t("statusClean");
    else if (s.operation === "saving") fileStatus = t("statusSaving");
    else if (s.operation === "merging") fileStatus = t("statusMerging");
    else if (s.contentState === "conflict") fileStatus = t("statusConflictDraft");
    else if (s.contentState === "missing") fileStatus = t("statusFileMissing");
    else if (s.dirty) fileStatus = t("statusDirty", { n: this.countChanges(s) });
    else fileStatus = t("statusClean");
    this.statusFile.setText(fileStatus);
    this.statusFile.toggleClass("html-atelier-statusdirty", !!s?.dirty);
    this.statusFile.toggleClass("html-atelier-conflict-text", s?.contentState === "conflict");
    this.statusDraft.setText(s ? { idle: "", pending: t("statusDraftPending"), writing: t("statusDraftWriting"), saved: t("statusDraftSaved"), failed: t("statusDraftFailed"), disabled: t("statusDraftDisabled") }[s.draftStatus] : "");
    const rev = s ? `${s.revision}:${s.parsedRevision}:${s.baseHash}` : "";
    if (this.composing) return;
    if (!force && s === this.lastRenderedSession && rev === this.lastRenderedRev) return;
    if (!force && this.isEditingInPane()) {
      this.syncDerived();
      return;
    }
    this.lastRenderedRev = rev;
    this.lastRenderedSession = s;
    this.derivedSyncs = [];
    this.searchBox.placeholder = t("searchPlaceholder");
    if (!s) {
      this.content.empty();
      this.content.createDiv({ cls: "html-atelier-panelnote", text: t("formEmptyNoSelection") });
      return;
    }
    if (this.tab === "edit") this.renderEditTab(s);
    else if (this.tab === "outline") this.renderOutlineTab(s);
    else if (this.tab === "changes") this.renderChangesTab(s);
    else this.renderResourcesTab(s);
  }
  syncDerived() {
    for (const fn of this.derivedSyncs) fn();
  }
  // 面板内容区里是否有正在输入的控件(输入框/文本域/contenteditable)
  isEditingInPane() {
    const el = this.contentEl?.ownerDocument?.activeElement;
    if (!el || !this.content?.contains(el)) return false;
    const tag = el.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable === true;
  }
  countChanges(s) {
    const base = parseDocument(s.baseSource).segments;
    const work = parseDocument(s.workingSource).segments;
    let n = 0;
    for (const pr of alignSegments(base, work)) if (!pr.base || !pr.work || pr.base.text !== pr.work.text) n++;
    if (s.workingSource !== s.baseSource && !n) n = 1;
    return n;
  }
  // ---- 编辑标签:按选择类型渲染表单(F08/F15/F20) ----
  renderEditTab(s) {
    const t = this.callbacks.t;
    const sel = this.currentSelection();
    this.content.empty();
    const segmentFormOnce = this.segmentOverride;
    this.segmentOverride = false;
    if (s.contentState === "conflict") {
      const bar = this.content.createDiv({ cls: "html-atelier-conflictbar" });
      bar.createDiv({ text: t("conflictTitle") });
      const b1 = bar.createEl("button", { attr: { "type": "button" }, text: t("conflictApply") });
      b1.addEventListener("click", () => this.callbacks.conflictOpen());
      const b2 = bar.createEl("button", { attr: { "type": "button" }, text: t("conflictUseDiskVersion") });
      b2.addEventListener("click", () => this.callbacks.adoptRemote());
      const b3 = bar.createEl("button", { attr: { "type": "button" }, text: t("panelExportDraft") });
      b3.addEventListener("click", () => this.callbacks.exportDraftAsCopy());
    }
    if (!sel) {
      this.content.createDiv({ cls: "html-atelier-panelnote", text: this.callbacks.settings().editor.defaultMode === "preview" ? t("formEmptyPreview") : t("formEmptyNoSelection") });
      return;
    }
    if (sel.kind === "text" && sel.segmentId) {
      if (this.callbacks.settings().editor.defaultTextMode === "paragraph" && !segmentFormOnce) {
        const { index, map } = this.rebuild();
        const model = parseDocument(s.workingSource);
        const seg = model.segments.find((x) => x.id === sel.segmentId);
        const node = seg ? index.nodes.find((n) => n.kind === "text" && n.start === seg.start) : void 0;
        const ci = node && node.kind === "text" ? containerIndexForOffset(map, node.start, index) : -1;
        if (ci >= 0) {
          this.renderParagraphForm(s, { ...sel, kind: "paragraph", containerIndex: ci });
          return;
        }
      }
      this.renderTextForm(s, sel);
    } else if (sel.kind === "link") this.renderLinkForm(s, sel);
    else if (sel.kind === "image") this.renderImageForm(s, sel);
    else if (sel.kind === "paragraph") this.renderParagraphForm(s, sel);
  }
  currentSelection() {
    const ev = window.htmlAtelierSelection;
    return ev ?? null;
  }
  renderTextForm(s, sel) {
    const t = this.callbacks.t;
    const model = parseDocument(s.workingSource);
    const seg = model.segments.find((x) => x.id === sel.segmentId);
    if (!seg) {
      this.content.createDiv({ cls: "html-atelier-panelnote", text: t("formEmptyNoSelection") });
      return;
    }
    const wrap = this.content.createDiv({ cls: "html-atelier-form" });
    const head = wrap.createDiv({ cls: "html-atelier-formhead" });
    head.createSpan({ text: t("formTextLabel") });
    head.createSpan({ cls: "html-atelier-muted", text: seg.kind });
    const ta = wrap.createEl("textarea", { cls: "html-atelier-textarea", attr: { rows: "5", "aria-label": t("formTextLabel"), spellcheck: "false" } });
    ta.value = seg.text;
    const hint = wrap.createDiv({ cls: "html-atelier-hint", text: t("formHintSegment") });
    const btnRow = wrap.createDiv({ cls: "html-atelier-btnrow" });
    const paraBtn = btnRow.createEl("button", { attr: { "type": "button" }, text: t("formParagraph") });
    paraBtn.addEventListener("click", () => {
      const { index, map } = this.rebuild();
      const node = index.nodes.find((n) => n.kind === "text" && n.start === seg.start);
      let ci = node ? containerIndexForOffset(map, node.start, index) : -1;
      if (ci < 0) ci = map.findIndex((c) => c.logical.includes(seg.text));
      if (ci >= 0) {
        window.htmlAtelierSelection = { kind: "paragraph", containerIndex: ci };
        this.refresh(true);
      } else new import_obsidian11.Notice(t0(this.callbacks, "noticeParagraphUnavailable"));
    });
    const restore = btnRow.createEl("button", { attr: { "type": "button" }, text: t("formRestore") });
    const liveSeg = () => parseDocument(s.workingSource).segments.find((x) => x.id === seg.id) ?? null;
    const baseAt = () => alignSegments(parseDocument(s.baseSource).segments, parseDocument(s.workingSource).segments).find((pr) => pr.work?.id === seg.id)?.base ?? null;
    const syncRestore = () => {
      const live = liveSeg();
      const base = baseAt();
      restore.disabled = !base || !live || base.text === live.text;
    };
    syncRestore();
    this.derivedSyncs.push(syncRestore);
    restore.addEventListener("click", () => {
      const base = baseAt();
      const live = liveSeg();
      if (!base || !live) return;
      this.callbacks.applyTextPatch({
        start: live.start,
        end: live.end,
        expected: s.workingSource.slice(live.start, live.end),
        replacement: escapeText2(base.text)
      }, "restore");
    });
    void hint;
    let committed = ta.value;
    const commit = () => {
      const value = ta.value;
      if (value === committed) return;
      committed = value;
      this.commitSegmentEdit(s, seg.id, value);
    };
    let composing = false;
    ta.addEventListener("compositionstart", () => {
      composing = true;
    });
    ta.addEventListener("compositionend", () => {
      composing = false;
      commit();
    });
    ta.addEventListener("input", (e) => {
      if (composing || e.isComposing) return;
      commit();
    });
    this.content.append(wrap);
  }
  commitSegmentEdit(s, segmentId, newText) {
    const live = parseDocument(s.workingSource).segments.find((x) => x.id === segmentId);
    if (!live) return;
    const direct = {
      start: live.start,
      end: live.end,
      expected: s.workingSource.slice(live.start, live.end),
      replacement: escapeText2(newText)
    };
    if (this.callbacks.applyPatches([direct], "text", `seg:${segmentId}`)) return;
    const { index, map } = this.rebuild();
    const container = containerForOffset(map, live.start, index) ?? map.find((c) => c.logical === live.text) ?? map.find((c) => c.logical.includes(live.text));
    if (!container) return;
    const at = container.logical === live.text ? 0 : container.logical.indexOf(live.text);
    if (at < 0) return;
    const res = replaceLogical(index, container, at, at + live.text.length, newText);
    if (res.ok) this.callbacks.applyTextPatch(res.patch);
    else {
      this.commitCrossNode(index, container, at, at + live.text.length, newText);
    }
  }
  commitCrossNode(index, container, lStart, lEnd, replacement) {
    debugLog(`commitCrossNode l=${lStart}-${lEnd} old=${container.logical.slice(0, 20)} new=${replacement.slice(0, 20)}`);
    const patches = planParagraphEdit(index, container, lStart, lEnd, replacement);
    if (!patches.length) return;
    debugLog(`patches ${patches.length}`);
    this.callbacks.applyPatches(patches, "text", `para:${lStart}`);
  }
  renderParagraphForm(s, sel) {
    const t = this.callbacks.t;
    const { index, map } = this.rebuild();
    const ci = sel.containerIndex ?? 0;
    const c = map[ci];
    this.content.empty();
    if (!c) {
      this.content.createDiv({ cls: "html-atelier-panelnote", text: t("formEmptyNoSelection") });
      return;
    }
    const wrap = this.content.createDiv({ cls: "html-atelier-form" });
    wrap.createDiv({ cls: "html-atelier-formhead" }).createSpan({ text: t("formParagraph") });
    const ta = wrap.createEl("textarea", { cls: "html-atelier-textarea", attr: { rows: "6", "aria-label": t("formParagraph") } });
    ta.value = c.logical;
    wrap.createDiv({ cls: "html-atelier-hint", text: t("formParagraphHint") });
    ta.addEventListener("change", () => {
      const oldLogical = c.logical;
      const newLogical = ta.value;
      if (oldLogical === newLogical) return;
      this.commitCrossNode(index, c, 0, oldLogical.length, newLogical);
    });
    const seg = wrap.createDiv({ cls: "html-atelier-btnrow" });
    const segBtn = seg.createEl("button", { attr: { "type": "button" }, text: t("formSegment") });
    segBtn.addEventListener("click", () => {
      const { index: index2, map: map2 } = this.rebuild();
      const container = map2[ci];
      const model = parseDocument(s.workingSource);
      let next = null;
      if (container) for (const m of container.map) {
        const node = index2.nodes[m.nodeId];
        if (!node || node.kind !== "text") continue;
        const seg2 = model.segments.find((x) => x.start >= node.start && x.start < node.end);
        if (seg2 && seg2.text.trim()) {
          next = seg2.id;
          break;
        }
      }
      this.segmentOverride = true;
      window.htmlAtelierSelection = next ? { kind: "text", segmentId: next } : null;
      this.refresh(true);
    });
    this.content.append(wrap);
  }
  rebuild() {
    const index = new SourceIndex(this.callbacks.getActiveSession()?.session.workingSource ?? "");
    return { index, map: buildTextMap(index).containers };
  }
  renderLinkForm(s, sel) {
    const t = this.callbacks.t;
    const index = new SourceIndex(s.workingSource);
    const el = index.nodes.find((n) => n.kind === "element" && n.id === sel.nodeId);
    if (!el || el.kind !== "element") {
      this.content.createDiv({ cls: "html-atelier-panelnote", text: t("formEmptyNoSelection") });
      return;
    }
    const href = el.attrs.find((a) => a.name === "href");
    const wrap = this.content.createDiv({ cls: "html-atelier-form" });
    wrap.createDiv({ cls: "html-atelier-formhead" }).createSpan({ text: t("formLinkHref") });
    const hrefInput = wrap.createEl("input", { cls: "html-atelier-input", attr: { type: "text", "aria-label": t("formLinkHref"), spellcheck: "false" } });
    hrefInput.value = href?.value ?? "";
    const resolvedWrap = wrap.createDiv({ cls: "html-atelier-hint" });
    const updateResolved = () => {
      const v = hrefInput.value.trim();
      resolvedWrap.setText(v ? this.describeLink(v, s) : "");
    };
    updateResolved();
    hrefInput.addEventListener("input", updateResolved);
    const commitHref = () => {
      if (!href) {
        const insert = el.startTagStart + 2;
        this.callbacks.applyTextPatch({ start: insert, end: insert, expected: "", replacement: ` href="${escapeAttrValue(hrefInput.value, '"')}"` });
        return;
      }
      if (href.value === hrefInput.value) return;
      const q = href.quote === "" ? "" : href.quote;
      this.callbacks.applyTextPatch({
        start: href.valueStart,
        end: href.valueEnd,
        expected: href.value,
        replacement: escapeAttrValue(hrefInput.value, q === "" ? "" : q)
      });
    };
    hrefInput.addEventListener("change", commitHref);
    hrefInput.addEventListener("blur", commitHref);
    const btnRow = wrap.createDiv({ cls: "html-atelier-btnrow" });
    const pick = btnRow.createEl("button", { attr: { "type": "button" }, text: t("formLinkBrowse") });
    pick.addEventListener("click", () => {
      void (async () => {
        const path = await this.callbacks.pickLibraryFile((f) => ["html", "htm"].includes(f.extension.toLowerCase()));
        if (path) {
          hrefInput.value = path;
          commitHref();
        }
      })();
    });
    const test = btnRow.createEl("button", { attr: { "type": "button" }, text: t("formLinkOpenTest") });
    test.addEventListener("click", () => {
      window.open(hrefInput.value, "_blank", "noopener");
    });
    const textSeg = this.linkTextSegment(s, el.start, el.end);
    if (textSeg) {
      wrap.createDiv({ cls: "html-atelier-formhead" }).createSpan({ text: t("formLinkText") });
      const ta = wrap.createEl("textarea", { cls: "html-atelier-textarea", attr: { rows: "2", "aria-label": t("formLinkText") } });
      ta.value = textSeg.text;
      ta.addEventListener("change", () => {
        const idx2 = new SourceIndex(s.workingSource);
        const cur = idx2.nodes.find((n) => n.kind === "text" && n.start === textSeg.start);
        if (cur && cur.raw !== ta.value) this.callbacks.applyTextPatch({ start: cur.start, end: cur.end, expected: cur.raw, replacement: escapeText2(ta.value) });
      });
    }
    void sel;
    this.content.append(wrap);
  }
  linkTextSegment(s, elStart, elEnd) {
    const model = parseDocument(s.workingSource);
    return model.segments.find((seg) => seg.start > elStart && seg.end < elEnd) ?? null;
  }
  describeLink(href, s) {
    const resolved = this.describeLinkResolved(href, s);
    return resolved;
  }
  describeLinkResolved(href, _s) {
    void _s;
    if (!href) return "";
    if (/^https?:\/\//i.test(href)) return href;
    if (/^#/i.test(href)) return `#${href.slice(1)}`;
    const active = this.callbacks.activeFilePath() ?? "";
    const dir = active.includes("/") ? active.slice(0, active.lastIndexOf("/") + 1) : "";
    const clean = href.split("#")[0].split("?")[0];
    const norm = normJoinDir(dir, clean);
    return norm + (href.includes("#") ? "#" + href.split("#")[1] : "");
  }
  renderImageForm(s, sel) {
    const t = this.callbacks.t;
    const index = new SourceIndex(s.workingSource);
    const el = index.nodes.find((n) => n.kind === "element" && n.id === sel.nodeId);
    if (!el || el.kind !== "element") {
      this.content.createDiv({ cls: "html-atelier-panelnote", text: t("formEmptyNoSelection") });
      return;
    }
    const src = el.attrs.find((a) => a.name === "src");
    const alt = el.attrs.find((a) => a.name === "alt");
    const wrap = this.content.createDiv({ cls: "html-atelier-form" });
    wrap.createDiv({ cls: "html-atelier-formhead" }).createSpan({ text: t("formImageSrc") });
    const srcInput = wrap.createEl("input", { cls: "html-atelier-input", attr: { type: "text", "aria-label": t("formImageSrc"), spellcheck: "false" } });
    srcInput.value = src?.value ?? "";
    srcInput.addEventListener("change", () => this.commitAttr(s, index, el.id, "src", src, srcInput.value));
    const altWrap = wrap.createDiv({ cls: "html-atelier-formhead" });
    altWrap.createSpan({ text: t("formImageAlt") });
    const altInput = wrap.createEl("input", { cls: "html-atelier-input", attr: { type: "text", "aria-label": t("formImageAlt") } });
    altInput.value = alt?.value ?? "";
    altInput.addEventListener("change", () => this.commitAttr(s, index, el.id, "alt", alt, altInput.value));
    const btnRow = wrap.createDiv({ cls: "html-atelier-btnrow" });
    const pick = btnRow.createEl("button", { attr: { "type": "button" }, text: t("formImagePick") });
    pick.addEventListener("click", () => {
      void (async () => {
        const path = await this.callbacks.pickLibraryFile((f) => ["png", "jpg", "jpeg", "webp", "gif", "svg", "bmp", "avif"].includes(f.extension.toLowerCase()));
        if (path) {
          srcInput.value = path;
          this.commitAttr(s, index, el.id, "src", src, path);
        }
      })();
    });
    const imp = btnRow.createEl("button", { attr: { "type": "button" }, text: t("formImageImport") });
    imp.addEventListener("click", () => {
      void (async () => {
        const path = await this.callbacks.importImage();
        if (path) {
          srcInput.value = path;
          this.commitAttr(s, index, el.id, "src", src, path);
        }
      })();
    });
    const inPicture = index.nodes.some((n) => n.kind === "element" && n.tag === "picture" && n.childIds.includes(el.id));
    const srcset = el.attrs.find((a) => a.name === "srcset");
    if (inPicture || srcset) {
      const warn = wrap.createDiv({ cls: "html-atelier-hint html-atelier-warn", text: t("formImageResponsive") });
      void warn;
      const single = wrap.createEl("button", { attr: { "type": "button" }, text: t("formImageReplaceSingle") });
      single.addEventListener("click", () => {
        const src2 = this.callbacks.getActiveSession()?.session.workingSource ?? "";
        const patches = [];
        if (srcset) {
          const removal = planSrcsetRemoval(src2, srcset);
          if (removal) patches.push(removal);
        }
        if (src) patches.push({ start: src.valueStart, end: src.valueEnd, expected: src2.slice(src.valueStart, src.valueEnd), replacement: escapeAttrValue(srcInput.value, src.quote === "" ? "" : src.quote) });
        this.callbacks.applyPatches(patches, "image", "img-replace");
      });
    }
    this.content.append(wrap);
  }
  commitAttr(s, index, elId, attrName, attr, value) {
    const el = index.nodes.find((n) => n.kind === "element" && n.id === elId);
    if (!el || el.kind !== "element") return;
    if (attr && attr.hasEqual) {
      if (attr.value === value) return;
      this.callbacks.applyTextPatch({
        start: attr.valueStart,
        end: attr.valueEnd,
        expected: attr.value,
        replacement: escapeAttrValue(value, attr.quote === "" ? "" : attr.quote)
      });
    } else if (attr) {
      this.callbacks.applyTextPatch({
        start: attr.end,
        end: attr.end,
        expected: "",
        replacement: `="${escapeAttrValue(value, '"')}"`
      });
    } else {
      const insert = el.startTagStart + 1 + el.tag.length;
      this.callbacks.applyTextPatch({ start: insert, end: insert, expected: "", replacement: ` ${attrName}="${escapeAttrValue(value, '"')}"` });
    }
    void s;
  }
  // ---- 大纲/文案列表(F10) ----
  outlineState(s) {
    let state = this.outlineStates.get(s);
    if (!state) {
      state = { open: false, selected: null };
      this.outlineStates.set(s, state);
    }
    return state;
  }
  renderOutlineTab(s) {
    const t = this.callbacks.t;
    const index = new SourceIndex(s.workingSource);
    const containers = buildTextMap(index).containers;
    this.content.empty();
    this.outlineOwner = s;
    const state = this.outlineState(s);
    const wrap = this.content.createDiv({ cls: "html-atelier-outline" });
    const outlineHead = wrap.createDiv({ cls: "html-atelier-listhead", text: t("outlineTabOutline") });
    const list = wrap.createDiv({ cls: "html-atelier-list" });
    const byContainer = new Map(containers.map((c) => [c.nodeId, c.logical]));
    const containerAt = new Map(containers.map((c, i) => [c.nodeId, i]));
    const headingsList = index.nodes.filter((n) => n.kind === "element" && /^h[1-6]$/.test(n.tag));
    const selected = state.selected;
    const candidates = selected ? headingsList.filter((h) => {
      if (selected.htmlId) return h.attrs.some((a) => a.name === "id" && a.value === selected.htmlId);
      if (selected.source === s.workingSource) return h.start === selected.start && h.tag === selected.tag;
      return h.tag === selected.tag && (byContainer.get(h.id) ?? "") === selected.text;
    }) : [];
    const selectedHeading = candidates.length === 1 ? candidates[0] : null;
    if (selectedHeading && selected) state.selected = { ...selected, start: selectedHeading.start, text: byContainer.get(selectedHeading.id) ?? "", source: s.workingSource };
    else if (selected) state.selected = null;
    outlineHead.createSpan({ cls: "html-atelier-count", text: String(headingsList.length) });
    if (!headingsList.length && !containers.length) {
      list.createDiv({ cls: "html-atelier-panelnote", text: t("outlineEmpty") });
    }
    for (const h of headingsList) {
      const id = h.attrs.find((a) => a.name === "id");
      const logical = byContainer.get(h.id) ?? "";
      const label = logical.trim() || h.tag;
      const row = list.createEl("button", { cls: `html-atelier-row html-atelier-outlinerow html-atelier-h${h.tag.slice(1)}`, attr: { type: "button", title: label } });
      row.createSpan({ cls: "html-atelier-headinglevel", text: h.tag.toUpperCase(), attr: { "aria-hidden": "true" } });
      row.createSpan({ cls: "html-atelier-rowlabel", text: label });
      if (h === selectedHeading) {
        row.classList.add("html-atelier-selected");
        row.setAttribute("aria-current", "location");
      }
      row.addEventListener("click", () => {
        state.selected = { htmlId: id?.value ?? null, tag: h.tag, text: logical, start: h.start, source: s.workingSource };
        for (const other of list.children) {
          other.classList.remove("html-atelier-selected");
          other.removeAttribute("aria-current");
        }
        row.classList.add("html-atelier-selected");
        row.setAttribute("aria-current", "location");
        const ci = containerAt.get(h.id);
        if (ci !== void 0 && this.callbacks.revealInPreview(ci, 0, logical.length)) return;
        if (id) this.callbacks.locatePreview(`#${id.value}`);
        else this.callbacks.locateInSource(h.start);
      });
    }
    const texts = wrap.createEl("details", { cls: "html-atelier-textlistdetails" });
    texts.open = state.open;
    texts.addEventListener("toggle", () => {
      if (texts.isConnected) state.open = texts.open;
    });
    const summary = texts.createEl("summary", { cls: "html-atelier-listhead", text: t("outlineTabTexts") });
    summary.createSpan({ cls: "html-atelier-count", text: String(containers.length) });
    const textList = texts.createDiv({ cls: "html-atelier-list" });
    for (const [ci, c] of containers.entries()) {
      const blank = !c.logical.trim();
      const row = textList.createEl("button", { cls: `html-atelier-row html-atelier-textrow${blank ? " html-atelier-muted" : ""}`, attr: { type: "button" } });
      row.setText(blank ? t("outlineBlankRow") : c.logical.slice(0, 80));
      row.addEventListener("click", () => {
        if (blank) {
          window.htmlAtelierSelection = { kind: "paragraph", containerIndex: ci };
          this.setTab("edit");
          return;
        }
        this.callbacks.revealInPreview(ci, 0, c.logical.length);
      });
    }
  }
  // ---- 修改清单(F11) ----
  renderChangesTab(s) {
    const t = this.callbacks.t;
    const base = parseDocument(s.baseSource).segments;
    const work = parseDocument(s.workingSource).segments;
    this.content.empty();
    const wrap = this.content.createDiv({ cls: "html-atelier-changes" });
    const items = [];
    for (const { base: b, work: w } of alignSegments(base, work)) {
      if (b && w) {
        if (b.text !== w.text) items.push({ kind: "text", id: w.id, before: b.text, after: w.text, start: w.start, end: w.end, raw: w.text, locateId: w.id });
      } else if (w) items.push({ kind: "text", id: w.id, before: "(\u65B0\u589E)", after: w.text, start: w.start, end: w.end, raw: w.text, locateId: w.id });
      else if (b) items.push({ kind: "text", id: b.id, before: b.text, after: "(\u5220\u9664)", start: b.start, end: b.end, raw: b.text, locateId: null });
    }
    if (s.workingSource !== s.baseSource && !items.length) items.push({ kind: "source", id: "src", before: s.baseSource.slice(0, 200), after: s.workingSource.slice(0, 200), start: 0, end: s.workingSource.length, raw: s.workingSource, locateId: null });
    if (!items.length) {
      wrap.createDiv({ cls: "html-atelier-panelnote", text: t("changesEmpty") });
      return;
    }
    const head = wrap.createDiv({ cls: "html-atelier-btnrow" });
    const restoreAll = head.createEl("button", { attr: { "type": "button" }, text: t("changesRestoreAll") });
    restoreAll.addEventListener("click", () => {
      if (!window.confirm(t("changesConfirmAll", { n: String(items.length) }))) return;
      for (const item of [...items].reverse()) this.restoreItem(s, item);
    });
    for (const item of items) {
      const row = wrap.createDiv({ cls: "html-atelier-change" });
      const rowHead = row.createDiv({ cls: "html-atelier-changehead" });
      rowHead.createSpan({ cls: "html-atelier-muted", text: t("changesKindText") });
      const btns = rowHead.createDiv({ cls: "html-atelier-btnrow" });
      const loc = btns.createEl("button", { attr: { "type": "button" }, text: t("changesLocation") });
      loc.addEventListener("click", () => this.callbacks.locateChange(item.start, item.locateId));
      const restore = btns.createEl("button", { attr: { "type": "button" }, text: t("changesRestoreOne") });
      restore.disabled = s.operation !== "idle" || item.locateId === null;
      restore.addEventListener("click", () => this.restoreItem(s, item));
      const diff = row.createDiv({ cls: "html-atelier-diff" });
      diff.createDiv({ cls: "html-atelier-diffline html-atelier-diffold", text: item.before });
      diff.createDiv({ cls: "html-atelier-diffline html-atelier-diffnew", text: item.after });
    }
  }
  restoreItem(s, item) {
    const idx = new SourceIndex(s.workingSource);
    const node = idx.nodes.find((n) => n.kind === "text" && n.start === item.start && n.raw === item.raw);
    const baseSeg = alignSegments(parseDocument(s.baseSource).segments, parseDocument(s.workingSource).segments).find((pr) => pr.work?.id === item.id)?.base ?? null;
    if (node && baseSeg) {
      this.callbacks.applyTextPatch({ start: node.start, end: node.end, expected: node.raw, replacement: escapeText2(baseSeg.text) }, "restore");
    } else if (baseSeg) {
      const { index, map } = this.rebuild();
      const c = map.find((cc) => cc.logical === item.raw);
      if (c) {
        const at = c.logical.indexOf(item.raw);
        const r = replaceLogical(index, c, at, at + item.raw.length, baseSeg.text);
        if (r.ok) this.callbacks.applyTextPatch(r.patch, "restore");
      }
    }
  }
  // ---- 资源(F17) ----
  renderResourcesTab(s) {
    const t = this.callbacks.t;
    const index = new SourceIndex(s.workingSource);
    const file = this.callbacks.activeFilePath() ?? "";
    const exists = (p) => !!this.appFileExists(p);
    const allow = this.callbacks.settings().preview.allowNetworkAssets;
    const list = collectResourcesIndexed(index, file, exists, allow);
    this.content.empty();
    const wrap = this.content.createDiv({ cls: "html-atelier-resources" });
    const head = wrap.createDiv({ cls: "html-atelier-btnrow" });
    const refresh = head.createEl("button", { attr: { "type": "button" }, text: t("resourcesRefresh") });
    refresh.addEventListener("click", () => this.refresh(true));
    if (!list.length) {
      wrap.createDiv({ cls: "html-atelier-panelnote", text: t("resourcesEmpty") });
      return;
    }
    for (const r of list) {
      const row = wrap.createDiv({ cls: "html-atelier-row html-atelier-resource" });
      row.createSpan({ cls: "html-atelier-muted", text: r.tag });
      row.createSpan({ text: r.raw.slice(0, 60) });
      const badge = row.createSpan({
        cls: `html-atelier-badge html-atelier-badge-${r.status}`,
        text: resourceStatusText(r.status, (k) => t(k))
      });
      void badge;
      const jump = row.createEl("button", { attr: { "type": "button" }, text: t("resourcesJumpSource") });
      jump.addEventListener("click", () => this.callbacks.locateInSource(r.offset));
    }
  }
  appFileExists(path) {
    const w = window;
    return w.htmlAtelierExists?.(path) ?? false;
  }
  runSearchDebounced() {
    if (this.searchDebounceTimer) window.clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = window.setTimeout(() => this.runSearch(), 150);
  }
  runSearch() {
    const q = this.searchBox.value;
    this.searchResults.empty();
    this.searchHits = [];
    this.searchAt = -1;
    if (!q) return;
    const s = this.callbacks.getActiveSession()?.session;
    if (!s) return;
    const { index, map } = this.rebuild();
    void index;
    const containers = map;
    const caseSensitive = this.searchCase.checked;
    const needle = caseSensitive ? q : q.toLowerCase();
    for (const [ci, c] of containers.entries()) {
      if (c.hidden && !this.callbacks.settings().search.includeHidden) continue;
      const hay = caseSensitive ? c.logical : c.logical.toLowerCase();
      let at = hay.indexOf(needle);
      while (at >= 0) {
        this.searchHits.push({
          containerIndex: ci,
          start: at,
          end: at + q.length,
          preview: c.logical.slice(Math.max(0, at - 20), at + q.length + 20),
          path: c.tag,
          hidden: c.hidden
        });
        at = hay.indexOf(needle, at + Math.max(1, q.length));
      }
    }
    const t = this.callbacks.t;
    if (!this.searchHits.length) {
      this.searchResults.createDiv({ cls: "html-atelier-hint", text: t("searchNoResults") });
      return;
    }
    for (const [i, hit] of this.searchHits.entries()) {
      const row = this.searchResults.createDiv({ cls: "html-atelier-row html-atelier-searchhit" });
      row.setText(`${hit.path}: \u2026${hit.preview}\u2026${hit.hidden ? t("outlineHiddenMark") : ""}`);
      row.addEventListener("click", () => {
        const s2 = this.callbacks.getActiveSession()?.session;
        if (!s2) return;
        const { index: idx, map: map2 } = this.rebuild();
        const c = map2[hit.containerIndex];
        const r = rangesForLogical(c, hit.start, hit.end);
        if (r.length === 1) {
          const seg = this.segmentAt(idx, r[0].srcStart);
          if (seg) this.callbacks.selectInPreview(seg.id);
        } else this.callbacks.revealInPreview(hit.containerIndex, hit.start, hit.end);
      });
      void i;
    }
  }
  // F13:全部替换(普通文本,单节点命中;跨节点命中计数跳过;一次事务,可整体撤销)
  replaceAll() {
    const q = this.searchBox.value;
    const replacement = this.replaceBox.value;
    if (!q || !this.searchHits.length) return;
    const s = this.callbacks.getActiveSession()?.session;
    if (!s) return;
    const { index, map } = this.rebuild();
    const patches = [];
    let skipped = 0;
    for (const hit of this.searchHits) {
      const c = map[hit.containerIndex];
      const ranges = rangesForLogical(c, hit.start, hit.end);
      if (ranges.length !== 1) {
        skipped++;
        continue;
      }
      const r = ranges[0];
      patches.push({ start: r.srcStart, end: r.srcEnd, expected: index.source.slice(r.srcStart, r.srcEnd), replacement: escapeText2(replacement) });
    }
    if (!patches.length) {
      new import_obsidian11.Notice(t0(this.callbacks, "searchNoResults"));
      return;
    }
    try {
      const applied = this.callbacks.applyPatches(patches, "text", "replace-all", void 0, true);
      if (applied) {
        if (skipped) new import_obsidian11.Notice(t0(this.callbacks, "searchSkipped", { n: String(skipped) }));
        return;
      }
    } catch {
    }
    let done = 0;
    const ordered = [...patches].sort((a, b) => a.start - b.start);
    let delta = 0;
    for (const p of ordered) {
      const session = this.callbacks.getActiveSession()?.session;
      if (!session) break;
      const src = session.workingSource;
      const start = p.start + delta, end = p.end + delta;
      if (start < 0 || end > src.length || start > end) break;
      const one = this.callbacks.applyPatches([{ start, end, expected: src.slice(start, end), replacement: p.replacement }], "text", "replace-all", void 0, true);
      if (!one) break;
      delta += p.replacement.length - (p.end - p.start);
      done++;
    }
    if (!done) new import_obsidian11.Notice(t0(this.callbacks, "searchNoResults"));
    else if (done < patches.length) new import_obsidian11.Notice(t0(this.callbacks, "searchSkipped", { n: String(patches.length - done) }));
  }
  segmentAt(index, offset) {
    const model = parseDocument(this.callbacks.getActiveSession()?.session.workingSource ?? "");
    void index;
    return model.segments.find((seg) => offset >= seg.start && offset <= seg.end) ?? null;
  }
};
function t0(cb, key, params) {
  const tt = cb.t;
  return tt(key, params);
}

// src/main.ts
init_modals();

// src/embed/index.ts
var import_obsidian12 = require("obsidian");

// src/embed/params.ts
function parseEmbedParams(src) {
  const params = { path: null, height: "auto", width: "auto", anchor: null, toolbar: true };
  const unknown = [];
  for (const lineRaw of src.split(/\r?\n/)) {
    const line = lineRaw.trim();
    if (!line) continue;
    const m = /^([A-Za-z]+)\s*:\s*(.+)$/.exec(line);
    if (!m) {
      unknown.push(line);
      continue;
    }
    const [, keyRaw, valueRaw] = m;
    const key = keyRaw.toLowerCase();
    let value = valueRaw.trim();
    const quoted = /^"(.*)"$/.exec(value) ?? /^'(.*)'$/.exec(value);
    if (quoted) value = quoted[1].trim();
    if (key === "path") params.path = value;
    else if (key === "height") {
      params.height = value === "auto" ? "auto" : clampInt(value, 160, 1600, "auto");
    } else if (key === "width") {
      params.width = value === "auto" ? "auto" : clampInt(value, 240, 3840, "auto");
    } else if (key === "anchor") params.anchor = value;
    else if (key === "toolbar") params.toolbar = /^(true|yes|on|1)$/i.test(value);
    else unknown.push(line);
  }
  if (unknown.length) return { params: null, error: `\u672A\u77E5\u53C2\u6570: ${unknown.join(", ")}` };
  if (!params.path) return { params: null, error: "\u7F3A\u5C11 path" };
  return { params, error: null };
}
function clampInt(v, min, max, dflt) {
  if (!/^[+-]?\d+$/.test(v.trim())) return dflt;
  const n = Number(v.trim());
  return Math.min(max, Math.max(min, n));
}

// src/embed/index.ts
var EmbedRenderChild = class extends import_obsidian12.MarkdownRenderChild {
  constructor(app, containerEl, src, sourcePath, opts, hooks) {
    super(containerEl);
    this.app = app;
    this.src = src;
    this.sourcePath = sourcePath;
    this.opts = opts;
    this.hooks = hooks;
    this.observer = null;
    this.frame = null;
    this.mounted = false;
    this.host = null;
  }
  onload() {
    const { params, error } = parseEmbedParams(this.src);
    const container = this.containerEl.createDiv({ cls: "html-atelier-embedbox" });
    if (error || !params || !params.path) {
      container.createDiv({ cls: "html-atelier-embederror", text: error ?? "missing path" });
      return;
    }
    const file = this.hooks.getFileByPath(params.path);
    if (!file) {
      container.createDiv({ cls: "html-atelier-embederror", text: `${params.path} (missing)` });
      return;
    }
    const head = container.createDiv({ cls: "html-atelier-embedhead" });
    head.createSpan({ cls: "html-atelier-muted", text: file.name });
    if (this.hooks.isDirty(file.path) && this.opts.showDrafts) head.createSpan({ cls: "html-atelier-badge", text: "\u8349\u7A3F" });
    if (this.opts.showToolbar && params.toolbar) {
      const open = head.createEl("button", { attr: { type: "button" }, text: "\u6253\u5F00\u7F16\u8F91" });
      open.addEventListener("click", () => this.hooks.openHtml(file.path));
      const reload = head.createEl("button", { attr: { type: "button" }, text: "\u5237\u65B0" });
      reload.addEventListener("click", () => {
        this.mounted = false;
        this.tryMount(true);
      });
    }
    const host = container.createDiv({ cls: "html-atelier-embedhost" });
    const hostProps = { height: params.height === "auto" ? `${this.opts.defaultHeight}px` : `${params.height}px` };
    if (params.width !== "auto") {
      hostProps.width = `${params.width}px`;
      hostProps["max-width"] = "100%";
      hostProps.margin = "0 auto";
    }
    host.setCssProps(hostProps);
    host.dataset.path = file.path;
    host.dataset.anchor = params.anchor ?? "";
    host.dataset.width = String(params.width);
    host.dataset.height = String(params.height);
    this.observer = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) this.tryMount();
    }, { rootMargin: "200px" });
    this.observer.observe(host);
    this.host = host;
  }
  tryMount(force = false) {
    if (this.mounted && !force) return;
    this.mounted = true;
    if (!this.host || !this.fileRef()) return;
    const file = this.fileRef();
    void this.app;
    const resource = this.hooks.getResourcePath(file);
    const base = resource.slice(0, resource.lastIndexOf("/") + 1);
    void this.app.vault?.cachedRead(file).then(async (content) => {
      if (!this.host) return;
      const ds = this.host.dataset;
      const io = {
        readCss: async (p) => {
          const f = this.hooks.getFileByPath(p);
          return f ? await this.app.vault.cachedRead(f).catch(() => null) : null;
        },
        resourceUrl: (p) => {
          const f = this.hooks.getFileByPath(p);
          return f ? this.hooks.getResourcePath(f) : null;
        }
      };
      const inlined = await inlineLocalStylesheets(content, file.path, io);
      if (!this.host) return;
      this.frame = HtmlAtelierRenderEmbed(
        this.host,
        inlined,
        base,
        ds.height === "auto" ? "auto" : Number(ds.height),
        this.opts.autoHeightMax,
        this.opts.allowNetwork,
        `${this.opts.nonce}-${ds.anchor || ""}`
      );
      const anchor = ds.anchor;
      if (anchor) this.frame.addEventListener("load", () => {
        try {
          this.frame?.contentDocument?.getElementById(anchor)?.scrollIntoView();
        } catch {
        }
      });
    }).catch(() => new import_obsidian12.Notice("\u5D4C\u5165\u8BFB\u53D6\u5931\u8D25"));
  }
  fileRef() {
    if (!this.host) return null;
    const ds = this.host.dataset;
    return this.hooks.getFileByPath(ds.path);
  }
  onunload() {
    this.observer?.disconnect();
    this.observer = null;
    this.frame?.remove();
    this.frame = null;
    this.host?.empty();
    this.host = null;
  }
};
function HtmlAtelierRenderEmbed(container, content, base, height, maxHeight, allowNetwork, nonce) {
  container.empty();
  const frame = container.createEl("iframe", { cls: "html-atelier-frame html-atelier-embed", attr: { sandbox: "allow-same-origin", referrerpolicy: "no-referrer" } });
  frame.style.setProperty("height", height === "auto" ? "300px" : `${height}px`);
  frame.addEventListener("load", () => {
    if (height !== "auto") return;
    const doc = frame.contentDocument;
    if (!doc) return;
    const h = autoEmbedHeight(frame, doc, maxHeight);
    if (h !== null) frame.style.setProperty("height", `${h}px`);
  });
  frame.srcdoc = makePreview(parseDocument(content), base, nonce, { allowNetwork });
  return frame;
}
var EMBED_MIN_HEIGHT = 160;
function autoEmbedHeight(frame, doc, maxHeight) {
  frame.style.setProperty("height", `${EMBED_MIN_HEIGHT}px`);
  const content = doc.documentElement.scrollHeight;
  if (!Number.isFinite(content)) return null;
  return Math.max(EMBED_MIN_HEIGHT, Math.min(maxHeight, content));
}

// src/drafts/migrate.ts
function isLegacyDraftShape(v) {
  if (typeof v !== "object" || v === null) return false;
  const d = v;
  return typeof d.source === "string" && Array.isArray(d.changes) && d.changes.every((c) => Array.isArray(c) && c.length === 2 && typeof c[0] === "string" && typeof c[1] === "string");
}
function migrateLegacyDrafts(data, deviceId, now) {
  const records = [];
  const manual = [];
  if (typeof data !== "object" || data === null) return { records, manual };
  const drafts = data.drafts;
  if (typeof drafts !== "object" || drafts === null) return { records, manual };
  for (const [filePath, entry] of Object.entries(drafts)) {
    if (!isLegacyDraftShape(entry)) {
      manual.push({ filePath, raw: entry, reason: "\u8349\u7A3F\u7ED3\u6784\u65E0\u6CD5\u8BC6\u522B" });
      continue;
    }
    try {
      const model = parseDocument(entry.source);
      const changes = new Map(entry.changes);
      const workingSource = applyText(model, changes);
      const record = sealDraftRecord({
        schemaVersion: 2,
        deviceId,
        filePath,
        baseSource: entry.source,
        baseHash: fingerprint(entry.source),
        workingSource,
        revision: 1,
        updatedAt: now
      });
      records.push(record);
    } catch (e) {
      manual.push({ filePath, raw: entry, reason: e instanceof Error ? e.message : String(e) });
    }
  }
  return { records, manual };
}

// src/main.ts
var WORKER_SRC = "\"use strict\";\n(() => {\n  // src/services/regexp/regexpCore.ts\n  var RegexpInputError = class extends Error {\n    constructor(message) {\n      super(message);\n      this.name = \"RegexpInputError\";\n    }\n  };\n  var ALLOWED_FLAGS = /[dgimsuvy]/g;\n  function sanitizeFlags(flags) {\n    const chars = [...new Set(flags.match(ALLOWED_FLAGS) ?? [])];\n    if (!chars.includes(\"g\")) chars.push(\"g\");\n    return chars.sort().join(\"\");\n  }\n  function compileRegex(pattern, flags) {\n    if (pattern.length > 1e4) throw new RegexpInputError(\"\\u6B63\\u5219\\u8868\\u8FBE\\u5F0F\\u8FC7\\u957F\");\n    const clean = sanitizeFlags(flags);\n    try {\n      return new RegExp(pattern, clean);\n    } catch (e) {\n      throw new RegexpInputError(`\\u65E0\\u6548\\u6B63\\u5219\\u8868\\u8FBE\\u5F0F\\uFF1A${e instanceof Error ? e.message : String(e)}`);\n    }\n  }\n  function runRegexpSearch(text, pattern, flags, maxMatches, maxIterations) {\n    if (!Number.isInteger(maxMatches) || maxMatches < 1 || maxMatches > 1e5) throw new RegexpInputError(\"maxMatches \\u8D85\\u51FA\\u8303\\u56F4\");\n    if (!Number.isInteger(maxIterations) || maxIterations < 1 || maxIterations > 1e9) throw new RegexpInputError(\"maxIterations \\u975E\\u6CD5\");\n    const regex = compileRegex(pattern, flags);\n    const matches = [];\n    let iterations = 0;\n    let truncated = false;\n    regex.lastIndex = 0;\n    let m;\n    while ((m = regex.exec(text)) !== null) {\n      if (++iterations > maxIterations) throw new RegexpInputError(\"\\u8FED\\u4EE3\\u6B21\\u6570\\u8D85\\u9650\\uFF0C\\u5DF2\\u4E2D\\u6B62\");\n      const start = m.index;\n      const end = start + m[0].length;\n      matches.push({ start, end, text: m[0], groups: m.slice(1).map((g) => g ?? \"\") });\n      if (matches.length >= maxMatches) {\n        if (m[0].length === 0) {\n          const cp = text.codePointAt(start) ?? 0;\n          regex.lastIndex = start + (cp > 65535 ? 2 : 1);\n        }\n        truncated = regex.lastIndex <= text.length && regex.exec(text) !== null;\n        break;\n      }\n      if (m[0].length === 0) {\n        const cp = text.codePointAt(start) ?? 0;\n        regex.lastIndex = start + (cp > 65535 ? 2 : 1);\n        if (regex.lastIndex > text.length) break;\n      }\n    }\n    return { matches, truncated };\n  }\n\n  // src/services/regexp/worker.browser.ts\n  var ctx = self;\n  ctx.onmessage = (event) => {\n    const raw = event.data;\n    if (typeof raw !== \"object\" || raw === null) return;\n    const req = raw;\n    if (req.type !== \"regexp-search\" || typeof req.requestId !== \"number\") return;\n    let reply;\n    try {\n      const result = runRegexpSearch(\n        String(req.text),\n        String(req.pattern),\n        String(req.flags),\n        typeof req.maxMatches === \"number\" ? req.maxMatches : 5e3,\n        typeof req.maxIterations === \"number\" ? req.maxIterations : 2e6\n      );\n      reply = { requestId: req.requestId, ok: true, result: { ...result, revision: req.revision } };\n    } catch (e) {\n      reply = {\n        requestId: req.requestId,\n        ok: false,\n        error: e instanceof RegexpInputError ? e.message : `worker \\u9519\\u8BEF\\uFF1A${e instanceof Error ? e.message : String(e)}`\n      };\n    }\n    ctx.postMessage(reply);\n  };\n})();\n";
var HtmlAtelier = class extends import_obsidian13.Plugin {
  constructor() {
    super(...arguments);
    this.hostLang = "";
    this.nav = new NavigationService();
    this.merge = new MergeService(this.app);
    this.sessions = /* @__PURE__ */ new Map();
    this.active = null;
    this.retainedUnknown = {};
    this.translator = createTranslator("zh-CN");
    // 稳定的委派函数:所有服务/视图在构造时拿到的都是这一个引用,因此
    // ui.language 变更只需替换 translator 即可全场生效(此前 t 是快照,
    // 设置回调只存盘,切换语言必须重载插件 —— 审计 round4 缺陷 33)
    this.t = (key, params) => this.translator(key, params);
    this.prevLeafWasHtml = false;
    // 卸载中:关闭视图不再弹确认框(应用退出/禁用插件时不该拦一个模态)
    this.unloading = false;
    // ---- 会话与保存(§12.4/F26) ----
    this.pendingSessions = /* @__PURE__ */ new Map();
    // 资产变化 → 依赖判断 → 只刷新真正引用它的视图(设计 §7.4:依赖图有上限、有环检测)
    this.pendingAssets = /* @__PURE__ */ new Set();
  }
  async onload() {
    const data = await this.loadData().catch(() => null);
    const parsed = normalizeSettings(data?.settings === void 0 ? data : data.settings);
    this.settings = parsed.settings;
    this.retainedUnknown = parsed.retainedUnknown;
    const hostLang = globalThis.moment?.locale() ?? "";
    this.translator = createTranslator(resolveLocale(this.settings.ui.language, hostLang));
    this.hostLang = hostLang;
    clearDebugLog();
    this.sidebar = new SidebarCoordinator(this.app, () => this.settings, this.t);
    this.drafts = new DraftsService(this.app, () => this.settings, getDeviceId());
    this.drafts.onStatusChange = () => this.refreshPanels();
    this.noteRef = new NoteReferenceService(this.app, this.t);
    this.saveAs = new SaveAsService(this.app, this.t);
    this.assetRefresh = createAssetRefresher(() => void this.refreshDependentViews());
    this.regexp = new RegExpSearchAdapter(new TaskHost(blobWorkerTransport(WORKER_SRC), { timeoutMs: 1e3 }));
    this.routerInit();
    this.nav.fromJSON(data?.nav);
    if (!data?.migratedV1 && data && data.drafts) {
      try {
        await this.migrateV1Drafts(data.drafts);
      } catch (e) {
        console.error("v1 \u8349\u7A3F\u8FC1\u79FB\u5931\u8D25,\u4FDD\u7559\u539F\u59CB\u6570\u636E", e);
      }
    }
    this.registerView(HTML_VIEW, (leaf) => new HtmlFileView(leaf, this.viewCallbacks()));
    this.registerView(HTML_PANEL, (leaf) => new HtmlPanelView(leaf, this.panelCallbacks()));
    for (const ext of ["html", "htm"]) {
      try {
        this.registerExtensions([ext], HTML_VIEW);
      } catch {
        new import_obsidian13.Notice(this.t("noticeExtensionTakenOver", { ext }), 1e4);
      }
    }
    this.registerCommands();
    this.registerEvents();
    this.settingTab = new AtelierSettingTab(this.app, this, () => this.settings, (s) => this.applySettings(s));
    this.addSettingTab(this.settingTab);
    window.htmlAtelierExists = (p) => !!this.app.vault.getAbstractFileByPath(p);
    this.registerDomEvent(window, "html-atelier-cmd", ((e) => {
      const { name } = e.detail;
      if (name === "save-as") this.openSaveAs();
      else if (name === "copy-page-link") this.commandCopyPageLink();
      else if (name === "copy-section-link") this.commandCopySectionLink();
      else if (name === "copy-embed") {
        const v = this.activeHtmlView();
        if (v?.file) void navigator.clipboard.writeText(embedCode(v.file.path, "auto", "auto", null, true));
      } else if (name === "draft-manager") new DraftManagerModal(this.t, this.drafts, (p) => {
        void this.app.workspace.openLinkText(p, "", false);
      }, this.app, () => this.settings).open();
      else if (name === "conflict") this.openConflict();
    }));
    this.app.workspace.onLayoutReady(() => {
      const view = this.app.workspace.getActiveViewOfType(HtmlFileView);
      if (view) {
        this.active = view;
        void this.showPanel(false);
      }
    });
  }
  // 卸载(禁用插件/退出应用):设计 §11.3 要求"卸载尽最大努力提交"。
  // 此前没有 onunload,于是最后一个防抖窗口的内容只留在内存里。
  onunload() {
    this.unloading = true;
    for (const session of this.sessions.values()) if (session.dirty) void this.drafts.flush(session);
  }
  viewCallbacks() {
    return {
      getSession: (file) => this.getSession(file),
      save: (file, session) => this.saveFile(file, session),
      onSessionEdited: (_file, session) => {
        this.drafts.scheduleSave(session);
        this.refreshPanels();
      },
      onSelectChanged: (sel) => {
        window.htmlAtelierSelection = sel;
        this.refreshPanels(true);
      },
      onHoverStatus: (text) => {
        window.htmlAtelierHover = text;
      },
      nav: this.nav,
      settings: () => this.settings,
      t: this.t,
      router: this.router,
      openLibraryFile: (file, newLeaf) => {
        void this.app.workspace.openLinkText(file.path, "", newLeaf);
      },
      openMarkdown: (path, fragment, newLeaf) => {
        void this.app.workspace.openLinkText(path, fragment, newLeaf);
      },
      sidebarSuppressed: () => this.sidebar.isSuppressed() || this.sidebar.isManuallyCollapsed(this.sidebar.panelLeaves().length > 0),
      isUnloading: () => this.unloading,
      // 工具栏在侧栏承载时,视图内的状态变化(模式/视口/导航栈/加载)只能通过这里
      // 传到面板;只刷新面板工具栏,不走 refreshPanels,避免与面板刷新互相触发
      onViewStateChanged: () => this.refreshPanelToolbars()
    };
  }
  panelCallbacks() {
    return {
      settings: () => this.settings,
      t: this.t,
      toolbarTarget: () => this.activeHtmlView()?.toolbarTarget() ?? disabledTarget(),
      getActiveSession: () => {
        const view = this.activeHtmlView();
        if (!view?.session || !view.file) return null;
        return { session: view.session, filePath: view.file.path };
      },
      activeFilePath: () => this.activeHtmlView()?.file?.path ?? null,
      applyTextPatch: (patch, origin) => this.activeHtmlView()?.applyTextPatch(patch, origin),
      applyPatches: (patches, kind, groupingKey, origin, silent) => this.activeHtmlView()?.applyPatches(patches, kind, groupingKey, origin, silent) ?? false,
      locateInSource: (offset) => this.activeHtmlView()?.locateInSource(offset),
      locateChange: (offset, segmentId) => this.activeHtmlView()?.locateChange(offset, segmentId ?? void 0),
      locatePreview: (segmentId) => {
        const v = this.activeHtmlView();
        if (!v) return;
        v.prepareLocate();
        v.currentAnchor = segmentId.startsWith("#") ? segmentId : `#${segmentId}`;
        v.scrollToAnchor(v.currentAnchor);
        v.syncTextNodes();
      },
      selectInPreview: (segmentId) => this.activeHtmlView()?.selectText(segmentId),
      revealInPreview: (containerIndex, lStart, lEnd) => {
        return this.activeHtmlView()?.locateLogical(containerIndex, lStart, lEnd) ?? false;
      },
      saveActive: () => {
        const v = this.activeHtmlView();
        if (v?.file && v.session) void this.saveFile(v.file, v.session);
      },
      undo: () => {
        const v = this.activeHtmlView();
        if (!v?.session) return;
        try {
          v.session.undo();
          this.afterHistoryMove(v, v.session);
        } catch (e) {
          new import_obsidian13.Notice(e instanceof Error ? e.message : String(e));
        }
      },
      redo: () => {
        const v = this.activeHtmlView();
        if (!v?.session) return;
        try {
          v.session.redo();
          this.afterHistoryMove(v, v.session);
        } catch (e) {
          new import_obsidian13.Notice(e instanceof Error ? e.message : String(e));
        }
      },
      openFileByPath: (path) => {
        void this.app.workspace.openLinkText(path, "", false);
      },
      pickLibraryFile: async (filter) => {
        return new Promise((resolve) => {
          filePickerModal(this.app, (f) => filter({ path: f.path, extension: f.extension }), (path) => resolve(path));
        });
      },
      importImage: async () => {
        const input = createEl("input");
        input.type = "file";
        input.accept = "image/*";
        const picked = await new Promise((r) => {
          input.addEventListener("change", () => r(input.files?.[0] ?? null));
          input.click();
        });
        if (!picked) return null;
        const view = this.activeHtmlView();
        const dir = view?.file?.parent?.path && view.file.parent.path !== "/" ? view.file.parent.path : "";
        const ext = picked.name.match(/(\.[^.]+)$/)?.[1] ?? "";
        const stem = picked.name.replace(/(\.[^.]+)$/, "");
        let name = picked.name;
        let n = 1;
        while (this.app.vault.getAbstractFileByPath(dir ? `${dir}/${name}` : name)) name = `${stem}-${n++}${ext}`;
        const path = dir ? `${dir}/${name}` : name;
        const buf = await picked.arrayBuffer();
        await this.app.vault.createBinary(path, buf);
        new import_obsidian13.Notice(this.t("imageImportDone", { path }));
        return path;
      },
      copyPageLink: () => this.commandCopyPageLink(),
      copySectionLink: () => this.commandCopySectionLink(),
      conflictOpen: () => this.openConflict(),
      adoptRemote: () => void this.adoptRemote(),
      exportDraftAsCopy: () => this.openSaveAs(),
      searchAll: (q, caseSensitive, includeHidden) => {
        void q;
        void caseSensitive;
        void includeHidden;
        return [];
      }
    };
  }
  routerInit() {
    if (this.router) return this.router;
    this.router = new LinkRouter(
      this.app,
      () => this.settings,
      this.t,
      electronBrowserLauncher(() => this.settings),
      (path, fragment, newLeaf) => {
        if (!path) {
          this.activeHtmlView()?.scrollToAnchor(fragment);
          return;
        }
        if (fragment) window.htmlAtelierPendingAnchor = fragment;
        void this.app.workspace.openLinkText(path, "", newLeaf);
      },
      (file, newLeaf) => {
        void this.app.workspace.openLinkText(file.path, "", newLeaf);
      }
    );
    return this.router;
  }
  activeHtmlView() {
    const view = this.app.workspace.getActiveViewOfType(HtmlFileView);
    if (view) return view;
    return this.app.workspace.getLeavesOfType(HTML_VIEW).map((l) => l.view).find((v) => v.session !== null) ?? null;
  }
  async getSession(file) {
    const existing = this.sessions.get(file.path);
    if (existing) return existing;
    const pending = this.pendingSessions.get(file.path);
    if (pending) return pending;
    const load = this.loadSession(file);
    this.pendingSessions.set(file.path, load);
    try {
      return await load;
    } finally {
      this.pendingSessions.delete(file.path);
    }
  }
  async loadSession(file) {
    const disk = await this.app.vault.read(file);
    const recovered = await this.drafts.recover(file).catch(() => null);
    const session = new DocumentSession(
      file.path,
      disk,
      recovered?.workingSource ?? disk,
      { maxEvents: this.settings.editor.historyLimit, maxBytes: 32 * 1024 * 1024, mergeDelayMs: this.settings.editor.mergeDelayMs },
      // nowRevision 必须继承草稿里的 revision:草稿层按单调 revision 拒绝旧写入,新会话若从 0 开始,
      // 则重开后前 N 次编辑(N = 上次会话最终 revision)全部被拒、备份静默失效
      // (审计 round4 BUG 3:实测 39 次连续失败)。
      recovered?.revision ?? 0
    );
    if (recovered) session.contentState = recovered.conflict ? "conflict" : "dirty";
    session.draftStatus = this.settings.drafts.enabled ? recovered ? "saved" : "idle" : "disabled";
    this.sessions.set(file.path, session);
    return session;
  }
  async saveFile(file, session, quiet = false) {
    const view = this.activeHtmlView();
    view?.saveFocus();
    const io = { process: async (decide) => {
      let result = "conflict";
      await this.app.vault.process(file, (current) => {
        const next = decide(current);
        if (next === null) throw new Error("html-atelier-conflict");
        result = "written";
        return next;
      });
      return result;
    } };
    const outcome = await session.save(io);
    if (outcome.result === "written") {
      await this.drafts.clearDraft(file.path, session);
      for (const leaf of this.app.workspace.getLeavesOfType(HTML_VIEW)) {
        const v = leaf.view;
        if (v.session === session) v.applyChangeHighlights();
      }
      view?.restoreFocusAfterSave();
      await this.drainQueuedExternal(file, session);
      this.refreshPanels();
      return true;
    }
    if (!quiet) {
      if (outcome.result === "conflict") new import_obsidian13.Notice(this.t("noticeExternalConflict"), 7e3);
      else if (outcome.result === "io-error") new import_obsidian13.Notice(this.t("noticeSaveFailed"));
      else if (outcome.result === "missing") new import_obsidian13.Notice(this.t("noticeFileMissing"), 7e3);
      else if (outcome.result === "blocked") new import_obsidian13.Notice(this.t(session.contentState === "conflict" ? "noticeExternalConflict" : "noticeSaveBusy"), 7e3);
    }
    await this.drainQueuedExternal(file, session);
    this.refreshPanels();
    return false;
  }
  // 保存期间被排队的外部变化:保存一结束就读取磁盘补发,否则它会随标记一起被丢掉,
  // 会话自认干净而磁盘已是对方版本,下一次保存即覆盖(审计 round4 BUG 21)。
  async drainQueuedExternal(file, session) {
    if (!session.hasQueuedExternal || session.operation !== "idle") return;
    session.consumeQueuedExternal();
    const disk = await this.readOrNull(file);
    if (disk !== null) session.externalChange(disk);
  }
  // 撤销/重做后的草稿同步(2026-09-30 复查):此前撤销/重做不碰草稿层,撤销回已保存
  // 内容后磁盘残留撤销前的旧草稿(onunload 只 flush 脏会话,删不掉它),重启后被
  // recover 当成未保存修改复活。现在按普通编辑处理:变干净 → 立即删草稿回 idle;
  // 仍有未保存修改 → 重新排队备份。
  afterHistoryMove(v, session) {
    v.syncTextNodes();
    if (!session.dirty && session.contentState !== "conflict") void this.drafts.clearDraft(session.filePath, session);
    else this.drafts.scheduleSave(session);
    this.refreshPanels();
  }
  // 设置变更的统一入口(设置页回调)。三级要求:
  // 1) 必须**快照**入参:设置页传进来的就是它自己那份可变副本,直接存引用会让
  //    this.settings 与 next 变成同一个对象 —— 下一次变更时 prev 和 next 是同一个引用,
  //    所有 *Changed 判定恒为 false,于是"改第二项设置不再生效"(语言选了英文但界面不变、
  //    开关拨了预览不重绘)。用户反馈设置页问题时暴露(2026-09-15)。
  // 2) ui.language 必须立即生效 —— translator 是稳定委派函数,替换实现即可让所有已持有
  //    该引用的服务/视图改用新语言(此前设置回调只存盘,必须重载插件 —— 审计 round4 缺陷 33);
  // 3) 影响渲染的设置必须让已经渲染出来的内容跟上:网络资源开关影响 meta CSP,
  //    只能重绘 iframe 才生效(此前要手动刷新 —— 审计 round4 缺陷 38 的附带项)。
  applySettings(incoming) {
    const prev = this.settings;
    const next = JSON.parse(JSON.stringify(incoming));
    const langChanged = next.ui.language !== prev.ui.language;
    const networkChanged = next.preview.allowNetworkAssets !== prev.preview.allowNetworkAssets;
    const highlightChanged = next.editor.showChangeHighlights !== prev.editor.showChangeHighlights;
    const sourceChanged = next.source.lineNumbers !== prev.source.lineNumbers || next.source.lineWrapping !== prev.source.lineWrapping;
    const toolbarMoved = next.editor.toolbarPlacement !== prev.editor.toolbarPlacement;
    const embeddingsChanged = next.embeds.enabled !== prev.embeds.enabled || next.embeds.defaultHeight !== prev.embeds.defaultHeight || next.embeds.autoHeightMax !== prev.embeds.autoHeightMax || next.embeds.showDrafts !== prev.embeds.showDrafts || next.embeds.showToolbar !== prev.embeds.showToolbar;
    const draftsToggled = next.drafts.enabled !== prev.drafts.enabled;
    this.settings = next;
    void this.saveData(this.buildPluginData());
    if (langChanged) {
      this.translator = createTranslator(resolveLocale(next.ui.language, this.hostLang));
      this.settingTab.display();
      this.refreshPanels(true);
      for (const leaf of this.app.workspace.getLeavesOfType(HTML_VIEW)) leaf.view.relabelToolbar();
      for (const leaf of this.app.workspace.getLeavesOfType(HTML_PANEL)) leaf.view.relabel();
    }
    if (toolbarMoved) {
      for (const leaf of this.app.workspace.getLeavesOfType(HTML_VIEW)) leaf.view.syncToolbarPlacement();
      for (const leaf of this.app.workspace.getLeavesOfType(HTML_PANEL)) leaf.view.syncToolbarPlacement();
      if (this.panelNeeded()) void this.showPanel(false);
    }
    if (networkChanged) {
      this.rerenderFrames();
      this.refreshEmbedHosts();
    }
    if (highlightChanged) for (const leaf of this.app.workspace.getLeavesOfType(HTML_VIEW)) leaf.view.applyChangeHighlights();
    if (sourceChanged) for (const leaf of this.app.workspace.getLeavesOfType(HTML_VIEW)) leaf.view.reconfigureSourceEditor();
    if (embeddingsChanged) this.refreshEmbedHosts();
    if (draftsToggled) {
      for (const session of this.sessions.values()) {
        if (!next.drafts.enabled) {
          session.draftStatus = "disabled";
          continue;
        }
        if (session.dirty || session.contentState === "conflict") this.drafts.scheduleSave(session);
        else void this.drafts.clearDraft(session.filePath, session);
      }
      this.refreshPanels();
    }
  }
  // 嵌入渲染参数改变后,已渲染的 Markdown 预览里仍是旧参数(乃至仍显示已关闭的嵌入)。
  // 代码块处理器只在 Markdown 重新渲染时被调用,所以这里主动让所有 Markdown 视图重绘。
  refreshEmbedHosts() {
    for (const leaf of this.app.workspace.getLeavesOfType("markdown")) {
      const v = leaf.view;
      try {
        v.previewMode?.rerender?.(true);
      } catch {
      }
    }
  }
  // 当前文档是否还是 HTML。判据是宿主的 getActiveFile():它在活动叶子不是文档视图
  // (侧栏视图 view.navigation===false)时会退回到最近激活的导航视图,因此点侧栏页签
  // 不会改变它 —— 这正是"没有离开 HTML 文件"的语义判据。
  htmlStillActive() {
    const file = this.app.workspace.getActiveFile();
    if (!(file instanceof import_obsidian13.TFile)) return false;
    const ext = file.extension.toLowerCase();
    return ext === "html" || ext === "htm";
  }
  // 活动叶子是否属于侧栏(左右侧栏都算,辅助判据)。三条信号都在真实 Obsidian 1.13.7
  // 实测过(probe/results/panel-tab-diag.json):
  //   我们的 HTML 视图:inSidedock=false inModRoot=true;getRoot()≠left/rightSplit
  //   文件列表(左):  inSidedock=true  inModLeft=true;getRoot()===leftSplit;parent 链 …=leftSplit
  //   反链(右):      inSidedock=true  inModRight=true;getRoot()===rightSplit
  //
  // **唯独不能用 getRoot().getType()**:宿主的 WorkspaceItem 根本没有 getType ——
  // obsidian.asar 里搜不到任何 getType 实现(但 getRoot() 本身存在且返回 sidedock),
  // 那种写法在真机上恒为 undefined,会被当成"主编辑区",面板照旧被关掉
  // (我上一版就是这样,用户实测问题依旧)。
  isSidebarLeaf(leaf) {
    if (!leaf) return false;
    const ws = this.app.workspace;
    try {
      const host = leaf.view?.containerEl;
      if (host?.closest?.(".mod-sidedock, .mod-left-split, .mod-right-split")) return true;
    } catch {
    }
    try {
      const root = leaf.getRoot?.();
      if (root && (root === ws.leftSplit || root === ws.rightSplit)) return true;
    } catch {
    }
    try {
      let item = leaf;
      for (let i = 0; i < 8 && item; i++) {
        if (item === ws.leftSplit || item === ws.rightSplit) return true;
        item = item.parent;
      }
    } catch {
    }
    return false;
  }
  refreshPanels(force = false) {
    for (const leaf of this.app.workspace.getLeavesOfType(HTML_PANEL)) leaf.view.refresh(force);
    for (const leaf of this.app.workspace.getLeavesOfType(HTML_VIEW)) leaf.view.refreshToolbar();
  }
  // 只要面板工具栏是模式切换的唯一入口,面板就属于必需而不是可选
  panelNeeded() {
    return this.settings.sidebar.autoShowHtml || this.settings.editor.toolbarPlacement === "sidebar";
  }
  refreshPanelToolbars() {
    for (const leaf of this.app.workspace.getLeavesOfType(HTML_PANEL)) leaf.view.refreshToolbar?.();
  }
  rerenderFrames() {
    for (const leaf of this.app.workspace.getLeavesOfType(HTML_VIEW)) {
      const v = leaf.view;
      if (v.session) v.renderFrame(true);
    }
  }
  queueAssetRefresh(path) {
    this.pendingAssets.add(path);
    this.assetRefresh();
  }
  async refreshDependentViews() {
    const paths = [...this.pendingAssets];
    this.pendingAssets.clear();
    if (!paths.length) return;
    const readCss = async (p) => {
      const f = this.app.vault.getAbstractFileByPath(p);
      if (!(f instanceof import_obsidian13.TFile)) return null;
      return this.app.vault.cachedRead(f).catch(() => null);
    };
    for (const leaf of this.app.workspace.getLeavesOfType(HTML_VIEW)) {
      const v = leaf.view;
      const session = v.session;
      if (!session || !v.file) continue;
      try {
        for (const p of paths) {
          if (await isPageDependency(p, session.workingSource, v.file.path, readCss)) {
            v.renderFrame(true);
            break;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
  async showPanel(explicit = false) {
    await this.sidebar.showPanel((leaf) => {
      leaf.view.refresh(true);
    }, explicit);
  }
  // ---- 事件(F01/外部变化/F17) ----
  registerEvents() {
    this.sidebar.observe();
    this.registerEvent(this.app.workspace.on("active-leaf-change", (leaf) => {
      const view = leaf?.view instanceof HtmlFileView ? leaf.view : null;
      if (view) {
        this.active = view;
        if (this.panelNeeded() && !this.sidebar.isSuppressed()) void this.showPanel(false);
        this.refreshPanels();
        this.prevLeafWasHtml = true;
      } else if (leaf?.view.getViewType() !== HTML_PANEL) {
        if (!this.htmlStillActive() && !this.isSidebarLeaf(leaf)) {
          if (this.prevLeafWasHtml) {
            this.prevLeafWasHtml = false;
            void this.sidebar.closeOnLeave(this.app.workspace.getActiveFile());
          }
          this.active = null;
          this.refreshPanels();
        }
        if (leaf) this.sidebar.notePreviousLeaf(leaf);
      }
    }));
    this.registerEvent(this.app.workspace.on("file-open", (file) => {
      const view = this.app.workspace.getActiveViewOfType(HtmlFileView);
      if (file instanceof import_obsidian13.TFile && view) {
        this.active = view;
        if (this.panelNeeded() && !this.sidebar.isSuppressed()) void this.showPanel(false);
        this.refreshPanels();
      }
    }));
    this.registerEvent(this.app.vault.on("modify", (file) => {
      if (!(file instanceof import_obsidian13.TFile)) return;
      const session = this.sessions.get(file.path);
      if (session) {
        void (async () => {
          let changed = false;
          const disk = await this.app.vault.read(file).catch(() => null);
          if (disk === null) {
            session.markMissing();
            changed = true;
          } else changed = session.externalChange(disk) !== null;
          if (!changed && session.hasQueuedExternal && session.operation === "idle") {
            const disk2 = await this.app.vault.read(file).catch(() => null);
            if (disk2 !== null) changed = session.externalChange(disk2) !== null;
          }
          if (changed) {
            for (const leaf of this.app.workspace.getLeavesOfType(HTML_VIEW)) {
              const v = leaf.view;
              if (v.session === session) v.renderFrame(true);
            }
            this.refreshPanels(true);
          }
        })();
      }
      if (this.settings.preview.autoRefreshAssets && /\.(css|png|jpe?g|webp|gif|svg|avif|woff2?|ttf|otf|eot)$/i.test(file.path))
        this.queueAssetRefresh(file.path);
    }));
    this.registerEvent(this.app.vault.on("rename", (file, oldPath) => {
      this.nav.rename(oldPath, file.path);
      const session = this.sessions.get(oldPath);
      if (session && file instanceof import_obsidian13.TFile) {
        this.sessions.delete(oldPath);
        this.sessions.set(file.path, session);
        session.filePath = file.path;
        void this.drafts.flush(session);
        void this.drafts.storeRef.removeDraft(oldPath);
      }
    }));
    this.registerEvent(this.app.vault.on("delete", (file) => {
      if (!(file instanceof import_obsidian13.TFile)) return;
      this.sessions.get(file.path)?.markMissing();
    }));
    this.registerMarkdownCodeBlockProcessor("html-atelier", (src, el, ctx) => {
      if (!this.settings.embeds.enabled) return;
      const child = new EmbedRenderChild(
        { vault: this.app.vault },
        el,
        src,
        ctx.sourcePath,
        {
          showDrafts: this.settings.embeds.showDrafts,
          defaultHeight: this.settings.embeds.defaultHeight,
          autoHeightMax: this.settings.embeds.autoHeightMax,
          showToolbar: this.settings.embeds.showToolbar,
          nonce: Math.random().toString(36).slice(2, 8),
          allowNetwork: this.settings.preview.allowNetworkAssets
        },
        {
          getFileByPath: (p) => {
            const f = this.app.vault.getAbstractFileByPath(p);
            return f instanceof import_obsidian13.TFile ? f : null;
          },
          getResourcePath: (f) => this.app.vault.getResourcePath(f),
          openHtml: (p) => {
            void this.app.workspace.openLinkText(p, "", false);
          },
          isDirty: (p) => this.sessions.get(p)?.dirty === true
        }
      );
      ctx.addChild(child);
    });
  }
  // ---- 命令(F18 §8.2) ----
  registerCommands() {
    const needView = () => this.activeHtmlView();
    const needSession = () => {
      const v = needView();
      return v?.session && v.file ? { v, s: v.session, f: v.file } : null;
    };
    const cmd = (id, name, run) => {
      this.addCommand({ id, name, checkCallback: guardCommand(run) });
    };
    cmd("save-html", "\u4FDD\u5B58\u5F53\u524D HTML", (c) => {
      const x = needSession();
      if (!x) return false;
      if (!c) void this.saveFile(x.f, x.s);
      return true;
    });
    cmd("save-as", "\u53E6\u5B58\u5F53\u524D HTML\u2026", (c) => {
      const x = needSession();
      if (!x) return false;
      if (!c) this.openSaveAs();
      return true;
    });
    cmd("open-browser", "\u5728\u6D4F\u89C8\u5668\u6253\u5F00\u5F53\u524D HTML", (c) => {
      const v = needSession() ? needView() : null;
      if (!v) return false;
      if (!c) v.openCurrentInBrowser();
      return true;
    });
    this.addCommand({ id: "show-panel", name: "\u663E\u793A HTML \u4FA7\u680F", callback: () => {
      void this.showPanel(true);
    } });
    cmd("toggle-mode", "\u5207\u6362\u9884\u89C8 / \u7F16\u8F91", (c) => {
      const v = needView();
      if (!v) return false;
      if (!c) v.setMode(v.mode === "edit" ? "preview" : "edit");
      return true;
    });
    cmd("toggle-source", "\u5207\u6362\u6E90\u7801\u6A21\u5F0F", (c) => {
      const v = needView();
      if (!v) return false;
      if (!c) v.setMode(v.mode === "source" ? "preview" : "source");
      return true;
    });
    cmd("toggle-split", "\u5207\u6362\u5206\u680F", (c) => {
      const v = needView();
      if (!v) return false;
      if (!c) v.setMode(v.mode === "split" ? "preview" : "split");
      return true;
    });
    cmd("refresh-preview", "\u5237\u65B0\u9884\u89C8", (c) => {
      const v = needView();
      if (!v) return false;
      if (!c) v.renderFrame(true);
      return true;
    });
    cmd("zoom-reset", "\u6062\u590D 100% \u7F29\u653E", (c) => {
      const v = needView();
      if (!v) return false;
      if (!c) {
        v.zoom = 100;
        v.applyViewport();
      }
      return true;
    });
    cmd("nav-back", "\u540E\u9000", (c) => {
      const v = needView();
      if (!v || !this.nav.canBack(v)) return false;
      if (!c) v.goBack();
      return true;
    });
    cmd("nav-forward", "\u524D\u8FDB", (c) => {
      const v = needView();
      if (!v || !this.nav.canForward(v)) return false;
      if (!c) v.goForward();
      return true;
    });
    cmd("undo", "\u64A4\u9500", (c) => {
      const x = needSession();
      if (!x || x.s.controller.undoDepth === 0) return false;
      if (!c) {
        try {
          x.s.undo();
          this.afterHistoryMove(x.v, x.s);
        } catch (e) {
          new import_obsidian13.Notice(e instanceof Error ? e.message : String(e));
        }
      }
      return true;
    });
    cmd("redo", "\u91CD\u505A", (c) => {
      const x = needSession();
      if (!x || x.s.controller.redoDepth === 0) return false;
      if (!c) {
        try {
          x.s.redo();
          this.afterHistoryMove(x.v, x.s);
        } catch (e) {
          new import_obsidian13.Notice(e instanceof Error ? e.message : String(e));
        }
      }
      return true;
    });
    this.addCommand({ id: "draft-manager", name: "\u6253\u5F00\u8349\u7A3F\u7BA1\u7406", callback: () => {
      new DraftManagerModal(this.t, this.drafts, (path) => {
        void this.app.workspace.openLinkText(path, "", false);
      }, this.app, () => this.settings).open();
    } });
    cmd("conflict-manager", "\u6253\u5F00\u51B2\u7A81\u5904\u7406", (c) => {
      const x = needSession();
      if (!x || x.s.contentState !== "conflict") return false;
      if (!c) this.openConflict();
      return true;
    });
    cmd("copy-page-link", "\u590D\u5236\u5F53\u524D HTML \u9875\u9762\u94FE\u63A5", (c) => {
      const x = needSession();
      if (!x) return false;
      if (!c) this.commandCopyPageLink();
      return true;
    });
    cmd("copy-section-link", "\u590D\u5236\u5F53\u524D\u7AE0\u8282\u94FE\u63A5", (c) => {
      const x = needSession();
      if (!x) return false;
      if (!c) this.commandCopySectionLink();
      return true;
    });
    cmd("insert-embed", "\u63D2\u5165 HTML \u5D4C\u5165", (c) => {
      const md = this.app.workspace.getActiveViewOfType(import_obsidian13.MarkdownView);
      if (!md) return false;
      if (!c) this.commandInsertEmbed();
      return true;
    });
    cmd("locate-source", "\u5B9A\u4F4D\u5230\u6E90\u7801", (c) => {
      const sel = window.htmlAtelierSelection;
      const x = needSession();
      if (!x || sel?.offset === void 0) return false;
      if (!c) this.activeHtmlView()?.locateInSource(sel.offset);
      return true;
    });
    this.addCommand({ id: "disable-sidebar-auto", name: "\u5173\u95ED\u5168\u90E8\u4FA7\u680F\u81EA\u52A8\u884C\u4E3A", callback: () => {
      const patch = this.sidebar.disableAllActions();
      this.settings = { ...this.settings, ...patch };
      void this.saveData(this.buildPluginData());
      new import_obsidian13.Notice(this.t("menuDisableSidebar"));
    } });
  }
  commandCopyPageLink() {
    const file = this.activeHtmlView()?.file;
    if (file) void this.noteRef.copyPage(file, "md");
  }
  commandCopySectionLink() {
    const v = this.activeHtmlView();
    const file = v?.file;
    if (!file) return;
    const anchor = v?.currentAnchor;
    if (!anchor) {
      new import_obsidian13.Notice(this.t("noticeNoAnchor"));
      return;
    }
    void this.noteRef.copySection(file, anchor.replace(/^#/, ""), "md");
  }
  commandInsertEmbed() {
    const md = this.app.workspace.getActiveViewOfType(import_obsidian13.MarkdownView);
    filePickerModal(this.app, (f) => ["html", "htm"].includes(f.extension.toLowerCase()), (path) => {
      if (!md) return;
      md.editor.replaceSelection(`${embedCode(path, "auto", "auto", null, true)}
`);
    });
  }
  openSaveAs() {
    const v = this.activeHtmlView();
    if (!v?.file || !v.session) return;
    new SaveAsModal(this.t, v.file, v.session.workingSource, () => this.settings, this.saveAs, (created) => {
      void this.app.workspace.openLinkText(created.path, "", false);
    }, this.app).open();
  }
  openConflict() {
    const v = this.activeHtmlView();
    if (!v?.file || !v.session || v.session.contentState !== "conflict") return;
    new ConflictModal(
      this.t,
      v.file,
      v.session,
      this.merge,
      () => {
        v.renderFrame(true);
        this.refreshPanels();
      },
      () => this.commitMerged(v),
      () => this.adoptDiskFor(v),
      this.app
    ).open();
  }
  // 合并结果落盘:先备份草稿,再写 vault,最后如实返回结果。
  // 顺序很关键——先草稿后写盘,保证"已解决的合并"在任何失败下都还能恢复(审计 round4 BUG 5)。
  async commitMerged(v) {
    if (!v.file || !v.session) return "io-error";
    await this.drafts.flush(v.session).catch(() => {
    });
    const ok = await this.saveFile(v.file, v.session, true);
    if (ok) return "written";
    const state = v.session.contentState;
    if (state === "conflict") return "conflict";
    if (state === "missing") return "missing";
    return "io-error";
  }
  // 采用磁盘版本("使用磁盘版本(放弃草稿)")。必须:
  // 1) 捕获 adoptRemote 的抛错(会话忙时它会抛),否则弹窗卡住且用户毫无提示;
  // 2) 真的删掉被放弃的草稿,否则下次打开会作为冲突复活(审计 round4 BUG 8)。
  async adoptDiskFor(v) {
    if (!v.file || !v.session) {
      new import_obsidian13.Notice(this.t("panelNoActiveHtml"));
      return false;
    }
    const disk = await this.readOrNull(v.file);
    if (disk === null) {
      new import_obsidian13.Notice(this.t("conflictDiskMissing"), 8e3);
      return false;
    }
    try {
      v.session.adoptRemote(disk);
    } catch (e) {
      new import_obsidian13.Notice(e instanceof Error ? e.message : String(e), 7e3);
      return false;
    }
    await this.drafts.clearDraft(v.file.path, v.session).catch(() => {
    });
    v.renderFrame(true);
    this.refreshPanels();
    new import_obsidian13.Notice(this.t("statusClean"));
    return true;
  }
  // 读不到文件一律归一为 null:mock 与某些适配器会返回 undefined 而不是抛错,
  // 直接与 null 比较会让"文件缺失"分支失效。
  async readOrNull(file) {
    const raw = await this.app.vault.read(file).catch(() => null);
    return raw === void 0 ? null : raw;
  }
  adoptRemote() {
    const v = this.activeHtmlView();
    if (!v) return;
    void this.adoptDiskFor(v);
  }
  async migrateV1Drafts(legacy) {
    let result;
    try {
      result = migrateLegacyDrafts({ drafts: legacy }, getDeviceId(), Date.now());
    } catch (e) {
      console.error("v1 \u8FC1\u79FB\u89E3\u6790\u5931\u8D25", e);
      return;
    }
    for (const record of result.records) {
      try {
        await this.drafts.storeRef.saveDraft(record);
      } catch {
      }
    }
    if (result.manual.length) new import_obsidian13.Notice(this.t("noticeDraftRestoredConflict"));
  }
  buildPluginData() {
    const retained = this.retainedUnknown;
    return { settings: { ...this.settings }, retained, nav: this.nav.toJSON(this.settings.preview.positionLimit), migratedV1: true };
  }
};
function blobWorkerTransport(src) {
  return () => {
    const blob = new Blob([src], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const w = new Worker(url);
    let onMsg = () => {
    };
    w.onmessage = (e) => onMsg(e.data);
    return {
      post: (msg) => w.postMessage(msg),
      terminate: () => {
        w.terminate();
        URL.revokeObjectURL(url);
      },
      onMessage: (cb) => {
        onMsg = cb;
      }
    };
  };
}

/* nosourcemap */