import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// Convert to snake_case for the filename
function toSnakeCase(input: string): string {
    return input
        .replace(/\s+/g, '_')
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .toLowerCase();
}

// Convert to PascalCase for the class name
function toPascalCase(input: string): string {
    return input
        .replace(/\s+/g, ' ')
        .split(/_| /)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
}

// Function to create the use case
async function createUseCase() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage("Please open a workspace first.");
        return;
    }

    const featureName = await vscode.window.showInputBox({ prompt: "Enter the feature name :" });
    if (!featureName) {
        vscode.window.showErrorMessage("Feature name is required.");
        return;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const featurePath = path.join(rootPath, 'lib', 'features', featureName);

    if (!fs.existsSync(featurePath)) {
        vscode.window.showErrorMessage(`Feature "${featureName}" does not exist. Please enter a valid feature name.`);
        return;
    }

    const useCaseName = await vscode.window.showInputBox({ prompt: "Enter the use case name :" });
    if (!useCaseName) {
        vscode.window.showErrorMessage("Use case name is required.");
        return;
    }

    const snakeCaseName = toSnakeCase(useCaseName);
    const pascalCaseName = toPascalCase(useCaseName);
    const useCaseFilePath = path.join(featurePath, 'domain', 'usecases', `${snakeCaseName}_use_case.dart`);

    const fileContent = `
import 'package:dartz/dartz.dart';
import 'package:injectable/injectable.dart';

@lazySingleton
class ${pascalCaseName} {
  final Repo _repo;

  ${pascalCaseName}(this._baseRepository);

  Future<Either<Failure, Entity>> call() async => await _repo.doSomething();
}


    `;

    const folderPath = path.dirname(useCaseFilePath);
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    fs.writeFileSync(useCaseFilePath, fileContent.trim());
    vscode.window.showInformationMessage(`Dart use case "${pascalCaseName}UseCase" created successfully at ${useCaseFilePath}`);
}

// Function to create feature folders
async function createFeatureFolders() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage("Please open a workspace first.");
        return;
    }

    const featureName = await vscode.window.showInputBox({ prompt: "Enter the feature name (e.g., auth, home, etc.):" });
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
}

export function activate(context: vscode.ExtensionContext) {
    let useCaseDisposable = vscode.commands.registerCommand('flutterExtension.createUseCase', createUseCase);
    let featureDisposable = vscode.commands.registerCommand('flutterExtension.createFeatureFolders', createFeatureFolders);

    context.subscriptions.push(useCaseDisposable);
    context.subscriptions.push(featureDisposable);
}

export function deactivate() {}
