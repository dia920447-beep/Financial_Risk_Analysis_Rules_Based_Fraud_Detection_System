import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const workspaceDir = 'C:/Users/kdivy/OneDrive/Desktop/VS CODES 🔥/financial_analysis _fraud_detection 2.O';
const skillDir = 'C:/Users/kdivy/.codex/plugins/cache/openai-primary-runtime/presentations/26.1024.11018/skills/presentations';
const runtimePython = 'C:/Users/kdivy/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
const finalPath = path.join(workspaceDir, 'output', 'Sentinel_Financial_Risk_Overview.pptx');
const stagingDir = path.join(workspaceDir, '.codex-finalizer');
await fs.mkdir(stagingDir, { recursive: true });
const candidatePath = path.join(stagingDir, 'candidate.pptx');
await fs.copyFile(path.join(workspaceDir, '.ppt-build', 'candidate.pptx'), candidatePath);
const { finalizePresentation } = await import(pathToFileURL(path.join(skillDir, 'container_tools/artifact_tool_utils.mjs')).href);
const result = await finalizePresentation({
  explicitTotalSlideCount: 8,
  requiredNativeTableOwnerSlides: [],
  requiredNativeChartOwnerSlides: [],
  workspaceDir,
  candidatePath,
  finalPath,
  pythonExecutable: runtimePython,
  integrityValidatorPath: path.join(skillDir, 'container_tools/inspect_presentation_package_integrity.py'),
  layoutValidatorPath: path.join(skillDir, 'container_tools/inspect_presentation_layout_geometry.py'),
  layoutArgs: ['--expected-slide-size-emu', '12192000,6858000', '--validate-bullet-geometry', '--validate-heading-fit'],
  fontPolicy: { basis: 'design', families: ['Arial'] },
  verifyArtifactToolImport: true,
  receiptPath: path.join(stagingDir, 'Sentinel_Financial_Risk_Overview.validation.json'),
});
console.log(JSON.stringify(result));
