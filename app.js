"use strict";

const TALLY_URL = "https://tally.so/r/dbEOxo";

const { filtres, formations } = window.FORMATIONS;
const TOUTES = "Toutes";
const categories = [TOUTES, ...filtres];
const etat = { filtre: TOUTES, selection: formations[0].num };

const noeud = (id) => document.getElementById(id);

function creer(balise, classe, texte) {
  const element = document.createElement(balise);
  if (classe) element.className = classe;
  if (texte !== undefined) element.textContent = texte;
  return element;
}

function creerBouton(classe, actif, action) {
  const bouton = creer("button", classe);
  bouton.type = "button";
  bouton.setAttribute("aria-pressed", String(actif));
  bouton.addEventListener("click", action);
  return bouton;
}

function afficherFiltres() {
  const puces = categories.map((categorie) => {
    const total = categorie === TOUTES
      ? formations.length
      : formations.filter((f) => f.categorie === categorie).length;
    const puce = creerBouton("filtre", categorie === etat.filtre, () => {
      etat.filtre = categorie;
      afficher();
    });
    puce.append(`${categorie} `, creer("span", "filtre-compte", String(total)));
    return puce;
  });
  noeud("filtres").replaceChildren(...puces);
}

function afficherListe(visibles) {
  const elements = visibles.map((formation) => {
    const bouton = creerBouton("element", formation.num === etat.selection, () => {
      etat.selection = formation.num;
      window.umami?.track("Programme consulté", { formation: formation.titre });
      afficher();
    });
    const corps = creer("span", "element-corps");
    corps.append(
      creer("span", "element-titre", formation.titre),
      creer("span", "element-sous-titre", formation.sousTitre),
    );
    bouton.append(creer("span", "element-num", formation.num), corps);
    const ligne = creer("li");
    ligne.append(bouton);
    return ligne;
  });
  noeud("liste").replaceChildren(...elements);
}

function afficherProgramme(formation) {
  noeud("p-categorie").textContent = formation.categorie;
  noeud("p-titre").textContent = formation.titre;
  noeud("p-sous-titre").textContent = formation.sousTitre;
  noeud("p-niveau").textContent = formation.niveau;
  noeud("p-prerequis").textContent = formation.prerequis;
  noeud("p-objectif").textContent = formation.objectif;
  noeud("p-public").textContent = formation.public;
  noeud("p-demande").href = `${TALLY_URL}?formation=${encodeURIComponent(formation.titre)}`;
  noeud("p-demande").dataset.umamiEventFormation = formation.titre;

  const modules = formation.modules.map((module, rang) => {
    const ligne = creer("li");
    ligne.append(
      creer("span", "module-num", String(rang + 1).padStart(2, "0")),
      creer("span", "", module),
    );
    return ligne;
  });
  noeud("p-modules").replaceChildren(...modules);
}

function afficher() {
  const visibles = formations.filter(
    (f) => etat.filtre === TOUTES || f.categorie === etat.filtre,
  );
  if (!visibles.some((f) => f.num === etat.selection)) {
    etat.selection = visibles[0].num;
  }
  afficherFiltres();
  afficherListe(visibles);
  afficherProgramme(formations.find((f) => f.num === etat.selection));
}

noeud("nb-formations").textContent = `${formations.length} formations`;
noeud("lien-contact").href = TALLY_URL;
afficher();
