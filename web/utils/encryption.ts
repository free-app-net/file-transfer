export class Encryptor {
  private key: CryptoKey | null = null;

  constructor(private secret: string) {}

  private async getKey(): Promise<CryptoKey> {
    if (this.key) return this.key;

    const encoder = new TextEncoder();
    const keyBuffer = encoder.encode(this.secret);

    const hash = await crypto.subtle.digest("SHA-256", keyBuffer);

    this.key = await crypto.subtle.importKey(
      "raw",
      hash,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"],
    );

    return this.key;
  }

  async encrypt(obj: unknown): Promise<string> {
    const str = JSON.stringify(obj);
    const data = new TextEncoder().encode(str);
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      await this.getKey(),
      data,
    );

    const combined = new Uint8Array(12 + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), 12);

    return btoa(String.fromCharCode(...combined));
  }

  async decrypt(cipherText: string): Promise<unknown> {
    const combined = Uint8Array.from(atob(cipherText), (c) => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      await this.getKey(),
      data,
    );

    return JSON.parse(new TextDecoder().decode(decrypted));
  }
}
