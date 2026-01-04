import { tool } from "ai";
import { z } from "zod";
import { VirtualFileSystem } from "@/lib/file-system";

const TextEditorParameters = z.object({
  command: z
    .enum(["view", "create", "str_replace", "insert", "undo_edit"])
    .describe("The command to execute: view (read file), create (new file), str_replace (replace text), insert (insert at line)"),
  path: z
    .string()
    .describe("The file path to operate on"),
  file_text: z
    .string()
    .optional()
    .describe("The file content when creating a new file"),
  insert_line: z
    .number()
    .optional()
    .describe("The line number to insert text at (0-indexed)"),
  new_str: z
    .string()
    .optional()
    .describe("The new string to insert or replace with"),
  old_str: z
    .string()
    .optional()
    .describe("The old string to search for and replace"),
  view_range: z
    .array(z.number())
    .optional()
    .describe("Optional [start, end] line range for viewing file"),
});

export const buildStrReplaceTool = (fileSystem: VirtualFileSystem) => {
  return tool({
    description: "Text editor for viewing and editing files in the virtual file system. Supports view, create, str_replace, and insert commands.",
    parameters: TextEditorParameters,
    execute: async ({
      command,
      path,
      file_text,
      insert_line,
      new_str,
      old_str,
      view_range,
    }) => {
      switch (command) {
        case "view":
          return fileSystem.viewFile(
            path,
            view_range as [number, number] | undefined
          );

        case "create":
          return fileSystem.createFileWithParents(path, file_text || "");

        case "str_replace":
          return fileSystem.replaceInFile(path, old_str || "", new_str || "");

        case "insert":
          return fileSystem.insertInFile(path, insert_line || 0, new_str || "");

        case "undo_edit":
          return `Error: undo_edit command is not supported in this version. Use str_replace to revert changes.`;
      }
    },
  });
};
