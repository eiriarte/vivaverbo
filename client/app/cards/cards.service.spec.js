'use strict';

describe('Service: cards', function () {

  // load the service's module
  beforeEach(module('vivaverboApp'));

  // instantiate service
  let cards, $rootScope;
  let $httpBackend;

  beforeEach(inject(function (_$httpBackend_) {
    $httpBackend = _$httpBackend_;
    $httpBackend.whenGET('/api/users/me').respond({
      '_id': '55c06722591903e30543848a',
      'provider': 'local',
      'name': 'Jasmine Test User',
      'email': 'test@test.com',
      '__v': 0,
      'role': 'user'
    });
    $httpBackend.flush();
  }));

  beforeEach(inject(function (_$rootScope_, _cardService_) {
    $rootScope = _$rootScope_;
    cards = _cardService_;
    $httpBackend.whenGET('/api/cards').respond(getCards());
  }));

  afterAll(function() {
    localStorage.clear();
  });

  it('debe devolver el objeto review', function () {
    let numTarjetas = 4;
    cards.getReview(numTarjetas).then((review) => {
      expect(typeof review).toBe('object');
      expect(typeof review.fecha).toBe('object');
      expect(review.fecha.constructor.name).toBe('Date');
      expect(review.finalizado).toBe(false);
      expect(review.totalTarjetas).not.toBeGreaterThan(numTarjetas);
      expect(review.tarjetaActual).toBe(0);
      expect(typeof review.tarjetas).toBe('object');
      expect(review.tarjetas.length).toBe(review.totalTarjetas);
    });
  });

  it('debe devolver las tarjetas de repaso', function () {
    let listaIDs = [1, 10, 99];
    cards.getCards(listaIDs).then((cards) => {
      expect(typeof cards).toBe('object', 'porque debe ser la lista de cards');
      expect(cards.length).toBe(listaIDs.length);
      angular.forEach(cards, (card) => {
        expect(typeof card).toBe('object', 'porque debe ser una de las cards');
        expect(typeof card.pregunta).toBe('string', 'porque debe ser la pregunta');
        expect(typeof card.respuesta).toBe('string', 'porque debe ser la respuesta');
        expect(typeof card.frasePregunta).toBe('string', 'porque debe ser la frase pregunta');
        expect(typeof card.fraseRespuesta).toBe('string', 'porque debe ser la frase respuesta');
      });
    });
    $rootScope.$digest();
    $httpBackend.flush();
  });

});

