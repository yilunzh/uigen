export interface StrReplaceEditorArgs {
  command: "view" | "create" | "str_replace" | "insert" | "undo_edit";
  path: string;
  file_text?: string;
  old_str?: string;
  new_str?: string;
  insert_line?: number;
  view_range?: [number, number];
}

export interface FileManagerArgs {
  command: "rename" | "delete";
  path: string;
  new_path?: string;
}
