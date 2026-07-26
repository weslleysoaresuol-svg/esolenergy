import re

file_path = 'docs/mapa_completo_esol_energy.md'
with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# 1. Mermaid diagram
content = content.replace('U["Typebot/Botpress (Chatbot IA)"]', 'U["Typebot/Botpress (Chatbot IA)"]\n        V["Headless PDF Engine (Visual Builder)"]')
content = content.replace('I --> U', 'I --> U\n    I --> V')

# 2. Motor Documentos Premium (12-A.12)
content = re.sub(
    r'(1\.\s+\*\*Stack de Renderiza.*?Chrome\)\.)',
    r'1. **Modelo Híbrido de Renderização (Visual No-Code Builder):** O sistema utiliza integração com um *Headless PDF Template Engine* (como CraftMyPDF ou DocSpring). Os administradores editam o visual via construtor Drag-and-Drop. O backend despacha o payload via API REST. Como contingência, o sistema mantém um pipeline interno (React-PDF + Tailwind).',
    content,
    flags=re.DOTALL
)

# 3. Async Queues MMN
content = re.sub(
    r'(\*\s+\*\*Transpar.*?cada centavo)',
    r'\g<1>\n*   **Processamento Assíncrono (Anti-Crash):** O cálculo de comissões de energia (dia 05) utiliza Filas Assíncronas (Background Workers) via Edge Functions para impedir travamento do banco (Timeouts) quando a rede passar de 50.000 usuários.',
    content,
    flags=re.DOTALL
)

# 4. Chatbot IA Rules
content = re.sub(
    r'(\*\s+\*\*Roteamento Omnichannel.*?Typebot/Botpress\)\.)',
    r'\g<1>\n*   **Regra de Segurança IA (Anti-Alucinação):** A IA atua estritamente na *Captura* (Top of Funnel). É arquiteturalmente proibida de calcular preços finais (competência exclusiva do Motor Reverso no CRM).',
    content,
    flags=re.DOTALL
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Python update finished.')
