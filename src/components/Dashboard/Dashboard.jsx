import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore'; 
import { db } from '../../firebase'; 
import FixedExpenses from '../FixedExpenses/FixedExpenses';
import ChartExpensesCategory from '../Charts/ChartExpensesCategory';
import ChartCreditLimit from '../Charts/ChartCreditLimit';
import FixedEntries from '../FixedEntries/FixedEntries'; 
import './Dashboard.css';

const Dashboard = () => {
  const [totalBalance, setTotalBalance] = useState(0);
  const [isEntriesModalOpen, setIsEntriesModalOpen] = useState(false);

  // Novos estados para a Previsão
  const [totalFixedEntries, setTotalFixedEntries] = useState(0);
  const [totalFixedExpenses, setTotalFixedExpenses] = useState(0);

  // 1. Busca Saldo Total (Wallets)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'wallets'), (snapshot) => {
      const total = snapshot.docs.reduce((acc, doc) => acc + Number(doc.data().currentBalance || 0), 0);
      setTotalBalance(total);
    });
    return () => unsubscribe();
  }, []);

  // 2. Busca Total de Entradas Fixas
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'fixedEntries'), (snapshot) => {
      const total = snapshot.docs.reduce((acc, doc) => acc + Number(doc.data().value || 0), 0);
      setTotalFixedEntries(total);
    });
    return () => unsubscribe();
  }, []);

  // 3. Busca Total de Despesas Fixas
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'livingExpenses'), (snapshot) => {
      const total = snapshot.docs.reduce((acc, doc) => acc + Number(doc.data().value || 0), 0);
      setTotalFixedExpenses(total);
    });
    return () => unsubscribe();
  }, []);

  // Cálculo da Previsão (Sobra)
  const predictionValue = totalFixedEntries - totalFixedExpenses;

  return (
    <div className="dashboard-container">
      
      <div className="dashboard-header">
        <div className="header-text">
          <h1>Visão Geral</h1>
          <p>Bem-vindos ao Couple Finance</p>
          
          <button 
            className="btn-view-entries" 
            onClick={() => setIsEntriesModalOpen(true)}
          >
            Ver Entradas Fixas
          </button>
        </div>

        {/* Container para os Cards ficarem lado a lado */}
        <div className="header-cards">
            
            {/* NOVO CARD: Previsão */}
            <div className="dashboard-card prediction-card">
                <span>Previsão (Fixos)</span>
                <strong style={{ color: predictionValue >= 0 ? '#2c3e50' : '#c0392b' }}>
                    {predictionValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </strong>
            </div>

            {/* Card Existente: Saldo */}
            <div className="dashboard-card balance-card">
                <span>Saldo Disponível</span>
                <strong>
                    {totalBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </strong>
            </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <FixedExpenses />
        <ChartExpensesCategory />
        <ChartCreditLimit />
      </div>

      <FixedEntries 
        isOpen={isEntriesModalOpen} 
        onClose={() => setIsEntriesModalOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;