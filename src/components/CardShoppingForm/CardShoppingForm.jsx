import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import './CardShoppingForm.css';

const CATEGORIES = ['Alimentação', 'Mercado', 'Contas', 'Lazer', 'Eletrônicos', 'Saúde', 'Outros'];

const CardShoppingForm = ({ isOpen, onClose, onSave }) => {
  const [cards, setCards] = useState([]);
  const [formData, setFormData] = useState({
    description: '',
    totalValue: '',
    installments: 1,
    date: new Date().toISOString().split('T')[0],
    cardId: '',
    category: ''
  });

  // Busca os cartões para o Select
  useEffect(() => {
    const fetchCards = async () => {
      if (isOpen) {
        const snap = await getDocs(collection(db, "cards"));
        setCards(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    };
    fetchCards();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const total = Number(formData.totalValue);
    const parcels = Number(formData.installments);
    
    // --- CORREÇÃO DE DATA AQUI (Igual ao TransactionForm) ---
    // 1. Quebra a string "YYYY-MM-DD"
    const [year, month, day] = formData.date.split('-');

    // 2. Cria a data manualmente ao meio-dia para evitar problemas de fuso (UTC-3)
    const dateFixed = new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0);

    onSave({
      ...formData,
      totalValue: total,
      installments: parcels,
      installmentValue: total / parcels,
      date: dateFixed, // <--- Salva a data corrigida (Objeto Date)
      status: 'aberto'
    });
    
    onClose();
    
    setFormData({
      description: '', 
      totalValue: '', 
      installments: 1, 
      date: new Date().toISOString().split('T')[0], 
      cardId: '', 
      category: ''
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Compra no Crédito</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>O que comprou?</label>
            <input type="text" name="description" value={formData.description} onChange={handleChange} required placeholder="Ex: iPhone, Jantar..." />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Valor Total (R$)</label>
              <input type="number" name="totalValue" value={formData.totalValue} onChange={handleChange} step="0.01" required />
            </div>
            <div className="form-group">
              <label>Parcelas</label>
              <input type="number" name="installments" value={formData.installments} onChange={handleChange} min="1" max="24" required />
            </div>
          </div>

          <div className="form-row">
             <div className="form-group">
              <label>Cartão</label>
              <select name="cardId" value={formData.cardId} onChange={handleChange} required>
                <option value="" disabled>Selecione...</option>
                {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Categoria</label>
              <select name="category" value={formData.category} onChange={handleChange} required>
                <option value="" disabled>Selecione...</option>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

           <div className="form-group">
            <label>Data da Compra</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} required />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">Cancelar</button>
            <button type="submit" className="save-btn">Lançar Compra</button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CardShoppingForm;