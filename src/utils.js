const vscode = require("vscode");
const fs = require("fs");
const rubySpawn = require('./ruby-spawn')

function fileAdded(path) {
  vscode.window.showInformationMessage(
    "A new migration has been added! Run migration"
  );
}

function runMigration(workspace) {
  const child = rubySpawn.rubySpawn('bundle', ['exec', 'rake db:migrate'], { cwd: workspace});
  child.stdout.on('data', (data) => {
    vscode.window.showInformationMessage("Migration run successfully!");
  });

  child.stderr.on('error', (err) => {
    vscode.window.showErrorMessage(err.message);
  })

  child.on('exit', function (code, signal) {
    console.log('child process exited with ' +
                `code ${code} and signal ${signal}`);
  });

  child. on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
}

function openLatestMigration(workspace) {
  fs.readdir(`${workspace}/db/migrate`, (err, files) => {
    if (err) {
      vscode.window.showErrorMessage("Unable to read workspace files");
      return;
    }
    if (files.length && files[files.length - 1]) {
      const lastFile = files[files.length - 1];
      const path = vscode.Uri.file(`${workspace}/db/migrate/${lastFile}`);
      vscode.workspace.openTextDocument(path).then((doc) => {
        vscode.window.showTextDocument(doc);
      });
    }
  });
}

function downCurrentMigration(workspace) {
  runCurrentMigration(workspace, "down");
}

function upCurrentMigration(workspace) {
  runCurrentMigration(workspace, "up");
}

function runCurrentMigration(workspace, mode) {
  fs.readdir(`${workspace}/db/migrate`, (err, files) => {
    if (err) {
      vscode.window.showErrorMessage("Unable to read workspace files");
      return;
    }

    const currentFile = vscode.window.activeTextEditor.document.fileName;

    if !(currentFile.includes("db/migrate") && files.includes(currentFileName)) {
      vscode.window.showErrorMessage("Unable to read workspace files");
      return;
    }

    const currentFileName = currentFile.split("/").pop();
    const currentVersion = currentFileName.split("_")[0];
    const versionOpt = "VERSION=" + currentVersion;
    const rakeCommand = mode === "up" ? "rake db:migrate:up" : "rake db:migrate:down";

    const child = rubySpawn.rubySpawn('bundle', ['exec', rakeCommand, versionOpt], { cwd: workspace});

    child.stdout.on('data', (data) => {
      vscode.window.showInformationMessage("Migration run successfully!");
    });

    child.stderr.on('error', (err) => {
      vscode.window.showErrorMessage(err.message);
    })

    child.on('exit', function (code, signal) {
      console.log('child process exited with ' +
                  `code ${code} and signal ${signal}`);
    });

    child.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    });
  });
}

module.exports = {
  fileAdded,
  runMigration,
  openLatestMigration,
  downCurrentMigration,
  upCurrentMigration,
};
