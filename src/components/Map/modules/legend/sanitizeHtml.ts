import DOMPurify from 'dompurify';

/**
 * Attributes a legend is allowed to carry on top of the HTML and SVG defaults.
 *
 * `style` is on the list because a legend is mostly colour swatches, and taking it away would leave the
 * feature unable to do the one thing it exists for. DOMPurify still parses and filters the declarations.
 */
const ALLOWED_ATTRIBUTES = ['style', 'class', 'title', 'alt', 'width', 'height', 'colspan', 'rowspan'];

/** Marker DOMPurify sets on a link it kept, so the hook below only rewrites what survived. */
const LINK_TAG = 'A';

let isHookInstalled = false;

/**
 * Makes every surviving link safe to open, once per page.
 *
 * A legend is authored content, but it may come from a web resource an author edits without review - so a
 * link out of it opens detached from the app rather than with a handle on `window.opener`.
 */
const installLinkHook = () => {
    if (isHookInstalled) {
        return;
    }
    isHookInstalled = true;
    DOMPurify.addHook('afterSanitizeAttributes', (node) => {
        if (node.nodeName !== LINK_TAG || !(node as Element).getAttribute('href')) {
            return;
        }
        (node as Element).setAttribute('target', '_blank');
        (node as Element).setAttribute('rel', 'noopener noreferrer');
    });
};

/**
 * Cleans HTML before the control puts it on the page. The legend is the one place the Map renders markup
 * it did not write - from a manifest property or a web resource, neither of which is reviewed. Scripts,
 * event handlers, forms and anything that can load or submit are removed; formatting, tables, images and
 * inline SVG survive, since that is what a legend is made of.
 */
export const sanitizeMapHtml = (html: string | null | undefined): string => {
    if (!html?.trim()) {
        return '';
    }
    installLinkHook();
    return DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true, svg: true },
        ADD_ATTR: ALLOWED_ATTRIBUTES,
        FORBID_TAGS: ['form', 'input', 'button', 'textarea', 'select', 'option', 'iframe', 'object', 'embed'],
        //an unknown protocol is how a javascript: url sneaks past a naive allow list
        ALLOW_UNKNOWN_PROTOCOLS: false
    });
};
