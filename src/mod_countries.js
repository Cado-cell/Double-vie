/* Deux Vies — module « Pays du monde » (id countries)
   Étend COUNTRIES et NAMEPOOLS à l’exécution ; petit évènement d’expatriation. */
(()=>{
const MOD='countries';
Object.assign(NAMEPOOLS,{
 pt:{H:['João','Tiago','Rui','Pedro','Miguel','Diogo','Duarte','Gonçalo','Francisco','Rodrigo','Nuno','André'],F:['Maria','Beatriz','Inês','Matilde','Leonor','Carolina','Mariana','Ana','Joana','Catarina','Sofia','Rita'],L:['Silva','Santos','Ferreira','Pereira','Oliveira','Costa','Rodrigues','Martins','Sousa','Fernandes','Gonçalves','Carvalho']},
 nl:{H:['Daan','Sem','Lucas','Finn','Milan','Thijs','Bram','Jesse','Sven','Lars','Ruben','Jasper'],F:['Emma','Julia','Sanne','Fleur','Lotte','Anne','Eva','Noor','Femke','Iris','Maud','Lieke'],L:['de Jong','Jansen','de Vries','van den Berg','van Dijk','Bakker','Visser','Smit','Meijer','de Boer','Mulder','Bos']},
 tr:{H:['Mehmet','Mustafa','Ahmet','Emre','Burak','Yusuf','Can','Kerem','Efe','Ozan','Murat','Deniz'],F:['Zeynep','Elif','Ayşe','Defne','Ece','Selin','Merve','Yağmur','Büşra','Derya','Aylin','Naz'],L:['Yılmaz','Kaya','Demir','Şahin','Çelik','Yıldız','Aydın','Öztürk','Arslan','Doğan','Kılıç','Aslan']},
 ru:{H:['Alexandre','Dmitri','Ivan','Nikolaï','Sergueï','Andreï','Mikhaïl','Artiom','Maxime','Iouri','Oleg','Vladimir'],F:['Anastasia','Maria','Olga','Natalia','Ekaterina','Tatiana','Sofia','Irina','Daria','Elena','Svetlana','Oksana'],L:['Ivanov','Petrov','Smirnov','Kuznetsov','Popov','Volkov','Sokolov','Morozov','Lebedev','Kovalenko','Shevchenko','Bondarenko']},
 cn:{H:['Wei','Lei','Jun','Hao','Ming','Yang','Chen','Tao','Bo','Jian','Peng','Kai'],F:['Mei','Li','Xiu','Yan','Jing','Lan','Ling','Fang','Hui','Xin','Yue','Qing'],L:['Wang','Li','Zhang','Liu','Chen','Yang','Huang','Zhao','Wu','Zhou','Xu','Sun']},
 kr:{H:['Min-jun','Seo-jun','Ji-ho','Joon-woo','Hyun-woo','Do-yoon','Sung-min','Tae-hyun','Jae-won','Dong-hyun','Woo-jin','Ji-hoon'],F:['Seo-yeon','Ji-woo','Ha-eun','Soo-ah','Min-seo','Yuna','Ji-min','Da-eun','Chae-won','Eun-ji','Hye-jin','Su-bin'],L:['Kim','Lee','Park','Choi','Jung','Kang','Cho','Yoon','Jang','Lim','Han','Shin']},
 in:{H:['Arjun','Rohan','Aarav','Vikram','Rahul','Amit','Karan','Siddharth','Ravi','Ankit','Vivek','Rajesh'],F:['Priya','Ananya','Aditi','Kavya','Neha','Pooja','Sneha','Isha','Meera','Divya','Riya','Lakshmi'],L:['Sharma','Patel','Singh','Kumar','Gupta','Reddy','Iyer','Nair','Mehta','Joshi','Das','Khan']},
 pl:{H:['Jakub','Szymon','Kacper','Filip','Mateusz','Michał','Wojciech','Piotr','Tomasz','Bartek','Marek','Paweł'],F:['Zuzanna','Julia','Maja','Oliwia','Anna','Natalia','Katarzyna','Agnieszka','Magdalena','Ewa','Weronika','Kinga'],L:['Nowak','Kowalski','Wiśniewski','Wójcik','Kamiński','Lewandowski','Zieliński','Szymański','Dąbrowski','Kozłowski','Novák','Svoboda']},
 gr:{H:['Georgios','Dimitris','Nikos','Konstantinos','Yannis','Panagiotis','Christos','Alexandros','Stavros','Manolis','Thanasis','Vasilis'],F:['Maria','Eleni','Georgia','Katerina','Sofia','Dimitra','Anna','Ioanna','Despina','Christina','Zoi','Evangelia'],L:['Papadopoulos','Georgiou','Nikolaou','Dimitriou','Karagiannis','Vasiliou','Pappas','Antoniou','Alexiou','Makris','Oikonomou','Stavrou']},
 se:{H:['Erik','Lars','Oskar','Anders','Magnus','Henrik','Nils','Axel','Mikkel','Sven','Mathias','Olav'],F:['Astrid','Freja','Ingrid','Elsa','Sigrid','Maja','Linnea','Hanna','Signe','Ida','Kari','Sanna'],L:['Andersson','Johansson','Hansen','Nilsson','Larsen','Olsen','Jensen','Lindberg','Eriksen','Berg','Nielsen','Korhonen']},
 vi:{H:['Minh','Anh','Dũng','Hùng','Tuấn','Quang','Hiếu','Khoa','Long','Nam','Phúc','Thành'],F:['Linh','Lan','Hương','Mai','Ngọc','Thảo','Trang','Hà','Yến','Phương','Thu','Nhung'],L:['Nguyễn','Trần','Lê','Phạm','Hoàng','Phan','Vũ','Đặng','Bùi','Đỗ','Hồ','Ngô']},
 af:{H:['Kouassi','Yao','Koffi','Jean-Baptiste','Aristide','Emmanuel','Serge','Landry','Brice','Armand','Franck','Didier'],F:['Aya','Adjoua','Fatoumata','Mariam','Grace','Estelle','Nadège','Clarisse','Josiane','Christelle','Aïcha','Prisca'],L:['Kouassi','Traoré','Koné','Bamba','Ouattara','Nkomo','Mbarga','Tchamba','Kabila','Keïta','Coulibaly','Mukendi']},
 la:{H:['Santiago','Mateo','Sebastián','Matías','Nicolás','Joaquín','Emiliano','Andrés','Camilo','Felipe','Ignacio','Rodrigo'],F:['Valentina','Camila','Isabella','Daniela','Ximena','Catalina','Mariana','Fernanda','Renata','Gabriela','Paula','Antonella'],L:['Hernández','González','Ramírez','Flores','Castillo','Vargas','Rojas','Morales','Herrera','Mendoza','Silva','Quispe']},
 th:{H:['Somchai','Anan','Chai','Krit','Nattapong','Prasert','Thanawat','Kittipong','Supachai','Wichai','Arthit','Pichai'],F:['Ploy','Nok','Malee','Siriporn','Napat','Kanya','Mali','Supansa','Pim','Orn','Chanida','Waraporn'],L:['Srisai','Chaiyaporn','Wongsawat','Boonmee','Saetang','Rattanakul','Jaidee','Suwan','Thongchai','Kaewmanee','Phromma','Charoen']}
});
const C=(pool,cost,cities,mon)=>mon?{pool,cost,cities,mon}:{pool,cost,cities};
Object.assign(COUNTRIES,{
 'Luxembourg':C('fr',1.7,['Luxembourg','Esch-sur-Alzette','Differdange','Dudelange','Ettelbruck'],['Grand-Duc','Grande-Duchesse']),
 'Algérie':C('ar',.4,['Alger','Oran','Constantine','Annaba','Tizi Ouzou','Béjaïa']),
 'Tunisie':C('ar',.4,['Tunis','Sfax','Sousse','Bizerte','Djerba']),
 'Égypte':C('ar',.35,['Le Caire','Alexandrie','Louxor','Assouan','Charm el-Cheikh']),
 'Liban':C('ar',.7,['Beyrouth','Tripoli','Saïda','Byblos','Zahlé']),
 'Jordanie':C('ar',.7,['Amman','Aqaba','Petra','Irbid','Zarqa'],['Roi','Reine']),
 'Arabie saoudite':C('ar',1,['Riyad','Djeddah','La Mecque','Dammam','Médine'],['Roi','Reine']),
 'Émirats arabes unis':C('ar',1.5,['Dubaï','Abu Dhabi','Charjah','Ajman','Al Aïn'],['Cheikh','Cheikha']),
 'Côte d’Ivoire':C('af',.4,['Abidjan','Yamoussoukro','Bouaké','San-Pédro','Korhogo']),
 'Cameroun':C('af',.35,['Douala','Yaoundé','Bafoussam','Garoua','Kribi']),
 'Mali':C('af',.3,['Bamako','Sikasso','Ségou','Mopti','Tombouctou']),
 'RD Congo':C('af',.3,['Kinshasa','Lubumbashi','Goma','Kisangani','Matadi']),
 'Haïti':C('fr',.3,['Port-au-Prince','Cap-Haïtien','Jacmel','Les Cayes','Gonaïves']),
 'Nigeria':C('en',.4,['Lagos','Abuja','Ibadan','Port Harcourt','Kano']),
 'Afrique du Sud':C('en',.6,['Le Cap','Johannesburg','Durban','Pretoria','Port Elizabeth']),
 'Irlande':C('en',1.2,['Dublin','Cork','Galway','Limerick','Kilkenny']),
 'Australie':C('en',1.3,['Sydney','Melbourne','Brisbane','Perth','Adélaïde','Canberra']),
 'Nouvelle-Zélande':C('en',1.1,['Auckland','Wellington','Christchurch','Queenstown','Dunedin']),
 'Autriche':C('de',1,['Vienne','Salzbourg','Innsbruck','Graz','Linz']),
 'Portugal':C('pt',.7,['Lisbonne','Porto','Faro','Coimbra','Braga','Funchal']),
 'Angola':C('pt',.4,['Luanda','Benguela','Huambo','Lobito','Lubango']),
 'Cap-Vert':C('pt',.5,['Praia','Mindelo','Sal Rei','Assomada']),
 'Pays-Bas':C('nl',1.2,['Amsterdam','Rotterdam','La Haye','Utrecht','Eindhoven','Groningue'],['Roi','Reine']),
 'Turquie':C('tr',.4,['Istanbul','Ankara','Izmir','Antalya','Bursa','Trabzon']),
 'Russie':C('ru',.55,['Moscou','Saint-Pétersbourg','Novossibirsk','Kazan','Sotchi']),
 'Ukraine':C('ru',.35,['Kiev','Lviv','Odessa','Kharkiv','Dnipro']),
 'Chine':C('cn',.6,['Pékin','Shanghai','Canton','Shenzhen','Chengdu','Hangzhou']),
 'Corée du Sud':C('kr',1,['Séoul','Busan','Incheon','Daegu','Jeju']),
 'Inde':C('in',.3,['Bombay','New Delhi','Bangalore','Calcutta','Chennai','Jaipur']),
 'Pologne':C('pl',.55,['Varsovie','Cracovie','Gdańsk','Wrocław','Poznań']),
 'Tchéquie':C('pl',.65,['Prague','Brno','Ostrava','Plzeň','Olomouc']),
 'Grèce':C('gr',.7,['Athènes','Thessalonique','Patras','Héraklion','Rhodes']),
 'Suède':C('se',1.2,['Stockholm','Göteborg','Malmö','Uppsala','Kiruna'],['Roi','Reine']),
 'Norvège':C('se',1.6,['Oslo','Bergen','Trondheim','Stavanger','Tromsø'],['Roi','Reine']),
 'Danemark':C('se',1.4,['Copenhague','Aarhus','Odense','Aalborg','Esbjerg'],['Roi','Reine']),
 'Finlande':C('se',1.1,['Helsinki','Tampere','Turku','Oulu','Rovaniemi']),
 'Islande':C('se',1.4,['Reykjavik','Akureyri','Keflavik','Húsavík']),
 'Vietnam':C('vi',.3,['Hanoï','Hô Chi Minh-Ville','Da Nang','Hué','Haïphong']),
 'Thaïlande':C('th',.4,['Bangkok','Chiang Mai','Phuket','Pattaya','Krabi'],['Roi','Reine']),
 'Mexique':C('la',.5,['Mexico','Guadalajara','Monterrey','Cancún','Oaxaca','Puebla']),
 'Argentine':C('la',.5,['Buenos Aires','Córdoba','Rosario','Mendoza','Ushuaïa']),
 'Colombie':C('la',.4,['Bogotá','Medellín','Cali','Carthagène','Barranquilla']),
 'Chili':C('la',.65,['Santiago','Valparaíso','Concepción','Antofagasta','Puerto Montt']),
 'Pérou':C('la',.4,['Lima','Cuzco','Arequipa','Trujillo','Iquitos']),
 'Cuba':C('la',.3,['La Havane','Santiago de Cuba','Varadero','Trinidad','Camagüey'])
});

const flag=L=>L.flags||(L.flags={});
function arrive(L){const f=flag(L);if(f.orig0==null)f.orig0=L.country}

registerMod({id:MOD,
  born(L){arrive(L)},
  events(L){
    const f=flag(L);
    if(f.orig0==null||f.orig0===L.country||f.expat||!COUNTRIES[L.country]||L.age<12)return 0;
    f.expat=1;
    const pays=L.country,vie=['Tu goûtes une spécialité locale que ton ventre n’avait jamais rencontrée.','Tu apprends enfin à commander un café sans pointer du doigt.','Tu te perds trois fois avant de trouver la bonne station de métro.'];
    modal({title:'Expatrié'+ge(L,'','e'),icon:'🧳',text:`Tu vis désormais en ${pays}, loin de ${f.orig0}. Les premiers mois sont un joyeux mélange de maladresses et de découvertes. Comment t’intègres-tu ?`,choices:[
      {t:'Apprendre la langue et sortir',fn:()=>{chg(L,{smarts:R(1,3),happy:R(2,5)});return out(L,pick(vie)+' Les voisins t’adoptent peu à peu.')}},
      {t:'Rester entre compatriotes',fn:()=>{chg(L,{happy:R(1,3),stress:-R(1,3)});return out(L,`Tu retrouves un peu de ${f.orig0} au coin de la rue. Réconfortant, mais ton vocabulaire stagne.`)}},
      {t:'Appeler la famille, le mal du pays',fn:()=>{chg(L,{happy:-R(1,3)});return out(L,'Une longue visio avec la famille. Tu as le cœur gros, mais le forfait aussi.')}}]});
    return 1;
  }
});
})();
