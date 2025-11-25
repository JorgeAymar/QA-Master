#!/bin/bash

# Script para crear las páginas de la Wiki de GitHub
# Requiere que tengas configurado git y acceso al repositorio

echo "🚀 Creando Wiki de GitHub para QA-Master..."

# Clonar el repositorio wiki
echo "📥 Clonando repositorio wiki..."
git clone https://github.com/JorgeAymar/QA-Master.wiki.git temp-wiki

# Copiar archivos
echo "📄 Copiando archivos de documentación..."
cp wiki/Home.md temp-wiki/Home.md
cp wiki/Installation.md temp-wiki/Installation.md
cp wiki/Architecture.md temp-wiki/Architecture.md
cp wiki/AI-Testing.md temp-wiki/AI-Testing.md
cp wiki/Project-Management.md temp-wiki/Project-Management.md
cp wiki/Database-Schema.md temp-wiki/Database-Schema.md

# Commit y push
cd temp-wiki
echo "💾 Guardando cambios..."
git add .
git commit -m "docs: Initialize wiki with comprehensive documentation"
git push origin master

cd ..
rm -rf temp-wiki

echo "✅ ¡Wiki creada exitosamente!"
echo "📖 Visita: https://github.com/JorgeAymar/QA-Master/wiki"
