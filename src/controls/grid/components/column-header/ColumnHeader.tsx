import * as React from 'react';
import { CommandBarButton, IContextualMenuItem } from '@fluentui/react';
import { IHeaderParams } from '@ag-grid-community/core';
import { useGridService } from '@controls/grid/useGridService';
import { ColumnHeaderSuffix, GridUi, IColumnHeaderComponents } from '../ui';

export interface IColumnHeader extends IHeaderParams {
    components?: Partial<IColumnHeaderComponents>;
}

/** A column's header, with what the grid's own parts add to it. */
export const ColumnHeader = (props: IColumnHeader) => {
    const columnHeaderParts = useGridService('columnHeader');
    const filtering = useGridService('filtering');
    const provider = useGridService('provider');
    const colDef = props.column.getColDef();
    const settings = colDef.settings ?? {};
    //the modules work on the dataset's own column, which a column of the grid's own has none of
    const column = provider.getColumnsMap()[colDef.colId!];
    const [menuItems, setMenuItems] = React.useState<IContextualMenuItem[] | null>(null);
    const buttonRef = React.useRef<HTMLElement>(null);
    const adornments = columnHeaderParts.getAdornments({ colDef: colDef, column: column });

    const renderAdornments = (placement: 'prefix' | 'suffix') => <>
        {adornments.filter(adornment => adornment.placement === placement)
            .map(adornment => <React.Fragment key={adornment.key}>{adornment.onRender?.()}</React.Fragment>)}
    </>;

    //what the adornments add to the name, so a totalled column reads as "Estimate (Sum)"
    const titles = adornments.map(adornment => adornment.title).filter(Boolean);

    //needs to be called with onTouchEnd as well since ag grid cancels the click event on them
    const onClick = () => {
        const items = columnHeaderParts.getMenuItems({ colDef: colDef, column: column });
        //nothing contributed, nothing to open
        if (items.length) {
            setMenuItems(items);
        }
    };

    //AG Grid keeps the focus on the header cell rather than on what a header draws
    React.useEffect(() => {
        const header = props.eGridHeader;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Enter' || event.target !== header) {
                return;
            }
            event.preventDefault();
            onClick();
        };
        header?.addEventListener('keydown', onKeyDown);
        return () => header?.removeEventListener('keydown', onKeyDown);
    }, [props.eGridHeader, colDef, column]);

    return <GridUi.ColumnHeader
        name={colDef.headerName ?? ''}
        title={titles.length ? `${colDef.headerName} (${titles.join(', ')})` : undefined}
        alignment={settings.alignment}
        isRequired={settings.isRequired}
        isEditable={settings.isEditable}
        components={{
            onRenderPrefix: () => renderAdornments('prefix'),
            onRenderSuffix: () => <ColumnHeaderSuffix>{renderAdornments('suffix')}</ColumnHeaderSuffix>,
            onRenderButton: buttonProps => <>
                <CommandBarButton {...buttonProps} elementRef={buttonRef} onClick={onClick} onTouchEnd={onClick} />
                {menuItems && <GridUi.ColumnHeaderMenu
                    target={buttonRef}
                    items={menuItems}
                    onDismiss={() => setMenuItems(null)} />}
                {/* the module renders its own callout, and nothing while it is closed */}
                {column && filtering?.components.onRenderFilterCallout({ column: column, target: buttonRef })}
            </>,
            //the consumer's word is the last one
            ...props.components,
        }} />;
};
