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

  $httpBackend.whenGET('/api/users/me').respond(getUser());
  $httpBackend.whenGET('/api/cards').respond(getCards());
  $httpBackend.whenGET(/\/api\/memory/).respond(getServerMemories());

  $httpBackend.whenPOST('/api/memory').respond(getMemories);
});

// GET /api/memory
function getServerMemories() {
  return [] || [
    {
      'card':'9630bb01ba938e03867b58b8',
      'recalls':[
        {'recall':0, '_id':'f903d1c6038f6a93e5f4dca8','date':'2015-09-02T13:12:52.082Z'},
        {'recall':1,'_id':'077f8b6217f0b3f9eb302fc1','date':'2015-09-02T13:13:11.030Z'}
      ],
      'recallProbability':0.5,
      '_id':'2dd9a4f33ffbd6492c7750fd'
    },
    {
      'card':'5caaae7b535ce80a13062e86',
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
    'review': {}
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
      'card': '14eef67f47f9eabc08c09228', // Id. 'nuevo'
      'recalls': [ { 'recall': 1, '_id': newId(), 'date': dateUnsynced } ],
      'recallProbability': 0.5
    });
  }

  // ¿Forzar un repaso hecho en otro dispositivo?
  if (window.vvUnsyncedServer) {
    response.push({
      '_id': newId(),
      'card': '2779848a34c8469468cc7d78',
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
    {'pregunta':'0','frasePregunta':'cero','respuesta':'oso (s, z)','fraseRespuesta':'Oso Panda: Comiendo tallos y hojas','freq':100,'_id':'289b728b0f394be52baa318a'},
    {'pregunta':'1','frasePregunta':'uno','respuesta':'It (t, d)','fraseRespuesta':'Pennywise: riendo con dientes afilados, globos, señalándote','freq':99,'_id':'57cb636c4db9975313a5f92a'},
    {'pregunta':'2','frasePregunta':'dos','respuesta':'Ian (n, ñ)','fraseRespuesta':'Gandalf (Ian McKellen): cayado, \'No puedes pasar\'','freq':98,'_id':'4c573a64c4947d3049879abf'},
    {'pregunta':'3','frasePregunta':'tres','respuesta':'Uma (m)','fraseRespuesta':'Uma Thurman en \'Pulp Fiction\': Baila descalza con John Travolta','freq':97,'_id':'dca90f0a3b45e25e925bc109'},
    {'pregunta':'4','frasePregunta':'cuatro','respuesta':'rey (r, rr)','fraseRespuesta':'Rey de bastos: leño-porra y corona desproporcionados','freq':96,'_id':'4af3d116e1208c4a905ea04c'},
    {'pregunta':'5','frasePregunta':'cinco','respuesta':'Lee (l)','fraseRespuesta':'Bruce Lee: Patada de kung-fu y grito','freq':95,'_id':'696168d3128c22ec5d264dee'},
    {'pregunta':'6','frasePregunta':'seis','respuesta':'GEO (g, j)','fraseRespuesta':'Policía del Grupo Especial de Operaciones: armado, bajando por una cuerda, desde un helicópero','freq':94,'_id':'0ee4d72edca0a60b90d8c3e5'},
    {'pregunta':'7','frasePregunta':'siete','respuesta':'Hook (k, q, c)','fraseRespuesta':'Dustin Hoffman en \'Hook\': garfio, risa de malo como en la peli','freq':93,'_id':'c9b59274f9a5bdc87aabfd7d'},
    {'pregunta':'8','frasePregunta':'ocho','respuesta':'Pau (p, f)','fraseRespuesta':'Pau Gasol: botando y colando pelota de baloncesto en algún sitio','freq':92,'_id':'414ef737a04dcc95010d4491'},
    {'pregunta':'9','frasePregunta':'nueve','respuesta':'Evo (b, v)','fraseRespuesta':'Evo Morales: jugando al fútbol y marcando un gol en algún sitio','freq':91,'_id':'c1ea04f75b1d0cfc49cf1629'},
    {'pregunta':'10','frasePregunta':'diez','respuesta':'Hades','fraseRespuesta':'Dios del inframundo: con Cerbero, báculo y neblina','freq':90,'_id':'73983944587ad6eb803976bc'},
    {'pregunta':'11','frasePregunta':'once','respuesta':'tutú','fraseRespuesta':'bailarina: con tutú, bailando de puntillas, girando y saltando','freq':89,'_id':'d0cc2e4b65b0e7d768b5b5c2'},
    {'pregunta':'12','frasePregunta':'doce','respuesta':'tuno','fraseRespuesta':'tuno: guitarra, cantando \'Clavelito\'','freq':88,'_id':'2b0352b1572a9f36fbe1dbcb'},
    {'pregunta':'13','frasePregunta':'trece','respuesta':'tom','fraseRespuesta':'Hanks, as Forrest Gump: comiendo bombones','freq':87,'_id':'4d7bd35e2875f4e7597e71bd'},
    {'pregunta':'14','frasePregunta':'catorce','respuesta':'Thor','fraseRespuesta':'Thor de Marvel: girando el martillo, golpeando el suelo…','freq':86,'_id':'7ba38c1bee91f1a74a515c87'},
    {'pregunta':'15','frasePregunta':'quince','respuesta':'Dalai','fraseRespuesta':'Dalai Lama: saludo y reverencia típicos','freq':85,'_id':'d8925f6212837bf101df9ba7'},
    {'pregunta':'16','frasePregunta':'dieciséis','respuesta':'Diego','fraseRespuesta':'Diego Velázquez: pintando un cuadro, como en las meninas','freq':84,'_id':'090fe7df36d29207fcba57ab'},
    {'pregunta':'17','frasePregunta':'diecisiete','respuesta':'duque','fraseRespuesta':'de Palma (Urdangarín): huyendo nervioso, con los bolsillos rebosando billetes','freq':83,'_id':'8f87e62fba0c1cb160a4d672'},
    {'pregunta':'18','frasePregunta':'dieciocho','respuesta':'Depp','fraseRespuesta':'Johnny Depp como \'Eduardo Manostijeras\': con tijeras en las manos, podando cosas, cortándo(se) pelos, etc.','freq':82,'_id':'5a582fd109e241923f7ff090'},
    {'pregunta':'19','frasePregunta':'diecinueve','respuesta':'Tobey','fraseRespuesta':'Tobey Maguire como \'Spiderman\': en la pared, sujetando / atrapando cosas con telas de araña','freq':81,'_id':'03917d692e8af537bc47ca4d'},
    {'pregunta':'20','frasePregunta':'veinte','respuesta':'nazi','fraseRespuesta':'Hitler: bigote, paso de ganso, mano levantada, cruz gamada en el brazo','freq':80,'_id':'e5bedc46c54f303fa126b619'},
    {'pregunta':'21','frasePregunta':'veintiuno','respuesta':'Indy','fraseRespuesta':'Indiana Jones: usando el látigo, banda sonora','freq':79,'_id':'e75deaf138dd83d343d858c2'},
    {'pregunta':'22','frasePregunta':'veintidos','respuesta':'enano','fraseRespuesta':'Thorin en \'El Hobbit\': sobre una montaña de oro, apilando oro, mirada de paranoico','freq':78,'_id':'7f4165957e457a5742a856fc'},
    {'pregunta':'23','frasePregunta':'veintitrés','respuesta':'Nimoy','fraseRespuesta':'Leonard Nimoy como \'Spock\': Saludo vulcaniano','freq':77,'_id':'7a2cca08b93bc1e6daf6594d'},
    {'pregunta':'24','frasePregunta':'veinticuatro','respuesta':'Niro','fraseRespuesta':'Robert de Niro como \'Taxi Driver\': pistola, \'Ya talkin to me?\'','freq':76,'_id':'e2db1c4682cc2db73a11c002'},
    {'pregunta':'25','frasePregunta':'veinticinco','respuesta':'Noel','fraseRespuesta':'Papá Noel: gorro y saco de regalos, y risa de Santa','freq':75,'_id':'a1c565e294b9771a9ff0f09e'},
    {'pregunta':'26','frasePregunta':'veintiséis','respuesta':'Íñigo','fraseRespuesta':'Íñigo Montoya: espada, \'Hola, me llamo…\'','freq':74,'_id':'900cd74e6ec475fc57d99dd3'},
    {'pregunta':'27','frasePregunta':'veintisiete','respuesta':'Wonka','fraseRespuesta':'Gene Wilder como \'Willy Wonka\': bastón, corbata-lazo, sombrero de copa, bailecito, reverencia','freq':73,'_id':'5acdf0132050b66fdb5bcaf4'},
    {'pregunta':'28','frasePregunta':'veintiocho','respuesta':'naipe','fraseRespuesta':'de Alice in Wonderland: serio, con lanza, peto con el cinco de corazones','freq':72,'_id':'510fae41fa8c89d50674baa9'},
    {'pregunta':'29','frasePregunta':'veintinueve','respuesta':'Nieve','fraseRespuesta':'John (JdT): Con abrigo de piel lleno de nieve, nieve a su alrededor','freq':71,'_id':'d6da354423419e9f270a9d43'},
    {'pregunta':'30','frasePregunta':'treinta','respuesta':'Masa','fraseRespuesta':'increíble Hulk: sólo con pantalones, enfadado, lo destroza todo','freq':70,'_id':'ec4fbe334a7500bd3d4908d5'},
    {'pregunta':'31','frasePregunta':'treinta y uno','respuesta':'mito','fraseRespuesta':'Perseo con la cabeza de Medusa: espada, casco alado, cabeza de Medusa con ojos brillantes','freq':69,'_id':'dc88e6ab0cce251c11307a9b'},
    {'pregunta':'32','frasePregunta':'treinta y dos','respuesta':'mona','fraseRespuesta':'mono: colgada de una rama, comiendo un plátano','freq':68,'_id':'0d0ed87b94ec4ad688ff8be4'},
    {'pregunta':'33','frasePregunta':'treinta y tres','respuesta':'mimo','fraseRespuesta':'Marcel Marceau como \'Bip\' el payaso: oliendo una flor imaginaria, apoyado en el aire','freq':67,'_id':'9cfca59c91401f5814b0b884'},
    {'pregunta':'34','frasePregunta':'treinta y cuatro','respuesta':'maorí','fraseRespuesta':'guerrero maorí: tatuado, danza, lengua','freq':66,'_id':'c425753771e393de3780c82d'},
    {'pregunta':'35','frasePregunta':'treinta y cinco','respuesta':'mulo','fraseRespuesta':'burro: a cuatro patas, orejas largas, rebuznar, comer hierba','freq':65,'_id':'01ca30f9451e913ce7626d3c'},
    {'pregunta':'36','frasePregunta':'treinta y seis','respuesta':'mago','fraseRespuesta':'Tamariz: sacando un conejo de la chistera, \'tia-ra-ráaaa\'','freq':64,'_id':'00fafccfdc179effdc263533'},
    {'pregunta':'37','frasePregunta':'treinta y siete','respuesta':'Mike','fraseRespuesta':'Mike Myers como el \'Dr. Maligno\' en \'Austin Powers\': calvo, risita con dedo meñique','freq':63,'_id':'ecd1f0fef773340f06905219'},
    {'pregunta':'38','frasePregunta':'treinta y ocho','respuesta':'oompa','fraseRespuesta':'oompa loompa: peluca verde, bailecito, canción \'oompa, loompa, doompadee doo…\'','freq':62,'_id':'68a6e0867bc7f1b8b64c231f'},
    {'pregunta':'39','frasePregunta':'treinta y nueve','respuesta':'MIB','fraseRespuesta':'Uno de los \'Men in Black\': gafas de sol, \'neuralizador\'','freq':61,'_id':'a1ed9b327316fdb3a40015f6'},
    {'pregunta':'40','frasePregunta':'cuarenta','respuesta':'Ares','fraseRespuesta':'Dios de la Guerra: lanza, escudo, fiero, \'guerraaa!!!\'','freq':60,'_id':'8dbc969e78812ec2346ca289'},
    {'pregunta':'41','frasePregunta':'cuarenta y uno','respuesta':'Rato','fraseRespuesta':'Rodrigo Rato: campanilla de salida a Bolsa, pulgar levantado','freq':59,'_id':'97de1b2802791b514fc6d38b'},
    {'pregunta':'42','frasePregunta':'cuarenta y dos','respuesta':'Iron','fraseRespuesta':'Iron Man: flotando, propulsores en pies y manos, disparando energía','freq':58,'_id':'6f4e0e38452956e60c3d0c5b'},
    {'pregunta':'43','frasePregunta':'cuarenta y tres','respuesta':'Rama','fraseRespuesta':'Dios hindú Rama: gota roja, manita, corona, arco y flechas, música india','freq':57,'_id':'15946d1be7cfc1c737a015d8'},
    {'pregunta':'44','frasePregunta':'cuarenta y cuatro','respuesta':'herrero','fraseRespuesta':'herrero prototípico: yunque y martillo','freq':56,'_id':'80ac74638d577071a8c8f5cd'},
    {'pregunta':'45','frasePregunta':'cuarenta y cinco','respuesta':'Ariel','fraseRespuesta':'La Sirenita: moviendo cola de pez, húmeda, charco de agua','freq':55,'_id':'7cabcb176d039f64cb961294'},
    {'pregunta':'46','frasePregunta':'cuarenta y seis','respuesta':'oruga','fraseRespuesta':'Oruga de Alice in Wonderland: tumbado, fumando en cachimba, humo','freq':54,'_id':'56902349bceaa8e1405ce830'},
    {'pregunta':'47','frasePregunta':'cuarenta y siete','respuesta':'orco','fraseRespuesta':'Azog el profanador: atacando con cadena y piedra','freq':53,'_id':'d923c0a5e0002b157bbce849'},
    {'pregunta':'48','frasePregunta':'cuarenta y ocho','respuesta':'Rafa','fraseRespuesta':'Rafa Nadal: Jugando al tenis, lanzando bolas','freq':52,'_id':'1eba9a764942f8968ed0aca7'},
    {'pregunta':'49','frasePregunta':'cuarenta y nueve','respuesta':'árabe','fraseRespuesta':'árabe musulmán: rezando sobre una alfombra','freq':51,'_id':'194ce946bd1638fd4a69335c'},
    {'pregunta':'50','frasePregunta':'cincuenta','respuesta':'Louis','fraseRespuesta':'Cyphre: ojos encendidos, señalándote, \'tu alma me pertenece\'','freq':50,'_id':'3f8209aa14591e9c25b75374'},
    {'pregunta':'51','frasePregunta':'cincuenta y uno','respuesta':'Leto','fraseRespuesta':'Diosa Leto: flotando con dos bebés y un pecho fuera','freq':49,'_id':'7dbade65f4b13148aca433fc'},
    {'pregunta':'52','frasePregunta':'cincuenta y dos','respuesta':'Alien','fraseRespuesta':'Alien: segunda boca, baba','freq':48,'_id':'d9dd1c241f42e4ceb64cc85d'},
    {'pregunta':'53','frasePregunta':'cincuenta y tres','respuesta':'lamia','fraseRespuesta':'lamia: colmillos, ojos rojos, garras por piernas, y cola venenosa','freq':47,'_id':'fa157e2c3d45100376738868'},
    {'pregunta':'54','frasePregunta':'cincuenta y cuatro','respuesta':'loro','fraseRespuesta':'hombre disfrazado: alas y pies de loro, baile del loro','freq':46,'_id':'cc3c08224677bbb80952830e'},
    {'pregunta':'55','frasePregunta':'cincuenta y cinco','respuesta':'Lala','fraseRespuesta':'teletubbie amarilla: gorro amarillo, cuerno espiral, jugando con pelota naranja, riendo','freq':45,'_id':'c0e2c66d07e635f3f34a1de9'},
    {'pregunta':'56','frasePregunta':'cincuenta y seis','respuesta':'LEGO','fraseRespuesta':'Muñeco LEGO: caminando mecánicamente, sin usar codos ni rodillas, stop motion','freq':44,'_id':'54bb02cbb4a39b4647591149'},
    {'pregunta':'57','frasePregunta':'cincuenta y siete','respuesta':'Luke','fraseRespuesta':'Luke Skywalker: sable de luz, entrenando con un seeker','freq':43,'_id':'4cc16f88ce1e8628da01c552'},
    {'pregunta':'58','frasePregunta':'cincuenta y ocho','respuesta':'elfo','fraseRespuesta':'Legolas: orejas puntiagudas, arco y flecha, apuntando','freq':42,'_id':'1096e9b630526e9733cccfc5'},
    {'pregunta':'59','frasePregunta':'cincuenta y nueve','respuesta':'Hellboy','fraseRespuesta':'Hellboy: puro, puño rojo de piedra, pistolón, \'cagarro\'','freq':41,'_id':'5caaae7b535ce80a13062e86'},
    {'pregunta':'60','frasePregunta':'sesenta','respuesta':'juez','fraseRespuesta':'Garzón: peluca, puñetas y dando martillazos: \'orden!!\'','freq':40,'_id':'5185f311a4d7cdc9b4cf008e'},
    {'pregunta':'61','frasePregunta':'sesenta y uno','respuesta':'Gata','fraseRespuesta':'negra, CatWoman: orejas de gato, postura de gato, prrrr… \'miau\'.','freq':39,'_id':'63f8a0c4e5a880adb9b071a5'},
    {'pregunta':'62','frasePregunta':'sesenta y dos','respuesta':'genio','fraseRespuesta':'Djinn: saliendo de una lámpara, gigante, brazos cruzados','freq':38,'_id':'0f9a4896db668bc62e1edd28'},
    {'pregunta':'63','frasePregunta':'sesenta y tres','respuesta':'goma','fraseRespuesta':'Mr. Fantastic: estirando el cuello, brazos, etc.','freq':37,'_id':'9630bb01ba938e03867b58b8'},
    {'pregunta':'64','frasePregunta':'sesenta y cuatro','respuesta':'ogro','fraseRespuesta':'ogro: con garrote, gruñendo y babeando','freq':36,'_id':'b0c399c714e2cd834253b53a'},
    {'pregunta':'65','frasePregunta':'sesenta y cinco','respuesta':'galo','fraseRespuesta':'Depardieu as Obélix: con menhir, trenzas pelirrojas','freq':35,'_id':'e81483265e013bb3ea477666'},
    {'pregunta':'66','frasePregunta':'sesenta y seis','respuesta':'gogó','fraseRespuesta':'Bailarina gogó: pole dance','freq':34,'_id':'e0d82185b991996ea029e106'},
    {'pregunta':'67','frasePregunta':'sesenta y siete','respuesta':'Goku','fraseRespuesta':'Goku: gritando, entrando en modo supersaija','freq':33,'_id':'238a71c21170c9b427e73aff'},
    {'pregunta':'68','frasePregunta':'sesenta y ocho','respuesta':'Goofy','fraseRespuesta':'Goofy: gorrito, orejas, risa, zapatones','freq':32,'_id':'fcfeec3f404361543464b0b8'},
    {'pregunta':'69','frasePregunta':'sesenta y nueve','respuesta':'Jehová','fraseRespuesta':'Dios cristiano: triángulo tras cabeza, luz, levitando, bajando del cielo','freq':31,'_id':'21bd7ca76e512ce99616c1e2'},
    {'pregunta':'70','frasePregunta':'setenta','respuesta':'Cosa','fraseRespuesta':'Fantastic Four: el suelo tiembla bajo sus pies','freq':30,'_id':'e160b73d4336e3c7e335c3fc'},
    {'pregunta':'71','frasePregunta':'setenta y uno','respuesta':'aikido','fraseRespuesta':'Aikidoka: practicando sólo o interactuando con otros personajes','freq':29,'_id':'bb4c498f5035f784284deea2'},
    {'pregunta':'72','frasePregunta':'setenta y dos','respuesta':'Keanu','fraseRespuesta':'Keanu Reeves, as Neo: efecto bala','freq':28,'_id':'0bd88996470b1d898bfc7ace'},
    {'pregunta':'73','frasePregunta':'setenta y tres','respuesta':'Kim','fraseRespuesta':'Kim Jong Un: agitando la manita, saludando a la muchedumbre, peinado de seta','freq':27,'_id':'612dac4518a4a4f38934b8d8'},
    {'pregunta':'74','frasePregunta':'setenta y cuatro','respuesta':'Carrie','fraseRespuesta':'Carrie: bañada en sangre, mirada perdida, telequinesis destructiva','freq':26,'_id':'9711e0899d5e8a247bf3676d'},
    {'pregunta':'75','frasePregunta':'setenta y cinco','respuesta':'Kali','fraseRespuesta':'Diosa Kali: baile indio, cuatro brazos, cabeza, espada, sacando la lengua','freq':25,'_id':'bfdf4dcaa95d8d4968bf2ed2'},
    {'pregunta':'76','frasePregunta':'setenta y seis','respuesta':'cojo','fraseRespuesta':'Dr. House: caminando a cojetás con un bastón','freq':24,'_id':'6ddd1cc6c04e89a113bd1344'},
    {'pregunta':'77','frasePregunta':'setenta y siete','respuesta':'caco','fraseRespuesta':'Dios caco: vomitando fuego','freq':23,'_id':'aa52c63db520e0cc29b9e933'},
    {'pregunta':'78','frasePregunta':'setenta y ocho','respuesta':'capo','fraseRespuesta':'Marlon Brando, as Vito Corleone : dientes de cáscara de naranja','freq':22,'_id':'f4ce723f92636c093be3a023'},
    {'pregunta':'79','frasePregunta':'setenta y nueve','respuesta':'cabo','fraseRespuesta':'del ejército: boina, arma al hombro','freq':21,'_id':'8fd9cc8168dec883eaf76117'},
    {'pregunta':'80','frasePregunta':'ochenta','respuesta':'payaso','fraseRespuesta':'payaso Lou Jacobs: Nariz de payaso, maquillaje, conduciendo mini-coche','freq':20,'_id':'567e8ac8c954891b91e3ba5c'},
    {'pregunta':'81','frasePregunta':'ochenta y uno','respuesta':'pato','fraseRespuesta':'pato Donald: gorro de marinero, enfadado, hablando como el pato Donald','freq':19,'_id':'ebf865eb790b43f145a5a757'},
    {'pregunta':'82','frasePregunta':'ochenta y dos','respuesta':'fauno','fraseRespuesta':'fauno: pezuñas hendidas, cuernos de cabra, tocando una flauta de pan','freq':18,'_id':'031360379053ceecb682d512'},
    {'pregunta':'83','frasePregunta':'ochenta y tres','respuesta':'fumao','fraseRespuesta':'Big Lebowsky: Emporrao, fumándose un peta','freq':17,'_id':'2216d444b223dc69266aeece'},
    {'pregunta':'84','frasePregunta':'ochenta y cuatro','respuesta':'perro','fraseRespuesta':'Perro, de JdT: a caballo, cara quemada, con Aria Stark delante','freq':16,'_id':'df958b41000bda2443dc5ad0'},
    {'pregunta':'85','frasePregunta':'ochenta y cinco','respuesta':'Apolo','fraseRespuesta':'Dios de la música, la verdad, etc.: carro de fuego, cuadriga, lira','freq':15,'_id':'c144e682a347291dc7adaeed'},
    {'pregunta':'86','frasePregunta':'ochenta y seis','respuesta':'fuego','fraseRespuesta':'Fantastic Four: brazos ardiendo, echando fuego','freq':14,'_id':'9add82830c904d64f07b47a3'},
    {'pregunta':'87','frasePregunta':'ochenta y siete','respuesta':'foca','fraseRespuesta':'foca: con pelota en la nariz, gritos de foca','freq':13,'_id':'23ac1324a0c53c77fc76c79b'},
    {'pregunta':'88','frasePregunta':'ochenta y ocho','respuesta':'Papa','fraseRespuesta':'Ratzinger: con gorrito blanco, bendiciendo en latín, señal de la cruz mano-kárate','freq':12,'_id':'4bb847f719b28fc5cb51f065'},
    {'pregunta':'89','frasePregunta':'ochenta y nueve','respuesta':'pavo','fraseRespuesta':'pavo real: abriendo cola, \'glugluglú\'','freq':11,'_id':'6fc16891f0dcdcb1c5464f95'},
    {'pregunta':'90','frasePregunta':'noventa','respuesta':'buzo','fraseRespuesta':'buzo: con gafas, aletas, buceando en el aire, echando burbujas','freq':10,'_id':'31a80c7751d69489bb9d0339'},
    {'pregunta':'91','frasePregunta':'noventa y uno','respuesta':'buda','fraseRespuesta':'buda: meditando, levitando en la posición del loto, \'ohmmmmm\'','freq':9,'_id':'e29be974ed2967565bf545f7'},
    {'pregunta':'92','frasePregunta':'noventa y dos','respuesta':'Bin','fraseRespuesta':'Bin Laden: kalasnikov, tiros al aire','freq':8,'_id':'0c7242a1ba80607a266c57a3'},
    {'pregunta':'93','frasePregunta':'noventa y tres','respuesta':'Obama','fraseRespuesta':'Obama: Dando un discurso antes muchos micrófonos, gesticulando','freq':7,'_id':'9934f55a1d5257f2f629bd73'},
    {'pregunta':'94','frasePregunta':'noventa y cuatro','respuesta':'ebrio','fraseRespuesta':'ebrio: dando tumbos, eructando, con jarra de cerveza','freq':6,'_id':'0e5f36c334132d32961ec866'},
    {'pregunta':'95','frasePregunta':'noventa y cinco','respuesta':'Bali','fraseRespuesta':'rey mono (vanara): cola, cetro, corona-casco-puntiagudo','freq':5,'_id':'14eef67f47f9eabc08c09228'},
    {'pregunta':'96','frasePregunta':'noventa y seis','respuesta':'viejo','fraseRespuesta':'anciano: andando encorvado, con andador','freq':4,'_id':'257eae94a7e265eff96ca182'},
    {'pregunta':'97','frasePregunta':'noventa y siete','respuesta':'Baco','fraseRespuesta':'Dionisos, dios del vino: con hojas de parra en el pelo, copa de vino y uvas','freq':3,'_id':'eb80c03d6f567ea99bbe6fc2'},
    {'pregunta':'98','frasePregunta':'noventa y ocho','respuesta':'bofia','fraseRespuesta':'poli malo: gorro con chapa, porra en mano, amenazando','freq':2,'_id':'4a7e7f18bc18c3d476ced9a5'},
    {'pregunta':'99','frasePregunta':'noventa y nueve','respuesta':'Bob','fraseRespuesta':'Esponja: riendo, bandeja con Krabby Patty','freq':1,'_id':'2779848a34c8469468cc7d78'}
  ];
}

// jshint ignore:start
// GET /api/memory
// Usada en db.service.spec.js
function getMemory() {
  return [
    {
      'card': '289b728b0f394be52baa318a',
      'recalls': [
        { 'recall': 0, '_id': 'e2080a719229312b41cd6087', 'date': '2015-09-04T09:27:26.795Z' },
        { 'recall': 1, '_id': 'f4892742a380a6c48446bc89', 'date': '2015-09-04T09:28:05.510Z' },
        { 'recall': 1, '_id': '2a45a2c1345e6147400531ee', 'date': '2015-09-04T09:28:11.319Z' }
      ],
      'recallProbability': 0.75,
      '_id': 'b5d9a0797dcb3e5fc1415f7d'
    },
    {
      'card': '57cb636c4db9975313a5f92a',
      'recalls': [
        { 'recall': 1, '_id': '84873f1b1dbca228533e2601', 'date': '2015-09-04T09:27:29.924Z' }
      ],
      'recallProbability': 0.5,
      '_id': 'cfd9ac97af0f3f4b8ba0871f'
    },
    {
      'card': '4c573a64c4947d3049879abf',
      'recalls': [
        { 'recall': 0.5, '_id': '400861dad5caedf52a69a0af', 'date': '2015-09-04T09:27:33.713Z' },
        { 'recall': 1, '_id': '06d6c7d57eb333f264cbdefc', 'date': '2015-09-04T09:28:07.138Z' },
        { 'recall': 1, '_id': '66a0a8d81a6112aaf7eaa6f9', 'date': '2015-09-04T09:28:12.847Z' }
      ],
      'recallProbability': 0.8125,
      '_id': '224b5656af069379c8f483f7'
    },
    {
      'card': 'dca90f0a3b45e25e925bc109',
      'recalls': [
        { 'recall': 1, '_id': '889d0c1ea356d91fd889848c', 'date': '2015-09-04T09:27:37.914Z' }
      ],
      'recallProbability': 0.5,
      '_id': '3b367bc77183dad1a894958b'
    },
    {
      'card': '4af3d116e1208c4a905ea04c',
      'recalls': [
        { 'recall': 1, '_id': '7af367ea8985411996f9fddf', 'date': '2015-09-04T09:27:39.851Z' }
      ],
      'recallProbability': 0.5,
      '_id': '352b3884ca06b8d681344fa7'
    },
    {
      'card': '696168d3128c22ec5d264dee',
      'recalls': [
        { 'recall': 1, '_id': 'c0691a1a7ea4c89c776716b5', 'date': '2015-09-04T09:27:41.831Z' }
      ],
      'recallProbability': 0.5,
      '_id': 'c9111b853cef58aec0034ee4'
    },
    {
      'card': '0ee4d72edca0a60b90d8c3e5',
      'recalls': [
        { 'recall': 0, '_id': '542039340f4ae652e4f1b7e6', 'date': '2015-09-04T09:27:49.249Z' },
        { 'recall': 1, '_id': 'bac0751a01a6d64b4cb556d1', 'date': '2015-09-04T09:28:08.540Z' },
        { 'recall': 1, '_id': '884aa918f1b52fd47f443d57', 'date': '2015-09-04T09:28:14.041Z' }
      ],
      'recallProbability': 0.75,
      '_id': '850e1b78167df586fc512374'
    },
    {
      'card': 'c9b59274f9a5bdc87aabfd7d',
      'recalls': [
        { 'recall': 0.5, '_id': 'bf06d26dd5131005f4b7d8c1', 'date': '2015-09-04T09:27:53.397Z' },
        { 'recall': 1, '_id': 'e206e48ce28dda4624c467a2', 'date': '2015-09-04T09:28:10.097Z' },
        { 'recall': 1, '_id': '59a5f354c8c92a985507819b', 'date': '2015-09-04T09:28:15.358Z' }
      ],
      'recallProbability': 0.8125,
      '_id': '0aceb14d174c615fcda1c3fb'
    },
    {
      'card': '414ef737a04dcc95010d4491',
      'recalls': [
        { 'recall': 1, '_id': 'cd4f6ae2f4cf62ca036d6125', 'date': '2015-09-04T09:28:00.118Z' }
      ],
      'recallProbability': 0.5,
      '_id': '442f1b093c07ad1ac7c4aeea'
    },
    {
      'card': 'c1ea04f75b1d0cfc49cf1629',
      'recalls': [
        { 'recall': 1, '_id': '91fde8d3f4c79de7bfab3715', 'date': '2015-09-04T09:28:02.050Z' }
      ],
      'recallProbability': 0.5,
      '_id': '9c321afdd1999e9f10b68e72'
    }
  ];
};
// jshint ignore:end
