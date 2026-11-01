#!/usr/bin/env node
// Génère les tables des règles SonarQube Java et JavaScript / TypeScript à partir des métadonnées
// publiées par SonarSource dans les dépôts des analyseurs. Node 20 ou plus récent, sans dépendance.
//
// Préparer les sources (extraction partielle, quelques Mo) :
//   git clone -q --depth 1 --filter=blob:none --sparse https://github.com/SonarSource/sonar-java.git
//   git -C sonar-java sparse-checkout set --no-cone \
//     'sonar-java-plugin/src/main/resources/org/sonar/l10n/java/rules/java/*' \
//     'sonar-java-plugin/src/main/resources/profiles/*'
//   git clone -q --depth 1 --filter=blob:none --sparse https://github.com/SonarSource/SonarJS.git
//   git -C SonarJS sparse-checkout set --no-cone \
//     'sonar-plugin/javascript-checks/src/main/resources/org/sonar/l10n/javascript/rules/javascript/*'
//
// Puis : node docs/sonarqube/generer-regles.mjs <chemin de sonar-java> <chemin de SonarJS> [dossier de sortie]

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const [java, js, sortie = path.dirname(new URL(import.meta.url).pathname)] = process.argv.slice(2);
if (!java || !js) {
  console.error('usage : node generer-regles.mjs <sonar-java> <SonarJS> [dossier de sortie]');
  process.exit(2);
}

const QUALITE = { MAINTAINABILITY: 'maintenabilité', RELIABILITY: 'fiabilité', SECURITY: 'sécurité' };
const GRAVITE = { BLOCKER: 'bloquante', HIGH: 'haute', MEDIUM: 'moyenne', LOW: 'basse', INFO: 'info' };
const TYPE = { CODE_SMELL: 'code smell', BUG: 'bug', VULNERABILITY: 'vulnérabilité', SECURITY_HOTSPOT: 'revue de sécurité' };
const STATUT = { ready: 'active', deprecated: 'dépréciée', beta: 'bêta', closed: 'fermée' };
const PORTEE = { Main: 'code principal', Tests: 'tests', All: 'tout' };

const lireJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const numero = (k) => Number(String(k).replace(/\D/g, '')) || 0;
const impacts = (d) => Object.entries(d.code?.impacts ?? {}).map(([q, g]) => `${QUALITE[q] ?? q} : ${GRAVITE[g] ?? g}`).join(', ');
const effort = (d) => d.remediation?.constantCost ?? d.remediation?.linearDesc ?? '';
const commun = (d) => ({
  titre: d.title ?? '', type: TYPE[d.type] ?? d.type ?? '', impacts: impacts(d), severite: d.defaultSeverity ?? '',
  statut: STATUT[d.status] ?? d.status ?? '', portee: PORTEE[d.scope] ?? d.scope ?? '', tags: (d.tags ?? []).join(', '), effort: effort(d),
});
const version = (depot) => {
  try { return execFileSync('git', ['-C', depot, 'log', '-1', '--format=%h %cs'], { encoding: 'utf8' }).trim(); } catch { return 'inconnue'; }
};

