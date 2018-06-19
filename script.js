function createCORSRequest(method, url) {
    let xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        // XHR for Chrome/Firefox/Opera/Safari.
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
        // XDomainRequest for IE.
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        // CORS not supported.
        xhr = null;
    }
    return xhr;
}

function get(url) {
    return new Promise(function(resolve, reject) {
        let req = createCORSRequest('GET', url);
        if (!req) {
            alert('CORS not supported');
            return;
        }

        req.onload = () => {
            if (req.status == 200) {
                resolve(req.response);
            } else {
                reject(Error(req.statusText));
            }
        };

        req.onerror = () => {
            reject(Error("Network Error"));
        };

        req.send();
    });
}

function getPokemon(id) {
    get(url + id + '/').then((response) => {
        pokemon.push(response);
        console.log("Success retrieving " + pokemonId);

        //Get next one...
        pokemonId++;
        if (pokemonId >= 151)
        {
            //Generate all pokemon
            pokemon.forEach((pokemon) => { parsePokemon(JSON.parse(pokemon));});
            saveData(finalPokemon, 'finalPokemon.json');
            //dumpPokemon();
            return;
        }

        console.log("Retrieving " + pokemonId);
        getPokemon(pokemonId);
    }, (error) => {
        console.error("Oops", error);
    });
}

function dumpPokemon() {
    console.log(pokemon);
    pokemon.forEach((pokemon) => {
        console.log(pokemon);
    });
}

let parsePokemon = function (pokemon) {
    if (pokemon === {})
        return;

    let newPokemon = {};
    newPokemon.id = pokemon.id;
    newPokemon.name = pokemon.name;
    newPokemon.sprites = pokemon.sprites;
    newPokemon.height = pokemon.height;
    newPokemon.weight = pokemon.weight;

    //Populate abilities
    newPokemon.abilities = [];

    console.log("Check abilities");
    pokemon.abilities.forEach((ability) => {
        newPokemon.abilities.push({
            id: getIdFromUrl(ability.ability.url),
            name: ability.ability.name,
            hidden: ability.is_hidden
        });
    });

    newPokemon.stats = {};

    console.log("Check stats");
    pokemon.stats.forEach((stat) => {
       newPokemon.stats[stat.stat.name] = {
           id: getIdFromUrl(stat.stat.url),
           effort: stat.effort,
           base: stat.base_stat
       }
    });

    newPokemon.baseExperience = pokemon.base_experience;
    newPokemon.types = [];

    console.log("Check types");
    pokemon.types.forEach((type) => {
        newPokemon.types.push({
            name: type.type.name,
            id: getIdFromUrl(type.type.url)
        });
    });

    newPokemon.moves = [];

    console.log("Check moves");
    pokemon.moves.forEach((move) => {
        console.log("Check move version");
        move.version_group_details.forEach((version) => {
          if (version.version_group.name === "sun-moon") {
              newPokemon.moves.push({
                  name: move.move.name,
                  levelLearned: version.level_learned_at,
                  method: version.move_learn_method.name,
                  id: getIdFromUrl(move.move.url)
              });
          }
        });

    });
    console.log(newPokemon);
    finalPokemon.push(newPokemon);
};

let getIdFromUrl = function(url) {
    let bits = url.split('/');
    if (bits[bits.length - 1] !== "") {

    } else {
        return parseInt(bits[bits.length - 2], 10);
    }
};

let saveData = (function () {
    var a = document.createElement("a");
    document.body.appendChild(a);
    //a.style = "display: none";
    return function (data, fileName) {
        var json = JSON.stringify(data),
            blob = new Blob([json], {type: "octet/stream"}),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());

let callMove = (moveId) => {
    if (moves[moveId] != undefined) {
        let url = "https://pokeapi.co/api/v2/move/";
        get(url + moveId + "/").then((response) => {
            console.log(response);
            console.log(moveId);
            let obj = JSON.parse(response);
            moves[moveId].accuracy = obj.accuracy;
            moves[moveId].power = obj.power;
            moves[moveId].damageClass = obj.damage_class.name;
            moves[moveId].meta = obj.meta;
            moves[moveId].type = {
                id: getIdFromUrl(obj.type.url),
                name: obj.type.name
            };
            moves[moveId].target = {
                id: getIdFromUrl(obj.target.url),
                name: obj.target.name
            };
            moves[moveId].priority = obj.priority;
            moves[moveId].pp = obj.pp;
            moves[moveId].effectChance = obj.effect_chance;
            moves[moveId].statChanges = obj.stat_changes;
            moves[moveId].effectChanges = obj.effect_changes;

            moveId++;
            callMove(moveId);
        }, (error) => {
            console.error("Something went wrong" + error);
        });
    } else {
        moveId++;
        callMove(moveId);
    }

    if (moveId > 707) {
        console.log("Finished no problems");
        return;
    }
};

//Init pokemon generation (Uncomment to use)
// let pokemon = [];
// let finalPokemon = [];
// let url = "https://pokeapi.co/api/v2/pokemon/";
// let pokemonId = 1;
//
// getPokemon(pokemonId);


//Init move calculation
let moveId = 0;
moves = {};
pokemon.forEach((pokemon) => {
   pokemon.moves.forEach((move) => {
       console.log(move.id);
      moves[`${move.id}`] =  {
          name: move.name,
          id: move.id
      }
   });
});
callMove(moveId);