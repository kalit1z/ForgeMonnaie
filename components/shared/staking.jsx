import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { contractAddress, contractAbi, contractStakingAddress, contractstakingAbi, contractUSerstakingAbi } from '@/constants';
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import Link from 'next/link';

const StakingContractInfo = ({ contract, tokenData, tokenId }) => {
  const { data: stakingToken, error: stakingTokenError } = useReadContract({
    address: contract,
    abi: contractUSerstakingAbi,
    functionName: 'stakingToken',
  });

  const { data: rewardRate, error: rewardRateError } = useReadContract({
    address: contract,
    abi: contractUSerstakingAbi,
    functionName: 'rewardRate',
  });

  if (stakingTokenError) {
    return <p style={{ color: 'red' }}>Erreur de chargement du staking token pour le contrat {contract}: {stakingTokenError.message}</p>;
  }

  if (rewardRateError) {
    return <p style={{ color: 'red' }}>Erreur de chargement du taux de récompense pour le contrat {contract}: {rewardRateError.message}</p>;
  }

  // Vérifier si le stakingToken correspond à tokenData[0]
  if (stakingToken !== tokenData[0]) {
    return null; // Ne pas afficher ce contrat
  }

  return (
    <tr>
      <td>{contract}</td>
      <td style={{ textAlign: 'center' }}>{rewardRate ? rewardRate.toString() : 'Loading...'}</td>
      <td>
        <Link href={`/get/${tokenId}/staking/${contract}`} passHref>
          <Button>Aller au Staking Contract</Button>
        </Link>
      </td>
    </tr>
  );
};

const TokenInfo = ({ tokenId }) => {
  const { address } = useAccount();

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

  const { data: stakingContracts, isLoading: stakingContractsLoading, error: stakingContractsError } = useReadContract({
    address: contractStakingAddress,
    abi: contractstakingAbi,
    functionName: 'getStakingContracts',
  });

  const [rewardRate, setRewardRate] = useState('');
  const [creationFee, setCreationFee] = useState('0');
  const [stakingContractAddress, setStakingContractAddress] = useState(null);
  const [createStakingPending, setCreateStakingPending] = useState(false);
  const [createStakingHash, setCreateStakingHash] = useState(null);
  const [createStakingError, setCreateStakingError] = useState(null);

  useEffect(() => {
    if (creationFeeData) {
      setCreationFee(creationFeeData.toString());
    }
  }, [creationFeeData]);

  const { writeContract: writeCreateStaking } = useWriteContract();

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
        value: creationFee,
        account: address,
      });

      if (tx && tx.hash) {
        setCreateStakingHash(tx.hash);
        setStakingContractAddress(tx.contractAddress);
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
              style={{ marginTop: '10px' }} 
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
        <Card>
          <CardContent className="pt-5">
            <h2>Contrats de Staking Associés</h2>
            {stakingContractsLoading ? (
              <p>Loading...</p>
            ) : stakingContractsError ? (
              <p style={{ color: 'red' }}>Erreur de chargement des contrats de staking: {stakingContractsError.message}</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Adresse du Contrat de Staking</th>
                    <th>Reward Rate (%)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stakingContracts && stakingContracts.map((contract) => (
                    <StakingContractInfo key={contract} contract={contract} tokenData={tokenData} tokenId={tokenId} />
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TokenInfo;
