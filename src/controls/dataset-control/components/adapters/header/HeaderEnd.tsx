import { DatasetControlUi, IHeaderEndUiComponents } from "../../ui";
import { DatasetControlRegionContext } from "../region";

/** Props for `DatasetControl.Header.End`. */
export interface IHeaderEndProps {
    /** The parts drawn against the right. */
    children?: React.ReactNode;
    /** Added to the region's box. */
    className?: string;
    /** Replacements for the region's slots. */
    components?: Partial<IHeaderEndUiComponents>;
}

/** The header's right region, such as for the ribbon, Edit columns and the quick find. */
export const HeaderEnd = (props: IHeaderEndProps) => <DatasetControlRegionContext.Provider value="end">
    <DatasetControlUi.HeaderEnd {...props} />
</DatasetControlRegionContext.Provider>;
