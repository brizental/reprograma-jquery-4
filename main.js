//----------- Modelo antigo de definição para variáveis globais são definidas
// no topo, em letra maiúscula

MINES = 40; // Quantidade de minas do jogo do 'Campo Minado'
HEIGHT = 20; // Altura do tabuleiro
WIDTH = 15; // Largura do tabuleiro 
TIMER = false;

function getUniqueRandomIndexesIn2DArray(tables, indexes) { //Pega Index randomico com arrays 2D (matrix) -> array de arrays
    indexes = indexes ? indexes : []; //verifica se o valor é verdadeiro é falso; 
    //Se verdadeiro, retorna 'indexes', se falso retorna [] (array vazio);
    
    //----------looping 
    // Vai rodar a quantidade de minas que eu quero ter no tabuleiro 
    for (var i = indexes.length; i < MINES; i++) {
        var random_cell = Math.floor(Math.random() * WIDTH); //coordenada de acordo com a largura(linha) // x
        var random_row = Math.floor(Math.random() * HEIGHT); //coordenada de acordo com a altura(coluna) // y

        //------- Looping para garantir que teremos INDEXES ÚNICOS (nenhuma bomba fique em cima da outra)
        for (var j = 0; j < indexes.length; j++) { 
            if (indexes[j][0] === random_cell && // se x for igual a uma célula já criada
                indexes[j][1] === random_row) { // se y for igual a uma célula já criada
                return arguments.callee(tables, indexes); //
                //==== return getUniqueRandomIndexesIn2DArray (table, indexes);
                // ele reinicia o looping da função, mas não do 0. 
                // O looping começa novamente a rodar de acordo com o comprimento do indexes
            }
        } 
        indexes.push([random_cell, random_row]);
    } 
    return indexes;
}

//---------- Números criados em torno das minas
function getAdjacentCellIndexes(x, y) { //Pega as coordenadas da cédula e as define 
    // celulas adjacentes: https://imgur.com/a/bTJ1r0o
    return $.grep([ //grep é uma função 'filtro' que elimina as coordenadas fora do tabuleiro
        [ x - 1, y - 1 ], 
        [ x, y - 1 ], 
        [ x + 1, y - 1 ],
        [ x - 1, y ],
        [ x + 1, y ],
        [ x - 1, y + 1 ],
        [ x, y + 1 ],
        [ x + 1, y + 1 ]
    ], function (element) {
        return element[0] >= 0 && element[1] >= 0 && element[0] < WIDTH && element[1] < HEIGHT
    });
}

//---------- Execução do código em si

var field_matrix = []; //começa com uma array vazia 
var field = $("#field table"); //field é a tabela prescrita no HTML
var counter = 0;
//$... é um seletor de jQuery, que funciona exatamente como um querySelectorAll 
//Até aqui estamos selecionando a tabela a ser preenchida 
for (var i = 0; i < HEIGHT; i++) { //looping - itera quantidade de linhas 
    var row_vector = []; //vector é uma array com uma única direção. 
    //Cria uma lista que vai salvar todas as suas células dentro dele 
    var row = $("<tr>"); //é a linha - tr como linha da tabela 
    for (var j = 0; j < WIDTH; j++) { //looping - itera quantidade de células
        var cell = $("<td>"); //cria as células (novo nódulo no DOM) que vai ser preenchido com minas ou números
        cell.data("mines", 0); //coloca dados dentro de um elemento HTML. 
        //A propriedade começa em zero
        var button = $("<div>");
        button.addClass("button");
        button.data("coordinates", [j, i]);

        button.contextmenu(function () {
            return false;
        });

        button.mousedown(function(event) {
            if (!TIMER) {
                TIMER = setInterval(function () {
                    counter++;
                    $("#timer").text(counter);
                }, 1000);
            }
            if (event.which === 3) {
                $(this).toggleClass("red-flag");
                $("#mines").text($(".red-flag").length);
            } else {
                $("#reset").addClass("wow");
            }
        });

        button.mouseup(function () {
            $("#reset").removeClass("wow");
            if (!$(this).hasClass("red-flag")) {
                if ($(this).parent().hasClass("mine")) {
                    $("td .button").each(function (index, button) {
                        button.remove();
                    })
                    $("#reset").addClass("game-over");
                    clearInterval(TIMER);
                } else if ($(this).parent().data("mines") > 0) {
                    $(this).remove();
                } else if ($(this).parent().data("mines") === 0) {
                    var coordinates = $(this).data("coordinates");
                    $(this).remove();
                    (function (x, y) {
                        var adjacent_cells = getAdjacentCellIndexes(x, y);
                        for (var k = 0; k < adjacent_cells.length; k++) {
                            var x = adjacent_cells[k][0];
                            var y = adjacent_cells[k][1];
                            var cell = $(field_matrix[y][x]);
                            var button = cell.children($(".button"));
                            if (button.length > 0) {
                                button.remove();
                                if (cell.data("mines") === 0) {
                                    arguments.callee(x, y);
                                }
                            }
                        }
                    })(coordinates[0], coordinates[1]);
                }

                if ($("td .button").length === MINES) {
                    $("#reset").addClass("winner");
                    clearInterval(TIMER);
                }

            }
        })

        cell.append(button);
        row.append(cell); //mesma ideia do append do JS
        row_vector.push(cell)
        //representação no JS da tabela no HTML
    }
    field.append(row);
    field_matrix.push(row_vector);
}

