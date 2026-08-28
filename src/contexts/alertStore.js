let handler = null;

export function setAlertHandler(fn) {
  handler = fn;
}

export function getAlertHandler() {
  return handler;
}