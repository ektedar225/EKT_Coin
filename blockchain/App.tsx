import React, { useState, useEffect } from 'react';
import { Coins, Box, ArrowRightLeft, Wallet, Clock, Shield, AlertCircle, XCircle, Search, Plus, LogIn, LogOut, User } from 'lucide-react';
import { Blockchain } from './blockchain/Blockchain';
import { Transaction } from './blockchain/Transaction';

function App() {
  const [blockchain] = useState(new Blockchain());
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loginId, setLoginId] = useState('');
  const [blocks, setBlocks] = useState(blockchain.getChain());
  const [newTransaction, setNewTransaction] = useState({
    sender: '',
    recipient: '',
    amount: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [failedTransactions, setFailedTransactions] = useState<Transaction[]>([]);
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [addBalanceData, setAddBalanceData] = useState({
    address: '',
    amount: 0
  });

  useEffect(() => {
    setBlocks(blockchain.getChain());
    setFailedTransactions(blockchain.getFailedTransactions());
  }, [blockchain]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginId.trim()) {
      setCurrentUser(loginId);
      setNewTransaction(prev => ({ ...prev, sender: loginId }));
      setError(null);
  
      // 💰 Add 50 EKT to new users by checking if they already have a balance
      const existingBalance = blockchain.getBalanceOfAddress(loginId);
      if (existingBalance === 0) {
        blockchain.addBalance(loginId, 50); // Add default 50 EKT
        setBlocks([...blockchain.getChain()]); // Update UI
      }
    }
  };
  

  const handleLogout = () => {
    setCurrentUser(null);
    setNewTransaction({
      sender: '',
      recipient: '',
      amount: 0
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Please login first');
      return;
    }
    try {
      const transaction: Transaction = {
        ...newTransaction,
        sender: currentUser,
        timestamp: Date.now(),
        status: 'success'
      };
      
      blockchain.addTransaction(transaction);
      blockchain.minePendingTransactions(currentUser);
      
      setBlocks([...blockchain.getChain()]);
      setFailedTransactions(blockchain.getFailedTransactions());
      setNewTransaction({
        sender: currentUser,
        recipient: '',
        amount: 0
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setFailedTransactions(blockchain.getFailedTransactions());
    }
  };

  const handleAddBalance = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      blockchain.addBalance(addBalanceData.address, addBalanceData.amount);
      setBlocks([...blockchain.getChain()]);
      setAddBalanceData({ address: '', amount: 0 });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleFilterTransactions = () => {
    if (address1 && address2) {
      const transactions = blockchain.getTransactionsBetweenAddresses(address1, address2);
      setFilteredTransactions(transactions);
    }
  };

  const getWalletBalance = () => {
    return currentUser ? blockchain.getBalanceOfAddress(currentUser) : 0;
  };

  const getUserTransactions = () => {
    return currentUser ? blockchain.getUserTransactions(currentUser) : [];
  };

  return (
    <div className="min-h-screen bg-binance-dark text-white">
      <nav className="bg-binance-gray-dark border-b border-binance-gray-medium">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Coins className="h-8 w-8 text-binance-gold" />
              <span className="ml-2 text-xl font-bold text-binance-gold">Ektedar Coin</span>
            </div>
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <>
                  <div className="flex items-center bg-binance-gray-medium px-4 py-2 rounded-lg mr-4">
                    <User className="h-5 w-5 text-binance-gold mr-2" />
                    <span className="font-mono text-binance-gold">{currentUser}</span>
                  </div>
                  <div className="flex items-center bg-binance-gray-medium px-4 py-2 rounded-lg mr-4">
                    <Wallet className="h-5 w-5 text-binance-gold mr-2" />
                    <span className="font-mono">{getWalletBalance()} EKT</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <form onSubmit={handleLogin} className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter Wallet ID"
                    className="bg-binance-gray-medium rounded px-4 py-2 border border-binance-gray-light focus:border-binance-gold outline-none transition-colors"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="flex items-center bg-binance-gold hover:bg-binance-gold-light text-binance-dark px-4 py-2 rounded-lg transition-colors"
                  >
                    <LogIn className="h-5 w-5 mr-2" />
                    Login
                  </button>
                </form>
              )}
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

        {currentUser && (
          <>
            {/* New Transaction Form */}
            <div className="bg-binance-gray-dark rounded-lg p-6 mb-8 border border-binance-gray-medium">
              <h2 className="text-xl font-bold mb-4 flex items-center text-binance-gold">
                <ArrowRightLeft className="h-6 w-6 mr-2" />
                New Transaction
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
                <button
                  type="submit"
                  className="w-full bg-binance-gold hover:bg-binance-gold-light text-binance-dark font-bold py-3 px-4 rounded transition-colors"
                >
                  Send EKT
                </button>
              </form>
            </div>

            {/* User Transactions */}
            <div className="bg-binance-gray-dark rounded-lg p-6 mb-8 border border-binance-gray-medium">
              <h2 className="text-xl font-bold mb-4 flex items-center text-binance-gold">
                <ArrowRightLeft className="h-6 w-6 mr-2" />
                My Transactions
              </h2>
              {getUserTransactions().map((tx, index) => (
                <div key={index} className={`bg-binance-gray-medium rounded p-4 mt-2 border ${
                  tx.status === 'failed' ? 'border-red-500' : 'border-binance-gray-light'
                }`}>
                  <div className="grid grid-cols-4 gap-2 text-sm">
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
                    <div className={`text-right ${tx.status === 'failed' ? 'text-red-500' : 'text-green-500'}`}>
                      {tx.status}
                    </div>
                  </div>
                  {tx.failureReason && (
                    <div className="mt-2 text-sm text-red-400">
                      Reason: {tx.failureReason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Transaction Filter */}
        <div className="bg-binance-gray-dark rounded-lg p-6 mb-8 border border-binance-gray-medium">
          <h2 className="text-xl font-bold mb-4 flex items-center text-binance-gold">
            <Search className="h-6 w-6 mr-2" />
            Filter Transactions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Address 1"
              className="bg-binance-gray-medium rounded px-4 py-3 border border-binance-gray-light focus:border-binance-gold outline-none transition-colors"
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
            />
            <input
              type="text"
              placeholder="Address 2"
              className="bg-binance-gray-medium rounded px-4 py-3 border border-binance-gray-light focus:border-binance-gold outline-none transition-colors"
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
            />
            <button
              onClick={handleFilterTransactions}
              className="bg-binance-gold hover:bg-binance-gold-light text-binance-dark font-bold py-3 px-4 rounded transition-colors"
            >
              Filter
            </button>
          </div>
          {filteredTransactions.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2 text-binance-gold">Filtered Transactions</h3>
              {filteredTransactions.map((tx, index) => (
                <div key={index} className={`bg-binance-gray-medium rounded p-4 mt-2 border ${
                  tx.status === 'failed' ? 'border-red-500' : 'border-binance-gray-light'
                }`}>
                  <div className="grid grid-cols-4 gap-2 text-sm">
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
                    <div className={`text-right ${tx.status === 'failed' ? 'text-red-500' : 'text-green-500'}`}>
                      {tx.status}
                    </div>
                  </div>
                  {tx.failureReason && (
                    <div className="mt-2 text-sm text-red-400">
                      Reason: {tx.failureReason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Failed Transactions */}
        {failedTransactions.length > 0 && (
          <div className="bg-binance-gray-dark rounded-lg p-6 mb-8 border border-red-500/20">
            <h2 className="text-xl font-bold mb-4 flex items-center text-red-500">
              <XCircle className="h-6 w-6 mr-2" />
              Failed Transactions
            </h2>
            {failedTransactions.map((tx, index) => (
              <div key={index} className="bg-binance-gray-medium rounded p-4 mt-2 border border-red-500/50">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="truncate">
                    <span className="text-binance-gray-light">From: </span>
                    <span className="font-mono">{tx.sender}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-binance-gray-light">To: </span>
                    <span className="font-mono">{tx.recipient}</span>
                  </div>
                  <div className="text-right font-mono text-red-500">
                    {tx.amount} EKT
                  </div>
                </div>
                <div className="mt-2 text-sm text-red-400">
                  Reason: {tx.failureReason}
                </div>
              </div>
            ))}
          </div>
        )}

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
              <p className="font-bold text-binance-gold text-xl">5 EKT</p>
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
    </div>
  );
}

export default App;