import { useRef } from "react";
import { useProfile } from "../../store";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../components/ui/Toast";
import { downloadTextFile, safeSlug } from "../../lib/export";
import { exportDraftJson, parseImportedDraft } from "../../lib/draftFile";

/**
 * Export the whole document to a portable JSON file, or import one back.
 *
 * Import runs the same defensive coercion used for local drafts, so a
 * partial or slightly-older file still loads. The current document is used as
 * the fallback for any field the imported file is missing.
 */
export function DraftFileEditor() {
  const { state, dispatch } = useProfile();
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  const exportJson = () => {
    try {
      const filename = `${safeSlug(state.basics.username)}-readcraft.json`;
      downloadTextFile(
        exportDraftJson(state),
        filename,
        "application/json;charset=utf-8"
      );
      toast.success(`Exported ${filename}`);
    } catch {
      toast.error("Export failed. Please try again.");
    }
  };

  const pickFile = () => fileInput.current?.click();

  const onFileChosen = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset the input so choosing the same file again still fires onChange.
    event.target.value = "";
    if (!file) return;

    try {
      const text = await file.text();
      const { state: imported, migrated } = parseImportedDraft(text, state);
      dispatch({ type: "hydrate", state: imported });
      toast.success(
        migrated
          ? "Draft imported and upgraded to the latest format."
          : "Draft imported."
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Couldn't read that file.";
      toast.error(message);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-body-sm text-on-surface-variant">
        Save your whole document as a JSON file to back it up or move it between
        machines, then import it here to pick up where you left off.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" icon="file_download" onClick={exportJson}>
          Export JSON
        </Button>
        <Button
          size="sm"
          variant="secondary"
          icon="file_upload"
          onClick={pickFile}
        >
          Import JSON
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={onFileChosen}
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>
      <p className="text-code-sm text-on-surface-variant">
        Importing replaces the current document. Older files are upgraded
        automatically.
      </p>
    </div>
  );
}
