import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore'; // Imports Firebase
import { db } from '../../firebase'; // Import DB
import FixedExpenses from '../FixedExpenses/FixedExpenses';
import ChartExpensesCategory from '../Charts/ChartExpensesCategory';
import ChartCreditLimit from '../Charts/ChartCreditLimit';
import './Dashboard.css';

const Dashboard = () => {
  const [totalBalance, setTotalBalance] = useState(0);

  // Busca e soma o saldo das carteiras em tempo real
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'wallets'), (snapshot) => {
      const total = snapshot.docs.reduce((acc, doc) => {
        return acc + Number(doc.data().currentBalance || 0);
      }, 0);
      setTotalBalance(total);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="dashboard-container">
      
      {/* Header agora é um container Flex */}
      <div className="dashboard-header">
        <div className="header-text">
          <h1>Visão Geral</h1>
          <p>Bem-vindos ao Couple Finance</p>
        </div>

        {/* Card de Saldo Total (Igual ao da aba Wallets) */}
        <div className="dashboard-balance-card">
          <span>Saldo Total Disponível</span>
          <strong>
            {totalBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </strong>
        </div>
      </div>

      <div className="dashboard-grid">
        <FixedExpenses />
        <ChartExpensesCategory />
        <ChartCreditLimit />
      </div>
    </div>
  );
};

export default Dashboard;