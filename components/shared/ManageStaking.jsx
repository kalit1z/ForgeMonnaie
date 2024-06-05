import React, { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { tokenAbi, contractUSerstakingAbi } from "@/constants";
import { Card, CardContent } from "../ui/card";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const ManageStaking = ({ stakingAddress }) => {
    const { address } = useAccount();
    const [stakeAmount, setStakeAmount] = useState('');

    const { data: stakingTokenData, isLoading: loadingStakingToken, error: errorStakingToken } = useReadContract({
        address: stakingAddress,
        abi: contractUSerstakingAbi,
        functionName: 'stakingToken'
    });

    const { data: tokenNameData, isLoading: loadingTokenName, error: errorTokenName } = useReadContract({
        address: stakingTokenData || null,
        abi: tokenAbi,
        functionName: 'name',
        enabled: !!stakingTokenData
    });

    const { data: balanceDataRaw, isLoading: loadingBalance, error: errorBalance } = useReadContract({
        address: stakingTokenData || null,
        abi: tokenAbi,
        functionName: 'balanceOf',
        args: [stakingAddress],
        enabled: !!stakingTokenData
    });

    const { data: rewardRateData, isLoading: loadingRewardRate, error: errorRewardRate } = useReadContract({
        address: stakingAddress,
        abi: contractUSerstakingAbi,
        functionName: 'rewardRate'
    });

    const { writeContract: writeStake, data: stakeData, isLoading: stakeLoading, isSuccess: stakeSuccess, error: stakeError } = useWriteContract();
    const { writeContract: writeWithdraw, data: withdrawData, isLoading: withdrawLoading, isSuccess: withdrawSuccess, error: withdrawError } = useWriteContract();
    const { writeContract: writeApprove, data: approveData, isLoading: approveLoading, isSuccess: approveSuccess, error: approveError } = useWriteContract();

    const handleStake = async () => {
        try {
            const tx = await writeStake({
                address: stakingAddress,
                abi: contractUSerstakingAbi,
                functionName: 'stake',
                args: [BigInt(stakeAmount * Math.pow(10, 18))],
                account: address
            });
            console.log("Stake transaction:", tx);
        } catch (error) {
            console.error("Error staking:", error);
        }
    };

    const handleWithdraw = async () => {
        try {
            const tx = await writeWithdraw({
                address: stakingAddress,
                abi: contractUSerstakingAbi,
                functionName: 'withdraw',
                args: [],
                account: address
            });
            console.log("Withdraw transaction:", tx);
        } catch (error) {
            console.error("Error withdrawing:", error);
        }
    };

    const handleApprove = async () => {
        try {
            const tx = await writeApprove({
                address: stakingTokenData || null,
                abi: tokenAbi,
                functionName: 'approve',
                args: [stakingAddress, BigInt(10000 * Math.pow(10, 18))],
                account: address
            });
            console.log("Approve transaction:", tx);
        } catch (error) {
            console.error("Error approving:", error);
        }
    };

    if (loadingStakingToken || loadingBalance || loadingRewardRate || loadingTokenName) {
        return <div>Loading...</div>;
    }

    if (errorStakingToken || errorBalance || errorRewardRate || errorTokenName) {
        return <div>Failed to load data: {errorStakingToken?.message || errorBalance?.message || errorRewardRate?.message || errorTokenName?.message}</div>;
    }

    if (!stakingTokenData || !rewardRateData || !tokenNameData) {
        return <div>Failed to load data</div>;
    }

    const formattedBalance = balanceDataRaw ? (parseFloat(balanceDataRaw.toString()) / Math.pow(10, 18)).toString() : '0';
    const formattedRewardRate = rewardRateData ? rewardRateData.toString() : '0';

    return (
        <div className="flex flex-col md:flex-row justify-between items-center mt-5 p-4 space-y-5 md:space-y-0 md:space-x-5">
            <Card className="w-full md:w-3/4 mt-5 md:mt-0">
                <CardContent>
                    <Table className="w-full">
                        <TableBody>
                            <TableRow className="flex flex-col md:flex-row">
                                <TableCell className="font-bold md:w-1/2">Nom du Token de Staking</TableCell>
                                <TableCell className="md:w-1/2">{tokenNameData}</TableCell>
                            </TableRow>
                            <TableRow className="flex flex-col md:flex-row">
                                <TableCell className="font-bold md:w-1/2">Adresse du Token de Staking</TableCell>
                                <TableCell className="md:w-1/2 break-all">{stakingTokenData}</TableCell>
                            </TableRow>
                            <TableRow className="flex flex-col md:flex-row">
                                <TableCell className="font-bold md:w-1/2">Solde en Staking</TableCell>
                                <TableCell className="md:w-1/2">
                                    {formattedBalance}{" "}
                                    ({(parseFloat(formattedBalance) * 100).toFixed(2)}%)
                                </TableCell>
                            </TableRow>
                            <TableRow className="flex flex-col md:flex-row">
                                <TableCell className="font-bold md:w-1/2">Taux de Récompense</TableCell>
                                <TableCell className="md:w-1/2">{formattedRewardRate}%</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <div className="mt-5 w-full md:w-1/4 md:mt-0 space-y-4">
                <Input 
                    type="number"
                    placeholder="Amount to Stake"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="mb-2"
                />
                <Button onClick={handleStake} disabled={!stakeAmount || stakeLoading} className="w-full">
                    {stakeLoading ? 'Staking...' : 'Stake'}
                </Button>
                <Button onClick={handleWithdraw} disabled={withdrawLoading} className="w-full">
                    {withdrawLoading ? 'Withdrawing...' : 'Withdraw'}
                </Button>
                <Button onClick={handleApprove} disabled={approveLoading} className="w-full">
                    {approveLoading ? 'Approving...' : 'Approve (sinon ca marche pas)'}
                </Button>
            </div>
        </div>
    );
};

export default ManageStaking;
