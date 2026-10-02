/**
 * Pick files, upload them, hand back the attachment ids (CC-02).
 *
 * The component owns the upload, not the form. By the time the form submits,
 * every file is already in storage and all it carries is a list of ids — so a
 * slow upload never blocks the submit button, and a failed one never takes the
 * whole form down with it.
 */

import { useRef, useState } from "react";
import { Button, message } from "antd";
import { FileText, Loader2, Paperclip, X } from "lucide-react";
import {
  MAX_ATTACHMENTS_PER_ENTITY,
  ALLOWED_MIME,
  type AttachmentEntity,
  uploadFile,
  validateFile,
} from "@/api/uploads";
import { stripImageMetadata } from "@/lib/stripImageMetadata";

/** One file in the tray. `id` is set once the upload succeeds. */
interface PendingFile {
  key: string;
  name: string;
  sizeBytes: number;
  previewUrl: string | null;
  progress: number;
  id: string | null;
  error: string | null;
}

interface Props {
  entityType: AttachmentEntity;
  /** Called whenever the set of successfully uploaded ids changes. */
  onChange: (attachmentIds: string[]) => void;
  disabled?: boolean;
  max?: number;
}

const formatSize = (bytes: number): string =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

export const AttachmentUploader = ({
  entityType,
  onChange,
  disabled = false,
  max = MAX_ATTACHMENTS_PER_ENTITY,
}: Props) => {
  const [files, setFiles] = useState<PendingFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const publish = (next: PendingFile[]) => {
    setFiles(next);
    onChange(
      next.map((file) => file.id).filter((id): id is string => Boolean(id)),
    );
  };

  const update = (key: string, patch: Partial<PendingFile>) =>
    setFiles((current) => {
      const next = current.map((file) =>
        file.key === key ? { ...file, ...patch } : file,
      );
      onChange(
        next.map((file) => file.id).filter((id): id is string => Boolean(id)),
      );
      return next;
    });

  const handleFiles = async (selected: FileList | null) => {
    if (!selected || selected.length === 0) return;

    const room = max - files.length;
    if (room <= 0) {
      message.warning(`You can attach at most ${max} files.`);
      return;
    }

    const chosen = Array.from(selected).slice(0, room);
    if (chosen.length < selected.length) {
      message.warning(`Only the first ${room} file(s) were added.`);
    }

    // Kept as pairs rather than two parallel arrays: a rejected file shifts the
    // indices, and uploading entry N against file N would then send the wrong
    // bytes under the wrong name.
    const accepted: Array<{ entry: PendingFile; file: File }> = [];

    // CC-30: strip metadata BEFORE anything else looks at the file.
    //
    // Order matters twice over. The re-encode changes the type (HEIC becomes
    // JPEG) and the size, so validating first would check a file we are not
    // going to upload - passing a HEIC that the server then never sees, and
    // rejecting a 6 MB photo that would have come in under the cap once
    // re-encoded.
    let anyKept = false;

    for (const original of chosen) {
      const { file, stripped } = await stripImageMetadata(original);
      if (original.type.startsWith("image/") && !stripped) anyKept = true;

      const problem = validateFile(file);
      if (problem) {
        message.error(problem);
        continue;
      }

      accepted.push({
        file,
        entry: {
          key: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
          name: file.name,
          sizeBytes: file.size,
          // Object URLs are revoked on removal and unmount; an image preview
          // without one would mean reading the whole file into memory.
          previewUrl: file.type.startsWith("image/")
            ? URL.createObjectURL(file)
            : null,
          progress: 0,
          id: null,
          error: null,
        },
      });
    }

    // Said once per batch, not per file. The student cannot fix this - the
    // browser could not decode their image - but they can decide whether to
    // upload a photo whose location data is still attached.
    if (anyKept) {
      message.warning(
        "One image could not be processed, so any location data in it will " +
          "be uploaded as-is.",
      );
    }

    if (accepted.length === 0) return;

    publish([...files, ...accepted.map(({ entry }) => entry)]);

    await Promise.all(
      accepted.map(async ({ entry, file }) => {
        try {
          const id = await uploadFile(entityType, file, (percent) =>
            update(entry.key, { progress: percent }),
          );
          update(entry.key, { id, progress: 100, error: null });
        } catch (e) {
          update(entry.key, {
            error: e instanceof Error ? e.message : "Upload failed",
          });
        }
      }),
    );
  };

  const remove = (key: string) => {
    const target = files.find((file) => file.key === key);
    if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
    publish(files.filter((file) => file.key !== key));
  };

  const atCapacity = files.length >= max;

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ALLOWED_MIME.join(",")}
        className="hidden"
        onChange={(event) => {
          void handleFiles(event.target.files);
          // Reset so re-picking the same file fires onChange again.
          event.target.value = "";
        }}
      />

      <Button
        icon={<Paperclip className="h-4 w-4" />}
        onClick={() => inputRef.current?.click()}
        disabled={disabled || atCapacity}
      >
        {atCapacity ? `Maximum ${max} files` : "Add photo or PDF"}
      </Button>

      <p className="text-xs text-muted-foreground">
        JPG, PNG, WebP, HEIC or PDF. Up to 5 MB each. A photo usually explains
        the problem faster than a description. Location and camera data are
        removed from photos before they are uploaded.
      </p>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file) => (
            <li
              key={file.key}
              className="flex items-center gap-3 rounded-md border p-2"
            >
              {file.previewUrl ? (
                <img
                  src={file.previewUrl}
                  alt=""
                  className="h-10 w-10 rounded object-cover"
                />
              ) : (
                <FileText className="h-10 w-10 p-2 text-muted-foreground" />
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {file.error ? (
                    <span className="text-destructive">{file.error}</span>
                  ) : file.id ? (
                    formatSize(file.sizeBytes)
                  ) : (
                    `Uploading… ${file.progress}%`
                  )}
                </p>
              </div>

              {!file.id && !file.error && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}

              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() => remove(file.key)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AttachmentUploader;
