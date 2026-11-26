let settings = youtubeCleanMerge(YOUTUBE_CLEAN_DEFAULTS, null);
let observer = null;
let adTimer = null;
let autoplayTimers = [];
let adPlayback = null;

const RECOMMENDED_TITLES = new Set([
    "recommended",
    "recomendados",
    "recomendaciones",
    "recommended videos",
    "videos recomendados",
]);

const SHORTS_ITEM_TAGS = new Set([
    "YTD-VIDEO-RENDERER",
    "YTD-GRID-VIDEO-RENDERER",
    "YTD-RICH-ITEM-RENDERER",
    "YTM-VIDEO-WITH-CONTEXT-RENDERER",
]);

const SKIP_SELECTORS = [
    ".ytp-ad-skip-button-modern",
    ".ytp-ad-skip-button",
    ".ytp-skip-ad-button",
    ".videoAdUiSkipButton",
    "ytp-ad-skip-button-container",
    "ytp-ad-skip-button-slot",
];

const FEATURE_CLASSES = {
    "yc-hide-page-ads": () => settings.active && settings.ads.hidePage,
    "yc-block-video-ads": () => settings.active && settings.ads.blockVideo,
    "yc-hide-shorts-tab": () => settings.active && settings.shorts.hideTab,
    "yc-hide-shorts-feed": () => settings.active && settings.shorts.hideFeed,
    "yc-hide-feed": () => settings.active && settings.focus.hideFeed,
    "yc-hide-recommended": () => settings.active && settings.focus.hideRecommended,
    "yc-hide-trending": () => settings.active && settings.focus.hideTrending,
    "yc-hide-subbar": () => settings.active && settings.focus.hideSubBar,
    "yc-hide-bell": () => settings.active && settings.focus.hideNotificationBell,
    "yc-hide-related": () => settings.active && settings.focus.hideRelated,
    "yc-hide-comments": () => settings.active && settings.focus.hideComments,
    "yc-hide-chat": () => settings.active && settings.focus.hideLiveChat,
    "yc-hide-merch": () => settings.active && settings.focus.hideMerch,
    "yc-hide-sidebar": () => settings.active && settings.focus.hideSidebar,
    "yc-hide-nonlists": () => settings.active && settings.focus.hideNonLists,
};

function toWatchUrl(url) {
    try {
        const parsed = new URL(url, location.origin);
        const match = parsed.pathname.match(/\/shorts\/([\w-]{11})/);
        if (!match) return null;
        return `https://www.youtube.com/watch?v=${match[1]}`;
    } catch {
        return null;
    }
}

function redirectShorts(url, fromNavigate) {
    if (!(settings.active && settings.shorts.redirect)) return;
    const next = toWatchUrl(url);
    if (!next) return;
    if (fromNavigate) {
        history.back();
        location.href = next;
        return;
    }
    if (toWatchUrl(location.href)) location.replace(next);
}

function applyClasses() {
    const root = document.documentElement;
    for (const [className, enabled] of Object.entries(FEATURE_CLASSES)) {
        root.classList.toggle(className, Boolean(enabled()));
    }
}

function markShorts() {
    const shelves = document.querySelectorAll(
        "ytd-reel-shelf-renderer, ytm-reel-shelf-renderer, ytd-rich-shelf-renderer:has(h2 > yt-icon:not([hidden])), grid-shelf-view-model:has(ytm-shorts-lockup-view-model)",
    );
    shelves.forEach((shelf) => shelf.classList.add("yc-shorts"));

    const links = document.querySelectorAll(
        "ytd-video-renderer a, ytd-grid-video-renderer a, ytd-rich-item-renderer a, ytm-video-with-context-renderer a",
    );
    links.forEach((link) => {
        if (!link.href || link.href.indexOf("/shorts/") === -1) return;
        let node = link.parentElement;
        while (node) {
            if (SHORTS_ITEM_TAGS.has(node.nodeName)) {
                node.classList.add("yc-shorts");
                break;
            }
            node = node.parentElement;
        }
    });

    document.querySelectorAll("ytd-rich-item-renderer").forEach((item) => {
        const label = item.querySelector("span[aria-label='Shorts'], span[aria-label='shorts']");
        if (label) item.classList.add("yc-shorts");
    });
}

