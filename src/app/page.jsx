"use client";
import React, { useEffect, useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { FiRefreshCw } from "react-icons/fi";

const SolanaTable = () => {
  const [solanaData, setSolanaData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial data fetch
    const fetchData = async () => {
      try {
        const response = await fetch("/2sol.csv");
        const text = await response.text();
        const rows = text.split("\r\n").map((row) => row.split(","));
        setSolanaData(rows);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching CSV data:", error);
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const calculateProfit = (currentBalance) => {
    const initialBalance = 2; // Initial balance of 2 SOL
    const profitPercentage = ((currentBalance - initialBalance) / initialBalance) * 100;
    return profitPercentage.toFixed(2) + "%";
  };

  const handleRefresh = () => {
    const connection = new Connection("https://solana-mainnet.g.alchemy.com/v2/jpDvTgIhjuxpoVO-__cc8emTHMvpMgTw");
    const fetchBalances = async () => {
      setIsLoading(true);
      try {
        const publicKeys = solanaData.map(([address]) => new PublicKey(address));
        const accountInfos = await connection.getMultipleAccountsInfo(publicKeys);
        const updatedData = solanaData.map(([address, username], index) => {
          const accountInfo = accountInfos[index];
          if (accountInfo) {
            const solBalance = accountInfo.lamports / 1e9;
            const profit = calculateProfit(solBalance);
            return [address, username, solBalance.toFixed(4), profit];
          } else {
            return [address, username, "Error", "N/A"];
          }
        });

        setSolanaData(updatedData);
      } catch (error) {
        console.error("Error fetching balances:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBalances();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold text-gray-800">1000xGem Group 2 Sol Challenge</h1>
        
        <button
          onClick={handleRefresh}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center"
          disabled={isLoading}
        >
          <FiRefreshCw className="mr-2" />
          {isLoading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <label className="text-gray-800">Total: {solanaData.length}</label>
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Solana Address</th>
                <th className="py-3 px-6 text-left">Telegram Username</th>
                <th className="py-3 px-6 text-right">Balance (SOL)</th>
                <th className="py-3 px-6 text-right">Profit</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {solanaData.map(([address, username, balance, profit], index) => (
                <tr
                  key={index}
                  className="border-b border-gray-200 hover:bg-gray-100"
                >
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="font-medium">{address}</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-left">
                    <div className="flex items-center">
                      <span>{username}</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-right">
                    <span
                      className={`font-medium ${
                        balance === "Error"
                          ? "text-red-500"
                          : parseFloat(balance) > 0
                          ? "text-green-500"
                          : "text-gray-500"
                      }`}
                    >
                      {balance}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-right">
                    <span
                      className={`font-medium ${
                        profit === "N/A"
                          ? "text-gray-500"
                          : parseFloat(profit) > 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {profit}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SolanaTable;