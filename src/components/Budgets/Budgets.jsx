import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import './Budgets.css';

const CATEGORIES = [
  'Alimentação', 'Mercado', 'Contas', 'Lazer', 
  'Investimentos', 'Transporte', 'Saúde', 'Outros'
];

const Budgets = () => {
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [selectedSource, setSelectedSource] = useState('all'); // 'all', walletID, ou cardID

  // Dados
  const [sources, setSources] = useState({ wallets: [], cards: [] });
  const [budgetLimits, setBudgetLimits] = useState({}); // { 'Lazer': 500, 'Mercado': 800 }
  const [spendingData, setSpendingData] = useState([]); // Array final para o gráfico/lista

  // Modal de Edição
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newLimit, setNewLimit] = useState('');

  // 1. Carrega as Fontes (Wallets e Cards) para o Filtro
  useEffect(() => {
    const fetchSources = async () => {
      const wSnap = await getDocs(collection(db, "wallets"));
      const cSnap = await getDocs(collection(db, "cards"));
      setSources({
        wallets: wSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        cards: cSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      });
    };
    fetchSources();
  }, []);

  // 2. O Grande Carregamento de Dados (Limites + Gastos)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // A. Busca Limites definidos para este mês
      // Estrutura no banco: collection 'budgets', docId = 'YYYY-MM_Categoria'
      const limitsObj = {};
      const budgetsSnap = await getDocs(query(collection(db, "budgets"), where("month", "==", currentMonth)));
      budgetsSnap.forEach(doc => {
        const data = doc.data();
        limitsObj[data.category] = Number(data.limit);
      });
      setBudgetLimits(limitsObj);

      // B. Busca Gastos Reais (Transações + Cartões)
      const spendingObj = {};
      CATEGORIES.forEach(cat => spendingObj[cat] = 0);

      // --- B1. Transações (Wallets) ---
      const isWalletFilter = sources.wallets.some(w => w.id === selectedSource);
      if (selectedSource === 'all' || isWalletFilter) {
        const qTrans = query(collection(db, "transactions"), where("type", "==", "saida"));
        const transSnap = await getDocs(qTrans);
        
        transSnap.docs.forEach(doc => {
          const t = doc.data();
          
          // --- FILTRO DE DUPLICIDADE ---
          // Se for pagamento de fatura, ignoramos, pois o gasto real 
          // já está sendo contabilizado via 'cardsShopping'
          if (t.category === 'Pagamento de Cartão') return; 

          const tDate = t.date?.toDate ? t.date.toDate() : new Date(t.date);
          const tMonth = tDate.toISOString().slice(0, 7);

          if (tMonth === currentMonth) {
            if (selectedSource === 'all' || t.walletId === selectedSource) {
              const cat = t.category || 'Outros';
              if (spendingObj[cat] !== undefined) spendingObj[cat] += Number(t.value);
            }
          }
        });
      }

      // --- B2. Compras (Cartões) ---
      // Se filtro for 'all' ou um ID de cartão
      const isCardFilter = sources.cards.some(c => c.id === selectedSource);
      if (selectedSource === 'all' || isCardFilter) {
        const qCards = query(collection(db, "cardsShopping")); // Pega tudo e filtra no JS (seguro para datas complexas)
        const cardsSnap = await getDocs(qCards);

        cardsSnap.docs.forEach(doc => {
          const c = doc.data();
          const cDate = c.date?.toDate ? c.date.toDate() : new Date(c.date);
          const cMonth = cDate.toISOString().slice(0, 7);

          // Importante: Aqui somamos as PARCELAS que caem neste mês
          if (cMonth === currentMonth) {
             if (selectedSource === 'all' || c.cardId === selectedSource) {
               const cat = c.category || 'Outros';
               // Usa totalValue (que na lógica de parcelas, já é o valor da parcela individual)
               if (spendingObj[cat] !== undefined) spendingObj[cat] += Number(c.totalValue);
             }
          }
        });
      }

      // C. Monta array final para o Gráfico e Lista
      const finalData = CATEGORIES.map(cat => {
        const limit = limitsObj[cat] || 0;
        const spent = spendingObj[cat] || 0;
        const percent = limit > 0 ? (spent / limit) * 100 : 0;
        
        return {
          name: cat,
          limit: limit,
          spent: spent,
          remaining: limit - spent,
          percent: percent
        };
      });

      setSpendingData(finalData);
      setLoading(false);
    };

    if (sources.wallets.length > 0 || sources.cards.length > 0) {
        fetchData();
    }
  }, [currentMonth, selectedSource, sources]);

  // Salvar novo limite
  const handleSaveLimit = async () => {
    if (!editingCategory) return;
    
    const docId = `${currentMonth}_${editingCategory}`;
    try {
      await setDoc(doc(db, "budgets", docId), {
        month: currentMonth,
        category: editingCategory,
        limit: Number(newLimit)
      });
      
      // Atualiza estado local rapidamente
      setBudgetLimits(prev => ({ ...prev, [editingCategory]: Number(newLimit) }));
      // Força refresh do useEffect alterando levemente ou chamando fetch
      // (Aqui vamos confiar no reload do useEffect na proxima render se precisasse, 
      // mas vamos atualizar o spendingData manualmente para ser instantaneo)
      setSpendingData(prev => prev.map(item => {
          if (item.name === editingCategory) {
              const val = Number(newLimit);
              return { ...item, limit: val, percent: val > 0 ? (item.spent / val) * 100 : 0 };
          }
          return item;
      }));

      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Erro ao salvar meta:", error);
    }
  };

  const openEdit = (category, currentLimit) => {
    setEditingCategory(category);
    setNewLimit(currentLimit || '');
    setIsEditModalOpen(true);
  };

  return (
    <div className="budgets-container">
      {/* HEADER E FILTROS */}
      <div className="budgets-header">
        <div className="header-title">
          <h2>Metas e Orçamentos</h2>
          <p>Planeje seus limites de gastos mensais</p>
        </div>

        <div className="budgets-filters">
           <input 
              type="month" 
              value={currentMonth} 
              onChange={e => setCurrentMonth(e.target.value)}
              className="filter-input"
           />
           <select 
              value={selectedSource} 
              onChange={e => setSelectedSource(e.target.value)}
              className="filter-select"
           >
             <option value="all">Todas as Fontes</option>
             <optgroup label="Carteiras / Contas">
               {sources.wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
             </optgroup>
             <optgroup label="Cartões de Crédito">
               {sources.cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
             </optgroup>
           </select>
        </div>
      </div>

      {/* GRÁFICO GERAL (RECHARTS) */}
      <div className="budgets-chart-section">
        <h3>Panorama Geral</h3>
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
            <BarChart data={spendingData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 12}} interval={0} />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="spent" name="Gasto Real" fill="#8884d8" radius={[4, 4, 0, 0]} />
                {/* Linha de referência visual ou barra de fundo para o limite poderia ser usada, 
                    mas duas barras lado a lado fica mais claro */}
                <Bar dataKey="limit" name="Meta Definida" fill="#82ca9d" radius={[4, 4, 0, 0]} />
            </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* LISTA DETALHADA COM BARRAS DE PROGRESSO */}
      <div className="budgets-list">
        {spendingData.map((item) => {
          // Cores dinâmicas
          let progressColor = '#2ecc71'; // Verde
          if (item.percent > 75) progressColor = '#f1c40f'; // Amarelo
          if (item.percent >= 100) progressColor = '#e74c3c'; // Vermelho

          return (
            <div key={item.name} className="budget-card" onClick={() => openEdit(item.name, item.limit)}>
              <div className="budget-card-header">
                <span className="cat-name">{item.name}</span>
                <span className="cat-values">
                  <strong>{item.spent.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</strong>
                  {' / '}
                  <small>{item.limit > 0 ? item.limit.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}) : 'Sem meta'}</small>
                </span>
              </div>
              
              <div className="progress-bg">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${Math.min(item.percent, 100)}%`, 
                    backgroundColor: progressColor 
                  }}
                ></div>
              </div>
              
              <div className="budget-status">
                {item.limit > 0 ? (
                    item.remaining >= 0 
                    ? <span style={{color: '#7f8c8d'}}>Resta: R$ {item.remaining.toFixed(2)}</span>
                    : <span style={{color: '#c0392b', fontWeight: 'bold'}}>Excedeu: R$ {Math.abs(item.remaining).toFixed(2)}</span>
                ) : (
                    <span className="set-goal-text">Definir Meta +</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DE EDIÇÃO SIMPLES */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth: '300px'}}>
            <h3>Meta: {editingCategory}</h3>
            <p style={{fontSize: '0.9rem', color: '#666'}}>Defina o teto de gastos para {currentMonth}</p>
            
            <input 
                type="number" 
                value={newLimit} 
                onChange={e => setNewLimit(e.target.value)} 
                placeholder="R$ 0,00"
                autoFocus
                style={{width: '100%', padding: '10px', fontSize: '1.2rem', margin: '15px 0', border: '1px solid #ddd', borderRadius: '6px'}}
            />

            <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setIsEditModalOpen(false)}>Cancelar</button>
                <button className="save-btn" onClick={handleSaveLimit}>Salvar Meta</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;