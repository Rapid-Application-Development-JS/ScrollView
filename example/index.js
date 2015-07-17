require.config({
	"baseUrl": "",
	"paths": {
		"app": "app"
		, "core-js": "bower_components/core.js/client/core.min"
		, "radjs-pointer": "bower_components/radjs-pointer/release/pointer.min"
		, "radjs-gesture": "bower_components/radjs-gesture/release/gesture.min"
		, "radjs-scrollview": "bower_components/radjs-scrollview/release/radjs-scrollview.min"
		//, "radjs-scrollview": "../release/radjs-scrollview"
		, "webcomponentsjs": "bower_components/webcomponentsjs/webcomponents-lite.min"
		, "x-radjs-scrollview": "bower_components/radjs-scrollview/release/x-radjs-scrollview.min"
		//, "x-radjs-scrollview": "../release/x-radjs-scrollview.min"
	},
	"shim": {
		"app": {"deps": ["core-js", "x-radjs-scrollview"]}
	},
	"waitSeconds": 0
});
require(Object.keys(requirejs.s.contexts._.config.paths), function () {
	// Load modules in object - {modulename: ExportedModule}
	var modules = (function (keys, values) {
		var pair = {};
		for (var index = 0, length = keys.length; index <= length; index += 1) {
			pair[keys[index]] = index in values ? values[index] : void(0);
		}
		return pair;
	}(Object.keys(requirejs.s.contexts._.config.paths), Array.from(arguments)));
	var dummy = ["Abner", "Ada", "Addison", "Adele", "Aglae", "Al", "Alberto", "Alec", "Alek", "Alene", "Alessandro",
		"Alfonso", "Alfred", "Ali", "Alivia", "Aliya", "Allan", "Allison", "Alvera", "Alvina", "Alvis", "Alyson",
		"Amanda", "Anabelle", "Angelita", "Angelo", "Angie", "Aniya", "Annetta", "Annie", "Ansley", "Antonia",
		"Antonina", "Antonio", "Araceli", "Ardella", "Arden", "Arnaldo", "Arnoldo", "Arnulfo", "Arvilla", "Audie",
		"Audreanne", "August", "Augusta", "Augustus", "Aurelie", "Aurelio", "Autumn", "Axel", "Aylin", "Baron",
		"Beaulah", "Bernadette", "Bernard", "Berneice", "Bernhard", "Berta", "Bertram", "Bessie", "Bette", "Bonnie",
		"Brando", "Brenda", "Bret", "Brett", "Brianne", "Bridget", "Brigitte", "Brisa", "Brooklyn", "Bryana", "Bryon",
		"Burdette", "Caitlyn", "Cali", "Calista", "Carli", "Carolyne", "Carroll", "Carson", "Casandra", "Casimer",
		"Casimir", "Casper", "Cassie", "Catherine", "Cecile", "Cedrick", "Celestine", "Chadrick", "Chanelle",
		"Chauncey", "Chelsie", "Chesley", "Cheyenne", "Christopher", "Cindy", "Clarabelle", "Claud", "Claudie",
		"Claudine", "Clementine", "Cletus", "Clint", "Clinton", "Clovis", "Connor", "Cooper", "Corene", "Courtney",
		"Crawford", "Cristian", "Curt", "Cydney", "Cyril", "Dagmar", "Damaris", "Darrin", "Darryl", "Dashawn", "Dasia",
		"Dawn", "Dayton", "Deangelo", "Dedrick", "Deion", "Dejon", "Delphine", "Delta", "Dennis", "Deonte", "Derek",
		"Destany", "Destinee", "Devon", "Dillon", "Dixie", "Dock", "Domenic", "Donald", "Donny", "Doris", "Dovie",
		"Duncan", "Earl", "Eddie", "Edison", "Efrain", "Elda", "Elian", "Eliane", "Eliezer", "Elisa", "Ellen", "Elody",
		"Elouise", "Elroy", "Elvera", "Elyse", "Emiliano", "Emilie", "Emily", "Emma", "Emmanuel", "Emmy", "Enid",
		"Enrique", "Erich", "Eryn", "Estell", "Estrella", "Ethan", "Ettie", "Eugene", "Euna", "Evert", "Ezekiel",
		"Fabiola", "Fatima", "Felicia", "Felipa", "Felix", "Fermin", "Flavie", "Flossie", "Floy", "Foster", "Francesca",
		"Freeda", "Frieda", "Friedrich", "Garfield", "Garnet", "Gerald", "Gerry", "Gilberto", "Giuseppe", "Golden",
		"Gonzalo", "Grant", "Guadalupe", "Guido", "Gunnar", "Gustave", "Gwendolyn", "Halle", "Hayden", "Haylee",
		"Helen", "Hilario", "Hilbert", "Hillary", "Horacio", "Howard", "Hoyt", "Hubert", "Hugh", "Humberto", "Ian",
		"Ibrahim", "Idell", "Ignacio", "Ignatius", "Irma", "Isabell", "Isaias", "Jace", "Jacinthe", "Jaden", "Jakob",
		"Jalon", "Janessa", "Janis", "Jaren", "Jarod", "Jason", "Javon", "Jaycee", "Jedidiah", "Jefferey", "Jerel",
		"Jerome", "Jeromy", "Jerrold", "Jessika", "Jimmie", "Joanny", "Jocelyn", "Johnathan", "Jonas", "Jonathan",
		"Jonathon", "Jovan", "Juanita", "Judd", "Judy", "Julian", "Justice", "Kaela", "Kailey", "Kaley", "Kane",
		"Kareem", "Karelle", "Karianne", "Katherine", "Kathleen", "Kathryn", "Katlynn", "Kaylin", "Keaton", "Keenan",
		"Keira", "Kellie", "Ken", "Kenna", "Kenya", "Kenyatta", "Kiarra", "Kirstin", "Krista", "Kristin", "Kristina",
		"Krystel", "Kyra", "Lamar", "Lamont", "Landen", "Laney", "Laron", "Laura", "Lauretta", "Laurie", "Laurine",
		"Lavada", "Layne", "Lenna", "Lenny", "Lenore", "Leola", "Leone", "Leora", "Leslie", "Lester", "Letha",
		"Lilian", "Lilliana", "Lisa", "Llewellyn", "Logan", "Lois", "Loren", "Lorenz", "Lucienne", "Luella", "Lyric",
		"Mack", "Mackenzie", "Mae", "Magali", "Maia", "Malika", "Malinda", "Manley", "Mara", "Marcel", "Margarett",
		"Marge", "Mariah", "Mariela", "Marjolaine", "Marjorie", "Markus", "Matt", "Maude", "Maudie", "Maurine",
		"Maxime", "Maximus", "Mazie", "Mekhi", "Melvina", "Millie", "Missouri", "Mona", "Monty", "Morgan", "Mya",
		"Myron", "Nannie", "Nasir", "Nicklaus", "Nikko", "Noah", "Noe", "Noemie", "Nora", "Norris", "Nyah", "Oda",
		"Olga", "Ona", "Opal", "Otha", "Paolo", "Pearline", "Penelope", "Philip", "Phoebe", "Polly", "Porter",
		"Princess", "Quentin", "Rafaela", "Rahsaan", "Raina", "Ralph", "Ramon", "Randall", "Raquel", "Rebecca",
		"Reilly", "Reina", "Ressie", "Reva", "Rhett", "Ricky", "River", "Robert", "Roberta", "Robyn", "Rodger",
		"Rodrick", "Rosalinda", "Rowena", "Rubie", "Ruthe", "Ryann", "Ryley", "Savanna", "Scotty", "Selena", "Serena",
		"Shaina", "Shana", "Shayna", "Sherman", "Sonia", "Sonya", "Stacy", "Stan", "Stefan", "Stephania", "Stephanie",
		"Sterling", "Steve", "Stuart", "Susie", "Suzanne", "Sydney", "Tabitha", "Tanya", "Tara", "Taylor", "Teagan",
		"Thelma", "Theodore", "Thora", "Tia", "Tobin", "Tomas", "Travis", "Tremaine", "Tyrique", "Tyshawn", "Urban",
		"Valentina", "Valentine", "Velda", "Verda", "Verlie", "Vernie", "Vicky", "Vincenzo", "Vito", "Walker", "Watson",
		"Wayne", "Webster", "Wellington", "Willa", "William", "Winnifred", "Xzavier", "Zoey", "Zula"];
	modules.app.start(modules, dummy);
});
