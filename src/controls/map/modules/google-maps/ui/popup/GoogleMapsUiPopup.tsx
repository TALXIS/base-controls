import { ReactNode, useMemo } from 'react';
import { getClassNames } from '@core';
import { useTheme } from '@theme';
import { GoogleMapsUiPopupComponents, IGoogleMapsUiPopupComponents } from './components';
import { getGoogleMapsUiPopupStyles, GOOGLE_MAPS_UI_POPUP_CLASS } from './styles';

export interface IGoogleMapsUiPopupProps {
    /** The marker it opens over. */
    anchor?: google.maps.marker.AdvancedMarkerElement | null;
    /** What the popup shows, such as a `RecordCard`. */
    children?: ReactNode;
    /** Called when Google closes it, such as on Escape. */
    onClose?: () => void;
    className?: string;
    /** Replacements for its slots. */
    components?: Partial<IGoogleMapsUiPopupComponents>;
}

/** Google's info window, drawn as a Fluent callout; it goes inside a Google map. */
export const GoogleMapsUiPopup = (props: IGoogleMapsUiPopupProps) => {
    const components = { ...GoogleMapsUiPopupComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getGoogleMapsUiPopupStyles(theme), [theme]);
    //the card's header fills the corner Google's close button sits in
    return components.onRender({
        anchor: props.anchor,
        headerDisabled: true,
        onClose: props.onClose,
        className: getClassNames([GOOGLE_MAPS_UI_POPUP_CLASS, styles.popup, props.className]),
        children: props.children,
    });
};
