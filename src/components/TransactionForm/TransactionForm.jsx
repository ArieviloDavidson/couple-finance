import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import './TransactionForm.css';

// Constantes de categorias para evitar erros de digitação e facilitar manutenção
const CATEGORIES = {
  entrada: [
    'Salário', 
    'Renda Extra', 
    'Investimentos (Resgate)', 
    'Presente', 
    'Outros'
  ],
  saida: [
    'Alimentação', // Restaurantes, iFood
    'Mercado',     // Compras do mês
    'Contas',      // Luz, Internet, Aluguel
    'Lazer',       // Cinema, Viagem
    'Investimentos', // Aporte
    'Transporte',
    'Saúde',
    'Pagamento de Cartão',
    'Outros'
  ]
};

const TransactionForm = ({ isOpen, onClose, onSave }) => {
  const [wallets, setWallets] = useState([]);
  
  const [formData, setFormData] = useState({
    description: '',
    value: '',
    type: 'saida', 
    date: new Date().toISOString().split('T')[0],
    walletId: '',
    category: '' // Novo campo iniciando vazio
  });

  // Busca carteiras
  useEffect(() => {
    const fetchWallets = async () => {
      if (isOpen) {
        const querySnapshot = await getDocs(collection(db, "wallets"));
        const walletsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setWallets(walletsData);
      }
    };
    fetchWallets();
  }, [isOpen]);

  // Se o usuário mudar o TIPO (entrada/saida), resetamos a categoria
  // para ele não salvar uma Saída com categoria de "Salário", por exemplo.
  useEffect(() => {
    setFormData(prev => ({ ...prev, category: '' }));
  }, [formData.type]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const selectedWallet = wallets.find(w => w.id === formData.walletId);

    // --- CORREÇÃO DE DATA AQUI ---
    // 1. Quebramos a string "YYYY-MM-DD" em pedaços
    const [year, month, day] = formData.date.split('-');

    // 2. Criamos a data manualmente.
    // O mês em JS começa em 0 (Janeiro = 0, Dezembro = 11), por isso o "month - 1".
    // Definimos a hora para 12:00 (meio-dia) para evitar qualquer risco de fuso horário 
    // jogar para o dia anterior ou posterior.
    const dateFixed = new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0);

    onSave({
      ...formData,
      value: Number(formData.value),
      date: dateFixed, // Usamos a data corrigida
      walletName: selectedWallet ? selectedWallet.name : 'Desconhecida'
    });
    
    onClose();
    // Reset Total
    setFormData({
        description: '',
        value: '',
        type: 'saida',
        date: new Date().toISOString().split('T')[0],
        walletId: '',
        category: ''
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Nova Movimentação</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Descrição */}
          <div className="form-group">
            <label>Descrição</label>
            <input 
              type="text" name="description" 
              value={formData.description} onChange={handleChange} 
              placeholder="Ex: Mercado Semanal, Jantar..." required 
            />
          </div>

          {/* Valor e Tipo (Lado a Lado) */}
          <div className="form-row">
            <div className="form-group">
              <label>Valor (R$)</label>
              <input 
                type="number" name="value" 
                value={formData.value} onChange={handleChange} 
                step="0.01" required 
              />
            </div>
            <div className="form-group">
              <label>Tipo</label>
              <select name="type" value={formData.type} onChange={handleChange}>
                <option value="saida">Saída (Gasto)</option>
                <option value="entrada">Entrada (Ganho)</option>
              </select>
            </div>
          </div>

          {/* Data e Categoria (Lado a Lado) - NOVO LAYOUT */}
          <div className="form-row">
            <div className="form-group">
              <label>Data</label>
              <input 
                type="date" name="date" 
                value={formData.date} onChange={handleChange} required 
              />
            </div>
            
            <div className="form-group">
              <label>Categoria</label>
              <select 
                name="category" 
                value={formData.category} 
                onChange={handleChange} 
                required
              >
                <option value="" disabled>Selecione...</option>
                {/* Renderiza as opções baseado no TIPO selecionado */}
                {CATEGORIES[formData.type].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Carteira */}
          <div className="form-group">
            <label>Carteira (Origem/Destino)</label>
            <select name="walletId" value={formData.walletId} onChange={handleChange} required>
              <option value="" disabled>Selecione uma carteira</option>
              {wallets.map(wallet => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name} (Saldo: R$ {Number(wallet.currentBalance).toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">Cancelar</button>
            <button type="submit" className="save-btn">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;