import { useMemo } from "react";
import { IDataProvider } from "@talxis/client-libraries";
import { GridRoot as Grid } from "../../../../../grid/Grid";
import { createClientSideRowModelModule } from "../../../../../grid/modules/row-model/client-side/createClientSideRowModelModule";
import { createEditingModule } from "../../../../../grid/modules/editing/createEditingModule";
import { createFilteringModule } from "../../../../../grid/modules/filtering/createFilteringModule";
import { createRowSelectionModule } from "../../../../../grid/modules/row-selection/createRowSelectionModule";
import { createSortingModule } from "../../../../../grid/modules/sorting/createSortingModule";
import type { IGridComponents } from "../../../../../grid/components";
import type { IRibbonComponents } from "../../../../../ribbon/components";
import type { IDatasetControlComponents } from "../../../../adapters/root/components";
import type { IBodyUiComponents, IFooterUiComponents, IHeaderUiComponents, IPaginationUiComponents, IQuickFindUiComponents } from "../../../../ui";
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
        header?: Partial<IHeaderUiComponents>;
        body?: Partial<IBodyUiComponents>;
        footer?: Partial<IFooterUiComponents>;
        ribbon?: IRibbonComponents;
        quickFind?: Partial<IQuickFindUiComponents>;
        pagination?: Partial<IPaginationUiComponents>;
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
        createClientSideRowModelModule(),
        createEditingModule(),
        createRowSelectionModule({ mode: 'multiple' }),
        createSortingModule(),
        createFilteringModule(),
    ], []);

    const { header, body, footer, ribbon, quickFind, pagination, ...datasetControl } = props.components?.datasetControl ?? {};

    const onLoad = async (): Promise<{ provider: IDataProvider }> => ({ provider: userQueries.getManageProvider() });

    return <DatasetControl onLoad={onLoad} destroyProviderOnUnmount={false} height='100%' className={styles.datasetControl} components={datasetControl}>
        <Header className={styles.header} components={header}>
            <Header.Start>
                <ManageViewsRibbon userQueries={userQueries} components={ribbon} />
            </Header.Start>
            <Header.End>
                <QuickFind components={quickFind} />
            </Header.End>
        </Header>
        <Body components={body}>
            <Grid modules={modules} components={props.components?.grid} />
        </Body>
        <Footer components={footer}>
            <Footer.End>
                <Pagination components={pagination} />
            </Footer.End>
        </Footer>
    </DatasetControl>;
};
