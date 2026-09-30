import { useMemo, useRef, useState } from "react";
import { SpinnerSize, useTheme } from "@fluentui/react";
import { IRecordSaveUiErrorCalloutProps } from "../error-callout";
import { IRecordSaveUiIndicatorComponents, RecordSaveUiIndicatorComponents } from "./components";
import { getRecordSaveUiIndicatorStyles } from "./styles";

export type IRecordSaveUiIndicatorState = 'saving' | 'succeeded' | 'failed';

export interface IRecordSaveUiIndicatorProps {
    state: IRecordSaveUiIndicatorState;
    /** What the callout says when the save failed. */
    errorCallout?: Omit<IRecordSaveUiErrorCalloutProps, 'target' | 'onDismiss'>;
    components?: Partial<IRecordSaveUiIndicatorComponents>;
}

/** What a row says about its last save. */
export const RecordSaveUiIndicator = (props: IRecordSaveUiIndicatorProps) => {
    const { state, errorCallout } = props;
    const rootRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();
    const styles = useMemo(() => getRecordSaveUiIndicatorStyles(theme), [theme]);
    const components = { ...RecordSaveUiIndicatorComponents, ...props.components };
    const [isErrorCalloutVisible, setIsErrorCalloutVisible] = useState<boolean>(false);

    if (state === 'saving') {
        return components.onRenderContainer({ ref: rootRef, className: styles.root, children: components.onRenderSpinner({ size: SpinnerSize.small }) });
    }
    const isSuccess = state === 'succeeded';
    
    return components.onRenderContainer({
        ref: rootRef,
        className: styles.root,
        children: <>
            {components.onRenderButton({
                onClick: () => setIsErrorCalloutVisible(!isSuccess),
                iconProps: {
                    iconName: isSuccess ? 'SkypeCircleCheck' : 'StatusErrorFull',
                    className: isSuccess ? styles.saveSuccessBtn : styles.saveErrorBtn,
                },
            })}
            {isErrorCalloutVisible && !isSuccess && errorCallout && components.onRenderErrorCallout({
                ...errorCallout,
                target: rootRef,
                onDismiss: () => setIsErrorCalloutVisible(false),
            })}
        </>,
    });
};
