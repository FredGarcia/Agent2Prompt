@echo off
rem Agent2Prompt : installe ou met a jour, dans Gemini CLI, tous les skills et agents du depot.
rem Usage : installer.cmd [--liste ^| --retirer ^| --fusionne nom...] [--workspace dossier] [--forcer] [--essai]
rem Voir installer.mjs, a cote de ce fichier. Node 20 ou plus recent.
node "%~dp0installer.mjs" %*
exit /b %errorlevel%
