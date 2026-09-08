import assert from "node:assert/strict";
import test from "node:test";
import { BUDGET_RANGES, POPUP_PROJECT_TYPES, PROJECT_TIMELINES, VIDEO_TYPES } from "@/lib/validations/contact-options";
import {
  CONTACT_MESSAGE_MAX_LENGTH,
  CONTACT_NAME_MAX_LENGTH,
  CONTACT_PHONE_MAX_LENGTH,
  CONTACT_PROJECT_TYPE_MAX_LENGTH,
  CONTACT_REFERENCE_URL_MAX_LENGTH,
  contactSchema,
} from "@/lib/validations/contact";
import { createContactSubmissionHandler, type ContactMessageInput, type RawContactSubmission } from "./contact-submission";

const validMessage = "A complete project inquiry message.";
const popupInput: RawContactSubmission = {
  name: "Visitor",
  email: "visitor@example.com",
  phone: "+91 98765 43210",
  projectType: POPUP_PROJECT_TYPES[0],
  budgetRange: BUDGET_RANGES[0],
  videoType: "attacker-controlled-but-ignored",
  projectTimeline: "",
  referenceUrl: "",
  message: validMessage,
  honeypot: "",
};
const fullInput: RawContactSubmission = {
  ...popupInput,
  phone: "",
  projectType: "Video Editing",
  videoType: VIDEO_TYPES[0],
  projectTimeline: PROJECT_TIMELINES[0],
  referenceUrl: "https://example.com/reference",
};

function harness(context: "popup" | "full", options?: { services?: readonly string[]; readError?: Error; mutationError?: Error }) {
  let reads = 0;
  let mutations = 0;
  const stored: ContactMessageInput[] = [];
  const submit = createContactSubmissionHandler(context, {
    readActiveServiceNames: async () => {
      reads += 1;
      if (options?.readError) throw options.readError;
      return options?.services ?? ["Video Editing", "Motion Graphics"];
    },
    createMessage: async (message) => {
      mutations += 1;
      if (options?.mutationError) throw options.mutationError;
      stored.push(message);
    },
  });
  return { submit, stored, counts: () => ({ reads, mutations }) };
}

test("every fixed popup project choice is accepted without a service lookup", async () => {
  for (const projectType of POPUP_PROJECT_TYPES) {
    const context = harness("popup");
    const result = await context.submit({ ...popupInput, projectType });
    assert.equal(result.status, "success", projectType);
    assert.deepEqual(context.counts(), { reads: 0, mutations: 1 });
    assert.equal(context.stored[0]?.projectType, projectType);
    assert.equal(context.stored[0]?.videoType, projectType);
  }
});

test("popup rejects unknown, case-mutated, oversized, and empty project choices before mutation", async () => {
  for (const projectType of ["Unknown", POPUP_PROJECT_TYPES[0].toLowerCase(), "x".repeat(CONTACT_PROJECT_TYPE_MAX_LENGTH + 1), ""]) {
    const context = harness("popup");
    const result = await context.submit({ ...popupInput, projectType });
    assert.equal(result.status, "error");
    assert.deepEqual(context.counts(), { reads: 0, mutations: 0 });
  }
});

test("full contact uses authoritative service names plus Other", async () => {
  for (const projectType of ["Video Editing", "Other"]) {
    const context = harness("full", { services: ["Video Editing"] });
    const result = await context.submit({ ...fullInput, projectType });
    assert.equal(result.status, "success");
    assert.deepEqual(context.counts(), { reads: 1, mutations: 1 });
  }
});

test("full contact rejects unknown, case-mutated, empty, and oversized project types before mutation", async () => {
  for (const projectType of ["Unknown", "video editing", "", "x".repeat(CONTACT_PROJECT_TYPE_MAX_LENGTH + 1)]) {
    const context = harness("full", { services: ["Video Editing"] });
    const result = await context.submit({ ...fullInput, projectType });
    assert.equal(result.status, "error");
    assert.equal(context.counts().mutations, 0);
  }
});

test("structurally invalid public payloads fail before service lookup and mutation", async () => {
  const invalid: Array<Partial<RawContactSubmission>> = [
    { email: "not-an-email" },
    { message: "x".repeat(CONTACT_MESSAGE_MAX_LENGTH + 1) },
    { budgetRange: "Unlimited" },
    { videoType: "Unknown" },
    { projectTimeline: "Yesterday" },
    { referenceUrl: "http://example.com" },
    { referenceUrl: "javascript:alert(1)" },
    { referenceUrl: String.raw`https:\evil.example` },
    { name: "Name\0hidden" },
  ];
  for (const patch of invalid) {
    const context = harness("full");
    const result = await context.submit({ ...fullInput, ...patch });
    assert.equal(result.status, "error");
    assert.deepEqual(context.counts(), { reads: 0, mutations: 0 });
  }
});

test("field boundaries accept exact maxima and reject max plus one", () => {
  const emailAtMaximum = `${"a".repeat(64)}@${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(61)}`;
  const referencePrefix = "https://example.com/";
  const atMaximum = {
    ...fullInput,
    name: "n".repeat(CONTACT_NAME_MAX_LENGTH),
    email: emailAtMaximum,
    phone: "1".repeat(CONTACT_PHONE_MAX_LENGTH),
    projectType: "p".repeat(CONTACT_PROJECT_TYPE_MAX_LENGTH),
    message: "m".repeat(CONTACT_MESSAGE_MAX_LENGTH),
    referenceUrl: referencePrefix + "r".repeat(CONTACT_REFERENCE_URL_MAX_LENGTH - referencePrefix.length),
  };
  assert.equal(contactSchema.safeParse({ ...atMaximum, formContext: "full" }).success, true);
  for (const patch of [
    { name: `${atMaximum.name}n` },
    { email: `${emailAtMaximum}e` },
    { phone: `${atMaximum.phone}1` },
    { projectType: `${atMaximum.projectType}p` },
    { message: `${atMaximum.message}m` },
    { referenceUrl: `${atMaximum.referenceUrl}r` },
  ]) assert.equal(contactSchema.safeParse({ ...atMaximum, ...patch, formContext: "full" }).success, false);
});

