// Contrato de Parceria Comercial - ESOL Energy
// Base legal: Código Civil (Lei 10.406/2002), CLT art. 442-B (trabalhador autônomo),
// LGPD (Lei 13.709/2018), Lei 9.427/96 e Lei 14.300/2022 (geração distribuída),
// Lei 10.848/2004 e Resoluções ANEEL aplicáveis ao mercado livre de energia.

export const CONTRATO_VERSAO = "1.0.0";

export const EMPRESA = {
  razao: "ESOL ENERGY",
  cnpj: "60.129.009/0001-29",
};

export function gerarContrato(parceiro: { nome: string; cpf: string }) {
  const data = new Date().toLocaleDateString("pt-BR");
  return `CONTRATO DE PARCERIA COMERCIAL PARA CAPTAÇÃO E INDICAÇÃO DE CLIENTES — CONSULTORIA EM ENERGIA

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
c) Pagar a remuneração devida ao PARCEIRO, conforme tabela de comissionamento, política comercial ou aditivo específico vigente, a ser comunicado por escrito;
d) Manter confidencialidade sobre dados pessoais do PARCEIRO, observando a LGPD.

CLÁUSULA 5ª — DA REMUNERAÇÃO
5.1. A remuneração do PARCEIRO pelas indicações que resultarem em contratos efetivamente assinados e adimplidos pelos clientes finais será definida em tabela de comissionamento, política comercial vigente ou aditivo específico, comunicado por escrito pela EMPRESA.
5.2. A remuneração somente será devida sobre negócios que atendam, cumulativamente, aos seguintes critérios: (i) lead cadastrado pelo PARCEIRO no portal antes de qualquer contato anterior do cliente com a EMPRESA; (ii) contrato assinado entre o cliente e a EMPRESA; (iii) cumprimento das obrigações financeiras pelo cliente.
5.3. Em caso de cancelamento, distrato ou inadimplemento pelo cliente, a EMPRESA poderá realizar o estorno proporcional da comissão paga, mediante prévia comunicação.
5.4. O PARCEIRO é o único responsável pelo recolhimento dos tributos e encargos incidentes sobre sua remuneração.

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
