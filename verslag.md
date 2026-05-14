# Project Report: Datavisualisatie 

## Dataset: Stack overflow Developer Survey 2025
We hebben gebruik gemaakt van de [2025 Stack Overflow Developer Survey](https://survey.stackoverflow.co/) dataset, die inzichten biedt in de ervaringen, voorkeuren en trends onder ontwikkelaars wereldwijd. De dataset bevat informatie over demografie, technologiegebruik, werkgewoonten en meningen van ontwikkelaars.

## Design keuzes: 
We hebben ervoor gekozen om onze site zo eenvoudig mogelijk te houden, zodat deze leest als een blogpost. De gebruiker kan niet navigeren naar andere pagina's maar kan wel scrollen doorheen de verschillende visualisaties. Op die manier kunnen we de gebruiker een duidelijk verhaal vertellen zonder dat deze moet gaan zoeken waar de data staat. 

## Technische keuzes:
We hebben gekozen om gebruik te maken van [Observable HQ (Framework)](https://observablehq.com/framework/). Dit is een platform dat zich richt op datavisualisatie en interactieve notebooks. Het biedt een krachtige omgeving voor het creëren van dynamische visualisaties met behulp van JavaScript, D3.js en andere bibliotheken. Observable HQ maakt het gemakkelijk om code, data en visualisaties te combineren in één interactieve document, wat ideaal is voor ons project. Het is ook relatief eenvoudig in gebruik, waardoor we snel vooruitgang konden boeken bij het ontwikkelen van onze visualisaties.

## Ideeën voor visualisaties:
We kwamen al redelijk snel tot de volgende ideeën voor visualisaties, die we verder hebben uitgewerkt in de loop van het project. 
- "Hoe is de kijk op AI onder developers?" 
- "Welke AI modellen worden er gebruikt en welke willen mensen gebruiken?"
- "Waarvoor gebruiken mensen AI in hun development workflow?"

Tot slot hebben we ook nog een visualisatie aan het begin van de site toegevoegd die je toelaat de onderliggende verdeling van de dataset te bekijken voor verschillende categorieën (age, education, dominant programming language, ...). Op die manier kunnen we de gebruiker een beter beeld geven van de dataset en de context van de volgende visualisaties.

## Taakverdeling:

De drie onderzoeksvragen werden elk toebedeeld aan één teamlid. Iedereen was verantwoordelijk voor de visualisatie(s) en bijhorende tekst van zijn vraag, en besprak dit deel tijdens de presentatie. Martijn nam daarnaast de introductie van de data en bijhorende deel van de presentatie op zich.

De visuele opkuis en kleine verbeteringen aan de website werden gezamenlijk opgepakt naargelang nodig.

### Martijn Heeren
* "Waarvoor gebruiken mensen AI in hun development workflow?"

### Thor De Roeck
* "Hoe is de kijk op AI onder developers?"

### Hendrik De Coster
* "Welke AI modellen worden er gebruikt en welke willen mensen gebruiken?"

## Samenwerking & tussentijdse resultaten:

We kwamen wekelijks samen om voortgang te bespreken en elkaar te helpen. Hieronder een logboek per persoon.

### Martijn Heeren
Eerste werkende visualisatie voor de AI usage data:\
<img src="images/verslag/martijn.png" width="400"/>

Interactief onderdeel voor de dataset composition intro toegevoegd:\
<img src="images/verslag/martijn2.png" width="400"/>

Filtering op categorieën + grotere grafieken:\
<img src="images/verslag/martijn3.png" width="400"/>

Leeftijdsfiltering verwerkt in knoppen, visueel verder verfijnd:\
<img src="images/verslag/radar_chart_final.png" width="400"/>


### Thor De Roeck
Eerste poging, te veel getallen en kleur tegelijk:\
<img src="images/verslag/thor.png" width="400"/>

Eerste goede grafiek:\
<img src="images/verslag/thor2.png" width="400"/>

Categorieën ingekort na feedback dat sommige te breed waren:\
<img src="images/verslag/thor3.png" width="400"/>

Waffle chart getest als alternatief, maar moeilijker te lezen dan een bar chart:\
<img src="images/verslag/thor4.png" width="400"/>

Filtering voor "unsure" en "indifferent" toegevoegd als eindresultaat:\
<img src="images/verslag/thor5.png" width="400"/>

### Hendrik De Coster
Eerste poging met absolute aantallen:\
<img src="images/verslag/heatmap.png" width="400"/>

Chord diagram getest — visueel te overweldigend:\
<img src="images/verslag/chord_diagram.png" width="400"/>

Sankey diagrammen per model getest — leken te sterk op elkaar:\
<img src="images/verslag/sankey.png" width="400"/>

Tooltips toegevoegd voor meer context:\
<img src="images/verslag/tooltip.png" width="400"/>

Titelcanvas als finishing touch:\
<img src="images/verslag/title_canvas.png" width="400"/>

## Resultaat: 

### Martijn Heeren 
- Visualisatie 'Dataset Composition'
- Visualisatie 'AI usage in development workflow'

<img src="images/dataset_composition.png" alt="Dataset Composition" width="400"/>

<img src="images/ai_usage_dev_workflow.png" alt="AI Usage in Development Workflow" width="400"/>

### Thor De Roeck
- Visualisatie 'AI Sentiment'

<img src="images/ai_sentiment1.png" alt="AI Sentiment" width="400"/>
<img src="images/ai_sentiment2.png" alt="AI Sentiment" width="400"/>

### Hendrik De Coster
- Visualisatie 'The AI Migration Map: Analyzing Net User Flow Across Model Providers'

<img src="images/ai_migration_map.png" alt="AI Migration Map" width="400"/>

<img src="images/verslag/title_canvas.png" alt="Dataset Composition" width="400"/>
