import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export async function createUseCase() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showErrorMessage("Please open a workspace first.");
    return;
  }

  const featureName = await vscode.window.showInputBox({
    prompt: "Enter the feature name :",
  });
  if (!featureName) {
    vscode.window.showErrorMessage("Feature name is required.");
    return;
  }

  const rootPath = workspaceFolders[0].uri.fsPath;
  const featurePath = path.join(rootPath, "lib", "features", featureName);

  if (!fs.existsSync(featurePath)) {
    vscode.window.showErrorMessage(
      `Feature "${featureName}" does not exist. Please enter a valid feature name.`
    );
    return;
  }

  const useCaseName = await vscode.window.showInputBox({
    prompt: "Enter the use case name :",
  });
  if (!useCaseName) {
    vscode.window.showErrorMessage("Use case name is required.");
    return;
  }

  const snakeCaseName = toSnakeCase(useCaseName);
  const pascalCaseName = toPascalCase(useCaseName);
  const useCaseFilePath = path.join(
    featurePath,
    "domain",
    "usecases",
    `${snakeCaseName}_use_case.dart`
  );

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
  vscode.window.showInformationMessage(
    `Dart use case "${pascalCaseName}UseCase" created successfully at ${useCaseFilePath}`
  );
}

// Convert to snake_case for the filename
export function toSnakeCase(input: string): string {
  return input
    .replace(/\s+/g, "_")
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .toLowerCase();
}

// Convert to PascalCase for the class name
export function toPascalCase(input: string): string {
  return input
    .replace(/\s+/g, " ")
    .split(/_| /)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}
