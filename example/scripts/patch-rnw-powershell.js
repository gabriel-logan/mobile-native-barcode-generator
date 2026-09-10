const fs = require('fs');
const path = require('path');

const cliRoot = path.join(
  __dirname,
  '..',
  'node_modules',
  '@react-native-windows',
  'cli',
  'lib-commonjs',
  'utils',
);
const deployPath = path.join(cliRoot, 'deploy.js');
const progressPath = path.join(cliRoot, 'commandWithProgress.js');
const finderPath = path.join(
  __dirname,
  '..',
  'node_modules',
  '@react-native-windows',
  'find-dotnet-tools',
  'lib-commonjs',
  'findDotnetTools.js',
);

for (const file of [deployPath, progressPath, finderPath]) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing React Native Windows file: ${file}`);
  }
}

const legacyPowerShell = String.raw`C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe`;
const jsPowerShell = legacyPowerShell.replace(/\\/g, '\\\\');

// Undo the older broad workaround, if it was applied to this node_modules tree.
let finder = fs.readFileSync(finderPath, 'utf8');
finder = finder.replace(
  /    \/\/ Appx is a Windows PowerShell module[^\n]*\n    if \(fs_1\.default\.existsSync\('[^']+'\)\) \{\n        return '[^']+';\n    \}\n/,
  '',
);
fs.writeFileSync(finderPath, finder);

let progress = fs.readFileSync(progressPath, 'utf8');
const progressCall =
  'await commandWithProgress(newSpinner(taskDescription), taskDescription, powershell, [';
const patchedProgressCall = `await commandWithProgress(newSpinner(taskDescription), taskDescription, useAppxCompatibility ? '${jsPowerShell}' : powershell, [`;
if (!progress.includes(patchedProgressCall)) {
  if (!progress.includes(progressCall)) {
    throw new Error('Unsupported commandWithProgress.js layout.');
  }
  progress = progress.replace(progressCall, patchedProgressCall);
  fs.writeFileSync(progressPath, progress);
}

let deploy = fs.readFileSync(deployPath, 'utf8');
const familyLookup =
  'const appFamilyName = (0, child_process_1.execFileSync)((0, find_dotnet_tools_1.findPowerShell)(), [';
const patchedFamilyLookup = `const appFamilyName = (0, child_process_1.execFileSync)('${jsPowerShell}', [`;
if (!deploy.includes(patchedFamilyLookup)) {
  if (!deploy.includes(familyLookup)) {
    throw new Error('Unsupported deploy.js family-name lookup.');
  }
  deploy = deploy.replace(familyLookup, patchedFamilyLookup);
}

const startCall =
  "windowsStoreAppUtils, `Start-Locally ${appName} ${args}`, verbose, 'AppStartupFailure', useAppxCompatibility);";
const patchedStartCall =
  "windowsStoreAppUtils, `Start-Locally ${appName} ${args}`, verbose, 'AppStartupFailure', true);";
if (!deploy.includes(patchedStartCall)) {
  if (!deploy.includes(startCall)) {
    throw new Error('Unsupported deploy.js app-start call.');
  }
  deploy = deploy.replace(startCall, patchedStartCall);
}
fs.writeFileSync(deployPath, deploy);

console.log(
  'Patched React Native Windows Appx calls to use Windows PowerShell.',
);
