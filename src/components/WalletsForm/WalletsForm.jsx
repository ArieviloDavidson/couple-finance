import React, { useState } from 'react';
import CurrencyInput from '../CurrencyInput/CurrencyInput';
import './WalletsForm.css';

const WalletsForm = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'conta_corrente', // Valor padrão
    currentBalance: '',
    color: '#2ecc71' // Um verde padrão
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Envia para o pai (convertendo saldo para número)
    onSave({
      ...formData,
      currentBalance: Number(formData.currentBalance)
    });
    onClose();
    // Reset do form
    setFormData({ name: '', type: 'conta_corrente', currentBalance: '', color: '#2ecc71' });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Nova Carteira</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome da Carteira</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Conta Nubank, Vale Alimentação..."
              required
            />
          </div>

          <div className="form-group">
            <label>Tipo</label>
            <select name="type" value={formData.type} onChange={handleChange}>
              <option value="conta_corrente">Conta Corrente</option>
              <option value="vale_alimentacao">Vale Alimentação / Refeição</option>
              <option value="dinheiro">Dinheiro (Espécie)</option>
              <option value="poupanca">Poupança / Reserva</option>
            </select>
          </div>

          <div className="form-group">
            <label>Saldo Atual (R$)</label>
            <CurrencyInput
              name="currentBalance"
              value={formData.currentBalance}
              onChange={handleChange}
              required
            />
            <small>Quanto tem nessa conta HOJE?</small>
          </div>

          <div className="form-group">
            <label>Cor de Identificação</label>
            <input
              type="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="color-input"
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">Cancelar</button>
            <button type="submit" className="save-btn">Salvar Carteira</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WalletsForm;