import { CommandBar } from '@fluentui/react/lib/components/CommandBar/CommandBar';
import React from 'react';
import { useGridInstance } from '../../../core/hooks/useGridInstance';
import { usePagingController } from '../../controllers/usePagingController';

export const Paging = () => {
    const labels = useGridInstance().labels;
    const paging = usePagingController();

    return (
        <CommandBar
            className="TALXIS__view__footer"
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
                text: `${labels['paging-page']} ${paging.pageNumber.toString()}`,
                disabled: true,
            }, {
                key: 'NextPage',
                iconOnly: true,
                iconProps: { iconName: 'Forward' },
                disabled: !paging.hasNextPage,
                onClick: () => paging.loadNextPage()
            }]}
        />
    )
}