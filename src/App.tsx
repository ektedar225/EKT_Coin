import React, { useState, useEffect } from 'react';
import { Coins, Box, ArrowRightLeft, Wallet, Clock, Shield, AlertCircle } from 'lucide-react';
import { Blockchain } from './blockchain/Blockchain';
import { Transaction } from './blockchain/Transaction';

function App() {
  const [blockchain] = useState(new Blockchain());
  const [walletAddress, setWalletAddress] = useState('user1');
  const [blocks, setBlocks] = useState(blockchain.getChain());
  const [newTransaction, setNewTransaction] = useState({
    sender: walletAddress,
    recipient: '',
    amount: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginAddress, setLoginAddress] = useState('');

  useEffect(() => {
    setBlocks(blockchain.getChain());
  }, [blockchain]);

  // Ensure all wallets start with 50 EKT if their balance is zero
  const ensureInitialBalance = (address: string) => {
    if (blockchain.getBalanceOfAddress(address) === 0) {
      blockchain.addTransaction({
        sender: 'network',
        recipient: address,
        amount: 50,
        timestamp: Date.now()
      });
      blockchain.minePendingTransactions(address);
      setBlocks([...blockchain.getChain()]);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      ensureInitialBalance(walletAddress);
    }
    // eslint-disable-next-line
  }, [isLoggedIn, walletAddress]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Deduct network fee of 2 EKT from sender
      const totalAmount = newTransaction.amount + 2;
      if (blockchain.getBalanceOfAddress(walletAddress) < totalAmount) {
        setError('Insufficient balance to cover amount and network fee (2 EKT)');
        return;
      }
      // Main transaction
      const transaction: Transaction = {
        ...newTransaction,
        amount: newTransaction.amount,
        timestamp: Date.now()
      };
      // Network fee transaction
      const feeTransaction: Transaction = {
        sender: walletAddress,
        recipient: 'network',
        amount: 2,
        timestamp: Date.now()
      };
      blockchain.addTransaction(transaction);
      blockchain.addTransaction(feeTransaction);
      blockchain.minePendingTransactions(walletAddress);
      setBlocks([...blockchain.getChain()]);
      setNewTransaction({
        sender: walletAddress,
        recipient: '',
        amount: 0
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAddress.trim()) {
      setWalletAddress(loginAddress.trim());
      setIsLoggedIn(true);
      setNewTransaction({
        sender: loginAddress.trim(),
        recipient: '',
        amount: 0
      });
      // Give initial 50 EKT to new user if balance is 0
      if (blockchain.getBalanceOfAddress(loginAddress.trim()) === 0) {
        blockchain.addTransaction({
          sender: 'network',
          recipient: loginAddress.trim(),
          amount: 50,
          timestamp: Date.now()
        });
        blockchain.minePendingTransactions(loginAddress.trim());
        setBlocks([...blockchain.getChain()]);
      }
    }
  };

  // Give all wallets an initial 50 EKT balance only on login
  const getWalletBalance = () => {
    return blockchain.getBalanceOfAddress(walletAddress);
  };

  return (
    <div className="min-h-screen bg-binance-dark text-white">
      {!isLoggedIn ? (
        <div className="flex items-center justify-center min-h-screen">
          <form onSubmit={handleLogin} className="bg-binance-gray-dark p-8 rounded-lg shadow-lg border border-binance-gray-medium w-full max-w-sm">
            <h2 className="text-2xl font-bold mb-6 text-binance-gold text-center">Login to Ektedar Coin</h2>
            <input
              type="text"
              placeholder="Enter your wallet address"
              className="w-full mb-4 px-4 py-3 rounded border border-binance-gray-light bg-binance-gray-medium focus:border-binance-gold outline-none transition-colors"
              value={loginAddress}
              onChange={e => setLoginAddress(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-binance-gold hover:bg-binance-gold-light text-binance-dark font-bold py-3 px-4 rounded transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      ) : (
        <>
          <nav className="bg-binance-gray-dark border-b border-binance-gray-medium">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Coins className="h-8 w-8 text-binance-gold" />
                  <span className="ml-2 text-xl font-bold text-binance-gold">Ektedar Coin</span>
                </div>
                <div className="flex items-center space-x-4 bg-binance-gray-medium px-4 py-2 rounded-lg">
                  <Wallet className="h-6 w-6 text-binance-gold" />
                  <span className="font-mono">{getWalletBalance()} EKT</span>
                </div>
              </div>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto px-4 py-8">
            {error && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-8 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                <span className="text-red-500">{error}</span>
              </div>
            )}

            {/* New Transaction Form */}
            <div className="bg-binance-gray-dark rounded-lg p-6 mb-8 border border-binance-gray-medium">
              <h2 className="text-xl font-bold mb-4 flex items-center text-binance-gold">
                <ArrowRightLeft className="h-6 w-6 mr-2" />
                New Transaction
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Recipient Address"
                    className="bg-binance-gray-medium rounded px-4 py-3 border border-binance-gray-light focus:border-binance-gold outline-none transition-colors"
                    value={newTransaction.recipient}
                    onChange={(e) => setNewTransaction({...newTransaction, recipient: e.target.value})}
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    className="bg-binance-gray-medium rounded px-4 py-3 border border-binance-gray-light focus:border-binance-gold outline-none transition-colors"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({...newTransaction, amount: Number(e.target.value)})}
                  />
                  <button
                    type="submit"
                    className="bg-binance-gold hover:bg-binance-gold-light text-binance-dark font-bold py-3 px-4 rounded transition-colors"
                  >
                    Send EKT
                  </button>
                </div>
              </form>
            </div>

            {/* Blockchain */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center text-binance-gold">
                <Box className="h-6 w-6 mr-2" />
                Blockchain Explorer
              </h2>
              {blocks.map((block) => (
                <div key={block.index} className="bg-binance-gray-dark rounded-lg p-6 border border-binance-gray-medium">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-binance-gray-light">Block</span>
                      <p className="font-mono text-binance-gold">{block.index}</p>
                    </div>
                    <div>
                      <span className="text-binance-gray-light">Nonce</span>
                      <p className="font-mono text-binance-gold">{block.nonce}</p>
                    </div>
                    <div>
                      <span className="text-binance-gray-light">Previous Hash</span>
                      <p className="font-mono text-xs truncate text-binance-gold-light">{block.previousHash}</p>
                    </div>
                    <div>
                      <span className="text-binance-gray-light">Hash</span>
                      <p className="font-mono text-xs truncate text-binance-gold-light">{block.hash}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <span className="text-binance-gray-light">Transactions</span>
                    {block.transactions.map((tx, index) => (
                      <div key={index} className="bg-binance-gray-medium rounded p-4 mt-2 border border-binance-gray-light">
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="truncate">
                            <span className="text-binance-gray-light">From: </span>
                            <span className="font-mono">{tx.sender}</span>
                          </div>
                          <div className="truncate">
                            <span className="text-binance-gray-light">To: </span>
                            <span className="font-mono">{tx.recipient}</span>
                          </div>
                          <div className="text-right font-mono text-binance-gold">
                            {tx.amount} EKT
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </main>

          {/* Stats Footer */}
          <footer className="bg-binance-gray-dark border-t border-binance-gray-medium mt-8">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-binance-gray-medium p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 mr-2 text-binance-gold" />
                    <p className="text-binance-gray-light">Mining Reward</p>
                  </div>
                  <p className="font-bold text-binance-gold text-xl">2 EKT</p>
                </div>
                <div className="bg-binance-gray-medium p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Shield className="h-5 w-5 mr-2 text-binance-gold" />
                    <p className="text-binance-gray-light">Difficulty</p>
                  </div>
                  <p className="font-bold text-binance-gold text-xl">{blockchain.getDifficulty()}</p>
                </div>
                <div className="bg-binance-gray-medium p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Box className="h-5 w-5 mr-2 text-binance-gold" />
                    <p className="text-binance-gray-light">Total Blocks</p>
                  </div>
                  <p className="font-bold text-binance-gold text-xl">{blocks.length}</p>
                </div>
                <div className="bg-binance-gray-medium p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <ArrowRightLeft className="h-5 w-5 mr-2 text-binance-gold" />
                    <p className="text-binance-gray-light">Transactions</p>
                  </div>
                  <p className="font-bold text-binance-gold text-xl">
                    {blocks.reduce((acc, block) => acc + block.transactions.length, 0)}
                  </p>
                </div>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}

export default App;