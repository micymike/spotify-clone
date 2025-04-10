/**
 * @typedef {Object} Track
 * @property {string} id
 * @property {string} title
 * @property {string} artist
 * @property {string} thumbnail
 * @property {'youtube'|'jamendo'} source
 * @property {string} url
 */

/**
 * @typedef {Object} Playlist
 * @property {string} id
 * @property {string} name
 * @property {string} [description]
 * @property {Track[]} tracks
 * @property {string} [thumbnail]
 */

/**
 * @typedef {Object} MusicCardProps
 * @property {string} id
 * @property {string} title
 * @property {string} artist
 * @property {string} thumbnail
 * @property {'youtube'|'jamendo'} source
 * @property {string} url
 * @property {boolean} isPlaying
 */

/**
 * @typedef {Object} LayoutProps
 * @property {React.ReactNode} children
 */

/**
 * @typedef {Object} SidebarProps
 * @property {boolean} [isActive]
 */

export {};
