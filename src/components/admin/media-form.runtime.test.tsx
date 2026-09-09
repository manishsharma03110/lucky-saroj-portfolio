import assert from "node:assert/strict";
import { before, mock, test } from "node:test";
import Module from "node:module";
import * as React from "react";

type Node = React.ReactElement<Record<string, unknown>>;
type Harness = { slots: unknown[]; index: number };
let current: Harness;
let report: (active: boolean) => void = () => {};
const react = {
  ...React,
  useState(initial: unknown) {
    const harness = current; const index = harness.index++;
    if (!(index in harness.slots)) harness.slots[index] = initial;
    return [harness.slots[index], (value: unknown) => { harness.slots[index] = value; }];
  },
  useRef(initial: unknown) { const index = current.index++; return current.slots[index] ?? (current.slots[index] = { current: initial }); },
  useCallback(callback: unknown) { return callback; },
  useContext() { return report; },
};
let finish: (result: object) => void;
let FileUpload: typeof import("./FileUpload").FileUpload;
let MediaForm: typeof import("./MediaForm").MediaForm;
before(async () => {
  const loader = Module as unknown as { _load: (name: string, ...args: unknown[]) => unknown };
  const load = loader._load;
  mock.method(loader, "_load", (name: string, ...args: unknown[]) => {
    if (name === "react") return react;
    if (name === "@vercel/blob/client") return { upload: () => new Promise(resolve => { finish = resolve; }) };
    return load(name, ...args);
  });
  ({ FileUpload } = await import("./FileUpload"));
  ({ MediaForm } = await import("./MediaForm"));
  mock.method(globalThis, "fetch", async () => Response.json({ assetId: "22222222-2222-4222-8222-222222222222", pathname: "cms-media/22222222-2222-4222-8222-222222222222/video", kind: "video" }));
});
function render(harness: Harness, component: () => Node) { current = harness; harness.index = 0; return component(); }
function nodes(node: unknown): Node[] {
  if (!React.isValidElement(node)) return [];
  const element = node as Node;
  return [element, ...React.Children.toArray(element.props.children as React.ReactNode).flatMap(nodes)];
}
function named(tree: Node, name: string) { return nodes(tree).find(node => node.props.name === name)!; }
function inputData(tree: Node) {
  const form = new FormData();
  for (const node of nodes(tree)) if (node.type === "input" && node.props.type === "hidden") form.set(String(node.props.name), String(node.props.value));
  return form;
}
test("upload blocks Save until URL and asset ID are ready; old external URL is replaced", async () => {
  const formHarness = { slots: [], index: 0 }; const uploadHarness = { slots: [], index: 0 };
  const form = () => render(formHarness, () => MediaForm({ children: null }));
  report = form().props.value as typeof report;
  const upload = () => render(uploadHarness, () => FileUpload({ name: "videoUrl", assetIdName: "videoAssetId", label: "Video", kind: "video", defaultValue: "https://drive.google.com/old" }));
  let tree = upload();
  const fileInput = nodes(tree).find(node => node.props.type === "file")!;
  (fileInput.props.onChange as (event: object) => void)({ target: { files: [new File(["test"], "test.mp4", { type: "video/mp4" })] } });
  let blocked = false;
  const nativeForm = nodes(form()).find(node => node.type === "form")!;
  (nativeForm.props.onSubmitCapture as (event: object) => void)({ preventDefault() { blocked = true; } });
  assert.equal(blocked, true);
  assert.equal(nodes(form()).find(node => node.type === "fieldset")!.props.disabled, true);
  await new Promise(resolve => setImmediate(resolve));
  finish({ pathname: "cms-media/22222222-2222-4222-8222-222222222222/video", url: "https://test.public.blob.vercel-storage.com/video" });
  await new Promise(resolve => setImmediate(resolve));
  tree = upload();
  assert.equal(inputData(tree).get("videoAssetId"), "22222222-2222-4222-8222-222222222222");
  assert.equal(inputData(tree).get("videoUrl"), "https://test.public.blob.vercel-storage.com/video");
  assert.equal(named(tree, "externalVideoUrl").props.value, "");
  assert.equal(nodes(form()).find(node => node.type === "fieldset")!.props.disabled, false);
});
test("untouched URL-only video remains submitted; editing and remove update canonical field", () => {
  const harness = { slots: [], index: 0 };
  const renderUpload = () => render(harness, () => FileUpload({ name: "videoUrl", assetIdName: "videoAssetId", label: "Video", kind: "video", defaultValue: "https://drive.google.com/old" }));
  let tree = renderUpload();
  assert.equal(inputData(tree).get("videoUrl"), "https://drive.google.com/old");
  (named(tree, "externalVideoUrl").props.onChange as (event: object) => void)({ target: { value: "https://vimeo.com/123" } });
  tree = renderUpload(); assert.equal(inputData(tree).get("videoUrl"), "https://vimeo.com/123");
  (nodes(tree).find(node => node.props["aria-label"] === "Remove")!.props.onClick as () => void)();
  tree = renderUpload(); assert.equal(inputData(tree).get("videoUrl"), ""); assert.equal(named(tree, "externalVideoUrl").props.value, "");
});
