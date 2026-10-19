import type { HouseId } from '@/lib/community';

export interface ChallengeChoice {
  id: string;
  text: string;
}

export interface ChallengeQuestion {
  id: string;
  house: HouseId;
  question: string;
  choices: ChallengeChoice[];
  answerId: string;
  explanation: string;
}

export const HOUSE_CHALLENGE_QUESTIONS: ChallengeQuestion[] = [
  {
    id: 'marvel-01', house: 'marvel', question: 'In Earth-616 comics, what is the name of the alien symbiote that first bonds with Peter Parker during Secret Wars?',
    choices: [{ id: 'a', text: 'Venom' }, { id: 'b', text: 'Toxin' }, { id: 'c', text: 'Carnage' }, { id: 'd', text: 'The original black suit symbiote, later called Venom' }],
    answerId: 'd', explanation: 'The black suit acquired on Battleworld was the symbiote later bonded to Eddie Brock and known as Venom.',
  },
  {
    id: 'marvel-02', house: 'marvel', question: 'In the main Marvel comics continuity, who created Ultron?',
    choices: [{ id: 'a', text: 'Hank Pym' }, { id: 'b', text: 'Tony Stark' }, { id: 'c', text: 'Reed Richards' }, { id: 'd', text: 'Bruce Banner' }],
    answerId: 'a', explanation: 'Hank Pym created Ultron in the main comics continuity; adaptations sometimes attribute his creation differently.',
  },
  {
    id: 'marvel-03', house: 'marvel', question: 'In Earth-616, who assembled the original X-Men, and which student led the team in the field?',
    choices: [{ id: 'a', text: 'Professor X assembled them; Cyclops was field leader' }, { id: 'b', text: 'Magneto assembled them; Jean Grey was field leader' }, { id: 'c', text: 'Cyclops assembled them; Professor X was field leader' }, { id: 'd', text: 'Wolverine assembled them; Beast was field leader' }],
    answerId: 'a', explanation: 'Professor X assembled the original student team, with Cyclops serving as its field leader.',
  },
  {
    id: 'marvel-04', house: 'marvel', question: 'What is the name of the metal bonded to Wolverine’s skeleton in the comics?',
    choices: [{ id: 'a', text: 'Vibranium' }, { id: 'b', text: 'Adamantium' }, { id: 'c', text: 'Uru' }, { id: 'd', text: 'Carbonadium' }],
    answerId: 'b', explanation: 'The Weapon X program bonded adamantium to Wolverine’s skeleton.',
  },
  {
    id: 'marvel-05', house: 'marvel', question: 'In Earth-616, what is the name of Black Panther’s homeland?',
    choices: [{ id: 'a', text: 'Genosha' }, { id: 'b', text: 'Attilan' }, { id: 'c', text: 'Wakanda' }, { id: 'd', text: 'Birnin Zana is the country' }],
    answerId: 'c', explanation: 'Wakanda is the sovereign nation ruled by T’Challa; Birnin Zana is its capital city.',
  },
  {
    id: 'marvel-06', house: 'marvel', question: 'Which Infinity Stone is associated with the Soul World in Marvel comics?',
    choices: [{ id: 'a', text: 'Time Gem' }, { id: 'b', text: 'Mind Gem' }, { id: 'c', text: 'Reality Gem' }, { id: 'd', text: 'Soul Gem' }],
    answerId: 'd', explanation: 'The Soul Gem contains the Soul World, where captured souls can exist.',
  },
  {
    id: 'marvel-07', house: 'marvel', question: 'Who is Kamala Khan’s principal superhero inspiration before she discovers her own powers?',
    choices: [{ id: 'a', text: 'Captain Marvel (Carol Danvers)' }, { id: 'b', text: 'Storm' }, { id: 'c', text: 'Jessica Jones' }, { id: 'd', text: 'She-Hulk' }],
    answerId: 'a', explanation: 'Kamala is a devoted Captain Marvel fan and takes the name Ms. Marvel.',
  },
  {
    id: 'marvel-08', house: 'marvel', question: 'In the main comics continuity, what energy source powers Tony Stark’s original chest-mounted electromagnet after his escape?',
    choices: [{ id: 'a', text: 'A miniature arc reactor' }, { id: 'b', text: 'A cosmic cube shard' }, { id: 'c', text: 'A Stark-designed transistor circuit' }, { id: 'd', text: 'A battery supplied by the Ten Rings' }],
    answerId: 'c', explanation: 'In the original comics origin, Stark uses a transistor-based device to keep shrapnel from reaching his heart.',
  },
  {
    id: 'marvel-09', house: 'marvel', question: 'Which realm is Thor’s home in Norse-inspired Marvel comics?',
    choices: [{ id: 'a', text: 'Olympus' }, { id: 'b', text: 'Asgard' }, { id: 'c', text: 'Knowhere' }, { id: 'd', text: 'Otherworld' }],
    answerId: 'b', explanation: 'Thor is an Asgardian prince and later king.',
  },
  {
    id: 'marvel-10', house: 'marvel', question: 'What is the name of the first child of Reed Richards and Sue Storm?',
    choices: [{ id: 'a', text: 'Valeria Richards' }, { id: 'b', text: 'Franklin Richards' }, { id: 'c', text: 'Nathan Summers' }, { id: 'd', text: 'Jonathan Storm' }],
    answerId: 'b', explanation: 'Franklin is the first child of Reed and Sue; Valeria is their younger daughter.',
  },
  {
    id: 'marvel-11', house: 'marvel', question: 'Which organization originally recruited Natasha Romanoff and trained her as the Black Widow in the comics?',
    choices: [{ id: 'a', text: 'HYDRA’s Red Room' }, { id: 'b', text: 'The Hand' }, { id: 'c', text: 'The Soviet Red Room program' }, { id: 'd', text: 'Weapon Plus' }],
    answerId: 'c', explanation: 'Natasha was trained in the Soviet Red Room program; it is separate from HYDRA and Weapon Plus.',
  },
  {
    id: 'marvel-12', house: 'marvel', question: 'In the original 1960s comics, what accident gives the Fantastic Four their powers?',
    choices: [{ id: 'a', text: 'Exposure to cosmic rays during an unauthorized space flight' }, { id: 'b', text: 'A gamma-bomb test' }, { id: 'c', text: 'A failed Super-Soldier experiment' }, { id: 'd', text: 'A Kree genetic treatment' }],
    answerId: 'a', explanation: 'The team was exposed to cosmic rays while traveling through space.',
  },
  {
    id: 'marvel-13', house: 'marvel', question: 'What is the name of the ancient cosmic being whose body becomes the mining colony Knowhere in the MCU?',
    choices: [{ id: 'a', text: 'A Celestial' }, { id: 'b', text: 'A Nova Corps Centurion' }, { id: 'c', text: 'A Kree Supreme Intelligence host' }, { id: 'd', text: 'A Sovereign' }],
    answerId: 'a', explanation: 'Knowhere is built inside the severed head of a Celestial in the MCU.',
  },
  {
    id: 'marvel-14', house: 'marvel', question: 'Which mutant power is most closely associated with Ororo Munroe, Storm?',
    choices: [{ id: 'a', text: 'Telepathic illusions' }, { id: 'b', text: 'Weather manipulation' }, { id: 'c', text: 'Magnetic-field control' }, { id: 'd', text: 'Molecular acceleration' }],
    answerId: 'b', explanation: 'Storm can manipulate weather and atmospheric phenomena.',
  },
  {
    id: 'marvel-15', house: 'marvel', question: 'In the MCU, which event causes the Avengers to split over government oversight in Captain America: Civil War?',
    choices: [{ id: 'a', text: 'The Sokovia Accords' }, { id: 'b', text: 'The Battle of New York' }, { id: 'c', text: 'The Snap' }, { id: 'd', text: 'The destruction of the Helicarriers' }],
    answerId: 'a', explanation: 'The Sokovia Accords propose international oversight of enhanced individuals and divide the Avengers.',
  },
  {
    id: 'dc-01', house: 'dc', question: 'In the main DC comics continuity, who is the first Robin?',
    choices: [{ id: 'a', text: 'Jason Todd' }, { id: 'b', text: 'Tim Drake' }, { id: 'c', text: 'Dick Grayson' }, { id: 'd', text: 'Damian Wayne' }],
    answerId: 'c', explanation: 'Dick Grayson, formerly a circus acrobat with the Flying Graysons, becomes Batman’s first Robin.',
  },
  {
    id: 'dc-02', house: 'dc', question: 'What is the name of the alien world from which Superman was sent to Earth?',
    choices: [{ id: 'a', text: 'Daxam' }, { id: 'b', text: 'Krypton' }, { id: 'c', text: 'Rann' }, { id: 'd', text: 'Thanagar' }],
    answerId: 'b', explanation: 'Kal-El was born on Krypton and sent to Earth before its destruction.',
  },
  {
    id: 'dc-03', house: 'dc', question: 'Which city is chiefly protected by the Flash (Barry Allen) in mainline DC comics?',
    choices: [{ id: 'a', text: 'Central City' }, { id: 'b', text: 'Coast City' }, { id: 'c', text: 'Fawcett City' }, { id: 'd', text: 'Opal City' }],
    answerId: 'a', explanation: 'Barry Allen is strongly associated with Central City; Wally West is often associated with Keystone City.',
  },
  {
    id: 'dc-04', house: 'dc', question: 'What is the name of Wonder Woman’s home island in the classic comics origin?',
    choices: [{ id: 'a', text: 'Themyscira' }, { id: 'b', text: 'Bana-Mighdall' }, { id: 'c', text: 'Kahndaq' }, { id: 'd', text: 'Markovia' }],
    answerId: 'a', explanation: 'Diana is raised on Themyscira, the island home of the Amazons.',
  },
  {
    id: 'dc-05', house: 'dc', question: 'Which Green Lantern is the test pilot who becomes the first human member of the Green Lantern Corps in the Silver Age?',
    choices: [{ id: 'a', text: 'John Stewart' }, { id: 'b', text: 'Guy Gardner' }, { id: 'c', text: 'Kyle Rayner' }, { id: 'd', text: 'Hal Jordan' }],
    answerId: 'd', explanation: 'Abin Sur’s ring selects test pilot Hal Jordan.',
  },
  {
    id: 'dc-06', house: 'dc', question: 'What is the name of Aquaman’s underwater kingdom in the modern DC comics continuity?',
    choices: [{ id: 'a', text: 'Atlantis' }, { id: 'b', text: 'Poseidonis is the only name used for the kingdom' }, { id: 'c', text: 'Sub Diego' }, { id: 'd', text: 'Xebel' }],
    answerId: 'a', explanation: 'Aquaman rules Atlantis; Poseidonis is a city in some continuities, while Xebel is a separate realm.',
  },
  {
    id: 'dc-07', house: 'dc', question: 'In the classic comics origin, what profession does Clark Kent use as his civilian cover in Metropolis?',
    choices: [{ id: 'a', text: 'Police detective' }, { id: 'b', text: 'Daily Planet reporter' }, { id: 'c', text: 'S.T.A.R. Labs researcher' }, { id: 'd', text: 'Radio news anchor' }],
    answerId: 'b', explanation: 'Clark Kent works as a reporter at the Daily Planet.',
  },
  {
    id: 'dc-08', house: 'dc', question: 'Which villain is the ruler of Apokolips and seeks the Anti-Life Equation?',
    choices: [{ id: 'a', text: 'Brainiac' }, { id: 'b', text: 'Vandal Savage' }, { id: 'c', text: 'Darkseid' }, { id: 'd', text: 'Mongul' }],
    answerId: 'c', explanation: 'Darkseid rules Apokolips and pursues the Anti-Life Equation to eliminate free will.',
  },
  {
    id: 'dc-09', house: 'dc', question: 'What is the name of the speedster legacy’s extradimensional energy field in DC comics?',
    choices: [{ id: 'a', text: 'The Emotional Spectrum' }, { id: 'b', text: 'The Speed Force' }, { id: 'c', text: 'The Source Wall' }, { id: 'd', text: 'The Still Force is the source of all speed' }],
    answerId: 'b', explanation: 'The Speed Force is the energy field most closely associated with DC’s speedsters.',
  },
  {
    id: 'dc-10', house: 'dc', question: 'Which two heroes are traditionally paired in DC’s World’s Finest stories?',
    choices: [{ id: 'a', text: 'Batman and Superman' }, { id: 'b', text: 'Green Arrow and Black Canary' }, { id: 'c', text: 'Aquaman and Wonder Woman' }, { id: 'd', text: 'The Flash and Green Lantern' }],
    answerId: 'a', explanation: 'World’s Finest stories traditionally team Batman and Superman.',
  },
  {
    id: 'dc-11', house: 'dc', question: 'In the classic Billy Batson origin, what name does the wizard tell Billy to speak to gain his power?',
    choices: [{ id: 'a', text: 'Nabu' }, { id: 'b', text: 'Mordru' }, { id: 'c', text: 'Shazam' }, { id: 'd', text: 'Doctor Fate' }],
    answerId: 'c', explanation: 'The wizard Shazam grants Billy Batson the power invoked by speaking the wizard’s name.',
  },
  {
    id: 'dc-12', house: 'dc', question: 'Which member of the Bat-Family is Barbara Gordon best known as after her time as Batgirl?',
    choices: [{ id: 'a', text: 'Oracle' }, { id: 'b', text: 'Huntress' }, { id: 'c', text: 'Spoiler' }, { id: 'd', text: 'Batwoman' }],
    answerId: 'a', explanation: 'After being paralyzed by the Joker in The Killing Joke continuity, Barbara operates as Oracle.',
  },
  {
    id: 'dc-13', house: 'dc', question: 'What is the name of the alien intelligence that repeatedly threatens Earth and collects cities?',
    choices: [{ id: 'a', text: 'Metallo' }, { id: 'b', text: 'Brainiac' }, { id: 'c', text: 'Parasite' }, { id: 'd', text: 'Despero' }],
    answerId: 'b', explanation: 'Brainiac is known for collecting cities, including Kandor, and targeting worlds.',
  },
  {
    id: 'dc-14', house: 'dc', question: 'In the main DC comics continuity, what is the name of the first African-American Green Lantern of Earth?',
    choices: [{ id: 'a', text: 'Simon Baz' }, { id: 'b', text: 'John Stewart' }, { id: 'c', text: 'Jade' }, { id: 'd', text: 'Sojourner Mullein' }],
    answerId: 'b', explanation: 'John Stewart is the first African-American Green Lantern of Earth.',
  },
  {
    id: 'dc-15', house: 'dc', question: 'Which event in the 1985 DC limited series is chiefly associated with the destruction of multiple universes and a continuity reboot?',
    choices: [{ id: 'a', text: 'Zero Hour' }, { id: 'b', text: 'Infinite Crisis' }, { id: 'c', text: 'Crisis on Infinite Earths' }, { id: 'd', text: 'Flashpoint' }],
    answerId: 'c', explanation: 'Crisis on Infinite Earths reshaped DC’s multiverse and led to major continuity changes.',
  },
  {
    id: 'pokemon-01', house: 'pokemon', question: 'In the main-series games, which item is required to evolve Onix into Steelix by trading?',
    choices: [{ id: 'a', text: 'Metal Coat' }, { id: 'b', text: 'King’s Rock' }, { id: 'c', text: 'Hard Stone' }, { id: 'd', text: 'Steel Gem' }],
    answerId: 'a', explanation: 'Onix evolves into Steelix when traded while holding a Metal Coat.',
  },
  {
    id: 'pokemon-02', house: 'pokemon', question: 'In Pokémon Red and Blue, which fossil can be revived into Kabuto?',
    choices: [{ id: 'a', text: 'Helix Fossil' }, { id: 'b', text: 'Dome Fossil' }, { id: 'c', text: 'Old Amber' }, { id: 'd', text: 'Root Fossil' }],
    answerId: 'b', explanation: 'The Dome Fossil revives into Kabuto; the Helix Fossil revives into Omanyte.',
  },
  {
    id: 'pokemon-03', house: 'pokemon', question: 'In the main-series games, what type combination does Gyarados have?',
    choices: [{ id: 'a', text: 'Water/Flying' }, { id: 'b', text: 'Water/Dragon' }, { id: 'c', text: 'Water/Dark' }, { id: 'd', text: 'Flying/Dragon' }],
    answerId: 'a', explanation: 'Despite its dragon-like appearance, Gyarados is Water/Flying in the main-series games.',
  },
  {
    id: 'pokemon-04', house: 'pokemon', question: 'Which Pokémon professor gives the player a starter in the Johto games Pokémon Gold and Silver?',
    choices: [{ id: 'a', text: 'Professor Birch' }, { id: 'b', text: 'Professor Elm' }, { id: 'c', text: 'Professor Rowan' }, { id: 'd', text: 'Professor Kukui' }],
    answerId: 'b', explanation: 'Professor Elm provides the Johto starter Pokémon in Gold and Silver.',
  },
  {
    id: 'pokemon-05', house: 'pokemon', question: 'In the main-series games, which ability prevents a Pokémon from being poisoned?',
    choices: [{ id: 'a', text: 'Guts' }, { id: 'b', text: 'Poison Heal' }, { id: 'c', text: 'Immunity' }, { id: 'd', text: 'Overcoat' }],
    answerId: 'c', explanation: 'Immunity prevents the Pokémon from becoming poisoned.',
  },
  {
    id: 'pokemon-06', house: 'pokemon', question: 'Which region is the setting for Pokémon Black and White?',
    choices: [{ id: 'a', text: 'Sinnoh' }, { id: 'b', text: 'Unova' }, { id: 'c', text: 'Kalos' }, { id: 'd', text: 'Galar' }],
    answerId: 'b', explanation: 'Black and White take place in Unova, a region inspired by the New York City area.',
  },
  {
    id: 'pokemon-07', house: 'pokemon', question: 'In Generation VI games, which type was introduced partly to balance powerful Dragon-types?',
    choices: [{ id: 'a', text: 'Fairy' }, { id: 'b', text: 'Steel' }, { id: 'c', text: 'Dark' }, { id: 'd', text: 'Flying' }],
    answerId: 'a', explanation: 'Fairy was introduced in Generation VI and is super effective against Dragon.',
  },
  {
    id: 'pokemon-08', house: 'pokemon', question: 'In Pokémon Legends: Arceus, what is the ancient name of the Sinnoh region?',
    choices: [{ id: 'a', text: 'Hisui' }, { id: 'b', text: 'Kitakami' }, { id: 'c', text: 'Ransei' }, { id: 'd', text: 'Orre' }],
    answerId: 'a', explanation: 'Legends: Arceus takes place in Hisui, the historical region that later becomes Sinnoh.',
  },
  {
    id: 'pokemon-09', house: 'pokemon', question: 'In the main-series games, what is the standard evolution condition for Feebas into Milotic in Pokémon Ruby and Sapphire?',
    choices: [{ id: 'a', text: 'Level up while holding a Prism Scale' }, { id: 'b', text: 'Trade while holding a Deep Sea Scale' }, { id: 'c', text: 'Raise its Beauty condition and level it up' }, { id: 'd', text: 'Use a Water Stone' }],
    answerId: 'c', explanation: 'In Ruby and Sapphire, Feebas evolves when its Beauty condition is high enough and it levels up.',
  },
  {
    id: 'pokemon-10', house: 'pokemon', question: 'Which pair of Legendary Pokémon represents the central version mascots of Pokémon Sun and Moon?',
    choices: [{ id: 'a', text: 'Solgaleo and Lunala' }, { id: 'b', text: 'Xerneas and Yveltal' }, { id: 'c', text: 'Dialga and Palkia' }, { id: 'd', text: 'Zacian and Zamazenta' }],
    answerId: 'a', explanation: 'Solgaleo is the mascot of Sun and Lunala is the mascot of Moon.',
  },
  {
    id: 'rangers-01', house: 'power_rangers', question: 'In Mighty Morphin Power Rangers, which Ranger is associated with the Pterodactyl Power Coin?',
    choices: [{ id: 'a', text: 'Kimberly Hart, the Pink Ranger' }, { id: 'b', text: 'Trini Kwan, the Yellow Ranger' }, { id: 'c', text: 'Jason Lee Scott, the Red Ranger' }, { id: 'd', text: 'Billy Cranston, the Blue Ranger' }],
    answerId: 'a', explanation: 'Kimberly’s Pink Ranger powers are associated with the Pterodactyl.',
  },
  {
    id: 'rangers-02', house: 'power_rangers', question: 'Who is the original Green Ranger in Mighty Morphin Power Rangers?',
    choices: [{ id: 'a', text: 'Jason Lee Scott' }, { id: 'b', text: 'Tommy Oliver' }, { id: 'c', text: 'Zack Taylor' }, { id: 'd', text: 'Rocky DeSantos' }],
    answerId: 'b', explanation: 'Tommy Oliver debuts as the Green Ranger under Rita Repulsa’s control.',
  },
  {
    id: 'rangers-03', house: 'power_rangers', question: 'In Power Rangers Zeo, what power source replaces the original Power Coins?',
    choices: [{ id: 'a', text: 'The Zeo Crystal' }, { id: 'b', text: 'The Quasar Sabers' }, { id: 'c', text: 'The Energems' }, { id: 'd', text: 'The Morphin Grid Shards' }],
    answerId: 'a', explanation: 'The Zeo Rangers draw power from the Zeo Crystal.',
  },
  {
    id: 'rangers-04', house: 'power_rangers', question: 'In Power Rangers In Space, which Ranger is Andros?',
    choices: [{ id: 'a', text: 'Red Space Ranger' }, { id: 'b', text: 'Silver Space Ranger' }, { id: 'c', text: 'Blue Space Ranger' }, { id: 'd', text: 'Black Space Ranger' }],
    answerId: 'a', explanation: 'Andros is the Red Space Ranger and a key figure in the series’ search for Zordon.',
  },
  {
    id: 'rangers-05', house: 'power_rangers', question: 'In Power Rangers Dino Thunder, what is Tommy Oliver’s role before he becomes the Black Dino Ranger?',
    choices: [{ id: 'a', text: 'A high-school principal and paleontologist' }, { id: 'b', text: 'A police captain' }, { id: 'c', text: 'A professor of astrophysics' }, { id: 'd', text: 'A Green Samurai Ranger mentor' }],
    answerId: 'a', explanation: 'Tommy is a paleontologist and the principal of Reefside High School.',
  },
  {
    id: 'rangers-06', house: 'power_rangers', question: 'In Power Rangers Time Force, what is Jen Scotts’ Ranger color and team role?',
    choices: [{ id: 'a', text: 'Pink Ranger and leader of the Time Force team in 2001' }, { id: 'b', text: 'Red Ranger and captain of the Silver Guardians' }, { id: 'c', text: 'Yellow Ranger and leader of the Quantum Rangers' }, { id: 'd', text: 'White Ranger and commander of Lightspeed Rescue' }],
    answerId: 'a', explanation: 'Jen is the Pink Time Force Ranger and leads the team in the 2001 era.',
  },
  {
    id: 'rangers-07', house: 'power_rangers', question: 'Which Power Rangers season adapts the Super Sentai series Kyōryū Sentai Zyuranger?',
    choices: [{ id: 'a', text: 'Mighty Morphin Power Rangers season one' }, { id: 'b', text: 'Power Rangers Zeo' }, { id: 'c', text: 'Power Rangers Turbo' }, { id: 'd', text: 'Power Rangers Dino Thunder' }],
    answerId: 'a', explanation: 'Footage and designs from Zyuranger were adapted for Mighty Morphin Power Rangers season one.',
  },
  {
    id: 'rangers-08', house: 'power_rangers', question: 'In Power Rangers Lost Galaxy, what are the Rangers’ primary weapons called?',
    choices: [{ id: 'a', text: 'Quasar Sabers' }, { id: 'b', text: 'Power Daggers' }, { id: 'c', text: 'Turbo Keys' }, { id: 'd', text: 'Chrono Sabers' }],
    answerId: 'a', explanation: 'The Lost Galaxy Rangers draw their powers and weapons from the Quasar Sabers.',
  },
  {
    id: 'rangers-09', house: 'power_rangers', question: 'In Power Rangers SPD, what does the abbreviation SPD stand for?',
    choices: [{ id: 'a', text: 'Space Patrol Delta' }, { id: 'b', text: 'Special Power Division' }, { id: 'c', text: 'Solar Police Department' }, { id: 'd', text: 'Special Patrol Defense' }],
    answerId: 'a', explanation: 'SPD is Space Patrol Delta, the interplanetary law-enforcement organization in the series.',
  },
  {
    id: 'rangers-10', house: 'power_rangers', question: 'In Power Rangers RPM, what is the name of the domed city protected from Venjix?',
    choices: [{ id: 'a', text: 'Corinth' }, { id: 'b', text: 'Angel Grove' }, { id: 'c', text: 'Reefside' }, { id: 'd', text: 'Harwood County' }],
    answerId: 'a', explanation: 'Corinth is the last human city protected by the RPM Rangers.',
  },
];

export function calculateHouseChallengeScore(correctAnswers: number): number {
  const correct = Math.max(0, Math.min(10, Math.trunc(correctAnswers)));
  return correct * 100 + 200 + (correct >= 7 ? 500 : 0) + (correct === 10 ? 1000 : 0);
}
