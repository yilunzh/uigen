"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StrReplaceEditorArgs, FileManagerArgs } from "./types";

interface ToolInvocationMessageProps {
  toolName: string;
  args: string | Record<string, any>;
  state: string;
  result?: any;
  className?: string;
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

function formatStrReplaceMessage(args: StrReplaceEditorArgs, state: string): string {
  const { command, path, old_str, new_str } = args;

  if (state !== "result") {
    switch (command) {
      case "view": return `Viewing ${path}`;
      case "create": return `Creating ${path}`;
      case "str_replace": return `Editing ${path}`;
      case "insert": return `Updating ${path}`;
      case "undo_edit": return `Undoing changes to ${path}`;
      default: return `Processing ${path}`;
    }
  }

  switch (command) {
    case "view":
      return `Viewed ${path}`;

    case "create":
      return `Created ${path}`;

    case "str_replace":
      const oldPreview = truncateText(old_str || "", 40);
      const newPreview = truncateText(new_str || "", 40);
      return `Edited ${path}: Replacing "${oldPreview}" with "${newPreview}"`;

    case "insert":
      const insertPreview = truncateText(new_str || "", 40);
      return `Updated ${path}: Inserted "${insertPreview}"`;

    case "undo_edit":
      return `Reverted changes to ${path}`;

    default:
      return `Modified ${path}`;
  }
}

function formatFileManagerMessage(args: FileManagerArgs, state: string): string {
  const { command, path, new_path } = args;

  if (state !== "result") {
    switch (command) {
      case "rename": return `Renaming ${path}`;
      case "delete": return `Deleting ${path}`;
      default: return `Processing ${path}`;
    }
  }

  switch (command) {
    case "rename":
      return `Renamed ${path} to ${new_path}`;

    case "delete":
      return `Deleted ${path}`;

    default:
      return `Modified ${path}`;
  }
}

function formatToolMessage(toolName: string, args: string | Record<string, any>, state: string): string {
  console.log('formatToolMessage:', { toolName, args, argsType: typeof args, state });

  if (!["str_replace_editor", "file_manager"].includes(toolName)) {
    return state === "result" ? toolName : `Running ${toolName}...`;
  }

  try {
    // Handle both string (JSON) and object args
    const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args;
    console.log('Parsed args:', parsedArgs);

    if (toolName === "str_replace_editor") {
      return formatStrReplaceMessage(parsedArgs, state);
    } else if (toolName === "file_manager") {
      return formatFileManagerMessage(parsedArgs, state);
    }
  } catch (error) {
    console.error('Error parsing args:', error);
    return state === "result" ? toolName : `Running ${toolName}...`;
  }

  return toolName;
}

export function ToolInvocationMessage({
  toolName,
  args,
  state,
  result,
  className,
}: ToolInvocationMessageProps) {
  const message = formatToolMessage(toolName, args, state);

  return (
    <div className={cn(
      "inline-flex items-center gap-2 mt-2 px-3 py-1.5",
      "bg-neutral-50 rounded-lg text-xs font-mono",
      "border border-neutral-200",
      className
    )}>
      {state === "result" && result ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-neutral-700">{message}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{message}</span>
        </>
      )}
    </div>
  );
}
