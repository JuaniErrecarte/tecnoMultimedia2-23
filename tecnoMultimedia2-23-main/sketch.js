// FRECUENCIA A ARREGLAR

const AMPLITUD_MINIMA = 0.08; //esto lo hago porque aunque no haya sonido la amplitud se mueve
const AMPLITUD_MAXIMA = 0.9;
const pitchModel =
  "https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/";

/**
 * @type {{
 * siempre: {imagen: any, color: "amarillo-naranja", nombre: string}[],
 * normales: {imagen: any, color: "verde" | "azul-celeste", nombre: string}[],
 * agudos: {imagen: any, color: "rosa", nombre: string }[],
 * blancos: {imagen: any, color: "blanco", nombre: string }[]
 * }}
 */
const SRC_PINCELADAS_ARRAY = {
  normales: [],
  siempre: [],
  agudos: [],
  blancos: [],
};
const CANTIDAD_PINCELADAS = 35;
const CANTIDAD_COLUMNAS = 10;

const audioThings = {
  microfono: null,
  audioContext: null,
  amplitud: null,
};

const pinceladasActuales = [];
const pinceladasBlancasActuales = [];
let columnas = [];
let capaPinceladas, capaColumnas, capaPinceladasBlancas;
let frecuencia;
let framesEnSilencio = 0;
let pitch;

function preload() {
  for (let i = 1; i <= CANTIDAD_PINCELADAS; i++) {
    // intervalos vacíos
    if (i > 13 && i < 26) {
      continue;
    }
    let nombre = "data/pinceladas" + nf(i, 2) + ".png";
    const imagen = loadImage(nombre);
    // siempre (4-8,  amarillos-naranjas)
    if (i >= 4 && i <= 8) {
      SRC_PINCELADAS_ARRAY.siempre.push({
        imagen: imagen,
        color: "amarillo-naranja",
        nombre: nombre,
      });
    }
    // normales (1-3, verde)
    if (i >= 0 && i <= 3) {
      SRC_PINCELADAS_ARRAY.normales.push({ imagen: imagen, color: "verde" });
    }
    // normales (15-21, azul-celeste)
    if (i >= 15 && i <= 21) {
      SRC_PINCELADAS_ARRAY.normales.push({
        imagen: imagen,
        color: "azul-celeste",
        nombre: nombre,
      });
    }
    // agudos (9-13)
    if (i >= 9 && i <= 14) {
      SRC_PINCELADAS_ARRAY.agudos.push({
        imagen: imagen,
        color: "rosa",
        nombre: nombre,
      });
    }
    if (i >= 26 && i <= 32) {
      SRC_PINCELADAS_ARRAY.blancos.push({
        imagen: imagen,
        color: "blanco",
        nombre: nombre,
      });
    }
  }
  console.log(SRC_PINCELADAS_ARRAY);
}
function setup() {
  audioThings.microfono = new p5.AudioIn();
  audioThings.audioContext = getAudioContext();
  audioThings.amplitud = audioThings.microfono.getLevel();

  audioThings.microfono.start(() => {
    pitch = ml5.pitchDetection(
      pitchModel,
      audioThings.audioContext,
      audioThings.microfono.stream,
      () => {
        const setGetter = () => {
          pitch.getPitch((err, frequency) => {
            if (err) console.error(err);
            if (frequency) frecuencia = frequency;
            setGetter();
          });
        };
        setGetter();
      }
    );
  });

  userStartAudio();
  canvas = createCanvas(windowHeight, windowHeight);
  capaColumnas = createGraphics(windowWidth, windowHeight);
  capaPinceladas = createGraphics(windowWidth, windowHeight);
  capaPinceladasBlancas = createGraphics(windowWidth, windowHeight);

  for (let i = 0; i < CANTIDAD_COLUMNAS; i++) {
    const ancho = canvas.width / CANTIDAD_COLUMNAS / 2;
    let xColumna = ancho * 2 * i; // Espacio horizontal entre las columnas
    let columna = new Columnas(xColumna, 0, ancho, 50, capaColumnas); // Crear un objeto columna en la posición x
    columnas.push(columna); // Agregar el objeto columna al array
  }
}

function draw() {
  background(75, 75, 75);
  // logearData({
  //   frecuencia: frecuencia || "",
  //   amplitud: audioThings.microfono.getLevel(),
  //   pinceladasActuales: pinceladasActuales.length,
  //   framesEnSilencio,
  // });

  const haySonido = audioThings.microfono.getLevel() > AMPLITUD_MINIMA;

  if (haySonido == true && frameCount % 2 == 0) {
    framesEnSilencio = 0;
    const newPincelada = new Pincelada(frecuencia, canvas, capaPinceladas, 255);
    const newPinceladaBlanca = new Pincelada(
      "blanca",
      canvas,
      capaPinceladasBlancas,
      255
    );
    pinceladasActuales.push(newPincelada);
    console.log(pinceladasActuales);
    pinceladasBlancasActuales.push(newPinceladaBlanca);
  } else {
    framesEnSilencio++;
    const silenceFramesLimit = 30 * 5;
    if (framesEnSilencio > silenceFramesLimit) {
      pinceladasActuales.length = 0;
      pinceladasBlancasActuales.length = 0;
      capaPinceladas.clear();
      capaPinceladasBlancas.clear();
      framesEnSilencio = 0;
    }
  }

  Pincelada.adjustPinceladasActuales(pinceladasActuales, 25);
  Pincelada.adjustPinceladasActuales(pinceladasBlancasActuales, 8);
  Pincelada.pintarPinceladas(pinceladasActuales);
  Pincelada.pintarPinceladas(pinceladasBlancasActuales);

  columnas.forEach((columna) => {
    columna.mostrar();
    columna.mover();
  });
  image(capaColumnas, 0, 0);
  push();
  tint(255, map(audioThings.microfono.getLevel(), 0, 0.5, 120, 500));
  image(capaPinceladas, 0, 0);
  // pop();
  image(capaPinceladasBlancas, 0, 0);
}

const logearData = (data) => {
  const div = document.getElementById("debugBox");
  div.innerHTML = `<pre>${JSON.stringify(data, null, 2)}<pre>`;
};
