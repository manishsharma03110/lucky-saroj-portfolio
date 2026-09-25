import { test } from "node:test";
import assert from "node:assert/strict";
import { isContactAttachmentUrl } from "./contact";
test("attachment references require an HTTPS public Blob host and attachment path",()=>{
  assert.equal(isContactAttachmentUrl('https://store.public.blob.vercel-storage.com/contact-attachments/test.png'),true);
  for(const value of ['https://evil.example/blob.vercel-storage.com/contact-attachments/test.png','https://store.public.blob.vercel-storage.com.evil.example/contact-attachments/test.png','http://store.public.blob.vercel-storage.com/contact-attachments/test.png','https://user:pass@store.public.blob.vercel-storage.com/contact-attachments/test.png','https://store.public.blob.vercel-storage.com/elsewhere/test.png']) assert.equal(isContactAttachmentUrl(value),false);
});
