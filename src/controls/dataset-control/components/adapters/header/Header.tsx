import { DatasetControlUi, IHeaderUiComponents } from "../../ui";
import { useRequiredDatasetControlRuntime } from "../root/context";
import { HeaderStart } from "./HeaderStart";
import { HeaderEnd } from "./HeaderEnd";

/** Props for `DatasetControl.Header`. */
export interface IHeaderProps {
    /** `Header.Start` and `Header.End`. */
    children?: React.ReactNode;
    /** Added to the header's box. */
    className?: string;
    /** Replacements for the header's slots. */
    components?: Partial<IHeaderUiComponents>;
}

const HeaderRow = (props: IHeaderProps) => {
    const runtime = useRequiredDatasetControlRuntime();
    return <DatasetControlUi.Header isPadded={runtime.getHeight() === '100%'} {...props} />;
};

/** The row above the records, with `Start` and `End` regions for its parts. */
export const Header = Object.assign(HeaderRow, { Start: HeaderStart, End: HeaderEnd });
