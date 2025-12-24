import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore'; 
import { db } from '../../firebase'; 
import FixedExpenses from '../FixedExpenses/FixedExpenses';
import ChartExpensesCategory from '../Charts/ChartExpensesCategory';
import ChartCreditLimit from '../Charts/ChartCreditLimit';
import FixedEntries from '../FixedEntries/FixedEntries'; // <--- Import do Novo Componente
import './Dashboard.css';

const Dashboard = () => {
  const [totalBalance, setTotalBalance] = useState(0);
  const [isEntriesModalOpen, setIsEntriesModalOpen] = useState(false); // <--- Estado do Modal

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
      
      <div className="dashboard-header">
        <div className="header-text">
          <h1>Visão Geral</h1>
          <p>Bem-vindos ao Couple Finance</p>
          
          {/* BOTÃO NOVO */}
          <button 
            className="btn-view-entries" 
            onClick={() => setIsEntriesModalOpen(true)}
          >
            Ver Entradas Fixas
          </button>
        </div>

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

      {/* RENDERIZAÇÃO DO MODAL */}
      <FixedEntries 
        isOpen={isEntriesModalOpen} 
        onClose={() => setIsEntriesModalOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;