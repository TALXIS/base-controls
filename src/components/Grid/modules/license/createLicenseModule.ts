import { LicenseManager } from "@ag-grid-enterprise/core";
import { IGridLicenseModule } from "../interfaces";

export interface ILicenseModuleOptions {
    /** The AG Grid enterprise key, as your host supplies it. */
    key: string;
}

/**
 * Builds the module that licenses AG Grid.
 *
 * @example
 */
export const createLicenseModule = ({ key }: ILicenseModuleOptions): IGridLicenseModule => ({
    onRegister: () => LicenseManager.setLicenseKey(key),
});
