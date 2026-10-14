import { useMemo, useState } from "react";
import { HeaderItems } from "../header-item";
import { getClassNames } from "@utils";
import { HeaderUiComponents, IHeaderUiComponents } from "./components";
import { DatasetControlHeaderContext, IDatasetControlHeader } from "./context";
import { getHeaderUiStyles } from "./styles";

/** Props for the header, as plain UI. */
export interface IHeaderUiProps {
    /** The start and end regions. */
    children?: React.ReactNode;
    /** The widest header, in pixels, whose parts draw compact. Defaults to `DEFAULT_MAX_COMPACT_WIDTH`. */
    maxCompactWidth?: number;
    /** Added to its box. */
    className?: string;
    /** Replacements for its slots. */
    components?: Partial<IHeaderUiComponents>;
}

/** The row above the records, holding the view switcher, ribbon, quick find and other commands. */
export const Header = (props: IHeaderUiProps) => {
    const components = { ...HeaderUiComponents, ...props.components };
    const [isolatedClassName, setIsolatedClassName] = useState<string>();
    const styles = useMemo(() => getHeaderUiStyles(isolatedClassName), [isolatedClassName]);
    const header = useMemo((): IDatasetControlHeader => ({
        showOnly: className => setIsolatedClassName(className),
        showAll: () => setIsolatedClassName(undefined),
    }), []);

    return <DatasetControlHeaderContext.Provider value={header}>
        {components.onRenderContainer({
            className: getClassNames([styles.datasetControlHeader, props.className]),
            maxCompactWidth: props.maxCompactWidth,
            children: <HeaderItems>{props.children}</HeaderItems>,
        })}
    </DatasetControlHeaderContext.Provider>;
};
