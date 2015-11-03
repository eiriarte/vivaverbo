/* jshint unused: false */

'use strict';

const mock = angular.module('vivaverboMock', [
  'vivaverboApp',
  'ngMockE2E'
]);

// Simular latencia
mock.config(function ($provide) {
  const latencia = 0;
  $provide.decorator('$httpBackend', function ($delegate) {
    const proxy = function(method, url, data, callback, headers) {
      const interceptor = function() {
        const _arguments = arguments;
        window.setTimeout(() => {
          callback.apply(this, _arguments);
        }, latencia);
      };
      return $delegate.call(this, method, url, data, interceptor, headers);
    };
    for(let key in $delegate) {
      proxy[key] = $delegate[key];
    }
    return proxy;
  });
});

mock.run(function ($httpBackend) {
  $httpBackend.whenGET(/\.html$/).passThrough();
  $httpBackend.whenGET('/api/cards').passThrough();
  $httpBackend.whenGET(/\/api\/memory/).passThrough();
  $httpBackend.whenPOST('/api/memory').passThrough();
  $httpBackend.whenPOST('/api/users/me').passThrough();

  $httpBackend.whenGET('/api/categories').respond(getCategories());

  //$httpBackend.whenGET('/api/cards').respond(getCards());
  //$httpBackend.whenGET(/\/api\/memory/).respond(getServerMemories());

  //$httpBackend.whenPOST('/api/memory').respond(getMemories);
  //$httpBackend.whenPOST('/api/users/me').respond(200);
});

// GET /api/categories
function getCategories() {
  return [{
    slug: 'sistema-mayor',
    titulo: 'Sistema mayor'
  },
  {
    slug: 'papiroflexia',
    titulo: 'Papiroflexia'
  },
  {
    slug: 'globoflexia',
    titulo: 'Globoflexia'
  },
  {
    slug: 'cumpleannos',
    titulo: 'Cumpleaños'
  }];
}

// GET /api/memory
function getServerMemories() {
  return [] || [
    {
      'card':'55f2f2a144cdb68ec2438a19',
      'recalls':[
        {'recall':0, '_id':'f903d1c6038f6a93e5f4dca8','date':'2015-09-02T13:12:52.082Z'},
        {'recall':1,'_id':'077f8b6217f0b3f9eb302fc1','date':'2015-09-02T13:13:11.030Z'}
      ],
      'recallProbability':0.5,
      '_id':'2dd9a4f33ffbd6492c7750fd'
    },
    {
      'card':'55f2f2a144cdb68ec2438a15',
      'recalls': [
        {'recall':0,'_id':'3bf4ce96bfb990dc07fc9ec5','date':'2015-09-02T11:42:52.082Z'},
        {'recall':1,'_id':'9edd148be310e64b1c94b059','date':'2015-09-02T11:43:11.030Z'},
        {'recall':1,'_id':'56774479d2788b135759e16b','date':'2015-09-02T11:11:35.953Z'},
        {'recall':1,'_id':'9b7ad5b7390fe6dac938c7f8','date':'2015-09-02T13:22:52.082Z'},
        {'recall':1,'_id':'1cb7d9a79b713969b87416d8','date':'2015-09-02T13:23:11.030Z'}
      ],
      'recallProbability':0.9375,
      '_id':'2e6d8aeced0cbea62fede073'
    }
  ];
}

function newId() {
  return (
      Math.random().toString(16)+
      Math.random().toString(16)+
      Math.random().toString(16)+
      Math.random().toString(16)
  ).replace(/0\./g, '').slice(0, 24);
}

function getUser(prefs = {}) {
  return {
    '_id': '55c06722591903e30543848a',
    'provider': 'local',
    'name': 'Jasmine Test User',
    'email': 'test@test.com',
    '__v': 0,
    'role': 'user',
    'prefs': {
      'tarjetasPorRepaso': prefs.tarjetas || 10,
      'nuevasPorRepaso': prefs.nuevas || 5,
      'maxFallosPorRound': prefs.maxFallos || 4
    },
    'review': {},
    'updated': prefs.updated || new Date()
  };
}

