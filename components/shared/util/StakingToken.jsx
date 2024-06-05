import React from 'react';
import { useReadContract } from 'wagmi';
import { contractUserstakingAbi } from '@/constants';

const StakingToken = ({ contract }) => {
  const { data: stakingToken, isLoading, error } = useReadContract({
    address: contract,
    abi: contractUserstakingAbi,
    functionName: 'stakingToken',
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>Erreur: {error.message}</p>;

  return <span>{stakingToken}</span>;
};

export default StakingToken;
