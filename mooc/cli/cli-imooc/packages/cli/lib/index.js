import createInitCommand from '@imooc.com/init';
import createInstallCommand from '@imooc.com/install';
import createLintCommand from '@imooc.com/lint';
import createCommitCommand from '@imooc.com/commit';
import createCLI from './createCLI.js';
import './exception.js';

export default function(args) {
  const program = createCLI();
  createInitCommand(program);
  createInstallCommand(program);
  createLintCommand(program);
  createCommitCommand(program);
  program.parse(process.argv);
};
