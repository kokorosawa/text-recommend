import { sendTextToServer } from './extension/api/sendTextToServer.js';
import { recommend } from './extension/api/recommend.js';

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'sendText') {
    sendTextToServer(request.text)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ error: error.message }));
    return true; // Will respond asynchronously
  }

  if (request.action === 'recommend') {
    recommend(request.text)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ error: error.message }));
    return true; // Will respond asynchronously
  }
});