let pausa = false;
let tempo_em_segundos = 0;
let timer = false;


class Zona {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.temBomba = false;
        this.temBandeira = false;
        this.vizinhosBombados = 0;
        this.revelado = false;
    }
}

class CampoMinado {
    constructor(nZonas, nivel) {
        this.nZonas = nZonas;
        this.nivel = nivel;
        this.campoMinado = new Array(nZonas);
        this.maxBombas = nZonas * nZonas * nivel;
        this.revelados = 0;
        this.estourou = false;
        this.bandeiras = 0;
    }

    iniciar() {
        this.revelados = 0;
        this.estourou = false;
        this.bandeiras = 0;

        for(let i = 0; i < this.nZonas; i++){

            this.campoMinado[i] = new Array(this.nZonas);
            for(let j = 0; j < this.nZonas; j++){
                this.campoMinado[i][j] = new Zona(i, j);
            }
        }

        this.distribuirBombas();
    }

    getZona(x, y) {
        if (x >= 0 && x < this.nZonas && y >=0 && y < this.nZonas) {
            return this.campoMinado[x][y];
        }
    }

    getVizinhos(zona) {
        const vizinhos = [];
        this._paraTodoVizinhoValido(zona, (vizinho) => vizinhos.push(vizinho));
        return vizinhos;
    }

    revelarZona(zona, bandeira) {

        //console.log(this.revelados);
        
        zona.revelado = true;
        this.revelados++;
        this.estourou = zona.temBomba;
        this.bandeira = bandeira;

        return zona;
    }


    venceu () {
        return this.revelados == (this.nZonas ** 2) - this.maxBombas;
    }

    acabou() {
        return this.venceu() || this.estourou;
    }

    distribuirBombas() {
        let bombasRestantes = this.maxBombas;
        while(bombasRestantes > 0){
            let i = parseInt(Math.random() * this.nZonas);
            let j = parseInt(Math.random() * this.nZonas);
            const zonaAtual = this.campoMinado[i][j];
            if(zonaAtual.temBomba == false){
                zonaAtual.temBomba = true;
                this.contabilizarVizinhosBombados(zonaAtual);
                bombasRestantes--;
            }
        }
    }

    _paraTodoVizinhoValido(zona, funcao){
        const x = zona.x;
        const y = zona.y;

        for(let i = x -1; i <= x + 1; i++){
            for(let j = y - 1; j <= y + 1; j++){
                if(!this._eZonaValida(i, j) || (x == i && y == j)){
                    continue;
                } else {
                    const vizinho = this.campoMinado[i][j];
                    funcao(vizinho);
                }
            }
        }
    }

    _eZonaValida(i, j){
        return !(i < 0 || i >= this.nZonas || j < 0 || j >= this.nZonas) ;
    }



    contabilizarVizinhosBombados(zona){
        this._paraTodoVizinhoValido(zona, (zonaVizinha) => zonaVizinha.vizinhosBombados++ );
    }

}

class UI {
    constructor(campoMinado) {
        this.divCampo =  document.getElementById("campo_minado");
        this.divCampoPausado = document.getElementById("campo_pausado");
        this.spanNBand = document.getElementById("n_band");
        this.divGameOver = document.getElementById("game_over");
        this.imgIcon = document.getElementById("icon");
        this.spanMensagem = document.getElementById("mensagem");
        this.btnNovoJogo = document.getElementById("new_game");
        this.pCronometro = document.getElementById("cronometro");
        this.btnPlay = document.getElementById("play");
        this.btnPause = document.getElementById("pause");
        this.btnStop = document.getElementById("stop");



        this.btnNovoJogo.addEventListener("click",() =>  this.inicializar());
        this.btnNovoJogo.addEventListener("click",() =>  this.reinicializar());

        this.campoMinado = campoMinado;
        this.nZonas = campoMinado.nZonas;
        this.nivel =  campoMinado.nivel;
        this.tamanhoZona = this.divCampo.getBoundingClientRect().width / this.nZonas;
    }

    reinicializar(){
        tempo_em_segundos = 0;
        pausa= true;
        timer = false;
    }


