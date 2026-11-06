import ts from 'typescript';
import fs from 'fs';
import path from 'path';

const ENTRIES = {
    '.': 'src/index.ts',
    './gantt': 'src/controls/task-grid/gantt/index.ts',
};

const configPath = path.resolve('tsconfig.json');
const config = ts.getParsedCommandLineOfConfigFile(configPath, {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => { } });
const program = ts.createProgram(Object.values(ENTRIES).map(entry => path.resolve(entry)), { ...config.options, noEmit: true });
const checker = program.getTypeChecker();

const kindOf = (symbol) => {
    const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
    const isValue = (target.flags & ts.SymbolFlags.Value) !== 0;
    const isType = (target.flags & (ts.SymbolFlags.Type | ts.SymbolFlags.Namespace)) !== 0;
    return isValue && isType ? 'both' : isValue ? 'value' : 'type';
};

const lines = [];
for (const [entry, file] of Object.entries(ENTRIES)) {
    const source = program.getSourceFile(path.resolve(file));
    const moduleSymbol = checker.getSymbolAtLocation(source);
    for (const symbol of checker.getExportsOfModule(moduleSymbol)) {
        lines.push(`${entry} ${symbol.getName()} ${kindOf(symbol)}`);
    }
}
lines.sort();

const out = process.argv[2];
if (out) {
    fs.writeFileSync(out, lines.join('\n') + '\n');
}
else {
    process.stdout.write(lines.join('\n') + '\n');
}
