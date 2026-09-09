import assert from "node:assert/strict";
import { before, mock, test } from "node:test";
import Module from "node:module";
import * as React from "react";

type Element = React.ReactElement<Record<string, unknown>>;
type Harness = { slots: unknown[]; index: number; pending: boolean; task?: Promise<void> };
let current: Harness;
const calls: unknown[][] = [];
let action: (...args: unknown[]) => Promise<object> = async () => ({ status: "success", revision: 2 });
let Item: typeof import("./MessageListItem").MessageListItem;
const react = {
  ...React,
  useState(initial: unknown) {
    const h = current; const i = h.index++;
    if (!(i in h.slots)) h.slots[i] = initial;
    return [h.slots[i], (value: unknown) => { h.slots[i] = value; }];
  },
  useRef(initial: unknown) { const i = current.index++; return current.slots[i] ?? (current.slots[i] = { current: initial }); },
  useTransition() { const h = current; return [h.pending, (work: () => Promise<void>) => { h.pending = true; h.task = work().finally(() => { h.pending = false; }); }]; },
};
before(async () => {
  const loader = Module as unknown as { _load: (name: string, ...args: unknown[]) => unknown };
  const load = loader._load;
  mock.method(loader, "_load", (name: string, ...args: unknown[]) => {
    if (name === "react") return react;
    if (name === "@/components/admin/DeleteButton") return { DeleteButton: () => null };
    if (name === "@/lib/actions/messages") return { updateMessageStatus: (...args: unknown[]) => { calls.push(args); return action(...args); }, deleteMessage: async () => {} };
    return load(name, ...args);
  });
  ({ MessageListItem: Item } = await import("./MessageListItem"));
});
function nodes(value: unknown): Element[] {
  if (!React.isValidElement(value)) return [];
  const node = value as Element;
  return [node, ...React.Children.toArray(node.props.children as React.ReactNode).flatMap(nodes)];
}
function setup() {
  calls.length = 0;
  let message = { id: "7bcb0598-46f5-4b71-afcd-265ba6981540", status: "new", revision: 1, name: "Test", email: "test@example.test", message: "Test" } as Parameters<typeof Item>[0]["message"];
  let h: Harness = { slots: [], index: 0, pending: false }; let key: string | null = null;
  function render() {
    const wrapper = Item({ message });
    if (wrapper.key !== key) { key = wrapper.key; h = { slots: [], index: 0, pending: false }; }
    current = h; h.index = 0;
    return (wrapper.type as (props: { message: typeof message }) => Element)({ message });
  }
  function select() { return nodes(render()).find(n => n.type === "select")!; }
  return { render, select, change(status: string) { (select().props.onChange as (e: object) => void)({ target: { value: status } }); }, task: () => h.task, refresh(status: Parameters<typeof Item>[0]["message"]["status"], revision: number) { message = { ...message, status, revision }; render(); } };
}
test("exact arguments, confirmed success and returned revision; server props reset client state", async () => {
  action = async () => ({ status: "success", revision: 2 });
  const ui = setup(); ui.change("read"); await ui.task();
  assert.deepEqual(calls[0], ["7bcb0598-46f5-4b71-afcd-265ba6981540", 1, "read"]);
  assert.equal(ui.select().props.value, "read");
  ui.change("replied"); await ui.task(); assert.equal(calls[1][1], 2);
  ui.refresh("archived", 4); assert.equal(ui.select().props.value, "archived");
  ui.change("read"); await ui.task(); assert.equal(calls[2][1], 4);
  ui.refresh("new", 4); assert.equal(ui.select().props.value, "new");
});
for (const failure of ["stale", "permission", "unexpected"]) test(`${failure} cannot produce false success`, async () => {
  action = async () => { if (failure === "stale") return { status: "error", message: "Reload before saving." }; throw new Error("SECRET failure"); };
  const ui = setup(); ui.change("read"); await ui.task();
  assert.equal(ui.select().props.value, "new");
  const text = JSON.stringify(ui.render()); assert.ok(!text.includes("SECRET"));
  assert.match(text, /Reload before saving|Unable to update message status/);
});
test("pending blocks double changes and late success cannot overwrite refreshed snapshot", async () => {
  let finish!: (value: object) => void;
  action = () => new Promise(resolve => { finish = resolve; });
  const ui = setup(); ui.change("read"); const task = ui.task();
  assert.equal(ui.select().props.disabled, true); assert.equal(ui.select().props.value, "new");
  ui.change("archived"); assert.equal(calls.length, 1);
  ui.refresh("replied", 3); finish({ status: "success", revision: 2 }); await task;
  assert.equal(ui.select().props.value, "replied");
});
