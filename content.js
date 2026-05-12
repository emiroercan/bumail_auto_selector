(function () {
    const SERVERS = {
        personel: "ssl://imap.bogazici.edu.tr",
        student:  "ssl://imap.std.bogazici.edu.tr",
        pt:       "imap.pt.bogazici.edu.tr",
        emekli:   "imap-retired.boun.edu.tr"
    };

    const DEFAULTS = { server: "student", autoSubmit: true };

    let done = false;
    let observer = null;

    function setServer(select, value) {
        if (select.value === value) return true;
        const opt = Array.from(select.options).find(o => o.value === value);
        if (!opt) return false;

        select.value = value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        if (window.jQuery) {
            try { window.jQuery(select).trigger("change"); } catch (e) {}
        }
        return true;
    }

    function submitLogin() {
        const btn  = document.getElementById("rcmloginsubmit");
        const form = document.getElementById("login-form");
        if (btn) btn.click();
        else if (form) form.submit();
    }

    function armSubmitOnFirstInteraction() {
        // Wait for any real user interaction (trusted event), then submit.
        // By that point Chrome has committed autofilled values.
        const handler = (e) => {
            if (!e.isTrusted) return;                    // ignore synthetic events
            // If the user is genuinely typing into a field, let them finish —
            // unless they pressed Enter (which means "go").
            if (e.type === "keydown" && e.key !== "Enter" &&
                (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) {
                // Only fire once both fields have content
                const user = document.getElementById("rcmloginuser");
            const pass = document.getElementById("rcmloginpwd");
            if (!user?.value || !pass?.value) return;
                }
                cleanup();
            setTimeout(submitLogin, 50);
        };

        function cleanup() {
            document.removeEventListener("keydown", handler, true);
            document.removeEventListener("click",   handler, true);
        }

        document.addEventListener("keydown", handler, true);
        document.addEventListener("click",   handler, true);

        // Stop listening after 60s to avoid lingering handlers
        setTimeout(cleanup, 60000);
    }

    function run({ server, autoSubmit }) {
        if (done) return;
        const select = document.getElementById("rcmloginhost");
        if (!select) return;

        const value = SERVERS[server] || SERVERS.student;
        if (!setServer(select, value)) return;

        done = true;
        if (observer) { observer.disconnect(); observer = null; }

        // Focus password — autofill will visually pre-fill it,
        // and pressing Enter immediately submits.
        const pass = document.getElementById("rcmloginpwd");
        const user = document.getElementById("rcmloginuser");
        (pass || user)?.focus();

        if (autoSubmit) armSubmitOnFirstInteraction();
    }

    chrome.storage.sync.get(DEFAULTS, prefs => {
        run(prefs);
        if (done) return;

        observer = new MutationObserver(() => run(prefs));
        observer.observe(document.body || document.documentElement, {
            childList: true,
            subtree: true
        });
        setTimeout(() => {
            if (observer) { observer.disconnect(); observer = null; }
        }, 10000);
    });
})();
