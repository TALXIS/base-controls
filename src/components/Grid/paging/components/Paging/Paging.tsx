import { ComboBox, CommandBarButton, ContextualMenuItemType, IComboBoxOption, IContextualMenuItem, useTheme } from '@fluentui/react';
import { CommandBar } from '@fluentui/react';
import React from 'react';
import { useGridInstance } from '../../../core/hooks/useGridInstance';
import { usePagingController } from '../../controllers/usePagingController';
import { getPagingStyles } from './styles';

export const Paging = () => {
    const labels = useGridInstance().labels;
    const paging = usePagingController();
    const styles = getPagingStyles(useTheme());

    const getPageSizeOptions = (): IContextualMenuItem[] => {
        const sizes = ['25', '50', '75', '100', '250'];
        return sizes.map(size => {
            return {
                key: size,
                text: size,
                checked: parseInt(size) === paging.pageSize,
                className: styles.pageSizeOption,
                onClick: () => paging.setPageSize(parseInt(size))
            }
        })
    }
    const getPagingLabel = () => {
        if(paging.totalResultCount === undefined) {
            return labels['paging-pages']({ start: paging.pageFirstRecordOrder, end: paging.pageLastRecordOrder})
        }
        return `${labels['paging-pages']({ start: paging.pageFirstRecordOrder, end: paging.pageLastRecordOrder})} ${labels['paging-pages-totalcount']({recordcount: paging.formattedTotalResultCount})}`
    }
    return (
        <div className={styles.root}>
            <div className={styles.pageSizeBtnWrapper}>
                <CommandBarButton
                    text={getPagingLabel()}
                    menuProps={{
                        items: [
                            {
                                key: 'header',
                                itemType: ContextualMenuItemType.Header,
                                text: 'Počet záznamů na stránce',
                            },
                            {
                                key: 'divider',
                                itemType: ContextualMenuItemType.Divider,
                            },
                            ...getPageSizeOptions()
                        ]
                    }}
                />
            </div>
            <CommandBar
                className={styles.pagination}
                items={[]}
                farItems={[{
                    key: 'FirstPage',
                    iconOnly: true,
                    iconProps: { iconName: 'DoubleChevronLeft' },
                    disabled: !paging.hasPreviousPage,
                    onClick: () => paging.reset()
                }, {
                    key: 'PreviousPage',
                    iconOnly: true,
                    iconProps: { iconName: 'Back' },
                    disabled: !paging.hasPreviousPage,
                    onClick: () => paging.loadPreviousPage()
                }, {
                    key: 'CurrentPage',
                    text: `${labels['paging-page']()} ${paging.pageNumber.toString()}`,
                    className: styles.currentPageBtn,
                    disabled: true,
                }, {
                    key: 'NextPage',
                    iconOnly: true,
                    iconProps: { iconName: 'Forward' },
                    disabled: !paging.hasNextPage,
                    onClick: () => paging.loadNextPage()
                }]}
            />
        </div>
    )
}