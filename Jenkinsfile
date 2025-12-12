pipeline {
    agent any

    stages {
        stage('Parando los servicios...') {
            steps {
                sh '''
                    docker compose -p HOSPITALES down || true
                '''
            }
        }

        stage('Eliminando imágenes anteriores...') {
            steps {
                sh '''
                    images=$(docker images --filter "label=com.docker.compose.project=HOSPITALES" -q)
                    if [ -n "$images" ]; then
                        docker rmi -f $images
                        echo "Imagenes eliminadas correctamente"
                    else
                        echo "No hay imagenes por eliminar"
                    fi
                '''
            }
        }

        stage('Obteniendo actualización...') {
            steps {
                checkout scm
            }
        }

        stage('Construyendo y desplegando servicios...') {
            steps {
                sh '''
                    docker compose up --build -d
                '''
            }
        }
    }

    post {
        success {
            echo 'Pipeline ejecutado con éxito'
        }
        failure {
            echo 'Hubo un error al ejecutar el pipeline'
        }
        always {
            echo 'Pipeline finalizado'
        }
    }
}
