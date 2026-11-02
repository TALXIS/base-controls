import { MemoryCache } from '@talxis/client-libraries/dist/helpers/cache/MemoryCache';
import { ThemeGenerator } from "../generator";
import { ITheme, IThemeColors } from "../interfaces";
import { cloneTheme } from "./cloneTheme";

//an edited theme is handed out by reference like a generated one, and nothing mutates what it was handed
const EditedThemeCache = new MemoryCache<ITheme>(true);

/** An edit asked for as a builder is made, which is {@link ThemeBuilder.edit} by another name. */
export interface IThemeEdit {
    /** What this edit is, which is the caller's promise that the same key means the same edit. */
    key: string;
    edit: (theme: ITheme) => void;
}

//an edit is its key and its function or it is neither, never one of the two
export type IOptionalThemeEdit = IThemeEdit | { key?: never; edit?: never };

/** What a theme is worked out from: the colours it is generated from, and the edits over the result. */
export class ThemeBuilder {
    private _colors: IThemeColors;
    private _base?: ITheme;
    private _edits: { key: string; edit: (theme: ITheme) => void }[] = [];

    private constructor(colors: IThemeColors, edit: IOptionalThemeEdit, base?: ITheme) {
        this._colors = colors;
        this._base = base;
        if (edit.key && edit.edit) {
            this.edit(edit.key, edit.edit);
        }
    }

    /** Starts from a theme: its colours are the seed, and it is what comes back where nothing changed. */
    public static from(parameters: { theme: ITheme } & IOptionalThemeEdit): ThemeBuilder {
        return new ThemeBuilder(colorsOf(parameters.theme), parameters, parameters.theme);
    }

    public static fromColors(parameters: { colors: IThemeColors } & IOptionalThemeEdit): ThemeBuilder {
        return new ThemeBuilder({ ...parameters.colors }, parameters);
    }

    /** The colours the theme is generated from: change one and the palette follows it. */
    public get colors(): IThemeColors {
        return this._colors;
    }

    /**
     * Edits the built theme, after everything has had its say on the colours.
     *
     * @param key What this edit is, which is the caller's promise that the same key means the same edit.
     */
    public edit(key: string, edit: (theme: ITheme) => void): void {
        this._edits.push({ key, edit });
    }

    /** The theme, generated from the colours and with every edit applied in the order it was asked. */
    public getTheme(): ITheme {
        return this._edits.reduce((theme, { key, edit }) => this._extend(theme, key, edit), this._generate());
    }

    private _generate(): ITheme {
        const { primary, background, text } = this._colors;
        //what it started from, where nothing asked for anything else
        if (this._base && primary === this._base.palette.themePrimary
            && background === this._base.semanticColors.bodyBackground
            && text === this._base.semanticColors.bodyText) {
            return this._base;
        }
        return ThemeGenerator.generate(this._colors);
    }

    /** A copy of the theme with the edit applied, cached under the theme's id and the edit's key. */
    private _extend(theme: ITheme, key: string, edit: (theme: ITheme) => void): ITheme {
        //a theme nothing can name cannot be cached against, so the edit runs on every call
        if (!theme.id) {
            return this._editCopy(theme, edit);
        }
        const id = `${theme.id}_${key}`;
        return EditedThemeCache.get(id, () => {
            const edited = this._editCopy(theme, edit);
            edited.id = id;
            return edited;
        })!;
    }

    /** The cache hands its themes out by reference, so an edit is given a copy of one. */
    private _editCopy(theme: ITheme, edit: (theme: ITheme) => void): ITheme {
        const copy = cloneTheme(theme);
        //an id is the promise that the same id means the same theme, and this is a different one
        copy.id = undefined;
        edit(copy);
        return copy;
    }
}

/** The three colours a theme is generated from, as a built one holds them. */
export const colorsOf = (theme: ITheme): IThemeColors => ({
    primary: theme.palette.themePrimary,
    background: theme.semanticColors.bodyBackground,
    text: theme.semanticColors.bodyText,
});
