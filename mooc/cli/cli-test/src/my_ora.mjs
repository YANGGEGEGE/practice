import cliSpinners from 'cli-spinners';
import cliCursor from 'cli-cursor';
import {BufferListStream} from 'bl';
import * as readline from 'readline';

const spinners = cliSpinners.dots; // 组件库
const text = 'loading'; // 默认文本
const stream = process.stderr; // 输出流
let frameIndex = 0; // 当前帧
const frames = spinners.frames; // 每一帧的内容
const interval = spinners.interval; // 每一帧的间隔

const mutedStream = new BufferListStream();
mutedStream.pipe(process.stdout);
const rl = readline.createInterface({
  input: process.stdin,
  output: mutedStream,
});

function clear() {
  stream.cursorTo(0);
  stream.clearLine(1);
}

function render() {
  clear();
  const renderText = frames[frameIndex] + ' ' + text;
  stream.write(renderText);
  frameIndex = ++frameIndex % frames.length;
}

function stop() {
  clearInterval(i);
  i = undefined;
  clear();
  frameIndex = 0;
  cliCursor.show(stream);
  rl.close();
}

cliCursor.hide(stream);
let i = setInterval(render, interval);

setTimeout(() => {
  stop();
}, 3000);
