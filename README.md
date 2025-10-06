# Sicro — Sistema de Controle de Roupas Estéreis

O **Sicro** é um sistema web full-stack desenvolvido para controle e rastreabilidade de roupas estéreis, garantindo **organização, segurança e automação** no gerenciamento de estoque da operação.  
O sistema possui **frontend em React vite + TailwindCSS** e **backend  em FastAPI**, com autenticação JWT e integração total via API REST.

---

## Tecnologias Utilizadas

### Backend
- **FastAPI** — framework rápido e assíncrono em Python  
- **SQLAlchemy ORM** — mapeamento objeto-relacional  
- **JWT (jose + passlib)** — autenticação segura  
- **dotenv** — gerenciamento de variáveis de ambiente  
- **PostgreSQL** (produção) / **SQLite** (desenvolvimento)  
- **Render** — deploy em nuvem do backend

### Frontend
- **React (Vite)** — interface rápida e modular  
- **TailwindCSS 3.3** — design responsivo e moderno  
- **Axios** — integração com API  
- **React Hot Toast** — feedback de ações  
- **Lottie** — animações JSON  
- **LocalStorage + JWT** — persistência de sessão  
- **Vercel** — hospedagem do frontend

---

## Principais Funcionalidades

- **Login com autenticação JWT**  
  Controle de acesso baseado em perfis (`admin` e `user`).

- **Gestão de estoque**  
  Registro de entradas e saídas de itens (macacões, botas, panos, óculos), com controle por tamanho e quantidade.

- **Visualização de saldo**  
  Interface que exibe os níveis de estoque com indicadores visuais (verde, amarelo, vermelho).

- **Rastreabilidade**  
  Histórico de movimentações armazenado no banco de dados, garantindo consistência e auditoria das ações.

- **Feedback instantâneo**  
  Alertas e notificações integradas via `react-hot-toast`.

---




