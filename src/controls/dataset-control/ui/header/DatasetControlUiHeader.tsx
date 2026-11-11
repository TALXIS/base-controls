import { useMemo, useState } from "react";
import { DatasetControlUiHeaderItems } from "../header-item";
import { getClassNames } from "@core";
import { DatasetControlUiHeaderComponents, IDatasetControlUiHeaderComponents } from "./components";
import { SetIsolatedHeaderItemContext, IsolatedHeaderItemContext } from "./context";
import { getDatasetControlUiHeaderStyles } from "./styles";

/** Props for the header, as plain UI. */
export interface IDatasetControlUiHeaderProps {
    /** The start and end regions. */
    children?: React.ReactNode;
    /** Insets the row from the edges, for a control that fills its parent. */
    isPadded?: boolean;
    /** Added to its box. */
    className?: string;
    /** Replacements for its slots. */
    components?: Partial<IDatasetControlUiHeaderComponents>;
}

/** The row above the records, holding the view switcher, ribbon, quick find and other commands. */
export const DatasetControlUiHeader = (props: IDatasetControlUiHeaderProps) => {
    const components = { ...DatasetControlUiHeaderComponents, ...props.components };
    const [isolated, setIsolated] = useState<Element>();
    const styles = useMemo(() => getDatasetControlUiHeaderStyles(!!props.isPadded), [props.isPadded]);

    return <SetIsolatedHeaderItemContext.Provider value={setIsolated}>
        <IsolatedHeaderItemContext.Provider value={isolated}>
            {components.onRender({
                className: getClassNames([styles.datasetControlHeader, props.className]),
                children: <DatasetControlUiHeaderItems>{props.children}</DatasetControlUiHeaderItems>,
            })}
        </IsolatedHeaderItemContext.Provider>
    </SetIsolatedHeaderItemContext.Provider>;
};
