import * as React from 'react';
import { CommandBarButton, ContextualMenu, Icon, IContextualMenuItem, Text, useTheme } from '@fluentui/react';
import { useGridService } from '@components/Grid/useGridService';
import { ColDef, IHeaderParams } from '@ag-grid-community/core';
import { IRecord } from '@talxis/client-libraries';
import { getColumnHeaderContextualMenuStyles, getColumnHeaderStyles } from './styles';

export interface IColumnHeader extends IHeaderParams { }

/** A column's header: its name, what the modules draw beside it, and the menu they offer for it. */
export const ColumnHeader = (props: IColumnHeader) => {
    const columnHeaderParts = useGridService('columnHeader');
    const filtering = useGridService('filtering');
    const theme = useTheme();
    const colDef = props.column.getColDef();
    //what the grid worked out about the column travels on the definition
    const column = colDef.propBag?.column;
    const [menuItems, setMenuItems] = React.useState<IContextualMenuItem[] | null>(null);
    const buttonRef = React.useRef<HTMLDivElement>(null);
    const styles = React.useMemo(() => getColumnHeaderStyles(theme, column?.alignment ?? 'left'), [theme, column?.alignment]);
    const menuStyles = React.useMemo(() => getColumnHeaderContextualMenuStyles(theme), [theme]);

    const adornments = column ? columnHeaderParts.getAdornments(column) : [];
    const prefixes = adornments.filter(adornment => adornment.placement === 'prefix');
    const suffixes = adornments.filter(adornment => adornment.placement === 'suffix');
    //what the adornments add to the name, so a totalled column reads as "Estimate (Sum)".
    const titles = adornments.map(adornment => adornment.title).filter(Boolean);
    const title = titles.length ? `${colDef.headerName} (${titles.join(', ')})` : colDef.headerName;

    //needs to be called with onTouchEnd as well since ag grid cancels the click event on them
    const onClick = () => {
        const items = column ? columnHeaderParts.getMenuItems(column) : [];
        //nothing contributed, nothing to open
        if (items.length) {
            setMenuItems(items);
        }
    }

    return <>
        <div ref={buttonRef} onClick={onClick} onTouchEnd={onClick}>
            <CommandBarButton
                title={title}
                styles={{
                    root: styles.commandBarButtonRoot,
                    flexContainer: styles.commandBarButtonFlexContainer
                }}
            >
                <div className={styles.columnDisplayNameContainer}>
                    {prefixes.map(adornment => <React.Fragment key={adornment.key}>{adornment.onRender?.()}</React.Fragment>)}
                    <Text styles={{ root: styles.columnDisplayNameText }}>{colDef.headerName}</Text>
                    {column?.isRequired && <Text className={styles.asterix}>*</Text>}
                </div>
                <div className={styles.suffixIconsContainer}>
                    {suffixes.map(adornment => <React.Fragment key={adornment.key}>{adornment.onRender?.()}</React.Fragment>)}
                    {column?.isEditable === false && <Icon iconName='Uneditable' />}
                </div>
            </CommandBarButton>
        </div>
        {menuItems &&
            <ContextualMenu
                target={buttonRef}
                items={menuItems}
                calloutProps={{ preventDismissOnEvent: preventDismissOnEvent, className: menuStyles.menu }}
                onDismiss={() => setMenuItems(null)}
            />
        }
        {/* the module renders its own callout, and nothing while it is closed */}
        {column && filtering?.components.onRenderFilterCallout({ column: column, target: buttonRef })}
    </>
};

const preventDismissOnEvent = (e: Event | React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element> | React.FocusEvent<Element, Element>) => {
    if (e.type !== 'scroll') {
        return false;
    }
    const target = e.target as HTMLElement;
    //check for vertical scroll
    if (target?.classList?.contains('ag-body-viewport') || target?.classList?.contains('ag-body-vertical-scroll-viewport')) {
        return true;
    }
    //ios outputs horizontal scroll if focused in callout btn.
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        return true;
    }
    return false;
}