function getCards() {
  return [
    { 'pregunta': '0', 'frasePregunta': 'cero', 'respuesta': 'oso (s, z)', 'fraseRespuesta': 'Oso Panda: Comiendo tallos y hojas' },
    { 'pregunta': '1', 'frasePregunta': 'uno', 'respuesta': 'It (t, d)', 'fraseRespuesta': 'Pennywise: riendo con dientes afilados, globos, señalándote' },
    { 'pregunta': '2', 'frasePregunta': 'dos', 'respuesta': 'Ian (n, ñ)', 'fraseRespuesta': 'Gandalf (Ian McKellen): cayado, "No puedes pasar"' },
    { 'pregunta': '3', 'frasePregunta': 'tres', 'respuesta': 'Uma (m)', 'fraseRespuesta': 'Uma Thurman en "Pulp Fiction": Baila descalza con John Travolta' },
    { 'pregunta': '4', 'frasePregunta': 'cuatro', 'respuesta': 'rey (r, rr)', 'fraseRespuesta': 'Rey de bastos: leño-porra y corona desproporcionados' },
    { 'pregunta': '5', 'frasePregunta': 'cinco', 'respuesta': 'Lee (l)', 'fraseRespuesta': 'Bruce Lee: Patada de kung-fu y grito' },
    { 'pregunta': '6', 'frasePregunta': 'seis', 'respuesta': 'GEO (g, j)', 'fraseRespuesta': 'Policía del Grupo Especial de Operaciones: armado, bajando por una cuerda, desde un helicópero' },
    { 'pregunta': '7', 'frasePregunta': 'siete', 'respuesta': 'Hook (k, q, c)', 'fraseRespuesta': 'Dustin Hoffman en "Hook": garfio, risa de malo como en la peli' },
    { 'pregunta': '8', 'frasePregunta': 'ocho', 'respuesta': 'Pau (p, f)', 'fraseRespuesta': 'Pau Gasol: botando y colando pelota de baloncesto en algún sitio' },
    { 'pregunta': '9', 'frasePregunta': 'nueve', 'respuesta': 'Evo (b, v)', 'fraseRespuesta': 'Evo Morales: jugando al fútbol y marcando un gol en algún sitio' },
    { 'pregunta': '10', 'frasePregunta': 'diez', 'respuesta': 'Hades', 'fraseRespuesta': 'Dios del inframundo: con Cerbero, báculo y neblina' },
    { 'pregunta': '11', 'frasePregunta': 'once', 'respuesta': 'tutú', 'fraseRespuesta': 'bailarina: con tutú, bailando de puntillas, girando y saltando' },
    { 'pregunta': '12', 'frasePregunta': 'doce', 'respuesta': 'tuno', 'fraseRespuesta': 'tuno: guitarra, cantando "Clavelito"' },
    { 'pregunta': '13', 'frasePregunta': 'trece', 'respuesta': 'tom', 'fraseRespuesta': 'Hanks, as Forrest Gump: comiendo bombones' },
    { 'pregunta': '14', 'frasePregunta': 'catorce', 'respuesta': 'Thor', 'fraseRespuesta': 'Thor de Marvel: girando el martillo, golpeando el suelo…' },
    { 'pregunta': '15', 'frasePregunta': 'quince', 'respuesta': 'Dalai', 'fraseRespuesta': 'Dalai Lama: saludo y reverencia típicos' },
    { 'pregunta': '16', 'frasePregunta': 'dieciséis', 'respuesta': 'Diego', 'fraseRespuesta': 'Diego Velázquez: pintando un cuadro, como en las meninas' },
    { 'pregunta': '17', 'frasePregunta': 'diecisiete', 'respuesta': 'duque', 'fraseRespuesta': 'de Palma (Urdangarín): huyendo nervioso, con los bolsillos rebosando billetes' },
    { 'pregunta': '18', 'frasePregunta': 'dieciocho', 'respuesta': 'Depp', 'fraseRespuesta': 'Johnny Depp como "Eduardo Manostijeras": con tijeras en las manos, podando cosas, cortándo(se) pelos, etc.' },
    { 'pregunta': '19', 'frasePregunta': 'diecinueve', 'respuesta': 'Tobey', 'fraseRespuesta': 'Tobey Maguire como "Spiderman": en la pared, sujetando / atrapando cosas con telas de araña' },
    { 'pregunta': '20', 'frasePregunta': 'veinte', 'respuesta': 'nazi', 'fraseRespuesta': 'Hitler: bigote, paso de ganso, mano levantada, cruz gamada en el brazo' },
    { 'pregunta': '21', 'frasePregunta': 'veintiuno', 'respuesta': 'Indy', 'fraseRespuesta': 'Indiana Jones: usando el látigo, banda sonora' },
    { 'pregunta': '22', 'frasePregunta': 'veintidos', 'respuesta': 'enano', 'fraseRespuesta': 'Thorin en "El Hobbit": sobre una montaña de oro, apilando oro, mirada de paranoico' },
    { 'pregunta': '23', 'frasePregunta': 'veintitrés', 'respuesta': 'Nimoy', 'fraseRespuesta': 'Leonard Nimoy como "Spock": Saludo vulcaniano' },
    { 'pregunta': '24', 'frasePregunta': 'veinticuatro', 'respuesta': 'Niro', 'fraseRespuesta': 'Robert de Niro como "Taxi Driver": pistola, "Ya talkin to me?"' },
    { 'pregunta': '25', 'frasePregunta': 'veinticinco', 'respuesta': 'Noel', 'fraseRespuesta': 'Papá Noel: gorro y saco de regalos, y risa de Santa' },
    { 'pregunta': '26', 'frasePregunta': 'veintiséis', 'respuesta': 'Íñigo', 'fraseRespuesta': 'Íñigo Montoya: espada, "Hola, me llamo…"' },
    { 'pregunta': '27', 'frasePregunta': 'veintisiete', 'respuesta': 'Wonka', 'fraseRespuesta': 'Gene Wilder como "Willy Wonka": bastón, corbata-lazo, sombrero de copa, bailecito, reverencia' },
    { 'pregunta': '28', 'frasePregunta': 'veintiocho', 'respuesta': 'naipe', 'fraseRespuesta': 'de Alice in Wonderland: serio, con lanza, peto con el cinco de corazones' },
    { 'pregunta': '29', 'frasePregunta': 'veintinueve', 'respuesta': 'Nieve', 'fraseRespuesta': 'John (JdT): Con abrigo de piel lleno de nieve, nieve a su alrededor' },
    { 'pregunta': '30', 'frasePregunta': 'treinta', 'respuesta': 'Masa', 'fraseRespuesta': 'increíble Hulk: sólo con pantalones, enfadado, lo destroza todo' },
    { 'pregunta': '31', 'frasePregunta': 'treinta y uno', 'respuesta': 'mito', 'fraseRespuesta': 'Perseo con la cabeza de Medusa: espada, casco alado, cabeza de Medusa con ojos brillantes' },
    { 'pregunta': '32', 'frasePregunta': 'treinta y dos', 'respuesta': 'mona', 'fraseRespuesta': 'mono: colgada de una rama, comiendo un plátano' },
    { 'pregunta': '33', 'frasePregunta': 'treinta y tres', 'respuesta': 'mimo', 'fraseRespuesta': 'Marcel Marceau como "Bip" el payaso: oliendo una flor imaginaria, apoyado en el aire' },
    { 'pregunta': '34', 'frasePregunta': 'treinta y cuatro', 'respuesta': 'maorí', 'fraseRespuesta': 'guerrero maorí: tatuado, danza, lengua' },
    { 'pregunta': '35', 'frasePregunta': 'treinta y cinco', 'respuesta': 'mulo', 'fraseRespuesta': 'burro: a cuatro patas, orejas largas, rebuznar, comer hierba' },
    { 'pregunta': '36', 'frasePregunta': 'treinta y seis', 'respuesta': 'mago', 'fraseRespuesta': 'Tamariz: sacando un conejo de la chistera, "tia-ra-ráaaa"' },
    { 'pregunta': '37', 'frasePregunta': 'treinta y siete', 'respuesta': 'Mike', 'fraseRespuesta': 'Mike Myers como el "Dr. Maligno" en "Austin Powers": calvo, risita con dedo meñique' },
    { 'pregunta': '38', 'frasePregunta': 'treinta y ocho', 'respuesta': 'oompa', 'fraseRespuesta': 'oompa loompa: peluca verde, bailecito, canción "oompa, loompa, doompadee doo…"' },
    { 'pregunta': '39', 'frasePregunta': 'treinta y nueve', 'respuesta': 'MIB', 'fraseRespuesta': 'Uno de los "Men in Black": gafas de sol, "neuralizador"' },
    { 'pregunta': '40', 'frasePregunta': 'cuarenta', 'respuesta': 'Ares', 'fraseRespuesta': 'Dios de la Guerra: lanza, escudo, fiero, "guerraaa!!!"' },
    { 'pregunta': '41', 'frasePregunta': 'cuarenta y uno', 'respuesta': 'Rato', 'fraseRespuesta': 'Rodrigo Rato: campanilla de salida a Bolsa, pulgar levantado' },
    { 'pregunta': '42', 'frasePregunta': 'cuarenta y dos', 'respuesta': 'Iron', 'fraseRespuesta': 'Iron Man: flotando, propulsores en pies y manos, disparando energía' },
    { 'pregunta': '43', 'frasePregunta': 'cuarenta y tres', 'respuesta': 'Rama', 'fraseRespuesta': 'Dios hindú Rama: gota roja, manita, corona, arco y flechas, música india' },
    { 'pregunta': '44', 'frasePregunta': 'cuarenta y cuatro', 'respuesta': 'herrero', 'fraseRespuesta': 'herrero prototípico: yunque y martillo' },
    { 'pregunta': '45', 'frasePregunta': 'cuarenta y cinco', 'respuesta': 'Ariel', 'fraseRespuesta': 'La Sirenita: moviendo cola de pez, húmeda, charco de agua' },
    { 'pregunta': '46', 'frasePregunta': 'cuarenta y seis', 'respuesta': 'oruga', 'fraseRespuesta': 'Oruga de Alice in Wonderland: tumbado, fumando en cachimba, humo' },
    { 'pregunta': '47', 'frasePregunta': 'cuarenta y siete', 'respuesta': 'orco', 'fraseRespuesta': 'Azog el profanador: atacando con cadena y piedra' },
    { 'pregunta': '48', 'frasePregunta': 'cuarenta y ocho', 'respuesta': 'Rafa', 'fraseRespuesta': 'Rafa Nadal: Jugando al tenis, lanzando bolas' },
    { 'pregunta': '49', 'frasePregunta': 'cuarenta y nueve', 'respuesta': 'árabe', 'fraseRespuesta': 'árabe musulmán: rezando sobre una alfombra' },
    { 'pregunta': '50', 'frasePregunta': 'cincuenta', 'respuesta': 'Louis', 'fraseRespuesta': 'Cyphre: ojos encendidos, señalándote, "tu alma me pertenece"' },
    { 'pregunta': '51', 'frasePregunta': 'cincuenta y uno', 'respuesta': 'Leto', 'fraseRespuesta': 'Diosa Leto: flotando con dos bebés y un pecho fuera' },
    { 'pregunta': '52', 'frasePregunta': 'cincuenta y dos', 'respuesta': 'Alien', 'fraseRespuesta': 'Alien: segunda boca, baba' },
    { 'pregunta': '53', 'frasePregunta': 'cincuenta y tres', 'respuesta': 'lamia', 'fraseRespuesta': 'lamia: colmillos, ojos rojos, garras por piernas, y cola venenosa' },
    { 'pregunta': '54', 'frasePregunta': 'cincuenta y cuatro', 'respuesta': 'loro', 'fraseRespuesta': 'hombre disfrazado: alas y pies de loro, baile del loro' },
    { 'pregunta': '55', 'frasePregunta': 'cincuenta y cinco', 'respuesta': 'Lala', 'fraseRespuesta': 'teletubbie amarilla: gorro amarillo, cuerno espiral, jugando con pelota naranja, riendo' },
    { 'pregunta': '56', 'frasePregunta': 'cincuenta y seis', 'respuesta': 'LEGO', 'fraseRespuesta': 'Muñeco LEGO: caminando mecánicamente, sin usar codos ni rodillas, stop motion' },
    { 'pregunta': '57', 'frasePregunta': 'cincuenta y siete', 'respuesta': 'Luke', 'fraseRespuesta': 'Luke Skywalker: sable de luz, entrenando con un seeker' },
    { 'pregunta': '58', 'frasePregunta': 'cincuenta y ocho', 'respuesta': 'elfo', 'fraseRespuesta': 'Legolas: orejas puntiagudas, arco y flecha, apuntando' },
    { 'pregunta': '59', 'frasePregunta': 'cincuenta y nueve', 'respuesta': 'Hellboy', 'fraseRespuesta': 'Hellboy: puro, puño rojo de piedra, pistolón, "cagarro"' },
    { 'pregunta': '60', 'frasePregunta': 'sesenta', 'respuesta': 'juez', 'fraseRespuesta': 'Garzón: peluca, puñetas y dando martillazos: "orden!!"' },
    { 'pregunta': '61', 'frasePregunta': 'sesenta y uno', 'respuesta': 'Gata', 'fraseRespuesta': 'negra, CatWoman: orejas de gato, postura de gato, prrrr… "miau".' },
    { 'pregunta': '62', 'frasePregunta': 'sesenta y dos', 'respuesta': 'genio', 'fraseRespuesta': 'Djinn: saliendo de una lámpara, gigante, brazos cruzados' },
    { 'pregunta': '63', 'frasePregunta': 'sesenta y tres', 'respuesta': 'goma', 'fraseRespuesta': 'Mr. Fantastic: estirando el cuello, brazos, etc.' },
    { 'pregunta': '64', 'frasePregunta': 'sesenta y cuatro', 'respuesta': 'ogro', 'fraseRespuesta': 'ogro: con garrote, gruñendo y babeando' },
    { 'pregunta': '65', 'frasePregunta': 'sesenta y cinco', 'respuesta': 'galo', 'fraseRespuesta': 'Depardieu as Obélix: con menhir, trenzas pelirrojas' },
    { 'pregunta': '66', 'frasePregunta': 'sesenta y seis', 'respuesta': 'gogó', 'fraseRespuesta': 'Bailarina gogó: pole dance' },
    { 'pregunta': '67', 'frasePregunta': 'sesenta y siete', 'respuesta': 'Goku', 'fraseRespuesta': 'Goku: gritando, entrando en modo supersaija' },
    { 'pregunta': '68', 'frasePregunta': 'sesenta y ocho', 'respuesta': 'Goofy', 'fraseRespuesta': 'Goofy: gorrito, orejas, risa, zapatones' },
    { 'pregunta': '69', 'frasePregunta': 'sesenta y nueve', 'respuesta': 'Jehová', 'fraseRespuesta': 'Dios cristiano: triángulo tras cabeza, luz, levitando, bajando del cielo' },
    { 'pregunta': '70', 'frasePregunta': 'setenta', 'respuesta': 'Cosa', 'fraseRespuesta': 'Fantastic Four: el suelo tiembla bajo sus pies' },
    { 'pregunta': '71', 'frasePregunta': 'setenta y uno', 'respuesta': 'aikido', 'fraseRespuesta': 'Aikidoka: practicando sólo o interactuando con otros personajes' },
    { 'pregunta': '72', 'frasePregunta': 'setenta y dos', 'respuesta': 'Keanu', 'fraseRespuesta': 'Keanu Reeves, as Neo: efecto bala' },
    { 'pregunta': '73', 'frasePregunta': 'setenta y tres', 'respuesta': 'Kim', 'fraseRespuesta': 'Kim Jong Un: agitando la manita, saludando a la muchedumbre, peinado de seta' },
    { 'pregunta': '74', 'frasePregunta': 'setenta y cuatro', 'respuesta': 'Carrie', 'fraseRespuesta': 'Carrie: bañada en sangre, mirada perdida, telequinesis destructiva' },
    { 'pregunta': '75', 'frasePregunta': 'setenta y cinco', 'respuesta': 'Kali', 'fraseRespuesta': 'Diosa Kali: baile indio, cuatro brazos, cabeza, espada, sacando la lengua' },
    { 'pregunta': '76', 'frasePregunta': 'setenta y seis', 'respuesta': 'cojo', 'fraseRespuesta': 'Dr. House: caminando a cojetás con un bastón' },
    { 'pregunta': '77', 'frasePregunta': 'setenta y siete', 'respuesta': 'caco', 'fraseRespuesta': 'Dios caco: vomitando fuego' },
    { 'pregunta': '78', 'frasePregunta': 'setenta y ocho', 'respuesta': 'capo', 'fraseRespuesta': 'Marlon Brando, as Vito Corleone : dientes de cáscara de naranja' },
    { 'pregunta': '79', 'frasePregunta': 'setenta y nueve', 'respuesta': 'cabo', 'fraseRespuesta': 'del ejército: boina, arma al hombro' },
    { 'pregunta': '80', 'frasePregunta': 'ochenta', 'respuesta': 'payaso', 'fraseRespuesta': 'payaso Lou Jacobs: Nariz de payaso, maquillaje, conduciendo mini-coche' },
    { 'pregunta': '81', 'frasePregunta': 'ochenta y uno', 'respuesta': 'pato', 'fraseRespuesta': 'pato Donald: gorro de marinero, enfadado, hablando como el pato Donald' },
    { 'pregunta': '82', 'frasePregunta': 'ochenta y dos', 'respuesta': 'fauno', 'fraseRespuesta': 'fauno: pezuñas hendidas, cuernos de cabra, tocando una flauta de pan' },
    { 'pregunta': '83', 'frasePregunta': 'ochenta y tres', 'respuesta': 'fumao', 'fraseRespuesta': 'Big Lebowsky: Emporrao, fumándose un peta' },
    { 'pregunta': '84', 'frasePregunta': 'ochenta y cuatro', 'respuesta': 'perro', 'fraseRespuesta': 'Perro, de JdT: a caballo, cara quemada, con Aria Stark delante' },
    { 'pregunta': '85', 'frasePregunta': 'ochenta y cinco', 'respuesta': 'Apolo', 'fraseRespuesta': 'Dios de la música, la verdad, etc.: carro de fuego, cuadriga, lira' },
    { 'pregunta': '86', 'frasePregunta': 'ochenta y seis', 'respuesta': 'fuego', 'fraseRespuesta': 'Fantastic Four: brazos ardiendo, echando fuego' },
    { 'pregunta': '87', 'frasePregunta': 'ochenta y siete', 'respuesta': 'foca', 'fraseRespuesta': 'foca: con pelota en la nariz, gritos de foca' },
    { 'pregunta': '88', 'frasePregunta': 'ochenta y ocho', 'respuesta': 'Papa', 'fraseRespuesta': 'Ratzinger: con gorrito blanco, bendiciendo en latín, señal de la cruz mano-kárate' },
    { 'pregunta': '89', 'frasePregunta': 'ochenta y nueve', 'respuesta': 'pavo', 'fraseRespuesta': 'pavo real: abriendo cola, "glugluglú"' },
    { 'pregunta': '90', 'frasePregunta': 'noventa', 'respuesta': 'buzo', 'fraseRespuesta': 'buzo: con gafas, aletas, buceando en el aire, echando burbujas' },
    { 'pregunta': '91', 'frasePregunta': 'noventa y uno', 'respuesta': 'buda', 'fraseRespuesta': 'buda: meditando, levitando en la posición del loto, "ohmmmmm"' },
    { 'pregunta': '92', 'frasePregunta': 'noventa y dos', 'respuesta': 'Bin', 'fraseRespuesta': 'Bin Laden: kalasnikov, tiros al aire' },
    { 'pregunta': '93', 'frasePregunta': 'noventa y tres', 'respuesta': 'Obama', 'fraseRespuesta': 'Obama: Dando un discurso antes muchos micrófonos, gesticulando' },
    { 'pregunta': '94', 'frasePregunta': 'noventa y cuatro', 'respuesta': 'ebrio', 'fraseRespuesta': 'ebrio: dando tumbos, eructando, con jarra de cerveza' },
    { 'pregunta': '95', 'frasePregunta': 'noventa y cinco', 'respuesta': 'Bali', 'fraseRespuesta': 'rey mono (vanara): cola, cetro, corona-casco-puntiagudo' },
    { 'pregunta': '96', 'frasePregunta': 'noventa y seis', 'respuesta': 'viejo', 'fraseRespuesta': 'anciano: andando encorvado, con andador' },
    { 'pregunta': '97', 'frasePregunta': 'noventa y siete', 'respuesta': 'Baco', 'fraseRespuesta': 'Dionisos, dios del vino: con hojas de parra en el pelo, copa de vino y uvas' },
    { 'pregunta': '98', 'frasePregunta': 'noventa y ocho', 'respuesta': 'bofia', 'fraseRespuesta': 'poli malo: gorro con chapa, porra en mano, amenazando' },
    { 'pregunta': '99', 'frasePregunta': 'noventa y nueve', 'respuesta': 'Bob', 'fraseRespuesta': 'Esponja: riendo, bandeja con Krabby Patty' }];
}
