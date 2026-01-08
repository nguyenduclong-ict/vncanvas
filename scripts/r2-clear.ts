import { spawn } from "child_process";
import readline from "readline";
import dotenv from "dotenv";

dotenv.config();

const R2_S3_API = process.env.R2_S3_API;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET_NAME = "vncanvas-storage";

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function listRemoteKeys(): Promise<string[]> {
  if (!R2_S3_API || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    throw new Error(
      "Missing R2_S3_API, R2_ACCESS_KEY_ID, or R2_SECRET_ACCESS_KEY"
    );
  }

  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const url = new URL(`${R2_S3_API}/${BUCKET_NAME}`);
    url.searchParams.set("list-type", "2");
    url.searchParams.set("max-keys", "1000");
    if (continuationToken) {
      url.searchParams.set("continuation-token", continuationToken);
    }

    const res = await signedFetch(url.toString(), "GET");
    if (!res.ok) {
      throw new Error(`List failed: ${res.status}`);
    }

    const xml = await res.text();
    const keyMatches = [...xml.matchAll(/<Key>([^<]+)<\/Key>/g)];
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

async function deleteObject(key: string): Promise<boolean> {
  const url = `${R2_S3_API}/${BUCKET_NAME}/${key}`;
  const res = await signedFetch(url, "DELETE");
  return res.ok;
}

// AWS Signature V4 helpers
async function signedFetch(url: string, method: string): Promise<Response> {
  const parsedUrl = new URL(url);
  const datetime = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const date = datetime.slice(0, 8);
  const region = "auto";
  const service = "s3";

  const headers: Record<string, string> = {
    host: parsedUrl.host,
    "x-amz-date": datetime,
    "x-amz-content-sha256": "UNSIGNED-PAYLOAD",
  };

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
    "UNSIGNED-PAYLOAD",
  ].join("\n");

  const scope = `${date}/${region}/${service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    datetime,
    scope,
    await sha256Hex(canonicalRequest),
  ].join("\n");

  const kDate = await hmac("AWS4" + R2_SECRET_ACCESS_KEY!, date);
  const kRegion = await hmac(kDate, region);
  const kService = await hmac(kRegion, service);
  const kSigning = await hmac(kService, "aws4_request");
  const signature = await hmacHex(kSigning, stringToSign);

  const authorization = `AWS4-HMAC-SHA256 Credential=${R2_ACCESS_KEY_ID}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const fetchHeaders: Record<string, string> = { ...headers, authorization };
  delete fetchHeaders.host;

  return fetch(url, { method, headers: fetchHeaders });
}

async function sha256Hex(data: string): Promise<string> {
  const buffer = new TextEncoder().encode(data);
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  return [...new Uint8Array(hash)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmac(
  key: string | Uint8Array,
  data: string
): Promise<Uint8Array> {
  const keyBuffer =
    typeof key === "string" ? new TextEncoder().encode(key) : key;
  const dataBuffer = new TextEncoder().encode(data);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return new Uint8Array(
    await crypto.subtle.sign("HMAC", cryptoKey, dataBuffer)
  );
}

async function hmacHex(key: Uint8Array, data: string): Promise<string> {
  const result = await hmac(key, data);
  return [...result].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function main() {
  console.log("🗑️  R2 Bucket Clear Script");
  console.log(`📦 Bucket: ${BUCKET_NAME}`);
  console.log(
    "⚠️  WARNING: This will DELETE ALL objects in the remote bucket!\n"
  );

  // List objects
  console.log("📋 Fetching object list...");
  const keys = await listRemoteKeys();
  console.log(`Found ${keys.length} objects.\n`);

  if (keys.length === 0) {
    console.log("✅ Bucket is already empty.");
    return;
  }

  // Show sample
  console.log("Sample objects:");
  keys.slice(0, 5).forEach((k) => console.log(`  - ${k}`));
  if (keys.length > 5) console.log(`  ... and ${keys.length - 5} more\n`);

  // Confirm
  const answer = await prompt(
    `Type "DELETE" to confirm deletion of ${keys.length} objects: `
  );
  if (answer !== "delete") {
    console.log("❌ Aborted.");
    return;
  }

  // Delete
  console.log("\n🗑️  Deleting objects...");
  let deleted = 0;
  let failed = 0;

  for (const key of keys) {
    const ok = await deleteObject(key);
    if (ok) {
      deleted++;
      process.stdout.write(".");
    } else {
      failed++;
      process.stdout.write("x");
    }
  }

  console.log(`\n\n✅ Done. Deleted: ${deleted}, Failed: ${failed}`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
