import { NextRequest, NextResponse } from "next/server";
import { getSSOSession } from "@/lib/auth";

const SSO_BASE_URL = "https://unigamalang-sso.vercel.app";

interface VercelEnvVar {
  key: string;
  value: string;
  target: string[];
  type: string;
}

export async function POST(req: NextRequest) {
  const session = await getSSOSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { vercelToken, projectName, clientId, clientSecret, redirectUri } = body;

  if (!vercelToken || !projectName || !clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      { error: "Semua field wajib diisi." },
      { status: 400 }
    );
  }

  const envVars: VercelEnvVar[] = [
    { key: "SSO_BASE_URL", value: SSO_BASE_URL, target: ["production", "preview", "development"], type: "plain" },
    { key: "SSO_CLIENT_ID", value: clientId, target: ["production", "preview", "development"], type: "plain" },
    { key: "SSO_CLIENT_SECRET", value: clientSecret, target: ["production", "preview", "development"], type: "encrypted" },
    { key: "SSO_REDIRECT_URI", value: redirectUri, target: ["production", "preview", "development"], type: "plain" },
  ];

  const results: string[] = [];
  const errors: string[] = [];

  for (const env of envVars) {
    try {
      // Try to create first
      const createRes = await fetch(
        `https://api.vercel.com/v10/projects/${projectName}/env`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${vercelToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(env),
        }
      );

      if (createRes.ok) {
        results.push(`${env.key} — berhasil ditambahkan`);
      } else {
        const errData = await createRes.json();
        // If already exists, try to update via PATCH
        if (errData.error?.code === "ENV_ALREADY_EXISTS") {
          // Get existing env var ID
          const listRes = await fetch(
            `https://api.vercel.com/v9/projects/${projectName}/env`,
            {
              headers: { Authorization: `Bearer ${vercelToken}` },
            }
          );
          if (listRes.ok) {
            const listData = await listRes.json();
            const existing = listData.envs?.find(
              (e: { key: string }) => e.key === env.key
            );
            if (existing) {
              const patchRes = await fetch(
                `https://api.vercel.com/v9/projects/${projectName}/env/${existing.id}`,
                {
                  method: "PATCH",
                  headers: {
                    Authorization: `Bearer ${vercelToken}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ value: env.value, target: env.target, type: env.type }),
                }
              );
              if (patchRes.ok) {
                results.push(`${env.key} — berhasil diperbarui`);
              } else {
                errors.push(`${env.key} — gagal diperbarui`);
              }
            }
          }
        } else {
          errors.push(`${env.key} — ${errData.error?.message || "gagal"}`);
        }
      }
    } catch {
      errors.push(`${env.key} — error jaringan`);
    }
  }

  if (errors.length > 0 && results.length === 0) {
    return NextResponse.json(
      { error: `Gagal memasang env vars: ${errors.join(", ")}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message:
      errors.length > 0
        ? `Sebagian berhasil (${results.length}/${envVars.length})`
        : `Semua ${results.length} environment variables berhasil dipasang!`,
    details: [...results, ...errors.map((e) => `⚠️ ${e}`)],
  });
}
