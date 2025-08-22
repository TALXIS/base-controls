import { IColumn, IDataset } from "@talxis/client-libraries";
import { IControl, IParameters, ITwoOptionsProperty } from "../../interfaces";
import { IButtonProps, IIconProps, ITextProps, ThemeProviderProps } from "@fluentui/react";
import { gridColumnHeaderTranslations } from "./translations";

export interface IGridColumnHeader extends IControl<IGridColumnHeaderParameters, any, typeof gridColumnHeaderTranslations, IGridColumnHeaderComponentProps> {

}

interface IGridColumnHeaderComponentProps {
    onRender: (props: IComponentProps, defaultRender: (props: IComponentProps) => React.ReactElement) => React.ReactElement;
}

interface IComponentProps {
    container: ThemeProviderProps;
    onRenderCommandBarButton: (props: ICommandBarButtonProps, defaultRender: (props: ICommandBarButtonProps) => React.ReactElement) => React.ReactElement;
}

interface ICommandBarButtonProps {
    buttonProps: IButtonProps;
    onRenderColumnDisplayNameContainer: (props: IColumnDisplayNameContainerProps, defaultRender: (props: IColumnDisplayNameContainerProps) => React.ReactElement) => React.ReactElement;
    onRenderSuffixIconContainer: (props: ISuffixIcons, defaultRender: (props: ISuffixIcons) => React.ReactElement) => React.ReactElement;
}

interface IColumnDisplayNameContainerProps {
    container: React.HTMLAttributes<HTMLDivElement>;
    onRenderGroupingIcon: (props: React.SVGAttributes<SVGElement>, defaultRender: (props: React.SVGAttributes<SVGElement>) => React.ReactElement) => React.ReactElement;
    onRenderColumnDisplayName: (props: ITextProps, defaultRender: (props: ITextProps) => React.ReactElement) => React.ReactElement;
    onRenderRequiredSymbol: (props: ITextProps, defaultRender: (props: ITextProps) => React.ReactElement) => React.ReactElement;
}

interface ISuffixIcons {
    container: React.HTMLAttributes<HTMLDivElement>;
    onRenderSortIcon: (props: IIconProps, defaultRender: (props: IIconProps) => React.ReactElement) => React.ReactElement;
    onRenderFilterIcon: (props: IIconProps, defaultRender: (props: IIconProps) => React.ReactElement) => React.ReactElement;
    onRenderUneditableIcon: (props: IIconProps, defaultRender: (props: IIconProps) => React.ReactElement) => React.ReactElement;
    onRenderSumIcon: (props: React.SVGAttributes<SVGElement>, defaultRender: (props: React.SVGAttributes<SVGElement>) => React.ReactElement) => React.ReactElement;
}

export interface IGridColumnHeaderParameters extends IParameters {
    Dataset: {
        raw: IDataset;
    }
    Column: {
        raw: IColumn;
    }
    /**
     * Should correspond to the `EnableEditing` property in the Grid control.
     */
    EnableEditing?: Omit<ITwoOptionsProperty, 'attributes'>;
}

