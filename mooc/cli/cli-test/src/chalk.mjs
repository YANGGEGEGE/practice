import chalk, {Chalk} from 'chalk';

console.log(chalk.red('hello imooc'));
console.log(chalk.red('hello imooc') + '!' + chalk.blue('hello imooc!'));
console.log(chalk.red.bgGreen.bold('Hello imooc'));
console.log(chalk.red('hello', 'imooc'));
console.log(chalk.red('hello', chalk.underline('imooc')));

console.log(chalk.rgb(255, 0, 0).underline('hello imooc'));
console.log(chalk.hex('#ff0000').bold('hello imooc'));
console.log(chalk.hex('#ff0000')('hello', 'imooc'));

const error = (...text) => console.log(chalk.bold.hex('#ff0000')(text));
const warning = (...text) => console.log(chalk.hex('#ffa500')(text));

error('Error!');
warning('Warning!');


const customChalk = new Chalk({level: 4});

console.log(customChalk.blue('hello imooc'));
console.log(customChalk.hex('#ffaa00')('hello imooc'));
