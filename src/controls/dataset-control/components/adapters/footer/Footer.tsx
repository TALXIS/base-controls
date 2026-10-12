import { DatasetControlUi, IFooterUiComponents } from "../../ui";
import { FooterStart } from "./FooterStart";
import { FooterEnd } from "./FooterEnd";

export interface IFooterProps {
    children?: React.ReactNode;
    className?: string;
    components?: Partial<IFooterUiComponents>;
}

const FooterRow = (props: IFooterProps) => <DatasetControlUi.Footer {...props} />;

/** The row below the records, with `Start` and `End` regions for its parts. */
export const Footer = Object.assign(FooterRow, { Start: FooterStart, End: FooterEnd });
