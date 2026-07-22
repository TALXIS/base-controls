import { useMemo } from "react";
import { CommandBarButton, useTheme, type ICommandBarItemProps } from "@fluentui/react";
import { RibbonComponents, type IRibbonComponents } from "./components";
import { getRibbonStyles } from "./styles";
import { useFormContext } from "../form/context";
import { useEventEmitter } from "../../../../hooks";
import { IRecordSaveOperationResult } from "@talxis/client-libraries";
import { useRerender, withButtonLoading } from "@talxis/react-components";
import React from "react";

export interface IFormRibbonProps {
    components?: Partial<IRibbonComponents>;
}

const SaveButton = withButtonLoading(CommandBarButton);
const SUCCESS_STATE_TIMEOUT = 2000;
type TSaveButtonState = 'save' | 'saving' | 'saved';

//TODO: in future, ribbon base component that will only handle the UI (like when action is pending, it might already be somwhere, but coupled to some model or something)
//various wrappers will then leverage this base commponent

export const Ribbon = (props: IFormRibbonProps) => {
    const theme = useTheme();
    const form = useFormContext();
    const record = form.getRecord()
    const isDirty = form.isDirty();
    const styles = useMemo(() => getRibbonStyles(theme), [theme]);
    const components = { ...RibbonComponents, ...props.components };
    const [saveButtonState, setSaveButtonState] = React.useState<TSaveButtonState>('save');
    const successStateTimeout = React.useRef<number | null>(null);
    const rerender = useRerender();

    useEventEmitter(record, ['onFieldValueChanged'], rerender);
    useEventEmitter(form.events, 'onError', () => setSaveButtonState('save'));

    const clearSuccessStateTimeout = () => {
        if (successStateTimeout.current === null) {
            return;
        }

        window.clearTimeout(successStateTimeout.current);
        successStateTimeout.current = null;
    };

    React.useEffect(() => {
        return () => clearSuccessStateTimeout();
    }, []);

    useEventEmitter(form.events, ['onBeforeSave'], () => {
        clearSuccessStateTimeout();
        setSaveButtonState('saving');
    });

    useEventEmitter(form.events, ['onAfterSave'], (result: IRecordSaveOperationResult) => {
        clearSuccessStateTimeout();

        if (!result.success) {
            setSaveButtonState('save');
            return;
        }

        setSaveButtonState('saved');
        successStateTimeout.current = window.setTimeout(() => {
            setSaveButtonState('save');
            successStateTimeout.current = null;
        }, SUCCESS_STATE_TIMEOUT);
    });

    const getFarItems = (): ICommandBarItemProps[] => {
        return isDirty ? [{
            key: 'unsaved-changes',
            text: 'Unsaved changes',
            iconProps: {
                iconName: 'Warning',
                styles: {
                    root: styles.unsavedChangesIcon
                }
            },
            buttonStyles: {
                label: styles.unsavedChangesLabel
            },
            disabled: true
        }] : [];
    }

    const getItems = (): ICommandBarItemProps[] => {
        return [{
            key: 'save',
            commandBarButtonAs: (props) => <SaveButton
                text={getSaveText()}
                isLoading={saveButtonState === 'saving'}
                onClick={() => {
                     form.save();
                }}
                iconProps={getSaveIconProps()}
            />
        }]
    }

    const getSaveText = () => {
        if (saveButtonState === 'saving') {
            return 'Saving...';
        }

        if (saveButtonState === 'saved') {
            return 'Saved!';
        }

        return 'Save';
    }

    const getSaveIconProps = () => {
        if (saveButtonState === 'saved') {
            return {
                iconName: 'SkypeCircleCheck',
                styles: {
                    root: styles.savedIcon
                }
            };
        }

        return {
            iconName: 'Save'
        };
    }

    return components.onRenderCommandBar({
        items: getItems(),
        farItems: getFarItems(),
        styles: {
            root: styles.ribbon
        }
    })
};
