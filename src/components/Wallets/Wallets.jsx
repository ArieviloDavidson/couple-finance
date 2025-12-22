import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import WalletsForm from '../WalletsForm/WalletsForm';
import './Wallets.css';

const Wallets = () => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Busca dados em Tempo Real
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'wallets'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWallets(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Adicionar Carteira
  const handleAddWallet = async (newWallet) => {
    try {
      await addDoc(collection(db, 'wallets'), {
        ...newWallet,
        createdAt: new Date()
      });
    } catch (error) {
      console.error("Erro ao criar carteira:", error);
      alert("Erro ao salvar.");
    }
  };

  // Deletar Carteira
  const handleDeleteWallet = async (id) => {
    if (window.confirm("Tem certeza? Isso não apaga o histórico de transações, mas remove a carteira.")) {
      try {
        await deleteDoc(doc(db, 'wallets', id));
      } catch (error) {
        console.error("Erro ao deletar:", error);
      }
    }
  };

  // Helper para formatar o tipo (de 'conta_corrente' para 'Conta Corrente')
  const formatType = (type) => {
    const types = {
      'conta_corrente': 'Conta Corrente',
      'vale_alimentacao': 'Vale Alimentação',
      'dinheiro': 'Dinheiro',
      'poupanca': 'Poupança'
    };
    return types[type] || type;
  };

  // Cálculo do Saldo Total Acumulado
  const totalBalance = wallets.reduce((acc, w) => acc + (w.currentBalance || 0), 0);

  if (loading) return <div className="loading">Carregando carteiras...</div>;

  return (
    <div className="wallets-wrapper">
      <div className="header-actions">
        <h2>Minhas Carteiras</h2>
        <button className="btn-new-wallet" onClick={() => setIsModalOpen(true)}>
          + Nova Carteira
        </button>
      </div>

      {/* Card de Resumo Total */}
      <div className="total-balance-card">
        <span>Saldo Total Disponível</span>
        <strong>{totalBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
      </div>

      <div className="wallets-grid">
        {wallets.map(wallet => (
          <div 
            key={wallet.id} 
            className="wallet-item"
            style={{ borderLeft: `6px solid ${wallet.color || '#ccc'}` }}
          >
            <button className="btn-delete-wallet" onClick={() => handleDeleteWallet(wallet.id)}>&times;</button>
            
            <div className="wallet-info">
              <h3>{wallet.name}</h3>
              <span className="wallet-type">{formatType(wallet.type)}</span>
            </div>

            <div className="wallet-balance">
              <small>Saldo Atual</small>
              <strong>
                {Number(wallet.currentBalance).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </strong>
            </div>
          </div>
        ))}
      </div>

      <WalletsForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleAddWallet} 
      />
    </div>
  );
};

export default Wallets;