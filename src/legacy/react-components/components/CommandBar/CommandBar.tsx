import { CommandBar as FluentCommandBar, IButtonProps, ICommandBarProps as ICommandBarPropsBase, useTheme } from '@fluentui/react';
import { useClassNames } from "../../hooks/useClassNames";
import { useMemo } from "react";
import { getCommandBarStyles } from "./styles";
import { ICommandBarItemProps as ICommandBarItemPropsBase } from "@fluentui/react";
import { ITheme, Theming } from '../../utilities';


/**  
    Extends the native CommandBarItemProps interface to allow for additional functionality.
*/
export interface ICommandBarItemProps extends ICommandBarItemPropsBase {
    /**  
    Sets if the item should be visible only while hovering over the component. 
    The item will also be visible if the component is focused.
    */
    showOnlyOnHover?: boolean;
}

export interface ICommandBarProps extends ICommandBarPropsBase {
    /**
     * Optional theme to be used for contextual menus created by the command bar.
     */
    contextualMenuTheme?: ITheme
}

export const CommandBar = (props: ICommandBarProps) => {
    const theme = useTheme();
    const commandBarStyles = useMemo(() => getCommandBarStyles(), []);

    const getInjectedProps = (items: ICommandBarItemProps[] = []): ICommandBarItemProps[] => {
        const newItems = items.map(item => {
            const newItem = {...item};
            newItem.title = newItem.title ?? newItem.text;
            if(newItem.showOnlyOnHover) {
                newItem.className = newItem.className ? `${newItem.className} hover-only` : 'hover-only'
            }
            return newItem;
        })
        if(props.contextualMenuTheme) {
            return Theming.GetThemedContextualItems(newItems, props.contextualMenuTheme);
        }
        return newItems
    }

    const getInjectedOverflowButtonProps = (buttonProps?: IButtonProps): IButtonProps => {
        return {
            ...buttonProps,
            menuProps: {
                ...buttonProps?.menuProps,
                items: buttonProps?.menuProps?.items ?? [],
                theme: props.contextualMenuTheme ? props.contextualMenuTheme : theme,
                calloutProps: {
                    ...buttonProps?.menuProps?.calloutProps,
                    theme: props.contextualMenuTheme ? props.contextualMenuTheme : theme
                }
            }
        }
    }
    //replace is done for back compat - command bar did not include the __root suffix before
    //replace due to back comp with old CSS where it often targets the class name directly
    //the decision to add the properties as --propName directly to className instead of creating
    //another class was really unfortunate, we need to abandon this practice
    const classNames = useClassNames('Command-Bar', {className: props.className}).replace('__root', '').replace('--underlined', '');

    return <FluentCommandBar
        {...props}
        className={`${classNames} ${commandBarStyles.root}`}
        items={getInjectedProps(props.items)}
        farItems={getInjectedProps(props.farItems)}
        overflowButtonProps={getInjectedOverflowButtonProps(props.overflowButtonProps)}
         />
}