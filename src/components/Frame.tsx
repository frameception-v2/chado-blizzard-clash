"use client";

import { useEffect, useCallback, useState } from "react";
import sdk, {
  AddFrame,
  SignIn as SignInCore,
  type Context,
} from "@farcaster/frame-sdk";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";

import { config } from "~/components/providers/WagmiProvider";
import { PurpleButton } from "~/components/ui/PurpleButton";
import { truncateAddress } from "~/lib/truncateAddress";
import { base, optimism } from "wagmi/chains";
import { useSession } from "next-auth/react";
import { createStore } from "mipd";
import { Label } from "~/components/ui/label";
import { 
  PROJECT_TITLE,
  SNOW_WARRIOR_NAME,
  FIRE_WARRIOR_NAME,
  SNOW_WARRIOR_FID,
  FIRE_WARRIOR_FID,
  MIN_TIP_AMOUNT
} from "~/lib/constants";

interface TipState {
  snowWarriorTotal: number;
  fireWarriorTotal: number;
  lastTipper?: string;
  lastTipAmount?: number;
}

function BattleCard({ tipState, onTip }: { tipState: TipState; onTip: (warriorFid: number) => void }) {
  return (
    <Card className="border-neutral-200 bg-white">
      <CardHeader>
        <CardTitle className="text-neutral-900">Choose Your Champion!</CardTitle>
        <CardDescription className="text-neutral-600">
          Tip your favorite warrior to support them in battle
        </CardDescription>
      </CardHeader>
      <CardContent className="text-neutral-800 space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-center">
            <h3 className="font-bold text-blue-600">{SNOW_WARRIOR_NAME}</h3>
            <p className="text-sm">Total: {tipState.snowWarriorTotal} ETH</p>
            <PurpleButton 
              onClick={() => onTip(SNOW_WARRIOR_FID)}
              className="mt-2 bg-blue-500 hover:bg-blue-600"
            >
              Tip Ice Warrior
            </PurpleButton>
          </div>
          <div className="text-2xl font-bold">VS</div>
          <div className="text-center">
            <h3 className="font-bold text-red-600">{FIRE_WARRIOR_NAME}</h3>
            <p className="text-sm">Total: {tipState.fireWarriorTotal} ETH</p>
            <PurpleButton
              onClick={() => onTip(FIRE_WARRIOR_FID)}
              className="mt-2 bg-red-500 hover:bg-red-600"
            >
              Tip Fire Warrior
            </PurpleButton>
          </div>
        </div>
        {tipState.lastTipper && (
          <p className="text-sm text-center mt-4">
            Last tip: {tipState.lastTipAmount} ETH by {tipState.lastTipper}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function Frame(
  { title }: { title?: string } = { title: PROJECT_TITLE }
) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();
  const [tipState, setTipState] = useState<TipState>({
    snowWarriorTotal: 0,
    fireWarriorTotal: 0
  });

  const [added, setAdded] = useState(false);

  const [addFrameResult, setAddFrameResult] = useState("");

  const addFrame = useCallback(async () => {
    try {
      await sdk.actions.addFrame();
    } catch (error) {
      if (error instanceof AddFrame.RejectedByUser) {
        setAddFrameResult(`Not added: ${error.message}`);
      }

      if (error instanceof AddFrame.InvalidDomainManifest) {
        setAddFrameResult(`Not added: ${error.message}`);
      }

      setAddFrameResult(`Error: ${error}`);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      if (!context) {
        return;
      }

      setContext(context);
      setAdded(context.client.added);

      // If frame isn't already added, prompt user to add it
      if (!context.client.added) {
        addFrame();
      }

      sdk.on("frameAdded", ({ notificationDetails }) => {
        setAdded(true);
      });

      sdk.on("frameAddRejected", ({ reason }) => {
        console.log("frameAddRejected", reason);
      });

      sdk.on("frameRemoved", () => {
        console.log("frameRemoved");
        setAdded(false);
      });

      sdk.on("notificationsEnabled", ({ notificationDetails }) => {
        console.log("notificationsEnabled", notificationDetails);
      });
      sdk.on("notificationsDisabled", () => {
        console.log("notificationsDisabled");
      });

      sdk.on("primaryButtonClicked", () => {
        console.log("primaryButtonClicked");
      });

      console.log("Calling ready");
      sdk.actions.ready({});

      // Set up a MIPD Store, and request Providers.
      const store = createStore();

      // Subscribe to the MIPD Store.
      store.subscribe((providerDetails) => {
        console.log("PROVIDER DETAILS", providerDetails);
        // => [EIP6963ProviderDetail, EIP6963ProviderDetail, ...]
      });
    };
    if (sdk && !isSDKLoaded) {
      console.log("Calling load");
      setIsSDKLoaded(true);
      load();
      return () => {
        sdk.removeAllListeners();
      };
    }
  }, [isSDKLoaded, addFrame]);

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
      }}
    >
      <div className="w-[300px] mx-auto py-2 px-2">
        <h1 className="text-2xl font-bold text-center mb-4 text-neutral-900">{title}</h1>
        <BattleCard 
          tipState={tipState}
          onTip={async (warriorFid) => {
            try {
              // Here we would integrate with the tipping functionality
              // This is a placeholder for the actual implementation
              const tipAmount = MIN_TIP_AMOUNT;
              const success = await sdk.actions.sendTransaction({
                to: warriorFid === SNOW_WARRIOR_FID ? SNOW_WARRIOR_NAME : FIRE_WARRIOR_NAME,
                value: tipAmount
              });
              
              if (success) {
                setTipState(prev => ({
                  ...prev,
                  [warriorFid === SNOW_WARRIOR_FID ? 'snowWarriorTotal' : 'fireWarriorTotal']: 
                    prev[warriorFid === SNOW_WARRIOR_FID ? 'snowWarriorTotal' : 'fireWarriorTotal'] + tipAmount,
                  lastTipper: context?.user?.username || 'Anonymous',
                  lastTipAmount: tipAmount
                }));
              }
            } catch (error) {
              console.error('Tipping failed:', error);
            }
          }}
        />
      </div>
    </div>
  );
}
