const suggestionBox = document.createElement('div');
suggestionBox.className = 'llama-autocomplete-box';
document.body.appendChild(suggestionBox);

// 防抖函數
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function showSuggestions(suggestion, inputElement) {
  if (!suggestion) {
    suggestionBox.style.display = 'none';
    currentSuggestion = null;
    return;
  }

  const currentText = inputElement.value;
  currentSuggestion = suggestion;
  suggestionBox.textContent = suggestion;
  suggestionBox.style.display = 'block';

  // Position the suggestion box blow the input element
  const rect = inputElement.getBoundingClientRect();
  console.log(rect);

  suggestionBox.style.top = `${rect.top + rect.height}px`;
  suggestionBox.style.left = `${rect.left}px`;
  suggestionBox.style.width = `${rect.width}px`;

  suggestionBox.onclick = () => {
    inputElement.value = currentText + suggestion;
    suggestionBox.style.display = 'none';
    currentSuggestion = null;
  };
}

// 使用防抖包裝事件監聽器
const debouncedInputHandler = debounce(function (e) {
  const text = e.target.value;
  console.log('Input text:', text);

  // Send text to server
  chrome.runtime.sendMessage({ action: 'sendText', text: text }, response => {
    if (response && response.error) {
      console.error('Error sending text:', response.error);
    } else {
      console.log('Text sent successfully:', response);
    }
  });

  document.addEventListener('keydown', function (k) {
    if (k.metaKey && k.key === 'i') {
      console.log('Command + I pressed');
      console.log(e.target.value);

      chrome.runtime.sendMessage({ action: 'recommend', text: e.target.value }, response => {
        if (response && response.error) {
          console.error('Error sending text:', response.error);
        } else {
          console.log('Text sent successfully:', response);
          showSuggestions(response, e.target);
        }
      });
    }
  });

}, 5000);

document.addEventListener('input', debouncedInputHandler);