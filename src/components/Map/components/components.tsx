import { ITheme } from '@legacy';
import { IMapProviderOption } from '../providers/provider';

/** What the status message receives: the one message the control picked, and the theme to draw it in. */
export interface IMapStatusProps {
    /** What the control is doing, or warning about. Nothing renders while this is empty. */
    message?: string;
    /** Whether the message is progress on something still running, rather than a finished state. */
    isBusy?: boolean;
    /** Whether the message is a warning, such as a load that stopped at its cap. */
    isWarning?: boolean;
    theme: ITheme;
}

/** What the provider picker receives: every configured provider, and which one is drawing. */
export interface IMapProviderPickerProps {
    options: IMapProviderOption[];
    selectedId?: string;
    label: string;
    theme: ITheme;
    onChange: (id: string) => void;
}

/**
 * The replaceable parts of the core's own chrome. Override any subset through `IMap.components`; a module's
 * chrome is replaced through that module's `components` option instead.
 */
export interface IMapComponents {
    /** The status message saying what the control is doing, top-left. Rendered even while there is no message. */
    onRenderStatus: (props: IMapStatusProps) => JSX.Element;
    /** The provider picker, top-right. Rendered only while more than one provider is configured. */
    onRenderProviderPicker: (props: IMapProviderPickerProps) => JSX.Element;
}
