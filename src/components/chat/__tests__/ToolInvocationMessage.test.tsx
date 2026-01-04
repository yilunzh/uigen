import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToolInvocationMessage } from "../ToolInvocationMessage";

// str_replace_editor command tests

test("shows creating message for create command in pending state", () => {
  const args = JSON.stringify({
    command: "create",
    path: "/components/Button.jsx",
    file_text: "export default function Button() {}"
  });

  render(
    <ToolInvocationMessage
      toolName="str_replace_editor"
      args={args}
      state="pending"
    />
  );

  expect(screen.getByText("Creating /components/Button.jsx")).toBeDefined();
});

test("shows created message for create command in result state", () => {
  const args = JSON.stringify({
    command: "create",
    path: "/components/Button.jsx",
    file_text: "export default function Button() {}"
  });

  render(
    <ToolInvocationMessage
      toolName="str_replace_editor"
      args={args}
      state="result"
      result="Success"
    />
  );

  expect(screen.getByText("Created /components/Button.jsx")).toBeDefined();
});

test("shows viewing message for view command in pending state", () => {
  const args = JSON.stringify({
    command: "view",
    path: "/App.jsx"
  });

  render(
    <ToolInvocationMessage
      toolName="str_replace_editor"
      args={args}
      state="pending"
    />
  );

  expect(screen.getByText("Viewing /App.jsx")).toBeDefined();
});

test("shows viewed message for view command in result state", () => {
  const args = JSON.stringify({
    command: "view",
    path: "/App.jsx"
  });

  render(
    <ToolInvocationMessage
      toolName="str_replace_editor"
      args={args}
      state="result"
      result="Success"
    />
  );

  expect(screen.getByText("Viewed /App.jsx")).toBeDefined();
});

test("shows detailed edit message with truncated strings for str_replace command", () => {
  const longString = "a".repeat(50);
  const args = JSON.stringify({
    command: "str_replace",
    path: "/App.jsx",
    old_str: longString,
    new_str: "new code"
  });

  render(
    <ToolInvocationMessage
      toolName="str_replace_editor"
      args={args}
      state="result"
      result="Success"
    />
  );

  const message = screen.getByText(/Edited \/App\.jsx: Replacing/);
  expect(message.textContent).toContain("...");
  expect(message.textContent).toContain("new code");
});

test("shows detailed edit message without truncation for short strings", () => {
  const args = JSON.stringify({
    command: "str_replace",
    path: "/App.jsx",
    old_str: "old code",
    new_str: "new code"
  });

  render(
    <ToolInvocationMessage
      toolName="str_replace_editor"
      args={args}
      state="result"
      result="Success"
    />
  );

  expect(screen.getByText('Edited /App.jsx: Replacing "old code" with "new code"')).toBeDefined();
});

test("shows editing message for str_replace command in pending state", () => {
  const args = JSON.stringify({
    command: "str_replace",
    path: "/App.jsx",
    old_str: "old",
    new_str: "new"
  });

  render(
    <ToolInvocationMessage
      toolName="str_replace_editor"
      args={args}
      state="pending"
    />
  );

  expect(screen.getByText("Editing /App.jsx")).toBeDefined();
});

test("shows updated message with inserted text for insert command", () => {
  const args = JSON.stringify({
    command: "insert",
    path: "/App.jsx",
    new_str: "console.log('test')",
    insert_line: 5
  });

  render(
    <ToolInvocationMessage
      toolName="str_replace_editor"
      args={args}
      state="result"
      result="Success"
    />
  );

  expect(screen.getByText('Updated /App.jsx: Inserted "console.log(\'test\')"')).toBeDefined();
});

test("shows updating message for insert command in pending state", () => {
  const args = JSON.stringify({
    command: "insert",
    path: "/App.jsx",
    new_str: "console.log('test')",
    insert_line: 5
  });

  render(
    <ToolInvocationMessage
      toolName="str_replace_editor"
      args={args}
      state="pending"
    />
  );

  expect(screen.getByText("Updating /App.jsx")).toBeDefined();
});

test("shows reverted message for undo_edit command", () => {
  const args = JSON.stringify({
    command: "undo_edit",
    path: "/App.jsx"
  });

  render(
    <ToolInvocationMessage
      toolName="str_replace_editor"
      args={args}
      state="result"
      result="Success"
    />
  );

  expect(screen.getByText("Reverted changes to /App.jsx")).toBeDefined();
});

test("shows undoing message for undo_edit command in pending state", () => {
  const args = JSON.stringify({
    command: "undo_edit",
    path: "/App.jsx"
  });

  render(
    <ToolInvocationMessage
      toolName="str_replace_editor"
      args={args}
      state="pending"
    />
  );

  expect(screen.getByText("Undoing changes to /App.jsx")).toBeDefined();
});

// file_manager command tests

test("shows renamed message with both paths for rename command", () => {
  const args = JSON.stringify({
    command: "rename",
    path: "/old.jsx",
    new_path: "/new.jsx"
  });

  render(
    <ToolInvocationMessage
      toolName="file_manager"
      args={args}
      state="result"
      result={{ success: true }}
    />
  );

  expect(screen.getByText("Renamed /old.jsx to /new.jsx")).toBeDefined();
});

test("shows renaming message for rename command in pending state", () => {
  const args = JSON.stringify({
    command: "rename",
    path: "/old.jsx",
    new_path: "/new.jsx"
  });

  render(
    <ToolInvocationMessage
      toolName="file_manager"
      args={args}
      state="pending"
    />
  );

  expect(screen.getByText("Renaming /old.jsx")).toBeDefined();
});

