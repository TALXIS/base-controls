import React, { useMemo } from 'react';
import { getKeyboardShortcutHintStyles } from './styles';
import { useTheme, Text } from '@fluentui/react';
import { useShortcut } from '@legacy/hooks';
import { Client, Keys, KeyType, SystemPlatform } from '@talxis/client-libraries';

export const keyMappings: { [key: string]: { [key: string]: string } } = {
    mac: {
        ControlLeft: '⌃',
        ControlRight: '⌃',
        ForceControlLeft: '⌃',
        ForceControlRight: '⌃',
        AltLeft: '⌥',
        AltRight: '⌥',
        MetaLeft: '⌘',
        MetaRight: '⌘',
        ShiftLeft: '⇧',
        ShiftRight: '⇧'
    },
    windows: {
        ControlLeft: 'Ctrl',
        ControlRight: 'Ctrl',
        ForceControlLeft: 'Ctrl',
        ForceControlRight: 'Ctrl',
        AltLeft: 'Alt',
        AltRight: 'Alt',
        MetaLeft: '⊞',
        MetaRight: '⊞',
        ShiftLeft: 'Shift',
        ShiftRight: 'Shift'
    }
};

export interface IKeyboardShortcutHintProps {
    shortcutKeys: KeyType[];
    onShortcutTriggered?: (entry: KeyboardEvent) => void;
}

export const KeyboardShortcutHint: React.FC<IKeyboardShortcutHintProps> = (props) => {
    const theme = useTheme();
    const client = useMemo(() => new Client(), []);
    const systemPlatform = client.getSystemPlatform();
    const styles = useMemo(() => getKeyboardShortcutHintStyles(theme), [theme]);
    const mapping = systemPlatform === SystemPlatform.macOS ? keyMappings.mac : keyMappings.windows;

    const shortcutSubscribe = useShortcut((event) => {
        props.onShortcutTriggered?.(event);
    });

    useMemo(() => {
        if (props.onShortcutTriggered) {
            shortcutSubscribe(props.shortcutKeys);
        }
    }, [props.shortcutKeys, props.onShortcutTriggered]);


    const getDisplayShortcutName = (key: KeyType) => {
        if (systemPlatform === SystemPlatform.macOS) {
            if (key === Keys.ControlLeft) return mapping["MetaLeft"];
            if (key === Keys.ControlRight) return mapping["MetaRight"];
        }

        const mappedKey = mapping[key] || key;

        if (mappedKey.startsWith("Digit")) {
            return mappedKey.replace("Digit", "");
        } else if (mappedKey.startsWith("Key")) {
            return mappedKey.replace("Key", "");
        }

        return mappedKey;
    };

    return (
        <>
            <div className={styles.shortcutHint}>
                {props.shortcutKeys.map((key, index) => (
                    <Text key={index} className={styles.key}>{getDisplayShortcutName(key)}</Text>
                ))}
            </div>
        </>
    );
};