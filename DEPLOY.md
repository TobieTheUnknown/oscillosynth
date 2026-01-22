# 🚀 Déploiement OscilloSynth

## Déploiement sur Portainer (NAS Synology)

### Prérequis
- Docker installé sur le NAS
- Portainer installé et accessible
- Chemin de stockage: `/volume1/docker/oscillosynth`

### Méthode 1: Via Portainer Stacks

1. **Créer le répertoire de données sur le NAS**
   ```bash
   mkdir -p /volume1/docker/oscillosynth/data
   ```

2. **Dans Portainer:**
   - Aller dans **Stacks** → **Add stack**
   - Nom: `oscillosynth`
   - Web editor: Copier le contenu de `docker-compose.yml`
   - Cliquer sur **Deploy the stack**

3. **Accéder à l'application**
   ```
   http://your-nas-ip:5173
   ```

### Méthode 2: Via Docker Compose (SSH)

```bash
# Se connecter en SSH au NAS
ssh admin@your-nas-ip

# Créer le répertoire
sudo mkdir -p /volume1/docker/oscillosynth
cd /volume1/docker/oscillosynth

# Télécharger le docker-compose.yml
wget https://raw.githubusercontent.com/TobieTheUnknown/oscillosynth/main/docker-compose.yml

# Démarrer le stack
sudo docker-compose up -d
```

### Méthode 3: Via commande Docker simple

```bash
docker run -d \
  --name oscillosynth \
  --restart unless-stopped \
  -p 5173:5173 \
  -v /volume1/docker/oscillosynth/data:/app/data \
  -e NODE_ENV=production \
  -e TZ=Europe/Paris \
  tobtheunknown/oscillosynth:latest
```

## Configuration

### Variables d'environnement
- `NODE_ENV`: Mode d'exécution (production/development)
- `TZ`: Fuseau horaire (Europe/Paris par défaut)

### Ports
- `5173`: Port web de l'application

### Volumes
- `/volume1/docker/oscillosynth/data`: Données persistantes (presets utilisateur, settings)

## Mise à jour

### Via Portainer
1. Aller dans **Containers**
2. Sélectionner `oscillosynth`
3. Cliquer sur **Recreate** → **Pull latest image**

### Via SSH
```bash
cd /volume1/docker/oscillosynth
sudo docker-compose pull
sudo docker-compose up -d
```

## Healthcheck

Le container vérifie automatiquement sa santé toutes les 30 secondes.
Pour voir l'état:

```bash
docker ps
# Chercher HEALTH dans la colonne STATUS
```

## Logs

```bash
# Voir les logs
docker logs oscillosynth

# Suivre les logs en temps réel
docker logs -f oscillosynth
```

## Support Watchtower

Le stack inclut le label `watchtower.enable=true` pour les mises à jour automatiques si vous utilisez Watchtower.

## Troubleshooting

### Le container ne démarre pas
```bash
docker logs oscillosynth
```

### Port déjà utilisé
Modifier le port dans docker-compose.yml:
```yaml
ports:
  - "8080:5173"  # Utiliser 8080 au lieu de 5173
```

### Permissions sur le volume
```bash
sudo chown -R 1000:1000 /volume1/docker/oscillosynth/data
```
