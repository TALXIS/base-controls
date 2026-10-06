import { IButtonProps, IconButton, ISpinnerProps, Spinner } from "@fluentui/react";
import { IRecordSaveUiErrorCalloutProps, RecordSaveUiErrorCallout } from "../error-callout";

/** The indicator button's props, with how the save went. */
export interface IRecordSaveUiIndicatorButtonProps extends IButtonProps {
    state: 'succeeded' | 'failed';
}

/** The replaceable pieces of what a row says about its last save. */
export interface IRecordSaveUiIndicatorComponents {
    /** What everything is drawn in, and what the error callout points at. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>) => JSX.Element | null;
    /** What says the record is saving. */
    onRenderSpinner: (props: ISpinnerProps) => JSX.Element | null;
    /** What says how the save went, and opens the error callout when it failed. */
    onRenderButton: (props: IRecordSaveUiIndicatorButtonProps) => JSX.Element | null;
    onRenderErrorCallout: (props: IRecordSaveUiErrorCalloutProps) => JSX.Element | null;
}

/** The defaults for {@link IRecordSaveUiIndicatorComponents}. */
export const RecordSaveUiIndicatorComponents: IRecordSaveUiIndicatorComponents = {
    onRenderContainer: props => <div {...props} />,
    onRenderSpinner: props => <Spinner {...props} />,
    onRenderButton: ({ state, ...props }) => <IconButton {...props} />,
    onRenderErrorCallout: props => <RecordSaveUiErrorCallout {...props} />,
};
