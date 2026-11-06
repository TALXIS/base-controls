import { DatasetControlUi, IDatasetControlUiFooterStartComponents } from "../../ui";
import { DatasetControlRegionContext } from "../region";

/** Props for `DatasetControl.Footer.Start`. */
export interface IFooterStartProps {
    /** The parts drawn against the left. */
    children?: React.ReactNode;
    /** Added to the region's box. */
    className?: string;
    /** Replacements for the region's slots. */
    components?: Partial<IDatasetControlUiFooterStartComponents>;
}

/** The footer's left region, such as for the record count. */
export const FooterStart = (props: IFooterStartProps) => <DatasetControlRegionContext.Provider value="start">
    <DatasetControlUi.FooterStart {...props} />
</DatasetControlRegionContext.Provider>;