    inicializar(){
        this.divGameOver.setAttribute('class', 'invisible');
        this.imgIcon.setAttribute("class", "invisible");
        this.btnNovoJogo.setAttribute("class", "invisible");

        let zonas = document.querySelectorAll("div.zona");
        for(let i = 0; i < zonas.length; i++){
            zonas[i].parentNode.removeChild(zonas[i]);
        }

        this.spanNBand.textContent = 0;

        this.btnPlay.removeAttribute("disabled");
        this.btnPause.removeAttribute("disabled");

        function myTimer() {
            let hora;
            let minutos;
            let segundos;

            if (pausa == false) {
                tempo_em_segundos++;
            }
            hora = Math.floor(tempo_em_segundos / (3600));
            minutos = Math.floor((tempo_em_segundos % (3600))/ 60);
            segundos = Math.floor((tempo_em_segundos % (3600)) % 60);

            console.log(hora+":"+minutos+":"+segundos);
            document.getElementById("cronometro").innerHTML = hora+":"+minutos+":"+segundos;
        }

        // lógica para iniciar o cronometro
        this.btnPlay.addEventListener("click", clickbtnplay);
        function clickbtnplay() {
            document.getElementById("campo_pausado").setAttribute('class', 'd-flex align-items-center justify-content-center invisible');
            if (!timer) {
                setInterval(myTimer, 1000);
                timer = true;
            }
            pausa = false;
        }

        // lógica para pausar o cronometro
        this.btnPause.addEventListener("click", clickbtnpause);
        function clickbtnpause() {
            pausa = true;

            document.getElementById("campo_pausado").setAttribute('class', 'd-flex align-items-center justify-content-center visible');

        }


        // lógica para parar o jogo
        this.btnStop.addEventListener("click", clickbtnstop);
        function clickbtnstop() {
            document.getElementById("campo_pausado").setAttribute('class', 'd-flex align-items-center justify-content-center invisible');
            tempo_em_segundos = 0;
            pausa = true;

            document.getElementById("icon").setAttribute('src', 'img/explosion.png');
            document.getElementById("mensagem").innerHTML = "Game Over!";
            document.getElementById("game_over").setAttribute('class', 'alert alert-danger visible');

            document.getElementById("icon").setAttribute("class", "visible");
            document.getElementById("new_game").setAttribute("class", "visible btn btn-light text-dark");
        } 

        


        for(let i = 0; i < this.nZonas; i++){
            for(let j = 0; j < this.nZonas; j++){

                const zona = document.createElement("div");

                zona.style.width = `${ this.tamanhoZona}px`;
                zona.style.height = `${ this.tamanhoZona}px`;

                zona.style.top = `${(i * this.tamanhoZona)}px`;
                zona.style.left = `${(j * this.tamanhoZona)}px`;

                zona.id = "z-" + i + "-" + j;
                zona.setAttribute("class","zona d-flex align-items-center justify-content-center");

                zona.addEventListener("click",  (evento) => {
                    if(!this.campoMinado.acabou()) {
                        clickbtnplay();
                        const zonaClicada = evento.target;
                        const [_, x, y] = zonaClicada.id.split("-");
                        const zona = this.campoMinado.getZona(x, y);

                        // condicional para saber se está pressionando o alt
                        if (evento.altKey) { 
                            console.log("reconheceu");
                            this.revelarZona(zona, true);
                        }else{
                            console.log("merda");
                            this.revelarZona(zona);
                        }
                        
                    }
                });
                this.divCampo.appendChild(zona);
            }
        }

        this.campoMinado.iniciar();
    }

    revelarZona(zona, bandeira = false) {
        this.campoMinado.revelarZona(zona, bandeira);
        const zonaClicada = document.getElementById(`z-${zona.x}-${zona.y}`);


        zonaClicada.classList.add("revelado");

        if(bandeira){
            zonaClicada.classList.add("bandeira");
           
        }else{
            if(zona.temBomba){
                zonaClicada.classList.add("bomba");
                this.gameOver();
            } else {
                if (zona.vizinhosBombados > 0) {
                    zonaClicada.classList.add(this.getClasseNumero(zona.vizinhosBombados));
                }
                zonaClicada.innerHTML = zona.vizinhosBombados;
                if(this.campoMinado.venceu()) {
                    this.gameOver(true);
                } else {
                    setTimeout(  () => this.revelarVizinhanca(zona), 5);
                }
            }
        }
        

    }

    getClasseNumero(numero){

        switch(numero){
            case 1:
                return "um";
            case 2:
                return "dois";
            case 3:
                return "tres";
            case 4:
                return "quatro";
            case 5:
                return "cinco";
            default:
                return "";
        }
    }



    revelarVizinhanca(zona){
        const vizinhos = this.campoMinado.getVizinhos(zona);
        for (const vizinho of vizinhos) {
            if(zona.vizinhosBombados == 0 && vizinho.temBomba == false && vizinho.revelado == false){
                this.revelarZona(vizinho);
            }
        }
    }

    gameOver(venceu){
        this.updatePopup(venceu);
        this.limparListeners();
        this.mostrarTudo(true);
    }

    limparListeners(){
        let zonas = document.querySelectorAll("div.zona");
        for(let i = 0; i < zonas.length; i++){
            zonas[i].removeEventListener("click", this.callback);
        }
    }

    updatePopup(venceu){

        if(venceu){
            this.imgIcon.setAttribute('src', 'img/sunglasses.png');
            this.spanMensagem.innerHTML = "Parabéns você venceu!";
            this.divGameOver.setAttribute('class', 'alert alert-success visible');
        } else {
            this.imgIcon.setAttribute('src', 'img/explosion.png');
            this.spanMensagem.innerHTML = "Game Over!";
            this.divGameOver.setAttribute('class', 'alert alert-danger visible');
        }

        this.imgIcon.setAttribute("class", "visible");
        this.btnNovoJogo.setAttribute("class", "visible btn btn-light text-dark");
    }

    paraTodaZona(callback) {

        for(let x = 0; x < this.nZonas; x++){
            for(let y = 0; y < this.nZonas; y++){
                const zonaAtual = this.campoMinado.getZona(x, y);
                callback(zonaAtual);
            }
        }
    }

    mostrarTudo(bombas, numeros, bandeiras){
        this.paraTodaZona(function(zonaAtual){
                const zona = document.getElementById("z-"+ zonaAtual.x + "-" + zonaAtual.y);
                if(zonaAtual.temBomba && bombas){
                    zona.className = "zona bomba";
                }

                if(zonaAtual.temBandeira && bandeiras){
                    zona.className = "zona bandeira";
                } else if(numeros) {
                    zona.innerHTML = zonaAtual.vizinhosBombados;
                }
            }
        );
    }

}

window.addEventListener("load", function(){
    const campoMinado = new CampoMinado(10, 0.10);
    const ui = new UI(campoMinado);
    ui.inicializar();
});
