import { useTheme } from "@theme";
import { useMemo } from "react";
import { CommandBarButton, type IButtonProps, type ICommandBarItemProps, type IComponentAsProps } from "@fluentui/react";
import { IRibbonComponents, RibbonComponents } from "./components";
import { getRibbonStyles } from "./styles";
import { useForm } from "../root/context";
import { useEventEmitter, useRerender } from "@core";
import { useLabels } from "@labels";
import { withButtonLoading } from "@legacy";
import React from "react";
import { FORM_LABELS } from "../../labels";

export interface IFormRibbonProps {
    onSave?: () => void;
    components?: Partial<IRibbonComponents>;
}

const SaveButton = withButtonLoading(CommandBarButton);
const SaveCommandButton = (props: IComponentAsProps<ICommandBarItemProps>) => <SaveButton {...props as IButtonProps} isLoading={!!props.isLoading} />;
const SUCCESS_STATE_TIMEOUT = 2000;
type TSaveButtonState = 'save' | 'saving' | 'saved';

export const Ribbon = (props: IFormRibbonProps) => {
    const { onSave } = props;
    const form = useForm();
    const record = form.getRecord();

    //a failed save has already reached onError
    const saveQuietly = async () => {
        try {
            await form.save();
        }
        catch { }
    };
    const isDirty = form.isDirty();
    const theme = useTheme();
    const styles = useMemo(() => getRibbonStyles(theme), [theme]);
    const components = { ...RibbonComponents, ...props.components };
    const labels = useLabels(FORM_LABELS);
    const [saveButtonState, setSaveButtonState] = React.useState<TSaveButtonState>('save');
    const successStateTimeout = React.useRef<number | null>(null);
    const { rerender } = useRerender();

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

    useEventEmitter(form.events, ['onAfterSave'], ({ success }: { success: boolean }) => {
        clearSuccessStateTimeout();

        if (!success) {
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
            text: labels.get('form.unsavedChanges'),
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
    };

    const getItems = (): ICommandBarItemProps[] => {
        return [{
            key: 'save',
            text: getSaveText(),
            iconProps: getSaveIconProps(),
            isLoading: saveButtonState === 'saving',
            commandBarButtonAs: SaveCommandButton,
            onClick: () => {
                if (onSave) {
                    onSave();
                } else {
                    saveQuietly();
                }
            }
        }];
    };

    const getSaveText = () => {
        if (saveButtonState === 'saving') {
            return labels.get('form.saving');
        }

        if (saveButtonState === 'saved') {
            return labels.get('form.saved');
        }

        return labels.get('form.save');
    };

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
    };

    return components.onRenderCommandBar({
        items: getItems(),
        farItems: getFarItems(),
        styles: {
            root: styles.ribbon
        }
    });
};
