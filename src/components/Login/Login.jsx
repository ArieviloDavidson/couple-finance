import React from 'react';
import { signInWithPopup, signOut } from "firebase/auth"; // Importe signOut
import { auth, googleProvider } from '../../firebase';
import './Login.css';

// --- CONFIGURAÇÃO DE SEGURANÇA ---
const ALLOWED_EMAILS = [
  "davidsondodc2106@gmail.com",
  "dudsbarros2002d@gmail.com"
];

const Login = () => {
  
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // VERIFICAÇÃO DE SEGURANÇA
      if (!ALLOWED_EMAILS.includes(user.email)) {
        // Se o email não estiver na lista, desloga imediatamente
        await signOut(auth);
        alert("Acesso Negado: Este email não tem permissão para acessar o sistema.");
        return;
      }

      // Se passou, o App.jsx vai detectar o login automaticamente

    } catch (error) {
      console.error("Erro ao fazer login:", error);
      alert("Erro ao logar. Tente novamente.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Couple Finance 💰</h1>
        <p>Faça login para gerenciar suas finanças</p>
        
        <button className="btn-google" onClick={handleGoogleLogin}>
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google Logo" 
          />
          Entrar com Google
        </button>
      </div>
    </div>
  );
};

export default Login;