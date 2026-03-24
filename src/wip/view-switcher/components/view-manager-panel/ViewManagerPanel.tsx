import { useViewSwitcherComponents } from "../../context";
import { Panel } from "./panel";

interface IViewManagerPanelProps {
    onDismiss: () => void;
}



export const ViewManagerPanel = (props: IViewManagerPanelProps) => {
    const components = useViewSwitcherComponents();
    
    return <components.ViewManagerPanel
        components={{
            Footer: null,
            Panel: Panel
        }} 
        onDismiss={props.onDismiss}>
<div>
                <div>
                    header
                </div>
                <div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                    <div>child</div>
                </div>
                <div>
                    footer
                </div>
            </div>
    </components.ViewManagerPanel>
}