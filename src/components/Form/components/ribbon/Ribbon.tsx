import { useMemo } from "react";
import { CommandBarButton, useTheme, type ICommandBarItemProps } from "@fluentui/react";
import { RibbonComponents, type IRibbonComponents } from "./components";
import { getRibbonStyles } from "./styles";
import { useFormContext } from "../form/context";
import { useEventEmitter } from "../../../../hooks";
import { IRecordEvents } from "@talxis/client-libraries";
import { useRerender, withButtonLoading } from "@talxis/react-components";
import React from "react";

export interface IFormRibbonProps {
    components?: Partial<IRibbonComponents>;
}

const SaveButton = withButtonLoading(CommandBarButton);

//TODO: in future, ribbon base component that will only handle the UI (like when action is pending, it might already be somwhere, but coupled to some model or something)
//various wrappers will then leverage this base commponent

export const Ribbon = (props: IFormRibbonProps) => {
    const theme = useTheme();
    const form = useFormContext();
    const record = form.getRecord()
    const isDirty = form.isDirty();
    const styles = useMemo(() => getRibbonStyles(theme), [theme]);
    const components = { ...RibbonComponents, ...props.components };
    const [isSaving, setIsSaving] = React.useState(false);
    const rerender = useRerender();

    useEventEmitter<IRecordEvents>(record, ['onFieldValueChanged'], rerender);
    useEventEmitter(form.events, ['onBeforeSave'], () => setIsSaving(true));
    useEventEmitter(form.events, ['onAfterSave'], () => setIsSaving(false));

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
                text={'Save'}
                isLoading={isSaving}
                onClick={() => form.save()}
                iconProps={{ iconName: 'Save' }}
            />
        }]
    }

    const getSaveText = () => {
        if (isSaving) {
            return 'Saving...';
        }
        
    }

    return components.onRenderCommandBar({
        items: getItems(),
        farItems: getFarItems(),
        styles: {
            root: styles.ribbon
        }
    })
};
