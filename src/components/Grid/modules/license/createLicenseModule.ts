import { LicenseManager } from "@ag-grid-enterprise/core";
import { IGridLicenseModule } from "../interfaces";

export interface ILicenseModuleOptions {
    /** The AG Grid enterprise key, as your host supplies it. */
    key: string;
}

/**
 * Builds the module that licenses AG Grid.
 *
 * Only build it when there is a key: the key is global to the page and last-writer-wins, so a keyless grid
 * mounting second must never un-license a keyed one still on screen.
 *
 * @example
 * ```tsx
 * <Grid modules={{ rowModel: createServerSideRowModelModule(), license: createLicenseModule({ key }) }} />
 * ```
 */
export const createLicenseModule = ({ key }: ILicenseModuleOptions): IGridLicenseModule => ({
    onRegister: () => LicenseManager.setLicenseKey(key),
});
