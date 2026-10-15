#!/usr/bin/env python3
"""Assemble une spécification modulaire en un texte unique transmissible à une IA.

Usage, depuis la racine du dépôt :

    python3 tools/bundle.py specs/<nom-de-la-spec>

Le script lit `manifest.json` de la spécification pour connaître sa version, son
point d'entrée et ses modules (actifs et réservés). Il écrit
`transmissions/<nom>-<version>.md` :

1. l'en-tête `ENTETE-TRANSMISSION.md` de la spécification, où `{{VERSION}}` est remplacé ;
2. chaque fichier entre `<<<FICHIER chemin>>>` et `<<<FIN chemin>>>` ;
3. une table d'intégrité sha256 au format `sha256sum -c`.

Il vérifie ensuite l'aller-retour : le texte, relu comme le ferait l'IA, doit
redonner exactement chaque fichier. Les archives ne sont pas transmises.
Bibliothèque standard uniquement.
"""
import hashlib
import json
import os
import re
import sys

DEBUT, FIN = "<<<FICHIER", "<<<FIN"


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    spec = sys.argv[1].rstrip("/")
    racine = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    manifeste = json.load(open(os.path.join(spec, "manifest.json"), encoding="utf-8"))
    version, nom = manifeste["version"], manifeste["name"]

    fichiers = ["manifest.json", manifeste["entry"]]
    fichiers += [m["path"] for m in manifeste["modules"] if m["path"] not in fichiers]

    entete = open(os.path.join(spec, "ENTETE-TRANSMISSION.md"), encoding="utf-8").read()
    parties = [entete.replace("{{VERSION}}", version).rstrip("\n") + "\n"]
    empreintes = []
    for rel in fichiers:
        contenu = open(os.path.join(spec, rel), encoding="utf-8").read()
        if DEBUT in contenu or FIN in contenu:
            sys.exit(f"délimiteur présent dans {rel} : transmission impossible")
        if not contenu.endswith("\n"):
            contenu += "\n"
        empreintes.append((hashlib.sha256(contenu.encode("utf-8")).hexdigest(), rel))
        parties.append(f"\n{DEBUT} {rel}>>>\n{contenu}{FIN} {rel}>>>\n")

    parties.append("\n---\n\n# Table d'intégrité (sha256)\n\n")
    parties.append("Format compatible `sha256sum -c`, à exécuter depuis `spec/`.\n\n")
    parties.append("".join(f"    {h}  {r}\n" for h, r in empreintes))
    texte = "".join(parties)

    # Aller-retour : relire le texte comme l'IA, comparer chaque empreinte.
    trouves = re.findall(r"^<<<FICHIER (.+?)>>>\n(.*?)^<<<FIN \1>>>$", texte, re.S | re.M)
    if [r for r, _ in trouves] != fichiers:
        sys.exit("aller-retour : ordre ou chemins incorrects")
    for (rel, corps), (h, _) in zip(trouves, empreintes):
        if hashlib.sha256(corps.encode("utf-8")).hexdigest() != h:
            sys.exit(f"aller-retour : contenu altéré pour {rel}")

    sortie = os.path.join(racine, "transmissions", f"{nom}-{version}.md")
    os.makedirs(os.path.dirname(sortie), exist_ok=True)
    open(sortie, "w", encoding="utf-8").write(texte)
    print(f"{os.path.relpath(sortie, racine)} : {len(trouves)} fichiers, "
          f"{len(texte.splitlines())} lignes, aller-retour identique")


if __name__ == "__main__":
    main()
