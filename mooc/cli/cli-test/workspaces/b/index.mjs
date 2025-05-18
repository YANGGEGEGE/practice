import ora from 'ora';

export default function() {
  const spinner = ora().start('loading');

  setTimeout(() => {
    spinner.stop();
  }, 3000);
}