function csv(colonnes, lignes) {
  const champ = (v) => { const s = String(v ?? ''); return /[;"\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  return '﻿' + [colonnes.map((c) => c[1]), ...lignes.map((l) => colonnes.map((c) => l[c[0]]))].map((l) => l.map(champ).join(';')).join('\r\n') + '\r\n';
}

// Java : une fiche par règle, et un fichier vide par règle dans chaque profil intégré.
const dJava = path.join(java, 'sonar-java-plugin/src/main/resources/org/sonar/l10n/java/rules/java');
const dProfils = path.join(java, 'sonar-java-plugin/src/main/resources/profiles');
const profil = (nom) => new Set(fs.existsSync(path.join(dProfils, nom)) ? fs.readdirSync(path.join(dProfils, nom)) : []);
const sonarWay = profil('Sonar_way');
const agentic = profil('Sonar_agentic_AI');
const reglesJava = fs.readdirSync(dJava).filter((f) => f.endsWith('.json')).map((f) => {
  const d = lireJson(path.join(dJava, f));
  const cle = d.sqKey ?? f.slice(0, -5);
  return { cle: `java:${cle}`, ...commun(d), sonarWay: sonarWay.has(cle) ? 'oui' : 'non', agentic: agentic.has(cle) ? 'oui' : 'non', n: numero(cle) };
}).sort((a, b) => a.n - b.n || a.cle.localeCompare(b.cle));

// JavaScript / TypeScript : langages compatibles et profils par défaut dans chaque fiche.
const dJs = path.join(js, 'sonar-plugin/javascript-checks/src/main/resources/org/sonar/l10n/javascript/rules/javascript');
const reglesJs = fs.readdirSync(dJs).filter((f) => /^S\d+\.json$/.test(f)).map((f) => {
  const d = lireJson(path.join(dJs, f));
  const cle = d.sqKey ?? f.slice(0, -5);
  const langues = d.compatibleLanguages ?? ['js', 'ts'];
  // Profils par défaut : une liste commune, ou une liste par langage quand ils diffèrent entre JS et TS.
  const brut = d.defaultQualityProfiles ?? [];
  const profils = (l) => (!langues.includes(l) ? [] : Array.isArray(brut) ? brut : (brut[l] ?? []));
  const dans = (l, nom) => (!langues.includes(l) ? '—' : profils(l).includes(nom) ? 'oui' : 'non');
  return {
    cle: [langues.includes('js') ? `javascript:${cle}` : null, langues.includes('ts') ? `typescript:${cle}` : null].filter(Boolean).join(' / '),
    js: langues.includes('js') ? 'oui' : 'non', ts: langues.includes('ts') ? 'oui' : 'non',
    ...commun(d), sonarWayJs: dans('js', 'Sonar way'), sonarWayTs: dans('ts', 'Sonar way'),
    agenticJs: dans('js', 'Sonar agentic AI'), agenticTs: dans('ts', 'Sonar agentic AI'),
    sonarWay: profils('js').includes('Sonar way') || profils('ts').includes('Sonar way') ? 'oui' : 'non',
    agentic: profils('js').includes('Sonar agentic AI') || profils('ts').includes('Sonar agentic AI') ? 'oui' : 'non', n: numero(cle),
  };
}).sort((a, b) => a.n - b.n);

const base = [['titre', 'titre (anglais, tel que dans SonarQube)'], ['type', 'type'], ['impacts', 'qualité logicielle : gravité (mode MQR)'],
  ['severite', 'sévérité (mode standard)'], ['statut', 'statut'], ['sonarWay', 'dans Sonar way'], ['agentic', 'dans Sonar agentic AI'],
  ['portee', 'portée'], ['tags', 'tags'], ['effort', 'effort de correction']];
fs.mkdirSync(sortie, { recursive: true });
fs.writeFileSync(path.join(sortie, 'regles-java.csv'), csv([['cle', 'clé de règle'], ...base], reglesJava));
const baseJs = base.flatMap((c) => (c[0] === 'sonarWay' ? [['sonarWayJs', 'dans Sonar way (JavaScript)'], ['sonarWayTs', 'dans Sonar way (TypeScript)']]
  : c[0] === 'agentic' ? [['agenticJs', 'dans Sonar agentic AI (JavaScript)'], ['agenticTs', 'dans Sonar agentic AI (TypeScript)']] : [c]));
fs.writeFileSync(path.join(sortie, 'regles-javascript-typescript.csv'), csv([['cle', 'clé de règle'], ['js', 'JavaScript'], ['ts', 'TypeScript'], ...baseJs], reglesJs));

const bilan = (rs) => ({
  regles: rs.length, actives: rs.filter((r) => r.statut === 'active').length, depreciees: rs.filter((r) => r.statut === 'dépréciée').length,
  sonarWay: rs.filter((r) => r.sonarWay === 'oui').length, agentic: rs.filter((r) => r.agentic === 'oui').length,
  bugs: rs.filter((r) => r.type === 'bug').length, vulnerabilites: rs.filter((r) => r.type === 'vulnérabilité').length, codeSmells: rs.filter((r) => r.type === 'code smell').length,
});
console.log(JSON.stringify({
  java: { source: `SonarSource/sonar-java ${version(java)}`, ...bilan(reglesJava) },
  jsts: { source: `SonarSource/SonarJS ${version(js)}`, ...bilan(reglesJs),
    jsSeul: reglesJs.filter((r) => r.js === 'oui' && r.ts === 'non').length, tsSeul: reglesJs.filter((r) => r.ts === 'oui' && r.js === 'non').length,
    lesDeux: reglesJs.filter((r) => r.js === 'oui' && r.ts === 'oui').length,
    sonarWayJs: reglesJs.filter((r) => r.sonarWayJs === 'oui').length, sonarWayTs: reglesJs.filter((r) => r.sonarWayTs === 'oui').length },
}, null, 1));
