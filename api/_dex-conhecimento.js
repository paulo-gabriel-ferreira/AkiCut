/* Base de conhecimento do Dex. Gerada a partir do assistente do AkiCut.
   Para ensinar algo novo ao Dex, adicione um item em TRECHOS: k = palavras-chave, t = o texto. */
const NUCLEO = "O AkiCut (antes chamado AniverCut) é a ferramenta interna do Instituto Dente de Leão, do ecossistema Akiyama Group, que cria as artes de \"Aniversariante do dia\" e de boas-vindas de novos colaboradores. Fluxo básico: cadastrar colaboradores e fotos (aba Colaboradores), informar os aniversariantes do mês (aba Aniversariantes), conferir o que está marcado para revisar, ajustar a arte se precisar (aba Arte) e gerar e baixar as artes (Gerar artes do mês e Baixar todas (ZIP)).\nAbas: Início (resumo, passo a passo e atalhos), Aniversariantes (lista do mês, importação, geração e ZIP), Arte (estúdio: enquadramento, Chapeleiro, modelos, textos, Baixar PNG), Colaboradores (cadastro, fotos, fotos a confirmar, unificar duplicados, padronizar nomes, Supabase, backup) e Novos colaboradores (arte de boas-vindas).\nO app é aberto, sem login, e os dados ficam no Supabase, compartilhados com a equipe.";

