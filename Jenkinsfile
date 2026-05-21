pipeline {
    agent any

    environment {
        IMAGE_BACKEND  = "foliox-backend"
        IMAGE_FRONTEND = "foliox-frontend"
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
                    sh 'cp $ENV_FILE backend/.env'
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
                withCredentials([file(credentialsId: 'foliox-backend-env', variable: 'ENV_FILE')]) {
                    sh '''
                        cp $ENV_FILE .env
                        docker-compose down --remove-orphans || true
                        docker-compose up -d
                        docker-compose ps
                    '''
                }
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
            sh 'docker-compose logs --tail=30 || true'
        }
        always {
            sh 'docker image prune -f || true'
        }
    }
}