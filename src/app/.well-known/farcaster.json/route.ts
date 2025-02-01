import { PROJECT_TITLE } from "~/lib/constants";

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL || `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;

  const config = {
    accountAssociation: {
      message: {
        domain: "blizzard-clash.vercel.app",
        timestamp: 1738381349,
        expirationTime: 1746157349
      },
      signature: "30ac278dcf4306876b37e6dec9beaa65636c4ecc4649af222d8b4d4a663b5fa67c7a6f41df80d9fd943249e5127a1c84d6828d1a4b9cf4e5bdd90fc71c4003371c",
      signingKey: "bf061d683c519c27ff13d2c148f093433f39316b04907be3726bf26fdcd541e4"
    },
    frame: {
      version: "1",
      name: PROJECT_TITLE,
      iconUrl: `${appUrl}/icon.png`,
      homeUrl: appUrl,
      imageUrl: `${appUrl}/frames/hello/opengraph-image`,
      buttonTitle: "Launch Frame",
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#f7f7f7",
      webhookUrl: `${appUrl}/api/webhook`,
    },
  };

  return Response.json(config);
}