function markRecommended() {
    const titles = document.querySelectorAll(
        "span#title, yt-formatted-string#title, h2 yt-formatted-string",
    );
    titles.forEach((title) => {
        const text = (title.textContent || "").trim().toLowerCase();
        if (!RECOMMENDED_TITLES.has(text)) return;
        const section = title.closest(
            "ytd-rich-section-renderer, ytd-item-section-renderer, ytd-rich-shelf-renderer",
        );
        if (section) section.classList.add("yc-recommended");
    });
}

function stripPlaylist(href) {
    try {
        const url = new URL(href, location.origin);
        if (!url.pathname.includes("/watch")) return href;
        if (!url.searchParams.has("v") || !url.searchParams.has("list")) return href;
        url.searchParams.delete("list");
        url.searchParams.delete("index");
        return url.toString();
    } catch {
        return href;
    }
}

function syncPlaylists() {
    const enabled = settings.active && settings.focus.disablePlaylists;
    const anchors = document.querySelectorAll("a[href*='list='], a[data-yc-original]");
    anchors.forEach((anchor) => {
        if (enabled) {
            if (!anchor.dataset.ycOriginal) anchor.dataset.ycOriginal = anchor.href;
            const next = stripPlaylist(anchor.href);
            if (next !== anchor.href) anchor.href = next;
        } else if (anchor.dataset.ycOriginal) {
            anchor.href = anchor.dataset.ycOriginal;
            delete anchor.dataset.ycOriginal;
        }
    });
}

function cleanBellTitle() {
    if (!(settings.active && settings.focus.hideNotificationBell)) return;
    const clean = document.title.replace(/ *\([0-9]+\)/, "");
    if (clean !== document.title) document.title = clean;
}

function ensureRegularButton() {
    const onShorts = Boolean(toWatchUrl(location.href));
    const show = settings.active && !settings.shorts.redirect && onShorts;
    document.querySelectorAll(".yc-open-regular").forEach((button) => {
        if (!show) button.remove();
    });
    if (!show) return;

    const actions = document.querySelectorAll("#actions.ytd-reel-player-overlay-renderer");
    actions.forEach((action) => {
        if (action.parentElement?.querySelector(".yc-open-regular")) return;
        const button = document.createElement("div");
        button.className = "yc-open-regular";
        button.title = "Abrir en el reproductor normal";
        button.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 -960 960 960"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h560v-280h80v280q0 33-23.5 56.5T760-120H200Zm188-212-56-56 372-372H560v-80h280v280h-80v-144L388-332Z"/></svg>Reproductor';
        button.addEventListener("click", () => {
            document.querySelectorAll("video").forEach((video) => video.pause());
            const next = toWatchUrl(location.href);
            if (next) window.open(next);
        });
        action.insertAdjacentElement("afterbegin", button);
    });
}

function scanPage() {
    if (settings.active && settings.shorts.hideFeed) markShorts();
    if (settings.active && settings.focus.hideRecommended) markRecommended();
    if (settings.active && settings.focus.disablePlaylists) syncPlaylists();
    else if (!settings.focus.disablePlaylists) syncPlaylists();
    cleanBellTitle();
    ensureRegularButton();
}

function syncObserver() {
    const needed =
        settings.active &&
        (settings.shorts.hideFeed ||
            settings.focus.hideRecommended ||
            settings.focus.disablePlaylists ||
            !settings.shorts.redirect ||
            settings.focus.hideNotificationBell);
    if (!needed) {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        return;
    }
    if (observer) return;
    const root = document.documentElement;
    let pending = false;
    observer = new MutationObserver(() => {
        if (pending) return;
        pending = true;
        setTimeout(() => {
            pending = false;
            scanPage();
        }, 200);
    });
    observer.observe(root, { childList: true, subtree: true });
    scanPage();
}

