---
title: Jenkins CI/CD 流水线搭建
description: 从零搭建 Jenkins CI/CD 流水线，包括 Pipeline 编写、代码审查、自动部署、通知集成
date: 2026-07-09
tags:
  - Jenkins
  - CI/CD
  - 自动化运维
---

# Jenkins CI/CD 流水线搭建

## 一、环境搭建

### 1.1 安装 Jenkins

```bash
# 安装 Java 11+
yum install java-11-openjdk -y

# 安装 Jenkins
wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key
yum install jenkins -y

# 启动服务
systemctl start jenkins && systemctl enable jenkins

# 初始化密码
cat /var/lib/jenkins/secrets/initialAdminPassword
```

### 1.2 安装必备插件

- **Pipeline** — 核心流水线功能
- **Git** — Git 代码仓库集成
- **SonarQube Scanner** — 代码质量检测
- **Email Extension** — 邮件通知
- **DingTalk** — 钉钉通知
- **SSH Pipeline Steps** — SSH 远程执行

## 二、Pipeline 基础

### 2.1 声明式 Pipeline 语法

```groovy
pipeline {
    agent any
    
    environment {
        APP_NAME = 'myapp'
        VERSION = '1.0.0'
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/SuLingYun/myapp.git'
            }
        }
        
        stage('Build') {
            steps {
                sh 'mvn clean package -DskipTests'
            }
        }
        
        stage('Test') {
            steps {
                sh 'mvn test'
            }
            post {
                always {
                    junit 'target/surefire-reports/*.xml'
                }
            }
        }
        
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sshPublisher(publishers: [sshPublisherDesc(
                    configName: 'prod-server',
                    transfers: [sshTransfer(sourceFiles: 'target/*.jar')]
                )])
            }
        }
    }
    
    post {
        success {
            emailext to: 'dev-team@example.com',
                subject: "[SUCCESS] Pipeline completed",
                body: "Build succeeded for ${APP_NAME}"
        }
        failure {
            dingtalk(robot: 'prod-alert', type: 'MARKDOWN',
                title: '构建失败',
                text: ["## 构建失败通知", "项目: ${APP_NAME}", "状态: 失败"])
        }
    }
}
```

### 2.2 脚本式 Pipeline

```groovy
node {
    stage('Checkout') {
        checkout scm
    }
    
    stage('Build') {
        if (env.BRANCH_NAME == 'main') {
            sh 'mvn clean package'
        } else {
            sh 'mvn clean compile'
        }
    }
    
    stage('Deploy') {
        try {
            sh 'scp target/*.jar user@prod:/opt/app/'
            echo '部署成功'
        } catch (Exception e) {
            error "部署失败: ${e.getMessage()}"
        }
    }
}
```

## 三、多环境部署

```groovy
pipeline {
    agent any
    
    parameters {
        choice(name: 'ENV', choices: ['dev', 'test', 'prod'], description: '部署环境')
    }
    
    stages {
        stage('Deploy to Dev') {
            when { expression { params.ENV == 'dev' } }
            steps {
                sh './deploy.sh dev'
            }
        }
        
        stage('Deploy to Test') {
            when { expression { params.ENV == 'test' } }
            steps {
                input message: "确认部署到测试环境？", ok: '确认'
                sh './deploy.sh test'
            }
        }
        
        stage('Deploy to Prod') {
            when { expression { params.ENV == 'prod' } }
            steps {
                input message: "⚠️ 确认部署到生产环境？", ok: '确认生产部署'
                sh './deploy.sh prod'
            }
        }
    }
}
```

## 四、蓝绿部署

```groovy
pipeline {
    agent any
    
    stages {
        stage('Deploy Blue') {
            steps {
                sh 'kubectl apply -f blue-deployment.yml'
                sh 'kubectl wait --for=condition=available deployment/myapp-blue'
            }
        }
        
        stage('Health Check') {
            steps {
                sh 'curl -f http://blue.myapp.com/health'
            }
        }
        
        stage('Switch Traffic') {
            steps {
                sh 'kubectl apply -f ingress-blue.yml'
            }
        }
        
        stage('Cleanup Green') {
            steps {
                sh 'kubectl delete deployment/myapp-green --ignore-not-found'
            }
        }
    }
}
```

## 五、常用配置

### 5.1 凭证管理

```groovy
// 使用凭证
withCredentials([usernamePassword(credentialsId: 'gitlab-creds',
    usernameVariable: 'USER', passwordVariable: 'PASS')]) {
    sh "git clone https://${USER}:${PASS}@gitlab.example.com/myapp.git"
}
```

### 5.2 定时构建

```groovy
pipeline {
    agent any
    triggers {
        cron('H */4 * * 1-5')  // 工作日每4小时构建一次
    }
    // ...
}
```

> 提示：所有文章内容均为实战经验总结，部分示例来自官方文档和社区最佳实践。


---


---


---


---
