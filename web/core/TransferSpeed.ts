export type TransferSpeedValue = {
  speedBytesPerSecond: number;
  remainingSeconds: number;
};

// TODO: start with 0, and lerp to 0.5
const SMOOTHING_FACTOR = 0.5;

export class TransferSpeed {
  lastTimeMs = 0;
  lastTransferredBytes = 0;
  totalBytes = 0;

  averageSpeed = 0;
  remainingSeconds = 0;

  get value(): TransferSpeedValue | null {
    if (this.averageSpeed === 0 && this.remainingSeconds === 0) {
      return null;
    }

    return {
      speedBytesPerSecond: this.averageSpeed,
      remainingSeconds: this.remainingSeconds,
    };
  }

  reset(totalBytes: number) {
    this.lastTimeMs = 0;
    this.lastTransferredBytes = 0;
    this.totalBytes = totalBytes;

    this.averageSpeed = 0;
    this.remainingSeconds = 0;
  }

  tick(transferredBytes: number): void {
    const timeMs = new Date().getTime() / 1000;
    if (this.lastTimeMs === 0) {
      this.lastTimeMs = timeMs;
      this.lastTransferredBytes = transferredBytes;
      return;
    }

    const timeDelta = timeMs - this.lastTimeMs;
    const byteDelta = transferredBytes - this.lastTransferredBytes;
    const speed = timeDelta > 0 ? byteDelta / timeDelta : 0;

    this.lastTimeMs = timeMs;
    this.lastTransferredBytes = transferredBytes;

    this.averageSpeed =
      SMOOTHING_FACTOR * this.averageSpeed + (1 - SMOOTHING_FACTOR) * speed;

    const remainingSeconds =
      (this.totalBytes - transferredBytes) / this.averageSpeed;

    this.remainingSeconds = remainingSeconds;
  }
}