// POST /api/memory
function getMemories(method, url, data) {
  const response = [];
  const syncData = JSON.parse(data);
  const items = syncData.changes;
  let dateUnsynced;

  // Si window.vvOffline es true, simulamos estar offline
  if (window.vvOffline) { return [ 503 ]; }

  // Si window.vvNewUnsynced es true, simulamos un dato no sincronizado desde
  // otro dispositivo/navegador
  if (window.vvNewUnsynced) {
    if (!angular.isDate(syncData.fromDate)) {
      dateUnsynced = new Date(syncData.fromDate);
    } else {
      dateUnsynced = syncData.fromDate;
    }
    dateUnsynced.setMinutes(dateUnsynced.getMinutes() + 1);
    dateUnsynced = dateUnsynced.toISOString();
    response.push({
      '_id': newId(),
      'card': '55f2f2a144cdb68ec2438a39', // Id. 'nuevo'
      'recalls': [ { 'recall': 1, '_id': newId(), 'date': dateUnsynced } ],
      'recallProbability': 0.5
    });
  }

  // ¿Forzar un repaso hecho en otro dispositivo?
  if (window.vvUnsyncedServer) {
    response.push({
      '_id': newId(),
      'card': '55f2f2a144cdb68ec2438a29',
      'date': (new Date()).toISOString(),
      'recalls': [
        { 'recall': 0, '_id': newId(), 'date': '2015-09-04T09:27:26.795Z' },
        { 'recall': 1, '_id': newId(), 'date': '2015-09-04T09:28:05.510Z' },
      ],
      'recallProbability': 0.5
    });
  }

  angular.forEach(items, (item) => {
    const updatedItem = angular.copy(item);
    if (updatedItem._id === undefined) {
      updatedItem._id = newId();
    }
    angular.forEach(updatedItem.recalls, (recall) => {
      if (recall._id === undefined) {
        recall._id = newId();
        recall.date = (new Date()).toISOString();
      }
    });
    response.push(updatedItem);
  });
  return [ 200, response, {} ];
}

