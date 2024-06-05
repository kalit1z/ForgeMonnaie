'use client';

import React, { useEffect } from 'react';
import NotConnected from "@/components/shared/NotConnected";
import ManageStaking from "@/components/shared/ManageStaking";
import { useAccount } from "wagmi";
import { useParams } from "next/navigation";

const Page = () => {
    const { address } = useAccount();
    const params = useParams();
    const { id, stakingId } = params; // Assurez-vous que les noms ici correspondent exactement aux noms des dossiers

    useEffect(() => {
        console.log("ID from Params:", id);
        console.log("Staking Contract Address from Params:", stakingId);
    }, [id, stakingId]);

    return (
        <div>
            {address ? (
                <ManageStaking stakingAddress={stakingId} />
            ) : (
                <NotConnected />
            )}
        </div>
    );
};

export default Page;
