// src/components/CardForm/CardForm.jsx
import React, { useState } from 'react';
import CurrencyInput from '../CurrencyInput/CurrencyInput';
import './CardForm.css';

// 1. Definimos o estado inicial fora ou dentro para poder reutilizar
const initialFormData = {
  name: '',
  color: '',
  flag: '',
  limit: '',
  closingDay: '',
  dueDay: ''
};

const CardForm = ({ isOpen, onClose, onSave }) => {
  // 2. Usamos o estado inicial aqui
  const [formData, setFormData] = useState(initialFormData);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);

    // 3. CORREÇÃO: Reseta o formulário para o estado inicial
    setFormData(initialFormData);

    onClose();
  };

  // Função opcional para limpar também ao cancelar (se desejar)
  const handleCancel = () => {
    setFormData(initialFormData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Novo Cartão</h3>
          <button className="close-btn" onClick={handleCancel}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome do Cartão</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Nubank Roxo"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Cor</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="color-input"
                placeholder='Ex: #000000'
              />
            </div>
            <div className="form-group">
              <label>Bandeira</label>
              <input
                type="text"
                name="flag"
                value={formData.flag}
                onChange={handleChange}
                placeholder="Ex: Mastercard"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Limite (R$)</label>
            <CurrencyInput
              name="limit"
              value={formData.limit}
              onChange={handleChange}
              placeholder="5000,00"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Dia Fechamento</label>
              <input
                type="number"
                name="closingDay"
                value={formData.closingDay}
                onChange={handleChange}
                min="1" max="31"
                required
              />
            </div>
            <div className="form-group">
              <label>Dia Vencimento</label>
              <input
                type="number"
                name="dueDay"
                value={formData.dueDay}
                onChange={handleChange}
                min="1" max="31"
                required
              />
            </div>
          </div>

          <div className="modal-actions">
            {/* Atualizei o onClick para handleCancel para limpar também se o usuário desistir */}
            <button type="button" onClick={handleCancel} className="cancel-btn">Cancelar</button>
            <button type="submit" className="save-btn">Salvar Cartão</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CardForm;