function getCards() {
  return [
    {'_id':'55f2f29f44cdb68ec24389da','frasePregunta':'cero','fraseRespuesta':'Oso Panda: Comiendo tallos y hojas','freq':100,'pregunta':'0','respuesta':'oso (s, z)'},
    {'_id':'55f2f2a044cdb68ec24389db','frasePregunta':'uno','fraseRespuesta':'Pennywise: riendo con dientes afilados, globos, señalándote','freq':99,'pregunta':'1','respuesta':'It (t, d)'},
    {'_id':'55f2f2a044cdb68ec24389dc','frasePregunta':'dos','fraseRespuesta':'Gandalf (Ian McKellen): cayado, \'No puedes pasar\'','freq':98,'pregunta':'2','respuesta':'Ian (n, ñ)'},
    {'_id':'55f2f2a044cdb68ec24389dd','frasePregunta':'tres','fraseRespuesta':'Uma Thurman en \'Pulp Fiction\': Baila descalza con John Travolta','freq':97,'pregunta':'3','respuesta':'Uma (m)'},
    {'_id':'55f2f2a044cdb68ec24389de','frasePregunta':'cuatro','fraseRespuesta':'Rey de bastos: leño-porra y corona desproporcionados','freq':96,'pregunta':'4','respuesta':'rey (r, rr)'},
    {'_id':'55f2f2a044cdb68ec24389df','frasePregunta':'cinco','fraseRespuesta':'Bruce Lee: Patada de kung-fu y grito','freq':95,'pregunta':'5','respuesta':'Lee (l)'},
    {'_id':'55f2f2a044cdb68ec24389e0','frasePregunta':'seis','fraseRespuesta':'Policía del Grupo Especial de Operaciones: armado, bajando por una cuerda, desde un helicópero','freq':94,'pregunta':'6','respuesta':'GEO (g, j)'},
    {'_id':'55f2f2a044cdb68ec24389e1','frasePregunta':'siete','fraseRespuesta':'Dustin Hoffman en \'Hook\': garfio, risa de malo como en la peli','freq':93,'pregunta':'7','respuesta':'Hook (k, q, c)'},
    {'_id':'55f2f2a044cdb68ec24389e2','frasePregunta':'ocho','fraseRespuesta':'Pau Gasol: botando y colando pelota de baloncesto en algún sitio','freq':92,'pregunta':'8','respuesta':'Pau (p, f)'},
    {'_id':'55f2f2a044cdb68ec24389e3','frasePregunta':'nueve','fraseRespuesta':'Evo Morales: jugando al fútbol y marcando un gol en algún sitio','freq':91,'pregunta':'9','respuesta':'Evo (b, v)'},
    {'_id':'55f2f2a044cdb68ec24389e4','frasePregunta':'diez','fraseRespuesta':'Dios del inframundo: con Cerbero, báculo y neblina','freq':90,'pregunta':'10','respuesta':'Hades'},
    {'_id':'55f2f2a044cdb68ec24389e5','frasePregunta':'once','fraseRespuesta':'bailarina: con tutú, bailando de puntillas, girando y saltando','freq':89,'pregunta':'11','respuesta':'tutú'},
    {'_id':'55f2f2a044cdb68ec24389e6','frasePregunta':'doce','fraseRespuesta':'tuno: guitarra, cantando \'Clavelito\'','freq':88,'pregunta':'12','respuesta':'tuno'},
    {'_id':'55f2f2a044cdb68ec24389e7','frasePregunta':'trece','fraseRespuesta':'Hanks, as Forrest Gump: comiendo bombones','freq':87,'pregunta':'13','respuesta':'tom'},
    {'_id':'55f2f2a044cdb68ec24389e8','frasePregunta':'catorce','fraseRespuesta':'Thor de Marvel: girando el martillo, golpeando el suelo…','freq':86,'pregunta':'14','respuesta':'Thor'},
    {'_id':'55f2f2a044cdb68ec24389e9','frasePregunta':'quince','fraseRespuesta':'Dalai Lama: saludo y reverencia típicos','freq':85,'pregunta':'15','respuesta':'Dalai'},
    {'_id':'55f2f2a044cdb68ec24389ea','frasePregunta':'dieciséis','fraseRespuesta':'Diego Velázquez: pintando un cuadro, como en las meninas','freq':84,'pregunta':'16','respuesta':'Diego'},
    {'_id':'55f2f2a044cdb68ec24389eb','frasePregunta':'diecisiete','fraseRespuesta':'de Palma (Urdangarín): huyendo nervioso, con los bolsillos rebosando billetes','freq':83,'pregunta':'17','respuesta':'duque'},
    {'_id':'55f2f2a044cdb68ec24389ec','frasePregunta':'dieciocho','fraseRespuesta':'Johnny Depp como \'Eduardo Manostijeras\': con tijeras en las manos, podando cosas, cortándo(se) pelos, etc.','freq':82,'pregunta':'18','respuesta':'Depp'},
    {'_id':'55f2f2a044cdb68ec24389ed','frasePregunta':'diecinueve','fraseRespuesta':'Tobey Maguire como \'Spiderman\': en la pared, sujetando / atrapando cosas con telas de araña','freq':81,'pregunta':'19','respuesta':'Tobey'},
    {'_id':'55f2f2a044cdb68ec24389ee','frasePregunta':'veinte','fraseRespuesta':'Hitler: bigote, paso de ganso, mano levantada, cruz gamada en el brazo','freq':80,'pregunta':'20','respuesta':'nazi'},
    {'_id':'55f2f2a044cdb68ec24389ef','frasePregunta':'veintiuno','fraseRespuesta':'Indiana Jones: usando el látigo, banda sonora','freq':79,'pregunta':'21','respuesta':'Indy'},
    {'_id':'55f2f2a044cdb68ec24389f0','frasePregunta':'veintidos','fraseRespuesta':'Thorin en \'El Hobbit\': sobre una montaña de oro, apilando oro, mirada de paranoico','freq':78,'pregunta':'22','respuesta':'enano'},
    {'_id':'55f2f2a044cdb68ec24389f1','frasePregunta':'veintitrés','fraseRespuesta':'Leonard Nimoy como \'Spock\': Saludo vulcaniano','freq':77,'pregunta':'23','respuesta':'Nimoy'},
    {'_id':'55f2f2a044cdb68ec24389f2','frasePregunta':'veinticuatro','fraseRespuesta':'Robert de Niro como \'Taxi Driver\': pistola, \'Ya talkin to me?\'','freq':76,'pregunta':'24','respuesta':'Niro'},
    {'_id':'55f2f2a044cdb68ec24389f3','frasePregunta':'veinticinco','fraseRespuesta':'Papá Noel: gorro y saco de regalos, y risa de Santa','freq':75,'pregunta':'25','respuesta':'Noel'},
    {'_id':'55f2f2a044cdb68ec24389f4','frasePregunta':'veintiséis','fraseRespuesta':'Íñigo Montoya: espada, \'Hola, me llamo…\'','freq':74,'pregunta':'26','respuesta':'Íñigo'},
    {'_id':'55f2f2a044cdb68ec24389f5','frasePregunta':'veintisiete','fraseRespuesta':'Gene Wilder como \'Willy Wonka\': bastón, corbata-lazo, sombrero de copa, bailecito, reverencia','freq':73,'pregunta':'27','respuesta':'Wonka'},
    {'_id':'55f2f2a044cdb68ec24389f6','frasePregunta':'veintiocho','fraseRespuesta':'de Alice in Wonderland: serio, con lanza, peto con el cinco de corazones','freq':72,'pregunta':'28','respuesta':'naipe'},
    {'_id':'55f2f2a044cdb68ec24389f7','frasePregunta':'veintinueve','fraseRespuesta':'John (JdT): Con abrigo de piel lleno de nieve, nieve a su alrededor','freq':71,'pregunta':'29','respuesta':'Nieve'},
    {'_id':'55f2f2a044cdb68ec24389f8','frasePregunta':'treinta','fraseRespuesta':'increíble Hulk: sólo con pantalones, enfadado, lo destroza todo','freq':70,'pregunta':'30','respuesta':'Masa'},
    {'_id':'55f2f2a044cdb68ec24389f9','frasePregunta':'treinta y uno','fraseRespuesta':'Perseo con la cabeza de Medusa: espada, casco alado, cabeza de Medusa con ojos brillantes','freq':69,'pregunta':'31','respuesta':'mito'},
    {'_id':'55f2f2a144cdb68ec24389fa','frasePregunta':'treinta y dos','fraseRespuesta':'mono: colgada de una rama, comiendo un plátano','freq':68,'pregunta':'32','respuesta':'mona'},
    {'_id':'55f2f2a144cdb68ec24389fb','frasePregunta':'treinta y tres','fraseRespuesta':'Marcel Marceau como \'Bip\' el payaso: oliendo una flor imaginaria, apoyado en el aire','freq':67,'pregunta':'33','respuesta':'mimo'},
    {'_id':'55f2f2a144cdb68ec24389fc','frasePregunta':'treinta y cuatro','fraseRespuesta':'guerrero maorí: tatuado, danza, lengua','freq':66,'pregunta':'34','respuesta':'maorí'},
    {'_id':'55f2f2a144cdb68ec24389fd','frasePregunta':'treinta y cinco','fraseRespuesta':'burro: a cuatro patas, orejas largas, rebuznar, comer hierba','freq':65,'pregunta':'35','respuesta':'mulo'},
    {'_id':'55f2f2a144cdb68ec24389fe','frasePregunta':'treinta y seis','fraseRespuesta':'Tamariz: sacando un conejo de la chistera, \'tia-ra-ráaaa\'','freq':64,'pregunta':'36','respuesta':'mago'},
    {'_id':'55f2f2a144cdb68ec24389ff','frasePregunta':'treinta y siete','fraseRespuesta':'Mike Myers como el \'Dr. Maligno\' en \'Austin Powers\': calvo, risita con dedo meñique','freq':63,'pregunta':'37','respuesta':'Mike'},
    {'_id':'55f2f2a144cdb68ec2438a00','frasePregunta':'treinta y ocho','fraseRespuesta':'oompa loompa: peluca verde, bailecito, canción \'oompa, loompa, doompadee doo…\'','freq':62,'pregunta':'38','respuesta':'oompa'},
    {'_id':'55f2f2a144cdb68ec2438a01','frasePregunta':'treinta y nueve','fraseRespuesta':'Uno de los \'Men in Black\': gafas de sol, \'neuralizador\'','freq':61,'pregunta':'39','respuesta':'MIB'},
    {'_id':'55f2f2a144cdb68ec2438a02','frasePregunta':'cuarenta','fraseRespuesta':'Dios de la Guerra: lanza, escudo, fiero, \'guerraaa!!!\'','freq':60,'pregunta':'40','respuesta':'Ares'},
    {'_id':'55f2f2a144cdb68ec2438a03','frasePregunta':'cuarenta y uno','fraseRespuesta':'Rodrigo Rato: campanilla de salida a Bolsa, pulgar levantado','freq':59,'pregunta':'41','respuesta':'Rato'},
    {'_id':'55f2f2a144cdb68ec2438a04','frasePregunta':'cuarenta y dos','fraseRespuesta':'Iron Man: flotando, propulsores en pies y manos, disparando energía','freq':58,'pregunta':'42','respuesta':'Iron'},
    {'_id':'55f2f2a144cdb68ec2438a05','frasePregunta':'cuarenta y tres','fraseRespuesta':'Dios hindú Rama: gota roja, manita, corona, arco y flechas, música india','freq':57,'pregunta':'43','respuesta':'Rama'},
    {'_id':'55f2f2a144cdb68ec2438a06','frasePregunta':'cuarenta y cuatro','fraseRespuesta':'herrero prototípico: yunque y martillo','freq':56,'pregunta':'44','respuesta':'herrero'},
    {'_id':'55f2f2a144cdb68ec2438a07','frasePregunta':'cuarenta y cinco','fraseRespuesta':'La Sirenita: moviendo cola de pez, húmeda, charco de agua','freq':55,'pregunta':'45','respuesta':'Ariel'},
    {'_id':'55f2f2a144cdb68ec2438a08','frasePregunta':'cuarenta y seis','fraseRespuesta':'Oruga de Alice in Wonderland: tumbado, fumando en cachimba, humo','freq':54,'pregunta':'46','respuesta':'oruga'},
    {'_id':'55f2f2a144cdb68ec2438a09','frasePregunta':'cuarenta y siete','fraseRespuesta':'Azog el profanador: atacando con cadena y piedra','freq':53,'pregunta':'47','respuesta':'orco'},
    {'_id':'55f2f2a144cdb68ec2438a0a','frasePregunta':'cuarenta y ocho','fraseRespuesta':'Rafa Nadal: Jugando al tenis, lanzando bolas','freq':52,'pregunta':'48','respuesta':'Rafa'},
    {'_id':'55f2f2a144cdb68ec2438a0b','frasePregunta':'cuarenta y nueve','fraseRespuesta':'árabe musulmán: rezando sobre una alfombra','freq':51,'pregunta':'49','respuesta':'árabe'},
    {'_id':'55f2f2a144cdb68ec2438a0c','frasePregunta':'cincuenta','fraseRespuesta':'Cyphre: ojos encendidos, señalándote, \'tu alma me pertenece\'','freq':50,'pregunta':'50','respuesta':'Louis'},
    {'_id':'55f2f2a144cdb68ec2438a0d','frasePregunta':'cincuenta y uno','fraseRespuesta':'Diosa Leto: flotando con dos bebés y un pecho fuera','freq':49,'pregunta':'51','respuesta':'Leto'},
    {'_id':'55f2f2a144cdb68ec2438a0e','frasePregunta':'cincuenta y dos','fraseRespuesta':'Alien: segunda boca, baba','freq':48,'pregunta':'52','respuesta':'Alien'},
    {'_id':'55f2f2a144cdb68ec2438a0f','frasePregunta':'cincuenta y tres','fraseRespuesta':'lamia: colmillos, ojos rojos, garras por piernas, y cola venenosa','freq':47,'pregunta':'53','respuesta':'lamia'},
    {'_id':'55f2f2a144cdb68ec2438a10','frasePregunta':'cincuenta y cuatro','fraseRespuesta':'hombre disfrazado: alas y pies de loro, baile del loro','freq':46,'pregunta':'54','respuesta':'loro'},
    {'_id':'55f2f2a144cdb68ec2438a11','frasePregunta':'cincuenta y cinco','fraseRespuesta':'teletubbie amarilla: gorro amarillo, cuerno espiral, jugando con pelota naranja, riendo','freq':45,'pregunta':'55','respuesta':'Lala'},
    {'_id':'55f2f2a144cdb68ec2438a12','frasePregunta':'cincuenta y seis','fraseRespuesta':'Muñeco LEGO: caminando mecánicamente, sin usar codos ni rodillas, stop motion','freq':44,'pregunta':'56','respuesta':'LEGO'},
    {'_id':'55f2f2a144cdb68ec2438a13','frasePregunta':'cincuenta y siete','fraseRespuesta':'Luke Skywalker: sable de luz, entrenando con un seeker','freq':43,'pregunta':'57','respuesta':'Luke'},
    {'_id':'55f2f2a144cdb68ec2438a14','frasePregunta':'cincuenta y ocho','fraseRespuesta':'Legolas: orejas puntiagudas, arco y flecha, apuntando','freq':42,'pregunta':'58','respuesta':'elfo'},
    {'_id':'55f2f2a144cdb68ec2438a15','frasePregunta':'cincuenta y nueve','fraseRespuesta':'Hellboy: puro, puño rojo de piedra, pistolón, \'cagarro\'','freq':41,'pregunta':'59','respuesta':'Hellboy'},
    {'_id':'55f2f2a144cdb68ec2438a16','frasePregunta':'sesenta','fraseRespuesta':'Garzón: peluca, puñetas y dando martillazos: \'orden!!\'','freq':40,'pregunta':'60','respuesta':'juez'},
    {'_id':'55f2f2a144cdb68ec2438a17','frasePregunta':'sesenta y uno','fraseRespuesta':'negra, CatWoman: orejas de gato, postura de gato, prrrr… \'miau\'.','freq':39,'pregunta':'61','respuesta':'Gata'},
    {'_id':'55f2f2a144cdb68ec2438a18','frasePregunta':'sesenta y dos','fraseRespuesta':'Djinn: saliendo de una lámpara, gigante, brazos cruzados','freq':38,'pregunta':'62','respuesta':'genio'},
    {'_id':'55f2f2a144cdb68ec2438a19','frasePregunta':'sesenta y tres','fraseRespuesta':'Mr. Fantastic: estirando el cuello, brazos, etc.','freq':37,'pregunta':'63','respuesta':'goma'},
    {'_id':'55f2f2a144cdb68ec2438a1a','frasePregunta':'sesenta y cuatro','fraseRespuesta':'ogro: con garrote, gruñendo y babeando','freq':36,'pregunta':'64','respuesta':'ogro'},
    {'_id':'55f2f2a144cdb68ec2438a1b','frasePregunta':'sesenta y cinco','fraseRespuesta':'Depardieu as Obélix: con menhir, trenzas pelirrojas','freq':35,'pregunta':'65','respuesta':'galo'},
    {'_id':'55f2f2a144cdb68ec2438a1c','frasePregunta':'sesenta y seis','fraseRespuesta':'Bailarina gogó: pole dance','freq':34,'pregunta':'66','respuesta':'gogó'},
    {'_id':'55f2f2a144cdb68ec2438a1d','frasePregunta':'sesenta y siete','fraseRespuesta':'Goku: gritando, entrando en modo supersaija','freq':33,'pregunta':'67','respuesta':'Goku'},
    {'_id':'55f2f2a144cdb68ec2438a1e','frasePregunta':'sesenta y ocho','fraseRespuesta':'Goofy: gorrito, orejas, risa, zapatones','freq':32,'pregunta':'68','respuesta':'Goofy'},
    {'_id':'55f2f2a144cdb68ec2438a1f','frasePregunta':'sesenta y nueve','fraseRespuesta':'Dios cristiano: triángulo tras cabeza, luz, levitando, bajando del cielo','freq':31,'pregunta':'69','respuesta':'Jehová'},
    {'_id':'55f2f2a144cdb68ec2438a20','frasePregunta':'setenta','fraseRespuesta':'Fantastic Four: el suelo tiembla bajo sus pies','freq':30,'pregunta':'70','respuesta':'Cosa'},
    {'_id':'55f2f2a144cdb68ec2438a21','frasePregunta':'setenta y uno','fraseRespuesta':'Aikidoka: practicando sólo o interactuando con otros personajes','freq':29,'pregunta':'71','respuesta':'aikido'},
    {'_id':'55f2f2a144cdb68ec2438a22','frasePregunta':'setenta y dos','fraseRespuesta':'Keanu Reeves, as Neo: efecto bala','freq':28,'pregunta':'72','respuesta':'Keanu'},
    {'_id':'55f2f2a144cdb68ec2438a23','frasePregunta':'setenta y tres','fraseRespuesta':'Kim Jong Un: agitando la manita, saludando a la muchedumbre, peinado de seta','freq':27,'pregunta':'73','respuesta':'Kim'},
    {'_id':'55f2f2a144cdb68ec2438a24','frasePregunta':'setenta y cuatro','fraseRespuesta':'Carrie: bañada en sangre, mirada perdida, telequinesis destructiva','freq':26,'pregunta':'74','respuesta':'Carrie'},
    {'_id':'55f2f2a144cdb68ec2438a25','frasePregunta':'setenta y cinco','fraseRespuesta':'Diosa Kali: baile indio, cuatro brazos, cabeza, espada, sacando la lengua','freq':25,'pregunta':'75','respuesta':'Kali'},
    {'_id':'55f2f2a144cdb68ec2438a26','frasePregunta':'setenta y seis','fraseRespuesta':'Dr. House: caminando a cojetás con un bastón','freq':24,'pregunta':'76','respuesta':'cojo'},
    {'_id':'55f2f2a144cdb68ec2438a27','frasePregunta':'setenta y siete','fraseRespuesta':'Dios caco: vomitando fuego','freq':23,'pregunta':'77','respuesta':'caco'},
    {'_id':'55f2f2a144cdb68ec2438a28','frasePregunta':'setenta y ocho','fraseRespuesta':'Marlon Brando, as Vito Corleone : dientes de cáscara de naranja','freq':22,'pregunta':'78','respuesta':'capo'},
    {'_id':'55f2f2a144cdb68ec2438a29','frasePregunta':'setenta y nueve','fraseRespuesta':'del ejército: boina, arma al hombro','freq':21,'pregunta':'79','respuesta':'cabo'},
    {'_id':'55f2f2a144cdb68ec2438a2a','frasePregunta':'ochenta','fraseRespuesta':'payaso Lou Jacobs: Nariz de payaso, maquillaje, conduciendo mini-coche','freq':20,'pregunta':'80','respuesta':'payaso'},
    {'_id':'55f2f2a144cdb68ec2438a2b','frasePregunta':'ochenta y uno','fraseRespuesta':'pato Donald: gorro de marinero, enfadado, hablando como el pato Donald','freq':19,'pregunta':'81','respuesta':'pato'},
    {'_id':'55f2f2a144cdb68ec2438a2c','frasePregunta':'ochenta y dos','fraseRespuesta':'fauno: pezuñas hendidas, cuernos de cabra, tocando una flauta de pan','freq':18,'pregunta':'82','respuesta':'fauno'},
    {'_id':'55f2f2a144cdb68ec2438a2d','frasePregunta':'ochenta y tres','fraseRespuesta':'Big Lebowsky: Emporrao, fumándose un peta','freq':17,'pregunta':'83','respuesta':'fumao'},
    {'_id':'55f2f2a144cdb68ec2438a2e','frasePregunta':'ochenta y cuatro','fraseRespuesta':'Perro, de JdT: a caballo, cara quemada, con Aria Stark delante','freq':16,'pregunta':'84','respuesta':'perro'},
    {'_id':'55f2f2a144cdb68ec2438a2f','frasePregunta':'ochenta y cinco','fraseRespuesta':'Dios de la música, la verdad, etc.: carro de fuego, cuadriga, lira','freq':15,'pregunta':'85','respuesta':'Apolo'},
    {'_id':'55f2f2a144cdb68ec2438a30','frasePregunta':'ochenta y seis','fraseRespuesta':'Fantastic Four: brazos ardiendo, echando fuego','freq':14,'pregunta':'86','respuesta':'fuego'},
    {'_id':'55f2f2a144cdb68ec2438a31','frasePregunta':'ochenta y siete','fraseRespuesta':'foca: con pelota en la nariz, gritos de foca','freq':13,'pregunta':'87','respuesta':'foca'},
    {'_id':'55f2f2a144cdb68ec2438a32','frasePregunta':'ochenta y ocho','fraseRespuesta':'Ratzinger: con gorrito blanco, bendiciendo en latín, señal de la cruz mano-kárate','freq':12,'pregunta':'88','respuesta':'Papa'},
    {'_id':'55f2f2a144cdb68ec2438a33','frasePregunta':'ochenta y nueve','fraseRespuesta':'pavo real: abriendo cola, \'glugluglú\'','freq':11,'pregunta':'89','respuesta':'pavo'},
    {'_id':'55f2f2a144cdb68ec2438a34','frasePregunta':'noventa','fraseRespuesta':'buzo: con gafas, aletas, buceando en el aire, echando burbujas','freq':10,'pregunta':'90','respuesta':'buzo'},
    {'_id':'55f2f2a144cdb68ec2438a35','frasePregunta':'noventa y uno','fraseRespuesta':'buda: meditando, levitando en la posición del loto, \'ohmmmmm\'','freq':9,'pregunta':'91','respuesta':'buda'},
    {'_id':'55f2f2a144cdb68ec2438a36','frasePregunta':'noventa y dos','fraseRespuesta':'Bin Laden: kalasnikov, tiros al aire','freq':8,'pregunta':'92','respuesta':'Bin'},
    {'_id':'55f2f2a144cdb68ec2438a37','frasePregunta':'noventa y tres','fraseRespuesta':'Obama: Dando un discurso antes muchos micrófonos, gesticulando','freq':7,'pregunta':'93','respuesta':'Obama'},
    {'_id':'55f2f2a144cdb68ec2438a38','frasePregunta':'noventa y cuatro','fraseRespuesta':'ebrio: dando tumbos, eructando, con jarra de cerveza','freq':6,'pregunta':'94','respuesta':'ebrio'},
    {'_id':'55f2f2a144cdb68ec2438a39','frasePregunta':'noventa y cinco','fraseRespuesta':'rey mono (vanara): cola, cetro, corona-casco-puntiagudo','freq':5,'pregunta':'95','respuesta':'Bali'},
    {'_id':'55f2f2a144cdb68ec2438a3a','frasePregunta':'noventa y seis','fraseRespuesta':'anciano: andando encorvado, con andador','freq':4,'pregunta':'96','respuesta':'viejo'},
    {'_id':'55f2f2a144cdb68ec2438a3b','frasePregunta':'noventa y siete','fraseRespuesta':'Dionisos, dios del vino: con hojas de parra en el pelo, copa de vino y uvas','freq':3,'pregunta':'97','respuesta':'Baco'},
    {'_id':'55f2f2a144cdb68ec2438a3c','frasePregunta':'noventa y ocho','fraseRespuesta':'poli malo: gorro con chapa, porra en mano, amenazando','freq':2,'pregunta':'98','respuesta':'bofia'},
    {'_id':'55f2f2a144cdb68ec2438a3d','frasePregunta':'noventa y nueve','fraseRespuesta':'Esponja: riendo, bandeja con Krabby Patty','freq':1,'pregunta':'99','respuesta':'Bob'}
  ];
}

