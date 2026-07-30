/*
 * Shared helpers for handling vhost details across environment components.
 */

/**
 * Returns true when websocket (ws) host/port is missing.
 * @param {Object} vhost VHost object
 * @returns {boolean}
 */
export const wsDisabled = (vhost) => vhost?.wsPort === null && vhost?.wsHost === null;

/**
 * Returns true when secure websocket (wss) host/port is missing.
 * @param {Object} vhost VHost object
 * @returns {boolean}
 */
export const wssDisabled = (vhost) => vhost?.wssPort === null && vhost?.wssHost === null;

/**
 * Checks whether any websocket ports (ws or wss) are available.
 * @param {Object} vhost VHost object
 * @returns {boolean}
 */
export const hasValidWebSocketPorts = (vhost) => {
    if (!vhost) {
        return false;
    }
    return !wsDisabled(vhost) || !wssDisabled(vhost);
};

/**
 * Checks whether an environment has at least one valid vhost for the API type.
 * @param {Object} environment Environment object containing vhosts
 * @param {boolean} isWebSocket Whether the API is a websocket API
 * @returns {boolean}
 */
export const hasValidHosts = (environment, isWebSocket) => {
    if (!environment?.vhosts || environment.vhosts.length === 0) {
        return false;
    }
    return environment.vhosts.some((vhost) => !isWebSocket || hasValidWebSocketPorts(vhost));
};

/**
 * Get the host value based on the API type and available ports.
 * @param {Object} vhost VHost object
 * @param {boolean} isWebSocket Whether the API is a websocket API
 * @returns {string}
 */
export const getHostValue = (vhost, isWebSocket) => {
    if (!isWebSocket) {
        return vhost.host;
    }
    if (wsDisabled(vhost) && !wssDisabled(vhost)) {
        return vhost.wssHost;
    }
    return vhost.wsHost;
};
