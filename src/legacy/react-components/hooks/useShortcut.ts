import { useCallback } from 'react';
import React from 'react';
import { KeyType, ShortcutManager } from '@talxis/client-libraries';

export const useShortcut = (
    callback?: (entry: KeyboardEvent) => void
) => {
    const callbackRef = React.useRef(callback);
    const shortcutsRef = React.useRef<KeyType[] | null>(null);
    callbackRef.current = callback

    const subscribeCallback = useCallback((entry: KeyboardEvent) => {
        callbackRef.current?.(entry);
    }, []);

    const subscribe = (shortcuts: KeyType[]) => {
        if (shortcuts.length > 0 && callback) {
            shortcutsRef.current = shortcuts;
            ShortcutManager.subscribe(shortcuts, subscribeCallback);
        }
    };

    React.useEffect(() => {
        return () => {
            if (shortcutsRef.current) {
                ShortcutManager.unsubscribe(shortcutsRef.current, subscribeCallback);
            }
        };
    }, []);

    return subscribe;
};
