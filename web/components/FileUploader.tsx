type Props = {
  onSelect: (files: File[]) => void;
  enabled: boolean;
};

export function FileUploader({ onSelect, enabled }: Props) {
  function onFilesSelect(fileList: FileList) {
    if (!enabled) return;
    onSelect(Array.from(fileList));
  }

  return (
    <div className="actions-row">
      <div className="action-group">
        <label className="action-group__label" htmlFor="upload-files">
          Upload Files
        </label>
        <div className={`file-input-wrapper`}>
          <input
            id="upload-files"
            data-testid="upload-files-input"
            type="file"
            disabled={!enabled}
            multiple
            onChange={(e) =>
              e.currentTarget.files && onFilesSelect(e.currentTarget.files)
            }
          />
        </div>
      </div>

      <div className="action-group">
        <label className="action-group__label" htmlFor="upload-folder">
          Upload Folder
        </label>
        <div className={`file-input-wrapper`}>
          <input
            id="upload-folder"
            type="file"
            disabled={!enabled}
            multiple
            {...({
              webkitdirectory: true,
              mozdirectory: true,
              directory: true,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any)}
            onChange={(e) =>
              e.currentTarget.files && onFilesSelect(e.currentTarget.files)
            }
          />
        </div>
      </div>
    </div>
  );
}
