import assert from "node:assert/strict";
import { it, mock } from "node:test";
import { BUDGET_RANGES, POPUP_PROJECT_TYPES, VIDEO_TYPES } from "@/lib/validations/contact-options";

let serviceReads = 0;
let mutations = 0;
mock.module("@/lib/db", { namedExports: {
  schema: { contactMessages: {} },
  db: { insert: () => ({ values: async () => { mutations += 1; } }) },
} });
mock.module("@/lib/db/queries", { namedExports: {
  getServices: async () => {
    serviceReads += 1;
    return [{ name: "Video Editing" }];
  },
} });

function validBaseFormData() {
  const formData = new FormData();
  formData.set("name", "Visitor");
  formData.set("email", "visitor@example.com");
  formData.set("budgetRange", BUDGET_RANGES[0]);
  formData.set("message", "A complete project inquiry message.");
  return formData;
}

it("Popup public action ignores spoofed Full context and still requires phone", async () => {
  serviceReads = 0;
  mutations = 0;
  const { submitPopupContactForm } = await import("@/lib/actions/contact");
  const formData = validBaseFormData();
  formData.set("formContext", "full");
  formData.set("projectType", POPUP_PROJECT_TYPES[0]);
  formData.set("videoType", POPUP_PROJECT_TYPES[0]);

  const result = await submitPopupContactForm({ status: "idle" }, formData);

  assert.equal(result.status, "error");
  assert.equal(result.fieldErrors?.phone, "Please enter your phone number");
  assert.equal(serviceReads, 0);
  assert.equal(mutations, 0);
});

it("Full public action ignores spoofed Popup context and still checks active services", async () => {
  serviceReads = 0;
  mutations = 0;
  const { submitFullContactForm } = await import("@/lib/actions/contact");
  const popupOnlyProjectType = POPUP_PROJECT_TYPES.find((value) => value !== "Other")!;
  const formData = validBaseFormData();
  formData.set("formContext", "popup");
  formData.set("projectType", popupOnlyProjectType);
  formData.set("videoType", VIDEO_TYPES[0]);

  const result = await submitFullContactForm({ status: "idle" }, formData);

  assert.equal(result.status, "error");
  assert.equal(result.fieldErrors?.projectType, "Please select a supported project category.");
  assert.equal(serviceReads, 1);
  assert.equal(mutations, 0);
});
