'use client';

import NotConnected from "@/components/shared/NotConnected";
import Staking from "@/components/shared/staking";
import { useAccount } from "wagmi";
import { useParams } from "next/navigation";

const TokenInfo = () => {
    const { isConnected } = useAccount();
    const { id } = useParams();

    return (
        <div>
            {isConnected ? (
                <Staking tokenId={id} />
            ) : (
                <NotConnected />
            )}
        </div>
    );
};

export default TokenInfo;
