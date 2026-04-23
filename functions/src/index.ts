import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";

admin.initializeApp();
admin.firestore().settings({ ignoreUndefinedProperties: true });

setGlobalOptions({
  region: "us-central1",
  memory: "512MiB",
  timeoutSeconds: 60,
  concurrency: 10,
  maxInstances: 10,
});

import { draftEmailHandler } from "./handlers/draftEmail";
import { regenerateWithFeedbackHandler } from "./handlers/regenerateWithFeedback";
import { logEditHandler } from "./handlers/logEdit";
import { cancelDraftHandler } from "./handlers/cancelDraft";
import { getVoiceProfileHandler, updateVoiceProfileHandler } from "./handlers/voiceProfile";
import { bootstrapSubmitHandler } from "./handlers/bootstrap";
import { initUserHandler } from "./handlers/initUser";
import { runDraftHandler } from "./handlers/runDraft";
import { extractReferenceHandler } from "./handlers/extractReference";

const SECRETS = ["ANTHROPIC_API_KEY"] as const;

export const draftEmail = onRequest({}, draftEmailHandler);
export const regenerateWithFeedback = onRequest({ secrets: [...SECRETS] }, regenerateWithFeedbackHandler);
export const logEdit = onRequest({}, logEditHandler);
export const cancelDraft = onRequest({}, cancelDraftHandler);
export const getVoiceProfile = onRequest({}, getVoiceProfileHandler);
export const updateVoiceProfile = onRequest({}, updateVoiceProfileHandler);
export const bootstrapSubmit = onRequest({}, bootstrapSubmitHandler);
export const initUser = onRequest({}, initUserHandler);
export const extractReference = onRequest(
  { secrets: [...SECRETS], memory: "1GiB", timeoutSeconds: 120 },
  extractReferenceHandler,
);

export const runDraft = runDraftHandler;
