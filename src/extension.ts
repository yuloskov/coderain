// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

const textToGrid = (text: string) => {
  const lines = text.split("\n");
  const maxLineLength = Math.max(...lines.map((line) => line.length));
  const paddedLines = lines.map((line) => line.padEnd(maxLineLength, " "));
  const grid = paddedLines.map((line) => line.split(""));
  return grid;
};

const gridToText = (grid: string[][]) => {
  const lines = grid.map((line) => line.join(""));
  return lines.join("\n");
};

const nextState = (state: string) => {
  const grid = textToGrid(state);

  const numLines = grid.length;
  for (let i = numLines - 1; i >= 0; i--) {
    for (let j = 0; j < grid[i].length; j++) {
      const cell = grid[i][j];

      const canMoveDown = i < numLines - 1 && grid[i + 1][j] === " ";
      const canMoveLeft =
        j > 0 && i < numLines - 1 && grid[i + 1][j - 1] === " ";
      const canMoveRight =
        j < grid[i].length - 1 &&
        i < numLines - 1 &&
        grid[i + 1][j + 1] === " ";

      const canMoveDown2cells =
        i < numLines - 2 && grid[i + 2][j] === " " && grid[i + 1][j] === " ";
      const canMoveDown3cells =
        i < numLines - 3 &&
        grid[i + 3][j] === " " &&
        grid[i + 2][j] === " " &&
        grid[i + 1][j] === " ";

      if (canMoveDown3cells) {
        grid[i][j] = " ";
        grid[i + 3][j] = cell;
      } else if (canMoveDown2cells) {
        grid[i][j] = " ";
        grid[i + 2][j] = cell;
      } else if (canMoveDown) {
        grid[i][j] = " ";
        grid[i + 1][j] = cell;
      } else if (canMoveLeft && canMoveRight) {
        if (Math.random() > 0.5) {
          // move left
          grid[i][j] = " ";
          grid[i + 1][j - 1] = cell;
        } else {
          // move right
          grid[i][j] = " ";
          grid[i + 1][j + 1] = cell;
        }
      } else if (canMoveLeft) {
        // move left
        grid[i][j] = " ";
        grid[i + 1][j - 1] = cell;
      } else if (canMoveRight) {
        // move right
        grid[i][j] = " ";
        grid[i + 1][j + 1] = cell;
      }
    }
  }
  return gridToText(grid);
};

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "coderain" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("coderain.codeRain", () => {
    const editor = vscode.window.activeTextEditor;

    if (editor) {
      const document = editor.document;
      const text = document.getText();
      let prevState = text;

      let intervalId = null;

      const rain = () => {
        const nextStateText = nextState(prevState);

        if (nextStateText === prevState) {
          return;
          clearInterval(intervalId);
        }
        prevState = nextStateText;

        editor.edit(
          (editBuilder) => {
            // replace the entire document
            editBuilder.replace(
              new vscode.Range(
                new vscode.Position(0, 0),
                new vscode.Position(document.lineCount, 0)
              ),
              nextStateText
            );
          },
          { undoStopBefore: false, undoStopAfter: false }
        );
      };

      intervalId = setInterval(rain, 50);
    } else {
      vscode.window.showInformationMessage("No editor is active");
    }
  });

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
