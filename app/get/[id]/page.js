'use client';

import NotConnected from "@/components/shared/NotConnected";
import TokenDetails from "@/components/shared/TokenDetails";
import { useAccount } from "wagmi";
import { useParams } from "next/navigation";

const TokenPage = () => {
    const { isConnected } = useAccount();
    const { id } = useParams();

    return (
        <div>
            {isConnected ? (
                <TokenDetails tokenId={id} />
            ) : (
                <NotConnected />
            )}
        </div>
    );
};

export default TokenPage;