//pega coordenadas randomicas dentro da tabela, 
//e dentro de cada célula eu coloco uma mina
var mine_indexes = getUniqueRandomIndexesIn2DArray(field_matrix);
//---------------- Looping que pega as coordenadas aleatórias e adiciona uma mina nessa coordenada
//semelhante ao FOR OF --- $.each funciona de forma específica 
//funciona para arrays do javascript
$.each(mine_indexes, function(index, coordinates) { //recebe dois argumentos: o index dela e uma coordenada.
    //sem o index não dá pra acessar as propriedades do segundo argumento
    var x = coordinates[0];
    var y = coordinates[1];
    var mine = $(field_matrix[y][x]); 
    //x como primeira coordenada e y como segunda coordenada. 
    //Como o field_matrix foi criada, primeiro se cria as linhas e depois a coluna 
    //se você trocar pela posição vertical e depois horizontal, dá certo
    mine.addClass("mine"); //classe 'mine' é a que tem a imagem da mina do jogo 
});

//-------------- Looping para colocar as minas nos tabuleiros junto aos números
$.each(mine_indexes, function (index, coordinates) {
    var adjacent_cells = getAdjacentCellIndexes(coordinates[0], coordinates[1]);
    $.each(adjacent_cells, function(index, coordinates) {
        var x = coordinates[0];
        var y = coordinates[1];
        var cell = $(field_matrix[y][x]);
        if (!cell.hasClass("mine")) { //verificar se tem a classe 'mina'
            var num_mines = cell.data("mines") + 1; //incrementa as minas 
            cell.data("mines", num_mines); //guarda o valor das minas 
            switch (num_mines) { //estabelece cores para os números conforme iteração
                case 1:
                    cell.css("color", "blue");
                    break;
                case 2:
                    cell.css("color", "green");
                    break;
                case 3:
                    cell.css("color", "red");
                    break;
                case 4:
                    cell.css("color", "navy");
                    break;
                case 5:
                    cell.css("color", "maroon");
                    break;
                case 6:
                    cell.css("color", "teal");
                    break;
                case 7:
                    cell.css("color", "DarkMagenta");
                    break;
                case 8:
                    cell.css("color", "black");
                    break;
            }
        }
    })
});

$.each(field_matrix, function(index, row) {
    $.each(row, function(index, cell) {
        var number = $(cell).data("mines");
        if (number > 0) {
            $(cell).append(number);
        }
    });
});

//As minas vão ser colocadas no tabuleiro, um a um. Logo depois, os números 1 são colocados 
//na primeira iteração do código em torno das minas. 
// Conforme as iterações acontecem, quando tem mais de uma mina, ele +1 