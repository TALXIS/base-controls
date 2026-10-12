import { DatasetControlUi, IFooterEndUiComponents } from "../../ui";
import { DatasetControlRegionContext } from "../region";

export interface IFooterEndProps {
    children?: React.ReactNode;
    className?: string;
    components?: Partial<IFooterEndUiComponents>;
}

/** The footer's right region, such as for the paging. */
export const FooterEnd = (props: IFooterEndProps) => <DatasetControlRegionContext.Provider value="end">
    <DatasetControlUi.FooterEnd {...props} />
</DatasetControlRegionContext.Provider>;
