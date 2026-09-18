import { CommandBarButton, IButtonProps, ITextProps, Text } from "@fluentui/react";
import { ColumnHeaderSuffix, IColumnHeaderSuffixComponents } from "./column-header-suffix";

/** The replaceable pieces of a column header. Override any subset through `IColumnHeaderProps.components`. */
export interface IColumnHeaderComponents {
    /** The button the header is drawn in. */
    onRenderButton: (props: IButtonProps) => JSX.Element;
    /** What the name and what stands with it are drawn in. */
    onRenderNameContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element;
    /** Drawn before the name. */
    onRenderPrefix: () => JSX.Element | null;
    onRenderName: (props: ITextProps) => JSX.Element;
    /** What says the column asks for a value. */
    onRenderRequiredMarker: (props: ITextProps) => JSX.Element;
    /** What is drawn after the name, the uneditable icon included. */
    onRenderSuffix: () => JSX.Element;
    /** The suffix's own pieces, for a caller that keeps the default. */
    suffix?: Partial<IColumnHeaderSuffixComponents>;
}

/** The defaults for {@link IColumnHeaderComponents}. */
export const ColumnHeaderComponents: IColumnHeaderComponents = {
    onRenderButton: props => <CommandBarButton {...props} />,
    onRenderNameContainer: props => <div {...props} />,
    onRenderPrefix: () => null,
    onRenderName: props => <Text {...props} />,
    onRenderRequiredMarker: props => <Text {...props}>*</Text>,
    onRenderSuffix: () => <ColumnHeaderSuffix />,
};
