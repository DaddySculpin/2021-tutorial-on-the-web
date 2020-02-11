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
