import { NextResponse } from "next/server";
import sharp from "sharp";

const sampleSize = 72;
const borderSize = 8;
const maxImageBytes = 4 * 1024 * 1024;

function hasCleanLightBackground(pixels: Buffer) {
  let borderPixels = 0;
  let cleanPixels = 0;

  for (let y = 0; y < sampleSize; y += 1) {
    for (let x = 0; x < sampleSize; x += 1) {
      if (x >= borderSize && x < sampleSize - borderSize && y >= borderSize && y < sampleSize - borderSize) {
        continue;
      }

      const index = (y * sampleSize + x) * 3;
      const red = pixels[index];
      const green = pixels[index + 1];
      const blue = pixels[index + 2];
      const max = Math.max(red, green, blue);
      const min = Math.min(red, green, blue);
      const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
      const saturation = max === 0 ? 0 : (max - min) / max;

      borderPixels += 1;

      if (luminance > 238 && saturation < 0.12) {
        cleanPixels += 1;
      }
    }
  }

  return cleanPixels / borderPixels > 0.7;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return NextResponse.json({ shouldBlend: false }, { status: 400 });
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    return NextResponse.json({ shouldBlend: false }, { status: 400 });
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol) || ["localhost", "127.0.0.1", "0.0.0.0"].includes(parsedUrl.hostname)) {
    return NextResponse.json({ shouldBlend: false }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch(parsedUrl, {
      headers: {
        "user-agent": "Mozilla/5.0",
      },
      signal: controller.signal,
    });
    const contentLength = Number(response.headers.get("content-length") ?? 0);

    if (!response.ok || contentLength > maxImageBytes) {
      return NextResponse.json({ analyzed: false, shouldBlend: false });
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    if (buffer.byteLength > maxImageBytes) {
      return NextResponse.json({ analyzed: false, shouldBlend: false });
    }

    const pixels = await sharp(buffer)
      .resize(sampleSize, sampleSize, { fit: "fill" })
      .removeAlpha()
      .raw()
      .toBuffer();

    return NextResponse.json(
      { analyzed: true, shouldBlend: hasCleanLightBackground(pixels) },
      {
        headers: {
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        },
      },
    );
  } catch {
    return NextResponse.json({ analyzed: false, shouldBlend: false });
  } finally {
    clearTimeout(timeout);
  }
}
