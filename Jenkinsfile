pipeline {
    agent any

    stages {
        stage('Parando servicios') {
            steps {
                sh 'docker compose -p HOSPITALES down || true'
            }
        }

        stage('Eliminando imágenes anteriores') {
            steps {
                sh '''
                    IMAGES=$(docker images --filter "label=com.docker.compose.project=HOSPITALES" -q)
                    if [ -n "$IMAGES" ]; then
                        docker rmi -f $IMAGES
                        echo "Imagenes eliminadas correctamente"
                    else
                        echo "No hay imagenes por eliminar"
                    fi
                '''
            }
        }

        stage('Obteniendo actualización') {
            steps {
                checkout scm // <--- esto es clave
            }
        }

        stage('Construyendo y desplegando') {
            steps {
                sh 'docker compose build --no-cache'
                sh 'docker compose up -d'
            }
        }
    }

    post {
        success { echo 'Pipeline ejecutado con éxito' }
        failure { echo 'Hubo un error en el pipeline' }
        always { echo 'Pipeline finalizado' }
    }
}
