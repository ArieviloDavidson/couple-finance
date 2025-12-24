import React from 'react';
import './FixedEntries.css';

const FixedEntries = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Entradas Fixas (Receitas Recorrentes)</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          {/* Aqui entrará a lógica depois */}
          <p style={{ color: '#777', textAlign: 'center', padding: '20px' }}>
            Aguardando implementação do conteúdo...
          </p>
        </div>
      </div>
    </div>
  );
};

export default FixedEntries;