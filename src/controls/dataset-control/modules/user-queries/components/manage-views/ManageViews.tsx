import { useMemo } from "react";
import { IDataProvider } from "@talxis/client-libraries";
import { GridRoot as Grid } from "@controls/grid/Grid";
import { createClientSideRowModelModule } from "@controls/grid/modules/row-model/client-side/createClientSideRowModelModule";
import { createEditingModule } from "@controls/grid/modules/editing/createEditingModule";
import { createFilteringModule } from "@controls/grid/modules/filtering/createFilteringModule";
import { createRowSelectionModule } from "@controls/grid/modules/row-selection/createRowSelectionModule";
import { createSortingModule } from "@controls/grid/modules/sorting/createSortingModule";
import type { IGridComponents } from "@controls/grid/components/components";
import type { IRibbonComponents } from "@controls/ribbon/components";
import type { IDatasetControlComponents } from "../../../../components/adapters/root/components";
import type { IBodyUiComponents, IFooterUiComponents, IHeaderUiComponents, IPaginationUiComponents, IQuickFindUiComponents } from "../../../../components/ui";
import { Root as DatasetControl } from "../../../../components/adapters/root/Root";
import { Body } from "../../../../components/adapters/body/Body";
import { Footer } from "../../../../components/adapters/footer/Footer";
import { Header } from "../../../../components/adapters/header/Header";
import { QuickFind } from "../../../../components/adapters/quick-find/QuickFind";
import { Pagination } from "../../../../components/adapters/pagination/Pagination";
import type { DatasetControlUserQueries } from "../../DatasetControlUserQueries";
import { ManageViewsRibbon } from "../manage-views-ribbon";
import { getManageViewsStyles } from "./styles";
import { UserQueries } from "../user-queries";

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
    userQueries: DatasetControlUserQueries;
    saveText: string;
    deleteText: string;
    confirmDeleteText: string;
    components?: IManageViewsComponents;
}

/** The user's views as an editable, sortable and filterable DatasetControl. */
export const ManageViews = (props: IManageViewsProps) => {
    const styles = useMemo(() => getManageViewsStyles(), []);
    const modules = useMemo(() => ({
        rowModel: createClientSideRowModelModule(),
        editing: createEditingModule(),
        rowSelection: createRowSelectionModule({ mode: 'multiple' }),
        sorting: createSortingModule(),
        filtering: createFilteringModule(),
    }), []);

    const { header, body, footer, ribbon, quickFind, pagination, ...datasetControl } = props.components?.datasetControl ?? {};

    const onLoad = async (): Promise<{ provider: IDataProvider }> => ({ provider: props.userQueries.getProvider() });

    return <DatasetControl onLoad={onLoad} destroyProviderOnUnmount={false} height='100%' className={styles.datasetControl} components={datasetControl}>
        <Header className={styles.header} components={header}>
            <Header.Start>
                <ManageViewsRibbon saveText={props.saveText} deleteText={props.deleteText} confirmDeleteText={props.confirmDeleteText} components={ribbon} />
                <UserQueries />
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

