import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('flutterCleanArchitecture.createFeatureFolders', async () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage("Please open a workspace first.");
            return;
        }

        // Prompt for the feature name
        const featureName = await vscode.window.showInputBox({
            prompt: "Enter the feature name (e.g., auth, home, etc.):"
        });
        if (!featureName) {
            vscode.window.showErrorMessage("Feature name is required.");
            return;
        }

        const rootPath = workspaceFolders[0].uri.fsPath;
        const featurePath = path.join(rootPath, 'lib', 'features', featureName);

        const foldersToCreate = [
            `${featurePath}`,
            `${featurePath}/domain`,
            `${featurePath}/domain/entities`,
            `${featurePath}/domain/repo`,
            `${featurePath}/domain/usecases`,
            `${featurePath}/data`,
            `${featurePath}/data/datasources`,
            `${featurePath}/data/models`,
            `${featurePath}/data/repo`,
            `${featurePath}/presentation`,
            `${featurePath}/presentation/blocs`,
            `${featurePath}/presentation/pages`,
            `${featurePath}/presentation/widgets`
        ];

        foldersToCreate.forEach(folder => {
            if (!fs.existsSync(folder)) {
                fs.mkdirSync(folder, { recursive: true });
            }
        });

        vscode.window.showInformationMessage(`Feature folders for "${featureName}" created successfully inside lib/features/`);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
