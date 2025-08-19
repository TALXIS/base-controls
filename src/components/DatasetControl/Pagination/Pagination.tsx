import { CommandBarButton, ContextualMenuItemType, useTheme } from "@fluentui/react";
import { IFooterProps } from "../interfaces";
import { useModel } from "../useModel";
import { getPaginationStyles } from "./styles";
import { useMemo } from "react";
import { CommandBar } from "@talxis/react-components";
import { PaginationModel } from "./PaginationModel";

const PAGE_SIZE_OPTIONS = ['25', '50', '75', '100', '250'];

export const Pagination = (props: { onRenderPagination: IFooterProps['onRenderPagination'] }) => {
  const model = useModel();
  const paginationModel = useMemo(() => new PaginationModel(model), []);
  const dataset = model.getDataset();
  const labels = model.getLabels();
  const paging = dataset.paging;
  const theme = useTheme();
  const styles = useMemo(() => getPaginationStyles(theme), [theme]);

  const onSetPageSize = (pageSize: number) => {
    paging.setPageSize(pageSize);
    dataset.refresh();
  }


  return props.onRenderPagination({
    pageSizeSwitcherProps: {
      disabled: !model.isPageSizeSwitcherVisible() || dataset.loading,
      text: paginationModel.toString(),
      menuProps: {
        items: [
          {
            key: 'header',
            itemType: ContextualMenuItemType.Header,
            text: labels['page-record-count'](),
          },
          {
            key: 'divider',
            itemType: ContextualMenuItemType.Divider,
          },
          ...PAGE_SIZE_OPTIONS.map((size) => ({
            key: size,
            text: size,
            checked: parseInt(size) === paging.pageSize,
            className: 'pageSizeOption',
            onClick: () => dataset.getDataProvider().executeWithUnsavedChangesBlocker(() => onSetPageSize(parseInt(size)))
          }))

        ]
      }
    },
    paginationContainerProps: {
      className: styles.paginationRoot
    },
    commandBarProps: {
      className: styles.commandBarRoot,
      items: [],
      farItems: [{
        key: 'FirstPage',
        iconOnly: true,
        iconProps: { iconName: 'DoubleChevronLeft' },
        disabled: !paging.hasPreviousPage || dataset.loading,
        onClick: () => dataset.getDataProvider().executeWithUnsavedChangesBlocker(() => paging.reset())
      }, {
        key: 'PreviousPage',
        iconOnly: true,
        iconProps: { iconName: 'Back' },
        disabled: !paging.hasPreviousPage || dataset.loading,
        onClick: () => dataset.getDataProvider().executeWithUnsavedChangesBlocker(() => paging.loadExactPage(paging.pageNumber - 1))
      }, {
        key: 'CurrentPage',
        text: `${labels['paging-page']()} ${paging.pageNumber.toString()}`,
        className: styles.currentPageBtn,
        disabled: true,
      }, {
        key: 'NextPage',
        iconOnly: true,
        iconProps: { iconName: 'Forward' },
        disabled: !paging.hasNextPage || dataset.loading,
        onClick: () => dataset.getDataProvider().executeWithUnsavedChangesBlocker(() => paging.loadExactPage(paging.pageNumber + 1))
      }]
    },
    onRenderCommandBar: (props, defaultRender) => defaultRender(props),
    onRenderPageSizeSwitcher: (props, defaultRender) => defaultRender(props),
  }, (props) => {
    return <div {...props.paginationContainerProps}>
      {(model.isPageSizeSwitcherVisible() || model.isRecordCountVisible()) &&
        <CommandBarButton {...props.pageSizeSwitcherProps} />
      }
      {model.isPaginationVisible() &&
        <CommandBar {...props.commandBarProps} />
      }
    </div>
  })
}