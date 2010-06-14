HighlightUsersExtension.prototype = new ShacknewsExtension;

var highlightUsersExtension = new HighlightUsersExtension();

function HighlightUsersExtension() {
	ShacknewsExtension.call(this, "HighlightUsers");
	this.extendShacknews(attachHighlightUsersCss);
}

HighlightUsersExtension.prototype.extended = function(message) {

	var curExtension = this;
	var cssText = '';
	
	
	ShacknewsExtension.getRootPosts().each(function() {
		curExtension.threadReloaded(this);
	});
	
	this.listenForReloads();
}


HighlightUsersExtension.prototype.threadReloaded = function(thread) {
	var poster = $(thread).find("div.fullpost:first").attr("class").replace(/.*fpauthor_(\d+).*/, "$1");
	$(thread).find("div.olauthor_" + poster + " a.oneline_user").addClass("original_poster");
}

function attachHighlightUsersCss() {
	document.write('<link rel="stylesheet" type="text/css"  href="' + safari.extension.baseURI + 'user_highlight.css" />');
}

HighlightUsersExtension.userList = {
                "Mods":
                [
                    "3259"  , // degenerate
                    "10028" , // drucifer
                    "168479", // ajax
                    "5334"  , // dante
                    "7438"  , // enigmatic
                    "169489", // s[genjuro]s
                    "8105"  , // hirez
                    "5278"  , // lacker
                    "6674"  , // pupismyname
                    "32016" , // thekidd
                    "1194"  , // zakk
                    "171402", // brickmatt
                    "6585"  , // carnivac
                    "168256", // edgewise
                    "169197", // filtersweep
                    "9980"  , // haiku
                    "44583" , // jokemon
                    "3243"  , // p[multisync]p
                    "169049", // rauol duke
                    "8349"  , // sexninja!!!!
                    "194196", // ninjase
                    "6933"  , // tomservo
                    "9085"  , // busdriver3030
                    "8048"  , // cygnus x-1
                    "6380"  , // dognose
                    "167953", // edlin
                    "12398" , // geedeck
                    "171127", // helvetica
                    "7570"  , // kaiser
                    "8316"  , // paranoid android
                    "9031"  , // portax
                    "9211"  , // redfive
                    "7660"  , // sexpansion pack
                    "169927", // sgtsanity
                    "15130" , // utilitymaximizer
                    "169942", // mikecyb - not listed on mods page
                    "185650"  // Dave-A - not listed on mods page
                ],

                "Employees":
                [
                    "4",      // Steve Gibson
                    "43653",  // Maarten Goldstein
                    "175043", // Chris Faylor
                    "175046", // Nick Breckon
                    "188134", // Aaron Linde
                    "204735", // Alice O'Connor
                    "213066", // Jeff Mattas
                    "212323", // Garnett Lee
                    "44124"  // sHugamom
                ],

                "Game Devs":
                [
                    "4957","171370", //2k Games   jason bergman,  dahanese
                    "182981", //2K Sports OverloadUT
                    "168928","13098","7048","171248","169937","173984", //3D Realms  eskimo spy, georgeb3dr - George Broussard, Joe3DR - Joe Siegler, Mr. 9000 - John Schuch, Scatti, ScottMi11er - Scott Miller
                    '169686', //Airtight Games  Dravalen
                    '119968', //Affectworks  fredrik s
                    '32598', //Artificial Mind & Movement  derean
                    '4929', //Atari (Dallas)  YoYo
                    '174434','170554', //Bethesda Softworks  lplasmatron, speon
                    '8085',//Bioware  Derek French
                    '168742',//Bungie  dmiller - Dan Miller
                    '14633',//Buzz Monkey Software  Karnov
                    '170764','12418',//Digital Illusions CE (dice) (Sweden)   aavenr, -efx-
                    '270',+//EA Canada (PSP)   timmie
                    '4312','170275',//Epic   CliffyB - Cliff Bleszinski, fufux
                    '175192',//Free Radical Design  jbury
                    '186653',//Flagship Studios  Ivan Sulic
                    '7466','173003','172749',//GarageGames  d3tached - (Torque X), sullisnack - Sean Sullivan, timaste - Tim Aste
                    '4605',//Gas Powered Games  hellchick - Caryn Law
                    '3829','169955','171337','6020','168552','172976','166528','4178',//Gearbox Software  rickmus, byorn, DaMojo - Pat Krefting, duvalmagic - Randy Pitchford, kungfusquirrel, MADMikeDavis, mikeyzilla - Mike Neumann, wieder - Charlie Wiederhold
                    '172526',//hb-studios  threeup
                    '171752','19054',//Human Head  lvlmaster, zeroprey
                    '170311','3982','4916',//Id Software  patd - Patrick Duffy, toddh - Todd Hollenshead, xian - Christian Antkow
                    '102','21915','119746',//Infinity Ward  Avatar, DKo5, Inherent
                    '169079',//Massive Entertainment  SilverSnake
                    '12865',//Monolith  cannelbrae
                    '183170','172349',//Naughty Dog  Cowbs (previously known as cpnkegel)
                    '1347',//NCSoft  Zoid - Dave Kirsch
                    '12631',//Nerve Software  Normality - Joel Martin
                    '12963','6507','27483','169925','11816','4257',//Pandemic Studios  darweidu, Freshview, gndagger, Rampancy, sammyl, tostador
                    '170163',//Piranha Games  Buckyfg1
                    '4262',//Planet Moon  cheshirecat
                    '14033',//Remedy Entertainment  PetriRMD - Petri Jarvilehto(?)
                    '8202','2025',//Retro Studios  Andy Hanson - Andy Hanson, Jack Mathews - Jack Mathews
                    '169919',//Rockstar Games  bozer
                    '169712',//S2 Games  s2jason - Jason
                    '171285',//Slant Six  bakanoodle
                    '171466',//Stardock  mittense
                    '173743',//Stray Bullet Games  AshenTemper - Sean Dahlberg
                    '172702','13334','169942',//TellTale Games  dtabacco, jake2000 - Jake Rodkin, mikecyb
                    '173748',//ThreeWave Software  brome - Adam Bromell
                    '172581',//Treyarch  Krypt_ - Brian Glines
                    '6358',//Trauma Studios  Ease_One
                    '171762','168242',//UbiSoft  mnok, MrLobo
                    '173884','12149','125906','173374','190115',//Valve  Doug_Support - Doug Valente (Support), Erik Johnson - Erik Johnson, garymct - Gary McTaggart, locash - Patrick M (Support), RobinWalker
                    '170414','9172',//Vivendi Universal  ColoradoCNC, Pezman
                    '12656',//Zemnott  KnyteHawkk - Jared Larsen
                    '170084', // deveus1 (Activision)
                    '49660','169993','174785'//Former Game Indusrty People     Omning, robingchyo, Romsteady
                ]
            }