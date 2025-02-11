import { Hex, PublicClient } from 'viem';

export class Logger {
  constructor(private client: PublicClient) {
    //
  }

  log(message: string) {
    this.print('LOG', `${message}...`);
    this.print();
  }

  info(message: string, ...args: unknown[]) {
    this.print('INFO', `${message}${args.length ? ':' : ''}`, ...args);
    this.print();
  }

  async logTx(message: string, hashOrPromise: Promise<Hex> | Hex) {
    const hash = await hashOrPromise;

    const { gasUsed } = await this.client.waitForTransactionReceipt({ hash });

    this.print('LOG', `${message}...`);
    this.print('TX', {
      hash,
      gasUsed,
    });
    this.print();
  }

  private print(prefix?: string, ...args: unknown[]) {
    if (prefix) {
      console.log(`[${prefix}]`, ...args);
    } else {
      console.log();
    }
  }
}
