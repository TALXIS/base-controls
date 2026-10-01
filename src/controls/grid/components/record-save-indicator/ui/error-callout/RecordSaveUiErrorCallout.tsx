import { Fragment, RefObject, useMemo } from "react";
import { useSurfaceTheme } from "@theme";
import { IRecordSaveUiErrorCalloutComponents, RecordSaveUiErrorCalloutComponents } from "./components";
import { getRecordSaveUiErrorCalloutStyles } from "./styles";

/** One reason a record refused to save. */
export interface IRecordSaveUiError {
    /** The display name of the field it is about, if it is about one. */
    fieldName?: string;
    message: string;
}

export interface IRecordSaveUiErrorCalloutProps {
    /** What the callout points at. */
    target: RefObject<HTMLElement>;
    title: string;
    dismissText: string;
    errors: IRecordSaveUiError[];
    onDismiss: () => void;
    /** Called by the dismiss button, to clear the failure. */
    onClear: () => void;
    components?: Partial<IRecordSaveUiErrorCalloutComponents>;
}

/** What a row says when the record behind it refused to save, field by field. */
export const RecordSaveUiErrorCallout = (props: IRecordSaveUiErrorCalloutProps) => {
    //the callout is drawn in the surface's theme, not the row's
    const theme = useSurfaceTheme();
    const styles = useMemo(() => getRecordSaveUiErrorCalloutStyles(theme), [theme]);
    const components = { ...RecordSaveUiErrorCalloutComponents, ...props.components };

    return components.onRenderCallout({
        target: props.target,
        onDismiss: props.onDismiss,
        styles: { calloutMain: styles.errorCallout },
        children: <>
            {components.onRenderHeader({
                className: styles.header,
                children: <>
                    {components.onRenderIcon({ iconName: 'StatusErrorFull', className: styles.icon })}
                    {components.onRenderTitle({ variant: 'mediumPlus', className: styles.title, children: props.title })}
                </>,
            })}
            {components.onRenderFields({
                className: styles.fields,
                children: props.errors.map((error, index) => <Fragment key={index}>
                    {components.onRenderField({
                        className: styles.field,
                        children: <>
                            {error.fieldName && components.onRenderFieldName({ variant: 'medium', className: styles.fieldName, children: error.fieldName })}
                            {components.onRenderMessage({ variant: 'medium', className: styles.message, children: error.message })}
                        </>,
                    })}
                </Fragment>),
            })}
            {components.onRenderFooter({
                className: styles.footer,
                children: components.onRenderDismissButton({ text: props.dismissText, onClick: props.onClear }),
            })}
        </>,
    });
};
