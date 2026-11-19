import React, { useEffect, useLayoutEffect, useRef } from "react";
import { useContextWithNullCheck } from "@core";
import { useProvidePart } from "@controls/runtime-host";
import type { IForm } from "../../runtime/interfaces";
import type { FormTab } from "../../runtime/parts/tab/FormTab";
import type { FormSection } from "../../runtime/parts/section/FormSection";
import type { FormControl } from "../../runtime/parts/control/FormControl";

export const FormV2Context = React.createContext<IForm | null>(null);

FormV2Context.displayName = "FormV2Context";

/** The `FormV2` the component is inside of; throws outside one. */
export const useFormV2 = (): IForm => {
    return useContextWithNullCheck(FormV2Context);
};

//from effects: the strip may not re-render while a tab renders
export const useProvideFormTab = (name: string, create: () => FormTab): FormTab => {
    const form = useFormV2();
    const tab = useProvidePart(form.tabs, name, create);
    const detachRef = useRef<() => void>();
    useLayoutEffect(() => {
        detachRef.current = form.tabs.attach(tab);
    }, []);
    //declared after the provide, so its cleanup runs once the tab is gone
    useEffect(() => () => detachRef.current?.(), []);
    return tab;
};

export const useProvideFormSection = (name: string, create: () => FormSection): FormSection => {
    return useProvidePart(useFormV2().sections, name, create);
};

export const useProvideFormControl = (name: string, create: () => FormControl): FormControl => {
    return useProvidePart(useFormV2().controls, name, create);
};
