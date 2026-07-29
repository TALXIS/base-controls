import { ITheme } from "@fluentui/react";
import { useRef, useState } from "react";
import { ICommandBarItemProps } from "../../../components/CommandBar/CommandBar";
import { IInputButtons } from "./InputButtons";
import { useRerender } from "../../../hooks";

export const useInputButtons = (props: IInputButtons, theme: ITheme): {items: ICommandBarItemProps[]} => {
    const clickToCopyActiveRef = useRef<boolean>(false);
    const rerender = useRerender();
    const {clickToCopyProps, deleteButtonProps, value, disabled, buttons, readOnly} = {...props};
    const clickToCopyVisible = clickToCopyProps && value
    const deleteButtonVisible = deleteButtonProps && value && !readOnly;

    const injectClickToCopyProxy = (button: ICommandBarItemProps & {successText?: string}) => {
        if(clickToCopyActiveRef.current) {
            button.text = button.successText;
            button.iconProps = {
                iconName: 'Checkmark'
            }
        }
        if(!button.onClick) {
            button.onClick = () => {}
        }
        button.onClick = new Proxy(button.onClick, {
            apply(target, thisArg) {
                clickToCopyActiveRef.current = true;
                const valueToCopy = clickToCopyProps?.getValueToCopy?.();
                if(valueToCopy) {
                    navigator.clipboard.writeText(valueToCopy);
                }
                setTimeout(() => {
                    clickToCopyActiveRef.current = false;
                    rerender();
                }, 3000);
                rerender();    
                return target.apply(thisArg);
            }
        });
    }

    let mergedItems: ICommandBarItemProps[] = [];
    if (clickToCopyVisible) {
        mergedItems.push({
            ...props.clickToCopyProps!,
            'data-clickcopy': true
        })
    }
    if (deleteButtonVisible) {
        mergedItems.push({
            ...props.deleteButtonProps!
        })
    }
    if (buttons) {
        mergedItems = [...mergedItems, ...buttons];
    }
    for (const item of mergedItems) {
        item.disabled = item.disabled || disabled;
        if(item['data-clickcopy']) {
            injectClickToCopyProxy(item);
        }
    }
    return {
        items: mergedItems
    }
}