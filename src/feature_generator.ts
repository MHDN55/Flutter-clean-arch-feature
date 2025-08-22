import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

// Utility: convert input to snake_case
export function toSnakeCase(input: string): string {
  return input
    .replace(/\s+/g, "_")
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .toLowerCase();
}

// Utility: convert input to PascalCase
function toPascalCase(input: string): string {
  return input
    .replace(/\s+/g, " ")
    .split(/_| /)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

export async function createFeatureFolders() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showErrorMessage("Please open a workspace first.");
    return;
  }

  const featureName = await vscode.window.showInputBox({
    prompt: "Enter the feature name (e.g., login, auth):",
  });
  if (!featureName) {
    vscode.window.showErrorMessage("Feature name is required.");
    return;
  }

  // Ask if the user wants injectable annotations
  const useInjectable = await vscode.window.showQuickPick(["Yes", "No"], {
    placeHolder: "Do you want to use Injectable annotations (LazySingleton)?",
  });
  const includeInjectable = useInjectable === "Yes";

  const snakeFeature = toSnakeCase(featureName);
  const pascalFeature = toPascalCase(featureName);
  const rootPath = workspaceFolders[0].uri.fsPath;
  const baseFeaturePath = path.join(rootPath, "lib", "features", snakeFeature);

  const foldersToCreate = [
    path.join(baseFeaturePath, "domain", "entities"),
    path.join(baseFeaturePath, "domain", "repo"),
    path.join(baseFeaturePath, "domain", "usecases"),
    path.join(baseFeaturePath, "data", "models"),
    path.join(baseFeaturePath, "data", "repo"),
    path.join(baseFeaturePath, "data", "datasources", "remote"),
    path.join(baseFeaturePath, "presentation", "pages"),
    path.join(baseFeaturePath, "presentation", "widgets"),
    path.join(baseFeaturePath, "presentation", "blocs"),
  ];

  foldersToCreate.forEach((folder) => {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  });

  function getRepoFileContent(pascalFeature: string) {
    return `abstract class ${pascalFeature}Repo {

}
`;
  }

  function getRepoImplFileContent(pascalFeature: string, snakeFeature: string) {
    return `${
      includeInjectable ? "import 'package:injectable/injectable.dart';\n" : ""
    }import '../../domain/repo/${snakeFeature}_repo.dart';

${includeInjectable ? `@LazySingleton(as: ${pascalFeature}Repo)` : ""}
class ${pascalFeature}RepoImpl implements ${pascalFeature}Repo {
    
}
`;
  }

  function getRemoteDataSourceFileContent(pascalFeature: string) {
    return `abstract class ${pascalFeature}RemoteDataSource {

}
`;
  }

  function getRemoteDataSourceImplFileContent(
    pascalFeature: string,
    snakeFeature: string
  ) {
    return `${
      includeInjectable ? "import 'package:injectable/injectable.dart';\n" : ""
    }import '../../datasources/remote/${snakeFeature}_remote_data_source.dart';

${
  includeInjectable
    ? `@LazySingleton(as: ${pascalFeature}RemoteDataSource)`
    : ""
}
class ${pascalFeature}RemoteDataSourceImpl implements ${pascalFeature}RemoteDataSource {
    
}
`;
  }

  const fileMap: { [fileName: string]: string } = {
    [`${snakeFeature}_repo.dart`]: path.join(baseFeaturePath, "domain", "repo"),
    [`${snakeFeature}_repo_impl.dart`]: path.join(
      baseFeaturePath,
      "data",
      "repo"
    ),
    [`${snakeFeature}_remote_data_source.dart`]: path.join(
      baseFeaturePath,
      "data",
      "datasources",
      "remote"
    ),
    [`${snakeFeature}_remote_data_source_impl.dart`]: path.join(
      baseFeaturePath,
      "data",
      "datasources",
      "remote"
    ),
  };

  for (const [fileName, dirPath] of Object.entries(fileMap)) {
    const filePath = path.join(dirPath, fileName);
    if (!fs.existsSync(filePath)) {
      let content = "";
      if (fileName.endsWith("_repo.dart")) {
        content = getRepoFileContent(pascalFeature);
      } else if (fileName.endsWith("_repo_impl.dart")) {
        content = getRepoImplFileContent(pascalFeature, snakeFeature);
      } else if (fileName.endsWith("_remote_data_source.dart")) {
        content = getRemoteDataSourceFileContent(pascalFeature);
      } else if (fileName.endsWith("_remote_data_source_impl.dart")) {
        content = getRemoteDataSourceImplFileContent(
          pascalFeature,
          snakeFeature
        );
      }
      fs.writeFileSync(filePath, content);
    }
  }

  vscode.window.showInformationMessage(
    `Feature structure for "${featureName}" created successfully.`
  );
}
