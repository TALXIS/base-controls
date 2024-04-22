import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { IMultiSelectOptionSet } from "../../../src/components/MultiSelectOptionSet";
import { MultiSelectOptionSet as MultiSelectOptionSetComponent } from '../../../src/components/MultiSelectOptionSet';

export class MultiSelectOptionSet implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    private _notifyOutputChanged: () => void;
    private _container: HTMLDivElement;
    private _outputs: IOutputs = {};
    constructor() {

    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
        //local debugger adds string here
        context.parameters.value.raw = null;
        this._notifyOutputChanged = notifyOutputChanged;
        this._container = container;
        // Add control initialization code
    }
    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        //@ts-ignore - local debugger does not have options
        context.parameters.value.attributes?.Options = [
            {
                Color: null,
                Label: 'Option 1',
                Value: 1
            },
            {
                Color: null,
                Label: 'Option 2',
                Value: 2
            },
            {
                Color: null,
                Label: 'Option 3',
                Value: 3
            }
        ]
        ReactDOM.render(React.createElement(MultiSelectOptionSetComponent as any, {
            context: context,
            parameters: {
                value: context.parameters.value
            },
            onNotifyOutputChanged: (outputs) => {
                this._outputs = {
                    value: outputs.value
                };
                this._notifyOutputChanged();
            }
        } as IMultiSelectOptionSet), this._container);
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as "bound" or "output"
     */
    public getOutputs(): IOutputs {
        return this._outputs;
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        // Add code to cleanup control if necessary
    }
}
