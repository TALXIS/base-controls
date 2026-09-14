import { CellHost, ICellHostProps } from "../../cell-host";
import { CellUi, ICellNotificationsProps, ICellUiProps } from "../../ui";

/** The replaceable pieces of a field's cell. Override through `ICellAdapterProps.components`. */
export interface ICellComponents {
    /** The element everything else is drawn in: the alignment, the theme's text and font, the grip. */
    onRenderCell: (props: ICellUiProps) => JSX.Element;
    /** What draws the value. Defaults to the host, which is what gives a cell everything a cell has. */
    onRenderControl: (props: ICellHostProps) => JSX.Element;
    /** What shows in place of a value that has not arrived. Called only while one has not. */
    onRenderLoading: () => JSX.Element;
    /** What the field has to say about its value. A stub today. */
    onRenderNotifications: (props: ICellNotificationsProps) => JSX.Element | null;
}

/** The defaults for {@link ICellComponents}. */
export const CellComponents: ICellComponents = {
    onRenderCell: props => <CellUi.Cell {...props} />,
    onRenderControl: props => <CellHost {...props} />,
    onRenderLoading: () => <CellUi.Loading />,
    onRenderNotifications: props => <CellUi.Notifications {...props} />,
};
