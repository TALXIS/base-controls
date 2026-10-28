import { GRID_CLASS_NAME } from "../../classNames";

//adds no specificity to the other grid's rules
const OUTSIDE_GRID = `:where(:not(.${GRID_CLASS_NAME} *))`;
//an AG Grid class, or an attribute selector over one such as `[class*="ag-theme-"]`
const AG_GRID_SELECTOR = /\.ag-|\[class\s*[*^~|$]?=\s*["']?ag-/;
//a pseudo-element must stay last in a selector
const PSEUDO_ELEMENT = /::|:(before|after|first-line|first-letter)\b/;

/** Takes this package's grids out of the AG Grid stylesheets other grids put on the page. */
export class AgGridStyleIsolation {
    private static _registrations = 0;
    private static _observer?: MutationObserver;
    private static _isolatedSheets = new WeakSet<CSSStyleSheet>();

    /** @returns Ends it once every grid that asked has gone. */
    public static start(): () => void {
        AgGridStyleIsolation._registrations++;
        if (!AgGridStyleIsolation._observer) {
            AgGridStyleIsolation._observer = new MutationObserver(AgGridStyleIsolation._isolateSheets);
            AgGridStyleIsolation._observer.observe(document.head, { childList: true, subtree: true, characterData: true });
            document.head.addEventListener('load', AgGridStyleIsolation._isolateSheets, true);
            AgGridStyleIsolation._isolateSheets();
        }
        let isStopped = false;
        return () => {
            if (isStopped) {
                return;
            }
            isStopped = true;
            AgGridStyleIsolation._registrations--;
            if (AgGridStyleIsolation._registrations === 0) {
                AgGridStyleIsolation._observer?.disconnect();
                AgGridStyleIsolation._observer = undefined;
                document.head.removeEventListener('load', AgGridStyleIsolation._isolateSheets, true);
            }
        };
    }

    private static _isolateSheets = (): void => {
        for (const sheet of document.styleSheets) {
            if (AgGridStyleIsolation._isolatedSheets.has(sheet) || AgGridStyleIsolation._isOwnSheet(sheet)) {
                continue;
            }
            const rules = AgGridStyleIsolation._getRules(sheet);
            if (rules) {
                AgGridStyleIsolation._isolatedSheets.add(sheet);
                AgGridStyleIsolation._isolateRules(rules);
            }
        }
    };

    //the grid's own styles come from AG Grid's and Fluent's marked stylesheets
    private static _isOwnSheet(sheet: CSSStyleSheet): boolean {
        const owner = sheet.ownerNode;
        return owner instanceof Element && (owner.hasAttribute('data-ag-css') || owner.hasAttribute('data-merge-styles'));
    }

    //a stylesheet from another origin cannot be read
    private static _getRules(sheet: CSSStyleSheet): CSSRuleList | undefined {
        try {
            return sheet.cssRules;
        }
        catch {
            return undefined;
        }
    }

    private static _isolateRules(rules: CSSRuleList): void {
        for (const rule of rules) {
            if (rule instanceof CSSStyleRule && AG_GRID_SELECTOR.test(rule.selectorText) && !rule.selectorText.includes(OUTSIDE_GRID)) {
                rule.selectorText = AgGridStyleIsolation._splitSelectors(rule.selectorText).map(AgGridStyleIsolation._outsideGrid).join(', ');
            }
            if ('cssRules' in rule && !(rule instanceof CSSKeyframesRule)) {
                AgGridStyleIsolation._isolateRules((rule as CSSGroupingRule).cssRules);
            }
        }
    }

    private static _outsideGrid(selector: string): string {
        const pseudoElement = PSEUDO_ELEMENT.exec(selector);
        return pseudoElement ? `${selector.slice(0, pseudoElement.index)}${OUTSIDE_GRID}${selector.slice(pseudoElement.index)}` : `${selector}${OUTSIDE_GRID}`;
    }

    //commas inside `:is()`, `:not()` or an attribute value do not separate selectors
    private static _splitSelectors(selectorText: string): string[] {
        const selectors: string[] = [];
        let depth = 0;
        let quote: string | undefined;
        let start = 0;
        for (let index = 0; index < selectorText.length; index++) {
            const character = selectorText[index];
            if (quote) {
                quote = character === quote ? undefined : quote;
            }
            else if (character === '"' || character === "'") {
                quote = character;
            }
            else if (character === '(' || character === '[') {
                depth++;
            }
            else if (character === ')' || character === ']') {
                depth--;
            }
            else if (character === ',' && depth === 0) {
                selectors.push(selectorText.slice(start, index).trim());
                start = index + 1;
            }
        }
        selectors.push(selectorText.slice(start).trim());
        return selectors;
    }
}