function restoreVideo(video) {
    if (!video || !adPlayback) return;
    video.playbackRate = adPlayback.rate === 10 ? 1 : adPlayback.rate;
    video.volume = adPlayback.volume;
    video.muted = adPlayback.muted;
    adPlayback = null;
}

function skipVideoAd() {
    if (!(settings.active && settings.ads.blockVideo)) return;
    const video = document.querySelector("video");
    const ad = document.querySelector(".ad-showing");
    if (!ad) {
        restoreVideo(video);
        return;
    }
    if (video) {
        if (!adPlayback) {
            adPlayback = {
                rate: video.playbackRate,
                volume: video.volume,
                muted: video.muted,
            };
        }
        video.muted = true;
        video.volume = 0;
        video.playbackRate = 10;
        if (Number.isFinite(video.duration) && video.duration > 0) {
            video.currentTime = video.duration;
        }
        video.play().catch(() => {});
    }
    SKIP_SELECTORS.forEach((selector) => {
        document.querySelectorAll(selector).forEach((button) => button.click());
    });
}

function syncAds() {
    const enabled = settings.active && settings.ads.blockVideo;
    if (!enabled) {
        if (adTimer) {
            clearInterval(adTimer);
            adTimer = null;
        }
        restoreVideo(document.querySelector("video"));
        return;
    }
    if (adTimer) return;
    adTimer = setInterval(skipVideoAd, 200);
}

function clearAutoplayTimers() {
    autoplayTimers.forEach((timer) => clearTimeout(timer));
    autoplayTimers = [];
}

function disableAutoplay() {
    const candidates = [
        document.querySelector("button.ytp-autonav-toggle-button"),
        document.getElementById("toggle"),
        document.getElementById("improved-toggle"),
    ].filter(Boolean);
    for (const control of candidates) {
        const pressed =
            control.getAttribute("aria-checked") ||
            control.getAttribute("aria-pressed");
        if (pressed === "true" || control.hasAttribute("active")) {
            control.click();
            return;
        }
    }
}

function scheduleAutoplay() {
    clearAutoplayTimers();
    if (!(settings.active && settings.focus.disableAutoplay)) return;
    [1000, 3000, 6000].forEach((delay) => {
        autoplayTimers.push(setTimeout(disableAutoplay, delay));
    });
}

function apply() {
    applyClasses();
    redirectShorts(location.href, false);
    syncObserver();
    syncAds();
    syncPlaylists();
    scheduleAutoplay();
    scanPage();
}

function destinationFrom(event) {
    const detail = event.detail || {};
    return detail.url || detail.href || event.target?.baseURI || location.href;
}

document.addEventListener("yt-navigate-start", (event) => {
    redirectShorts(destinationFrom(event), true);
});

document.addEventListener("state-navigatestart", (event) => {
    redirectShorts(destinationFrom(event), true);
});

document.addEventListener("yt-navigate-finish", () => {
    apply();
});

function watchTitle() {
    const titleNode = document.querySelector("title");
    if (!titleNode) {
        document.addEventListener("DOMContentLoaded", watchTitle, { once: true });
        return;
    }
    new MutationObserver(cleanBellTitle).observe(titleNode, {
        childList: true,
        characterData: true,
        subtree: true,
    });
}

watchTitle();

chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync" || !changes[YOUTUBE_CLEAN_KEY]) return;
    settings = youtubeCleanMerge(
        YOUTUBE_CLEAN_DEFAULTS,
        changes[YOUTUBE_CLEAN_KEY].newValue,
    );
    apply();
});

chrome.storage.sync.get(YOUTUBE_CLEAN_KEY).then((data) => {
    settings = youtubeCleanMerge(YOUTUBE_CLEAN_DEFAULTS, data[YOUTUBE_CLEAN_KEY]);
    apply();
});
