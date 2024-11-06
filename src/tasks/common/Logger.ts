import { TransactionResponse } from 'ethers';

export class Logger {
  constructor(private enabled = true) {
    //
  }

  log(...args: any[]): void {
    if (this.enabled) {
      console.log(...args);
    }
  }

  error(...args: any[]): void {
    if (this.enabled) {
      console.error(...args);
    }
  }

  print(message: string): void {
    if (this.enabled) {
      process.stdout.write(message);
    }
  }

  printLn(message: string): void {
    if (this.enabled) {
      process.stdout.write(`${message}\n`);
    }
  }

  async logTx(
    message: string,
    tx: Promise<TransactionResponse>,
  ): Promise<void> {
    const res = await tx;

    const { hash } = res;

    this.print(`${message} (tx: ${hash}) →`);

    const { gasUsed } = await res.wait();

    this.printLn(` performed with ${gasUsed} gas`);
  }
}
