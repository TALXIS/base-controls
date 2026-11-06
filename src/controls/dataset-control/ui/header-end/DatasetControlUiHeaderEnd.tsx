import { useMemo } from "react";
import { DatasetControlUiHeaderItems } from "../header-item";
import { getClassNames } from "@core";
import { DatasetControlUiHeaderEndComponents, IDatasetControlUiHeaderEndComponents } from "./components";
import { getDatasetControlUiHeaderEndStyles } from "./styles";

/** Props for the header's end region, as plain UI. */
export interface IDatasetControlUiHeaderEndProps {
    /** The parts drawn against the right. */
    children?: React.ReactNode;
    /** Added to its box. */
    className?: string;
    /** Replacements for its slots. */
    components?: Partial<IDatasetControlUiHeaderEndComponents>;
}

/** The header's right region, taking the rest of the row with its content against the right edge. */
export const DatasetControlUiHeaderEnd = (props: IDatasetControlUiHeaderEndProps) => {
    const components = { ...DatasetControlUiHeaderEndComponents, ...props.components };
    const styles = useMemo(() => getDatasetControlUiHeaderEndStyles(), []);
    return components.onRenderContainer({ className: getClassNames([styles.datasetControlHeaderEnd, props.className]), children: <DatasetControlUiHeaderItems>{props.children}</DatasetControlUiHeaderItems> });
};
