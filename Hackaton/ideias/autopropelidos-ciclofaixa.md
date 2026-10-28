# Ideia de time: autopropelidos que param sozinhos em pontos de risco da ciclofaixa

**Veículo:** autopropelidos (scooters, patinetes e bicicletas elétricas) que circulam em ciclofaixas.
**Como funciona:** o GPS detecta que o veículo entrou numa zona de risco, e ele perde velocidade aos poucos até parar.
**Evidência (canvas, etapa 1):** notícias de acidentes com veículos autopropelidos. Falta escolher **uma notícia concreta**, com data e local.

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

## Prompt de imagem (versão final com dois caminhos)
> Ilustração educativa em estilo de diagrama técnico de um **sistema de segurança e fiscalização para scooters elétricas em ciclofaixas**. A scooter tem GPS e conhece as zonas de risco da cidade. Ao se aproximar de um cruzamento com faixa de pedestres perto de uma escola, a scooter desacelera aos poucos e para antes da faixa. O diagrama se divide em dois caminhos: à esquerda, com um sinal verde, a scooter estava na velocidade permitida e volta a andar sozinha depois que as crianças atravessam. À direita, com um sinal vermelho, a scooter estava acima do limite: a roda traseira trava, um alerta é enviado por celular para uma viatura de polícia, e o policial desbloqueia a scooter. Setas numeradas, fundo branco, cores claras, legendas em português, ambiente urbano.

## Quem é afetado (4ª rodada)
Resposta do time: "a população de Rio do Sul". É o "toda a cidade" do canvas: vago demais.
Coerente com a solução (zona de cruzamento perto de escola, crianças atravessando no desenho):
- Marcar no canvas: **Crianças** e **Jovens** + "Outro: pedestres e ciclistas"
- Pergunta para o time: "Nas notícias, quem estava envolvido no acidente?"

## Pontos fracos (os jurados vão perguntar)
| Ponto | Resposta atual do time | Problema |
|-------|------------------------|----------|
| Quem é afetado | "Ninguém mais seria afetado" | Se ninguém é afetado, não há problema para resolver. O acidente afeta o piloto (muitas vezes adolescente), ciclistas e pedestres. E quem vem atrás na ciclofaixa é afetado quando o veículo para. |
| Parar onde | "Até parar" | Parar no meio da ciclofaixa causa batida de quem vem atrás. Parar antes de um cruzamento ou de uma faixa de pedestres faz sentido. |
| Voltar a andar | Não definido | Depois de parar, quando e como o veículo volta a andar? |
| GPS | Escolhido | O GPS do celular erra alguns metros; serve para zonas (um cruzamento), não para saber se o veículo está na faixa certa. |

## Prompt de imagem (versão com parada antes do cruzamento)
> Ilustração educativa em estilo de diagrama técnico de um **sistema de segurança para scooters elétricas em ciclofaixas**. A scooter tem um GPS que conhece as zonas de risco da cidade, marcadas no mapa. Quando a scooter se aproxima de um cruzamento com faixa de pedestres perto de uma escola, o sistema reduz a velocidade aos poucos até a scooter parar com segurança antes da faixa, enquanto as crianças atravessam. Mostre setas numeradas: 1) satélite de GPS e mapa com zonas de risco, 2) scooter na ciclofaixa em velocidade normal, 3) scooter entrando na zona e desacelerando, 4) scooter parada antes da faixa, 5) crianças atravessando com segurança. Fundo branco, cores claras, legendas em português, ambiente urbano.

## Perguntas para o time
1. "Quem se machuca nesses acidentes das notícias?" (refaz o campo "quem é afetado")
2. "Em que ponto exato a scooter para? E quem vem atrás dela na ciclofaixa?"
3. "Depois de parar, como ela volta a andar?"
4. "Qual é a notícia que vocês vão mostrar aos jurados? De onde e de quando?"
