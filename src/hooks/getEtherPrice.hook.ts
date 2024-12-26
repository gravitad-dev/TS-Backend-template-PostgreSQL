import axios from 'axios';

const getEtherPriceInUSD = async (): Promise<number> => {
  const response = await axios.get(
    'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
  );
  return response.data.ethereum.usd;
};

export const convertWeiToUSD = async (
  transactionValueInWei: bigint
): Promise<number> => {
  if (transactionValueInWei === undefined) {
    throw new Error('transactionValueInWei is required');
  }

  try {
    const etherPriceInUSD = await getEtherPriceInUSD();

    const valueInEther = Number(transactionValueInWei) / 10 ** 18;

    const valueInUSD = valueInEther * etherPriceInUSD;

    return Number(valueInUSD.toFixed(2)) * 100;
  } catch (error) {
    throw new Error('Error calculating the value in USD');
  }
};
