import { describe, expect, it } from "vitest";
import {
  actionFeedbackClassName,
  actionFeedbackDurationMs,
  buildNoteSavePayload,
  buildTaskSavePayload,
  getWorkflowEditorCopy,
  inboxActionFlows,
  shouldShowActionFeedback,
  type InboxActionFeedbackKey
} from "./inbox-action-feedback";

describe("inbox action feedback and workflow wiring", () => {
  it("routes Customer 360 Add Note through the same note flow as the toolbar", () => {
    expect(inboxActionFlows.customerAddNote).toBe("add-note-flow");
    expect(inboxActionFlows.customerAddNote).toBe(inboxActionFlows.toolbarAddNote);
  });

  it("routes quick Add Note through the same visible note editor", () => {
    expect(inboxActionFlows.quickAddNote).toBe(inboxActionFlows.toolbarAddNote);
  });

  it("routes Customer 360 and quick Create Task through the same task flow as the toolbar", () => {
    expect(inboxActionFlows.customerCreateTask).toBe("create-task-flow");
    expect(inboxActionFlows.customerCreateTask).toBe(inboxActionFlows.toolbarCreateTask);
    expect(inboxActionFlows.quickCreateTask).toBe(inboxActionFlows.toolbarCreateTask);
  });

  it("defines a visible Add Note editor with textarea, Save, and Cancel controls", () => {
    expect(getWorkflowEditorCopy("note")).toMatchObject({
      title: "Add internal note",
      bodyPlaceholder: "Write an internal note...",
      primaryLabel: "Save note",
      cancelLabel: "Cancel"
    });
  });

  it("builds a saveable note payload from typed note text", () => {
    expect(buildNoteSavePayload(" Sprint 33 UI safe note ", "team")).toEqual({
      body: "Sprint 33 UI safe note",
      visibility: "team"
    });
    expect(buildNoteSavePayload("   ", "team")).toBeNull();
  });

  it("defines a visible Create Task editor with title input, optional details, Save/Create, and Cancel controls", () => {
    expect(getWorkflowEditorCopy("task")).toMatchObject({
      title: "Create task",
      titlePlaceholder: "Task title...",
      descriptionPlaceholder: "Optional task details...",
      primaryLabel: "Create task",
      cancelLabel: "Cancel"
    });
  });

  it("builds a saveable task payload from typed task title", () => {
    expect(buildTaskSavePayload(" Sprint 33 UI safe task ")).toEqual({ title: "Sprint 33 UI safe task" });
    expect(buildTaskSavePayload(" Assign follow-up ", "00000000-0000-4000-8000-000000000011", "2026-05-22T04:00:00.000Z")).toEqual({
      title: "Assign follow-up",
      assigneeUserId: "00000000-0000-4000-8000-000000000011",
      dueAt: "2026-05-22T04:00:00.000Z"
    });
    expect(buildTaskSavePayload(" Unassigned follow-up ", null, null)).toEqual({
      title: "Unassigned follow-up",
      assigneeUserId: null,
      dueAt: null
    });
    expect(buildTaskSavePayload("   ")).toBeNull();
  });

  it("shows success feedback after opening a modal or completing an action", () => {
    expect(shouldShowActionFeedback("opened")).toBe(true);
    expect(shouldShowActionFeedback("succeeded")).toBe(true);
  });

  it("does not show success feedback for failed or ignored actions", () => {
    expect(shouldShowActionFeedback("failed")).toBe(false);
    expect(shouldShowActionFeedback("ignored")).toBe(false);
  });

  it("adds the success class only to the clicked action key", () => {
    const activeKey: InboxActionFeedbackKey = "customer-add-note";

    expect(actionFeedbackClassName("customer-add-note", activeKey)).toBe("actionSuccess");
    expect(actionFeedbackClassName("toolbar-add-note", activeKey)).toBeUndefined();
  });

  it("supports task completion feedback only when the completion action succeeds", () => {
    const activeKey: InboxActionFeedbackKey = "task-complete";

    expect(shouldShowActionFeedback("succeeded")).toBe(true);
    expect(shouldShowActionFeedback("failed")).toBe(false);
    expect(actionFeedbackClassName("task-complete", activeKey, "smallPanelButton")).toBe("smallPanelButton actionSuccess");
    expect(actionFeedbackClassName("task-save", activeKey, "smallPanelButton")).toBe("smallPanelButton");
  });

  it("keeps action feedback brief", () => {
    expect(actionFeedbackDurationMs).toBeGreaterThanOrEqual(1500);
    expect(actionFeedbackDurationMs).toBeLessThanOrEqual(2000);
  });
});
