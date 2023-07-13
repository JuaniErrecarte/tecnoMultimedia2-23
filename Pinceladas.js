const Y_POSIBLES = [100, 200, 300, 400, 500];

class Pincelada {
  /**
   *
   * @param {number | "applause"} frequency
   * @param {*} capaPinceladas
   * @param {*} initalOpacity
   * @param {*} param4
   */
  constructor(frequency, canvas, capaPinceladas, initalOpacity, options) {
    const anchoColumnas = canvas.width / CANTIDAD_COLUMNAS;
    this.pinceladaImg = getPinceladaByFrequency(frequency);
    this.ancho = anchoColumnas * 2.5;
    if (this.ancho < 150) this.ancho += anchoColumnas;
    this.numeroDeColumna = int(random(0, CANTIDAD_COLUMNAS - 1));
    this.x = this.numeroDeColumna * anchoColumnas;
    this.y = int(random(2, 6)) * 150 - 100;
    this.capa = capaPinceladas;
    this.opacity = initalOpacity;
    if (
      this.pinceladaImg.nombre === "data/pinceladas04.png" ||
      this.pinceladaImg.nombre === "data/pinceladas05.png" ||
      this.pinceladaImg.nombre === "data/pinceladas06.png" ||
      this.pinceladaImg.nombre === "data/pinceladas07.png"
    ) {
      this.opacity = initalOpacity / 1.5;
    }
  }

  paint() {
    this.capa.push();
    this.capa.tint(255, this.opacity);
    console.log(this.pinceladaImg.nombre);
    if (this.pinceladaImg.nombre === "data/pinceladas32.png") {
      this.y = 0;
    }

    this.capa.image(
      this.pinceladaImg.imagen,
      this.x,
      this.y,
      this.ancho,
      this.ancho
    );
    this.capa.pop();
  }
  lowerOpacity() {
    this.opacity -= 2.5;
  }
  getOpacity() {
    return this.opacity;
  }
  /**
   * Función que ajusta la cantidad de pinceladas en base al número máximo (necesaria para bajar la opacidad gradualmente)
   * @param {Pincelada[]} pinceladasActuales el array de las pinceladas
   * @param {number} limit el número máximo de pinceladas
   */
  static adjustPinceladasActuales(pinceladasActuales, limit) {
    limit === 3 &&
      pinceladasActuales.length !== 0 &&
      console.log(
        "%cPinceladas.js line:38 [...pinceladasActuales].reverse()",
        "color: #007acc;",
        [...pinceladasActuales].reverse().map((pinc) => pinc.getOpacity())
      );
    [...pinceladasActuales].reverse().forEach((pincelada) => {
      if (pincelada.getOpacity() < 0) pinceladasActuales.shift();
    });

    for (let i = limit; i < pinceladasActuales.length; i++) {
      const pincelada = pinceladasActuales[i];
      pincelada.lowerOpacity();
    }
  }
  /**
   *
   * @param {Pincelada[] | PinceladaAplauso[]} pinceladasActuales
   */
  static pintarPinceladas(pinceladasActuales) {
    if (!pinceladasActuales.length) {
      return;
    }
    // limpiar la capa para después dibujar las pinceladas
    // con la opacidad correspondiente
    pinceladasActuales[0]?.capa.clear();
    pinceladasActuales.forEach((pinc) => pinc.paint());
  }
}
/**
 *
 * @returns {(typeof SRC_PINCELADAS_ARRAY)[keyof typeof SRC_PINCELADAS_ARRAY][number]}
 */
function getPinceladaByFrequency(frequency) {
  if (frequency === "blanca")
    return SRC_PINCELADAS_ARRAY.blancos[int(random(0, 7))];
  const numero = int(random(0, 35));
  if (frequency < 500) {
    // agarrar un normal si el número es 0-14
    if (numero < 14) return SRC_PINCELADAS_ARRAY.siempre[int(random(0, 5))];
    if (numero < 28) return SRC_PINCELADAS_ARRAY.normales[int(random(0, 3))];
    return SRC_PINCELADAS_ARRAY.normales[int(random(0, 3))];
  }
  if (numero < 12) return SRC_PINCELADAS_ARRAY.siempre[int(random(0, 5))];
  if (numero < 35) return SRC_PINCELADAS_ARRAY.agudos[int(random(0, 5))];
}
