import { DatasetControlUi, IHeaderUiComponents } from "../../ui";
import { HeaderStart } from "./HeaderStart";
import { HeaderEnd } from "./HeaderEnd";

/** Props for `DatasetControl.Header`. */
export interface IHeaderProps {
    /** `Header.Start` and `Header.End`. */
    children?: React.ReactNode;
    /** The widest header, in pixels, whose parts draw compact. Defaults to `DEFAULT_MAX_COMPACT_WIDTH`. */
    maxCompactWidth?: number;
    /** Added to the header's box. */
    className?: string;
    /** Replacements for the header's slots. */
    components?: Partial<IHeaderUiComponents>;
}

const HeaderRow = (props: IHeaderProps) => <DatasetControlUi.Header {...props} />;

/** The row above the records, with `Start` and `End` regions for its parts. */
export const Header = Object.assign(HeaderRow, { Start: HeaderStart, End: HeaderEnd });
