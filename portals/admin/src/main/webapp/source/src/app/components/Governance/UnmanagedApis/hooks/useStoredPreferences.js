/*
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0.
 */

import { useEffect, useState } from 'react';

/**
 * Versioned localStorage key for the Unmanaged APIs filter preferences.
 * Bump the .v1 suffix on shape changes; old data is silently ignored
 * because the JSON.parse spread merges into defaults.
 */
const STORAGE_KEY = 'apim.admin.governance.unmanaged_apis.prefs.v1';

/**
 * useStoredPreferences syncs a state object to localStorage under
 * STORAGE_KEY. Returns [state, setState] just like useState.
 *
 * Reads happen once on mount; any storage exception (full disk, disabled
 * storage, JSON corruption) silently falls back to defaults so the UI
 * always loads. Writes happen on every state change; failures are
 * swallowed so a bad write never breaks the React render.
 *
 * @param {object} defaults default preferences shape
 * @returns {[object, (next: object) => void]} state and setter
 */
export default function useStoredPreferences(defaults) {
    const [state, setState] = useState(() => {
        try {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            if (!stored) {
                return defaults;
            }
            return { ...defaults, ...JSON.parse(stored) };
        } catch (e) {
            return defaults;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            // Storage may be full or disabled (Safari private mode);
            // fall through silently.
        }
    }, [state]);

    return [state, setState];
}
