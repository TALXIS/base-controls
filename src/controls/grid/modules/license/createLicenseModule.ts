import { LicenseManager } from "ag-grid-enterprise";
import { IGridModule } from "../../interfaces";

export interface ILicenseModuleOptions {
    /** The AG Grid enterprise key, as your host supplies it. */
    key: string;
}

export interface ILicenseModule extends IGridModule<'license'> { }

declare module "../../interfaces" {
    interface IGridModuleMap {
        /** Only sets the key, so there is nothing to look up. */
        license: void;
    }
}

/** Builds the module that licenses AG Grid. */
export const createLicenseModule = ({ key }: ILicenseModuleOptions): ILicenseModule => ({
    name: 'license',
    onLoad: () => LicenseManager.setLicenseKey(key),
});
