// Contrato de Parceria Comercial - ESOL Energy
// Base legal: Código Civil (Lei 10.406/2002), CLT art. 442-B (trabalhador autônomo),
// LGPD (Lei 13.709/2018), Lei 9.427/96 e Lei 14.300/2022 (geração distribuída),
// Lei 10.848/2004 e Resoluções ANEEL aplicáveis ao mercado livre de energia.

export const CONTRATO_VERSAO = "15.0.0";

export const EMPRESA = {
  razao: "ESOL ENERGY",
  cnpj: "60.129.009/0001-29",
};

export function gerarContrato(parceiro: { nome: string; cpf: string }) {
  const data = new Date().toLocaleDateString("pt-BR");
  return `CONTRATO DE PARCERIA COMERCIAL PARA CAPTAÇÃO E INDICAÇÃO DE CLIENTES — CONSULTORIA EM ENERGIA (VERSÃO V15.0 CASH-BASIS)

Pelo presente instrumento particular, de um lado:

CONTRATANTE: ${EMPRESA.razao}, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº ${EMPRESA.cnpj}, doravante denominada simplesmente "EMPRESA";

e, de outro lado:

CONTRATADO(A): ${parceiro.nome || "[NOME DO PARCEIRO]"}, inscrito(a) no CPF sob o nº ${parceiro.cpf || "[CPF]"}, doravante denominado(a) "PARCEIRO";

têm entre si, justo e contratado, o presente Contrato de Parceria Comercial, que se regerá pelas cláusulas e condições a seguir, bem como pelo Código Civil Brasileiro (Lei nº 10.406/2002), pela Lei nº 13.709/2018 (LGPD) e pela legislação setorial aplicável ao mercado de energia elétrica (Lei nº 9.427/1996, Lei nº 10.848/2004, Lei nº 14.300/2022 e resoluções da ANEEL).

CLÁUSULA 1ª — DO OBJETO
1.1. O presente contrato tem por objeto a prestação de serviços autônomos de captação, prospecção e indicação de potenciais clientes interessados em soluções de energia ofertadas pela EMPRESA, incluindo, mas não se limitando a, geração distribuída de energia solar fotovoltaica, migração para o mercado livre de energia e demais produtos correlatos.
1.2. O PARCEIRO atuará como consultor autônomo de energia, sem exclusividade obrigatória, podendo desenvolver suas atividades em qualquer território nacional, observadas as normas da EMPRESA.

CLÁUSULA 2ª — DA NATUREZA DA RELAÇÃO
2.1. O presente contrato é de natureza estritamente CIVIL e COMERCIAL, com fundamento no artigo 442-B da CLT, não gerando, em hipótese alguma, vínculo empregatício, societário, de representação comercial nos termos da Lei nº 4.886/1965, mandato ou qualquer outra relação além da expressamente pactuada.
2.2. O PARCEIRO declara expressamente que atua por conta e risco próprios, com autonomia técnica, financeira e administrativa, arcando integralmente com seus tributos, encargos previdenciários e despesas operacionais.
2.3. Nada neste contrato autoriza o PARCEIRO a assumir obrigações em nome da EMPRESA, firmar contratos, emitir propostas comerciais vinculantes ou receber valores de clientes em nome da EMPRESA.

CLÁUSULA 3ª — DAS OBRIGAÇÕES DO PARCEIRO
3.1. São obrigações do PARCEIRO:
a) Atuar com ética, transparência, profissionalismo e boa-fé objetiva, observando o Código de Defesa do Consumidor (Lei nº 8.078/1990);
b) Prestar informações verdadeiras, claras e precisas sobre os produtos e serviços da EMPRESA, abstendo-se de prometer resultados, prazos ou condições que não estejam expressamente autorizados;
c) Não utilizar a marca, logomarca, nome empresarial ou materiais da EMPRESA sem prévia e expressa autorização escrita;
d) Manter sigilo absoluto sobre informações confidenciais, dados de clientes, propostas comerciais, preços, estratégias e quaisquer informações a que tiver acesso em razão desta parceria;
e) Cumprir rigorosamente a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), tratando os dados pessoais de leads e clientes exclusivamente para a finalidade desta parceria, sem compartilhamento, comercialização ou uso indevido;
f) Registrar todas as indicações e interações comerciais por meio das plataformas e ferramentas disponibilizadas pela EMPRESA;
g) Não exercer concorrência desleal nem captar clientes da EMPRESA para terceiros durante a vigência deste contrato.

CLÁUSULA 4ª — DAS OBRIGAÇÕES DA EMPRESA
4.1. São obrigações da EMPRESA:
a) Disponibilizar ao PARCEIRO o portal, materiais institucionais, treinamentos e suporte comercial necessários à execução do objeto;
b) Avaliar os leads encaminhados, conduzir a negociação técnica e comercial e formalizar contratos diretamente com os clientes;
c) Pagar a remuneração devida ao PARCEIRO, estritamente sob a política CASH-BASIS, conforme tabela de comissionamento vigente;
d) Manter confidencialidade sobre dados pessoais do PARCEIRO, observando a LGPD.

CLÁUSULA 5ª — DA REMUNERAÇÃO CASH-BASIS, QUARENTENA E MARGEM PISO INVIOLÁVEL
5.1. REGIME CASH-BASIS: A remuneração do PARCEIRO e os bônus da rede MMN/Unilevel serão liquidados EXCLUSIVAMENTE após a efetiva compensação financeira do pagamento do cliente final no gateway BaaS da EMPRESA e confirmação no Ledger Contábil SHA-256.
5.2. CARÊNCIA DE 30 DIAS: Novos PARCEIROS cadastrados possuem carência de 30 (trinta) dias corridos a contar da data de aceite deste contrato para solicitação de saques de remuneração no ecossistema BaaS Banking.
5.3. QUARENTENA DE INADIMPLÊNCIA (180 DIAS): Em caso de atraso, cancelamento, distrato, estorno ou inadimplemento pelo cliente final, o PARCEIRO e sua respectiva linha ascendente (uplines) entram em quarentena preventiva por 180 (cento e oitenta) dias, ficando a EMPRESA expressamente autorizada a efetuar o estorno ou compensação automática dos valores correspondentes nos saldos futuros.
5.4. REGRA ANTI-STACKING: É vedada a sobreposição simultânea de comissões diretas com bônus de incentivo ou pools de premiação fora da matriz unilevel oficial, garantindo o teto financeiro de distribuição por transação.
5.5. MARGEM PISO INVIOLÁVEL DE 20%: Em nenhuma hipótese qualquer desconto comercial ou comissionamento concedido poderá comprimir a margem de resultado da EMPRESA abaixo de 20% (vinte por cento) sobre o valor total do contrato, sendo o valor da proposta automaticamente reajustado pelo algoritmo da plataforma caso a margem piso seja atingida.

CLÁUSULA 6ª — DA CONFIDENCIALIDADE E LGPD
6.1. Todas as informações trocadas em razão deste contrato são consideradas confidenciais e não poderão ser divulgadas a terceiros, sob pena de responsabilização civil e criminal, inclusive nos termos do artigo 154 do Código Penal e dos artigos 186 e 927 do Código Civil.
6.2. O PARCEIRO atuará como Operador de dados pessoais, nos termos da LGPD, devendo: (i) tratar dados apenas para a finalidade desta parceria; (ii) adotar medidas técnicas e administrativas de segurança; (iii) comunicar imediatamente qualquer incidente de segurança; (iv) eliminar os dados ao término da parceria, salvo obrigação legal de retenção.
6.3. A obrigação de confidencialidade subsistirá pelo prazo de 5 (cinco) anos após o término deste contrato.

CLÁUSULA 7ª — DA PROPRIEDADE INTELECTUAL
7.1. Todos os materiais, marcas, sinais distintivos, sistemas, bases de dados de clientes e demais ativos intangíveis pertencem exclusivamente à EMPRESA, sendo vedada qualquer utilização fora do escopo deste contrato.
7.2. A base de clientes e leads cadastrados é de propriedade exclusiva da EMPRESA, ainda que captados pelo PARCEIRO.

CLÁUSULA 8ª — DA VIGÊNCIA E RESCISÃO
8.1. O presente contrato vigorará por prazo indeterminado a partir da data de sua assinatura eletrônica.
8.2. Qualquer das partes poderá rescindir este contrato, a qualquer tempo, mediante comunicação por escrito com antecedência mínima de 15 (quinze) dias, sem direito a qualquer indenização, multa ou aviso prévio remunerado.
8.3. A EMPRESA poderá rescindir o contrato imediatamente, sem aviso prévio, em caso de: (i) descumprimento de qualquer cláusula; (ii) prática de ato ilícito, fraude ou má-fé; (iii) violação de sigilo ou da LGPD; (iv) concorrência desleal; (v) uso indevido de marca ou materiais.

CLÁUSULA 9ª — DA NÃO CONCORRÊNCIA
9.1. Durante a vigência deste contrato, o PARCEIRO se compromete a não atuar, direta ou indiretamente, na captação dos mesmos leads em benefício de empresas concorrentes da EMPRESA no mesmo segmento de energia.

CLÁUSULA 10 — DA ASSINATURA ELETRÔNICA
10.1. As partes reconhecem expressamente, para todos os fins de direito, a validade jurídica deste contrato celebrado por meio eletrônico, com aceite por marcação digital ("li e aceito"), assinatura gráfica em ambiente digital, registro de IP, data, hora e identificadores únicos, nos termos do artigo 10, § 2º, da Medida Provisória nº 2.200-2/2001 e da Lei nº 14.063/2020.

CLÁUSULA 11 — DAS DISPOSIÇÕES GERAIS
11.1. A tolerância de qualquer das partes quanto ao descumprimento de cláusula deste contrato não configura novação nem renúncia ao direito de exigir seu cumprimento.
11.2. Caso qualquer cláusula seja declarada nula, as demais permanecerão em pleno vigor.
11.3. Eventuais alterações deste contrato somente serão válidas se formalizadas por aditivo escrito aceito por ambas as partes, inclusive por meio eletrônico.

CLÁUSULA 12 — DO FORO
12.1. Fica eleito o foro da comarca da sede da EMPRESA para dirimir quaisquer controvérsias decorrentes deste contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.

E por estarem assim justas e contratadas, as partes assinam o presente contrato eletronicamente, na data abaixo, declarando ter lido, compreendido e aceito integralmente todos os seus termos.

  Data: ${data}
  Versão do contrato: ${CONTRATO_VERSAO}
  `;
}

