import * as React from "react";
import { Pivot, PivotItem, IPivotProps, IPivotItemProps } from "@fluentui/react";
import { TabComponents, type ITabsComponents } from "./components";
import { useForm } from "../../form/context";
import { IForm } from "../../form/FormModel";
import { useRerender } from "@talxis/react-components";
import { useFormComponent } from "../../form/useFormComponent";

export interface IFormTabsProps {
    children?: React.ReactNode;
    components?: Partial<ITabsComponents>;
    onChangeTab?: (tabId: string) => void;
}

//dummy tab to register the tab in the form model, but not render anything
const DummyTab = (props: {children: React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>>}) => {
    useFormComponent('Tab', props.children.props);
    return <></>
}

const getChildById = (id: string, children: (React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>>)[]) => {
    return children.find(child => React.isValidElement(child) && child.props.id === id);
}

const updateChildTabs = (form: IForm, childrenArray: (React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>>)[]) => {
    for (const child of childrenArray) {
        const tab = form.getTab(child.props.id);
        tab?.update(child.props);
    }
}

export const Tabs = (props: IFormTabsProps) => {
    const form = useForm();
    const { children, onChangeTab } = props;
    const components = {...TabComponents, ...props.components};
    const childrenArray = React.Children.toArray(children).filter(child => React.isValidElement(child));
    const visibleTabs = form.getTabs().filter(tab => tab.visible !== false);
    const rerender = useRerender();
    updateChildTabs(form, childrenArray);

    React.useEffect(() => {
        //update the form model with the latest tab props from children
        rerender();
    }, []);

    if(form.getTabs().length === 0) {
        return <>
            {childrenArray.map((child) => <DummyTab key={child.key}>
                {child}
            </DummyTab>)}
        </>
    }
    else {
        return components.onRenderTabs({
            form: form,
            onChangeTab: onChangeTab,
            children: visibleTabs.map(tab => components.onRenderTab({
                tab: tab,
                form: form,
                onChangeTab: onChangeTab,
                children: getChildById(tab.id, childrenArray)
            }))
        })
    }
}
