class EzraFatalError extends Error {
  constructor(...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params)
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
        Error.captureStackTrace(this, EzraFatalError)
    }

      
  }
}

class EzraException extends Error {
    constructor(...params) {
        // Pass remaining arguments (including vendor specific ones) to parent constructor
        super(...params)
        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, EzraException)
        }
    }
}

class EzraSQLException extends EzraException {
    constructor(...params) {
        // Pass remaining arguments (including vendor specific ones) to parent constructor
        super(...params)
        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, EzraException)
        }
        this.stack = params[1].join('\n')
    }
    setStack(_stack) {
        this.stack = _stack;
    }
}

global.exceptions = {
    EzraException: EzraException,
    EzraFatalError: EzraFatalError,
    mergeExceptions: (e1, e2, reverse = true) => {
        var e1stack = e1.stack.split("\n").slice(1)
        if (reverse) {
            e1stack = e1stack.reverse()
        }
        var e2stack = e2.stack.split("\n")
        result = e2stack.slice(0, 1).concat(e1stack).concat(e2stack.slice(1));

        mergedException = new EzraSQLException(e2, result)


        return mergedException
    }
}

class EzraPromise extends Promise {
    constructor(executor) {
        super((resolve, reject) => {
            executor(resolve, new PromiseHijacker(reject))
        })
    }
}

class PromiseHijacker {
    constructor(reject) {
        this.reject = reject;
        return this.hijack.bind(this);
    }
    hijack(err) {
        if (!(err instanceof EzraException || err instanceof EzraFatalError))
            err = new EzraException(err);

        Error.captureStackTrace(err, this.hijack);
        this.reject(err);
    }
}


global.Promise = EzraPromise;

