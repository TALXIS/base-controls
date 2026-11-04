import { DatasetControlUi, IFooterEndUiComponents } from "../../ui";
import { DatasetControlRegionContext } from "../region";

/** Props for `DatasetControl.Footer.End`. */
export interface IFooterEndProps {
    /** The parts drawn against the right. */
    children?: React.ReactNode;
    /** Added to the region's box. */
    className?: string;
    /** Replacements for the region's slots. */
    components?: Partial<IFooterEndUiComponents>;
}

/** The footer's right region, such as for the paging. */
export const FooterEnd = (props: IFooterEndProps) => <DatasetControlRegionContext.Provider value="end">
    <DatasetControlUi.FooterEnd {...props} />
</DatasetControlRegionContext.Provider>;