test("shows deleted message for delete command", () => {
  const args = JSON.stringify({
    command: "delete",
    path: "/test.jsx"
  });

  render(
    <ToolInvocationMessage
      toolName="file_manager"
      args={args}
      state="result"
      result={{ success: true }}
    />
  );

  expect(screen.getByText("Deleted /test.jsx")).toBeDefined();
});

test("shows deleting message for delete command in pending state", () => {
  const args = JSON.stringify({
    command: "delete",
    path: "/test.jsx"
  });

  render(
    <ToolInvocationMessage
      toolName="file_manager"
      args={args}
      state="pending"
    />
  );

  expect(screen.getByText("Deleting /test.jsx")).toBeDefined();
});

// Truncation logic tests

test("truncates text longer than 40 characters", () => {
  const longText = "a".repeat(45);
  const args = JSON.stringify({
    command: "str_replace",
    path: "/test.jsx",
    old_str: longText,
    new_str: "new"
  });

  const { container } = render(
    <ToolInvocationMessage
      toolName="str_replace_editor"
      args={args}
      state="result"
      result="Success"
    />
  );

  const message = container.querySelector(".text-neutral-700");
  expect(message?.textContent).toContain("...");
  const displayedOldStr = message?.textContent?.match(/"([^"]+)"/)?.[1];
  expect(displayedOldStr?.length).toBeLessThanOrEqual(40);
});

test("does not truncate text exactly 40 characters", () => {
  const exactText = "a".repeat(40);
  const args = JSON.stringify({
    command: "str_replace",
    path: "/test.jsx",
    old_str: exactText,
    new_str: "new"
  });

  const { container } = render(
    <ToolInvocationMessage
      toolName="str_replace_editor"
      args={args}
      state="result"
      result="Success"
    />
  );

  const message = container.querySelector(".text-neutral-700");
  expect(message?.textContent).not.toContain("...");
});

test("does not truncate text shorter than 40 characters", () => {
  const shortText = "short text";
  const args = JSON.stringify({
    command: "str_replace",
    path: "/test.jsx",
    old_str: shortText,
    new_str: "new"
  });

  const { container } = render(
    <ToolInvocationMessage
      toolName="str_replace_editor"
      args={args}
      state="result"
      result="Success"
    />
  );

  const message = container.querySelector(".text-neutral-700");
  expect(message?.textContent).toContain(shortText);
  expect(message?.textContent).not.toContain("...");
});

// Edge case tests

test("handles malformed JSON gracefully", () => {
  render(
    <ToolInvocationMessage
      toolName="str_replace_editor"
      args="{invalid json"
      state="result"
      result="Success"
    />
  );

  expect(screen.getByText("str_replace_editor")).toBeDefined();
});

test("handles unknown tool name", () => {
  const args = JSON.stringify({ command: "create", path: "/test.jsx" });

  render(
    <ToolInvocationMessage
      toolName="unknown_tool"
      args={args}
      state="result"
      result="Success"
    />
  );

  expect(screen.getByText("unknown_tool")).toBeDefined();
});

test("handles unknown tool name in pending state", () => {
  const args = JSON.stringify({ command: "create", path: "/test.jsx" });

  render(
    <ToolInvocationMessage
      toolName="unknown_tool"
      args={args}
      state="pending"
    />
  );

  expect(screen.getByText("Running unknown_tool...")).toBeDefined();
});

test("handles empty string values in args", () => {
  const args = JSON.stringify({
    command: "str_replace",
    path: "/test.jsx",
    old_str: "",
    new_str: ""
  });

  render(
    <ToolInvocationMessage
      toolName="str_replace_editor"
      args={args}
      state="result"
      result="Success"
    />
  );

  expect(screen.getByText('Edited /test.jsx: Replacing "" with ""')).toBeDefined();
});

// Visual state tests

test("shows spinner for pending state", () => {
  const args = JSON.stringify({ command: "create", path: "/test.jsx" });

  const { container } = render(
    <ToolInvocationMessage
      toolName="str_replace_editor"
      args={args}
      state="pending"
    />
  );

  const spinner = container.querySelector(".animate-spin");
  expect(spinner).toBeDefined();
});

test("shows green dot for completed state with result", () => {
  const args = JSON.stringify({ command: "create", path: "/test.jsx" });

  const { container } = render(
    <ToolInvocationMessage
      toolName="str_replace_editor"
      args={args}
      state="result"
      result="Success"
    />
  );

  const greenDot = container.querySelector(".bg-emerald-500");
  expect(greenDot).toBeDefined();
});

test("applies correct styling classes", () => {
  const args = JSON.stringify({ command: "create", path: "/test.jsx" });

  const { container } = render(
    <ToolInvocationMessage
      toolName="str_replace_editor"
      args={args}
      state="result"
      result="Success"
    />
  );

  const element = container.querySelector(".bg-neutral-50");
  expect(element).toBeDefined();
  expect(element?.classList.contains("rounded-lg")).toBe(true);
  expect(element?.classList.contains("font-mono")).toBe(true);
  expect(element?.classList.contains("border-neutral-200")).toBe(true);
});

test("allows className prop override", () => {
  const args = JSON.stringify({ command: "create", path: "/test.jsx" });

  const { container } = render(
    <ToolInvocationMessage
      toolName="str_replace_editor"
      args={args}
      state="result"
      result="Success"
      className="custom-class"
    />
  );

  const element = container.querySelector(".custom-class");
  expect(element).toBeDefined();
});
