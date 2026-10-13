import { DatasetControlUi, IFooterUiComponents } from "../../ui";
import { FooterStart } from "./FooterStart";
import { FooterEnd } from "./FooterEnd";

/** Props for `DatasetControl.Footer`. */
export interface IFooterProps {
    /** `Footer.Start` and `Footer.End`. */
    children?: React.ReactNode;
    /** Added to the footer's box. */
    className?: string;
    /** Replacements for the footer's slots. */
    components?: Partial<IFooterUiComponents>;
}

const FooterRow = (props: IFooterProps) => <DatasetControlUi.Footer {...props} />;

/** The row below the records, with `Start` and `End` regions for its parts. */
export const Footer = Object.assign(FooterRow, { Start: FooterStart, End: FooterEnd });
