import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { Grid as GridComponent } from '../../../dist/components/Grid/Grid';
import { Mock } from "./mock";
import { IGrid } from "../../../dist/components/Grid/interfaces";

export class Grid implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private _container: HTMLDivElement;
    private _state: ComponentFramework.Dictionary;
    private _mock: Mock;

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
        this._container = container;
        this._state = state;
        //@ts-ignore - internal prop, specifies if the control is running in harness
        if(context.factory._customControlProperties?.controlId === 'TestControl') {
            this._mock = new Mock(this);
        }
    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        const parameters = context.parameters;
        if(this._mock) {
            this._mock.injectDatasetApis(context);
        }
        ReactDOM.render(React.createElement(GridComponent, {
            context: context as any,
            state: this._state,
            parameters: {
                Grid: parameters.Grid,
                EnableEditing: {
                    raw: parameters.EnableEditing.raw === 'true'
                },
                EnablePagination: {
                    raw: parameters.EnablePagination.raw === 'false' ? false : true
                },
                EnableFiltering: {
                    raw: parameters.EnableFiltering.raw === 'false' ? false : true
                },
                EnableSorting: {
                    raw: parameters.EnableSorting.raw === 'false' ? false : true
                },
                EnableNavigation: {
                    raw: parameters.EnableNavigation.raw === 'false' ? false : true
                },
                UseContainerAsHeight: {
                    raw: parameters.UseContainerAsHeight?.raw === 'true'
                },
                EnableOptionSetColors: {
                    raw: parameters.EnableOptionSetColors?.raw === 'true'
                },
                InlineRibbonButtonIds: {
                    raw: parameters.InlineRibbonButtonIds?.raw
                },
                SelectableRows: this._getSelectableRowsParameter(parameters.SelectableRows)
            }
        } as IGrid), this._container);
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as "bound" or "output"
     */
    public getOutputs(): IOutputs {
        return {};
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        if(!this._container) {
            return;
        }
        ReactDOM.unmountComponentAtNode(this._container);
    }
    private _getSelectableRowsParameter(selectableRows?: ComponentFramework.PropertyTypes.EnumProperty<"none" | "single" | "multiple">) {
        switch (selectableRows?.raw) {
            //@ts-ignore - legacy binding support
            case 'true': {
                return {
                    ...selectableRows,
                    raw: 'multiple'
                };
            }
            //@ts-ignore - legacy binding support
            case 'false': {
                return {
                    ...selectableRows,
                    raw: 'none'
                };
            }
        }
        return selectableRows;
    }
}
