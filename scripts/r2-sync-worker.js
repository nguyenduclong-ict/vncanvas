// R2 Sync Worker - runs with `wrangler dev --local`
// Uses AWS Signature v4 for S3-compatible API

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Config from env
    const R2_S3_API = env.R2_S3_API;
    const ACCESS_KEY_ID = env.R2_ACCESS_KEY_ID;
    const SECRET_ACCESS_KEY = env.R2_SECRET_ACCESS_KEY;
    const BUCKET_NAME = "vncanvas-storage";

    if (!R2_S3_API || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
      return new Response(
        "Missing R2_S3_API, R2_ACCESS_KEY_ID, or R2_SECRET_ACCESS_KEY",
        { status: 500 }
      );
    }

    const s3Client = new S3Client(
      R2_S3_API,
      ACCESS_KEY_ID,
      SECRET_ACCESS_KEY,
      BUCKET_NAME
    );

    // Handle /_sync endpoint
    if (url.pathname === "/_sync") {
      const diffOnly = url.searchParams.get("diff") === "true";
      const direction = url.searchParams.get("direction") || "local-to-remote";

      try {
        let result;
        if (direction === "remote-to-local") {
          result = await syncR2RemoteToLocal(env.STORAGE, s3Client, diffOnly);
        } else {
          result = await syncR2LocalToRemote(env.STORAGE, s3Client, diffOnly);
        }

        return new Response(JSON.stringify(result, null, 2), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (e) {
        return new Response(`Sync error: ${e.message}`, { status: 500 });
      }
    }

    // Handle /_list for debugging
    if (url.pathname === "/_list") {
      const list = await env.STORAGE.list({ limit: 1000 });
      return new Response(JSON.stringify(list), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      "Use /_sync?diff=true&direction=local-to-remote (default) or direction=remote-to-local",
      { status: 200 }
    );
  },
};

// Simple S3 Client with AWS Sig v4
class S3Client {
  constructor(endpoint, accessKeyId, secretAccessKey, bucket) {
    // endpoint should be like: https://xxxxx.r2.cloudflarestorage.com
    this.endpoint = endpoint.endsWith("/") ? endpoint.slice(0, -1) : endpoint;
    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    this.bucket = bucket;
    this.region = "auto";
    this.service = "s3";
  }

  async listObjects() {
    const keys = [];
    let continuationToken;

    do {
      const params = new URLSearchParams({
        "list-type": "2",
        "max-keys": "1000",
      });
      if (continuationToken)
        params.set("continuation-token", continuationToken);

      const url = `${this.endpoint}/${this.bucket}?${params}`;
      const res = await this.signedFetch(url, "GET");

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`List failed ${res.status}: ${text}`);
      }

      const xml = await res.text();
      const keyMatches = xml.matchAll(/<Key>([^<]+)<\/Key>/g);
      for (const match of keyMatches) {
        keys.push(match[1]);
      }

      const truncatedMatch = xml.match(
        /<IsTruncated>(true|false)<\/IsTruncated>/
      );
      const isTruncated = truncatedMatch?.[1] === "true";
      const tokenMatch = xml.match(
        /<NextContinuationToken>([^<]+)<\/NextContinuationToken>/
      );
      continuationToken = isTruncated ? tokenMatch?.[1] : undefined;
    } while (continuationToken);

    return keys;
  }

  async getObject(key) {
    const url = `${this.endpoint}/${this.bucket}/${key}`;
    const res = await this.signedFetch(url, "GET");
    if (!res.ok) return null;

    // Convert ArrayBuffer to Uint8Array for easy handling
    const arrayBuffer = await res.arrayBuffer();
    return {
      body: new Uint8Array(arrayBuffer),
      contentType: res.headers.get("content-type"),
    };
  }

  async putObject(key, body, contentType) {
    const url = `${this.endpoint}/${this.bucket}/${key}`;
    const res = await this.signedFetch(url, "PUT", body, contentType);
    return res;
  }

  async signedFetch(url, method, body, contentType) {
    const parsedUrl = new URL(url);
    const datetime = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
    const date = datetime.slice(0, 8);

    // Always use UNSIGNED-PAYLOAD for body - streams can't be hashed
    const headers = {
      host: parsedUrl.host,
      "x-amz-date": datetime,
      "x-amz-content-sha256": "UNSIGNED-PAYLOAD",
    };

    if (contentType) headers["content-type"] = contentType;

    const signedHeaders = Object.keys(headers).sort().join(";");
    const canonicalHeaders = Object.keys(headers)
      .sort()
      .map((k) => `${k}:${headers[k]}`)
      .join("\n");

    const canonicalRequest = [
      method,
      parsedUrl.pathname,
      parsedUrl.search.slice(1),
      canonicalHeaders + "\n",
      signedHeaders,
      headers["x-amz-content-sha256"],
    ].join("\n");

    const scope = `${date}/${this.region}/${this.service}/aws4_request`;
    const stringToSign = [
      "AWS4-HMAC-SHA256",
      datetime,
      scope,
      await this.sha256Hex(canonicalRequest),
    ].join("\n");

    const kDate = await this.hmac("AWS4" + this.secretAccessKey, date);
    const kRegion = await this.hmac(kDate, this.region);
    const kService = await this.hmac(kRegion, this.service);
    const kSigning = await this.hmac(kService, "aws4_request");
    const signature = await this.hmacHex(kSigning, stringToSign);

    const authorization = `AWS4-HMAC-SHA256 Credential=${this.accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const fetchHeaders = { ...headers, authorization };
    delete fetchHeaders.host;

    return fetch(url, {
      method,
      headers: fetchHeaders,
      body: body || undefined,
    });
  }

  async sha256Hex(data) {
    const buffer =
      typeof data === "string" ? new TextEncoder().encode(data) : data;
    const hash = await crypto.subtle.digest("SHA-256", buffer);
    return [...new Uint8Array(hash)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  async hmac(key, data) {
    const keyBuffer =
      typeof key === "string" ? new TextEncoder().encode(key) : key;
    const dataBuffer = new TextEncoder().encode(data);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBuffer,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    return new Uint8Array(
      await crypto.subtle.sign("HMAC", cryptoKey, dataBuffer)
    );
  }

  async hmacHex(key, data) {
    const result = await this.hmac(key, data);
    return [...result].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
}

async function syncR2LocalToRemote(storage, s3Client, diffOnly) {
  // 1. List local keys
  const localKeys = [];
  let cursor;
  do {
    const list = await storage.list({ limit: 1000, cursor });
    for (const obj of list.objects) {
      if (!obj.key.includes("DEBUG_LOCATOR")) {
        localKeys.push(obj.key);
      }
    }
    cursor = list.truncated ? list.cursor : undefined;
  } while (cursor);

  // 2. List remote keys if diff mode
  let keysToSync = localKeys;
  if (diffOnly) {
    const remoteKeys = await s3Client.listObjects();
    const remoteSet = new Set(remoteKeys);
    keysToSync = localKeys.filter((k) => !remoteSet.has(k));
  }

  // 3. Upload with batch size = 4
  let successCount = 0;
  let failCount = 0;
  const errors = [];
  const total = keysToSync.length;
  const BATCH_SIZE = 4;

  for (let i = 0; i < keysToSync.length; i += BATCH_SIZE) {
    const batch = keysToSync.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (key) => {
        try {
          const object = await storage.get(key);
          if (!object) {
            errors.push({ key, error: "Not found in local" });
            failCount++;
            return;
          }

          const res = await s3Client.putObject(
            key,
            object.body,
            object.httpMetadata?.contentType || "application/octet-stream"
          );

          if (res.ok) {
            successCount++;
            console.log(`[${successCount + failCount}/${total}] ✓ ${key}`);
          } else {
            const text = await res.text();
            errors.push({ key, error: `${res.status}: ${text}` });
            failCount++;
            console.log(
              `[${successCount + failCount}/${total}] ✗ ${key}`,
              text
            );
          }
        } catch (e) {
          errors.push({ key, error: e.message });
          failCount++;
          console.log(
            `[${successCount + failCount}/${total}] ✗ ${key}: ${e.message}`
          );
        }
      })
    );
  }

  return {
    mode: diffOnly ? "diff-only" : "full",
    direction: "local-to-remote",
    localTotal: localKeys.length,
    toSync: keysToSync.length,
    success: successCount,
    failed: failCount,
    errors: errors.slice(0, 10),
  };
}

async function syncR2RemoteToLocal(storage, s3Client, diffOnly) {
  // 1. List remote keys
  const remoteKeys = await s3Client.listObjects();

  // 2. List local keys if diff mode
  let keysToSync = remoteKeys;
  if (diffOnly) {
    const localKeys = [];
    let cursor;
    do {
      const list = await storage.list({ limit: 1000, cursor });
      for (const obj of list.objects) {
        if (!obj.key.includes("DEBUG_LOCATOR")) {
          localKeys.push(obj.key);
        }
      }
      cursor = list.truncated ? list.cursor : undefined;
    } while (cursor);

    const localSet = new Set(localKeys);
    keysToSync = remoteKeys.filter((k) => !localSet.has(k));
  }

  // 3. Download and save
  let successCount = 0;
  let failCount = 0;
  const errors = [];
  const total = keysToSync.length;
  const BATCH_SIZE = 4;

  for (let i = 0; i < keysToSync.length; i += BATCH_SIZE) {
    const batch = keysToSync.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (key) => {
        try {
          const object = await s3Client.getObject(key);
          if (!object) {
            // If it is gone from remote between list and get, ignore
            errors.push({ key, error: "Not found in remote" });
            failCount++;
            return;
          }

          // Write to local R2 binding
          await storage.put(key, object.body, {
            httpMetadata: { contentType: object.contentType },
          });

          successCount++;
          console.log(`[${successCount + failCount}/${total}] ✓ ${key}`);
        } catch (e) {
          errors.push({ key, error: e.message });
          failCount++;
          console.log(
            `[${successCount + failCount}/${total}] ✗ ${key}: ${e.message}`
          );
        }
      })
    );
  }

  return {
    mode: diffOnly ? "diff-only" : "full",
    direction: "remote-to-local",
    remoteTotal: remoteKeys.length,
    toSync: keysToSync.length,
    success: successCount,
    failed: failCount,
    errors: errors.slice(0, 10),
  };
}
