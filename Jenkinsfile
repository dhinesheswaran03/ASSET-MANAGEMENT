pipeline {
    agent any

    environment {
        IMAGE_BACKEND  = "foliox-backend"
        IMAGE_FRONTEND = "foliox-frontend"
        COMPOSE_PROJECT_NAME = "foliox"
    }

    stages {

        stage('Checkout') {
            steps {
                echo '📥 Pulling latest code from GitHub...'
                checkout scm
            }
        }

        stage('Prepare Env') {
            steps {
                withCredentials([file(credentialsId: 'foliox-backend-env', variable: 'ENV_FILE')]) {
                    sh '''
                        cp $ENV_FILE backend/.env
                        cp $ENV_FILE .env
                    '''
                    echo '✅ .env file injected'
                }
            }
        }

        stage('Build Docker Images') {
            parallel {
                stage('Build Backend') {
                    steps {
                        echo '🐳 Building backend image...'
                        sh "docker build --no-cache -t ${IMAGE_BACKEND}:${BUILD_NUMBER} -t ${IMAGE_BACKEND}:latest ./backend"
                    }
                }
                stage('Build Frontend') {
                    steps {
                        echo '🐳 Building frontend image...'
                        sh "docker build --no-cache -t ${IMAGE_FRONTEND}:${BUILD_NUMBER} -t ${IMAGE_FRONTEND}:latest ./frontend"
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    docker rm -f foliox-backend foliox-frontend || true
                    docker network rm foliox_foliox-net || true
                    docker-compose up -d
                    docker-compose ps

                    # Reconnect postgres to new network so backend can reach it
                    docker network connect foliox_foliox-net asset-postgres || true
                '''
            }
        }

        stage('Health Check') {
            steps {
                echo '🏥 Checking services...'
                sh '''
                    sleep 20
                    BACKEND_STATUS=$(docker inspect -f "{{.State.Status}}" foliox-backend)
                    FRONTEND_STATUS=$(docker inspect -f "{{.State.Status}}" foliox-frontend)
                    echo "✅ Backend: $BACKEND_STATUS"
                    echo "✅ Frontend: $FRONTEND_STATUS"
                    if [ "$BACKEND_STATUS" != "running" ]; then
                        echo "❌ Backend container is not running!"
                        exit 1
                    fi
                    if [ "$FRONTEND_STATUS" != "running" ]; then
                        echo "❌ Frontend container is not running!"
                        exit 1
                    fi
                    echo "✅ All services are running!"
                '''
            }
        }
    }

    post {
        success {
            echo '''
            ✅ ═══════════════════════════════════
               FolioX deployed successfully!
               Frontend : http://localhost:3000
               Backend  : http://localhost:5000
            ═══════════════════════════════════
            '''
        }
        failure {
            echo '❌ Build failed!'
            sh 'docker ps -a || true'
            sh 'docker logs foliox-backend --tail 20 || true'
        }
        always {
            sh 'docker image prune -f || true'
        }
    }
}