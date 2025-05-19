import { Block } from './Block';
import { Transaction } from './Transaction';

export class Blockchain {
  private chain: Block[];
  private difficulty: number;
  private pendingTransactions: Transaction[];
  private miningReward: number;
  private failedTransactions: Transaction[];
  private initialBalances: Map<string, number>;

  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 4;
    this.pendingTransactions = [];
    this.failedTransactions = [];
    this.miningReward = 5; // 50 Ektedar coins reward
    this.initialBalances = new Map();
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
      timestamp: Date.now(),
      status: 'success'
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
      const failedTx = {
        ...transaction,
        status: 'failed' as const,
        failureReason: 'Transaction must include sender and recipient',
        timestamp: Date.now()
      };
      this.failedTransactions.push(failedTx);
      throw new Error('Transaction must include sender and recipient');
    }

    if (transaction.amount <= 0) {
      const failedTx = {
        ...transaction,
        status: 'failed' as const,
        failureReason: 'Transaction amount must be positive',
        timestamp: Date.now()
      };
      this.failedTransactions.push(failedTx);
      throw new Error('Transaction amount must be positive');
    }

    const senderBalance = this.getBalanceOfAddress(transaction.sender);
    if (senderBalance < transaction.amount && transaction.sender !== 'network') {
      const failedTx = {
        ...transaction,
        status: 'failed' as const,
        failureReason: 'Insufficient balance',
        timestamp: Date.now()
      };
      this.failedTransactions.push(failedTx);
      throw new Error('Insufficient balance');
    }

    this.pendingTransactions.push({
      ...transaction,
      status: 'success'
    });
  }

  addBalance(address: string, amount: number): void {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    const currentInitialBalance = this.initialBalances.get(address) || 0;
    this.initialBalances.set(address, currentInitialBalance + amount);

    // Create a transaction to record the balance addition
    const transaction: Transaction = {
      sender: "network",
      recipient: address,
      amount: amount,
      timestamp: Date.now(),
      status: 'success'
    };

    this.addTransaction(transaction);
    this.minePendingTransactions("network"); // Mine the block immediately
  }

  getBalanceOfAddress(address: string): number {
    let balance = this.initialBalances.get(address) || 0;

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

  getUserTransactions(address: string): Transaction[] {
    const transactions: Transaction[] = [];
    
    // Get successful transactions from blockchain
    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.sender === address || trans.recipient === address) {
          transactions.push(trans);
        }
      }
    }

    // Get failed transactions
    for (const trans of this.failedTransactions) {
      if (trans.sender === address || trans.recipient === address) {
        transactions.push(trans);
      }
    }

    return transactions.sort((a, b) => b.timestamp - a.timestamp);
  }

  getTransactionsBetweenAddresses(address1: string, address2: string): Transaction[] {
    const transactions: Transaction[] = [];
    
    // Get successful transactions from blockchain
    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if ((trans.sender === address1 && trans.recipient === address2) ||
            (trans.sender === address2 && trans.recipient === address1)) {
          transactions.push(trans);
        }
      }
    }

    // Get failed transactions
    for (const trans of this.failedTransactions) {
      if ((trans.sender === address1 && trans.recipient === address2) ||
          (trans.sender === address2 && trans.recipient === address1)) {
        transactions.push(trans);
      }
    }

    return transactions.sort((a, b) => b.timestamp - a.timestamp);
  }

  getAllTransactions(): Transaction[] {
    const transactions: Transaction[] = [];
    for (const block of this.chain) {
      transactions.push(...block.transactions);
    }
    return [...transactions, ...this.failedTransactions]
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  getFailedTransactions(): Transaction[] {
    return [...this.failedTransactions].sort((a, b) => b.timestamp - a.timestamp);
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