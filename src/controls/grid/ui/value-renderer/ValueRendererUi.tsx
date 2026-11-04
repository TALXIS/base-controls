import { Fragment, useMemo } from "react";
import { getClassNames, IAlignment } from "@core";
import { IValueRendererUiComponents, ValueRendererUiComponents } from "./components";
import { IFileValue } from "./field-file";
import { IOptionSetRendererOption } from "./option-set-renderer";
import { getValueRendererUiStyles } from "./styles";

/** One link of a value: an address it navigates to, a click it runs, or neither. */
export interface IValueRendererUiLink {
    text: string;
    href?: string;
    onClick?: () => void;
}

/** What a value is drawn as. */
export type IValueRendererUiValue =
    | { type: 'placeholder'; text: string }
    | { type: 'text'; text: string }
    | { type: 'link'; link: IValueRendererUiLink }
    | { type: 'lookup'; links: (IValueRendererUiLink & { key: string })[] }
    | { type: 'file'; file: IFileValue; isImage: boolean }
    | { type: 'options'; options: IOptionSetRendererOption[] };

export interface IValueRendererUiProps {
    value: IValueRendererUiValue;
    /** Which edge the value reads from; defaults to `'left'`. */
    alignment?: IAlignment;
    /** Whether the value wraps onto as many lines as it needs. */
    isMultiline?: boolean;
    prefixIconName?: string;
    suffixIconName?: string;
    className?: string;
    components?: Partial<IValueRendererUiComponents>;
}

/** A value in its cell, drawn by what it is, between an optional prefix and suffix icon. */
export const ValueRendererUi = (props: IValueRendererUiProps) => {
    const { value, alignment = 'left', isMultiline = false } = props;
    const components = { ...ValueRendererUiComponents, ...props.components };
    const styles = useMemo(() => getValueRendererUiStyles(alignment, isMultiline), [alignment, isMultiline]);

    const renderValue = (): JSX.Element => {
        switch (value.type) {
            case 'placeholder':
                return components.onRenderPlaceholder({ text: value.text, isMultiline });
            case 'link':
                return components.onRenderLink({ ...value.link, isMultiline });
            case 'lookup':
                return components.onRenderLookup({
                    children: value.links.map(({ key, ...link }) => <Fragment key={key}>{components.onRenderLink({ ...link, isMultiline })}</Fragment>),
                });
            case 'file':
                return components.onRenderFile({ file: value.file, isImage: value.isImage });
            case 'options':
                return components.onRenderOptions({ options: value.options, alignment });
            default:
                return components.onRenderText({ text: value.text, isMultiline });
        }
    };

    return components.onRenderContainer({
        className: getClassNames([styles.valueRendererUi, props.className]),
        children: <>
            {props.prefixIconName && components.onRenderPrefixIcon({ iconName: props.prefixIconName })}
            {renderValue()}
            {props.suffixIconName && components.onRenderSuffixIcon({ iconName: props.suffixIconName })}
        </>,
    });
};
