"use client";

import { Plus, Trash2 } from "lucide-react";
import {
  RICH_MESSAGE_KINDS_BY_PLATFORM,
  RICH_MESSAGE_KIND_META,
  summariseRichMessage
} from "@ai-omni/shared";
import type {
  Platform,
  RichButton,
  RichGenericElement,
  RichIceBreaker,
  RichMessage,
  RichMessageKind,
  RichQuickReplyItem,
  RichTelegramCommand
} from "@ai-omni/shared";

const ALL_PLATFORMS: Platform[] = ["line", "telegram", "facebook", "instagram", "webchat"];

const PLATFORM_LABEL: Record<Platform, string> = {
  line: "LINE",
  telegram: "Telegram",
  facebook: "Messenger",
  instagram: "Instagram",
  webchat: "Webchat"
};

function defaultButton(): RichButton {
  return { type: "postback", label: "Button", data: "PAYLOAD" };
}

function defaultQuickReply(): RichQuickReplyItem {
  return { label: "Option" };
}

function defaultElement(): RichGenericElement {
  return { title: "Card title", subtitle: "", buttons: [] };
}

function defaultIceBreaker(): RichIceBreaker {
  return { question: "How can I help?", payload: "HELP" };
}

function defaultCommand(): RichTelegramCommand {
  return { command: "start", description: "Start the bot" };
}

function createDefault(kind: RichMessageKind): RichMessage {
  switch (kind) {
    case "line_quick_reply":
      return { kind, text: "Pick an option", items: [defaultQuickReply()] };
    case "line_flex":
      return { kind, altText: "Flex message", layout: "bubble", bubbles: [{ title: "Title", text: "Body text", actions: [] }] };
    case "line_buttons":
      return { kind, altText: "Buttons", text: "Choose one", actions: [defaultButton()] };
    case "telegram_inline_keyboard":
      return { kind, text: "Pick an option", rows: [[{ type: "uri", label: "Open", url: "https://example.com" }]] };
    case "telegram_reply_keyboard":
      return { kind, text: "Pick an option", rows: [["Option"]], resizeKeyboard: true, oneTimeKeyboard: false };
    case "telegram_commands":
      return { kind, commands: [defaultCommand()] };
    case "messenger_generic":
      return { kind, elements: [defaultElement()] };
    case "messenger_quick_replies":
      return { kind, text: "Pick an option", items: [defaultQuickReply()] };
    case "instagram_ice_breakers":
      return { kind, iceBreakers: [defaultIceBreaker()] };
    case "instagram_quick_replies":
      return { kind, text: "Pick an option", items: [defaultQuickReply()] };
    case "webchat_quick_replies":
      return { kind, text: "Pick an option", items: [defaultQuickReply()] };
    default:
      return { kind: "webchat_quick_replies", text: "Pick an option", items: [defaultQuickReply()] };
  }
}

interface RichMessageEditorProps {
  value: RichMessage | null;
  platformScope?: Platform[];
  onChange: (value: RichMessage | null) => void;
}

