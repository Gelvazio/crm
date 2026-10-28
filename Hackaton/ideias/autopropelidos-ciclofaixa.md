# Ideia completa: segurança e fiscalização de autopropelidos em zonas escolares

**Desafio:** Como podemos melhorar nossa cidade? (Rio do Sul, SC)
**Nome da solução:** [A DEFINIR pelo time]

## 1. Entenda o problema
- **Qual é o problema?** Autopropelidos (scooters e bicicletas elétricas) andam rápido demais em ciclofaixas perto de escolas e cruzamentos, colocando em risco quem atravessa.
- **Quem é afetado?** ☑ Crianças ☑ Jovens · Outro: pedestres e ciclistas
- **Por que isso acontece?** [A DEFINIR] Pergunta: "Por que os pilotos andam rápido ali?" (falta de fiscalização? não percebem a escola? pressa?)
- **Como sabemos que é um problema?** Mini-pesquisa: "X de 9 alunos já viram" + local observado [A DEFINIR] + prevenção: "ainda não tem notícia aqui, e queremos que continue assim"

## 2. Ideias consideradas
Frear e bloquear a moto · reduzir a velocidade em certos locais · parar antes do cruzamento · travar a roda · alertar a polícia

## 3. Melhor ideia
Scooter com GPS que conhece as zonas de risco da cidade. Perto de escolas, ela desacelera sozinha e para antes do cruzamento. Quem respeitou o limite segue viagem; quem desrespeitou fica travado e a polícia é avisada.
**Por que essa ideia:** ☑ Ajuda muitas pessoas ☑ É diferente/inovadora · (não marcar "fácil de fazer" nem "barata": exige GPS, módulo e trava na roda)

## 4. Desenho da solução
```
GPS detecta zona de risco (perto da escola)
   → scooter desacelera aos poucos e para antes da faixa
       ├── estava no limite → volta a andar sozinha               (SEGURANÇA)
       └── estava acima do limite [CONFIRMAR A REGRA]
             → roda traseira trava → alerta à polícia
             → policial desbloqueia                                (FISCALIZAÇÃO)
```
**Como as pessoas vão usar?** O piloto anda normalmente. Ao entrar na zona escolar, a scooter freia sozinha antes da faixa. Pedestres e crianças atravessam em segurança. Quem respeitou o limite segue; quem não respeitou espera o policial.

## 5. Pitch (4 min: 3 de fala + 1 de pergunta)
| Quem | Tempo | Fala |
|------|-------|------|
| Líder | 60 s | "Em Rio do Sul, crianças e jovens atravessam perto de escolas onde scooters elétricas passam rápido. X de 9 alunos da nossa turma já viram isso. Ainda não tem notícia de acidente, e queremos que continue assim." |
| Desenhista | 60 s | Explica os dois caminhos do desenho: verde (segurança) e vermelho (fiscalização). |
| Redator | 60 s | "Quem ganha são as crianças que atravessam e os próprios pilotos, que muitas vezes são adolescentes." + frase final [A DEFINIR pelo time] |

## Pendências (resolver antes do pitch)
1. Nome da solução
2. Por que o problema acontece
3. Regra que manda para a fiscalização (ex.: acima do limite na zona)
4. Resultado da mini-pesquisa e local observado
5. Existe ciclofaixa perto de escola em Rio do Sul? Se não, o local muda.
6. Frase final para os jurados

## Perguntas prováveis dos jurados
- "A polícia consegue ir até cada scooter travada?"
- "Enquanto o policial não chega, a scooter fica no meio da ciclofaixa?"
- "Quem coloca esse sistema nas scooters? É obrigatório?"
- "O GPS é preciso o bastante?" (erra alguns metros; serve para zonas)
- "Quem pode ver onde a pessoa está?" (o GPS envia dados à polícia)

## Prompt de imagem
> Ilustração educativa em estilo de diagrama técnico de um **sistema de segurança e fiscalização para scooters elétricas em ciclofaixas**. A scooter tem GPS e conhece as zonas de risco da cidade. Ao se aproximar de um cruzamento com faixa de pedestres perto de uma escola, a scooter desacelera aos poucos e para antes da faixa. O diagrama se divide em dois caminhos: à esquerda, com um sinal verde, a scooter estava na velocidade permitida e volta a andar sozinha depois que as crianças atravessam. À direita, com um sinal vermelho, a scooter estava acima do limite: a roda traseira trava, um alerta é enviado por celular para uma viatura de polícia, e o policial desbloqueia a scooter. Setas numeradas, fundo branco, cores claras, legendas em português, ambiente urbano.

---
## Evolução da ideia
1. Prompt original: sensor de freio + fios + frear até parar + desbloqueio por pessoa específica. Bloqueado pelo filtro do gerador de imagens.
2. Objetivo: diminuir a velocidade em determinados locais.
3. Definido pelo time: autopropelidos em ciclofaixas, GPS, desacelera até parar.

## Respostas do time (2ª rodada)
- Quem se machuca: "ninguém se machucaria" → respondeu sobre a solução, não sobre o problema de hoje.
- Onde para: "a roda traseira trava para ela não andar" → descreveu o mecanismo, não o local.
- Como volta a andar: "uma pessoa específica desbloqueia".
- Notícia: o time perguntou por que isso importa → é o campo "Como sabemos que é um problema?" do canvas.

## Decisão pendente: um objetivo só
A ideia mistura três objetivos: diminuir a velocidade, parar antes do perigo e bloquear até alguém liberar. Em 1h30 o time precisa escolher um:
- **Segurança:** para antes do cruzamento e libera sozinha quando o perigo passa.
- **Fiscalização:** para e trava até uma pessoa autorizada liberar (quem? quanto tempo o piloto espera? onde?).

## Decisão do time (3ª rodada): segurança + fiscalização + alerta à polícia
A pessoa que desbloqueia passa a ser o **policial**. O fluxo só fica coerente com uma **regra que separa os dois caminhos**:

```
GPS detecta zona de risco → scooter desacelera e para antes do cruzamento
        ├── piloto estava dentro da regra → libera sozinha quando o perigo passa   (SEGURANÇA)
        └── piloto quebrou a regra [QUAL?] → roda traseira trava + alerta à polícia → policial desbloqueia   (FISCALIZAÇÃO)
```

Em aberto:
- Qual regra manda para a fiscalização? (ex.: velocidade acima do limite na zona)
- A polícia consegue ir até cada scooter travada? Ou o alerta vira um registro ou uma multa?
- Enquanto espera o policial, onde fica a scooter? (fora da ciclofaixa?)

