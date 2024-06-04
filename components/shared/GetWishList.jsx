import React, { useState, useEffect } from "react";
import { useReadContract, useAccount } from "wagmi";
import { contractAddress, contractAbi, tokenAbi } from "@/constants";
import { Card, CardContent } from "../ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "../ui/button";
import Link from "next/link";

const GetWishList = () => {
    const fetchTokens = [...Array(101).keys()];

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

    return (
        <div className="get w-full h-fit">
            <div className="get_inner max-w-5xl m-auto p-5">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-gray-900 mb-5 text-center">
                    Vos tokens
                </h1>
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
                                            <TableRow>
                                                <TableCell colSpan={2} className="text-right">
                                                    <Link href={`/get/${index}`}>
                                                        <Button className="ml-2 bg-[#C8B1F4] text-gray-900">
                                                            Voir plus
                                                        </Button>
                                                    </Link>
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
