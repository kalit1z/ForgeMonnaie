import React from "react";
import { useReadContract, useAccount } from "wagmi";
import { contractAddress, contractAbi, tokenAbi } from "@/constants";
import { Card, CardContent } from "../ui/card";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import Link from 'next/link';

const TokenDetails = ({ tokenId }) => {
    const { address } = useAccount();

    const tokenData = useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'tokens',
        args: [tokenId]
    });

    const balanceData = useReadContract({
        address: tokenData.data ? tokenData.data[0] : null,
        abi: tokenAbi,
        functionName: 'balanceOf',
        args: [address]
    });

    if (!tokenData.data || !balanceData.data) {
        return <div>Loading...</div>;
    }

    const handleAddLiquidity = (tokenAddress) => {
        const url = `https://app.uniswap.org/#/add/v2/${tokenAddress}/ETH`;
        window.open(url, '_blank');
    };

    const handleSwap = (tokenAddress) => {
        const url = `https://app.uniswap.org/#/swap?inputCurrency=${tokenAddress}&outputCurrency=ETH`;
        window.open(url, '_blank');
    };

    return (
        <div className="flex flex-col md:flex-row justify-between items-center mt-5">
            <Card className="w-full md:w-3/4 mt-5 md:mr-5">
                <CardContent>
                    <Table className="w-full">
                        <TableBody>
                            <TableRow className="flex flex-col md:flex-row">
                                <TableCell className="font-bold md:w-1/2">Nom</TableCell>
                                <TableCell className="md:w-1/2">{tokenData.data[1]}</TableCell>
                            </TableRow>
                            <TableRow className="flex flex-col md:flex-row">
                                <TableCell className="font-bold md:w-1/2">Symbole</TableCell>
                                <TableCell className="md:w-1/2">{tokenData.data[2]}</TableCell>
                            </TableRow>
                            <TableRow className="flex flex-col md:flex-row">
                                <TableCell className="font-bold md:w-1/2">Token Adresse</TableCell>
                                <TableCell className="md:w-1/2 break-all">{tokenData.data[0]}</TableCell>
                            </TableRow>
                            <TableRow className="flex flex-col md:flex-row">
                                <TableCell className="font-bold md:w-1/2">Supply</TableCell>
                                <TableCell className="md:w-1/2">{(parseFloat(tokenData.data[3].toString()) / Math.pow(10, 18)).toString()}</TableCell>
                            </TableRow>
                            <TableRow className="flex flex-col md:flex-row">
                                <TableCell className="font-bold md:w-1/2">Solde</TableCell>
                                <TableCell className="md:w-1/2">
                                    {(parseFloat(balanceData.data.toString()) / Math.pow(10, 18)).toString()}{" "}
                                    ({((parseFloat(balanceData.data.toString()) / parseFloat(tokenData.data[3].toString())) * 100).toFixed(2)}%)
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <div className="flex flex-col items-center justify-center mt-5 md:mt-0 md:ml-5">
                <Button onClick={() => handleAddLiquidity(tokenData.data[0])} className="mb-2 bg-[#C8B1F4] text-gray-900">
                    Ajouter de la liquidité
                </Button>
                <Button onClick={() => handleSwap(tokenData.data[0])} className="mb-2 bg-[#C8B1F4] text-gray-900">
                    Swap
                </Button>
                <Link href={`/get/${tokenId}/staking`} passHref>
                    <Button className="bg-[#C8B1F4] text-gray-900">
                        Staking
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default TokenDetails;
