"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => HtmlViewerPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian2 = require("obsidian");

// src/htmlview.ts
var import_obsidian = require("obsidian");
var HTML_VIEW_TYPE = "html-viewer";
var ERUDA_CDN = "https://cdn.jsdelivr.net/npm/eruda";
var BRIDGE_SCRIPT = `
<script>
(function() {
  if (window.parent && window.parent.__obsidianFetch) {
    var _origFetch = window.fetch;
    window.fetch = function(url, opts) {
      if (typeof url === 'string' && /^https?:\\/\\//.test(url)) {
        return window.parent.__obsidianFetch(url, opts);
      }
      return _origFetch.apply(this, arguments);
    };
  }
  window.addEventListener('message', function(e) {
    if (e.data === '__eruda_show' && window.eruda) eruda.show();
    if (e.data === '__eruda_hide' && window.eruda) eruda.hide();
    if (e.data === '__eruda_toggle' && window.eruda) { eruda._isShow ? eruda.hide() : eruda.show(); }
  });
})();
</script>`;
var arrayBufferToBase64 = (buf) => {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
};
var HtmlView = class extends import_obsidian.FileView {
  constructor(leaf) {
    super(leaf);
    this._editing = false;
    this._fontSize = 14;
    this._wrap = false;
    this._devtools = false;
  }
  getViewType() {
    return HTML_VIEW_TYPE;
  }
  getDisplayText() {
    return this.file ? this.file.basename : "HTML Viewer";
  }
  getIcon() {
    return "code";
  }
  canAcceptExtension(ext) {
    return ext === "html" || ext === "htm";
  }
  async onLoadFile(file) {
    const v = this;
    const c = v.contentEl;
    c.empty();
    c.addClass("html-viewer");
    v._editing = false;
    v.iframeContainer = c.createDiv({ cls: "html-viewer-iframe-container" });
    window.__obsidianFetch = async (url, opts) => {
      try {
        const method = (opts?.method || "GET").toUpperCase();
        const reqHeaders = { ...opts?.headers || {} };
        const isMobile = window.app?.isMobile || false;
        if (isMobile && reqHeaders["Cookie"]) {
          delete reqHeaders["Cookie"];
        }
        const r = await (0, import_obsidian.requestUrl)({ url, method, headers: reqHeaders, body: opts?.body || void 0, throw: false });
        const hdrs = { ...r.headers || {} };
        const sc = hdrs["set-cookie"] || hdrs["Set-Cookie"];
        if (sc) hdrs["x-set-cookie"] = sc;
        return new Response(r.text, { status: r.status, headers: hdrs });
      } catch (e) {
        return new Response(e.message || "Fetch error", { status: 500 });
      }
    };
    window.__obsidianSaveAndOpen = async (filename, content) => {
      try {
        const dir = v.file ? v.file.path.split("/").slice(0, -1).join("/") : "";
        const filePath = dir ? dir + "/" + filename : filename;
        await v.app.vault.adapter.write(filePath, content);
        const abstractFile = v.app.vault.getAbstractFileByPath(filePath);
        if (abstractFile) {
          v.app.openWithDefaultApp(filePath);
        }
        return { success: true, path: filePath };
      } catch (e) {
        return { success: false, error: e.message };
      }
    };
    await v.renderHtml();
  }
  async toggleSource() {
    if (this._editing) {
      this._editing = false;
      this.editBtn.textContent = "\u270E";
      this.editBtn.title = "View source";
      await this.renderHtml();
    } else {
      this._editing = true;
      this.editBtn.textContent = "\u25B6";
      this.editBtn.title = "Preview";
      await this.renderSource();
    }
  }
  toggleDevTools() {
    this._devtools = !this._devtools;
    const iframe = this.iframeContainer.querySelector("iframe");
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(this._devtools ? "__eruda_show" : "__eruda_hide", "*");
    }
  }
  async renderSource() {
    const v = this;
    v.iframeContainer.empty();
    if (!v.file) return;
    const content = await v.app.vault.adapter.read(v.file.path);
    const srcBar = v.iframeContainer.createDiv({ cls: "html-viewer-source-toolbar" });
    const wrapBtn = srcBar.createEl("button", { text: v._wrap ? "Wrap: On" : "Wrap: Off" });
    const sizeLabel = srcBar.createEl("span", { text: v._fontSize + "px", cls: "html-viewer-source-size-label" });
    const minusBtn = srcBar.createEl("button", { text: "A\u2212" });
    const plusBtn = srcBar.createEl("button", { text: "A+" });
    const wrapper = v.iframeContainer.createDiv({ cls: "html-viewer-source-view" });
    wrapper.style.cssText = "width:100%;height:100%;overflow:auto;padding:8px;box-sizing:border-box;";
    const md = "```html\n" + content + "\n```";
    await import_obsidian.MarkdownRenderer.render(v.app, md, wrapper, v.file.path, v);
    const applyStyles = () => {
      const pre = wrapper.querySelector("pre");
      const code = wrapper.querySelector("code");
      if (pre) pre.style.cssText = "white-space:" + (v._wrap ? "pre-wrap" : "pre") + "!important;font-size:" + v._fontSize + "px!important;overflow-x:" + (v._wrap ? "hidden" : "auto") + "!important;";
      if (code) code.style.cssText = "white-space:" + (v._wrap ? "pre-wrap" : "pre") + "!important;font-size:" + v._fontSize + "px!important;";
      sizeLabel.textContent = v._fontSize + "px";
      wrapBtn.textContent = v._wrap ? "Wrap: On" : "Wrap: Off";
    };
    applyStyles();
    wrapBtn.addEventListener("click", () => {
      v._wrap = !v._wrap;
      applyStyles();
    });
    minusBtn.addEventListener("click", () => {
      if (v._fontSize > 8) {
        v._fontSize--;
        applyStyles();
      }
    });
    plusBtn.addEventListener("click", () => {
      if (v._fontSize < 32) {
        v._fontSize++;
        applyStyles();
      }
    });
  }
  async renderHtml() {
    const v = this;
    v.iframeContainer.empty();
    if (!v.file) return;
    try {
      let html = await v.app.vault.adapter.read(v.file.path);
      const dir = v.file.path.split("/").slice(0, -1).join("/");
      html = await v.inlineAssets(html, dir);
      const erudaScript = `<style>.eruda-entry-btn{display:none!important;}</style><script src="${ERUDA_CDN}"></script><script>eruda.init({ tool: ['console', 'elements', 'network', 'resources', 'info'] });eruda.hide();</script>`;
      let injected;
      if (/<\/body>/i.test(html)) {
        injected = html.replace(/<\/body>/i, erudaScript + "$&");
      } else {
        injected = html + erudaScript;
      }
      if (/<head[^>]*>/i.test(injected)) {
        injected = injected.replace(/<head[^>]*>/i, "$&" + BRIDGE_SCRIPT);
      } else if (/<html[^>]*>/i.test(injected)) {
        injected = injected.replace(/<html[^>]*>/i, "$&<head>" + BRIDGE_SCRIPT + "</head>");
      } else {
        injected = BRIDGE_SCRIPT + injected;
      }
      const iframe = v.iframeContainer.createEl("iframe", {
        cls: "html-viewer-frame",
        attr: { sandbox: "allow-scripts allow-same-origin allow-forms allow-modals allow-popups", srcdoc: injected }
      });
      iframe.style.cssText = "width:100%;height:100%;border:none;background:#fff;";
      v._devtools = false;
    } catch (e) {
      v.iframeContainer.createEl("p", { text: "Error loading HTML: " + (e.message || e), cls: "html-viewer-error" });
    }
  }
  async inlineAssets(html, dir) {
    const v = this;
    const resolve = (rel) => dir ? dir + "/" + rel : rel;
    const linkRe = /<link\s+[^>]*href=["']([^"']+)["'][^>]*>/gi;
    let lm;
    const linkReplacements = [];
    while ((lm = linkRe.exec(html)) !== null) {
      if (!/rel=["']stylesheet["']/i.test(lm[0])) continue;
      const href = lm[1];
      if (/^https?:\/\//i.test(href)) continue;
      try {
        const css = await v.app.vault.adapter.read(resolve(href));
        linkReplacements.push({ match: lm[0], replacement: "<style>/* " + href + " */\n" + css + "\n</style>" });
      } catch (_) {
      }
    }
    for (const lr of linkReplacements) html = html.replace(lr.match, lr.replacement);
    const scriptRe = /<script\s+[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi;
    let sm;
    const scriptReplacements = [];
    while ((sm = scriptRe.exec(html)) !== null) {
      const src = sm[1];
      if (/^https?:\/\//i.test(src)) continue;
      try {
        const js = await v.app.vault.adapter.read(resolve(src));
        scriptReplacements.push({ match: sm[0], replacement: "<script>/* " + src + " */\n" + js + "\n</script>" });
      } catch (_) {
      }
    }
    for (const sr of scriptReplacements) html = html.replace(sr.match, sr.replacement);
    const imgRe = /<img\s+[^>]*src=["']([^"']+)["'][^>]*/gi;
    let im;
    const imgReplacements = [];
    while ((im = imgRe.exec(html)) !== null) {
      const imgSrc = im[1];
      if (/^(https?:\/\/|data:)/i.test(imgSrc)) continue;
      try {
        const imgData = await v.app.vault.adapter.readBinary(resolve(imgSrc));
        const ext = imgSrc.split(".").pop().toLowerCase();
        const mime = ext === "svg" ? "image/svg+xml" : ext === "png" ? "image/png" : ext === "gif" ? "image/gif" : ext === "webp" ? "image/webp" : "image/jpeg";
        imgReplacements.push({ from: imgSrc, to: "data:" + mime + ";base64," + arrayBufferToBase64(imgData) });
      } catch (_) {
      }
    }
    for (const ir of imgReplacements) html = html.split(ir.from).join(ir.to);
    return html;
  }
  async openInBrowser() {
    if (!this.file) return;
    const basePath = this.app.vault.adapter.basePath || this.app.vault.adapter.getBasePath?.() || "";
    window.open("file:///" + (basePath + "/" + this.file.path).replace(/\\/g, "/"));
  }
  async onUnloadFile() {
    this.contentEl.empty();
    delete window.__obsidianFetch;
  }
  onClose() {
    this.contentEl.empty();
    delete window.__obsidianFetch;
    return Promise.resolve();
  }
};

// src/main.ts
var HtmlViewerPlugin = class extends import_obsidian2.Plugin {
  async onload() {
    this.registerView(HTML_VIEW_TYPE, (leaf) => new HtmlView(leaf));
    try {
      this.registerExtensions(["html", "htm"], HTML_VIEW_TYPE);
    } catch (_) {
      console.log("HTML Viewer: .html extension already registered, skipping.");
    }
  }
};

/* nosourcemap */