export function RichMessageEditor({ value, platformScope, onChange }: RichMessageEditorProps) {
  const platforms = platformScope && platformScope.length > 0
    ? ALL_PLATFORMS.filter((p) => platformScope.includes(p))
    : ALL_PLATFORMS;

  const activePlatform: Platform = value ? RICH_MESSAGE_KIND_META[value.kind].platform : platforms[0];
  const kindOptions = RICH_MESSAGE_KINDS_BY_PLATFORM[activePlatform];

  function handlePlatform(next: Platform) {
    const firstKind = RICH_MESSAGE_KINDS_BY_PLATFORM[next][0];
    onChange(createDefault(firstKind));
  }

  function handleKind(next: RichMessageKind) {
    onChange(createDefault(next));
  }

  if (!value) {
    return (
      <div className="flowRich">
        <div className="flowRichHead">
          <span>Rich message</span>
          <button type="button" className="flowRichAdd" onClick={() => onChange(createDefault(RICH_MESSAGE_KINDS_BY_PLATFORM[platforms[0]][0]))}>
            <Plus size={13} /> Add rich message
          </button>
        </div>
        <p className="flowRichHint">Attach a platform-specific rich reply (quick replies, cards, buttons…).</p>
      </div>
    );
  }

  return (
    <div className="flowRich">
      <div className="flowRichHead">
        <span>Rich message</span>
        <button type="button" className="flowRichRemove" onClick={() => onChange(null)}>
          <Trash2 size={13} /> Remove
        </button>
      </div>

      <div className="flowRichRow">
        <label className="flowConfigField">
          Platform
          <select value={activePlatform} onChange={(event) => handlePlatform(event.target.value as Platform)}>
            {platforms.map((p) => <option key={p} value={p}>{PLATFORM_LABEL[p]}</option>)}
          </select>
        </label>
        <label className="flowConfigField">
          Type
          <select value={value.kind} onChange={(event) => handleKind(event.target.value as RichMessageKind)}>
            {kindOptions.map((kind) => <option key={kind} value={kind}>{RICH_MESSAGE_KIND_META[kind].label}</option>)}
          </select>
        </label>
      </div>
      <p className="flowRichHint">{RICH_MESSAGE_KIND_META[value.kind].description}</p>

      <KindEditor value={value} onChange={onChange} />

      <RichMessagePreview value={value} />
    </div>
  );
}

interface KindEditorProps {
  value: RichMessage;
  onChange: (value: RichMessage) => void;
}

