export function generateID(length: number) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/**
 * Async javascript sleep function.
 * @param delay_ms The delay in milliseconds
 * @returns An awaitable promise that is resolved after delay_ms milliseconds.
 */
export function sleep(delay_ms: number) {
  return new Promise(resolve => setTimeout(resolve, delay_ms));
}