const TRECHOS = [
 {
  "k": [
   "novos",
   "novo colaborador",
   "boas-vindas",
   "boas vindas",
   "bem-vindo"
  ],
  "t": "A aba Novos colaboradores cria a arte de boas-vindas. Em Modelo, escolha Novo colaborador ou Aniversariante. Em Foto, busque o colaborador no cadastro ou use Enviar do computador. Em Enquadramento, use o Zoom ou Enquadrar automaticamente; na prévia dá para arrastar a foto e usar a roda do mouse. Os textos da arte são editáveis no painel. Para exportar, Baixar PNG ou Copiar imagem."
 },
 {
  "k": [
   "modelo",
   "modelos de arte",
   "fundo",
   "layout"
  ],
  "t": "Na aba Arte, o botão Modelos de arte permite enviar outra arte de fundo, marcar onde fica o círculo da foto, quais objetos ficam por cima e onde entram o nome e a data. O modelo oficial continua disponível."
 },
 {
  "k": [
   "textos da arte",
   "titulo",
   "frase",
   "texto"
  ],
  "t": "Na aba Arte, o botão Textos da arte edita o título e as frases da arte de aniversariante. As artes do mês saem com o texto novo quando o modelo oficial está em uso."
 },
 {
  "k": [
   "chapeleiro",
   "chapeu",
   "chapéu"
  ],
  "t": "O Chapeleiro, na aba Arte, encaixa a cabeça da pessoa embaixo do chapéu fixo da arte, deixando a pessoa dos ombros para cima. Aplicar automático refaz o enquadramento. Ajustes finos: arrastar a foto na prévia e usar a roda do mouse para o zoom."
 },
 {
  "k": [
   "legenda",
   "verde",
   "amarelo",
   "vermelho",
   "simbolo",
   "status"
  ],
  "t": "Legenda da lista do mês: ✓ arte pronta, ⚠ precisa revisar, ✕ foto não encontrada, ○ ainda não gerada. Clique em uma pessoa para abrir a arte."
 },
 {
  "k": [
   "configuracoes",
   "configurações",
   "engrenagem",
   "ajustes",
   "hud",
   "barra",
   "menu lateral",
   "densidade",
   "cor de destaque",
   "animacoes",
   "animações"
  ],
  "t": "A engrenagem abre as Configurações: posição da barra (esquerda, direita, em cima, embaixo), modo da barra (ícones e texto ou só ícones), cor de destaque, densidade das listas, miniaturas, animações (completas, suaves ou desligadas), abrir sempre na Início ou na última aba, tela de carregamento, mostrar ou ocultar o Dex, atalho Ctrl+K e sugestões no chat."
 },
 {
  "k": [
   "atalho",
   "teclado",
   "ctrl",
   "comando",
   "barra",
   "/"
  ],
  "t": "Atalhos: Ctrl+K (ou ⌘K) abre e fecha o chat do Dex; no chat, digitar / mostra a lista de comandos (/hoje, /semana, /resumo, /pendencias, /buscar, /arte, /gerar, /mes, /espaco, /confirmar, /tema, /ajuda); Esc fecha o chat ou um diálogo."
 },
 {
  "k": [
   "colar",
   "lista",
   "chat",
   "cadastrar",
   "adicionar",
   "aniversariante"
  ],
  "t": "Dá para colar uma lista de datas e nomes direto no chat (uma pessoa por linha, como 06/10 – Nome) e o chat mostra os nomes para confirmar antes de cadastrar. Também funciona escrever, por exemplo, \"adicionar Ana Souza 12/11\"."
 },
 {
  "k": [
   "dex",
   "personalizar",
   "robo",
   "robô",
   "editar",
   "personagem",
   "olhos",
   "acessorio"
  ],
  "t": "O Dex é o assistente do AkiCut. Tudo dele se ajusta no Estúdio do Dex: em Ajustes (a engrenagem do menu), no cartão Estúdio do Dex, ou pela engrenagem no topo do chat. No estúdio dá para arrastar o Dex para os lados para trocar de fantasia. Aparência: nome, tamanho, cor dos olhos e acabamento (claro ou grafite). Fantasias: temas prontos (Natal, Páscoa, Formatura, Festa, Chef, DJ, Realeza) e peças de cabeça (antena, chapéu de festa, gorro de Papai Noel, orelhas de coelho, capelo, chapéu de chef, coroa, fones), de rosto (óculos, óculos escuros, bigode) e roupas (gravata, cachecol, roupa de Noel), além da fantasia automática da época. Conversa: jeito (divertido, equilibrado ou formal) e idioma (português, inglês ou espanhol). Jeito: animações, truques, seguir o mouse, dicas em balão, mostrar ou ocultar e o modo leve de desempenho. Visual também tem o lado da tela. O anel no topo do chat abre o painel Meu consumo (cota da equipe, perguntas, tokens e fôlego por minuto); arrastar o topo do chat para baixo fecha o chat; digitar /status mostra o resumo e /tour faz um tour guiado."
 },
 {
  "k": [
   "supabase",
   "espaco",
   "espaço",
   "armazenamento",
   "nuvem"
  ],
  "t": "Os dados ficam no Supabase. Em Colaboradores, o botão Supabase mostra o espaço usado. Quando o espaço estiver acabando, a opção Manter só a melhor foto libera bastante."
 },
 {
  "k": [
   "tema",
   "escuro",
   "claro"
  ],
  "t": "O botão de tema, no topo da barra, alterna entre automático, claro e escuro. A escolha fica salva."
 },
 {
  "k": [
   "gerar",
   "mes",
   "mês",
   "artes",
   "zip",
   "baixar"
  ],
  "t": "Fluxo do mês: em Aniversariantes, escolha o mês, importe a lista, confira as pendências, clique em Gerar artes do mês e depois em Baixar todas (ZIP). Preparar próximo mês vincula as fotos e enquadra o mês seguinte; Gerar próximo mês já gera."
 },
 {
  "k": [
   "importar",
   "pasta"
  ],
  "t": "Em Colaboradores, botão Importar pasta. A estrutura é Colaboradores/Nome da Pessoa/foto.png — a subpasta vira o colaborador só se o primeiro nome for novo no cadastro; se parecer com alguém que já existe, a foto fica em Fotos a confirmar. Use Importar pasta em Colaboradores. Cada subpasta com o nome da pessoa vira um cadastro, e as fotos de dentro vão para ela."
 },
 {
  "k": [
   "foto",
   "solta"
  ],
  "t": "Fotos soltas também entram: o nome do arquivo é usado para identificar a pessoa. O que não der para associar vai para Fotos a confirmar."
 },
 {
  "k": [
   "adicionar foto",
   "mais uma foto",
   "outra foto para"
  ],
  "t": "Para adicionar foto a alguém específico, abra o cartão do colaborador em Colaboradores e use Adicionar fotos."
 },
 {
  "k": [
   "quantas",
   "foto",
   "pessoa"
  ],
  "t": "Não há limite. Quando existe mais de uma, o app dá nota a cada foto e usa a melhor: frontalidade, nitidez, espaço acima da cabeça, ombros visíveis, luz e resolução."
 },
 {
  "k": [
   "melhor",
   "foto",
   "escolhe"
  ],
  "t": "A escolha é automática por nota de 0 a 100. Você pode trocar manualmente na aba Arte, em Foto usada."
 },
 {
  "k": [
   "trocar",
   "foto"
  ],
  "t": "Na aba Arte, em Foto usada, aparecem todas as fotos daquela pessoa. É só clicar na que você preferir."
 },
 {
  "k": [
   "remov",
   "tirar",
   "excluir",
   "foto"
  ],
  "t": "Abra o cartão do colaborador em Colaboradores e clique na foto que quer remover."
 },
 {
  "k": [
   "formato",
   "aceita"
  ],
  "t": "PNG, JPG, JPEG, WEBP, GIF, BMP, AVIF, TIFF e JFIF. HEIC depende do navegador. O formato é identificado pelo conteúdo do arquivo, não pela extensão."
 },
 {
  "k": [
   "heic",
   "iphone"
  ],
  "t": "HEIC só abre se o navegador suportar. Se não abrir, o arquivo aparece no relatório de importação com o motivo, e converter para JPG resolve."
 },
 {
  "k": [
   "arquivo",
   "nao",
   "abriu"
  ],
  "t": "Arquivos que não abrem aparecem nomeados no relatório de importação, com o motivo. Normalmente é formato que o navegador não lê, como HEIC."
 },
 {
  "k": [
   "relatorio",
   "importacao"
  ],
  "t": "Ao fim de cada importação aparece o resultado: quantas fotos entraram, quantos colaboradores, quantas precisam de confirmação, quantas não foram associadas e quais arquivos falharam."
 },
 {
  "k": [
   "pendente",
   "confirmar"
  ],
  "t": "As fotos que não deu para associar ficam em Fotos a confirmar, no topo de Colaboradores. Você escolhe a pessoa ou cria um cadastro."
 },
 {
  "k": [
   "catalogar"
  ],
  "t": "Catalogar é resolver as fotos pendentes: o app sugere quem é e você confirma. Ele só liga a foto a quem já está no cadastro, quando a identificação é certa, e nunca cria colaborador sozinho. Para criar, use Criar colaborador ou Criar colaboradores…, que mostram os nomes antes."
 },
 {
  "k": [
   "descartar",
   "foto"
  ],
  "t": "No painel de Fotos a confirmar há o botão Descartar, que remove a foto do aplicativo. Ele pede confirmação."
 },
 {
  "k": [
   "criar",
   "colaborador"
  ],
  "t": "Em Colaboradores, botão Novo colaborador. Também dá para criar direto de uma foto pendente, uma a uma ou várias de uma vez em Criar colaboradores…, com os nomes à vista antes."
 },
 {
  "k": [
   "excluir",
   "apagar",
   "remov",
   "colaborador"
  ],
  "t": "Abra o cartão do colaborador e use Excluir colaborador. Ele apaga as fotos junto e desliga as entradas dos meses."
 },
 {
  "k": [
   "renomear",
   "nome",
   "colaborador"
  ],
  "t": "Abra o cartão do colaborador e edite o nome no campo do topo. A lista do mês volta a procurar com o nome novo."
 },
 {
  "k": [
   "buscar",
   "pesquisar",
   "colaborador"
  ],
  "t": "No cabeçalho de Colaboradores há a busca por nome, que funciona junto com a ordenação."
 },
 {
  "k": [
   "ordenar"
  ],
  "t": "O seletor Ordenar tem A a Z, Z a A, mais fotos, menos fotos, sem foto primeiro e cadastrados por último. A escolha fica salva."
 },
 {
  "k": [
   "duplicado",
   "unificar"
  ],
  "t": "Unificar duplicados agrupa cadastros que são a mesma pessoa escrita de formas diferentes e religa as entradas. Sobrenome diferente nunca entra no mesmo grupo."
 },
 {
  "k": [
   "limpar",
   "cadastro"
  ],
  "t": "Limpar cadastro remove todos os colaboradores e fotos. As listas de aniversariantes continuam, só ficam sem foto. Ele confirma antes, mostrando os números."
 },
 {
  "k": [
   "backup",
   "exportar",
   "cadastro"
  ],
  "t": "Em Colaboradores, Backup, Exportar gera um arquivo com cadastros e fotos. No outro computador, use Restaurar."
 },
 {
  "k": [
   "restaurar"
  ],
  "t": "Restaurar lê o arquivo de backup e devolve cadastros, fotos e meses. O que já existe é mantido."
 },
 {
  "k": [
   "pagina",
   "inicial",
   "inicio",
   "comecar",
   "primeiro",
   "uso"
  ],
  "t": "A página Início abre sempre que o site é aberto. Ela explica o que é o AkiCut, traz o passo a passo do primeiro uso e dois atalhos: gerar as artes do mês e abrir este assistente. Para voltar a ela, use Início no menu."
 },
 {
  "k": [
   "dados",
   "onde",
   "ficam"
  ],
  "t": "O cadastro e as fotos ficam só no Supabase, exatamente como foram enviadas, sem redução de qualidade. Este computador não guarda cópia: ao abrir, o app lê tudo do Supabase."
 },
 {
  "k": [
   "perder",
   "dados"
  ],
  "t": "Limpar os dados do site não apaga nada: o cadastro está só no Supabase e aparece de novo na próxima abertura. Mesmo assim, exporte um backup de vez em quando."
 },
 {
  "k": [
   "internet",
   "offline"
  ],
  "t": "O app precisa de internet: não há cópia neste computador. Sem conexão ele avisa e não salva nada, para nenhuma alteração parecer feita sem estar."
 },
 {
  "k": [
   "celular",
   "mobile"
  ],
  "t": "No celular funciona, mas a importação de pasta não existe em navegador móvel. Use fotos soltas ou faça a importação pelo computador."
 },
 {
  "k": [
   "navegador",
   "safari",
   "firefox",
   "chrome",
   "edge",
   "opera"
  ],
  "t": "Chrome ou Edge no computador. A seleção de pasta depende de um recurso que o Safari e os navegadores de celular não oferecem."
 },
 {
  "k": [
   "lista",
   "importar",
   "mes"
  ],
  "t": "Em Aniversariantes, Importar lista, e cole uma pessoa por linha no formato 06/10 – Bruno Melo. O mês é separado automaticamente."
 },
 {
  "k": [
   "formato",
   "lista"
  ],
  "t": "Dia e mês podem estar em qualquer posição da linha. Serve 06/10 – Nome, Nome 06/10, com traço, travessão ou hífen."
 },
 {
  "k": [
   "adicionar",
   "incluir",
   "aniversariante"
  ],
  "t": "Em Aniversariantes há Adicionar pessoa, para incluir um aniversariante avulso sem colar a lista inteira."
 },
 {
  "k": [
   "remov",
   "tirar",
   "excluir",
   "aniversariante"
  ],
  "t": "Cada linha da lista tem o botão Remover, que tira só aquela entrada do mês."
 },
 {
  "k": [
   "preparar",
   "mes"
  ],
  "t": "Preparar próximo mês casa os nomes com o cadastro e escolhe as fotos, sem gerar as artes ainda. Vou fazer isso."
 },
 {
  "k": [
   "gerar",
   "mes"
  ],
  "t": "Gerar artes do mês monta tudo de uma vez. Quem estiver sem colaborador ou sem foto fica de fora."
 },
 {
  "k": [
   "lote"
  ],
  "t": "A geração em lote faz todas as artes do mês selecionado e mostra no fim quantas ficaram prontas, quantas pedem revisão e quantas ficaram sem foto."
 },
 {
  "k": [
   "zip",
   "baixar"
  ],
  "t": "O ZIP do mês junta todas as artes prontas. As entradas sem foto ficam de fora e a contagem aparece na mensagem final."
 },
 {
  "k": [
   "png",
   "baixar",
   "arte"
  ],
  "t": "Na aba Arte, Baixar PNG salva a arte aberta. Se faltar colaborador ou foto, ele avisa em vez de gerar."
 },
 {
  "k": [
   "nome",
   "arquivo",
   "exportado"
  ],
  "t": "Os arquivos saem como Aniversariante_dia_MES_-_Nome.png, dentro de uma pasta com o mês e o ano."
 },
 {
  "k": [
   "chapeleiro"
  ],
  "t": "O Chapeleiro detecta o rosto, mede a linha do cabelo e a largura do rosto, e encaixa a foto embaixo do chapéu, que é fixo. Por isso todas as artes saem no mesmo padrão."
 },
 {
  "k": [
   "chapeu",
   "fixo"
  ],
  "t": "O chapéu não muda de tamanho nem de lugar: ele faz parte do layout. Quem se ajusta é a foto, e é isso que dá consistência entre pessoas diferentes."
 },
 {
  "k": [
   "chapeu",
   "mover"
  ],
  "t": "No modelo oficial dá para mexer: passe o cursor sobre o chapéu na prévia e arraste, a roda muda o tamanho e Shift com a roda inclina."
 },
 {
  "k": [
   "rosto",
   "detecta"
  ],
  "t": "A detecção usa um localizador de rosto de verdade, que procura a estrutura da face, e depois valida pela pele dentro da região. Isso derruba falso positivo de parede e de estampa."
 },
 {
  "k": [
   "nao",
   "detectou",
   "rosto"
  ],
  "t": "Quando o rosto não é localizado, o app avisa a confiança baixa e cai no ajuste manual, em vez de entregar algo torto em silêncio. Foto escura, pessoa de lado ou muito pequena são as causas comuns."
 },
 {
  "k": [
   "enquadramento",
   "automatico"
  ],
  "t": "O enquadramento automático deixa a pessoa dos ombros para cima, com a cabeça alinhada ao chapéu. Aplicar automático refaz o cálculo a qualquer momento."
 },
 {
  "k": [
   "ajuste",
   "manual"
  ],
  "t": "Arraste a foto na prévia, use a roda do mouse para o zoom e os controles de Horizontal e Vertical. Tudo fica salvo e sobrevive a novas gerações."
 },
 {
  "k": [
   "zoom"
  ],
  "t": "A roda do mouse sobre a prévia controla o zoom. Também há o controle de Zoom no painel, com o valor em números."
 },
 {
  "k": [
   "modelo",
   "template",
   "outra arte",
   "trocar a arte",
   "mudar a arte",
   "arte de fundo"
  ],
  "t": "Em Modelos de arte, na aba Arte, dá para enviar outra arte de fundo, marcar o círculo da foto, recortar os objetos que ficam por cima e indicar onde entram nome e data."
 },
 {
  "k": [
   "recortar",
   "objeto"
  ],
  "t": "No editor de modelo, Detectar automaticamente propõe os objetos, e as ferramentas Marcar objeto e Apagar marca corrigem o que faltou. O que estiver marcado continua na frente da foto."
 },
 {
  "k": [
   "nome",
   "aparece",
   "arte"
  ],
  "t": "O nome sai centralizado abaixo do círculo, quebrando em duas linhas quando é comprido, com o tamanho reduzido se precisar."
 },
 {
  "k": [
   "data",
   "balao"
  ],
  "t": "A data aparece no balão verde, com o dia em cima e o mês abreviado embaixo, no mesmo giro do modelo."
 },
 {
  "k": [
   "editar",
   "nome",
   "arte"
  ],
  "t": "Na aba Arte há os campos de nome, dia e mês. O que você escrever ali vale só para aquela arte."
 },
 {
  "k": [
   "verde"
  ],
  "t": "Verde é identificação certa, com foto. A arte pode ser gerada sem você conferir nada."
 },
 {
  "k": [
   "amarelo"
  ],
  "t": "Amarelo é quando há candidatos parecidos mas nenhum conclusivo. A linha fica vazia de propósito e o aviso lista os nomes. Use Vincular para escolher."
 },
 {
  "k": [
   "vermelho"
  ],
  "t": "Vermelho é quando não existe ninguém no cadastro com aquele nome, ou falta foto. A linha fica vazia para não usar a foto de outra pessoa."
 },
 {
  "k": [
   "vincular"
  ],
  "t": "Nas linhas sem colaborador aparece Vincular, com os nomes mais parecidos e a lista completa. O vínculo feito à mão fica salvo."
 },
 {
  "k": [
   "sobrenome"
  ],
  "t": "Quando os dois lados têm sobrenome, o sobrenome manda: diferente é pessoa diferente. Carlos Estevo nunca vira Carlos Eduardo."
 },
 {
  "k": [
   "primeiro",
   "nome"
  ],
  "t": "Nome só com prenome é sempre parcial: passa se aquele prenome for único no cadastro, e vai para confirmação se duas pessoas dividirem o mesmo prenome."
 },
 {
  "k": [
   "grafia",
   "acento"
  ],
  "t": "A busca ignora acento, maiúscula, hífen e underline, e tolera diferenças de escrita como Harysson e Harrysson, Souza e Sousa, Luis e Luiz."
 },
 {
  "k": [
   "abreviado",
   "truncado"
  ],
  "t": "Nome truncado funciona quando o menor é o começo do maior, na ordem: GABRIEL LUCAS encontra Gabriel Lucas de Carvalho."
 },
 {
  "k": [
   "tema",
   "escuro",
   "claro"
  ],
  "t": "O botão de tema alterna entre automático, claro e escuro. A escolha fica salva."
 },
 {
  "k": [
   "barra",
   "posicao"
  ],
  "t": "Nas configurações dá para mover a barra para esquerda, direita, topo ou rodapé, e escolher entre texto e só ícones."
 },
 {
  "k": [
   "icones",
   "compacto"
  ],
  "t": "O modo só ícones deixa a barra estreita, mostrando apenas os símbolos. Fica nas configurações."
 },
 {
  "k": [
   "abertura",
   "animacao"
  ],
  "t": "A abertura é só apresentação: as letras se juntam, a logo solta partículas e a tesoura corta o CUT. Clique, Esc ou espaço pulam."
 },
 {
  "k": [
   "atalho",
   "teclado"
  ],
  "t": "Na abertura, Esc ou espaço pulam. No resto do app tudo é por clique; na prévia, arrastar move e a roda do mouse dá zoom."
 },
 {
  "k": [
   "lento",
   "travando",
   "demora"
  ],
  "t": "A parte pesada é analisar as fotos na importação, que acontece uma vez por foto. Depois disso o resultado fica guardado e a geração é rápida."
 },
 {
  "k": [
   "erro",
   "bug",
   "quebrou"
  ],
  "t": "Me conte o que aconteceu e em qual tela. Se for arte saindo errada, o mais comum é vínculo antigo apontando para a pessoa errada — abrir a lista já revalida isso."
 },
 {
  "k": [
   "nao",
   "salvou"
  ],
  "t": "Uma alteração só vale depois que o Supabase confirma: o indicador da barra lateral mostra \"salvando…\" e depois \"salvo no Supabase\". Se aparecer \"falha ao salvar\", a alteração não foi salva: confira a internet e tente de novo. Se fechar a página com algo ainda sendo salvo, o navegador avisa."
 },
 {
  "k": [
   "ano"
  ],
  "t": "O seletor de ano fica ao lado dos meses, no grupo Período. Cada ano guarda as suas listas."
 },
 {
  "k": [
   "mes",
   "trocar"
  ],
  "t": "Os botões de mês ficam acima da lista. Clique no mês que quiser para ver só os aniversariantes dele."
 },
 {
  "k": [
   "quem",
   "fez",
   "criou"
  ],
  "t": "Sou parte do AkiCut, uma ferramenta interna feita para montar as artes de aniversariantes com o mínimo de trabalho manual."
 },
 {
  "k": [
   "preco",
   "cust",
   "pagar",
   "gratis",
   "gratuito"
  ],
  "t": "Não há custo nem conta: é um arquivo que roda no seu navegador."
 },
 {
  "k": [
   "atualizar",
   "versao"
  ],
  "t": "A ferramenta é um arquivo só. Para atualizar, basta abrir a versão nova — o cadastro continua no navegador."
 },
 {
  "k": [
   "imprimir"
  ],
  "t": "As artes saem em PNG de 1080 por 1440, prontas para publicar ou imprimir."
 },
 {
  "k": [
   "tamanho",
   "arte",
   "resolucao"
  ],
  "t": "A arte final tem 1080 por 1440 pixels, o mesmo tamanho do modelo oficial."
 },
 {
  "k": [
   "circulo",
   "foto"
  ],
  "t": "O círculo da foto do modelo oficial tem centro em 539,5 por 807 e raio 271,6. Em modelos seus, você define isso no editor."
 },
 {
  "k": [
   "ombro",
   "corpo"
  ],
  "t": "O enquadramento busca sempre cabeça e ombros, com espaço reservado abaixo do queixo para os ombros aparecerem."
 },
 {
  "k": [
   "duas pessoas",
   "varias pessoas",
   "mais de uma pessoa",
   "dois rostos",
   "mais de um rosto",
   "outra pessoa na foto"
  ],
  "t": "Se a foto tiver mais de um rosto, o app escolhe o mais provável, reduz a confiança e marca a pessoa para você conferir."
 },
 {
  "k": [
   "foto errada",
   "pessoa errada",
   "arte errada",
   "saiu errada",
   "rosto errado"
  ],
  "t": "Isso costuma ser vínculo antigo apontando para a pessoa errada. Abrir a lista já revalida e desliga o vínculo que não corresponde ao nome; depois use Vincular para ligar na pessoa certa."
 },
 {
  "k": [
   "comec",
   "inicio",
   "primeira vez",
   "do zero",
   "comeco"
  ],
  "t": "Comece importando a pasta de fotos em Colaboradores. Depois cole a lista do mês em Aniversariantes e clique em Gerar artes do mês."
 },
 {
  "k": ["quem e", "ficha", "informacoes", "aniversario de", "dados do", "dados da", "colaborador", "procurar pessoa"],
  "t": "O Dex acha colaboradores pelo nome, mesmo sem acento, só com o primeiro nome ou com grafia parecida (Souza e Sousa, Luis e Luiz). Perguntas como 'quem é a Ana Souza?', 'aniversário do Bruno' ou 'fotos da Carla' mostram a ficha no chat: aniversário e quantos dias faltam, quantas fotos e a melhor nota, e o status da arte do mês, com botões para abrir o cadastro ou a arte. 'Aniversariantes de março' mostra a lista do mês. Isso é respondido pelo próprio site, sem gastar IA."
 }
];

module.exports = { NUCLEO, TRECHOS };
