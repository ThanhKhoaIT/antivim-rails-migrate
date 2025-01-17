/**
 * https://github.com/castwide/ruby-spawn
 */
const { platform } = require('os');
const child_process = require('child_process');
const crossSpawn = require('cross-spawn');
const shellEscape = require('shell-escape');

let kill = function (child, command) {
  let ps = child_process.spawn('ps', ['-o', 'pid,ppid,tty', '-C', command]);
  let out = '';
  ps.stdout.on('data', (buffer) => {
    out += buffer.toString();
  });
  ps.on('exit', () => {
    let lines = out.split("\n");
    lines.shift();
    lines.pop();
    let nums = lines.filter((l) => {
      return l.match(/1[\s]+\?$/);
    }).map((l) => {
      return l.trim().split(' ')[0]
    });
    if (lines.length > 0) {
      child_process.spawn('kill', ['-9'].concat(nums));
    }
  });
}

function rubySpawn(command, args, opts = {}, forceKill = false) {
  let cmd = [command].concat(args);
  if (platform().match(/darwin|linux/)) {
    let shell = process.env.SHELL;
    if (!shell) {
      shell = '/bin/bash';
    }
    if (shell.endsWith('bash') || shell.endsWith('zsh')) {
      let shellCmd = shellEscape(cmd);
      let finalCmd = shellCmd;
      if (opts['cwd']) {
        finalCmd = `${shellEscape(['cd', opts['cwd']])} && ${shellCmd}`;
      }
      let shellArgs = [finalCmd];
      shellArgs.unshift('-c');
      shellArgs.unshift('-l');
      let child = child_process.spawn(shell, shellArgs, opts);
      if (forceKill) {
        child.on('exit', (code, signal) => {
          kill(child, ['ruby', command].concat(args).join(' '));
        });
      }
      return child;
    } else {
      return crossSpawn(cmd.shift(), cmd, opts);
    }
  } else {
    return crossSpawn(cmd.shift(), cmd, opts);
  }
}

module.exports = {
  rubySpawn
}
