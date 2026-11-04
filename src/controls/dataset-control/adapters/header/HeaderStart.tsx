import { DatasetControlUi, IHeaderStartUiComponents } from "../../ui";
import { DatasetControlRegionContext } from "../region";

/** Props for `DatasetControl.Header.Start`. */
export interface IHeaderStartProps {
    /** The parts drawn against the left. */
    children?: React.ReactNode;
    /** Added to the region's box. */
    className?: string;
    /** Replacements for the region's slots. */
    components?: Partial<IHeaderStartUiComponents>;
}

/** The header's left region, such as for the view switcher. */
export const HeaderStart = (props: IHeaderStartProps) => <DatasetControlRegionContext.Provider value="start">
    <DatasetControlUi.HeaderStart {...props} />
</DatasetControlRegionContext.Provider>;
