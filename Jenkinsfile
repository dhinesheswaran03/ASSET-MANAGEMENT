pipeline {
    agent any

    environment {
        COMPOSE_FILE = "docker-compose.yml"
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

        stage('Lint & Validate') {
            parallel {
                stage('Backend deps') {
                    steps {
                        dir('backend') {
                            sh 'npm install --production 2>&1 | tail -5'
                            echo '✅ Backend dependencies OK'
                        }
                    }
                }
                stage('Frontend deps') {
                    steps {
                        dir('frontend') {
                            sh 'npm install 2>&1 | tail -5'
                            echo '✅ Frontend dependencies OK'
                        }
                    }
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
                echo '🚀 Deploying with docker-compose...'
                sh '''
                    docker-compose down --remove-orphans || true
                    docker-compose up -d --build
                    docker-compose ps
                '''
            }
        }

        stage('Health Check') {
            steps {
                echo '🏥 Checking services are healthy...'
                sh '''
                    sleep 10
                    curl -f http://localhost:5000/health || (echo "❌ Backend health check failed" && exit 1)
                    echo "✅ Backend is healthy"
                    curl -f http://localhost:3000 || (echo "❌ Frontend health check failed" && exit 1)
                    echo "✅ Frontend is healthy"
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
               Database : localhost:5432
            ═══════════════════════════════════
            '''
        }
        failure {
            echo '❌ Build failed! Check logs above.'
            sh 'docker-compose logs --tail=50 || true'
        }
        always {
            echo '🧹 Cleaning up unused Docker images...'
            sh 'docker image prune -f || true'
        }
    }
}
