import crypto from "crypto";

const OSS_CONFIG = {
  region: process.env.OSS_REGION || "oss-cn-hangzhou",
  accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID || "",
  accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET || "",
  bucket: process.env.OSS_BUCKET || "tripplan",
};

const CDN_DOMAIN = process.env.OSS_CDN_DOMAIN || "";

export interface OssUploadPolicy {
  policy: string;
  signature: string;
  accessKeyId: string;
  host: string;
  key: string;
  expire: number;
  cdnUrl: string;
}

export function generateUploadPolicy(
  userId: string,
  fileName: string,
  fileType: string
): OssUploadPolicy {
  const { region, accessKeyId, accessKeySecret, bucket } = OSS_CONFIG;
  const host = `https://${bucket}.${region}.aliyuncs.com`;

  const date = new Date().toISOString().split("T")[0];
  const ext = fileName.split(".").pop() || "file";
  const key = `uploads/${userId}/${date}/${crypto.randomUUID()}.${ext}`;

  const expire = Math.floor(Date.now() / 1000) + 3600; // 1 hour
  const policyObj = {
    expiration: new Date(expire * 1000).toISOString(),
    conditions: [
      { bucket },
      ["starts-with", "$key", `uploads/${userId}/`],
      ["content-length-range", 0, 10485760], // 10MB max
    ],
  };
  const policy = Buffer.from(JSON.stringify(policyObj)).toString("base64");
  const signature = crypto
    .createHmac("sha1", accessKeySecret)
    .update(policy)
    .digest("base64");

  const cdnUrl = CDN_DOMAIN
    ? `${CDN_DOMAIN}/${key}`
    : `https://${bucket}.${region}.aliyuncs.com/${key}`;

  return {
    policy,
    signature,
    accessKeyId,
    host,
    key,
    expire,
    cdnUrl,
  };
}
