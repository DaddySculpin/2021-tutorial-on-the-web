// wait for child element to appear on target element
export async function waitForElement(targetElement, elId, timeout = 5000) {
  const results = await Promise.race([
    new Promise(resolve => {
      let observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          for (const el of mutation.addedNodes) {
            if (el.id === elId) {
              resolve(true);
            }
          }
        });
      });
      observer.observe(targetElement, { childList: true });
    }),
    new Promise(resolve => {
      setTimeout(resolve, timeout);
    })
  ]);
  return results;
}

// Based on the following:
// https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide
export function checkAutoplay() {
  return new Promise(resolve => {
    const audio = new Audio();
    audio.autoplay = true;
    audio.volume = 0;
    audio.src =
      'data:audio/mpeg;base64,/+MYxAAAAANIAUAAAASEEB/jwOFM/0MM/90b/+RhST//w4NFwOjf///PZu////9lns5GFDv//l9GlUIEEIAAAgIg8Ir/JGq3/+MYxDsLIj5QMYcoAP0dv9HIjUcH//yYSg+CIbkGP//8w0bLVjUP///3Z0x5QCAv/yLjwtGKTEFNRTMuOTeqqqqqqqqqqqqq/+MYxEkNmdJkUYc4AKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';
    audio
      .play()
      .then(() => resolve(true))
      .catch(() => resolve(false));
  });
}

export function getRequestArgs() {
  var argStrings = location.search.substr(1).split('\u0026');
  var args = new Object();
  for (var iArg = 0; iArg < argStrings.length; iArg++) {
    var keyAndValue = argStrings[iArg].split('=');
    args[keyAndValue[0]] = keyAndValue[1];
  }
  return args;
}
