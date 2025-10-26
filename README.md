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

## 📊 ESTRUTURA DE DADOS (ESPECIFICAÇÃO FINAL)

### CSV Stripe (Input)
**Delimitador:** `,` (vírgula)
**Campos relevantes:**
- `PaymentIntent ID` - **CAMPO CHAVE** 🔑 (ex: `pi_3SMECgAHUiwjWkzO1AnNvIU4`)
- `Created date (UTC)` - Data e hora do pagamento
- `Amount` - Valor (formato: `"399,00"`)
- `Fee` - Taxa Stripe
- `Customer Email` - Email do cliente

**Exemplo:**
```csv
id,Created date (UTC),Amount,Fee,PaymentIntent ID,Customer Email
py_3SME...,2025-10-25 20:37:16,"399,00","20,31",pi_3SMECgAHUiwjWkzO1AnNvIU4,email@example.com
```

---

### CSV Lusio (Input)
**Delimitador:** `;` (ponto-e-vírgula)
**Campos relevantes:**
- `service_payment_reference_id` - **CAMPO CHAVE** 🔑 (ex: `pi_3RtDfgAHUiwjWkzO22qAMw0p`)
- `person_first_name` - Primeiro nome da pessoa
- `person_last_name` - Sobrenome da pessoa
- `person_email` - Email da pessoa
- `person_nif` - NIF da pessoa
- `address_street` - Rua
- `address_postal_code` - Código postal
- `address_locality` - Localidade

**Exemplo:**
```csv
service_id;service_payment_reference_id;person_first_name;person_last_name;person_email;person_nif;address_street;address_postal_code;address_locality
ea327b78...;pi_3RtDfgAHUiwjWkzO22qAMw0p;Shirley;Targino;email@example.com;303167807;Rua X 148;3045-481;Coimbra
```

---

### 🔗 LÓGICA DE RECONCILIAÇÃO

```javascript
Stripe.PaymentIntent ID === Lusio.service_payment_reference_id
```

---

### Excel Output (Formato mensal)

**Estrutura:** Uma aba por mês (ex: Set-25, Out-24, etc)
**Headers (linha 3):**

| Data | Valor | Taxa Stripe | Nome Cliente | Email | NIF | Morada |
|------|-------|-------------|--------------|-------|-----|--------|
| 2025-09-30 | 399 | 20.31 | Shirley Targino | email@example.com | 303167807 | Rua X 148 3045-481 Coimbra |

**Mapeamento de campos:**

| Coluna Output | Fonte | Campo Original | Transformação |
|---------------|-------|----------------|---------------|
| **Data** | Stripe | `Created date (UTC)` | Extrair apenas data (sem hora) |
| **Valor** | Stripe | `Amount` | Remover vírgula, converter para número |
| **Taxa Stripe** | Stripe | `Fee` | Remover vírgula, converter para número |
| **Nome Cliente** | Lusio | `person_first_name` + `person_last_name` | Concatenar com espaço |
| **Email** | Lusio | `person_email` | - |
| **NIF** | Lusio | `person_nif` | - |
| **Morada** | Lusio | `address_street` + `address_postal_code` + `address_locality` | Concatenar com espaços |

---

### ⚠️ CASOS ESPECIAIS

**Pagamentos não encontrados no Lusio:**
- Mostrar em lista separada "Pagamentos sem correspondência"
- Incluir: Data, Valor, Email do Stripe

**Clientes sem pagamento:**
- Não aparecem no relatório (apenas pagamentos confirmados)

**Múltiplos pagamentos mesmo cliente:**
- Cada pagamento é uma linha separada no Excel

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
