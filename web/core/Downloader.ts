import { ValueSubscriber } from "../utils/ValueSubscriber";
import { TRANSFER_PROGRESS_EVERY_MS } from "./consts";
import { PeerMessage, TransferStatus } from "./protocol";
import { TransferProgress } from "./TransferSpeed";
import { PeerChannel } from "./WebRTC/types";

export class Downloader {
  status = new ValueSubscriber<TransferStatus>("idle");

  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;

  private speed = new TransferProgress();

  constructor(
    private peerChannel: PeerChannel,
    private getWriter: (
      downloadSizeBytes: number,
    ) => WritableStreamDefaultWriter<Uint8Array<ArrayBufferLike>>,
  ) {
    peerChannel.listenOnMessage((msg) => {
      this.onPeerMessage(msg);
    });
  }

  getSpeed() {
    return this.speed.value;
  }

  private isAborted() {
    return this.status.value === "aborted";
  }

  start() {
    if (this.status.value === "done") {
      this.status.setValue("idle");
    }

    if (this.status.value === "transfer") {
      throw new Error(
        "Cannot start a transfer while it's already in progress (bad status)",
      );
    }
    if (this.writer) {
      throw new Error(
        "Cannot start a transfer while it's already in progress (bad writer)",
      );
    }

    this.peerChannel.write({ type: "transfer-start" });
  }

  async abort() {
    if (this.status.value !== "transfer") {
      throw new Error(`Cannot abort a non-downloading transfer (bad status)`);
    }

    this.peerChannel.write({ type: "transfer-abort" });
    this.internalAbort();
  }

  private onPeerMessage(message: PeerMessage) {
    switch (message.type) {
      case "transfer-start": {
        // no-op, we send this
        break;
      }
      case "transfer-started": {
        if (this.status.value === "transfer") {
          throw new Error(
            "Cannot start a transfer while it's already in progress (bad status)",
          );
        }
        if (this.writer) {
          throw new Error(
            "Cannot start a transfer while it's already in progress (writer exists)",
          );
        }

        this.status.setValue("transfer");

        this.writer = this.getWriter(message.value.transferSizeBytes);

        this.speed.reset(message.value.transferSizeBytes);
        this.speed.startInterval(TRANSFER_PROGRESS_EVERY_MS);

        break;
      }

      case "transfer-chunk": {
        if (this.isAborted()) {
          return;
        }
        if (this.status.value !== "transfer") {
          throw new Error("Cannot receive a chunk while not downloading");
        }
        if (!this.writer) {
          throw new Error("Cannot receive a chunk without a writer");
        }

        this.speed.pushDelta(message.value.length);
        this.writer.write(message.value);

        break;
      }
      case "transfer-done": {
        if (this.status.value !== "transfer") {
          throw new Error("Cannot complete a transfer (bad status)");
        }
        if (!this.writer) {
          throw new Error("Cannot complete a transfer (no writer)");
        }

        this.status.setValue("done");
        this.speed.done();

        this.writer.close().then(() => {
          this.writer = null;
        });

        break;
      }
      case "transfer-abort":
        {
          if (this.status.value !== "transfer") {
            return;
          }
          this.internalAbort();
        }
        break;

      case "preview-content":
        // files have changed, so reset the UI
        this.status.setValue("idle");
        break;

      default:
        throw new Error(`Unknown message type`);
    }

    // Handle data
  }

  private async done() {
    this.speed.done();
    this.status.setValue("done");

    if (!this.writer) {
      throw new Error("Cannot complete a transfer without a writer");
    }
    await this.writer.close();
    this.writer = null;
  }

  private async internalAbort() {
    if (!this.writer) {
      throw new Error("Cannot abort a non-downloading transfer (no writer)");
    }

    this.status.setValue("aborted");
    this.speed.reset();

    this.writer.abort().then(() => {
      this.writer = null;
    });
  }

  dispose() {
    this.status.dispose();
  }
}
