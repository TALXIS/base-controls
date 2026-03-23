import { CommandBar, ICommandBarProps } from "./command-bar";
import { IPanelProps, Panel } from "../../panel";


export interface IEditColumnsComponents {
    SelectedColumnCommandBar: (props: ICommandBarProps) => React.JSX.Element;
    Panel: (props: IPanelProps) => React.JSX.Element;

}

export const components: IEditColumnsComponents = {
    SelectedColumnCommandBar: CommandBar,
    Panel: Panel
}