function KindEditor({ value, onChange }: KindEditorProps) {
  switch (value.kind) {
    case "line_quick_reply":
    case "messenger_quick_replies":
    case "instagram_quick_replies":
    case "webchat_quick_replies":
      return (
        <>
          <label className="flowConfigField">
            Message text
            <textarea rows={2} value={value.text} onChange={(event) => onChange({ ...value, text: event.target.value })} />
          </label>
          <QuickReplyItemsEditor items={value.items} max={13} onChange={(items) => onChange({ ...value, items })} />
        </>
      );
    case "line_buttons":
      return (
        <>
          <label className="flowConfigField">
            Alt text
            <input value={value.altText} onChange={(event) => onChange({ ...value, altText: event.target.value })} />
          </label>
          <label className="flowConfigField">
            Card text
            <input value={value.text} onChange={(event) => onChange({ ...value, text: event.target.value })} />
          </label>
          <label className="flowConfigField">
            Thumbnail URL (optional)
            <input value={value.thumbnailUrl ?? ""} onChange={(event) => onChange({ ...value, thumbnailUrl: event.target.value || undefined })} />
          </label>
          <ButtonsEditor buttons={value.actions} max={4} onChange={(actions) => onChange({ ...value, actions })} />
        </>
      );
    case "line_flex":
      return (
        <>
          <label className="flowConfigField">
            Alt text
            <input value={value.altText} onChange={(event) => onChange({ ...value, altText: event.target.value })} />
          </label>
          <label className="flowConfigField">
            Layout
            <select value={value.layout} onChange={(event) => onChange({ ...value, layout: event.target.value as "bubble" | "carousel" })}>
              <option value="bubble">bubble</option>
              <option value="carousel">carousel</option>
            </select>
          </label>
          <ListEditor
            title="Bubbles"
            max={12}
            items={value.bubbles}
            makeItem={() => ({ title: "Title", text: "Body text", actions: [] })}
            onChange={(bubbles) => onChange({ ...value, bubbles })}
            render={(bubble, updateBubble) => (
              <>
                <label className="flowConfigField">
                  Title
                  <input value={bubble.title ?? ""} onChange={(event) => updateBubble({ ...bubble, title: event.target.value || undefined })} />
                </label>
                <label className="flowConfigField">
                  Text
                  <input value={bubble.text ?? ""} onChange={(event) => updateBubble({ ...bubble, text: event.target.value || undefined })} />
                </label>
                <label className="flowConfigField">
                  Image URL (optional)
                  <input value={bubble.imageUrl ?? ""} onChange={(event) => updateBubble({ ...bubble, imageUrl: event.target.value || undefined })} />
                </label>
                <ButtonsEditor buttons={bubble.actions} max={4} onChange={(actions) => updateBubble({ ...bubble, actions })} />
              </>
            )}
          />
        </>
      );
    case "telegram_inline_keyboard":
      return (
        <>
          <label className="flowConfigField">
            Message text
            <textarea rows={2} value={value.text} onChange={(event) => onChange({ ...value, text: event.target.value })} />
          </label>
          <ListEditor
            title="Rows"
            max={100}
            items={value.rows}
            makeItem={() => [defaultButton()]}
            onChange={(rows) => onChange({ ...value, rows })}
            render={(row, updateRow) => (
              <ButtonsEditor buttons={row} max={8} onChange={(buttons) => updateRow(buttons)} />
            )}
          />
        </>
      );
    case "telegram_reply_keyboard":
      return (
        <>
          <label className="flowConfigField">
            Message text
            <textarea rows={2} value={value.text} onChange={(event) => onChange({ ...value, text: event.target.value })} />
          </label>
          <label className="flowRichCheck">
            <input type="checkbox" checked={value.resizeKeyboard} onChange={(event) => onChange({ ...value, resizeKeyboard: event.target.checked })} />
            Resize keyboard
          </label>
          <label className="flowRichCheck">
            <input type="checkbox" checked={value.oneTimeKeyboard} onChange={(event) => onChange({ ...value, oneTimeKeyboard: event.target.checked })} />
            One-time keyboard
          </label>
          <ListEditor
            title="Rows"
            max={20}
            items={value.rows}
            makeItem={() => ["Option"]}
            onChange={(rows) => onChange({ ...value, rows })}
            render={(row, updateRow) => (
              <StringListEditor labels={row} max={8} onChange={(labels) => updateRow(labels)} />
            )}
          />
        </>
      );
    case "telegram_commands":
      return (
        <ListEditor
          title="Commands"
          max={100}
          items={value.commands}
          makeItem={defaultCommand}
          onChange={(commands) => onChange({ ...value, commands })}
          render={(command, updateCommand) => (
            <div className="flowRichRow">
              <label className="flowConfigField">
                Command
                <input value={command.command} onChange={(event) => updateCommand({ ...command, command: event.target.value })} />
              </label>
              <label className="flowConfigField">
                Description
                <input value={command.description} onChange={(event) => updateCommand({ ...command, description: event.target.value })} />
              </label>
            </div>
          )}
        />
      );
    case "messenger_generic":
      return (
        <ListEditor
          title="Cards"
          max={10}
          items={value.elements}
          makeItem={defaultElement}
          onChange={(elements) => onChange({ ...value, elements })}
          render={(element, updateElement) => (
            <>
              <label className="flowConfigField">
                Title
                <input value={element.title} onChange={(event) => updateElement({ ...element, title: event.target.value })} />
              </label>
              <label className="flowConfigField">
                Subtitle (optional)
                <input value={element.subtitle ?? ""} onChange={(event) => updateElement({ ...element, subtitle: event.target.value || undefined })} />
              </label>
              <label className="flowConfigField">
                Image URL (optional)
                <input value={element.imageUrl ?? ""} onChange={(event) => updateElement({ ...element, imageUrl: event.target.value || undefined })} />
              </label>
              <ButtonsEditor buttons={element.buttons} max={3} onChange={(buttons) => updateElement({ ...element, buttons })} />
            </>
          )}
        />
      );
    case "instagram_ice_breakers":
      return (
        <ListEditor
          title="Ice breakers"
          max={4}
          items={value.iceBreakers}
          makeItem={defaultIceBreaker}
          onChange={(iceBreakers) => onChange({ ...value, iceBreakers })}
          render={(item, updateItem) => (
            <div className="flowRichRow">
              <label className="flowConfigField">
                Question
                <input value={item.question} onChange={(event) => updateItem({ ...item, question: event.target.value })} />
              </label>
              <label className="flowConfigField">
                Payload
                <input value={item.payload} onChange={(event) => updateItem({ ...item, payload: event.target.value })} />
              </label>
            </div>
          )}
        />
      );
    default:
      return null;
  }
}

interface ListEditorProps<T> {
  title: string;
  max: number;
  items: T[];
  makeItem: () => T;
  onChange: (items: T[]) => void;
  render: (item: T, update: (next: T) => void) => React.ReactNode;
}

