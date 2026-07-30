import { useMemo } from "react";
import { CommandBarButton, type ICommandBarItemProps, useTheme } from "@fluentui/react";
import { IRibbonComponents, RibbonComponents } from "./components";
import { getRibbonStyles } from "./styles";
import { useForm } from "../root/context";
import { useEventEmitter } from "@hooks";
import { useRerender, withButtonLoading } from "@legacy";
import React from "react";
import { useLocalizationService } from "../root/context";

export interface IFormRibbonProps {
    onSave?: () => void;
    components?: Partial<IRibbonComponents>;
}

const SaveButton = withButtonLoading(CommandBarButton);
const SUCCESS_STATE_TIMEOUT = 2000;
type TSaveButtonState = 'save' | 'saving' | 'saved';

export const Ribbon = (props: IFormRibbonProps) => {
    const { onSave } = props;
    const form = useForm();
    const record = form.getRecord();
    const isDirty = form.isDirty();
    const theme = useTheme();
    const styles = useMemo(() => getRibbonStyles(theme), [theme]);
    const components = { ...RibbonComponents, ...props.components };
    const localizationService = useLocalizationService();
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
            text: localizationService.getLocalizedString('unsavedChanges'),
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
            commandBarButtonAs: () => <SaveButton
                text={getSaveText()}
                onMouseUp={() => {
                    onSave?.() ?? form.save();
                }}
                isLoading={saveButtonState === 'saving'}
                iconProps={getSaveIconProps()}
            />
        }];
    };

    const getSaveText = () => {
        if (saveButtonState === 'saving') {
            return localizationService.getLocalizedString('saving');
        }

        if (saveButtonState === 'saved') {
            return localizationService.getLocalizedString('saved');
        }

        return localizationService.getLocalizedString('save');
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
