// Simple, clean stub using native globalThis.DOMException in Node.js environment
// to remove the deprecated third-party dependency warning.
const NativeDOMException = globalThis.DOMException || class DOMException extends Error {
  constructor(message, name) {
    super(message);
    this.name = name || "DOMException";
  }
};

module.exports = NativeDOMException;
