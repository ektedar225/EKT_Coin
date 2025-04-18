import SHA256 from 'crypto-js/sha256';
import { Transaction } from './Transaction';

export class Block {
  public hash: string;

  constructor(
    public index: number,
    public timestamp: number,
    public transactions: Transaction[],
    public previousHash: string,
    public nonce: number = 0
  ) {
    this.hash = this.calculateHash();
  }

  calculateHash(): string {
    return SHA256(
      this.index +
      this.previousHash +
      this.timestamp +
      JSON.stringify(this.transactions) +
      this.nonce
    ).toString();
  }

  mineBlock(difficulty: number): void {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }
}