/**
 * What tells a password manager to leave an input alone.
 *
 * None of these fields is a credential, so an extension offering to fill one is wrong - and on a grid it is
 * expensive as well as wrong: the manager rescans on every mutation and puts an icon in every input it
 * accepts, which a virtualised grid of them does constantly.
 *
 * One attribute per vendor, because there is no standard: Bitwarden, 1Password, LastPass, Dashlane.
 */
export const PASSWORD_MANAGER_IGNORE_PROPS = {
    'data-bwignore': true,
    'data-1p-ignore': true,
    'data-lpignore': true,
    'data-form-type': 'other',
} as const;