test("email trimming, optional fields, HTTPS references, and finite options are preserved", async () => {
  const context = harness("full");
  const result = await context.submit({ ...fullInput, email: "  visitor@example.com  ", phone: "", projectTimeline: "", referenceUrl: "" });
  assert.equal(result.status, "success");
  assert.equal(context.stored[0]?.email, "visitor@example.com");
  assert.equal(context.stored[0]?.phone, null);
  assert.equal(context.stored[0]?.projectTimeline, null);
  assert.equal(context.stored[0]?.referenceUrl, null);
});

test("honeypot blocks mutation without lookup, disclosure, or persistence", async () => {
  const context = harness("full");
  const result = await context.submit({ ...fullInput, honeypot: "https://bot.example" });
  assert.deepEqual(context.counts(), { reads: 0, mutations: 0 });
  assert.equal(result.status, "error");
  assert.equal(result.fieldErrors, undefined);
  assert.doesNotMatch(result.message ?? "", /honeypot|website|bot/i);
  assert.equal(context.stored.length, 0);
});

test("service-read and mutation failures return generic messages without raw details", async () => {
  const detail = "SQL constraint secret-provider-filesystem-detail";
  const readFailure = harness("full", { readError: new Error(detail) });
  const readResult = await readFailure.submit(fullInput);
  assert.equal(readResult.status, "error");
  assert.doesNotMatch(readResult.message ?? "", new RegExp(detail));
  assert.deepEqual(readFailure.counts(), { reads: 1, mutations: 0 });

  const mutationFailure = harness("full", { mutationError: new Error(detail) });
  const mutationResult = await mutationFailure.submit(fullInput);
  assert.equal(mutationResult.status, "error");
  assert.doesNotMatch(mutationResult.message ?? "", new RegExp(detail));
  assert.deepEqual(mutationFailure.counts(), { reads: 1, mutations: 1 });
});

test("unknown and internal-looking properties never enter persisted mutation input", async () => {
  const context = harness("full");
  const result = await context.submit({ ...fullInput, status: "archived", revision: 99, adminId: "attacker" } as RawContactSubmission);
  assert.equal(result.status, "success");
  assert.deepEqual(Object.keys(context.stored[0] ?? {}).sort(), ["budgetRange", "email", "message", "name", "phone", "projectTimeline", "projectType", "referenceUrl", "videoType"].sort());
});

test("trusted popup context ignores a spoofed full discriminator", async () => {
  const context = harness("popup", { services: ["Full Only Service"] });
  const result = await context.submit({
    ...popupInput,
    phone: "",
    projectType: "Full Only Service",
    formContext: "full",
  } as RawContactSubmission);
  assert.equal(result.status, "error");
  assert.deepEqual(context.counts(), { reads: 0, mutations: 0 });
});

test("trusted full context ignores a spoofed popup discriminator", async () => {
  const popupOnly = POPUP_PROJECT_TYPES.find((value) => value !== "Other")!;
  const context = harness("full", { services: ["Video Editing"] });
  const result = await context.submit({ ...fullInput, projectType: popupOnly, formContext: "popup" } as RawContactSubmission);
  assert.equal(result.status, "error");
  assert.deepEqual(context.counts(), { reads: 1, mutations: 0 });
});

test("name minimum and whitespace boundaries use the trusted full policy", async () => {
  for (const name of ["x", "   "]) {
    const context = harness("full");
    const result = await context.submit({ ...fullInput, name });
    assert.equal(result.status, "error");
    assert.deepEqual(context.counts(), { reads: 0, mutations: 0 });
  }
  const context = harness("full");
  const result = await context.submit({ ...fullInput, name: "xy" });
  assert.equal(result.status, "success");
  assert.deepEqual(context.counts(), { reads: 1, mutations: 1 });
});

test("message minimum and whitespace boundaries use the trusted full policy", async () => {
  for (const message of ["123456789", "          "]) {
    const context = harness("full");
    const result = await context.submit({ ...fullInput, message });
    assert.equal(result.status, "error");
    assert.deepEqual(context.counts(), { reads: 0, mutations: 0 });
  }
  const context = harness("full");
  const result = await context.submit({ ...fullInput, message: "1234567890" });
  assert.equal(result.status, "success");
  assert.deepEqual(context.counts(), { reads: 1, mutations: 1 });
});

test("phone rejects controls without rejecting legitimate international punctuation", async () => {
  const invalid = harness("full");
  const invalidResult = await invalid.submit({ ...fullInput, phone: "+91 98765\u000043210" });
  assert.equal(invalidResult.status, "error");
  assert.deepEqual(invalid.counts(), { reads: 0, mutations: 0 });

  const valid = harness("full");
  const validResult = await valid.submit({ ...fullInput, phone: "+44 (0) 20-1234-5678" });
  assert.equal(validResult.status, "success");
  assert.deepEqual(valid.counts(), { reads: 1, mutations: 1 });
});
