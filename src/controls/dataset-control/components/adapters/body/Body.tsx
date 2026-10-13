import { DatasetControlUi, IBodyUiComponents } from "../../ui";

/** Props for `DatasetControl.Body`. */
export interface IBodyProps {
    /** What shows the records, such as a grid. */
    children?: React.ReactNode;
    /** Added to the body's box. */
    className?: string;
    /** Replacements for the body's slots. */
    components?: Partial<IBodyUiComponents>;
}

/** What fills the height the header and footer leave, usually the grid. */
export const Body = (props: IBodyProps) => <DatasetControlUi.Body {...props} />;
