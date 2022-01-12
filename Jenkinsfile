// This Jenkinsfile uses the declarative syntax. If you need help, check:
// Overview and structure: https://jenkins.io/doc/book/pipeline/syntax/
// For plugins and steps:  https://jenkins.io/doc/pipeline/steps/
// For Github integration: https://github.com/jenkinsci/pipeline-github-plugin
// For credentials:        https://jenkins.io/doc/book/pipeline/jenkinsfile/#handling-credentials
// For credential IDs:     https://ci.ts.sv/credentials/store/system/domain/_/
// Tools (JDK, Maven):     https://ci.ts.sv/configureTools/
// Docker:                 https://jenkins.io/doc/book/pipeline/docker/
// Environment variables:  env.VARIABLE_NAME

pipeline {
    agent any // Or you could make the whole job or certain stages run inside docker
    triggers {
        issueCommentTrigger('^retest$')
    }

    options {
        ansiColor('xterm')
        timestamps()
        // increased timeout to wait for smoketest runs
        timeout(time: 120, unit: 'MINUTES')
    }

    stages {
        stage('Sonarqube') {
            when {
                anyOf {
                    branch 'master' // Only run Sonarqube on master...
                    changeRequest() // ... and PRs
                }
            }
            steps {
                sonarqube(extraOptions: '\
                    -Dsonar.exclusions="output/**/*, coverage/**/*, public/v4/**/*" \
                ')
            }
        }
    }
}
