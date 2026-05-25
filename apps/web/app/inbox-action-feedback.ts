export const actionFeedbackDurationMs = 1700;

export type InboxActionFeedbackKey =
  | "toolbar-add-note"
  | "customer-add-note"
  | "quick-add-note"
  | "toolbar-create-task"
  | "customer-create-task"
  | "quick-create-task"
  | "note-save"
  | "task-save"
  | "task-complete"
  | "take-over"
  | "return-to-ai"
  | "assign-to-me"
  | "unassign"
  | "follow-up"
  | "resolved"
  | "reopen"
  | "read"
  | "replied"
  | "sla-soon"
  | "priority"
  | "status"
  | "assign"
  | "transfer"
  | "internal-note-save";

export type ActionFeedbackOutcome = "opened" | "succeeded" | "failed" | "ignored";
export type InboxActionFlow = "add-note-flow" | "create-task-flow";
export type InboxWorkflowEditorMode = "note" | "task";

export const inboxActionFlows = {
  toolbarAddNote: "add-note-flow",
  customerAddNote: "add-note-flow",
  quickAddNote: "add-note-flow",
  toolbarCreateTask: "create-task-flow",
  customerCreateTask: "create-task-flow",
  quickCreateTask: "create-task-flow"
} as const satisfies Record<string, InboxActionFlow>;

export const inboxWorkflowEditorCopy = {
  note: {
    title: "Add internal note",
    bodyPlaceholder: "Write an internal note...",
    primaryLabel: "Save note",
    cancelLabel: "Cancel"
  },
  task: {
    title: "Create task",
    titlePlaceholder: "Task title...",
    descriptionPlaceholder: "Optional task details...",
    primaryLabel: "Create task",
    cancelLabel: "Cancel"
  }
} as const;

export function getWorkflowEditorCopy<T extends InboxWorkflowEditorMode>(mode: T): typeof inboxWorkflowEditorCopy[T] {
  return inboxWorkflowEditorCopy[mode];
}

export function buildNoteSavePayload(body: string, visibility: "team" | "supervisor") {
  const trimmed = body.trim();
  return trimmed ? { body: trimmed, visibility } : null;
}

export function buildTaskSavePayload(title: string) {
  const trimmed = title.trim();
  return trimmed ? { title: trimmed } : null;
}

export function shouldShowActionFeedback(outcome: ActionFeedbackOutcome) {
  return outcome === "opened" || outcome === "succeeded";
}

export function actionFeedbackClassName(
  actionKey: InboxActionFeedbackKey,
  activeActionKey: InboxActionFeedbackKey | null,
  baseClassName = ""
) {
  const className = actionKey === activeActionKey ? `${baseClassName} actionSuccess` : baseClassName;
  return className.trim() || undefined;
}
