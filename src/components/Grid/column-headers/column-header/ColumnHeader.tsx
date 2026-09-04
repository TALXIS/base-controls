import * as React from 'react';
import { CommandBarButton, ContextualMenu, Icon, IContextualMenuItem, Text, useTheme } from '@fluentui/react';
import { useGridService } from '@components/Grid/grid/useGridService';
import { IGridColumn } from '@components/Grid/grid/columns';
import { GridSettings } from '@components/Grid/grid/settings';
import { getColumnHeaderContextualMenuStyles, getColumnHeaderStyles } from './styles';

export interface IColumnHeader {
    baseColumn: IGridColumn;
}

/**
 * A column's header: its name, what the modules draw beside it, and the menu they offer for it.
 *
 * Nothing here knows what sorting, filtering, grouping or totals are. A header on a grid with none of
 * them registered shows a name and opens nothing.
 */
export const ColumnHeader = (props: IColumnHeader) => {
    const settings = useGridService('settings');
    const columns = useGridService('columns');
    const columnHeaderParts = useGridService('columnHeader');
    const filtering = useGridService('filtering');
    const theme = useTheme();
    const column = columns.getGridColumn(props.baseColumn);
    const [menuItems, setMenuItems] = React.useState<IContextualMenuItem[] | null>(null);
    const buttonRef = React.useRef<HTMLDivElement>(null);
    const styles = React.useMemo(() => getColumnHeaderStyles(theme, column.alignment!), [theme, column.alignment]);
    const menuStyles = React.useMemo(() => getColumnHeaderContextualMenuStyles(theme), [theme]);

    const adornments = columnHeaderParts.getAdornments(column);
    const prefixes = adornments.filter(adornment => adornment.placement === 'prefix');
    const suffixes = adornments.filter(adornment => adornment.placement === 'suffix');
    //what the adornments add to the name, so a totalled column reads as "Estimate (Sum)". The tooltip
    //only: the header shows the column's own name, which is what the width was chosen for
    const titles = adornments.map(adornment => adornment.title).filter(Boolean);
    const title = titles.length ? `${column.displayName} (${titles.join(', ')})` : column.displayName;

    //needs to be called with onTouchEnd as well since ag grid cancels the click event on them
    const onClick = () => {
        const items = columnHeaderParts.getMenuItems(column);
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
                    <Text styles={{ root: styles.columnDisplayNameText }}>{column.displayName}</Text>
                    {column.isRequired && <Text className={styles.asterix}>*</Text>}
                </div>
                <div className={styles.suffixIconsContainer}>
                    {suffixes.map(adornment => <React.Fragment key={adornment.key}>{adornment.onRender?.()}</React.Fragment>)}
                    {isUneditableIconVisible(settings, column) && <Icon iconName='Uneditable' />}
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
        {filtering?.components.onRenderFilterCallout({ column: column, target: buttonRef })}
    </>
};

/**
 * Whether the header says the column cannot be written to.
 *
 * `isEditable` is the column's own answer, and it is already false on a grid that does not edit — so
 * whether editing is on has to be asked separately, or every column on a read-only grid would claim to be
 * the read-only one. An action column is never worth saying it of: nothing there was a value to change.
 */
const isUneditableIconVisible = (settings: GridSettings, column: IGridColumn): boolean => {
    if (!settings.isEditingEnabled() || column.type === 'action') {
        return false;
    }
    return !column.isEditable;
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
    //ios outputs horizontal scroll if focused in callout btn which would result in dismiss of callout
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        return true;
    }
    return false;
}
