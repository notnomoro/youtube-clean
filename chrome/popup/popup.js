let state = youtubeCleanMerge(YOUTUBE_CLEAN_DEFAULTS, null);

const storage = {
    async load() {
        if (globalThis.chrome?.storage?.sync) {
            const data = await chrome.storage.sync.get(YOUTUBE_CLEAN_KEY);
            return youtubeCleanMerge(YOUTUBE_CLEAN_DEFAULTS, data[YOUTUBE_CLEAN_KEY]);
        }
        const raw = localStorage.getItem(YOUTUBE_CLEAN_KEY);
        return youtubeCleanMerge(
            YOUTUBE_CLEAN_DEFAULTS,
            raw ? JSON.parse(raw) : null,
        );
    },
    async save(next) {
        if (globalThis.chrome?.storage?.sync) {
            await chrome.storage.sync.set({ [YOUTUBE_CLEAN_KEY]: next });
            return;
        }
        localStorage.setItem(YOUTUBE_CLEAN_KEY, JSON.stringify(next));
    },
};

function readPath(source, path) {
    return path.split(".").reduce((current, key) => current[key], source);
}

function writePath(source, path, value) {
    const keys = path.split(".");
    let current = source;
    for (let index = 0; index < keys.length - 1; index += 1) {
        current = current[keys[index]];
    }
    current[keys[keys.length - 1]] = value;
}

function showScreen(name) {
    document.querySelectorAll("[data-screen]").forEach((screen) => {
        screen.hidden = screen.dataset.screen !== name;
    });
}

function paintSwitch(button, enabled) {
    button.setAttribute("aria-checked", String(enabled));
    button.querySelector(".switch-art").src = enabled
        ? "../assets/switch-on.svg"
        : "../assets/switch-off.svg";
}

function render() {
    const protect = document.querySelector("[data-toggle='active']");
    protect.classList.toggle("is-off", !state.active);
    protect.querySelector(".protect-sub").textContent = state.active
        ? "YouTube más limpio en esta pestaña"
        : "Protección en pausa";
    paintSwitch(protect, state.active);

    document.querySelectorAll("[data-option]").forEach((row) => {
        paintSwitch(row, Boolean(readPath(state, row.dataset.option)));
    });
}

const ready = storage.load().then((loaded) => {
    state = loaded;
    render();
});

document.addEventListener("click", async (event) => {
    const target = event.target instanceof Element ? event.target : event.target.parentElement;
    if (!target) return;
    await ready;

    const nav = target.closest("[data-nav]");
    if (nav) {
        showScreen(nav.dataset.nav);
        return;
    }
    if (target.closest("[data-back]")) {
        showScreen("home");
        return;
    }
    if (target.closest("[data-toggle='active']")) {
        state.active = !state.active;
        render();
        await storage.save(state);
        return;
    }
    const option = target.closest("[data-option]");
    if (option) {
        const path = option.dataset.option;
        writePath(state, path, !readPath(state, path));
        render();
        await storage.save(state);
    }
});
