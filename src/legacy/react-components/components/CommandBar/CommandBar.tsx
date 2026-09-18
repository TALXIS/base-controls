import { ICommandBarProps as ICommandBarPropsBase, useTheme } from '@fluentui/react';
import { CommandBar as CommandBarBase } from '@ui/command-bar';
import { useClassNames } from "@legacy/hooks/useClassNames";
import { useMemo } from "react";
import { getCommandBarStyles } from "./styles";
import { ICommandBarItemProps as ICommandBarItemPropsBase } from "@fluentui/react";
import { ITheme, SurfaceTheme } from '@theme';


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
     * What a menu one of the buttons opens is drawn in.
     *
     * Defaults to the theme the application draws its surfaces in, so a bar in a cell of its own colours
     * still opens its menus in the application's.
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
        return newItems;
    }

    //replace is done for back compat - command bar did not include the __root suffix before
    //replace due to back comp with old CSS where it often targets the class name directly
    //the decision to add the properties as --propName directly to className instead of creating
    //another class was really unfortunate, we need to abandon this practice
    const classNames = useClassNames('Command-Bar', {className: props.className}).replace('__root', '').replace('--underlined', '');

    //the menus are themed by the shared command bar this one draws with, from the surface it is told about
    const bar = <CommandBarBase
        {...props}
        className={`${classNames} ${commandBarStyles.root}`}
        items={getInjectedProps(props.items)}
        farItems={getInjectedProps(props.farItems)}
        overflowItems={props.overflowItems && getInjectedProps(props.overflowItems)} />;

    if (!props.contextualMenuTheme) {
        return bar;
    }
    return <SurfaceTheme theme={props.contextualMenuTheme}>{bar}</SurfaceTheme>;
}