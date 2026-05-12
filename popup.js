const DEFAULTS = { server: "student", autoSubmit: true };

const serverEl = document.getElementById("server");
const autoEl   = document.getElementById("autoSubmit");
const savedEl  = document.getElementById("saved");

function flashSaved() {
    savedEl.textContent = "Saved.";
    clearTimeout(flashSaved._t);
    flashSaved._t = setTimeout(() => (savedEl.textContent = ""), 1000);
}

chrome.storage.sync.get(DEFAULTS, prefs => {
    serverEl.value = prefs.server;
    autoEl.checked = !!prefs.autoSubmit;
});

serverEl.addEventListener("change", () => {
    chrome.storage.sync.set({ server: serverEl.value }, flashSaved);
});
autoEl.addEventListener("change", () => {
    chrome.storage.sync.set({ autoSubmit: autoEl.checked }, flashSaved);
});
