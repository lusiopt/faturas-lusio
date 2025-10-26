# 💰 Faturas Lusio

> Sistema de reconciliação de pagamentos Stripe com clientes Lusio

**Status:** 🚧 Em Desenvolvimento
**Última Atualização:** 26 Outubro 2025
**Versão:** 0.1.0

---

## 📋 DESCRIÇÃO

Sistema web para cruzamento automático de pagamentos extraídos do Stripe (CSV) com a base de clientes da plataforma Lusio (Excel), utilizando campo de ID comum para identificação e reconciliação.

### Funcionalidades Principais

- 📤 Upload de arquivo CSV de pagamentos do Stripe
- 📤 Upload de arquivo Excel de clientes Lusio
- 🔄 Cruzamento automático via campo ID comum
- 📊 Visualização de resultados da reconciliação
- ✅ Identificação de pagamentos correspondidos
- ⚠️ Alertas para pagamentos sem correspondência
- 📥 Exportação de relatório final

---

## 🛠️ TECNOLOGIAS

**Stack Recomendada (a definir):**

### Opção 1: Node.js + React/Next.js
- **Frontend:** React/Next.js com Tailwind CSS
- **Backend:** Node.js + Express
- **Processamento:**
  - `papaparse` (CSV)
  - `xlsx` ou `exceljs` (Excel)
- **Deploy:** VPS Lusio (lusio.market/staging/faturas-lusio)

### Opção 2: PHP
- **Frontend:** HTML + Tailwind CSS
- **Backend:** PHP 8.3
- **Processamento:**
  - `league/csv` (CSV)
  - `PhpSpreadsheet` (Excel)
- **Deploy:** VPS Lusio (lusio.market/staging/faturas-lusio)

---

## 📊 ESTRUTURA DE DADOS

### CSV Stripe (Input)
```csv
id,customer_id,amount,status,created,description
ch_xxx,cus_xxx,1997,succeeded,2025-10-26,Payment for subscription
```

**Campos importantes:**
- `id` - ID do pagamento Stripe
- `customer_id` - ID do cliente no Stripe (campo comum?)
- `amount` - Valor pago
- `status` - Status do pagamento
- `created` - Data de criação

### Excel Lusio (Input)
```
ID Cliente | Nome | Email | Telefone | Status
12345      | João | joao@email.com | +351... | Ativo
```

**Campo comum:** ID Cliente (a confirmar formato exato)

### Output (Relatório Reconciliado)
```
ID Stripe | ID Lusio | Nome Cliente | Valor | Status | Match
ch_xxx    | 12345    | João Silva   | €19.97| OK     | ✅
ch_yyy    | -        | -            | €39.97| ERROR  | ❌
```

---

## 🚀 COMO EXECUTAR

### Instalação

```bash
# Navegar para o projeto
cd /Users/euclidesgomes/Claude/projects/experimental/faturas-lusio

# Instalar dependências (Node.js)
npm install

# Ou para PHP
composer install
```

### Desenvolvimento

```bash
# Node.js
npm run dev

# PHP
php -S localhost:8000
```

### Deploy

```bash
# Criar repositório GitHub
gh repo create lusiopt/faturas-lusio --public

# Git inicial
git init
git add .
git commit -m "feat: initial commit

Sistema de reconciliação Stripe + Lusio

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
git push origin main

# Deploy para staging
ssh root@72.61.165.88 '/root/scripts/deploy-apps-git-v2.sh'
```

**URL:** https://lusio.market/staging/faturas-lusio (após deploy)

---

## 📁 ESTRUTURA DO PROJETO

```
faturas-lusio/
├── README.md              # Este arquivo
├── CHANGELOG.md           # Histórico de mudanças
├── .gitignore            # Arquivos ignorados pelo Git
├── package.json          # Dependências Node.js (se aplicável)
├── composer.json         # Dependências PHP (se aplicável)
│
├── src/                  # Código fonte
│   ├── upload/          # Lógica de upload
│   ├── parser/          # Parsers CSV/Excel
│   ├── reconciliation/  # Lógica de cruzamento
│   └── export/          # Geração de relatórios
│
├── public/              # Assets públicos
│   ├── index.html       # Interface principal
│   └── styles/          # CSS
│
└── uploads/             # Pasta temporária (não versionar)
    ├── stripe/          # CSVs do Stripe
    └── lusio/           # Excels da Lusio
```

---

## 🔐 SEGURANÇA

**IMPORTANTE:**
- ❌ Arquivos CSV/Excel NÃO devem ser versionados no Git
- ❌ Dados de clientes são sensíveis - processar apenas em memória
- ✅ Pasta `uploads/` deve estar no `.gitignore`
- ✅ Limpar arquivos temporários após processamento
- ✅ Validar formato de arquivos antes de processar

---

## 📝 TODOs

### Alta Prioridade
- [ ] Definir stack tecnológica final (Node.js ou PHP)
- [ ] Confirmar campo ID comum entre Stripe e Lusio
- [ ] Confirmar formato exato do CSV do Stripe
- [ ] Confirmar formato exato do Excel da Lusio
- [ ] Criar interface de upload
- [ ] Implementar parser CSV do Stripe
- [ ] Implementar parser Excel da Lusio
- [ ] Implementar lógica de cruzamento por ID
- [ ] Criar visualização de resultados

### Média Prioridade
- [ ] Adicionar exportação de relatório (Excel/CSV/PDF)
- [ ] Implementar validação de formatos
- [ ] Adicionar logs de processamento
- [ ] Criar testes unitários
- [ ] Adicionar tratamento de erros robusto

### Baixa Prioridade
- [ ] Histórico de reconciliações
- [ ] Dashboard com estatísticas
- [ ] Notificações por email de discrepâncias
- [ ] Integração direta com Stripe API
- [ ] Integração direta com sistema Lusio

---

## 🐛 TROUBLESHOOTING

### Erro ao processar CSV
- Verificar encoding (UTF-8)
- Verificar delimitador (vírgula ou ponto-e-vírgula)

### Erro ao processar Excel
- Verificar formato (.xlsx ou .xls)
- Verificar se primeira linha é header

---

## 📚 REFERÊNCIAS

- **Stripe API Docs:** https://stripe.com/docs/api
- **Papaparse (CSV):** https://www.papaparse.com/
- **ExcelJS:** https://github.com/exceljs/exceljs
- **PhpSpreadsheet:** https://phpspreadsheet.readthedocs.io/

---

## 👤 AUTOR

**Euclides Gomes** - Lusio
**Criado:** 26 Outubro 2025
**Mantido por:** Euclides Gomes + Claude Code
