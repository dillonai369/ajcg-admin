/**
 * Audit trail for admin changes.
 *
 * The `activity` table and the dashboard's "Recent activity" panel have always
 * had icons for listing / broker / post events, but only lead events were ever
 * written — so "who changed this listing?" and "who deleted that one?" had no
 * answer. Every content create / update / delete now records who did it.
 *
 * Runs after the response is sent (Next's after()), and never throws: a failed
 * log line must not fail the save it describes.
 */
import { after } from "next/server";
import { logActivity } from "./data";

export function audit(
  kind: string,
  entity: string,
  actor: string,
  summary: string,
  metadata?: Record<string, unknown>,
): void {
  after(() => logActivity({ kind, entity, actor, summary, metadata }).catch(() => {}));
}
