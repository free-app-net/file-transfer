export type TransferStats = {
  currentIndex: number;
  totalFiles: number;
  transferredBytes: number;
  totalBytes: number;
};

export function zeroTransferStats(): TransferStats {
  return transferStatsFromFiles([]);
}

export function transferStatsFromFiles(files: File[]): TransferStats {
  return {
    currentIndex: 0,
    totalFiles: files.length,
    transferredBytes: 0,
    totalBytes: files.reduce((acc, file) => acc + file.size, 0),
  };
}
