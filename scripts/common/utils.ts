import {
  ContractTransactionResponse,
  hexlify,
  randomBytes,
  getAddress,
} from 'ethers';

export function runScript(main: () => Promise<void>): void {
  main()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

export function randomAddress(): string {
  return getAddress(hexlify(randomBytes(20)));
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function randomBool(): boolean {
  return Math.random() < 0.5;
}

export async function logTx(
  message: string,
  tx: Promise<ContractTransactionResponse>,
): Promise<void> {
  const { stdout } = process;

  const res = await tx;

  stdout.write(`${message} →`);

  const { gasUsed } = await res.wait();

  stdout.write(` performed with ${gasUsed} gas\n`);
}
