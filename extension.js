const vscode = require("vscode");
const chokidar = require('chokidar');
const utils = require('./src/utils');

const projectWorkspace = vscode.workspace.workspaceFolders[0].uri.toString().split(':')[1];

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const watcher = chokidar.watch(`${projectWorkspace}/db/migrate/`, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    ignoreInitial: true,
    persistent: true
  });

  watcher
    .on('add', path => utils.fileAdded(path))

  let railsMigration = vscode.commands.registerCommand(
    "antivim-rails-migrate.runMigration",
    function () {
      utils.runMigration(projectWorkspace);
    }
  );


  let openMigration = vscode.commands.registerCommand(
    "antivim-rails-migrate.openLatestMigration",
    function () {
      utils.openLatestMigration(projectWorkspace);
    }
  );

  let downCurrentMigration = vscode.commands.registerCommand(
    "antivim-rails-migrate.downCurrentMigration",
    function () {
      utils.downCurrentMigration(projectWorkspace);
    }
  );

  let upCurrentMigration = vscode.commands.registerCommand(
    "antivim-rails-migrate.upCurrentMigration",
    function () {
      utils.upCurrentMigration(projectWorkspace);
    }
  );

  context.subscriptions.push(railsMigration);
  context.subscriptions.push(openMigration);
  context.subscriptions.push(downCurrentMigration);
  context.subscriptions.push(upCurrentMigration);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
