/**
 * Unduhan berkas QR.
 *
 * PNG diambil dari <canvas> yang sudah dirender react-qrcode-logo.
 * SVG dibangun ulang dari nol memakai matriks modul dari qrcode.react —
 * canvas tidak bisa diubah jadi vektor, dan untuk cetak besar (spanduk,
 * standee) raster 150px akan pecah.
 */

export function triggerDownload(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function downloadCanvasAsPng(
  container: HTMLElement | undefined,
  filename: string
): boolean {
  const canvas = container?.querySelector("canvas");
  if (!canvas) return false;
  triggerDownload(canvas.toDataURL("image/png"), filename);
  return true;
}

/**
 * Menyerialkan node <svg> yang sudah ada di DOM menjadi berkas .svg.
 *
 * Node-nya dirender di luar layar oleh QrSvgSource; kita hanya perlu
 * memastikan namespace ikut tertulis, karena browser mengizinkan node SVG
 * tanpa atribut xmlns di DOM tapi berkas .svg tanpa itu tidak akan terbuka
 * di Illustrator maupun Inkscape.
 */
export function downloadSvgNode(svg: SVGSVGElement | null, filename: string): boolean {
  if (!svg) return false;

  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

  const source = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${source}`], {
    type: "image/svg+xml;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  // Objek URL menahan blob di memori sampai dicabut; tanpa ini, mengunduh
  // banyak QR berturut-turut akan menumpuk salinan yang tidak pernah dilepas.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}
