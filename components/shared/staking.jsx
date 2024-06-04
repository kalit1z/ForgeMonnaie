import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { contractAddress, contractAbi, tokenAbi, contractStakingAddress, contractstakingAbi } from '@/constants';
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";

const TokenInfo = ({ tokenId }) => {
  const { address } = useAccount();

  // Lire les données du token à partir de TokenFactory
  const { data: tokenData, isLoading: tokenLoading, error: tokenError } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: 'tokens',
    args: [tokenId],
  });

  const { data: creationFeeData } = useReadContract({
    address: contractStakingAddress,
    abi: contractstakingAbi,
    functionName: 'creationFee',
  });

  const [approveHash, setApproveHash] = useState(null);
  const [approvePending, setApprovePending] = useState(false);
  const [approveError, setApproveError] = useState(null);
  const [rewardRate, setRewardRate] = useState('');
  const [creationFee, setCreationFee] = useState('0'); // Initial value
  const [stakingContractAddress, setStakingContractAddress] = useState(null);
  const [createStakingPending, setCreateStakingPending] = useState(false);
  const [createStakingHash, setCreateStakingHash] = useState(null);
  const [createStakingError, setCreateStakingError] = useState(null);

  useEffect(() => {
    if (creationFeeData) {
      setCreationFee(creationFeeData.toString()); // Store in wei
    }
  }, [creationFeeData]);

  const { writeContract: writeApprove } = useWriteContract();
  const { writeContract: writeCreateStaking } = useWriteContract();

  const handleApprove = async () => {
    if (!tokenData) {
      console.log("Token data is not loaded yet.");
      return;
    }

    const fixedAmount = parseUnits('10000', 18);
    try {
      setApprovePending(true);
      const tx = await writeApprove({
        address: tokenData[0], // Adresse du token ERC20
        abi: tokenAbi, // ABI du contrat ERC20
        functionName: 'approve',
        args: [contractStakingAddress, fixedAmount],
        account: address,
      });

      if (tx && tx.hash) {
        setApproveHash(tx.hash);
        console.log("Transaction soumise:", tx.hash);
      } else {
        throw new Error("Transaction object is undefined or does not have a hash.");
      }
    } catch (err) {
      setApproveError(err.message);
      console.error("Erreur lors de la soumission de la transaction:", err.message);
    } finally {
      setApprovePending(false);
    }
  };

  const { isLoading: approveLoading, isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });

  useEffect(() => {
    if (approveSuccess) {
      setApproveHash(null);
      setApproveError(null);
    }
  }, [approveSuccess]);

  const handleCreateStakingContract = async () => {
    if (!rewardRate || isNaN(rewardRate) || parseFloat(rewardRate) <= 0) {
      console.error("Invalid reward rate");
      return;
    }

    try {
      setCreateStakingPending(true);
      const tx = await writeCreateStaking({
        address: contractStakingAddress,
        abi: contractstakingAbi,
        functionName: 'createStakingContract',
        args: [tokenData[0], parseInt(rewardRate, 10)],
        value: creationFee, // Use the dynamically fetched creation fee
        account: address,
      });

      console.log('Transaction object:', tx);

      if (tx && tx.hash) {
        setCreateStakingHash(tx.hash);
        console.log("Staking contract creation transaction hash:", tx.hash);
        // Assuming the contract address is returned from the transaction receipt or event
        setStakingContractAddress(tx.contractAddress); // Adjust this line according to the actual response
      } else {
        throw new Error("Transaction object is undefined or does not have a hash.");
      }
    } catch (err) {
      setCreateStakingError(err.message);
      console.error("Erreur lors de la création du contrat de staking:", err.message);
    } finally {
      setCreateStakingPending(false);
    }
  };

  return (
    <div className="token-info">
      <div className="token-info_inner">
        <h1 className="token-info_inner_title">
          <span className="token-info_inner_title_colored">Détails du Token</span>
        </h1>
        <Card>
          <CardContent className="pt-5">
            {tokenLoading ? (
              <p>Loading...</p>
            ) : tokenError ? (
              <p style={{ color: 'red' }}>Erreur de chargement: {tokenError.message}</p>
            ) : (
              <div className="token-info_inner_details">
                <div className="token-info_inner_details_item">
                  <p><strong>Nom du Token:</strong> {tokenData[1]}</p>
                </div>
                <div className="token-info_inner_details_item">
                  <p><strong>Symbole du Token:</strong> {tokenData[2]}</p>
                </div>
                <div className="token-info_inner_details_item">
                  <p><strong>Adresse du Token:</strong> {tokenData[0]}</p>
                </div>
                <div className="token-info_inner_details_item">
                  <p><strong>Max Supply:</strong> {formatUnits(tokenData[3], 18)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Button onClick={handleApprove} disabled={approvePending || !tokenData}>
              {approvePending ? 'En Cours...' : 'Approuver'}
            </Button>
            <p className="note">La première fois que vous créez un contrat de staking, vous devez approuver, sinon cela ne fonctionnera pas.</p>
            {approveLoading && <p>Approving...</p>}
            {approveSuccess && <p>Approval successful!</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Label>Reward Rate (%)</Label>
            <Input 
              type="number" 
              value={rewardRate} 
              onChange={(e) => setRewardRate(e.target.value)} 
              placeholder="Enter reward rate"
            />
            <Button 
              onClick={handleCreateStakingContract} 
              disabled={!rewardRate || !creationFee}
              style={{ marginTop: '10px' }} // Add margin here
            >
              {createStakingPending ? 'En Cours...' : 'Créer Contract Staking'}
            </Button>
            {createStakingHash && (
              <p>Hash de la transaction de création du staking: {createStakingHash}</p>
            )}
            {stakingContractAddress && (
              <p>Contract staking créé avec succès! Adresse du contrat: {stakingContractAddress}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TokenInfo;