export function gerarTermoUsoEquipe(membro: { nome: string; cpf: string; cargo: string }) {
  const data = new Date().toLocaleDateString("pt-BR");
  return `TERMO DE COMPROMISSO, CONFIDENCIALIDADE (NDA), SEGURANÇA DA INFORMAÇÃO E CÓDIGO DE CONDUTA — EQUIPE INTERNA

Pelo presente instrumento particular, de um lado:

EMPRESA: ${EMPRESA.razao}, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº ${EMPRESA.cnpj}, doravante denominada simplesmente "EMPRESA";

e, de outro lado:

COLABORADOR(A): ${membro.nome || "[NOME DO COLABORADOR]"}, inscrito(a) no CPF sob o nº ${membro.cpf || "[CPF]"}, doravante denominado(a) "COLABORADOR", com a função de ${membro.cargo || "[CARGO]"};

têm entre si justo e acordado o presente Termo, que se regerá pelas condições a seguir, bem como pela legislação penal, civil e trabalhista brasileira aplicável.

CLÁUSULA 1ª — DO ACESSO À PLATAFORMA E SISTEMAS
1.1. O COLABORADOR receberá credenciais de acesso individuais e intransferíveis para o ERP e base de dados da EMPRESA. É terminantemente proibido o compartilhamento de logins, senhas ou tokens com terceiros, inclusive outros integrantes da equipe.
1.2. O acesso às informações está sujeito à matriz de permissões atrelada ao cargo do COLABORADOR, sendo vedada qualquer tentativa de burlar ou acessar dados fora de suas atribuições.

CLÁUSULA 2ª — DA CONFIDENCIALIDADE E SIGILO (NDA)
2.1. O COLABORADOR compromete-se a manter sigilo absoluto sobre toda e qualquer informação técnica, comercial, financeira, operacional ou estratégica da EMPRESA, bem como dados pessoais e especificações de clientes, parceiros, orçamentos, projetos solares e preços B2B a que tiver acesso.
2.2. Entende-se por Informação Confidencial tudo o que for de propriedade intelectual da EMPRESA ou por ela tratado, incluindo a base de leads, listas de contatos, fornecedores Aldo Solar e Sou Energy, códigos-fonte e especificações técnicas de kits fotovoltaicos.

CLÁUSULA 3ª — DA PROTEÇÃO DE DADOS (LGPD)
3.1. O COLABORADOR compromete-se a tratar dados pessoais em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), abstendo-se de utilizá-los para fins particulares, transferi-los a terceiros ou exportar a base de dados de clientes sem autorização expressa da diretoria.

CLÁUSULA 4ª — DA PROPRIEDADE INTELECTUAL
4.1. Toda e qualquer criação, projeto, melhoria, planilha consolidada, script ou material institucional elaborado pelo COLABORADOR em razão do exercício de suas funções pertence única e exclusivamente à EMPRESA.

CLÁUSULA 5ª — DA NÃO CONCORRÊNCIA E CONDUTA ÉTICA
5.1. O COLABORADOR não exercerá concorrência desleal nem prestará serviços comerciais ou de engenharia, diretos ou indiretos, a outras empresas atuantes no setor de energia solar fotovoltaica durante o período de seu vínculo com a EMPRESA.

CLÁUSULA 6ª — DA VALIDADE JURÍDICA E ASSINATURA ELETRÔNICA
6.1. O COLABORADOR declara ciência de que o aceite deste termo e o upload de sua selfie com o documento e foto frente/verso de seu RG/CNH constituem prova inequívoca de sua assinatura eletrônica e identidade, possuindo validade jurídica e força executiva nos termos da MP nº 2.200-2/2001 e da Lei nº 14.063/2020.

Data: ${data}
Versão do Termo: ${CONTRATO_VERSAO}
`;
}
