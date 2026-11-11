import { useMemo } from "react";
import { DatasetControlUiHeaderItems } from "../header-item";
import { getClassNames } from "@core";
import { DatasetControlUiHeaderStartComponents, IDatasetControlUiHeaderStartComponents } from "./components";
import { getDatasetControlUiHeaderStartStyles } from "./styles";

/** Props for the header's start region, as plain UI. */
export interface IDatasetControlUiHeaderStartProps {
    /** The parts drawn against the left. */
    children?: React.ReactNode;
    /** Added to its box. */
    className?: string;
    /** Replacements for its slots. */
    components?: Partial<IDatasetControlUiHeaderStartComponents>;
}

/** The header's left region, sized to what it holds. */
export const DatasetControlUiHeaderStart = (props: IDatasetControlUiHeaderStartProps) => {
    const components = { ...DatasetControlUiHeaderStartComponents, ...props.components };
    const styles = useMemo(() => getDatasetControlUiHeaderStartStyles(), []);
    return components.onRender({ className: getClassNames([styles.datasetControlHeaderStart, props.className]), children: <DatasetControlUiHeaderItems>{props.children}</DatasetControlUiHeaderItems> });
};
