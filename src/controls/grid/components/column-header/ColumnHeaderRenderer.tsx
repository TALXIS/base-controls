import { IColumnHeaderParams } from "./root/ColumnHeaderRoot";
import { ColumnHeaderContainer } from "./container/ColumnHeaderContainer";
import { IColumnHeaderRendererComponents } from "./components";
import { ColumnHeaderContent } from "./content/ColumnHeaderContent";
import { ColumnHeaderLabel } from "./label/ColumnHeaderLabel";
import { ColumnHeaderMenu } from "./menu/ColumnHeaderMenu";
import { ColumnHeaderRequiredMarker } from "./required-marker/ColumnHeaderRequiredMarker";
import { ColumnHeaderPrefix } from "./prefix/ColumnHeaderPrefix";
import { ColumnHeaderRoot } from "./root/ColumnHeaderRoot";
import { ColumnHeaderSuffix } from "./suffix/ColumnHeaderSuffix";
import { ITheme } from "@theme";
import { ColumnHeaderTheme } from "./theme/ColumnHeaderTheme";

/**
 * What a consumer sets on a column to change its header, through `colDef.headerComponentParams`.
 *
 * AG Grid spreads them into the header's own props, so nothing has to be plumbed for them to arrive.
 */
export interface IColumnHeaderRendererOptions {
    /** The seed the header's theme is generated from, in place of the grid's own. */
    theme?: ITheme;
    components?: IColumnHeaderRendererComponents;
}

export interface IColumnHeaderRendererProps extends IColumnHeaderParams, IColumnHeaderRendererOptions { }

/**
 * A column's header: its name, and what the modules add to it.
 *
 * A plain function component on purpose: AG Grid hands a `forwardRef` one a ref and refreshes it in
 * place, which is not what a header built from parts wants.
 */
export const ColumnHeaderRenderer = (props: IColumnHeaderRendererProps) => {
    const components = props.components ?? {};

    return <ColumnHeaderRoot {...props}>
        <ColumnHeaderTheme theme={props.theme}>
            <ColumnHeaderContainer components={components.container}>
                <ColumnHeaderPrefix components={components.prefix} />
                <ColumnHeaderContent components={components.content}>
                    <ColumnHeaderLabel components={components.label} />
                    <ColumnHeaderRequiredMarker components={components.requiredMarker} />
                </ColumnHeaderContent>
                <ColumnHeaderSuffix components={components.suffix} />
            </ColumnHeaderContainer>
            {/* outside the container: what it opens is drawn over the grid */}
            <ColumnHeaderMenu components={components.menu} />
        </ColumnHeaderTheme>
    </ColumnHeaderRoot>;
};
