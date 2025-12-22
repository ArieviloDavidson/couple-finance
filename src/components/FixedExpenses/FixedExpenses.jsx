import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import './FixedExpenses.css';
import FixedExpensePayModal from './FixedExpensesPayModal'; // Importe o Modal

const FixedExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [newItem, setNewItem] = useState({ description: '', value: '' });
  
  // Estado para controlar o modal de pagamento
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'livingExpenses'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExpenses(data);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newItem.description || !newItem.value) return;

    try {
      await addDoc(collection(db, 'livingExpenses'), {
        description: newItem.description,
        value: Number(newItem.value)
      });
      setNewItem({ description: '', value: '' });
    } catch (error) {
      console.error("Erro ao adicionar:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'livingExpenses', id));
    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
  };

  const totalPredicted = expenses.reduce((acc, item) => acc + (item.value || 0), 0);

  // Abre o modal para o item específico
  const openPayModal = (item) => {
    setSelectedExpense(item);
    setPayModalOpen(true);
  };

  return (
    <div className="fixed-card">
      <div className="fixed-header">
        <h3>Despesas Fixas</h3>
        <div className="predicted-badge">
          <small>Previsão Mensal</small>
          <strong>
            {totalPredicted.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </strong>
        </div>
      </div>

      <div className="fixed-list">
        {expenses.map(item => (
          <div key={item.id} className="fixed-item">
            <div className="fixed-info">
               <span>{item.description}</span>
            </div>
            
            <div className="fixed-item-right">
              <strong>
                {item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </strong>
              
              {/* BOTÃO GERAR/PAGAR */}
              <button 
                className="btn-generate-expense" 
                onClick={() => openPayModal(item)}
                title="Gerar despesa deste mês"
              >
                ▶
              </button>

              <button onClick={() => handleDelete(item.id)} className="btn-remove-fixed">&times;</button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="fixed-form">
        <input 
          type="text" 
          placeholder="Nova despesa (ex: Internet)" 
          value={newItem.description}
          onChange={e => setNewItem({...newItem, description: e.target.value})}
        />
        <input 
          type="number" 
          placeholder="R$" 
          value={newItem.value}
          onChange={e => setNewItem({...newItem, value: e.target.value})}
        />
        <button type="submit">+</button>
      </form>

      {/* RENDERIZA O MODAL */}
      <FixedExpensePayModal 
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        expenseItem={selectedExpense}
      />
    </div>
  );
};

export default FixedExpenses;