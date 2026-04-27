const yearTarget = document.querySelector("[data-current-year]");
if (yearTarget) yearTarget.textContent = String(new Date().getFullYear());

const copyButtons = Array.from(document.querySelectorAll("[data-copy-text]"));
copyButtons.forEach((button) => {
    const originalLabel = button.textContent ? button.textContent.trim() : "Copy";
    const copyValue = button.getAttribute("data-copy-text") || "";
    const successLabel = button.getAttribute("data-copy-success") || "Copied";
    const failureLabel = button.getAttribute("data-copy-failure") || "Failed";

    button.addEventListener("click", async () => {
        if (!copyValue) return;
        try {
            await navigator.clipboard.writeText(copyValue);
            button.textContent = successLabel;
            button.classList.add("is-copied");
            setTimeout(() => {
                button.textContent = originalLabel;
                button.classList.remove("is-copied");
            }, 1800);
        } catch (error) {
            button.textContent = failureLabel;
            setTimeout(() => button.textContent = originalLabel, 1800);
        }
    });
});

const downloadModal = document.querySelector("[data-download-modal]");
const downloadFrame = document.querySelector("[data-download-frame]");
const downloadLinks = Array.from(document.querySelectorAll('a[href="https://github.com/marbleheraldignite/Unex-Core/releases/download/Unex-27-04-2026/UnexLoader_V4.zip"]'));
const downloadCloseTargets = Array.from(document.querySelectorAll("[data-download-close]"));
let lastFocusedDownloadLink = null;

function closeDownloadModal() {
    if (!downloadModal) return;
    downloadModal.classList.remove("is-open");
    downloadModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (lastFocusedDownloadLink instanceof HTMLElement) lastFocusedDownloadLink.focus();
}

function openDownloadModal(trigger) {
    if (!downloadModal) return;
    lastFocusedDownloadLink = trigger instanceof HTMLElement ? trigger : null;
    downloadModal.classList.add("is-open");
    downloadModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
}

if (downloadModal && downloadLinks.length > 0) {
    downloadLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const href = link.getAttribute("href");
            if (!href) return;
            openDownloadModal(link);
            const separator = href.includes("?") ? "&" : "?";
            const requestUrl = `${href}${separator}from=site&t=${Date.now()}`;
            if (downloadFrame) {
                downloadFrame.setAttribute("src", requestUrl);
            } else {
                window.location.href = requestUrl;
            }
        });
    });

    downloadCloseTargets.forEach(node => node.addEventListener("click", closeDownloadModal));
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && downloadModal.classList.contains("is-open")) closeDownloadModal();
    });
}

const editorRoot = document.querySelector("[data-editor-root]");
if (editorRoot) {
    const editorBody = editorRoot.querySelector("[data-editor-body]");
    const editorTabs = Array.from(editorRoot.querySelectorAll("[data-editor-tab]"));

    const editorFiles = {
        "main.lua": [
            { type: "comment", text: "-- Launch profile bound to direct mode" },
            { tokens: [["keyword", "local"], ["plain", " studio "], ["operator", "="], ["plain", " "], ["function", "require"], ["plain", "("], ["string", "\"Unex.core\""], ["plain", ")"]] },
            { type: "gap" },
            { tokens: [["plain", "studio."], ["function", "mount"], ["plain", "({"]] },
            { indent: true, tokens: [["plain", "channel "], ["operator", "="], ["plain", " "], ["string", "\"live\""], ["plain", ","]] },
            { indent: true, tokens: [["plain", "titles "], ["operator", "="], ["plain", " "], ["number", "9"], ["plain", ","]] },
            { indent: true, tokens: [["plain", "delivery "], ["operator", "="], ["plain", " "], ["string", "\"direct\""], ["plain", ","]] },
            { tokens: [["plain", "})"]] },
            { type: "gap" },
            { live: true, tokens: [["function", "print"], ["plain", "("], ["string", "\"Launcher ready\""], ["plain", ")"]] }
        ],
        "config.json": [
            { tokens: [["plain", "{"]] },
            { indent: true, tokens: [["string", "\"theme\""], ["plain", ": "], ["string", "\"obsidian\""], ["plain", ","]] },
            { indent: true, tokens: [["string", "\"password\""], ["plain", ": "], ["string", "\"Unex\""], ["plain", ","]] },
            { indent: true, tokens: [["string", "\"downloadRoute\""], ["plain", ": "], ["string", "\"direct\""], ["plain", ","]] },
            { indent: true, tokens: [["string", "\"supportedTitles\""], ["plain", ": "], ["number", "9"], ["plain", ","]] },
            { indent: true, live: true, tokens: [["string", "\"buildStatus\""], ["plain", ": "], ["string", "\"ready\""]] },
            { tokens: [["plain", "}"]] }
        ],
        "init.lua": [
            { type: "comment", text: "-- Auto-load on launcher start" },
            { tokens: [["keyword", "local"], ["plain", " sync "], ["operator", "="], ["plain", " "], ["function", "require"], ["plain", "("], ["string", "\"Unex.sync\""], ["plain", ")"]] },
            { type: "gap" },
            { tokens: [["plain", "sync."], ["function", "watch"], ["plain", "("], ["string", "\"launcher.lua\""], ["plain", ", "], ["keyword", "function"], ["plain", "(file)"]] },
            { indent: true, tokens: [["function", "print"], ["plain", "("], ["string", "\"[reload]\""], ["plain", ", file)"]] },
            { live: true, tokens: [["plain", "end)"]] }
        ]
    };

    const sleep = (ms) => new Promise(res => setTimeout(res, ms));
    let renderTicket = 0;

    async function typeInto(element, text, ticket) {
        for (const char of text) {
            if (ticket !== renderTicket) return false;
            element.textContent += char;
            await sleep(8);
        }
        return true;
    }

    async function renderEditor(tabName) {
        if (!editorBody || !editorFiles[tabName]) return;
        renderTicket++;
        const ticket = renderTicket;
        editorBody.innerHTML = "";

        for (const line of editorFiles[tabName]) {
            if (ticket !== renderTicket) return;
            if (line.type === "gap") {
                const gap = document.createElement("div");
                gap.className = "editor-gap";
                editorBody.appendChild(gap);
                continue;
            }
            const row = document.createElement("div");
            row.className = "editor-line";
            if (line.type === "comment") {
                row.classList.add("editor-line-comment");
                editorBody.appendChild(row);
                if (!(await typeInto(row, line.text || "", ticket))) return;
                continue;
            }
            if (line.indent) row.classList.add("editor-line-indent");
            if (line.live) row.classList.add("editor-line-live");
            editorBody.appendChild(row);

            for (const token of line.tokens || []) {
                const span = document.createElement("span");
                span.className = `token-${token[0]}`;
                row.appendChild(span);
                if (!(await typeInto(span, token[1], ticket))) return;
            }
            await sleep(26);
        }
    }

    function activateTab(tabName) {
        editorTabs.forEach((tab) => {
            const isActive = tab.getAttribute("data-editor-tab") === tabName;
            tab.classList.toggle("is-active", isActive);
            tab.setAttribute("aria-selected", String(isActive));
        });
        void renderEditor(tabName);
    }

    editorTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const tabName = tab.getAttribute("data-editor-tab");
            if (tabName) activateTab(tabName);
        });
    });

    activateTab("main.lua");
}