function ListEditor<T>({ title, max, items, makeItem, onChange, render }: ListEditorProps<T>) {
  function update(index: number, next: T) {
    onChange(items.map((item, i) => (i === index ? next : item)));
  }
  function remove(index: number) {
    if (items.length <= 1) return;
    onChange(items.filter((_, i) => i !== index));
  }
  return (
    <div className="flowRichList">
      <div className="flowRichListHead">
        <span>{title} ({items.length}/{max})</span>
        <button type="button" className="flowRichAdd" disabled={items.length >= max} onClick={() => onChange([...items, makeItem()])}>
          <Plus size={13} /> Add
        </button>
      </div>
      {items.map((item, index) => (
        <div key={index} className="flowRichItem">
          <div className="flowRichItemBody">{render(item, (next) => update(index, next))}</div>
          <button type="button" className="flowRichItemDel" disabled={items.length <= 1} onClick={() => remove(index)} aria-label="Remove">
            <Trash2 size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}

interface QuickReplyItemsEditorProps {
  items: RichQuickReplyItem[];
  max: number;
  onChange: (items: RichQuickReplyItem[]) => void;
}

function QuickReplyItemsEditor({ items, max, onChange }: QuickReplyItemsEditorProps) {
  return (
    <ListEditor
      title="Quick replies"
      max={max}
      items={items}
      makeItem={defaultQuickReply}
      onChange={onChange}
      render={(item, update) => (
        <div className="flowRichRow">
          <label className="flowConfigField">
            Label
            <input value={item.label} onChange={(event) => update({ ...item, label: event.target.value })} />
          </label>
          <label className="flowConfigField">
            Payload (optional)
            <input value={item.data ?? ""} onChange={(event) => update({ ...item, data: event.target.value || undefined })} />
          </label>
        </div>
      )}
    />
  );
}

interface ButtonsEditorProps {
  buttons: RichButton[];
  max: number;
  onChange: (buttons: RichButton[]) => void;
}

function ButtonsEditor({ buttons, max, onChange }: ButtonsEditorProps) {
  function update(index: number, next: RichButton) {
    onChange(buttons.map((button, i) => (i === index ? next : button)));
  }
  return (
    <div className="flowRichList">
      <div className="flowRichListHead">
        <span>Buttons ({buttons.length}/{max})</span>
        <button type="button" className="flowRichAdd" disabled={buttons.length >= max} onClick={() => onChange([...buttons, defaultButton()])}>
          <Plus size={13} /> Add
        </button>
      </div>
      {buttons.map((button, index) => (
        <div key={index} className="flowRichItem">
          <div className="flowRichItemBody">
            <div className="flowRichRow">
              <label className="flowConfigField">
                Label
                <input value={button.label} onChange={(event) => update(index, { ...button, label: event.target.value })} />
              </label>
              <label className="flowConfigField">
                Action
                <select value={button.type} onChange={(event) => update(index, { ...button, type: event.target.value as RichButton["type"] })}>
                  <option value="postback">postback</option>
                  <option value="uri">uri / url</option>
                  <option value="message">message</option>
                </select>
              </label>
            </div>
            {button.type === "uri" ? (
              <label className="flowConfigField">
                URL
                <input value={button.url ?? ""} onChange={(event) => update(index, { ...button, url: event.target.value || undefined })} />
              </label>
            ) : (
              <label className="flowConfigField">
                Payload
                <input value={button.data ?? ""} onChange={(event) => update(index, { ...button, data: event.target.value || undefined })} />
              </label>
            )}
          </div>
          <button type="button" className="flowRichItemDel" disabled={buttons.length <= 1} onClick={() => onChange(buttons.filter((_, i) => i !== index))} aria-label="Remove">
            <Trash2 size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}

interface StringListEditorProps {
  labels: string[];
  max: number;
  onChange: (labels: string[]) => void;
}

function StringListEditor({ labels, max, onChange }: StringListEditorProps) {
  return (
    <div className="flowRichChips">
      {labels.map((label, index) => (
        <span key={index} className="flowRichChipEdit">
          <input value={label} onChange={(event) => onChange(labels.map((l, i) => (i === index ? event.target.value : l)))} />
          <button type="button" disabled={labels.length <= 1} onClick={() => onChange(labels.filter((_, i) => i !== index))} aria-label="Remove"><Trash2 size={11} /></button>
        </span>
      ))}
      <button type="button" className="flowRichAdd" disabled={labels.length >= max} onClick={() => onChange([...labels, "Option"])}>
        <Plus size={12} /> Add
      </button>
    </div>
  );
}

export function RichMessagePreview({ value }: { value: RichMessage }) {
  return (
    <div className="flowRichPreview">
      <span className="flowRichPreviewTag">Preview · {summariseRichMessage(value)}</span>
      <div className="flowRichPreviewBody">{renderPreview(value)}</div>
    </div>
  );
}

function renderPreview(value: RichMessage) {
  switch (value.kind) {
    case "line_quick_reply":
    case "messenger_quick_replies":
    case "instagram_quick_replies":
    case "webchat_quick_replies":
      return (
        <>
          <div className="flowRichBubble">{value.text}</div>
          <div className="flowRichChipsRow">
            {value.items.map((item, index) => <span key={index} className="flowRichChip">{item.label}</span>)}
          </div>
        </>
      );
    case "line_buttons":
      return (
        <div className="flowRichCard">
          {value.thumbnailUrl ? <div className="flowRichCardImg" /> : null}
          <div className="flowRichCardText">{value.text}</div>
          <div className="flowRichCardBtns">
            {value.actions.map((action, index) => <span key={index} className="flowRichBtn">{action.label}</span>)}
          </div>
        </div>
      );
    case "line_flex":
      return (
        <div className={value.layout === "carousel" ? "flowRichCarousel" : ""}>
          {value.bubbles.map((bubble, index) => (
            <div key={index} className="flowRichCard">
              {bubble.imageUrl ? <div className="flowRichCardImg" /> : null}
              {bubble.title ? <strong className="flowRichCardTitle">{bubble.title}</strong> : null}
              {bubble.text ? <div className="flowRichCardText">{bubble.text}</div> : null}
              <div className="flowRichCardBtns">
                {bubble.actions.map((action, ai) => <span key={ai} className="flowRichBtn">{action.label}</span>)}
              </div>
            </div>
          ))}
        </div>
      );
    case "telegram_inline_keyboard":
      return (
        <>
          <div className="flowRichBubble">{value.text}</div>
          {value.rows.map((row, index) => (
            <div key={index} className="flowRichCardBtns">
              {row.map((button, bi) => <span key={bi} className="flowRichBtn">{button.label}</span>)}
            </div>
          ))}
        </>
      );
    case "telegram_reply_keyboard":
      return (
        <>
          <div className="flowRichBubble">{value.text}</div>
          {value.rows.map((row, index) => (
            <div key={index} className="flowRichChipsRow">
              {row.map((label, li) => <span key={li} className="flowRichChip">{label}</span>)}
            </div>
          ))}
        </>
      );
    case "telegram_commands":
      return (
        <div className="flowRichCommands">
          {value.commands.map((command, index) => (
            <div key={index} className="flowRichCommand"><code>/{command.command}</code> <span>{command.description}</span></div>
          ))}
        </div>
      );
    case "messenger_generic":
      return (
        <div className="flowRichCarousel">
          {value.elements.map((element, index) => (
            <div key={index} className="flowRichCard">
              {element.imageUrl ? <div className="flowRichCardImg" /> : null}
              <strong className="flowRichCardTitle">{element.title}</strong>
              {element.subtitle ? <div className="flowRichCardText">{element.subtitle}</div> : null}
              <div className="flowRichCardBtns">
                {element.buttons.map((button, bi) => <span key={bi} className="flowRichBtn">{button.label}</span>)}
              </div>
            </div>
          ))}
        </div>
      );
    case "instagram_ice_breakers":
      return (
        <div className="flowRichChipsRow">
          {value.iceBreakers.map((item, index) => <span key={index} className="flowRichChip">{item.question}</span>)}
        </div>
      );
    default:
      return null;
  }
}
