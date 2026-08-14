// Helper upload ke Google Drive via multipart request langsung dari browser,
// memakai access token yang didapat dari lib/googleAuth.ts (scope drive.file).

const BOUNDARY = "-------singkatin-boundary-314159265358979";

async function multipartUpload(accessToken: string, metadata: Record<string, unknown>, mimeType: string, body: string): Promise<{ id: string; webViewLink: string }> {
  const delimiter = `\r\n--${BOUNDARY}\r\n`;
  const closeDelim = `\r\n--${BOUNDARY}--`;

  const multipartBody =
    delimiter +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n` +
    "Content-Transfer-Encoding: base64\r\n\r\n" +
    body +
    closeDelim;

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${BOUNDARY}`,
      },
      body: multipartBody,
    }
  );

  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.error?.message || "Gagal mengunggah ke Google Drive.");
  }

  return res.json();
}

/** Buat Google Sheet baru dari data CSV (dikonversi otomatis oleh Drive). */
export async function createGoogleSheetFromCsv(accessToken: string, title: string, csv: string): Promise<string> {
  const base64 = btoa(unescape(encodeURIComponent(csv)));
  const result = await multipartUpload(
    accessToken,
    { name: title, mimeType: "application/vnd.google-apps.spreadsheet" },
    "text/csv",
    base64
  );
  return result.webViewLink;
}

/** Unggah file (base64, tanpa prefix data:) ke folder Drive tertentu. */
export async function uploadFileToDriveFolder(opts: {
  accessToken: string;
  folderId: string;
  filename: string;
  mimeType: string;
  base64Data: string;
}): Promise<string> {
  const result = await multipartUpload(
    opts.accessToken,
    { name: opts.filename, parents: [opts.folderId] },
    opts.mimeType,
    opts.base64Data
  );
  return result.webViewLink;
}
