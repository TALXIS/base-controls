import { useMemo } from "react";
import { useTheme, type ICommandBarItemProps } from "@fluentui/react";
import { RibbonComponents, type IRibbonComponents } from "./components";
import { getRibbonStyles } from "./styles";
import { useFormContext } from "../form/context";
import { useEventEmitter } from "../../../../hooks";
import { IRecordEvents } from "@talxis/client-libraries";
import { useRerender } from "@talxis/react-components";

export interface IFormRibbonProps {
    components?: Partial<IRibbonComponents>;
}

export const Ribbon = (props: IFormRibbonProps) => {
    const theme = useTheme();
    const form = useFormContext();
    const record = form.getRecord();
    const isDirty = form.isDirty();
    const styles = useMemo(() => getRibbonStyles(theme), [theme]);
    const components = { ...RibbonComponents, ...props.components };
    const rerender = useRerender();

    useEventEmitter<IRecordEvents>(record, ['onFieldValueChanged'], rerender);

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
            text: 'Save',
            disabled: !isDirty,
            iconProps: { iconName: 'Save' }
        }]
    }

    return components.onRenderCommandBar({
        items: getItems(),
        farItems: getFarItems(),
        styles: {
            root: styles.ribbon
        }
    })
};
