import { useMemo } from "react";
import type { IDatasetControlLoadResult } from "../../../../runtime/DatasetControlRuntime";
import { ClientSideGrid } from "@controls/grid/client-side-grid/ClientSideGrid";
import { createEditingModule } from "@controls/grid/modules/editing/createEditingModule";
import { createFilteringModule } from "@controls/grid/modules/filtering/createFilteringModule";
import { createRowSelectionModule } from "@controls/grid/modules/row-selection/createRowSelectionModule";
import { createSortingModule } from "@controls/grid/modules/sorting/createSortingModule";
import type { IGridComponents } from "@controls/grid/components";
import type { IRibbonComponents } from "@controls/ribbon/components";
import type { IDatasetControlComponents } from "../../../../adapters/root/components";
import type { IDatasetControlUiBodyComponents, IDatasetControlUiFooterComponents, IDatasetControlUiHeaderComponents, IDatasetControlUiPaginationComponents, IDatasetControlUiQuickFindComponents } from "../../../../ui";
import { Root as DatasetControl } from "../../../../adapters/root/Root";
import { Body } from "../../../../adapters/body/Body";
import { Footer } from "../../../../adapters/footer/Footer";
import { Header } from "../../../../adapters/header/Header";
import { QuickFind } from "../../../../adapters/quick-find/QuickFind";
import { Pagination } from "../../../../adapters/pagination/Pagination";
import { useDatasetControlModule } from "../../../../adapters/root/useDatasetControlModule";
import { ManageViewsRibbon } from "../manage-views-ribbon";
import { getManageViewsStyles } from "./styles";

/** Replacements for what the Manage views panel draws. */
export interface IManageViewsComponents {
    /** The control the views are listed in, and its parts by name. */
    datasetControl?: IDatasetControlComponents & {
        header?: Partial<IDatasetControlUiHeaderComponents>;
        body?: Partial<IDatasetControlUiBodyComponents>;
        footer?: Partial<IDatasetControlUiFooterComponents>;
        ribbon?: IRibbonComponents;
        quickFind?: Partial<IDatasetControlUiQuickFindComponents>;
        pagination?: Partial<IDatasetControlUiPaginationComponents>;
    };
    /** The grid of the views. */
    grid?: IGridComponents;
}

export interface IManageViewsProps {
    components?: IManageViewsComponents;
}

/** The user's views as an editable, sortable and filterable DatasetControl. */
export const ManageViews = (props: IManageViewsProps) => {
    //the control the panel is opened from, not the one it draws
    const userQueries = useDatasetControlModule('userQueries');
    const styles = useMemo(() => getManageViewsStyles(), []);
    const modules = useMemo(() => [
        createEditingModule(),
        createRowSelectionModule({ mode: 'multiple' }),
        createSortingModule(),
        createFilteringModule(),
    ], []);

    const { header, body, footer, ribbon, quickFind, pagination, ...datasetControl } = props.components?.datasetControl ?? {};

    const onLoad = async (): Promise<IDatasetControlLoadResult> => ({ provider: userQueries.getManageProvider(), destroyProviderOnUnmount: false });

    return <DatasetControl onLoad={onLoad} height='100%' className={styles.datasetControl} components={datasetControl}>
        <Header className={styles.header} components={header}>
            <Header.Start>
                <ManageViewsRibbon userQueries={userQueries} components={ribbon} />
            </Header.Start>
            <Header.End>
                <QuickFind components={quickFind} />
            </Header.End>
        </Header>
        <Body components={body}>
            <ClientSideGrid modules={modules} components={props.components?.grid} />
        </Body>
        <Footer components={footer}>
            <Footer.End>
                <Pagination components={pagination} />
            </Footer.End>
        </Footer>
    </DatasetControl>;
};
