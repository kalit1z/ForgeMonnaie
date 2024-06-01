import React, { useState, useEffect } from "react";
import { useReadContract, useAccount } from "wagmi";
import { contractAddress, contractAbi, tokenAbi } from "@/constants";
import { Card, CardContent } from "../ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "../ui/button"; // Assurez-vous d'importer un composant de bouton approprié

const GetWishList = () => {
    const fetchTokens = [...Array(101).keys()]; // Indices des tokens à récupérer

    function getToken(index) {
        if (index >= 0 && index < fetchTokens.length) {
            return `Token${index}`;
        } else {
            throw new Error(`Erreur: Token à l'index ${index} introuvable`);
        }
    }
    
    function testTokensSequentially(tokens) {
        for (let i = 0; i < tokens.length; i++) {
            try {
                const token = getToken(tokens[i]);
                console.log(`Token récupéré avec succès: ${token}`);
            } catch (error) {
                console.error(error.message);
                break;
            }
        }
    }
    
    testTokensSequentially(fetchTokens);
    
    const { address } = useAccount();

    useEffect(() => {
        console.log(`Adresse de l'utilisateur : ${address}`);
    }, [address]);

    const tokensData = fetchTokens.map(index => 
        useReadContract({
            address: contractAddress,
            abi: contractAbi,
            functionName: 'tokens',
            args: [index]
        })
    );

    const balancesData = tokensData.map(tokenData => {
        return useReadContract({
            address: tokenData.data ? tokenData.data[0] : null,
            abi: tokenAbi,
            functionName: 'balanceOf',
            args: [address]
        });
    });

    const handleAddLiquidity = (tokenAddress) => {
        const url = `https://app.uniswap.org/#/add/v2/${tokenAddress}/ETH`;
        window.open(url, '_blank');
    };

    const handleSwap = (tokenAddress) => {
        const url = `https://app.uniswap.org/#/swap?inputCurrency=${tokenAddress}&outputCurrency=ETH`;
        window.open(url, '_blank');
    };

    return (
        <div className="get">
            <div className="get_inner">
                <h1 style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '2rem' }}>Vos tokens</h1>
                {tokensData.map((tokenData, index) => {
                    if (tokenData.data) {
                        const balanceData = balancesData[index];

                        console.log(`Token ${index} Adresse: ${tokenData.data[0]}`);
                        if (balanceData.data) {
                            console.log(`Token ${index} Balance: ${balanceData.data.toString()}`);
                        }

                        if (!balanceData.data || balanceData.data.toString() === '0') {
                            return null;
                        }

                        return (
                            <Card key={index} className="mt-5">
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
                                            <TableRow>
                                                <TableCell colSpan={2} style={{ textAlign: 'right' }}>
                                                    <Button onClick={() => handleAddLiquidity(tokenData.data[0])}>
                                                        Ajouter de la liquidité
                                                    </Button>
                                                    <Button onClick={() => handleSwap(tokenData.data[0])} style={{ marginLeft: '10px' }}>
                                                        Swap
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    );
};

export default GetWishList;
