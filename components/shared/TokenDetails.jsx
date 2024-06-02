import React from "react";
import { useReadContract, useAccount } from "wagmi";
import { contractAddress, contractAbi, tokenAbi } from "@/constants";
import { Card, CardContent } from "../ui/card";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";
import { Button } from "../ui/button";

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
            <Card className="mt-5">
                <CardContent>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell>Nom</TableCell>
                                <TableCell>{tokenData.data[1]}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Symbole</TableCell>
                                <TableCell>{tokenData.data[2]}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Token Adresse</TableCell>
                                <TableCell>{tokenData.data[0]}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Supply</TableCell>
                                <TableCell>{(parseFloat(tokenData.data[3].toString()) / Math.pow(10, 18)).toString()}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Solde</TableCell>
                                <TableCell>
                                    {(parseFloat(balanceData.data.toString()) / Math.pow(10, 18)).toString()}{" "}
                                    ({((parseFloat(balanceData.data.toString()) / parseFloat(tokenData.data[3].toString())) * 100).toFixed(2)}%)
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginLeft: '20px' }}>
                <Button onClick={() => handleAddLiquidity(tokenData.data[0])} style={{ marginBottom: '10px' }}>
                    Ajouter de la liquidité
                </Button>
                <Button onClick={() => handleSwap(tokenData.data[0])}>
                    Swap
                </Button>
            </div>
        </div>
    );
};

export default TokenDetails;
