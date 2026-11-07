import { ReactNode, useMemo } from 'react';
import { getClassNames } from '@core';
import { useTheme } from '@theme';
import { ILeafletUiPopupComponents, LeafletUiPopupComponents } from './components';
import { getLeafletUiPopupStyles } from './styles';

export interface ILeafletUiPopupProps {
    /** What the popup shows, such as a `RecordCard`. */
    children?: ReactNode;
    className?: string;
    /** Replacements for its slots. */
    components?: Partial<ILeafletUiPopupComponents>;
}

/** Leaflet's popup, drawn as a Fluent callout; it goes inside a react-leaflet marker. */
export const LeafletUiPopup = (props: ILeafletUiPopupProps) => {
    const components = { ...LeafletUiPopupComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getLeafletUiPopupStyles(theme), [theme]);
    return components.onRenderContainer({ className: getClassNames([styles.popup, props.className]), children: props.children });
};