// jshint ignore:start

function windowBeforeTestSuite() {
  const date = new Date();
  window.localStorage.setItem('usr', JSON.stringify(getUser({ updated: date })));
  window.vivaverboConfig = { user: getUser({ updated: date }), debug: true };
  window.dtDate = date.getTime();
}

function windowAfterTestSuite() {
  localStorage.clear();
  delete window.vivaverboConfig;
  delete window.dtDate;
}

// GET /api/memory
// Usada en db.service.spec.js
function getMemory() {
  return [
    {
      'card': '55f2f29f44cdb68ec24389da',
      'recalls': [
        { 'recall': 0, '_id': 'e2080a719229312b41cd6087', 'date': '2015-09-04T09:27:26.795Z' },
        { 'recall': 1, '_id': 'f4892742a380a6c48446bc89', 'date': '2015-09-04T09:28:05.510Z' },
        { 'recall': 1, '_id': '2a45a2c1345e6147400531ee', 'date': '2015-09-04T09:28:11.319Z' }
      ],
      'recallProbability': 0.75,
      '_id': 'b5d9a0797dcb3e5fc1415f7d'
    },
    {
      'card': '55f2f2a044cdb68ec24389db',
      'recalls': [
        { 'recall': 1, '_id': '84873f1b1dbca228533e2601', 'date': '2015-09-04T09:27:29.924Z' }
      ],
      'recallProbability': 0.5,
      '_id': 'cfd9ac97af0f3f4b8ba0871f'
    },
    {
      'card': '55f2f2a044cdb68ec24389dc',
      'recalls': [
        { 'recall': 0.5, '_id': '400861dad5caedf52a69a0af', 'date': '2015-09-04T09:27:33.713Z' },
        { 'recall': 1, '_id': '06d6c7d57eb333f264cbdefc', 'date': '2015-09-04T09:28:07.138Z' },
        { 'recall': 1, '_id': '66a0a8d81a6112aaf7eaa6f9', 'date': '2015-09-04T09:28:12.847Z' }
      ],
      'recallProbability': 0.8125,
      '_id': '224b5656af069379c8f483f7'
    },
    {
      'card': '55f2f2a044cdb68ec24389dd',
      'recalls': [
        { 'recall': 1, '_id': '889d0c1ea356d91fd889848c', 'date': '2015-09-04T09:27:37.914Z' }
      ],
      'recallProbability': 0.5,
      '_id': '3b367bc77183dad1a894958b'
    },
    {
      'card': '55f2f2a044cdb68ec24389de',
      'recalls': [
        { 'recall': 1, '_id': '7af367ea8985411996f9fddf', 'date': '2015-09-04T09:27:39.851Z' }
      ],
      'recallProbability': 0.5,
      '_id': '352b3884ca06b8d681344fa7'
    },
    {
      'card': '55f2f2a044cdb68ec24389df',
      'recalls': [
        { 'recall': 1, '_id': 'c0691a1a7ea4c89c776716b5', 'date': '2015-09-04T09:27:41.831Z' }
      ],
      'recallProbability': 0.5,
      '_id': 'c9111b853cef58aec0034ee4'
    },
    {
      'card': '55f2f2a044cdb68ec24389e0',
      'recalls': [
        { 'recall': 0, '_id': '542039340f4ae652e4f1b7e6', 'date': '2015-09-04T09:27:49.249Z' },
        { 'recall': 1, '_id': 'bac0751a01a6d64b4cb556d1', 'date': '2015-09-04T09:28:08.540Z' },
        { 'recall': 1, '_id': '884aa918f1b52fd47f443d57', 'date': '2015-09-04T09:28:14.041Z' }
      ],
      'recallProbability': 0.75,
      '_id': '850e1b78167df586fc512374'
    },
    {
      'card': '55f2f2a044cdb68ec24389e1',
      'recalls': [
        { 'recall': 0.5, '_id': 'bf06d26dd5131005f4b7d8c1', 'date': '2015-09-04T09:27:53.397Z' },
        { 'recall': 1, '_id': 'e206e48ce28dda4624c467a2', 'date': '2015-09-04T09:28:10.097Z' },
        { 'recall': 1, '_id': '59a5f354c8c92a985507819b', 'date': '2015-09-04T09:28:15.358Z' }
      ],
      'recallProbability': 0.8125,
      '_id': '0aceb14d174c615fcda1c3fb'
    },
    {
      'card': '55f2f2a044cdb68ec24389e2',
      'recalls': [
        { 'recall': 1, '_id': 'cd4f6ae2f4cf62ca036d6125', 'date': '2015-09-04T09:28:00.118Z' }
      ],
      'recallProbability': 0.5,
      '_id': '442f1b093c07ad1ac7c4aeea'
    },
    {
      'card': '55f2f2a044cdb68ec24389e3',
      'recalls': [
        { 'recall': 1, '_id': '91fde8d3f4c79de7bfab3715', 'date': '2015-09-04T09:28:02.050Z' }
      ],
      'recallProbability': 0.5,
      '_id': '9c321afdd1999e9f10b68e72'
    }
  ];
};
// jshint ignore:end
