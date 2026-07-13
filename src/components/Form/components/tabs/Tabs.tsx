import * as React from "react";
import { Pivot, useTheme, PivotItem } from "@fluentui/react";
import { TabsContext } from "./context";
import { getTabsStyles } from "./styles";
import { FormContext } from "../../form/FormContext";
import { useFormInstance } from "../../form/useFormInstance";
import { useFormUiState } from "../../form/useFormUiState";
import { useForm } from "../../form/context";
import { IForm } from "../../form/FormModel";
import { useRerender } from "@talxis/react-components";
import { useFormComponent } from "../../form/useFormComponent";

export interface IFormTabsProps {
    children?: React.ReactNode;
    onTabChange?: (tabId: string) => void;
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
    const { children, onTabChange } = props;
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
        return <Pivot selectedKey={form.getExpandedTab()?.id} onLinkClick={(item) => onTabChange?.(item?.props.itemKey!)}>
            {visibleTabs.map(tab => <PivotItem key={tab.id} headerText={tab.label ?? tab.name ?? tab.id} itemKey={tab.id}>
                {getChildById(tab.id, childrenArray)}
            </PivotItem>)}
        </Pivot>
    }
}
