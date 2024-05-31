import { useReadContract } from 'wagmi';
import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { contractAddress, contractAbi } from "@/constants";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { parseEther } from "viem";
import { Card, CardContent } from "../ui/card";
import Informations from "./Informations";

const AddToWishList = () => {
    const { address } = useAccount();
    const { data: hash, isPending, error, writeContract } = useWriteContract();

    // Utilisation de useReadContract pour lire le deploymentFee
    const { data: deploymentFee, isLoading: feeLoading, error: feeError } = useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'deploymentFee',
    });

    const [tokenName, setTokenName] = useState("");
    const [tokenSymbol, setTokenSymbol] = useState("");
    const [initialSupply, setInitialSupply] = useState("");

    const createToken = async () => {
        // Vérifier si la lecture du deploymentFee est en cours ou si une erreur s'est produite
        if (feeLoading) {
            console.log("Chargement du montant du frais de déploiement...");
            return;
        }

        if (feeError) {
            console.error("Erreur lors de la récupération du montant du frais de déploiement:", feeError.message);
            return;
        }

        try {
            // Lancer la transaction avec le montant du frais récupéré
            const tx = await writeContract({
                address: contractAddress,
                abi: contractAbi,
                functionName: 'createToken',
                args: [tokenName, tokenSymbol, parseEther(initialSupply)],
                account: address,
                value: deploymentFee // Utilisation du deploymentFee récupéré comme valeur de la transaction
            });

            console.log("Transaction soumise:", tx.hash);
        } catch (err) {
            console.error("Erreur lors de la soumission de la transaction:", err.message);
        }
    };

    const { isLoading: estEnCoursDeConfirmation, isSuccess: estConfirmé } = useWaitForTransactionReceipt({ hash });

    return (
        <div className="add">
            <div className="add_inner">
                <h1 className="add_inner_title">
                    <span className="add_inner_title_colored">Définissez les informations</span> de votre token
                </h1>
                <Informations hash={hash} isLoading={estEnCoursDeConfirmation} isSuccess={estConfirmé} error={error} />

                <Card>
                    <CardContent className="pt-5">
                        <div className="add_inner_form_item">
                            <Label>Nom du token</Label>
                            <Input
                                type="text"
                                value={tokenName}
                                onChange={(e) => setTokenName(e.target.value)}
                                placeholder="Bitcoin"
                            />
                        </div>
                        <div className="add_inner_form_item mt-5">
                            <Label>Symbol du token</Label>
                            <Input
                                type="text"
                                value={tokenSymbol}
                                onChange={(e) => setTokenSymbol(e.target.value)}
                                placeholder="BTC"
                            />
                        </div>
                        <div className="add_inner_form_item mt-5">
                            <Label>Supply du token</Label>
                            <Input
                                type="number"
                                value={initialSupply}
                                onChange={(e) => setInitialSupply(e.target.value)}
                                placeholder="21000000"
                            />
                        </div>
                        <Button
                            variant="outline"
                            disabled={isPending || feeLoading} // Désactiver le bouton si une opération est en cours
                            className="add_inner_submit_button hover:bg-[#C8B1F4]"
                            onClick={createToken}
                        >
                            {isPending ? 'Ajout...' : 'Créez votre token'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default AddToWishList;
