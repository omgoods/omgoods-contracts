import prompts from 'prompts';

export async function promptMetadata(): Promise<{
  name: string;
  symbol: string;
}> {
  const { name } = await prompts({
    type: 'text',
    name: 'name',
    message: 'Name',
  });

  const { symbol } = await prompts({
    type: 'text',
    name: 'symbol',
    message: 'Symbol',
  });

  return {
    name,
    symbol,
  };
}
