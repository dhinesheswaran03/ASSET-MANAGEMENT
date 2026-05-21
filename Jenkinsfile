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
                        sh "docker build -t ${IMAGE_BACKEND}:${BUILD_NUMBER} -t ${IMAGE_BACKEND}:latest ./backend"
                    }
                }
                stage('Build Frontend') {
                    steps {
                        echo '🐳 Building frontend image...'
                        sh "docker build -t ${IMAGE_FRONTEND}:${BUILD_NUMBER} -t ${IMAGE_FRONTEND}:latest ./frontend"
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    # Force remove existing containers to avoid conflicts
                    docker rm -f foliox-backend foliox-frontend || true

                    # Remove old network if exists
                    docker network rm foliox_foliox-net || true
                    docker network rm foliox-net || true

                    # Start fresh
                    docker-compose up -d
                    docker-compose ps
                '''
            }
        }

        stage('Health Check') {
            steps {
                echo '🏥 Checking services...'
                sh '''
                    sleep 15
                    curl -f http://localhost:5000/health || (echo "❌ Backend health check failed" && exit 1)
                    echo "✅ Backend is healthy"
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
            echo '❌ Build failed! Check logs above.'
            sh 'docker ps -a || true'
        }
        always {
            sh 'docker image prune -f || true'
        }
    }
}