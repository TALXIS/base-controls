import type { ComponentType } from "react";
import type { BaseControl } from "@pcf";

const registeredControls = new Map<string, ComponentType<any>>();

/** Lets `NestedControlRenderer` draw a base control that lives outside `fields`, such as the grid's. */
export const registerBaseControl = (name: BaseControl, control: ComponentType<any>): void => {
    registeredControls.set(name, control);
};

export const getRegisteredBaseControl = (name: string): ComponentType<any> | undefined => registeredControls.get(name);
