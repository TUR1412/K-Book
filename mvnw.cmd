@ECHO OFF
SETLOCAL

SET "MAVEN_PROJECTBASEDIR=%~dp0"
IF "%MAVEN_PROJECTBASEDIR:~-1%"=="\" SET "MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR:~0,-1%"

SET "WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
IF NOT EXIST "%WRAPPER_JAR%" (
  ECHO [ERROR] Maven Wrapper jar not found: "%WRAPPER_JAR%"
  ECHO         Please ensure ".mvn/wrapper/maven-wrapper.jar" exists.
  EXIT /B 1
)

SET "JAVA_EXE=java"
IF DEFINED JAVA_HOME (
  SET "JAVA_EXE=%JAVA_HOME%\bin\java.exe"
)

"%JAVA_EXE%" -classpath "%WRAPPER_JAR%" -Dmaven.multiModuleProjectDirectory="%MAVEN_PROJECTBASEDIR%" org.apache.maven.wrapper.MavenWrapperMain %*
SET "MVNW_EXIT_CODE=%ERRORLEVEL%"

ENDLOCAL & EXIT /B %MVNW_EXIT_CODE%

