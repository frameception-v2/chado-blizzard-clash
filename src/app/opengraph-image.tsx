import { ImageResponse } from "next/og";
import { PROJECT_TITLE, PROJECT_DESCRIPTION } from "~/lib/constants";

export const alt = "Blizzard Clash Game";
export const size = {
  width: 600,
  height: 400,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div tw="h-full w-full flex flex-col justify-center items-center relative bg-gradient-to-b from-blue-900 to-blue-700">
        <div tw="absolute inset-0 bg-white/10" /> 
        <h1 tw="text-6xl font-bold text-white mb-4">{PROJECT_TITLE}</h1>
        <h3 tw="text-2xl text-blue-200 text-center px-4">{PROJECT_DESCRIPTION}</h3>
      </div>
    ),
    {
      ...size,
    }
  );
}
