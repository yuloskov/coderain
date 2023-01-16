import * as vscode from "vscode";

const isEmpty = (str: string) => str.trim() === "";

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

const updateCell = (
  grid: string[][],
  i: number,
  j: number,
  dx: number,
  dy: number
) => {
  const cell = grid[i][j];

  grid[i][j] = " ";
  grid[i + dy][j + dx] = cell;
};

const canMoveLeft = (grid: string[][], i: number, j: number, steps: number) => {
  if (j - steps < 0 || i + steps > grid.length - 1) {
    return false;
  }

  for (let k = 1; k <= steps; k++) {
    if (!isEmpty(grid[i + 1][j - k])) {
      return false;
    }
  }

  return true;
};

const canMoveRight = (
  grid: string[][],
  i: number,
  j: number,
  steps: number
) => {
  if (j + steps > grid[i].length - 1 || i + steps > grid.length - 1) {
    return false;
  }

  for (let k = 1; k <= steps; k++) {
    if (!isEmpty(grid[i + 1][j + k])) {
      return false;
    }
  }

  return true;
};

const canMoveDown = (grid: string[][], i: number, j: number, steps: number) => {
  if (i + steps > grid.length - 1) {
    return false;
  }

  for (let k = 1; k <= steps; k++) {
    if (!isEmpty(grid[i + k][j])) {
      return false;
    }
  }

  return true;
};

const nextState = (state: string) => {
  const grid = textToGrid(state);

  const numLines = grid.length;
  for (let i = numLines - 1; i >= 0; i--) {
    for (let j = 0; j < grid[i].length; j++) {
      for (let k = 3; k >= 1; k--) {
        if (canMoveDown(grid, i, j, k)) {
          updateCell(grid, i, j, 0, k);
          continue;
        }
      }

      for (let k = 3; k >= 1; k--) {
        if (canMoveLeft(grid, i, j, k) && canMoveRight(grid, i, j, k)) {
          if (Math.random() > 0.5) {
            updateCell(grid, i, j, -k, 1);
            continue;
          } else {
            updateCell(grid, i, j, k, 1);
            continue;
          }
        }
      }

      for (let k = 3; k >= 1; k--) {
        if (canMoveLeft(grid, i, j, k)) {
          updateCell(grid, i, j, -k, 1);
          continue;
        }
      }

      for (let k = 3; k >= 1; k--) {
        if (canMoveRight(grid, i, j, k)) {
          updateCell(grid, i, j, k, 1);
          continue;
        }
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

      const intervalId = setInterval(() => {
        const nextStateText = nextState(prevState);
        if (nextStateText === prevState) {
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
      }, 50);
    } else {
      vscode.window.showInformationMessage("No editor is active");
    }
  });

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
