import React from 'react';
import './CurrencyInput.css';

const CurrencyInput = ({ value, onChange, name, placeholder = "0,00", required = false, className = '' }) => {

    // Função para formatar o valor numérico (float) para string "R$ X.XXX,XX" ou apenas "X.XXX,XX"
    const formatCurrency = (val) => {
        if (!val) return '';
        // Converte para número e formata
        return Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    };

    const handleChange = (e) => {
        let inputValue = e.target.value;

        // 1. Remove tudo que não é número
        const numericValue = inputValue.replace(/\D/g, '');

        // 2. Converte para float (divide por 100 para considerar os centavos)
        const floatValue = Number(numericValue) / 100;

        // 3. Propaga o evento fake para o pai (mantendo a interface do input nativo)
        // O pai receberá o valor NUMÉRICO puro (float)
        if (onChange) {
            onChange({
                target: {
                    name: name,
                    value: floatValue
                }
            });
        }
    };

    return (
        <input
            type="text"
            inputMode="numeric"
            name={name}
            value={value ? formatCurrency(value) : ''}
            onChange={handleChange}
            placeholder={placeholder}
            className={`currency-input ${className}`}
            required={required}
            autoComplete="off"
        />
    );
};

export default CurrencyInput;
