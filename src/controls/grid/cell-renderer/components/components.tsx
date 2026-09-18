import { Icon, IIconProps } from "@fluentui/react";
import { IOptionSetRendererProps, OptionSetRenderer } from "./option-set-renderer";
import { FieldText, IFieldTextProps } from "./field-text";
import { FieldLink, IFieldLinkProps } from "./field-link";
import { FieldLookup, IFieldLookupProps } from "./field-lookup";
import { FieldFile, IFieldFileProps } from "./field-file";

/** The replaceable pieces of a field's value. Override any subset through `IGridCellRenderer.components`. */
export interface IGridCellRendererComponents {
    onRenderText: (props: IFieldTextProps) => JSX.Element;
    /** What an empty value shows in place of itself. */
    onRenderPlaceholder: (props: IFieldTextProps) => JSX.Element;
    /** One link: an address it navigates to, a record it opens, or neither. */
    onRenderLink: (props: IFieldLinkProps) => JSX.Element;
    /** What holds a lookup's links, however many records it names. */
    onRenderLookup: (props: IFieldLookupProps) => JSX.Element;
    onRenderOptions: (props: IOptionSetRendererProps) => JSX.Element;
    onRenderFile: (props: IFieldFileProps) => JSX.Element;
    onRenderPrefixIcon: (props: IIconProps) => JSX.Element;
    onRenderSuffixIcon: (props: IIconProps) => JSX.Element;
}

/** The defaults for {@link IGridCellRendererComponents}. */
export const GridCellRendererComponents: IGridCellRendererComponents = {
    onRenderText: props => <FieldText {...props} />,
    onRenderPlaceholder: props => <FieldText {...props} isPlaceholder />,
    onRenderLink: props => <FieldLink {...props} />,
    onRenderLookup: props => <FieldLookup {...props} />,
    onRenderOptions: props => <OptionSetRenderer {...props} />,
    onRenderFile: props => <FieldFile {...props} />,
    onRenderPrefixIcon: props => <Icon {...props} />,
    onRenderSuffixIcon: props => <Icon {...props} />,
};
