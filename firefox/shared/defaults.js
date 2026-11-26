const YOUTUBE_CLEAN_KEY = "youtubeClean";

const youtubeCleanStorage = globalThis.browser?.storage?.sync
    ? globalThis.browser.storage
    : globalThis.chrome?.storage;

const YOUTUBE_CLEAN_DEFAULTS = {
    active: true,
    ads: {
        blockVideo: true,
        hidePage: true,
    },
    shorts: {
        redirect: true,
        hideTab: false,
        hideFeed: true,
    },
    focus: {
        hideFeed: false,
        hideRecommended: false,
        hideTrending: false,
        hideSubBar: false,
        hideNotificationBell: false,
        hideRelated: true,
        hideComments: false,
        hideLiveChat: false,
        hideMerch: false,
        disableAutoplay: true,
        disablePlaylists: false,
        hideSidebar: false,
        hideNonLists: false,
    },
};

function youtubeCleanMerge(base, extra) {
    if (extra == null || typeof extra !== "object") {
        return JSON.parse(JSON.stringify(base));
    }
    const merged = {};
    for (const key of Object.keys(base)) {
        if (base[key] !== null && typeof base[key] === "object") {
            merged[key] = youtubeCleanMerge(base[key], extra[key]);
        } else if (typeof extra[key] === typeof base[key]) {
            merged[key] = extra[key];
        } else {
            merged[key] = base[key];
        }
    }
    return merged;
}
