import * as vscode from "vscode";

import { createFeatureFolders } from "./feature_generator";
import { createUseCase } from "./usecase_generator";


// Activate the extension
export function activate(context: vscode.ExtensionContext) {
  let useCaseDisposable = vscode.commands.registerCommand(
    "flutterExtension.createUseCase",
    createUseCase
  );
  let featureDisposable = vscode.commands.registerCommand(
    "flutterExtension.createFeatureFolders",
    createFeatureFolders
  );


  context.subscriptions.push(useCaseDisposable);
  context.subscriptions.push(featureDisposable);
}
