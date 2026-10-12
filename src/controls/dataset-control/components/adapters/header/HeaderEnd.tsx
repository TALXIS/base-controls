import { DatasetControlUi, IHeaderEndUiComponents } from "../../ui";
import { DatasetControlRegionContext } from "../region";

export interface IHeaderEndProps {
    children?: React.ReactNode;
    className?: string;
    components?: Partial<IHeaderEndUiComponents>;
}

/** The header's right region, such as for the ribbon, Edit columns and the quick find. */
export const HeaderEnd = (props: IHeaderEndProps) => <DatasetControlRegionContext.Provider value="end">
    <DatasetControlUi.HeaderEnd {...props} />
</DatasetControlRegionContext.Provider>;
