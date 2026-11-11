import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

const STORIES = path.resolve('storybook/src/stories');

const PROPER_NOUN = /^(AG|Grid|DatasetControl|TaskGrid|Gantt|Fluent|UI|PCF|Xrm|Ribbon|RuntimeHost|IsolatedFrame|Dataverse|API|Map|Form|Checklist|FormXml|I[A-Z]|Czech|English|React|TALXIS|JSON|CSS|ID)/;
const CONTRACTION = /\b(\w+n't|it's|you're|we're|that's|there's)\b/gi;
//Localization is the title of a page, not a spelling choice
const AMERICAN = /\b(customiz\w*|colors?\b|behaviors?\b|initializ\w*|organiz\w*|favorite|center\b|canceled|labeled|analyz\w*|normaliz\w*|optimiz\w*|recogniz\w*|serializ\w*|finaliz\w*|synchroniz\w*|visualiz\w*|prioritiz\w*|summariz\w*|minimiz\w*|maximiz\w*|(?!Localization)localiz\w*|personaliz\w*|categoriz\w*|authoriz\w*)/gi;

//as Storybook sanitises each title segment
//the page a control's card leads to, titled with the control's name
const ENTRY_PAGES = ['Get started', 'Overview'];
const toDocsId = (title) => `docs/${title.split('/').map(part => part.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')).join('-')}--overview`;
const withoutCode = (text) => text.replace(/`[^`]*`/g, 'x');
const countSentences = (text) => (text.match(/[.!?](\s|$)/g) ?? []).length;

const pages = globSync(`${STORIES}/**/*.stories.tsx`).sort().flatMap(file => {
    const source = fs.readFileSync(file, 'utf8');
    const title = source.match(/^    title: '([^']*)'/m)?.[1];
    return title && !title.startsWith('Dev/') ? [{ file: path.relative(STORIES, file), title, source }] : [];
});

const titlesById = new Map(pages.map(page => [toDocsId(page.title), page.title]));

const checkCards = (source, report) => {
    for (const [, cardTitle, href] of source.matchAll(/\{ title: '((?:[^'\\]|\\.)*)'.*?href: '\?path=\/(docs\/[^']*)'/g)) {
        const target = titlesById.get(href);
        if (!target) {
            report(`card links to an unknown page: ${href}`);
            continue;
        }
        const parts = target.split('/');
        const last = parts.at(-1);
        const name = ENTRY_PAGES.includes(last) ? parts.at(-2) : last;
        if (cardTitle !== last && cardTitle !== name) {
            report(`card title "${cardTitle}" does not match the page "${target}"`);
        }
    }
};

const checkShape = (description, report) => {
    //a notice quoted above the lead is not the lead
    const [lead, afterLead] = description.trim().replace(/^>[^\n]*\n\n/, '').split('\n\n');
    if (lead.startsWith('{{') || lead.startsWith('#')) {
        report('no lead');
    }
    else {
        const sentences = countSentences(withoutCode(lead.replace(/\([^)]*\)/g, '')));
        if (sentences > 3) {
            report(`lead has ${sentences} sentences`);
        }
        if (!lead.includes('Try it below')) {
            report('lead does not end with "Try it below"');
        }
        if (afterLead && !afterLead.startsWith('{{canvas')) {
            report(`no canvas right after the lead: ${afterLead.slice(0, 50)}`);
        }
    }
    if (!description.includes('## Where next')) {
        report('no Where next');
    }
};

const isSentenceCase = (heading) => heading.split(/\s+/).every((word, index) => index === 0 || !/^[A-Z]/.test(word) || PROPER_NOUN.test(word.replace(/^[`*]+|[`*]+$/g, '')));

const checkText = (description, report) => {
    if (description.includes('```')) {
        report('code fence in the markdown');
    }
    for (const [, heading] of description.matchAll(/^##+ (.*)$/gm)) {
        if (!isSentenceCase(heading)) {
            report(`heading not in sentence case? "${heading}"`);
        }
    }
    const contractions = [...new Set(description.match(CONTRACTION) ?? [])];
    if (contractions.length) {
        report(`contractions: ${contractions.join(', ')}`);
    }
    const american = [...new Set((description.replace(/`[^`]*`/g, '').match(AMERICAN) ?? []).map(word => word.toLowerCase()))];
    if (american.length) {
        report(`American spelling? ${american.sort().join(', ')}`);
    }
    for (const [, href] of description.matchAll(/\]\(\?path=\/(docs\/[^)]*)\)/g)) {
        if (!titlesById.has(href)) {
            report(`link to an unknown page: ${href}`);
        }
    }
    for (const [, href] of description.matchAll(/\]\(\?path=\/(story\/[^)]*)\)/g)) {
        report(`link to a story instead of a page: ${href}`);
    }
};

let issueCount = 0;
for (const { file, title, source } of pages) {
    const issues = [];
    const report = (message) => issues.push(message);
    if (!source.includes('gridDocsPage(')) {
        report('not built with gridDocsPage');
    }
    if (source.includes('StaticCodeBlock')) {
        report('uses StaticCodeBlock');
    }
    const description = source.match(/const DESCRIPTION = `\n([\s\S]*?)\n`/)?.[1];
    if (description) {
        //a reference page holds tables only, and a guide page opens with its step and ends with the next one
        if (!title.endsWith('/Reference') && !title.includes('/Guide/')) {
            checkShape(description, report);
        }
        checkText(description, report);
    }
    else {
        report('no DESCRIPTION');
    }
    checkCards(source, report);
    for (const [, caption] of source.matchAll(/story: `([\s\S]*?)`,/g)) {
        const sentences = countSentences(withoutCode(caption.split('Try:')[0]));
        if (sentences > 1) {
            report(`caption has ${sentences} sentences: ${caption.slice(0, 60)}`);
        }
    }
    if (issues.length) {
        console.log(`== ${file}`);
        issues.forEach(issue => console.log(`    ${issue}`));
        issueCount += issues.length;
    }
}

console.log(`${pages.length} pages, ${issueCount} issues`);
process.exitCode = issueCount ? 1 : 0;
