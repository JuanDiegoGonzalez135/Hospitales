pipeline {
    agent any

    environment {
        PATH = "/usr/local/bin:${env.PATH}"
    }

    stages {
        stage('Stopping services') {
            steps {
                sh '''
                    docker compose -p HOSPITALES down || true
                '''
            }
        }

        stage('Deleting old images') {
            steps{
                sh '''
                    IMAGES=$(docker images --filter "label=com.docker.compose.project=HOSPITALES" -q)
                    if [ -n "$IMAGES" ]; then
                        docker rmi -f $IMAGES
                    fi
                '''
            }
        }

        stage('Pulling update') {
            steps {
                checkout scm
            }
        }

        stage('Building new images') {
            steps {
                sh '''
                    docker compose build --no-cache
                '''
            }
        }

        stage('Deploying containers') {
            steps {
                sh '''
                    docker compose up -d
                '''
            }
        }
    }

    post {
        success {
            echo 'Pipeline ejecutado correctamente.'
        }

        failure {
            echo 'Ocurrió un error, revisa los logs.'
        }
    }
}
