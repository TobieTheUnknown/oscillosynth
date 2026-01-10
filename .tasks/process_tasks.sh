#!/bin/bash
# Script helper pour naviguer dans les tâches OscilloSynth
# Usage: ./.tasks/process_tasks.sh

set -e

TASKS_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$TASKS_DIR")"

echo ""
echo "🎸 OscilloSynth - Phase 0 Tasks"
echo "================================"
echo ""

# Vérifier que le fichier TASKS.md existe
if [ ! -f "$TASKS_DIR/TASKS.md" ]; then
    echo "❌ Erreur: TASKS.md non trouvé dans $TASKS_DIR"
    exit 1
fi

# Afficher la vue d'ensemble
echo "📋 Vue d'ensemble (TASKS.md):"
echo ""
cat "$TASKS_DIR/TASKS.md" | head -50
echo ""
echo "... (lire TASKS.md pour le détail complet)"
echo ""

# Lister les fichiers de tâches disponibles
echo "📁 Fichiers de tâches disponibles:"
echo ""
task_files=("$TASKS_DIR"/*-phase0.md)
if [ ${#task_files[@]} -eq 0 ]; then
    echo "❌ Aucun fichier de tâche trouvé"
    exit 1
fi

for file in "${task_files[@]}"; do
    if [ -f "$file" ]; then
        basename "$file"
    fi
done

echo ""
echo "================================"
echo ""
echo "💡 Comment utiliser ces tâches:"
echo ""
echo "Option 1 - Lire une tâche:"
echo "  cat .tasks/codeur-phase0.md"
echo ""
echo "Option 2 - Travailler en parallèle:"
echo "  Terminal 1: cat .tasks/codeur-phase0.md"
echo "  Terminal 2: cat .tasks/ux-designer-phase0.md"
echo "  Terminal 3: cat .tasks/visual-artist-phase0.md"
echo ""
echo "Option 3 - Utiliser les skills Claude Code:"
echo "  /codeur"
echo "  /ux-designer"
echo "  /visual-artist"
echo ""
echo "================================"
echo ""

# Menu interactif (optionnel)
read -p "Afficher une tâche ? (codeur/ux-designer/visual-artist/n) " choice

case "$choice" in
    codeur|c)
        echo ""
        echo "📖 Affichage: codeur-phase0.md"
        echo "================================"
        echo ""
        cat "$TASKS_DIR/codeur-phase0.md"
        ;;
    ux-designer|ux|u)
        echo ""
        echo "📖 Affichage: ux-designer-phase0.md"
        echo "================================"
        echo ""
        cat "$TASKS_DIR/ux-designer-phase0.md"
        ;;
    visual-artist|visual|v)
        echo ""
        echo "📖 Affichage: visual-artist-phase0.md"
        echo "================================"
        echo ""
        cat "$TASKS_DIR/visual-artist-phase0.md"
        ;;
    n|N|"")
        echo ""
        echo "✅ OK. Utilisez 'cat .tasks/<fichier>.md' pour lire une tâche."
        echo ""
        ;;
    *)
        echo ""
        echo "❌ Choix non reconnu: $choice"
        echo ""
        exit 1
        ;;
esac

echo ""
echo "🚀 Bon développement !"
echo ""
