'use client';

import NotConnected from "@/components/shared/NotConnected";
import Staking from "@/components/shared/Staking";
import { useAccount } from "wagmi";
import { useParams } from "next/navigation";

const StakingPage = () => {
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

export default StakingPage;
