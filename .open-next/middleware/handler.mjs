
import {Buffer} from "node:buffer";
globalThis.Buffer = Buffer;

import {AsyncLocalStorage} from "node:async_hooks";
globalThis.AsyncLocalStorage = AsyncLocalStorage;


const defaultDefineProperty = Object.defineProperty;
Object.defineProperty = function(o, p, a) {
  if(p=== '__import_unsupported' && Boolean(globalThis.__import_unsupported)) {
    return;
  }
  return defaultDefineProperty(o, p, a);
};

  
  
  globalThis.openNextDebug = false;globalThis.openNextVersion = "3.9.15";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
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
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/@opennextjs/aws/dist/utils/error.js
function isOpenNextError(e) {
  try {
    return "__openNextInternal" in e;
  } catch {
    return false;
  }
}
var init_error = __esm({
  "node_modules/@opennextjs/aws/dist/utils/error.js"() {
  }
});

// node_modules/@opennextjs/aws/dist/adapters/logger.js
function debug(...args) {
  if (globalThis.openNextDebug) {
    console.log(...args);
  }
}
function warn(...args) {
  console.warn(...args);
}
function error(...args) {
  if (args.some((arg) => isDownplayedErrorLog(arg))) {
    return debug(...args);
  }
  if (args.some((arg) => isOpenNextError(arg))) {
    const error2 = args.find((arg) => isOpenNextError(arg));
    if (error2.logLevel < getOpenNextErrorLogLevel()) {
      return;
    }
    if (error2.logLevel === 0) {
      return console.log(...args.map((arg) => isOpenNextError(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    if (error2.logLevel === 1) {
      return warn(...args.map((arg) => isOpenNextError(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    return console.error(...args);
  }
  console.error(...args);
}
function getOpenNextErrorLogLevel() {
  const strLevel = process.env.OPEN_NEXT_ERROR_LOG_LEVEL ?? "1";
  switch (strLevel.toLowerCase()) {
    case "debug":
    case "0":
      return 0;
    case "error":
    case "2":
      return 2;
    default:
      return 1;
  }
}
var DOWNPLAYED_ERROR_LOGS, isDownplayedErrorLog;
var init_logger = __esm({
  "node_modules/@opennextjs/aws/dist/adapters/logger.js"() {
    init_error();
    DOWNPLAYED_ERROR_LOGS = [
      {
        clientName: "S3Client",
        commandName: "GetObjectCommand",
        errorName: "NoSuchKey"
      }
    ];
    isDownplayedErrorLog = (errorLog) => DOWNPLAYED_ERROR_LOGS.some((downplayedInput) => downplayedInput.clientName === errorLog?.clientName && downplayedInput.commandName === errorLog?.commandName && (downplayedInput.errorName === errorLog?.error?.name || downplayedInput.errorName === errorLog?.error?.Code));
  }
});

// node_modules/cookie/dist/index.js
var require_dist = __commonJS({
  "node_modules/cookie/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseCookie = parseCookie;
    exports.parse = parseCookie;
    exports.stringifyCookie = stringifyCookie;
    exports.stringifySetCookie = stringifySetCookie;
    exports.serialize = stringifySetCookie;
    exports.parseSetCookie = parseSetCookie;
    exports.stringifySetCookie = stringifySetCookie;
    exports.serialize = stringifySetCookie;
    var cookieNameRegExp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;
    var cookieValueRegExp = /^[\u0021-\u003A\u003C-\u007E]*$/;
    var domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
    var pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
    var maxAgeRegExp = /^-?\d+$/;
    var __toString = Object.prototype.toString;
    var NullObject = /* @__PURE__ */ (() => {
      const C = function() {
      };
      C.prototype = /* @__PURE__ */ Object.create(null);
      return C;
    })();
    function parseCookie(str, options) {
      const obj = new NullObject();
      const len = str.length;
      if (len < 2)
        return obj;
      const dec = options?.decode || decode;
      let index = 0;
      do {
        const eqIdx = eqIndex(str, index, len);
        if (eqIdx === -1)
          break;
        const endIdx = endIndex(str, index, len);
        if (eqIdx > endIdx) {
          index = str.lastIndexOf(";", eqIdx - 1) + 1;
          continue;
        }
        const key = valueSlice(str, index, eqIdx);
        if (obj[key] === void 0) {
          obj[key] = dec(valueSlice(str, eqIdx + 1, endIdx));
        }
        index = endIdx + 1;
      } while (index < len);
      return obj;
    }
    function stringifyCookie(cookie, options) {
      const enc = options?.encode || encodeURIComponent;
      const cookieStrings = [];
      for (const name of Object.keys(cookie)) {
        const val = cookie[name];
        if (val === void 0)
          continue;
        if (!cookieNameRegExp.test(name)) {
          throw new TypeError(`cookie name is invalid: ${name}`);
        }
        const value = enc(val);
        if (!cookieValueRegExp.test(value)) {
          throw new TypeError(`cookie val is invalid: ${val}`);
        }
        cookieStrings.push(`${name}=${value}`);
      }
      return cookieStrings.join("; ");
    }
    function stringifySetCookie(_name, _val, _opts) {
      const cookie = typeof _name === "object" ? _name : { ..._opts, name: _name, value: String(_val) };
      const options = typeof _val === "object" ? _val : _opts;
      const enc = options?.encode || encodeURIComponent;
      if (!cookieNameRegExp.test(cookie.name)) {
        throw new TypeError(`argument name is invalid: ${cookie.name}`);
      }
      const value = cookie.value ? enc(cookie.value) : "";
      if (!cookieValueRegExp.test(value)) {
        throw new TypeError(`argument val is invalid: ${cookie.value}`);
      }
      let str = cookie.name + "=" + value;
      if (cookie.maxAge !== void 0) {
        if (!Number.isInteger(cookie.maxAge)) {
          throw new TypeError(`option maxAge is invalid: ${cookie.maxAge}`);
        }
        str += "; Max-Age=" + cookie.maxAge;
      }
      if (cookie.domain) {
        if (!domainValueRegExp.test(cookie.domain)) {
          throw new TypeError(`option domain is invalid: ${cookie.domain}`);
        }
        str += "; Domain=" + cookie.domain;
      }
      if (cookie.path) {
        if (!pathValueRegExp.test(cookie.path)) {
          throw new TypeError(`option path is invalid: ${cookie.path}`);
        }
        str += "; Path=" + cookie.path;
      }
      if (cookie.expires) {
        if (!isDate(cookie.expires) || !Number.isFinite(cookie.expires.valueOf())) {
          throw new TypeError(`option expires is invalid: ${cookie.expires}`);
        }
        str += "; Expires=" + cookie.expires.toUTCString();
      }
      if (cookie.httpOnly) {
        str += "; HttpOnly";
      }
      if (cookie.secure) {
        str += "; Secure";
      }
      if (cookie.partitioned) {
        str += "; Partitioned";
      }
      if (cookie.priority) {
        const priority = typeof cookie.priority === "string" ? cookie.priority.toLowerCase() : void 0;
        switch (priority) {
          case "low":
            str += "; Priority=Low";
            break;
          case "medium":
            str += "; Priority=Medium";
            break;
          case "high":
            str += "; Priority=High";
            break;
          default:
            throw new TypeError(`option priority is invalid: ${cookie.priority}`);
        }
      }
      if (cookie.sameSite) {
        const sameSite = typeof cookie.sameSite === "string" ? cookie.sameSite.toLowerCase() : cookie.sameSite;
        switch (sameSite) {
          case true:
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError(`option sameSite is invalid: ${cookie.sameSite}`);
        }
      }
      return str;
    }
    function parseSetCookie(str, options) {
      const dec = options?.decode || decode;
      const len = str.length;
      const endIdx = endIndex(str, 0, len);
      const eqIdx = eqIndex(str, 0, endIdx);
      const setCookie = eqIdx === -1 ? { name: "", value: dec(valueSlice(str, 0, endIdx)) } : {
        name: valueSlice(str, 0, eqIdx),
        value: dec(valueSlice(str, eqIdx + 1, endIdx))
      };
      let index = endIdx + 1;
      while (index < len) {
        const endIdx2 = endIndex(str, index, len);
        const eqIdx2 = eqIndex(str, index, endIdx2);
        const attr = eqIdx2 === -1 ? valueSlice(str, index, endIdx2) : valueSlice(str, index, eqIdx2);
        const val = eqIdx2 === -1 ? void 0 : valueSlice(str, eqIdx2 + 1, endIdx2);
        switch (attr.toLowerCase()) {
          case "httponly":
            setCookie.httpOnly = true;
            break;
          case "secure":
            setCookie.secure = true;
            break;
          case "partitioned":
            setCookie.partitioned = true;
            break;
          case "domain":
            setCookie.domain = val;
            break;
          case "path":
            setCookie.path = val;
            break;
          case "max-age":
            if (val && maxAgeRegExp.test(val))
              setCookie.maxAge = Number(val);
            break;
          case "expires":
            if (!val)
              break;
            const date = new Date(val);
            if (Number.isFinite(date.valueOf()))
              setCookie.expires = date;
            break;
          case "priority":
            if (!val)
              break;
            const priority = val.toLowerCase();
            if (priority === "low" || priority === "medium" || priority === "high") {
              setCookie.priority = priority;
            }
            break;
          case "samesite":
            if (!val)
              break;
            const sameSite = val.toLowerCase();
            if (sameSite === "lax" || sameSite === "strict" || sameSite === "none") {
              setCookie.sameSite = sameSite;
            }
            break;
        }
        index = endIdx2 + 1;
      }
      return setCookie;
    }
    function endIndex(str, min, len) {
      const index = str.indexOf(";", min);
      return index === -1 ? len : index;
    }
    function eqIndex(str, min, max) {
      const index = str.indexOf("=", min);
      return index < max ? index : -1;
    }
    function valueSlice(str, min, max) {
      let start = min;
      let end = max;
      do {
        const code = str.charCodeAt(start);
        if (code !== 32 && code !== 9)
          break;
      } while (++start < end);
      while (end > start) {
        const code = str.charCodeAt(end - 1);
        if (code !== 32 && code !== 9)
          break;
        end--;
      }
      return str.slice(start, end);
    }
    function decode(str) {
      if (str.indexOf("%") === -1)
        return str;
      try {
        return decodeURIComponent(str);
      } catch (e) {
        return str;
      }
    }
    function isDate(val) {
      return __toString.call(val) === "[object Date]";
    }
  }
});

// node_modules/@opennextjs/aws/dist/http/util.js
function parseSetCookieHeader(cookies) {
  if (!cookies) {
    return [];
  }
  if (typeof cookies === "string") {
    return cookies.split(/(?<!Expires=\w+),/i).map((c) => c.trim());
  }
  return cookies;
}
function getQueryFromIterator(it) {
  const query = {};
  for (const [key, value] of it) {
    if (key in query) {
      if (Array.isArray(query[key])) {
        query[key].push(value);
      } else {
        query[key] = [query[key], value];
      }
    } else {
      query[key] = value;
    }
  }
  return query;
}
var init_util = __esm({
  "node_modules/@opennextjs/aws/dist/http/util.js"() {
    init_logger();
  }
});

// node_modules/@opennextjs/aws/dist/overrides/converters/utils.js
function getQueryFromSearchParams(searchParams) {
  return getQueryFromIterator(searchParams.entries());
}
var init_utils = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/converters/utils.js"() {
    init_util();
  }
});

// node_modules/@opennextjs/aws/dist/overrides/converters/edge.js
var edge_exports = {};
__export(edge_exports, {
  default: () => edge_default
});
import { Buffer as Buffer2 } from "node:buffer";
var import_cookie, NULL_BODY_STATUSES, converter, edge_default;
var init_edge = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/converters/edge.js"() {
    import_cookie = __toESM(require_dist(), 1);
    init_util();
    init_utils();
    NULL_BODY_STATUSES = /* @__PURE__ */ new Set([101, 103, 204, 205, 304]);
    converter = {
      convertFrom: async (event) => {
        const url = new URL(event.url);
        const searchParams = url.searchParams;
        const query = getQueryFromSearchParams(searchParams);
        const headers = {};
        event.headers.forEach((value, key) => {
          headers[key] = value;
        });
        const rawPath = url.pathname;
        const method = event.method;
        const shouldHaveBody = method !== "GET" && method !== "HEAD";
        const body = shouldHaveBody ? Buffer2.from(await event.arrayBuffer()) : void 0;
        const cookieHeader = event.headers.get("cookie");
        const cookies = cookieHeader ? import_cookie.default.parse(cookieHeader) : {};
        return {
          type: "core",
          method,
          rawPath,
          url: event.url,
          body,
          headers,
          remoteAddress: event.headers.get("x-forwarded-for") ?? "::1",
          query,
          cookies
        };
      },
      convertTo: async (result) => {
        if ("internalEvent" in result) {
          const request = new Request(result.internalEvent.url, {
            body: result.internalEvent.body,
            method: result.internalEvent.method,
            headers: {
              ...result.internalEvent.headers,
              "x-forwarded-host": result.internalEvent.headers.host
            }
          });
          if (globalThis.__dangerous_ON_edge_converter_returns_request === true) {
            return request;
          }
          const cfCache = (result.isISR || result.internalEvent.rawPath.startsWith("/_next/image")) && process.env.DISABLE_CACHE !== "true" ? { cacheEverything: true } : {};
          return fetch(request, {
            // This is a hack to make sure that the response is cached by Cloudflare
            // See https://developers.cloudflare.com/workers/examples/cache-using-fetch/#caching-html-resources
            // @ts-expect-error - This is a Cloudflare specific option
            cf: cfCache
          });
        }
        const headers = new Headers();
        for (const [key, value] of Object.entries(result.headers)) {
          if (key === "set-cookie" && typeof value === "string") {
            const cookies = parseSetCookieHeader(value);
            for (const cookie of cookies) {
              headers.append(key, cookie);
            }
            continue;
          }
          if (Array.isArray(value)) {
            for (const v of value) {
              headers.append(key, v);
            }
          } else {
            headers.set(key, value);
          }
        }
        const body = NULL_BODY_STATUSES.has(result.statusCode) ? null : result.body;
        return new Response(body, {
          status: result.statusCode,
          headers
        });
      },
      name: "edge"
    };
    edge_default = converter;
  }
});

// node_modules/@opennextjs/aws/dist/overrides/wrappers/cloudflare-edge.js
var cloudflare_edge_exports = {};
__export(cloudflare_edge_exports, {
  default: () => cloudflare_edge_default
});
var cfPropNameMapping, handler, cloudflare_edge_default;
var init_cloudflare_edge = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/wrappers/cloudflare-edge.js"() {
    cfPropNameMapping = {
      // The city name is percent-encoded.
      // See https://github.com/vercel/vercel/blob/4cb6143/packages/functions/src/headers.ts#L94C19-L94C37
      city: [encodeURIComponent, "x-open-next-city"],
      country: "x-open-next-country",
      regionCode: "x-open-next-region",
      latitude: "x-open-next-latitude",
      longitude: "x-open-next-longitude"
    };
    handler = async (handler3, converter2) => async (request, env, ctx) => {
      globalThis.process = process;
      for (const [key, value] of Object.entries(env)) {
        if (typeof value === "string") {
          process.env[key] = value;
        }
      }
      const internalEvent = await converter2.convertFrom(request);
      const cfProperties = request.cf;
      for (const [propName, mapping] of Object.entries(cfPropNameMapping)) {
        const propValue = cfProperties?.[propName];
        if (propValue != null) {
          const [encode, headerName] = Array.isArray(mapping) ? mapping : [null, mapping];
          internalEvent.headers[headerName] = encode ? encode(propValue) : propValue;
        }
      }
      const response = await handler3(internalEvent, {
        waitUntil: ctx.waitUntil.bind(ctx)
      });
      const result = await converter2.convertTo(response);
      return result;
    };
    cloudflare_edge_default = {
      wrapper: handler,
      name: "cloudflare-edge",
      supportStreaming: true,
      edgeRuntime: true
    };
  }
});

// node_modules/@opennextjs/aws/dist/overrides/originResolver/pattern-env.js
var pattern_env_exports = {};
__export(pattern_env_exports, {
  default: () => pattern_env_default
});
function initializeOnce() {
  if (initialized)
    return;
  cachedOrigins = JSON.parse(process.env.OPEN_NEXT_ORIGIN ?? "{}");
  const functions = globalThis.openNextConfig.functions ?? {};
  for (const key in functions) {
    if (key !== "default") {
      const value = functions[key];
      const regexes = [];
      for (const pattern of value.patterns) {
        const regexPattern = `/${pattern.replace(/\*\*/g, "(.*)").replace(/\*/g, "([^/]*)").replace(/\//g, "\\/").replace(/\?/g, ".")}`;
        regexes.push(new RegExp(regexPattern));
      }
      cachedPatterns.push({
        key,
        patterns: value.patterns,
        regexes
      });
    }
  }
  initialized = true;
}
var cachedOrigins, cachedPatterns, initialized, envLoader, pattern_env_default;
var init_pattern_env = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/originResolver/pattern-env.js"() {
    init_logger();
    cachedPatterns = [];
    initialized = false;
    envLoader = {
      name: "env",
      resolve: async (_path) => {
        try {
          initializeOnce();
          for (const { key, patterns, regexes } of cachedPatterns) {
            for (const regex of regexes) {
              if (regex.test(_path)) {
                debug("Using origin", key, patterns);
                return cachedOrigins[key];
              }
            }
          }
          if (_path.startsWith("/_next/image") && cachedOrigins.imageOptimizer) {
            debug("Using origin", "imageOptimizer", _path);
            return cachedOrigins.imageOptimizer;
          }
          if (cachedOrigins.default) {
            debug("Using default origin", cachedOrigins.default, _path);
            return cachedOrigins.default;
          }
          return false;
        } catch (e) {
          error("Error while resolving origin", e);
          return false;
        }
      }
    };
    pattern_env_default = envLoader;
  }
});

// node_modules/@opennextjs/aws/dist/overrides/assetResolver/dummy.js
var dummy_exports = {};
__export(dummy_exports, {
  default: () => dummy_default
});
var resolver, dummy_default;
var init_dummy = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/assetResolver/dummy.js"() {
    resolver = {
      name: "dummy"
    };
    dummy_default = resolver;
  }
});

// node_modules/@opennextjs/aws/dist/utils/stream.js
import { ReadableStream } from "node:stream/web";
function toReadableStream(value, isBase64) {
  return new ReadableStream({
    pull(controller) {
      controller.enqueue(Buffer.from(value, isBase64 ? "base64" : "utf8"));
      controller.close();
    }
  }, { highWaterMark: 0 });
}
function emptyReadableStream() {
  if (process.env.OPEN_NEXT_FORCE_NON_EMPTY_RESPONSE === "true") {
    return new ReadableStream({
      pull(controller) {
        maybeSomethingBuffer ??= Buffer.from("SOMETHING");
        controller.enqueue(maybeSomethingBuffer);
        controller.close();
      }
    }, { highWaterMark: 0 });
  }
  return new ReadableStream({
    start(controller) {
      controller.close();
    }
  });
}
var maybeSomethingBuffer;
var init_stream = __esm({
  "node_modules/@opennextjs/aws/dist/utils/stream.js"() {
  }
});

// node_modules/@opennextjs/aws/dist/overrides/proxyExternalRequest/fetch.js
var fetch_exports = {};
__export(fetch_exports, {
  default: () => fetch_default
});
var fetchProxy, fetch_default;
var init_fetch = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/proxyExternalRequest/fetch.js"() {
    init_stream();
    fetchProxy = {
      name: "fetch-proxy",
      // @ts-ignore
      proxy: async (internalEvent) => {
        const { url, headers: eventHeaders, method, body } = internalEvent;
        const headers = Object.fromEntries(Object.entries(eventHeaders).filter(([key]) => key.toLowerCase() !== "cf-connecting-ip"));
        const response = await fetch(url, {
          method,
          headers,
          body
        });
        const responseHeaders = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });
        return {
          type: "core",
          headers: responseHeaders,
          statusCode: response.status,
          isBase64Encoded: true,
          body: response.body ?? emptyReadableStream()
        };
      }
    };
    fetch_default = fetchProxy;
  }
});

// .next/server/edge/chunks/node_modules_next_dist_esm_build_templates_edge-wrapper_78fa9d6a.js
var require_node_modules_next_dist_esm_build_templates_edge_wrapper_78fa9d6a = __commonJS({
  ".next/server/edge/chunks/node_modules_next_dist_esm_build_templates_edge-wrapper_78fa9d6a.js"() {
    "use strict";
    (globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/node_modules_next_dist_esm_build_templates_edge-wrapper_78fa9d6a.js", 6319, (e, t, l) => {
      self._ENTRIES ||= {};
      let n = Promise.resolve().then(() => e.i(58217));
      n.catch(() => {
      }), self._ENTRIES.middleware_middleware = new Proxy(n, { get(e2, t2) {
        if ("then" === t2) return (t3, l3) => e2.then(t3, l3);
        let l2 = (...l3) => e2.then((e3) => (0, e3[t2])(...l3));
        return l2.then = (l3, n2) => e2.then((e3) => e3[t2]).then(l3, n2), l2;
      } });
    }]);
  }
});

// node-built-in-modules:node:buffer
var node_buffer_exports = {};
import * as node_buffer_star from "node:buffer";
var init_node_buffer = __esm({
  "node-built-in-modules:node:buffer"() {
    __reExport(node_buffer_exports, node_buffer_star);
  }
});

// node-built-in-modules:node:async_hooks
var node_async_hooks_exports = {};
import * as node_async_hooks_star from "node:async_hooks";
var init_node_async_hooks = __esm({
  "node-built-in-modules:node:async_hooks"() {
    __reExport(node_async_hooks_exports, node_async_hooks_star);
  }
});

// .next/server/edge/chunks/[root-of-the-server]__c6dd1739._.js
var require_root_of_the_server_c6dd1739 = __commonJS({
  ".next/server/edge/chunks/[root-of-the-server]__c6dd1739._.js"() {
    "use strict";
    (globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__c6dd1739._.js", 28042, (e, t, r) => {
      "use strict";
      var n = Object.defineProperty, i = Object.getOwnPropertyDescriptor, a = Object.getOwnPropertyNames, o = Object.prototype.hasOwnProperty, s = {}, c = { RequestCookies: () => g, ResponseCookies: () => m, parseCookie: () => d, parseSetCookie: () => p, stringifyCookie: () => u };
      for (var l in c) n(s, l, { get: c[l], enumerable: true });
      function u(e2) {
        var t2;
        let r2 = ["path" in e2 && e2.path && `Path=${e2.path}`, "expires" in e2 && (e2.expires || 0 === e2.expires) && `Expires=${("number" == typeof e2.expires ? new Date(e2.expires) : e2.expires).toUTCString()}`, "maxAge" in e2 && "number" == typeof e2.maxAge && `Max-Age=${e2.maxAge}`, "domain" in e2 && e2.domain && `Domain=${e2.domain}`, "secure" in e2 && e2.secure && "Secure", "httpOnly" in e2 && e2.httpOnly && "HttpOnly", "sameSite" in e2 && e2.sameSite && `SameSite=${e2.sameSite}`, "partitioned" in e2 && e2.partitioned && "Partitioned", "priority" in e2 && e2.priority && `Priority=${e2.priority}`].filter(Boolean), n2 = `${e2.name}=${encodeURIComponent(null != (t2 = e2.value) ? t2 : "")}`;
        return 0 === r2.length ? n2 : `${n2}; ${r2.join("; ")}`;
      }
      function d(e2) {
        let t2 = /* @__PURE__ */ new Map();
        for (let r2 of e2.split(/; */)) {
          if (!r2) continue;
          let e3 = r2.indexOf("=");
          if (-1 === e3) {
            t2.set(r2, "true");
            continue;
          }
          let [n2, i2] = [r2.slice(0, e3), r2.slice(e3 + 1)];
          try {
            t2.set(n2, decodeURIComponent(null != i2 ? i2 : "true"));
          } catch {
          }
        }
        return t2;
      }
      function p(e2) {
        if (!e2) return;
        let [[t2, r2], ...n2] = d(e2), { domain: i2, expires: a2, httponly: o2, maxage: s2, path: c2, samesite: l2, secure: u2, partitioned: p2, priority: g2 } = Object.fromEntries(n2.map(([e3, t3]) => [e3.toLowerCase().replace(/-/g, ""), t3]));
        {
          var m2, y, b = { name: t2, value: decodeURIComponent(r2), domain: i2, ...a2 && { expires: new Date(a2) }, ...o2 && { httpOnly: true }, ..."string" == typeof s2 && { maxAge: Number(s2) }, path: c2, ...l2 && { sameSite: h.includes(m2 = (m2 = l2).toLowerCase()) ? m2 : void 0 }, ...u2 && { secure: true }, ...g2 && { priority: f.includes(y = (y = g2).toLowerCase()) ? y : void 0 }, ...p2 && { partitioned: true } };
          let e3 = {};
          for (let t3 in b) b[t3] && (e3[t3] = b[t3]);
          return e3;
        }
      }
      t.exports = ((e2, t2, r2, s2) => {
        if (t2 && "object" == typeof t2 || "function" == typeof t2) for (let c2 of a(t2)) o.call(e2, c2) || c2 === r2 || n(e2, c2, { get: () => t2[c2], enumerable: !(s2 = i(t2, c2)) || s2.enumerable });
        return e2;
      })(n({}, "__esModule", { value: true }), s);
      var h = ["strict", "lax", "none"], f = ["low", "medium", "high"], g = class {
        constructor(e2) {
          this._parsed = /* @__PURE__ */ new Map(), this._headers = e2;
          const t2 = e2.get("cookie");
          if (t2) for (const [e3, r2] of d(t2)) this._parsed.set(e3, { name: e3, value: r2 });
        }
        [Symbol.iterator]() {
          return this._parsed[Symbol.iterator]();
        }
        get size() {
          return this._parsed.size;
        }
        get(...e2) {
          let t2 = "string" == typeof e2[0] ? e2[0] : e2[0].name;
          return this._parsed.get(t2);
        }
        getAll(...e2) {
          var t2;
          let r2 = Array.from(this._parsed);
          if (!e2.length) return r2.map(([e3, t3]) => t3);
          let n2 = "string" == typeof e2[0] ? e2[0] : null == (t2 = e2[0]) ? void 0 : t2.name;
          return r2.filter(([e3]) => e3 === n2).map(([e3, t3]) => t3);
        }
        has(e2) {
          return this._parsed.has(e2);
        }
        set(...e2) {
          let [t2, r2] = 1 === e2.length ? [e2[0].name, e2[0].value] : e2, n2 = this._parsed;
          return n2.set(t2, { name: t2, value: r2 }), this._headers.set("cookie", Array.from(n2).map(([e3, t3]) => u(t3)).join("; ")), this;
        }
        delete(e2) {
          let t2 = this._parsed, r2 = Array.isArray(e2) ? e2.map((e3) => t2.delete(e3)) : t2.delete(e2);
          return this._headers.set("cookie", Array.from(t2).map(([e3, t3]) => u(t3)).join("; ")), r2;
        }
        clear() {
          return this.delete(Array.from(this._parsed.keys())), this;
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return `RequestCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`;
        }
        toString() {
          return [...this._parsed.values()].map((e2) => `${e2.name}=${encodeURIComponent(e2.value)}`).join("; ");
        }
      }, m = class {
        constructor(e2) {
          var t2, r2, n2;
          this._parsed = /* @__PURE__ */ new Map(), this._headers = e2;
          const i2 = null != (n2 = null != (r2 = null == (t2 = e2.getSetCookie) ? void 0 : t2.call(e2)) ? r2 : e2.get("set-cookie")) ? n2 : [];
          for (const e3 of Array.isArray(i2) ? i2 : function(e4) {
            if (!e4) return [];
            var t3, r3, n3, i3, a2, o2 = [], s2 = 0;
            function c2() {
              for (; s2 < e4.length && /\s/.test(e4.charAt(s2)); ) s2 += 1;
              return s2 < e4.length;
            }
            for (; s2 < e4.length; ) {
              for (t3 = s2, a2 = false; c2(); ) if ("," === (r3 = e4.charAt(s2))) {
                for (n3 = s2, s2 += 1, c2(), i3 = s2; s2 < e4.length && "=" !== (r3 = e4.charAt(s2)) && ";" !== r3 && "," !== r3; ) s2 += 1;
                s2 < e4.length && "=" === e4.charAt(s2) ? (a2 = true, s2 = i3, o2.push(e4.substring(t3, n3)), t3 = s2) : s2 = n3 + 1;
              } else s2 += 1;
              (!a2 || s2 >= e4.length) && o2.push(e4.substring(t3, e4.length));
            }
            return o2;
          }(i2)) {
            const t3 = p(e3);
            t3 && this._parsed.set(t3.name, t3);
          }
        }
        get(...e2) {
          let t2 = "string" == typeof e2[0] ? e2[0] : e2[0].name;
          return this._parsed.get(t2);
        }
        getAll(...e2) {
          var t2;
          let r2 = Array.from(this._parsed.values());
          if (!e2.length) return r2;
          let n2 = "string" == typeof e2[0] ? e2[0] : null == (t2 = e2[0]) ? void 0 : t2.name;
          return r2.filter((e3) => e3.name === n2);
        }
        has(e2) {
          return this._parsed.has(e2);
        }
        set(...e2) {
          let [t2, r2, n2] = 1 === e2.length ? [e2[0].name, e2[0].value, e2[0]] : e2, i2 = this._parsed;
          return i2.set(t2, function(e3 = { name: "", value: "" }) {
            return "number" == typeof e3.expires && (e3.expires = new Date(e3.expires)), e3.maxAge && (e3.expires = new Date(Date.now() + 1e3 * e3.maxAge)), (null === e3.path || void 0 === e3.path) && (e3.path = "/"), e3;
          }({ name: t2, value: r2, ...n2 })), function(e3, t3) {
            for (let [, r3] of (t3.delete("set-cookie"), e3)) {
              let e4 = u(r3);
              t3.append("set-cookie", e4);
            }
          }(i2, this._headers), this;
        }
        delete(...e2) {
          let [t2, r2] = "string" == typeof e2[0] ? [e2[0]] : [e2[0].name, e2[0]];
          return this.set({ ...r2, name: t2, value: "", expires: /* @__PURE__ */ new Date(0) });
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return `ResponseCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`;
        }
        toString() {
          return [...this._parsed.values()].map(u).join("; ");
        }
      };
    }, 90044, (e) => {
      "use strict";
      let t = Object.defineProperty(Error("Invariant: AsyncLocalStorage accessed in runtime where it is not available"), "__NEXT_ERROR_CODE", { value: "E504", enumerable: false, configurable: true });
      class r {
        disable() {
          throw t;
        }
        getStore() {
        }
        run() {
          throw t;
        }
        exit() {
          throw t;
        }
        enterWith() {
          throw t;
        }
        static bind(e2) {
          return e2;
        }
      }
      let n = "u" > typeof globalThis && globalThis.AsyncLocalStorage;
      function i() {
        return n ? new n() : new r();
      }
      function a(e2) {
        return n ? n.bind(e2) : r.bind(e2);
      }
      function o() {
        return n ? n.snapshot() : function(e2, ...t2) {
          return e2(...t2);
        };
      }
      e.s(["bindSnapshot", () => a, "createAsyncLocalStorage", () => i, "createSnapshot", () => o]);
    }, 59110, (e, t, r) => {
      (() => {
        "use strict";
        let r2, n, i, a, o;
        var s, c, l, u, d, p, h, f, g, m, y, b, w, v, _, E, S = { 491: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.ContextAPI = void 0;
          let n2 = r3(223), i2 = r3(172), a2 = r3(930), o2 = "context", s2 = new n2.NoopContextManager();
          class c2 {
            static getInstance() {
              return this._instance || (this._instance = new c2()), this._instance;
            }
            setGlobalContextManager(e3) {
              return (0, i2.registerGlobal)(o2, e3, a2.DiagAPI.instance());
            }
            active() {
              return this._getContextManager().active();
            }
            with(e3, t3, r4, ...n3) {
              return this._getContextManager().with(e3, t3, r4, ...n3);
            }
            bind(e3, t3) {
              return this._getContextManager().bind(e3, t3);
            }
            _getContextManager() {
              return (0, i2.getGlobal)(o2) || s2;
            }
            disable() {
              this._getContextManager().disable(), (0, i2.unregisterGlobal)(o2, a2.DiagAPI.instance());
            }
          }
          t2.ContextAPI = c2;
        }, 930: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.DiagAPI = void 0;
          let n2 = r3(56), i2 = r3(912), a2 = r3(957), o2 = r3(172);
          class s2 {
            constructor() {
              function e3(e4) {
                return function(...t4) {
                  let r4 = (0, o2.getGlobal)("diag");
                  if (r4) return r4[e4](...t4);
                };
              }
              const t3 = this;
              t3.setLogger = (e4, r4 = { logLevel: a2.DiagLogLevel.INFO }) => {
                var n3, s3, c2;
                if (e4 === t3) {
                  let e5 = Error("Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation");
                  return t3.error(null != (n3 = e5.stack) ? n3 : e5.message), false;
                }
                "number" == typeof r4 && (r4 = { logLevel: r4 });
                let l2 = (0, o2.getGlobal)("diag"), u2 = (0, i2.createLogLevelDiagLogger)(null != (s3 = r4.logLevel) ? s3 : a2.DiagLogLevel.INFO, e4);
                if (l2 && !r4.suppressOverrideMessage) {
                  let e5 = null != (c2 = Error().stack) ? c2 : "<failed to generate stacktrace>";
                  l2.warn(`Current logger will be overwritten from ${e5}`), u2.warn(`Current logger will overwrite one already registered from ${e5}`);
                }
                return (0, o2.registerGlobal)("diag", u2, t3, true);
              }, t3.disable = () => {
                (0, o2.unregisterGlobal)("diag", t3);
              }, t3.createComponentLogger = (e4) => new n2.DiagComponentLogger(e4), t3.verbose = e3("verbose"), t3.debug = e3("debug"), t3.info = e3("info"), t3.warn = e3("warn"), t3.error = e3("error");
            }
            static instance() {
              return this._instance || (this._instance = new s2()), this._instance;
            }
          }
          t2.DiagAPI = s2;
        }, 653: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.MetricsAPI = void 0;
          let n2 = r3(660), i2 = r3(172), a2 = r3(930), o2 = "metrics";
          class s2 {
            static getInstance() {
              return this._instance || (this._instance = new s2()), this._instance;
            }
            setGlobalMeterProvider(e3) {
              return (0, i2.registerGlobal)(o2, e3, a2.DiagAPI.instance());
            }
            getMeterProvider() {
              return (0, i2.getGlobal)(o2) || n2.NOOP_METER_PROVIDER;
            }
            getMeter(e3, t3, r4) {
              return this.getMeterProvider().getMeter(e3, t3, r4);
            }
            disable() {
              (0, i2.unregisterGlobal)(o2, a2.DiagAPI.instance());
            }
          }
          t2.MetricsAPI = s2;
        }, 181: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.PropagationAPI = void 0;
          let n2 = r3(172), i2 = r3(874), a2 = r3(194), o2 = r3(277), s2 = r3(369), c2 = r3(930), l2 = "propagation", u2 = new i2.NoopTextMapPropagator();
          class d2 {
            constructor() {
              this.createBaggage = s2.createBaggage, this.getBaggage = o2.getBaggage, this.getActiveBaggage = o2.getActiveBaggage, this.setBaggage = o2.setBaggage, this.deleteBaggage = o2.deleteBaggage;
            }
            static getInstance() {
              return this._instance || (this._instance = new d2()), this._instance;
            }
            setGlobalPropagator(e3) {
              return (0, n2.registerGlobal)(l2, e3, c2.DiagAPI.instance());
            }
            inject(e3, t3, r4 = a2.defaultTextMapSetter) {
              return this._getGlobalPropagator().inject(e3, t3, r4);
            }
            extract(e3, t3, r4 = a2.defaultTextMapGetter) {
              return this._getGlobalPropagator().extract(e3, t3, r4);
            }
            fields() {
              return this._getGlobalPropagator().fields();
            }
            disable() {
              (0, n2.unregisterGlobal)(l2, c2.DiagAPI.instance());
            }
            _getGlobalPropagator() {
              return (0, n2.getGlobal)(l2) || u2;
            }
          }
          t2.PropagationAPI = d2;
        }, 997: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.TraceAPI = void 0;
          let n2 = r3(172), i2 = r3(846), a2 = r3(139), o2 = r3(607), s2 = r3(930), c2 = "trace";
          class l2 {
            constructor() {
              this._proxyTracerProvider = new i2.ProxyTracerProvider(), this.wrapSpanContext = a2.wrapSpanContext, this.isSpanContextValid = a2.isSpanContextValid, this.deleteSpan = o2.deleteSpan, this.getSpan = o2.getSpan, this.getActiveSpan = o2.getActiveSpan, this.getSpanContext = o2.getSpanContext, this.setSpan = o2.setSpan, this.setSpanContext = o2.setSpanContext;
            }
            static getInstance() {
              return this._instance || (this._instance = new l2()), this._instance;
            }
            setGlobalTracerProvider(e3) {
              let t3 = (0, n2.registerGlobal)(c2, this._proxyTracerProvider, s2.DiagAPI.instance());
              return t3 && this._proxyTracerProvider.setDelegate(e3), t3;
            }
            getTracerProvider() {
              return (0, n2.getGlobal)(c2) || this._proxyTracerProvider;
            }
            getTracer(e3, t3) {
              return this.getTracerProvider().getTracer(e3, t3);
            }
            disable() {
              (0, n2.unregisterGlobal)(c2, s2.DiagAPI.instance()), this._proxyTracerProvider = new i2.ProxyTracerProvider();
            }
          }
          t2.TraceAPI = l2;
        }, 277: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.deleteBaggage = t2.setBaggage = t2.getActiveBaggage = t2.getBaggage = void 0;
          let n2 = r3(491), i2 = (0, r3(780).createContextKey)("OpenTelemetry Baggage Key");
          function a2(e3) {
            return e3.getValue(i2) || void 0;
          }
          t2.getBaggage = a2, t2.getActiveBaggage = function() {
            return a2(n2.ContextAPI.getInstance().active());
          }, t2.setBaggage = function(e3, t3) {
            return e3.setValue(i2, t3);
          }, t2.deleteBaggage = function(e3) {
            return e3.deleteValue(i2);
          };
        }, 993: (e2, t2) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.BaggageImpl = void 0;
          class r3 {
            constructor(e3) {
              this._entries = e3 ? new Map(e3) : /* @__PURE__ */ new Map();
            }
            getEntry(e3) {
              let t3 = this._entries.get(e3);
              if (t3) return Object.assign({}, t3);
            }
            getAllEntries() {
              return Array.from(this._entries.entries()).map(([e3, t3]) => [e3, t3]);
            }
            setEntry(e3, t3) {
              let n2 = new r3(this._entries);
              return n2._entries.set(e3, t3), n2;
            }
            removeEntry(e3) {
              let t3 = new r3(this._entries);
              return t3._entries.delete(e3), t3;
            }
            removeEntries(...e3) {
              let t3 = new r3(this._entries);
              for (let r4 of e3) t3._entries.delete(r4);
              return t3;
            }
            clear() {
              return new r3();
            }
          }
          t2.BaggageImpl = r3;
        }, 830: (e2, t2) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.baggageEntryMetadataSymbol = void 0, t2.baggageEntryMetadataSymbol = Symbol("BaggageEntryMetadata");
        }, 369: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.baggageEntryMetadataFromString = t2.createBaggage = void 0;
          let n2 = r3(930), i2 = r3(993), a2 = r3(830), o2 = n2.DiagAPI.instance();
          t2.createBaggage = function(e3 = {}) {
            return new i2.BaggageImpl(new Map(Object.entries(e3)));
          }, t2.baggageEntryMetadataFromString = function(e3) {
            return "string" != typeof e3 && (o2.error(`Cannot create baggage metadata from unknown type: ${typeof e3}`), e3 = ""), { __TYPE__: a2.baggageEntryMetadataSymbol, toString: () => e3 };
          };
        }, 67: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.context = void 0, t2.context = r3(491).ContextAPI.getInstance();
        }, 223: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.NoopContextManager = void 0;
          let n2 = r3(780);
          t2.NoopContextManager = class {
            active() {
              return n2.ROOT_CONTEXT;
            }
            with(e3, t3, r4, ...n3) {
              return t3.call(r4, ...n3);
            }
            bind(e3, t3) {
              return t3;
            }
            enable() {
              return this;
            }
            disable() {
              return this;
            }
          };
        }, 780: (e2, t2) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.ROOT_CONTEXT = t2.createContextKey = void 0, t2.createContextKey = function(e3) {
            return Symbol.for(e3);
          };
          class r3 {
            constructor(e3) {
              const t3 = this;
              t3._currentContext = e3 ? new Map(e3) : /* @__PURE__ */ new Map(), t3.getValue = (e4) => t3._currentContext.get(e4), t3.setValue = (e4, n2) => {
                let i2 = new r3(t3._currentContext);
                return i2._currentContext.set(e4, n2), i2;
              }, t3.deleteValue = (e4) => {
                let n2 = new r3(t3._currentContext);
                return n2._currentContext.delete(e4), n2;
              };
            }
          }
          t2.ROOT_CONTEXT = new r3();
        }, 506: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.diag = void 0, t2.diag = r3(930).DiagAPI.instance();
        }, 56: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.DiagComponentLogger = void 0;
          let n2 = r3(172);
          function i2(e3, t3, r4) {
            let i3 = (0, n2.getGlobal)("diag");
            if (i3) return r4.unshift(t3), i3[e3](...r4);
          }
          t2.DiagComponentLogger = class {
            constructor(e3) {
              this._namespace = e3.namespace || "DiagComponentLogger";
            }
            debug(...e3) {
              return i2("debug", this._namespace, e3);
            }
            error(...e3) {
              return i2("error", this._namespace, e3);
            }
            info(...e3) {
              return i2("info", this._namespace, e3);
            }
            warn(...e3) {
              return i2("warn", this._namespace, e3);
            }
            verbose(...e3) {
              return i2("verbose", this._namespace, e3);
            }
          };
        }, 972: (e2, t2) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.DiagConsoleLogger = void 0;
          let r3 = [{ n: "error", c: "error" }, { n: "warn", c: "warn" }, { n: "info", c: "info" }, { n: "debug", c: "debug" }, { n: "verbose", c: "trace" }];
          t2.DiagConsoleLogger = class {
            constructor() {
              for (let e3 = 0; e3 < r3.length; e3++) this[r3[e3].n] = /* @__PURE__ */ function(e4) {
                return function(...t3) {
                  if (console) {
                    let r4 = console[e4];
                    if ("function" != typeof r4 && (r4 = console.log), "function" == typeof r4) return r4.apply(console, t3);
                  }
                };
              }(r3[e3].c);
            }
          };
        }, 912: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.createLogLevelDiagLogger = void 0;
          let n2 = r3(957);
          t2.createLogLevelDiagLogger = function(e3, t3) {
            function r4(r5, n3) {
              let i2 = t3[r5];
              return "function" == typeof i2 && e3 >= n3 ? i2.bind(t3) : function() {
              };
            }
            return e3 < n2.DiagLogLevel.NONE ? e3 = n2.DiagLogLevel.NONE : e3 > n2.DiagLogLevel.ALL && (e3 = n2.DiagLogLevel.ALL), t3 = t3 || {}, { error: r4("error", n2.DiagLogLevel.ERROR), warn: r4("warn", n2.DiagLogLevel.WARN), info: r4("info", n2.DiagLogLevel.INFO), debug: r4("debug", n2.DiagLogLevel.DEBUG), verbose: r4("verbose", n2.DiagLogLevel.VERBOSE) };
          };
        }, 957: (e2, t2) => {
          var r3;
          Object.defineProperty(t2, "__esModule", { value: true }), t2.DiagLogLevel = void 0, (r3 = t2.DiagLogLevel || (t2.DiagLogLevel = {}))[r3.NONE = 0] = "NONE", r3[r3.ERROR = 30] = "ERROR", r3[r3.WARN = 50] = "WARN", r3[r3.INFO = 60] = "INFO", r3[r3.DEBUG = 70] = "DEBUG", r3[r3.VERBOSE = 80] = "VERBOSE", r3[r3.ALL = 9999] = "ALL";
        }, 172: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.unregisterGlobal = t2.getGlobal = t2.registerGlobal = void 0;
          let n2 = r3(200), i2 = r3(521), a2 = r3(130), o2 = i2.VERSION.split(".")[0], s2 = Symbol.for(`opentelemetry.js.api.${o2}`), c2 = n2._globalThis;
          t2.registerGlobal = function(e3, t3, r4, n3 = false) {
            var a3;
            let o3 = c2[s2] = null != (a3 = c2[s2]) ? a3 : { version: i2.VERSION };
            if (!n3 && o3[e3]) {
              let t4 = Error(`@opentelemetry/api: Attempted duplicate registration of API: ${e3}`);
              return r4.error(t4.stack || t4.message), false;
            }
            if (o3.version !== i2.VERSION) {
              let t4 = Error(`@opentelemetry/api: Registration of version v${o3.version} for ${e3} does not match previously registered API v${i2.VERSION}`);
              return r4.error(t4.stack || t4.message), false;
            }
            return o3[e3] = t3, r4.debug(`@opentelemetry/api: Registered a global for ${e3} v${i2.VERSION}.`), true;
          }, t2.getGlobal = function(e3) {
            var t3, r4;
            let n3 = null == (t3 = c2[s2]) ? void 0 : t3.version;
            if (n3 && (0, a2.isCompatible)(n3)) return null == (r4 = c2[s2]) ? void 0 : r4[e3];
          }, t2.unregisterGlobal = function(e3, t3) {
            t3.debug(`@opentelemetry/api: Unregistering a global for ${e3} v${i2.VERSION}.`);
            let r4 = c2[s2];
            r4 && delete r4[e3];
          };
        }, 130: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.isCompatible = t2._makeCompatibilityCheck = void 0;
          let n2 = r3(521), i2 = /^(\d+)\.(\d+)\.(\d+)(-(.+))?$/;
          function a2(e3) {
            let t3 = /* @__PURE__ */ new Set([e3]), r4 = /* @__PURE__ */ new Set(), n3 = e3.match(i2);
            if (!n3) return () => false;
            let a3 = { major: +n3[1], minor: +n3[2], patch: +n3[3], prerelease: n3[4] };
            if (null != a3.prerelease) return function(t4) {
              return t4 === e3;
            };
            function o2(e4) {
              return r4.add(e4), false;
            }
            return function(e4) {
              if (t3.has(e4)) return true;
              if (r4.has(e4)) return false;
              let n4 = e4.match(i2);
              if (!n4) return o2(e4);
              let s2 = { major: +n4[1], minor: +n4[2], patch: +n4[3], prerelease: n4[4] };
              if (null != s2.prerelease || a3.major !== s2.major) return o2(e4);
              if (0 === a3.major) return a3.minor === s2.minor && a3.patch <= s2.patch ? (t3.add(e4), true) : o2(e4);
              return a3.minor <= s2.minor ? (t3.add(e4), true) : o2(e4);
            };
          }
          t2._makeCompatibilityCheck = a2, t2.isCompatible = a2(n2.VERSION);
        }, 886: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.metrics = void 0, t2.metrics = r3(653).MetricsAPI.getInstance();
        }, 901: (e2, t2) => {
          var r3;
          Object.defineProperty(t2, "__esModule", { value: true }), t2.ValueType = void 0, (r3 = t2.ValueType || (t2.ValueType = {}))[r3.INT = 0] = "INT", r3[r3.DOUBLE = 1] = "DOUBLE";
        }, 102: (e2, t2) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.createNoopMeter = t2.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = t2.NOOP_OBSERVABLE_GAUGE_METRIC = t2.NOOP_OBSERVABLE_COUNTER_METRIC = t2.NOOP_UP_DOWN_COUNTER_METRIC = t2.NOOP_HISTOGRAM_METRIC = t2.NOOP_COUNTER_METRIC = t2.NOOP_METER = t2.NoopObservableUpDownCounterMetric = t2.NoopObservableGaugeMetric = t2.NoopObservableCounterMetric = t2.NoopObservableMetric = t2.NoopHistogramMetric = t2.NoopUpDownCounterMetric = t2.NoopCounterMetric = t2.NoopMetric = t2.NoopMeter = void 0;
          class r3 {
            createHistogram(e3, r4) {
              return t2.NOOP_HISTOGRAM_METRIC;
            }
            createCounter(e3, r4) {
              return t2.NOOP_COUNTER_METRIC;
            }
            createUpDownCounter(e3, r4) {
              return t2.NOOP_UP_DOWN_COUNTER_METRIC;
            }
            createObservableGauge(e3, r4) {
              return t2.NOOP_OBSERVABLE_GAUGE_METRIC;
            }
            createObservableCounter(e3, r4) {
              return t2.NOOP_OBSERVABLE_COUNTER_METRIC;
            }
            createObservableUpDownCounter(e3, r4) {
              return t2.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC;
            }
            addBatchObservableCallback(e3, t3) {
            }
            removeBatchObservableCallback(e3) {
            }
          }
          t2.NoopMeter = r3;
          class n2 {
          }
          t2.NoopMetric = n2;
          class i2 extends n2 {
            add(e3, t3) {
            }
          }
          t2.NoopCounterMetric = i2;
          class a2 extends n2 {
            add(e3, t3) {
            }
          }
          t2.NoopUpDownCounterMetric = a2;
          class o2 extends n2 {
            record(e3, t3) {
            }
          }
          t2.NoopHistogramMetric = o2;
          class s2 {
            addCallback(e3) {
            }
            removeCallback(e3) {
            }
          }
          t2.NoopObservableMetric = s2;
          class c2 extends s2 {
          }
          t2.NoopObservableCounterMetric = c2;
          class l2 extends s2 {
          }
          t2.NoopObservableGaugeMetric = l2;
          class u2 extends s2 {
          }
          t2.NoopObservableUpDownCounterMetric = u2, t2.NOOP_METER = new r3(), t2.NOOP_COUNTER_METRIC = new i2(), t2.NOOP_HISTOGRAM_METRIC = new o2(), t2.NOOP_UP_DOWN_COUNTER_METRIC = new a2(), t2.NOOP_OBSERVABLE_COUNTER_METRIC = new c2(), t2.NOOP_OBSERVABLE_GAUGE_METRIC = new l2(), t2.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = new u2(), t2.createNoopMeter = function() {
            return t2.NOOP_METER;
          };
        }, 660: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.NOOP_METER_PROVIDER = t2.NoopMeterProvider = void 0;
          let n2 = r3(102);
          class i2 {
            getMeter(e3, t3, r4) {
              return n2.NOOP_METER;
            }
          }
          t2.NoopMeterProvider = i2, t2.NOOP_METER_PROVIDER = new i2();
        }, 200: function(e2, t2, r3) {
          var n2 = this && this.__createBinding || (Object.create ? function(e3, t3, r4, n3) {
            void 0 === n3 && (n3 = r4), Object.defineProperty(e3, n3, { enumerable: true, get: function() {
              return t3[r4];
            } });
          } : function(e3, t3, r4, n3) {
            void 0 === n3 && (n3 = r4), e3[n3] = t3[r4];
          }), i2 = this && this.__exportStar || function(e3, t3) {
            for (var r4 in e3) "default" === r4 || Object.prototype.hasOwnProperty.call(t3, r4) || n2(t3, e3, r4);
          };
          Object.defineProperty(t2, "__esModule", { value: true }), i2(r3(46), t2);
        }, 651: (t2, r3) => {
          Object.defineProperty(r3, "__esModule", { value: true }), r3._globalThis = void 0, r3._globalThis = "object" == typeof globalThis ? globalThis : e.g;
        }, 46: function(e2, t2, r3) {
          var n2 = this && this.__createBinding || (Object.create ? function(e3, t3, r4, n3) {
            void 0 === n3 && (n3 = r4), Object.defineProperty(e3, n3, { enumerable: true, get: function() {
              return t3[r4];
            } });
          } : function(e3, t3, r4, n3) {
            void 0 === n3 && (n3 = r4), e3[n3] = t3[r4];
          }), i2 = this && this.__exportStar || function(e3, t3) {
            for (var r4 in e3) "default" === r4 || Object.prototype.hasOwnProperty.call(t3, r4) || n2(t3, e3, r4);
          };
          Object.defineProperty(t2, "__esModule", { value: true }), i2(r3(651), t2);
        }, 939: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.propagation = void 0, t2.propagation = r3(181).PropagationAPI.getInstance();
        }, 874: (e2, t2) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.NoopTextMapPropagator = void 0, t2.NoopTextMapPropagator = class {
            inject(e3, t3) {
            }
            extract(e3, t3) {
              return e3;
            }
            fields() {
              return [];
            }
          };
        }, 194: (e2, t2) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.defaultTextMapSetter = t2.defaultTextMapGetter = void 0, t2.defaultTextMapGetter = { get(e3, t3) {
            if (null != e3) return e3[t3];
          }, keys: (e3) => null == e3 ? [] : Object.keys(e3) }, t2.defaultTextMapSetter = { set(e3, t3, r3) {
            null != e3 && (e3[t3] = r3);
          } };
        }, 845: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.trace = void 0, t2.trace = r3(997).TraceAPI.getInstance();
        }, 403: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.NonRecordingSpan = void 0;
          let n2 = r3(476);
          t2.NonRecordingSpan = class {
            constructor(e3 = n2.INVALID_SPAN_CONTEXT) {
              this._spanContext = e3;
            }
            spanContext() {
              return this._spanContext;
            }
            setAttribute(e3, t3) {
              return this;
            }
            setAttributes(e3) {
              return this;
            }
            addEvent(e3, t3) {
              return this;
            }
            setStatus(e3) {
              return this;
            }
            updateName(e3) {
              return this;
            }
            end(e3) {
            }
            isRecording() {
              return false;
            }
            recordException(e3, t3) {
            }
          };
        }, 614: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.NoopTracer = void 0;
          let n2 = r3(491), i2 = r3(607), a2 = r3(403), o2 = r3(139), s2 = n2.ContextAPI.getInstance();
          t2.NoopTracer = class {
            startSpan(e3, t3, r4 = s2.active()) {
              var n3;
              if (null == t3 ? void 0 : t3.root) return new a2.NonRecordingSpan();
              let c2 = r4 && (0, i2.getSpanContext)(r4);
              return "object" == typeof (n3 = c2) && "string" == typeof n3.spanId && "string" == typeof n3.traceId && "number" == typeof n3.traceFlags && (0, o2.isSpanContextValid)(c2) ? new a2.NonRecordingSpan(c2) : new a2.NonRecordingSpan();
            }
            startActiveSpan(e3, t3, r4, n3) {
              let a3, o3, c2;
              if (arguments.length < 2) return;
              2 == arguments.length ? c2 = t3 : 3 == arguments.length ? (a3 = t3, c2 = r4) : (a3 = t3, o3 = r4, c2 = n3);
              let l2 = null != o3 ? o3 : s2.active(), u2 = this.startSpan(e3, a3, l2), d2 = (0, i2.setSpan)(l2, u2);
              return s2.with(d2, c2, void 0, u2);
            }
          };
        }, 124: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.NoopTracerProvider = void 0;
          let n2 = r3(614);
          t2.NoopTracerProvider = class {
            getTracer(e3, t3, r4) {
              return new n2.NoopTracer();
            }
          };
        }, 125: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.ProxyTracer = void 0;
          let n2 = new (r3(614)).NoopTracer();
          t2.ProxyTracer = class {
            constructor(e3, t3, r4, n3) {
              this._provider = e3, this.name = t3, this.version = r4, this.options = n3;
            }
            startSpan(e3, t3, r4) {
              return this._getTracer().startSpan(e3, t3, r4);
            }
            startActiveSpan(e3, t3, r4, n3) {
              let i2 = this._getTracer();
              return Reflect.apply(i2.startActiveSpan, i2, arguments);
            }
            _getTracer() {
              if (this._delegate) return this._delegate;
              let e3 = this._provider.getDelegateTracer(this.name, this.version, this.options);
              return e3 ? (this._delegate = e3, this._delegate) : n2;
            }
          };
        }, 846: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.ProxyTracerProvider = void 0;
          let n2 = r3(125), i2 = new (r3(124)).NoopTracerProvider();
          t2.ProxyTracerProvider = class {
            getTracer(e3, t3, r4) {
              var i3;
              return null != (i3 = this.getDelegateTracer(e3, t3, r4)) ? i3 : new n2.ProxyTracer(this, e3, t3, r4);
            }
            getDelegate() {
              var e3;
              return null != (e3 = this._delegate) ? e3 : i2;
            }
            setDelegate(e3) {
              this._delegate = e3;
            }
            getDelegateTracer(e3, t3, r4) {
              var n3;
              return null == (n3 = this._delegate) ? void 0 : n3.getTracer(e3, t3, r4);
            }
          };
        }, 996: (e2, t2) => {
          var r3;
          Object.defineProperty(t2, "__esModule", { value: true }), t2.SamplingDecision = void 0, (r3 = t2.SamplingDecision || (t2.SamplingDecision = {}))[r3.NOT_RECORD = 0] = "NOT_RECORD", r3[r3.RECORD = 1] = "RECORD", r3[r3.RECORD_AND_SAMPLED = 2] = "RECORD_AND_SAMPLED";
        }, 607: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.getSpanContext = t2.setSpanContext = t2.deleteSpan = t2.setSpan = t2.getActiveSpan = t2.getSpan = void 0;
          let n2 = r3(780), i2 = r3(403), a2 = r3(491), o2 = (0, n2.createContextKey)("OpenTelemetry Context Key SPAN");
          function s2(e3) {
            return e3.getValue(o2) || void 0;
          }
          function c2(e3, t3) {
            return e3.setValue(o2, t3);
          }
          t2.getSpan = s2, t2.getActiveSpan = function() {
            return s2(a2.ContextAPI.getInstance().active());
          }, t2.setSpan = c2, t2.deleteSpan = function(e3) {
            return e3.deleteValue(o2);
          }, t2.setSpanContext = function(e3, t3) {
            return c2(e3, new i2.NonRecordingSpan(t3));
          }, t2.getSpanContext = function(e3) {
            var t3;
            return null == (t3 = s2(e3)) ? void 0 : t3.spanContext();
          };
        }, 325: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.TraceStateImpl = void 0;
          let n2 = r3(564);
          class i2 {
            constructor(e3) {
              this._internalState = /* @__PURE__ */ new Map(), e3 && this._parse(e3);
            }
            set(e3, t3) {
              let r4 = this._clone();
              return r4._internalState.has(e3) && r4._internalState.delete(e3), r4._internalState.set(e3, t3), r4;
            }
            unset(e3) {
              let t3 = this._clone();
              return t3._internalState.delete(e3), t3;
            }
            get(e3) {
              return this._internalState.get(e3);
            }
            serialize() {
              return this._keys().reduce((e3, t3) => (e3.push(t3 + "=" + this.get(t3)), e3), []).join(",");
            }
            _parse(e3) {
              !(e3.length > 512) && (this._internalState = e3.split(",").reverse().reduce((e4, t3) => {
                let r4 = t3.trim(), i3 = r4.indexOf("=");
                if (-1 !== i3) {
                  let a2 = r4.slice(0, i3), o2 = r4.slice(i3 + 1, t3.length);
                  (0, n2.validateKey)(a2) && (0, n2.validateValue)(o2) && e4.set(a2, o2);
                }
                return e4;
              }, /* @__PURE__ */ new Map()), this._internalState.size > 32 && (this._internalState = new Map(Array.from(this._internalState.entries()).reverse().slice(0, 32))));
            }
            _keys() {
              return Array.from(this._internalState.keys()).reverse();
            }
            _clone() {
              let e3 = new i2();
              return e3._internalState = new Map(this._internalState), e3;
            }
          }
          t2.TraceStateImpl = i2;
        }, 564: (e2, t2) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.validateValue = t2.validateKey = void 0;
          let r3 = "[_0-9a-z-*/]", n2 = `[a-z]${r3}{0,255}`, i2 = `[a-z0-9]${r3}{0,240}@[a-z]${r3}{0,13}`, a2 = RegExp(`^(?:${n2}|${i2})$`), o2 = /^[ -~]{0,255}[!-~]$/, s2 = /,|=/;
          t2.validateKey = function(e3) {
            return a2.test(e3);
          }, t2.validateValue = function(e3) {
            return o2.test(e3) && !s2.test(e3);
          };
        }, 98: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.createTraceState = void 0;
          let n2 = r3(325);
          t2.createTraceState = function(e3) {
            return new n2.TraceStateImpl(e3);
          };
        }, 476: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.INVALID_SPAN_CONTEXT = t2.INVALID_TRACEID = t2.INVALID_SPANID = void 0;
          let n2 = r3(475);
          t2.INVALID_SPANID = "0000000000000000", t2.INVALID_TRACEID = "00000000000000000000000000000000", t2.INVALID_SPAN_CONTEXT = { traceId: t2.INVALID_TRACEID, spanId: t2.INVALID_SPANID, traceFlags: n2.TraceFlags.NONE };
        }, 357: (e2, t2) => {
          var r3;
          Object.defineProperty(t2, "__esModule", { value: true }), t2.SpanKind = void 0, (r3 = t2.SpanKind || (t2.SpanKind = {}))[r3.INTERNAL = 0] = "INTERNAL", r3[r3.SERVER = 1] = "SERVER", r3[r3.CLIENT = 2] = "CLIENT", r3[r3.PRODUCER = 3] = "PRODUCER", r3[r3.CONSUMER = 4] = "CONSUMER";
        }, 139: (e2, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.wrapSpanContext = t2.isSpanContextValid = t2.isValidSpanId = t2.isValidTraceId = void 0;
          let n2 = r3(476), i2 = r3(403), a2 = /^([0-9a-f]{32})$/i, o2 = /^[0-9a-f]{16}$/i;
          function s2(e3) {
            return a2.test(e3) && e3 !== n2.INVALID_TRACEID;
          }
          function c2(e3) {
            return o2.test(e3) && e3 !== n2.INVALID_SPANID;
          }
          t2.isValidTraceId = s2, t2.isValidSpanId = c2, t2.isSpanContextValid = function(e3) {
            return s2(e3.traceId) && c2(e3.spanId);
          }, t2.wrapSpanContext = function(e3) {
            return new i2.NonRecordingSpan(e3);
          };
        }, 847: (e2, t2) => {
          var r3;
          Object.defineProperty(t2, "__esModule", { value: true }), t2.SpanStatusCode = void 0, (r3 = t2.SpanStatusCode || (t2.SpanStatusCode = {}))[r3.UNSET = 0] = "UNSET", r3[r3.OK = 1] = "OK", r3[r3.ERROR = 2] = "ERROR";
        }, 475: (e2, t2) => {
          var r3;
          Object.defineProperty(t2, "__esModule", { value: true }), t2.TraceFlags = void 0, (r3 = t2.TraceFlags || (t2.TraceFlags = {}))[r3.NONE = 0] = "NONE", r3[r3.SAMPLED = 1] = "SAMPLED";
        }, 521: (e2, t2) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.VERSION = void 0, t2.VERSION = "1.6.0";
        } }, k = {};
        function x(e2) {
          var t2 = k[e2];
          if (void 0 !== t2) return t2.exports;
          var r3 = k[e2] = { exports: {} }, n2 = true;
          try {
            S[e2].call(r3.exports, r3, r3.exports, x), n2 = false;
          } finally {
            n2 && delete k[e2];
          }
          return r3.exports;
        }
        x.ab = "/ROOT/node_modules/next/dist/compiled/@opentelemetry/api/";
        var A = {};
        Object.defineProperty(A, "__esModule", { value: true }), A.trace = A.propagation = A.metrics = A.diag = A.context = A.INVALID_SPAN_CONTEXT = A.INVALID_TRACEID = A.INVALID_SPANID = A.isValidSpanId = A.isValidTraceId = A.isSpanContextValid = A.createTraceState = A.TraceFlags = A.SpanStatusCode = A.SpanKind = A.SamplingDecision = A.ProxyTracerProvider = A.ProxyTracer = A.defaultTextMapSetter = A.defaultTextMapGetter = A.ValueType = A.createNoopMeter = A.DiagLogLevel = A.DiagConsoleLogger = A.ROOT_CONTEXT = A.createContextKey = A.baggageEntryMetadataFromString = void 0, s = x(369), Object.defineProperty(A, "baggageEntryMetadataFromString", { enumerable: true, get: function() {
          return s.baggageEntryMetadataFromString;
        } }), c = x(780), Object.defineProperty(A, "createContextKey", { enumerable: true, get: function() {
          return c.createContextKey;
        } }), Object.defineProperty(A, "ROOT_CONTEXT", { enumerable: true, get: function() {
          return c.ROOT_CONTEXT;
        } }), l = x(972), Object.defineProperty(A, "DiagConsoleLogger", { enumerable: true, get: function() {
          return l.DiagConsoleLogger;
        } }), u = x(957), Object.defineProperty(A, "DiagLogLevel", { enumerable: true, get: function() {
          return u.DiagLogLevel;
        } }), d = x(102), Object.defineProperty(A, "createNoopMeter", { enumerable: true, get: function() {
          return d.createNoopMeter;
        } }), p = x(901), Object.defineProperty(A, "ValueType", { enumerable: true, get: function() {
          return p.ValueType;
        } }), h = x(194), Object.defineProperty(A, "defaultTextMapGetter", { enumerable: true, get: function() {
          return h.defaultTextMapGetter;
        } }), Object.defineProperty(A, "defaultTextMapSetter", { enumerable: true, get: function() {
          return h.defaultTextMapSetter;
        } }), f = x(125), Object.defineProperty(A, "ProxyTracer", { enumerable: true, get: function() {
          return f.ProxyTracer;
        } }), g = x(846), Object.defineProperty(A, "ProxyTracerProvider", { enumerable: true, get: function() {
          return g.ProxyTracerProvider;
        } }), m = x(996), Object.defineProperty(A, "SamplingDecision", { enumerable: true, get: function() {
          return m.SamplingDecision;
        } }), y = x(357), Object.defineProperty(A, "SpanKind", { enumerable: true, get: function() {
          return y.SpanKind;
        } }), b = x(847), Object.defineProperty(A, "SpanStatusCode", { enumerable: true, get: function() {
          return b.SpanStatusCode;
        } }), w = x(475), Object.defineProperty(A, "TraceFlags", { enumerable: true, get: function() {
          return w.TraceFlags;
        } }), v = x(98), Object.defineProperty(A, "createTraceState", { enumerable: true, get: function() {
          return v.createTraceState;
        } }), _ = x(139), Object.defineProperty(A, "isSpanContextValid", { enumerable: true, get: function() {
          return _.isSpanContextValid;
        } }), Object.defineProperty(A, "isValidTraceId", { enumerable: true, get: function() {
          return _.isValidTraceId;
        } }), Object.defineProperty(A, "isValidSpanId", { enumerable: true, get: function() {
          return _.isValidSpanId;
        } }), E = x(476), Object.defineProperty(A, "INVALID_SPANID", { enumerable: true, get: function() {
          return E.INVALID_SPANID;
        } }), Object.defineProperty(A, "INVALID_TRACEID", { enumerable: true, get: function() {
          return E.INVALID_TRACEID;
        } }), Object.defineProperty(A, "INVALID_SPAN_CONTEXT", { enumerable: true, get: function() {
          return E.INVALID_SPAN_CONTEXT;
        } }), r2 = x(67), Object.defineProperty(A, "context", { enumerable: true, get: function() {
          return r2.context;
        } }), n = x(506), Object.defineProperty(A, "diag", { enumerable: true, get: function() {
          return n.diag;
        } }), i = x(886), Object.defineProperty(A, "metrics", { enumerable: true, get: function() {
          return i.metrics;
        } }), a = x(939), Object.defineProperty(A, "propagation", { enumerable: true, get: function() {
          return a.propagation;
        } }), o = x(845), Object.defineProperty(A, "trace", { enumerable: true, get: function() {
          return o.trace;
        } }), A.default = { context: r2.context, diag: n.diag, metrics: i.metrics, propagation: a.propagation, trace: o.trace }, t.exports = A;
      })();
    }, 71498, (e, t, r) => {
      (() => {
        "use strict";
        "u" > typeof __nccwpck_require__ && (__nccwpck_require__.ab = "/ROOT/node_modules/next/dist/compiled/cookie/");
        var e2, r2, n, i, a = {};
        a.parse = function(t2, r3) {
          if ("string" != typeof t2) throw TypeError("argument str must be a string");
          for (var i2 = {}, a2 = t2.split(n), o = (r3 || {}).decode || e2, s = 0; s < a2.length; s++) {
            var c = a2[s], l = c.indexOf("=");
            if (!(l < 0)) {
              var u = c.substr(0, l).trim(), d = c.substr(++l, c.length).trim();
              '"' == d[0] && (d = d.slice(1, -1)), void 0 == i2[u] && (i2[u] = function(e3, t3) {
                try {
                  return t3(e3);
                } catch (t4) {
                  return e3;
                }
              }(d, o));
            }
          }
          return i2;
        }, a.serialize = function(e3, t2, n2) {
          var a2 = n2 || {}, o = a2.encode || r2;
          if ("function" != typeof o) throw TypeError("option encode is invalid");
          if (!i.test(e3)) throw TypeError("argument name is invalid");
          var s = o(t2);
          if (s && !i.test(s)) throw TypeError("argument val is invalid");
          var c = e3 + "=" + s;
          if (null != a2.maxAge) {
            var l = a2.maxAge - 0;
            if (isNaN(l) || !isFinite(l)) throw TypeError("option maxAge is invalid");
            c += "; Max-Age=" + Math.floor(l);
          }
          if (a2.domain) {
            if (!i.test(a2.domain)) throw TypeError("option domain is invalid");
            c += "; Domain=" + a2.domain;
          }
          if (a2.path) {
            if (!i.test(a2.path)) throw TypeError("option path is invalid");
            c += "; Path=" + a2.path;
          }
          if (a2.expires) {
            if ("function" != typeof a2.expires.toUTCString) throw TypeError("option expires is invalid");
            c += "; Expires=" + a2.expires.toUTCString();
          }
          if (a2.httpOnly && (c += "; HttpOnly"), a2.secure && (c += "; Secure"), a2.sameSite) switch ("string" == typeof a2.sameSite ? a2.sameSite.toLowerCase() : a2.sameSite) {
            case true:
            case "strict":
              c += "; SameSite=Strict";
              break;
            case "lax":
              c += "; SameSite=Lax";
              break;
            case "none":
              c += "; SameSite=None";
              break;
            default:
              throw TypeError("option sameSite is invalid");
          }
          return c;
        }, e2 = decodeURIComponent, r2 = encodeURIComponent, n = /; */, i = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/, t.exports = a;
      })();
    }, 99734, (e, t, r) => {
      (() => {
        "use strict";
        let e2, r2, n, i, a;
        var o = { 993: (e3) => {
          var t2 = Object.prototype.hasOwnProperty, r3 = "~";
          function n2() {
          }
          function i2(e4, t3, r4) {
            this.fn = e4, this.context = t3, this.once = r4 || false;
          }
          function a2(e4, t3, n3, a3, o3) {
            if ("function" != typeof n3) throw TypeError("The listener must be a function");
            var s3 = new i2(n3, a3 || e4, o3), c2 = r3 ? r3 + t3 : t3;
            return e4._events[c2] ? e4._events[c2].fn ? e4._events[c2] = [e4._events[c2], s3] : e4._events[c2].push(s3) : (e4._events[c2] = s3, e4._eventsCount++), e4;
          }
          function o2(e4, t3) {
            0 == --e4._eventsCount ? e4._events = new n2() : delete e4._events[t3];
          }
          function s2() {
            this._events = new n2(), this._eventsCount = 0;
          }
          Object.create && (n2.prototype = /* @__PURE__ */ Object.create(null), new n2().__proto__ || (r3 = false)), s2.prototype.eventNames = function() {
            var e4, n3, i3 = [];
            if (0 === this._eventsCount) return i3;
            for (n3 in e4 = this._events) t2.call(e4, n3) && i3.push(r3 ? n3.slice(1) : n3);
            return Object.getOwnPropertySymbols ? i3.concat(Object.getOwnPropertySymbols(e4)) : i3;
          }, s2.prototype.listeners = function(e4) {
            var t3 = r3 ? r3 + e4 : e4, n3 = this._events[t3];
            if (!n3) return [];
            if (n3.fn) return [n3.fn];
            for (var i3 = 0, a3 = n3.length, o3 = Array(a3); i3 < a3; i3++) o3[i3] = n3[i3].fn;
            return o3;
          }, s2.prototype.listenerCount = function(e4) {
            var t3 = r3 ? r3 + e4 : e4, n3 = this._events[t3];
            return n3 ? n3.fn ? 1 : n3.length : 0;
          }, s2.prototype.emit = function(e4, t3, n3, i3, a3, o3) {
            var s3 = r3 ? r3 + e4 : e4;
            if (!this._events[s3]) return false;
            var c2, l2, u = this._events[s3], d = arguments.length;
            if (u.fn) {
              switch (u.once && this.removeListener(e4, u.fn, void 0, true), d) {
                case 1:
                  return u.fn.call(u.context), true;
                case 2:
                  return u.fn.call(u.context, t3), true;
                case 3:
                  return u.fn.call(u.context, t3, n3), true;
                case 4:
                  return u.fn.call(u.context, t3, n3, i3), true;
                case 5:
                  return u.fn.call(u.context, t3, n3, i3, a3), true;
                case 6:
                  return u.fn.call(u.context, t3, n3, i3, a3, o3), true;
              }
              for (l2 = 1, c2 = Array(d - 1); l2 < d; l2++) c2[l2 - 1] = arguments[l2];
              u.fn.apply(u.context, c2);
            } else {
              var p, h = u.length;
              for (l2 = 0; l2 < h; l2++) switch (u[l2].once && this.removeListener(e4, u[l2].fn, void 0, true), d) {
                case 1:
                  u[l2].fn.call(u[l2].context);
                  break;
                case 2:
                  u[l2].fn.call(u[l2].context, t3);
                  break;
                case 3:
                  u[l2].fn.call(u[l2].context, t3, n3);
                  break;
                case 4:
                  u[l2].fn.call(u[l2].context, t3, n3, i3);
                  break;
                default:
                  if (!c2) for (p = 1, c2 = Array(d - 1); p < d; p++) c2[p - 1] = arguments[p];
                  u[l2].fn.apply(u[l2].context, c2);
              }
            }
            return true;
          }, s2.prototype.on = function(e4, t3, r4) {
            return a2(this, e4, t3, r4, false);
          }, s2.prototype.once = function(e4, t3, r4) {
            return a2(this, e4, t3, r4, true);
          }, s2.prototype.removeListener = function(e4, t3, n3, i3) {
            var a3 = r3 ? r3 + e4 : e4;
            if (!this._events[a3]) return this;
            if (!t3) return o2(this, a3), this;
            var s3 = this._events[a3];
            if (s3.fn) s3.fn !== t3 || i3 && !s3.once || n3 && s3.context !== n3 || o2(this, a3);
            else {
              for (var c2 = 0, l2 = [], u = s3.length; c2 < u; c2++) (s3[c2].fn !== t3 || i3 && !s3[c2].once || n3 && s3[c2].context !== n3) && l2.push(s3[c2]);
              l2.length ? this._events[a3] = 1 === l2.length ? l2[0] : l2 : o2(this, a3);
            }
            return this;
          }, s2.prototype.removeAllListeners = function(e4) {
            var t3;
            return e4 ? (t3 = r3 ? r3 + e4 : e4, this._events[t3] && o2(this, t3)) : (this._events = new n2(), this._eventsCount = 0), this;
          }, s2.prototype.off = s2.prototype.removeListener, s2.prototype.addListener = s2.prototype.on, s2.prefixed = r3, s2.EventEmitter = s2, e3.exports = s2;
        }, 213: (e3) => {
          e3.exports = (e4, t2) => (t2 = t2 || (() => {
          }), e4.then((e5) => new Promise((e6) => {
            e6(t2());
          }).then(() => e5), (e5) => new Promise((e6) => {
            e6(t2());
          }).then(() => {
            throw e5;
          })));
        }, 574: (e3, t2) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.default = function(e4, t3, r3) {
            let n2 = 0, i2 = e4.length;
            for (; i2 > 0; ) {
              let a2 = i2 / 2 | 0, o2 = n2 + a2;
              0 >= r3(e4[o2], t3) ? (n2 = ++o2, i2 -= a2 + 1) : i2 = a2;
            }
            return n2;
          };
        }, 821: (e3, t2, r3) => {
          Object.defineProperty(t2, "__esModule", { value: true });
          let n2 = r3(574);
          t2.default = class {
            constructor() {
              this._queue = [];
            }
            enqueue(e4, t3) {
              let r4 = { priority: (t3 = Object.assign({ priority: 0 }, t3)).priority, run: e4 };
              if (this.size && this._queue[this.size - 1].priority >= t3.priority) return void this._queue.push(r4);
              let i2 = n2.default(this._queue, r4, (e5, t4) => t4.priority - e5.priority);
              this._queue.splice(i2, 0, r4);
            }
            dequeue() {
              let e4 = this._queue.shift();
              return null == e4 ? void 0 : e4.run;
            }
            filter(e4) {
              return this._queue.filter((t3) => t3.priority === e4.priority).map((e5) => e5.run);
            }
            get size() {
              return this._queue.length;
            }
          };
        }, 816: (e3, t2, r3) => {
          let n2 = r3(213);
          class i2 extends Error {
            constructor(e4) {
              super(e4), this.name = "TimeoutError";
            }
          }
          let a2 = (e4, t3, r4) => new Promise((a3, o2) => {
            if ("number" != typeof t3 || t3 < 0) throw TypeError("Expected `milliseconds` to be a positive number");
            if (t3 === 1 / 0) return void a3(e4);
            let s2 = setTimeout(() => {
              if ("function" == typeof r4) {
                try {
                  a3(r4());
                } catch (e5) {
                  o2(e5);
                }
                return;
              }
              let n3 = "string" == typeof r4 ? r4 : `Promise timed out after ${t3} milliseconds`, s3 = r4 instanceof Error ? r4 : new i2(n3);
              "function" == typeof e4.cancel && e4.cancel(), o2(s3);
            }, t3);
            n2(e4.then(a3, o2), () => {
              clearTimeout(s2);
            });
          });
          e3.exports = a2, e3.exports.default = a2, e3.exports.TimeoutError = i2;
        } }, s = {};
        function c(e3) {
          var t2 = s[e3];
          if (void 0 !== t2) return t2.exports;
          var r3 = s[e3] = { exports: {} }, n2 = true;
          try {
            o[e3](r3, r3.exports, c), n2 = false;
          } finally {
            n2 && delete s[e3];
          }
          return r3.exports;
        }
        c.ab = "/ROOT/node_modules/next/dist/compiled/p-queue/";
        var l = {};
        Object.defineProperty(l, "__esModule", { value: true }), e2 = c(993), r2 = c(816), n = c(821), i = () => {
        }, a = new r2.TimeoutError(), l.default = class extends e2 {
          constructor(e3) {
            var t2, r3, a2, o2;
            if (super(), this._intervalCount = 0, this._intervalEnd = 0, this._pendingCount = 0, this._resolveEmpty = i, this._resolveIdle = i, !("number" == typeof (e3 = Object.assign({ carryoverConcurrencyCount: false, intervalCap: 1 / 0, interval: 0, concurrency: 1 / 0, autoStart: true, queueClass: n.default }, e3)).intervalCap && e3.intervalCap >= 1)) throw TypeError(`Expected \`intervalCap\` to be a number from 1 and up, got \`${null != (r3 = null == (t2 = e3.intervalCap) ? void 0 : t2.toString()) ? r3 : ""}\` (${typeof e3.intervalCap})`);
            if (void 0 === e3.interval || !(Number.isFinite(e3.interval) && e3.interval >= 0)) throw TypeError(`Expected \`interval\` to be a finite number >= 0, got \`${null != (o2 = null == (a2 = e3.interval) ? void 0 : a2.toString()) ? o2 : ""}\` (${typeof e3.interval})`);
            this._carryoverConcurrencyCount = e3.carryoverConcurrencyCount, this._isIntervalIgnored = e3.intervalCap === 1 / 0 || 0 === e3.interval, this._intervalCap = e3.intervalCap, this._interval = e3.interval, this._queue = new e3.queueClass(), this._queueClass = e3.queueClass, this.concurrency = e3.concurrency, this._timeout = e3.timeout, this._throwOnTimeout = true === e3.throwOnTimeout, this._isPaused = false === e3.autoStart;
          }
          get _doesIntervalAllowAnother() {
            return this._isIntervalIgnored || this._intervalCount < this._intervalCap;
          }
          get _doesConcurrentAllowAnother() {
            return this._pendingCount < this._concurrency;
          }
          _next() {
            this._pendingCount--, this._tryToStartAnother(), this.emit("next");
          }
          _resolvePromises() {
            this._resolveEmpty(), this._resolveEmpty = i, 0 === this._pendingCount && (this._resolveIdle(), this._resolveIdle = i, this.emit("idle"));
          }
          _onResumeInterval() {
            this._onInterval(), this._initializeIntervalIfNeeded(), this._timeoutId = void 0;
          }
          _isIntervalPaused() {
            let e3 = Date.now();
            if (void 0 === this._intervalId) {
              let t2 = this._intervalEnd - e3;
              if (!(t2 < 0)) return void 0 === this._timeoutId && (this._timeoutId = setTimeout(() => {
                this._onResumeInterval();
              }, t2)), true;
              this._intervalCount = this._carryoverConcurrencyCount ? this._pendingCount : 0;
            }
            return false;
          }
          _tryToStartAnother() {
            if (0 === this._queue.size) return this._intervalId && clearInterval(this._intervalId), this._intervalId = void 0, this._resolvePromises(), false;
            if (!this._isPaused) {
              let e3 = !this._isIntervalPaused();
              if (this._doesIntervalAllowAnother && this._doesConcurrentAllowAnother) {
                let t2 = this._queue.dequeue();
                return !!t2 && (this.emit("active"), t2(), e3 && this._initializeIntervalIfNeeded(), true);
              }
            }
            return false;
          }
          _initializeIntervalIfNeeded() {
            this._isIntervalIgnored || void 0 !== this._intervalId || (this._intervalId = setInterval(() => {
              this._onInterval();
            }, this._interval), this._intervalEnd = Date.now() + this._interval);
          }
          _onInterval() {
            0 === this._intervalCount && 0 === this._pendingCount && this._intervalId && (clearInterval(this._intervalId), this._intervalId = void 0), this._intervalCount = this._carryoverConcurrencyCount ? this._pendingCount : 0, this._processQueue();
          }
          _processQueue() {
            for (; this._tryToStartAnother(); ) ;
          }
          get concurrency() {
            return this._concurrency;
          }
          set concurrency(e3) {
            if (!("number" == typeof e3 && e3 >= 1)) throw TypeError(`Expected \`concurrency\` to be a number from 1 and up, got \`${e3}\` (${typeof e3})`);
            this._concurrency = e3, this._processQueue();
          }
          async add(e3, t2 = {}) {
            return new Promise((n2, i2) => {
              let o2 = async () => {
                this._pendingCount++, this._intervalCount++;
                try {
                  let o3 = void 0 === this._timeout && void 0 === t2.timeout ? e3() : r2.default(Promise.resolve(e3()), void 0 === t2.timeout ? this._timeout : t2.timeout, () => {
                    (void 0 === t2.throwOnTimeout ? this._throwOnTimeout : t2.throwOnTimeout) && i2(a);
                  });
                  n2(await o3);
                } catch (e4) {
                  i2(e4);
                }
                this._next();
              };
              this._queue.enqueue(o2, t2), this._tryToStartAnother(), this.emit("add");
            });
          }
          async addAll(e3, t2) {
            return Promise.all(e3.map(async (e4) => this.add(e4, t2)));
          }
          start() {
            return this._isPaused && (this._isPaused = false, this._processQueue()), this;
          }
          pause() {
            this._isPaused = true;
          }
          clear() {
            this._queue = new this._queueClass();
          }
          async onEmpty() {
            if (0 !== this._queue.size) return new Promise((e3) => {
              let t2 = this._resolveEmpty;
              this._resolveEmpty = () => {
                t2(), e3();
              };
            });
          }
          async onIdle() {
            if (0 !== this._pendingCount || 0 !== this._queue.size) return new Promise((e3) => {
              let t2 = this._resolveIdle;
              this._resolveIdle = () => {
                t2(), e3();
              };
            });
          }
          get size() {
            return this._queue.size;
          }
          sizeBy(e3) {
            return this._queue.filter(e3).length;
          }
          get pending() {
            return this._pendingCount;
          }
          get isPaused() {
            return this._isPaused;
          }
          get timeout() {
            return this._timeout;
          }
          set timeout(e3) {
            this._timeout = e3;
          }
        }, t.exports = l;
      })();
    }, 51615, (e, t, r) => {
      t.exports = e.x("node:buffer", () => (init_node_buffer(), __toCommonJS(node_buffer_exports)));
    }, 78500, (e, t, r) => {
      t.exports = e.x("node:async_hooks", () => (init_node_async_hooks(), __toCommonJS(node_async_hooks_exports)));
    }, 25085, (e, t, r) => {
      "use strict";
      Object.defineProperty(r, "__esModule", { value: true });
      var n = { getTestReqInfo: function() {
        return c;
      }, withRequest: function() {
        return s;
      } };
      for (var i in n) Object.defineProperty(r, i, { enumerable: true, get: n[i] });
      let a = new (e.r(78500)).AsyncLocalStorage();
      function o(e2, t2) {
        let r2 = t2.header(e2, "next-test-proxy-port");
        if (!r2) return;
        let n2 = t2.url(e2);
        return { url: n2, proxyPort: Number(r2), testData: t2.header(e2, "next-test-data") || "" };
      }
      function s(e2, t2, r2) {
        let n2 = o(e2, t2);
        return n2 ? a.run(n2, r2) : r2();
      }
      function c(e2, t2) {
        let r2 = a.getStore();
        return r2 || (e2 && t2 ? o(e2, t2) : void 0);
      }
    }, 28325, (e, t, r) => {
      "use strict";
      var n = e.i(51615);
      Object.defineProperty(r, "__esModule", { value: true });
      var i = { handleFetch: function() {
        return l;
      }, interceptFetch: function() {
        return u;
      }, reader: function() {
        return s;
      } };
      for (var a in i) Object.defineProperty(r, a, { enumerable: true, get: i[a] });
      let o = e.r(25085), s = { url: (e2) => e2.url, header: (e2, t2) => e2.headers.get(t2) };
      async function c(e2, t2) {
        let { url: r2, method: i2, headers: a2, body: o2, cache: s2, credentials: c2, integrity: l2, mode: u2, redirect: d, referrer: p, referrerPolicy: h } = t2;
        return { testData: e2, api: "fetch", request: { url: r2, method: i2, headers: [...Array.from(a2), ["next-test-stack", function() {
          let e3 = (Error().stack ?? "").split("\n");
          for (let t3 = 1; t3 < e3.length; t3++) if (e3[t3].length > 0) {
            e3 = e3.slice(t3);
            break;
          }
          return (e3 = (e3 = (e3 = e3.filter((e4) => !e4.includes("/next/dist/"))).slice(0, 5)).map((e4) => e4.replace("webpack-internal:///(rsc)/", "").trim())).join("    ");
        }()]], body: o2 ? n.Buffer.from(await t2.arrayBuffer()).toString("base64") : null, cache: s2, credentials: c2, integrity: l2, mode: u2, redirect: d, referrer: p, referrerPolicy: h } };
      }
      async function l(e2, t2) {
        let r2 = (0, o.getTestReqInfo)(t2, s);
        if (!r2) return e2(t2);
        let { testData: i2, proxyPort: a2 } = r2, l2 = await c(i2, t2), u2 = await e2(`http://localhost:${a2}`, { method: "POST", body: JSON.stringify(l2), next: { internal: true } });
        if (!u2.ok) throw Object.defineProperty(Error(`Proxy request failed: ${u2.status}`), "__NEXT_ERROR_CODE", { value: "E146", enumerable: false, configurable: true });
        let d = await u2.json(), { api: p } = d;
        switch (p) {
          case "continue":
            return e2(t2);
          case "abort":
          case "unhandled":
            throw Object.defineProperty(Error(`Proxy request aborted [${t2.method} ${t2.url}]`), "__NEXT_ERROR_CODE", { value: "E145", enumerable: false, configurable: true });
          case "fetch":
            return function(e3) {
              let { status: t3, headers: r3, body: i3 } = e3.response;
              return new Response(i3 ? n.Buffer.from(i3, "base64") : null, { status: t3, headers: new Headers(r3) });
            }(d);
          default:
            return p;
        }
      }
      function u(t2) {
        return e.g.fetch = function(e2, r2) {
          var n2;
          return (null == r2 || null == (n2 = r2.next) ? void 0 : n2.internal) ? t2(e2, r2) : l(t2, new Request(e2, r2));
        }, () => {
          e.g.fetch = t2;
        };
      }
    }, 94165, (e, t, r) => {
      "use strict";
      Object.defineProperty(r, "__esModule", { value: true });
      var n = { interceptTestApis: function() {
        return s;
      }, wrapRequestHandler: function() {
        return c;
      } };
      for (var i in n) Object.defineProperty(r, i, { enumerable: true, get: n[i] });
      let a = e.r(25085), o = e.r(28325);
      function s() {
        return (0, o.interceptFetch)(e.g.fetch);
      }
      function c(e2) {
        return (t2, r2) => (0, a.withRequest)(t2, o.reader, () => e2(t2, r2));
      }
    }, 64445, (e, t, r) => {
      var n = { 226: function(t2, r2) {
        !function(n2, i2) {
          "use strict";
          var a2 = "function", o = "undefined", s = "object", c = "string", l = "major", u = "model", d = "name", p = "type", h = "vendor", f = "version", g = "architecture", m = "console", y = "mobile", b = "tablet", w = "smarttv", v = "wearable", _ = "embedded", E = "Amazon", S = "Apple", k = "ASUS", x = "BlackBerry", A = "Browser", T = "Chrome", R = "Firefox", C = "Google", P = "Huawei", O = "Microsoft", I = "Motorola", N = "Opera", U = "Samsung", D = "Sharp", j = "Sony", $ = "Xiaomi", L = "Zebra", M = "Facebook", H = "Chromium OS", W = "Mac OS", K = function(e2, t3) {
            var r3 = {};
            for (var n3 in e2) t3[n3] && t3[n3].length % 2 == 0 ? r3[n3] = t3[n3].concat(e2[n3]) : r3[n3] = e2[n3];
            return r3;
          }, B = function(e2) {
            for (var t3 = {}, r3 = 0; r3 < e2.length; r3++) t3[e2[r3].toUpperCase()] = e2[r3];
            return t3;
          }, q = function(e2, t3) {
            return typeof e2 === c && -1 !== J(t3).indexOf(J(e2));
          }, J = function(e2) {
            return e2.toLowerCase();
          }, V = function(e2, t3) {
            if (typeof e2 === c) return e2 = e2.replace(/^\s\s*/, ""), typeof t3 === o ? e2 : e2.substring(0, 350);
          }, z = function(e2, t3) {
            for (var r3, n3, i3, o2, c2, l2, u2 = 0; u2 < t3.length && !c2; ) {
              var d2 = t3[u2], p2 = t3[u2 + 1];
              for (r3 = n3 = 0; r3 < d2.length && !c2 && d2[r3]; ) if (c2 = d2[r3++].exec(e2)) for (i3 = 0; i3 < p2.length; i3++) l2 = c2[++n3], typeof (o2 = p2[i3]) === s && o2.length > 0 ? 2 === o2.length ? typeof o2[1] == a2 ? this[o2[0]] = o2[1].call(this, l2) : this[o2[0]] = o2[1] : 3 === o2.length ? typeof o2[1] !== a2 || o2[1].exec && o2[1].test ? this[o2[0]] = l2 ? l2.replace(o2[1], o2[2]) : void 0 : this[o2[0]] = l2 ? o2[1].call(this, l2, o2[2]) : void 0 : 4 === o2.length && (this[o2[0]] = l2 ? o2[3].call(this, l2.replace(o2[1], o2[2])) : void 0) : this[o2] = l2 || void 0;
              u2 += 2;
            }
          }, F = function(e2, t3) {
            for (var r3 in t3) if (typeof t3[r3] === s && t3[r3].length > 0) {
              for (var n3 = 0; n3 < t3[r3].length; n3++) if (q(t3[r3][n3], e2)) return "?" === r3 ? void 0 : r3;
            } else if (q(t3[r3], e2)) return "?" === r3 ? void 0 : r3;
            return e2;
          }, G = { ME: "4.90", "NT 3.11": "NT3.51", "NT 4.0": "NT4.0", 2e3: "NT 5.0", XP: ["NT 5.1", "NT 5.2"], Vista: "NT 6.0", 7: "NT 6.1", 8: "NT 6.2", 8.1: "NT 6.3", 10: ["NT 6.4", "NT 10.0"], RT: "ARM" }, X = { browser: [[/\b(?:crmo|crios)\/([\w\.]+)/i], [f, [d, "Chrome"]], [/edg(?:e|ios|a)?\/([\w\.]+)/i], [f, [d, "Edge"]], [/(opera mini)\/([-\w\.]+)/i, /(opera [mobiletab]{3,6})\b.+version\/([-\w\.]+)/i, /(opera)(?:.+version\/|[\/ ]+)([\w\.]+)/i], [d, f], [/opios[\/ ]+([\w\.]+)/i], [f, [d, N + " Mini"]], [/\bopr\/([\w\.]+)/i], [f, [d, N]], [/(kindle)\/([\w\.]+)/i, /(lunascape|maxthon|netfront|jasmine|blazer)[\/ ]?([\w\.]*)/i, /(avant |iemobile|slim)(?:browser)?[\/ ]?([\w\.]*)/i, /(ba?idubrowser)[\/ ]?([\w\.]+)/i, /(?:ms|\()(ie) ([\w\.]+)/i, /(flock|rockmelt|midori|epiphany|silk|skyfire|bolt|iron|vivaldi|iridium|phantomjs|bowser|quark|qupzilla|falkon|rekonq|puffin|brave|whale(?!.+naver)|qqbrowserlite|qq|duckduckgo)\/([-\w\.]+)/i, /(heytap|ovi)browser\/([\d\.]+)/i, /(weibo)__([\d\.]+)/i], [d, f], [/(?:\buc? ?browser|(?:juc.+)ucweb)[\/ ]?([\w\.]+)/i], [f, [d, "UC" + A]], [/microm.+\bqbcore\/([\w\.]+)/i, /\bqbcore\/([\w\.]+).+microm/i], [f, [d, "WeChat(Win) Desktop"]], [/micromessenger\/([\w\.]+)/i], [f, [d, "WeChat"]], [/konqueror\/([\w\.]+)/i], [f, [d, "Konqueror"]], [/trident.+rv[: ]([\w\.]{1,9})\b.+like gecko/i], [f, [d, "IE"]], [/ya(?:search)?browser\/([\w\.]+)/i], [f, [d, "Yandex"]], [/(avast|avg)\/([\w\.]+)/i], [[d, /(.+)/, "$1 Secure " + A], f], [/\bfocus\/([\w\.]+)/i], [f, [d, R + " Focus"]], [/\bopt\/([\w\.]+)/i], [f, [d, N + " Touch"]], [/coc_coc\w+\/([\w\.]+)/i], [f, [d, "Coc Coc"]], [/dolfin\/([\w\.]+)/i], [f, [d, "Dolphin"]], [/coast\/([\w\.]+)/i], [f, [d, N + " Coast"]], [/miuibrowser\/([\w\.]+)/i], [f, [d, "MIUI " + A]], [/fxios\/([-\w\.]+)/i], [f, [d, R]], [/\bqihu|(qi?ho?o?|360)browser/i], [[d, "360 " + A]], [/(oculus|samsung|sailfish|huawei)browser\/([\w\.]+)/i], [[d, /(.+)/, "$1 " + A], f], [/(comodo_dragon)\/([\w\.]+)/i], [[d, /_/g, " "], f], [/(electron)\/([\w\.]+) safari/i, /(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w\.]+))/i, /m?(qqbrowser|baiduboxapp|2345Explorer)[\/ ]?([\w\.]+)/i], [d, f], [/(metasr)[\/ ]?([\w\.]+)/i, /(lbbrowser)/i, /\[(linkedin)app\]/i], [d], [/((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w\.]+);)/i], [[d, M], f], [/(kakao(?:talk|story))[\/ ]([\w\.]+)/i, /(naver)\(.*?(\d+\.[\w\.]+).*\)/i, /safari (line)\/([\w\.]+)/i, /\b(line)\/([\w\.]+)\/iab/i, /(chromium|instagram)[\/ ]([-\w\.]+)/i], [d, f], [/\bgsa\/([\w\.]+) .*safari\//i], [f, [d, "GSA"]], [/musical_ly(?:.+app_?version\/|_)([\w\.]+)/i], [f, [d, "TikTok"]], [/headlesschrome(?:\/([\w\.]+)| )/i], [f, [d, T + " Headless"]], [/ wv\).+(chrome)\/([\w\.]+)/i], [[d, T + " WebView"], f], [/droid.+ version\/([\w\.]+)\b.+(?:mobile safari|safari)/i], [f, [d, "Android " + A]], [/(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w\.]+)/i], [d, f], [/version\/([\w\.\,]+) .*mobile\/\w+ (safari)/i], [f, [d, "Mobile Safari"]], [/version\/([\w(\.|\,)]+) .*(mobile ?safari|safari)/i], [f, d], [/webkit.+?(mobile ?safari|safari)(\/[\w\.]+)/i], [d, [f, F, { "1.0": "/8", 1.2: "/1", 1.3: "/3", "2.0": "/412", "2.0.2": "/416", "2.0.3": "/417", "2.0.4": "/419", "?": "/" }]], [/(webkit|khtml)\/([\w\.]+)/i], [d, f], [/(navigator|netscape\d?)\/([-\w\.]+)/i], [[d, "Netscape"], f], [/mobile vr; rv:([\w\.]+)\).+firefox/i], [f, [d, R + " Reality"]], [/ekiohf.+(flow)\/([\w\.]+)/i, /(swiftfox)/i, /(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror|klar)[\/ ]?([\w\.\+]+)/i, /(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w\.]+)$/i, /(firefox)\/([\w\.]+)/i, /(mozilla)\/([\w\.]+) .+rv\:.+gecko\/\d+/i, /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir|obigo|mosaic|(?:go|ice|up)[\. ]?browser)[-\/ ]?v?([\w\.]+)/i, /(links) \(([\w\.]+)/i, /panasonic;(viera)/i], [d, f], [/(cobalt)\/([\w\.]+)/i], [d, [f, /master.|lts./, ""]]], cpu: [[/(?:(amd|x(?:(?:86|64)[-_])?|wow|win)64)[;\)]/i], [[g, "amd64"]], [/(ia32(?=;))/i], [[g, J]], [/((?:i[346]|x)86)[;\)]/i], [[g, "ia32"]], [/\b(aarch64|arm(v?8e?l?|_?64))\b/i], [[g, "arm64"]], [/\b(arm(?:v[67])?ht?n?[fl]p?)\b/i], [[g, "armhf"]], [/windows (ce|mobile); ppc;/i], [[g, "arm"]], [/((?:ppc|powerpc)(?:64)?)(?: mac|;|\))/i], [[g, /ower/, "", J]], [/(sun4\w)[;\)]/i], [[g, "sparc"]], [/((?:avr32|ia64(?=;))|68k(?=\))|\barm(?=v(?:[1-7]|[5-7]1)l?|;|eabi)|(?=atmel )avr|(?:irix|mips|sparc)(?:64)?\b|pa-risc)/i], [[g, J]]], device: [[/\b(sch-i[89]0\d|shw-m380s|sm-[ptx]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i], [u, [h, U], [p, b]], [/\b((?:s[cgp]h|gt|sm)-\w+|sc[g-]?[\d]+a?|galaxy nexus)/i, /samsung[- ]([-\w]+)/i, /sec-(sgh\w+)/i], [u, [h, U], [p, y]], [/(?:\/|\()(ip(?:hone|od)[\w, ]*)(?:\/|;)/i], [u, [h, S], [p, y]], [/\((ipad);[-\w\),; ]+apple/i, /applecoremedia\/[\w\.]+ \((ipad)/i, /\b(ipad)\d\d?,\d\d?[;\]].+ios/i], [u, [h, S], [p, b]], [/(macintosh);/i], [u, [h, S]], [/\b(sh-?[altvz]?\d\d[a-ekm]?)/i], [u, [h, D], [p, y]], [/\b((?:ag[rs][23]?|bah2?|sht?|btv)-a?[lw]\d{2})\b(?!.+d\/s)/i], [u, [h, P], [p, b]], [/(?:huawei|honor)([-\w ]+)[;\)]/i, /\b(nexus 6p|\w{2,4}e?-[atu]?[ln][\dx][012359c][adn]?)\b(?!.+d\/s)/i], [u, [h, P], [p, y]], [/\b(poco[\w ]+)(?: bui|\))/i, /\b; (\w+) build\/hm\1/i, /\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i, /\b(redmi[\-_ ]?(?:note|k)?[\w_ ]+)(?: bui|\))/i, /\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max|cc)?[_ ]?(?:\d?\w?)[_ ]?(?:plus|se|lite)?)(?: bui|\))/i], [[u, /_/g, " "], [h, $], [p, y]], [/\b(mi[-_ ]?(?:pad)(?:[\w_ ]+))(?: bui|\))/i], [[u, /_/g, " "], [h, $], [p, b]], [/; (\w+) bui.+ oppo/i, /\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007|a101op)\b/i], [u, [h, "OPPO"], [p, y]], [/vivo (\w+)(?: bui|\))/i, /\b(v[12]\d{3}\w?[at])(?: bui|;)/i], [u, [h, "Vivo"], [p, y]], [/\b(rmx[12]\d{3})(?: bui|;|\))/i], [u, [h, "Realme"], [p, y]], [/\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i, /\bmot(?:orola)?[- ](\w*)/i, /((?:moto[\w\(\) ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i], [u, [h, I], [p, y]], [/\b(mz60\d|xoom[2 ]{0,2}) build\//i], [u, [h, I], [p, b]], [/((?=lg)?[vl]k\-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i], [u, [h, "LG"], [p, b]], [/(lm(?:-?f100[nv]?|-[\w\.]+)(?= bui|\))|nexus [45])/i, /\blg[-e;\/ ]+((?!browser|netcast|android tv)\w+)/i, /\blg-?([\d\w]+) bui/i], [u, [h, "LG"], [p, y]], [/(ideatab[-\w ]+)/i, /lenovo ?(s[56]000[-\w]+|tab(?:[\w ]+)|yt[-\d\w]{6}|tb[-\d\w]{6})/i], [u, [h, "Lenovo"], [p, b]], [/(?:maemo|nokia).*(n900|lumia \d+)/i, /nokia[-_ ]?([-\w\.]*)/i], [[u, /_/g, " "], [h, "Nokia"], [p, y]], [/(pixel c)\b/i], [u, [h, C], [p, b]], [/droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i], [u, [h, C], [p, y]], [/droid.+ (a?\d[0-2]{2}so|[c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]{0,1}\d\.))/i], [u, [h, j], [p, y]], [/sony tablet [ps]/i, /\b(?:sony)?sgp\w+(?: bui|\))/i], [[u, "Xperia Tablet"], [h, j], [p, b]], [/ (kb2005|in20[12]5|be20[12][59])\b/i, /(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i], [u, [h, "OnePlus"], [p, y]], [/(alexa)webm/i, /(kf[a-z]{2}wi|aeo[c-r]{2})( bui|\))/i, /(kf[a-z]+)( bui|\)).+silk\//i], [u, [h, E], [p, b]], [/((?:sd|kf)[0349hijorstuw]+)( bui|\)).+silk\//i], [[u, /(.+)/g, "Fire Phone $1"], [h, E], [p, y]], [/(playbook);[-\w\),; ]+(rim)/i], [u, h, [p, b]], [/\b((?:bb[a-f]|st[hv])100-\d)/i, /\(bb10; (\w+)/i], [u, [h, x], [p, y]], [/(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i], [u, [h, k], [p, b]], [/ (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i], [u, [h, k], [p, y]], [/(nexus 9)/i], [u, [h, "HTC"], [p, b]], [/(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i, /(zte)[- ]([\w ]+?)(?: bui|\/|\))/i, /(alcatel|geeksphone|nexian|panasonic(?!(?:;|\.))|sony(?!-bra))[-_ ]?([-\w]*)/i], [h, [u, /_/g, " "], [p, y]], [/droid.+; ([ab][1-7]-?[0178a]\d\d?)/i], [u, [h, "Acer"], [p, b]], [/droid.+; (m[1-5] note) bui/i, /\bmz-([-\w]{2,})/i], [u, [h, "Meizu"], [p, y]], [/(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron)[-_ ]?([-\w]*)/i, /(hp) ([\w ]+\w)/i, /(asus)-?(\w+)/i, /(microsoft); (lumia[\w ]+)/i, /(lenovo)[-_ ]?([-\w]+)/i, /(jolla)/i, /(oppo) ?([\w ]+) bui/i], [h, u, [p, y]], [/(kobo)\s(ereader|touch)/i, /(archos) (gamepad2?)/i, /(hp).+(touchpad(?!.+tablet)|tablet)/i, /(kindle)\/([\w\.]+)/i, /(nook)[\w ]+build\/(\w+)/i, /(dell) (strea[kpr\d ]*[\dko])/i, /(le[- ]+pan)[- ]+(\w{1,9}) bui/i, /(trinity)[- ]*(t\d{3}) bui/i, /(gigaset)[- ]+(q\w{1,9}) bui/i, /(vodafone) ([\w ]+)(?:\)| bui)/i], [h, u, [p, b]], [/(surface duo)/i], [u, [h, O], [p, b]], [/droid [\d\.]+; (fp\du?)(?: b|\))/i], [u, [h, "Fairphone"], [p, y]], [/(u304aa)/i], [u, [h, "AT&T"], [p, y]], [/\bsie-(\w*)/i], [u, [h, "Siemens"], [p, y]], [/\b(rct\w+) b/i], [u, [h, "RCA"], [p, b]], [/\b(venue[\d ]{2,7}) b/i], [u, [h, "Dell"], [p, b]], [/\b(q(?:mv|ta)\w+) b/i], [u, [h, "Verizon"], [p, b]], [/\b(?:barnes[& ]+noble |bn[rt])([\w\+ ]*) b/i], [u, [h, "Barnes & Noble"], [p, b]], [/\b(tm\d{3}\w+) b/i], [u, [h, "NuVision"], [p, b]], [/\b(k88) b/i], [u, [h, "ZTE"], [p, b]], [/\b(nx\d{3}j) b/i], [u, [h, "ZTE"], [p, y]], [/\b(gen\d{3}) b.+49h/i], [u, [h, "Swiss"], [p, y]], [/\b(zur\d{3}) b/i], [u, [h, "Swiss"], [p, b]], [/\b((zeki)?tb.*\b) b/i], [u, [h, "Zeki"], [p, b]], [/\b([yr]\d{2}) b/i, /\b(dragon[- ]+touch |dt)(\w{5}) b/i], [[h, "Dragon Touch"], u, [p, b]], [/\b(ns-?\w{0,9}) b/i], [u, [h, "Insignia"], [p, b]], [/\b((nxa|next)-?\w{0,9}) b/i], [u, [h, "NextBook"], [p, b]], [/\b(xtreme\_)?(v(1[045]|2[015]|[3469]0|7[05])) b/i], [[h, "Voice"], u, [p, y]], [/\b(lvtel\-)?(v1[12]) b/i], [[h, "LvTel"], u, [p, y]], [/\b(ph-1) /i], [u, [h, "Essential"], [p, y]], [/\b(v(100md|700na|7011|917g).*\b) b/i], [u, [h, "Envizen"], [p, b]], [/\b(trio[-\w\. ]+) b/i], [u, [h, "MachSpeed"], [p, b]], [/\btu_(1491) b/i], [u, [h, "Rotor"], [p, b]], [/(shield[\w ]+) b/i], [u, [h, "Nvidia"], [p, b]], [/(sprint) (\w+)/i], [h, u, [p, y]], [/(kin\.[onetw]{3})/i], [[u, /\./g, " "], [h, O], [p, y]], [/droid.+; (cc6666?|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i], [u, [h, L], [p, b]], [/droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i], [u, [h, L], [p, y]], [/smart-tv.+(samsung)/i], [h, [p, w]], [/hbbtv.+maple;(\d+)/i], [[u, /^/, "SmartTV"], [h, U], [p, w]], [/(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i], [[h, "LG"], [p, w]], [/(apple) ?tv/i], [h, [u, S + " TV"], [p, w]], [/crkey/i], [[u, T + "cast"], [h, C], [p, w]], [/droid.+aft(\w)( bui|\))/i], [u, [h, E], [p, w]], [/\(dtv[\);].+(aquos)/i, /(aquos-tv[\w ]+)\)/i], [u, [h, D], [p, w]], [/(bravia[\w ]+)( bui|\))/i], [u, [h, j], [p, w]], [/(mitv-\w{5}) bui/i], [u, [h, $], [p, w]], [/Hbbtv.*(technisat) (.*);/i], [h, u, [p, w]], [/\b(roku)[\dx]*[\)\/]((?:dvp-)?[\d\.]*)/i, /hbbtv\/\d+\.\d+\.\d+ +\([\w\+ ]*; *([\w\d][^;]*);([^;]*)/i], [[h, V], [u, V], [p, w]], [/\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i], [[p, w]], [/(ouya)/i, /(nintendo) ([wids3utch]+)/i], [h, u, [p, m]], [/droid.+; (shield) bui/i], [u, [h, "Nvidia"], [p, m]], [/(playstation [345portablevi]+)/i], [u, [h, j], [p, m]], [/\b(xbox(?: one)?(?!; xbox))[\); ]/i], [u, [h, O], [p, m]], [/((pebble))app/i], [h, u, [p, v]], [/(watch)(?: ?os[,\/]|\d,\d\/)[\d\.]+/i], [u, [h, S], [p, v]], [/droid.+; (glass) \d/i], [u, [h, C], [p, v]], [/droid.+; (wt63?0{2,3})\)/i], [u, [h, L], [p, v]], [/(quest( 2| pro)?)/i], [u, [h, M], [p, v]], [/(tesla)(?: qtcarbrowser|\/[-\w\.]+)/i], [h, [p, _]], [/(aeobc)\b/i], [u, [h, E], [p, _]], [/droid .+?; ([^;]+?)(?: bui|\) applew).+? mobile safari/i], [u, [p, y]], [/droid .+?; ([^;]+?)(?: bui|\) applew).+?(?! mobile) safari/i], [u, [p, b]], [/\b((tablet|tab)[;\/]|focus\/\d(?!.+mobile))/i], [[p, b]], [/(phone|mobile(?:[;\/]| [ \w\/\.]*safari)|pda(?=.+windows ce))/i], [[p, y]], [/(android[-\w\. ]{0,9});.+buil/i], [u, [h, "Generic"]]], engine: [[/windows.+ edge\/([\w\.]+)/i], [f, [d, "EdgeHTML"]], [/webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i], [f, [d, "Blink"]], [/(presto)\/([\w\.]+)/i, /(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w\.]+)/i, /ekioh(flow)\/([\w\.]+)/i, /(khtml|tasman|links)[\/ ]\(?([\w\.]+)/i, /(icab)[\/ ]([23]\.[\d\.]+)/i, /\b(libweb)/i], [d, f], [/rv\:([\w\.]{1,9})\b.+(gecko)/i], [f, d]], os: [[/microsoft (windows) (vista|xp)/i], [d, f], [/(windows) nt 6\.2; (arm)/i, /(windows (?:phone(?: os)?|mobile))[\/ ]?([\d\.\w ]*)/i, /(windows)[\/ ]?([ntce\d\. ]+\w)(?!.+xbox)/i], [d, [f, F, G]], [/(win(?=3|9|n)|win 9x )([nt\d\.]+)/i], [[d, "Windows"], [f, F, G]], [/ip[honead]{2,4}\b(?:.*os ([\w]+) like mac|; opera)/i, /ios;fbsv\/([\d\.]+)/i, /cfnetwork\/.+darwin/i], [[f, /_/g, "."], [d, "iOS"]], [/(mac os x) ?([\w\. ]*)/i, /(macintosh|mac_powerpc\b)(?!.+haiku)/i], [[d, W], [f, /_/g, "."]], [/droid ([\w\.]+)\b.+(android[- ]x86|harmonyos)/i], [f, d], [/(android|webos|qnx|bada|rim tablet os|maemo|meego|sailfish)[-\/ ]?([\w\.]*)/i, /(blackberry)\w*\/([\w\.]*)/i, /(tizen|kaios)[\/ ]([\w\.]+)/i, /\((series40);/i], [d, f], [/\(bb(10);/i], [f, [d, x]], [/(?:symbian ?os|symbos|s60(?=;)|series60)[-\/ ]?([\w\.]*)/i], [f, [d, "Symbian"]], [/mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i], [f, [d, R + " OS"]], [/web0s;.+rt(tv)/i, /\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i], [f, [d, "webOS"]], [/watch(?: ?os[,\/]|\d,\d\/)([\d\.]+)/i], [f, [d, "watchOS"]], [/crkey\/([\d\.]+)/i], [f, [d, T + "cast"]], [/(cros) [\w]+(?:\)| ([\w\.]+)\b)/i], [[d, H], f], [/panasonic;(viera)/i, /(netrange)mmh/i, /(nettv)\/(\d+\.[\w\.]+)/i, /(nintendo|playstation) ([wids345portablevuch]+)/i, /(xbox); +xbox ([^\);]+)/i, /\b(joli|palm)\b ?(?:os)?\/?([\w\.]*)/i, /(mint)[\/\(\) ]?(\w*)/i, /(mageia|vectorlinux)[; ]/i, /([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i, /(hurd|linux) ?([\w\.]*)/i, /(gnu) ?([\w\.]*)/i, /\b([-frentopcghs]{0,5}bsd|dragonfly)[\/ ]?(?!amd|[ix346]{1,2}86)([\w\.]*)/i, /(haiku) (\w+)/i], [d, f], [/(sunos) ?([\w\.\d]*)/i], [[d, "Solaris"], f], [/((?:open)?solaris)[-\/ ]?([\w\.]*)/i, /(aix) ((\d)(?=\.|\)| )[\w\.])*/i, /\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux|serenityos)/i, /(unix) ?([\w\.]*)/i], [d, f]] }, Y = function(e2, t3) {
            if (typeof e2 === s && (t3 = e2, e2 = void 0), !(this instanceof Y)) return new Y(e2, t3).getResult();
            var r3 = typeof n2 !== o && n2.navigator ? n2.navigator : void 0, i3 = e2 || (r3 && r3.userAgent ? r3.userAgent : ""), m2 = r3 && r3.userAgentData ? r3.userAgentData : void 0, w2 = t3 ? K(X, t3) : X, v2 = r3 && r3.userAgent == i3;
            return this.getBrowser = function() {
              var e3, t4 = {};
              return t4[d] = void 0, t4[f] = void 0, z.call(t4, i3, w2.browser), t4[l] = typeof (e3 = t4[f]) === c ? e3.replace(/[^\d\.]/g, "").split(".")[0] : void 0, v2 && r3 && r3.brave && typeof r3.brave.isBrave == a2 && (t4[d] = "Brave"), t4;
            }, this.getCPU = function() {
              var e3 = {};
              return e3[g] = void 0, z.call(e3, i3, w2.cpu), e3;
            }, this.getDevice = function() {
              var e3 = {};
              return e3[h] = void 0, e3[u] = void 0, e3[p] = void 0, z.call(e3, i3, w2.device), v2 && !e3[p] && m2 && m2.mobile && (e3[p] = y), v2 && "Macintosh" == e3[u] && r3 && typeof r3.standalone !== o && r3.maxTouchPoints && r3.maxTouchPoints > 2 && (e3[u] = "iPad", e3[p] = b), e3;
            }, this.getEngine = function() {
              var e3 = {};
              return e3[d] = void 0, e3[f] = void 0, z.call(e3, i3, w2.engine), e3;
            }, this.getOS = function() {
              var e3 = {};
              return e3[d] = void 0, e3[f] = void 0, z.call(e3, i3, w2.os), v2 && !e3[d] && m2 && "Unknown" != m2.platform && (e3[d] = m2.platform.replace(/chrome os/i, H).replace(/macos/i, W)), e3;
            }, this.getResult = function() {
              return { ua: this.getUA(), browser: this.getBrowser(), engine: this.getEngine(), os: this.getOS(), device: this.getDevice(), cpu: this.getCPU() };
            }, this.getUA = function() {
              return i3;
            }, this.setUA = function(e3) {
              return i3 = typeof e3 === c && e3.length > 350 ? V(e3, 350) : e3, this;
            }, this.setUA(i3), this;
          };
          if (Y.VERSION = "1.0.35", Y.BROWSER = B([d, f, l]), Y.CPU = B([g]), Y.DEVICE = B([u, h, p, m, y, w, b, v, _]), Y.ENGINE = Y.OS = B([d, f]), typeof r2 !== o) t2.exports && (r2 = t2.exports = Y), r2.UAParser = Y;
          else if (typeof define === a2 && define.amd) e.r, void 0 !== Y && e.v(Y);
          else typeof n2 !== o && (n2.UAParser = Y);
          var Q = typeof n2 !== o && (n2.jQuery || n2.Zepto);
          if (Q && !Q.ua) {
            var Z = new Y();
            Q.ua = Z.getResult(), Q.ua.get = function() {
              return Z.getUA();
            }, Q.ua.set = function(e2) {
              Z.setUA(e2);
              var t3 = Z.getResult();
              for (var r3 in t3) Q.ua[r3] = t3[r3];
            };
          }
        }(this);
      } }, i = {};
      function a(e2) {
        var t2 = i[e2];
        if (void 0 !== t2) return t2.exports;
        var r2 = i[e2] = { exports: {} }, o = true;
        try {
          n[e2].call(r2.exports, r2, r2.exports, a), o = false;
        } finally {
          o && delete i[e2];
        }
        return r2.exports;
      }
      a.ab = "/ROOT/node_modules/next/dist/compiled/ua-parser-js/", t.exports = a(226);
    }, 8946, (e, t, r) => {
      "use strict";
      var n = { H: null, A: null };
      function i(e2) {
        var t2 = "https://react.dev/errors/" + e2;
        if (1 < arguments.length) {
          t2 += "?args[]=" + encodeURIComponent(arguments[1]);
          for (var r2 = 2; r2 < arguments.length; r2++) t2 += "&args[]=" + encodeURIComponent(arguments[r2]);
        }
        return "Minified React error #" + e2 + "; visit " + t2 + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
      }
      var a = Array.isArray;
      function o() {
      }
      var s = Symbol.for("react.transitional.element"), c = Symbol.for("react.portal"), l = Symbol.for("react.fragment"), u = Symbol.for("react.strict_mode"), d = Symbol.for("react.profiler"), p = Symbol.for("react.forward_ref"), h = Symbol.for("react.suspense"), f = Symbol.for("react.memo"), g = Symbol.for("react.lazy"), m = Symbol.for("react.activity"), y = Symbol.for("react.view_transition"), b = Symbol.iterator, w = Object.prototype.hasOwnProperty, v = Object.assign;
      function _(e2, t2, r2) {
        var n2 = r2.ref;
        return { $$typeof: s, type: e2, key: t2, ref: void 0 !== n2 ? n2 : null, props: r2 };
      }
      function E(e2) {
        return "object" == typeof e2 && null !== e2 && e2.$$typeof === s;
      }
      var S = /\/+/g;
      function k(e2, t2) {
        var r2, n2;
        return "object" == typeof e2 && null !== e2 && null != e2.key ? (r2 = "" + e2.key, n2 = { "=": "=0", ":": "=2" }, "$" + r2.replace(/[=:]/g, function(e3) {
          return n2[e3];
        })) : t2.toString(36);
      }
      function x(e2, t2, r2) {
        if (null == e2) return e2;
        var n2 = [], l2 = 0;
        return !function e3(t3, r3, n3, l3, u2) {
          var d2, p2, h2, f2 = typeof t3;
          ("undefined" === f2 || "boolean" === f2) && (t3 = null);
          var m2 = false;
          if (null === t3) m2 = true;
          else switch (f2) {
            case "bigint":
            case "string":
            case "number":
              m2 = true;
              break;
            case "object":
              switch (t3.$$typeof) {
                case s:
                case c:
                  m2 = true;
                  break;
                case g:
                  return e3((m2 = t3._init)(t3._payload), r3, n3, l3, u2);
              }
          }
          if (m2) return u2 = u2(t3), m2 = "" === l3 ? "." + k(t3, 0) : l3, a(u2) ? (n3 = "", null != m2 && (n3 = m2.replace(S, "$&/") + "/"), e3(u2, r3, n3, "", function(e4) {
            return e4;
          })) : null != u2 && (E(u2) && (d2 = u2, p2 = n3 + (null == u2.key || t3 && t3.key === u2.key ? "" : ("" + u2.key).replace(S, "$&/") + "/") + m2, u2 = _(d2.type, p2, d2.props)), r3.push(u2)), 1;
          m2 = 0;
          var y2 = "" === l3 ? "." : l3 + ":";
          if (a(t3)) for (var w2 = 0; w2 < t3.length; w2++) f2 = y2 + k(l3 = t3[w2], w2), m2 += e3(l3, r3, n3, f2, u2);
          else if ("function" == typeof (w2 = null === (h2 = t3) || "object" != typeof h2 ? null : "function" == typeof (h2 = b && h2[b] || h2["@@iterator"]) ? h2 : null)) for (t3 = w2.call(t3), w2 = 0; !(l3 = t3.next()).done; ) f2 = y2 + k(l3 = l3.value, w2++), m2 += e3(l3, r3, n3, f2, u2);
          else if ("object" === f2) {
            if ("function" == typeof t3.then) return e3(function(e4) {
              switch (e4.status) {
                case "fulfilled":
                  return e4.value;
                case "rejected":
                  throw e4.reason;
                default:
                  switch ("string" == typeof e4.status ? e4.then(o, o) : (e4.status = "pending", e4.then(function(t4) {
                    "pending" === e4.status && (e4.status = "fulfilled", e4.value = t4);
                  }, function(t4) {
                    "pending" === e4.status && (e4.status = "rejected", e4.reason = t4);
                  })), e4.status) {
                    case "fulfilled":
                      return e4.value;
                    case "rejected":
                      throw e4.reason;
                  }
              }
              throw e4;
            }(t3), r3, n3, l3, u2);
            throw Error(i(31, "[object Object]" === (r3 = String(t3)) ? "object with keys {" + Object.keys(t3).join(", ") + "}" : r3));
          }
          return m2;
        }(e2, n2, "", "", function(e3) {
          return t2.call(r2, e3, l2++);
        }), n2;
      }
      function A(e2) {
        if (-1 === e2._status) {
          var t2 = e2._result;
          (t2 = t2()).then(function(t3) {
            (0 === e2._status || -1 === e2._status) && (e2._status = 1, e2._result = t3);
          }, function(t3) {
            (0 === e2._status || -1 === e2._status) && (e2._status = 2, e2._result = t3);
          }), -1 === e2._status && (e2._status = 0, e2._result = t2);
        }
        if (1 === e2._status) return e2._result.default;
        throw e2._result;
      }
      function T() {
        return /* @__PURE__ */ new WeakMap();
      }
      function R() {
        return { s: 0, v: void 0, o: null, p: null };
      }
      r.Activity = m, r.Children = { map: x, forEach: function(e2, t2, r2) {
        x(e2, function() {
          t2.apply(this, arguments);
        }, r2);
      }, count: function(e2) {
        var t2 = 0;
        return x(e2, function() {
          t2++;
        }), t2;
      }, toArray: function(e2) {
        return x(e2, function(e3) {
          return e3;
        }) || [];
      }, only: function(e2) {
        if (!E(e2)) throw Error(i(143));
        return e2;
      } }, r.Fragment = l, r.Profiler = d, r.StrictMode = u, r.Suspense = h, r.ViewTransition = y, r.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = n, r.cache = function(e2) {
        return function() {
          var t2 = n.A;
          if (!t2) return e2.apply(null, arguments);
          var r2 = t2.getCacheForType(T);
          void 0 === (t2 = r2.get(e2)) && (t2 = R(), r2.set(e2, t2)), r2 = 0;
          for (var i2 = arguments.length; r2 < i2; r2++) {
            var a2 = arguments[r2];
            if ("function" == typeof a2 || "object" == typeof a2 && null !== a2) {
              var o2 = t2.o;
              null === o2 && (t2.o = o2 = /* @__PURE__ */ new WeakMap()), void 0 === (t2 = o2.get(a2)) && (t2 = R(), o2.set(a2, t2));
            } else null === (o2 = t2.p) && (t2.p = o2 = /* @__PURE__ */ new Map()), void 0 === (t2 = o2.get(a2)) && (t2 = R(), o2.set(a2, t2));
          }
          if (1 === t2.s) return t2.v;
          if (2 === t2.s) throw t2.v;
          try {
            var s2 = e2.apply(null, arguments);
            return (r2 = t2).s = 1, r2.v = s2;
          } catch (e3) {
            throw (s2 = t2).s = 2, s2.v = e3, e3;
          }
        };
      }, r.cacheSignal = function() {
        var e2 = n.A;
        return e2 ? e2.cacheSignal() : null;
      }, r.captureOwnerStack = function() {
        return null;
      }, r.cloneElement = function(e2, t2, r2) {
        if (null == e2) throw Error(i(267, e2));
        var n2 = v({}, e2.props), a2 = e2.key;
        if (null != t2) for (o2 in void 0 !== t2.key && (a2 = "" + t2.key), t2) w.call(t2, o2) && "key" !== o2 && "__self" !== o2 && "__source" !== o2 && ("ref" !== o2 || void 0 !== t2.ref) && (n2[o2] = t2[o2]);
        var o2 = arguments.length - 2;
        if (1 === o2) n2.children = r2;
        else if (1 < o2) {
          for (var s2 = Array(o2), c2 = 0; c2 < o2; c2++) s2[c2] = arguments[c2 + 2];
          n2.children = s2;
        }
        return _(e2.type, a2, n2);
      }, r.createElement = function(e2, t2, r2) {
        var n2, i2 = {}, a2 = null;
        if (null != t2) for (n2 in void 0 !== t2.key && (a2 = "" + t2.key), t2) w.call(t2, n2) && "key" !== n2 && "__self" !== n2 && "__source" !== n2 && (i2[n2] = t2[n2]);
        var o2 = arguments.length - 2;
        if (1 === o2) i2.children = r2;
        else if (1 < o2) {
          for (var s2 = Array(o2), c2 = 0; c2 < o2; c2++) s2[c2] = arguments[c2 + 2];
          i2.children = s2;
        }
        if (e2 && e2.defaultProps) for (n2 in o2 = e2.defaultProps) void 0 === i2[n2] && (i2[n2] = o2[n2]);
        return _(e2, a2, i2);
      }, r.createRef = function() {
        return { current: null };
      }, r.forwardRef = function(e2) {
        return { $$typeof: p, render: e2 };
      }, r.isValidElement = E, r.lazy = function(e2) {
        return { $$typeof: g, _payload: { _status: -1, _result: e2 }, _init: A };
      }, r.memo = function(e2, t2) {
        return { $$typeof: f, type: e2, compare: void 0 === t2 ? null : t2 };
      }, r.use = function(e2) {
        return n.H.use(e2);
      }, r.useCallback = function(e2, t2) {
        return n.H.useCallback(e2, t2);
      }, r.useDebugValue = function() {
      }, r.useId = function() {
        return n.H.useId();
      }, r.useMemo = function(e2, t2) {
        return n.H.useMemo(e2, t2);
      }, r.version = "19.3.0-canary-f93b9fd4-20251217";
    }, 40049, (e, t, r) => {
      "use strict";
      t.exports = e.r(8946);
    }, 91375, (e) => {
      "use strict";
      let t = (0, e.i(90044).createAsyncLocalStorage)();
      e.s([], 92999), e.i(92999), e.s(["actionAsyncStorage", 0, t], 91375);
    }, 24628, 46478, 7754, 9939, 25753, 53835, 18368, 80082, 51564, 81828, 63072, 16852, 75982, 68585, 96588, (e) => {
      "use strict";
      let t = "next-router-prefetch", r = ["rsc", "next-router-state-tree", t, "next-hmr-refresh", "next-router-segment-prefetch"];
      e.s(["FLIGHT_HEADERS", 0, r, "NEXT_REWRITTEN_PATH_HEADER", 0, "x-nextjs-rewritten-path", "NEXT_REWRITTEN_QUERY_HEADER", 0, "x-nextjs-rewritten-query", "NEXT_ROUTER_PREFETCH_HEADER", 0, t, "NEXT_RSC_UNION_QUERY", 0, "_rsc", "RSC_HEADER", 0, "rsc"], 24628);
      var n, i, a = e.i(90044);
      let o = (0, a.createAsyncLocalStorage)();
      e.s(["workAsyncStorageInstance", 0, o], 46478), e.s([], 7754);
      let s = (0, a.createAsyncLocalStorage)();
      e.s(["workUnitAsyncStorageInstance", 0, s], 9939);
      class c extends Error {
        constructor(e2, t2) {
          super(`Invariant: ${e2.endsWith(".") ? e2 : e2 + "."} This is a bug in Next.js.`, t2), this.name = "InvariantError";
        }
      }
      function l(e2) {
        throw Object.defineProperty(Error(`\`${e2}\` was called outside a request scope. Read more: https://nextjs.org/docs/messages/next-dynamic-api-wrong-context`), "__NEXT_ERROR_CODE", { value: "E251", enumerable: false, configurable: true });
      }
      e.s(["InvariantError", () => c], 25753), e.s(["throwForMissingRequestStore", () => l], 53835);
      var u = e.i(40049);
      let d = "DYNAMIC_SERVER_USAGE";
      class p extends Error {
        constructor(e2) {
          super(`Dynamic server usage: ${e2}`), this.description = e2, this.digest = d;
        }
      }
      function h(e2) {
        return "object" == typeof e2 && null !== e2 && "digest" in e2 && "string" == typeof e2.digest && e2.digest === d;
      }
      e.s(["DynamicServerError", () => p, "isDynamicServerError", () => h], 18368);
      class f extends Error {
        constructor(...e2) {
          super(...e2), this.code = "NEXT_STATIC_GEN_BAILOUT";
        }
      }
      function g(e2) {
        return "object" == typeof e2 && null !== e2 && "digest" in e2 && e2.digest === m;
      }
      e.s(["StaticGenBailoutError", () => f], 80082);
      let m = "HANGING_PROMISE_REJECTION";
      class y extends Error {
        constructor(e2, t2) {
          super(`During prerendering, ${t2} rejects when the prerender is complete. Typically these errors are handled by React but if you move ${t2} to a different context by using \`setTimeout\`, \`after\`, or similar functions you may observe this error and you should handle it in that context. This occurred at route "${e2}".`), this.route = e2, this.expression = t2, this.digest = m;
        }
      }
      let b = /* @__PURE__ */ new WeakMap();
      function w(e2, t2, r2) {
        if (e2.aborted) return Promise.reject(new y(t2, r2));
        {
          let n2 = new Promise((n3, i2) => {
            let a2 = i2.bind(null, new y(t2, r2)), o2 = b.get(e2);
            if (o2) o2.push(a2);
            else {
              let t3 = [a2];
              b.set(e2, t3), e2.addEventListener("abort", () => {
                for (let e3 = 0; e3 < t3.length; e3++) t3[e3]();
              }, { once: true });
            }
          });
          return n2.catch(v), n2;
        }
      }
      function v() {
      }
      function _(e2, t2, r2) {
        return t2.stagedRendering ? t2.stagedRendering.delayUntilStage(r2, void 0, e2) : new Promise((t3) => {
          setTimeout(() => {
            t3(e2);
          }, 0);
        });
      }
      function E(e2) {
        return "object" == typeof e2 && null !== e2 && "digest" in e2 && "BAILOUT_TO_CLIENT_SIDE_RENDERING" === e2.digest;
      }
      e.s(["isHangingPromiseRejectionError", () => g, "makeDevtoolsIOAwarePromise", () => _, "makeHangingPromise", () => w], 51564), e.s(["isBailoutToCSRError", () => E], 81828);
      let S = "function" == typeof u.default.unstable_postpone;
      function k(e2, t2, r2) {
        let n2 = Object.defineProperty(new p(`Route ${t2.route} couldn't be rendered statically because it used \`${e2}\`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error`), "__NEXT_ERROR_CODE", { value: "E558", enumerable: false, configurable: true });
        throw r2.revalidate = 0, t2.dynamicUsageDescription = e2, t2.dynamicUsageStack = n2.stack, n2;
      }
      function x(e2) {
        switch (e2.type) {
          case "cache":
          case "unstable-cache":
          case "private-cache":
            return;
        }
      }
      function A(e2, t2, r2, n2) {
        if (false === n2.controller.signal.aborted) {
          let i2, a2;
          i2 = I(`Route ${e2} needs to bail out of prerendering at this point because it used ${t2}.`), n2.controller.abort(i2), (a2 = n2.dynamicTracking) && a2.dynamicAccesses.push({ stack: a2.isDebugDynamicAccesses ? Error().stack : void 0, expression: t2 });
          let o2 = n2.dynamicTracking;
          o2 && null === o2.syncDynamicErrorWithStack && (o2.syncDynamicErrorWithStack = r2);
        }
        throw I(`Route ${e2} needs to bail out of prerendering at this point because it used ${t2}.`);
      }
      function T(e2, t2, r2) {
        (function() {
          if (!S) throw Object.defineProperty(Error("Invariant: React.unstable_postpone is not defined. This suggests the wrong version of React was loaded. This is a bug in Next.js"), "__NEXT_ERROR_CODE", { value: "E224", enumerable: false, configurable: true });
        })(), r2 && r2.dynamicAccesses.push({ stack: r2.isDebugDynamicAccesses ? Error().stack : void 0, expression: t2 }), u.default.unstable_postpone(R(e2, t2));
      }
      function R(e2, t2) {
        return `Route ${e2} needs to bail out of prerendering at this point because it used ${t2}. React throws this special object to indicate where. It should not be caught by your own try/catch. Learn more: https://nextjs.org/docs/messages/ppr-caught-error`;
      }
      function C(e2) {
        return "object" == typeof e2 && null !== e2 && "string" == typeof e2.message && P(e2.message);
      }
      function P(e2) {
        return e2.includes("needs to bail out of prerendering at this point because it used") && e2.includes("Learn more: https://nextjs.org/docs/messages/ppr-caught-error");
      }
      if (false === P(R("%%%", "^^^"))) throw Object.defineProperty(Error("Invariant: isDynamicPostpone misidentified a postpone reason. This is a bug in Next.js"), "__NEXT_ERROR_CODE", { value: "E296", enumerable: false, configurable: true });
      let O = "NEXT_PRERENDER_INTERRUPTED";
      function I(e2) {
        let t2 = Object.defineProperty(Error(e2), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        return t2.digest = O, t2;
      }
      function N(e2) {
        return "object" == typeof e2 && null !== e2 && e2.digest === O && "name" in e2 && "message" in e2 && e2 instanceof Error;
      }
      function U(e2, t2) {
        return e2.runtimeStagePromise ? e2.runtimeStagePromise.then(() => t2) : t2;
      }
      RegExp(`\\n\\s+at Suspense \\(<anonymous>\\)(?:(?!\\n\\s+at (?:body|div|main|section|article|aside|header|footer|nav|form|p|span|h1|h2|h3|h4|h5|h6) \\(<anonymous>\\))[\\s\\S])*?\\n\\s+at __next_root_layout_boundary__ \\([^\\n]*\\)`), RegExp(`\\n\\s+at __next_metadata_boundary__[\\n\\s]`), RegExp(`\\n\\s+at __next_viewport_boundary__[\\n\\s]`), RegExp(`\\n\\s+at __next_outlet_boundary__[\\n\\s]`), e.s(["abortAndThrowOnSynchronousRequestDataAccess", () => A, "delayUntilRuntimeStage", () => U, "isDynamicPostpone", () => C, "isPrerenderInterruptedError", () => N, "postponeWithTracking", () => T, "throwToInterruptStaticGeneration", () => k, "trackDynamicDataInDynamicRender", () => x], 63072);
      var D = ((n = {})[n.SeeOther = 303] = "SeeOther", n[n.TemporaryRedirect = 307] = "TemporaryRedirect", n[n.PermanentRedirect = 308] = "PermanentRedirect", n);
      e.s(["RedirectStatusCode", () => D], 16852);
      let j = "NEXT_REDIRECT";
      var $ = ((i = {}).push = "push", i.replace = "replace", i);
      function L(e2) {
        if ("object" != typeof e2 || null === e2 || !("digest" in e2) || "string" != typeof e2.digest) return false;
        let t2 = e2.digest.split(";"), [r2, n2] = t2, i2 = t2.slice(2, -2).join(";"), a2 = Number(t2.at(-2));
        return r2 === j && ("replace" === n2 || "push" === n2) && "string" == typeof i2 && !isNaN(a2) && a2 in D;
      }
      e.s(["REDIRECT_ERROR_CODE", 0, j, "RedirectType", () => $, "isRedirectError", () => L], 75982);
      let M = new Set(Object.values({ NOT_FOUND: 404, FORBIDDEN: 403, UNAUTHORIZED: 401 })), H = "NEXT_HTTP_ERROR_FALLBACK";
      function W(e2) {
        if ("object" != typeof e2 || null === e2 || !("digest" in e2) || "string" != typeof e2.digest) return false;
        let [t2, r2] = e2.digest.split(";");
        return t2 === H && M.has(Number(r2));
      }
      function K(e2) {
        return L(e2) || W(e2);
      }
      e.s(["HTTP_ERROR_FALLBACK_ERROR_CODE", 0, H, "isHTTPAccessFallbackError", () => W], 68585), e.s(["isNextRouterError", () => K], 96588);
    }, 82748, (e) => {
      "use strict";
      var t = e.i(51564);
      let r = Symbol.for("react.postpone");
      var n = e.i(81828), i = e.i(96588), a = e.i(63072), o = e.i(18368);
      e.s(["unstable_rethrow", () => function e2(s) {
        if ((0, i.isNextRouterError)(s) || (0, n.isBailoutToCSRError)(s) || (0, o.isDynamicServerError)(s) || (0, a.isDynamicPostpone)(s) || "object" == typeof s && null !== s && s.$$typeof === r || (0, t.isHangingPromiseRejectionError)(s) || (0, a.isPrerenderInterruptedError)(s)) throw s;
        s instanceof Error && "cause" in s && e2(s.cause);
      }], 82748);
    }, 58217, (e) => {
      "use strict";
      let t, r, n, i, a, o, s;
      async function c() {
        return "_ENTRIES" in globalThis && _ENTRIES.middleware_instrumentation && await _ENTRIES.middleware_instrumentation;
      }
      let l = null;
      async function u() {
        if ("phase-production-build" === process.env.NEXT_PHASE) return;
        l || (l = c());
        let e10 = await l;
        if (null == e10 ? void 0 : e10.register) try {
          await e10.register();
        } catch (e11) {
          throw e11.message = `An error occurred while loading instrumentation hook: ${e11.message}`, e11;
        }
      }
      async function d(...e10) {
        let t10 = await c();
        try {
          var r10;
          await (null == t10 || null == (r10 = t10.onRequestError) ? void 0 : r10.call(t10, ...e10));
        } catch (e11) {
          console.error("Error in instrumentation.onRequestError:", e11);
        }
      }
      let p = null;
      function h() {
        return p || (p = u()), p;
      }
      function f(e10) {
        return `The edge runtime does not support Node.js '${e10}' module.
Learn More: https://nextjs.org/docs/messages/node-module-in-edge-runtime`;
      }
      process !== e.g.process && (process.env = e.g.process.env, e.g.process = process);
      try {
        Object.defineProperty(globalThis, "__import_unsupported", { value: function(e10) {
          let t10 = new Proxy(function() {
          }, { get(t11, r10) {
            if ("then" === r10) return {};
            throw Object.defineProperty(Error(f(e10)), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
          }, construct() {
            throw Object.defineProperty(Error(f(e10)), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
          }, apply(r10, n10, i10) {
            if ("function" == typeof i10[0]) return i10[0](t10);
            throw Object.defineProperty(Error(f(e10)), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
          } });
          return new Proxy({}, { get: () => t10 });
        }, enumerable: false, configurable: false });
      } catch {
      }
      h();
      class g extends Error {
        constructor({ page: e10 }) {
          super(`The middleware "${e10}" accepts an async API directly with the form:
  
  export function middleware(request, event) {
    return NextResponse.redirect('/new-location')
  }
  
  Read more: https://nextjs.org/docs/messages/middleware-new-signature
  `);
        }
      }
      class m extends Error {
        constructor() {
          super(`The request.page has been deprecated in favour of \`URLPattern\`.
  Read more: https://nextjs.org/docs/messages/middleware-request-page
  `);
        }
      }
      class y extends Error {
        constructor() {
          super(`The request.ua has been removed in favour of \`userAgent\` function.
  Read more: https://nextjs.org/docs/messages/middleware-parse-user-agent
  `);
        }
      }
      let b = "_N_T_", w = { shared: "shared", reactServerComponents: "rsc", serverSideRendering: "ssr", actionBrowser: "action-browser", apiNode: "api-node", apiEdge: "api-edge", middleware: "middleware", instrument: "instrument", edgeAsset: "edge-asset", appPagesBrowser: "app-pages-browser", pagesDirBrowser: "pages-dir-browser", pagesDirEdge: "pages-dir-edge", pagesDirNode: "pages-dir-node" };
      function v(e10) {
        var t10, r10, n10, i10, a10, o10 = [], s2 = 0;
        function c2() {
          for (; s2 < e10.length && /\s/.test(e10.charAt(s2)); ) s2 += 1;
          return s2 < e10.length;
        }
        for (; s2 < e10.length; ) {
          for (t10 = s2, a10 = false; c2(); ) if ("," === (r10 = e10.charAt(s2))) {
            for (n10 = s2, s2 += 1, c2(), i10 = s2; s2 < e10.length && "=" !== (r10 = e10.charAt(s2)) && ";" !== r10 && "," !== r10; ) s2 += 1;
            s2 < e10.length && "=" === e10.charAt(s2) ? (a10 = true, s2 = i10, o10.push(e10.substring(t10, n10)), t10 = s2) : s2 = n10 + 1;
          } else s2 += 1;
          (!a10 || s2 >= e10.length) && o10.push(e10.substring(t10, e10.length));
        }
        return o10;
      }
      function _(e10) {
        let t10 = {}, r10 = [];
        if (e10) for (let [n10, i10] of e10.entries()) "set-cookie" === n10.toLowerCase() ? (r10.push(...v(i10)), t10[n10] = 1 === r10.length ? r10[0] : r10) : t10[n10] = i10;
        return t10;
      }
      function E(e10) {
        try {
          return String(new URL(String(e10)));
        } catch (t10) {
          throw Object.defineProperty(Error(`URL is malformed "${String(e10)}". Please use only absolute URLs - https://nextjs.org/docs/messages/middleware-relative-urls`, { cause: t10 }), "__NEXT_ERROR_CODE", { value: "E61", enumerable: false, configurable: true });
        }
      }
      ({ ...w, GROUP: { builtinReact: [w.reactServerComponents, w.actionBrowser], serverOnly: [w.reactServerComponents, w.actionBrowser, w.instrument, w.middleware], neutralTarget: [w.apiNode, w.apiEdge], clientOnly: [w.serverSideRendering, w.appPagesBrowser], bundled: [w.reactServerComponents, w.actionBrowser, w.serverSideRendering, w.appPagesBrowser, w.shared, w.instrument, w.middleware], appPages: [w.reactServerComponents, w.serverSideRendering, w.appPagesBrowser, w.actionBrowser] } });
      let S = Symbol("response"), k = Symbol("passThrough"), x = Symbol("waitUntil");
      class A {
        constructor(e10, t10) {
          this[k] = false, this[x] = t10 ? { kind: "external", function: t10 } : { kind: "internal", promises: [] };
        }
        respondWith(e10) {
          this[S] || (this[S] = Promise.resolve(e10));
        }
        passThroughOnException() {
          this[k] = true;
        }
        waitUntil(e10) {
          if ("external" === this[x].kind) return (0, this[x].function)(e10);
          this[x].promises.push(e10);
        }
      }
      class T extends A {
        constructor(e10) {
          var t10;
          super(e10.request, null == (t10 = e10.context) ? void 0 : t10.waitUntil), this.sourcePage = e10.page;
        }
        get request() {
          throw Object.defineProperty(new g({ page: this.sourcePage }), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        }
        respondWith() {
          throw Object.defineProperty(new g({ page: this.sourcePage }), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        }
      }
      function R(e10) {
        return e10.replace(/\/$/, "") || "/";
      }
      function C(e10) {
        let t10 = e10.indexOf("#"), r10 = e10.indexOf("?"), n10 = r10 > -1 && (t10 < 0 || r10 < t10);
        return n10 || t10 > -1 ? { pathname: e10.substring(0, n10 ? r10 : t10), query: n10 ? e10.substring(r10, t10 > -1 ? t10 : void 0) : "", hash: t10 > -1 ? e10.slice(t10) : "" } : { pathname: e10, query: "", hash: "" };
      }
      function P(e10, t10) {
        if (!e10.startsWith("/") || !t10) return e10;
        let { pathname: r10, query: n10, hash: i10 } = C(e10);
        return `${t10}${r10}${n10}${i10}`;
      }
      function O(e10, t10) {
        if (!e10.startsWith("/") || !t10) return e10;
        let { pathname: r10, query: n10, hash: i10 } = C(e10);
        return `${r10}${t10}${n10}${i10}`;
      }
      function I(e10, t10) {
        if ("string" != typeof e10) return false;
        let { pathname: r10 } = C(e10);
        return r10 === t10 || r10.startsWith(t10 + "/");
      }
      let N = /* @__PURE__ */ new WeakMap();
      function U(e10, t10) {
        let r10;
        if (!t10) return { pathname: e10 };
        let n10 = N.get(t10);
        n10 || (n10 = t10.map((e11) => e11.toLowerCase()), N.set(t10, n10));
        let i10 = e10.split("/", 2);
        if (!i10[1]) return { pathname: e10 };
        let a10 = i10[1].toLowerCase(), o10 = n10.indexOf(a10);
        return o10 < 0 ? { pathname: e10 } : (r10 = t10[o10], { pathname: e10 = e10.slice(r10.length + 1) || "/", detectedLocale: r10 });
      }
      let D = /(?!^https?:\/\/)(127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}|\[::1\]|localhost)/;
      function j(e10, t10) {
        return new URL(String(e10).replace(D, "localhost"), t10 && String(t10).replace(D, "localhost"));
      }
      let $ = Symbol("NextURLInternal");
      class L {
        constructor(e10, t10, r10) {
          let n10, i10;
          "object" == typeof t10 && "pathname" in t10 || "string" == typeof t10 ? (n10 = t10, i10 = r10 || {}) : i10 = r10 || t10 || {}, this[$] = { url: j(e10, n10 ?? i10.base), options: i10, basePath: "" }, this.analyze();
        }
        analyze() {
          var e10, t10, r10, n10, i10;
          let a10 = function(e11, t11) {
            let { basePath: r11, i18n: n11, trailingSlash: i11 } = t11.nextConfig ?? {}, a11 = { pathname: e11, trailingSlash: "/" !== e11 ? e11.endsWith("/") : i11 };
            r11 && I(a11.pathname, r11) && (a11.pathname = function(e12, t12) {
              if (!I(e12, t12)) return e12;
              let r12 = e12.slice(t12.length);
              return r12.startsWith("/") ? r12 : `/${r12}`;
            }(a11.pathname, r11), a11.basePath = r11);
            let o11 = a11.pathname;
            if (a11.pathname.startsWith("/_next/data/") && a11.pathname.endsWith(".json")) {
              let e12 = a11.pathname.replace(/^\/_next\/data\//, "").replace(/\.json$/, "").split("/");
              a11.buildId = e12[0], o11 = "index" !== e12[1] ? `/${e12.slice(1).join("/")}` : "/", true === t11.parseData && (a11.pathname = o11);
            }
            if (n11) {
              let e12 = t11.i18nProvider ? t11.i18nProvider.analyze(a11.pathname) : U(a11.pathname, n11.locales);
              a11.locale = e12.detectedLocale, a11.pathname = e12.pathname ?? a11.pathname, !e12.detectedLocale && a11.buildId && (e12 = t11.i18nProvider ? t11.i18nProvider.analyze(o11) : U(o11, n11.locales)).detectedLocale && (a11.locale = e12.detectedLocale);
            }
            return a11;
          }(this[$].url.pathname, { nextConfig: this[$].options.nextConfig, parseData: true, i18nProvider: this[$].options.i18nProvider }), o10 = function(e11, t11) {
            let r11;
            if (t11?.host && !Array.isArray(t11.host)) r11 = t11.host.toString().split(":", 1)[0];
            else {
              if (!e11.hostname) return;
              r11 = e11.hostname;
            }
            return r11.toLowerCase();
          }(this[$].url, this[$].options.headers);
          this[$].domainLocale = this[$].options.i18nProvider ? this[$].options.i18nProvider.detectDomainLocale(o10) : function(e11, t11, r11) {
            if (e11) {
              for (let n11 of (r11 && (r11 = r11.toLowerCase()), e11)) if (t11 === n11.domain?.split(":", 1)[0].toLowerCase() || r11 === n11.defaultLocale.toLowerCase() || n11.locales?.some((e12) => e12.toLowerCase() === r11)) return n11;
            }
          }(null == (t10 = this[$].options.nextConfig) || null == (e10 = t10.i18n) ? void 0 : e10.domains, o10);
          let s2 = (null == (r10 = this[$].domainLocale) ? void 0 : r10.defaultLocale) || (null == (i10 = this[$].options.nextConfig) || null == (n10 = i10.i18n) ? void 0 : n10.defaultLocale);
          this[$].url.pathname = a10.pathname, this[$].defaultLocale = s2, this[$].basePath = a10.basePath ?? "", this[$].buildId = a10.buildId, this[$].locale = a10.locale ?? s2, this[$].trailingSlash = a10.trailingSlash;
        }
        formatPathname() {
          var e10;
          let t10;
          return t10 = function(e11, t11, r10, n10) {
            if (!t11 || t11 === r10) return e11;
            let i10 = e11.toLowerCase();
            return !n10 && (I(i10, "/api") || I(i10, `/${t11.toLowerCase()}`)) ? e11 : P(e11, `/${t11}`);
          }((e10 = { basePath: this[$].basePath, buildId: this[$].buildId, defaultLocale: this[$].options.forceLocale ? void 0 : this[$].defaultLocale, locale: this[$].locale, pathname: this[$].url.pathname, trailingSlash: this[$].trailingSlash }).pathname, e10.locale, e10.buildId ? void 0 : e10.defaultLocale, e10.ignorePrefix), (e10.buildId || !e10.trailingSlash) && (t10 = R(t10)), e10.buildId && (t10 = O(P(t10, `/_next/data/${e10.buildId}`), "/" === e10.pathname ? "index.json" : ".json")), t10 = P(t10, e10.basePath), !e10.buildId && e10.trailingSlash ? t10.endsWith("/") ? t10 : O(t10, "/") : R(t10);
        }
        formatSearch() {
          return this[$].url.search;
        }
        get buildId() {
          return this[$].buildId;
        }
        set buildId(e10) {
          this[$].buildId = e10;
        }
        get locale() {
          return this[$].locale ?? "";
        }
        set locale(e10) {
          var t10, r10;
          if (!this[$].locale || !(null == (r10 = this[$].options.nextConfig) || null == (t10 = r10.i18n) ? void 0 : t10.locales.includes(e10))) throw Object.defineProperty(TypeError(`The NextURL configuration includes no locale "${e10}"`), "__NEXT_ERROR_CODE", { value: "E597", enumerable: false, configurable: true });
          this[$].locale = e10;
        }
        get defaultLocale() {
          return this[$].defaultLocale;
        }
        get domainLocale() {
          return this[$].domainLocale;
        }
        get searchParams() {
          return this[$].url.searchParams;
        }
        get host() {
          return this[$].url.host;
        }
        set host(e10) {
          this[$].url.host = e10;
        }
        get hostname() {
          return this[$].url.hostname;
        }
        set hostname(e10) {
          this[$].url.hostname = e10;
        }
        get port() {
          return this[$].url.port;
        }
        set port(e10) {
          this[$].url.port = e10;
        }
        get protocol() {
          return this[$].url.protocol;
        }
        set protocol(e10) {
          this[$].url.protocol = e10;
        }
        get href() {
          let e10 = this.formatPathname(), t10 = this.formatSearch();
          return `${this.protocol}//${this.host}${e10}${t10}${this.hash}`;
        }
        set href(e10) {
          this[$].url = j(e10), this.analyze();
        }
        get origin() {
          return this[$].url.origin;
        }
        get pathname() {
          return this[$].url.pathname;
        }
        set pathname(e10) {
          this[$].url.pathname = e10;
        }
        get hash() {
          return this[$].url.hash;
        }
        set hash(e10) {
          this[$].url.hash = e10;
        }
        get search() {
          return this[$].url.search;
        }
        set search(e10) {
          this[$].url.search = e10;
        }
        get password() {
          return this[$].url.password;
        }
        set password(e10) {
          this[$].url.password = e10;
        }
        get username() {
          return this[$].url.username;
        }
        set username(e10) {
          this[$].url.username = e10;
        }
        get basePath() {
          return this[$].basePath;
        }
        set basePath(e10) {
          this[$].basePath = e10.startsWith("/") ? e10 : `/${e10}`;
        }
        toString() {
          return this.href;
        }
        toJSON() {
          return this.href;
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return { href: this.href, origin: this.origin, protocol: this.protocol, username: this.username, password: this.password, host: this.host, hostname: this.hostname, port: this.port, pathname: this.pathname, search: this.search, searchParams: this.searchParams, hash: this.hash };
        }
        clone() {
          return new L(String(this), this[$].options);
        }
      }
      var M = e.i(28042);
      let H = Symbol("internal request");
      class W extends Request {
        constructor(e10, t10 = {}) {
          const r10 = "string" != typeof e10 && "url" in e10 ? e10.url : String(e10);
          E(r10), e10 instanceof Request ? super(e10, t10) : super(r10, t10);
          const n10 = new L(r10, { headers: _(this.headers), nextConfig: t10.nextConfig });
          this[H] = { cookies: new M.RequestCookies(this.headers), nextUrl: n10, url: n10.toString() };
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return { cookies: this.cookies, nextUrl: this.nextUrl, url: this.url, bodyUsed: this.bodyUsed, cache: this.cache, credentials: this.credentials, destination: this.destination, headers: Object.fromEntries(this.headers), integrity: this.integrity, keepalive: this.keepalive, method: this.method, mode: this.mode, redirect: this.redirect, referrer: this.referrer, referrerPolicy: this.referrerPolicy, signal: this.signal };
        }
        get cookies() {
          return this[H].cookies;
        }
        get nextUrl() {
          return this[H].nextUrl;
        }
        get page() {
          throw new m();
        }
        get ua() {
          throw new y();
        }
        get url() {
          return this[H].url;
        }
      }
      class K {
        static get(e10, t10, r10) {
          let n10 = Reflect.get(e10, t10, r10);
          return "function" == typeof n10 ? n10.bind(e10) : n10;
        }
        static set(e10, t10, r10, n10) {
          return Reflect.set(e10, t10, r10, n10);
        }
        static has(e10, t10) {
          return Reflect.has(e10, t10);
        }
        static deleteProperty(e10, t10) {
          return Reflect.deleteProperty(e10, t10);
        }
      }
      let B = Symbol("internal response"), q = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
      function J(e10, t10) {
        var r10;
        if (null == e10 || null == (r10 = e10.request) ? void 0 : r10.headers) {
          if (!(e10.request.headers instanceof Headers)) throw Object.defineProperty(Error("request.headers must be an instance of Headers"), "__NEXT_ERROR_CODE", { value: "E119", enumerable: false, configurable: true });
          let r11 = [];
          for (let [n10, i10] of e10.request.headers) t10.set("x-middleware-request-" + n10, i10), r11.push(n10);
          t10.set("x-middleware-override-headers", r11.join(","));
        }
      }
      class V extends Response {
        constructor(e10, t10 = {}) {
          super(e10, t10);
          const r10 = this.headers, n10 = new Proxy(new M.ResponseCookies(r10), { get(e11, n11, i10) {
            switch (n11) {
              case "delete":
              case "set":
                return (...i11) => {
                  let a10 = Reflect.apply(e11[n11], e11, i11), o10 = new Headers(r10);
                  return a10 instanceof M.ResponseCookies && r10.set("x-middleware-set-cookie", a10.getAll().map((e12) => (0, M.stringifyCookie)(e12)).join(",")), J(t10, o10), a10;
                };
              default:
                return K.get(e11, n11, i10);
            }
          } });
          this[B] = { cookies: n10, url: t10.url ? new L(t10.url, { headers: _(r10), nextConfig: t10.nextConfig }) : void 0 };
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return { cookies: this.cookies, url: this.url, body: this.body, bodyUsed: this.bodyUsed, headers: Object.fromEntries(this.headers), ok: this.ok, redirected: this.redirected, status: this.status, statusText: this.statusText, type: this.type };
        }
        get cookies() {
          return this[B].cookies;
        }
        static json(e10, t10) {
          let r10 = Response.json(e10, t10);
          return new V(r10.body, r10);
        }
        static redirect(e10, t10) {
          let r10 = "number" == typeof t10 ? t10 : (null == t10 ? void 0 : t10.status) ?? 307;
          if (!q.has(r10)) throw Object.defineProperty(RangeError('Failed to execute "redirect" on "response": Invalid status code'), "__NEXT_ERROR_CODE", { value: "E529", enumerable: false, configurable: true });
          let n10 = "object" == typeof t10 ? t10 : {}, i10 = new Headers(null == n10 ? void 0 : n10.headers);
          return i10.set("Location", E(e10)), new V(null, { ...n10, headers: i10, status: r10 });
        }
        static rewrite(e10, t10) {
          let r10 = new Headers(null == t10 ? void 0 : t10.headers);
          return r10.set("x-middleware-rewrite", E(e10)), J(t10, r10), new V(null, { ...t10, headers: r10 });
        }
        static next(e10) {
          let t10 = new Headers(null == e10 ? void 0 : e10.headers);
          return t10.set("x-middleware-next", "1"), J(e10, t10), new V(null, { ...e10, headers: t10 });
        }
      }
      function z(e10, t10) {
        let r10 = "string" == typeof t10 ? new URL(t10) : t10, n10 = new URL(e10, t10), i10 = n10.origin === r10.origin;
        return { url: i10 ? n10.toString().slice(r10.origin.length) : n10.toString(), isRelative: i10 };
      }
      var F = e.i(24628);
      F.NEXT_RSC_UNION_QUERY;
      class G extends Error {
        constructor() {
          super("Headers cannot be modified. Read more: https://nextjs.org/docs/app/api-reference/functions/headers");
        }
        static callable() {
          throw new G();
        }
      }
      class X extends Headers {
        constructor(e10) {
          super(), this.headers = new Proxy(e10, { get(t10, r10, n10) {
            if ("symbol" == typeof r10) return K.get(t10, r10, n10);
            let i10 = r10.toLowerCase(), a10 = Object.keys(e10).find((e11) => e11.toLowerCase() === i10);
            if (void 0 !== a10) return K.get(t10, a10, n10);
          }, set(t10, r10, n10, i10) {
            if ("symbol" == typeof r10) return K.set(t10, r10, n10, i10);
            let a10 = r10.toLowerCase(), o10 = Object.keys(e10).find((e11) => e11.toLowerCase() === a10);
            return K.set(t10, o10 ?? r10, n10, i10);
          }, has(t10, r10) {
            if ("symbol" == typeof r10) return K.has(t10, r10);
            let n10 = r10.toLowerCase(), i10 = Object.keys(e10).find((e11) => e11.toLowerCase() === n10);
            return void 0 !== i10 && K.has(t10, i10);
          }, deleteProperty(t10, r10) {
            if ("symbol" == typeof r10) return K.deleteProperty(t10, r10);
            let n10 = r10.toLowerCase(), i10 = Object.keys(e10).find((e11) => e11.toLowerCase() === n10);
            return void 0 === i10 || K.deleteProperty(t10, i10);
          } });
        }
        static seal(e10) {
          return new Proxy(e10, { get(e11, t10, r10) {
            switch (t10) {
              case "append":
              case "delete":
              case "set":
                return G.callable;
              default:
                return K.get(e11, t10, r10);
            }
          } });
        }
        merge(e10) {
          return Array.isArray(e10) ? e10.join(", ") : e10;
        }
        static from(e10) {
          return e10 instanceof Headers ? e10 : new X(e10);
        }
        append(e10, t10) {
          let r10 = this.headers[e10];
          "string" == typeof r10 ? this.headers[e10] = [r10, t10] : Array.isArray(r10) ? r10.push(t10) : this.headers[e10] = t10;
        }
        delete(e10) {
          delete this.headers[e10];
        }
        get(e10) {
          let t10 = this.headers[e10];
          return void 0 !== t10 ? this.merge(t10) : null;
        }
        has(e10) {
          return void 0 !== this.headers[e10];
        }
        set(e10, t10) {
          this.headers[e10] = t10;
        }
        forEach(e10, t10) {
          for (let [r10, n10] of this.entries()) e10.call(t10, n10, r10, this);
        }
        *entries() {
          for (let e10 of Object.keys(this.headers)) {
            let t10 = e10.toLowerCase(), r10 = this.get(t10);
            yield [t10, r10];
          }
        }
        *keys() {
          for (let e10 of Object.keys(this.headers)) {
            let t10 = e10.toLowerCase();
            yield t10;
          }
        }
        *values() {
          for (let e10 of Object.keys(this.headers)) {
            let t10 = this.get(e10);
            yield t10;
          }
        }
        [Symbol.iterator]() {
          return this.entries();
        }
      }
      e.i(7754);
      var Y = e.i(46478), Y = Y;
      class Q extends Error {
        constructor() {
          super("Cookies can only be modified in a Server Action or Route Handler. Read more: https://nextjs.org/docs/app/api-reference/functions/cookies#options");
        }
        static callable() {
          throw new Q();
        }
      }
      class Z {
        static seal(e10) {
          return new Proxy(e10, { get(e11, t10, r10) {
            switch (t10) {
              case "clear":
              case "delete":
              case "set":
                return Q.callable;
              default:
                return K.get(e11, t10, r10);
            }
          } });
        }
      }
      let ee = Symbol.for("next.mutated.cookies");
      class et {
        static wrap(e10, t10) {
          let r10 = new M.ResponseCookies(new Headers());
          for (let t11 of e10.getAll()) r10.set(t11);
          let n10 = [], i10 = /* @__PURE__ */ new Set(), a10 = () => {
            let e11 = Y.workAsyncStorageInstance.getStore();
            if (e11 && (e11.pathWasRevalidated = 1), n10 = r10.getAll().filter((e12) => i10.has(e12.name)), t10) {
              let e12 = [];
              for (let t11 of n10) {
                let r11 = new M.ResponseCookies(new Headers());
                r11.set(t11), e12.push(r11.toString());
              }
              t10(e12);
            }
          }, o10 = new Proxy(r10, { get(e11, t11, r11) {
            switch (t11) {
              case ee:
                return n10;
              case "delete":
                return function(...t12) {
                  i10.add("string" == typeof t12[0] ? t12[0] : t12[0].name);
                  try {
                    return e11.delete(...t12), o10;
                  } finally {
                    a10();
                  }
                };
              case "set":
                return function(...t12) {
                  i10.add("string" == typeof t12[0] ? t12[0] : t12[0].name);
                  try {
                    return e11.set(...t12), o10;
                  } finally {
                    a10();
                  }
                };
              default:
                return K.get(e11, t11, r11);
            }
          } });
          return o10;
        }
      }
      function er(e10) {
        return "action" === e10.phase;
      }
      function en(e10, t10) {
        if (!er(e10)) throw new Q();
      }
      var ei = ((nZ = ei || {}).handleRequest = "BaseServer.handleRequest", nZ.run = "BaseServer.run", nZ.pipe = "BaseServer.pipe", nZ.getStaticHTML = "BaseServer.getStaticHTML", nZ.render = "BaseServer.render", nZ.renderToResponseWithComponents = "BaseServer.renderToResponseWithComponents", nZ.renderToResponse = "BaseServer.renderToResponse", nZ.renderToHTML = "BaseServer.renderToHTML", nZ.renderError = "BaseServer.renderError", nZ.renderErrorToResponse = "BaseServer.renderErrorToResponse", nZ.renderErrorToHTML = "BaseServer.renderErrorToHTML", nZ.render404 = "BaseServer.render404", nZ), ea = ((n0 = ea || {}).loadDefaultErrorComponents = "LoadComponents.loadDefaultErrorComponents", n0.loadComponents = "LoadComponents.loadComponents", n0), eo = ((n1 = eo || {}).getRequestHandler = "NextServer.getRequestHandler", n1.getRequestHandlerWithMetadata = "NextServer.getRequestHandlerWithMetadata", n1.getServer = "NextServer.getServer", n1.getServerRequestHandler = "NextServer.getServerRequestHandler", n1.createServer = "createServer.createServer", n1), es = ((n2 = es || {}).compression = "NextNodeServer.compression", n2.getBuildId = "NextNodeServer.getBuildId", n2.createComponentTree = "NextNodeServer.createComponentTree", n2.clientComponentLoading = "NextNodeServer.clientComponentLoading", n2.getLayoutOrPageModule = "NextNodeServer.getLayoutOrPageModule", n2.generateStaticRoutes = "NextNodeServer.generateStaticRoutes", n2.generateFsStaticRoutes = "NextNodeServer.generateFsStaticRoutes", n2.generatePublicRoutes = "NextNodeServer.generatePublicRoutes", n2.generateImageRoutes = "NextNodeServer.generateImageRoutes.route", n2.sendRenderResult = "NextNodeServer.sendRenderResult", n2.proxyRequest = "NextNodeServer.proxyRequest", n2.runApi = "NextNodeServer.runApi", n2.render = "NextNodeServer.render", n2.renderHTML = "NextNodeServer.renderHTML", n2.imageOptimizer = "NextNodeServer.imageOptimizer", n2.getPagePath = "NextNodeServer.getPagePath", n2.getRoutesManifest = "NextNodeServer.getRoutesManifest", n2.findPageComponents = "NextNodeServer.findPageComponents", n2.getFontManifest = "NextNodeServer.getFontManifest", n2.getServerComponentManifest = "NextNodeServer.getServerComponentManifest", n2.getRequestHandler = "NextNodeServer.getRequestHandler", n2.renderToHTML = "NextNodeServer.renderToHTML", n2.renderError = "NextNodeServer.renderError", n2.renderErrorToHTML = "NextNodeServer.renderErrorToHTML", n2.render404 = "NextNodeServer.render404", n2.startResponse = "NextNodeServer.startResponse", n2.route = "route", n2.onProxyReq = "onProxyReq", n2.apiResolver = "apiResolver", n2.internalFetch = "internalFetch", n2), ec = ((n5 = ec || {}).startServer = "startServer.startServer", n5), el = ((n3 = el || {}).getServerSideProps = "Render.getServerSideProps", n3.getStaticProps = "Render.getStaticProps", n3.renderToString = "Render.renderToString", n3.renderDocument = "Render.renderDocument", n3.createBodyResult = "Render.createBodyResult", n3), eu = ((n8 = eu || {}).renderToString = "AppRender.renderToString", n8.renderToReadableStream = "AppRender.renderToReadableStream", n8.getBodyResult = "AppRender.getBodyResult", n8.fetch = "AppRender.fetch", n8), ed = ((n6 = ed || {}).executeRoute = "Router.executeRoute", n6), ep = ((n4 = ep || {}).runHandler = "Node.runHandler", n4), eh = ((n9 = eh || {}).runHandler = "AppRouteRouteHandlers.runHandler", n9), ef = ((n7 = ef || {}).generateMetadata = "ResolveMetadata.generateMetadata", n7.generateViewport = "ResolveMetadata.generateViewport", n7), eg = ((ie = eg || {}).execute = "Middleware.execute", ie);
      let em = /* @__PURE__ */ new Set(["Middleware.execute", "BaseServer.handleRequest", "Render.getServerSideProps", "Render.getStaticProps", "AppRender.fetch", "AppRender.getBodyResult", "Render.renderDocument", "Node.runHandler", "AppRouteRouteHandlers.runHandler", "ResolveMetadata.generateMetadata", "ResolveMetadata.generateViewport", "NextNodeServer.createComponentTree", "NextNodeServer.findPageComponents", "NextNodeServer.getLayoutOrPageModule", "NextNodeServer.startResponse", "NextNodeServer.clientComponentLoading"]), ey = /* @__PURE__ */ new Set(["NextNodeServer.findPageComponents", "NextNodeServer.createComponentTree", "NextNodeServer.clientComponentLoading"]);
      function eb(e10) {
        return null !== e10 && "object" == typeof e10 && "then" in e10 && "function" == typeof e10.then;
      }
      let ew = process.env.NEXT_OTEL_PERFORMANCE_PREFIX, { context: ev, propagation: e_, trace: eE, SpanStatusCode: eS, SpanKind: ek, ROOT_CONTEXT: ex } = t = e.r(59110);
      class eA extends Error {
        constructor(e10, t10) {
          super(), this.bubble = e10, this.result = t10;
        }
      }
      let eT = (e10, t10) => {
        "object" == typeof t10 && null !== t10 && t10 instanceof eA && t10.bubble ? e10.setAttribute("next.bubble", true) : (t10 && (e10.recordException(t10), e10.setAttribute("error.type", t10.name)), e10.setStatus({ code: eS.ERROR, message: null == t10 ? void 0 : t10.message })), e10.end();
      }, eR = /* @__PURE__ */ new Map(), eC = t.createContextKey("next.rootSpanId"), eP = 0, eO = { set(e10, t10, r10) {
        e10.push({ key: t10, value: r10 });
      } }, eI = (o = new class e {
        getTracerInstance() {
          return eE.getTracer("next.js", "0.0.1");
        }
        getContext() {
          return ev;
        }
        getTracePropagationData() {
          let e10 = ev.active(), t10 = [];
          return e_.inject(e10, t10, eO), t10;
        }
        getActiveScopeSpan() {
          return eE.getSpan(null == ev ? void 0 : ev.active());
        }
        withPropagatedContext(e10, t10, r10) {
          let n10 = ev.active();
          if (eE.getSpanContext(n10)) return t10();
          let i10 = e_.extract(n10, e10, r10);
          return ev.with(i10, t10);
        }
        trace(...e10) {
          let [t10, r10, n10] = e10, { fn: i10, options: a10 } = "function" == typeof r10 ? { fn: r10, options: {} } : { fn: n10, options: { ...r10 } }, o10 = a10.spanName ?? t10;
          if (!em.has(t10) && "1" !== process.env.NEXT_OTEL_VERBOSE || a10.hideSpan) return i10();
          let s2 = this.getSpanContext((null == a10 ? void 0 : a10.parentSpan) ?? this.getActiveScopeSpan());
          s2 || (s2 = (null == ev ? void 0 : ev.active()) ?? ex);
          let c2 = s2.getValue(eC), l2 = "number" != typeof c2 || !eR.has(c2), u2 = eP++;
          return a10.attributes = { "next.span_name": o10, "next.span_type": t10, ...a10.attributes }, ev.with(s2.setValue(eC, u2), () => this.getTracerInstance().startActiveSpan(o10, a10, (e11) => {
            let r11;
            ew && t10 && ey.has(t10) && (r11 = "performance" in globalThis && "measure" in performance ? globalThis.performance.now() : void 0);
            let n11 = false, o11 = () => {
              !n11 && (n11 = true, eR.delete(u2), r11 && performance.measure(`${ew}:next-${(t10.split(".").pop() || "").replace(/[A-Z]/g, (e12) => "-" + e12.toLowerCase())}`, { start: r11, end: performance.now() }));
            };
            if (l2 && eR.set(u2, new Map(Object.entries(a10.attributes ?? {}))), i10.length > 1) try {
              return i10(e11, (t11) => eT(e11, t11));
            } catch (t11) {
              throw eT(e11, t11), t11;
            } finally {
              o11();
            }
            try {
              let t11 = i10(e11);
              if (eb(t11)) return t11.then((t12) => (e11.end(), t12)).catch((t12) => {
                throw eT(e11, t12), t12;
              }).finally(o11);
              return e11.end(), o11(), t11;
            } catch (t11) {
              throw eT(e11, t11), o11(), t11;
            }
          }));
        }
        wrap(...e10) {
          let t10 = this, [r10, n10, i10] = 3 === e10.length ? e10 : [e10[0], {}, e10[1]];
          return em.has(r10) || "1" === process.env.NEXT_OTEL_VERBOSE ? function() {
            let e11 = n10;
            "function" == typeof e11 && "function" == typeof i10 && (e11 = e11.apply(this, arguments));
            let a10 = arguments.length - 1, o10 = arguments[a10];
            if ("function" != typeof o10) return t10.trace(r10, e11, () => i10.apply(this, arguments));
            {
              let n11 = t10.getContext().bind(ev.active(), o10);
              return t10.trace(r10, e11, (e12, t11) => (arguments[a10] = function(e13) {
                return null == t11 || t11(e13), n11.apply(this, arguments);
              }, i10.apply(this, arguments)));
            }
          } : i10;
        }
        startSpan(...e10) {
          let [t10, r10] = e10, n10 = this.getSpanContext((null == r10 ? void 0 : r10.parentSpan) ?? this.getActiveScopeSpan());
          return this.getTracerInstance().startSpan(t10, r10, n10);
        }
        getSpanContext(e10) {
          return e10 ? eE.setSpan(ev.active(), e10) : void 0;
        }
        getRootSpanAttributes() {
          let e10 = ev.active().getValue(eC);
          return eR.get(e10);
        }
        setRootSpanAttribute(e10, t10) {
          let r10 = ev.active().getValue(eC), n10 = eR.get(r10);
          n10 && !n10.has(e10) && n10.set(e10, t10);
        }
        withSpan(e10, t10) {
          let r10 = eE.setSpan(ev.active(), e10);
          return ev.with(r10, t10);
        }
      }(), () => o), eN = "__prerender_bypass";
      Symbol("__next_preview_data"), Symbol(eN);
      class eU {
        constructor(e10, t10, r10, n10) {
          var i10;
          const a10 = e10 && function(e11, t11) {
            let r11 = X.from(e11.headers);
            return { isOnDemandRevalidate: r11.get("x-prerender-revalidate") === t11.previewModeId, revalidateOnlyGenerated: r11.has("x-prerender-revalidate-if-generated") };
          }(t10, e10).isOnDemandRevalidate, o10 = null == (i10 = r10.get(eN)) ? void 0 : i10.value;
          this._isEnabled = !!(!a10 && o10 && e10 && o10 === e10.previewModeId), this._previewModeId = null == e10 ? void 0 : e10.previewModeId, this._mutableCookies = n10;
        }
        get isEnabled() {
          return this._isEnabled;
        }
        enable() {
          if (!this._previewModeId) throw Object.defineProperty(Error("Invariant: previewProps missing previewModeId this should never happen"), "__NEXT_ERROR_CODE", { value: "E93", enumerable: false, configurable: true });
          this._mutableCookies.set({ name: eN, value: this._previewModeId, httpOnly: true, sameSite: "none", secure: true, path: "/" }), this._isEnabled = true;
        }
        disable() {
          this._mutableCookies.set({ name: eN, value: "", httpOnly: true, sameSite: "none", secure: true, path: "/", expires: /* @__PURE__ */ new Date(0) }), this._isEnabled = false;
        }
      }
      function eD(e10, t10) {
        if ("x-middleware-set-cookie" in e10.headers && "string" == typeof e10.headers["x-middleware-set-cookie"]) {
          let r10 = e10.headers["x-middleware-set-cookie"], n10 = new Headers();
          for (let e11 of v(r10)) n10.append("set-cookie", e11);
          for (let e11 of new M.ResponseCookies(n10).getAll()) t10.set(e11);
        }
      }
      var ej = e.i(53835), e$ = e.i(9939), e$ = e$, eL = e.i(99734), eM = e.i(25753), Y = Y, eH = e.i(51615);
      process.env.NEXT_PRIVATE_DEBUG_CACHE, Symbol.for("@next/cache-handlers");
      let eW = Symbol.for("@next/cache-handlers-map"), eK = Symbol.for("@next/cache-handlers-set"), eB = globalThis;
      function eq() {
        if (eB[eW]) return eB[eW].entries();
      }
      async function eJ(e10, t10) {
        if (!e10) return t10();
        let r10 = eV(e10);
        try {
          return await t10();
        } finally {
          var n10, i10;
          let t11, a10, o10 = (n10 = r10, i10 = eV(e10), t11 = new Set(n10.pendingRevalidatedTags.map((e11) => {
            let t12 = "object" == typeof e11.profile ? JSON.stringify(e11.profile) : e11.profile || "";
            return `${e11.tag}:${t12}`;
          })), a10 = new Set(n10.pendingRevalidateWrites), { pendingRevalidatedTags: i10.pendingRevalidatedTags.filter((e11) => {
            let r11 = "object" == typeof e11.profile ? JSON.stringify(e11.profile) : e11.profile || "";
            return !t11.has(`${e11.tag}:${r11}`);
          }), pendingRevalidates: Object.fromEntries(Object.entries(i10.pendingRevalidates).filter(([e11]) => !(e11 in n10.pendingRevalidates))), pendingRevalidateWrites: i10.pendingRevalidateWrites.filter((e11) => !a10.has(e11)) });
          await eF(e10, o10);
        }
      }
      function eV(e10) {
        return { pendingRevalidatedTags: e10.pendingRevalidatedTags ? [...e10.pendingRevalidatedTags] : [], pendingRevalidates: { ...e10.pendingRevalidates }, pendingRevalidateWrites: e10.pendingRevalidateWrites ? [...e10.pendingRevalidateWrites] : [] };
      }
      async function ez(e10, t10, r10) {
        if (0 === e10.length) return;
        let n10 = function() {
          if (eB[eK]) return eB[eK].values();
        }(), i10 = [], a10 = /* @__PURE__ */ new Map();
        for (let t11 of e10) {
          let e11, r11 = t11.profile;
          for (let [t12] of a10) if ("string" == typeof t12 && "string" == typeof r11 && t12 === r11 || "object" == typeof t12 && "object" == typeof r11 && JSON.stringify(t12) === JSON.stringify(r11) || t12 === r11) {
            e11 = t12;
            break;
          }
          let n11 = e11 || r11;
          a10.has(n11) || a10.set(n11, []), a10.get(n11).push(t11.tag);
        }
        for (let [e11, s2] of a10) {
          let a11;
          if (e11) {
            let t11;
            if ("object" == typeof e11) t11 = e11;
            else if ("string" == typeof e11) {
              var o10;
              if (!(t11 = null == r10 || null == (o10 = r10.cacheLifeProfiles) ? void 0 : o10[e11])) throw Object.defineProperty(Error(`Invalid profile provided "${e11}" must be configured under cacheLife in next.config or be "max"`), "__NEXT_ERROR_CODE", { value: "E873", enumerable: false, configurable: true });
            }
            t11 && (a11 = { expire: t11.expire });
          }
          for (let t11 of n10 || []) e11 ? i10.push(null == t11.updateTags ? void 0 : t11.updateTags.call(t11, s2, a11)) : i10.push(null == t11.updateTags ? void 0 : t11.updateTags.call(t11, s2));
          t10 && i10.push(t10.revalidateTag(s2, a11));
        }
        await Promise.all(i10);
      }
      async function eF(e10, t10) {
        let r10 = (null == t10 ? void 0 : t10.pendingRevalidatedTags) ?? e10.pendingRevalidatedTags ?? [], n10 = (null == t10 ? void 0 : t10.pendingRevalidates) ?? e10.pendingRevalidates ?? {}, i10 = (null == t10 ? void 0 : t10.pendingRevalidateWrites) ?? e10.pendingRevalidateWrites ?? [];
        return Promise.all([ez(r10, e10.incrementalCache, e10), ...Object.values(n10), ...i10]);
      }
      var eG = e.i(90044), e$ = e$;
      let eX = (0, eG.createAsyncLocalStorage)();
      class eY {
        constructor({ waitUntil: e10, onClose: t10, onTaskError: r10 }) {
          this.workUnitStores = /* @__PURE__ */ new Set(), this.waitUntil = e10, this.onClose = t10, this.onTaskError = r10, this.callbackQueue = new eL.default(), this.callbackQueue.pause();
        }
        after(e10) {
          if (eb(e10)) this.waitUntil || eQ(), this.waitUntil(e10.catch((e11) => this.reportTaskError("promise", e11)));
          else if ("function" == typeof e10) this.addCallback(e10);
          else throw Object.defineProperty(Error("`after()`: Argument must be a promise or a function"), "__NEXT_ERROR_CODE", { value: "E50", enumerable: false, configurable: true });
        }
        addCallback(e10) {
          this.waitUntil || eQ();
          let t10 = e$.workUnitAsyncStorageInstance.getStore();
          t10 && this.workUnitStores.add(t10);
          let r10 = eX.getStore(), n10 = r10 ? r10.rootTaskSpawnPhase : null == t10 ? void 0 : t10.phase;
          this.runCallbacksOnClosePromise || (this.runCallbacksOnClosePromise = this.runCallbacksOnClose(), this.waitUntil(this.runCallbacksOnClosePromise));
          let i10 = (0, eG.bindSnapshot)(async () => {
            try {
              await eX.run({ rootTaskSpawnPhase: n10 }, () => e10());
            } catch (e11) {
              this.reportTaskError("function", e11);
            }
          });
          this.callbackQueue.add(i10);
        }
        async runCallbacksOnClose() {
          return await new Promise((e10) => this.onClose(e10)), this.runCallbacks();
        }
        async runCallbacks() {
          if (0 === this.callbackQueue.size) return;
          for (let e11 of this.workUnitStores) e11.phase = "after";
          let e10 = Y.workAsyncStorageInstance.getStore();
          if (!e10) throw Object.defineProperty(new eM.InvariantError("Missing workStore in AfterContext.runCallbacks"), "__NEXT_ERROR_CODE", { value: "E547", enumerable: false, configurable: true });
          return eJ(e10, () => (this.callbackQueue.start(), this.callbackQueue.onIdle()));
        }
        reportTaskError(e10, t10) {
          if (console.error("promise" === e10 ? "A promise passed to `after()` rejected:" : "An error occurred in a function passed to `after()`:", t10), this.onTaskError) try {
            null == this.onTaskError || this.onTaskError.call(this, t10);
          } catch (e11) {
            console.error(Object.defineProperty(new eM.InvariantError("`onTaskError` threw while handling an error thrown from an `after` task", { cause: e11 }), "__NEXT_ERROR_CODE", { value: "E569", enumerable: false, configurable: true }));
          }
        }
      }
      function eQ() {
        throw Object.defineProperty(Error("`after()` will not work correctly, because `waitUntil` is not available in the current environment."), "__NEXT_ERROR_CODE", { value: "E91", enumerable: false, configurable: true });
      }
      function eZ(e10) {
        let t10, r10 = { then: (n10, i10) => (t10 || (t10 = Promise.resolve(e10())), t10.then((e11) => {
          r10.value = e11;
        }).catch(() => {
        }), t10.then(n10, i10)) };
        return r10;
      }
      var Y = Y;
      class e0 {
        onClose(e10) {
          if (this.isClosed) throw Object.defineProperty(Error("Cannot subscribe to a closed CloseController"), "__NEXT_ERROR_CODE", { value: "E365", enumerable: false, configurable: true });
          this.target.addEventListener("close", e10), this.listeners++;
        }
        dispatchClose() {
          if (this.isClosed) throw Object.defineProperty(Error("Cannot close a CloseController multiple times"), "__NEXT_ERROR_CODE", { value: "E229", enumerable: false, configurable: true });
          this.listeners > 0 && this.target.dispatchEvent(new Event("close")), this.isClosed = true;
        }
        constructor() {
          this.target = new EventTarget(), this.listeners = 0, this.isClosed = false;
        }
      }
      function e1() {
        return { previewModeId: process.env.__NEXT_PREVIEW_MODE_ID || "", previewModeSigningKey: process.env.__NEXT_PREVIEW_MODE_SIGNING_KEY || "", previewModeEncryptionKey: process.env.__NEXT_PREVIEW_MODE_ENCRYPTION_KEY || "" };
      }
      let e2 = Symbol.for("@next/request-context");
      async function e5(e10, t10, r10) {
        let n10 = /* @__PURE__ */ new Set();
        for (let t11 of ((e11) => {
          let t12 = ["/layout"];
          if (e11.startsWith("/")) {
            let r11 = e11.split("/");
            for (let e12 = 1; e12 < r11.length + 1; e12++) {
              let n11 = r11.slice(0, e12).join("/");
              n11 && (n11.endsWith("/page") || n11.endsWith("/route") || (n11 = `${n11}${!n11.endsWith("/") ? "/" : ""}layout`), t12.push(n11));
            }
          }
          return t12;
        })(e10)) t11 = `${b}${t11}`, n10.add(t11);
        if (t10.pathname && (!r10 || 0 === r10.size)) {
          let e11 = `${b}${t10.pathname}`;
          n10.add(e11);
        }
        n10.has(`${b}/`) && n10.add(`${b}/index`), n10.has(`${b}/index`) && n10.add(`${b}/`);
        let i10 = Array.from(n10);
        return { tags: i10, expirationsByCacheKind: function(e11) {
          let t11 = /* @__PURE__ */ new Map(), r11 = eq();
          if (r11) for (let [n11, i11] of r11) "getExpiration" in i11 && t11.set(n11, eZ(async () => i11.getExpiration(e11)));
          return t11;
        }(i10) };
      }
      class e3 extends W {
        constructor(e10) {
          super(e10.input, e10.init), this.sourcePage = e10.page;
        }
        get request() {
          throw Object.defineProperty(new g({ page: this.sourcePage }), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        }
        respondWith() {
          throw Object.defineProperty(new g({ page: this.sourcePage }), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        }
        waitUntil() {
          throw Object.defineProperty(new g({ page: this.sourcePage }), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        }
      }
      let e8 = { keys: (e10) => Array.from(e10.keys()), get: (e10, t10) => e10.get(t10) ?? void 0 }, e6 = (e10, t10) => eI().withPropagatedContext(e10.headers, t10, e8), e4 = false;
      async function e9(t10) {
        var r10, n10, i10, a10;
        let o10, s2, c2, l2, u2;
        !function() {
          if (!e4 && (e4 = true, "true" === process.env.NEXT_PRIVATE_TEST_PROXY)) {
            let { interceptTestApis: t11, wrapRequestHandler: r11 } = e.r(94165);
            t11(), e6 = r11(e6);
          }
        }(), await h();
        let d2 = void 0 !== globalThis.__BUILD_MANIFEST;
        t10.request.url = t10.request.url.replace(/\.rsc($|\?)/, "$1");
        let p2 = t10.bypassNextUrl ? new URL(t10.request.url) : new L(t10.request.url, { headers: t10.request.headers, nextConfig: t10.request.nextConfig });
        for (let e10 of [...p2.searchParams.keys()]) {
          let t11 = p2.searchParams.getAll(e10), r11 = function(e11) {
            for (let t12 of ["nxtP", "nxtI"]) if (e11 !== t12 && e11.startsWith(t12)) return e11.substring(t12.length);
            return null;
          }(e10);
          if (r11) {
            for (let e11 of (p2.searchParams.delete(r11), t11)) p2.searchParams.append(r11, e11);
            p2.searchParams.delete(e10);
          }
        }
        let f2 = process.env.__NEXT_BUILD_ID || "";
        "buildId" in p2 && (f2 = p2.buildId || "", p2.buildId = "");
        let g2 = function(e10) {
          let t11 = new Headers();
          for (let [r11, n11] of Object.entries(e10)) for (let e11 of Array.isArray(n11) ? n11 : [n11]) void 0 !== e11 && ("number" == typeof e11 && (e11 = e11.toString()), t11.append(r11, e11));
          return t11;
        }(t10.request.headers), m2 = g2.has("x-nextjs-data"), y2 = "1" === g2.get(F.RSC_HEADER);
        m2 && "/index" === p2.pathname && (p2.pathname = "/");
        let b2 = /* @__PURE__ */ new Map();
        if (!d2) for (let e10 of F.FLIGHT_HEADERS) {
          let t11 = g2.get(e10);
          null !== t11 && (b2.set(e10, t11), g2.delete(e10));
        }
        let w2 = p2.searchParams.get(F.NEXT_RSC_UNION_QUERY), v2 = new e3({ page: t10.page, input: ((l2 = (c2 = "string" == typeof p2) ? new URL(p2) : p2).searchParams.delete(F.NEXT_RSC_UNION_QUERY), c2 ? l2.toString() : l2).toString(), init: { body: t10.request.body, headers: g2, method: t10.request.method, nextConfig: t10.request.nextConfig, signal: t10.request.signal } });
        m2 && Object.defineProperty(v2, "__isData", { enumerable: false, value: true }), !globalThis.__incrementalCacheShared && t10.IncrementalCache && (globalThis.__incrementalCache = new t10.IncrementalCache({ CurCacheHandler: t10.incrementalCacheHandler, minimalMode: true, fetchCacheKeyPrefix: "", dev: false, requestHeaders: t10.request.headers, getPrerenderManifest: () => ({ version: -1, routes: {}, dynamicRoutes: {}, notFoundRoutes: [], preview: e1() }) }));
        let _2 = t10.request.waitUntil ?? (null == (r10 = null == (u2 = globalThis[e2]) ? void 0 : u2.get()) ? void 0 : r10.waitUntil), E2 = new T({ request: v2, page: t10.page, context: _2 ? { waitUntil: _2 } : void 0 });
        if ((o10 = await e6(v2, () => {
          if ("/middleware" === t10.page || "/src/middleware" === t10.page || "/proxy" === t10.page || "/src/proxy" === t10.page) {
            let e10 = E2.waitUntil.bind(E2), r11 = new e0();
            return eI().trace(eg.execute, { spanName: `middleware ${v2.method}`, attributes: { "http.target": v2.nextUrl.pathname, "http.method": v2.method } }, async () => {
              try {
                var n11, i11, a11, o11, c3, l3;
                let u3 = e1(), d3 = await e5("/", v2.nextUrl, null), p3 = (c3 = v2.nextUrl, l3 = (e11) => {
                  s2 = e11;
                }, function(e11, t11, r12, n12, i12, a12, o12, s3, c4, l4, u4, d4) {
                  function p4(e12) {
                    r12 && r12.setHeader("Set-Cookie", e12);
                  }
                  let h3 = {};
                  return { type: "request", phase: e11, implicitTags: a12, url: { pathname: n12.pathname, search: n12.search ?? "" }, rootParams: i12, get headers() {
                    return h3.headers || (h3.headers = function(e12) {
                      let t12 = X.from(e12);
                      for (let e13 of F.FLIGHT_HEADERS) t12.delete(e13);
                      return X.seal(t12);
                    }(t11.headers)), h3.headers;
                  }, get cookies() {
                    if (!h3.cookies) {
                      let e12 = new M.RequestCookies(X.from(t11.headers));
                      eD(t11, e12), h3.cookies = Z.seal(e12);
                    }
                    return h3.cookies;
                  }, set cookies(value) {
                    h3.cookies = value;
                  }, get mutableCookies() {
                    if (!h3.mutableCookies) {
                      var f3, g3;
                      let e12, n13 = (f3 = t11.headers, g3 = o12 || (r12 ? p4 : void 0), e12 = new M.RequestCookies(X.from(f3)), et.wrap(e12, g3));
                      eD(t11, n13), h3.mutableCookies = n13;
                    }
                    return h3.mutableCookies;
                  }, get userspaceMutableCookies() {
                    if (!h3.userspaceMutableCookies) {
                      var m3;
                      let e12;
                      m3 = this, h3.userspaceMutableCookies = e12 = new Proxy(m3.mutableCookies, { get(t12, r13, n13) {
                        switch (r13) {
                          case "delete":
                            return function(...r14) {
                              return en(m3, "cookies().delete"), t12.delete(...r14), e12;
                            };
                          case "set":
                            return function(...r14) {
                              return en(m3, "cookies().set"), t12.set(...r14), e12;
                            };
                          default:
                            return K.get(t12, r13, n13);
                        }
                      } });
                    }
                    return h3.userspaceMutableCookies;
                  }, get draftMode() {
                    return h3.draftMode || (h3.draftMode = new eU(c4, t11, this.cookies, this.mutableCookies)), h3.draftMode;
                  }, renderResumeDataCache: null, isHmrRefresh: l4, serverComponentsHmrCache: u4 || globalThis.__serverComponentsHmrCache, devFallbackParams: null };
                }("action", v2, void 0, c3, {}, d3, l3, null, u3, false, void 0, null)), h2 = function({ page: e11, renderOpts: t11, isPrefetchRequest: r12, buildId: n12, previouslyRevalidatedTags: i12, nonce: a12 }) {
                  var o12;
                  let s3 = !t11.shouldWaitOnAllReady && !t11.supportsDynamicResponse && !t11.isDraftMode && !t11.isPossibleServerAction, c4 = t11.dev ?? false, l4 = c4 || s3 && (!!process.env.NEXT_DEBUG_BUILD || "1" === process.env.NEXT_SSG_FETCH_METRICS), u4 = { isStaticGeneration: s3, page: e11, route: (o12 = e11.split("/").reduce((e12, t12, r13, n13) => t12 ? "(" === t12[0] && t12.endsWith(")") || "@" === t12[0] || ("page" === t12 || "route" === t12) && r13 === n13.length - 1 ? e12 : `${e12}/${t12}` : e12, "")).startsWith("/") ? o12 : `/${o12}`, incrementalCache: t11.incrementalCache || globalThis.__incrementalCache, cacheLifeProfiles: t11.cacheLifeProfiles, isBuildTimePrerendering: t11.nextExport, hasReadableErrorStacks: t11.hasReadableErrorStacks, fetchCache: t11.fetchCache, isOnDemandRevalidate: t11.isOnDemandRevalidate, isDraftMode: t11.isDraftMode, isPrefetchRequest: r12, buildId: n12, reactLoadableManifest: (null == t11 ? void 0 : t11.reactLoadableManifest) || {}, assetPrefix: (null == t11 ? void 0 : t11.assetPrefix) || "", nonce: a12, afterContext: function(e12) {
                    let { waitUntil: t12, onClose: r13, onAfterTaskError: n13 } = e12;
                    return new eY({ waitUntil: t12, onClose: r13, onTaskError: n13 });
                  }(t11), cacheComponentsEnabled: t11.cacheComponents, dev: c4, previouslyRevalidatedTags: i12, refreshTagsByCacheKind: function() {
                    let e12 = /* @__PURE__ */ new Map(), t12 = eq();
                    if (t12) for (let [r13, n13] of t12) "refreshTags" in n13 && e12.set(r13, eZ(async () => n13.refreshTags()));
                    return e12;
                  }(), runInCleanSnapshot: (0, eG.createSnapshot)(), shouldTrackFetchMetrics: l4, reactServerErrorsByDigest: /* @__PURE__ */ new Map() };
                  return t11.store = u4, u4;
                }({ page: "/", renderOpts: { cacheLifeProfiles: null == (i11 = t10.request.nextConfig) || null == (n11 = i11.experimental) ? void 0 : n11.cacheLife, cacheComponents: false, experimental: { isRoutePPREnabled: false, authInterrupts: !!(null == (o11 = t10.request.nextConfig) || null == (a11 = o11.experimental) ? void 0 : a11.authInterrupts) }, supportsDynamicResponse: true, waitUntil: e10, onClose: r11.onClose.bind(r11), onAfterTaskError: void 0 }, isPrefetchRequest: "1" === v2.headers.get(F.NEXT_ROUTER_PREFETCH_HEADER), buildId: f2 ?? "", previouslyRevalidatedTags: [] });
                return await Y.workAsyncStorageInstance.run(h2, () => e$.workUnitAsyncStorageInstance.run(p3, t10.handler, v2, E2));
              } finally {
                setTimeout(() => {
                  r11.dispatchClose();
                }, 0);
              }
            });
          }
          return t10.handler(v2, E2);
        })) && !(o10 instanceof Response)) throw Object.defineProperty(TypeError("Expected an instance of Response to be returned"), "__NEXT_ERROR_CODE", { value: "E567", enumerable: false, configurable: true });
        o10 && s2 && o10.headers.set("set-cookie", s2);
        let S2 = null == o10 ? void 0 : o10.headers.get("x-middleware-rewrite");
        if (o10 && S2 && (y2 || !d2)) {
          let e10 = new L(S2, { forceLocale: true, headers: t10.request.headers, nextConfig: t10.request.nextConfig });
          d2 || e10.host !== v2.nextUrl.host || (e10.buildId = f2 || e10.buildId, o10.headers.set("x-middleware-rewrite", String(e10)));
          let { url: r11, isRelative: s3 } = z(e10.toString(), p2.toString());
          !d2 && m2 && o10.headers.set("x-nextjs-rewrite", r11);
          let c3 = !s3 && (null == (a10 = t10.request.nextConfig) || null == (i10 = a10.experimental) || null == (n10 = i10.clientParamParsingOrigins) ? void 0 : n10.some((t11) => new RegExp(t11).test(e10.origin)));
          y2 && (s3 || c3) && (p2.pathname !== e10.pathname && o10.headers.set(F.NEXT_REWRITTEN_PATH_HEADER, e10.pathname), p2.search !== e10.search && o10.headers.set(F.NEXT_REWRITTEN_QUERY_HEADER, e10.search.slice(1)));
        }
        if (o10 && S2 && y2 && w2) {
          let e10 = new URL(S2);
          e10.searchParams.has(F.NEXT_RSC_UNION_QUERY) || (e10.searchParams.set(F.NEXT_RSC_UNION_QUERY, w2), o10.headers.set("x-middleware-rewrite", e10.toString()));
        }
        let k2 = null == o10 ? void 0 : o10.headers.get("Location");
        if (o10 && k2 && !d2) {
          let e10 = new L(k2, { forceLocale: false, headers: t10.request.headers, nextConfig: t10.request.nextConfig });
          o10 = new Response(o10.body, o10), e10.host === p2.host && (e10.buildId = f2 || e10.buildId, o10.headers.set("Location", z(e10, p2).url)), m2 && (o10.headers.delete("Location"), o10.headers.set("x-nextjs-redirect", z(e10.toString(), p2.toString()).url));
        }
        let A2 = o10 || V.next(), R2 = A2.headers.get("x-middleware-override-headers"), C2 = [];
        if (R2) {
          for (let [e10, t11] of b2) A2.headers.set(`x-middleware-request-${e10}`, t11), C2.push(e10);
          C2.length > 0 && A2.headers.set("x-middleware-override-headers", R2 + "," + C2.join(","));
        }
        return { response: A2, waitUntil: ("internal" === E2[x].kind ? Promise.all(E2[x].promises).then(() => {
        }) : void 0) ?? Promise.resolve(), fetchMetrics: v2.fetchMetrics };
      }
      var e7 = function(e10, t10, r10, n10, i10) {
        if ("m" === n10) throw TypeError("Private method is not writable");
        if ("a" === n10 && !i10) throw TypeError("Private accessor was defined without a setter");
        if ("function" == typeof t10 ? e10 !== t10 || !i10 : !t10.has(e10)) throw TypeError("Cannot write private member to an object whose class did not declare it");
        return "a" === n10 ? i10.call(e10, r10) : i10 ? i10.value = r10 : t10.set(e10, r10), r10;
      }, te = function(e10, t10, r10, n10) {
        if ("a" === r10 && !n10) throw TypeError("Private accessor was defined without a getter");
        if ("function" == typeof t10 ? e10 !== t10 || !n10 : !t10.has(e10)) throw TypeError("Cannot read private member from an object whose class did not declare it");
        return "m" === r10 ? n10 : "a" === r10 ? n10.call(e10) : n10 ? n10.value : t10.get(e10);
      };
      function tt(e10) {
        let t10 = e10 ? "__Secure-" : "";
        return { sessionToken: { name: `${t10}authjs.session-token`, options: { httpOnly: true, sameSite: "lax", path: "/", secure: e10 } }, callbackUrl: { name: `${t10}authjs.callback-url`, options: { httpOnly: true, sameSite: "lax", path: "/", secure: e10 } }, csrfToken: { name: `${e10 ? "__Host-" : ""}authjs.csrf-token`, options: { httpOnly: true, sameSite: "lax", path: "/", secure: e10 } }, pkceCodeVerifier: { name: `${t10}authjs.pkce.code_verifier`, options: { httpOnly: true, sameSite: "lax", path: "/", secure: e10, maxAge: 900 } }, state: { name: `${t10}authjs.state`, options: { httpOnly: true, sameSite: "lax", path: "/", secure: e10, maxAge: 900 } }, nonce: { name: `${t10}authjs.nonce`, options: { httpOnly: true, sameSite: "lax", path: "/", secure: e10 } }, webauthnChallenge: { name: `${t10}authjs.challenge`, options: { httpOnly: true, sameSite: "lax", path: "/", secure: e10, maxAge: 900 } } };
      }
      class tr {
        constructor(e10, t10, r10) {
          if (it.add(this), ir.set(this, {}), ii.set(this, void 0), ia.set(this, void 0), e7(this, ia, r10, "f"), e7(this, ii, e10, "f"), !t10) return;
          const { name: n10 } = e10;
          for (const [e11, r11] of Object.entries(t10)) e11.startsWith(n10) && r11 && (te(this, ir, "f")[e11] = r11);
        }
        get value() {
          return Object.keys(te(this, ir, "f")).sort((e10, t10) => parseInt(e10.split(".").pop() || "0") - parseInt(t10.split(".").pop() || "0")).map((e10) => te(this, ir, "f")[e10]).join("");
        }
        chunk(e10, t10) {
          let r10 = te(this, it, "m", is).call(this);
          for (let n10 of te(this, it, "m", io).call(this, { name: te(this, ii, "f").name, value: e10, options: { ...te(this, ii, "f").options, ...t10 } })) r10[n10.name] = n10;
          return Object.values(r10);
        }
        clean() {
          return Object.values(te(this, it, "m", is).call(this));
        }
      }
      ir = /* @__PURE__ */ new WeakMap(), ii = /* @__PURE__ */ new WeakMap(), ia = /* @__PURE__ */ new WeakMap(), it = /* @__PURE__ */ new WeakSet(), io = function(e10) {
        let t10 = Math.ceil(e10.value.length / 3936);
        if (1 === t10) return te(this, ir, "f")[e10.name] = e10.value, [e10];
        let r10 = [];
        for (let n10 = 0; n10 < t10; n10++) {
          let t11 = `${e10.name}.${n10}`, i10 = e10.value.substr(3936 * n10, 3936);
          r10.push({ ...e10, name: t11, value: i10 }), te(this, ir, "f")[t11] = i10;
        }
        return te(this, ia, "f").debug("CHUNKING_SESSION_COOKIE", { message: "Session cookie exceeds allowed 4096 bytes.", emptyCookieSize: 160, valueSize: e10.value.length, chunks: r10.map((e11) => e11.value.length + 160) }), r10;
      }, is = function() {
        let e10 = {};
        for (let t10 in te(this, ir, "f")) delete te(this, ir, "f")?.[t10], e10[t10] = { name: t10, value: "", options: { ...te(this, ii, "f").options, maxAge: 0 } };
        return e10;
      };
      class tn extends Error {
        constructor(e10, t10) {
          e10 instanceof Error ? super(void 0, { cause: { err: e10, ...e10.cause, ...t10 } }) : "string" == typeof e10 ? (t10 instanceof Error && (t10 = { err: t10, ...t10.cause }), super(e10, t10)) : super(void 0, e10), this.name = this.constructor.name, this.type = this.constructor.type ?? "AuthError", this.kind = this.constructor.kind ?? "error", Error.captureStackTrace?.(this, this.constructor);
          const r10 = `https://errors.authjs.dev#${this.type.toLowerCase()}`;
          this.message += `${this.message ? ". " : ""}Read more at ${r10}`;
        }
      }
      class ti extends tn {
      }
      ti.kind = "signIn";
      class ta extends tn {
      }
      ta.type = "AdapterError";
      class to extends tn {
      }
      to.type = "AccessDenied";
      class ts extends tn {
      }
      ts.type = "CallbackRouteError";
      class tc extends tn {
      }
      tc.type = "ErrorPageLoop";
      class tl extends tn {
      }
      tl.type = "EventError";
      class tu extends tn {
      }
      tu.type = "InvalidCallbackUrl";
      class td extends ti {
        constructor() {
          super(...arguments), this.code = "credentials";
        }
      }
      td.type = "CredentialsSignin";
      class tp extends tn {
      }
      tp.type = "InvalidEndpoints";
      class th extends tn {
      }
      th.type = "InvalidCheck";
      class tf extends tn {
      }
      tf.type = "JWTSessionError";
      class tg extends tn {
      }
      tg.type = "MissingAdapter";
      class tm extends tn {
      }
      tm.type = "MissingAdapterMethods";
      class ty extends tn {
      }
      ty.type = "MissingAuthorize";
      class tb extends tn {
      }
      tb.type = "MissingSecret";
      class tw extends ti {
      }
      tw.type = "OAuthAccountNotLinked";
      class tv extends ti {
      }
      tv.type = "OAuthCallbackError";
      class t_ extends tn {
      }
      t_.type = "OAuthProfileParseError";
      class tE extends tn {
      }
      tE.type = "SessionTokenError";
      class tS extends tn {
      }
      tS.type = "SignOutError";
      class tk extends tn {
      }
      tk.type = "UnknownAction";
      class tx extends tn {
      }
      tx.type = "UnsupportedStrategy";
      class tA extends tn {
      }
      tA.type = "InvalidProvider";
      class tT extends tn {
      }
      tT.type = "UntrustedHost";
      class tR extends tn {
      }
      tR.type = "Verification";
      class tC extends ti {
      }
      tC.type = "MissingCSRF";
      let tP = /* @__PURE__ */ new Set(["CredentialsSignin", "OAuthAccountNotLinked", "OAuthCallbackError", "AccessDenied", "Verification", "MissingCSRF", "AccountNotLinked", "WebAuthnVerificationError"]);
      class tO extends tn {
      }
      tO.type = "DuplicateConditionalUI";
      class tI extends tn {
      }
      tI.type = "MissingWebAuthnAutocomplete";
      class tN extends tn {
      }
      tN.type = "WebAuthnVerificationError";
      class tU extends ti {
      }
      tU.type = "AccountNotLinked";
      class tD extends tn {
      }
      tD.type = "ExperimentalFeatureNotEnabled";
      let tj = false;
      function t$(e10, t10) {
        try {
          return /^https?:/.test(new URL(e10, e10.startsWith("/") ? t10 : void 0).protocol);
        } catch {
          return false;
        }
      }
      let tL = false, tM = false, tH = false, tW = ["createVerificationToken", "useVerificationToken", "getUserByEmail"], tK = ["createUser", "getUser", "getUserByEmail", "getUserByAccount", "updateUser", "linkAccount", "createSession", "getSessionAndUser", "updateSession", "deleteSession"], tB = ["createUser", "getUser", "linkAccount", "getAccount", "getAuthenticator", "createAuthenticator", "listAuthenticatorsByUserId", "updateAuthenticatorCounter"], tq = async (e10, t10, r10, n10, i10) => {
        let { crypto: { subtle: a10 } } = (() => {
          if ("u" > typeof globalThis) return globalThis;
          if ("u" > typeof self) return self;
          throw Error("unable to locate global object");
        })();
        return new Uint8Array(await a10.deriveBits({ name: "HKDF", hash: `SHA-${e10.substr(3)}`, salt: r10, info: n10 }, await a10.importKey("raw", t10, "HKDF", false, ["deriveBits"]), i10 << 3));
      };
      function tJ(e10, t10) {
        if ("string" == typeof e10) return new TextEncoder().encode(e10);
        if (!(e10 instanceof Uint8Array)) throw TypeError(`"${t10}"" must be an instance of Uint8Array or a string`);
        return e10;
      }
      async function tV(e10, t10, r10, n10, i10) {
        return tq(function(e11) {
          switch (e11) {
            case "sha256":
            case "sha384":
            case "sha512":
            case "sha1":
              return e11;
            default:
              throw TypeError('unsupported "digest" value');
          }
        }(e10), function(e11) {
          let t11 = tJ(e11, "ikm");
          if (!t11.byteLength) throw TypeError('"ikm" must be at least one byte in length');
          return t11;
        }(t10), tJ(r10, "salt"), function(e11) {
          let t11 = tJ(e11, "info");
          if (t11.byteLength > 1024) throw TypeError('"info" must not contain more than 1024 bytes');
          return t11;
        }(n10), function(e11, t11) {
          if ("number" != typeof e11 || !Number.isInteger(e11) || e11 < 1) throw TypeError('"keylen" must be a positive integer');
          if (e11 > 255 * (parseInt(t11.substr(3), 10) >> 3 || 20)) throw TypeError('"keylen" too large');
          return e11;
        }(i10, e10));
      }
      let tz = new TextEncoder(), tF = new TextDecoder();
      function tG(...e10) {
        let t10 = new Uint8Array(e10.reduce((e11, { length: t11 }) => e11 + t11, 0)), r10 = 0;
        for (let n10 of e10) t10.set(n10, r10), r10 += n10.length;
        return t10;
      }
      function tX(e10, t10, r10) {
        if (t10 < 0 || t10 >= 4294967296) throw RangeError(`value must be >= 0 and <= ${4294967296 - 1}. Received ${t10}`);
        e10.set([t10 >>> 24, t10 >>> 16, t10 >>> 8, 255 & t10], r10);
      }
      function tY(e10) {
        let t10 = Math.floor(e10 / 4294967296), r10 = new Uint8Array(8);
        return tX(r10, t10, 0), tX(r10, e10 % 4294967296, 4), r10;
      }
      function tQ(e10) {
        let t10 = new Uint8Array(4);
        return tX(t10, e10), t10;
      }
      function tZ(e10) {
        let t10 = new Uint8Array(e10.length);
        for (let r10 = 0; r10 < e10.length; r10++) {
          let n10 = e10.charCodeAt(r10);
          if (n10 > 127) throw TypeError("non-ASCII string encountered in encode()");
          t10[r10] = n10;
        }
        return t10;
      }
      function t0(e10) {
        if (Uint8Array.fromBase64) return Uint8Array.fromBase64("string" == typeof e10 ? e10 : tF.decode(e10), { alphabet: "base64url" });
        let t10 = e10;
        t10 instanceof Uint8Array && (t10 = tF.decode(t10)), t10 = t10.replace(/-/g, "+").replace(/_/g, "/");
        try {
          var r10 = t10;
          if (Uint8Array.fromBase64) return Uint8Array.fromBase64(r10);
          let e11 = atob(r10), n10 = new Uint8Array(e11.length);
          for (let t11 = 0; t11 < e11.length; t11++) n10[t11] = e11.charCodeAt(t11);
          return n10;
        } catch {
          throw TypeError("The input to be decoded is not correctly encoded.");
        }
      }
      function t1(e10) {
        let t10 = e10;
        return ("string" == typeof t10 && (t10 = tz.encode(t10)), Uint8Array.prototype.toBase64) ? t10.toBase64({ alphabet: "base64url", omitPadding: true }) : function(e11) {
          if (Uint8Array.prototype.toBase64) return e11.toBase64();
          let t11 = [];
          for (let r10 = 0; r10 < e11.length; r10 += 32768) t11.push(String.fromCharCode.apply(null, e11.subarray(r10, r10 + 32768)));
          return btoa(t11.join(""));
        }(t10).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
      }
      e.s(["decode", () => t0, "encode", () => t1], 22423);
      let t2 = Symbol();
      class t5 extends Error {
        static code = "ERR_JOSE_GENERIC";
        code = "ERR_JOSE_GENERIC";
        constructor(e10, t10) {
          super(e10, t10), this.name = this.constructor.name, Error.captureStackTrace?.(this, this.constructor);
        }
      }
      class t3 extends t5 {
        static code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
        code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
        claim;
        reason;
        payload;
        constructor(e10, t10, r10 = "unspecified", n10 = "unspecified") {
          super(e10, { cause: { claim: r10, reason: n10, payload: t10 } }), this.claim = r10, this.reason = n10, this.payload = t10;
        }
      }
      class t8 extends t5 {
        static code = "ERR_JWT_EXPIRED";
        code = "ERR_JWT_EXPIRED";
        claim;
        reason;
        payload;
        constructor(e10, t10, r10 = "unspecified", n10 = "unspecified") {
          super(e10, { cause: { claim: r10, reason: n10, payload: t10 } }), this.claim = r10, this.reason = n10, this.payload = t10;
        }
      }
      class t6 extends t5 {
        static code = "ERR_JOSE_ALG_NOT_ALLOWED";
        code = "ERR_JOSE_ALG_NOT_ALLOWED";
      }
      class t4 extends t5 {
        static code = "ERR_JOSE_NOT_SUPPORTED";
        code = "ERR_JOSE_NOT_SUPPORTED";
      }
      class t9 extends t5 {
        static code = "ERR_JWE_DECRYPTION_FAILED";
        code = "ERR_JWE_DECRYPTION_FAILED";
        constructor(e10 = "decryption operation failed", t10) {
          super(e10, t10);
        }
      }
      class t7 extends t5 {
        static code = "ERR_JWE_INVALID";
        code = "ERR_JWE_INVALID";
      }
      class re extends t5 {
        static code = "ERR_JWT_INVALID";
        code = "ERR_JWT_INVALID";
      }
      class rt extends t5 {
        static code = "ERR_JWK_INVALID";
        code = "ERR_JWK_INVALID";
      }
      class rr extends t5 {
        [Symbol.asyncIterator];
        static code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
        code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
        constructor(e10 = "multiple matching keys found in the JSON Web Key Set", t10) {
          super(e10, t10);
        }
      }
      function rn(e10) {
        switch (e10) {
          case "A128GCM":
          case "A128GCMKW":
          case "A192GCM":
          case "A192GCMKW":
          case "A256GCM":
          case "A256GCMKW":
            return 96;
          case "A128CBC-HS256":
          case "A192CBC-HS384":
          case "A256CBC-HS512":
            return 128;
          default:
            throw new t4(`Unsupported JWE Algorithm: ${e10}`);
        }
      }
      function ri(e10, t10) {
        if (t10.length << 3 !== rn(e10)) throw new t7("Invalid Initialization Vector length");
      }
      function ra(e10, t10) {
        let r10 = e10.byteLength << 3;
        if (r10 !== t10) throw new t7(`Invalid Content Encryption Key length. Expected ${t10} bits, got ${r10} bits`);
      }
      let ro = (e10, t10 = "algorithm.name") => TypeError(`CryptoKey does not support this operation, its ${t10} must be ${e10}`);
      function rs(e10, t10, r10) {
        switch (t10) {
          case "A128GCM":
          case "A192GCM":
          case "A256GCM": {
            if ("AES-GCM" !== e10.algorithm.name) throw ro("AES-GCM");
            let r11 = parseInt(t10.slice(1, 4), 10);
            if (e10.algorithm.length !== r11) throw ro(r11, "algorithm.length");
            break;
          }
          case "A128KW":
          case "A192KW":
          case "A256KW": {
            if ("AES-KW" !== e10.algorithm.name) throw ro("AES-KW");
            let r11 = parseInt(t10.slice(1, 4), 10);
            if (e10.algorithm.length !== r11) throw ro(r11, "algorithm.length");
            break;
          }
          case "ECDH":
            switch (e10.algorithm.name) {
              case "ECDH":
              case "X25519":
                break;
              default:
                throw ro("ECDH or X25519");
            }
            break;
          case "PBES2-HS256+A128KW":
          case "PBES2-HS384+A192KW":
          case "PBES2-HS512+A256KW":
            if ("PBKDF2" !== e10.algorithm.name) throw ro("PBKDF2");
            break;
          case "RSA-OAEP":
          case "RSA-OAEP-256":
          case "RSA-OAEP-384":
          case "RSA-OAEP-512": {
            if ("RSA-OAEP" !== e10.algorithm.name) throw ro("RSA-OAEP");
            let r11 = parseInt(t10.slice(9), 10) || 1;
            if (parseInt(e10.algorithm.hash.name.slice(4), 10) !== r11) throw ro(`SHA-${r11}`, "algorithm.hash");
            break;
          }
          default:
            throw TypeError("CryptoKey does not support this operation");
        }
        if (r10 && !e10.usages.includes(r10)) throw TypeError(`CryptoKey does not support this operation, its usages must include ${r10}.`);
      }
      function rc(e10, t10, ...r10) {
        if ((r10 = r10.filter(Boolean)).length > 2) {
          let t11 = r10.pop();
          e10 += `one of type ${r10.join(", ")}, or ${t11}.`;
        } else 2 === r10.length ? e10 += `one of type ${r10[0]} or ${r10[1]}.` : e10 += `of type ${r10[0]}.`;
        return null == t10 ? e10 += ` Received ${t10}` : "function" == typeof t10 && t10.name ? e10 += ` Received function ${t10.name}` : "object" == typeof t10 && null != t10 && t10.constructor?.name && (e10 += ` Received an instance of ${t10.constructor.name}`), e10;
      }
      let rl = (e10, ...t10) => rc("Key must be ", e10, ...t10), ru = (e10, t10, ...r10) => rc(`Key for the ${e10} algorithm must be `, t10, ...r10);
      function rd(e10) {
        if (!rp(e10)) throw Error("CryptoKey instance expected");
      }
      let rp = (e10) => {
        if (e10?.[Symbol.toStringTag] === "CryptoKey") return true;
        try {
          return e10 instanceof CryptoKey;
        } catch {
          return false;
        }
      }, rh = (e10) => e10?.[Symbol.toStringTag] === "KeyObject", rf = (e10) => rp(e10) || rh(e10);
      async function rg(e10, t10, r10, n10, i10) {
        if (!(r10 instanceof Uint8Array)) throw TypeError(rl(r10, "Uint8Array"));
        let a10 = parseInt(e10.slice(1, 4), 10), o10 = await crypto.subtle.importKey("raw", r10.subarray(a10 >> 3), "AES-CBC", false, ["encrypt"]), s2 = await crypto.subtle.importKey("raw", r10.subarray(0, a10 >> 3), { hash: `SHA-${a10 << 1}`, name: "HMAC" }, false, ["sign"]), c2 = new Uint8Array(await crypto.subtle.encrypt({ iv: n10, name: "AES-CBC" }, o10, t10)), l2 = tG(i10, n10, c2, tY(i10.length << 3));
        return { ciphertext: c2, tag: new Uint8Array((await crypto.subtle.sign("HMAC", s2, l2)).slice(0, a10 >> 3)), iv: n10 };
      }
      async function rm(e10, t10, r10, n10, i10) {
        let a10;
        r10 instanceof Uint8Array ? a10 = await crypto.subtle.importKey("raw", r10, "AES-GCM", false, ["encrypt"]) : (rs(r10, e10, "encrypt"), a10 = r10);
        let o10 = new Uint8Array(await crypto.subtle.encrypt({ additionalData: i10, iv: n10, name: "AES-GCM", tagLength: 128 }, a10, t10)), s2 = o10.slice(-16);
        return { ciphertext: o10.slice(0, -16), tag: s2, iv: n10 };
      }
      async function ry(e10, t10, r10, n10, i10) {
        if (!rp(r10) && !(r10 instanceof Uint8Array)) throw TypeError(rl(r10, "CryptoKey", "KeyObject", "Uint8Array", "JSON Web Key"));
        if (n10) ri(e10, n10);
        else n10 = crypto.getRandomValues(new Uint8Array(rn(e10) >> 3));
        switch (e10) {
          case "A128CBC-HS256":
          case "A192CBC-HS384":
          case "A256CBC-HS512":
            return r10 instanceof Uint8Array && ra(r10, parseInt(e10.slice(-3), 10)), rg(e10, t10, r10, n10, i10);
          case "A128GCM":
          case "A192GCM":
          case "A256GCM":
            return r10 instanceof Uint8Array && ra(r10, parseInt(e10.slice(1, 4), 10)), rm(e10, t10, r10, n10, i10);
          default:
            throw new t4("Unsupported JWE Content Encryption Algorithm");
        }
      }
      function rb(e10, t10) {
        if (e10.algorithm.length !== parseInt(t10.slice(1, 4), 10)) throw TypeError(`Invalid key size for alg: ${t10}`);
      }
      function rw(e10, t10, r10) {
        return e10 instanceof Uint8Array ? crypto.subtle.importKey("raw", e10, "AES-KW", true, [r10]) : (rs(e10, t10, r10), e10);
      }
      async function rv(e10, t10, r10) {
        let n10 = await rw(t10, e10, "wrapKey");
        rb(n10, e10);
        let i10 = await crypto.subtle.importKey("raw", r10, { hash: "SHA-256", name: "HMAC" }, true, ["sign"]);
        return new Uint8Array(await crypto.subtle.wrapKey("raw", i10, n10, "AES-KW"));
      }
      async function r_(e10, t10, r10) {
        let n10 = await rw(t10, e10, "unwrapKey");
        rb(n10, e10);
        let i10 = await crypto.subtle.unwrapKey("raw", r10, n10, "AES-KW", { hash: "SHA-256", name: "HMAC" }, true, ["sign"]);
        return new Uint8Array(await crypto.subtle.exportKey("raw", i10));
      }
      async function rE(e10, t10) {
        let r10 = `SHA-${e10.slice(-3)}`;
        return new Uint8Array(await crypto.subtle.digest(r10, t10));
      }
      function rS(e10) {
        return tG(tQ(e10.length), e10);
      }
      async function rk(e10, t10, r10) {
        let n10 = t10 >> 3, i10 = Math.ceil(n10 / 32), a10 = new Uint8Array(32 * i10);
        for (let t11 = 1; t11 <= i10; t11++) {
          let n11 = new Uint8Array(4 + e10.length + r10.length);
          n11.set(tQ(t11), 0), n11.set(e10, 4), n11.set(r10, 4 + e10.length);
          let i11 = await rE("sha256", n11);
          a10.set(i11, (t11 - 1) * 32);
        }
        return a10.slice(0, n10);
      }
      async function rx(e10, t10, r10, n10, i10 = new Uint8Array(), a10 = new Uint8Array()) {
        var o10;
        rs(e10, "ECDH"), rs(t10, "ECDH", "deriveBits");
        let s2 = tG(rS(tZ(r10)), rS(i10), rS(a10), tQ(n10), new Uint8Array());
        return rk(new Uint8Array(await crypto.subtle.deriveBits({ name: e10.algorithm.name, public: e10 }, t10, "X25519" === (o10 = e10).algorithm.name ? 256 : Math.ceil(parseInt(o10.algorithm.namedCurve.slice(-3), 10) / 8) << 3)), n10, s2);
      }
      function rA(e10) {
        switch (e10.algorithm.namedCurve) {
          case "P-256":
          case "P-384":
          case "P-521":
            return true;
          default:
            return "X25519" === e10.algorithm.name;
        }
      }
      async function rT(e10, t10, r10, n10) {
        if (!(e10 instanceof Uint8Array) || e10.length < 8) throw new t7("PBES2 Salt Input must be 8 or more octets");
        let i10 = tG(tZ(t10), Uint8Array.of(0), e10), a10 = parseInt(t10.slice(13, 16), 10), o10 = { hash: `SHA-${t10.slice(8, 11)}`, iterations: r10, name: "PBKDF2", salt: i10 }, s2 = await (n10 instanceof Uint8Array ? crypto.subtle.importKey("raw", n10, "PBKDF2", false, ["deriveBits"]) : (rs(n10, t10, "deriveBits"), n10));
        return new Uint8Array(await crypto.subtle.deriveBits(o10, s2, a10));
      }
      async function rR(e10, t10, r10, n10 = 2048, i10 = crypto.getRandomValues(new Uint8Array(16))) {
        let a10 = await rT(i10, e10, n10, t10);
        return { encryptedKey: await rv(e10.slice(-6), a10, r10), p2c: n10, p2s: t1(i10) };
      }
      async function rC(e10, t10, r10, n10, i10) {
        let a10 = await rT(i10, e10, n10, t10);
        return r_(e10.slice(-6), a10, r10);
      }
      function rP(e10, t10) {
        if (e10.startsWith("RS") || e10.startsWith("PS")) {
          let { modulusLength: r10 } = t10.algorithm;
          if ("number" != typeof r10 || r10 < 2048) throw TypeError(`${e10} requires key modulusLength to be 2048 bits or larger`);
        }
      }
      let rO = (e10) => {
        switch (e10) {
          case "RSA-OAEP":
          case "RSA-OAEP-256":
          case "RSA-OAEP-384":
          case "RSA-OAEP-512":
            return "RSA-OAEP";
          default:
            throw new t4(`alg ${e10} is not supported either by JOSE or your javascript runtime`);
        }
      };
      async function rI(e10, t10, r10) {
        return rs(t10, e10, "encrypt"), rP(e10, t10), new Uint8Array(await crypto.subtle.encrypt(rO(e10), t10, r10));
      }
      async function rN(e10, t10, r10) {
        return rs(t10, e10, "decrypt"), rP(e10, t10), new Uint8Array(await crypto.subtle.decrypt(rO(e10), t10, r10));
      }
      function rU(e10) {
        if ("object" != typeof e10 || null === e10 || "[object Object]" !== Object.prototype.toString.call(e10)) return false;
        if (null === Object.getPrototypeOf(e10)) return true;
        let t10 = e10;
        for (; null !== Object.getPrototypeOf(t10); ) t10 = Object.getPrototypeOf(t10);
        return Object.getPrototypeOf(e10) === t10;
      }
      let rD = (e10) => rU(e10) && "string" == typeof e10.kty;
      async function rj(e10) {
        if (!e10.alg) throw TypeError('"alg" argument is required when "jwk.alg" is not present');
        let { algorithm: t10, keyUsages: r10 } = function(e11) {
          let t11, r11;
          switch (e11.kty) {
            case "AKP":
              switch (e11.alg) {
                case "ML-DSA-44":
                case "ML-DSA-65":
                case "ML-DSA-87":
                  t11 = { name: e11.alg }, r11 = e11.priv ? ["sign"] : ["verify"];
                  break;
                default:
                  throw new t4('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
              }
              break;
            case "RSA":
              switch (e11.alg) {
                case "PS256":
                case "PS384":
                case "PS512":
                  t11 = { name: "RSA-PSS", hash: `SHA-${e11.alg.slice(-3)}` }, r11 = e11.d ? ["sign"] : ["verify"];
                  break;
                case "RS256":
                case "RS384":
                case "RS512":
                  t11 = { name: "RSASSA-PKCS1-v1_5", hash: `SHA-${e11.alg.slice(-3)}` }, r11 = e11.d ? ["sign"] : ["verify"];
                  break;
                case "RSA-OAEP":
                case "RSA-OAEP-256":
                case "RSA-OAEP-384":
                case "RSA-OAEP-512":
                  t11 = { name: "RSA-OAEP", hash: `SHA-${parseInt(e11.alg.slice(-3), 10) || 1}` }, r11 = e11.d ? ["decrypt", "unwrapKey"] : ["encrypt", "wrapKey"];
                  break;
                default:
                  throw new t4('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
              }
              break;
            case "EC":
              switch (e11.alg) {
                case "ES256":
                  t11 = { name: "ECDSA", namedCurve: "P-256" }, r11 = e11.d ? ["sign"] : ["verify"];
                  break;
                case "ES384":
                  t11 = { name: "ECDSA", namedCurve: "P-384" }, r11 = e11.d ? ["sign"] : ["verify"];
                  break;
                case "ES512":
                  t11 = { name: "ECDSA", namedCurve: "P-521" }, r11 = e11.d ? ["sign"] : ["verify"];
                  break;
                case "ECDH-ES":
                case "ECDH-ES+A128KW":
                case "ECDH-ES+A192KW":
                case "ECDH-ES+A256KW":
                  t11 = { name: "ECDH", namedCurve: e11.crv }, r11 = e11.d ? ["deriveBits"] : [];
                  break;
                default:
                  throw new t4('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
              }
              break;
            case "OKP":
              switch (e11.alg) {
                case "Ed25519":
                case "EdDSA":
                  t11 = { name: "Ed25519" }, r11 = e11.d ? ["sign"] : ["verify"];
                  break;
                case "ECDH-ES":
                case "ECDH-ES+A128KW":
                case "ECDH-ES+A192KW":
                case "ECDH-ES+A256KW":
                  t11 = { name: e11.crv }, r11 = e11.d ? ["deriveBits"] : [];
                  break;
                default:
                  throw new t4('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
              }
              break;
            default:
              throw new t4('Invalid or unsupported JWK "kty" (Key Type) Parameter value');
          }
          return { algorithm: t11, keyUsages: r11 };
        }(e10), n10 = { ...e10 };
        return "AKP" !== n10.kty && delete n10.alg, delete n10.use, crypto.subtle.importKey("jwk", n10, t10, e10.ext ?? (!e10.d && !e10.priv), e10.key_ops ?? r10);
      }
      let r$ = async (e10, t10, n10, i10 = false) => {
        let a10 = (r ||= /* @__PURE__ */ new WeakMap()).get(e10);
        if (a10?.[n10]) return a10[n10];
        let o10 = await rj({ ...t10, alg: n10 });
        return i10 && Object.freeze(e10), a10 ? a10[n10] = o10 : r.set(e10, { [n10]: o10 }), o10;
      };
      async function rL(e10, t10) {
        if (e10 instanceof Uint8Array || rp(e10)) return e10;
        if (rh(e10)) {
          if ("secret" === e10.type) return e10.export();
          if ("toCryptoKey" in e10 && "function" == typeof e10.toCryptoKey) try {
            return ((e11, t11) => {
              let n11, i10 = (r ||= /* @__PURE__ */ new WeakMap()).get(e11);
              if (i10?.[t11]) return i10[t11];
              let a10 = "public" === e11.type, o10 = !!a10;
              if ("x25519" === e11.asymmetricKeyType) {
                switch (t11) {
                  case "ECDH-ES":
                  case "ECDH-ES+A128KW":
                  case "ECDH-ES+A192KW":
                  case "ECDH-ES+A256KW":
                    break;
                  default:
                    throw TypeError("given KeyObject instance cannot be used for this algorithm");
                }
                n11 = e11.toCryptoKey(e11.asymmetricKeyType, o10, a10 ? [] : ["deriveBits"]);
              }
              if ("ed25519" === e11.asymmetricKeyType) {
                if ("EdDSA" !== t11 && "Ed25519" !== t11) throw TypeError("given KeyObject instance cannot be used for this algorithm");
                n11 = e11.toCryptoKey(e11.asymmetricKeyType, o10, [a10 ? "verify" : "sign"]);
              }
              switch (e11.asymmetricKeyType) {
                case "ml-dsa-44":
                case "ml-dsa-65":
                case "ml-dsa-87":
                  if (t11 !== e11.asymmetricKeyType.toUpperCase()) throw TypeError("given KeyObject instance cannot be used for this algorithm");
                  n11 = e11.toCryptoKey(e11.asymmetricKeyType, o10, [a10 ? "verify" : "sign"]);
              }
              if ("rsa" === e11.asymmetricKeyType) {
                let r10;
                switch (t11) {
                  case "RSA-OAEP":
                    r10 = "SHA-1";
                    break;
                  case "RS256":
                  case "PS256":
                  case "RSA-OAEP-256":
                    r10 = "SHA-256";
                    break;
                  case "RS384":
                  case "PS384":
                  case "RSA-OAEP-384":
                    r10 = "SHA-384";
                    break;
                  case "RS512":
                  case "PS512":
                  case "RSA-OAEP-512":
                    r10 = "SHA-512";
                    break;
                  default:
                    throw TypeError("given KeyObject instance cannot be used for this algorithm");
                }
                if (t11.startsWith("RSA-OAEP")) return e11.toCryptoKey({ name: "RSA-OAEP", hash: r10 }, o10, a10 ? ["encrypt"] : ["decrypt"]);
                n11 = e11.toCryptoKey({ name: t11.startsWith("PS") ? "RSA-PSS" : "RSASSA-PKCS1-v1_5", hash: r10 }, o10, [a10 ? "verify" : "sign"]);
              }
              if ("ec" === e11.asymmetricKeyType) {
                let r10 = (/* @__PURE__ */ new Map([["prime256v1", "P-256"], ["secp384r1", "P-384"], ["secp521r1", "P-521"]])).get(e11.asymmetricKeyDetails?.namedCurve);
                if (!r10) throw TypeError("given KeyObject instance cannot be used for this algorithm");
                "ES256" === t11 && "P-256" === r10 && (n11 = e11.toCryptoKey({ name: "ECDSA", namedCurve: r10 }, o10, [a10 ? "verify" : "sign"])), "ES384" === t11 && "P-384" === r10 && (n11 = e11.toCryptoKey({ name: "ECDSA", namedCurve: r10 }, o10, [a10 ? "verify" : "sign"])), "ES512" === t11 && "P-521" === r10 && (n11 = e11.toCryptoKey({ name: "ECDSA", namedCurve: r10 }, o10, [a10 ? "verify" : "sign"])), t11.startsWith("ECDH-ES") && (n11 = e11.toCryptoKey({ name: "ECDH", namedCurve: r10 }, o10, a10 ? [] : ["deriveBits"]));
              }
              if (!n11) throw TypeError("given KeyObject instance cannot be used for this algorithm");
              return i10 ? i10[t11] = n11 : r.set(e11, { [t11]: n11 }), n11;
            })(e10, t10);
          } catch (e11) {
            if (e11 instanceof TypeError) throw e11;
          }
          let n10 = e10.export({ format: "jwk" });
          return r$(e10, n10, t10);
        }
        if (rD(e10)) return e10.k ? t0(e10.k) : r$(e10, e10, t10, true);
        throw Error("unreachable");
      }
      function rM(e10) {
        switch (e10) {
          case "A128GCM":
            return 128;
          case "A192GCM":
            return 192;
          case "A256GCM":
          case "A128CBC-HS256":
            return 256;
          case "A192CBC-HS384":
            return 384;
          case "A256CBC-HS512":
            return 512;
          default:
            throw new t4(`Unsupported JWE Algorithm: ${e10}`);
        }
      }
      let rH = (e10) => crypto.getRandomValues(new Uint8Array(rM(e10) >> 3));
      async function rW(e10) {
        if (rh(e10)) if ("secret" !== e10.type) return e10.export({ format: "jwk" });
        else e10 = e10.export();
        if (e10 instanceof Uint8Array) return { kty: "oct", k: t1(e10) };
        if (!rp(e10)) throw TypeError(rl(e10, "CryptoKey", "KeyObject", "Uint8Array"));
        if (!e10.extractable) throw TypeError("non-extractable CryptoKey cannot be exported as a JWK");
        let { ext: t10, key_ops: r10, alg: n10, use: i10, ...a10 } = await crypto.subtle.exportKey("jwk", e10);
        return "AKP" === a10.kty && (a10.alg = n10), a10;
      }
      async function rK(e10) {
        return rW(e10);
      }
      async function rB(e10, t10) {
        if (!(e10 instanceof Uint8Array)) throw TypeError("First argument must be a buffer");
        if (!(t10 instanceof Uint8Array)) throw TypeError("Second argument must be a buffer");
        let r10 = { name: "HMAC", hash: "SHA-256" }, n10 = await crypto.subtle.generateKey(r10, false, ["sign"]), i10 = new Uint8Array(await crypto.subtle.sign(r10, n10, e10)), a10 = new Uint8Array(await crypto.subtle.sign(r10, n10, t10)), o10 = 0, s2 = -1;
        for (; ++s2 < 32; ) o10 |= i10[s2] ^ a10[s2];
        return 0 === o10;
      }
      async function rq(e10, t10, r10, n10, i10, a10) {
        let o10, s2;
        if (!(t10 instanceof Uint8Array)) throw TypeError(rl(t10, "Uint8Array"));
        let c2 = parseInt(e10.slice(1, 4), 10), l2 = await crypto.subtle.importKey("raw", t10.subarray(c2 >> 3), "AES-CBC", false, ["decrypt"]), u2 = await crypto.subtle.importKey("raw", t10.subarray(0, c2 >> 3), { hash: `SHA-${c2 << 1}`, name: "HMAC" }, false, ["sign"]), d2 = tG(a10, n10, r10, tY(a10.length << 3)), p2 = new Uint8Array((await crypto.subtle.sign("HMAC", u2, d2)).slice(0, c2 >> 3));
        try {
          o10 = await rB(i10, p2);
        } catch {
        }
        if (!o10) throw new t9();
        try {
          s2 = new Uint8Array(await crypto.subtle.decrypt({ iv: n10, name: "AES-CBC" }, l2, r10));
        } catch {
        }
        if (!s2) throw new t9();
        return s2;
      }
      async function rJ(e10, t10, r10, n10, i10, a10) {
        let o10;
        t10 instanceof Uint8Array ? o10 = await crypto.subtle.importKey("raw", t10, "AES-GCM", false, ["decrypt"]) : (rs(t10, e10, "decrypt"), o10 = t10);
        try {
          return new Uint8Array(await crypto.subtle.decrypt({ additionalData: a10, iv: n10, name: "AES-GCM", tagLength: 128 }, o10, tG(r10, i10)));
        } catch {
          throw new t9();
        }
      }
      async function rV(e10, t10, r10, n10, i10, a10) {
        if (!rp(t10) && !(t10 instanceof Uint8Array)) throw TypeError(rl(t10, "CryptoKey", "KeyObject", "Uint8Array", "JSON Web Key"));
        if (!n10) throw new t7("JWE Initialization Vector missing");
        if (!i10) throw new t7("JWE Authentication Tag missing");
        switch (ri(e10, n10), e10) {
          case "A128CBC-HS256":
          case "A192CBC-HS384":
          case "A256CBC-HS512":
            return t10 instanceof Uint8Array && ra(t10, parseInt(e10.slice(-3), 10)), rq(e10, t10, r10, n10, i10, a10);
          case "A128GCM":
          case "A192GCM":
          case "A256GCM":
            return t10 instanceof Uint8Array && ra(t10, parseInt(e10.slice(1, 4), 10)), rJ(e10, t10, r10, n10, i10, a10);
          default:
            throw new t4("Unsupported JWE Content Encryption Algorithm");
        }
      }
      async function rz(e10, t10, r10, n10) {
        let i10 = e10.slice(0, 7), a10 = await ry(i10, r10, t10, n10, new Uint8Array());
        return { encryptedKey: a10.ciphertext, iv: t1(a10.iv), tag: t1(a10.tag) };
      }
      async function rF(e10, t10, r10, n10, i10) {
        return rV(e10.slice(0, 7), t10, r10, n10, i10, new Uint8Array());
      }
      async function rG(e10, t10, r10, n10, i10 = {}) {
        let a10, o10, s2;
        switch (e10) {
          case "dir":
            s2 = r10;
            break;
          case "ECDH-ES":
          case "ECDH-ES+A128KW":
          case "ECDH-ES+A192KW":
          case "ECDH-ES+A256KW": {
            let c2;
            if (rd(r10), !rA(r10)) throw new t4("ECDH with the provided key is not allowed or not supported by your javascript runtime");
            let { apu: l2, apv: u2 } = i10;
            c2 = i10.epk ? await rL(i10.epk, e10) : (await crypto.subtle.generateKey(r10.algorithm, true, ["deriveBits"])).privateKey;
            let { x: d2, y: p2, crv: h2, kty: f2 } = await rK(c2), g2 = await rx(r10, c2, "ECDH-ES" === e10 ? t10 : e10, "ECDH-ES" === e10 ? rM(t10) : parseInt(e10.slice(-5, -2), 10), l2, u2);
            if (o10 = { epk: { x: d2, crv: h2, kty: f2 } }, "EC" === f2 && (o10.epk.y = p2), l2 && (o10.apu = t1(l2)), u2 && (o10.apv = t1(u2)), "ECDH-ES" === e10) {
              s2 = g2;
              break;
            }
            s2 = n10 || rH(t10);
            let m2 = e10.slice(-6);
            a10 = await rv(m2, g2, s2);
            break;
          }
          case "RSA-OAEP":
          case "RSA-OAEP-256":
          case "RSA-OAEP-384":
          case "RSA-OAEP-512":
            s2 = n10 || rH(t10), rd(r10), a10 = await rI(e10, r10, s2);
            break;
          case "PBES2-HS256+A128KW":
          case "PBES2-HS384+A192KW":
          case "PBES2-HS512+A256KW": {
            s2 = n10 || rH(t10);
            let { p2c: c2, p2s: l2 } = i10;
            ({ encryptedKey: a10, ...o10 } = await rR(e10, r10, s2, c2, l2));
            break;
          }
          case "A128KW":
          case "A192KW":
          case "A256KW":
            s2 = n10 || rH(t10), a10 = await rv(e10, r10, s2);
            break;
          case "A128GCMKW":
          case "A192GCMKW":
          case "A256GCMKW": {
            s2 = n10 || rH(t10);
            let { iv: c2 } = i10;
            ({ encryptedKey: a10, ...o10 } = await rz(e10, r10, s2, c2));
            break;
          }
          default:
            throw new t4('Invalid or unsupported "alg" (JWE Algorithm) header value');
        }
        return { cek: s2, encryptedKey: a10, parameters: o10 };
      }
      function rX(...e10) {
        let t10, r10 = e10.filter(Boolean);
        if (0 === r10.length || 1 === r10.length) return true;
        for (let e11 of r10) {
          let r11 = Object.keys(e11);
          if (!t10 || 0 === t10.size) {
            t10 = new Set(r11);
            continue;
          }
          for (let e12 of r11) {
            if (t10.has(e12)) return false;
            t10.add(e12);
          }
        }
        return true;
      }
      function rY(e10, t10, r10, n10, i10) {
        let a10;
        if (void 0 !== i10.crit && n10?.crit === void 0) throw new e10('"crit" (Critical) Header Parameter MUST be integrity protected');
        if (!n10 || void 0 === n10.crit) return /* @__PURE__ */ new Set();
        if (!Array.isArray(n10.crit) || 0 === n10.crit.length || n10.crit.some((e11) => "string" != typeof e11 || 0 === e11.length)) throw new e10('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');
        for (let o10 of (a10 = void 0 !== r10 ? new Map([...Object.entries(r10), ...t10.entries()]) : t10, n10.crit)) {
          if (!a10.has(o10)) throw new t4(`Extension Header Parameter "${o10}" is not recognized`);
          if (void 0 === i10[o10]) throw new e10(`Extension Header Parameter "${o10}" is missing`);
          if (a10.get(o10) && void 0 === n10[o10]) throw new e10(`Extension Header Parameter "${o10}" MUST be integrity protected`);
        }
        return new Set(n10.crit);
      }
      let rQ = (e10) => e10?.[Symbol.toStringTag], rZ = (e10, t10, r10) => {
        if (void 0 !== t10.use) {
          let e11;
          switch (r10) {
            case "sign":
            case "verify":
              e11 = "sig";
              break;
            case "encrypt":
            case "decrypt":
              e11 = "enc";
          }
          if (t10.use !== e11) throw TypeError(`Invalid key for this operation, its "use" must be "${e11}" when present`);
        }
        if (void 0 !== t10.alg && t10.alg !== e10) throw TypeError(`Invalid key for this operation, its "alg" must be "${e10}" when present`);
        if (Array.isArray(t10.key_ops)) {
          let n10;
          switch (true) {
            case ("sign" === r10 || "verify" === r10):
            case "dir" === e10:
            case e10.includes("CBC-HS"):
              n10 = r10;
              break;
            case e10.startsWith("PBES2"):
              n10 = "deriveBits";
              break;
            case /^A\d{3}(?:GCM)?(?:KW)?$/.test(e10):
              n10 = !e10.includes("GCM") && e10.endsWith("KW") ? "encrypt" === r10 ? "wrapKey" : "unwrapKey" : r10;
              break;
            case ("encrypt" === r10 && e10.startsWith("RSA")):
              n10 = "wrapKey";
              break;
            case "decrypt" === r10:
              n10 = e10.startsWith("RSA") ? "unwrapKey" : "deriveBits";
          }
          if (n10 && t10.key_ops?.includes?.(n10) === false) throw TypeError(`Invalid key for this operation, its "key_ops" must include "${n10}" when present`);
        }
        return true;
      };
      function r0(e10, t10, r10) {
        switch (e10.substring(0, 2)) {
          case "A1":
          case "A2":
          case "di":
          case "HS":
          case "PB":
            ((e11, t11, r11) => {
              if (!(t11 instanceof Uint8Array)) {
                if (rD(t11)) {
                  if ("oct" === t11.kty && "string" == typeof t11.k && rZ(e11, t11, r11)) return;
                  throw TypeError('JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present');
                }
                if (!rf(t11)) throw TypeError(ru(e11, t11, "CryptoKey", "KeyObject", "JSON Web Key", "Uint8Array"));
                if ("secret" !== t11.type) throw TypeError(`${rQ(t11)} instances for symmetric algorithms must be of type "secret"`);
              }
            })(e10, t10, r10);
            break;
          default:
            ((e11, t11, r11) => {
              if (rD(t11)) switch (r11) {
                case "decrypt":
                case "sign":
                  if ("oct" !== t11.kty && ("AKP" === t11.kty && "string" == typeof t11.priv || "string" == typeof t11.d) && rZ(e11, t11, r11)) return;
                  throw TypeError("JSON Web Key for this operation must be a private JWK");
                case "encrypt":
                case "verify":
                  if ("oct" !== t11.kty && void 0 === t11.d && void 0 === t11.priv && rZ(e11, t11, r11)) return;
                  throw TypeError("JSON Web Key for this operation must be a public JWK");
              }
              if (!rf(t11)) throw TypeError(ru(e11, t11, "CryptoKey", "KeyObject", "JSON Web Key"));
              if ("secret" === t11.type) throw TypeError(`${rQ(t11)} instances for asymmetric algorithms must not be of type "secret"`);
              if ("public" === t11.type) switch (r11) {
                case "sign":
                  throw TypeError(`${rQ(t11)} instances for asymmetric algorithm signing must be of type "private"`);
                case "decrypt":
                  throw TypeError(`${rQ(t11)} instances for asymmetric algorithm decryption must be of type "private"`);
              }
              if ("private" === t11.type) switch (r11) {
                case "verify":
                  throw TypeError(`${rQ(t11)} instances for asymmetric algorithm verifying must be of type "public"`);
                case "encrypt":
                  throw TypeError(`${rQ(t11)} instances for asymmetric algorithm encryption must be of type "public"`);
              }
            })(e10, t10, r10);
        }
      }
      class r1 {
        #e;
        #t;
        #r;
        #n;
        #i;
        #a;
        #o;
        #s;
        constructor(e10) {
          if (!(e10 instanceof Uint8Array)) throw TypeError("plaintext must be an instance of Uint8Array");
          this.#e = e10;
        }
        setKeyManagementParameters(e10) {
          if (this.#s) throw TypeError("setKeyManagementParameters can only be called once");
          return this.#s = e10, this;
        }
        setProtectedHeader(e10) {
          if (this.#t) throw TypeError("setProtectedHeader can only be called once");
          return this.#t = e10, this;
        }
        setSharedUnprotectedHeader(e10) {
          if (this.#r) throw TypeError("setSharedUnprotectedHeader can only be called once");
          return this.#r = e10, this;
        }
        setUnprotectedHeader(e10) {
          if (this.#n) throw TypeError("setUnprotectedHeader can only be called once");
          return this.#n = e10, this;
        }
        setAdditionalAuthenticatedData(e10) {
          return this.#i = e10, this;
        }
        setContentEncryptionKey(e10) {
          if (this.#a) throw TypeError("setContentEncryptionKey can only be called once");
          return this.#a = e10, this;
        }
        setInitializationVector(e10) {
          if (this.#o) throw TypeError("setInitializationVector can only be called once");
          return this.#o = e10, this;
        }
        async encrypt(e10, t10) {
          let r10, n10, i10, a10, o10, s2;
          if (!this.#t && !this.#n && !this.#r) throw new t7("either setProtectedHeader, setUnprotectedHeader, or sharedUnprotectedHeader must be called before #encrypt()");
          if (!rX(this.#t, this.#n, this.#r)) throw new t7("JWE Protected, JWE Shared Unprotected and JWE Per-Recipient Header Parameter names must be disjoint");
          let c2 = { ...this.#t, ...this.#n, ...this.#r };
          if (rY(t7, /* @__PURE__ */ new Map(), t10?.crit, this.#t, c2), void 0 !== c2.zip) throw new t4('JWE "zip" (Compression Algorithm) Header Parameter is not supported.');
          let { alg: l2, enc: u2 } = c2;
          if ("string" != typeof l2 || !l2) throw new t7('JWE "alg" (Algorithm) Header Parameter missing or invalid');
          if ("string" != typeof u2 || !u2) throw new t7('JWE "enc" (Encryption Algorithm) Header Parameter missing or invalid');
          if (this.#a && ("dir" === l2 || "ECDH-ES" === l2)) throw TypeError(`setContentEncryptionKey cannot be called with JWE "alg" (Algorithm) Header ${l2}`);
          r0("dir" === l2 ? u2 : l2, e10, "encrypt");
          {
            let i11, a11 = await rL(e10, l2);
            ({ cek: n10, encryptedKey: r10, parameters: i11 } = await rG(l2, u2, a11, this.#a, this.#s)), i11 && (t10 && t2 in t10 ? this.#n ? this.#n = { ...this.#n, ...i11 } : this.setUnprotectedHeader(i11) : this.#t ? this.#t = { ...this.#t, ...i11 } : this.setProtectedHeader(i11));
          }
          if (this.#t ? o10 = tZ(a10 = t1(JSON.stringify(this.#t))) : (a10 = "", o10 = new Uint8Array()), this.#i) {
            let e11 = tZ(s2 = t1(this.#i));
            i10 = tG(o10, tZ("."), e11);
          } else i10 = o10;
          let { ciphertext: d2, tag: p2, iv: h2 } = await ry(u2, this.#e, n10, this.#o, i10), f2 = { ciphertext: t1(d2) };
          return h2 && (f2.iv = t1(h2)), p2 && (f2.tag = t1(p2)), r10 && (f2.encrypted_key = t1(r10)), s2 && (f2.aad = s2), this.#t && (f2.protected = a10), this.#r && (f2.unprotected = this.#r), this.#n && (f2.header = this.#n), f2;
        }
      }
      class r2 {
        #c;
        constructor(e10) {
          this.#c = new r1(e10);
        }
        setContentEncryptionKey(e10) {
          return this.#c.setContentEncryptionKey(e10), this;
        }
        setInitializationVector(e10) {
          return this.#c.setInitializationVector(e10), this;
        }
        setProtectedHeader(e10) {
          return this.#c.setProtectedHeader(e10), this;
        }
        setKeyManagementParameters(e10) {
          return this.#c.setKeyManagementParameters(e10), this;
        }
        async encrypt(e10, t10) {
          let r10 = await this.#c.encrypt(e10, t10);
          return [r10.protected, r10.encrypted_key, r10.iv, r10.ciphertext, r10.tag].join(".");
        }
      }
      let r5 = (e10) => Math.floor(e10.getTime() / 1e3), r3 = /^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i;
      function r8(e10) {
        let t10, r10 = r3.exec(e10);
        if (!r10 || r10[4] && r10[1]) throw TypeError("Invalid time period format");
        let n10 = parseFloat(r10[2]);
        switch (r10[3].toLowerCase()) {
          case "sec":
          case "secs":
          case "second":
          case "seconds":
          case "s":
            t10 = Math.round(n10);
            break;
          case "minute":
          case "minutes":
          case "min":
          case "mins":
          case "m":
            t10 = Math.round(60 * n10);
            break;
          case "hour":
          case "hours":
          case "hr":
          case "hrs":
          case "h":
            t10 = Math.round(3600 * n10);
            break;
          case "day":
          case "days":
          case "d":
            t10 = Math.round(86400 * n10);
            break;
          case "week":
          case "weeks":
          case "w":
            t10 = Math.round(604800 * n10);
            break;
          default:
            t10 = Math.round(31557600 * n10);
        }
        return "-" === r10[1] || "ago" === r10[4] ? -t10 : t10;
      }
      function r6(e10, t10) {
        if (!Number.isFinite(t10)) throw TypeError(`Invalid ${e10} input`);
        return t10;
      }
      let r4 = (e10) => e10.includes("/") ? e10.toLowerCase() : `application/${e10.toLowerCase()}`;
      class r9 {
        #l;
        constructor(e10) {
          if (!rU(e10)) throw TypeError("JWT Claims Set MUST be an object");
          this.#l = structuredClone(e10);
        }
        data() {
          return tz.encode(JSON.stringify(this.#l));
        }
        get iss() {
          return this.#l.iss;
        }
        set iss(e10) {
          this.#l.iss = e10;
        }
        get sub() {
          return this.#l.sub;
        }
        set sub(e10) {
          this.#l.sub = e10;
        }
        get aud() {
          return this.#l.aud;
        }
        set aud(e10) {
          this.#l.aud = e10;
        }
        set jti(e10) {
          this.#l.jti = e10;
        }
        set nbf(e10) {
          "number" == typeof e10 ? this.#l.nbf = r6("setNotBefore", e10) : e10 instanceof Date ? this.#l.nbf = r6("setNotBefore", r5(e10)) : this.#l.nbf = r5(/* @__PURE__ */ new Date()) + r8(e10);
        }
        set exp(e10) {
          "number" == typeof e10 ? this.#l.exp = r6("setExpirationTime", e10) : e10 instanceof Date ? this.#l.exp = r6("setExpirationTime", r5(e10)) : this.#l.exp = r5(/* @__PURE__ */ new Date()) + r8(e10);
        }
        set iat(e10) {
          void 0 === e10 ? this.#l.iat = r5(/* @__PURE__ */ new Date()) : e10 instanceof Date ? this.#l.iat = r6("setIssuedAt", r5(e10)) : "string" == typeof e10 ? this.#l.iat = r6("setIssuedAt", r5(/* @__PURE__ */ new Date()) + r8(e10)) : this.#l.iat = r6("setIssuedAt", e10);
        }
      }
      class r7 {
        #a;
        #o;
        #s;
        #t;
        #u;
        #d;
        #p;
        #h;
        constructor(e10 = {}) {
          this.#h = new r9(e10);
        }
        setIssuer(e10) {
          return this.#h.iss = e10, this;
        }
        setSubject(e10) {
          return this.#h.sub = e10, this;
        }
        setAudience(e10) {
          return this.#h.aud = e10, this;
        }
        setJti(e10) {
          return this.#h.jti = e10, this;
        }
        setNotBefore(e10) {
          return this.#h.nbf = e10, this;
        }
        setExpirationTime(e10) {
          return this.#h.exp = e10, this;
        }
        setIssuedAt(e10) {
          return this.#h.iat = e10, this;
        }
        setProtectedHeader(e10) {
          if (this.#t) throw TypeError("setProtectedHeader can only be called once");
          return this.#t = e10, this;
        }
        setKeyManagementParameters(e10) {
          if (this.#s) throw TypeError("setKeyManagementParameters can only be called once");
          return this.#s = e10, this;
        }
        setContentEncryptionKey(e10) {
          if (this.#a) throw TypeError("setContentEncryptionKey can only be called once");
          return this.#a = e10, this;
        }
        setInitializationVector(e10) {
          if (this.#o) throw TypeError("setInitializationVector can only be called once");
          return this.#o = e10, this;
        }
        replicateIssuerAsHeader() {
          return this.#u = true, this;
        }
        replicateSubjectAsHeader() {
          return this.#d = true, this;
        }
        replicateAudienceAsHeader() {
          return this.#p = true, this;
        }
        async encrypt(e10, t10) {
          let r10 = new r2(this.#h.data());
          return this.#t && (this.#u || this.#d || this.#p) && (this.#t = { ...this.#t, iss: this.#u ? this.#h.iss : void 0, sub: this.#d ? this.#h.sub : void 0, aud: this.#p ? this.#h.aud : void 0 }), r10.setProtectedHeader(this.#t), this.#o && r10.setInitializationVector(this.#o), this.#a && r10.setContentEncryptionKey(this.#a), this.#s && r10.setKeyManagementParameters(this.#s), r10.encrypt(e10, t10);
        }
      }
      var ne = e.i(22423), ne = ne;
      let nt = (e10, t10) => {
        if ("string" != typeof e10 || !e10) throw new rt(`${t10} missing or invalid`);
      };
      async function nr(e10, t10) {
        let r10, n10;
        if (rD(e10)) r10 = e10;
        else if (rf(e10)) r10 = await rK(e10);
        else throw TypeError(rl(e10, "CryptoKey", "KeyObject", "JSON Web Key"));
        if ("sha256" !== (t10 ??= "sha256") && "sha384" !== t10 && "sha512" !== t10) throw TypeError('digestAlgorithm must one of "sha256", "sha384", or "sha512"');
        switch (r10.kty) {
          case "AKP":
            nt(r10.alg, '"alg" (Algorithm) Parameter'), nt(r10.pub, '"pub" (Public key) Parameter'), n10 = { alg: r10.alg, kty: r10.kty, pub: r10.pub };
            break;
          case "EC":
            nt(r10.crv, '"crv" (Curve) Parameter'), nt(r10.x, '"x" (X Coordinate) Parameter'), nt(r10.y, '"y" (Y Coordinate) Parameter'), n10 = { crv: r10.crv, kty: r10.kty, x: r10.x, y: r10.y };
            break;
          case "OKP":
            nt(r10.crv, '"crv" (Subtype of Key Pair) Parameter'), nt(r10.x, '"x" (Public Key) Parameter'), n10 = { crv: r10.crv, kty: r10.kty, x: r10.x };
            break;
          case "RSA":
            nt(r10.e, '"e" (Exponent) Parameter'), nt(r10.n, '"n" (Modulus) Parameter'), n10 = { e: r10.e, kty: r10.kty, n: r10.n };
            break;
          case "oct":
            nt(r10.k, '"k" (Key Value) Parameter'), n10 = { k: r10.k, kty: r10.kty };
            break;
          default:
            throw new t4('"kty" (Key Type) Parameter missing or unsupported');
        }
        let i10 = tZ(JSON.stringify(n10));
        return t1(await rE(t10, i10));
      }
      async function nn(e10, t10, r10) {
        let n10;
        if (!rU(e10)) throw TypeError("JWK must be an object");
        switch (t10 ??= e10.alg, n10 ??= r10?.extractable ?? e10.ext, e10.kty) {
          case "oct":
            if ("string" != typeof e10.k || !e10.k) throw TypeError('missing "k" (Key Value) Parameter value');
            return t0(e10.k);
          case "RSA":
            if ("oth" in e10 && void 0 !== e10.oth) throw new t4('RSA JWK "oth" (Other Primes Info) Parameter value is not supported');
            return rj({ ...e10, alg: t10, ext: n10 });
          case "AKP":
            if ("string" != typeof e10.alg || !e10.alg) throw TypeError('missing "alg" (Algorithm) Parameter value');
            if (void 0 !== t10 && t10 !== e10.alg) throw TypeError("JWK alg and alg option value mismatch");
            return rj({ ...e10, ext: n10 });
          case "EC":
          case "OKP":
            return rj({ ...e10, alg: t10, ext: n10 });
          default:
            throw new t4('Unsupported "kty" (Key Type) Parameter value');
        }
      }
      async function ni(e10, t10, r10, n10, i10) {
        switch (e10) {
          case "dir":
            if (void 0 !== r10) throw new t7("Encountered unexpected JWE Encrypted Key");
            return t10;
          case "ECDH-ES":
            if (void 0 !== r10) throw new t7("Encountered unexpected JWE Encrypted Key");
          case "ECDH-ES+A128KW":
          case "ECDH-ES+A192KW":
          case "ECDH-ES+A256KW": {
            let i11, a10;
            if (!rU(n10.epk)) throw new t7('JOSE Header "epk" (Ephemeral Public Key) missing or invalid');
            if (rd(t10), !rA(t10)) throw new t4("ECDH with the provided key is not allowed or not supported by your javascript runtime");
            let o10 = await nn(n10.epk, e10);
            if (rd(o10), void 0 !== n10.apu) {
              if ("string" != typeof n10.apu) throw new t7('JOSE Header "apu" (Agreement PartyUInfo) invalid');
              try {
                i11 = t0(n10.apu);
              } catch {
                throw new t7("Failed to base64url decode the apu");
              }
            }
            if (void 0 !== n10.apv) {
              if ("string" != typeof n10.apv) throw new t7('JOSE Header "apv" (Agreement PartyVInfo) invalid');
              try {
                a10 = t0(n10.apv);
              } catch {
                throw new t7("Failed to base64url decode the apv");
              }
            }
            let s2 = await rx(o10, t10, "ECDH-ES" === e10 ? n10.enc : e10, "ECDH-ES" === e10 ? rM(n10.enc) : parseInt(e10.slice(-5, -2), 10), i11, a10);
            if ("ECDH-ES" === e10) return s2;
            if (void 0 === r10) throw new t7("JWE Encrypted Key missing");
            return r_(e10.slice(-6), s2, r10);
          }
          case "RSA-OAEP":
          case "RSA-OAEP-256":
          case "RSA-OAEP-384":
          case "RSA-OAEP-512":
            if (void 0 === r10) throw new t7("JWE Encrypted Key missing");
            return rd(t10), rN(e10, t10, r10);
          case "PBES2-HS256+A128KW":
          case "PBES2-HS384+A192KW":
          case "PBES2-HS512+A256KW": {
            let a10;
            if (void 0 === r10) throw new t7("JWE Encrypted Key missing");
            if ("number" != typeof n10.p2c) throw new t7('JOSE Header "p2c" (PBES2 Count) missing or invalid');
            let o10 = i10?.maxPBES2Count || 1e4;
            if (n10.p2c > o10) throw new t7('JOSE Header "p2c" (PBES2 Count) out is of acceptable bounds');
            if ("string" != typeof n10.p2s) throw new t7('JOSE Header "p2s" (PBES2 Salt) missing or invalid');
            try {
              a10 = t0(n10.p2s);
            } catch {
              throw new t7("Failed to base64url decode the p2s");
            }
            return rC(e10, t10, r10, n10.p2c, a10);
          }
          case "A128KW":
          case "A192KW":
          case "A256KW":
            if (void 0 === r10) throw new t7("JWE Encrypted Key missing");
            return r_(e10, t10, r10);
          case "A128GCMKW":
          case "A192GCMKW":
          case "A256GCMKW": {
            let i11, a10;
            if (void 0 === r10) throw new t7("JWE Encrypted Key missing");
            if ("string" != typeof n10.iv) throw new t7('JOSE Header "iv" (Initialization Vector) missing or invalid');
            if ("string" != typeof n10.tag) throw new t7('JOSE Header "tag" (Authentication Tag) missing or invalid');
            try {
              i11 = t0(n10.iv);
            } catch {
              throw new t7("Failed to base64url decode the iv");
            }
            try {
              a10 = t0(n10.tag);
            } catch {
              throw new t7("Failed to base64url decode the tag");
            }
            return rF(e10, t10, r10, i11, a10);
          }
          default:
            throw new t4('Invalid or unsupported "alg" (JWE Algorithm) header value');
        }
      }
      function na(e10, t10) {
        if (void 0 !== t10 && (!Array.isArray(t10) || t10.some((e11) => "string" != typeof e11))) throw TypeError(`"${e10}" option must be an array of strings`);
        if (t10) return new Set(t10);
      }
      async function no(e10, t10, r10) {
        let n10, i10, a10, o10, s2, c2, l2;
        if (!rU(e10)) throw new t7("Flattened JWE must be an object");
        if (void 0 === e10.protected && void 0 === e10.header && void 0 === e10.unprotected) throw new t7("JOSE Header missing");
        if (void 0 !== e10.iv && "string" != typeof e10.iv) throw new t7("JWE Initialization Vector incorrect type");
        if ("string" != typeof e10.ciphertext) throw new t7("JWE Ciphertext missing or incorrect type");
        if (void 0 !== e10.tag && "string" != typeof e10.tag) throw new t7("JWE Authentication Tag incorrect type");
        if (void 0 !== e10.protected && "string" != typeof e10.protected) throw new t7("JWE Protected Header incorrect type");
        if (void 0 !== e10.encrypted_key && "string" != typeof e10.encrypted_key) throw new t7("JWE Encrypted Key incorrect type");
        if (void 0 !== e10.aad && "string" != typeof e10.aad) throw new t7("JWE AAD incorrect type");
        if (void 0 !== e10.header && !rU(e10.header)) throw new t7("JWE Shared Unprotected Header incorrect type");
        if (void 0 !== e10.unprotected && !rU(e10.unprotected)) throw new t7("JWE Per-Recipient Unprotected Header incorrect type");
        if (e10.protected) try {
          let t11 = t0(e10.protected);
          n10 = JSON.parse(tF.decode(t11));
        } catch {
          throw new t7("JWE Protected Header is invalid");
        }
        if (!rX(n10, e10.header, e10.unprotected)) throw new t7("JWE Protected, JWE Unprotected Header, and JWE Per-Recipient Unprotected Header Parameter names must be disjoint");
        let u2 = { ...n10, ...e10.header, ...e10.unprotected };
        if (rY(t7, /* @__PURE__ */ new Map(), r10?.crit, n10, u2), void 0 !== u2.zip) throw new t4('JWE "zip" (Compression Algorithm) Header Parameter is not supported.');
        let { alg: d2, enc: p2 } = u2;
        if ("string" != typeof d2 || !d2) throw new t7("missing JWE Algorithm (alg) in JWE Header");
        if ("string" != typeof p2 || !p2) throw new t7("missing JWE Encryption Algorithm (enc) in JWE Header");
        let h2 = r10 && na("keyManagementAlgorithms", r10.keyManagementAlgorithms), f2 = r10 && na("contentEncryptionAlgorithms", r10.contentEncryptionAlgorithms);
        if (h2 && !h2.has(d2) || !h2 && d2.startsWith("PBES2")) throw new t6('"alg" (Algorithm) Header Parameter value not allowed');
        if (f2 && !f2.has(p2)) throw new t6('"enc" (Encryption Algorithm) Header Parameter value not allowed');
        if (void 0 !== e10.encrypted_key) try {
          i10 = t0(e10.encrypted_key);
        } catch {
          throw new t7("Failed to base64url decode the encrypted_key");
        }
        let g2 = false;
        "function" == typeof t10 && (t10 = await t10(n10, e10), g2 = true), r0("dir" === d2 ? p2 : d2, t10, "decrypt");
        let m2 = await rL(t10, d2);
        try {
          a10 = await ni(d2, m2, i10, u2, r10);
        } catch (e11) {
          if (e11 instanceof TypeError || e11 instanceof t7 || e11 instanceof t4) throw e11;
          a10 = rH(p2);
        }
        if (void 0 !== e10.iv) try {
          o10 = t0(e10.iv);
        } catch {
          throw new t7("Failed to base64url decode the iv");
        }
        if (void 0 !== e10.tag) try {
          s2 = t0(e10.tag);
        } catch {
          throw new t7("Failed to base64url decode the tag");
        }
        let y2 = void 0 !== e10.protected ? tZ(e10.protected) : new Uint8Array();
        c2 = void 0 !== e10.aad ? tG(y2, tZ("."), tZ(e10.aad)) : y2;
        try {
          l2 = t0(e10.ciphertext);
        } catch {
          throw new t7("Failed to base64url decode the ciphertext");
        }
        let b2 = { plaintext: await rV(p2, a10, l2, o10, s2, c2) };
        if (void 0 !== e10.protected && (b2.protectedHeader = n10), void 0 !== e10.aad) try {
          b2.additionalAuthenticatedData = t0(e10.aad);
        } catch {
          throw new t7("Failed to base64url decode the aad");
        }
        return (void 0 !== e10.unprotected && (b2.sharedUnprotectedHeader = e10.unprotected), void 0 !== e10.header && (b2.unprotectedHeader = e10.header), g2) ? { ...b2, key: m2 } : b2;
      }
      async function ns(e10, t10, r10) {
        if (e10 instanceof Uint8Array && (e10 = tF.decode(e10)), "string" != typeof e10) throw new t7("Compact JWE must be a string or Uint8Array");
        let { 0: n10, 1: i10, 2: a10, 3: o10, 4: s2, length: c2 } = e10.split(".");
        if (5 !== c2) throw new t7("Invalid Compact JWE");
        let l2 = await no({ ciphertext: o10, iv: a10 || void 0, protected: n10, tag: s2 || void 0, encrypted_key: i10 || void 0 }, t10, r10), u2 = { plaintext: l2.plaintext, protectedHeader: l2.protectedHeader };
        return "function" == typeof t10 ? { ...u2, key: l2.key } : u2;
      }
      async function nc(e10, t10, r10) {
        let n10 = await ns(e10, t10, r10), i10 = function(e11, t11, r11 = {}) {
          var n11, i11;
          let a11, o11;
          try {
            a11 = JSON.parse(tF.decode(t11));
          } catch {
          }
          if (!rU(a11)) throw new re("JWT Claims Set must be a top-level JSON object");
          let { typ: s2 } = r11;
          if (s2 && ("string" != typeof e11.typ || r4(e11.typ) !== r4(s2))) throw new t3('unexpected "typ" JWT header value', a11, "typ", "check_failed");
          let { requiredClaims: c2 = [], issuer: l2, subject: u2, audience: d2, maxTokenAge: p2 } = r11, h2 = [...c2];
          for (let e12 of (void 0 !== p2 && h2.push("iat"), void 0 !== d2 && h2.push("aud"), void 0 !== u2 && h2.push("sub"), void 0 !== l2 && h2.push("iss"), new Set(h2.reverse()))) if (!(e12 in a11)) throw new t3(`missing required "${e12}" claim`, a11, e12, "missing");
          if (l2 && !(Array.isArray(l2) ? l2 : [l2]).includes(a11.iss)) throw new t3('unexpected "iss" claim value', a11, "iss", "check_failed");
          if (u2 && a11.sub !== u2) throw new t3('unexpected "sub" claim value', a11, "sub", "check_failed");
          if (d2 && (n11 = a11.aud, i11 = "string" == typeof d2 ? [d2] : d2, "string" == typeof n11 ? !i11.includes(n11) : !(Array.isArray(n11) && i11.some(Set.prototype.has.bind(new Set(n11)))))) throw new t3('unexpected "aud" claim value', a11, "aud", "check_failed");
          switch (typeof r11.clockTolerance) {
            case "string":
              o11 = r8(r11.clockTolerance);
              break;
            case "number":
              o11 = r11.clockTolerance;
              break;
            case "undefined":
              o11 = 0;
              break;
            default:
              throw TypeError("Invalid clockTolerance option type");
          }
          let { currentDate: f2 } = r11, g2 = r5(f2 || /* @__PURE__ */ new Date());
          if ((void 0 !== a11.iat || p2) && "number" != typeof a11.iat) throw new t3('"iat" claim must be a number', a11, "iat", "invalid");
          if (void 0 !== a11.nbf) {
            if ("number" != typeof a11.nbf) throw new t3('"nbf" claim must be a number', a11, "nbf", "invalid");
            if (a11.nbf > g2 + o11) throw new t3('"nbf" claim timestamp check failed', a11, "nbf", "check_failed");
          }
          if (void 0 !== a11.exp) {
            if ("number" != typeof a11.exp) throw new t3('"exp" claim must be a number', a11, "exp", "invalid");
            if (a11.exp <= g2 - o11) throw new t8('"exp" claim timestamp check failed', a11, "exp", "check_failed");
          }
          if (p2) {
            let e12 = g2 - a11.iat;
            if (e12 - o11 > ("number" == typeof p2 ? p2 : r8(p2))) throw new t8('"iat" claim timestamp check failed (too far in the past)', a11, "iat", "check_failed");
            if (e12 < 0 - o11) throw new t3('"iat" claim timestamp check failed (it should be in the past)', a11, "iat", "check_failed");
          }
          return a11;
        }(n10.protectedHeader, n10.plaintext, r10), { protectedHeader: a10 } = n10;
        if (void 0 !== a10.iss && a10.iss !== i10.iss) throw new t3('replicated "iss" claim header parameter mismatch', i10, "iss", "mismatch");
        if (void 0 !== a10.sub && a10.sub !== i10.sub) throw new t3('replicated "sub" claim header parameter mismatch', i10, "sub", "mismatch");
        if (void 0 !== a10.aud && JSON.stringify(a10.aud) !== JSON.stringify(i10.aud)) throw new t3('replicated "aud" claim header parameter mismatch', i10, "aud", "mismatch");
        let o10 = { payload: i10, protectedHeader: a10 };
        return "function" == typeof t10 ? { ...o10, key: n10.key } : o10;
      }
      let nl = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/, nu = /^("?)[\u0021\u0023-\u002B\u002D-\u003A\u003C-\u005B\u005D-\u007E]*\1$/, nd = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i, np = /^[\u0020-\u003A\u003D-\u007E]*$/, nh = Object.prototype.toString, nf = ((s = function() {
      }).prototype = /* @__PURE__ */ Object.create(null), s);
      function ng(e10, t10) {
        let r10 = new nf(), n10 = e10.length;
        if (n10 < 2) return r10;
        let i10 = t10?.decode || nw, a10 = 0;
        do {
          let t11 = e10.indexOf("=", a10);
          if (-1 === t11) break;
          let o10 = e10.indexOf(";", a10), s2 = -1 === o10 ? n10 : o10;
          if (t11 > s2) {
            a10 = e10.lastIndexOf(";", t11 - 1) + 1;
            continue;
          }
          let c2 = nm(e10, a10, t11), l2 = ny(e10, t11, c2), u2 = e10.slice(c2, l2);
          if (void 0 === r10[u2]) {
            let n11 = nm(e10, t11 + 1, s2), a11 = ny(e10, s2, n11), o11 = i10(e10.slice(n11, a11));
            r10[u2] = o11;
          }
          a10 = s2 + 1;
        } while (a10 < n10);
        return r10;
      }
      function nm(e10, t10, r10) {
        do {
          let r11 = e10.charCodeAt(t10);
          if (32 !== r11 && 9 !== r11) return t10;
        } while (++t10 < r10);
        return r10;
      }
      function ny(e10, t10, r10) {
        for (; t10 > r10; ) {
          let r11 = e10.charCodeAt(--t10);
          if (32 !== r11 && 9 !== r11) return t10 + 1;
        }
        return r10;
      }
      function nb(e10, t10, r10) {
        let n10 = r10?.encode || encodeURIComponent;
        if (!nl.test(e10)) throw TypeError(`argument name is invalid: ${e10}`);
        let i10 = n10(t10);
        if (!nu.test(i10)) throw TypeError(`argument val is invalid: ${t10}`);
        let a10 = e10 + "=" + i10;
        if (!r10) return a10;
        if (void 0 !== r10.maxAge) {
          if (!Number.isInteger(r10.maxAge)) throw TypeError(`option maxAge is invalid: ${r10.maxAge}`);
          a10 += "; Max-Age=" + r10.maxAge;
        }
        if (r10.domain) {
          if (!nd.test(r10.domain)) throw TypeError(`option domain is invalid: ${r10.domain}`);
          a10 += "; Domain=" + r10.domain;
        }
        if (r10.path) {
          if (!np.test(r10.path)) throw TypeError(`option path is invalid: ${r10.path}`);
          a10 += "; Path=" + r10.path;
        }
        if (r10.expires) {
          var o10;
          if (o10 = r10.expires, "[object Date]" !== nh.call(o10) || !Number.isFinite(r10.expires.valueOf())) throw TypeError(`option expires is invalid: ${r10.expires}`);
          a10 += "; Expires=" + r10.expires.toUTCString();
        }
        if (r10.httpOnly && (a10 += "; HttpOnly"), r10.secure && (a10 += "; Secure"), r10.partitioned && (a10 += "; Partitioned"), r10.priority) switch ("string" == typeof r10.priority ? r10.priority.toLowerCase() : void 0) {
          case "low":
            a10 += "; Priority=Low";
            break;
          case "medium":
            a10 += "; Priority=Medium";
            break;
          case "high":
            a10 += "; Priority=High";
            break;
          default:
            throw TypeError(`option priority is invalid: ${r10.priority}`);
        }
        if (r10.sameSite) switch ("string" == typeof r10.sameSite ? r10.sameSite.toLowerCase() : r10.sameSite) {
          case true:
          case "strict":
            a10 += "; SameSite=Strict";
            break;
          case "lax":
            a10 += "; SameSite=Lax";
            break;
          case "none":
            a10 += "; SameSite=None";
            break;
          default:
            throw TypeError(`option sameSite is invalid: ${r10.sameSite}`);
        }
        return a10;
      }
      function nw(e10) {
        if (-1 === e10.indexOf("%")) return e10;
        try {
          return decodeURIComponent(e10);
        } catch (t10) {
          return e10;
        }
      }
      e.s(["parse", () => ng, "serialize", () => nb], 87501);
      var nv = e.i(87501);
      let { parse: n_ } = nv, nE = "A256CBC-HS512";
      async function nS(e10) {
        let { token: t10 = {}, secret: r10, maxAge: n10 = 2592e3, salt: i10 } = e10, a10 = Array.isArray(r10) ? r10 : [r10], o10 = await nx(nE, a10[0], i10), s2 = await nr({ kty: "oct", k: ne.encode(o10) }, `sha${o10.byteLength << 3}`);
        return await new r7(t10).setProtectedHeader({ alg: "dir", enc: nE, kid: s2 }).setIssuedAt().setExpirationTime((Date.now() / 1e3 | 0) + n10).setJti(crypto.randomUUID()).encrypt(o10);
      }
      async function nk(e10) {
        let { token: t10, secret: r10, salt: n10 } = e10, i10 = Array.isArray(r10) ? r10 : [r10];
        if (!t10) return null;
        let { payload: a10 } = await nc(t10, async ({ kid: e11, enc: t11 }) => {
          for (let r11 of i10) {
            let i11 = await nx(t11, r11, n10);
            if (void 0 === e11 || e11 === await nr({ kty: "oct", k: ne.encode(i11) }, `sha${i11.byteLength << 3}`)) return i11;
          }
          throw Error("no matching decryption secret");
        }, { clockTolerance: 15, keyManagementAlgorithms: ["dir"], contentEncryptionAlgorithms: [nE, "A256GCM"] });
        return a10;
      }
      async function nx(e10, t10, r10) {
        let n10;
        switch (e10) {
          case "A256CBC-HS512":
            n10 = 64;
            break;
          case "A256GCM":
            n10 = 32;
            break;
          default:
            throw Error("Unsupported JWT Content Encryption Algorithm");
        }
        return await tV("sha256", t10, r10, `Auth.js Generated Encryption Key (${r10})`, n10);
      }
      async function nA({ options: e10, paramValue: t10, cookieValue: r10 }) {
        let { url: n10, callbacks: i10 } = e10, a10 = n10.origin;
        return t10 ? a10 = await i10.redirect({ url: t10, baseUrl: n10.origin }) : r10 && (a10 = await i10.redirect({ url: r10, baseUrl: n10.origin })), { callbackUrl: a10, callbackUrlCookie: a10 !== r10 ? a10 : void 0 };
      }
      let nT = "\x1B[31m", nR = "\x1B[0m", nC = { error(e10) {
        let t10 = e10 instanceof tn ? e10.type : e10.name;
        if (console.error(`${nT}[auth][error]${nR} ${t10}: ${e10.message}`), e10.cause && "object" == typeof e10.cause && "err" in e10.cause && e10.cause.err instanceof Error) {
          let { err: t11, ...r10 } = e10.cause;
          console.error(`${nT}[auth][cause]${nR}:`, t11.stack), r10 && console.error(`${nT}[auth][details]${nR}:`, JSON.stringify(r10, null, 2));
        } else e10.stack && console.error(e10.stack.replace(/.*/, "").substring(1));
      }, warn(e10) {
        console.warn(`\x1B[33m[auth][warn][${e10}]${nR}`, "Read more: https://warnings.authjs.dev");
      }, debug(e10, t10) {
        console.log(`\x1B[90m[auth][debug]:${nR} ${e10}`, JSON.stringify(t10, null, 2));
      } };
      function nP(e10) {
        let t10 = { ...nC };
        return e10.debug || (t10.debug = () => {
        }), e10.logger?.error && (t10.error = e10.logger.error), e10.logger?.warn && (t10.warn = e10.logger.warn), e10.logger?.debug && (t10.debug = e10.logger.debug), e10.logger ?? (e10.logger = t10), t10;
      }
      let nO = ["providers", "session", "csrf", "signin", "signout", "callback", "verify-request", "error", "webauthn-options"], { parse: nI, serialize: nN } = nv;
      async function nU(e10) {
        if (!("body" in e10) || !e10.body || "POST" !== e10.method) return;
        let t10 = e10.headers.get("content-type");
        return t10?.includes("application/json") ? await e10.json() : t10?.includes("application/x-www-form-urlencoded") ? Object.fromEntries(new URLSearchParams(await e10.text())) : void 0;
      }
      async function nD(e10, t10) {
        try {
          if ("GET" !== e10.method && "POST" !== e10.method) throw new tk("Only GET and POST requests are supported");
          t10.basePath ?? (t10.basePath = "/auth");
          let r10 = new URL(e10.url), { action: n10, providerId: i10 } = function(e11, t11) {
            let r11 = e11.match(RegExp(`^${t11}(.+)`));
            if (null === r11) throw new tk(`Cannot parse action at ${e11}`);
            let n11 = r11.at(-1).replace(/^\//, "").split("/").filter(Boolean);
            if (1 !== n11.length && 2 !== n11.length) throw new tk(`Cannot parse action at ${e11}`);
            let [i11, a10] = n11;
            if (!nO.includes(i11) || a10 && !["signin", "callback", "webauthn-options"].includes(i11)) throw new tk(`Cannot parse action at ${e11}`);
            return { action: i11, providerId: "undefined" == a10 ? void 0 : a10 };
          }(r10.pathname, t10.basePath);
          return { url: r10, action: n10, providerId: i10, method: e10.method, headers: Object.fromEntries(e10.headers), body: e10.body ? await nU(e10) : void 0, cookies: nI(e10.headers.get("cookie") ?? "") ?? {}, error: r10.searchParams.get("error") ?? void 0, query: Object.fromEntries(r10.searchParams) };
        } catch (n10) {
          let r10 = nP(t10);
          r10.error(n10), r10.debug("request", e10);
        }
      }
      function nj(e10) {
        let t10 = new Headers(e10.headers);
        e10.cookies?.forEach((e11) => {
          let { name: r11, value: n11, options: i10 } = e11, a10 = nN(r11, n11, i10);
          t10.has("Set-Cookie") ? t10.append("Set-Cookie", a10) : t10.set("Set-Cookie", a10);
        });
        let r10 = e10.body;
        "application/json" === t10.get("content-type") ? r10 = JSON.stringify(e10.body) : "application/x-www-form-urlencoded" === t10.get("content-type") && (r10 = new URLSearchParams(e10.body).toString());
        let n10 = new Response(r10, { headers: t10, status: e10.redirect ? 302 : e10.status ?? 200 });
        return e10.redirect && n10.headers.set("Location", e10.redirect), n10;
      }
      async function n$(e10) {
        let t10 = new TextEncoder().encode(e10);
        return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", t10))).map((e11) => e11.toString(16).padStart(2, "0")).join("").toString();
      }
      function nL(e10) {
        return Array.from(crypto.getRandomValues(new Uint8Array(e10))).reduce((e11, t10) => e11 + ("0" + t10.toString(16)).slice(-2), "");
      }
      async function nM({ options: e10, cookieValue: t10, isPost: r10, bodyValue: n10 }) {
        if (t10) {
          let [i11, a11] = t10.split("|");
          if (a11 === await n$(`${i11}${e10.secret}`)) return { csrfTokenVerified: r10 && i11 === n10, csrfToken: i11 };
        }
        let i10 = nL(32), a10 = await n$(`${i10}${e10.secret}`);
        return { cookie: `${i10}|${a10}`, csrfToken: i10 };
      }
      function nH(e10, t10) {
        if (!t10) throw new tC(`CSRF token was missing during an action ${e10}`);
      }
      function nW(e10) {
        return null !== e10 && "object" == typeof e10;
      }
      function nK(e10, ...t10) {
        if (!t10.length) return e10;
        let r10 = t10.shift();
        if (nW(e10) && nW(r10)) for (let t11 in r10) nW(r10[t11]) ? (nW(e10[t11]) || (e10[t11] = Array.isArray(r10[t11]) ? [] : {}), nK(e10[t11], r10[t11])) : void 0 !== r10[t11] && (e10[t11] = r10[t11]);
        return nK(e10, ...t10);
      }
      let nB = Symbol("skip-csrf-check"), nq = Symbol("return-type-raw"), nJ = Symbol("custom-fetch"), nV = Symbol("conform-internal"), nz = (e10) => nG({ id: e10.sub ?? e10.id ?? crypto.randomUUID(), name: e10.name ?? e10.nickname ?? e10.preferred_username, email: e10.email, image: e10.picture }), nF = (e10) => nG({ access_token: e10.access_token, id_token: e10.id_token, refresh_token: e10.refresh_token, expires_at: e10.expires_at, scope: e10.scope, token_type: e10.token_type, session_state: e10.session_state });
      function nG(e10) {
        let t10 = {};
        for (let [r10, n10] of Object.entries(e10)) void 0 !== n10 && (t10[r10] = n10);
        return t10;
      }
      function nX(e10, t10) {
        if (!e10 && t10) return;
        if ("string" == typeof e10) return { url: new URL(e10) };
        let r10 = new URL(e10?.url ?? "https://authjs.dev");
        if (e10?.params != null) for (let [t11, n10] of Object.entries(e10.params)) "claims" === t11 && (n10 = JSON.stringify(n10)), r10.searchParams.set(t11, String(n10));
        return { url: r10, request: e10?.request, conform: e10?.conform, ...e10?.clientPrivateKey ? { clientPrivateKey: e10?.clientPrivateKey } : null };
      }
      let nY = { signIn: () => true, redirect: ({ url: e10, baseUrl: t10 }) => e10.startsWith("/") ? `${t10}${e10}` : new URL(e10).origin === t10 ? e10 : t10, session: ({ session: e10 }) => ({ user: { name: e10.user?.name, email: e10.user?.email, image: e10.user?.image }, expires: e10.expires?.toISOString?.() ?? e10.expires }), jwt: ({ token: e10 }) => e10 };
      async function nQ({ authOptions: e10, providerId: t10, action: r10, url: n10, cookies: i10, callbackUrl: a10, csrfToken: o10, csrfDisabled: s2, isPost: c2 }) {
        var l2, u2;
        let d2 = nP(e10), { providers: p2, provider: h2 } = function(e11) {
          let { providerId: t11, config: r11 } = e11, n11 = new URL(r11.basePath ?? "/auth", e11.url.origin), i11 = r11.providers.map((e12) => {
            let t12 = "function" == typeof e12 ? e12() : e12, { options: i12, ...a12 } = t12, o11 = i12?.id ?? a12.id, s3 = nK(a12, i12, { signinUrl: `${n11}/signin/${o11}`, callbackUrl: `${n11}/callback/${o11}` });
            if ("oauth" === t12.type || "oidc" === t12.type) {
              var c3;
              let e13, t13, n12, a13;
              s3.redirectProxyUrl ?? (s3.redirectProxyUrl = i12?.redirectProxyUrl ?? r11.redirectProxyUrl);
              let o12 = ((c3 = s3).issuer && (c3.wellKnown ?? (c3.wellKnown = `${c3.issuer}/.well-known/openid-configuration`)), (e13 = nX(c3.authorization, c3.issuer)) && !e13.url?.searchParams.has("scope") && e13.url.searchParams.set("scope", "openid profile email"), t13 = nX(c3.token, c3.issuer), n12 = nX(c3.userinfo, c3.issuer), a13 = c3.checks ?? ["pkce"], c3.redirectProxyUrl && (a13.includes("state") || a13.push("state"), c3.redirectProxyUrl = `${c3.redirectProxyUrl}/callback/${c3.id}`), { ...c3, authorization: e13, token: t13, checks: a13, userinfo: n12, profile: c3.profile ?? nz, account: c3.account ?? nF });
              return o12.authorization?.url.searchParams.get("response_mode") === "form_post" && delete o12.redirectProxyUrl, o12[nJ] ?? (o12[nJ] = i12?.[nJ]), o12;
            }
            return s3;
          }), a11 = i11.find(({ id: e12 }) => e12 === t11);
          if (t11 && !a11) {
            let e12 = i11.map((e13) => e13.id).join(", ");
            throw Error(`Provider with id "${t11}" not found. Available providers: [${e12}].`);
          }
          return { providers: i11, provider: a11 };
        }({ url: n10, providerId: t10, config: e10 }), f2 = false;
        if ((h2?.type === "oauth" || h2?.type === "oidc") && h2.redirectProxyUrl) try {
          f2 = new URL(h2.redirectProxyUrl).origin === n10.origin;
        } catch {
          throw TypeError(`redirectProxyUrl must be a valid URL. Received: ${h2.redirectProxyUrl}`);
        }
        let g2 = { debug: false, pages: {}, theme: { colorScheme: "auto", logo: "", brandColor: "", buttonText: "" }, ...e10, url: n10, action: r10, provider: h2, cookies: nK(tt(e10.useSecureCookies ?? "https:" === n10.protocol), e10.cookies), providers: p2, session: { strategy: e10.adapter ? "database" : "jwt", maxAge: 2592e3, updateAge: 86400, generateSessionToken: () => crypto.randomUUID(), ...e10.session }, jwt: { secret: e10.secret, maxAge: e10.session?.maxAge ?? 2592e3, encode: nS, decode: nk, ...e10.jwt }, events: (l2 = e10.events ?? {}, u2 = d2, Object.keys(l2).reduce((e11, t11) => (e11[t11] = async (...e12) => {
          try {
            let r11 = l2[t11];
            return await r11(...e12);
          } catch (e13) {
            u2.error(new tl(e13));
          }
        }, e11), {})), adapter: function(e11, t11) {
          if (e11) return Object.keys(e11).reduce((r11, n11) => (r11[n11] = async (...r12) => {
            try {
              t11.debug(`adapter_${n11}`, { args: r12 });
              let i11 = e11[n11];
              return await i11(...r12);
            } catch (r13) {
              let e12 = new ta(r13);
              throw t11.error(e12), e12;
            }
          }, r11), {});
        }(e10.adapter, d2), callbacks: { ...nY, ...e10.callbacks }, logger: d2, callbackUrl: n10.origin, isOnRedirectProxy: f2, experimental: { ...e10.experimental } }, m2 = [];
        if (s2) g2.csrfTokenVerified = true;
        else {
          let { csrfToken: e11, cookie: t11, csrfTokenVerified: r11 } = await nM({ options: g2, cookieValue: i10?.[g2.cookies.csrfToken.name], isPost: c2, bodyValue: o10 });
          g2.csrfToken = e11, g2.csrfTokenVerified = r11, t11 && m2.push({ name: g2.cookies.csrfToken.name, value: t11, options: g2.cookies.csrfToken.options });
        }
        let { callbackUrl: y2, callbackUrlCookie: b2 } = await nA({ options: g2, cookieValue: i10?.[g2.cookies.callbackUrl.name], paramValue: a10 });
        return g2.callbackUrl = y2, b2 && m2.push({ name: g2.cookies.callbackUrl.name, value: b2, options: g2.cookies.callbackUrl.options }), { options: g2, cookies: m2 };
      }
      var nZ, n0, n1, n2, n5, n3, n8, n6, n4, n9, n7, ie, it, ir, ii, ia, io, is, ic, il, iu, id, ip, ih, ig, im, iy, ib, iw = {}, iv = [], i_ = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, iE = Array.isArray;
      function iS(e10, t10) {
        for (var r10 in t10) e10[r10] = t10[r10];
        return e10;
      }
      function ik(e10) {
        e10 && e10.parentNode && e10.parentNode.removeChild(e10);
      }
      function ix(e10, t10, r10, n10, i10) {
        var a10 = { type: e10, props: t10, key: r10, ref: n10, __k: null, __: null, __b: 0, __e: null, __d: void 0, __c: null, constructor: void 0, __v: null == i10 ? ++iu : i10, __i: -1, __u: 0 };
        return null == i10 && null != il.vnode && il.vnode(a10), a10;
      }
      function iA(e10) {
        return e10.children;
      }
      function iT(e10, t10) {
        this.props = e10, this.context = t10;
      }
      function iR(e10, t10) {
        if (null == t10) return e10.__ ? iR(e10.__, e10.__i + 1) : null;
        for (var r10; t10 < e10.__k.length; t10++) if (null != (r10 = e10.__k[t10]) && null != r10.__e) return r10.__e;
        return "function" == typeof e10.type ? iR(e10) : null;
      }
      function iC(e10) {
        (!e10.__d && (e10.__d = true) && id.push(e10) && !iP.__r++ || ip !== il.debounceRendering) && ((ip = il.debounceRendering) || ih)(iP);
      }
      function iP() {
        var e10, t10, r10, n10, i10, a10, o10, s2;
        for (id.sort(ig); e10 = id.shift(); ) e10.__d && (t10 = id.length, n10 = void 0, a10 = (i10 = (r10 = e10).__v).__e, o10 = [], s2 = [], r10.__P && ((n10 = iS({}, i10)).__v = i10.__v + 1, il.vnode && il.vnode(n10), iD(r10.__P, n10, i10, r10.__n, r10.__P.namespaceURI, 32 & i10.__u ? [a10] : null, o10, null == a10 ? iR(i10) : a10, !!(32 & i10.__u), s2), n10.__v = i10.__v, n10.__.__k[n10.__i] = n10, function(e11, t11, r11) {
          t11.__d = void 0;
          for (var n11 = 0; n11 < r11.length; n11++) ij(r11[n11], r11[++n11], r11[++n11]);
          il.__c && il.__c(t11, e11), e11.some(function(t12) {
            try {
              e11 = t12.__h, t12.__h = [], e11.some(function(e12) {
                e12.call(t12);
              });
            } catch (e12) {
              il.__e(e12, t12.__v);
            }
          });
        }(o10, n10, s2), n10.__e != a10 && function e11(t11) {
          var r11, n11;
          if (null != (t11 = t11.__) && null != t11.__c) {
            for (t11.__e = t11.__c.base = null, r11 = 0; r11 < t11.__k.length; r11++) if (null != (n11 = t11.__k[r11]) && null != n11.__e) {
              t11.__e = t11.__c.base = n11.__e;
              break;
            }
            return e11(t11);
          }
        }(n10)), id.length > t10 && id.sort(ig));
        iP.__r = 0;
      }
      function iO(e10, t10, r10, n10, i10, a10, o10, s2, c2, l2, u2) {
        var d2, p2, h2, f2, g2, m2 = n10 && n10.__k || iv, y2 = t10.length;
        for (r10.__d = c2, function(e11, t11, r11) {
          var n11, i11, a11, o11, s3, c3 = t11.length, l3 = r11.length, u3 = l3, d3 = 0;
          for (e11.__k = [], n11 = 0; n11 < c3; n11++) null != (i11 = t11[n11]) && "boolean" != typeof i11 && "function" != typeof i11 ? (o11 = n11 + d3, (i11 = e11.__k[n11] = "string" == typeof i11 || "number" == typeof i11 || "bigint" == typeof i11 || i11.constructor == String ? ix(null, i11, null, null, null) : iE(i11) ? ix(iA, { children: i11 }, null, null, null) : void 0 === i11.constructor && i11.__b > 0 ? ix(i11.type, i11.props, i11.key, i11.ref ? i11.ref : null, i11.__v) : i11).__ = e11, i11.__b = e11.__b + 1, a11 = null, -1 !== (s3 = i11.__i = function(e12, t12, r12, n12) {
            var i12 = e12.key, a12 = e12.type, o12 = r12 - 1, s4 = r12 + 1, c4 = t12[r12];
            if (null === c4 || c4 && i12 == c4.key && a12 === c4.type && 0 == (131072 & c4.__u)) return r12;
            if (n12 > +(null != c4 && 0 == (131072 & c4.__u))) for (; o12 >= 0 || s4 < t12.length; ) {
              if (o12 >= 0) {
                if ((c4 = t12[o12]) && 0 == (131072 & c4.__u) && i12 == c4.key && a12 === c4.type) return o12;
                o12--;
              }
              if (s4 < t12.length) {
                if ((c4 = t12[s4]) && 0 == (131072 & c4.__u) && i12 == c4.key && a12 === c4.type) return s4;
                s4++;
              }
            }
            return -1;
          }(i11, r11, o11, u3)) && (u3--, (a11 = r11[s3]) && (a11.__u |= 131072)), null == a11 || null === a11.__v ? (-1 == s3 && d3--, "function" != typeof i11.type && (i11.__u |= 65536)) : s3 !== o11 && (s3 == o11 - 1 ? d3-- : s3 == o11 + 1 ? d3++ : (s3 > o11 ? d3-- : d3++, i11.__u |= 65536))) : i11 = e11.__k[n11] = null;
          if (u3) for (n11 = 0; n11 < l3; n11++) null != (a11 = r11[n11]) && 0 == (131072 & a11.__u) && (a11.__e == e11.__d && (e11.__d = iR(a11)), function e12(t12, r12, n12) {
            var i12, a12;
            if (il.unmount && il.unmount(t12), (i12 = t12.ref) && (i12.current && i12.current !== t12.__e || ij(i12, null, r12)), null != (i12 = t12.__c)) {
              if (i12.componentWillUnmount) try {
                i12.componentWillUnmount();
              } catch (e13) {
                il.__e(e13, r12);
              }
              i12.base = i12.__P = null;
            }
            if (i12 = t12.__k) for (a12 = 0; a12 < i12.length; a12++) i12[a12] && e12(i12[a12], r12, n12 || "function" != typeof t12.type);
            n12 || ik(t12.__e), t12.__c = t12.__ = t12.__e = t12.__d = void 0;
          }(a11, a11));
        }(r10, t10, m2), c2 = r10.__d, d2 = 0; d2 < y2; d2++) null != (h2 = r10.__k[d2]) && (p2 = -1 === h2.__i ? iw : m2[h2.__i] || iw, h2.__i = d2, iD(e10, h2, p2, i10, a10, o10, s2, c2, l2, u2), f2 = h2.__e, h2.ref && p2.ref != h2.ref && (p2.ref && ij(p2.ref, null, h2), u2.push(h2.ref, h2.__c || f2, h2)), null == g2 && null != f2 && (g2 = f2), 65536 & h2.__u || p2.__k === h2.__k ? c2 = function e11(t11, r11, n11) {
          var i11, a11;
          if ("function" == typeof t11.type) {
            for (i11 = t11.__k, a11 = 0; i11 && a11 < i11.length; a11++) i11[a11] && (i11[a11].__ = t11, r11 = e11(i11[a11], r11, n11));
            return r11;
          }
          t11.__e != r11 && (r11 && t11.type && !n11.contains(r11) && (r11 = iR(t11)), n11.insertBefore(t11.__e, r11 || null), r11 = t11.__e);
          do
            r11 = r11 && r11.nextSibling;
          while (null != r11 && 8 === r11.nodeType);
          return r11;
        }(h2, c2, e10) : "function" == typeof h2.type && void 0 !== h2.__d ? c2 = h2.__d : f2 && (c2 = f2.nextSibling), h2.__d = void 0, h2.__u &= -196609);
        r10.__d = c2, r10.__e = g2;
      }
      function iI(e10, t10, r10) {
        "-" === t10[0] ? e10.setProperty(t10, null == r10 ? "" : r10) : e10[t10] = null == r10 ? "" : "number" != typeof r10 || i_.test(t10) ? r10 : r10 + "px";
      }
      function iN(e10, t10, r10, n10, i10) {
        var a10;
        e: if ("style" === t10) if ("string" == typeof r10) e10.style.cssText = r10;
        else {
          if ("string" == typeof n10 && (e10.style.cssText = n10 = ""), n10) for (t10 in n10) r10 && t10 in r10 || iI(e10.style, t10, "");
          if (r10) for (t10 in r10) n10 && r10[t10] === n10[t10] || iI(e10.style, t10, r10[t10]);
        }
        else if ("o" === t10[0] && "n" === t10[1]) a10 = t10 !== (t10 = t10.replace(/(PointerCapture)$|Capture$/i, "$1")), t10 = t10.toLowerCase() in e10 || "onFocusOut" === t10 || "onFocusIn" === t10 ? t10.toLowerCase().slice(2) : t10.slice(2), e10.l || (e10.l = {}), e10.l[t10 + a10] = r10, r10 ? n10 ? r10.u = n10.u : (r10.u = im, e10.addEventListener(t10, a10 ? ib : iy, a10)) : e10.removeEventListener(t10, a10 ? ib : iy, a10);
        else {
          if ("http://www.w3.org/2000/svg" == i10) t10 = t10.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
          else if ("width" != t10 && "height" != t10 && "href" != t10 && "list" != t10 && "form" != t10 && "tabIndex" != t10 && "download" != t10 && "rowSpan" != t10 && "colSpan" != t10 && "role" != t10 && "popover" != t10 && t10 in e10) try {
            e10[t10] = null == r10 ? "" : r10;
            break e;
          } catch (e11) {
          }
          "function" == typeof r10 || (null == r10 || false === r10 && "-" !== t10[4] ? e10.removeAttribute(t10) : e10.setAttribute(t10, "popover" == t10 && 1 == r10 ? "" : r10));
        }
      }
      function iU(e10) {
        return function(t10) {
          if (this.l) {
            var r10 = this.l[t10.type + e10];
            if (null == t10.t) t10.t = im++;
            else if (t10.t < r10.u) return;
            return r10(il.event ? il.event(t10) : t10);
          }
        };
      }
      function iD(e10, t10, r10, n10, i10, a10, o10, s2, c2, l2) {
        var u2, d2, p2, h2, f2, g2, m2, y2, b2, w2, v2, _2, E2, S2, k2, x2, A2 = t10.type;
        if (void 0 !== t10.constructor) return null;
        128 & r10.__u && (c2 = !!(32 & r10.__u), a10 = [s2 = t10.__e = r10.__e]), (u2 = il.__b) && u2(t10);
        e: if ("function" == typeof A2) try {
          if (y2 = t10.props, b2 = "prototype" in A2 && A2.prototype.render, w2 = (u2 = A2.contextType) && n10[u2.__c], v2 = u2 ? w2 ? w2.props.value : u2.__ : n10, r10.__c ? m2 = (d2 = t10.__c = r10.__c).__ = d2.__E : (b2 ? t10.__c = d2 = new A2(y2, v2) : (t10.__c = d2 = new iT(y2, v2), d2.constructor = A2, d2.render = i$), w2 && w2.sub(d2), d2.props = y2, d2.state || (d2.state = {}), d2.context = v2, d2.__n = n10, p2 = d2.__d = true, d2.__h = [], d2._sb = []), b2 && null == d2.__s && (d2.__s = d2.state), b2 && null != A2.getDerivedStateFromProps && (d2.__s == d2.state && (d2.__s = iS({}, d2.__s)), iS(d2.__s, A2.getDerivedStateFromProps(y2, d2.__s))), h2 = d2.props, f2 = d2.state, d2.__v = t10, p2) b2 && null == A2.getDerivedStateFromProps && null != d2.componentWillMount && d2.componentWillMount(), b2 && null != d2.componentDidMount && d2.__h.push(d2.componentDidMount);
          else {
            if (b2 && null == A2.getDerivedStateFromProps && y2 !== h2 && null != d2.componentWillReceiveProps && d2.componentWillReceiveProps(y2, v2), !d2.__e && (null != d2.shouldComponentUpdate && false === d2.shouldComponentUpdate(y2, d2.__s, v2) || t10.__v === r10.__v)) {
              for (t10.__v !== r10.__v && (d2.props = y2, d2.state = d2.__s, d2.__d = false), t10.__e = r10.__e, t10.__k = r10.__k, t10.__k.some(function(e11) {
                e11 && (e11.__ = t10);
              }), _2 = 0; _2 < d2._sb.length; _2++) d2.__h.push(d2._sb[_2]);
              d2._sb = [], d2.__h.length && o10.push(d2);
              break e;
            }
            null != d2.componentWillUpdate && d2.componentWillUpdate(y2, d2.__s, v2), b2 && null != d2.componentDidUpdate && d2.__h.push(function() {
              d2.componentDidUpdate(h2, f2, g2);
            });
          }
          if (d2.context = v2, d2.props = y2, d2.__P = e10, d2.__e = false, E2 = il.__r, S2 = 0, b2) {
            for (d2.state = d2.__s, d2.__d = false, E2 && E2(t10), u2 = d2.render(d2.props, d2.state, d2.context), k2 = 0; k2 < d2._sb.length; k2++) d2.__h.push(d2._sb[k2]);
            d2._sb = [];
          } else do
            d2.__d = false, E2 && E2(t10), u2 = d2.render(d2.props, d2.state, d2.context), d2.state = d2.__s;
          while (d2.__d && ++S2 < 25);
          d2.state = d2.__s, null != d2.getChildContext && (n10 = iS(iS({}, n10), d2.getChildContext())), b2 && !p2 && null != d2.getSnapshotBeforeUpdate && (g2 = d2.getSnapshotBeforeUpdate(h2, f2)), iO(e10, iE(x2 = null != u2 && u2.type === iA && null == u2.key ? u2.props.children : u2) ? x2 : [x2], t10, r10, n10, i10, a10, o10, s2, c2, l2), d2.base = t10.__e, t10.__u &= -161, d2.__h.length && o10.push(d2), m2 && (d2.__E = d2.__ = null);
        } catch (e11) {
          if (t10.__v = null, c2 || null != a10) {
            for (t10.__u |= c2 ? 160 : 128; s2 && 8 === s2.nodeType && s2.nextSibling; ) s2 = s2.nextSibling;
            a10[a10.indexOf(s2)] = null, t10.__e = s2;
          } else t10.__e = r10.__e, t10.__k = r10.__k;
          il.__e(e11, t10, r10);
        }
        else null == a10 && t10.__v === r10.__v ? (t10.__k = r10.__k, t10.__e = r10.__e) : t10.__e = function(e11, t11, r11, n11, i11, a11, o11, s3, c3) {
          var l3, u3, d3, p3, h3, f3, g3, m3 = r11.props, y3 = t11.props, b3 = t11.type;
          if ("svg" === b3 ? i11 = "http://www.w3.org/2000/svg" : "math" === b3 ? i11 = "http://www.w3.org/1998/Math/MathML" : i11 || (i11 = "http://www.w3.org/1999/xhtml"), null != a11) {
            for (l3 = 0; l3 < a11.length; l3++) if ((h3 = a11[l3]) && "setAttribute" in h3 == !!b3 && (b3 ? h3.localName === b3 : 3 === h3.nodeType)) {
              e11 = h3, a11[l3] = null;
              break;
            }
          }
          if (null == e11) {
            if (null === b3) return document.createTextNode(y3);
            e11 = document.createElementNS(i11, b3, y3.is && y3), s3 && (il.__m && il.__m(t11, a11), s3 = false), a11 = null;
          }
          if (null === b3) m3 === y3 || s3 && e11.data === y3 || (e11.data = y3);
          else {
            if (a11 = a11 && ic.call(e11.childNodes), m3 = r11.props || iw, !s3 && null != a11) for (m3 = {}, l3 = 0; l3 < e11.attributes.length; l3++) m3[(h3 = e11.attributes[l3]).name] = h3.value;
            for (l3 in m3) if (h3 = m3[l3], "children" == l3) ;
            else if ("dangerouslySetInnerHTML" == l3) d3 = h3;
            else if (!(l3 in y3)) {
              if ("value" == l3 && "defaultValue" in y3 || "checked" == l3 && "defaultChecked" in y3) continue;
              iN(e11, l3, null, h3, i11);
            }
            for (l3 in y3) h3 = y3[l3], "children" == l3 ? p3 = h3 : "dangerouslySetInnerHTML" == l3 ? u3 = h3 : "value" == l3 ? f3 = h3 : "checked" == l3 ? g3 = h3 : s3 && "function" != typeof h3 || m3[l3] === h3 || iN(e11, l3, h3, m3[l3], i11);
            if (u3) s3 || d3 && (u3.__html === d3.__html || u3.__html === e11.innerHTML) || (e11.innerHTML = u3.__html), t11.__k = [];
            else if (d3 && (e11.innerHTML = ""), iO(e11, iE(p3) ? p3 : [p3], t11, r11, n11, "foreignObject" === b3 ? "http://www.w3.org/1999/xhtml" : i11, a11, o11, a11 ? a11[0] : r11.__k && iR(r11, 0), s3, c3), null != a11) for (l3 = a11.length; l3--; ) ik(a11[l3]);
            s3 || (l3 = "value", "progress" === b3 && null == f3 ? e11.removeAttribute("value") : void 0 === f3 || f3 === e11[l3] && ("progress" !== b3 || f3) && ("option" !== b3 || f3 === m3[l3]) || iN(e11, l3, f3, m3[l3], i11), l3 = "checked", void 0 !== g3 && g3 !== e11[l3] && iN(e11, l3, g3, m3[l3], i11));
          }
          return e11;
        }(r10.__e, t10, r10, n10, i10, a10, o10, c2, l2);
        (u2 = il.diffed) && u2(t10);
      }
      function ij(e10, t10, r10) {
        try {
          if ("function" == typeof e10) {
            var n10 = "function" == typeof e10.__u;
            n10 && e10.__u(), n10 && null == t10 || (e10.__u = e10(t10));
          } else e10.current = t10;
        } catch (e11) {
          il.__e(e11, r10);
        }
      }
      function i$(e10, t10, r10) {
        return this.constructor(e10, r10);
      }
      ic = iv.slice, il = { __e: function(e10, t10, r10, n10) {
        for (var i10, a10, o10; t10 = t10.__; ) if ((i10 = t10.__c) && !i10.__) try {
          if ((a10 = i10.constructor) && null != a10.getDerivedStateFromError && (i10.setState(a10.getDerivedStateFromError(e10)), o10 = i10.__d), null != i10.componentDidCatch && (i10.componentDidCatch(e10, n10 || {}), o10 = i10.__d), o10) return i10.__E = i10;
        } catch (t11) {
          e10 = t11;
        }
        throw e10;
      } }, iu = 0, iT.prototype.setState = function(e10, t10) {
        var r10;
        r10 = null != this.__s && this.__s !== this.state ? this.__s : this.__s = iS({}, this.state), "function" == typeof e10 && (e10 = e10(iS({}, r10), this.props)), e10 && iS(r10, e10), null != e10 && this.__v && (t10 && this._sb.push(t10), iC(this));
      }, iT.prototype.forceUpdate = function(e10) {
        this.__v && (this.__e = true, e10 && this.__h.push(e10), iC(this));
      }, iT.prototype.render = iA, id = [], ih = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, ig = function(e10, t10) {
        return e10.__v.__b - t10.__v.__b;
      }, iP.__r = 0, im = 0, iy = iU(false), ib = iU(true);
      var iL = /[\s\n\\/='"\0<>]/, iM = /^(xlink|xmlns|xml)([A-Z])/, iH = /^accessK|^auto[A-Z]|^cell|^ch|^col|cont|cross|dateT|encT|form[A-Z]|frame|hrefL|inputM|maxL|minL|noV|playsI|popoverT|readO|rowS|src[A-Z]|tabI|useM|item[A-Z]/, iW = /^ac|^ali|arabic|basel|cap|clipPath$|clipRule$|color|dominant|enable|fill|flood|font|glyph[^R]|horiz|image|letter|lighting|marker[^WUH]|overline|panose|pointe|paint|rendering|shape|stop|strikethrough|stroke|text[^L]|transform|underline|unicode|units|^v[^i]|^w|^xH/, iK = /* @__PURE__ */ new Set(["draggable", "spellcheck"]), iB = /["&<]/;
      function iq(e10) {
        if (0 === e10.length || false === iB.test(e10)) return e10;
        for (var t10 = 0, r10 = 0, n10 = "", i10 = ""; r10 < e10.length; r10++) {
          switch (e10.charCodeAt(r10)) {
            case 34:
              i10 = "&quot;";
              break;
            case 38:
              i10 = "&amp;";
              break;
            case 60:
              i10 = "&lt;";
              break;
            default:
              continue;
          }
          r10 !== t10 && (n10 += e10.slice(t10, r10)), n10 += i10, t10 = r10 + 1;
        }
        return r10 !== t10 && (n10 += e10.slice(t10, r10)), n10;
      }
      var iJ = {}, iV = /* @__PURE__ */ new Set(["animation-iteration-count", "border-image-outset", "border-image-slice", "border-image-width", "box-flex", "box-flex-group", "box-ordinal-group", "column-count", "fill-opacity", "flex", "flex-grow", "flex-negative", "flex-order", "flex-positive", "flex-shrink", "flood-opacity", "font-weight", "grid-column", "grid-row", "line-clamp", "line-height", "opacity", "order", "orphans", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-miterlimit", "stroke-opacity", "stroke-width", "tab-size", "widows", "z-index", "zoom"]), iz = /[A-Z]/g;
      function iF() {
        this.__d = true;
      }
      function iG(e10, t10, r10) {
        if (!e10.s) {
          if (r10 instanceof i0) {
            if (!r10.s) return void (r10.o = iG.bind(null, e10, t10));
            1 & t10 && (t10 = r10.s), r10 = r10.v;
          }
          if (r10 && r10.then) return void r10.then(iG.bind(null, e10, t10), iG.bind(null, e10, 2));
          e10.s = t10, e10.v = r10;
          let n10 = e10.o;
          n10 && n10(e10);
        }
      }
      var iX, iY, iQ, iZ, i0 = function() {
        function e10() {
        }
        return e10.prototype.then = function(t10, r10) {
          var n10 = new e10(), i10 = this.s;
          if (i10) {
            var a10 = 1 & i10 ? t10 : r10;
            if (a10) {
              try {
                iG(n10, 1, a10(this.v));
              } catch (e11) {
                iG(n10, 2, e11);
              }
              return n10;
            }
            return this;
          }
          return this.o = function(e11) {
            try {
              var i11 = e11.v;
              1 & e11.s ? iG(n10, 1, t10 ? t10(i11) : i11) : r10 ? iG(n10, 1, r10(i11)) : iG(n10, 2, i11);
            } catch (e12) {
              iG(n10, 2, e12);
            }
          }, n10;
        }, e10;
      }(), i1 = {}, i2 = [], i5 = Array.isArray, i3 = Object.assign;
      function i8(e10, t10) {
        var r10, n10 = e10.type, i10 = true;
        return e10.__c ? (i10 = false, (r10 = e10.__c).state = r10.__s) : r10 = new n10(e10.props, t10), e10.__c = r10, r10.__v = e10, r10.props = e10.props, r10.context = t10, r10.__d = true, null == r10.state && (r10.state = i1), null == r10.__s && (r10.__s = r10.state), n10.getDerivedStateFromProps ? r10.state = i3({}, r10.state, n10.getDerivedStateFromProps(r10.props, r10.state)) : i10 && r10.componentWillMount ? (r10.componentWillMount(), r10.state = r10.__s !== r10.state ? r10.__s : r10.state) : !i10 && r10.componentWillUpdate && r10.componentWillUpdate(), iQ && iQ(e10), r10.render(r10.props, r10.state, t10);
      }
      var i6 = /* @__PURE__ */ new Set(["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"]), i4 = 0;
      function i9(e10, t10, r10, n10, i10, a10) {
        t10 || (t10 = {});
        var o10, s2, c2 = t10;
        "ref" in t10 && (o10 = t10.ref, delete t10.ref);
        var l2 = { type: e10, props: c2, key: r10, ref: o10, __k: null, __: null, __b: 0, __e: null, __d: void 0, __c: null, constructor: void 0, __v: --i4, __i: -1, __u: 0, __source: i10, __self: a10 };
        if ("function" == typeof e10 && (o10 = e10.defaultProps)) for (s2 in o10) void 0 === c2[s2] && (c2[s2] = o10[s2]);
        return il.vnode && il.vnode(l2), l2;
      }
      async function i7(e10, t10) {
        let r10 = window.SimpleWebAuthnBrowser;
        async function n10(r11) {
          let n11 = new URL(`${e10}/webauthn-options/${t10}`);
          r11 && n11.searchParams.append("action", r11), a10().forEach((e11) => {
            n11.searchParams.append(e11.name, e11.value);
          });
          let i11 = await fetch(n11);
          return i11.ok ? i11.json() : void console.error("Failed to fetch options", i11);
        }
        function i10() {
          let e11 = `#${t10}-form`, r11 = document.querySelector(e11);
          if (!r11) throw Error(`Form '${e11}' not found`);
          return r11;
        }
        function a10() {
          return Array.from(i10().querySelectorAll("input[data-form-field]"));
        }
        async function o10(e11, t11) {
          let r11 = i10();
          if (e11) {
            let t12 = document.createElement("input");
            t12.type = "hidden", t12.name = "action", t12.value = e11, r11.appendChild(t12);
          }
          if (t11) {
            let e12 = document.createElement("input");
            e12.type = "hidden", e12.name = "data", e12.value = JSON.stringify(t11), r11.appendChild(e12);
          }
          return r11.submit();
        }
        async function s2(e11, t11) {
          let n11 = await r10.startAuthentication(e11, t11);
          return await o10("authenticate", n11);
        }
        async function c2(e11) {
          a10().forEach((e12) => {
            if (e12.required && !e12.value) throw Error(`Missing required field: ${e12.name}`);
          });
          let t11 = await r10.startRegistration(e11);
          return await o10("register", t11);
        }
        async function l2() {
          if (!r10.browserSupportsWebAuthnAutofill()) return;
          let e11 = await n10("authenticate");
          if (!e11) return void console.error("Failed to fetch option for autofill authentication");
          try {
            await s2(e11.options, true);
          } catch (e12) {
            console.error(e12);
          }
        }
        (async function() {
          let e11 = i10();
          if (!r10.browserSupportsWebAuthn()) {
            e11.style.display = "none";
            return;
          }
          e11 && e11.addEventListener("submit", async (e12) => {
            e12.preventDefault();
            let t11 = await n10(void 0);
            if (!t11) return void console.error("Failed to fetch options for form submission");
            if ("authenticate" === t11.action) try {
              await s2(t11.options, false);
            } catch (e13) {
              console.error(e13);
            }
            else if ("register" === t11.action) try {
              await c2(t11.options);
            } catch (e13) {
              console.error(e13);
            }
          });
        })(), l2();
      }
      let ae = { default: "Unable to sign in.", Signin: "Try signing in with a different account.", OAuthSignin: "Try signing in with a different account.", OAuthCallbackError: "Try signing in with a different account.", OAuthCreateAccount: "Try signing in with a different account.", EmailCreateAccount: "Try signing in with a different account.", Callback: "Try signing in with a different account.", OAuthAccountNotLinked: "To confirm your identity, sign in with the same account you used originally.", EmailSignin: "The e-mail could not be sent.", CredentialsSignin: "Sign in failed. Check the details you provided are correct.", SessionRequired: "Please sign in to access this page." }, at = `:root {
  --border-width: 1px;
  --border-radius: 0.5rem;
  --color-error: #c94b4b;
  --color-info: #157efb;
  --color-info-hover: #0f6ddb;
  --color-info-text: #fff;
}

.__next-auth-theme-auto,
.__next-auth-theme-light {
  --color-background: #ececec;
  --color-background-hover: rgba(236, 236, 236, 0.8);
  --color-background-card: #fff;
  --color-text: #000;
  --color-primary: #444;
  --color-control-border: #bbb;
  --color-button-active-background: #f9f9f9;
  --color-button-active-border: #aaa;
  --color-separator: #ccc;
  --provider-bg: #fff;
  --provider-bg-hover: color-mix(
    in srgb,
    var(--provider-brand-color) 30%,
    #fff
  );
}

.__next-auth-theme-dark {
  --color-background: #161b22;
  --color-background-hover: rgba(22, 27, 34, 0.8);
  --color-background-card: #0d1117;
  --color-text: #fff;
  --color-primary: #ccc;
  --color-control-border: #555;
  --color-button-active-background: #060606;
  --color-button-active-border: #666;
  --color-separator: #444;
  --provider-bg: #161b22;
  --provider-bg-hover: color-mix(
    in srgb,
    var(--provider-brand-color) 30%,
    #000
  );
}

.__next-auth-theme-dark img[src$="42-school.svg"],
  .__next-auth-theme-dark img[src$="apple.svg"],
  .__next-auth-theme-dark img[src$="boxyhq-saml.svg"],
  .__next-auth-theme-dark img[src$="eveonline.svg"],
  .__next-auth-theme-dark img[src$="github.svg"],
  .__next-auth-theme-dark img[src$="mailchimp.svg"],
  .__next-auth-theme-dark img[src$="medium.svg"],
  .__next-auth-theme-dark img[src$="okta.svg"],
  .__next-auth-theme-dark img[src$="patreon.svg"],
  .__next-auth-theme-dark img[src$="ping-id.svg"],
  .__next-auth-theme-dark img[src$="roblox.svg"],
  .__next-auth-theme-dark img[src$="threads.svg"],
  .__next-auth-theme-dark img[src$="wikimedia.svg"] {
    filter: invert(1);
  }

.__next-auth-theme-dark #submitButton {
    background-color: var(--provider-bg, var(--color-info));
  }

@media (prefers-color-scheme: dark) {
  .__next-auth-theme-auto {
    --color-background: #161b22;
    --color-background-hover: rgba(22, 27, 34, 0.8);
    --color-background-card: #0d1117;
    --color-text: #fff;
    --color-primary: #ccc;
    --color-control-border: #555;
    --color-button-active-background: #060606;
    --color-button-active-border: #666;
    --color-separator: #444;
    --provider-bg: #161b22;
    --provider-bg-hover: color-mix(
      in srgb,
      var(--provider-brand-color) 30%,
      #000
    );
  }
    .__next-auth-theme-auto img[src$="42-school.svg"],
    .__next-auth-theme-auto img[src$="apple.svg"],
    .__next-auth-theme-auto img[src$="boxyhq-saml.svg"],
    .__next-auth-theme-auto img[src$="eveonline.svg"],
    .__next-auth-theme-auto img[src$="github.svg"],
    .__next-auth-theme-auto img[src$="mailchimp.svg"],
    .__next-auth-theme-auto img[src$="medium.svg"],
    .__next-auth-theme-auto img[src$="okta.svg"],
    .__next-auth-theme-auto img[src$="patreon.svg"],
    .__next-auth-theme-auto img[src$="ping-id.svg"],
    .__next-auth-theme-auto img[src$="roblox.svg"],
    .__next-auth-theme-auto img[src$="threads.svg"],
    .__next-auth-theme-auto img[src$="wikimedia.svg"] {
      filter: invert(1);
    }
    .__next-auth-theme-auto #submitButton {
      background-color: var(--provider-bg, var(--color-info));
    }
}

html {
  box-sizing: border-box;
}

*,
*:before,
*:after {
  box-sizing: inherit;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--color-background);
  margin: 0;
  padding: 0;
  font-family:
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    "Helvetica Neue",
    Arial,
    "Noto Sans",
    sans-serif,
    "Apple Color Emoji",
    "Segoe UI Emoji",
    "Segoe UI Symbol",
    "Noto Color Emoji";
}

h1 {
  margin-bottom: 1.5rem;
  padding: 0 1rem;
  font-weight: 400;
  color: var(--color-text);
}

p {
  margin-bottom: 1.5rem;
  padding: 0 1rem;
  color: var(--color-text);
}

form {
  margin: 0;
  padding: 0;
}

label {
  font-weight: 500;
  text-align: left;
  margin-bottom: 0.25rem;
  display: block;
  color: var(--color-text);
}

input[type] {
  box-sizing: border-box;
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  border: var(--border-width) solid var(--color-control-border);
  background: var(--color-background-card);
  font-size: 1rem;
  border-radius: var(--border-radius);
  color: var(--color-text);
}

p {
  font-size: 1.1rem;
  line-height: 2rem;
}

a.button {
  text-decoration: none;
  line-height: 1rem;
}

a.button:link,
  a.button:visited {
    background-color: var(--color-background);
    color: var(--color-primary);
  }

button,
a.button {
  padding: 0.75rem 1rem;
  color: var(--provider-color, var(--color-primary));
  background-color: var(--provider-bg, var(--color-background));
  border: 1px solid #00000031;
  font-size: 0.9rem;
  height: 50px;
  border-radius: var(--border-radius);
  transition: background-color 250ms ease-in-out;
  font-weight: 300;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

:is(button,a.button):hover {
    background-color: var(--provider-bg-hover, var(--color-background-hover));
    cursor: pointer;
  }

:is(button,a.button):active {
    cursor: pointer;
  }

:is(button,a.button) span {
    color: var(--provider-bg);
  }

#submitButton {
  color: var(--button-text-color, var(--color-info-text));
  background-color: var(--brand-color, var(--color-info));
  width: 100%;
}

#submitButton:hover {
    background-color: var(
      --button-hover-bg,
      var(--color-info-hover)
    ) !important;
  }

a.site {
  color: var(--color-primary);
  text-decoration: none;
  font-size: 1rem;
  line-height: 2rem;
}

a.site:hover {
    text-decoration: underline;
  }

.page {
  position: absolute;
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.page > div {
    text-align: center;
  }

.error a.button {
    padding-left: 2rem;
    padding-right: 2rem;
    margin-top: 0.5rem;
  }

.error .message {
    margin-bottom: 1.5rem;
  }

.signin input[type="text"] {
    margin-left: auto;
    margin-right: auto;
    display: block;
  }

.signin hr {
    display: block;
    border: 0;
    border-top: 1px solid var(--color-separator);
    margin: 2rem auto 1rem auto;
    overflow: visible;
  }

.signin hr::before {
      content: "or";
      background: var(--color-background-card);
      color: #888;
      padding: 0 0.4rem;
      position: relative;
      top: -0.7rem;
    }

.signin .error {
    background: #f5f5f5;
    font-weight: 500;
    border-radius: 0.3rem;
    background: var(--color-error);
  }

.signin .error p {
      text-align: left;
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
      line-height: 1.2rem;
      color: var(--color-info-text);
    }

.signin > div,
  .signin form {
    display: block;
  }

.signin > div input[type], .signin form input[type] {
      margin-bottom: 0.5rem;
    }

.signin > div button, .signin form button {
      width: 100%;
    }

.signin .provider + .provider {
    margin-top: 1rem;
  }

.logo {
  display: inline-block;
  max-width: 150px;
  margin: 1.25rem 0;
  max-height: 70px;
}

.card {
  background-color: var(--color-background-card);
  border-radius: 1rem;
  padding: 1.25rem 2rem;
}

.card .header {
    color: var(--color-primary);
  }

.card input[type]::-moz-placeholder {
    color: color-mix(
      in srgb,
      var(--color-text) 20%,
      var(--color-button-active-background)
    );
  }

.card input[type]::placeholder {
    color: color-mix(
      in srgb,
      var(--color-text) 20%,
      var(--color-button-active-background)
    );
  }

.card input[type] {
    background: color-mix(in srgb, var(--color-background-card) 95%, black);
  }

.section-header {
  color: var(--color-text);
}

@media screen and (min-width: 450px) {
  .card {
    margin: 2rem 0;
    width: 368px;
  }
}

@media screen and (max-width: 450px) {
  .card {
    margin: 1rem 0;
    width: 343px;
  }
}
`;
      function ar({ html: e10, title: t10, status: r10, cookies: n10, theme: i10, headTags: a10 }) {
        return { cookies: n10, status: r10, headers: { "Content-Type": "text/html" }, body: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${at}</style><title>${t10}</title>${a10 ?? ""}</head><body class="__next-auth-theme-${i10?.colorScheme ?? "auto"}"><div class="page">${function(e11, t11, r11) {
          var n11 = il.__s;
          il.__s = true, iX = il.__b, iY = il.diffed, iQ = il.__r, iZ = il.unmount;
          var i11 = function(e12, t12, r12) {
            var n12, i12, a12, o10 = {};
            for (a12 in t12) "key" == a12 ? n12 = t12[a12] : "ref" == a12 ? i12 = t12[a12] : o10[a12] = t12[a12];
            if (arguments.length > 2 && (o10.children = arguments.length > 3 ? ic.call(arguments, 2) : r12), "function" == typeof e12 && null != e12.defaultProps) for (a12 in e12.defaultProps) void 0 === o10[a12] && (o10[a12] = e12.defaultProps[a12]);
            return ix(e12, o10, n12, i12, null);
          }(iA, null);
          i11.__k = [e11];
          try {
            var a11 = function e12(t12, r12, n12, i12, a12, o10, s2) {
              if (null == t12 || true === t12 || false === t12 || "" === t12) return "";
              var c2 = typeof t12;
              if ("object" != c2) return "function" == c2 ? "" : "string" == c2 ? iq(t12) : t12 + "";
              if (i5(t12)) {
                var l2, u2 = "";
                a12.__k = t12;
                for (var d2 = 0; d2 < t12.length; d2++) {
                  var p2 = t12[d2];
                  if (null != p2 && "boolean" != typeof p2) {
                    var h2, f2 = e12(p2, r12, n12, i12, a12, o10, s2);
                    "string" == typeof f2 ? u2 += f2 : (l2 || (l2 = []), u2 && l2.push(u2), u2 = "", i5(f2) ? (h2 = l2).push.apply(h2, f2) : l2.push(f2));
                  }
                }
                return l2 ? (u2 && l2.push(u2), l2) : u2;
              }
              if (void 0 !== t12.constructor) return "";
              t12.__ = a12, iX && iX(t12);
              var g2 = t12.type, m2 = t12.props;
              if ("function" == typeof g2) {
                var y2, b2, w2, v2 = r12;
                if (g2 === iA) {
                  if ("tpl" in m2) {
                    for (var _2 = "", E2 = 0; E2 < m2.tpl.length; E2++) if (_2 += m2.tpl[E2], m2.exprs && E2 < m2.exprs.length) {
                      var S2 = m2.exprs[E2];
                      if (null == S2) continue;
                      "object" == typeof S2 && (void 0 === S2.constructor || i5(S2)) ? _2 += e12(S2, r12, n12, i12, t12, o10, s2) : _2 += S2;
                    }
                    return _2;
                  }
                  if ("UNSTABLE_comment" in m2) return "<!--" + iq(m2.UNSTABLE_comment) + "-->";
                  b2 = m2.children;
                } else {
                  if (null != (y2 = g2.contextType)) {
                    var k2 = r12[y2.__c];
                    v2 = k2 ? k2.props.value : y2.__;
                  }
                  var x2 = g2.prototype && "function" == typeof g2.prototype.render;
                  if (x2) b2 = i8(t12, v2), w2 = t12.__c;
                  else {
                    t12.__c = w2 = { __v: t12, context: v2, props: t12.props, setState: iF, forceUpdate: iF, __d: true, __h: [] };
                    for (var A2 = 0; w2.__d && A2++ < 25; ) w2.__d = false, iQ && iQ(t12), b2 = g2.call(w2, m2, v2);
                    w2.__d = true;
                  }
                  if (null != w2.getChildContext && (r12 = i3({}, r12, w2.getChildContext())), x2 && il.errorBoundaries && (g2.getDerivedStateFromError || w2.componentDidCatch)) {
                    b2 = null != b2 && b2.type === iA && null == b2.key && null == b2.props.tpl ? b2.props.children : b2;
                    try {
                      return e12(b2, r12, n12, i12, t12, o10, s2);
                    } catch (a13) {
                      return g2.getDerivedStateFromError && (w2.__s = g2.getDerivedStateFromError(a13)), w2.componentDidCatch && w2.componentDidCatch(a13, i1), w2.__d ? (b2 = i8(t12, r12), null != (w2 = t12.__c).getChildContext && (r12 = i3({}, r12, w2.getChildContext())), e12(b2 = null != b2 && b2.type === iA && null == b2.key && null == b2.props.tpl ? b2.props.children : b2, r12, n12, i12, t12, o10, s2)) : "";
                    } finally {
                      iY && iY(t12), t12.__ = null, iZ && iZ(t12);
                    }
                  }
                }
                b2 = null != b2 && b2.type === iA && null == b2.key && null == b2.props.tpl ? b2.props.children : b2;
                try {
                  var T2 = e12(b2, r12, n12, i12, t12, o10, s2);
                  return iY && iY(t12), t12.__ = null, il.unmount && il.unmount(t12), T2;
                } catch (a13) {
                  if (!o10 && s2 && s2.onError) {
                    var R2 = s2.onError(a13, t12, function(a14) {
                      return e12(a14, r12, n12, i12, t12, o10, s2);
                    });
                    if (void 0 !== R2) return R2;
                    var C2 = il.__e;
                    return C2 && C2(a13, t12), "";
                  }
                  if (!o10 || !a13 || "function" != typeof a13.then) throw a13;
                  return a13.then(function a14() {
                    try {
                      return e12(b2, r12, n12, i12, t12, o10, s2);
                    } catch (c3) {
                      if (!c3 || "function" != typeof c3.then) throw c3;
                      return c3.then(function() {
                        return e12(b2, r12, n12, i12, t12, o10, s2);
                      }, a14);
                    }
                  });
                }
              }
              var P2, O2 = "<" + g2, I2 = "";
              for (var N2 in m2) {
                var U2 = m2[N2];
                if ("function" != typeof U2 || "class" === N2 || "className" === N2) {
                  switch (N2) {
                    case "children":
                      P2 = U2;
                      continue;
                    case "key":
                    case "ref":
                    case "__self":
                    case "__source":
                      continue;
                    case "htmlFor":
                      if ("for" in m2) continue;
                      N2 = "for";
                      break;
                    case "className":
                      if ("class" in m2) continue;
                      N2 = "class";
                      break;
                    case "defaultChecked":
                      N2 = "checked";
                      break;
                    case "defaultSelected":
                      N2 = "selected";
                      break;
                    case "defaultValue":
                    case "value":
                      switch (N2 = "value", g2) {
                        case "textarea":
                          P2 = U2;
                          continue;
                        case "select":
                          i12 = U2;
                          continue;
                        case "option":
                          i12 != U2 || "selected" in m2 || (O2 += " selected");
                      }
                      break;
                    case "dangerouslySetInnerHTML":
                      I2 = U2 && U2.__html;
                      continue;
                    case "style":
                      "object" == typeof U2 && (U2 = function(e13) {
                        var t13 = "";
                        for (var r13 in e13) {
                          var n13 = e13[r13];
                          if (null != n13 && "" !== n13) {
                            var i13 = "-" == r13[0] ? r13 : iJ[r13] || (iJ[r13] = r13.replace(iz, "-$&").toLowerCase()), a13 = ";";
                            "number" != typeof n13 || i13.startsWith("--") || iV.has(i13) || (a13 = "px;"), t13 = t13 + i13 + ":" + n13 + a13;
                          }
                        }
                        return t13 || void 0;
                      }(U2));
                      break;
                    case "acceptCharset":
                      N2 = "accept-charset";
                      break;
                    case "httpEquiv":
                      N2 = "http-equiv";
                      break;
                    default:
                      if (iM.test(N2)) N2 = N2.replace(iM, "$1:$2").toLowerCase();
                      else {
                        if (iL.test(N2)) continue;
                        ("-" === N2[4] || iK.has(N2)) && null != U2 ? U2 += "" : n12 ? iW.test(N2) && (N2 = "panose1" === N2 ? "panose-1" : N2.replace(/([A-Z])/g, "-$1").toLowerCase()) : iH.test(N2) && (N2 = N2.toLowerCase());
                      }
                  }
                  null != U2 && false !== U2 && (O2 = true === U2 || "" === U2 ? O2 + " " + N2 : O2 + " " + N2 + '="' + ("string" == typeof U2 ? iq(U2) : U2 + "") + '"');
                }
              }
              if (iL.test(g2)) throw Error(g2 + " is not a valid HTML tag name in " + O2 + ">");
              if (I2 || ("string" == typeof P2 ? I2 = iq(P2) : null != P2 && false !== P2 && true !== P2 && (I2 = e12(P2, r12, "svg" === g2 || "foreignObject" !== g2 && n12, i12, t12, o10, s2))), iY && iY(t12), t12.__ = null, iZ && iZ(t12), !I2 && i6.has(g2)) return O2 + "/>";
              var D2 = "</" + g2 + ">", j2 = O2 + ">";
              return i5(I2) ? [j2].concat(I2, [D2]) : "string" != typeof I2 ? [j2, I2, D2] : j2 + I2 + D2;
            }(e11, i1, false, void 0, i11, false, void 0);
            return i5(a11) ? a11.join("") : a11;
          } catch (e12) {
            if (e12.then) throw Error('Use "renderToStringAsync" for suspenseful rendering.');
            throw e12;
          } finally {
            il.__c && il.__c(e11, i2), il.__s = n11, i2.length = 0;
          }
        }(e10)}</div></body></html>` };
      }
      function an(e10) {
        let { url: t10, theme: r10, query: n10, cookies: i10, pages: a10, providers: o10 } = e10;
        return { csrf: (e11, t11, r11) => e11 ? (t11.logger.warn("csrf-disabled"), r11.push({ name: t11.cookies.csrfToken.name, value: "", options: { ...t11.cookies.csrfToken.options, maxAge: 0 } }), { status: 404, cookies: r11 }) : { headers: { "Content-Type": "application/json", "Cache-Control": "private, no-cache, no-store", Expires: "0", Pragma: "no-cache" }, body: { csrfToken: t11.csrfToken }, cookies: r11 }, providers: (e11) => ({ headers: { "Content-Type": "application/json" }, body: e11.reduce((e12, { id: t11, name: r11, type: n11, signinUrl: i11, callbackUrl: a11 }) => (e12[t11] = { id: t11, name: r11, type: n11, signinUrl: i11, callbackUrl: a11 }, e12), {}) }), signin(t11, s2) {
          if (t11) throw new tk("Unsupported action");
          if (a10?.signIn) {
            let t12 = `${a10.signIn}${a10.signIn.includes("?") ? "&" : "?"}${new URLSearchParams({ callbackUrl: e10.callbackUrl ?? "/" })}`;
            return s2 && (t12 = `${t12}&${new URLSearchParams({ error: s2 })}`), { redirect: t12, cookies: i10 };
          }
          let c2 = o10?.find((e11) => "webauthn" === e11.type && e11.enableConditionalUI && !!e11.simpleWebAuthnBrowserVersion), l2 = "";
          if (c2) {
            let { simpleWebAuthnBrowserVersion: e11 } = c2;
            l2 = `<script src="https://unpkg.com/@simplewebauthn/browser@${e11}/dist/bundle/index.umd.min.js" crossorigin="anonymous"></script>`;
          }
          return ar({ cookies: i10, theme: r10, html: function(e11) {
            let { csrfToken: t12, providers: r11 = [], callbackUrl: n11, theme: i11, email: a11, error: o11 } = e11;
            "u" > typeof document && i11?.brandColor && document.documentElement.style.setProperty("--brand-color", i11.brandColor), "u" > typeof document && i11?.buttonText && document.documentElement.style.setProperty("--button-text-color", i11.buttonText);
            let s3 = o11 && (ae[o11] ?? ae.default), c3 = r11.find((e12) => "webauthn" === e12.type && e12.enableConditionalUI)?.id;
            return i9("div", { className: "signin", children: [i11?.brandColor && i9("style", { dangerouslySetInnerHTML: { __html: `:root {--brand-color: ${i11.brandColor}}` } }), i11?.buttonText && i9("style", { dangerouslySetInnerHTML: { __html: `
        :root {
          --button-text-color: ${i11.buttonText}
        }
      ` } }), i9("div", { className: "card", children: [s3 && i9("div", { className: "error", children: i9("p", { children: s3 }) }), i11?.logo && i9("img", { src: i11.logo, alt: "Logo", className: "logo" }), r11.map((e12, i12) => {
              let o12, s4, c4;
              ("oauth" === e12.type || "oidc" === e12.type) && ({ bg: o12 = "#fff", brandColor: s4, logo: c4 = `https://authjs.dev/img/providers/${e12.id}.svg` } = e12.style ?? {});
              let l3 = s4 ?? o12 ?? "#fff";
              return i9("div", { className: "provider", children: ["oauth" === e12.type || "oidc" === e12.type ? i9("form", { action: e12.signinUrl, method: "POST", children: [i9("input", { type: "hidden", name: "csrfToken", value: t12 }), n11 && i9("input", { type: "hidden", name: "callbackUrl", value: n11 }), i9("button", { type: "submit", className: "button", style: { "--provider-brand-color": l3 }, tabIndex: 0, children: [i9("span", { style: { filter: "invert(1) grayscale(1) brightness(1.3) contrast(9000)", "mix-blend-mode": "luminosity", opacity: 0.95 }, children: ["Sign in with ", e12.name] }), c4 && i9("img", { loading: "lazy", height: 24, src: c4 })] })] }) : null, ("email" === e12.type || "credentials" === e12.type || "webauthn" === e12.type) && i12 > 0 && "email" !== r11[i12 - 1].type && "credentials" !== r11[i12 - 1].type && "webauthn" !== r11[i12 - 1].type && i9("hr", {}), "email" === e12.type && i9("form", { action: e12.signinUrl, method: "POST", children: [i9("input", { type: "hidden", name: "csrfToken", value: t12 }), i9("label", { className: "section-header", htmlFor: `input-email-for-${e12.id}-provider`, children: "Email" }), i9("input", { id: `input-email-for-${e12.id}-provider`, autoFocus: true, type: "email", name: "email", value: a11, placeholder: "email@example.com", required: true }), i9("button", { id: "submitButton", type: "submit", tabIndex: 0, children: ["Sign in with ", e12.name] })] }), "credentials" === e12.type && i9("form", { action: e12.callbackUrl, method: "POST", children: [i9("input", { type: "hidden", name: "csrfToken", value: t12 }), Object.keys(e12.credentials).map((t13) => i9("div", { children: [i9("label", { className: "section-header", htmlFor: `input-${t13}-for-${e12.id}-provider`, children: e12.credentials[t13].label ?? t13 }), i9("input", { name: t13, id: `input-${t13}-for-${e12.id}-provider`, type: e12.credentials[t13].type ?? "text", placeholder: e12.credentials[t13].placeholder ?? "", ...e12.credentials[t13] })] }, `input-group-${e12.id}`)), i9("button", { id: "submitButton", type: "submit", tabIndex: 0, children: ["Sign in with ", e12.name] })] }), "webauthn" === e12.type && i9("form", { action: e12.callbackUrl, method: "POST", id: `${e12.id}-form`, children: [i9("input", { type: "hidden", name: "csrfToken", value: t12 }), Object.keys(e12.formFields).map((t13) => i9("div", { children: [i9("label", { className: "section-header", htmlFor: `input-${t13}-for-${e12.id}-provider`, children: e12.formFields[t13].label ?? t13 }), i9("input", { name: t13, "data-form-field": true, id: `input-${t13}-for-${e12.id}-provider`, type: e12.formFields[t13].type ?? "text", placeholder: e12.formFields[t13].placeholder ?? "", ...e12.formFields[t13] })] }, `input-group-${e12.id}`)), i9("button", { id: `submitButton-${e12.id}`, type: "submit", tabIndex: 0, children: ["Sign in with ", e12.name] })] }), ("email" === e12.type || "credentials" === e12.type || "webauthn" === e12.type) && i12 + 1 < r11.length && i9("hr", {})] }, e12.id);
            })] }), c3 && i9(iA, { children: i9("script", { dangerouslySetInnerHTML: { __html: `
const currentURL = window.location.href;
const authURL = currentURL.substring(0, currentURL.lastIndexOf('/'));
(${i7})(authURL, "${c3}");
` } }) })] });
          }({ csrfToken: e10.csrfToken, providers: e10.providers?.filter((e11) => ["email", "oauth", "oidc"].includes(e11.type) || "credentials" === e11.type && e11.credentials || "webauthn" === e11.type && e11.formFields || false), callbackUrl: e10.callbackUrl, theme: e10.theme, error: s2, ...n10 }), title: "Sign In", headTags: l2 });
        }, signout: () => a10?.signOut ? { redirect: a10.signOut, cookies: i10 } : ar({ cookies: i10, theme: r10, html: function(e11) {
          let { url: t11, csrfToken: r11, theme: n11 } = e11;
          return i9("div", { className: "signout", children: [n11?.brandColor && i9("style", { dangerouslySetInnerHTML: { __html: `
        :root {
          --brand-color: ${n11.brandColor}
        }
      ` } }), n11?.buttonText && i9("style", { dangerouslySetInnerHTML: { __html: `
        :root {
          --button-text-color: ${n11.buttonText}
        }
      ` } }), i9("div", { className: "card", children: [n11?.logo && i9("img", { src: n11.logo, alt: "Logo", className: "logo" }), i9("h1", { children: "Signout" }), i9("p", { children: "Are you sure you want to sign out?" }), i9("form", { action: t11?.toString(), method: "POST", children: [i9("input", { type: "hidden", name: "csrfToken", value: r11 }), i9("button", { id: "submitButton", type: "submit", children: "Sign out" })] })] })] });
        }({ csrfToken: e10.csrfToken, url: t10, theme: r10 }), title: "Sign Out" }), verifyRequest: (e11) => a10?.verifyRequest ? { redirect: `${a10.verifyRequest}${t10?.search ?? ""}`, cookies: i10 } : ar({ cookies: i10, theme: r10, html: function(e12) {
          let { url: t11, theme: r11 } = e12;
          return i9("div", { className: "verify-request", children: [r11.brandColor && i9("style", { dangerouslySetInnerHTML: { __html: `
        :root {
          --brand-color: ${r11.brandColor}
        }
      ` } }), i9("div", { className: "card", children: [r11.logo && i9("img", { src: r11.logo, alt: "Logo", className: "logo" }), i9("h1", { children: "Check your email" }), i9("p", { children: "A sign in link has been sent to your email address." }), i9("p", { children: i9("a", { className: "site", href: t11.origin, children: t11.host }) })] })] });
        }({ url: t10, theme: r10, ...e11 }), title: "Verify Request" }), error: (e11) => a10?.error ? { redirect: `${a10.error}${a10.error.includes("?") ? "&" : "?"}error=${e11}`, cookies: i10 } : ar({ cookies: i10, theme: r10, ...function(e12) {
          let { url: t11, error: r11 = "default", theme: n11 } = e12, i11 = `${t11}/signin`, a11 = { default: { status: 200, heading: "Error", message: i9("p", { children: i9("a", { className: "site", href: t11?.origin, children: t11?.host }) }) }, Configuration: { status: 500, heading: "Server error", message: i9("div", { children: [i9("p", { children: "There is a problem with the server configuration." }), i9("p", { children: "Check the server logs for more information." })] }) }, AccessDenied: { status: 403, heading: "Access Denied", message: i9("div", { children: [i9("p", { children: "You do not have permission to sign in." }), i9("p", { children: i9("a", { className: "button", href: i11, children: "Sign in" }) })] }) }, Verification: { status: 403, heading: "Unable to sign in", message: i9("div", { children: [i9("p", { children: "The sign in link is no longer valid." }), i9("p", { children: "It may have been used already or it may have expired." })] }), signin: i9("a", { className: "button", href: i11, children: "Sign in" }) } }, { status: o11, heading: s2, message: c2, signin: l2 } = a11[r11] ?? a11.default;
          return { status: o11, html: i9("div", { className: "error", children: [n11?.brandColor && i9("style", { dangerouslySetInnerHTML: { __html: `
        :root {
          --brand-color: ${n11?.brandColor}
        }
      ` } }), i9("div", { className: "card", children: [n11?.logo && i9("img", { src: n11?.logo, alt: "Logo", className: "logo" }), i9("h1", { children: s2 }), i9("div", { className: "message", children: c2 }), l2] })] }) };
        }({ url: t10, theme: r10, error: e11 }), title: "Error" }) };
      }
      function ai(e10, t10 = Date.now()) {
        return new Date(t10 + 1e3 * e10);
      }
      async function aa(e10, t10, r10, n10) {
        if (!r10?.providerAccountId || !r10.type) throw Error("Missing or invalid provider account");
        if (!["email", "oauth", "oidc", "webauthn"].includes(r10.type)) throw Error("Provider not supported");
        let { adapter: i10, jwt: a10, events: o10, session: { strategy: s2, generateSessionToken: c2 } } = n10;
        if (!i10) return { user: t10, account: r10 };
        let l2 = r10, { createUser: u2, updateUser: d2, getUser: p2, getUserByAccount: h2, getUserByEmail: f2, linkAccount: g2, createSession: m2, getSessionAndUser: y2, deleteSession: b2 } = i10, w2 = null, v2 = null, _2 = false, E2 = "jwt" === s2;
        if (e10) if (E2) try {
          let t11 = n10.cookies.sessionToken.name;
          (w2 = await a10.decode({ ...a10, token: e10, salt: t11 })) && "sub" in w2 && w2.sub && (v2 = await p2(w2.sub));
        } catch {
        }
        else {
          let t11 = await y2(e10);
          t11 && (w2 = t11.session, v2 = t11.user);
        }
        if ("email" === l2.type) {
          let r11 = await f2(t10.email);
          return r11 ? (v2?.id !== r11.id && !E2 && e10 && await b2(e10), v2 = await d2({ id: r11.id, emailVerified: /* @__PURE__ */ new Date() }), await o10.updateUser?.({ user: v2 })) : (v2 = await u2({ ...t10, emailVerified: /* @__PURE__ */ new Date() }), await o10.createUser?.({ user: v2 }), _2 = true), { session: w2 = E2 ? {} : await m2({ sessionToken: c2(), userId: v2.id, expires: ai(n10.session.maxAge) }), user: v2, isNewUser: _2 };
        }
        if ("webauthn" === l2.type) {
          let e11 = await h2({ providerAccountId: l2.providerAccountId, provider: l2.provider });
          if (e11) {
            if (v2) {
              if (e11.id === v2.id) {
                let e12 = { ...l2, userId: v2.id };
                return { session: w2, user: v2, isNewUser: _2, account: e12 };
              }
              throw new tU("The account is already associated with another user", { provider: l2.provider });
            }
            w2 = E2 ? {} : await m2({ sessionToken: c2(), userId: e11.id, expires: ai(n10.session.maxAge) });
            let t11 = { ...l2, userId: e11.id };
            return { session: w2, user: e11, isNewUser: _2, account: t11 };
          }
          {
            if (v2) {
              await g2({ ...l2, userId: v2.id }), await o10.linkAccount?.({ user: v2, account: l2, profile: t10 });
              let e13 = { ...l2, userId: v2.id };
              return { session: w2, user: v2, isNewUser: _2, account: e13 };
            }
            if (t10.email ? await f2(t10.email) : null) throw new tU("Another account already exists with the same e-mail address", { provider: l2.provider });
            v2 = await u2({ ...t10 }), await o10.createUser?.({ user: v2 }), await g2({ ...l2, userId: v2.id }), await o10.linkAccount?.({ user: v2, account: l2, profile: t10 }), w2 = E2 ? {} : await m2({ sessionToken: c2(), userId: v2.id, expires: ai(n10.session.maxAge) });
            let e12 = { ...l2, userId: v2.id };
            return { session: w2, user: v2, isNewUser: true, account: e12 };
          }
        }
        let S2 = await h2({ providerAccountId: l2.providerAccountId, provider: l2.provider });
        if (S2) {
          if (v2) {
            if (S2.id === v2.id) return { session: w2, user: v2, isNewUser: _2 };
            throw new tw("The account is already associated with another user", { provider: l2.provider });
          }
          return { session: w2 = E2 ? {} : await m2({ sessionToken: c2(), userId: S2.id, expires: ai(n10.session.maxAge) }), user: S2, isNewUser: _2 };
        }
        {
          let { provider: e11 } = n10, { type: r11, provider: i11, providerAccountId: a11, userId: s3, ...d3 } = l2;
          if (l2 = Object.assign(e11.account(d3) ?? {}, { providerAccountId: a11, provider: i11, type: r11, userId: s3 }), v2) return await g2({ ...l2, userId: v2.id }), await o10.linkAccount?.({ user: v2, account: l2, profile: t10 }), { session: w2, user: v2, isNewUser: _2 };
          let p3 = t10.email ? await f2(t10.email) : null;
          if (p3) {
            let e12 = n10.provider;
            if (e12?.allowDangerousEmailAccountLinking) v2 = p3, _2 = false;
            else throw new tw("Another account already exists with the same e-mail address", { provider: l2.provider });
          } else v2 = await u2({ ...t10, emailVerified: null }), _2 = true;
          return await o10.createUser?.({ user: v2 }), await g2({ ...l2, userId: v2.id }), await o10.linkAccount?.({ user: v2, account: l2, profile: t10 }), { session: w2 = E2 ? {} : await m2({ sessionToken: c2(), userId: v2.id, expires: ai(n10.session.maxAge) }), user: v2, isNewUser: _2 };
        }
      }
      function ao(e10, t10) {
        if (null == e10) return false;
        try {
          return e10 instanceof t10 || Object.getPrototypeOf(e10)[Symbol.toStringTag] === t10.prototype[Symbol.toStringTag];
        } catch {
          return false;
        }
      }
      ("u" < typeof navigator || !navigator.userAgent?.startsWith?.("Mozilla/5.0 ")) && (n = "oauth4webapi/v3.8.3");
      let as = "ERR_INVALID_ARG_VALUE", ac = "ERR_INVALID_ARG_TYPE";
      function al(e10, t10, r10) {
        let n10 = TypeError(e10, { cause: r10 });
        return Object.assign(n10, { code: t10 }), n10;
      }
      let au = Symbol(), ad = Symbol(), ap = Symbol(), ah = Symbol(), af = Symbol(), ag = Symbol();
      Symbol();
      let am = new TextEncoder(), ay = new TextDecoder();
      function ab(e10) {
        return "string" == typeof e10 ? am.encode(e10) : ay.decode(e10);
      }
      function aw(e10) {
        return "string" == typeof e10 ? a(e10) : i(e10);
      }
      i = Uint8Array.prototype.toBase64 ? (e10) => (e10 instanceof ArrayBuffer && (e10 = new Uint8Array(e10)), e10.toBase64({ alphabet: "base64url", omitPadding: true })) : (e10) => {
        e10 instanceof ArrayBuffer && (e10 = new Uint8Array(e10));
        let t10 = [];
        for (let r10 = 0; r10 < e10.byteLength; r10 += 32768) t10.push(String.fromCharCode.apply(null, e10.subarray(r10, r10 + 32768)));
        return btoa(t10.join("")).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
      }, a = Uint8Array.fromBase64 ? (e10) => {
        try {
          return Uint8Array.fromBase64(e10, { alphabet: "base64url" });
        } catch (e11) {
          throw al("The input to be decoded is not correctly encoded.", as, e11);
        }
      } : (e10) => {
        try {
          let t10 = atob(e10.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "")), r10 = new Uint8Array(t10.length);
          for (let e11 = 0; e11 < t10.length; e11++) r10[e11] = t10.charCodeAt(e11);
          return r10;
        } catch (e11) {
          throw al("The input to be decoded is not correctly encoded.", as, e11);
        }
      };
      class av extends Error {
        code;
        constructor(e10, t10) {
          super(e10, t10), this.name = this.constructor.name, this.code = o_, Error.captureStackTrace?.(this, this.constructor);
        }
      }
      class a_ extends Error {
        code;
        constructor(e10, t10) {
          super(e10, t10), this.name = this.constructor.name, t10?.code && (this.code = t10?.code), Error.captureStackTrace?.(this, this.constructor);
        }
      }
      function aE(e10, t10, r10) {
        return new a_(e10, { code: t10, cause: r10 });
      }
      function aS(e10) {
        return !(null === e10 || "object" != typeof e10 || Array.isArray(e10));
      }
      function ak(e10) {
        ao(e10, Headers) && (e10 = Object.fromEntries(e10.entries()));
        let t10 = new Headers(e10 ?? {});
        if (n && !t10.has("user-agent") && t10.set("user-agent", n), t10.has("authorization")) throw al('"options.headers" must not include the "authorization" header name', as);
        return t10;
      }
      function ax(e10, t10) {
        if (void 0 !== t10) {
          if ("function" == typeof t10 && (t10 = t10(e10.href)), !(t10 instanceof AbortSignal)) throw al('"options.signal" must return or be an instance of AbortSignal', ac);
          return t10;
        }
      }
      function aA(e10) {
        return e10.includes("//") ? e10.replace("//", "/") : e10;
      }
      async function aT(e10, t10, r10, n10) {
        if (!(e10 instanceof URL)) throw al(`"${t10}" must be an instance of URL`, ac);
        aB(e10, n10?.[au] !== true);
        let i10 = r10(new URL(e10.href)), a10 = ak(n10?.headers);
        return a10.set("accept", "application/json"), (n10?.[ah] || fetch)(i10.href, { body: void 0, headers: Object.fromEntries(a10.entries()), method: "GET", redirect: "manual", signal: ax(i10, n10?.signal) });
      }
      async function aR(e10, t10) {
        return aT(e10, "issuerIdentifier", (e11) => {
          switch (t10?.algorithm) {
            case void 0:
            case "oidc":
              e11.pathname = aA(`${e11.pathname}/.well-known/openid-configuration`);
              break;
            case "oauth2":
              !function(e12, t11, r10 = false) {
                "/" === e12.pathname ? e12.pathname = t11 : e12.pathname = aA(`${t11}/${r10 ? e12.pathname : e12.pathname.replace(/(\/)$/, "")}`);
              }(e11, ".well-known/oauth-authorization-server");
              break;
            default:
              throw al('"options.algorithm" must be "oidc" (default), or "oauth2"', as);
          }
          return e11;
        }, t10);
      }
      function aC(e10, t10, r10, n10, i10) {
        try {
          if ("number" != typeof e10 || !Number.isFinite(e10)) throw al(`${r10} must be a number`, ac, i10);
          if (e10 > 0) return;
          if (t10) {
            if (0 !== e10) throw al(`${r10} must be a non-negative number`, as, i10);
            return;
          }
          throw al(`${r10} must be a positive number`, as, i10);
        } catch (e11) {
          if (n10) throw aE(e11.message, n10, i10);
          throw e11;
        }
      }
      function aP(e10, t10, r10, n10) {
        try {
          if ("string" != typeof e10) throw al(`${t10} must be a string`, ac, n10);
          if (0 === e10.length) throw al(`${t10} must not be empty`, as, n10);
        } catch (e11) {
          if (r10) throw aE(e11.message, r10, n10);
          throw e11;
        }
      }
      async function aO(e10, t10) {
        if (!(e10 instanceof URL) && e10 !== oB) throw al('"expectedIssuerIdentifier" must be an instance of URL', ac);
        if (!ao(t10, Response)) throw al('"response" must be an instance of Response', ac);
        if (200 !== t10.status) throw aE('"response" is not a conform Authorization Server Metadata response (unexpected HTTP status code)', oT, t10);
        oD(t10);
        let r10 = await oK(t10);
        if (aP(r10.issuer, '"response" body "issuer" property', ox, { body: r10 }), e10 !== oB && new URL(r10.issuer).href !== e10.href) throw aE('"response" body "issuer" property does not match the expected value', oI, { expected: e10.href, body: r10, attribute: "issuer" });
        return r10;
      }
      function aI(e10) {
        var t10 = e10, r10 = "application/json";
        if (a6(t10) !== r10) throw function(e11, ...t11) {
          let r11 = '"response" content-type must be ';
          if (t11.length > 2) {
            let e12 = t11.pop();
            r11 += `${t11.join(", ")}, or ${e12}`;
          } else 2 === t11.length ? r11 += `${t11[0]} or ${t11[1]}` : r11 += t11[0];
          return aE(r11, oA, e11);
        }(t10, r10);
      }
      function aN() {
        return aw(crypto.getRandomValues(new Uint8Array(32)));
      }
      async function aU(e10) {
        return aP(e10, "codeVerifier"), aw(await crypto.subtle.digest("SHA-256", ab(e10)));
      }
      function aD(e10) {
        let t10 = e10?.[ad];
        return "number" == typeof t10 && Number.isFinite(t10) ? t10 : 0;
      }
      function aj(e10) {
        let t10 = e10?.[ap];
        return "number" == typeof t10 && Number.isFinite(t10) && -1 !== Math.sign(t10) ? t10 : 30;
      }
      function a$() {
        return Math.floor(Date.now() / 1e3);
      }
      function aL(e10) {
        if ("object" != typeof e10 || null === e10) throw al('"as" must be an object', ac);
        aP(e10.issuer, '"as.issuer"');
      }
      function aM(e10) {
        if ("object" != typeof e10 || null === e10) throw al('"client" must be an object', ac);
        aP(e10.client_id, '"client.client_id"');
      }
      function aH(e10, t10) {
        let r10 = a$() + aD(t10);
        return { jti: aN(), aud: e10.issuer, exp: r10 + 60, iat: r10, nbf: r10, iss: t10.client_id, sub: t10.client_id };
      }
      async function aW(e10, t10, r10) {
        if (!r10.usages.includes("sign")) throw al('CryptoKey instances used for signing assertions must include "sign" in their "usages"', as);
        let n10 = `${aw(ab(JSON.stringify(e10)))}.${aw(ab(JSON.stringify(t10)))}`, i10 = aw(await crypto.subtle.sign(function(e11) {
          switch (e11.algorithm.name) {
            case "ECDSA":
              return { name: e11.algorithm.name, hash: function(e12) {
                let { algorithm: t11 } = e12;
                switch (t11.namedCurve) {
                  case "P-256":
                    return "SHA-256";
                  case "P-384":
                    return "SHA-384";
                  case "P-521":
                    return "SHA-512";
                  default:
                    throw new av("unsupported ECDSA namedCurve", { cause: e12 });
                }
              }(e11) };
            case "RSA-PSS":
              switch (oj(e11), e11.algorithm.hash.name) {
                case "SHA-256":
                case "SHA-384":
                case "SHA-512":
                  return { name: e11.algorithm.name, saltLength: parseInt(e11.algorithm.hash.name.slice(-3), 10) >> 3 };
                default:
                  throw new av("unsupported RSA-PSS hash name", { cause: e11 });
              }
            case "RSASSA-PKCS1-v1_5":
              return oj(e11), e11.algorithm.name;
            case "ML-DSA-44":
            case "ML-DSA-65":
            case "ML-DSA-87":
            case "Ed25519":
              return e11.algorithm.name;
          }
          throw new av("unsupported CryptoKey algorithm name", { cause: e11 });
        }(r10), r10, ab(n10)));
        return `${n10}.${i10}`;
      }
      let aK = URL.parse ? (e10, t10) => URL.parse(e10, t10) : (e10, t10) => {
        try {
          return new URL(e10, t10);
        } catch {
          return null;
        }
      };
      function aB(e10, t10) {
        if (t10 && "https:" !== e10.protocol) throw aE("only requests to HTTPS are allowed", oR, e10);
        if ("https:" !== e10.protocol && "http:" !== e10.protocol) throw aE("only HTTP and HTTPS requests are allowed", oC, e10);
      }
      function aq(e10, t10, r10, n10) {
        let i10;
        if ("string" != typeof e10 || !(i10 = aK(e10))) throw aE(`authorization server metadata does not contain a valid ${r10 ? `"as.mtls_endpoint_aliases.${t10}"` : `"as.${t10}"`}`, void 0 === e10 ? oN : oU, { attribute: r10 ? `mtls_endpoint_aliases.${t10}` : t10 });
        return aB(i10, n10), i10;
      }
      function aJ(e10, t10, r10, n10) {
        return r10 && e10.mtls_endpoint_aliases && t10 in e10.mtls_endpoint_aliases ? aq(e10.mtls_endpoint_aliases[t10], t10, r10, n10) : aq(e10[t10], t10, r10, n10);
      }
      class aV extends Error {
        cause;
        code;
        error;
        status;
        error_description;
        response;
        constructor(e10, t10) {
          super(e10, t10), this.name = this.constructor.name, this.code = ov, this.cause = t10.cause, this.error = t10.cause.error, this.status = t10.response.status, this.error_description = t10.cause.error_description, Object.defineProperty(this, "response", { enumerable: false, value: t10.response }), Error.captureStackTrace?.(this, this.constructor);
        }
      }
      class az extends Error {
        cause;
        code;
        error;
        error_description;
        constructor(e10, t10) {
          super(e10, t10), this.name = this.constructor.name, this.code = oE, this.cause = t10.cause, this.error = t10.cause.get("error"), this.error_description = t10.cause.get("error_description") ?? void 0, Error.captureStackTrace?.(this, this.constructor);
        }
      }
      class aF extends Error {
        cause;
        code;
        response;
        status;
        constructor(e10, t10) {
          super(e10, t10), this.name = this.constructor.name, this.code = ow, this.cause = t10.cause, this.status = t10.response.status, this.response = t10.response, Object.defineProperty(this, "response", { enumerable: false }), Error.captureStackTrace?.(this, this.constructor);
        }
      }
      let aG = "[a-zA-Z0-9!#$%&\\'\\*\\+\\-\\.\\^_`\\|~]+", aX = RegExp("^[,\\s]*(" + aG + ")"), aY = RegExp("^[,\\s]*(" + aG + ')\\s*=\\s*"((?:[^"\\\\]|\\\\[\\s\\S])*)"[,\\s]*(.*)'), aQ = RegExp("^[,\\s]*" + ("(" + aG + ")\\s*=\\s*(") + aG + ")[,\\s]*(.*)"), aZ = RegExp("^([a-zA-Z0-9\\-\\._\\~\\+\\/]+={0,2})(?:$|[,\\s])(.*)");
      async function a0(e10) {
        if (e10.status > 399 && e10.status < 500) {
          oD(e10), aI(e10);
          try {
            let t10 = await e10.clone().json();
            if (aS(t10) && "string" == typeof t10.error && t10.error.length) return t10;
          } catch {
          }
        }
      }
      async function a1(e10, t10, r10) {
        if (e10.status !== t10) {
          let t11;
          if (oi(e10), t11 = await a0(e10)) throw await e10.body?.cancel(), new aV("server responded with an error in the response body", { cause: t11, response: e10 });
          throw aE(`"response" is not a conform ${r10} response (unexpected HTTP status code)`, oT, e10);
        }
      }
      function a2(e10) {
        if (!ol.has(e10)) throw al('"options.DPoP" is not a valid DPoPHandle', as);
      }
      async function a5(e10, t10, r10, n10, i10, a10) {
        if (aP(e10, '"accessToken"'), !(r10 instanceof URL)) throw al('"url" must be an instance of URL', ac);
        aB(r10, a10?.[au] !== true), n10 = ak(n10), a10?.DPoP && (a2(a10.DPoP), await a10.DPoP.addProof(r10, n10, t10.toUpperCase(), e10)), n10.set("authorization", `${n10.has("dpop") ? "DPoP" : "Bearer"} ${e10}`);
        let o10 = await (a10?.[ah] || fetch)(r10.href, { body: i10, headers: Object.fromEntries(n10.entries()), method: t10, redirect: "manual", signal: ax(r10, a10?.signal) });
        return a10?.DPoP?.cacheNonce(o10, r10), o10;
      }
      async function a3(e10, t10, r10, n10) {
        aL(e10), aM(t10);
        let i10 = aJ(e10, "userinfo_endpoint", t10.use_mtls_endpoint_aliases, n10?.[au] !== true), a10 = ak(n10?.headers);
        return t10.userinfo_signed_response_alg ? a10.set("accept", "application/jwt") : (a10.set("accept", "application/json"), a10.append("accept", "application/jwt")), a5(r10, "GET", i10, a10, null, { ...n10, [ad]: aD(t10) });
      }
      let a8 = Symbol();
      function a6(e10) {
        return e10.headers.get("content-type")?.split(";")[0];
      }
      async function a4(e10, t10, r10, n10, i10) {
        let a10;
        if (aL(e10), aM(t10), !ao(n10, Response)) throw al('"response" must be an instance of Response', ac);
        if (oi(n10), 200 !== n10.status) throw aE('"response" is not a conform UserInfo Endpoint response (unexpected HTTP status code)', oT, n10);
        if (oD(n10), "application/jwt" === a6(n10)) {
          let { claims: r11, jwt: o10 } = await o$(await n10.text(), oL.bind(void 0, t10.userinfo_signed_response_alg, e10.userinfo_signing_alg_values_supported, void 0), aD(t10), aj(t10), i10?.[ag]).then(oa.bind(void 0, t10.client_id)).then(os.bind(void 0, e10));
          ot.set(n10, o10), a10 = r11;
        } else {
          if (t10.userinfo_signed_response_alg) throw aE("JWT UserInfo Response expected", oS, n10);
          a10 = await oK(n10);
        }
        if (aP(a10.sub, '"response" body "sub" property', ox, { body: a10 }), r10 === a8) ;
        else if (aP(r10, '"expectedSubject"'), a10.sub !== r10) throw aE('unexpected "response" body "sub" property value', oI, { expected: r10, body: a10, attribute: "sub" });
        return a10;
      }
      async function a9(e10, t10, r10, n10, i10, a10, o10) {
        return await r10(e10, t10, i10, a10), a10.set("content-type", "application/x-www-form-urlencoded;charset=UTF-8"), (o10?.[ah] || fetch)(n10.href, { body: i10, headers: Object.fromEntries(a10.entries()), method: "POST", redirect: "manual", signal: ax(n10, o10?.signal) });
      }
      async function a7(e10, t10, r10, n10, i10, a10) {
        let o10 = aJ(e10, "token_endpoint", t10.use_mtls_endpoint_aliases, a10?.[au] !== true);
        i10.set("grant_type", n10);
        let s2 = ak(a10?.headers);
        s2.set("accept", "application/json"), a10?.DPoP !== void 0 && (a2(a10.DPoP), await a10.DPoP.addProof(o10, s2, "POST"));
        let c2 = await a9(e10, t10, r10, o10, i10, s2, a10);
        return a10?.DPoP?.cacheNonce(c2, o10), c2;
      }
      let oe = /* @__PURE__ */ new WeakMap(), ot = /* @__PURE__ */ new WeakMap();
      function or(e10) {
        if (!e10.id_token) return;
        let t10 = oe.get(e10);
        if (!t10) throw al('"ref" was already garbage collected or did not resolve from the proper sources', as);
        return t10;
      }
      async function on(e10, t10, r10, n10, i10, a10) {
        if (aL(e10), aM(t10), !ao(r10, Response)) throw al('"response" must be an instance of Response', ac);
        await a1(r10, 200, "Token Endpoint"), oD(r10);
        let o10 = await oK(r10);
        if (aP(o10.access_token, '"response" body "access_token" property', ox, { body: o10 }), aP(o10.token_type, '"response" body "token_type" property', ox, { body: o10 }), o10.token_type = o10.token_type.toLowerCase(), void 0 !== o10.expires_in) {
          let e11 = "number" != typeof o10.expires_in ? parseFloat(o10.expires_in) : o10.expires_in;
          aC(e11, true, '"response" body "expires_in" property', ox, { body: o10 }), o10.expires_in = e11;
        }
        if (void 0 !== o10.refresh_token && aP(o10.refresh_token, '"response" body "refresh_token" property', ox, { body: o10 }), void 0 !== o10.scope && "string" != typeof o10.scope) throw aE('"response" body "scope" property must be a string', ox, { body: o10 });
        if (void 0 !== o10.id_token) {
          aP(o10.id_token, '"response" body "id_token" property', ox, { body: o10 });
          let a11 = ["aud", "exp", "iat", "iss", "sub"];
          true === t10.require_auth_time && a11.push("auth_time"), void 0 !== t10.default_max_age && (aC(t10.default_max_age, true, '"client.default_max_age"'), a11.push("auth_time")), n10?.length && a11.push(...n10);
          let { claims: s2, jwt: c2 } = await o$(o10.id_token, oL.bind(void 0, t10.id_token_signed_response_alg, e10.id_token_signing_alg_values_supported, "RS256"), aD(t10), aj(t10), i10).then(oh.bind(void 0, a11)).then(oc.bind(void 0, e10)).then(oo.bind(void 0, t10.client_id));
          if (Array.isArray(s2.aud) && 1 !== s2.aud.length) {
            if (void 0 === s2.azp) throw aE('ID Token "aud" (audience) claim includes additional untrusted audiences', oO, { claims: s2, claim: "aud" });
            if (s2.azp !== t10.client_id) throw aE('unexpected ID Token "azp" (authorized party) claim value', oO, { expected: t10.client_id, claims: s2, claim: "azp" });
          }
          void 0 !== s2.auth_time && aC(s2.auth_time, true, 'ID Token "auth_time" (authentication time)', ox, { claims: s2 }), ot.set(r10, c2), oe.set(o10, s2);
        }
        if (a10?.[o10.token_type] !== void 0) a10[o10.token_type](r10, o10);
        else if ("dpop" !== o10.token_type && "bearer" !== o10.token_type) throw new av("unsupported `token_type` value", { cause: { body: o10 } });
        return o10;
      }
      function oi(e10) {
        let t10;
        if (t10 = function(e11) {
          if (!ao(e11, Response)) throw al('"response" must be an instance of Response', ac);
          let t11 = e11.headers.get("www-authenticate");
          if (null === t11) return;
          let r10 = [], n10 = t11;
          for (; n10; ) {
            let e12, t12 = n10.match(aX), i10 = t12?.["1"].toLowerCase();
            if (!i10) return;
            let a10 = n10.substring(t12[0].length);
            if (a10 && !a10.match(/^[\s,]/)) return;
            let o10 = a10.match(/^\s+(.*)$/), s2 = !!o10;
            n10 = o10 ? o10[1] : void 0;
            let c2 = {};
            if (s2) for (; n10; ) {
              let r11, i11;
              if (t12 = n10.match(aY)) {
                if ([, r11, i11, n10] = t12, i11.includes("\\")) try {
                  i11 = JSON.parse(`"${i11}"`);
                } catch {
                }
                c2[r11.toLowerCase()] = i11;
                continue;
              }
              if (t12 = n10.match(aQ)) {
                [, r11, i11, n10] = t12, c2[r11.toLowerCase()] = i11;
                continue;
              }
              if (t12 = n10.match(aZ)) {
                if (Object.keys(c2).length) break;
                [, e12, n10] = t12;
                break;
              }
              return;
            }
            else n10 = a10 || void 0;
            let l2 = { scheme: i10, parameters: c2 };
            e12 && (l2.token68 = e12), r10.push(l2);
          }
          if (r10.length) return r10;
        }(e10)) throw new aF("server responded with a challenge in the WWW-Authenticate HTTP Header", { cause: t10, response: e10 });
      }
      function oa(e10, t10) {
        return void 0 !== t10.claims.aud ? oo(e10, t10) : t10;
      }
      function oo(e10, t10) {
        if (Array.isArray(t10.claims.aud)) {
          if (!t10.claims.aud.includes(e10)) throw aE('unexpected JWT "aud" (audience) claim value', oO, { expected: e10, claims: t10.claims, claim: "aud" });
        } else if (t10.claims.aud !== e10) throw aE('unexpected JWT "aud" (audience) claim value', oO, { expected: e10, claims: t10.claims, claim: "aud" });
        return t10;
      }
      function os(e10, t10) {
        return void 0 !== t10.claims.iss ? oc(e10, t10) : t10;
      }
      function oc(e10, t10) {
        let r10 = e10[oq]?.(t10) ?? e10.issuer;
        if (t10.claims.iss !== r10) throw aE('unexpected JWT "iss" (issuer) claim value', oO, { expected: r10, claims: t10.claims, claim: "iss" });
        return t10;
      }
      let ol = /* @__PURE__ */ new WeakSet(), ou = Symbol();
      async function od(e10, t10, r10, n10, i10, a10, o10) {
        if (aL(e10), aM(t10), !ol.has(n10)) throw al('"callbackParameters" must be an instance of URLSearchParams obtained from "validateAuthResponse()", or "validateJwtAuthResponse()', as);
        aP(i10, '"redirectUri"');
        let s2 = oM(n10, "code");
        if (!s2) throw aE('no authorization code in "callbackParameters"', ox);
        let c2 = new URLSearchParams(o10?.additionalParameters);
        return c2.set("redirect_uri", i10), c2.set("code", s2), a10 !== ou && (aP(a10, '"codeVerifier"'), c2.set("code_verifier", a10)), a7(e10, t10, r10, "authorization_code", c2, o10);
      }
      let op = { aud: "audience", c_hash: "code hash", client_id: "client id", exp: "expiration time", iat: "issued at", iss: "issuer", jti: "jwt id", nonce: "nonce", s_hash: "state hash", sub: "subject", ath: "access token hash", htm: "http method", htu: "http uri", cnf: "confirmation", auth_time: "authentication time" };
      function oh(e10, t10) {
        for (let r10 of e10) if (void 0 === t10.claims[r10]) throw aE(`JWT "${r10}" (${op[r10]}) claim missing`, ox, { claims: t10.claims });
        return t10;
      }
      let of = Symbol(), og = Symbol();
      async function om(e10, t10, r10, n10) {
        return "string" == typeof n10?.expectedNonce || "number" == typeof n10?.maxAge || n10?.requireIdToken ? oy(e10, t10, r10, n10.expectedNonce, n10.maxAge, n10[ag], n10.recognizedTokenTypes) : ob(e10, t10, r10, n10?.[ag], n10?.recognizedTokenTypes);
      }
      async function oy(e10, t10, r10, n10, i10, a10, o10) {
        let s2 = [];
        switch (n10) {
          case void 0:
            n10 = of;
            break;
          case of:
            break;
          default:
            aP(n10, '"expectedNonce" argument'), s2.push("nonce");
        }
        switch (i10 ??= t10.default_max_age) {
          case void 0:
            i10 = og;
            break;
          case og:
            break;
          default:
            aC(i10, true, '"maxAge" argument'), s2.push("auth_time");
        }
        let c2 = await on(e10, t10, r10, s2, a10, o10);
        aP(c2.id_token, '"response" body "id_token" property', ox, { body: c2 });
        let l2 = or(c2);
        if (i10 !== og) {
          let e11 = a$() + aD(t10), r11 = aj(t10);
          if (l2.auth_time + i10 < e11 - r11) throw aE("too much time has elapsed since the last End-User authentication", oP, { claims: l2, now: e11, tolerance: r11, claim: "auth_time" });
        }
        if (n10 === of) {
          if (void 0 !== l2.nonce) throw aE('unexpected ID Token "nonce" claim value', oO, { expected: void 0, claims: l2, claim: "nonce" });
        } else if (l2.nonce !== n10) throw aE('unexpected ID Token "nonce" claim value', oO, { expected: n10, claims: l2, claim: "nonce" });
        return c2;
      }
      async function ob(e10, t10, r10, n10, i10) {
        let a10 = await on(e10, t10, r10, void 0, n10, i10), o10 = or(a10);
        if (o10) {
          if (void 0 !== t10.default_max_age) {
            aC(t10.default_max_age, true, '"client.default_max_age"');
            let e11 = a$() + aD(t10), r11 = aj(t10);
            if (o10.auth_time + t10.default_max_age < e11 - r11) throw aE("too much time has elapsed since the last End-User authentication", oP, { claims: o10, now: e11, tolerance: r11, claim: "auth_time" });
          }
          if (void 0 !== o10.nonce) throw aE('unexpected ID Token "nonce" claim value', oO, { expected: void 0, claims: o10, claim: "nonce" });
        }
        return a10;
      }
      let ow = "OAUTH_WWW_AUTHENTICATE_CHALLENGE", ov = "OAUTH_RESPONSE_BODY_ERROR", o_ = "OAUTH_UNSUPPORTED_OPERATION", oE = "OAUTH_AUTHORIZATION_RESPONSE_ERROR", oS = "OAUTH_JWT_USERINFO_EXPECTED", ok = "OAUTH_PARSE_ERROR", ox = "OAUTH_INVALID_RESPONSE", oA = "OAUTH_RESPONSE_IS_NOT_JSON", oT = "OAUTH_RESPONSE_IS_NOT_CONFORM", oR = "OAUTH_HTTP_REQUEST_FORBIDDEN", oC = "OAUTH_REQUEST_PROTOCOL_FORBIDDEN", oP = "OAUTH_JWT_TIMESTAMP_CHECK_FAILED", oO = "OAUTH_JWT_CLAIM_COMPARISON_FAILED", oI = "OAUTH_JSON_ATTRIBUTE_COMPARISON_FAILED", oN = "OAUTH_MISSING_SERVER_METADATA", oU = "OAUTH_INVALID_SERVER_METADATA";
      function oD(e10) {
        if (e10.bodyUsed) throw al('"response" body has been used already', as);
      }
      function oj(e10) {
        let { algorithm: t10 } = e10;
        if ("number" != typeof t10.modulusLength || t10.modulusLength < 2048) throw new av(`unsupported ${t10.name} modulusLength`, { cause: e10 });
      }
      async function o$(e10, t10, r10, n10, i10) {
        let a10, o10, { 0: s2, 1: c2, length: l2 } = e10.split(".");
        if (5 === l2) if (void 0 !== i10) e10 = await i10(e10), { 0: s2, 1: c2, length: l2 } = e10.split(".");
        else throw new av("JWE decryption is not configured", { cause: e10 });
        if (3 !== l2) throw aE("Invalid JWT", ox, e10);
        try {
          a10 = JSON.parse(ab(aw(s2)));
        } catch (e11) {
          throw aE("failed to parse JWT Header body as base64url encoded JSON", ok, e11);
        }
        if (!aS(a10)) throw aE("JWT Header must be a top level object", ox, e10);
        if (t10(a10), void 0 !== a10.crit) throw new av('no JWT "crit" header parameter extensions are supported', { cause: { header: a10 } });
        try {
          o10 = JSON.parse(ab(aw(c2)));
        } catch (e11) {
          throw aE("failed to parse JWT Payload body as base64url encoded JSON", ok, e11);
        }
        if (!aS(o10)) throw aE("JWT Payload must be a top level object", ox, e10);
        let u2 = a$() + r10;
        if (void 0 !== o10.exp) {
          if ("number" != typeof o10.exp) throw aE('unexpected JWT "exp" (expiration time) claim type', ox, { claims: o10 });
          if (o10.exp <= u2 - n10) throw aE('unexpected JWT "exp" (expiration time) claim value, expiration is past current timestamp', oP, { claims: o10, now: u2, tolerance: n10, claim: "exp" });
        }
        if (void 0 !== o10.iat && "number" != typeof o10.iat) throw aE('unexpected JWT "iat" (issued at) claim type', ox, { claims: o10 });
        if (void 0 !== o10.iss && "string" != typeof o10.iss) throw aE('unexpected JWT "iss" (issuer) claim type', ox, { claims: o10 });
        if (void 0 !== o10.nbf) {
          if ("number" != typeof o10.nbf) throw aE('unexpected JWT "nbf" (not before) claim type', ox, { claims: o10 });
          if (o10.nbf > u2 + n10) throw aE('unexpected JWT "nbf" (not before) claim value', oP, { claims: o10, now: u2, tolerance: n10, claim: "nbf" });
        }
        if (void 0 !== o10.aud && "string" != typeof o10.aud && !Array.isArray(o10.aud)) throw aE('unexpected JWT "aud" (audience) claim type', ox, { claims: o10 });
        return { header: a10, claims: o10, jwt: e10 };
      }
      function oL(e10, t10, r10, n10) {
        if (void 0 !== e10) {
          if ("string" == typeof e10 ? n10.alg !== e10 : !e10.includes(n10.alg)) throw aE('unexpected JWT "alg" header parameter', ox, { header: n10, expected: e10, reason: "client configuration" });
          return;
        }
        if (Array.isArray(t10)) {
          if (!t10.includes(n10.alg)) throw aE('unexpected JWT "alg" header parameter', ox, { header: n10, expected: t10, reason: "authorization server metadata" });
          return;
        }
        if (void 0 !== r10) {
          if ("string" == typeof r10 ? n10.alg !== r10 : "function" == typeof r10 ? !r10(n10.alg) : !r10.includes(n10.alg)) throw aE('unexpected JWT "alg" header parameter', ox, { header: n10, expected: r10, reason: "default value" });
          return;
        }
        throw aE('missing client or server configuration to verify used JWT "alg" header parameter', void 0, { client: e10, issuer: t10, fallback: r10 });
      }
      function oM(e10, t10) {
        let { 0: r10, length: n10 } = e10.getAll(t10);
        if (n10 > 1) throw aE(`"${t10}" parameter must be provided only once`, ox);
        return r10;
      }
      let oH = Symbol(), oW = Symbol();
      async function oK(e10, t10 = aI) {
        let r10;
        try {
          r10 = await e10.json();
        } catch (r11) {
          throw t10(e10), aE('failed to parse "response" body as JSON', ok, r11);
        }
        if (!aS(r10)) throw aE('"response" body must be a top level object', ox, { body: r10 });
        return r10;
      }
      let oB = Symbol(), oq = Symbol();
      async function oJ(e10, t10, r10) {
        let { cookies: n10, logger: i10 } = r10, a10 = n10[e10], o10 = /* @__PURE__ */ new Date();
        o10.setTime(o10.getTime() + 9e5), i10.debug(`CREATE_${e10.toUpperCase()}`, { name: a10.name, payload: t10, COOKIE_TTL: 900, expires: o10 });
        let s2 = await nS({ ...r10.jwt, maxAge: 900, token: { value: t10 }, salt: a10.name }), c2 = { ...a10.options, expires: o10 };
        return { name: a10.name, value: s2, options: c2 };
      }
      async function oV(e10, t10, r10) {
        try {
          let { logger: n10, cookies: i10, jwt: a10 } = r10;
          if (n10.debug(`PARSE_${e10.toUpperCase()}`, { cookie: t10 }), !t10) throw new th(`${e10} cookie was missing`);
          let o10 = await nk({ ...a10, token: t10, salt: i10[e10].name });
          if (o10?.value) return o10.value;
          throw Error("Invalid cookie");
        } catch (t11) {
          throw new th(`${e10} value could not be parsed`, { cause: t11 });
        }
      }
      function oz(e10, t10, r10) {
        let { logger: n10, cookies: i10 } = t10, a10 = i10[e10];
        n10.debug(`CLEAR_${e10.toUpperCase()}`, { cookie: a10 }), r10.push({ name: a10.name, value: "", options: { ...i10[e10].options, maxAge: 0 } });
      }
      function oF(e10, t10) {
        return async function(r10, n10, i10) {
          let { provider: a10, logger: o10 } = i10;
          if (!a10?.checks?.includes(e10)) return;
          let s2 = r10?.[i10.cookies[t10].name];
          o10.debug(`USE_${t10.toUpperCase()}`, { value: s2 });
          let c2 = await oV(t10, s2, i10);
          return oz(t10, i10, n10), c2;
        };
      }
      let oG = { async create(e10) {
        let t10 = aN(), r10 = await aU(t10);
        return { cookie: await oJ("pkceCodeVerifier", t10, e10), value: r10 };
      }, use: oF("pkce", "pkceCodeVerifier") }, oX = "encodedState", oY = { async create(e10, t10) {
        let { provider: r10 } = e10;
        if (!r10.checks.includes("state")) {
          if (t10) throw new th("State data was provided but the provider is not configured to use state");
          return;
        }
        let n10 = { origin: t10, random: aN() }, i10 = await nS({ secret: e10.jwt.secret, token: n10, salt: oX, maxAge: 900 });
        return { cookie: await oJ("state", i10, e10), value: i10 };
      }, use: oF("state", "state"), async decode(e10, t10) {
        try {
          t10.logger.debug("DECODE_STATE", { state: e10 });
          let r10 = await nk({ secret: t10.jwt.secret, token: e10, salt: oX });
          if (r10) return r10;
          throw Error("Invalid state");
        } catch (e11) {
          throw new th("State could not be decoded", { cause: e11 });
        }
      } }, oQ = { async create(e10) {
        if (!e10.provider.checks.includes("nonce")) return;
        let t10 = aN();
        return { cookie: await oJ("nonce", t10, e10), value: t10 };
      }, use: oF("nonce", "nonce") }, oZ = "encodedWebauthnChallenge", o0 = { create: async (e10, t10, r10) => ({ cookie: await oJ("webauthnChallenge", await nS({ secret: e10.jwt.secret, token: { challenge: t10, registerData: r10 }, salt: oZ, maxAge: 900 }), e10) }), async use(e10, t10, r10) {
        let n10 = t10?.[e10.cookies.webauthnChallenge.name], i10 = await oV("webauthnChallenge", n10, e10), a10 = await nk({ secret: e10.jwt.secret, token: i10, salt: oZ });
        if (oz("webauthnChallenge", e10, r10), !a10) throw new th("WebAuthn challenge was missing");
        return a10;
      } };
      function o1(e10) {
        return encodeURIComponent(e10).replace(/%20/g, "+");
      }
      async function o2(e10, t10, r10) {
        var n10, i10;
        let a10, o10, s2, c2, l2, { logger: u2, provider: d2 } = r10, { token: p2, userinfo: h2 } = d2;
        if (p2?.url && "authjs.dev" !== p2.url.host || h2?.url && "authjs.dev" !== h2.url.host) a10 = { issuer: d2.issuer ?? "https://authjs.dev", token_endpoint: p2?.url.toString(), userinfo_endpoint: h2?.url.toString() };
        else {
          let e11 = new URL(d2.issuer), t11 = await aR(e11, { [au]: true, [ah]: d2[nJ] });
          if (!(a10 = await aO(e11, t11)).token_endpoint) throw TypeError("TODO: Authorization server did not provide a token endpoint.");
          if (!a10.userinfo_endpoint) throw TypeError("TODO: Authorization server did not provide a userinfo endpoint.");
        }
        let f2 = { client_id: d2.clientId, ...d2.client };
        switch (f2.token_endpoint_auth_method) {
          case void 0:
          case "client_secret_basic":
            o10 = (e11, t11, r11, n11) => {
              var i11, a11;
              let o11, s3, c3;
              n11.set("authorization", (i11 = d2.clientId, a11 = d2.clientSecret, o11 = o1(i11), s3 = o1(a11), c3 = btoa(`${o11}:${s3}`), `Basic ${c3}`));
            };
            break;
          case "client_secret_post":
            aP(n10 = d2.clientSecret, '"clientSecret"'), o10 = (e11, t11, r11, i11) => {
              r11.set("client_id", t11.client_id), r11.set("client_secret", n10);
            };
            break;
          case "client_secret_jwt":
            aP(i10 = d2.clientSecret, '"clientSecret"'), l2 = void 0, o10 = async (e11, t11, r11, n11) => {
              c2 ||= await crypto.subtle.importKey("raw", ab(i10), { hash: "SHA-256", name: "HMAC" }, false, ["sign"]);
              let a11 = { alg: "HS256" }, o11 = aH(e11, t11);
              l2?.(a11, o11);
              let s3 = `${aw(ab(JSON.stringify(a11)))}.${aw(ab(JSON.stringify(o11)))}`, u3 = await crypto.subtle.sign(c2.algorithm, c2, ab(s3));
              r11.set("client_id", t11.client_id), r11.set("client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer"), r11.set("client_assertion", `${s3}.${aw(new Uint8Array(u3))}`);
            };
            break;
          case "private_key_jwt":
            o10 = function(e11, t11) {
              let { key: r11, kid: n11 } = e11 instanceof CryptoKey ? { key: e11 } : e11?.key instanceof CryptoKey ? (void 0 !== e11.kid && aP(e11.kid, '"kid"'), { key: e11.key, kid: e11.kid }) : {};
              var i11 = '"clientPrivateKey.key"';
              if (!(r11 instanceof CryptoKey)) throw al(`${i11} must be a CryptoKey`, ac);
              if ("private" !== r11.type) throw al(`${i11} must be a private CryptoKey`, as);
              return async (e12, i12, a11, o11) => {
                let s3 = { alg: function(e13) {
                  switch (e13.algorithm.name) {
                    case "RSA-PSS":
                      switch (e13.algorithm.hash.name) {
                        case "SHA-256":
                          return "PS256";
                        case "SHA-384":
                          return "PS384";
                        case "SHA-512":
                          return "PS512";
                        default:
                          throw new av("unsupported RsaHashedKeyAlgorithm hash name", { cause: e13 });
                      }
                    case "RSASSA-PKCS1-v1_5":
                      switch (e13.algorithm.hash.name) {
                        case "SHA-256":
                          return "RS256";
                        case "SHA-384":
                          return "RS384";
                        case "SHA-512":
                          return "RS512";
                        default:
                          throw new av("unsupported RsaHashedKeyAlgorithm hash name", { cause: e13 });
                      }
                    case "ECDSA":
                      switch (e13.algorithm.namedCurve) {
                        case "P-256":
                          return "ES256";
                        case "P-384":
                          return "ES384";
                        case "P-521":
                          return "ES512";
                        default:
                          throw new av("unsupported EcKeyAlgorithm namedCurve", { cause: e13 });
                      }
                    case "Ed25519":
                    case "ML-DSA-44":
                    case "ML-DSA-65":
                    case "ML-DSA-87":
                      return e13.algorithm.name;
                    case "EdDSA":
                      return "Ed25519";
                    default:
                      throw new av("unsupported CryptoKey algorithm name", { cause: e13 });
                  }
                }(r11), kid: n11 }, c3 = aH(e12, i12);
                t11?.[af]?.(s3, c3), a11.set("client_id", i12.client_id), a11.set("client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer"), a11.set("client_assertion", await aW(s3, c3, r11));
              };
            }(d2.token.clientPrivateKey, { [af](e11, t11) {
              t11.aud = [a10.issuer, a10.token_endpoint];
            } });
            break;
          case "none":
            o10 = (e11, t11, r11, n11) => {
              r11.set("client_id", t11.client_id);
            };
            break;
          default:
            throw Error("unsupported client authentication method");
        }
        let g2 = [], m2 = await oY.use(t10, g2, r10);
        try {
          s2 = function(e11, t11, r11, n11) {
            var i11;
            if (aL(e11), aM(t11), r11 instanceof URL && (r11 = r11.searchParams), !(r11 instanceof URLSearchParams)) throw al('"parameters" must be an instance of URLSearchParams, or URL', ac);
            if (oM(r11, "response")) throw aE('"parameters" contains a JARM response, use validateJwtAuthResponse() instead of validateAuthResponse()', ox, { parameters: r11 });
            let a11 = oM(r11, "iss"), o11 = oM(r11, "state");
            if (!a11 && e11.authorization_response_iss_parameter_supported) throw aE('response parameter "iss" (issuer) missing', ox, { parameters: r11 });
            if (a11 && a11 !== e11.issuer) throw aE('unexpected "iss" (issuer) response parameter value', ox, { expected: e11.issuer, parameters: r11 });
            switch (n11) {
              case void 0:
              case oW:
                if (void 0 !== o11) throw aE('unexpected "state" response parameter encountered', ox, { expected: void 0, parameters: r11 });
                break;
              case oH:
                break;
              default:
                if (aP(n11, '"expectedState" argument'), o11 !== n11) throw aE(void 0 === o11 ? 'response parameter "state" missing' : 'unexpected "state" response parameter value', ox, { expected: n11, parameters: r11 });
            }
            if (oM(r11, "error")) throw new az("authorization response from the server is an error", { cause: r11 });
            let s3 = oM(r11, "id_token"), c3 = oM(r11, "token");
            if (void 0 !== s3 || void 0 !== c3) throw new av("implicit and hybrid flows are not supported");
            return i11 = new URLSearchParams(r11), ol.add(i11), i11;
          }(a10, f2, new URLSearchParams(e10), d2.checks.includes("state") ? m2 : oH);
        } catch (e11) {
          if (e11 instanceof az) {
            let t11 = { providerId: d2.id, ...Object.fromEntries(e11.cause.entries()) };
            throw u2.debug("OAuthCallbackError", t11), new tv("OAuth Provider returned an error", t11);
          }
          throw e11;
        }
        let y2 = await oG.use(t10, g2, r10), b2 = d2.callbackUrl;
        !r10.isOnRedirectProxy && d2.redirectProxyUrl && (b2 = d2.redirectProxyUrl);
        let w2 = await od(a10, f2, o10, s2, b2, y2 ?? "decoy", { [au]: true, [ah]: (...e11) => (d2.checks.includes("pkce") || e11[1].body.delete("code_verifier"), (d2[nJ] ?? fetch)(...e11)) });
        d2.token?.conform && (w2 = await d2.token.conform(w2.clone()) ?? w2);
        let v2 = {}, _2 = "oidc" === d2.type;
        if (d2[nV]) switch (d2.id) {
          case "microsoft-entra-id":
          case "azure-ad": {
            let e11 = await w2.clone().json();
            if (e11.error) {
              let t12 = { providerId: d2.id, ...e11 };
              throw new tv(`OAuth Provider returned an error: ${e11.error}`, t12);
            }
            let { tid: t11 } = function(e12) {
              let t12, r11;
              if ("string" != typeof e12) throw new re("JWTs must use Compact JWS serialization, JWT must be a string");
              let { 1: n11, length: i11 } = e12.split(".");
              if (5 === i11) throw new re("Only JWTs using Compact JWS serialization can be decoded");
              if (3 !== i11) throw new re("Invalid JWT");
              if (!n11) throw new re("JWTs must contain a payload");
              try {
                t12 = t0(n11);
              } catch {
                throw new re("Failed to base64url decode the payload");
              }
              try {
                r11 = JSON.parse(tF.decode(t12));
              } catch {
                throw new re("Failed to parse the decoded payload as JSON");
              }
              if (!rU(r11)) throw new re("Invalid JWT Claims Set");
              return r11;
            }(e11.id_token);
            if ("string" == typeof t11) {
              let e12 = a10.issuer?.match(/microsoftonline\.com\/(\w+)\/v2\.0/)?.[1] ?? "common", r11 = new URL(a10.issuer.replace(e12, t11)), n11 = await aR(r11, { [ah]: d2[nJ] });
              a10 = await aO(r11, n11);
            }
          }
        }
        let E2 = await om(a10, f2, w2, { expectedNonce: await oQ.use(t10, g2, r10), requireIdToken: _2 });
        if (_2) {
          let t11 = or(E2);
          if (v2 = t11, d2[nV] && "apple" === d2.id) try {
            v2.user = JSON.parse(e10?.user);
          } catch {
          }
          if (false === d2.idToken) {
            let e11 = await a3(a10, f2, E2.access_token, { [ah]: d2[nJ], [au]: true });
            v2 = await a4(a10, f2, t11.sub, e11);
          }
        } else if (h2?.request) {
          let e11 = await h2.request({ tokens: E2, provider: d2 });
          e11 instanceof Object && (v2 = e11);
        } else if (h2?.url) {
          let e11 = await a3(a10, f2, E2.access_token, { [ah]: d2[nJ], [au]: true });
          v2 = await e11.json();
        } else throw TypeError("No userinfo endpoint configured");
        return E2.expires_in && (E2.expires_at = Math.floor(Date.now() / 1e3) + Number(E2.expires_in)), { ...await o5(v2, d2, E2, u2), profile: v2, cookies: g2 };
      }
      async function o5(e10, t10, r10, n10) {
        try {
          let n11 = await t10.profile(e10, r10);
          return { user: { ...n11, id: crypto.randomUUID(), email: n11.email?.toLowerCase() }, account: { ...r10, provider: t10.id, type: t10.type, providerAccountId: n11.id ?? crypto.randomUUID() } };
        } catch (r11) {
          n10.debug("getProfile error details", e10), n10.error(new t_(r11, { provider: t10.id }));
        }
      }
      async function o3(e10, t10, r10, n10) {
        let i10 = await o7(e10, t10, r10), { cookie: a10 } = await o0.create(e10, i10.challenge, r10);
        return { status: 200, cookies: [...n10 ?? [], a10], body: { action: "register", options: i10 }, headers: { "Content-Type": "application/json" } };
      }
      async function o8(e10, t10, r10, n10) {
        let i10 = await o9(e10, t10, r10), { cookie: a10 } = await o0.create(e10, i10.challenge);
        return { status: 200, cookies: [...n10 ?? [], a10], body: { action: "authenticate", options: i10 }, headers: { "Content-Type": "application/json" } };
      }
      async function o6(e10, t10, r10) {
        let n10, { adapter: i10, provider: a10 } = e10, o10 = t10.body && "string" == typeof t10.body.data ? JSON.parse(t10.body.data) : void 0;
        if (!o10 || "object" != typeof o10 || !("id" in o10) || "string" != typeof o10.id) throw new tn("Invalid WebAuthn Authentication response");
        let s2 = sr(st(o10.id)), c2 = await i10.getAuthenticator(s2);
        if (!c2) throw new tn(`WebAuthn authenticator not found in database: ${JSON.stringify({ credentialID: s2 })}`);
        let { challenge: l2 } = await o0.use(e10, t10.cookies, r10);
        try {
          var u2;
          let r11 = a10.getRelayingParty(e10, t10);
          n10 = await a10.simpleWebAuthn.verifyAuthenticationResponse({ ...a10.verifyAuthenticationOptions, expectedChallenge: l2, response: o10, authenticator: { ...u2 = c2, credentialDeviceType: u2.credentialDeviceType, transports: sn(u2.transports), credentialID: st(u2.credentialID), credentialPublicKey: st(u2.credentialPublicKey) }, expectedOrigin: r11.origin, expectedRPID: r11.id });
        } catch (e11) {
          throw new tN(e11);
        }
        let { verified: d2, authenticationInfo: p2 } = n10;
        if (!d2) throw new tN("WebAuthn authentication response could not be verified");
        try {
          let { newCounter: e11 } = p2;
          await i10.updateAuthenticatorCounter(c2.credentialID, e11);
        } catch (e11) {
          throw new ta(`Failed to update authenticator counter. This may cause future authentication attempts to fail. ${JSON.stringify({ credentialID: s2, oldCounter: c2.counter, newCounter: p2.newCounter })}`, e11);
        }
        let h2 = await i10.getAccount(c2.providerAccountId, a10.id);
        if (!h2) throw new tn(`WebAuthn account not found in database: ${JSON.stringify({ credentialID: s2, providerAccountId: c2.providerAccountId })}`);
        let f2 = await i10.getUser(h2.userId);
        if (!f2) throw new tn(`WebAuthn user not found in database: ${JSON.stringify({ credentialID: s2, providerAccountId: c2.providerAccountId, userID: h2.userId })}`);
        return { account: h2, user: f2 };
      }
      async function o4(e10, t10, r10) {
        var n10;
        let i10, { provider: a10 } = e10, o10 = t10.body && "string" == typeof t10.body.data ? JSON.parse(t10.body.data) : void 0;
        if (!o10 || "object" != typeof o10 || !("id" in o10) || "string" != typeof o10.id) throw new tn("Invalid WebAuthn Registration response");
        let { challenge: s2, registerData: c2 } = await o0.use(e10, t10.cookies, r10);
        if (!c2) throw new tn("Missing user registration data in WebAuthn challenge cookie");
        try {
          let r11 = a10.getRelayingParty(e10, t10);
          i10 = await a10.simpleWebAuthn.verifyRegistrationResponse({ ...a10.verifyRegistrationOptions, expectedChallenge: s2, response: o10, expectedOrigin: r11.origin, expectedRPID: r11.id });
        } catch (e11) {
          throw new tN(e11);
        }
        if (!i10.verified || !i10.registrationInfo) throw new tN("WebAuthn registration response could not be verified");
        let l2 = { providerAccountId: sr(i10.registrationInfo.credentialID), provider: e10.provider.id, type: a10.type }, u2 = { providerAccountId: l2.providerAccountId, counter: i10.registrationInfo.counter, credentialID: sr(i10.registrationInfo.credentialID), credentialPublicKey: sr(i10.registrationInfo.credentialPublicKey), credentialBackedUp: i10.registrationInfo.credentialBackedUp, credentialDeviceType: i10.registrationInfo.credentialDeviceType, transports: (n10 = o10.response.transports, n10?.join(",")) };
        return { user: c2, account: l2, authenticator: u2 };
      }
      async function o9(e10, t10, r10) {
        let { provider: n10, adapter: i10 } = e10, a10 = r10 && r10.id ? await i10.listAuthenticatorsByUserId(r10.id) : null, o10 = n10.getRelayingParty(e10, t10);
        return await n10.simpleWebAuthn.generateAuthenticationOptions({ ...n10.authenticationOptions, rpID: o10.id, allowCredentials: a10?.map((e11) => ({ id: st(e11.credentialID), type: "public-key", transports: sn(e11.transports) })) });
      }
      async function o7(e10, t10, r10) {
        let { provider: n10, adapter: i10 } = e10, a10 = r10.id ? await i10.listAuthenticatorsByUserId(r10.id) : null, o10 = nL(32), s2 = n10.getRelayingParty(e10, t10);
        return await n10.simpleWebAuthn.generateRegistrationOptions({ ...n10.registrationOptions, userID: o10, userName: r10.email, userDisplayName: r10.name ?? void 0, rpID: s2.id, rpName: s2.name, excludeCredentials: a10?.map((e11) => ({ id: st(e11.credentialID), type: "public-key", transports: sn(e11.transports) })) });
      }
      function se(e10) {
        let { provider: t10, adapter: r10 } = e10;
        if (!r10) throw new tg("An adapter is required for the WebAuthn provider");
        if (!t10 || "webauthn" !== t10.type) throw new tA("Provider must be WebAuthn");
        return { ...e10, provider: t10, adapter: r10 };
      }
      function st(e10) {
        return new Uint8Array(eH.Buffer.from(e10, "base64"));
      }
      function sr(e10) {
        return eH.Buffer.from(e10).toString("base64");
      }
      function sn(e10) {
        return e10 ? e10.split(",") : void 0;
      }
      async function si(e10, t10, r10, n10) {
        if (!t10.provider) throw new tA("Callback route called without provider");
        let { query: i10, body: a10, method: o10, headers: s2 } = e10, { provider: c2, adapter: l2, url: u2, callbackUrl: d2, pages: p2, jwt: h2, events: f2, callbacks: g2, session: { strategy: m2, maxAge: y2 }, logger: b2 } = t10, w2 = "jwt" === m2;
        try {
          if ("oauth" === c2.type || "oidc" === c2.type) {
            let o11, s3 = c2.authorization?.url.searchParams.get("response_mode") === "form_post" ? a10 : i10;
            if (t10.isOnRedirectProxy && s3?.state) {
              let e11 = await oY.decode(s3.state, t10);
              if (e11?.origin && new URL(e11.origin).origin !== t10.url.origin) {
                let t11 = `${e11.origin}?${new URLSearchParams(s3)}`;
                return b2.debug("Proxy redirecting to", t11), { redirect: t11, cookies: n10 };
              }
            }
            let m3 = await o2(s3, e10.cookies, t10);
            m3.cookies.length && n10.push(...m3.cookies), b2.debug("authorization result", m3);
            let { user: v2, account: _2, profile: E2 } = m3;
            if (!v2 || !_2 || !E2) return { redirect: `${u2}/signin`, cookies: n10 };
            if (l2) {
              let { getUserByAccount: e11 } = l2;
              o11 = await e11({ providerAccountId: _2.providerAccountId, provider: c2.id });
            }
            let S2 = await sa({ user: o11 ?? v2, account: _2, profile: E2 }, t10);
            if (S2) return { redirect: S2, cookies: n10 };
            let { user: k2, session: x2, isNewUser: A2 } = await aa(r10.value, v2, _2, t10);
            if (w2) {
              let e11 = { name: k2.name, email: k2.email, picture: k2.image, sub: k2.id?.toString() }, i11 = await g2.jwt({ token: e11, user: k2, account: _2, profile: E2, isNewUser: A2, trigger: A2 ? "signUp" : "signIn" });
              if (null === i11) n10.push(...r10.clean());
              else {
                let e12 = t10.cookies.sessionToken.name, a11 = await h2.encode({ ...h2, token: i11, salt: e12 }), o12 = /* @__PURE__ */ new Date();
                o12.setTime(o12.getTime() + 1e3 * y2);
                let s4 = r10.chunk(a11, { expires: o12 });
                n10.push(...s4);
              }
            } else n10.push({ name: t10.cookies.sessionToken.name, value: x2.sessionToken, options: { ...t10.cookies.sessionToken.options, expires: x2.expires } });
            if (await f2.signIn?.({ user: k2, account: _2, profile: E2, isNewUser: A2 }), A2 && p2.newUser) return { redirect: `${p2.newUser}${p2.newUser.includes("?") ? "&" : "?"}${new URLSearchParams({ callbackUrl: d2 })}`, cookies: n10 };
            return { redirect: d2, cookies: n10 };
          }
          if ("email" === c2.type) {
            let e11 = i10?.token, a11 = i10?.email;
            if (!e11) {
              let t11 = TypeError("Missing token. The sign-in URL was manually opened without token or the link was not sent correctly in the email.", { cause: { hasToken: !!e11 } });
              throw t11.name = "Configuration", t11;
            }
            let o11 = c2.secret ?? t10.secret, s3 = await l2.useVerificationToken({ identifier: a11, token: await n$(`${e11}${o11}`) }), u3 = !!s3, m3 = u3 && s3.expires.valueOf() < Date.now();
            if (!u3 || m3 || a11 && s3.identifier !== a11) throw new tR({ hasInvite: u3, expired: m3 });
            let { identifier: b3 } = s3, v2 = await l2.getUserByEmail(b3) ?? { id: crypto.randomUUID(), email: b3, emailVerified: null }, _2 = { providerAccountId: v2.email, userId: v2.id, type: "email", provider: c2.id }, E2 = await sa({ user: v2, account: _2 }, t10);
            if (E2) return { redirect: E2, cookies: n10 };
            let { user: S2, session: k2, isNewUser: x2 } = await aa(r10.value, v2, _2, t10);
            if (w2) {
              let e12 = { name: S2.name, email: S2.email, picture: S2.image, sub: S2.id?.toString() }, i11 = await g2.jwt({ token: e12, user: S2, account: _2, isNewUser: x2, trigger: x2 ? "signUp" : "signIn" });
              if (null === i11) n10.push(...r10.clean());
              else {
                let e13 = t10.cookies.sessionToken.name, a12 = await h2.encode({ ...h2, token: i11, salt: e13 }), o12 = /* @__PURE__ */ new Date();
                o12.setTime(o12.getTime() + 1e3 * y2);
                let s4 = r10.chunk(a12, { expires: o12 });
                n10.push(...s4);
              }
            } else n10.push({ name: t10.cookies.sessionToken.name, value: k2.sessionToken, options: { ...t10.cookies.sessionToken.options, expires: k2.expires } });
            if (await f2.signIn?.({ user: S2, account: _2, isNewUser: x2 }), x2 && p2.newUser) return { redirect: `${p2.newUser}${p2.newUser.includes("?") ? "&" : "?"}${new URLSearchParams({ callbackUrl: d2 })}`, cookies: n10 };
            return { redirect: d2, cookies: n10 };
          }
          if ("credentials" === c2.type && "POST" === o10) {
            let e11 = a10 ?? {};
            Object.entries(i10 ?? {}).forEach(([e12, t11]) => u2.searchParams.set(e12, t11));
            let l3 = await c2.authorize(e11, new Request(u2, { headers: s2, method: o10, body: JSON.stringify(a10) }));
            if (l3) l3.id = l3.id?.toString() ?? crypto.randomUUID();
            else throw new td();
            let p3 = { providerAccountId: l3.id, type: "credentials", provider: c2.id }, m3 = await sa({ user: l3, account: p3, credentials: e11 }, t10);
            if (m3) return { redirect: m3, cookies: n10 };
            let b3 = { name: l3.name, email: l3.email, picture: l3.image, sub: l3.id }, w3 = await g2.jwt({ token: b3, user: l3, account: p3, isNewUser: false, trigger: "signIn" });
            if (null === w3) n10.push(...r10.clean());
            else {
              let e12 = t10.cookies.sessionToken.name, i11 = await h2.encode({ ...h2, token: w3, salt: e12 }), a11 = /* @__PURE__ */ new Date();
              a11.setTime(a11.getTime() + 1e3 * y2);
              let o11 = r10.chunk(i11, { expires: a11 });
              n10.push(...o11);
            }
            return await f2.signIn?.({ user: l3, account: p3 }), { redirect: d2, cookies: n10 };
          } else if ("webauthn" === c2.type && "POST" === o10) {
            let i11, a11, o11, s3 = e10.body?.action;
            if ("string" != typeof s3 || "authenticate" !== s3 && "register" !== s3) throw new tn("Invalid action parameter");
            let c3 = se(t10);
            switch (s3) {
              case "authenticate": {
                let t11 = await o6(c3, e10, n10);
                i11 = t11.user, a11 = t11.account;
                break;
              }
              case "register": {
                let r11 = await o4(t10, e10, n10);
                i11 = r11.user, a11 = r11.account, o11 = r11.authenticator;
              }
            }
            await sa({ user: i11, account: a11 }, t10);
            let { user: l3, isNewUser: u3, session: m3, account: b3 } = await aa(r10.value, i11, a11, t10);
            if (!b3) throw new tn("Error creating or finding account");
            if (o11 && l3.id && await c3.adapter.createAuthenticator({ ...o11, userId: l3.id }), w2) {
              let e11 = { name: l3.name, email: l3.email, picture: l3.image, sub: l3.id?.toString() }, i12 = await g2.jwt({ token: e11, user: l3, account: b3, isNewUser: u3, trigger: u3 ? "signUp" : "signIn" });
              if (null === i12) n10.push(...r10.clean());
              else {
                let e12 = t10.cookies.sessionToken.name, a12 = await h2.encode({ ...h2, token: i12, salt: e12 }), o12 = /* @__PURE__ */ new Date();
                o12.setTime(o12.getTime() + 1e3 * y2);
                let s4 = r10.chunk(a12, { expires: o12 });
                n10.push(...s4);
              }
            } else n10.push({ name: t10.cookies.sessionToken.name, value: m3.sessionToken, options: { ...t10.cookies.sessionToken.options, expires: m3.expires } });
            if (await f2.signIn?.({ user: l3, account: b3, isNewUser: u3 }), u3 && p2.newUser) return { redirect: `${p2.newUser}${p2.newUser.includes("?") ? "&" : "?"}${new URLSearchParams({ callbackUrl: d2 })}`, cookies: n10 };
            return { redirect: d2, cookies: n10 };
          }
          throw new tA(`Callback for provider type (${c2.type}) is not supported`);
        } catch (t11) {
          if (t11 instanceof tn) throw t11;
          let e11 = new ts(t11, { provider: c2.id });
          throw b2.debug("callback route error details", { method: o10, query: i10, body: a10 }), e11;
        }
      }
      async function sa(e10, t10) {
        let r10, { signIn: n10, redirect: i10 } = t10.callbacks;
        try {
          r10 = await n10(e10);
        } catch (e11) {
          if (e11 instanceof tn) throw e11;
          throw new to(e11);
        }
        if (!r10) throw new to("AccessDenied");
        if ("string" == typeof r10) return await i10({ url: r10, baseUrl: t10.url.origin });
      }
      async function so(e10, t10, r10, n10, i10) {
        let { adapter: a10, jwt: o10, events: s2, callbacks: c2, logger: l2, session: { strategy: u2, maxAge: d2 } } = e10, p2 = { body: null, headers: { "Content-Type": "application/json", ...!n10 && { "Cache-Control": "private, no-cache, no-store", Expires: "0", Pragma: "no-cache" } }, cookies: r10 }, h2 = t10.value;
        if (!h2) return p2;
        if ("jwt" === u2) {
          try {
            let r11 = e10.cookies.sessionToken.name, a11 = await o10.decode({ ...o10, token: h2, salt: r11 });
            if (!a11) throw Error("Invalid JWT");
            let l3 = await c2.jwt({ token: a11, ...n10 && { trigger: "update" }, session: i10 }), u3 = ai(d2);
            if (null !== l3) {
              let e11 = { user: { name: l3.name, email: l3.email, image: l3.picture }, expires: u3.toISOString() }, n11 = await c2.session({ session: e11, token: l3 });
              p2.body = n11;
              let i11 = await o10.encode({ ...o10, token: l3, salt: r11 }), a12 = t10.chunk(i11, { expires: u3 });
              p2.cookies?.push(...a12), await s2.session?.({ session: n11, token: l3 });
            } else p2.cookies?.push(...t10.clean());
          } catch (e11) {
            l2.error(new tf(e11)), p2.cookies?.push(...t10.clean());
          }
          return p2;
        }
        try {
          let { getSessionAndUser: r11, deleteSession: o11, updateSession: l3 } = a10, u3 = await r11(h2);
          if (u3 && u3.session.expires.valueOf() < Date.now() && (await o11(h2), u3 = null), u3) {
            let { user: t11, session: r12 } = u3, a11 = e10.session.updateAge, o12 = r12.expires.valueOf() - 1e3 * d2 + 1e3 * a11, f2 = ai(d2);
            o12 <= Date.now() && await l3({ sessionToken: h2, expires: f2 });
            let g2 = await c2.session({ session: { ...r12, user: t11 }, user: t11, newSession: i10, ...n10 ? { trigger: "update" } : {} });
            p2.body = g2, p2.cookies?.push({ name: e10.cookies.sessionToken.name, value: h2, options: { ...e10.cookies.sessionToken.options, expires: f2 } }), await s2.session?.({ session: g2 });
          } else h2 && p2.cookies?.push(...t10.clean());
        } catch (e11) {
          l2.error(new tE(e11));
        }
        return p2;
      }
      async function ss(e10, t10) {
        let r10, n10, { logger: i10, provider: a10 } = t10, o10 = a10.authorization?.url;
        if (!o10 || "authjs.dev" === o10.host) {
          let e11 = new URL(a10.issuer), t11 = await aR(e11, { [ah]: a10[nJ], [au]: true }), r11 = await aO(e11, t11).catch((t12) => {
            if (!(t12 instanceof TypeError) || "Invalid URL" !== t12.message) throw t12;
            throw TypeError(`Discovery request responded with an invalid issuer. expected: ${e11}`);
          });
          if (!r11.authorization_endpoint) throw TypeError("Authorization server did not provide an authorization endpoint.");
          o10 = new URL(r11.authorization_endpoint);
        }
        let s2 = o10.searchParams, c2 = a10.callbackUrl;
        !t10.isOnRedirectProxy && a10.redirectProxyUrl && (c2 = a10.redirectProxyUrl, n10 = a10.callbackUrl, i10.debug("using redirect proxy", { redirect_uri: c2, data: n10 }));
        let l2 = Object.assign({ response_type: "code", client_id: a10.clientId, redirect_uri: c2, ...a10.authorization?.params }, Object.fromEntries(a10.authorization?.url.searchParams ?? []), e10);
        for (let e11 in l2) s2.set(e11, l2[e11]);
        let u2 = [];
        a10.authorization?.url.searchParams.get("response_mode") === "form_post" && (t10.cookies.state.options.sameSite = "none", t10.cookies.state.options.secure = true, t10.cookies.nonce.options.sameSite = "none", t10.cookies.nonce.options.secure = true);
        let d2 = await oY.create(t10, n10);
        if (d2 && (s2.set("state", d2.value), u2.push(d2.cookie)), a10.checks?.includes("pkce")) if (r10 && !r10.code_challenge_methods_supported?.includes("S256")) "oidc" === a10.type && (a10.checks = ["nonce"]);
        else {
          let { value: e11, cookie: r11 } = await oG.create(t10);
          s2.set("code_challenge", e11), s2.set("code_challenge_method", "S256"), u2.push(r11);
        }
        let p2 = await oQ.create(t10);
        return p2 && (s2.set("nonce", p2.value), u2.push(p2.cookie)), "oidc" !== a10.type || o10.searchParams.has("scope") || o10.searchParams.set("scope", "openid profile email"), i10.debug("authorization url is ready", { url: o10, cookies: u2, provider: a10 }), { redirect: o10.toString(), cookies: u2 };
      }
      async function sc(e10, t10) {
        let r10, { body: n10 } = e10, { provider: i10, callbacks: a10, adapter: o10 } = t10, s2 = (i10.normalizeIdentifier ?? function(e11) {
          if (!e11) throw Error("Missing email from request body.");
          let [t11, r11] = e11.toLowerCase().trim().split("@");
          return r11 = r11.split(",")[0], `${t11}@${r11}`;
        })(n10?.email), c2 = { id: crypto.randomUUID(), email: s2, emailVerified: null }, l2 = await o10.getUserByEmail(s2) ?? c2, u2 = { providerAccountId: s2, userId: l2.id, type: "email", provider: i10.id };
        try {
          r10 = await a10.signIn({ user: l2, account: u2, email: { verificationRequest: true } });
        } catch (e11) {
          throw new to(e11);
        }
        if (!r10) throw new to("AccessDenied");
        if ("string" == typeof r10) return { redirect: await a10.redirect({ url: r10, baseUrl: t10.url.origin }) };
        let { callbackUrl: d2, theme: p2 } = t10, h2 = await i10.generateVerificationToken?.() ?? nL(32), f2 = new Date(Date.now() + (i10.maxAge ?? 86400) * 1e3), g2 = i10.secret ?? t10.secret, m2 = new URL(t10.basePath, t10.url.origin), y2 = i10.sendVerificationRequest({ identifier: s2, token: h2, expires: f2, url: `${m2}/callback/${i10.id}?${new URLSearchParams({ callbackUrl: d2, token: h2, email: s2 })}`, provider: i10, theme: p2, request: new Request(e10.url, { headers: e10.headers, method: e10.method, body: "POST" === e10.method ? JSON.stringify(e10.body ?? {}) : void 0 }) }), b2 = o10.createVerificationToken?.({ identifier: s2, token: await n$(`${h2}${g2}`), expires: f2 });
        return await Promise.all([y2, b2]), { redirect: `${m2}/verify-request?${new URLSearchParams({ provider: i10.id, type: i10.type })}` };
      }
      async function sl(e10, t10, r10) {
        let n10 = `${r10.url.origin}${r10.basePath}/signin`;
        if (!r10.provider) return { redirect: n10, cookies: t10 };
        switch (r10.provider.type) {
          case "oauth":
          case "oidc": {
            let { redirect: n11, cookies: i10 } = await ss(e10.query, r10);
            return i10 && t10.push(...i10), { redirect: n11, cookies: t10 };
          }
          case "email":
            return { ...await sc(e10, r10), cookies: t10 };
          default:
            return { redirect: n10, cookies: t10 };
        }
      }
      async function su(e10, t10, r10) {
        let { jwt: n10, events: i10, callbackUrl: a10, logger: o10, session: s2 } = r10, c2 = t10.value;
        if (!c2) return { redirect: a10, cookies: e10 };
        try {
          if ("jwt" === s2.strategy) {
            let e11 = r10.cookies.sessionToken.name, t11 = await n10.decode({ ...n10, token: c2, salt: e11 });
            await i10.signOut?.({ token: t11 });
          } else {
            let e11 = await r10.adapter?.deleteSession(c2);
            await i10.signOut?.({ session: e11 });
          }
        } catch (e11) {
          o10.error(new tS(e11));
        }
        return e10.push(...t10.clean()), { redirect: a10, cookies: e10 };
      }
      async function sd(e10, t10) {
        let { adapter: r10, jwt: n10, session: { strategy: i10 } } = e10, a10 = t10.value;
        if (!a10) return null;
        if ("jwt" === i10) {
          let t11 = e10.cookies.sessionToken.name, r11 = await n10.decode({ ...n10, token: a10, salt: t11 });
          if (r11 && r11.sub) return { id: r11.sub, name: r11.name, email: r11.email, image: r11.picture };
        } else {
          let e11 = await r10?.getSessionAndUser(a10);
          if (e11) return e11.user;
        }
        return null;
      }
      async function sp(e10, t10, r10, n10) {
        let i10 = se(t10), { provider: a10 } = i10, { action: o10 } = e10.query ?? {};
        if ("register" !== o10 && "authenticate" !== o10 && void 0 !== o10) return { status: 400, body: { error: "Invalid action" }, cookies: n10, headers: { "Content-Type": "application/json" } };
        let s2 = await sd(t10, r10), c2 = s2 ? { user: s2, exists: true } : await a10.getUserInfo(t10, e10), l2 = c2?.user;
        switch (function(e11, t11, r11) {
          let { user: n11, exists: i11 = false } = r11 ?? {};
          switch (e11) {
            case "authenticate":
              return "authenticate";
            case "register":
              if (n11 && t11 === i11) return "register";
              break;
            case void 0:
              if (!t11) if (!n11) return "authenticate";
              else if (i11) return "authenticate";
              else return "register";
          }
          return null;
        }(o10, !!s2, c2)) {
          case "authenticate":
            return o8(i10, e10, l2, n10);
          case "register":
            if ("string" == typeof l2?.email) return o3(i10, e10, l2, n10);
            break;
          default:
            return { status: 400, body: { error: "Invalid request" }, cookies: n10, headers: { "Content-Type": "application/json" } };
        }
      }
      async function sh(e10, t10) {
        let { action: r10, providerId: n10, error: i10, method: a10 } = e10, o10 = t10.skipCSRFCheck === nB, { options: s2, cookies: c2 } = await nQ({ authOptions: t10, action: r10, providerId: n10, url: e10.url, callbackUrl: e10.body?.callbackUrl ?? e10.query?.callbackUrl, csrfToken: e10.body?.csrfToken, cookies: e10.cookies, isPost: "POST" === a10, csrfDisabled: o10 }), l2 = new tr(s2.cookies.sessionToken, e10.cookies, s2.logger);
        if ("GET" === a10) {
          let t11 = an({ ...s2, query: e10.query, cookies: c2 });
          switch (r10) {
            case "callback":
              return await si(e10, s2, l2, c2);
            case "csrf":
              return t11.csrf(o10, s2, c2);
            case "error":
              return t11.error(i10);
            case "providers":
              return t11.providers(s2.providers);
            case "session":
              return await so(s2, l2, c2);
            case "signin":
              return t11.signin(n10, i10);
            case "signout":
              return t11.signout();
            case "verify-request":
              return t11.verifyRequest();
            case "webauthn-options":
              return await sp(e10, s2, l2, c2);
          }
        } else {
          let { csrfTokenVerified: t11 } = s2;
          switch (r10) {
            case "callback":
              return "credentials" === s2.provider.type && nH(r10, t11), await si(e10, s2, l2, c2);
            case "session":
              return nH(r10, t11), await so(s2, l2, c2, true, e10.body?.data);
            case "signin":
              return nH(r10, t11), await sl(e10, c2, s2);
            case "signout":
              return nH(r10, t11), await su(c2, l2, s2);
          }
        }
        throw new tk(`Cannot handle action: ${r10}`);
      }
      function sf(e10, t10, r10, n10, i10) {
        let a10, o10 = i10?.basePath, s2 = n10.AUTH_URL ?? n10.NEXTAUTH_URL;
        if (s2) a10 = new URL(s2), o10 && "/" !== o10 && "/" !== a10.pathname && (a10.pathname !== o10 && nP(i10).warn("env-url-basepath-mismatch"), a10.pathname = "/");
        else {
          let e11 = r10.get("x-forwarded-host") ?? r10.get("host"), n11 = r10.get("x-forwarded-proto") ?? t10 ?? "https", i11 = n11.endsWith(":") ? n11 : n11 + ":";
          a10 = new URL(`${i11}//${e11}`);
        }
        let c2 = a10.toString().replace(/\/$/, "");
        if (o10) {
          let t11 = o10?.replace(/(^\/|\/$)/g, "") ?? "";
          return new URL(`${c2}/${t11}/${e10}`);
        }
        return new URL(`${c2}/${e10}`);
      }
      async function sg(e10, t10) {
        let r10 = nP(t10), n10 = await nD(e10, t10);
        if (!n10) return Response.json("Bad request.", { status: 400 });
        let i10 = function(e11, t11) {
          let { url: r11 } = e11, n11 = [];
          if (!tj && t11.debug && n11.push("debug-enabled"), !t11.trustHost) return new tT(`Host must be trusted. URL was: ${e11.url}`);
          if (!t11.secret?.length) return new tb("Please define a `secret`");
          let i11 = e11.query?.callbackUrl;
          if (i11 && !t$(i11, r11.origin)) return new tu(`Invalid callback URL. Received: ${i11}`);
          let { callbackUrl: a11 } = tt(t11.useSecureCookies ?? "https:" === r11.protocol), o11 = e11.cookies?.[t11.cookies?.callbackUrl?.name ?? a11.name];
          if (o11 && !t$(o11, r11.origin)) return new tu(`Invalid callback URL. Received: ${o11}`);
          let s2 = false;
          for (let e12 of t11.providers) {
            let t12 = "function" == typeof e12 ? e12() : e12;
            if (("oauth" === t12.type || "oidc" === t12.type) && !(t12.issuer ?? t12.options?.issuer)) {
              let e13, { authorization: r12, token: n12, userinfo: i12 } = t12;
              if ("string" == typeof r12 || r12?.url ? "string" == typeof n12 || n12?.url ? "string" == typeof i12 || i12?.url || (e13 = "userinfo") : e13 = "token" : e13 = "authorization", e13) return new tp(`Provider "${t12.id}" is missing both \`issuer\` and \`${e13}\` endpoint config. At least one of them is required`);
            }
            if ("credentials" === t12.type) tL = true;
            else if ("email" === t12.type) tM = true;
            else if ("webauthn" === t12.type) {
              var c2;
              if (tH = true, t12.simpleWebAuthnBrowserVersion && (c2 = t12.simpleWebAuthnBrowserVersion, !/^v\d+(?:\.\d+){0,2}$/.test(c2))) return new tn(`Invalid provider config for "${t12.id}": simpleWebAuthnBrowserVersion "${t12.simpleWebAuthnBrowserVersion}" must be a valid semver string.`);
              if (t12.enableConditionalUI) {
                if (s2) return new tO("Multiple webauthn providers have 'enableConditionalUI' set to True. Only one provider can have this option enabled at a time");
                if (s2 = true, !Object.values(t12.formFields).some((e13) => e13.autocomplete && e13.autocomplete.toString().indexOf("webauthn") > -1)) return new tI(`Provider "${t12.id}" has 'enableConditionalUI' set to True, but none of its formFields have 'webauthn' in their autocomplete param`);
              }
            }
          }
          if (tL) {
            let e12 = t11.session?.strategy === "database", r12 = !t11.providers.some((e13) => "credentials" !== ("function" == typeof e13 ? e13() : e13).type);
            if (e12 && r12) return new tx("Signing in with credentials only supported if JWT strategy is enabled");
            if (t11.providers.some((e13) => {
              let t12 = "function" == typeof e13 ? e13() : e13;
              return "credentials" === t12.type && !t12.authorize;
            })) return new ty("Must define an authorize() handler to use credentials authentication provider");
          }
          let { adapter: l2, session: u2 } = t11, d2 = [];
          if (tM || u2?.strategy === "database" || !u2?.strategy && l2) if (tM) {
            if (!l2) return new tg("Email login requires an adapter");
            d2.push(...tW);
          } else {
            if (!l2) return new tg("Database session requires an adapter");
            d2.push(...tK);
          }
          if (tH) {
            if (!t11.experimental?.enableWebAuthn) return new tD("WebAuthn is an experimental feature. To enable it, set `experimental.enableWebAuthn` to `true` in your config");
            if (n11.push("experimental-webauthn"), !l2) return new tg("WebAuthn requires an adapter");
            d2.push(...tB);
          }
          if (l2) {
            let e12 = d2.filter((e13) => !(e13 in l2));
            if (e12.length) return new tm(`Required adapter methods were missing: ${e12.join(", ")}`);
          }
          return tj || (tj = true), n11;
        }(n10, t10);
        if (Array.isArray(i10)) i10.forEach(r10.warn);
        else if (i10) {
          if (r10.error(i10), !(/* @__PURE__ */ new Set(["signin", "signout", "error", "verify-request"])).has(n10.action) || "GET" !== n10.method) return Response.json({ message: "There was a problem with the server configuration. Check the server logs for more information." }, { status: 500 });
          let { pages: e11, theme: a11 } = t10, o11 = e11?.error && n10.url.searchParams.get("callbackUrl")?.startsWith(e11.error);
          if (!e11?.error || o11) return o11 && r10.error(new tc(`The error page ${e11?.error} should not require authentication`)), nj(an({ theme: a11 }).error("Configuration"));
          let s2 = `${n10.url.origin}${e11.error}?error=Configuration`;
          return Response.redirect(s2);
        }
        let a10 = e10.headers?.has("X-Auth-Return-Redirect"), o10 = t10.raw === nq;
        try {
          let e11 = await sh(n10, t10);
          if (o10) return e11;
          let r11 = nj(e11), i11 = r11.headers.get("Location");
          if (!a10 || !i11) return r11;
          return Response.json({ url: i11 }, { headers: r11.headers });
        } catch (d2) {
          r10.error(d2);
          let i11 = d2 instanceof tn;
          if (i11 && o10 && !a10) throw d2;
          if ("POST" === e10.method && "session" === n10.action) return Response.json(null, { status: 400 });
          let s2 = new URLSearchParams({ error: d2 instanceof tn && tP.has(d2.type) ? d2.type : "Configuration" });
          d2 instanceof td && s2.set("code", d2.code);
          let c2 = i11 && d2.kind || "error", l2 = t10.pages?.[c2] ?? `${t10.basePath}/${c2.toLowerCase()}`, u2 = `${n10.url.origin}${l2}?${s2}`;
          if (a10) return Response.json({ url: u2 });
          return Response.redirect(u2);
        }
      }
      e.i(64445), "u" < typeof URLPattern || URLPattern;
      var Y = Y, Y = Y, e$ = e$, sm = e.i(63072), sy = e.i(80082), sb = e.i(51564);
      function sw() {
        let e10 = eX.getStore();
        return (null == e10 ? void 0 : e10.rootTaskSpawnPhase) === "action";
      }
      function sv(e10) {
        let t10 = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
        if (!t10) return e10;
        let { origin: r10 } = new URL(t10), { href: n10, origin: i10 } = e10.nextUrl;
        return new W(n10.replace(i10, r10), e10);
      }
      function s_(e10) {
        try {
          e10.secret ?? (e10.secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET);
          let t10 = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
          if (!t10) return;
          let { pathname: r10 } = new URL(t10);
          if ("/" === r10) return;
          e10.basePath || (e10.basePath = r10);
        } catch {
        } finally {
          e10.basePath || (e10.basePath = "/api/auth"), function(e11, t10, r10 = false) {
            try {
              let n10 = e11.AUTH_URL;
              n10 && (t10.basePath ? r10 || nP(t10).warn("env-url-basepath-redundant") : t10.basePath = new URL(n10).pathname);
            } catch {
            } finally {
              t10.basePath ?? (t10.basePath = "/auth");
            }
            if (!t10.secret?.length) {
              t10.secret = [];
              let r11 = e11.AUTH_SECRET;
              for (let n10 of (r11 && t10.secret.push(r11), [1, 2, 3])) {
                let r12 = e11[`AUTH_SECRET_${n10}`];
                r12 && t10.secret.unshift(r12);
              }
            }
            t10.redirectProxyUrl ?? (t10.redirectProxyUrl = e11.AUTH_REDIRECT_PROXY_URL), t10.trustHost ?? (t10.trustHost = !!(e11.AUTH_URL ?? e11.AUTH_TRUST_HOST ?? e11.VERCEL ?? e11.CF_PAGES ?? "production" !== e11.NODE_ENV)), t10.providers = t10.providers.map((t11) => {
              let { id: r11 } = "function" == typeof t11 ? t11({}) : t11, n10 = r11.toUpperCase().replace(/-/g, "_"), i10 = e11[`AUTH_${n10}_ID`], a10 = e11[`AUTH_${n10}_SECRET`], o10 = e11[`AUTH_${n10}_ISSUER`], s2 = e11[`AUTH_${n10}_KEY`], c2 = "function" == typeof t11 ? t11({ clientId: i10, clientSecret: a10, issuer: o10, apiKey: s2 }) : t11;
              return "oauth" === c2.type || "oidc" === c2.type ? (c2.clientId ?? (c2.clientId = i10), c2.clientSecret ?? (c2.clientSecret = a10), c2.issuer ?? (c2.issuer = o10)) : "email" === c2.type && (c2.apiKey ?? (c2.apiKey = s2)), c2;
            });
          }(process.env, e10, true);
        }
      }
      e.s([], 85835), e.i(85835);
      var Y = Y, e$ = e$, sE = e.i(40049);
      let sS = { current: null }, sk = "function" == typeof sE.cache ? sE.cache : (e10) => e10, sx = console.warn;
      function sA(e10) {
        return function(...t10) {
          sx(e10(...t10));
        };
      }
      function sT() {
        let e10 = "cookies", t10 = Y.workAsyncStorageInstance.getStore(), r10 = e$.workUnitAsyncStorageInstance.getStore();
        if (t10) {
          if (r10 && "after" === r10.phase && !sw()) throw Object.defineProperty(Error(`Route ${t10.route} used \`cookies()\` inside \`after()\`. This is not supported. If you need this data inside an \`after()\` callback, use \`cookies()\` outside of the callback. See more info here: https://nextjs.org/docs/canary/app/api-reference/functions/after`), "__NEXT_ERROR_CODE", { value: "E843", enumerable: false, configurable: true });
          if (t10.forceStatic) return sC(Z.seal(new M.RequestCookies(new Headers({}))));
          if (t10.dynamicShouldError) throw Object.defineProperty(new sy.StaticGenBailoutError(`Route ${t10.route} with \`dynamic = "error"\` couldn't be rendered statically because it used \`cookies()\`. See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering`), "__NEXT_ERROR_CODE", { value: "E849", enumerable: false, configurable: true });
          if (r10) switch (r10.type) {
            case "cache":
              let a10 = Object.defineProperty(Error(`Route ${t10.route} used \`cookies()\` inside "use cache". Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use \`cookies()\` outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/messages/next-request-in-use-cache`), "__NEXT_ERROR_CODE", { value: "E831", enumerable: false, configurable: true });
              throw Error.captureStackTrace(a10, sT), t10.invalidDynamicUsageError ??= a10, a10;
            case "unstable-cache":
              throw Object.defineProperty(Error(`Route ${t10.route} used \`cookies()\` inside a function cached with \`unstable_cache()\`. Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use \`cookies()\` outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/app/api-reference/functions/unstable_cache`), "__NEXT_ERROR_CODE", { value: "E846", enumerable: false, configurable: true });
            case "prerender":
              var n10 = t10, i10 = r10;
              let o10 = sR.get(i10);
              if (o10) return o10;
              let s2 = (0, sb.makeHangingPromise)(i10.renderSignal, n10.route, "`cookies()`");
              return sR.set(i10, s2), s2;
            case "prerender-client":
              let c2 = "`cookies`";
              throw Object.defineProperty(new eM.InvariantError(`${c2} must not be used within a Client Component. Next.js should be preventing ${c2} from being included in Client Components statically, but did not in this case.`), "__NEXT_ERROR_CODE", { value: "E832", enumerable: false, configurable: true });
            case "prerender-ppr":
              return (0, sm.postponeWithTracking)(t10.route, e10, r10.dynamicTracking);
            case "prerender-legacy":
              return (0, sm.throwToInterruptStaticGeneration)(e10, t10, r10);
            case "prerender-runtime":
              return (0, sm.delayUntilRuntimeStage)(r10, sC(r10.cookies));
            case "private-cache":
              return sC(r10.cookies);
            case "request":
              return (0, sm.trackDynamicDataInDynamicRender)(r10), sC(er(r10) ? r10.userspaceMutableCookies : r10.cookies);
          }
        }
        (0, ej.throwForMissingRequestStore)(e10);
      }
      sk((e10) => {
        try {
          sx(sS.current);
        } finally {
          sS.current = null;
        }
      });
      let sR = /* @__PURE__ */ new WeakMap();
      function sC(e10) {
        let t10 = sR.get(e10);
        if (t10) return t10;
        let r10 = Promise.resolve(e10);
        return sR.set(e10, r10), r10;
      }
      sA(function(e10, t10) {
        let r10 = e10 ? `Route "${e10}" ` : "This route ";
        return Object.defineProperty(Error(`${r10}used ${t10}. \`cookies()\` returns a Promise and must be unwrapped with \`await\` or \`React.use()\` before accessing its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`), "__NEXT_ERROR_CODE", { value: "E830", enumerable: false, configurable: true });
      });
      var Y = Y, e$ = e$;
      function sP() {
        let e10 = "headers", t10 = Y.workAsyncStorageInstance.getStore(), r10 = e$.workUnitAsyncStorageInstance.getStore();
        if (t10) {
          if (r10 && "after" === r10.phase && !sw()) throw Object.defineProperty(Error(`Route ${t10.route} used \`headers()\` inside \`after()\`. This is not supported. If you need this data inside an \`after()\` callback, use \`headers()\` outside of the callback. See more info here: https://nextjs.org/docs/canary/app/api-reference/functions/after`), "__NEXT_ERROR_CODE", { value: "E839", enumerable: false, configurable: true });
          if (t10.forceStatic) return sI(X.seal(new Headers({})));
          if (r10) switch (r10.type) {
            case "cache": {
              let e11 = Object.defineProperty(Error(`Route ${t10.route} used \`headers()\` inside "use cache". Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use \`headers()\` outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/messages/next-request-in-use-cache`), "__NEXT_ERROR_CODE", { value: "E833", enumerable: false, configurable: true });
              throw Error.captureStackTrace(e11, sP), t10.invalidDynamicUsageError ??= e11, e11;
            }
            case "unstable-cache":
              throw Object.defineProperty(Error(`Route ${t10.route} used \`headers()\` inside a function cached with \`unstable_cache()\`. Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use \`headers()\` outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/app/api-reference/functions/unstable_cache`), "__NEXT_ERROR_CODE", { value: "E838", enumerable: false, configurable: true });
          }
          if (t10.dynamicShouldError) throw Object.defineProperty(new sy.StaticGenBailoutError(`Route ${t10.route} with \`dynamic = "error"\` couldn't be rendered statically because it used \`headers()\`. See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering`), "__NEXT_ERROR_CODE", { value: "E828", enumerable: false, configurable: true });
          if (r10) switch (r10.type) {
            case "prerender":
              var n10 = t10, i10 = r10;
              let a10 = sO.get(i10);
              if (a10) return a10;
              let o10 = (0, sb.makeHangingPromise)(i10.renderSignal, n10.route, "`headers()`");
              return sO.set(i10, o10), o10;
            case "prerender-client":
              let s2 = "`headers`";
              throw Object.defineProperty(new eM.InvariantError(`${s2} must not be used within a client component. Next.js should be preventing ${s2} from being included in client components statically, but did not in this case.`), "__NEXT_ERROR_CODE", { value: "E693", enumerable: false, configurable: true });
            case "prerender-ppr":
              return (0, sm.postponeWithTracking)(t10.route, e10, r10.dynamicTracking);
            case "prerender-legacy":
              return (0, sm.throwToInterruptStaticGeneration)(e10, t10, r10);
            case "prerender-runtime":
              return (0, sm.delayUntilRuntimeStage)(r10, sI(r10.headers));
            case "private-cache":
              return sI(r10.headers);
            case "request":
              return (0, sm.trackDynamicDataInDynamicRender)(r10), sI(r10.headers);
          }
        }
        (0, ej.throwForMissingRequestStore)(e10);
      }
      let sO = /* @__PURE__ */ new WeakMap();
      function sI(e10) {
        let t10 = sO.get(e10);
        if (t10) return t10;
        let r10 = Promise.resolve(e10);
        return sO.set(e10, r10), r10;
      }
      sA(function(e10, t10) {
        let r10 = e10 ? `Route "${e10}" ` : "This route ";
        return Object.defineProperty(Error(`${r10}used ${t10}. \`headers()\` returns a Promise and must be unwrapped with \`await\` or \`React.use()\` before accessing its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`), "__NEXT_ERROR_CODE", { value: "E836", enumerable: false, configurable: true });
      });
      var Y = Y, e$ = e$;
      async function sN(e10, t10) {
        return sg(new Request(sf("session", e10.get("x-forwarded-proto"), e10, process.env, t10), { headers: { cookie: e10.get("cookie") ?? "" } }), { ...t10, callbacks: { ...t10.callbacks, async session(...e11) {
          let r10 = await t10.callbacks?.session?.(...e11) ?? { ...e11[0].session, expires: e11[0].session.expires?.toISOString?.() ?? e11[0].session.expires };
          return { user: e11[0].user ?? e11[0].token, ...r10 };
        } } });
      }
      function sU(e10) {
        return "function" == typeof e10;
      }
      function sD(e10, t10) {
        return "function" == typeof e10 ? async (...r10) => {
          if (!r10.length) {
            let r11 = await sP(), n11 = await e10(void 0);
            return t10?.(n11), sN(r11, n11).then((e11) => e11.json());
          }
          if (r10[0] instanceof Request) {
            let n11 = r10[0], i11 = r10[1], a11 = await e10(n11);
            return t10?.(a11), sj([n11, i11], a11);
          }
          if (sU(r10[0])) {
            let n11 = r10[0];
            return async (...r11) => {
              let i11 = await e10(r11[0]);
              return t10?.(i11), sj(r11, i11, n11);
            };
          }
          let n10 = "req" in r10[0] ? r10[0].req : r10[0], i10 = "res" in r10[0] ? r10[0].res : r10[1], a10 = await e10(n10);
          return t10?.(a10), sN(new Headers(n10.headers), a10).then(async (e11) => {
            let t11 = await e11.json();
            for (let t12 of e11.headers.getSetCookie()) "headers" in i10 ? i10.headers.append("set-cookie", t12) : i10.appendHeader("set-cookie", t12);
            return t11;
          });
        } : (...t11) => {
          if (!t11.length) return Promise.resolve(sP()).then((t12) => sN(t12, e10).then((e11) => e11.json()));
          if (t11[0] instanceof Request) return sj([t11[0], t11[1]], e10);
          if (sU(t11[0])) {
            let r11 = t11[0];
            return async (...t12) => sj(t12, e10, r11).then((e11) => e11);
          }
          let r10 = "req" in t11[0] ? t11[0].req : t11[0], n10 = "res" in t11[0] ? t11[0].res : t11[1];
          return sN(new Headers(r10.headers), e10).then(async (e11) => {
            let t12 = await e11.json();
            for (let t13 of e11.headers.getSetCookie()) "headers" in n10 ? n10.headers.append("set-cookie", t13) : n10.appendHeader("set-cookie", t13);
            return t12;
          });
        };
      }
      async function sj(e10, t10, r10) {
        let n10 = sv(e10[0]), i10 = await sN(n10.headers, t10), a10 = await i10.json(), o10 = true;
        t10.callbacks?.authorized && (o10 = await t10.callbacks.authorized({ request: n10, auth: a10 }));
        let s2 = V.next?.();
        if (o10 instanceof Response) {
          var c2, l2, u2;
          let e11, r11;
          s2 = o10;
          let i11 = o10.headers.get("Location"), { pathname: a11 } = n10.nextUrl;
          i11 && (c2 = a11, l2 = new URL(i11).pathname, u2 = t10, e11 = l2.replace(`${c2}/`, ""), r11 = Object.values(u2.pages ?? {}), (s$.has(e11) || r11.includes(l2)) && l2 === c2) && (o10 = true);
        } else if (r10) n10.auth = a10, s2 = await r10(n10, e10[1]) ?? V.next();
        else if (!o10) {
          let e11 = t10.pages?.signIn ?? `${t10.basePath}/signin`;
          if (n10.nextUrl.pathname !== e11) {
            let t11 = n10.nextUrl.clone();
            t11.pathname = e11, t11.searchParams.set("callbackUrl", n10.nextUrl.href), s2 = V.redirect(t11);
          }
        }
        let d2 = new Response(s2?.body, s2);
        for (let e11 of i10.headers.getSetCookie()) d2.headers.append("set-cookie", e11);
        return d2;
      }
      e.i(18368), /* @__PURE__ */ new WeakMap(), sA(function(e10, t10) {
        let r10 = e10 ? `Route "${e10}" ` : "This route ";
        return Object.defineProperty(Error(`${r10}used ${t10}. \`draftMode()\` returns a Promise and must be unwrapped with \`await\` or \`React.use()\` before accessing its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`), "__NEXT_ERROR_CODE", { value: "E835", enumerable: false, configurable: true });
      });
      let s$ = /* @__PURE__ */ new Set(["providers", "session", "csrf", "signin", "signout", "callback", "verify-request", "error"]);
      URLSearchParams;
      var sL = e.i(16852), sM = e.i(75982);
      let sH = e.r(91375).actionAsyncStorage;
      function sW(e10, t10) {
        throw function(e11, t11, r10 = sL.RedirectStatusCode.TemporaryRedirect) {
          let n10 = Object.defineProperty(Error(sM.REDIRECT_ERROR_CODE), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
          return n10.digest = `${sM.REDIRECT_ERROR_CODE};${t11};${e11};${r10};`, n10;
        }(e10, t10 ??= sH?.getStore()?.isAction ? sM.RedirectType.push : sM.RedirectType.replace, sL.RedirectStatusCode.TemporaryRedirect);
      }
      var sK = e.i(68585);
      function sB() {
        throw Object.defineProperty(Error("`unstable_isUnrecognizedActionError` can only be used on the client."), "__NEXT_ERROR_CODE", { value: "E776", enumerable: false, configurable: true });
      }
      async function sq(e10, t10 = {}, r10, n10) {
        let i10 = new Headers(await sP()), { redirect: a10 = true, redirectTo: o10, ...s2 } = t10 instanceof FormData ? Object.fromEntries(t10) : t10, c2 = o10?.toString() ?? i10.get("Referer") ?? "/", l2 = sf("signin", i10.get("x-forwarded-proto"), i10, process.env, n10);
        if (!e10) return l2.searchParams.append("callbackUrl", c2), a10 && sW(l2.toString()), l2.toString();
        let u2 = `${l2}/${e10}?${new URLSearchParams(r10)}`, d2 = {};
        for (let t11 of n10.providers) {
          let { options: r11, ...n11 } = "function" == typeof t11 ? t11() : t11, i11 = r11?.id ?? n11.id;
          if (i11 === e10) {
            d2 = { id: i11, type: r11?.type ?? n11.type };
            break;
          }
        }
        if (!d2.id) {
          let e11 = `${l2}?${new URLSearchParams({ callbackUrl: c2 })}`;
          return a10 && sW(e11), e11;
        }
        "credentials" === d2.type && (u2 = u2.replace("signin", "callback")), i10.set("Content-Type", "application/x-www-form-urlencoded");
        let p2 = new Request(u2, { method: "POST", headers: i10, body: new URLSearchParams({ ...s2, callbackUrl: c2 }) }), h2 = await sg(p2, { ...n10, raw: nq, skipCSRFCheck: nB }), f2 = await sT();
        for (let e11 of h2?.cookies ?? []) f2.set(e11.name, e11.value, e11.options);
        let g2 = (h2 instanceof Response ? h2.headers.get("Location") : h2.redirect) ?? u2;
        return a10 ? sW(g2) : g2;
      }
      async function sJ(e10, t10) {
        let r10 = new Headers(await sP());
        r10.set("Content-Type", "application/x-www-form-urlencoded");
        let n10 = sf("signout", r10.get("x-forwarded-proto"), r10, process.env, t10), i10 = new URLSearchParams({ callbackUrl: e10?.redirectTo ?? r10.get("Referer") ?? "/" }), a10 = new Request(n10, { method: "POST", headers: r10, body: i10 }), o10 = await sg(a10, { ...t10, raw: nq, skipCSRFCheck: nB }), s2 = await sT();
        for (let e11 of o10?.cookies ?? []) s2.set(e11.name, e11.value, e11.options);
        return e10?.redirect ?? true ? sW(o10.redirect) : o10;
      }
      async function sV(e10, t10) {
        let r10 = new Headers(await sP());
        r10.set("Content-Type", "application/json");
        let n10 = new Request(sf("session", r10.get("x-forwarded-proto"), r10, process.env, t10), { method: "POST", headers: r10, body: JSON.stringify({ data: e10 }) }), i10 = await sg(n10, { ...t10, raw: nq, skipCSRFCheck: nB }), a10 = await sT();
        for (let e11 of i10?.cookies ?? []) a10.set(e11.name, e11.value, e11.options);
        return i10.body;
      }
      sK.HTTP_ERROR_FALLBACK_ERROR_CODE, sK.HTTP_ERROR_FALLBACK_ERROR_CODE, sK.HTTP_ERROR_FALLBACK_ERROR_CODE, e.r(82748).unstable_rethrow, e.s(["unstable_isUnrecognizedActionError", () => sB], 55493), e.i(55493);
      let { auth: sz } = function(e10) {
        if ("function" == typeof e10) {
          let t11 = async (t12) => {
            let r10 = await e10(t12);
            return s_(r10), sg(sv(t12), r10);
          };
          return { handlers: { GET: t11, POST: t11 }, auth: sD(e10, (e11) => s_(e11)), signIn: async (t12, r10, n10) => {
            let i10 = await e10(void 0);
            return s_(i10), sq(t12, r10, n10, i10);
          }, signOut: async (t12) => {
            let r10 = await e10(void 0);
            return s_(r10), sJ(t12, r10);
          }, unstable_update: async (t12) => {
            let r10 = await e10(void 0);
            return s_(r10), sV(t12, r10);
          } };
        }
        s_(e10);
        let t10 = (t11) => sg(sv(t11), e10);
        return { handlers: { GET: t10, POST: t10 }, auth: sD(e10), signIn: (t11, r10, n10) => sq(t11, r10, n10, e10), signOut: (t11) => sJ(t11, e10), unstable_update: (t11) => sV(t11, e10) };
      }({ session: { strategy: "jwt" }, pages: { signIn: "/login" }, providers: [], callbacks: { jwt: async ({ token: e10, user: t10 }) => (t10 && (e10.id = t10.id), e10), session: async ({ session: e10, token: t10 }) => (e10.user && t10.id && (e10.user.id = t10.id, e10.user.role = t10.role, e10.user.rank = t10.rank, e10.user.coins = t10.coins), e10), authorized: ({ auth: e10, request: t10 }) => !t10.nextUrl.pathname.startsWith("/admin") || !!e10?.user } });
      e.s(["config", 0, { matcher: ["/admin/:path*"] }, "default", 0, sz], 96592);
      var sF = e.i(96592);
      e.i(96588);
      let sG = { ...sF }, sX = "/middleware", sY = sG.middleware || sG.default;
      if ("function" != typeof sY) throw new class extends Error {
        constructor(e10) {
          super(e10), this.stack = "";
        }
      }(`The Middleware file "${sX}" must export a function named \`middleware\` or a default function.`);
      e.s(["default", 0, (e10) => e9({ ...e10, page: sX, handler: async (...e11) => {
        try {
          return await sY(...e11);
        } catch (i10) {
          let t10 = e11[0], r10 = new URL(t10.url), n10 = r10.pathname + r10.search;
          throw await d(i10, { path: n10, method: t10.method, headers: Object.fromEntries(t10.headers.entries()) }, { routerKind: "Pages Router", routePath: "/proxy", routeType: "proxy", revalidateReason: void 0 }), i10;
        }
      } })], 58217);
    }]);
  }
});

// .next/server/edge/chunks/turbopack-node_modules_next_dist_esm_build_templates_edge-wrapper_43264f4b.js
var require_turbopack_node_modules_next_dist_esm_build_templates_edge_wrapper_43264f4b = __commonJS({
  ".next/server/edge/chunks/turbopack-node_modules_next_dist_esm_build_templates_edge-wrapper_43264f4b.js"() {
    "use strict";
    (globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/turbopack-node_modules_next_dist_esm_build_templates_edge-wrapper_43264f4b.js", { otherChunks: ["chunks/node_modules_next_dist_esm_build_templates_edge-wrapper_78fa9d6a.js", "chunks/[root-of-the-server]__c6dd1739._.js"], runtimeModuleIds: [6319] }]), (() => {
      let e;
      if (!Array.isArray(globalThis.TURBOPACK)) return;
      let t = /* @__PURE__ */ new WeakMap();
      function r(e2, t2) {
        this.m = e2, this.e = t2;
      }
      let n = r.prototype, o = Object.prototype.hasOwnProperty, u = "u" > typeof Symbol && Symbol.toStringTag;
      function l(e2, t2, r2) {
        o.call(e2, t2) || Object.defineProperty(e2, t2, r2);
      }
      function i(e2, t2) {
        let r2 = e2[t2];
        return r2 || (r2 = s(t2), e2[t2] = r2), r2;
      }
      function s(e2) {
        return { exports: {}, error: void 0, id: e2, namespaceObject: void 0 };
      }
      function a(e2, t2) {
        l(e2, "__esModule", { value: true }), u && l(e2, u, { value: "Module" });
        let r2 = 0;
        for (; r2 < t2.length; ) {
          let n2 = t2[r2++], o2 = t2[r2++];
          if ("number" == typeof o2) if (0 === o2) l(e2, n2, { value: t2[r2++], enumerable: true, writable: false });
          else throw Error(`unexpected tag: ${o2}`);
          else "function" == typeof t2[r2] ? l(e2, n2, { get: o2, set: t2[r2++], enumerable: true }) : l(e2, n2, { get: o2, enumerable: true });
        }
        Object.seal(e2);
      }
      n.s = function(e2, t2) {
        let r2, n2;
        null != t2 ? n2 = (r2 = i(this.c, t2)).exports : (r2 = this.m, n2 = this.e), r2.namespaceObject = n2, a(n2, e2);
      }, n.j = function(e2, r2) {
        var n2, u2;
        let l2, s2, a2;
        null != r2 ? s2 = (l2 = i(this.c, r2)).exports : (l2 = this.m, s2 = this.e);
        let c2 = (n2 = l2, u2 = s2, (a2 = t.get(n2)) || (t.set(n2, a2 = []), n2.exports = n2.namespaceObject = new Proxy(u2, { get(e3, t2) {
          if (o.call(e3, t2) || "default" === t2 || "__esModule" === t2) return Reflect.get(e3, t2);
          for (let e4 of a2) {
            let r3 = Reflect.get(e4, t2);
            if (void 0 !== r3) return r3;
          }
        }, ownKeys(e3) {
          let t2 = Reflect.ownKeys(e3);
          for (let e4 of a2) for (let r3 of Reflect.ownKeys(e4)) "default" === r3 || t2.includes(r3) || t2.push(r3);
          return t2;
        } })), a2);
        "object" == typeof e2 && null !== e2 && c2.push(e2);
      }, n.v = function(e2, t2) {
        (null != t2 ? i(this.c, t2) : this.m).exports = e2;
      }, n.n = function(e2, t2) {
        let r2;
        (r2 = null != t2 ? i(this.c, t2) : this.m).exports = r2.namespaceObject = e2;
      };
      let c = Object.getPrototypeOf ? (e2) => Object.getPrototypeOf(e2) : (e2) => e2.__proto__, f = [null, c({}), c([]), c(c)];
      function d(e2, t2, r2) {
        let n2 = [], o2 = -1;
        for (let t3 = e2; ("object" == typeof t3 || "function" == typeof t3) && !f.includes(t3); t3 = c(t3)) for (let r3 of Object.getOwnPropertyNames(t3)) n2.push(r3, /* @__PURE__ */ function(e3, t4) {
          return () => e3[t4];
        }(e2, r3)), -1 === o2 && "default" === r3 && (o2 = n2.length - 1);
        return r2 && o2 >= 0 || (o2 >= 0 ? n2.splice(o2, 1, 0, e2) : n2.push("default", 0, e2)), a(t2, n2), t2;
      }
      function p(e2) {
        return "function" == typeof e2 ? function(...t2) {
          return e2.apply(this, t2);
        } : /* @__PURE__ */ Object.create(null);
      }
      function h(e2) {
        let t2 = N(e2, this.m);
        if (t2.namespaceObject) return t2.namespaceObject;
        let r2 = t2.exports;
        return t2.namespaceObject = d(r2, p(r2), r2 && r2.__esModule);
      }
      function m(e2) {
        let t2 = e2.indexOf("#");
        -1 !== t2 && (e2 = e2.substring(0, t2));
        let r2 = e2.indexOf("?");
        return -1 !== r2 && (e2 = e2.substring(0, r2)), e2;
      }
      function b(e2) {
        return "string" == typeof e2 ? e2 : e2.path;
      }
      function y() {
        let e2, t2;
        return { promise: new Promise((r2, n2) => {
          t2 = n2, e2 = r2;
        }), resolve: e2, reject: t2 };
      }
      n.i = h, n.A = function(e2) {
        return this.r(e2)(h.bind(this));
      }, n.t = "function" == typeof __require ? __require : function() {
        throw Error("Unexpected use of runtime require");
      }, n.r = function(e2) {
        return N(e2, this.m).exports;
      }, n.f = function(e2) {
        function t2(t3) {
          if (t3 = m(t3), o.call(e2, t3)) return e2[t3].module();
          let r2 = Error(`Cannot find module '${t3}'`);
          throw r2.code = "MODULE_NOT_FOUND", r2;
        }
        return t2.keys = () => Object.keys(e2), t2.resolve = (t3) => {
          if (t3 = m(t3), o.call(e2, t3)) return e2[t3].id();
          let r2 = Error(`Cannot find module '${t3}'`);
          throw r2.code = "MODULE_NOT_FOUND", r2;
        }, t2.import = async (e3) => await t2(e3), t2;
      };
      let O = Symbol("turbopack queues"), g = Symbol("turbopack exports"), w = Symbol("turbopack error");
      function _(e2) {
        e2 && 1 !== e2.status && (e2.status = 1, e2.forEach((e3) => e3.queueCount--), e2.forEach((e3) => e3.queueCount-- ? e3.queueCount++ : e3()));
      }
      n.a = function(e2, t2) {
        let r2 = this.m, n2 = t2 ? Object.assign([], { status: -1 }) : void 0, o2 = /* @__PURE__ */ new Set(), { resolve: u2, reject: l2, promise: i2 } = y(), s2 = Object.assign(i2, { [g]: r2.exports, [O]: (e3) => {
          n2 && e3(n2), o2.forEach(e3), s2.catch(() => {
          });
        } }), a2 = { get: () => s2, set(e3) {
          e3 !== s2 && (s2[g] = e3);
        } };
        Object.defineProperty(r2, "exports", a2), Object.defineProperty(r2, "namespaceObject", a2), e2(function(e3) {
          let t3 = e3.map((e4) => {
            if (null !== e4 && "object" == typeof e4) {
              if (O in e4) return e4;
              if (null != e4 && "object" == typeof e4 && "then" in e4 && "function" == typeof e4.then) {
                let t4 = Object.assign([], { status: 0 }), r4 = { [g]: {}, [O]: (e5) => e5(t4) };
                return e4.then((e5) => {
                  r4[g] = e5, _(t4);
                }, (e5) => {
                  r4[w] = e5, _(t4);
                }), r4;
              }
            }
            return { [g]: e4, [O]: () => {
            } };
          }), r3 = () => t3.map((e4) => {
            if (e4[w]) throw e4[w];
            return e4[g];
          }), { promise: u3, resolve: l3 } = y(), i3 = Object.assign(() => l3(r3), { queueCount: 0 });
          function s3(e4) {
            e4 !== n2 && !o2.has(e4) && (o2.add(e4), e4 && 0 === e4.status && (i3.queueCount++, e4.push(i3)));
          }
          return t3.map((e4) => e4[O](s3)), i3.queueCount ? u3 : r3();
        }, function(e3) {
          e3 ? l2(s2[w] = e3) : u2(s2[g]), _(n2);
        }), n2 && -1 === n2.status && (n2.status = 0);
      };
      let C = function(e2) {
        let t2 = new URL(e2, "x:/"), r2 = {};
        for (let e3 in t2) r2[e3] = t2[e3];
        for (let t3 in r2.href = e2, r2.pathname = e2.replace(/[?#].*/, ""), r2.origin = r2.protocol = "", r2.toString = r2.toJSON = (...t4) => e2, r2) Object.defineProperty(this, t3, { enumerable: true, configurable: true, value: r2[t3] });
      };
      function j(e2, t2) {
        throw Error(`Invariant: ${t2(e2)}`);
      }
      C.prototype = URL.prototype, n.U = C, n.z = function(e2) {
        throw Error("dynamic usage of require is not supported");
      }, n.g = globalThis;
      let k = r.prototype;
      var U, R = ((U = R || {})[U.Runtime = 0] = "Runtime", U[U.Parent = 1] = "Parent", U[U.Update = 2] = "Update", U);
      let P = /* @__PURE__ */ new Map();
      n.M = P;
      let v = /* @__PURE__ */ new Map(), T = /* @__PURE__ */ new Map();
      async function $(e2, t2, r2) {
        let n2;
        if ("string" == typeof r2) return M(e2, t2, A(r2));
        let o2 = r2.included || [], u2 = o2.map((e3) => !!P.has(e3) || v.get(e3));
        if (u2.length > 0 && u2.every((e3) => e3)) return void await Promise.all(u2);
        let l2 = r2.moduleChunks || [], i2 = l2.map((e3) => T.get(e3)).filter((e3) => e3);
        if (i2.length > 0) {
          if (i2.length === l2.length) return void await Promise.all(i2);
          let r3 = /* @__PURE__ */ new Set();
          for (let e3 of l2) T.has(e3) || r3.add(e3);
          for (let n3 of r3) {
            let r4 = M(e2, t2, A(n3));
            T.set(n3, r4), i2.push(r4);
          }
          n2 = Promise.all(i2);
        } else {
          for (let o3 of (n2 = M(e2, t2, A(r2.path)), l2)) T.has(o3) || T.set(o3, n2);
        }
        for (let e3 of o2) v.has(e3) || v.set(e3, n2);
        await n2;
      }
      k.l = function(e2) {
        return $(1, this.m.id, e2);
      };
      let x = Promise.resolve(void 0), E = /* @__PURE__ */ new WeakMap();
      function M(t2, r2, n2) {
        let o2 = e.loadChunkCached(t2, n2), u2 = E.get(o2);
        if (void 0 === u2) {
          let e2 = E.set.bind(E, o2, x);
          u2 = o2.then(e2).catch((e3) => {
            let o3;
            switch (t2) {
              case 0:
                o3 = `as a runtime dependency of chunk ${r2}`;
                break;
              case 1:
                o3 = `from module ${r2}`;
                break;
              case 2:
                o3 = "from an HMR update";
                break;
              default:
                j(t2, (e4) => `Unknown source type: ${e4}`);
            }
            let u3 = Error(`Failed to load chunk ${n2} ${o3}${e3 ? `: ${e3}` : ""}`, e3 ? { cause: e3 } : void 0);
            throw u3.name = "ChunkLoadError", u3;
          }), E.set(o2, u2);
        }
        return u2;
      }
      function A(e2) {
        return `${e2.split("/").map((e3) => encodeURIComponent(e3)).join("/")}`;
      }
      k.L = function(e2) {
        return M(1, this.m.id, e2);
      }, k.R = function(e2) {
        let t2 = this.r(e2);
        return t2?.default ?? t2;
      }, k.P = function(e2) {
        return `/ROOT/${e2 ?? ""}`;
      }, k.b = function(e2) {
        let t2 = new Blob([`self.TURBOPACK_WORKER_LOCATION = ${JSON.stringify(location.origin)};
self.TURBOPACK_CHUNK_SUFFIX = ${JSON.stringify("")};
self.TURBOPACK_NEXT_CHUNK_URLS = ${JSON.stringify(e2.reverse().map(A), null, 2)};
importScripts(...self.TURBOPACK_NEXT_CHUNK_URLS.map(c => self.TURBOPACK_WORKER_LOCATION + c).reverse());`], { type: "text/javascript" });
        return URL.createObjectURL(t2);
      };
      let K = /\.js(?:\?[^#]*)?(?:#.*)?$/;
      n.w = function(t2, r2, n2) {
        return e.loadWebAssembly(1, this.m.id, t2, r2, n2);
      }, n.u = function(t2, r2) {
        return e.loadWebAssemblyModule(1, this.m.id, t2, r2);
      };
      let S = {};
      n.c = S;
      let N = (e2, t2) => {
        let r2 = S[e2];
        if (r2) {
          if (r2.error) throw r2.error;
          return r2;
        }
        return q(e2, R.Parent, t2.id);
      };
      function q(e2, t2, n2) {
        let o2 = P.get(e2);
        if ("function" != typeof o2) throw Error(function(e3, t3, r2) {
          let n3;
          switch (t3) {
            case 0:
              n3 = `as a runtime entry of chunk ${r2}`;
              break;
            case 1:
              n3 = `because it was required from module ${r2}`;
              break;
            case 2:
              n3 = "because of an HMR update";
              break;
            default:
              j(t3, (e4) => `Unknown source type: ${e4}`);
          }
          return `Module ${e3} was instantiated ${n3}, but the module factory is not available.`;
        }(e2, t2, n2));
        let u2 = s(e2), l2 = u2.exports;
        S[e2] = u2;
        let i2 = new r(u2, l2);
        try {
          o2(i2, u2, l2);
        } catch (e3) {
          throw u2.error = e3, e3;
        }
        return u2.namespaceObject && u2.exports !== u2.namespaceObject && d(u2.exports, u2.namespaceObject), u2;
      }
      function L(t2) {
        let r2, n2 = function(e2) {
          if ("string" == typeof e2) return e2;
          let t3 = decodeURIComponent(("u" > typeof TURBOPACK_NEXT_CHUNK_URLS ? TURBOPACK_NEXT_CHUNK_URLS.pop() : e2.getAttribute("src")).replace(/[?#].*$/, ""));
          return t3.startsWith("") ? t3.slice(0) : t3;
        }(t2[0]);
        return 2 === t2.length ? r2 = t2[1] : (r2 = void 0, !function(e2, t3, r3, n3) {
          let o2 = 1;
          for (; o2 < e2.length; ) {
            let t4 = e2[o2], n4 = o2 + 1;
            for (; n4 < e2.length && "function" != typeof e2[n4]; ) n4++;
            if (n4 === e2.length) throw Error("malformed chunk format, expected a factory function");
            if (!r3.has(t4)) {
              let u2 = e2[n4];
              for (Object.defineProperty(u2, "name", { value: "module evaluation" }); o2 < n4; o2++) t4 = e2[o2], r3.set(t4, u2);
            }
            o2 = n4 + 1;
          }
        }(t2, 0, P)), e.registerChunk(n2, r2);
      }
      function B(e2, t2, r2 = false) {
        let n2;
        try {
          n2 = t2();
        } catch (t3) {
          throw Error(`Failed to load external module ${e2}: ${t3}`);
        }
        return !r2 || n2.__esModule ? n2 : d(n2, p(n2), true);
      }
      n.y = async function(e2) {
        let t2;
        try {
          t2 = await import(e2);
        } catch (t3) {
          throw Error(`Failed to load external module ${e2}: ${t3}`);
        }
        return t2 && t2.__esModule && t2.default && "default" in t2.default ? d(t2.default, p(t2), true) : t2;
      }, B.resolve = (e2, t2) => __require.resolve(e2, t2), n.x = B, e = { registerChunk(e2, t2) {
        I.add(e2), function(e3) {
          let t3 = W.get(e3);
          if (null != t3) {
            for (let r2 of t3) r2.requiredChunks.delete(e3), 0 === r2.requiredChunks.size && F(r2.runtimeModuleIds, r2.chunkPath);
            W.delete(e3);
          }
        }(e2), null != t2 && (0 === t2.otherChunks.length ? F(t2.runtimeModuleIds, e2) : function(e3, t3, r2) {
          let n2 = /* @__PURE__ */ new Set(), o2 = { runtimeModuleIds: r2, chunkPath: e3, requiredChunks: n2 };
          for (let e4 of t3) {
            let t4 = b(e4);
            if (I.has(t4)) continue;
            n2.add(t4);
            let r3 = W.get(t4);
            null == r3 && (r3 = /* @__PURE__ */ new Set(), W.set(t4, r3)), r3.add(o2);
          }
          0 === o2.requiredChunks.size && F(o2.runtimeModuleIds, o2.chunkPath);
        }(e2, t2.otherChunks.filter((e3) => {
          var t3;
          return t3 = b(e3), K.test(t3);
        }), t2.runtimeModuleIds));
      }, loadChunkCached(e2, t2) {
        throw Error("chunk loading is not supported");
      }, async loadWebAssembly(e2, t2, r2, n2, o2) {
        let u2 = await H(r2, n2);
        return await WebAssembly.instantiate(u2, o2);
      }, loadWebAssemblyModule: async (e2, t2, r2, n2) => H(r2, n2) };
      let I = /* @__PURE__ */ new Set(), W = /* @__PURE__ */ new Map();
      function F(e2, t2) {
        for (let r2 of e2) !function(e3, t3) {
          let r3 = S[t3];
          if (r3) {
            if (r3.error) throw r3.error;
            return;
          }
          q(t3, R.Runtime, e3);
        }(t2, r2);
      }
      async function H(e2, t2) {
        let r2;
        try {
          r2 = t2();
        } catch (e3) {
        }
        if (!r2) throw Error(`dynamically loading WebAssembly is not supported in this runtime as global was not injected for chunk '${e2}'`);
        return r2;
      }
      let X = globalThis.TURBOPACK;
      globalThis.TURBOPACK = { push: L }, X.forEach(L);
    })();
  }
});

// node_modules/@opennextjs/aws/dist/core/edgeFunctionHandler.js
var edgeFunctionHandler_exports = {};
__export(edgeFunctionHandler_exports, {
  default: () => edgeFunctionHandler
});
async function edgeFunctionHandler(request) {
  const path3 = new URL(request.url).pathname;
  const routes = globalThis._ROUTES;
  const correspondingRoute = routes.find((route) => route.regex.some((r) => new RegExp(r).test(path3)));
  if (!correspondingRoute) {
    throw new Error(`No route found for ${request.url}`);
  }
  const entry = await self._ENTRIES[`middleware_${correspondingRoute.name}`];
  const result = await entry.default({
    page: correspondingRoute.page,
    request: {
      ...request,
      page: {
        name: correspondingRoute.name
      }
    }
  });
  globalThis.__openNextAls.getStore()?.pendingPromiseRunner.add(result.waitUntil);
  const response = result.response;
  return response;
}
var init_edgeFunctionHandler = __esm({
  "node_modules/@opennextjs/aws/dist/core/edgeFunctionHandler.js"() {
    globalThis._ENTRIES = {};
    globalThis.self = globalThis;
    globalThis._ROUTES = [{ "name": "middleware", "page": "/", "regex": ["^(?:\\/(_next\\/data\\/[^/]{1,}))?\\/admin(?:\\/((?:[^\\/#\\?]+?)(?:\\/(?:[^\\/#\\?]+?))*))?(\\\\.json)?[\\/#\\?]?$"] }];
    require_node_modules_next_dist_esm_build_templates_edge_wrapper_78fa9d6a();
    require_root_of_the_server_c6dd1739();
    require_turbopack_node_modules_next_dist_esm_build_templates_edge_wrapper_43264f4b();
  }
});

// node_modules/@opennextjs/aws/dist/utils/promise.js
init_logger();
var DetachedPromise = class {
  resolve;
  reject;
  promise;
  constructor() {
    let resolve;
    let reject;
    this.promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    this.resolve = resolve;
    this.reject = reject;
  }
};
var DetachedPromiseRunner = class {
  promises = [];
  withResolvers() {
    const detachedPromise = new DetachedPromise();
    this.promises.push(detachedPromise);
    return detachedPromise;
  }
  add(promise) {
    const detachedPromise = new DetachedPromise();
    this.promises.push(detachedPromise);
    promise.then(detachedPromise.resolve, detachedPromise.reject);
  }
  async await() {
    debug(`Awaiting ${this.promises.length} detached promises`);
    const results = await Promise.allSettled(this.promises.map((p) => p.promise));
    const rejectedPromises = results.filter((r) => r.status === "rejected");
    rejectedPromises.forEach((r) => {
      error(r.reason);
    });
  }
};
async function awaitAllDetachedPromise() {
  const store = globalThis.__openNextAls.getStore();
  const promisesToAwait = store?.pendingPromiseRunner.await() ?? Promise.resolve();
  if (store?.waitUntil) {
    store.waitUntil(promisesToAwait);
    return;
  }
  await promisesToAwait;
}
function provideNextAfterProvider() {
  const NEXT_REQUEST_CONTEXT_SYMBOL = Symbol.for("@next/request-context");
  const VERCEL_REQUEST_CONTEXT_SYMBOL = Symbol.for("@vercel/request-context");
  const store = globalThis.__openNextAls.getStore();
  const waitUntil = store?.waitUntil ?? ((promise) => store?.pendingPromiseRunner.add(promise));
  const nextAfterContext = {
    get: () => ({
      waitUntil
    })
  };
  globalThis[NEXT_REQUEST_CONTEXT_SYMBOL] = nextAfterContext;
  if (process.env.EMULATE_VERCEL_REQUEST_CONTEXT) {
    globalThis[VERCEL_REQUEST_CONTEXT_SYMBOL] = nextAfterContext;
  }
}
function runWithOpenNextRequestContext({ isISRRevalidation, waitUntil, requestId = Math.random().toString(36) }, fn) {
  return globalThis.__openNextAls.run({
    requestId,
    pendingPromiseRunner: new DetachedPromiseRunner(),
    isISRRevalidation,
    waitUntil,
    writtenTags: /* @__PURE__ */ new Set()
  }, async () => {
    provideNextAfterProvider();
    let result;
    try {
      result = await fn();
    } finally {
      await awaitAllDetachedPromise();
    }
    return result;
  });
}

// node_modules/@opennextjs/aws/dist/adapters/middleware.js
init_logger();

// node_modules/@opennextjs/aws/dist/core/createGenericHandler.js
init_logger();

// node_modules/@opennextjs/aws/dist/core/resolve.js
async function resolveConverter(converter2) {
  if (typeof converter2 === "function") {
    return converter2();
  }
  const m_1 = await Promise.resolve().then(() => (init_edge(), edge_exports));
  return m_1.default;
}
async function resolveWrapper(wrapper) {
  if (typeof wrapper === "function") {
    return wrapper();
  }
  const m_1 = await Promise.resolve().then(() => (init_cloudflare_edge(), cloudflare_edge_exports));
  return m_1.default;
}
async function resolveOriginResolver(originResolver) {
  if (typeof originResolver === "function") {
    return originResolver();
  }
  const m_1 = await Promise.resolve().then(() => (init_pattern_env(), pattern_env_exports));
  return m_1.default;
}
async function resolveAssetResolver(assetResolver) {
  if (typeof assetResolver === "function") {
    return assetResolver();
  }
  const m_1 = await Promise.resolve().then(() => (init_dummy(), dummy_exports));
  return m_1.default;
}
async function resolveProxyRequest(proxyRequest) {
  if (typeof proxyRequest === "function") {
    return proxyRequest();
  }
  const m_1 = await Promise.resolve().then(() => (init_fetch(), fetch_exports));
  return m_1.default;
}

// node_modules/@opennextjs/aws/dist/core/createGenericHandler.js
async function createGenericHandler(handler3) {
  const config = await import("./open-next.config.mjs").then((m) => m.default);
  globalThis.openNextConfig = config;
  const handlerConfig = config[handler3.type];
  const override = handlerConfig && "override" in handlerConfig ? handlerConfig.override : void 0;
  const converter2 = await resolveConverter(override?.converter);
  const { name, wrapper } = await resolveWrapper(override?.wrapper);
  debug("Using wrapper", name);
  return wrapper(handler3.handler, converter2);
}

// node_modules/@opennextjs/aws/dist/core/routing/util.js
import crypto2 from "node:crypto";
import { parse as parseQs, stringify as stringifyQs } from "node:querystring";

// node_modules/@opennextjs/aws/dist/adapters/config/index.js
init_logger();
import path from "node:path";
globalThis.__dirname ??= "";
var NEXT_DIR = path.join(__dirname, ".next");
var OPEN_NEXT_DIR = path.join(__dirname, ".open-next");
debug({ NEXT_DIR, OPEN_NEXT_DIR });
var NextConfig = { "env": {}, "webpack": null, "typescript": { "ignoreBuildErrors": false }, "typedRoutes": false, "distDir": ".next", "cleanDistDir": true, "assetPrefix": "", "cacheMaxMemorySize": 52428800, "configOrigin": "next.config.ts", "useFileSystemPublicRoutes": true, "generateEtags": true, "pageExtensions": ["tsx", "ts", "jsx", "js"], "poweredByHeader": true, "compress": true, "images": { "deviceSizes": [640, 750, 828, 1080, 1200, 1920, 2048, 3840], "imageSizes": [32, 48, 64, 96, 128, 256, 384], "path": "/_next/image", "loader": "default", "loaderFile": "", "domains": [], "disableStaticImages": false, "minimumCacheTTL": 14400, "formats": ["image/webp"], "maximumRedirects": 3, "maximumResponseBody": 5e7, "dangerouslyAllowLocalIP": false, "dangerouslyAllowSVG": false, "contentSecurityPolicy": "script-src 'none'; frame-src 'none'; sandbox;", "contentDispositionType": "attachment", "localPatterns": [{ "pathname": "**", "search": "" }], "remotePatterns": [{ "protocol": "https", "hostname": "placehold.co" }, { "protocol": "https", "hostname": "lh3.googleusercontent.com" }, { "protocol": "https", "hostname": "profile.line-scdn.net" }], "qualities": [75], "unoptimized": false }, "devIndicators": { "position": "bottom-left" }, "onDemandEntries": { "maxInactiveAge": 6e4, "pagesBufferLength": 5 }, "basePath": "", "sassOptions": {}, "trailingSlash": false, "i18n": null, "productionBrowserSourceMaps": false, "excludeDefaultMomentLocales": true, "reactProductionProfiling": false, "reactStrictMode": null, "reactMaxHeadersLength": 6e3, "httpAgentOptions": { "keepAlive": true }, "logging": {}, "compiler": {}, "expireTime": 31536e3, "staticPageGenerationTimeout": 60, "output": "standalone", "modularizeImports": { "@mui/icons-material": { "transform": "@mui/icons-material/{{member}}" }, "lodash": { "transform": "lodash/{{member}}" } }, "outputFileTracingRoot": "/Users/eightgood/projects/oripa", "cacheComponents": false, "cacheLife": { "default": { "stale": 300, "revalidate": 900, "expire": 4294967294 }, "seconds": { "stale": 30, "revalidate": 1, "expire": 60 }, "minutes": { "stale": 300, "revalidate": 60, "expire": 3600 }, "hours": { "stale": 300, "revalidate": 3600, "expire": 86400 }, "days": { "stale": 300, "revalidate": 86400, "expire": 604800 }, "weeks": { "stale": 300, "revalidate": 604800, "expire": 2592e3 }, "max": { "stale": 300, "revalidate": 2592e3, "expire": 31536e3 } }, "cacheHandlers": {}, "experimental": { "useSkewCookie": false, "cssChunking": true, "multiZoneDraftMode": false, "appNavFailHandling": false, "prerenderEarlyExit": true, "serverMinification": true, "linkNoTouchStart": false, "caseSensitiveRoutes": false, "dynamicOnHover": false, "preloadEntriesOnStart": true, "clientRouterFilter": true, "clientRouterFilterRedirects": false, "fetchCacheKeyPrefix": "", "proxyPrefetch": "flexible", "optimisticClientCache": true, "manualClientBasePath": false, "cpus": 9, "memoryBasedWorkersCount": false, "imgOptConcurrency": null, "imgOptTimeoutInSeconds": 7, "imgOptMaxInputPixels": 268402689, "imgOptSequentialRead": null, "imgOptSkipMetadata": null, "isrFlushToDisk": true, "workerThreads": false, "optimizeCss": false, "nextScriptWorkers": false, "scrollRestoration": false, "externalDir": false, "disableOptimizedLoading": false, "gzipSize": true, "craCompat": false, "esmExternals": true, "fullySpecified": false, "swcTraceProfiling": false, "forceSwcTransforms": false, "largePageDataBytes": 128e3, "typedEnv": false, "parallelServerCompiles": false, "parallelServerBuildTraces": false, "ppr": false, "authInterrupts": false, "webpackMemoryOptimizations": false, "optimizeServerReact": true, "viewTransition": false, "removeUncaughtErrorAndRejectionListeners": false, "validateRSCRequestHeaders": false, "staleTimes": { "dynamic": 0, "static": 300 }, "reactDebugChannel": false, "serverComponentsHmrCache": true, "staticGenerationMaxConcurrency": 8, "staticGenerationMinPagesPerWorker": 25, "transitionIndicator": false, "inlineCss": false, "useCache": false, "globalNotFound": false, "browserDebugInfoInTerminal": false, "lockDistDir": true, "isolatedDevBuild": true, "proxyClientMaxBodySize": 10485760, "hideLogsAfterAbort": false, "mcpServer": true, "turbopackFileSystemCacheForDev": true, "turbopackFileSystemCacheForBuild": false, "turbopackInferModuleSideEffects": false, "optimizePackageImports": ["lucide-react", "date-fns", "lodash-es", "ramda", "antd", "react-bootstrap", "ahooks", "@ant-design/icons", "@headlessui/react", "@headlessui-float/react", "@heroicons/react/20/solid", "@heroicons/react/24/solid", "@heroicons/react/24/outline", "@visx/visx", "@tremor/react", "rxjs", "@mui/material", "@mui/icons-material", "recharts", "react-use", "effect", "@effect/schema", "@effect/platform", "@effect/platform-node", "@effect/platform-browser", "@effect/platform-bun", "@effect/sql", "@effect/sql-mssql", "@effect/sql-mysql2", "@effect/sql-pg", "@effect/sql-sqlite-node", "@effect/sql-sqlite-bun", "@effect/sql-sqlite-wasm", "@effect/sql-sqlite-react-native", "@effect/rpc", "@effect/rpc-http", "@effect/typeclass", "@effect/experimental", "@effect/opentelemetry", "@material-ui/core", "@material-ui/icons", "@tabler/icons-react", "mui-core", "react-icons/ai", "react-icons/bi", "react-icons/bs", "react-icons/cg", "react-icons/ci", "react-icons/di", "react-icons/fa", "react-icons/fa6", "react-icons/fc", "react-icons/fi", "react-icons/gi", "react-icons/go", "react-icons/gr", "react-icons/hi", "react-icons/hi2", "react-icons/im", "react-icons/io", "react-icons/io5", "react-icons/lia", "react-icons/lib", "react-icons/lu", "react-icons/md", "react-icons/pi", "react-icons/ri", "react-icons/rx", "react-icons/si", "react-icons/sl", "react-icons/tb", "react-icons/tfi", "react-icons/ti", "react-icons/vsc", "react-icons/wi"], "trustHostHeader": false, "isExperimentalCompile": false }, "htmlLimitedBots": "[\\w-]+-Google|Google-[\\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight", "bundlePagesRouterDependencies": false, "configFileName": "next.config.ts", "turbopack": { "root": "/Users/eightgood/projects/oripa" }, "distDirRoot": ".next" };
var BuildId = "L9in3gVhjo3cjXxPBY9Ec";
var RoutesManifest = { "basePath": "", "rewrites": { "beforeFiles": [], "afterFiles": [], "fallback": [] }, "redirects": [{ "source": "/:path+/", "destination": "/:path+", "internal": true, "priority": true, "statusCode": 308, "regex": "^(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))/$" }], "routes": { "static": [{ "page": "/", "regex": "^/(?:/)?$", "routeKeys": {}, "namedRegex": "^/(?:/)?$" }, { "page": "/_global-error", "regex": "^/_global\\-error(?:/)?$", "routeKeys": {}, "namedRegex": "^/_global\\-error(?:/)?$" }, { "page": "/_not-found", "regex": "^/_not\\-found(?:/)?$", "routeKeys": {}, "namedRegex": "^/_not\\-found(?:/)?$" }, { "page": "/admin", "regex": "^/admin(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin(?:/)?$" }, { "page": "/admin/dashboard", "regex": "^/admin/dashboard(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/dashboard(?:/)?$" }, { "page": "/admin/packs", "regex": "^/admin/packs(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/packs(?:/)?$" }, { "page": "/admin/packs/new", "regex": "^/admin/packs/new(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/packs/new(?:/)?$" }, { "page": "/admin/plans", "regex": "^/admin/plans(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/plans(?:/)?$" }, { "page": "/admin/prizes", "regex": "^/admin/prizes(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/prizes(?:/)?$" }, { "page": "/admin/prizes/new", "regex": "^/admin/prizes/new(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/prizes/new(?:/)?$" }, { "page": "/admin/users", "regex": "^/admin/users(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/users(?:/)?$" }, { "page": "/api/admin/packs", "regex": "^/api/admin/packs(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/admin/packs(?:/)?$" }, { "page": "/api/admin/plans", "regex": "^/api/admin/plans(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/admin/plans(?:/)?$" }, { "page": "/api/admin/prizes", "regex": "^/api/admin/prizes(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/admin/prizes(?:/)?$" }, { "page": "/api/admin/stats", "regex": "^/api/admin/stats(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/admin/stats(?:/)?$" }, { "page": "/api/admin/users", "regex": "^/api/admin/users(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/admin/users(?:/)?$" }, { "page": "/api/auth/register", "regex": "^/api/auth/register(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/auth/register(?:/)?$" }, { "page": "/api/gacha/draw", "regex": "^/api/gacha/draw(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/gacha/draw(?:/)?$" }, { "page": "/api/user/exchange", "regex": "^/api/user/exchange(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/user/exchange(?:/)?$" }, { "page": "/api/user/history", "regex": "^/api/user/history(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/user/history(?:/)?$" }, { "page": "/api/user/inventory", "regex": "^/api/user/inventory(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/user/inventory(?:/)?$" }, { "page": "/charge", "regex": "^/charge(?:/)?$", "routeKeys": {}, "namedRegex": "^/charge(?:/)?$" }, { "page": "/exchange", "regex": "^/exchange(?:/)?$", "routeKeys": {}, "namedRegex": "^/exchange(?:/)?$" }, { "page": "/favicon.ico", "regex": "^/favicon\\.ico(?:/)?$", "routeKeys": {}, "namedRegex": "^/favicon\\.ico(?:/)?$" }, { "page": "/login", "regex": "^/login(?:/)?$", "routeKeys": {}, "namedRegex": "^/login(?:/)?$" }, { "page": "/mypage", "regex": "^/mypage(?:/)?$", "routeKeys": {}, "namedRegex": "^/mypage(?:/)?$" }, { "page": "/ranking", "regex": "^/ranking(?:/)?$", "routeKeys": {}, "namedRegex": "^/ranking(?:/)?$" }, { "page": "/register", "regex": "^/register(?:/)?$", "routeKeys": {}, "namedRegex": "^/register(?:/)?$" }], "dynamic": [{ "page": "/admin/packs/[id]", "regex": "^/admin/packs/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/admin/packs/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/admin/prizes/[id]", "regex": "^/admin/prizes/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/admin/prizes/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/admin/users/[id]", "regex": "^/admin/users/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/admin/users/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/api/admin/packs/[id]", "regex": "^/api/admin/packs/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/admin/packs/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/api/admin/packs/[id]/prizes", "regex": "^/api/admin/packs/([^/]+?)/prizes(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/admin/packs/(?<nxtPid>[^/]+?)/prizes(?:/)?$" }, { "page": "/api/admin/plans/[id]", "regex": "^/api/admin/plans/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/admin/plans/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/api/admin/prizes/[id]", "regex": "^/api/admin/prizes/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/admin/prizes/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/api/admin/users/[id]", "regex": "^/api/admin/users/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/admin/users/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/api/auth/[...nextauth]", "regex": "^/api/auth/(.+?)(?:/)?$", "routeKeys": { "nxtPnextauth": "nxtPnextauth" }, "namedRegex": "^/api/auth/(?<nxtPnextauth>.+?)(?:/)?$" }, { "page": "/oripa/[id]", "regex": "^/oripa/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/oripa/(?<nxtPid>[^/]+?)(?:/)?$" }], "data": { "static": [], "dynamic": [] } }, "locales": [] };
var ConfigHeaders = [];
var PrerenderManifest = { "version": 4, "routes": { "/_global-error": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/_global-error", "dataRoute": "/_global-error.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/_not-found": { "initialStatus": 404, "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/_not-found", "dataRoute": "/_not-found.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/login": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/login", "dataRoute": "/login.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/register": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/register", "dataRoute": "/register.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/charge": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": 300, "initialExpireSeconds": 31536e3, "srcRoute": "/charge", "dataRoute": "/charge.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/exchange": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/exchange", "dataRoute": "/exchange.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/mypage": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/mypage", "dataRoute": "/mypage.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": 30, "initialExpireSeconds": 31536e3, "srcRoute": "/", "dataRoute": "/index.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/ranking": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": 30, "initialExpireSeconds": 31536e3, "srcRoute": "/ranking", "dataRoute": "/ranking.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/favicon.ico": { "initialHeaders": { "cache-control": "public, max-age=0, must-revalidate", "content-type": "image/x-icon", "x-next-cache-tags": "_N_T_/layout,_N_T_/favicon.ico/layout,_N_T_/favicon.ico/route,_N_T_/favicon.ico" }, "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/favicon.ico", "dataRoute": null, "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] } }, "dynamicRoutes": {}, "notFoundRoutes": [], "preview": { "previewModeId": "b756ec06b916384c50cb53afe1ef2219", "previewModeSigningKey": "fb1a38b0cece3768e99ddada2e1af841b94a17418696e92749c5d9b9316e8e0f", "previewModeEncryptionKey": "de80839ec78787512d3ae79347b1545aa7199aff0211497ef4f5909b65129a62" } };
var MiddlewareManifest = { "version": 3, "middleware": { "/": { "files": ["server/edge/chunks/node_modules_next_dist_esm_build_templates_edge-wrapper_78fa9d6a.js", "server/edge/chunks/[root-of-the-server]__c6dd1739._.js", "server/edge/chunks/turbopack-node_modules_next_dist_esm_build_templates_edge-wrapper_43264f4b.js"], "name": "middleware", "page": "/", "matchers": [{ "regexp": "^(?:\\/(_next\\/data\\/[^/]{1,}))?\\/admin(?:\\/((?:[^\\/#\\?]+?)(?:\\/(?:[^\\/#\\?]+?))*))?(\\\\.json)?[\\/#\\?]?$", "originalSource": "/admin/:path*" }], "wasm": [], "assets": [], "env": { "__NEXT_BUILD_ID": "L9in3gVhjo3cjXxPBY9Ec", "NEXT_SERVER_ACTIONS_ENCRYPTION_KEY": "tFDG7Ns8EuXpfQUxEbb1MzsxDd0SQVChOvy2rAq3YrY=", "__NEXT_PREVIEW_MODE_ID": "b756ec06b916384c50cb53afe1ef2219", "__NEXT_PREVIEW_MODE_ENCRYPTION_KEY": "de80839ec78787512d3ae79347b1545aa7199aff0211497ef4f5909b65129a62", "__NEXT_PREVIEW_MODE_SIGNING_KEY": "fb1a38b0cece3768e99ddada2e1af841b94a17418696e92749c5d9b9316e8e0f" } } }, "sortedMiddleware": ["/"], "functions": {} };
var AppPathRoutesManifest = { "/(admin)/admin/dashboard/page": "/admin/dashboard", "/(admin)/admin/packs/[id]/page": "/admin/packs/[id]", "/(admin)/admin/packs/new/page": "/admin/packs/new", "/(admin)/admin/packs/page": "/admin/packs", "/(admin)/admin/page": "/admin", "/(admin)/admin/plans/page": "/admin/plans", "/(admin)/admin/prizes/[id]/page": "/admin/prizes/[id]", "/(admin)/admin/prizes/new/page": "/admin/prizes/new", "/(admin)/admin/prizes/page": "/admin/prizes", "/(admin)/admin/users/[id]/page": "/admin/users/[id]", "/(admin)/admin/users/page": "/admin/users", "/(auth)/login/page": "/login", "/(auth)/register/page": "/register", "/(user)/charge/page": "/charge", "/(user)/exchange/page": "/exchange", "/(user)/mypage/page": "/mypage", "/(user)/oripa/[id]/page": "/oripa/[id]", "/(user)/page": "/", "/(user)/ranking/page": "/ranking", "/_global-error/page": "/_global-error", "/_not-found/page": "/_not-found", "/api/admin/packs/[id]/prizes/route": "/api/admin/packs/[id]/prizes", "/api/admin/packs/[id]/route": "/api/admin/packs/[id]", "/api/admin/packs/route": "/api/admin/packs", "/api/admin/plans/[id]/route": "/api/admin/plans/[id]", "/api/admin/plans/route": "/api/admin/plans", "/api/admin/prizes/[id]/route": "/api/admin/prizes/[id]", "/api/admin/prizes/route": "/api/admin/prizes", "/api/admin/stats/route": "/api/admin/stats", "/api/admin/users/[id]/route": "/api/admin/users/[id]", "/api/admin/users/route": "/api/admin/users", "/api/auth/[...nextauth]/route": "/api/auth/[...nextauth]", "/api/auth/register/route": "/api/auth/register", "/api/gacha/draw/route": "/api/gacha/draw", "/api/user/exchange/route": "/api/user/exchange", "/api/user/history/route": "/api/user/history", "/api/user/inventory/route": "/api/user/inventory", "/favicon.ico/route": "/favicon.ico" };
var FunctionsConfigManifest = { "version": 1, "functions": {} };
var PagesManifest = { "/404": "pages/404.html", "/500": "pages/500.html" };
process.env.NEXT_BUILD_ID = BuildId;
process.env.NEXT_PREVIEW_MODE_ID = PrerenderManifest?.preview?.previewModeId;

// node_modules/@opennextjs/aws/dist/http/openNextResponse.js
init_logger();
init_util();
import { Transform } from "node:stream";

// node_modules/@opennextjs/aws/dist/core/routing/util.js
init_util();
init_logger();
import { ReadableStream as ReadableStream2 } from "node:stream/web";

// node_modules/@opennextjs/aws/dist/utils/binary.js
var commonBinaryMimeTypes = /* @__PURE__ */ new Set([
  "application/octet-stream",
  // Docs
  "application/epub+zip",
  "application/msword",
  "application/pdf",
  "application/rtf",
  "application/vnd.amazon.ebook",
  "application/vnd.ms-excel",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // Fonts
  "font/otf",
  "font/woff",
  "font/woff2",
  // Images
  "image/bmp",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/vnd.microsoft.icon",
  "image/webp",
  // Audio
  "audio/3gpp",
  "audio/aac",
  "audio/basic",
  "audio/flac",
  "audio/mpeg",
  "audio/ogg",
  "audio/wavaudio/webm",
  "audio/x-aiff",
  "audio/x-midi",
  "audio/x-wav",
  // Video
  "video/3gpp",
  "video/mp2t",
  "video/mpeg",
  "video/ogg",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
  // Archives
  "application/java-archive",
  "application/vnd.apple.installer+xml",
  "application/x-7z-compressed",
  "application/x-apple-diskimage",
  "application/x-bzip",
  "application/x-bzip2",
  "application/x-gzip",
  "application/x-java-archive",
  "application/x-rar-compressed",
  "application/x-tar",
  "application/x-zip",
  "application/zip",
  // Serialized data
  "application/x-protobuf"
]);
function isBinaryContentType(contentType) {
  if (!contentType)
    return false;
  const value = contentType.split(";")[0];
  return commonBinaryMimeTypes.has(value);
}

// node_modules/@opennextjs/aws/dist/core/routing/i18n/index.js
init_stream();
init_logger();

// node_modules/@opennextjs/aws/dist/core/routing/i18n/accept-header.js
function parse(raw, preferences, options) {
  const lowers = /* @__PURE__ */ new Map();
  const header = raw.replace(/[ \t]/g, "");
  if (preferences) {
    let pos = 0;
    for (const preference of preferences) {
      const lower = preference.toLowerCase();
      lowers.set(lower, { orig: preference, pos: pos++ });
      if (options.prefixMatch) {
        const parts2 = lower.split("-");
        while (parts2.pop(), parts2.length > 0) {
          const joined = parts2.join("-");
          if (!lowers.has(joined)) {
            lowers.set(joined, { orig: preference, pos: pos++ });
          }
        }
      }
    }
  }
  const parts = header.split(",");
  const selections = [];
  const map = /* @__PURE__ */ new Set();
  for (let i = 0; i < parts.length; ++i) {
    const part = parts[i];
    if (!part) {
      continue;
    }
    const params = part.split(";");
    if (params.length > 2) {
      throw new Error(`Invalid ${options.type} header`);
    }
    const token = params[0].toLowerCase();
    if (!token) {
      throw new Error(`Invalid ${options.type} header`);
    }
    const selection = { token, pos: i, q: 1 };
    if (preferences && lowers.has(token)) {
      selection.pref = lowers.get(token).pos;
    }
    map.add(selection.token);
    if (params.length === 2) {
      const q = params[1];
      const [key, value] = q.split("=");
      if (!value || key !== "q" && key !== "Q") {
        throw new Error(`Invalid ${options.type} header`);
      }
      const score = Number.parseFloat(value);
      if (score === 0) {
        continue;
      }
      if (Number.isFinite(score) && score <= 1 && score >= 1e-3) {
        selection.q = score;
      }
    }
    selections.push(selection);
  }
  selections.sort((a, b) => {
    if (b.q !== a.q) {
      return b.q - a.q;
    }
    if (b.pref !== a.pref) {
      if (a.pref === void 0) {
        return 1;
      }
      if (b.pref === void 0) {
        return -1;
      }
      return a.pref - b.pref;
    }
    return a.pos - b.pos;
  });
  const values = selections.map((selection) => selection.token);
  if (!preferences || !preferences.length) {
    return values;
  }
  const preferred = [];
  for (const selection of values) {
    if (selection === "*") {
      for (const [preference, value] of lowers) {
        if (!map.has(preference)) {
          preferred.push(value.orig);
        }
      }
    } else {
      const lower = selection.toLowerCase();
      if (lowers.has(lower)) {
        preferred.push(lowers.get(lower).orig);
      }
    }
  }
  return preferred;
}
function acceptLanguage(header = "", preferences) {
  return parse(header, preferences, {
    type: "accept-language",
    prefixMatch: true
  })[0] || void 0;
}

// node_modules/@opennextjs/aws/dist/core/routing/i18n/index.js
function isLocalizedPath(path3) {
  return NextConfig.i18n?.locales.includes(path3.split("/")[1].toLowerCase()) ?? false;
}
function getLocaleFromCookie(cookies) {
  const i18n = NextConfig.i18n;
  const nextLocale = cookies.NEXT_LOCALE?.toLowerCase();
  return nextLocale ? i18n?.locales.find((locale) => nextLocale === locale.toLowerCase()) : void 0;
}
function detectDomainLocale({ hostname, detectedLocale }) {
  const i18n = NextConfig.i18n;
  const domains = i18n?.domains;
  if (!domains) {
    return;
  }
  const lowercasedLocale = detectedLocale?.toLowerCase();
  for (const domain of domains) {
    const domainHostname = domain.domain.split(":", 1)[0].toLowerCase();
    if (hostname === domainHostname || lowercasedLocale === domain.defaultLocale.toLowerCase() || domain.locales?.some((locale) => lowercasedLocale === locale.toLowerCase())) {
      return domain;
    }
  }
}
function detectLocale(internalEvent, i18n) {
  const domainLocale = detectDomainLocale({
    hostname: internalEvent.headers.host
  });
  if (i18n.localeDetection === false) {
    return domainLocale?.defaultLocale ?? i18n.defaultLocale;
  }
  const cookiesLocale = getLocaleFromCookie(internalEvent.cookies);
  const preferredLocale = acceptLanguage(internalEvent.headers["accept-language"], i18n?.locales);
  debug({
    cookiesLocale,
    preferredLocale,
    defaultLocale: i18n.defaultLocale,
    domainLocale
  });
  return domainLocale?.defaultLocale ?? cookiesLocale ?? preferredLocale ?? i18n.defaultLocale;
}
function localizePath(internalEvent) {
  const i18n = NextConfig.i18n;
  if (!i18n) {
    return internalEvent.rawPath;
  }
  if (isLocalizedPath(internalEvent.rawPath)) {
    return internalEvent.rawPath;
  }
  const detectedLocale = detectLocale(internalEvent, i18n);
  return `/${detectedLocale}${internalEvent.rawPath}`;
}
function handleLocaleRedirect(internalEvent) {
  const i18n = NextConfig.i18n;
  if (!i18n || i18n.localeDetection === false || internalEvent.rawPath !== "/") {
    return false;
  }
  const preferredLocale = acceptLanguage(internalEvent.headers["accept-language"], i18n?.locales);
  const detectedLocale = detectLocale(internalEvent, i18n);
  const domainLocale = detectDomainLocale({
    hostname: internalEvent.headers.host
  });
  const preferredDomain = detectDomainLocale({
    detectedLocale: preferredLocale
  });
  if (domainLocale && preferredDomain) {
    const isPDomain = preferredDomain.domain === domainLocale.domain;
    const isPLocale = preferredDomain.defaultLocale === preferredLocale;
    if (!isPDomain || !isPLocale) {
      const scheme = `http${preferredDomain.http ? "" : "s"}`;
      const rlocale = isPLocale ? "" : preferredLocale;
      return {
        type: "core",
        statusCode: 307,
        headers: {
          Location: `${scheme}://${preferredDomain.domain}/${rlocale}`
        },
        body: emptyReadableStream(),
        isBase64Encoded: false
      };
    }
  }
  const defaultLocale = domainLocale?.defaultLocale ?? i18n.defaultLocale;
  if (detectedLocale.toLowerCase() !== defaultLocale.toLowerCase()) {
    return {
      type: "core",
      statusCode: 307,
      headers: {
        Location: constructNextUrl(internalEvent.url, `/${detectedLocale}`)
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
  return false;
}

// node_modules/@opennextjs/aws/dist/core/routing/queue.js
function generateShardId(rawPath, maxConcurrency, prefix) {
  let a = cyrb128(rawPath);
  let t = a += 1831565813;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  const randomFloat = ((t ^ t >>> 14) >>> 0) / 4294967296;
  const randomInt = Math.floor(randomFloat * maxConcurrency);
  return `${prefix}-${randomInt}`;
}
function generateMessageGroupId(rawPath) {
  const maxConcurrency = Number.parseInt(process.env.MAX_REVALIDATE_CONCURRENCY ?? "10");
  return generateShardId(rawPath, maxConcurrency, "revalidate");
}
function cyrb128(str) {
  let h1 = 1779033703;
  let h2 = 3144134277;
  let h3 = 1013904242;
  let h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ h1 >>> 18, 597399067);
  h2 = Math.imul(h4 ^ h2 >>> 22, 2869860233);
  h3 = Math.imul(h1 ^ h3 >>> 17, 951274213);
  h4 = Math.imul(h2 ^ h4 >>> 19, 2716044179);
  h1 ^= h2 ^ h3 ^ h4, h2 ^= h1, h3 ^= h1, h4 ^= h1;
  return h1 >>> 0;
}

// node_modules/@opennextjs/aws/dist/core/routing/util.js
function isExternal(url, host) {
  if (!url)
    return false;
  const pattern = /^https?:\/\//;
  if (!pattern.test(url))
    return false;
  if (host) {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.host !== host;
    } catch {
      return !url.includes(host);
    }
  }
  return true;
}
function convertFromQueryString(query) {
  if (query === "")
    return {};
  const queryParts = query.split("&");
  return getQueryFromIterator(queryParts.map((p) => {
    const [key, value] = p.split("=");
    return [key, value];
  }));
}
function getUrlParts(url, isExternal2) {
  if (!isExternal2) {
    const regex2 = /\/([^?]*)\??(.*)/;
    const match3 = url.match(regex2);
    return {
      hostname: "",
      pathname: match3?.[1] ? `/${match3[1]}` : url,
      protocol: "",
      queryString: match3?.[2] ?? ""
    };
  }
  const regex = /^(https?:)\/\/?([^\/\s]+)(\/[^?]*)?(\?.*)?/;
  const match2 = url.match(regex);
  if (!match2) {
    throw new Error(`Invalid external URL: ${url}`);
  }
  return {
    protocol: match2[1] ?? "https:",
    hostname: match2[2],
    pathname: match2[3] ?? "",
    queryString: match2[4]?.slice(1) ?? ""
  };
}
function constructNextUrl(baseUrl, path3) {
  const nextBasePath = NextConfig.basePath ?? "";
  const url = new URL(`${nextBasePath}${path3}`, baseUrl);
  return url.href;
}
function convertToQueryString(query) {
  const queryStrings = [];
  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => queryStrings.push(`${key}=${entry}`));
    } else {
      queryStrings.push(`${key}=${value}`);
    }
  });
  return queryStrings.length > 0 ? `?${queryStrings.join("&")}` : "";
}
function getMiddlewareMatch(middlewareManifest2, functionsManifest) {
  if (functionsManifest?.functions?.["/_middleware"]) {
    return functionsManifest.functions["/_middleware"].matchers?.map(({ regexp }) => new RegExp(regexp)) ?? [/.*/];
  }
  const rootMiddleware = middlewareManifest2.middleware["/"];
  if (!rootMiddleware?.matchers)
    return [];
  return rootMiddleware.matchers.map(({ regexp }) => new RegExp(regexp));
}
function escapeRegex(str, { isPath } = {}) {
  const result = str.replaceAll("(.)", "_\xB51_").replaceAll("(..)", "_\xB52_").replaceAll("(...)", "_\xB53_");
  return isPath ? result : result.replaceAll("+", "_\xB54_");
}
function unescapeRegex(str) {
  return str.replaceAll("_\xB51_", "(.)").replaceAll("_\xB52_", "(..)").replaceAll("_\xB53_", "(...)").replaceAll("_\xB54_", "+");
}
function convertBodyToReadableStream(method, body) {
  if (method === "GET" || method === "HEAD")
    return void 0;
  if (!body)
    return void 0;
  return new ReadableStream2({
    start(controller) {
      controller.enqueue(body);
      controller.close();
    }
  });
}
var CommonHeaders;
(function(CommonHeaders2) {
  CommonHeaders2["CACHE_CONTROL"] = "cache-control";
  CommonHeaders2["NEXT_CACHE"] = "x-nextjs-cache";
})(CommonHeaders || (CommonHeaders = {}));
function normalizeLocationHeader(location2, baseUrl, encodeQuery = false) {
  if (!URL.canParse(location2)) {
    return location2;
  }
  const locationURL = new URL(location2);
  const origin = new URL(baseUrl).origin;
  let search = locationURL.search;
  if (encodeQuery && search) {
    search = `?${stringifyQs(parseQs(search.slice(1)))}`;
  }
  const href = `${locationURL.origin}${locationURL.pathname}${search}${locationURL.hash}`;
  if (locationURL.origin === origin) {
    return href.slice(origin.length);
  }
  return href;
}

// node_modules/@opennextjs/aws/dist/core/routingHandler.js
init_logger();

// node_modules/@opennextjs/aws/dist/core/routing/cacheInterceptor.js
import { createHash } from "node:crypto";
init_stream();

// node_modules/@opennextjs/aws/dist/utils/cache.js
init_logger();
async function hasBeenRevalidated(key, tags, cacheEntry) {
  if (globalThis.openNextConfig.dangerous?.disableTagCache) {
    return false;
  }
  const value = cacheEntry.value;
  if (!value) {
    return true;
  }
  if ("type" in cacheEntry && cacheEntry.type === "page") {
    return false;
  }
  const lastModified = cacheEntry.lastModified ?? Date.now();
  if (globalThis.tagCache.mode === "nextMode") {
    return tags.length === 0 ? false : await globalThis.tagCache.hasBeenRevalidated(tags, lastModified);
  }
  const _lastModified = await globalThis.tagCache.getLastModified(key, lastModified);
  return _lastModified === -1;
}
function getTagsFromValue(value) {
  if (!value) {
    return [];
  }
  try {
    const cacheTags = value.meta?.headers?.["x-next-cache-tags"]?.split(",") ?? [];
    delete value.meta?.headers?.["x-next-cache-tags"];
    return cacheTags;
  } catch (e) {
    return [];
  }
}

// node_modules/@opennextjs/aws/dist/core/routing/cacheInterceptor.js
init_logger();
var CACHE_ONE_YEAR = 60 * 60 * 24 * 365;
var CACHE_ONE_MONTH = 60 * 60 * 24 * 30;
var VARY_HEADER = "RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch, Next-Url";
var NEXT_SEGMENT_PREFETCH_HEADER = "next-router-segment-prefetch";
var NEXT_PRERENDER_HEADER = "x-nextjs-prerender";
var NEXT_POSTPONED_HEADER = "x-nextjs-postponed";
async function computeCacheControl(path3, body, host, revalidate, lastModified) {
  let finalRevalidate = CACHE_ONE_YEAR;
  const existingRoute = Object.entries(PrerenderManifest?.routes ?? {}).find((p) => p[0] === path3)?.[1];
  if (revalidate === void 0 && existingRoute) {
    finalRevalidate = existingRoute.initialRevalidateSeconds === false ? CACHE_ONE_YEAR : existingRoute.initialRevalidateSeconds;
  } else if (revalidate !== void 0) {
    finalRevalidate = revalidate === false ? CACHE_ONE_YEAR : revalidate;
  }
  const age = Math.round((Date.now() - (lastModified ?? 0)) / 1e3);
  const hash = (str) => createHash("md5").update(str).digest("hex");
  const etag = hash(body);
  if (revalidate === 0) {
    return {
      "cache-control": "private, no-cache, no-store, max-age=0, must-revalidate",
      "x-opennext-cache": "ERROR",
      etag
    };
  }
  if (finalRevalidate !== CACHE_ONE_YEAR) {
    const sMaxAge = Math.max(finalRevalidate - age, 1);
    debug("sMaxAge", {
      finalRevalidate,
      age,
      lastModified,
      revalidate
    });
    const isStale = sMaxAge === 1;
    if (isStale) {
      let url = NextConfig.trailingSlash ? `${path3}/` : path3;
      if (NextConfig.basePath) {
        url = `${NextConfig.basePath}${url}`;
      }
      await globalThis.queue.send({
        MessageBody: {
          host,
          url,
          eTag: etag,
          lastModified: lastModified ?? Date.now()
        },
        MessageDeduplicationId: hash(`${path3}-${lastModified}-${etag}`),
        MessageGroupId: generateMessageGroupId(path3)
      });
    }
    return {
      "cache-control": `s-maxage=${sMaxAge}, stale-while-revalidate=${CACHE_ONE_MONTH}`,
      "x-opennext-cache": isStale ? "STALE" : "HIT",
      etag
    };
  }
  return {
    "cache-control": `s-maxage=${CACHE_ONE_YEAR}, stale-while-revalidate=${CACHE_ONE_MONTH}`,
    "x-opennext-cache": "HIT",
    etag
  };
}
function getBodyForAppRouter(event, cachedValue) {
  if (cachedValue.type !== "app") {
    throw new Error("getBodyForAppRouter called with non-app cache value");
  }
  try {
    const segmentHeader = `${event.headers[NEXT_SEGMENT_PREFETCH_HEADER]}`;
    const isSegmentResponse = Boolean(segmentHeader) && segmentHeader in (cachedValue.segmentData || {});
    const body = isSegmentResponse ? cachedValue.segmentData[segmentHeader] : cachedValue.rsc;
    return {
      body,
      additionalHeaders: isSegmentResponse ? { [NEXT_PRERENDER_HEADER]: "1", [NEXT_POSTPONED_HEADER]: "2" } : {}
    };
  } catch (e) {
    error("Error while getting body for app router from cache:", e);
    return { body: cachedValue.rsc, additionalHeaders: {} };
  }
}
async function generateResult(event, localizedPath, cachedValue, lastModified) {
  debug("Returning result from experimental cache");
  let body = "";
  let type = "application/octet-stream";
  let isDataRequest = false;
  let additionalHeaders = {};
  if (cachedValue.type === "app") {
    isDataRequest = Boolean(event.headers.rsc);
    if (isDataRequest) {
      const { body: appRouterBody, additionalHeaders: appHeaders } = getBodyForAppRouter(event, cachedValue);
      body = appRouterBody;
      additionalHeaders = appHeaders;
    } else {
      body = cachedValue.html;
    }
    type = isDataRequest ? "text/x-component" : "text/html; charset=utf-8";
  } else if (cachedValue.type === "page") {
    isDataRequest = Boolean(event.query.__nextDataReq);
    body = isDataRequest ? JSON.stringify(cachedValue.json) : cachedValue.html;
    type = isDataRequest ? "application/json" : "text/html; charset=utf-8";
  } else {
    throw new Error("generateResult called with unsupported cache value type, only 'app' and 'page' are supported");
  }
  const cacheControl = await computeCacheControl(localizedPath, body, event.headers.host, cachedValue.revalidate, lastModified);
  return {
    type: "core",
    // Sometimes other status codes can be cached, like 404. For these cases, we should return the correct status code
    // Also set the status code to the rewriteStatusCode if defined
    // This can happen in handleMiddleware in routingHandler.
    // `NextResponse.rewrite(url, { status: xxx})
    // The rewrite status code should take precedence over the cached one
    statusCode: event.rewriteStatusCode ?? cachedValue.meta?.status ?? 200,
    body: toReadableStream(body, false),
    isBase64Encoded: false,
    headers: {
      ...cacheControl,
      "content-type": type,
      ...cachedValue.meta?.headers,
      vary: VARY_HEADER,
      ...additionalHeaders
    }
  };
}
function escapePathDelimiters(segment, escapeEncoded) {
  return segment.replace(new RegExp(`([/#?]${escapeEncoded ? "|%(2f|23|3f|5c)" : ""})`, "gi"), (char) => encodeURIComponent(char));
}
function decodePathParams(pathname) {
  return pathname.split("/").map((segment) => {
    try {
      return escapePathDelimiters(decodeURIComponent(segment), true);
    } catch (e) {
      return segment;
    }
  }).join("/");
}
async function cacheInterceptor(event) {
  if (Boolean(event.headers["next-action"]) || Boolean(event.headers["x-prerender-revalidate"]))
    return event;
  const cookies = event.headers.cookie || "";
  const hasPreviewData = cookies.includes("__prerender_bypass") || cookies.includes("__next_preview_data");
  if (hasPreviewData) {
    debug("Preview mode detected, passing through to handler");
    return event;
  }
  let localizedPath = localizePath(event);
  if (NextConfig.basePath) {
    localizedPath = localizedPath.replace(NextConfig.basePath, "");
  }
  localizedPath = localizedPath.replace(/\/$/, "");
  localizedPath = decodePathParams(localizedPath);
  debug("Checking cache for", localizedPath, PrerenderManifest);
  const isISR = Object.keys(PrerenderManifest?.routes ?? {}).includes(localizedPath ?? "/") || Object.values(PrerenderManifest?.dynamicRoutes ?? {}).some((dr) => new RegExp(dr.routeRegex).test(localizedPath));
  debug("isISR", isISR);
  if (isISR) {
    try {
      const cachedData = await globalThis.incrementalCache.get(localizedPath ?? "/index");
      debug("cached data in interceptor", cachedData);
      if (!cachedData?.value) {
        return event;
      }
      if (cachedData.value?.type === "app" || cachedData.value?.type === "route") {
        const tags = getTagsFromValue(cachedData.value);
        const _hasBeenRevalidated = cachedData.shouldBypassTagCache ? false : await hasBeenRevalidated(localizedPath, tags, cachedData);
        if (_hasBeenRevalidated) {
          return event;
        }
      }
      const host = event.headers.host;
      switch (cachedData?.value?.type) {
        case "app":
        case "page":
          return generateResult(event, localizedPath, cachedData.value, cachedData.lastModified);
        case "redirect": {
          const cacheControl = await computeCacheControl(localizedPath, "", host, cachedData.value.revalidate, cachedData.lastModified);
          return {
            type: "core",
            statusCode: cachedData.value.meta?.status ?? 307,
            body: emptyReadableStream(),
            headers: {
              ...cachedData.value.meta?.headers ?? {},
              ...cacheControl
            },
            isBase64Encoded: false
          };
        }
        case "route": {
          const cacheControl = await computeCacheControl(localizedPath, cachedData.value.body, host, cachedData.value.revalidate, cachedData.lastModified);
          const isBinary = isBinaryContentType(String(cachedData.value.meta?.headers?.["content-type"]));
          return {
            type: "core",
            statusCode: event.rewriteStatusCode ?? cachedData.value.meta?.status ?? 200,
            body: toReadableStream(cachedData.value.body, isBinary),
            headers: {
              ...cacheControl,
              ...cachedData.value.meta?.headers,
              vary: VARY_HEADER
            },
            isBase64Encoded: isBinary
          };
        }
        default:
          return event;
      }
    } catch (e) {
      debug("Error while fetching cache", e);
      return event;
    }
  }
  return event;
}

// node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
function parse2(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path3 = "";
  var tryConsume = function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  };
  var mustConsume = function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  };
  var consumeText = function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  };
  var isSafe = function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  };
  var safePattern = function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  };
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path3 += prefix;
        prefix = "";
      }
      if (path3) {
        result.push(path3);
        path3 = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path3 += value;
      continue;
    }
    if (path3) {
      result.push(path3);
      path3 = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
function compile(str, options) {
  return tokensToFunction(parse2(str, options), options);
}
function tokensToFunction(tokens, options) {
  if (options === void 0) {
    options = {};
  }
  var reFlags = flags(options);
  var _a = options.encode, encode = _a === void 0 ? function(x) {
    return x;
  } : _a, _b = options.validate, validate = _b === void 0 ? true : _b;
  var matches = tokens.map(function(token) {
    if (typeof token === "object") {
      return new RegExp("^(?:".concat(token.pattern, ")$"), reFlags);
    }
  });
  return function(data) {
    var path3 = "";
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      if (typeof token === "string") {
        path3 += token;
        continue;
      }
      var value = data ? data[token.name] : void 0;
      var optional = token.modifier === "?" || token.modifier === "*";
      var repeat = token.modifier === "*" || token.modifier === "+";
      if (Array.isArray(value)) {
        if (!repeat) {
          throw new TypeError('Expected "'.concat(token.name, '" to not repeat, but got an array'));
        }
        if (value.length === 0) {
          if (optional)
            continue;
          throw new TypeError('Expected "'.concat(token.name, '" to not be empty'));
        }
        for (var j = 0; j < value.length; j++) {
          var segment = encode(value[j], token);
          if (validate && !matches[i].test(segment)) {
            throw new TypeError('Expected all "'.concat(token.name, '" to match "').concat(token.pattern, '", but got "').concat(segment, '"'));
          }
          path3 += token.prefix + segment + token.suffix;
        }
        continue;
      }
      if (typeof value === "string" || typeof value === "number") {
        var segment = encode(String(value), token);
        if (validate && !matches[i].test(segment)) {
          throw new TypeError('Expected "'.concat(token.name, '" to match "').concat(token.pattern, '", but got "').concat(segment, '"'));
        }
        path3 += token.prefix + segment + token.suffix;
        continue;
      }
      if (optional)
        continue;
      var typeOfMessage = repeat ? "an array" : "a string";
      throw new TypeError('Expected "'.concat(token.name, '" to be ').concat(typeOfMessage));
    }
    return path3;
  };
}
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path3 = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    };
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path: path3, index, params };
  };
}
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
function regexpToRegexp(path3, keys) {
  if (!keys)
    return path3;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path3.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path3.source);
  }
  return path3;
}
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path3) {
    return pathToRegexp(path3, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
function stringToRegexp(path3, keys, options) {
  return tokensToRegexp(parse2(path3, options), keys, options);
}
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
function pathToRegexp(path3, keys, options) {
  if (path3 instanceof RegExp)
    return regexpToRegexp(path3, keys);
  if (Array.isArray(path3))
    return arrayToRegexp(path3, keys, options);
  return stringToRegexp(path3, keys, options);
}

// node_modules/@opennextjs/aws/dist/utils/normalize-path.js
import path2 from "node:path";
function normalizeRepeatedSlashes(url) {
  const urlNoQuery = url.host + url.pathname;
  return `${url.protocol}//${urlNoQuery.replace(/\\/g, "/").replace(/\/\/+/g, "/")}${url.search}`;
}

// node_modules/@opennextjs/aws/dist/core/routing/matcher.js
init_stream();
init_logger();

// node_modules/@opennextjs/aws/dist/core/routing/routeMatcher.js
var optionalLocalePrefixRegex = `^/(?:${RoutesManifest.locales.map((locale) => `${locale}/?`).join("|")})?`;
var optionalBasepathPrefixRegex = RoutesManifest.basePath ? `^${RoutesManifest.basePath}/?` : "^/";
var optionalPrefix = optionalLocalePrefixRegex.replace("^/", optionalBasepathPrefixRegex);
function routeMatcher(routeDefinitions) {
  const regexp = routeDefinitions.map((route) => ({
    page: route.page,
    regexp: new RegExp(route.regex.replace("^/", optionalPrefix))
  }));
  const appPathsSet = /* @__PURE__ */ new Set();
  const routePathsSet = /* @__PURE__ */ new Set();
  for (const [k, v] of Object.entries(AppPathRoutesManifest)) {
    if (k.endsWith("page")) {
      appPathsSet.add(v);
    } else if (k.endsWith("route")) {
      routePathsSet.add(v);
    }
  }
  return function matchRoute(path3) {
    const foundRoutes = regexp.filter((route) => route.regexp.test(path3));
    return foundRoutes.map((foundRoute) => {
      let routeType = "page";
      if (appPathsSet.has(foundRoute.page)) {
        routeType = "app";
      } else if (routePathsSet.has(foundRoute.page)) {
        routeType = "route";
      }
      return {
        route: foundRoute.page,
        type: routeType
      };
    });
  };
}
var staticRouteMatcher = routeMatcher([
  ...RoutesManifest.routes.static,
  ...getStaticAPIRoutes()
]);
var dynamicRouteMatcher = routeMatcher(RoutesManifest.routes.dynamic);
function getStaticAPIRoutes() {
  const createRouteDefinition = (route) => ({
    page: route,
    regex: `^${route}(?:/)?$`
  });
  const dynamicRoutePages = new Set(RoutesManifest.routes.dynamic.map(({ page }) => page));
  const pagesStaticAPIRoutes = Object.keys(PagesManifest).filter((route) => route.startsWith("/api/") && !dynamicRoutePages.has(route)).map(createRouteDefinition);
  const appPathsStaticAPIRoutes = Object.values(AppPathRoutesManifest).filter((route) => (route.startsWith("/api/") || route === "/api") && !dynamicRoutePages.has(route)).map(createRouteDefinition);
  return [...pagesStaticAPIRoutes, ...appPathsStaticAPIRoutes];
}

// node_modules/@opennextjs/aws/dist/core/routing/matcher.js
var routeHasMatcher = (headers, cookies, query) => (redirect) => {
  switch (redirect.type) {
    case "header":
      return !!headers?.[redirect.key.toLowerCase()] && new RegExp(redirect.value ?? "").test(headers[redirect.key.toLowerCase()] ?? "");
    case "cookie":
      return !!cookies?.[redirect.key] && new RegExp(redirect.value ?? "").test(cookies[redirect.key] ?? "");
    case "query":
      return query[redirect.key] && Array.isArray(redirect.value) ? redirect.value.reduce((prev, current) => prev || new RegExp(current).test(query[redirect.key]), false) : new RegExp(redirect.value ?? "").test(query[redirect.key] ?? "");
    case "host":
      return headers?.host !== "" && new RegExp(redirect.value ?? "").test(headers.host);
    default:
      return false;
  }
};
function checkHas(matcher, has, inverted = false) {
  return has ? has.reduce((acc, cur) => {
    if (acc === false)
      return false;
    return inverted ? !matcher(cur) : matcher(cur);
  }, true) : true;
}
var getParamsFromSource = (source) => (value) => {
  debug("value", value);
  const _match = source(value);
  return _match ? _match.params : {};
};
var computeParamHas = (headers, cookies, query) => (has) => {
  if (!has.value)
    return {};
  const matcher = new RegExp(`^${has.value}$`);
  const fromSource = (value) => {
    const matches = value.match(matcher);
    return matches?.groups ?? {};
  };
  switch (has.type) {
    case "header":
      return fromSource(headers[has.key.toLowerCase()] ?? "");
    case "cookie":
      return fromSource(cookies[has.key] ?? "");
    case "query":
      return Array.isArray(query[has.key]) ? fromSource(query[has.key].join(",")) : fromSource(query[has.key] ?? "");
    case "host":
      return fromSource(headers.host ?? "");
  }
};
function convertMatch(match2, toDestination, destination) {
  if (!match2) {
    return destination;
  }
  const { params } = match2;
  const isUsingParams = Object.keys(params).length > 0;
  return isUsingParams ? toDestination(params) : destination;
}
function getNextConfigHeaders(event, configHeaders) {
  if (!configHeaders) {
    return {};
  }
  const matcher = routeHasMatcher(event.headers, event.cookies, event.query);
  const requestHeaders = {};
  const localizedRawPath = localizePath(event);
  for (const { headers, has, missing, regex, source, locale } of configHeaders) {
    const path3 = locale === false ? event.rawPath : localizedRawPath;
    if (new RegExp(regex).test(path3) && checkHas(matcher, has) && checkHas(matcher, missing, true)) {
      const fromSource = match(source);
      const _match = fromSource(path3);
      headers.forEach((h) => {
        try {
          const key = convertMatch(_match, compile(h.key), h.key);
          const value = convertMatch(_match, compile(h.value), h.value);
          requestHeaders[key] = value;
        } catch {
          debug(`Error matching header ${h.key} with value ${h.value}`);
          requestHeaders[h.key] = h.value;
        }
      });
    }
  }
  return requestHeaders;
}
function handleRewrites(event, rewrites) {
  const { rawPath, headers, query, cookies, url } = event;
  const localizedRawPath = localizePath(event);
  const matcher = routeHasMatcher(headers, cookies, query);
  const computeHas = computeParamHas(headers, cookies, query);
  const rewrite = rewrites.find((route) => {
    const path3 = route.locale === false ? rawPath : localizedRawPath;
    return new RegExp(route.regex).test(path3) && checkHas(matcher, route.has) && checkHas(matcher, route.missing, true);
  });
  let finalQuery = query;
  let rewrittenUrl = url;
  const isExternalRewrite = isExternal(rewrite?.destination);
  debug("isExternalRewrite", isExternalRewrite);
  if (rewrite) {
    const { pathname, protocol, hostname, queryString } = getUrlParts(rewrite.destination, isExternalRewrite);
    const pathToUse = rewrite.locale === false ? rawPath : localizedRawPath;
    debug("urlParts", { pathname, protocol, hostname, queryString });
    const toDestinationPath = compile(escapeRegex(pathname, { isPath: true }));
    const toDestinationHost = compile(escapeRegex(hostname));
    const toDestinationQuery = compile(escapeRegex(queryString));
    const params = {
      // params for the source
      ...getParamsFromSource(match(escapeRegex(rewrite.source, { isPath: true })))(pathToUse),
      // params for the has
      ...rewrite.has?.reduce((acc, cur) => {
        return Object.assign(acc, computeHas(cur));
      }, {}),
      // params for the missing
      ...rewrite.missing?.reduce((acc, cur) => {
        return Object.assign(acc, computeHas(cur));
      }, {})
    };
    const isUsingParams = Object.keys(params).length > 0;
    let rewrittenQuery = queryString;
    let rewrittenHost = hostname;
    let rewrittenPath = pathname;
    if (isUsingParams) {
      rewrittenPath = unescapeRegex(toDestinationPath(params));
      rewrittenHost = unescapeRegex(toDestinationHost(params));
      rewrittenQuery = unescapeRegex(toDestinationQuery(params));
    }
    if (NextConfig.i18n && !isExternalRewrite) {
      const strippedPathLocale = rewrittenPath.replace(new RegExp(`^/(${NextConfig.i18n.locales.join("|")})`), "");
      if (strippedPathLocale.startsWith("/api/")) {
        rewrittenPath = strippedPathLocale;
      }
    }
    rewrittenUrl = isExternalRewrite ? `${protocol}//${rewrittenHost}${rewrittenPath}` : new URL(rewrittenPath, event.url).href;
    finalQuery = {
      ...query,
      ...convertFromQueryString(rewrittenQuery)
    };
    rewrittenUrl += convertToQueryString(finalQuery);
    debug("rewrittenUrl", { rewrittenUrl, finalQuery, isUsingParams });
  }
  return {
    internalEvent: {
      ...event,
      query: finalQuery,
      rawPath: new URL(rewrittenUrl).pathname,
      url: rewrittenUrl
    },
    __rewrite: rewrite,
    isExternalRewrite
  };
}
function handleRepeatedSlashRedirect(event) {
  if (event.rawPath.match(/(\\|\/\/)/)) {
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: normalizeRepeatedSlashes(new URL(event.url))
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
  return false;
}
function handleTrailingSlashRedirect(event) {
  const url = new URL(event.rawPath, "http://localhost");
  if (
    // Someone is trying to redirect to a different origin, let's not do that
    url.host !== "localhost" || NextConfig.skipTrailingSlashRedirect || // We should not apply trailing slash redirect to API routes
    event.rawPath.startsWith("/api/")
  ) {
    return false;
  }
  const emptyBody = emptyReadableStream();
  if (NextConfig.trailingSlash && !event.headers["x-nextjs-data"] && !event.rawPath.endsWith("/") && !event.rawPath.match(/[\w-]+\.[\w]+$/g)) {
    const headersLocation = event.url.split("?");
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: `${headersLocation[0]}/${headersLocation[1] ? `?${headersLocation[1]}` : ""}`
      },
      body: emptyBody,
      isBase64Encoded: false
    };
  }
  if (!NextConfig.trailingSlash && event.rawPath.endsWith("/") && event.rawPath !== "/") {
    const headersLocation = event.url.split("?");
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: `${headersLocation[0].replace(/\/$/, "")}${headersLocation[1] ? `?${headersLocation[1]}` : ""}`
      },
      body: emptyBody,
      isBase64Encoded: false
    };
  }
  return false;
}
function handleRedirects(event, redirects) {
  const repeatedSlashRedirect = handleRepeatedSlashRedirect(event);
  if (repeatedSlashRedirect)
    return repeatedSlashRedirect;
  const trailingSlashRedirect = handleTrailingSlashRedirect(event);
  if (trailingSlashRedirect)
    return trailingSlashRedirect;
  const localeRedirect = handleLocaleRedirect(event);
  if (localeRedirect)
    return localeRedirect;
  const { internalEvent, __rewrite } = handleRewrites(event, redirects.filter((r) => !r.internal));
  if (__rewrite && !__rewrite.internal) {
    return {
      type: event.type,
      statusCode: __rewrite.statusCode ?? 308,
      headers: {
        Location: internalEvent.url
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
}
function fixDataPage(internalEvent, buildId) {
  const { rawPath, query } = internalEvent;
  const basePath = NextConfig.basePath ?? "";
  const dataPattern = `${basePath}/_next/data/${buildId}`;
  if (rawPath.startsWith("/_next/data") && !rawPath.startsWith(dataPattern)) {
    return {
      type: internalEvent.type,
      statusCode: 404,
      body: toReadableStream("{}"),
      headers: {
        "Content-Type": "application/json"
      },
      isBase64Encoded: false
    };
  }
  if (rawPath.startsWith(dataPattern) && rawPath.endsWith(".json")) {
    const newPath = `${basePath}${rawPath.slice(dataPattern.length, -".json".length).replace(/^\/index$/, "/")}`;
    query.__nextDataReq = "1";
    return {
      ...internalEvent,
      rawPath: newPath,
      query,
      url: new URL(`${newPath}${convertToQueryString(query)}`, internalEvent.url).href
    };
  }
  return internalEvent;
}
function handleFallbackFalse(internalEvent, prerenderManifest) {
  const { rawPath } = internalEvent;
  const { dynamicRoutes = {}, routes = {} } = prerenderManifest ?? {};
  const prerenderedFallbackRoutes = Object.entries(dynamicRoutes).filter(([, { fallback }]) => fallback === false);
  const routeFallback = prerenderedFallbackRoutes.some(([, { routeRegex }]) => {
    const routeRegexExp = new RegExp(routeRegex);
    return routeRegexExp.test(rawPath);
  });
  const locales = NextConfig.i18n?.locales;
  const routesAlreadyHaveLocale = locales?.includes(rawPath.split("/")[1]) || // If we don't use locales, we don't need to add the default locale
  locales === void 0;
  let localizedPath = routesAlreadyHaveLocale ? rawPath : `/${NextConfig.i18n?.defaultLocale}${rawPath}`;
  if (
    // Not if localizedPath is "/" tho, because that would not make it find `isPregenerated` below since it would be try to match an empty string.
    localizedPath !== "/" && NextConfig.trailingSlash && localizedPath.endsWith("/")
  ) {
    localizedPath = localizedPath.slice(0, -1);
  }
  const matchedStaticRoute = staticRouteMatcher(localizedPath);
  const prerenderedFallbackRoutesName = prerenderedFallbackRoutes.map(([name]) => name);
  const matchedDynamicRoute = dynamicRouteMatcher(localizedPath).filter(({ route }) => !prerenderedFallbackRoutesName.includes(route));
  const isPregenerated = Object.keys(routes).includes(localizedPath);
  if (routeFallback && !isPregenerated && matchedStaticRoute.length === 0 && matchedDynamicRoute.length === 0) {
    return {
      event: {
        ...internalEvent,
        rawPath: "/404",
        url: constructNextUrl(internalEvent.url, "/404"),
        headers: {
          ...internalEvent.headers,
          "x-invoke-status": "404"
        }
      },
      isISR: false
    };
  }
  return {
    event: internalEvent,
    isISR: routeFallback || isPregenerated
  };
}

// node_modules/@opennextjs/aws/dist/core/routing/middleware.js
init_stream();
init_utils();
var middlewareManifest = MiddlewareManifest;
var functionsConfigManifest = FunctionsConfigManifest;
var middleMatch = getMiddlewareMatch(middlewareManifest, functionsConfigManifest);
var REDIRECTS = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
function defaultMiddlewareLoader() {
  return Promise.resolve().then(() => (init_edgeFunctionHandler(), edgeFunctionHandler_exports));
}
async function handleMiddleware(internalEvent, initialSearch, middlewareLoader = defaultMiddlewareLoader) {
  const headers = internalEvent.headers;
  if (headers["x-isr"] && headers["x-prerender-revalidate"] === PrerenderManifest?.preview?.previewModeId)
    return internalEvent;
  const normalizedPath = localizePath(internalEvent);
  const hasMatch = middleMatch.some((r) => r.test(normalizedPath));
  if (!hasMatch)
    return internalEvent;
  const initialUrl = new URL(normalizedPath, internalEvent.url);
  initialUrl.search = initialSearch;
  const url = initialUrl.href;
  const middleware = await middlewareLoader();
  const result = await middleware.default({
    // `geo` is pre Next 15.
    geo: {
      // The city name is percent-encoded.
      // See https://github.com/vercel/vercel/blob/4cb6143/packages/functions/src/headers.ts#L94C19-L94C37
      city: decodeURIComponent(headers["x-open-next-city"]),
      country: headers["x-open-next-country"],
      region: headers["x-open-next-region"],
      latitude: headers["x-open-next-latitude"],
      longitude: headers["x-open-next-longitude"]
    },
    headers,
    method: internalEvent.method || "GET",
    nextConfig: {
      basePath: NextConfig.basePath,
      i18n: NextConfig.i18n,
      trailingSlash: NextConfig.trailingSlash
    },
    url,
    body: convertBodyToReadableStream(internalEvent.method, internalEvent.body)
  });
  const statusCode = result.status;
  const responseHeaders = result.headers;
  const reqHeaders = {};
  const resHeaders = {};
  const filteredHeaders = [
    "x-middleware-override-headers",
    "x-middleware-next",
    "x-middleware-rewrite",
    // We need to drop `content-encoding` because it will be decoded
    "content-encoding"
  ];
  const xMiddlewareKey = "x-middleware-request-";
  responseHeaders.forEach((value, key) => {
    if (key.startsWith(xMiddlewareKey)) {
      const k = key.substring(xMiddlewareKey.length);
      reqHeaders[k] = value;
    } else {
      if (filteredHeaders.includes(key.toLowerCase()))
        return;
      if (key.toLowerCase() === "set-cookie") {
        resHeaders[key] = resHeaders[key] ? [...resHeaders[key], value] : [value];
      } else if (REDIRECTS.has(statusCode) && key.toLowerCase() === "location") {
        resHeaders[key] = normalizeLocationHeader(value, internalEvent.url);
      } else {
        resHeaders[key] = value;
      }
    }
  });
  const rewriteUrl = responseHeaders.get("x-middleware-rewrite");
  let isExternalRewrite = false;
  let middlewareQuery = internalEvent.query;
  let newUrl = internalEvent.url;
  if (rewriteUrl) {
    newUrl = rewriteUrl;
    if (isExternal(newUrl, internalEvent.headers.host)) {
      isExternalRewrite = true;
    } else {
      const rewriteUrlObject = new URL(rewriteUrl);
      middlewareQuery = getQueryFromSearchParams(rewriteUrlObject.searchParams);
      if ("__nextDataReq" in internalEvent.query) {
        middlewareQuery.__nextDataReq = internalEvent.query.__nextDataReq;
      }
    }
  }
  if (!rewriteUrl && !responseHeaders.get("x-middleware-next")) {
    const body = result.body ?? emptyReadableStream();
    return {
      type: internalEvent.type,
      statusCode,
      headers: resHeaders,
      body,
      isBase64Encoded: false
    };
  }
  return {
    responseHeaders: resHeaders,
    url: newUrl,
    rawPath: new URL(newUrl).pathname,
    type: internalEvent.type,
    headers: { ...internalEvent.headers, ...reqHeaders },
    body: internalEvent.body,
    method: internalEvent.method,
    query: middlewareQuery,
    cookies: internalEvent.cookies,
    remoteAddress: internalEvent.remoteAddress,
    isExternalRewrite,
    rewriteStatusCode: rewriteUrl && !isExternalRewrite ? statusCode : void 0
  };
}

// node_modules/@opennextjs/aws/dist/core/routingHandler.js
var MIDDLEWARE_HEADER_PREFIX = "x-middleware-response-";
var MIDDLEWARE_HEADER_PREFIX_LEN = MIDDLEWARE_HEADER_PREFIX.length;
var INTERNAL_HEADER_PREFIX = "x-opennext-";
var INTERNAL_HEADER_INITIAL_URL = `${INTERNAL_HEADER_PREFIX}initial-url`;
var INTERNAL_HEADER_LOCALE = `${INTERNAL_HEADER_PREFIX}locale`;
var INTERNAL_HEADER_RESOLVED_ROUTES = `${INTERNAL_HEADER_PREFIX}resolved-routes`;
var INTERNAL_HEADER_REWRITE_STATUS_CODE = `${INTERNAL_HEADER_PREFIX}rewrite-status-code`;
var INTERNAL_EVENT_REQUEST_ID = `${INTERNAL_HEADER_PREFIX}request-id`;
var geoHeaderToNextHeader = {
  "x-open-next-city": "x-vercel-ip-city",
  "x-open-next-country": "x-vercel-ip-country",
  "x-open-next-region": "x-vercel-ip-country-region",
  "x-open-next-latitude": "x-vercel-ip-latitude",
  "x-open-next-longitude": "x-vercel-ip-longitude"
};
function applyMiddlewareHeaders(eventOrResult, middlewareHeaders) {
  const isResult = isInternalResult(eventOrResult);
  const headers = eventOrResult.headers;
  const keyPrefix = isResult ? "" : MIDDLEWARE_HEADER_PREFIX;
  Object.entries(middlewareHeaders).forEach(([key, value]) => {
    if (value) {
      headers[keyPrefix + key] = Array.isArray(value) ? value.join(",") : value;
    }
  });
}
async function routingHandler(event, { assetResolver }) {
  try {
    for (const [openNextGeoName, nextGeoName] of Object.entries(geoHeaderToNextHeader)) {
      const value = event.headers[openNextGeoName];
      if (value) {
        event.headers[nextGeoName] = value;
      }
    }
    for (const key of Object.keys(event.headers)) {
      if (key.startsWith(INTERNAL_HEADER_PREFIX) || key.startsWith(MIDDLEWARE_HEADER_PREFIX)) {
        delete event.headers[key];
      }
    }
    let headers = getNextConfigHeaders(event, ConfigHeaders);
    let eventOrResult = fixDataPage(event, BuildId);
    if (isInternalResult(eventOrResult)) {
      return eventOrResult;
    }
    const redirect = handleRedirects(eventOrResult, RoutesManifest.redirects);
    if (redirect) {
      redirect.headers.Location = normalizeLocationHeader(redirect.headers.Location, event.url, true);
      debug("redirect", redirect);
      return redirect;
    }
    const middlewareEventOrResult = await handleMiddleware(
      eventOrResult,
      // We need to pass the initial search without any decoding
      // TODO: we'd need to refactor InternalEvent to include the initial querystring directly
      // Should be done in another PR because it is a breaking change
      new URL(event.url).search
    );
    if (isInternalResult(middlewareEventOrResult)) {
      return middlewareEventOrResult;
    }
    const middlewareHeadersPrioritized = globalThis.openNextConfig.dangerous?.middlewareHeadersOverrideNextConfigHeaders ?? false;
    if (middlewareHeadersPrioritized) {
      headers = {
        ...headers,
        ...middlewareEventOrResult.responseHeaders
      };
    } else {
      headers = {
        ...middlewareEventOrResult.responseHeaders,
        ...headers
      };
    }
    let isExternalRewrite = middlewareEventOrResult.isExternalRewrite ?? false;
    eventOrResult = middlewareEventOrResult;
    if (!isExternalRewrite) {
      const beforeRewrite = handleRewrites(eventOrResult, RoutesManifest.rewrites.beforeFiles);
      eventOrResult = beforeRewrite.internalEvent;
      isExternalRewrite = beforeRewrite.isExternalRewrite;
      if (!isExternalRewrite) {
        const assetResult = await assetResolver?.maybeGetAssetResult?.(eventOrResult);
        if (assetResult) {
          applyMiddlewareHeaders(assetResult, headers);
          return assetResult;
        }
      }
    }
    const foundStaticRoute = staticRouteMatcher(eventOrResult.rawPath);
    const isStaticRoute = !isExternalRewrite && foundStaticRoute.length > 0;
    if (!(isStaticRoute || isExternalRewrite)) {
      const afterRewrite = handleRewrites(eventOrResult, RoutesManifest.rewrites.afterFiles);
      eventOrResult = afterRewrite.internalEvent;
      isExternalRewrite = afterRewrite.isExternalRewrite;
    }
    let isISR = false;
    if (!isExternalRewrite) {
      const fallbackResult = handleFallbackFalse(eventOrResult, PrerenderManifest);
      eventOrResult = fallbackResult.event;
      isISR = fallbackResult.isISR;
    }
    const foundDynamicRoute = dynamicRouteMatcher(eventOrResult.rawPath);
    const isDynamicRoute = !isExternalRewrite && foundDynamicRoute.length > 0;
    if (!(isDynamicRoute || isStaticRoute || isExternalRewrite)) {
      const fallbackRewrites = handleRewrites(eventOrResult, RoutesManifest.rewrites.fallback);
      eventOrResult = fallbackRewrites.internalEvent;
      isExternalRewrite = fallbackRewrites.isExternalRewrite;
    }
    const isNextImageRoute = eventOrResult.rawPath.startsWith("/_next/image");
    const isRouteFoundBeforeAllRewrites = isStaticRoute || isDynamicRoute || isExternalRewrite;
    if (!(isRouteFoundBeforeAllRewrites || isNextImageRoute || // We need to check again once all rewrites have been applied
    staticRouteMatcher(eventOrResult.rawPath).length > 0 || dynamicRouteMatcher(eventOrResult.rawPath).length > 0)) {
      eventOrResult = {
        ...eventOrResult,
        rawPath: "/404",
        url: constructNextUrl(eventOrResult.url, "/404"),
        headers: {
          ...eventOrResult.headers,
          "x-middleware-response-cache-control": "private, no-cache, no-store, max-age=0, must-revalidate"
        }
      };
    }
    if (globalThis.openNextConfig.dangerous?.enableCacheInterception && !isInternalResult(eventOrResult)) {
      debug("Cache interception enabled");
      eventOrResult = await cacheInterceptor(eventOrResult);
      if (isInternalResult(eventOrResult)) {
        applyMiddlewareHeaders(eventOrResult, headers);
        return eventOrResult;
      }
    }
    applyMiddlewareHeaders(eventOrResult, headers);
    const resolvedRoutes = [
      ...foundStaticRoute,
      ...foundDynamicRoute
    ];
    debug("resolvedRoutes", resolvedRoutes);
    return {
      internalEvent: eventOrResult,
      isExternalRewrite,
      origin: false,
      isISR,
      resolvedRoutes,
      initialURL: event.url,
      locale: NextConfig.i18n ? detectLocale(eventOrResult, NextConfig.i18n) : void 0,
      rewriteStatusCode: middlewareEventOrResult.rewriteStatusCode
    };
  } catch (e) {
    error("Error in routingHandler", e);
    return {
      internalEvent: {
        type: "core",
        method: "GET",
        rawPath: "/500",
        url: constructNextUrl(event.url, "/500"),
        headers: {
          ...event.headers
        },
        query: event.query,
        cookies: event.cookies,
        remoteAddress: event.remoteAddress
      },
      isExternalRewrite: false,
      origin: false,
      isISR: false,
      resolvedRoutes: [],
      initialURL: event.url,
      locale: NextConfig.i18n ? detectLocale(event, NextConfig.i18n) : void 0
    };
  }
}
function isInternalResult(eventOrResult) {
  return eventOrResult != null && "statusCode" in eventOrResult;
}

// node_modules/@opennextjs/aws/dist/adapters/middleware.js
globalThis.internalFetch = fetch;
globalThis.__openNextAls = new AsyncLocalStorage();
var defaultHandler = async (internalEvent, options) => {
  const middlewareConfig = globalThis.openNextConfig.middleware;
  const originResolver = await resolveOriginResolver(middlewareConfig?.originResolver);
  const externalRequestProxy = await resolveProxyRequest(middlewareConfig?.override?.proxyExternalRequest);
  const assetResolver = await resolveAssetResolver(middlewareConfig?.assetResolver);
  const requestId = Math.random().toString(36);
  return runWithOpenNextRequestContext({
    isISRRevalidation: internalEvent.headers["x-isr"] === "1",
    waitUntil: options?.waitUntil,
    requestId
  }, async () => {
    const result = await routingHandler(internalEvent, { assetResolver });
    if ("internalEvent" in result) {
      debug("Middleware intercepted event", internalEvent);
      if (!result.isExternalRewrite) {
        const origin = await originResolver.resolve(result.internalEvent.rawPath);
        return {
          type: "middleware",
          internalEvent: {
            ...result.internalEvent,
            headers: {
              ...result.internalEvent.headers,
              [INTERNAL_HEADER_INITIAL_URL]: internalEvent.url,
              [INTERNAL_HEADER_RESOLVED_ROUTES]: JSON.stringify(result.resolvedRoutes),
              [INTERNAL_EVENT_REQUEST_ID]: requestId,
              [INTERNAL_HEADER_REWRITE_STATUS_CODE]: String(result.rewriteStatusCode)
            }
          },
          isExternalRewrite: result.isExternalRewrite,
          origin,
          isISR: result.isISR,
          initialURL: result.initialURL,
          resolvedRoutes: result.resolvedRoutes
        };
      }
      try {
        return externalRequestProxy.proxy(result.internalEvent);
      } catch (e) {
        error("External request failed.", e);
        return {
          type: "middleware",
          internalEvent: {
            ...result.internalEvent,
            headers: {
              ...result.internalEvent.headers,
              [INTERNAL_EVENT_REQUEST_ID]: requestId
            },
            rawPath: "/500",
            url: constructNextUrl(result.internalEvent.url, "/500"),
            method: "GET"
          },
          // On error we need to rewrite to the 500 page which is an internal rewrite
          isExternalRewrite: false,
          origin: false,
          isISR: result.isISR,
          initialURL: result.internalEvent.url,
          resolvedRoutes: [{ route: "/500", type: "page" }]
        };
      }
    }
    if (process.env.OPEN_NEXT_REQUEST_ID_HEADER || globalThis.openNextDebug) {
      result.headers[INTERNAL_EVENT_REQUEST_ID] = requestId;
    }
    debug("Middleware response", result);
    return result;
  });
};
var handler2 = await createGenericHandler({
  handler: defaultHandler,
  type: "middleware"
});
var middleware_default = {
  fetch: handler2
};
export {
  middleware_default as default,
  handler2 as handler
};
