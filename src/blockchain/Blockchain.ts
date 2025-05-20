import { Block } from './Block';
import { Transaction } from './Transaction';

export class Blockchain {
  private chain: Block[];
  private difficulty: number;
  private pendingTransactions: Transaction[];
  private miningReward: number;

  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 4;
    this.pendingTransactions = [];
    this.miningReward = 1; // 1 Ektedar coin reward
  }

  private createGenesisBlock(): Block {
    return new Block(
      0,
      Date.now(),
      [],
      "0000000000000000"
    );
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress: string): void {
    // Create reward transaction
    const rewardTx: Transaction = {
      sender: "network",
      recipient: miningRewardAddress,
      amount: this.miningReward,
      timestamp: Date.now()
    };

    this.pendingTransactions.push(rewardTx);

    // Create new block
    const block = new Block(
      this.chain.length,
      Date.now(),
      this.pendingTransactions,
      this.getLatestBlock().hash
    );

    // Mine block
    block.mineBlock(this.difficulty);

    // Add block to chain
    this.chain.push(block);

    // Reset pending transactions
    this.pendingTransactions = [];
  }

  addTransaction(transaction: Transaction): void {
    if (!transaction.sender || !transaction.recipient) {
      throw new Error('Transaction must include sender and recipient');
    }

    if (transaction.amount <= 0) {
      throw new Error('Transaction amount must be positive');
    }

    // Only apply network fee for normal transactions, not for initial funding from 'network'
    const isInitialFunding = transaction.sender === 'network';
    const networkFee = 2;
    if (!isInitialFunding && (transaction.amount + networkFee > this.getBalanceOfAddress(transaction.sender))) {
      throw new Error('Insufficient balance for transaction and network fee');
    }

    if (!isInitialFunding) {
      // Add fee transaction to network
      this.pendingTransactions.push({
        sender: transaction.sender,
        recipient: 'network',
        amount: networkFee,
        timestamp: Date.now()
      });
    }

    // Add user transaction (or initial funding)
    this.pendingTransactions.push(transaction);
  }

  getBalanceOfAddress(address: string): number {
    let balance = 0;

    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.sender === address) {
          balance -= trans.amount;
        }
        if (trans.recipient === address) {
          balance += trans.amount;
        }
      }
    }

    return balance;
  }

  getAllTransactions(): Transaction[] {
    const transactions: Transaction[] = [];
    for (const block of this.chain) {
      transactions.push(...block.transactions);
    }
    return transactions;
  }

  isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Verify current block's hash
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      // Verify current block links to previous block
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  getChain(): Block[] {
    return this.chain;
  }

  getPendingTransactions(): Transaction[] {
    return this.pendingTransactions;
  }

  getDifficulty(): number {
    return this.difficulty;
  }
}